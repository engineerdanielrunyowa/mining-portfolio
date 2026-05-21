import { useState, useRef, useEffect } from 'react';
import { Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import type { Project } from '../types';

interface ProjectsSectionProps {
  projects: Project[];
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  const isLong = project.Description.length > 280;
  const displayText = !expanded && isLong
    ? project.Description.slice(0, 280) + '...'
    : project.Description;

  return (
    <div
      ref={ref}
      className="project-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      {/* Image */}
      {project.ImageURL && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={project.ImageURL}
            alt={project.Title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Category tag overlay */}
          {project.Category && (
            <div className="absolute top-3 left-3">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold font-mono"
                style={{
                  backgroundColor: 'rgba(14,22,33,0.85)',
                  color: 'var(--accent-secondary)',
                  border: '1px solid rgba(194,155,87,0.3)',
                }}
              >
                {project.Category}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          {!project.ImageURL && project.Category && (
            <span className="tag-badge">
              <Tag size={10} className="mr-1" />
              {project.Category}
            </span>
          )}
          <span
            className="flex items-center gap-1 text-xs font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            <Calendar size={11} />
            {project.StartDate} — {project.EndDate}
          </span>
        </div>

        <h3
          className="text-base font-bold mb-3 leading-snug"
          style={{ color: 'var(--text-main)' }}
        >
          {project.Title}
        </h3>

        <p
          className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: 'var(--text-muted)' }}
        >
          {displayText}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs font-semibold flex items-center gap-1 transition-colors duration-200"
            style={{ color: 'var(--accent-secondary)' }}
          >
            {expanded ? (
              <><ChevronUp size={12} /> Show less</>
            ) : (
              <><ChevronDown size={12} /> Read more</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [headerVisible, setHeaderVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHeaderVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const visible = projects.filter(p => p.Visible).sort((a, b) => a.Order - b.Order);
  const categories = ['All', ...Array.from(new Set(visible.map(p => p.Category).filter(Boolean)))];
  const filtered = activeCategory === 'All' ? visible : visible.filter(p => p.Category === activeCategory);

  if (visible.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="text-center mb-10"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="section-label">Portfolio</div>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4" style={{ color: 'var(--text-main)' }}>
            Featured{' '}
            <span style={{ color: 'var(--accent-secondary)' }}>Projects</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            A selection of significant engagements across open-pit, underground, and consulting disciplines.
          </p>
        </div>

        {/* Category tabs */}
        {categories.length > 2 && (
          <div className="category-tabs justify-center mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Projects grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard key={project.ID} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
