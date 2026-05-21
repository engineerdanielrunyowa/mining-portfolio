import { useRef, useEffect, useState } from 'react';
import { Award, MapPin, GraduationCap, Download } from 'lucide-react';
import type { Profile } from '../types';

interface AboutSectionProps {
  profile: Profile;
}

export default function AboutSection({ profile }: AboutSectionProps) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCVDownload = () => {
    if (profile.CV_File_URL && profile.CV_File_URL !== '#') {
      window.open(profile.CV_File_URL, '_blank');
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Image & badges */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            {/* Image container */}
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ border: '2px solid var(--border-color)' }}
              >
                <img
                  src={profile.ProfileImageURL}
                  alt={profile.Name}
                  className="w-full h-80 lg:h-96 object-cover"
                  loading="lazy"
                />
                {/* Gradient overlay at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-32"
                  style={{
                    background: 'linear-gradient(to top, var(--bg-main), transparent)',
                  }}
                />
              </div>

              {/* Credential cards */}
              <div
                className="absolute -bottom-6 -right-4 px-4 py-3 rounded-xl shadow-lg"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 8px 30px var(--shadow-color)',
                }}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} style={{ color: 'var(--accent-secondary)' }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>RPEng Registered</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Professional Engineer</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-4 -left-4 px-4 py-3 rounded-xl shadow-lg"
                style={{
                  backgroundColor: 'var(--accent-secondary)',
                  color: '#0E1621',
                  boxShadow: '0 8px 30px rgba(194,155,87,0.4)',
                }}
              >
                <div className="text-sm font-extrabold">AusIMM</div>
                <div className="text-xs font-medium">Member</div>
              </div>
            </div>

            {/* Accolades */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { icon: <Award size={16} />, title: 'AusIMM Young Professional Award', year: '2016' },
                { icon: <MapPin size={16} />, title: 'Kalgoorlie — Perth — Santiago', year: 'Locations' },
                { icon: <GraduationCap size={16} />, title: 'B.Eng Mining (First Class Hons)', year: 'UQ 2009' },
                { icon: <GraduationCap size={16} />, title: 'M.Sc Geomechanics', year: 'CSM 2012' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ color: 'var(--accent-secondary)' }} className="mb-2">{item.icon}</div>
                  <div className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-main)' }}>{item.title}</div>
                  <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{item.year}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Bio */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(30px)',
              transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
            }}
          >
            <div className="section-label">About</div>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-8" style={{ color: 'var(--text-main)' }}>
              The Engineer{' '}
              <span style={{ color: 'var(--accent-secondary)' }}>Behind the Work</span>
            </h2>

            {/* Bio paragraphs */}
            <div className="space-y-4">
              {profile.Bio.split('\n\n').filter(Boolean).map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-7"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Specialisations */}
            <div className="mt-8">
              <div className="text-xs font-mono font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--accent-secondary)' }}>
                Core Specialisations
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Blast Design', 'Slope Stability', 'Rock Mechanics', 'Mine Planning',
                  'Geotechnical Assessment', 'Ventilation Design', 'Production Optimisation',
                  'Bankable Feasibility Studies',
                ].map(spec => (
                  <span
                    key={spec}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="my-8 h-px"
              style={{ backgroundColor: 'var(--border-color)' }}
            />

            {/* CTA */}
            <div className="flex flex-wrap gap-3 items-center">
              <button onClick={handleCVDownload} className="btn-gold">
                <Download size={16} />
                Download Full CV
              </button>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {profile.CV_File_Name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
