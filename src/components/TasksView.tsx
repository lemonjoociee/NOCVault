import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

interface TasksViewProps {
  userRole: string;
  userEmail?: string;
  onBack: () => void;
}

type TaskProgressStatus = 'In Progress' | 'Completed';

interface NocTask {
  id: number | string;
  title: string;
  description: string;
  checklist?: string[];
  file_path?: string;
  assigned_to: string;
  status: TaskProgressStatus | string;
  due_date: string;
  update_comment?: string;
  update_notes?: string[];
  updated_by?: string;
}

const DEFAULT_TASKS: NocTask[] = [
  {
    id: 1,
    title: 'Lenovo Headsets',
    description: 'Kindly find Lenovo headsets in Mozart 2.0 (ICT Stock) and update the serial numbers on the Excel.',
    file_path: '\\\\10.1.5.201\\Applications\\Details\\Lenovo Headsets - ICT Stock.xlsx',
    checklist: [],
    assigned_to: 'All NOC',
    status: 'Completed',
    due_date: '2026-11-26',
    update_comment:
      'Located Lenovo headsets in Mozart 2.0 (ICT Stock).\nVerified and updated all headset serial numbers in the Excel file.',
    update_notes: [
      'Located Lenovo headsets in Mozart 2.0 (ICT Stock).',
      'Verified and updated all headset serial numbers in the Excel file.'
    ],
    updated_by: 'izzul.azhar@scicom.com.my'
  },
  {
    id: 2,
    title: 'Laptops',
    description: 'Kindly find (2) Dell Latitude 7290 laptops with good battery in Celcom Cupboard and do the following:',
    file_path: '',
    checklist: [
      'perform full system updates through OS, Support Assist & Store',
      'ensure basic apps + MS Office are installed',
      'install 7-zip',
      'install CMS Supervisor R19, Avaya AIC and Avaya One-X Communicator',
      "join domain as 'ASU-GAVIN-NB' and 'ASU-JACK-NB'",
      'install Anydesk, Ninja and Bitdefender',
      'prep necessary forms || #1391328',
      'update the Laptop Setup Excel',
      'keep each laptop together with its charger in a separate bag'
    ],
    assigned_to: 'Shahmi',
    status: 'Completed',
    due_date: '2026-11-28',
    update_comment: [
      'Located 2 Dell Latitude 7290 laptops with good battery condition from Celcom Cupboard.',
      'Performed full system updates through Windows OS, Dell SupportAssist, and Microsoft Store.',
      'Installed basic applications and MS Office.',
      'Installed 7-Zip, CMS Supervisor R19, Avaya AIC, and Avaya One-X Communicator.',
      'Joined domains as ASU-GAVIN-NB and ASU-JACK-NB.',
      'Installed AnyDesk, Ninja, and Bitdefender.',
      'Prepared the necessary forms (#1391328).',
      'Updated the Laptop Setup Excel accordingly.',
      'Placed each laptop together with its charger in a separate bag.'
    ].join('\n'),
    update_notes: [
      'Located 2 Dell Latitude 7290 laptops with good battery condition from Celcom Cupboard.',
      'Performed full system updates through Windows OS, Dell SupportAssist, and Microsoft Store.',
      'Installed basic applications and MS Office.',
      'Installed 7-Zip, CMS Supervisor R19, Avaya AIC, and Avaya One-X Communicator.',
      'Joined domains as ASU-GAVIN-NB and ASU-JACK-NB.',
      'Installed AnyDesk, Ninja, and Bitdefender.',
      'Prepared the necessary forms (#1391328).',
      'Updated the Laptop Setup Excel accordingly.',
      'Placed each laptop together with its charger in a separate bag.'
    ],
    updated_by: 'izzul.azhar@scicom.com.my'
  }
];

function normalizeStatus(status?: string): TaskProgressStatus {
  return status === 'Completed' ? 'Completed' : 'In Progress';
}

function parseBulletLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.replace(/^[\s•\-*·]+/, '').trim())
    .filter(Boolean);
}

function getUpdateBullets(task: NocTask): string[] {
  if (Array.isArray(task.update_notes) && task.update_notes.length > 0) {
    return task.update_notes.map((n) => n.replace(/^[\s•\-*·]+/, '').trim()).filter(Boolean);
  }
  if (task.update_comment) {
    return parseBulletLines(task.update_comment);
  }
  return [];
}

function formatTaskHandoverText(task: NocTask, index: number): string {
  const statusLabel = normalizeStatus(task.status);
  const bullets = getUpdateBullets(task);
  const header = `${index + 1}) ${task.title} - ${statusLabel}`;
  if (bullets.length === 0) return header;
  return `${header}\n\n${bullets.map((b) => `· ${b}`).join('\n')}`;
}

export default function TasksView({ userRole, userEmail = '', onBack }: TasksViewProps) {
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const [tasks, setTasks] = useState<NocTask[]>(DEFAULT_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskProgressStatus>('ALL');
  const [expandedGivenIds, setExpandedGivenIds] = useState<Record<string, boolean>>({});
  const [expandedUpdateIds, setExpandedUpdateIds] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Add / Edit Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingTask, setEditingTask] = useState<NocTask | null>(null);

  // NOC (and Admin) Progress + Comment Modal State
  const [progressTask, setProgressTask] = useState<NocTask | null>(null);
  const [progressStatus, setProgressStatus] = useState<TaskProgressStatus>('In Progress');
  const [progressComment, setProgressComment] = useState<string>('');
  const [savingProgress, setSavingProgress] = useState(false);

  // Admin Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFilePath, setFormFilePath] = useState('');
  const [formChecklistText, setFormChecklistText] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('All NOC');
  const [formStatus, setFormStatus] = useState<TaskProgressStatus>('In Progress');
  const [formDueDate, setFormDueDate] = useState('');
  const [formComment, setFormComment] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const { data, error } = await supabase
          .from('noc_tasks')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          setTasks(data);
        }
      } catch {
        // Keep default tasks in offline/sandbox mode
      }
    }
    loadTasks();
  }, []);

  const showToast = (msg: string) => {
    setErrorMsg('');
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const showError = (msg: string) => {
    setToast('');
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const toggleGivenExpand = (id: number | string) => {
    const key = String(id);
    setExpandedGivenIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleUpdateExpand = (id: number | string) => {
    const key = String(id);
    setExpandedUpdateIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      const currentStatus = normalizeStatus(t.status);
      const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const bullets = getUpdateBullets(t);
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.file_path?.toLowerCase().includes(q) ||
        t.assigned_to?.toLowerCase().includes(q) ||
        bullets.some((b) => b.toLowerCase().includes(q)) ||
        (Array.isArray(t.checklist) && t.checklist.some((item) => item.toLowerCase().includes(q)))
      );
    });
  }, [tasks, searchQuery, statusFilter]);

  const handleCopyAllUpdates = async () => {
    const block = filteredTasks
      .map((t, idx) => formatTaskHandoverText(t, idx))
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(block);
      showToast('Copied formatted task updates to clipboard.');
    } catch {
      showError('Could not copy automatically in this browser.');
    }
  };

  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormFilePath('');
    setFormChecklistText('');
    setFormAssignedTo('All NOC');
    setFormStatus('In Progress');
    setFormDueDate('');
    setFormComment('');
    setShowAdminModal(true);
  };

  const handleOpenEdit = (task: NocTask) => {
    if (!isAdmin) return;
    const bullets = getUpdateBullets(task);
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormFilePath(task.file_path || '');
    setFormChecklistText(Array.isArray(task.checklist) ? task.checklist.join('\n') : '');
    setFormAssignedTo(task.assigned_to || 'All NOC');
    setFormStatus(normalizeStatus(task.status));
    setFormDueDate(task.due_date || '');
    setFormComment(bullets.join('\n'));
    setShowAdminModal(true);
  };

  const handleSaveAdminTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !formTitle.trim()) return;

    const parsedChecklist = parseBulletLines(formChecklistText);
    const parsedNotes = parseBulletLines(formComment);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      file_path: formFilePath.trim(),
      checklist: parsedChecklist,
      assigned_to: formAssignedTo.trim() || 'All NOC',
      status: formStatus,
      due_date: formDueDate,
      update_comment: parsedNotes.join('\n'),
      update_notes: parsedNotes,
      updated_by: userEmail || 'Admin'
    };

    if (editingTask) {
      try {
        if (typeof editingTask.id === 'number') {
          const { error } = await supabase
            .from('noc_tasks')
            .update(payload)
            .eq('id', editingTask.id);
          if (error) showError(`Database note: ${error.message} (saved locally)`);
        }
      } catch {
        // Local fallback
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...payload } : t))
      );
      showToast(`Task "${payload.title}" updated.`);
    } else {
      let created: NocTask = { id: Date.now(), ...payload };
      try {
        const { data, error } = await supabase
          .from('noc_tasks')
          .insert([payload])
          .select()
          .single();
        if (error) {
          showError(`Database note: ${error.message} (saved locally)`);
        } else if (data) {
          created = data;
        }
      } catch {
        // Local fallback
      }
      setTasks((prev) => [...prev, created]);
      setExpandedGivenIds((prev) => ({ ...prev, [String(created.id)]: true }));
      showToast(`New task "${payload.title}" added.`);
    }

    setShowAdminModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (task: NocTask) => {
    if (!isAdmin) return;
    if (!window.confirm(`Delete task "${task.title}"?`)) return;

    try {
      if (typeof task.id === 'number') {
        await supabase.from('noc_tasks').delete().eq('id', task.id);
      }
    } catch {
      // Local fallback
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    showToast('Task removed.');
  };

  const handleOpenProgressModal = (task: NocTask) => {
    const bullets = getUpdateBullets(task);
    setProgressTask(task);
    setProgressStatus(normalizeStatus(task.status));
    setProgressComment(bullets.join('\n'));
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressTask || savingProgress) return;

    setSavingProgress(true);
    const updater = userEmail || userRole || 'NOC';
    const parsedNotes = parseBulletLines(progressComment);

    const updateFields = {
      status: progressStatus,
      update_comment: parsedNotes.join('\n'),
      update_notes: parsedNotes,
      updated_by: updater
    };

    try {
      if (typeof progressTask.id === 'number') {
        const { error } = await supabase
          .from('noc_tasks')
          .update(updateFields)
          .eq('id', progressTask.id);
        if (error) {
          showError(`Could not sync to Supabase: ${error.message} (updated in view)`);
        } else {
          showToast(`Saved ${progressTask.title} - ${progressStatus}.`);
        }
      } else {
        showToast(`Updated ${progressTask.title} - ${progressStatus}.`);
      }
    } catch {
      showToast(`Updated ${progressTask.title} - ${progressStatus}.`);
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === progressTask.id ? { ...t, ...updateFields } : t))
    );
    setExpandedUpdateIds((prev) => ({ ...prev, [String(progressTask.id)]: true }));
    setSavingProgress(false);
    setProgressTask(null);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div style={{ maxWidth: '1320px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>NOC</span> Tasks
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem', margin: 0 }}>
            {isAdmin
              ? 'Admin mode: Click a task title to expand details, or add/edit/delete tasks.'
              : 'NOC mode: Click a task title to view steps & instructions, and update progress.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyAllUpdates}
            style={{
              background: 'rgba(0, 255, 255, 0.12)',
              border: '1px solid rgba(0, 255, 255, 0.35)',
              color: '#00ffff',
              padding: '10px 18px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}
          >
            Copy Updates
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
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
              + Add Task
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

      {/* Search & Status Filter */}
      <div style={{ maxWidth: '1320px', margin: '0 auto 20px auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search task title, instructions, steps, path, assignee, or update notes..."
          style={{
            flex: 1,
            minWidth: '260px',
            padding: '12px 16px',
            backgroundColor: 'rgba(18, 18, 22, 0.9)',
            border: '1px solid rgba(0, 255, 255, 0.25)',
            borderRadius: '14px',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TaskProgressStatus)}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(18, 18, 22, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            color: '#00ffff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">All Tasks ({tasks.length})</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {toast && (
        <div style={{ maxWidth: '1320px', margin: '0 auto 18px auto', backgroundColor: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.88rem' }}>
          ✓ {toast}
        </div>
      )}

      {errorMsg && (
        <div style={{ maxWidth: '1320px', margin: '0 auto 18px auto', backgroundColor: 'rgba(255, 51, 51, 0.15)', border: '1px solid #ff4d4d', color: '#ff8080', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.88rem' }}>
          ! {errorMsg}
        </div>
      )}

      {/* Two-Column Split: Giving Task (Left) & Task Updates (Right) */}
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '22px',
          alignItems: 'start'
        }}
      >
        {/* LEFT COLUMN: GIVEN TASKS */}
        <div
          style={{
            backgroundColor: 'rgba(18, 18, 22, 0.92)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 14px 36px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#00ffff' }}>
              Tasks
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#999' }}>Click title to view steps</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
              No tasks found.
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              const isOpen = !!expandedGivenIds[String(task.id)];
              const checklistItems = Array.isArray(task.checklist) ? task.checklist : [];

              return (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: 'rgba(26, 26, 32, 0.9)',
                    border: isOpen ? '1px solid rgba(0, 255, 255, 0.45)' : '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Clickable Title Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => toggleGivenExpand(task.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: 1
                      }}
                    >
                      <span style={{ color: '#00ffff', fontSize: '0.85rem', width: '16px' }}>
                        {isOpen ? '▼' : '▶'}
                      </span>
                      <span>
                        {index + 1}) {task.title}
                      </span>
                    </button>

                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(task)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            padding: '5px 11px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task)}
                          style={{
                            background: 'rgba(255, 51, 51, 0.15)',
                            border: '1px solid rgba(255, 51, 51, 0.4)',
                            color: '#ff4d4d',
                            padding: '5px 11px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Description, File Path & Steps */}
                  {isOpen && (
                    <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.76rem', color: '#00ffff' }}>
                        <span>Assigned: {task.assigned_to}</span>
                        {task.due_date && <span style={{ color: '#aaa' }}>• Due: {task.due_date}</span>}
                      </div>

                      {task.description && (
                        <p style={{ margin: 0, color: '#dcdcdc', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {task.description}
                        </p>
                      )}

                      {task.file_path && (
                        <div style={{ fontSize: '0.84rem', color: '#00ffff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          Excel: {task.file_path}
                        </div>
                      )}

                      {checklistItems.length > 0 && (
                        <ul style={{ margin: '2px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#d0d0d0', fontSize: '0.88rem', lineHeight: '1.45' }}>
                          {checklistItems.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: TASK UPDATES */}
        <div
          style={{
            backgroundColor: 'rgba(14, 42, 32, 0.42)',
            border: '1px solid rgba(0, 255, 136, 0.25)',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 14px 36px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 136, 0.16)', paddingBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#00ff88' }}>
              Task Updates
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#9ab8ab' }}>Click title to view notes</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#889992', fontSize: '0.9rem' }}>
              No task updates found.
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              const currentStatus = normalizeStatus(task.status);
              const isDone = currentStatus === 'Completed';
              const isOpen = !!expandedUpdateIds[String(task.id)];
              const updateBullets = getUpdateBullets(task);

              return (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: 'rgba(16, 46, 36, 0.55)',
                    border: isOpen ? '1px solid rgba(0, 255, 136, 0.45)' : '1px solid rgba(0, 255, 136, 0.16)',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Clickable Title - Status + Update Progress Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => toggleUpdateExpand(task.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: isDone ? '#00ff88' : '#00e5ff',
                        fontSize: '1.02rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: 1
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', width: '16px' }}>
                        {isOpen ? '▼' : '▶'}
                      </span>
                      <span>
                        {index + 1}) {task.title} - {currentStatus}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenProgressModal(task)}
                      style={{
                        background: 'rgba(0, 255, 255, 0.14)',
                        border: '1px solid rgba(0, 255, 255, 0.4)',
                        color: '#00ffff',
                        padding: '6px 14px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.76rem',
                        flexShrink: 0
                      }}
                    >
                      Update Progress
                    </button>
                  </div>

                  {/* Expanded Bulleted Progress Notes */}
                  {isOpen && (
                    <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '5px', borderTop: '1px solid rgba(0, 255, 136, 0.14)', paddingTop: '10px' }}>
                      {updateBullets.length > 0 ? (
                        updateBullets.map((line, lIdx) => (
                          <div key={lIdx} style={{ fontSize: '0.9rem', color: '#e8f5ee', lineHeight: '1.45' }}>
                            · {line}
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.84rem', color: '#889992' }}>
                          · No progress update logged yet.
                        </div>
                      )}

                      {task.updated_by && (
                        <div style={{ fontSize: '0.74rem', color: '#8aa399', marginTop: '4px' }}>
                          Updated by {task.updated_by}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* UPDATE TASK PROGRESS MODAL: ONLY PROGRESS STATE + BULLETED COMMENT */}
      {progressTask && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '480px', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.35)', borderRadius: '20px', padding: '28px' }}>
            <h2 style={{ margin: '0 0 6px 0', color: '#00ffff', fontSize: '1.2rem' }}>Update Task Progress</h2>
            <p style={{ margin: '0 0 18px 0', color: '#aaa', fontSize: '0.85rem' }}>{progressTask.title}</p>

            <form onSubmit={handleSaveProgress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Progress State
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {(['In Progress', 'Completed'] as TaskProgressStatus[]).map((stateOption) => {
                    const active = progressStatus === stateOption;
                    return (
                      <button
                        key={stateOption}
                        type="button"
                        onClick={() => setProgressStatus(stateOption)}
                        style={{
                          padding: '11px',
                          borderRadius: '12px',
                          border: active ? '1px solid #00ffff' : '1px solid rgba(255,255,255,0.15)',
                          background: active ? 'rgba(0,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#00ffff' : '#ccc',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {stateOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px', textTransform: 'uppercase' }}>
                  What have you done? (One item per line)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={"Located Lenovo headsets in Mozart 2.0 (ICT Stock).\nVerified and updated all headset serial numbers in the Excel file."}
                  value={progressComment}
                  onChange={(e) => setProgressComment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    background: '#1c1c24',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={savingProgress}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {savingProgress ? 'Saving...' : 'Save Progress'}
                </button>
                <button
                  type="button"
                  onClick={() => setProgressTask(null)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN ADD / EDIT TASK MODAL */}
      {isAdmin && showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.35)', borderRadius: '20px', padding: '28px' }}>
            <h2 style={{ margin: '0 0 18px 0', color: '#00ffff', fontSize: '1.2rem' }}>
              {editingTask ? 'Edit NOC Task' : 'Add New NOC Task'}
            </h2>

            <form onSubmit={handleSaveAdminTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lenovo Headsets or Laptops"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Instruction / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Kindly find ... in ... and do the following:"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Checklist Steps (one per line)</label>
                <textarea
                  rows={4}
                  placeholder={"perform full system updates through OS, Support Assist & Store\ninstall 7-zip\nupdate the Laptop Setup Excel"}
                  value={formChecklistText}
                  onChange={(e) => setFormChecklistText(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>File / Network Path (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. \\10.1.5.201\Applications\Details\..."
                  value={formFilePath}
                  onChange={(e) => setFormFilePath(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Assigned To</label>
                  <input
                    type="text"
                    placeholder="e.g. All NOC, Shahmi"
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Progress State</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TaskProgressStatus)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Update Bullets (one per line)</label>
                <textarea
                  rows={3}
                  placeholder={"Located item in stock...\nUpdated tracker..."}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setEditingTask(null);
                  }}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer' }}
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