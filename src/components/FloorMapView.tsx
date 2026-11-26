import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

interface FloorMapViewProps {
  onBack: () => void;
}

export interface FloorEntry {
  id: string;
  floor: string;
  projects: string[];
  hoursOfOperation: string;
  operatingDays: string;
}

const DEFAULT_FLOOR_MAP: FloorEntry[] = [
  { id: '9-chef-wan', floor: '9', projects: ['Chef Wan Lifestyle'], hoursOfOperation: '9am - 6pm', operatingDays: 'Mon - Fri' },
  { id: '11-ld', floor: '11', projects: ['Learning & Development (LND)'], hoursOfOperation: '9am - 6pm', operatingDays: 'Mon - Fri' },
  { id: '11-lenovo', floor: '11', projects: ['Lenovo'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '12-csl', floor: '12', projects: ['CSL - Client Network'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '13-a-lenovo', floor: '13-A', projects: ['Lenovo'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '13-b-c-mab', floor: '13-B / 13-C', projects: ['Malaysia Airlines Berhad (MAB)'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '16-a-crm-emos', floor: '16-A', projects: ['CRM', 'EMOS'], hoursOfOperation: '9am to 8pm', operatingDays: 'Mon - Fri' },
  { id: '16-a-doctors', floor: '16-A', projects: ['Doctors team'], hoursOfOperation: '9am to 8pm', operatingDays: 'Mon - Sun' },
  { id: '16-a-finance', floor: '16-A', projects: ['Finance Team'], hoursOfOperation: '9am to 6pm', operatingDays: 'Mon - Fri' },
  { id: '16-b-emgs-jpt', floor: '16-B', projects: ['EMGS - JPT Area (EMGS Client Area)'], hoursOfOperation: '9am to 6pm', operatingDays: 'Mon - Fri' },
  { id: '16-b-24x7', floor: '16-B', projects: ['24x7 Operations'], hoursOfOperation: '9am to 8pm', operatingDays: 'Mon - Fri' },
  { id: '17-celcom', floor: '17', projects: ['Celcom'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '18-a-bics', floor: '18-A', projects: ['BICS'], hoursOfOperation: 'CLIENT MANAGED', operatingDays: '-' },
  { id: '18-b-lenovo-ops', floor: '18-B', projects: ['Lenovo OPS'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '18-b-relxc', floor: '18-B', projects: ['RELX'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '18-c-wechat', floor: '18-C', projects: ['WeChat - WORKING FROM HOME'], hoursOfOperation: '8am - 8pm', operatingDays: 'Mon - Sun' },
  { id: '18-c-fonterra', floor: '18-C', projects: ['Fonterra Project - WORKING FROM HOME'], hoursOfOperation: '8:30am - 7pm', operatingDays: 'Mon - Fri' },
  { id: '18-d-bmw', floor: '18-D', projects: ['BMW'], hoursOfOperation: '9am - 6pm', operatingDays: 'Mon - Fri' },
  { id: '18-d-etika', floor: '18-D', projects: ['Etika (Permanis) - WORKING FROM HOME'], hoursOfOperation: '9am - 6pm', operatingDays: 'Mon - Sun' },
  { id: '18-e-shopee-asus', floor: '18-E', projects: ['Shopee', 'ASUS - ANZ', 'ASUS - Singapore', 'ASUS - Wireless', 'ASUS - MY'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '18-f-honor', floor: '18-F', projects: ['Honor'], hoursOfOperation: '9am - 9pm', operatingDays: 'Mon - Sun' },
  { id: '19-a-ict', floor: '19-A', projects: ['ICT Facilities'], hoursOfOperation: '9am - 6pm', operatingDays: 'Mon - Fri' },
  { id: '19-b-exxonmobil', floor: '19-B', projects: ['ExxonMobil'], hoursOfOperation: '4am - 6pm', operatingDays: 'Mon - Sat' },
  { id: '19-c-mab', floor: '19-C', projects: ['Malaysia Airlines Berhad (MAB)'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '19-c-kdp', floor: '19-C', projects: ['KDP - Temporary'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  {
    id: '20-emgs-suite',
    floor: '20',
    projects: ['EMGS', 'FrontDesk', 'Passport Room', 'Scanning Room', 'IKAD Room', 'IKAD Printing Room', 'Immigration Area'],
    hoursOfOperation: '8am - 8pm',
    operatingDays: 'Mon - Fri'
  },
  {
    id: '24-lenovo-ucc',
    floor: '24',
    projects: ['Lenovo OPS Area ASEAN', 'Lenovo OPS Area ANZ', 'Lenovo UCC Area'],
    hoursOfOperation: '24x7',
    operatingDays: 'Mon - Sat'
  },
  {
    id: '25-corporate',
    floor: '25',
    projects: [
      'CEO Office',
      'Finance',
      'Procurement',
      'Internal Audit (IRC)',
      'Legal',
      'Business Development (BD)',
      'ICT & Facilities',
      'Human Resource (REC, ER, PACB)',
      'Total Quality Management (TQM)',
      'PMO & MIS'
    ],
    hoursOfOperation: '9am - 6pm',
    operatingDays: 'Mon - Fri'
  },
  { id: '26-shopee', floor: '26', projects: ['Shopee'], hoursOfOperation: '24x7', operatingDays: 'Mon - Sun' },
  { id: '31-a-bat', floor: '31-A', projects: ['BAT'], hoursOfOperation: '9am - 6pm', operatingDays: 'Mon - Fri' },
  { id: '31-b-empty', floor: '31-B', projects: ['EMPTY'], hoursOfOperation: '-', operatingDays: '-' },
  { id: '31-c-nestle-sg', floor: '31-C', projects: ['Nestle SG'], hoursOfOperation: '8am to 8pm', operatingDays: 'Mon - Sun' },
  { id: '31-c-nestle-my', floor: '31-C', projects: ['Nestle MY'], hoursOfOperation: '8am - 8pm', operatingDays: 'Mon - Sat' },
  { id: '31-c-gradu8', floor: '31-C', projects: ['Gradu8'], hoursOfOperation: '8am - 5pm', operatingDays: 'Sun' },
  { id: '31-d-gehc', floor: '31-D', projects: ['GEHC - Client Network'], hoursOfOperation: '8am - 9pm', operatingDays: 'Mon - Fri' }
];

export default function FloorMapView({ onBack }: FloorMapViewProps) {
  const [entries, setEntries] = useState<FloorEntry[]>(DEFAULT_FLOOR_MAP);
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    async function loadFloorMap() {
      try {
        const { data, error } = await supabase.from('floor_map').select('*');
        if (!error && data && data.length > 0 && active) {
          const normalized: FloorEntry[] = data.map((row: any, idx: number) => ({
            id: String(row.id ?? idx),
            floor: String(row.floor ?? row.floor_level ?? ''),
            projects: Array.isArray(row.projects)
              ? row.projects
              : String(row.projects ?? '')
                  .split(',')
                  .map((p: string) => p.trim())
                  .filter(Boolean),
            hoursOfOperation: String(row.hours_of_operation ?? row.hoursOfOperation ?? '-'),
            operatingDays: String(row.operating_days ?? row.operatingDays ?? '-')
          }));
          setEntries(normalized);
        }
      } catch {
        // Keep static reference list when offline or table not created
      }
    }
    loadFloorMap();
    return () => {
      active = false;
    };
  }, []);

  const floorOptions = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.floor)));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((item) => {
      const matchesFloor = floorFilter === 'ALL' || item.floor === floorFilter;
      if (!matchesFloor) return false;
      if (!q) return true;
      return (
        item.floor.toLowerCase().includes(q) ||
        item.projects.some((p) => p.toLowerCase().includes(q)) ||
        item.hoursOfOperation.toLowerCase().includes(q) ||
        item.operatingDays.toLowerCase().includes(q)
      );
    });
  }, [entries, searchQuery, floorFilter]);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div style={{ maxWidth: '1150px', margin: '0 auto 22px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 6px 0' }}>
            <span style={{ color: '#00ffff' }}>FLOOR MAP</span> — MENARA TA ONE
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '0.9rem', margin: 0 }}>
            Floor level, projects, hours of operations, and operating days reference.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.88rem'
          }}
        >
          ← Back to Portal
        </button>
      </div>

      {/* Search & Floor Filter */}
      <div style={{ maxWidth: '1150px', margin: '0 auto 20px auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search floor (e.g. 20, 25, 31-C), project (e.g. Lenovo, Shopee, EMGS), or hours..."
          style={{
            flex: 1,
            minWidth: '260px',
            padding: '12px 16px',
            backgroundColor: 'rgba(18, 18, 22, 0.92)',
            border: '1px solid rgba(0, 255, 255, 0.25)',
            borderRadius: '14px',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />

        <select
          aria-label="Filter by Floor"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            backgroundColor: '#121216',
            border: '1px solid rgba(0, 255, 255, 0.25)',
            borderRadius: '14px',
            color: '#00ffff',
            fontWeight: 'bold',
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          <option value="ALL" style={{ backgroundColor: '#121216', color: '#fff' }}>
            All Floors ({floorOptions.length})
          </option>
          {floorOptions.map((fl) => (
            <option key={fl} value={fl} style={{ backgroundColor: '#121216', color: '#fff' }}>
              Floor {fl}
            </option>
          ))}
        </select>
      </div>

      {/* Reference Table */}
      <div style={{ maxWidth: '1150px', margin: '0 auto', backgroundColor: 'rgba(18, 18, 22, 0.92)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', overflowX: 'auto', boxShadow: '0 16px 40px rgba(0,0,0,0.65)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', minWidth: '720px' }}>
          <thead>
            <tr style={{ backgroundColor: '#101014', borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#00ffff', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.9px' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', width: '130px' }}>Floor Level</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Projects</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', width: '180px' }}>Hours of Operations</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', width: '160px' }}>Operating Days</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                  No matching floor entries found.
                </td>
              </tr>
            ) : (
              filteredEntries.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#00ffff', verticalAlign: 'top' }}>
                    {row.floor}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#fff', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {row.projects.map((proj, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: proj === 'EMPTY' ? 'rgba(255,255,255,0.05)' : 'rgba(138, 43, 226, 0.18)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: proj === 'EMPTY' ? '#888' : '#f0e6ff',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.82rem'
                          }}
                        >
                          {proj}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#e0e0e0', verticalAlign: 'top' }}>
                    {row.hoursOfOperation}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#ffd54f', fontWeight: '600', verticalAlign: 'top' }}>
                    {row.operatingDays}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}