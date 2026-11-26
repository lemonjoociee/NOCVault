import React, { useState, useMemo } from 'react';

interface EscalationMatrixProps {
  onBack: () => void;
}

interface EscalationRow {
  id: number;
  app: string;
  issue: string;
  esc1: string;
  esc2: string;
  remarks: string;
}

const ESCALATION_DATA: EscalationRow[] = [
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

export default function EscalationMatrix({ onBack }: EscalationMatrixProps) {
  const [selectedApp, setSelectedApp] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const apps = useMemo(() => {
    const unique = Array.from(new Set(ESCALATION_DATA.map((item) => item.app)));
    return ['ALL', ...unique];
  }, []);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return ESCALATION_DATA.filter((row) => {
      const matchesApp = selectedApp === 'ALL' || row.app === selectedApp;
      if (!matchesApp) return false;
      if (!query) return true;

      return (
        row.app.toLowerCase().includes(query) ||
        row.issue.toLowerCase().includes(query) ||
        row.esc1.toLowerCase().includes(query) ||
        row.esc2.toLowerCase().includes(query) ||
        row.remarks.toLowerCase().includes(query)
      );
    });
  }, [selectedApp, searchTerm]);

  const handleCopy = (key: string, value: string) => {
    if (value === '-') return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1300);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      {/* Header Bar */}
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto 24px auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '1.8px', margin: '0 0 6px 0' }}>
            <span style={{ color: '#00ffff' }}>Escalation Matrix</span>
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem', margin: 0 }}>
            Quick-reference contact routing for application and facility requests.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.86rem'
          }}
        >
          ← Back to Portal
        </button>
      </div>

      {/* Filter Tabs, View Toggle & Search */}
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto 22px auto',
          backgroundColor: 'rgba(18, 18, 22, 0.88)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* App Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {apps.map((app) => {
              const isActive = selectedApp === app;
              return (
                <button
                  key={app}
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  style={{
                    background: isActive ? 'linear-gradient(90deg, #8a2be2, #00ffff)' : 'rgba(255,255,255,0.04)',
                    border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    padding: '7px 15px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.82rem'
                  }}
                >
                  {app}
                </button>
              );
            })}
          </div>

          {/* View Switcher */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '3px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#00ffff' : 'transparent',
                color: viewMode === 'table' ? '#09090d' : '#aaa',
                fontWeight: 'bold',
                fontSize: '0.76rem',
                cursor: 'pointer'
              }}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: viewMode === 'cards' ? '#00ffff' : 'transparent',
                color: viewMode === 'cards' ? '#09090d' : '#aaa',
                fontWeight: 'bold',
                fontSize: '0.76rem',
                cursor: 'pointer'
              }}
            >
              Cards
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Filter by issue, team, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 86px 11px 16px',
              backgroundColor: '#141419',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.92rem',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#ddd',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredData.length === 0 ? (
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            backgroundColor: 'rgba(18, 18, 22, 0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#a0a0a0'
          }}
        >
          No matching escalation items found.
        </div>
      ) : viewMode === 'table' ? (
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            backgroundColor: 'rgba(18, 18, 22, 0.9)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px',
            overflowX: 'auto',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: '#9e9e9e',
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.9px'
                }}
              >
                <th style={{ padding: '14px 16px' }}>App / System</th>
                <th style={{ padding: '14px 16px' }}>Issue / Request</th>
                <th style={{ padding: '14px 16px' }}>Escalate To</th>
                <th style={{ padding: '14px 16px' }}>2nd Escalation</th>
                <th style={{ padding: '14px 16px' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => {
                const esc1Key = `${row.id}-${index}-1`;
                const esc2Key = `${row.id}-${index}-2`;

                return (
                  <tr
                    key={`${row.id}-${index}`}
                    style={{
                      borderBottom:
                        index === filteredData.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(0, 255, 255, 0.1)',
                          border: '1px solid rgba(0, 255, 255, 0.25)',
                          color: '#00ffff',
                          fontWeight: 'bold',
                          fontSize: '0.76rem'
                        }}
                      >
                        {row.app}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#fff', fontWeight: 500 }}>{row.issue}</td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(esc1Key, row.esc1)}
                        title="Click to copy"
                        style={{
                          background: 'rgba(0, 255, 255, 0.08)',
                          border: '1px solid rgba(0, 255, 255, 0.25)',
                          color: '#00ffff',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedKey === esc1Key ? '✓ Copied' : row.esc1}
                      </button>
                    </td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      {row.esc2 !== '-' ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(esc2Key, row.esc2)}
                          title="Click to copy"
                          style={{
                            background: 'rgba(255, 170, 0, 0.1)',
                            border: '1px solid rgba(255, 170, 0, 0.3)',
                            color: '#ffaa00',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {copiedKey === esc2Key ? '✓ Copied' : row.esc2}
                        </button>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px', color: '#cfcfcf', fontSize: '0.82rem' }}>
                      {row.remarks !== '-' ? `💡 ${row.remarks}` : <span style={{ color: '#666' }}>-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredData.map((row, index) => {
            const esc1Key = `${row.id}-${index}-card`;
            return (
              <div
                key={`${row.id}-${index}`}
                style={{
                  backgroundColor: 'rgba(18, 18, 22, 0.88)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {row.app}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(153,69,255,0.2)',
                      color: '#b779ff',
                      fontWeight: 'bold'
                    }}
                  >
                    Tier 1
                  </span>
                </div>

                <h3 style={{ fontSize: '0.98rem', color: '#fff', lineHeight: '1.4', margin: 0 }}>{row.issue}</h3>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                    <span style={{ color: '#aaa' }}>Escalate To:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(esc1Key, row.esc1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00ffff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {copiedKey === esc1Key ? '✓ Copied' : row.esc1}
                    </button>
                  </div>

                  {row.esc2 !== '-' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <span style={{ color: '#aaa' }}>2nd Escalation:</span>
                      <span style={{ color: '#ffaa00', fontWeight: 600 }}>{row.esc2}</span>
                    </div>
                  )}

                  {row.remarks !== '-' && (
                    <div
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: '#d0d0d0'
                      }}
                    >
                      💡 {row.remarks}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}