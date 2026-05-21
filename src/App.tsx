import { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MorphTransition from './components/MorphTransition';
import SkillsSection from './components/SkillsSection';
import PostsFeed from './components/PostsFeed';
import ProjectsSection from './components/ProjectsSection';
import MiningVisualizations from './components/MiningVisualizations';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { mockProfile, mockPosts, mockSkills, mockProjects } from './data/mockData';
import type { Profile, Post, Skill, Project } from './types';

// ─── Route detection ──────────────────────────────────────────────────────────
function getRoute(): 'main' | 'admin' {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return 'admin';
  return 'main';
}

// ─── Main Portfolio ────────────────────────────────────────────────────────────
function MainPortfolio() {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from Cloudflare Worker API
    // For demo, use mock data
    const loadData = async () => {
      try {
        // Try to fetch from the Worker API
        const [profileRes, postsRes, skillsRes, projectsRes] = await Promise.allSettled([
          fetch('/api/profile').then(r => r.ok ? r.json() : null),
          fetch('/api/posts').then(r => r.ok ? r.json() : null),
          fetch('/api/skills').then(r => r.ok ? r.json() : null),
          fetch('/api/projects').then(r => r.ok ? r.json() : null),
        ]);

        setProfile(
          profileRes.status === 'fulfilled' && profileRes.value
            ? profileRes.value
            : mockProfile
        );
        setPosts(
          postsRes.status === 'fulfilled' && postsRes.value
            ? postsRes.value
            : mockPosts
        );
        setSkills(
          skillsRes.status === 'fulfilled' && skillsRes.value
            ? skillsRes.value
            : mockSkills
        );
        setProjects(
          projectsRes.status === 'fulfilled' && projectsRes.value
            ? projectsRes.value
            : mockProjects
        );
      } catch {
        // Fall back to mock data
        setProfile(mockProfile);
        setPosts(mockPosts);
        setSkills(mockSkills);
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-main)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm animate-pulse"
            style={{ backgroundColor: 'var(--accent-secondary)', color: '#0E1621' }}
          >
            JT
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent-secondary)', borderTopColor: 'transparent' }}
          />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} profile={profile} />
      <HeroSection profile={profile} />
      <MorphTransition />
      <SkillsSection skills={skills} />
      <PostsFeed posts={posts} />
      <ProjectsSection projects={projects} />
      <MiningVisualizations />
      <AboutSection profile={profile} />
      <ContactSection profile={profile} />
      <Footer profile={profile} />
    </div>
  );
}

// ─── Admin App ─────────────────────────────────────────────────────────────────
function AdminApp() {
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session
  useEffect(() => {
    const session = sessionStorage.getItem('admin-session');
    if (session === 'demo-authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (password: string): Promise<boolean> => {
    // In production, this would call POST /api/admin/login
    // For demo, accept the password 'admin2025'
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        return true;
      }
    } catch {
      // Demo fallback
      if (password === 'admin2025' || password === 'demo') {
        sessionStorage.setItem('admin-session', 'demo-authenticated');
        setIsAuthenticated(true);
        return true;
      }
    }
    // Demo fallback
    if (password === 'admin2025' || password === 'demo') {
      sessionStorage.setItem('admin-session', 'demo-authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-session');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminDashboard
      onLogout={handleLogout}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const route = getRoute();

  return route === 'admin' ? <AdminApp /> : <MainPortfolio />;
}
