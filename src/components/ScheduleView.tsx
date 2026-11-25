import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

interface ScheduleViewProps {
  userRole: string;
  onBack: () => void;
}

interface ScheduleRow {
  id: number | string;
  schedule_month: string;
  day_num: number;
  day_name: string;
  day_shift: string;
  office_hours: string[];
  night_shift: string;
  cyberjaya: string;
  leaves: string;
  replacement: string;
  remarks: string;
}

const MONTHS_2026 = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026'
];

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const NOV_2026_OVERRIDES: Record<number, Partial<ScheduleRow>> = {
  1: { day_shift: 'Izzul', night_shift: 'Naz Han' },
  2: { day_shift: 'Izzul', office_hours: ['Rajeev', 'Nina', 'Sabbir'], night_shift: 'Naz Han', cyberjaya: 'Vikneswaran' },
  3: { day_shift: 'Dani', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Shahmi', cyberjaya: 'Vikneswaran' },
  4: { day_shift: 'Dani', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Shahmi', cyberjaya: 'Vikneswaran', leaves: 'Nina MIA' },
  5: { day_shift: 'Dani', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Shahmi', cyberjaya: 'Vikneswaran', leaves: 'AL - Nina' },
  6: { day_shift: 'Dani', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Shahmi', cyberjaya: 'Vikneswaran', leaves: 'AL - Sabbir' },
  7: { day_shift: 'Naz Han', night_shift: 'Izzul' },
  8: { day_shift: 'Naz Han', night_shift: 'Izzul' },
  9: { day_shift: 'Naz Han', office_hours: ['DIWALI PH'], night_shift: 'Izzul', cyberjaya: 'PH' },
  10: { day_shift: 'Naz Han', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Izzul', cyberjaya: 'Vikneswaran', leaves: 'AL - Vik, Rajeev & Kaven', replacement: 'SHAHMI @ CJ' },
  11: { day_shift: 'Dani', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Shahmi', cyberjaya: 'Vikneswaran', leaves: 'AL - Vik, Rajeev', replacement: 'SHAHMI @ CJ | KAVEN NIGHT SHIFT' },
  12: { day_shift: 'Dani', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Shahmi', cyberjaya: 'Vikneswaran', leaves: 'AL - Vik, Rajeev', replacement: 'SHAHMI @ CJ | KAVEN NIGHT SHIFT' },
  13: { day_shift: 'Dani', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Shahmi', cyberjaya: 'Vikneswaran', leaves: 'AL - Rajeev', replacement: 'KAVEN NIGHT SHIFT' },
  14: { day_shift: 'Dani', night_shift: 'Shahmi' },
  15: { day_shift: 'Naz Han', night_shift: 'Izzul' },
  16: { day_shift: 'Naz Han', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Izzul', cyberjaya: 'Vikneswaran', replacement: 'SHAHMI OFFICE HOURS' },
  17: { day_shift: 'Naz Han', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Izzul', cyberjaya: 'Vikneswaran', replacement: 'SHAHMI OFFICE HOURS' },
  18: { day_shift: 'Naz Han', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Izzul', cyberjaya: 'Vikneswaran' },
  19: { day_shift: 'Shahmi', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Dani', cyberjaya: 'Vikneswaran' },
  20: { day_shift: 'Shahmi', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Dani', cyberjaya: 'Vikneswaran' },
  21: { day_shift: 'Shahmi', night_shift: 'Dani' },
  22: { day_shift: 'Shahmi', night_shift: 'Dani' },
  23: { day_shift: 'Izzul', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Naz Han', cyberjaya: 'Vikneswaran', leaves: 'AL - Izzul & Naz', replacement: 'KAVEN DAY SHIFT' },
  24: { day_shift: 'Izzul', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Naz Han', cyberjaya: 'Vikneswaran', leaves: 'AL - Izzul', replacement: 'KAVEN DAY SHIFT' },
  25: { day_shift: 'Izzul', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Naz Han', cyberjaya: 'Vikneswaran' },
  26: { day_shift: 'Izzul', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Naz Han', cyberjaya: 'Vikneswaran' },
  27: { day_shift: 'Shahmi', office_hours: ['Rajeev', 'Nina', 'Sabbir', 'Kaven'], night_shift: 'Dani', cyberjaya: 'Vikneswaran' },
  28: { day_shift: 'Shahmi', night_shift: 'Dani' },
  29: { day_shift: 'Shahmi', night_shift: 'Dani' },
  30: { day_shift: 'Shahmi', office_hours: ['Rajeev', 'Nina', 'Sabbir'], night_shift: 'Dani', cyberjaya: 'Vikneswaran' }
};

function generateMonthTemplate(monthLabel: string): ScheduleRow[] {
  const monthIndex = MONTHS_2026.indexOf(monthLabel);
  const safeMonthIndex = monthIndex >= 0 ? monthIndex : 10;
  const daysInMonth = new Date(2026, safeMonthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, idx) => {
    const dayNum = idx + 1;
    const dateObj = new Date(2026, safeMonthIndex, dayNum);
    const dayName = DAY_LABELS[dateObj.getDay()];
    const isWeekday = dateObj.getDay() >= 1 && dateObj.getDay() <= 5;

    const baseRow: ScheduleRow = {
      id: `${monthLabel}-${dayNum}`,
      schedule_month: monthLabel,
      day_num: dayNum,
      day_name: dayName,
      day_shift: '',
      office_hours: isWeekday ? ['Rajeev', 'Nina', 'Sabbir', 'Kaven'] : [],
      night_shift: '',
      cyberjaya: isWeekday ? 'Vikneswaran' : '',
      leaves: '',
      replacement: '',
      remarks: ''
    };

    if (monthLabel === 'November 2026' && NOV_2026_OVERRIDES[dayNum]) {
      return { ...baseRow, ...NOV_2026_OVERRIDES[dayNum] };
    }

    return baseRow;
  });
}

const PERSON_COLORS: Record<string, { bg: string; fg: string }> = {
  Izzul: { bg: '#00e5ff', fg: '#000' },
  Dani: { bg: '#ffee32', fg: '#000' },
  'Naz Han': { bg: '#ff9800', fg: '#000' },
  Shahmi: { bg: '#2ecc71', fg: '#000' },
  Rajeev: { bg: '#7b3f5b', fg: '#fff' },
  Nina: { bg: '#f5d7a1', fg: '#000' },
  Sabbir: { bg: '#2b7de9', fg: '#fff' },
  Kaven: { bg: '#f4b6c2', fg: '#000' },
  Vikneswaran: { bg: '#e53935', fg: '#fff' },
  'DIWALI PH': { bg: '#111', fg: '#fff' },
  PH: { bg: '#111', fg: '#fff' }
};

function getBadgeStyle(name: string) {
  const clean = name.trim();
  if (PERSON_COLORS[clean]) {
    return {
      backgroundColor: PERSON_COLORS[clean].bg,
      color: PERSON_COLORS[clean].fg
    };
  }
  return {
    backgroundColor: 'rgba(0, 255, 255, 0.16)',
    color: '#00ffff'
  };
}

export default function ScheduleView({ userRole, onBack }: ScheduleViewProps) {
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [rows, setRows] = useState<ScheduleRow[]>(() => generateMonthTemplate('November 2026'));
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRow, setEditingRow] = useState<ScheduleRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState('');

  // Form state for Add / Edit
  const [dayNum, setDayNum] = useState<number>(1);
  const [dayName, setDayName] = useState('MON');
  const [dayShift, setDayShift] = useState('');
  const [officeHoursText, setOfficeHoursText] = useState('Rajeev, Nina, Sabbir, Kaven');
  const [nightShift, setNightShift] = useState('');
  const [cyberjaya, setCyberjaya] = useState('');
  const [leaves, setLeaves] = useState('');
  const [replacement, setReplacement] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const template = generateMonthTemplate(selectedMonth);
    setRows(template);

    async function loadSchedule() {
      try {
        const { data, error } = await supabase
          .from('noc_schedule')
          .select('*')
          .eq('schedule_month', selectedMonth)
          .order('day_num', { ascending: true });

        if (!error && data && data.length > 0) {
          const mergedMap = new Map<number, ScheduleRow>();
          template.forEach((item) => mergedMap.set(item.day_num, item));
          data.forEach((dbRow: ScheduleRow) => {
            mergedMap.set(dbRow.day_num, dbRow);
          });
          setRows(Array.from(mergedMap.values()).sort((a, b) => a.day_num - b.day_num));
        }
      } catch {
        // Keep generated template when offline or in sandbox
      }
    }

    loadSchedule();
  }, [selectedMonth]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      String(r.day_num).includes(q) ||
      r.day_name?.toLowerCase().includes(q) ||
      r.day_shift?.toLowerCase().includes(q) ||
      r.office_hours?.some((p) => p.toLowerCase().includes(q)) ||
      r.night_shift?.toLowerCase().includes(q) ||
      r.cyberjaya?.toLowerCase().includes(q) ||
      r.leaves?.toLowerCase().includes(q) ||
      r.replacement?.toLowerCase().includes(q) ||
      r.remarks?.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  const openAddModal = () => {
    if (!isAdmin) return;
    const monthIndex = MONTHS_2026.indexOf(selectedMonth);
    const nextDay = rows.length ? Math.min(Math.max(...rows.map((r) => r.day_num)) + 1, 31) : 1;
    const computedDayName = monthIndex >= 0 ? DAY_LABELS[new Date(2026, monthIndex, nextDay).getDay()] : 'MON';

    setEditingRow(null);
    setIsAdding(true);
    setDayNum(nextDay);
    setDayName(computedDayName);
    setDayShift('');
    setOfficeHoursText('Rajeev, Nina, Sabbir, Kaven');
    setNightShift('');
    setCyberjaya('Vikneswaran');
    setLeaves('');
    setReplacement('');
    setRemarks('');
  };

  const openEditModal = (row: ScheduleRow) => {
    if (!isAdmin) return;
    setIsAdding(false);
    setEditingRow(row);
    setDayNum(row.day_num);
    setDayName(row.day_name);
    setDayShift(row.day_shift || '');
    setOfficeHoursText((row.office_hours || []).join(', '));
    setNightShift(row.night_shift || '');
    setCyberjaya(row.cyberjaya || '');
    setLeaves(row.leaves || '');
    setReplacement(row.replacement || '');
    setRemarks(row.remarks || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const parsedOfficeHours = officeHoursText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      schedule_month: selectedMonth,
      day_num: Number(dayNum),
      day_name: dayName.trim().toUpperCase(),
      day_shift: dayShift.trim(),
      office_hours: parsedOfficeHours,
      night_shift: nightShift.trim(),
      cyberjaya: cyberjaya.trim(),
      leaves: leaves.trim(),
      replacement: replacement.trim(),
      remarks: remarks.trim()
    };

    if (editingRow) {
      try {
        if (typeof editingRow.id === 'number') {
          await supabase.from('noc_schedule').update(payload).eq('id', editingRow.id);
        } else {
          await supabase.from('noc_schedule').insert([payload]);
        }
      } catch {
        // Fallback to local state
      }

      setRows((prev) =>
        prev
          .map((r) => (r.day_num === editingRow.day_num ? { ...r, ...payload } : r))
          .sort((a, b) => a.day_num - b.day_num)
      );
      setToast(`Updated ${selectedMonth} — Day ${payload.day_num} (${payload.day_name})`);
    } else {
      let created: ScheduleRow = { id: `${selectedMonth}-${payload.day_num}-${Date.now()}`, ...payload };
      try {
        const { data } = await supabase.from('noc_schedule').insert([payload]).select().single();
        if (data) created = data;
      } catch {
        // Fallback to local state
      }

      setRows((prev) => {
        const withoutSameDay = prev.filter((r) => r.day_num !== payload.day_num);
        return [...withoutSameDay, created].sort((a, b) => a.day_num - b.day_num);
      });
      setToast(`Saved ${selectedMonth} — Day ${payload.day_num} (${payload.day_name})`);
    }

    setEditingRow(null);
    setIsAdding(false);
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 22px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#ff9800' }}>ICTO Schedule</span> — {selectedMonth}
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.88rem', margin: 0 }}>
            {isAdmin
              ? 'Admin mode: Add or edit full-year shift assignments, leaves, and replacements.'
              : 'View-only mode: Shift roster, Cyberjaya coverage, leaves, and replacements.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(18, 18, 22, 0.95)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '20px',
              color: '#00ffff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {MONTHS_2026.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={openAddModal}
              style={{
                background: 'linear-gradient(90deg, #8a2be2, #00ffff)',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Add Schedule Day
            </button>
          )}

          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Back to Portal
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 18px auto' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by engineer name (e.g. Izzul, Dani, Shahmi), day, leave, or replacement..."
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '11px 16px',
            backgroundColor: 'rgba(18, 18, 22, 0.9)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />
      </div>

      {toast && (
        <div style={{ maxWidth: '1240px', margin: '0 auto 18px auto', backgroundColor: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.88rem' }}>
          ✓ {toast}
        </div>
      )}

      {/* Schedule Table */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', backgroundColor: 'rgba(22, 22, 26, 0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '980px' }}>
          <thead>
            <tr style={{ backgroundColor: '#111114', borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#fff', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.8px' }}>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '95px' }}>Date / Day</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '115px' }}>Day Shift</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '250px' }}>Office Hours</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '115px' }}>Night Shift</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '120px' }}>Cyberjaya</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Leaves</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Replacement</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Remarks</th>
              {isAdmin && <th style={{ padding: '12px 10px', textAlign: 'right', width: '90px' }}>Edit</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const isWeekend = row.day_name === 'SAT' || row.day_name === 'SUN';
              return (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    backgroundColor: isWeekend ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 'bold' }}>
                    <span style={{ display: 'inline-block', width: '24px', color: '#00ffff' }}>{row.day_num}</span>
                    <span style={{ color: isWeekend ? '#ff9800' : '#ccc', fontSize: '0.75rem' }}>{row.day_name}</span>
                  </td>

                  <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                    {row.day_shift && (
                      <span style={{ ...getBadgeStyle(row.day_shift), display: 'inline-block', width: '100%', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.78rem' }}>
                        {row.day_shift}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max((row.office_hours || []).length, 1)}, minmax(0, 1fr))`, gap: '4px' }}>
                      {(row.office_hours || []).map((person, idx) => (
                        <span
                          key={idx}
                          style={{
                            ...getBadgeStyle(person),
                            padding: '4px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {person}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                    {row.night_shift && (
                      <span style={{ ...getBadgeStyle(row.night_shift), display: 'inline-block', width: '100%', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.78rem' }}>
                        {row.night_shift}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                    {row.cyberjaya && (
                      <span style={{ ...getBadgeStyle(row.cyberjaya), display: 'inline-block', width: '100%', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.78rem' }}>
                        {row.cyberjaya}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '9px 10px', textAlign: 'center', color: '#00e5ff', fontWeight: '600' }}>
                    {row.leaves}
                  </td>

                  <td style={{ padding: '9px 10px', textAlign: 'center', color: '#ffd54f', fontWeight: 'bold' }}>
                    {row.replacement}
                  </td>

                  <td style={{ padding: '9px 10px', textAlign: 'center', color: '#b0b0b0' }}>
                    {row.remarks}
                  </td>

                  {isAdmin && (
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(row)}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADMIN ADD / EDIT MODAL */}
      {isAdmin && (isAdding || editingRow) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '460px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.35)', borderRadius: '20px', padding: '28px' }}>
            <h2 style={{ margin: '0 0 18px 0', color: '#00ffff', fontSize: '1.2rem' }}>
              {editingRow ? `Edit ${selectedMonth} — Day ${dayNum}` : `Add Day to ${selectedMonth}`}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Date (1–31)</label>
                  <input type="number" min={1} max={31} required value={dayNum} onChange={(e) => setDayNum(Number(e.target.value))} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Day (MON–SUN)</label>
                  <input type="text" required value={dayName} onChange={(e) => setDayName(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Day Shift</label>
                <input type="text" placeholder="e.g. Izzul, Dani, Naz Han, Shahmi" value={dayShift} onChange={(e) => setDayShift(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Office Hours (comma-separated)</label>
                <input type="text" placeholder="Rajeev, Nina, Sabbir, Kaven" value={officeHoursText} onChange={(e) => setOfficeHoursText(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Night Shift</label>
                  <input type="text" value={nightShift} onChange={(e) => setNightShift(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Cyberjaya</label>
                  <input type="text" value={cyberjaya} onChange={(e) => setCyberjaya(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Leaves</label>
                <input type="text" placeholder="e.g. AL - Nina" value={leaves} onChange={(e) => setLeaves(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Replacement</label>
                <input type="text" placeholder="e.g. SHAHMI @ CJ" value={replacement} onChange={(e) => setReplacement(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>Remarks</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '11px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingRow(null);
                  }}
                  style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}