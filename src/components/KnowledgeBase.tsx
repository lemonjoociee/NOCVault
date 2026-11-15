import React, { useState } from 'react';

interface KnowledgeBaseProps {
  userRole: 'Admin' | 'NOC';
  customIncidents?: any[];
  setActiveTab: (tab: string) => void;
  onOpenAddCase: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export default function KnowledgeBase({
  userRole,
  customIncidents = [],
  setActiveTab,
  onOpenAddCase,
  onOpenProfile,
  onLogout
}: KnowledgeBaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeIncidents = Array.isArray(customIncidents) ? customIncidents : [];

  const allCards = [
    {
      id: 'knowledge',
      title: 'Knowledge Base',
      desc: `Access official runbooks, guides, and SOP documentation. (${safeIncidents.length} active tickets logged)`,
      tags: ['SOP', 'DOCS', 'GUIDES'],
      action: () => setActiveTab('documents'),
      btnText: 'Explore Docs',
      image: '/images/kbicon.png'
    },
    {
      id: 'escalation',
      title: 'Escalation Matrix',
      desc: 'Direct contact directories, SLAs, and escalation paths for critical incidents.',
      tags: ['SLA', 'TIER 1/2/3'],
      action: () => setActiveTab('escalation'),
      btnText: 'View Matrix',
      image: '/images/emicon.png'
    },
    {
      id: 'admin',
      title: 'Admin Console',
      desc: 'Manage NOC personnel, role assignments, and system access permissions.',
      tags: ['USERS', 'ROLES'],
      action: () => setActiveTab('admin'),
      btnText: 'Manage Team',
      image: '/images/adminicon.png',
      adminOnly: true
    },
    {
      id: 'addcase',
      title: 'Log Incident',
      desc: 'Log a new incident ticket, assign severity, and document initial troubleshooting.',
      tags: ['TICKET', 'TRIAGE'],
      action: onOpenAddCase,
      btnText: '+ New Incident',
      image: '/images/caseicon.png'
    }
  ];

  const cards = allCards.filter(card => userRole === 'Admin' || !card.adminOnly);
  const totalCards = cards.length;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalCards);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      perspective: '1200px'
    }}>
      {/* Cyber Laser Scanline Animation CSS */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .scanner-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), rgba(138, 43, 226, 0.8), rgba(0, 255, 255, 0.8), transparent);
          box-shadow: 0 0 12px rgba(0, 255, 255, 0.7);
          pointer-events: none;
          animation: scanline 3.5s ease-in-out infinite;
          z-index: 5;
        }
      `}</style>

      {/* Upper-Right Buttons */}
      <div style={{ position: 'absolute', top: '25px', right: '30px', display: 'flex', gap: '12px', zIndex: 100 }}>
        <span style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', color: '#00ffff', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          Role: {userRole}
        </span>
        <button
          onClick={onOpenProfile}
          style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
        >
          Profile
        </button>
        <button
          onClick={onLogout}
          style={{ background: 'rgba(255, 51, 51, 0.15)', border: '1px solid rgba(255, 51, 51, 0.4)', color: '#ff3333', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
        >
          Logout
        </button>
      </div>

      {/* Upper-Left Company Logo */}
      <div style={{ position: 'absolute', top: '25px', left: '30px', textAlign: 'center', zIndex: 100 }}>
        <img src="/images/scicomlogo.png" alt="Scicom Logo" style={{ height: '48px', objectFit: 'contain' }} />
      </div>

      {/* Carousel Dots */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', zIndex: 100 }}>
        {cards.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? '28px' : '10px',
              height: '10px',
              borderRadius: '5px',
              backgroundColor: idx === currentIndex ? '#00ffff' : 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: idx === currentIndex ? '0 0 10px #00ffff' : 'none'
            }}
          />
        ))}
      </div>

      {/* Carousel Stage */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        {cards.map((card, index) => {
          let offset = (index - currentIndex + totalCards) % totalCards;
          if (offset > Math.floor(totalCards / 2)) {
            offset -= totalCards;
          }

          const isActive = offset === 0;
          const translateX = offset * 280;
          const translateZ = Math.abs(offset) * -180;
          const rotateY = offset * -20;
          const scale = isActive ? 1 : 0.82;
          const opacity = Math.abs(offset) > 1 ? 0 : (isActive ? 1 : 0.5);
          const zIndex = 20 - Math.abs(offset);

          return (
            <div
              key={card.id}
              onClick={() => setCurrentIndex(index)}
              style={{
                position: 'absolute',
                width: '360px',
                height: '450px',
                backgroundColor: 'rgba(18, 18, 22, 0.92)',
                border: isActive ? '1px solid rgba(0, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                boxShadow: isActive ? '0 20px 50px rgba(0, 255, 255, 0.15)' : '0 10px 30px rgba(0,0,0,0.6)',
                cursor: isActive ? 'default' : 'pointer',
                overflow: 'hidden'
              }}
            >
              {/* Subtle Cyber Scanning Line */}
              {isActive && <div className="scanner-line" />}

              {/* Card Content */}
              <div style={{ position: 'relative', zIndex: 6, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <img
                  src={card.image}
                  alt={card.title}
                  style={{ width: '100%', height: '160px', backgroundColor: '#ffffff', objectFit: 'contain', padding: '15px', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' }}
                />

                <h3 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: '10px', letterSpacing: '1px' }}>{card.title}</h3>
                <p style={{ color: '#a0a0a0', fontSize: '0.88rem', marginBottom: '18px', lineHeight: '1.5', flex: 1 }}>{card.desc}</p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {card.tags.map(tag => (
                    <span key={tag} style={{ border: '1px solid rgba(0,255,255,0.3)', color: '#00ffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', letterSpacing: '1px' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isActive) card.action();
                  }}
                  style={{
                    background: isActive ? 'linear-gradient(90deg, #8a2be2, #00ffff)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.85rem',
                    boxShadow: isActive ? '0 5px 15px rgba(138, 43, 226, 0.4)' : 'none'
                  }}
                >
                  {card.btnText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', zIndex: 100 }}>
        <button
          onClick={prevSlide}
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          →
        </button>
      </div>
    </div>
  );
}