import React, { useState } from 'react';

interface AddCaseViewProps {
  onBack: () => void;
  onCaseCreated: (newCase: any) => void;
}

export default function AddCaseView({ onBack, onCaseCreated }: AddCaseViewProps) {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [category, setCategory] = useState('Application Error');
  const [severity, setSeverity] = useState('SEV-2 (High)');
  const [impact, setImpact] = useState('');
  const [summary, setSummary] = useState('');
  const [steps, setSteps] = useState(['', '']);

  const handleStepChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStepField = () => {
    setSteps([...steps, '']);
  };

  const removeStepField = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newIncident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      title,
      project: project || 'General NOC Operations',
      category,
      severity,
      impact: impact || 'Standard operational disruption reported.',
      summary: summary || title,
      steps: steps.filter(s => s.trim() !== '')
    };

    onCaseCreated(newIncident);
    alert('Incident ticket successfully created and logged into Knowledge Base!');
    onBack();
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      
      {/* Header Bar */}
      <div style={{ maxWidth: '900px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>Create New</span> Incident Ticket
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Log detailed issue diagnostics, affected projects, and step-by-step resolution workflows.</p>
        </div>
        <button 
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Portal
        </button>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'rgba(18, 18, 22, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
              Incident Title
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. GP Dynamics Gateway Timeout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
                Affected Project
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Telekom Malaysia (TM) Project Operations"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
                Severity Level
              </label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', backgroundColor: '#121216', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="SEV-1 (Critical)">SEV-1 (Critical)</option>
                <option value="SEV-2 (High)">SEV-2 (High)</option>
                <option value="SEV-3 (Medium)">SEV-3 (Medium)</option>
                <option value="SEV-4 (Low)">SEV-4 (Low)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
              Category
            </label>
            <input 
              type="text" 
              placeholder="e.g. Application Error, VoIP / Telephony, Infrastructure"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
              Business Impact Description
            </label>
            <textarea 
              rows={2}
              placeholder="Describe what modules or agents are impacted..."
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
              Issue Summary
            </label>
            <textarea 
              rows={3}
              placeholder="Brief summary of the root cause or symptoms..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Dynamic Step-by-Step Troubleshooting Workflow */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ color: '#00ffff', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                Step-by-Step Resolution Workflow
              </label>
              <button 
                type="button" 
                onClick={addStepField}
                style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', color: '#00ffff', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Add Step
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#aaa', fontSize: '0.85rem', width: '25px' }}>{idx + 1}.</span>
                  <input 
                    type="text" 
                    placeholder={`Enter troubleshooting step ${idx + 1}...`}
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  {steps.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeStepField(idx)}
                      style={{ background: 'rgba(255,51,51,0.15)', border: '1px solid rgba(255,51,51,0.4)', color: '#ff3333', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button 
              type="submit"
              style={{ flex: 1, padding: '14px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '30px', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 5px 20px rgba(138,43,226,0.4)' }}
            >
              Save Incident & Publish Runbook
            </button>
            <button 
              type="button" 
              onClick={onBack}
              style={{ padding: '14px 30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '30px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}