import { useRef, useEffect, useState, type ReactElement } from 'react';
import { Zap, Mountain, BarChart3, Settings, Map, Wind, Drill, FileCheck } from 'lucide-react';
import type { Skill } from '../types';

interface SkillsSectionProps {
  skills: Skill[];
}

const FALLBACK_ICONS: Record<number, ReactElement> = {
  0: <Zap size={28} />,
  1: <Mountain size={28} />,
  2: <BarChart3 size={28} />,
  3: <Settings size={28} />,
  4: <Map size={28} />,
  5: <Wind size={28} />,
  6: <Drill size={28} />,
  7: <FileCheck size={28} />,
};

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className="skill-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(31,47,64,0.1) 0%, rgba(194,155,87,0.1) 100%)',
          border: '1px solid rgba(194,155,87,0.2)',
          color: 'var(--accent-secondary)',
        }}
      >
        {skill.IconURL ? (
          <img src={skill.IconURL} alt={skill.Title} className="w-7 h-7 object-contain" />
        ) : (
          FALLBACK_ICONS[index % Object.keys(FALLBACK_ICONS).length]
        )}
      </div>

      {/* Content */}
      <h3
        className="text-base font-semibold mb-2"
        style={{ color: 'var(--text-main)' }}
      >
        {skill.Title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        {skill.Description}
      </p>

      {/* Accent line */}
      <div
        className="mt-4 h-0.5 w-8 rounded-full"
        style={{ backgroundColor: 'var(--accent-secondary)', opacity: 0.6 }}
      />
    </div>
  );
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!skills || skills.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="section-label">Core Competencies</div>
          <h2
            className="text-3xl sm:text-4xl font-bold mt-2 mb-4"
            style={{ color: 'var(--text-main)' }}
          >
            Technical{' '}
            <span style={{ color: 'var(--accent-secondary)' }}>Expertise</span>
          </h2>
          <p
            className="max-w-xl mx-auto text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            A decade and a half of applied engineering across open-pit, underground, and surface operations — distilled into measurable, deployable skills.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-16" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="w-2 h-2 rounded-full rotate-45" style={{ backgroundColor: 'var(--accent-secondary)' }} />
            <div className="h-px w-16" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {skills
            .filter(s => s.Visible)
            .sort((a, b) => a.Order - b.Order)
            .map((skill, i) => (
              <SkillCard key={skill.ID} skill={skill} index={i} />
            ))}
        </div>

        {/* Stats bar */}
        <div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{
            opacity: headerVisible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}
        >
          {[
            { value: '15+', label: 'Years in Industry' },
            { value: '40+', label: 'Projects Completed' },
            { value: '3', label: 'Continents Operated' },
            { value: '80k', label: 'T/Day Peak Production' },
          ].map(stat => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                className="text-3xl font-extrabold font-mono mb-1"
                style={{ color: 'var(--accent-secondary)' }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
