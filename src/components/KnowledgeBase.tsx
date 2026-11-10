import React, { useState } from 'react';

interface KnowledgeBaseProps {
  userRole: 'Admin' | 'NOC';
  setActiveTab: (tab: string) => void;
  onOpenAddCase: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export default function KnowledgeBase({ userRole, setActiveTab, onOpenAddCase, onOpenProfile, onLogout }: KnowledgeBaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allCards = [
    {
      id: 'knowledge',
      title: 'Knowledge Base',
      desc: 'Access official runbooks, installation guides, and NOC project documentation.',
      tags: ['RUNBOOKS', 'GUIDES'],
      action: () => setActiveTab('documents'),
      btnText: 'Explore Docs',
      image: '/images/kbicon.png'
    },
    {
      id: 'escalation',
      title: 'Escalation Matrix',
      desc: 'View contact protocols, SLAs, and escalation paths for critical incidents.',
      tags: ['SLA', 'TIER L1-L3'],
      action: () => setActiveTab('escalation'),
      btnText: 'View Matrix',
      image: '/images/emicon.png'
    },
    {
      id: 'admin',
      title: 'Admin Console',
      desc: 'Manage NOC personnel, role assignments, and system access permissions.',
      tags: ['ROLES', 'SECURITY'],
      action: () => setActiveTab('admin'),
      btnText: 'Manage Team',
      image: '/images/adminicon.png',
      adminOnly: true
    },
    {
      id: 'addcase',
      title: 'New Incident',
      desc: 'Log a new incident ticket, assign severity, and document initial troubleshooting.',
      tags: ['INCIDENT', 'TICKET'],
      action: onOpenAddCase,
      btnText: '+ Add Case',
      image: '/images/caseicon.png'
    }
  ];

  // Filter cards: If NOC, exclude cards marked adminOnly
  const cards = allCards.filter(card => userRole === 'Admin' || !card.adminOnly);
  const totalCards = cards.length;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalCards);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);

  return (
    <section style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden', 
      position: 'relative',
      perspective: '1400px'
    }}>
      
      {/* Upper-Right Buttons */}
      <div style={{ position: 'absolute', top: '25px', right: '35px', display: 'flex', gap: '12px', zIndex: 1000 }}>
        <span style={{ padding: '8px 14px', borderRadius: '20px', background: 'rgba(0,255,255,0.1)', border: '1px solid #00ffff', color: '#00ffff', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          Role: {userRole}
        </span>
        <button 
          onClick={onOpenProfile}
          style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
        >
          Edit Profile
        </button>
        <button 
          onClick={onLogout}
          style={{ background: 'rgba(255, 51, 51, 0.15)', border: '1px solid rgba(255, 51, 51, 0.4)', color: '#ff3333', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
        >
          Logout
        </button>
      </div>

      {/* Top-Center Company Logo */}
      <div style={{ position: 'absolute', top: '25px', left: '35px', textAlign: 'center', zIndex: 100 }}>
        <img src="/images/scicomlogo.png" alt="Scicom Logo" style={{ height: '40px', objectFit: 'contain' }} />
      </div>

      {/* Indicator Dots */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', zIndex: 100 }}>
        {cards.map((_, idx) => (
          <div 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? '12px' : '8px',
              height: idx === currentIndex ? '12px' : '8px',
              borderRadius: '50%',
              backgroundColor: idx === currentIndex ? '#00ffff' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: idx === currentIndex ? '0 0 10px #00ffff' : 'none'
            }}
          />
        ))}
      </div>

      {/* 3D Carousel Stage */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        {cards.map((card, index) => {
          let offset = (index - currentIndex + totalCards) % totalCards;
          if (offset > totalCards / 2) {
            offset -= totalCards; 
          }

          const isActive = offset === 0;
          const translateX = offset * 340; 
          const translateZ = -Math.abs(offset) * 120; 
          const rotateY = offset * -18; 
          const scale = isActive ? 1 : 0.85; 
          const opacity = Math.abs(offset) > 1.5 ? 0 : isActive ? 1 : 0.5; 
          const zIndex = 10 - Math.abs(offset);

          return (
            <div 
              key={card.id}
              onClick={() => setCurrentIndex(index)}
              style={{
                position: 'absolute',
                width: '320px',
                height: '450px',
                backgroundColor: 'rgba(18, 18, 22, 0.95)',
                border: isActive ? '1px solid rgba(0, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                boxShadow: isActive ? '0 20px 50px rgba(0, 255, 255, 0.2)' : '0 10px 30px rgba(0,0,0,0.8)',
                cursor: isActive ? 'default' : 'pointer'
              }}
            >
              <img 
                src={card.image} 
                alt={card.title} 
                style={{ width: '100%', height: '130px', backgroundColor: '#ffffff', objectFit: 'contain', padding: '12px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.1)' }} 
              />
              
              <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '8px', letterSpacing: '1px' }}>{card.title}</h3>
              <p style={{ color: '#b0b0b0', fontSize: '0.8rem', marginBottom: '15px', lineHeight: '1.4' }}>{card.desc}</p>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {card.tags.map(tag => (
                  <span key={tag} style={{ border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', padding: '3px 8px', borderRadius: '20px', fontSize: '0.6rem', letterSpacing: '1px' }}>
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
                  background: isActive ? 'linear-gradient(90deg, #8a2be2, #00ffff)' : 'rgba(255,255,255,0.05)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 18px', 
                  borderRadius: '30px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.8rem',
                  marginTop: 'auto',
                  boxShadow: isActive ? '0 5px 15px rgba(138, 43, 226, 0.4)' : 'none'
                }}
              >
                {card.btnText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <div style={{ display: 'flex', gap: '20px', zIndex: 100, marginTop: '25px' }}>
        <button onClick={prevSlide} style={{ background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#00ffff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <button onClick={nextSlide} style={{ background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#00ffff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

    </section>
  );
}