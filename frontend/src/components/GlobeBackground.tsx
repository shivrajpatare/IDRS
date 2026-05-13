import React from 'react';
import { motion, useMotionValue } from 'framer-motion';

const ArcPath = ({ d, duration, delay }: { d: string, duration: number, delay: number }) => (
  <motion.path
    d={d}
    fill="none"
    stroke="url(#arcGradient)"
    strokeWidth="1.5"
    strokeLinecap="round"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export default function GlobeBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 80;
    const moveY = (clientY - window.innerHeight / 2) / 80;
    mouseX.set(moveX);
    mouseY.set(moveY);
  };

  return (
    <div onMouseMove={handleMouseMove} className="absolute inset-0 overflow-hidden pointer-events-none bg-[#f8fafc]">
      {/* ── Technical Grid (Subtle) ── */}
      <div className="absolute inset-0 opacity-[0.4]" 
           style={{ backgroundImage: 'linear-gradient(rgba(0, 102, 108, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 102, 108, 0.05) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* ── 3D Globe Container ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.8, scale: 1 }}
        style={{ x: mouseX, y: mouseY }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px]"
      >
        <svg viewBox="0 0 1000 1000" className="w-full h-full animate-[spin_180s_linear_infinite]">
          <defs>
            <radialGradient id="globeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f1fe" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00666c" stopOpacity="0" />
              <stop offset="50%" stopColor="#00f1fe" stopOpacity="1" />
              <stop offset="100%" stopColor="#69f6b8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Globe Spheres */}
          <circle cx="500" cy="500" r="400" fill="url(#globeGradient)" stroke="rgba(0, 102, 108, 0.08)" strokeWidth="0.5" />
          
          {/* Wireframe Lat/Long (Cyan) */}
          {[...Array(12)].map((_, i) => (
            <ellipse key={`lat-${i}`} cx="500" cy="500" rx="400" ry={33 * i} fill="none" stroke="rgba(0, 102, 108, 0.04)" strokeWidth="0.5" />
          ))}
          {[...Array(12)].map((_, i) => (
            <ellipse key={`long-${i}`} cx="500" cy="500" rx={33 * i} ry="400" fill="none" stroke="rgba(0, 102, 108, 0.04)" strokeWidth="0.5" />
          ))}

          {/* Animated Routing Arcs */}
          <ArcPath d="M 300 400 Q 500 100 700 400" duration={5} delay={0} />
          <ArcPath d="M 200 600 Q 500 800 800 600" duration={6} delay={1} />
          <ArcPath d="M 400 300 Q 200 500 400 700" duration={5.5} delay={0.5} />
          <ArcPath d="M 600 300 Q 800 500 600 700" duration={7} delay={1.5} />

          {/* Glowing Nodes */}
          {[
            { x: 300, y: 400 }, { x: 700, y: 400 }, 
            { x: 200, y: 600 }, { x: 800, y: 600 },
            { x: 500, y: 500 }
          ].map((node, i) => (
            <g key={`node-${i}`}>
              <circle cx={node.x} cy={node.y} r="2.5" fill="#00666c" />
              <circle cx={node.x} cy={node.y} r="6" fill="#00f1fe" className="opacity-30 animate-pulse" />
            </g>
          ))}
        </svg>
      </motion.div>

      {/* ── Soft Ambient Glows ── */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white to-transparent opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-200/20 blur-[160px] rounded-full animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-100/30 blur-[160px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
