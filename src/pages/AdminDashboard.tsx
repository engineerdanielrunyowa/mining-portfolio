import { useState } from 'react';
import {
  LayoutDashboard, FileText, Layers, FolderOpen, User, FileDown,
  MessageSquare, LogOut, Plus, Edit, Trash2, Eye, EyeOff,
  Save, Upload, X, CheckCircle, ChevronDown, ChevronUp, Sun, Moon
} from 'lucide-react';
import { mockProfile, mockPosts, mockSkills, mockProjects } from '../data/mockData';
import type { Profile, Post, Skill, Project } from '../types';
import type { Theme } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

type AdminSection = 'overview' | 'posts' | 'skills' | 'projects' | 'profile' | 'cv' | 'submissions';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  active, onSelect, onLogout, theme, toggleTheme
}: {
  active: AdminSection;
  onSelect: (s: AdminSection) => void;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}) {
  const NAV = [
    { id: 'overview' as const, label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'posts' as const, label: 'Posts', icon: <FileText size={18} /> },
    { id: 'skills' as const, label: 'Skills', icon: <Layers size={18} /> },
    { id: 'projects' as const, label: 'Projects', icon: <FolderOpen size={18} /> },
    { id: 'profile' as const, label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'cv' as const, label: 'CV Management', icon: <FileDown size={18} /> },
    { id: 'submissions' as const, label: 'Contact Submissions', icon: <MessageSquare size={18} /> },
  ];

  return (
    <aside
      className="admin-sidebar flex flex-col"
      style={{ width: '260px' }}
    >
      {/* Header */}
      <div
        className="p-5 border-b"
        style={{ borderColor: 'rgba(194,155,87,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
            style={{ backgroundColor: 'var(--accent-secondary)', color: '#0E1621' }}
          >
            JT
          </div>
          <div>
            <div className="text-sm font-bold text-white">Admin Panel</div>
            <div className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>Portfolio Manager</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`admin-nav-item w-full text-left ${active === item.id ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 space-y-2 border-t" style={{ borderColor: 'rgba(194,155,87,0.15)' }}>
        <button
          onClick={toggleTheme}
          className="admin-nav-item w-full text-left"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={onLogout}
          className="admin-nav-item w-full text-left"
          style={{ color: 'rgba(239,68,68,0.8)' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection() {
  const stats = [
    { label: 'Total Posts', value: mockPosts.length.toString(), color: '#C29B57' },
    { label: 'Active Skills', value: mockSkills.filter(s => s.Visible).length.toString(), color: '#10b981' },
    { label: 'Projects', value: mockProjects.filter(p => p.Visible).length.toString(), color: '#3b82f6' },
    { label: 'Contact Submissions', value: '3', color: '#8b5cf6' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Dashboard Overview</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Welcome back. Manage your portfolio content from this panel.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div
            key={s.label}
            className="admin-card"
            style={{ borderLeft: `3px solid ${s.color}` }}
          >
            <div className="text-3xl font-extrabold font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-main)' }}>Recent Posts</h3>
          <div className="space-y-3">
            {mockPosts.slice(0, 3).map(p => (
              <div
                key={p.ID}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-secondary)' }}
                />
                <div>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-main)' }}>
                    {p.TextContent.slice(0, 100)}...
                  </p>
                  <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                    {new Date(p.Timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-main)' }}>Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Create New Post', icon: <Plus size={14} /> },
              { label: 'Add Skill', icon: <Plus size={14} /> },
              { label: 'Add Project', icon: <Plus size={14} /> },
              { label: 'Update Profile', icon: <User size={14} /> },
            ].map(action => (
              <button
                key={action.label}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <span style={{ color: 'var(--accent-secondary)' }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Manage Posts ─────────────────────────────────────────────────────────────
function PostsSection() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ TextContent: '', VideoURLs: '' });
  const [saved, setSaved] = useState(false);

  const handleCreate = () => {
    const newPost: Post = {
      ID: Date.now().toString(),
      Timestamp: new Date().toISOString(),
      TextContent: form.TextContent,
      ImageURLs: [],
      VideoURLs: form.VideoURLs.split(',').map(s => s.trim()).filter(Boolean),
    };
    setPosts(p => [newPost, ...p]);
    setCreating(false);
    setForm({ TextContent: '', VideoURLs: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this post?')) {
      setPosts(p => p.filter(post => post.ID !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Manage Posts</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{posts.length} total posts</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn-primary">
          <Plus size={15} /> New Post
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle size={15} /> Post saved successfully (Demo — no actual API call)
        </div>
      )}

      {/* Create form */}
      {creating && (
        <div className="admin-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>Create New Post</h3>
            <button onClick={() => setCreating(false)} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Content *</label>
              <textarea
                value={form.TextContent}
                onChange={e => setForm(f => ({ ...f, TextContent: e.target.value }))}
                className="form-input"
                rows={5}
                placeholder="Write your post content here..."
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Image Upload</label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center" style={{ borderColor: 'var(--border-color)' }}>
                <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Click to upload images</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PNG, JPG up to 10MB (uploaded to Google Drive)</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>YouTube URLs (comma-separated)</label>
              <input
                type="text"
                value={form.VideoURLs}
                onChange={e => setForm(f => ({ ...f, VideoURLs: e.target.value }))}
                className="form-input"
                placeholder="https://youtube.com/embed/..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} className="btn-primary"><Save size={14} /> Publish Post</button>
              <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Posts table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Preview</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Media</th>
                <th className="text-right px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr
                  key={post.ID}
                  style={{
                    borderBottom: i < posts.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {new Date(post.Timestamp).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs truncate" style={{ color: 'var(--text-main)', maxWidth: '240px' }}>
                      {post.TextContent.slice(0, 80)}...
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {post.ImageURLs.length > 0 && <span>{post.ImageURLs.length} img</span>}
                      {post.VideoURLs.length > 0 && <span>{post.VideoURLs.length} vid</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(editingId === post.ID ? null : post.ID)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.ID)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Skills Management ────────────────────────────────────────────────────────
function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ Title: '', Description: '', Order: skills.length + 1, Visible: true });

  const toggleVisible = (id: string) => {
    setSkills(ss => ss.map(s => s.ID === id ? { ...s, Visible: !s.Visible } : s));
  };

  const deleteSkill = (id: string) => {
    if (confirm('Delete this skill?')) setSkills(ss => ss.filter(s => s.ID !== id));
  };

  const handleCreate = () => {
    const newSkill: Skill = { ID: Date.now().toString(), ...form };
    setSkills(ss => [...ss, newSkill].sort((a, b) => a.Order - b.Order));
    setCreating(false);
    setForm({ Title: '', Description: '', Order: skills.length + 2, Visible: true });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Skills Management</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{skills.length} skills · {skills.filter(s => s.Visible).length} visible</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn-primary"><Plus size={15} /> Add Skill</button>
      </div>

      {creating && (
        <div className="admin-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>Add New Skill</h3>
            <button onClick={() => setCreating(false)} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Title *</label>
              <input type="text" value={form.Title} onChange={e => setForm(f => ({ ...f, Title: e.target.value }))} className="form-input" placeholder="e.g. Blast Design" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Display Order</label>
              <input type="number" value={form.Order} onChange={e => setForm(f => ({ ...f, Order: +e.target.value }))} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
              <textarea value={form.Description} onChange={e => setForm(f => ({ ...f, Description: e.target.value }))} className="form-input" rows={2} placeholder="Brief description of this skill..." />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>SVG Icon Upload</label>
              <div className="border-2 border-dashed rounded-xl p-4 text-center" style={{ borderColor: 'var(--border-color)' }}>
                <Upload size={18} className="mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload SVG icon (optional)</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Visibility</label>
              <button
                onClick={() => setForm(f => ({ ...f, Visible: !f.Visible }))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: form.Visible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${form.Visible ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: form.Visible ? '#10b981' : '#ef4444',
                }}
              >
                {form.Visible ? <Eye size={14} /> : <EyeOff size={14} />}
                {form.Visible ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="btn-primary"><Save size={14} /> Save Skill</button>
            <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {skills.sort((a, b) => a.Order - b.Order).map(skill => (
          <div
            key={skill.ID}
            className="admin-card flex items-center gap-4"
            style={{ opacity: skill.Visible ? 1 : 0.6 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: 'rgba(194,155,87,0.12)', color: 'var(--accent-secondary)' }}
            >
              {skill.Order}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{skill.Title}</div>
              <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{skill.Description}</div>
            </div>
            {!skill.Visible && (
              <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Hidden</span>
            )}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleVisible(skill.ID)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                {skill.Visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <Edit size={13} />
              </button>
              <button onClick={() => deleteSkill(skill.ID)} className="p-1.5 rounded-lg" style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Projects Management ──────────────────────────────────────────────────────
function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    Title: '', Description: '', Category: '', StartDate: '', EndDate: '', Order: projects.length + 1, Visible: true,
  });

  const deleteProject = (id: string) => {
    if (confirm('Delete this project?')) setProjects(pp => pp.filter(p => p.ID !== id));
  };

  const toggleVisible = (id: string) => setProjects(pp => pp.map(p => p.ID === id ? { ...p, Visible: !p.Visible } : p));

  const handleCreate = () => {
    const newProject: Project = { ID: Date.now().toString(), ...form, ImageURL: '' };
    setProjects(pp => [...pp, newProject]);
    setCreating(false);
    setForm({ Title: '', Description: '', Category: '', StartDate: '', EndDate: '', Order: projects.length + 2, Visible: true });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Projects Management</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{projects.length} total projects</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn-primary"><Plus size={15} /> Add Project</button>
      </div>

      {creating && (
        <div className="admin-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>Add New Project</h3>
            <button onClick={() => setCreating(false)} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Project Title *</label>
              <input type="text" value={form.Title} onChange={e => setForm(f => ({ ...f, Title: e.target.value }))} className="form-input" placeholder="Project name" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
              <input type="text" value={form.Category} onChange={e => setForm(f => ({ ...f, Category: e.target.value }))} className="form-input" placeholder="e.g. Open Pit, Underground" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Order</label>
              <input type="number" value={form.Order} onChange={e => setForm(f => ({ ...f, Order: +e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Start Date</label>
              <input type="text" value={form.StartDate} onChange={e => setForm(f => ({ ...f, StartDate: e.target.value }))} className="form-input" placeholder="Jan 2022" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>End Date</label>
              <input type="text" value={form.EndDate} onChange={e => setForm(f => ({ ...f, EndDate: e.target.value }))} className="form-input" placeholder="Dec 2022 or Present" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
              <textarea value={form.Description} onChange={e => setForm(f => ({ ...f, Description: e.target.value }))} className="form-input" rows={4} placeholder="Project description..." />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Project Image</label>
              <div className="border-2 border-dashed rounded-xl p-4 text-center" style={{ borderColor: 'var(--border-color)' }}>
                <Upload size={18} className="mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload image (Google Drive)</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Visibility</label>
              <button
                onClick={() => setForm(f => ({ ...f, Visible: !f.Visible }))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
                style={{
                  backgroundColor: form.Visible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${form.Visible ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: form.Visible ? '#10b981' : '#ef4444',
                }}
              >
                {form.Visible ? <Eye size={14} /> : <EyeOff size={14} />}
                {form.Visible ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="btn-primary"><Save size={14} /> Save Project</button>
            <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>#</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Title</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Duration</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="text-right px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.sort((a, b) => a.Order - b.Order).map((project, i) => (
                <tr key={project.ID} style={{ borderBottom: i < projects.length - 1 ? '1px solid var(--border-color)' : 'none', opacity: project.Visible ? 1 : 0.6 }}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{project.Order}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{project.Title.slice(0, 40)}{project.Title.length > 40 ? '...' : ''}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tag-badge">{project.Category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {project.StartDate} — {project.EndDate}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono px-2 py-1 rounded" style={{
                      backgroundColor: project.Visible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: project.Visible ? '#10b981' : '#ef4444',
                    }}>
                      {project.Visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleVisible(project.ID)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                        {project.Visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                        <Edit size={13} />
                      </button>
                      <button onClick={() => deleteProject(project.ID)} className="p-1.5 rounded-lg" style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Settings ─────────────────────────────────────────────────────────
function ProfileSettings() {
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, name, type = 'text', rows }: { label: string; name: keyof Profile; type?: string; rows?: number }) => (
    <div>
      <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {rows ? (
        <textarea
          value={String(profile[name])}
          onChange={e => setProfile(p => ({ ...p, [name]: e.target.value }))}
          className="form-input"
          rows={rows}
        />
      ) : (
        <input
          type={type}
          value={String(profile[name])}
          onChange={e => setProfile(p => ({ ...p, [name]: e.target.value }))}
          className="form-input"
        />
      )}
    </div>
  );



  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Profile Settings</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your public profile information</p>
        </div>
        <button onClick={handleSave} className="btn-primary"><Save size={15} /> Save Changes</button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle size={15} /> Profile saved successfully (Demo — no actual API call)
        </div>
      )}

      <div className="space-y-6">
        {/* Identity */}
        <div className="admin-card">
          <h3 className="text-sm font-bold mb-4 pb-3 border-b" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>Identity</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" name="Name" />
            <Field label="Professional Title" name="Title" />
            <div className="sm:col-span-2"><Field label="Tagline" name="Tagline" /></div>
            <div className="sm:col-span-2"><Field label="Bio" name="Bio" rows={8} /></div>
          </div>
        </div>

        {/* Contact */}
        <div className="admin-card">
          <h3 className="text-sm font-bold mb-4 pb-3 border-b" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>Contact Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" name="Phone" type="tel" />
            <Field label="Email" name="Email" type="email" />
          </div>
        </div>

        {/* Social */}
        <div className="admin-card">
          <h3 className="text-sm font-bold mb-4 pb-3 border-b" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>Social Links & Visibility</h3>
          <div className="space-y-4">
            {[
              { label: 'LinkedIn', urlKey: 'LinkedIn_URL' as keyof Profile, showKey: 'Show_LinkedIn' as keyof Profile },
              { label: 'Instagram', urlKey: 'Instagram_URL' as keyof Profile, showKey: 'Show_Instagram' as keyof Profile },
              { label: 'X (Twitter)', urlKey: 'X_URL' as keyof Profile, showKey: 'Show_X' as keyof Profile },
              { label: 'Facebook', urlKey: 'Facebook_URL' as keyof Profile, showKey: 'Show_Facebook' as keyof Profile },
              { label: 'WhatsApp', urlKey: 'WhatsApp_URL' as keyof Profile, showKey: 'Show_WhatsApp' as keyof Profile },
              { label: 'Threads', urlKey: 'Threads_URL' as keyof Profile, showKey: 'Show_Threads' as keyof Profile },
            ].map(({ label, urlKey, showKey }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>{label} URL</label>
                  <input
                    type="url"
                    value={String(profile[urlKey])}
                    onChange={e => setProfile(p => ({ ...p, [urlKey]: e.target.value }))}
                    className="form-input"
                    placeholder={`https://${label.toLowerCase()}.com/...`}
                  />
                </div>
                <div className="flex-shrink-0 mt-5">
                  <button
                    onClick={() => setProfile(p => ({ ...p, [showKey]: !p[showKey] }))}
                    className="w-11 h-6 rounded-full relative transition-all duration-300"
                    style={{ backgroundColor: profile[showKey] ? 'var(--accent-secondary)' : 'var(--border-color)' }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300"
                      style={{ transform: profile[showKey] ? 'translateX(20px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CV Management ────────────────────────────────────────────────────────────
function CVManagement() {
  const [step, setStep] = useState<'view' | 'confirm-name' | 'uploading' | 'done'>('view');
  const [useExistingName, setUseExistingName] = useState<boolean | null>(null);
  const [newName, setNewName] = useState('');
  const [currentName, setCurrentName] = useState(mockProfile.CV_File_Name);

  const handleUploadStart = () => setStep('confirm-name');
  const handleConfirm = (keepName: boolean) => {
    setUseExistingName(keepName);
    if (!keepName) return;
    setStep('uploading');
    setTimeout(() => {
      setStep('done');
    }, 2000);
  };
  const handleNewNameConfirm = () => {
    setCurrentName(newName || currentName);
    setStep('uploading');
    setTimeout(() => setStep('done'), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>CV Management</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload, replace, and manage your downloadable CV</p>
      </div>

      {step === 'view' && (
        <div className="admin-card max-w-lg">
          <h3 className="text-sm font-bold mb-4 pb-3 border-b" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>Current CV</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <FileDown size={24} style={{ color: 'var(--accent-secondary)' }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{currentName}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {mockProfile.CV_File_URL !== '#' ? 'Uploaded to Google Drive' : 'No CV uploaded yet'}
                </div>
              </div>
            </div>
            <button onClick={handleUploadStart} className="btn-primary w-full justify-center">
              <Upload size={15} /> Upload New CV
            </button>
          </div>
        </div>
      )}

      {step === 'confirm-name' && (
        <div className="admin-card max-w-lg">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-main)' }}>Keep existing filename?</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Current filename: <strong style={{ color: 'var(--text-main)' }}>{currentName}</strong>
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleConfirm(true)} className="btn-primary flex-1 justify-center">Yes, keep it</button>
            <button onClick={() => handleConfirm(false)} className="btn-secondary flex-1 justify-center">No, rename</button>
          </div>
          {useExistingName === false && (
            <div className="mt-4">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>New Filename</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="form-input"
                placeholder="e.g. James_Thornton_CV_2025.pdf"
              />
              <button onClick={handleNewNameConfirm} className="btn-primary mt-3">
                <Upload size={14} /> Proceed with Upload
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'uploading' && (
        <div className="admin-card max-w-lg text-center py-10">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-secondary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Uploading CV to Google Drive...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Deleting old file · Uploading new · Updating Sheets record</p>
        </div>
      )}

      {step === 'done' && (
        <div className="admin-card max-w-lg text-center py-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <CheckCircle size={28} />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>CV Updated Successfully</p>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Filename: {currentName}</p>
          <button onClick={() => setStep('view')} className="btn-secondary mt-4">Done</button>
        </div>
      )}
    </div>
  );
}

// ─── Contact Submissions ──────────────────────────────────────────────────────
function ContactSubmissions() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const submissions = [
    { ID: 'c1', Timestamp: new Date(Date.now() - 86400000).toISOString(), SenderName: 'Sarah Mitchell', SenderEmail: 'sarah@miningco.com', Message: 'Hi James, we have a consulting opportunity for a slope stability review at our open-cut operation in the Pilbara. Would you be available for a 6-week engagement starting next month?', EmailSent: true },
    { ID: 'c2', Timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), SenderName: 'Tom Bradley', SenderEmail: 'tom.b@geosolutions.com.au', Message: 'Saw your presentation at AusIMM — excellent work on blast pattern optimisation. Would love to connect and discuss a potential partnership opportunity.', EmailSent: true },
    { ID: 'c3', Timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), SenderName: 'Ana Lima', SenderEmail: 'ana.lima@minpro.cl', Message: 'Dear Mr Thornton, I am writing on behalf of MinPro Chile to enquire about your availability for an independent technical review of our blast design standards for a greenfield copper project in Atacama region.', EmailSent: false },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Contact Submissions</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{submissions.length} submissions received</p>
      </div>

      <div className="space-y-3">
        {submissions.map(sub => (
          <div key={sub.ID} className="admin-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{sub.SenderName}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{sub.SenderEmail}</span>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: sub.EmailSent ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: sub.EmailSent ? '#10b981' : '#ef4444',
                    }}
                  >
                    {sub.EmailSent ? 'Email sent' : 'Email failed'}
                  </span>
                </div>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
                  {new Date(sub.Timestamp).toLocaleString()}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {expanded === sub.ID ? sub.Message : sub.Message.slice(0, 100) + (sub.Message.length > 100 ? '...' : '')}
                </p>
              </div>
              <button
                onClick={() => setExpanded(expanded === sub.ID ? null : sub.ID)}
                className="flex-shrink-0 p-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}
              >
                {expanded === sub.ID ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout, theme, toggleTheme }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />;
      case 'posts': return <PostsSection />;
      case 'skills': return <SkillsSection />;
      case 'projects': return <ProjectsManagement />;
      case 'profile': return <ProfileSettings />;
      case 'cv': return <CVManagement />;
      case 'submissions': return <ContactSubmissions />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar active={activeSection} onSelect={s => { setActiveSection(s); setSidebarOpen(false); }} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar active={activeSection} onSelect={s => { setActiveSection(s); setSidebarOpen(false); }} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 h-14 border-b"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: 'var(--text-main)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <h1
            className="text-sm font-semibold font-mono hidden lg:block"
            style={{ color: 'var(--text-main)' }}
          >
            Portfolio Manager — {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href="/"
              target="_blank"
              className="text-xs font-mono flex items-center gap-1 transition-colors hover:underline"
              style={{ color: 'var(--accent-secondary)' }}
            >
              View Portfolio ↗
            </a>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 lg:p-8 max-w-5xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
