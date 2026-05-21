import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Download } from 'lucide-react';
import type { Theme, Profile } from '../types';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
  profile?: Profile;
}

const NAV_ITEMS = [
  { label: 'Skills', href: '#skills' },
  { label: 'Feed', href: '#feed' },
  { label: 'Projects', href: '#projects' },
  { label: 'Visualisations', href: '#visualisations' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ theme, toggleTheme, profile }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);

      // Track active section
      const sections = NAV_ITEMS.map(i => i.href.slice(1));
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleCVDownload = () => {
    if (profile?.CV_File_URL && profile.CV_File_URL !== '#') {
      const a = document.createElement('a');
      a.href = `/api/cv/download`;
      a.download = profile.CV_File_Name || 'CV.pdf';
      a.click();
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-md border-b'
            : 'bg-transparent'
        }`}
        style={{
          backgroundColor: isScrolled
            ? theme === 'dark' ? 'rgba(14,22,33,0.95)' : 'rgba(251,251,251,0.95)'
            : 'transparent',
          borderColor: isScrolled ? 'var(--border-color)' : 'transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Name */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-xs"
                style={{ backgroundColor: 'var(--accent-secondary)', color: '#0E1621' }}
              >
                JT
              </div>
              <span
                className="font-semibold text-sm tracking-wide hidden sm:block"
                style={{ color: isScrolled ? 'var(--text-main)' : 'white' }}
              >
                {profile?.Name || 'James Thornton'}
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`nav-link text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.href.slice(1) ? 'active' : ''
                  }`}
                  style={{ color: isScrolled ? 'var(--text-main)' : 'rgba(255,255,255,0.85)' }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: isScrolled ? 'var(--bg-secondary)' : 'rgba(255,255,255,0.15)',
                  color: isScrolled ? 'var(--text-main)' : 'white',
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* CV Download — desktop */}
              <button
                onClick={handleCVDownload}
                className="btn-gold hidden md:inline-flex text-xs px-3 py-2"
              >
                <Download size={13} />
                Download CV
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isScrolled ? 'var(--bg-secondary)' : 'rgba(255,255,255,0.15)',
                  color: isScrolled ? 'var(--text-main)' : 'white',
                }}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 z-40 transition-all duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: theme === 'dark' ? 'rgba(14,22,33,0.98)' : 'rgba(251,251,251,0.98)' }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <div
            className="font-mono text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Navigation
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-2xl font-semibold transition-colors duration-200 hover:text-yellow-500"
              style={{ color: 'var(--text-main)' }}
            >
              {item.label}
            </button>
          ))}
          <button onClick={handleCVDownload} className="btn-gold mt-4">
            <Download size={16} />
            Download CV
          </button>
        </div>
      </div>
    </>
  );
}
