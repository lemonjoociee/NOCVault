import React, { useState } from 'react';

interface DocumentsViewProps {
  customIncidents: any[];
  onBack: () => void;
}

export default function DocumentsView({ customIncidents, onBack }: DocumentsViewProps) {
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      
      {/* Header */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>Knowledge Base</span> / Runbooks
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Official operations runbooks and logged incident resolution workflows.</p>
        </div>
        <button 
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Portal
        </button>
      </div>

      {/* Incidents List Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {customIncidents.map((incident) => (
          <div 
            key={incident.id}
            onClick={() => setSelectedIncident(incident)}
            style={{
              backgroundColor: 'rgba(18, 18, 22, 0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '22px 28px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '75%' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px' }}>{incident.id}</span>
                <span style={{ color: '#888', fontSize: '0.8rem' }}>•</span>
                <span style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>{incident.project}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: '600' }}>{incident.title}</h3>
              <p style={{ color: '#909090', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.summary}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(153,69,255,0.2)', color: '#9945ff' }}>
                {incident.severity}
              </span>
              <span style={{ color: '#00ffff', fontSize: '0.8rem', fontWeight: 'bold' }}>View Runbook →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Clean Runbook Modal View */}
      {selectedIncident && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div style={{ width: '750px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '24px', padding: '35px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', color: '#fff' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: '#00ffff', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>{selectedIncident.id}</span>
                  <span style={{ padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(153,69,255,0.2)', color: '#9945ff' }}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>{selectedIncident.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedIncident(null)} 
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Affected Project</div>
                <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>{selectedIncident.project}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Category</div>
                <div style={{ fontSize: '0.95rem', color: '#00ffff', fontWeight: '600' }}>{selectedIncident.category}</div>
              </div>
            </div>

            {/* Impact & Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '30px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Business Impact</h4>
                <p style={{ margin: 0, color: '#d0d0d0', fontSize: '0.95rem', lineHeight: '1.5', backgroundColor: 'rgba(255,51,51,0.08)', borderLeft: '3px solid #ff3333', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                  {selectedIncident.impact}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Incident Summary</h4>
                <p style={{ margin: 0, color: '#d0d0d0', fontSize: '0.95rem', lineHeight: '1.5', backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '10px' }}>
                  {selectedIncident.summary}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Step-by-Step Resolution Workflow</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedIncident.steps.map((step: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: 'rgba(153,69,255,0.05)', border: '1px solid rgba(153,69,255,0.15)', padding: '12px 16px', borderRadius: '10px' }}>
                      <span style={{ color: '#9945ff', fontWeight: 'bold', fontSize: '0.85rem' }}>0{idx + 1}</span>
                      <span style={{ color: '#e0e0e0', fontSize: '0.9rem', lineHeight: '1.4' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Close Button */}
            <div style={{ textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <button 
                onClick={() => setSelectedIncident(null)}
                style={{ padding: '12px 30px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '25px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                Close Runbook
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}