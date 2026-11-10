import React, { useState } from 'react';

interface EscalationMatrixProps {
  onBack: () => void;
}

export default function EscalationMatrix({ onBack }: EscalationMatrixProps) {
  const [selectedApp, setSelectedApp] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const escalationData = [
    { id: 1, app: 'SES', issue: 'Reset password / Unlocked ID / User Admin', esc1: 'Helpdesk', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'IR Incident Report / CR Submission', esc1: 'Helpdesk (Subash)', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'Furniture, Workstation, Maintenance, Lockers', esc1: 'Facilities (Don)', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'TV movement & Carpet', esc1: 'Facilities (Don)', esc2: '-', remarks: 'Connection TV - NOC' },
    { id: 1, app: 'SES', issue: 'Access Pass & Cyberjaya Facility', esc1: 'Facilities (Khairul)', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'Leaking & Electrical issues', esc1: 'Facilities (Faiz)', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'Aircond issues', esc1: 'Facilities (Vinesh)', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'Leave balance, Agent leave, SES Access', esc1: 'CRM (Syahril/Thiana)', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'Ticket creation & Approval issues', esc1: 'CRM (Syahril/Thiana)', esc2: '-', remarks: '-' },
    { id: 1, app: 'SES', issue: 'Laptop, Headset, Monitor & Lenovo Hardware', esc1: 'ICTO (Nivash/Asaboro)', esc2: '-', remarks: '-' },
    { id: 2, app: 'SLC Course', issue: 'Page stuck / Unable to click next page / General SLC', esc1: 'CRM (Sree)', esc2: '-', remarks: '-' },
    { id: 3, app: 'VPN', issue: 'ID Creation, Deactivation, DUO, License, Connection', esc1: 'ICTS (Deegayu)', esc2: 'ICTS (Khalid)', remarks: '-' },
    { id: 4, app: 'Zimbra / Email', issue: 'ID Creation, Reset, Forwarding, Microsoft License', esc1: 'Helpdesk', esc2: '-', remarks: '-' },
    { id: 4, app: 'Zimbra / Email', issue: 'Email not sending / receiving', esc1: 'Helpdesk', esc2: 'ICTA', remarks: 'Check internet connection first' },
    { id: 4, app: 'Zimbra / Email', issue: 'Storage email full', esc1: 'Helpdesk', esc2: '-', remarks: 'Advise user to clear unused email for archiving' },
    { id: 5, app: 'Entra / Nubitel', issue: 'ID Creation & Deactivation', esc1: 'Helpdesk (Fatin/Ain)', esc2: '-', remarks: '-' },
    { id: 5, app: 'Calabrio', issue: 'Reset password / Assign license / Campaigns', esc1: 'Helpdesk (Fatin/Ain)', esc2: 'NOC TM', remarks: 'If still cannot login, ask NOC TM to check from their end' }
  ];

  const apps = ['ALL', 'SES', 'SLC Course', 'VPN', 'Zimbra / Email', 'Calabrio'];

  const filteredData = escalationData.filter(row => {
    const matchesApp = selectedApp === 'ALL' || row.app.includes(selectedApp);
    const matchesSearch = row.app.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.esc1.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesApp && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      
      {/* Header Bar */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 25px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>Escalation Matrix</span>
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Quick-reference contact routing for application and facility requests.</p>
        </div>
        <button 
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Portal
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 25px auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* App Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {apps.map(app => (
            <button
              key={app}
              onClick={() => setSelectedApp(app)}
              style={{
                background: selectedApp === app ? 'linear-gradient(90deg, #8a2be2, #00ffff)' : 'rgba(18, 18, 22, 0.8)',
                border: selectedApp === app ? 'none' : '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}
            >
              {app}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input 
          type="text" 
          placeholder="Filter by issue, team, or keywords..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 20px', backgroundColor: 'rgba(18, 18, 22, 0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
        />
      </div>

      {/* Simple Card Grid Layout */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredData.map((row, index) => (
          <div 
            key={index}
            style={{
              backgroundColor: 'rgba(18, 18, 22, 0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {row.app}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(153,69,255,0.2)', color: '#9945ff', fontWeight: 'bold' }}>
                Tier 1
              </span>
            </div>

            <h3 style={{ fontSize: '1rem', color: '#fff', lineHeight: '1.4', margin: 0 }}>
              {row.issue}
            </h3>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#aaa' }}>Escalate To:</span>
                <span style={{ color: '#00ffff', fontWeight: '600' }}>{row.esc1}</span>
              </div>

              {row.esc2 !== '-' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#aaa' }}>2nd Escalation:</span>
                  <span style={{ color: '#ffaa00', fontWeight: '600' }}>{row.esc2}</span>
                </div>
              )}

              {row.remarks !== '-' && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#d0d0d0', marginTop: '4px' }}>
                  💡 {row.remarks}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}