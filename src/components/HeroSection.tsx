import { useEffect, useRef } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { SocialIcon } from './SocialIcons';
import type { Profile } from '../types';

interface HeroSectionProps {
  profile: Profile;
}

export default function HeroSection({ profile }: HeroSectionProps) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const elements = textRef.current?.querySelectorAll('[data-animate]');
    if (!elements) return;
    elements.forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(30px)';
      setTimeout(() => {
        htmlEl.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        htmlEl.style.opacity = '1';
        htmlEl.style.transform = 'translateY(0)';
      }, 200 + i * 150);
    });
  }, []);

  const scrollToFeed = () => {
    const el = document.getElementById('feed');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleCVDownload = () => {
    if (profile.CV_File_URL && profile.CV_File_URL !== '#') {
      window.open(profile.CV_File_URL, '_blank');
    }
  };

  const socialPlatforms = [
    { key: 'LinkedIn', show: profile.Show_LinkedIn, url: profile.LinkedIn_URL },
    { key: 'Instagram', show: profile.Show_Instagram, url: profile.Instagram_URL },
    { key: 'X', show: profile.Show_X, url: profile.X_URL },
    { key: 'Facebook', show: profile.Show_Facebook, url: profile.Facebook_URL },
    { key: 'WhatsApp', show: profile.Show_WhatsApp, url: profile.WhatsApp_URL },
    { key: 'Threads', show: profile.Show_Threads, url: profile.Threads_URL },
  ].filter(s => s.show);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={profile.LandingBackgroundURL || '/images/hero-bg.jpg'}
          alt="Mining site background"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(194,155,87,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(194,155,87,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 8.33) % 100}%`,
              top: `${(i * 7.7 + 10) % 90}%`,
              backgroundColor: 'rgba(194, 155, 87, 0.35)',
              animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div ref={textRef} className="text-white">
            <div
              data-animate
              className="font-mono text-xs font-semibold tracking-widest uppercase mb-6 flex items-center gap-3"
              style={{ color: 'var(--accent-secondary)' }}
            >
              <div className="h-px w-8" style={{ backgroundColor: 'var(--accent-secondary)' }} />
              Mining Engineering Professional
            </div>

            <h1 data-animate className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight mb-4" style={{ color: 'white' }}>
              {profile.Name.split(' ').map((word, i) => (
                <span key={i} className="block">
                  {i === 1
                    ? <span style={{ color: 'var(--accent-secondary)' }}>{word}</span>
                    : word}
                </span>
              ))}
            </h1>

            <div data-animate className="font-mono text-sm font-medium tracking-wider uppercase mb-6">
              <span
                className="px-3 py-1 rounded border"
                style={{
                  borderColor: 'rgba(194,155,87,0.4)',
                  backgroundColor: 'rgba(194,155,87,0.1)',
                  color: 'var(--accent-secondary)',
                }}
              >
                {profile.Title}
              </span>
            </div>

            <p data-animate className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {profile.Tagline}
            </p>

            <div data-animate className="flex flex-wrap gap-3 mb-8">
              <button onClick={scrollToFeed} className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                View My Work
              </button>
              <button onClick={handleCVDownload} className="btn-gold">
                <Download size={16} />
                Download CV
              </button>
            </div>

            {socialPlatforms.length > 0 && (
              <div data-animate className="flex items-center gap-2">
                <span className="text-xs text-white/40 font-mono mr-1">Connect</span>
                {socialPlatforms.map(platform => (
                  <a
                    key={platform.key}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label={platform.key}
                  >
                    <SocialIcon platform={platform.key} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right — Profile Image */}
          <div data-animate className="hidden lg:flex justify-end">
            <div className="relative">
              <div
                className="absolute inset-0 scale-105"
                style={{
                  border: '2px solid rgba(194,155,87,0.3)',
                  borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                  animation: 'float 6s ease-in-out infinite',
                }}
              />
              <div
                className="absolute inset-0 scale-110"
                style={{
                  border: '1px solid rgba(194,155,87,0.15)',
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  animation: 'float 8s ease-in-out infinite reverse',
                }}
              />
              <div
                className="relative w-72 h-72 sm:w-80 sm:h-80 overflow-hidden"
                style={{
                  borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                  border: '3px solid rgba(194,155,87,0.5)',
                  boxShadow: '0 0 60px rgba(194,155,87,0.2)',
                }}
              >
                <img src={profile.ProfileImageURL} alt={profile.Name} className="w-full h-full object-cover" />
              </div>

              <div
                className="absolute -bottom-4 -left-8 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--accent-secondary)', color: '#0E1621', boxShadow: '0 8px 30px rgba(194,155,87,0.4)' }}
              >
                <div className="text-2xl font-extrabold leading-none">15+</div>
                <div className="text-xs font-semibold">Years Experience</div>
              </div>

              <div
                className="absolute -top-4 -right-4 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'rgba(14,22,33,0.9)', border: '1px solid rgba(194,155,87,0.3)', color: 'white' }}
              >
                <div className="text-xl font-extrabold leading-none" style={{ color: 'var(--accent-secondary)' }}>40+</div>
                <div className="text-xs font-semibold text-white/70">Projects Delivered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/40 text-xs font-mono tracking-widest uppercase">Scroll</span>
          <ChevronDown size={14} className="text-white/40 animate-bounce mt-2" />
        </div>
      </div>
    </section>
  );
}
