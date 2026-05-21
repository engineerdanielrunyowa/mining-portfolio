import { useEffect, useRef } from 'react';

export default function MorphTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    let progress = 0;

    const handleScroll = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;
      const start = rect.top - windowH;
      const end = rect.bottom;
      const total = end - start;
      progress = Math.max(0, Math.min(1, (windowH - rect.top) / total));
      updateAnimation(progress);
    };

    const updateAnimation = (p: number) => {
      const svg = svgRef.current;
      if (!svg) return;

      // Animate drill bit morphing
      const drillEl = svg.querySelector('#drill-bit') as SVGPathElement;
      const spreadEl = svg.querySelectorAll('.particle');

      if (drillEl) {
        drillEl.style.opacity = String(Math.max(0, 1 - p * 3));
        drillEl.style.transform = `scale(${1 + p}) translateY(${p * 20}px)`;
      }

      spreadEl.forEach((el, i) => {
        const htmlEl = el as SVGElement;
        const angle = (i / spreadEl.length) * Math.PI * 2;
        const dist = p * (40 + i * 8);
        htmlEl.style.opacity = String(Math.min(1, p * 2));
        htmlEl.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(${p})`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        height: '200px',
        background: 'linear-gradient(180deg, var(--bg-main) 0%, var(--bg-secondary) 100%)',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          ref={svgRef}
          width="300"
          height="160"
          viewBox="0 0 300 160"
          className="overflow-visible"
        >
          {/* Drill bit — morphs outward */}
          <path
            id="drill-bit"
            d="M150 20 L158 60 L150 80 L142 60 Z"
            fill="none"
            stroke="#C29B57"
            strokeWidth="2"
            style={{ transition: 'none', transformOrigin: '150px 50px' }}
          />
          <path
            d="M144 70 L156 70 L160 80 L155 90 L150 100 L145 90 L140 80 Z"
            fill="none"
            stroke="#C29B57"
            strokeWidth="1.5"
            id="drill-bit"
            style={{ transformOrigin: '150px 80px' }}
          />

          {/* Particles that spread out as user scrolls */}
          {[...Array(12)].map((_, i) => (
            <circle
              key={i}
              className="particle"
              cx="150"
              cy="80"
              r={2 + (i % 3)}
              fill={i % 3 === 0 ? '#C29B57' : i % 3 === 1 ? '#1F2F40' : '#E6E9EF'}
              style={{ opacity: 0, transition: 'none', transformOrigin: '150px 80px' }}
            />
          ))}

          {/* Central glow */}
          <circle cx="150" cy="80" r="4" fill="#C29B57" opacity="0.6">
            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Conveyor line */}
          <line
            x1="20" y1="110" x2="280" y2="110"
            stroke="rgba(194,155,87,0.3)"
            strokeWidth="1"
            strokeDasharray="8 6"
          >
            <animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite" />
          </line>

          {/* Label */}
          <text
            x="150" y="145"
            textAnchor="middle"
            style={{
              fill: 'var(--text-muted)',
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '3px',
            }}
          >
            SCROLL TO EXPLORE
          </text>
        </svg>
      </div>

      {/* Fading edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--bg-secondary))',
        }}
      />
    </div>
  );
}
