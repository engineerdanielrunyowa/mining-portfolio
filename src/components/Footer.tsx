import { SocialIcon } from './SocialIcons';
import type { Profile } from '../types';

interface FooterProps {
  profile: Profile;
}

export default function Footer({ profile }: FooterProps) {
  const socialPlatforms = [
    { key: 'LinkedIn', show: profile.Show_LinkedIn, url: profile.LinkedIn_URL },
    { key: 'Instagram', show: profile.Show_Instagram, url: profile.Instagram_URL },
    { key: 'X', show: profile.Show_X, url: profile.X_URL },
    { key: 'Facebook', show: profile.Show_Facebook, url: profile.Facebook_URL },
    { key: 'WhatsApp', show: profile.Show_WhatsApp, url: profile.WhatsApp_URL },
    { key: 'Threads', show: profile.Show_Threads, url: profile.Threads_URL },
  ].filter(s => s.show);

  const year = new Date().getFullYear();

  return (
    <footer
      className="py-10 border-t"
      style={{
        backgroundColor: 'var(--accent-primary)',
        borderColor: 'rgba(194,155,87,0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-xs"
                style={{ backgroundColor: 'var(--accent-secondary)', color: '#0E1621' }}
              >
                JT
              </div>
              <span className="font-semibold text-sm text-white">{profile.Name}</span>
            </div>
            <p className="text-xs text-white/50 font-mono">{profile.Title}</p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-4">
            {['skills', 'feed', 'projects', 'about', 'contact'].map(id => (
              <button
                key={id}
                onClick={() => {
                  const el = document.getElementById(id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-xs text-white/50 hover:text-white transition-colors capitalize font-medium"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          {/* Social */}
          <div className="flex justify-end gap-2">
            {socialPlatforms.map(p => (
              <a
                key={p.key}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                aria-label={p.key}
              >
                <SocialIcon platform={p.key} size={15} />
              </a>
            ))}
          </div>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30 font-mono"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span>© {year} {profile.Name}. All rights reserved.</span>
          <span>Built with precision · Powered by React & Cloudflare</span>
        </div>
      </div>
    </footer>
  );
}
