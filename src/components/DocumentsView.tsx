import React, { useState } from 'react';

interface DocumentsViewProps {
  onBack: () => void;
}

export default function DocumentsView({ onBack }: DocumentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // Detailed NOC Runbooks with projects, severe level breakdown, and step-by-step procedures
  const cases = [
    {
      id: 'INC-001',
      title: 'GP Dynamics Connection Timeout',
      project: 'Telekom Malaysia (TM) Project Operations',
      category: 'Application Error',
      severity: 'SEV-1 (Critical)',
      impact: 'Complete stoppage of billing and ticketing modules for active front-desk agents.',
      summary: 'Users experiencing sudden drop-offs, latency spikes, and gateway timeout errors when authenticating or querying records in GP Dynamics.',
      steps: [
        '1. Verify physical gateway and site-to-site VPN tunnel stability between the regional branch router and the central datacenter firewall using continuous ping (`ping -t <server_ip>`) and `show crypto isakmp sa` checks.',
        '2. Log into the database host machine via RDP/SSH, open Services.msc, and verify that the `MSSQLSERVER` and SQL Server Agent services are running without interruption.',
        '3. Inspect event viewer and IIS application logs (`C:\\inetpub\\logs\\LogFiles`) for HTTP 503 or 504 gateway timeout triggers.',
        '4. Clear stale local user cache directories (`%localappdata%\\Microsoft\\Dynamics\\Cache`) on affected client workstations.',
        '5. If deadlocks persist, coordinate with L2 database specialists to clear active orphaned SQL sessions, then perform an application pool recycle (`Restart-WebAppPool GP_Dynamics_AppPool`) in IIS.'
      ]
    },
    {
      id: 'INC-002',
      title: 'Zoiper SIP Registration Failure',
      project: 'Scicom Enterprise Voice Operations',
      category: 'VoIP / Telephony',
      severity: 'SEV-2 (High)',
      impact: 'Inbound and outbound customer service voice channels offline for specific agent pods.',
      summary: 'Softphone clients unable to register SIP extension, returning "Request Timeout (408)" or "Forbidden (403)" errors.',
      steps: [
        '1. Inspect Zoiper account configuration settings: verify SIP domain URI, correct extension username, and authentication password match the PBX user registry.',
        '2. Confirm local client firewall and corporate endpoint security rules allow inbound/outbound UDP and TCP traffic on ports 5060 (SIP) and 10000-20000 (RTP media streams).',
        '3. Run a network packet capture using Wireshark or built-in diagnostics to verify if SIP `REGISTER` packets are reaching the FreePBX/Asterisk server.',
        '4. Check FreePBX dashboard for endpoint lockout or consecutive failed authorization blocks.',
        '5. Clear softphone cache, unregister the profile, and perform a hard reload of the Zoiper client application.'
      ]
    },
    {
      id: 'INC-003',
      title: 'Network VLAN Port Mismatch & Drop',
      project: 'Core Infrastructure & Datacenter Switch Fabric',
      category: 'Infrastructure',
      severity: 'SEV-1 (Critical)',
      impact: 'Complete network isolation of subnets connected to Access Switch Stack B.',
      summary: 'Switch port configuration mismatch or trunk encapsulation failure causing broadcast storms and loss of inter-VLAN connectivity.',
      steps: [
        '1. Identify the affected interface via SNMP traps or syslog alerts indicating MAC flapping or Spanning Tree Protocol (STP) topology changes.',
        '2. Access the core/access switch management CLI via SSH and execute `show running-config interface <interface_id>` to inspect current VLAN assignments.',
        '3. Verify trunk allowed lists (`switchport trunk allowed vlan`) and ensure native VLAN configurations match across connected upstream switches.',
        '4. Re-configure the access port with correct static assignments (`switchport access vlan <vlan_id>`).',
        '5. Execute port reset commands (`shutdown` followed by `no shutdown`), verify link state with `show interfaces status`, and confirm packet error counters are clear.'
      ]
    }
  ];

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      
      {/* Header Bar */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>Knowledge Base</span> / Incident Runbooks
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Detailed project impact analysis, severity metrics, and step-by-step troubleshooting workflows.</p>
        </div>
        <button 
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Portal
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 30px auto' }}>
        <input 
          type="text" 
          placeholder="Search by case ID, title, project, or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px 20px', backgroundColor: 'rgba(18, 18, 22, 0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
        />
      </div>

      {/* Content Layout */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: selectedCase ? '1fr 1.3fr' : '1fr', gap: '20px' }}>
        
        {/* Cases List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredCases.map((c) => (
            <div 
              key={c.id}
              onClick={() => setSelectedCase(c)}
              style={{
                backgroundColor: 'rgba(18, 18, 22, 0.85)',
                border: selectedCase?.id === c.id ? '1px solid #00ffff' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: selectedCase?.id === c.id ? '0 0 20px rgba(0,255,255,0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.85rem' }}>{c.id}</span>
                <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '10px', backgroundColor: c.severity.includes('Critical') ? 'rgba(255,51,51,0.2)' : 'rgba(255,170,0,0.2)', color: c.severity.includes('Critical') ? '#ff3333' : '#ffaa00', fontWeight: 'bold' }}>
                  {c.severity}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{c.title}</h3>
              <p style={{ color: '#9945ff', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>📁 Project: {c.project}</p>
              <p style={{ color: '#b0b0b0', fontSize: '0.85rem', marginBottom: '12px' }}>{c.summary}</p>
              <span style={{ fontSize: '0.8rem', color: '#808080' }}>Category: {c.category}</span>
            </div>
          ))}
        </div>

        {/* Selected Case Detailed Panel */}
        {selectedCase && (
          <div style={{ backgroundColor: 'rgba(18, 18, 22, 0.95)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '16px', padding: '25px', position: 'sticky', top: '20px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#00ffff' }}>{selectedCase.id}: Resolution Runbook</h2>
              <button onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{selectedCase.title}</h3>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(153,69,255,0.2)', color: '#9945ff', fontWeight: 'bold' }}>
                {selectedCase.project}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', backgroundColor: selectedCase.severity.includes('Critical') ? 'rgba(255,51,51,0.2)' : 'rgba(255,170,0,0.2)', color: selectedCase.severity.includes('Critical') ? '#ff3333' : '#ffaa00', fontWeight: 'bold' }}>
                Severity: {selectedCase.severity}
              </span>
            </div>

            <p style={{ color: '#b0b0b0', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.5' }}>
              <strong>Business Impact:</strong> {selectedCase.impact}
            </p>

            <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: '#00ffff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
              Step-by-Step Resolution Workflow:
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedCase.steps.map((step: string, idx: number) => (
                <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px 15px', borderRadius: '10px', borderLeft: '3px solid #9945ff' }}>
                  <p style={{ color: '#e0e0e0', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}