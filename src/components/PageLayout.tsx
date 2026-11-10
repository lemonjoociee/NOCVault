import React, { useState } from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  // Floating background particles
  const [particles] = useState(() => 
    Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }))
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative', 
      overflowX: 'hidden',
      backgroundColor: '#0a0a0a',
      backgroundImage: `
        radial-gradient(ellipse at center, rgba(153, 69, 255, 0.1) 0%, transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)
      `
    }}>
      
      {/* LIVE BACKGROUND ANIMATION LAYER */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#00ffff',
              borderRadius: '50%',
              boxShadow: '0 0 8px #00ffff, 0 0 15px #9945ff',
              opacity: 0.6,
              animation: `liveFloat ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes liveFloat {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
      `}</style>

      {/* Page Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>

    </div>
  );
}