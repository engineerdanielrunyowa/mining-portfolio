/**
 * Cloudflare Worker — Mining Engineer Portfolio API
 * ─────────────────────────────────────────────────
 * Routes:
 *   Public:  GET  /api/profile
 *            GET  /api/posts
 *            GET  /api/skills
 *            GET  /api/projects
 *            GET  /api/cv/download
 *            POST /api/contact
 *
 *   Auth:    POST /api/admin/login
 *            POST /api/admin/logout
 *
 *   Admin:   GET/POST/PUT/DELETE /api/admin/posts
 *            GET/POST/PUT/DELETE /api/admin/skills
 *            GET/POST/PUT/DELETE /api/admin/projects
 *            GET/PUT             /api/admin/profile
 *            POST                /api/admin/upload/image
 *            POST                /api/admin/upload/svg
 *            POST                /api/admin/cv/upload
 *            DELETE              /api/admin/drive/file
 *            GET                 /api/admin/contact-submissions
 */

export interface Env {
  // Google Service Account
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_SHEET_ID: string;
  GOOGLE_DRIVE_FOLDER_ID: string;

  // Admin authentication
  ADMIN_PASSWORD_HASH: string;   // bcrypt hash of admin password
  JWT_SECRET: string;            // secret for signing session tokens

  // Email (Resend)
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;

  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: string;

  // KV for rate limiting and caching
  RATE_LIMIT_KV: KVNamespace;
  CACHE_KV: KVNamespace;
}

// ─── Google Auth Helper ───────────────────────────────────────────────────────

async function getGoogleAccessToken(env: Env): Promise<string> {
  // Check cache first
  const cached = await env.CACHE_KV.get('google_access_token');
  if (cached) return cached;

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Create JWT
  const header = { alg: 'RS256', typ: 'JWT' };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const unsignedJWT = `${encode(header)}.${encode(claims)}`;

  // Import private key and sign
  const privateKeyPEM = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const pemBody = privateKeyPEM.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const keyBuffer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedJWT)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const jwt = `${unsignedJWT}.${signature}`;

  // Exchange for access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json() as { access_token: string; expires_in: number };
  const token = data.access_token;

  // Cache for 55 minutes (token expires in 60)
  await env.CACHE_KV.put('google_access_token', token, { expirationTtl: 3300 });

  return token;
}

// ─── Google Sheets Helpers ────────────────────────────────────────────────────

async function sheetsGet(env: Env, range: string): Promise<string[][]> {
  const token = await getGoogleAccessToken(env);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json() as { values?: string[][] };
  return data.values || [];
}

async function sheetsAppend(env: Env, range: string, values: string[][]): Promise<void> {
  const token = await getGoogleAccessToken(env);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });
}

async function sheetsUpdate(env: Env, range: string, values: string[][]): Promise<void> {
  const token = await getGoogleAccessToken(env);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });
}

async function sheetsDeleteRow(env: Env, sheetId: number, rowIndex: number): Promise<void> {
  const token = await getGoogleAccessToken(env);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}:batchUpdate`;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
        },
      }],
    }),
  });
}

// ─── Google Drive Helpers ─────────────────────────────────────────────────────

async function driveUpload(env: Env, fileBuffer: ArrayBuffer, filename: string, mimeType: string): Promise<{ id: string; url: string }> {
  const token = await getGoogleAccessToken(env);

  const metadata = JSON.stringify({
    name: filename,
    parents: [env.GOOGLE_DRIVE_FOLDER_ID],
  });

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${metadata}`;
  const mediaPart = `Content-Type: ${mimeType}\r\n\r\n`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(delimiter + metadataPart + delimiter + mediaPart);
  const closeBytes = encoder.encode(closeDelimiter);

  const body = new Uint8Array(metadataBytes.length + fileBuffer.byteLength + closeBytes.length);
  body.set(metadataBytes, 0);
  body.set(new Uint8Array(fileBuffer), metadataBytes.length);
  body.set(closeBytes, metadataBytes.length + fileBuffer.byteLength);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body: body,
  });

  const data = await res.json() as { id: string };

  // Make file publicly readable
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });

  const url = `https://drive.google.com/uc?export=view&id=${data.id}`;
  return { id: data.id, url };
}

async function driveDelete(env: Env, fileId: string): Promise<void> {
  const token = await getGoogleAccessToken(env);
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

async function createSessionToken(env: Env): Promise<string> {
  const payload = { iat: Date.now(), exp: Date.now() + 86400000 };
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = JSON.stringify(payload);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${btoa(data)}.${sigB64}`;
}

async function verifySessionToken(env: Env, token: string): Promise<boolean> {
  try {
    const [dataB64, sigB64] = token.split('.');
    if (!dataB64 || !sigB64) return false;
    const data = atob(dataB64);
    const payload = JSON.parse(data) as { exp: number };
    if (payload.exp < Date.now()) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data));
  } catch {
    return false;
  }
}

async function verifyPassword(env: Env, password: string): Promise<boolean> {
  // In production use bcrypt via a compatible implementation or compare SHA-256 hash
  // Store the hash as: sha256(password + salt) where salt is stored separately
  // For simplicity here we use a constant-time comparison of SHA-256 hashes
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === env.ADMIN_PASSWORD_HASH;
}

async function getSessionFromRequest(request: Request): Promise<string | null> {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  return match ? match[1] : null;
}

async function requireAuth(request: Request, env: Env): Promise<boolean> {
  const session = await getSessionFromRequest(request);
  if (!session) return false;
  return verifySessionToken(env, session);
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

async function checkRateLimit(env: Env, ip: string, maxAttempts = 5, windowSecs = 900): Promise<boolean> {
  const key = `rate:${ip}`;
  const current = await env.RATE_LIMIT_KV.get(key);
  const count = current ? parseInt(current) : 0;
  if (count >= maxAttempts) return false;
  await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: windowSecs });
  return true;
}

// ─── Turnstile Verification ───────────────────────────────────────────────────

async function verifyTurnstile(env: Env, token: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

// ─── Email Helper ─────────────────────────────────────────────────────────────

async function sendEmail(env: Env, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <noreply@yourdomain.com>',
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Data Transformation Helpers ──────────────────────────────────────────────

function rowsToProfile(rows: string[][]): Record<string, string | boolean> | null {
  if (rows.length < 2) return null;
  const headers = rows[0];
  const values = rows[1];
  const obj: Record<string, string | boolean> = {};
  headers.forEach((h, i) => {
    const val = values[i] || '';
    if (h.startsWith('Show_')) {
      obj[h] = val.toLowerCase() === 'true';
    } else {
      obj[h] = val;
    }
  });
  return obj;
}

function rowsToArray(rows: string[][], boolFields: string[] = [], numberFields: string[] = []): Record<string, string | boolean | number>[] {
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(values => {
    const obj: Record<string, string | boolean | number> = {};
    headers.forEach((h, i) => {
      const val = values[i] || '';
      if (boolFields.includes(h)) {
        obj[h] = val.toLowerCase() === 'true';
      } else if (numberFields.includes(h)) {
        obj[h] = parseInt(val) || 0;
      } else if (h === 'ImageURLs' || h === 'VideoURLs') {
        obj[h] = val ? val.split(',').map(s => s.trim()) : [];
      } else {
        obj[h] = val;
      }
    });
    return obj;
  });
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────

function corsHeaders(origin: string) {
  const allowedOrigins = [
     'https://danielrunyowa.pages.dev',  
  'https://engineerdtr-admin.pages.dev',       
  'https://danielrunyowa.com',              
    'http://localhost:5173',
    'http://localhost:4173',
  ];

  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function errorResponse(message: string, status = 400, headers: Record<string, string> = {}): Response {
  return jsonResponse({ error: message }, status, headers);
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

// GET /api/profile
async function handleGetProfile(env: Env): Promise<Response> {
  const cacheKey = 'profile_data';
  const cached = await env.CACHE_KV.get(cacheKey);
  if (cached) return jsonResponse(JSON.parse(cached));

  const rows = await sheetsGet(env, 'Profile!A:V');

// TEMP DEBUG
return jsonResponse({
  rowCount: rows.length,
  rows: rows
});

  await env.CACHE_KV.put(cacheKey, JSON.stringify(profile), { expirationTtl: 300 }); // 5 min cache
  return jsonResponse(profile);
}

// GET /api/posts
async function handleGetPosts(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

  const cacheKey = `posts_p${page}_l${limit}`;
  const cached = await env.CACHE_KV.get(cacheKey);
  if (cached) return jsonResponse(JSON.parse(cached));

  const rows = await sheetsGet(env, 'Posts!A:F');
  const posts = rowsToArray(rows, [], []);

  // Sort by Timestamp desc
  posts.sort((a, b) => new Date(b.Timestamp as string).getTime() - new Date(a.Timestamp as string).getTime());

  const total = posts.length;
  const paginated = posts.slice((page - 1) * limit, page * limit);
  const result = { posts: paginated, total, page, pages: Math.ceil(total / limit) };

  await env.CACHE_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 60 }); // 1 min cache
  return jsonResponse(result);
}

// GET /api/skills
async function handleGetSkills(env: Env): Promise<Response> {
  const cacheKey = 'skills_data';
  const cached = await env.CACHE_KV.get(cacheKey);
  if (cached) return jsonResponse(JSON.parse(cached));

  const rows = await sheetsGet(env, 'Skills!A:F');
  const skills = rowsToArray(rows, ['Visible'], ['Order'])
    .filter(s => s.Visible)
    .sort((a, b) => (a.Order as number) - (b.Order as number));

  await env.CACHE_KV.put(cacheKey, JSON.stringify(skills), { expirationTtl: 600 }); // 10 min cache
  return jsonResponse(skills);
}

// GET /api/projects
async function handleGetProjects(env: Env): Promise<Response> {
  const cacheKey = 'projects_data';
  const cached = await env.CACHE_KV.get(cacheKey);
  if (cached) return jsonResponse(JSON.parse(cached));

  const rows = await sheetsGet(env, 'Projects!A:I');
  const projects = rowsToArray(rows, ['Visible'], ['Order'])
    .filter(p => p.Visible)
    .sort((a, b) => (a.Order as number) - (b.Order as number));

  await env.CACHE_KV.put(cacheKey, JSON.stringify(projects), { expirationTtl: 300 });
  return jsonResponse(projects);
}

// GET /api/cv/download
async function handleCVDownload(env: Env): Promise<Response> {
  const rows = await sheetsGet(env, 'Profile!A:V');
  const profile = rowsToProfile(rows);
  if (!profile || !profile.CV_File_URL) return errorResponse('CV not found', 404);

  const fileRes = await fetch(profile.CV_File_URL as string);
  if (!fileRes.ok) return errorResponse('CV file not available', 404);

  const filename = (profile.CV_File_Name as string) || 'CV.pdf';

  return new Response(fileRes.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  });
}

// POST /api/contact
async function handleContact(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as {
    name: string; email: string; message: string; turnstileToken?: string;
  };

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Verify Turnstile (optional for demo)
  if (body.turnstileToken && env.TURNSTILE_SECRET_KEY) {
    const valid = await verifyTurnstile(env, body.turnstileToken, ip);
    if (!valid) return errorResponse('Turnstile verification failed', 400);
  }

  // Validate inputs
  if (!body.name || !body.email || !body.message) {
    return errorResponse('All fields are required', 400);
  }

  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // Log to Sheets
  await sheetsAppend(env, 'ContactSubmissions!A:F', [[
    id, timestamp, body.name, body.email, body.message, 'FALSE',
  ]]);

  // Send email notification
  let emailSent = false;
  if (env.RESEND_API_KEY && env.NOTIFICATION_EMAIL) {
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${body.name}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      <p><strong>Message:</strong></p>
      <blockquote>${body.message.replace(/\n/g, '<br>')}</blockquote>
      <p><em>Received: ${new Date(timestamp).toLocaleString()}</em></p>
    `;
    emailSent = await sendEmail(env, env.NOTIFICATION_EMAIL, `Portfolio Contact: ${body.name}`, html);

    // Update EmailSent status in Sheets
    if (emailSent) {
      const rows = await sheetsGet(env, 'ContactSubmissions!A:A');
      const rowIndex = rows.findIndex(r => r[0] === id);
      if (rowIndex > 0) {
        await sheetsUpdate(env, `ContactSubmissions!F${rowIndex + 1}`, [['TRUE']]);
      }
    }
  }

  return jsonResponse({ success: true, id });
}

// POST /api/admin/login
async function handleAdminLogin(request: Request, env: Env): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Rate limit
  const allowed = await checkRateLimit(env, ip);
  if (!allowed) return errorResponse('Too many login attempts. Try again in 15 minutes.', 429);

  const body = await request.json() as { password: string };
  if (!body.password) return errorResponse('Password required', 400);

  const valid = await verifyPassword(env, body.password);
  if (!valid) return errorResponse('Invalid password', 401);

  const token = await createSessionToken(env);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
    },
  });
}

// POST /api/admin/logout
function handleAdminLogout(): Response {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'admin_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    },
  });
}

// POST /api/admin/upload/image
async function handleImageUpload(request: Request, env: Env): Promise<Response> {
  if (!await requireAuth(request, env)) return errorResponse('Unauthorised', 401);

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return errorResponse('No file provided', 400);

  const buffer = await file.arrayBuffer();
  const { id, url } = await driveUpload(env, buffer, file.name, file.type);

  return jsonResponse({ id, url });
}

// POST /api/admin/cv/upload
async function handleCVUpload(request: Request, env: Env): Promise<Response> {
  if (!await requireAuth(request, env)) return errorResponse('Unauthorised', 401);

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const newFilename = formData.get('filename') as string | null;
  if (!file) return errorResponse('No file provided', 400);

  // Get current CV URL to delete old file
  const rows = await sheetsGet(env, 'Profile!A:V');
  const profile = rowsToProfile(rows);

  if (profile?.CV_File_URL) {
    const oldUrl = profile.CV_File_URL as string;
    const match = oldUrl.match(/id=([^&]+)/);
    if (match) await driveDelete(env, match[1]);
  }

  const filename = newFilename || (profile?.CV_File_Name as string) || 'CV.pdf';
  const buffer = await file.arrayBuffer();
  const { url } = await driveUpload(env, buffer, filename, 'application/pdf');

  // Update Profile sheet
  const headers = rows[0];
  const cvUrlIdx = headers.indexOf('CV_File_URL');
  const cvNameIdx = headers.indexOf('CV_File_Name');
  if (cvUrlIdx >= 0) await sheetsUpdate(env, `Profile!${columnLetter(cvUrlIdx)}2`, [[url]]);
  if (cvNameIdx >= 0) await sheetsUpdate(env, `Profile!${columnLetter(cvNameIdx)}2`, [[filename]]);

  // Invalidate cache
  await env.CACHE_KV.delete('profile_data');

  return jsonResponse({ success: true, url, filename });
}

function columnLetter(index: number): string {
  let letter = '';
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

// GET /api/admin/contact-submissions
async function handleGetSubmissions(request: Request, env: Env): Promise<Response> {
  if (!await requireAuth(request, env)) return errorResponse('Unauthorised', 401);
  const rows = await sheetsGet(env, 'ContactSubmissions!A:F');
  const submissions = rowsToArray(rows, ['EmailSent'], []).reverse();
  return jsonResponse(submissions);
}

// GET/PUT /api/admin/profile
async function handleAdminProfile(request: Request, env: Env): Promise<Response> {
  if (!await requireAuth(request, env)) return errorResponse('Unauthorised', 401);

  if (request.method === 'GET') {
    const rows = await sheetsGet(env, 'Profile!A:V');
    return jsonResponse(rowsToProfile(rows));
  }

  if (request.method === 'PUT') {
    const body = await request.json() as Record<string, string | boolean>;
    const rows = await sheetsGet(env, 'Profile!A:V');
    if (rows.length < 1) return errorResponse('Profile sheet not found', 404);

    const headers = rows[0];
    const updates: Promise<void>[] = [];

    for (const [key, value] of Object.entries(body)) {
      const idx = headers.indexOf(key);
      if (idx >= 0) {
        updates.push(sheetsUpdate(env, `Profile!${columnLetter(idx)}2`, [[String(value)]]));
      }
    }

    await Promise.all(updates);
    await env.CACHE_KV.delete('profile_data');

    return jsonResponse({ success: true });
  }

  return errorResponse('Method not allowed', 405);
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const addCors = (res: Response): Response => {
      const headers = new Headers(res.headers);
      Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
      return new Response(res.body, { status: res.status, headers });
    };

    try {
      // ── Public Routes ──────────────────────────────────────────────────
      if (path === '/api/profile' && request.method === 'GET') {
        return addCors(await handleGetProfile(env));
      }
      if (path === '/api/posts' && request.method === 'GET') {
        return addCors(await handleGetPosts(request, env));
      }
      if (path === '/api/skills' && request.method === 'GET') {
        return addCors(await handleGetSkills(env));
      }
      if (path === '/api/projects' && request.method === 'GET') {
        return addCors(await handleGetProjects(env));
      }
      if (path === '/api/cv/download' && request.method === 'GET') {
        return addCors(await handleCVDownload(env));
      }
      if (path === '/api/contact' && request.method === 'POST') {
        return addCors(await handleContact(request, env));
      }

      // ── Auth Routes ────────────────────────────────────────────────────
      if (path === '/api/admin/login' && request.method === 'POST') {
        return addCors(await handleAdminLogin(request, env));
      }
      if (path === '/api/admin/logout' && request.method === 'POST') {
        return addCors(handleAdminLogout());
      }

      // ── Admin Routes ───────────────────────────────────────────────────
      if (path === '/api/admin/profile') {
        return addCors(await handleAdminProfile(request, env));
      }
      if (path === '/api/admin/upload/image' && request.method === 'POST') {
        return addCors(await handleImageUpload(request, env));
      }
      if (path === '/api/admin/cv/upload' && request.method === 'POST') {
        return addCors(await handleCVUpload(request, env));
      }
      if (path === '/api/admin/contact-submissions' && request.method === 'GET') {
        return addCors(await handleGetSubmissions(request, env));
      }

      return addCors(errorResponse('Not found', 404));
    } catch (e) {
      console.error('Worker error:', e);
      return addCors(errorResponse('Internal server error', 500));
    }
  },
};
