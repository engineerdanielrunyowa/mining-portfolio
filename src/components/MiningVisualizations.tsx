import React, { useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// ─── Three.js Mining Scene ────────────────────────────────────────────────────
function ThreeMiningScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let animId: number;
    let renderer: import('three').WebGLRenderer | null = null;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    import('three').then((THREE) => {
      if (!canvasRef.current || !mountedRef.current) return;

      const canvas = canvasRef.current;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      // Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0a1520, 50, 150);
      scene.background = new THREE.Color(0x0a1520);

      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 500);
      camera.position.set(0, 25, 55);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Lighting
      const ambient = new THREE.AmbientLight(0x1a2a3a, 0.8);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
      sun.position.set(30, 50, 20);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      scene.add(sun);

      const goldLight = new THREE.PointLight(0xc29b57, 1.5, 40);
      goldLight.position.set(0, 8, 0);
      scene.add(goldLight);

      // ── Open Pit Terrain ──────────────────────────────────────────────────
      const pitGroup = new THREE.Group();

      // Create terraced pit levels
      const terraceCount = 6;
      for (let t = 0; t < terraceCount; t++) {
        const radius = 22 - t * 3;
        const yPos = -t * 2.5;
        const segments = 64;

        // Terrace ring geometry
        const shape = new THREE.Shape();
        shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
        const hole = new THREE.Path();
        hole.absarc(0, 0, radius - 2.5, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        const extrudeSettings = { depth: 0.5, bevelEnabled: false };
        const terrace = new THREE.Mesh(
          new THREE.ExtrudeGeometry(shape, extrudeSettings),
          new THREE.MeshStandardMaterial({
            color: t % 2 === 0 ? 0x3d2b1a : 0x2d1f12,
            roughness: 0.95,
            metalness: 0.05,
          })
        );
        terrace.rotation.x = -Math.PI / 2;
        terrace.position.y = yPos;
        terrace.receiveShadow = true;
        pitGroup.add(terrace);

        // Haul road segments
        const roadGeo = new THREE.TorusGeometry(radius - 1.25, 0.3, 4, segments, Math.PI / 4);
        const road = new THREE.Mesh(
          roadGeo,
          new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9, metalness: 0.1 })
        );
        road.position.y = yPos + 0.3;
        road.rotation.x = Math.PI / 2;
        pitGroup.add(road);
      }

      // Pit floor
      const floorGeo = new THREE.CircleGeometry(7, 32);
      const floor = new THREE.Mesh(
        floorGeo,
        new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 1, metalness: 0 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -terraceCount * 2.5;
      floor.receiveShadow = true;
      pitGroup.add(floor);

      scene.add(pitGroup);

      // ── Mining Equipment ──────────────────────────────────────────────────
      // Haul truck (simplified box)
      const truckGroup = new THREE.Group();
      const truckBody = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 5),
        new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness: 0.6, metalness: 0.3 })
      );
      truckBody.position.y = 0.75;
      truckGroup.add(truckBody);

      // Truck cab
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.2, 2),
        new THREE.MeshStandardMaterial({ color: 0xe8931c, roughness: 0.5, metalness: 0.4 })
      );
      cab.position.set(0, 1.9, -1.2);
      truckGroup.add(cab);

      // Wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
      [[-1.6, 0.4, 1.5], [1.6, 0.4, 1.5], [-1.6, 0.4, -1.5], [1.6, 0.4, -1.5]].forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        truckGroup.add(wheel);
      });

      truckGroup.position.set(14, -1, 0);
      truckGroup.scale.setScalar(0.8);
      scene.add(truckGroup);

      // Excavator (simplified)
      const excavatorGroup = new THREE.Group();
      const excBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 1, 12),
        new THREE.MeshStandardMaterial({ color: 0xc8781a, roughness: 0.7, metalness: 0.2 })
      );
      excBase.position.y = 0.5;
      excavatorGroup.add(excBase);

      const excCabin = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0xd4861e, roughness: 0.6, metalness: 0.3 })
      );
      excCabin.position.y = 2;
      excavatorGroup.add(excCabin);

      // Boom arm
      const boom = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 4, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xb8701a, roughness: 0.7 })
      );
      boom.position.set(1.5, 3.5, 0);
      boom.rotation.z = -0.4;
      excavatorGroup.add(boom);

      excavatorGroup.position.set(-16, -1, -4);
      excavatorGroup.scale.setScalar(0.7);
      scene.add(excavatorGroup);

      // ── Ore stockpile ──
      const stockGeo = new THREE.ConeGeometry(4, 3, 8);
      const stock = new THREE.Mesh(
        stockGeo,
        new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.95, metalness: 0.05 })
      );
      stock.position.set(5, -13.5, -10);
      scene.add(stock);

      // ── Dust particles ──
      const particleCount = 200;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = Math.random() * 20 - 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
      const partGeo = new THREE.BufferGeometry();
      partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        partGeo,
        new THREE.PointsMaterial({ color: 0xc29b57, size: 0.15, transparent: true, opacity: 0.4 })
      );
      scene.add(particles);

      // Mouse interaction
      let mouseX = 0, mouseY = 0;
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      canvas.addEventListener('mousemove', handleMouseMove);

      const handleTouch = (e: TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 2;
      };
      canvas.addEventListener('touchmove', handleTouch, { passive: true });

      // Resize handler
      const handleResize = () => {
        if (!canvas || !renderer) return;
        const W2 = canvas.clientWidth;
        const H2 = canvas.clientHeight;
        camera.aspect = W2 / H2;
        camera.updateProjectionMatrix();
        renderer?.setSize(W2, H2);
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      let t2 = 0;
      const animate = () => {
        if (!mountedRef.current) return;
        animId = requestAnimationFrame(animate);
        t2 += 0.008;

        if (!prefersReduced) {
          // Rotate pit slightly
          pitGroup.rotation.y += 0.003;
          // Camera orbit from mouse
          camera.position.x += (mouseX * 15 - camera.position.x) * 0.03;
          camera.position.y += (-mouseY * 8 + 25 - camera.position.y) * 0.03;
          camera.lookAt(0, -5, 0);
          // Truck movement
          const angle = t2 * 0.5;
          truckGroup.position.x = Math.cos(angle) * 14;
          truckGroup.position.z = Math.sin(angle) * 14;
          truckGroup.rotation.y = -angle + Math.PI / 2;
          // Gold light pulse
          goldLight.intensity = 1.5 + Math.sin(t2 * 2) * 0.3;
          // Particle drift
          particles.rotation.y += 0.001;
        }

        renderer?.render(scene, camera);
      };

      animate();

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouch);
        window.removeEventListener('resize', handleResize);
      };
    });

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animId);
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="mining-canvas"
      className="w-full"
      style={{ height: '420px', display: 'block' }}
    />
  );
}

// ─── SVG Animated Process Flow ────────────────────────────────────────────────
function MiningProcessFlow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const id = setInterval(() => setStep(s => (s + 1) % 6), 1200);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { label: 'Drilling', x: 60, y: 80, icon: '⛏', color: '#1F2F40' },
    { label: 'Blasting', x: 200, y: 80, icon: '💥', color: '#2d3f56' },
    { label: 'Loading', x: 340, y: 80, icon: '🚛', color: '#3a4f65' },
    { label: 'Crushing', x: 60, y: 220, icon: '⚙', color: '#1F2F40' },
    { label: 'Processing', x: 200, y: 220, icon: '🏭', color: '#2d3f56' },
    { label: 'Export', x: 340, y: 220, icon: '📦', color: '#C29B57' },
  ];

  const arrows = [
    { x1: 100, y1: 100, x2: 160, y2: 100 },
    { x1: 240, y1: 100, x2: 300, y2: 100 },
    { x1: 370, y1: 120, x2: 370, y2: 160, curved: true },
    { x1: 100, y1: 240, x2: 160, y2: 240 },
    { x1: 240, y1: 240, x2: 300, y2: 240 },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 420 320"
        className="w-full max-w-full"
        style={{ minWidth: '280px', height: 'auto' }}
      >
        {/* Title */}
        <text x="210" y="30" textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
          MINING PROCESS FLOW
        </text>

        {/* Arrows */}
        {arrows.map((a, i) => (
          <line
            key={i}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="var(--border-color)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd="url(#arrow)"
            style={{ opacity: step >= i ? 1 : 0.3, transition: 'opacity 0.4s ease' }}
          />
        ))}

        {/* Vertical connector */}
        <line
          x1="60" y1="120" x2="60" y2="180"
          stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="4 3"
          markerEnd="url(#arrow)"
          style={{ opacity: step >= 3 ? 1 : 0.3, transition: 'opacity 0.4s ease' }}
        />

        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--border-color)" />
          </marker>
        </defs>

        {/* Nodes */}
        {steps.map((s, i) => (
          <g key={s.label} className="process-node">
            {/* Background circle */}
            <circle
              cx={s.x + 40} cy={s.y + 20} r="38"
              fill={i === step ? 'rgba(194,155,87,0.12)' : 'var(--bg-secondary)'}
              stroke={i === step ? '#C29B57' : 'var(--border-color)'}
              strokeWidth={i === step ? 2 : 1}
              style={{ transition: 'all 0.4s ease' }}
            />
            {/* Label */}
            <text
              x={s.x + 40} y={s.y + 68}
              textAnchor="middle"
              style={{
                fill: i === step ? '#C29B57' : 'var(--text-muted)',
                fontSize: '9px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: i === step ? '700' : '400',
                transition: 'fill 0.4s ease',
              }}
            >
              {s.label.toUpperCase()}
            </text>
            {/* Step number */}
            <text
              x={s.x + 40} y={s.y + 25}
              textAnchor="middle"
              style={{
                fill: i === step ? '#C29B57' : 'var(--text-muted)',
                fontSize: '18px',
                transition: 'fill 0.4s ease',
              }}
            >
              {['01', '02', '03', '04', '05', '06'][i]}
            </text>
          </g>
        ))}

        {/* Step label at bottom */}
        <text
          x="210" y="300"
          textAnchor="middle"
          style={{ fill: '#C29B57', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
        >
          {steps[step]?.label} Phase Active
        </text>
      </svg>
    </div>
  );
}

// ─── Chart.js KPI Charts ──────────────────────────────────────────────────────
function MiningCharts() {
  const productionRef = useRef<HTMLCanvasElement>(null);
  const gradeRef = useRef<HTMLCanvasElement>(null);
  const safetyRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<import('chart.js').Chart[]>([]);

  useEffect(() => {
    import('chart.js').then(({ Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale }) => {
      Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale);

      const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#6B7280';
      const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#D1D5DB';

      const defaults: Partial<import('chart.js').ChartOptions> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: textColor, font: { family: 'JetBrains Mono', size: 10 }, padding: 12 },
          },
        },
        scales: {
          x: { ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 9 } }, grid: { color: borderColor } },
          y: { ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 9 } }, grid: { color: borderColor } },
        },
      } as Partial<import('chart.js').ChartOptions>;

      // Production chart
      if (productionRef.current) {
        chartsRef.current.push(new Chart(productionRef.current, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
              label: 'Ore Mined (kt)',
              data: [68, 72, 65, 78, 82, 79, 85, 88, 76, 83, 80, 90],
              backgroundColor: 'rgba(194,155,87,0.7)',
              borderColor: '#C29B57',
              borderWidth: 1,
              borderRadius: 4,
            }, {
              label: 'Waste (kt)',
              data: [110, 118, 105, 130, 135, 128, 140, 142, 125, 138, 132, 148],
              backgroundColor: 'rgba(31,47,64,0.6)',
              borderColor: '#1F2F40',
              borderWidth: 1,
              borderRadius: 4,
            }],
          },
          options: { ...defaults as import('chart.js').ChartOptions<'bar'>, plugins: { ...defaults.plugins, title: { display: true, text: 'Annual Production (kt)', color: textColor, font: { family: 'Inter', size: 12, weight: 'bold' } } } },
        }));
      }

      // Grade trend chart
      if (gradeRef.current) {
        chartsRef.current.push(new Chart(gradeRef.current, {
          type: 'line',
          data: {
            labels: ['Q1 \'21', 'Q2 \'21', 'Q3 \'21', 'Q4 \'21', 'Q1 \'22', 'Q2 \'22', 'Q3 \'22', 'Q4 \'22'],
            datasets: [{
              label: 'Ore Grade (g/t Au)',
              data: [1.82, 1.75, 1.91, 2.05, 1.88, 2.12, 2.24, 2.08],
              borderColor: '#C29B57',
              backgroundColor: 'rgba(194,155,87,0.1)',
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: '#C29B57',
              tension: 0.4,
              fill: true,
            }, {
              label: 'Cut-off Grade (g/t)',
              data: [1.5, 1.5, 1.5, 1.5, 1.6, 1.6, 1.6, 1.6],
              borderColor: 'rgba(255,80,80,0.7)',
              borderWidth: 1.5,
              borderDash: [6, 4],
              pointRadius: 0,
              tension: 0,
            }],
          },
          options: { ...defaults as import('chart.js').ChartOptions<'line'>, plugins: { ...defaults.plugins, title: { display: true, text: 'Ore Grade Trend (g/t Au)', color: textColor, font: { family: 'Inter', size: 12, weight: 'bold' } } } },
        }));
      }

      // Safety metrics radar
      if (safetyRef.current) {
        chartsRef.current.push(new Chart(safetyRef.current, {
          type: 'radar',
          data: {
            labels: ['TRIFR', 'Near Miss Reporting', 'Inspection Rate', 'Training Compliance', 'Hazard ID', 'Blast Safety'],
            datasets: [{
              label: 'Current Period',
              data: [92, 88, 95, 97, 85, 99],
              borderColor: '#C29B57',
              backgroundColor: 'rgba(194,155,87,0.15)',
              borderWidth: 2,
              pointBackgroundColor: '#C29B57',
            }, {
              label: 'Industry Benchmark',
              data: [75, 72, 80, 85, 70, 90],
              borderColor: 'rgba(31,47,64,0.6)',
              backgroundColor: 'rgba(31,47,64,0.08)',
              borderWidth: 1.5,
              borderDash: [4, 3],
              pointBackgroundColor: '#1F2F40',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: textColor, font: { family: 'JetBrains Mono', size: 10 }, padding: 12 } },
              title: { display: true, text: 'Safety KPI Performance (%)', color: textColor, font: { family: 'Inter', size: 12, weight: 'bold' } },
            },
            scales: {
              r: {
                ticks: { color: textColor, font: { size: 8 }, backdropColor: 'transparent' },
                grid: { color: borderColor },
                angleLines: { color: borderColor },
                pointLabels: { color: textColor, font: { family: 'JetBrains Mono', size: 9 } },
                min: 0, max: 100,
              },
            } as Record<string, unknown>,
          } as import('chart.js').ChartOptions<'radar'>,
        }));
      }
    });

    return () => {
      chartsRef.current.forEach(c => c.destroy());
      chartsRef.current = [];
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="chart-container" style={{ height: '280px' }}>
        <canvas ref={productionRef} />
      </div>
      <div className="chart-container" style={{ height: '280px' }}>
        <canvas ref={gradeRef} />
      </div>
      <div className="chart-container" style={{ height: '280px' }}>
        <canvas ref={safetyRef} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MiningVisualizations() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });
  const [activeTab, setActiveTab] = useState<'3d' | 'process' | 'charts'>('3d');

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="visualisations"
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="text-center mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="section-label">Technical Showcase</div>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4" style={{ color: 'var(--text-main)' }}>
            Mining{' '}
            <span style={{ color: 'var(--accent-secondary)' }}>Visualisations</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            Interactive 3D environments, animated process flows, and live KPI dashboards — demonstrating technical depth and data literacy.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex justify-center mb-8">
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {([
              { id: '3d', label: '3D Open Pit Scene' },
              { id: 'process', label: 'Process Flow' },
              { id: 'charts', label: 'KPI Analytics' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--accent-secondary)' : 'transparent',
                  color: activeTab === tab.id ? '#0E1621' : 'var(--text-muted)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}
        >
          {activeTab === '3d' && (
            <div>
              <div
                className="px-4 py-3 flex items-center gap-2 border-b"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="font-mono text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  open-pit-scene.three.js — Interactive: move mouse / drag to orbit
                </span>
              </div>
              {isVisible && <ThreeMiningScene />}
            </div>
          )}

          {activeTab === 'process' && (
            <div className="p-6 lg:p-10">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                  Drill-to-Export Process Pipeline
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Animated sequence highlighting active phase in the mining cycle
                </p>
              </div>
              <MiningProcessFlow />
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Drilling Accuracy', value: '±150mm', desc: 'GPS-guided positioning' },
                  { label: 'Blast Vibration', value: '<5 mm/s', desc: 'PPV at nearest receiver' },
                  { label: 'Fragmentation P80', value: '380mm', desc: 'Crusher feed target' },
                  { label: 'Load Factor', value: '0.42 kg/t', desc: 'Powder factor achieved' },
                  { label: 'Cycle Time', value: '22 min', desc: 'Drill-blast-load-haul' },
                  { label: 'Recovery Rate', value: '94.2%', desc: 'Mill metallurgical recovery' },
                ].map(kpi => (
                  <div
                    key={kpi.label}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="text-xl font-mono font-bold" style={{ color: 'var(--accent-secondary)' }}>{kpi.value}</div>
                    <div className="text-xs font-semibold mt-1" style={{ color: 'var(--text-main)' }}>{kpi.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{kpi.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                  Operational KPI Dashboard
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Illustrative metrics — representative of achieved results across anonymised operations
                </p>
              </div>
              {isVisible && <MiningCharts />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
