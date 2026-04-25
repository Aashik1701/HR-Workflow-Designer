import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Play, GitBranch, Zap, ShieldCheck, Sparkles,
  CheckCircle2, Clock, FileText, Users, AlertTriangle, Eye,
  Code2, Activity, ChevronRight, ExternalLink,
  Network
} from 'lucide-react';

// ─── Scroll Reveal Hook ────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Animated Workflow Nodes (Hero Visual) ─────────────────────────────────
function AnimatedCanvas() {
  const nodes = [
    { id: 'start', x: 60, y: 80, label: 'Start', color: '#10b981', icon: '▶' },
    { id: 'task1', x: 200, y: 40, label: 'Collect Docs', color: '#3b82f6', icon: '□' },
    { id: 'task2', x: 200, y: 130, label: 'Send Email', color: '#3b82f6', icon: '⚡' },
    { id: 'approval', x: 340, y: 80, label: 'HR Approval', color: '#f59e0b', icon: '✓' },
    { id: 'end', x: 480, y: 80, label: 'Complete', color: '#f43f5e', icon: '⚑' },
  ];
  const edges = [
    { from: [60, 80], to: [200, 40] },
    { from: [60, 80], to: [200, 130] },
    { from: [200, 40], to: [340, 80] },
    { from: [200, 130], to: [340, 80] },
    { from: [340, 80], to: [480, 80] },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
      <svg width="560" height="200" viewBox="0 0 560 200" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(59,130,246,0.6)" />
          </marker>
        </defs>
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.from[0] + 36} y1={e.from[1] + 14}
            x2={e.to[0]} y2={e.to[1] + 14}
            stroke="rgba(59,130,246,0.4)" strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd="url(#arrow)"
            style={{ animation: `dashDraw 1.5s ${i * 0.2}s ease-out both` }}
          />
        ))}
      </svg>
      {nodes.map((n, i) => (
        <div
          key={n.id}
          style={{
            position: 'absolute',
            left: n.x,
            top: n.y,
            width: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${n.color}40`,
            borderRadius: 10,
            padding: '6px 10px',
            animation: `nodeFloat 0.6s ${i * 0.1}s cubic-bezier(0.34,1.56,0.64,1) both`,
            boxShadow: `0 0 12px ${n.color}20`,
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 5,
            background: n.color + '30', color: n.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, flexShrink: 0
          }}>
            {n.icon}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>{n.label}</p>
            <div style={{ width: 28, height: 2, background: n.color + '60', borderRadius: 2, marginTop: 2 }} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes nodeFloat {
          from { opacity: 0; transform: translateY(16px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dashDraw {
          from { stroke-dashoffset: 60; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes drift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-8px) rotate(1deg); }
          66%       { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes connLine {
          from { stroke-dashoffset: 200; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Section Wrapper ───────────────────────────────────────────────────────
function Section({
  children,
  style,
  delay = 0,
  duration = 760,
  distance = 28,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  distance?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : `translateY(${distance}px) scale(0.985)`,
      transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      willChange: 'opacity, transform',
      ...style
    }}>
      {children}
    </div>
  );
}

// ─── Tag ───────────────────────────────────────────────────────────────────
function Tag({ children, color = '#93c5fd' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
      color, background: color + '15', border: `1px solid ${color}30`,
      padding: '4px 12px', borderRadius: 20
    }}>
      {children}
    </span>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 4), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const mobileViewport = window.innerWidth < 900;
    const disableParallax = reducedMotion || coarsePointer || mobileViewport;

    root.style.setProperty('--mx', '0');
    root.style.setProperty('--my', '0');

    if (disableParallax) return;

    let rafId: number | null = null;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const animate = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      root.style.setProperty('--mx', cx.toFixed(4));
      root.style.setProperty('--my', cy.toFixed(4));
      rafId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      tx = nx * 2;
      ty = ny * 2;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onLeave);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // ── Colors ────────────────────────────────────────────────────────────────
  const BG     = '#07070e';
  const CARD   = 'rgba(255,255,255,0.03)';
  const BORDER = 'rgba(255,255,255,0.07)';
  const BLUE = '#2563eb';
  const CYAN   = '#06b6d4';
  const TEAL = '#14b8a6';

  const grad = `linear-gradient(135deg, ${CYAN}, ${BLUE}, ${TEAL})`;
  const sectionX = 'max(20px, min(32px, calc((100vw - 1200px) / 2)))';

  // ── Shared styles ─────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: CARD, border: `1px solid ${BORDER}`,
    borderRadius: 18, padding: 'clamp(18px, 2vw, 24px)',
    transition: 'border-color 0.3s, background 0.3s, transform 0.2s',
  };

  return (
    <div ref={rootRef} className="cinematic-root" style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: BG, color: '#fff',
      minHeight: '100vh', overflowX: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(37,99,235,0.4); }
        .cinematic-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.38) 100%);
          z-index: 0;
        }
        .hover-lift {
          transition: transform 0.28s ease, border-color 0.28s ease, background 0.28s ease, box-shadow 0.28s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px) scale(1.008) !important;
          border-color: rgba(37,99,235,0.45) !important;
          background: rgba(255,255,255,0.055) !important;
          box-shadow: 0 20px 48px rgba(0,0,0,0.28), 0 0 0 1px rgba(37,99,235,0.12) inset;
        }
        .hover-glow:hover { box-shadow: 0 0 30px rgba(37,99,235,0.45); }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 12px; border: none; cursor: pointer;
          font-size: 15px; font-weight: 700; letter-spacing: -0.01em;
          background: linear-gradient(120deg, #2563eb 0%, #0ea5e9 35%, #0ea5e9 68%, #2563eb 100%);
          background-size: 220% 220%;
          color: #fff; transition: all 0.25s ease;
          box-shadow: 0 4px 24px rgba(37,99,235,0.4);
        }
        .cta-primary:hover {
          transform: translateY(-2px);
          background-position: 100% 50%;
          box-shadow: 0 10px 34px rgba(37,99,235,0.52), 0 0 0 1px rgba(255,255,255,0.08) inset;
        }
        .cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 12px; cursor: pointer;
          font-size: 15px; font-weight: 600;
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.12); transition: all 0.25s ease;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.24);
          transform: translateY(-1px);
        }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 0.3s; }
        .nav-link {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
          cursor: pointer;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -6px;
          height: 2px;
          width: 100%;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.24s ease;
          background: linear-gradient(90deg, rgba(14,165,233,0.9), rgba(37,99,235,0.9));
          border-radius: 999px;
        }
        .nav-link:hover { color: #fff; }
        .nav-link:hover::after { transform: scaleX(1); }
        .tech-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.7); transition: all 0.25s ease;
        }
        .tech-pill:hover {
          border-color: rgba(37,99,235,0.45);
          color: #fff;
          background: rgba(37,99,235,0.1);
          transform: translateY(-2px);
        }
        .premium-gradient-text {
          background-size: 200% 200% !important;
          animation: auroraShift 9s ease-in-out infinite;
        }
        .hero-canvas-wrap {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
          transform-origin: center top;
        }
        .hero-canvas-wrap:hover {
          transform: perspective(1200px) rotateX(1.6deg) translateY(-4px);
          box-shadow: 0 46px 120px rgba(0,0,0,0.72), 0 0 0 1px rgba(37,99,235,0.16) inset;
        }
        .micro-stat {
          transition: transform 0.24s ease, filter 0.24s ease;
        }
        .micro-stat:hover {
          transform: translateY(-2px) scale(1.03);
          filter: brightness(1.08);
        }
        .cinematic-cta {
          box-shadow: 0 36px 90px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(255,255,255,0.02);
        }
        .parallax-layer {
          transition: transform 0.16s ease-out;
          will-change: transform;
        }
        .bg-aurora-spin {
          animation: spinSlow 32s linear infinite;
        }
        .bg-drift-slow {
          animation: drift 12s ease-in-out infinite;
        }
        .bg-drift-mid {
          animation: drift 16s 2s ease-in-out infinite;
        }
        .bg-drift-fast {
          animation: drift 14s 4s ease-in-out infinite;
        }
        .bg-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at center, black 42%, transparent 100%);
        }
        .bg-noise {
          background-image:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0, transparent 28%),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.03) 0, transparent 24%),
            radial-gradient(circle at 50% 80%, rgba(255,255,255,0.025) 0, transparent 20%);
          mix-blend-mode: screen;
          opacity: 0.65;
        }
        .section-shell {
          width: min(100%, 1280px);
          margin: 0 auto;
        }
        @keyframes auroraShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .hero-grid {
            gap: 28px !important;
          }
          .nav-links {
            display: none !important;
          }
          .stack-on-mobile {
            grid-template-columns: 1fr !important;
          }
          .two-col-mobile {
            grid-template-columns: 1fr !important;
          }
          .hero-title {
            font-size: clamp(36px, 11vw, 62px) !important;
          }
          .bg-grid { opacity: 0.22 !important; }
          .bg-noise { opacity: 0.45 !important; }
        }
        @media (max-width: 640px) {
          .hero-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .hero-actions > button {
            width: 100%;
            justify-content: center;
          }
          .metric-row {
            gap: 16px !important;
            flex-wrap: wrap !important;
          }
          .hero-canvas-wrap {
            margin-top: 40px !important;
          }
          .micro-stat:hover {
            transform: none;
            filter: none;
          }
        }
        @media (pointer: coarse), (prefers-reduced-motion: reduce) {
          .parallax-layer {
            transform: none !important;
            animation: none !important;
          }
          .premium-gradient-text {
            animation-duration: 16s;
          }
          .hover-lift:hover,
          .hero-canvas-wrap:hover,
          .cta-primary:hover,
          .cta-secondary:hover,
          .tech-pill:hover {
            transform: none !important;
          }
        }
      `}</style>

      {/* ── AMBIENT BACKGROUND ───────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.18) 0, transparent 28%), radial-gradient(circle at 80% 18%, rgba(6,182,212,0.12) 0, transparent 24%), radial-gradient(circle at 50% 78%, rgba(20,184,166,0.12) 0, transparent 25%), linear-gradient(180deg, rgba(7,7,14,0.92) 0%, rgba(7,7,14,0.98) 100%)' }} />
        <div className="parallax-layer bg-aurora-spin" style={{ position: 'absolute', top: '-38%', left: '24%', width: 'min(76vw, 980px)', height: 'min(76vw, 980px)', borderRadius: '50%', background: 'conic-gradient(from 120deg, rgba(34,211,238,0.12), rgba(37,99,235,0.18), rgba(20,184,166,0.14), rgba(34,211,238,0.12))', filter: 'blur(24px)', opacity: 0.45, transform: 'translate3d(calc(var(--mx, 0) * 18px), calc(var(--my, 0) * 18px), 0)' }} />
        <div className="bg-grid" style={{ position: 'absolute', inset: '-2%', opacity: 0.35 }} />
        <div className="bg-noise" style={{ position: 'absolute', inset: 0 }} />
        <div className="parallax-layer bg-drift-slow" style={{ position: 'absolute', top: '-12%', left: '-8%', width: 'clamp(360px, 42vw, 720px)', height: 'clamp(360px, 42vw, 720px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 68%)', filter: 'blur(18px)', transform: 'translate3d(calc(var(--mx, 0) * 26px), calc(var(--my, 0) * 20px), 0)' }} />
        <div className="parallax-layer bg-drift-mid" style={{ position: 'absolute', top: '14%', right: '-12%', width: 'clamp(280px, 34vw, 560px)', height: 'clamp(280px, 34vw, 560px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.11) 0%, transparent 66%)', filter: 'blur(14px)', transform: 'translate3d(calc(var(--mx, 0) * -20px), calc(var(--my, 0) * -16px), 0)' }} />
        <div className="parallax-layer bg-drift-fast" style={{ position: 'absolute', bottom: '-8%', left: '24%', width: 'clamp(300px, 32vw, 520px)', height: 'clamp(300px, 32vw, 520px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.11) 0%, transparent 68%)', filter: 'blur(16px)', transform: 'translate3d(calc(var(--mx, 0) * 14px), calc(var(--my, 0) * -14px), 0)' }} />
      </div>

      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,7,14,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        padding: `0 ${sectionX}`,
        display: 'flex', alignItems: 'center', height: 60,
        animation: 'fadeIn 0.6s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>
            <GitBranch size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>HR Flow</span>
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: 28, margin: '0 auto' }}>
          {['Features', 'How it works', 'Use Cases', 'Tech'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} className="nav-link" onClick={(e) => {
              e.preventDefault();
              document.getElementById(l.toLowerCase().replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' });
            }}>{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="cta-secondary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="cta-primary hover-glow" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => navigate('/workflows')}>
            Start Building
          </button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══════════════════════════════════════════════════════════════
            §1  HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: `clamp(72px, 8vw, 112px) ${sectionX} clamp(56px, 7vw, 88px)`, minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          <div className="section-shell" style={{ textAlign: 'center', animation: 'slideUp 0.8s ease both' }}>
            <Tag color={CYAN}><Sparkles size={11} /> AI-Powered Orchestration</Tag>

            <h1 className="hero-title" style={{
              fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 800,
              lineHeight: 1.04, letterSpacing: '-0.03em',
              margin: '28px auto 0', maxWidth: 980,
            }}>
              Automate & Simulate<br />
              <span className="premium-gradient-text" style={{
                backgroundImage: `linear-gradient(135deg, ${CYAN} 0%, #93c5fd 50%, ${TEAL} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Intelligent Workflows
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 1.4vw, 19px)', color: 'rgba(255,255,255,0.55)', maxWidth: 720,
              margin: '24px auto 0', lineHeight: 1.7, fontWeight: 300,
            }}>
              The first AI-powered HR orchestrator. Use the <b>Copilot</b> to auto-wire pipelines, map variables visually, and trace real-time execution with the <b>Visual Debugger</b>.
            </p>

            <div className="hero-actions" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
              <button className="cta-primary hover-glow" style={{ fontSize: 15 }} onClick={() => navigate('/workflows')}>
                Start Building <ArrowRight size={16} />
              </button>
              <button className="cta-secondary" style={{ fontSize: 15 }} onClick={() => navigate('/dashboard')}>
                <Play size={14} /> View Demo
              </button>
            </div>

            <div className="metric-row" style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 36 }}>
              {[
                { val: '12+', label: 'Workflow Templates' },
                { val: '8', label: 'Automation Actions' },
                { val: '< 5m', label: 'Time to First Flow' },
              ].map(({ val, label }) => (
                <div key={label} className="micro-stat" style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, margin: 0, backgroundImage: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{val}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0', fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Mock Canvas */}
          <div style={{
            marginTop: 'clamp(40px, 5vw, 64px)', position: 'relative',
            animation: 'slideUp 0.9s 0.2s ease both',
          }}>
            <div className="hero-canvas-wrap" style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
              transform: 'translateZ(0)',
            }}>
              {/* Window chrome */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: BORDER, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#f43f5e','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>HR Flow — Employee Onboarding Workflow</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Validate','Export','Simulate'].map(btn => (
                    <span key={btn} style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', borderRadius: 5, padding: '3px 8px', border: `1px solid ${BORDER}` }}>
                      {btn}
                    </span>
                  ))}
                </div>
              </div>
              {/* Canvas area */}
              <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '140px minmax(0, 1fr) 160px', minHeight: 260 }}>
                {/* Sidebar */}
                <div style={{ borderRight: `1px solid ${BORDER}`, padding: '12px 8px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', padding: '0 8px 8px' }}>NODE PALETTE</p>
                  {[
                    { label: 'Start', color: '#10b981', icon: <Play size={10} /> },
                    { label: 'Task', color: '#3b82f6', icon: <FileText size={10} /> },
                    { label: 'Approval', color: '#f59e0b', icon: <CheckCircle2 size={10} /> },
                    { label: 'Auto Step', color: '#3b82f6', icon: <Zap size={10} /> },
                    { label: 'End', color: '#f43f5e', icon: <ShieldCheck size={10} /> },
                  ].map((n, i) => (
                    <div key={n.label} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 8, marginBottom: 2,
                      background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
                      animation: `slideUp 0.4s ${0.1 + i * 0.06}s ease both`,
                      cursor: 'grab',
                    }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: n.color + '25', color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {n.icon}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{n.label}</span>
                    </div>
                  ))}
                </div>
                {/* Main canvas */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: `radial-gradient(circle at 30% 50%, rgba(37,99,235,0.04) 0%, transparent 60%)` }}>
                  {/* Dot grid */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.06)" /></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                  </svg>
                  <AnimatedCanvas />
                </div>
                {/* Properties panel */}
                <div style={{ borderLeft: `1px solid ${BORDER}`, padding: 12 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 12 }}>PROPERTIES</p>
                  {[
                    { label: 'Title', val: 'Collect Docs' },
                    { label: 'Assignee', val: 'hr-team@...' },
                    { label: 'Due Date', val: '2024-01-15' },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', margin: '0 0 3px', fontWeight: 600 }}>{f.label}</p>
                      <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 5, padding: '4px 8px' }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{f.val}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 6, padding: '8px 10px' }}>
                    <p style={{ fontSize: 9, color: '#93c5fd', margin: 0, fontWeight: 600 }}>✓ Validation Passed</p>
                    <p style={{ fontSize: 9, color: 'rgba(167,139,250,0.6)', margin: '2px 0 0' }}>3 nodes connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §2  PROBLEM STATEMENT
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: `clamp(64px, 7vw, 88px) ${sectionX}` }}>
          <Section delay={40} duration={760} distance={30}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Tag color="#f43f5e"><AlertTriangle size={11} /> The Problem</Tag>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '20px 0 12px' }}>
                HR Workflows Are Broken
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 520, margin: '0 auto', fontWeight: 300 }}>
                Teams spend hours chasing approvals, tracking status across spreadsheets, and fixing errors discovered too late.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, maxWidth: 1200, margin: '0 auto' }}>
              {[
                { icon: <Clock size={20} />, color: '#f43f5e', title: 'Manual & Slow', desc: 'Onboarding processes take 2–3 weeks when 80% can be automated in hours.' },
                { icon: <Eye size={20} />, color: '#f59e0b', title: 'Zero Visibility', desc: 'Nobody knows where a request is stuck until someone follows up manually.' },
                { icon: <AlertTriangle size={20} />, color: '#3b82f6', title: 'Error-Prone', desc: 'Steps get missed, deadlines are blown, and compliance risks accumulate silently.' },
                { icon: <Users size={20} />, color: '#06b6d4', title: 'Siloed Teams', desc: 'HR, IT, Finance and Management each have disconnected processes with no shared logic.' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="hover-lift"
                  style={{ ...card, animationDelay: `${i * 0.1}s` }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: item.color + '15', color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §3  SOLUTION
        ═══════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" style={{ padding: `clamp(64px, 7vw, 88px) ${sectionX}`, background: 'rgba(37,99,235,0.04)', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <Section delay={70} duration={800} distance={34}>
            <div className="two-col-mobile" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'center' }}>
              <div>
                <Tag color={BLUE}><Sparkles size={11} /> The Solution</Tag>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '20px 0 20px', lineHeight: 1.1 }}>
                  Build Workflows Like Drawing a Diagram
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontWeight: 300, marginBottom: 28 }}>
                  HR Flow gives your team a visual canvas to model, validate, and simulate any HR process — from onboarding checklists to multi-stage leave approvals — without writing a single line of code.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    'Drag-and-drop any node type onto the canvas',
                    'Connect steps with smart edge routing',
                    'Configure each node with rich property forms',
                    'Simulate the full flow before going live',
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
                  <button className="cta-primary hover-glow" onClick={() => navigate('/workflows')}>
                    Open Designer <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Mini canvas mock */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
                borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${BORDER}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['#f43f5e','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>Leave Approval Flow</span>
                </div>
                <div style={{ padding: 20 }}>
                  {[
                    { label: 'Employee submits request', color: '#10b981', step: 1 },
                    { label: 'Manager reviews & approves', color: '#f59e0b', step: 2 },
                    { label: 'HR logs the decision', color: '#3b82f6', step: 3 },
                    { label: 'System notifies payroll', color: '#3b82f6', step: 4 },
                    { label: 'Flow complete ✓', color: '#f43f5e', step: 5 },
                  ].map((s, i) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: s.color + '20', border: `1px solid ${s.color}40`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                          {s.step}
                        </div>
                        {i < 4 && <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.08)' }} />}
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 8, padding: '7px 12px' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §4  CORE FEATURES
        ═══════════════════════════════════════════════════════════════ */}
        <section id="features" style={{ padding: `clamp(72px, 8vw, 96px) ${sectionX}` }}>
          <Section delay={90} duration={820} distance={34}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <Tag color={CYAN}><Zap size={11} /> Core Features</Tag>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '20px 0 12px' }}>
                Everything You Need to Ship
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', fontWeight: 300 }}>
                A complete toolkit for HR process engineers — from visual design to live simulation.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 1240, margin: '0 auto' }}>
              {[
                {
                  icon: <Sparkles size={22} />, color: '#14b8a6', title: 'AI Workflow Copilot',
                  desc: 'Describe your intent in plain English. The AI auto-wires the nodes, handles the layout, and scaffolds the entire logic path instantly.',
                  tags: ['Natural Language', 'Auto-Wiring', 'Gemini-powered'],
                },
                {
                  icon: <Users size={22} />, color: '#8b5cf6', title: 'Real-Time Multiplayer',
                  desc: 'Figma-style collaboration. See live cursors, track presence, and lock nodes instantly as your team co-edits workflows together.',
                  tags: ['Supabase Realtime', 'Live Cursors', 'Node Locking'],
                },
                {
                  icon: <Activity size={22} />, color: '#10b981', title: 'Real-Time Playback',
                  desc: 'Visual debugger for pipelines. Watch nodes pulse Green for success and Red for failure as the simulation flows across the canvas.',
                  tags: ['Visual Debugger', 'Traceability', 'Interactive'],
                },
                {
                  icon: <Network size={22} />, color: '#06b6d4', title: 'Data Mapping Engine',
                  desc: 'True logic orchestration with variable interpolation. Pass payloads like {{ employee.email }} seamlessly between automation steps.',
                  tags: ['Variables', 'Dynamic Data', 'Payloads'],
                },
                {
                  icon: <GitBranch size={22} />, color: '#f59e0b', title: 'A/B Split Testing',
                  desc: 'Split flow logic for HR experiments. Route traffic 50/50 between different paths to test channel effectiveness and response times.',
                  tags: ['A/B Testing', 'Branching', 'Routing'],
                },
                {
                  icon: <Clock size={22} />, color: '#3b82f6', title: 'Wait & Delay Nodes',
                  desc: 'Handle time-sensitive HR operations. Pause execution for minutes, hours, or days to trigger follow-ups and reminders.',
                  tags: ['Scheduling', 'Pause/Resume', 'Time Logic'],
                },
                {
                  icon: <ShieldCheck size={22} />, color: '#f43f5e', title: 'Graph Validation',
                  desc: 'Acyclic check, connectivity warnings, and connectivity validation. Ensure logic integrity before pushing to live production.',
                  tags: ['DFS Algorithm', 'Structural Integrity', 'CI/CD'],
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="hover-lift"
                  style={{ ...card, position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: f.color + '08', borderRadius: '0 16px 0 80px' }} />
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color + '18', color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 16px', lineHeight: 1.65 }}>{f.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {f.tags.map(t => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 600, color: f.color, background: f.color + '12', border: `1px solid ${f.color}25`, borderRadius: 6, padding: '3px 8px', fontFamily: 'DM Mono, monospace' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §5  HOW IT WORKS
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: `clamp(64px, 7vw, 88px) ${sectionX}`, background: 'rgba(6,182,212,0.03)', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <Section delay={110} duration={840} distance={36}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <Tag color={CYAN}><ChevronRight size={11} /> How It Works</Tag>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '20px 0' }}>
                From Blank Canvas to Live Workflow in Minutes
              </h2>
            </div>

            <div className="two-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', top: 32, left: '12.5%', right: '12.5%', height: 1, background: `linear-gradient(90deg, transparent, ${BLUE}40, ${CYAN}40, ${TEAL}40, transparent)` }} />

              {[
                { step: '01', title: 'Add Nodes', desc: 'Drag Start, Task, Approval, Automated Step, and End nodes from the sidebar onto the canvas.', color: '#3b82f6' },
                { step: '02', title: 'Connect Logic', desc: 'Draw edges between nodes to define the execution path. The graph engine tracks all connections.', color: CYAN },
                { step: '03', title: 'Configure Each Step', desc: 'Click any node to open its property form. Set assignees, due dates, approver roles, and automation params.', color: '#10b981' },
                { step: '04', title: 'Simulate & Deploy', desc: 'Run the sandbox simulator to preview execution. Validate structure, fix errors, then promote to Active.', color: TEAL },
              ].map((s, i) => (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(i)}
                  style={{
                    padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: activeStep === i ? `${s.color}08` : 'transparent',
                    borderRadius: 16,
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                    background: activeStep === i ? s.color + '25' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${activeStep === i ? s.color + '60' : BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 15, fontWeight: 700,
                    color: activeStep === i ? s.color : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.3s',
                    position: 'relative', zIndex: 1,
                  }}>
                    {s.step}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px', color: activeStep === i ? '#fff' : 'rgba(255,255,255,0.6)' }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §6  TECH STACK
        ═══════════════════════════════════════════════════════════════ */}
        <section id="tech" style={{ padding: `clamp(64px, 7vw, 88px) ${sectionX}` }}>
          <Section delay={120} duration={860} distance={36}>
            <div className="two-col-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <div>
                <Tag color={TEAL}><Code2 size={11} /> Technical Architecture</Tag>
                <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '20px 0 16px', lineHeight: 1.15 }}>
                  Built on a Scalable, Graph-Native Foundation
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 300, marginBottom: 28 }}>
                  Every architectural choice is intentional — from using Zustand over Redux (less boilerplate, simpler graph state) to MSW over JSON Server (no separate process, real network DevTools).
                </p>
                {[
                  { label: 'Graph Engine', val: '@xyflow/react v12', color: BLUE },
                  { label: 'State', val: 'Zustand + immer', color: CYAN },
                  { label: 'Validation', val: 'Zod + React Hook Form', color: '#10b981' },
                  { label: 'Backend', val: 'Supabase (PostgreSQL + JSONB)', color: '#f59e0b' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: r.color, background: r.color + '12', border: `1px solid ${r.color}25`, borderRadius: 6, padding: '3px 10px' }}>{r.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['React 18', '⚛'],['TypeScript','TS'],['Vite','⚡'],['Tailwind CSS','🎨'],
                  ['React Flow','↗'],['Supabase','🔶'],['React Router','⇢'],['Lucide Icons','◆'],
                ].map(([name, icon]) => (
                  <div key={name} className="tech-pill" style={{ justifyContent: 'flex-start' }}>
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §7  USE CASES
        ═══════════════════════════════════════════════════════════════ */}
        <section id="use-cases" style={{ padding: `clamp(64px, 7vw, 88px) ${sectionX}`, background: 'rgba(255,255,255,0.01)', borderTop: `1px solid ${BORDER}` }}>
          <Section delay={140} duration={880} distance={38}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Tag color="#10b981"><Network size={11} /> Use Cases</Tag>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '20px 0' }}>
                Built for Real HR Operations
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
              {[
                {
                  icon: <Users size={20} />, color: '#3b82f6', title: 'Employee Onboarding',
                  desc: 'Automate document collection, IT provisioning, manager introductions, and 30-day check-ins in a single connected flow.',
                  steps: ['Collect Docs → IT Setup → Orientation → Manager Intro → 30-day check'],
                },
                {
                  icon: <CheckCircle2 size={20} />, color: '#f59e0b', title: 'Leave Approvals',
                  desc: 'Multi-stage approval routing from employee request through manager sign-off to payroll notification — zero manual chasing.',
                  steps: ['Submit Request → Manager Review → HR Log → Payroll Notify'],
                },
                {
                  icon: <FileText size={20} />, color: '#10b981', title: 'Document Verification',
                  desc: 'Background checks, contract signing, and compliance validation workflows that run in parallel with visibility at every step.',
                  steps: ['Collect → Verify → Sign → Archive → Notify'],
                },
              ].map(uc => (
                <div key={uc.title} className="hover-lift" style={{ ...card }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: uc.color + '18', color: uc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    {uc.icon}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px' }}>{uc.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 16px', lineHeight: 1.65 }}>{uc.desc}</p>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: uc.color + 'cc', margin: 0, lineHeight: 1.7 }}>{uc.steps[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §8  CTA
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: `clamp(72px, 8vw, 96px) ${sectionX}` }}>
          <Section delay={160} duration={900} distance={40}>
            <div className="cinematic-cta" style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(6,182,212,0.06) 100%)',
              border: `1px solid rgba(37,99,235,0.2)`,
              borderRadius: 24, padding: '64px 40px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative orbs */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)', pointerEvents: 'none' }} />

              <Tag color="#93c5fd"><Sparkles size={11} /> Ready to Build?</Tag>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 54px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '24px 0 16px', lineHeight: 1.1 }}>
                Start Designing Workflows<br />
                <span style={{ backgroundImage: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Today
                </span>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 36px', fontWeight: 300, lineHeight: 1.7 }}>
                Join the teams already automating HR operations with visual workflow logic. No setup fee. No backend required to explore.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button className="cta-primary hover-glow" style={{ fontSize: 16, padding: '15px 32px' }} onClick={() => navigate('/workflows')}>
                  Build Your First Workflow <ArrowRight size={16} />
                </button>
                <button className="cta-secondary" style={{ fontSize: 16, padding: '15px 32px' }} onClick={() => navigate('/dashboard')}>
                  View Dashboard
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 20 }}>
                Free · Open source · No login required for demo
              </p>
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            §9  FOOTER
        ═══════════════════════════════════════════════════════════════ */}
        <footer style={{ borderTop: `1px solid ${BORDER}`, padding: `40px ${sectionX}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitBranch size={13} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>HR Flow</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Workflow Systems Architect</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Dashboard','Workflows','Automations','Logs'].map(l => (
                <a key={l} className="nav-link" onClick={() => navigate(`/${l.toLowerCase()}`)}>{l}</a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <a
                className="cta-secondary"
                style={{ padding: '7px 14px', fontSize: 12 }}
                href="https://github.com/Aashik1701/HR-Workflow-Designer"
                target="_blank"
                rel="noreferrer"
              >
                <GitBranch size={13} /> GitHub
              </a>
              <a
                className="cta-secondary"
                style={{ padding: '7px 14px', fontSize: 12 }}
                href="https://hr-workflow-agent.vercel.app/"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={13} /> Live Demo
              </a>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 28, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              © 2026 HR Flow. Built for Tredence AI Agentic Platforms Internship.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: 'DM Mono, monospace' }}>
              React + TypeScript + Supabase
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}