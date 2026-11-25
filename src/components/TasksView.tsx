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
  assigned_to: string;
  status: TaskProgressStatus | string;
  progress: number;
  due_date: string;
  updated_by?: string;
}

const DEFAULT_TASKS: NocTask[] = [
  {
    id: 1,
    title: 'Daily TM Gateway Health & Latency Check',
    description: 'Verify upstream gateway response times, packet loss, and active SIP/auth queues during shift handover.',
    assigned_to: 'All NOC',
    status: 'In Progress',
    progress: 50,
    due_date: '2026-11-26',
    updated_by: 'izzul.azhar@scicom.com.my'
  },
  {
    id: 2,
    title: 'Weekly SSL Certificate Expiry Audit',
    description: 'Check expiring TLS certificates across Cyberjaya and primary production endpoints.',
    assigned_to: 'Shahmi',
    status: 'In Progress',
    progress: 0,
    due_date: '2026-11-28',
    updated_by: 'izzul.azhar@scicom.com.my'
  }
];

function normalizeStatus(status?: string, progress?: number): TaskProgressStatus {
  if (status === 'Completed' || (typeof progress === 'number' && progress >= 100)) {
    return 'Completed';
  }
  return 'In Progress';
}

export default function TasksView({ userRole, userEmail = '', onBack }: TasksViewProps) {
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const [tasks, setTasks] = useState<NocTask[]>(DEFAULT_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskProgressStatus>('ALL');
  const [toast, setToast] = useState('');

  // Admin Add / Edit Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingTask, setEditingTask] = useState<NocTask | null>(null);

  // NOC (and Admin) Progress Update Modal State
  const [progressTask, setProgressTask] = useState<NocTask | null>(null);
  const [progressStatus, setProgressStatus] = useState<TaskProgressStatus>('In Progress');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Admin Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('All NOC');
  const [formStatus, setFormStatus] = useState<TaskProgressStatus>('In Progress');
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formDueDate, setFormDueDate] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const { data, error } = await supabase
          .from('noc_tasks')
          .select('*')
          .order('id', { ascending: false });

        if (!error && data && data.length > 0) {
          setTasks(data);
        }
      } catch {
        // Fallback to default local tasks in sandbox
      }
    }
    loadTasks();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      const currentStatus = normalizeStatus(t.status, t.progress);
      const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assigned_to?.toLowerCase().includes(q)
      );
    });
  }, [tasks, searchQuery, statusFilter]);

  // Admin: Open Add Modal
  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormAssignedTo('All NOC');
    setFormStatus('In Progress');
    setFormProgress(0);
    setFormDueDate('');
    setShowAdminModal(true);
  };

  // Admin: Open Edit Modal
  const handleOpenEdit = (task: NocTask) => {
    if (!isAdmin) return;
    const normStatus = normalizeStatus(task.status, task.progress);
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormAssignedTo(task.assigned_to || 'All NOC');
    setFormStatus(normStatus);
    setFormProgress(normStatus === 'Completed' ? 100 : Math.min(95, Number(task.progress) || 0));
    setFormDueDate(task.due_date || '');
    setShowAdminModal(true);
  };

  // Admin: Save New or Edited Task
  const handleSaveAdminTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !formTitle.trim()) return;

    const finalStatus: TaskProgressStatus =
      formStatus === 'Completed' || Number(formProgress) >= 100
        ? 'Completed'
        : 'In Progress';
    const finalProgress =
      finalStatus === 'Completed' ? 100 : Math.min(95, Math.max(0, Number(formProgress)));

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      assigned_to: formAssignedTo.trim() || 'All NOC',
      status: finalStatus,
      progress: finalProgress,
      due_date: formDueDate,
      updated_by: userEmail || 'Admin'
    };

    if (editingTask) {
      try {
        if (typeof editingTask.id === 'number') {
          await supabase.from('noc_tasks').update(payload).eq('id', editingTask.id);
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
        const { data } = await supabase
          .from('noc_tasks')
          .insert([payload])
          .select()
          .single();
        if (data) created = data;
      } catch {
        // Local fallback
      }
      setTasks((prev) => [created, ...prev]);
      showToast(`New task "${payload.title}" added.`);
    }

    setShowAdminModal(false);
    setEditingTask(null);
  };

  // Admin: Delete Task
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

  // NOC (and Admin): Open Progress Modal
  const handleOpenProgressModal = (task: NocTask) => {
    const normStatus = normalizeStatus(task.status, task.progress);
    setProgressTask(task);
    setProgressStatus(normStatus);
    setProgressPercent(normStatus === 'Completed' ? 100 : Math.min(95, Number(task.progress) || 0));
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressTask) return;

    const finalStatus: TaskProgressStatus =
      progressStatus === 'Completed' || progressPercent >= 100
        ? 'Completed'
        : 'In Progress';
    const finalProgress =
      finalStatus === 'Completed' ? 100 : Math.min(95, Math.max(0, Number(progressPercent)));

    const updateFields = {
      status: finalStatus,
      progress: finalProgress,
      updated_by: userEmail || userRole
    };

    try {
      if (typeof progressTask.id === 'number') {
        await supabase
          .from('noc_tasks')
          .update(updateFields)
          .eq('id', progressTask.id);
      }
    } catch {
      // Local fallback
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === progressTask.id ? { ...t, ...updateFields } : t))
    );
    setProgressTask(null);
    showToast(`Marked as ${finalStatus} (${finalProgress}%).`);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div style={{ maxWidth: '1150px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>NOC</span> Operations Tasks
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem', margin: 0 }}>
            {isAdmin
              ? 'Admin mode: Add, edit, or delete tasks and monitor progress.'
              : 'NOC mode: View shift tasks and update progress between In Progress and Completed.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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

      {/* Search & Progress Filter */}
      <div style={{ maxWidth: '1150px', margin: '0 auto 20px auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search task title, assignee, or description..."
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
        <div style={{ maxWidth: '1150px', margin: '0 auto 18px auto', backgroundColor: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.88rem' }}>
          ✓ {toast}
        </div>
      )}

      {/* Task Cards List */}
      <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ backgroundColor: 'rgba(18, 18, 22, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#888' }}>
            No tasks found matching your filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const currentStatus = normalizeStatus(task.status, task.progress);
            const isDone = currentStatus === 'Completed';
            const pct = isDone ? 100 : Math.min(95, Math.max(0, Number(task.progress) || 0));

            return (
              <div
                key={task.id}
                style={{
                  backgroundColor: 'rgba(18, 18, 22, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '18px',
                  padding: '22px 26px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ maxWidth: '72%' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          backgroundColor: isDone ? 'rgba(0, 255, 136, 0.18)' : 'rgba(0, 229, 255, 0.18)',
                          color: isDone ? '#00ff88' : '#00e5ff'
                        }}
                      >
                        {currentStatus}
                      </span>
                      <span style={{ color: '#00ffff', fontSize: '0.78rem', fontWeight: '600' }}>
                        Assigned: {task.assigned_to}
                      </span>
                      {task.due_date && (
                        <span style={{ color: '#999', fontSize: '0.78rem' }}>
                          • Due: {task.due_date}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#fff' }}>{task.title}</h3>
                    {task.description && (
                      <p style={{ margin: 0, color: '#a0a0a0', fontSize: '0.86rem', lineHeight: '1.45' }}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Role Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenProgressModal(task)}
                      style={{
                        background: 'rgba(0, 255, 255, 0.14)',
                        border: '1px solid rgba(0, 255, 255, 0.4)',
                        color: '#00ffff',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}
                    >
                      Update Progress
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(task)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Edit Task
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task)}
                          style={{
                            background: 'rgba(255, 51, 51, 0.15)',
                            border: '1px solid rgba(255, 51, 51, 0.4)',
                            color: '#ff4d4d',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span style={{ color: '#b0b0b0' }}>
                      {currentStatus} {task.updated_by ? `• Updated by ${task.updated_by}` : ''}
                    </span>
                    <span style={{ color: isDone ? '#00ff88' : '#00ffff', fontWeight: 'bold' }}>{pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: isDone
                          ? 'linear-gradient(90deg, #00ff88, #00e5ff)'
                          : 'linear-gradient(90deg, #8a2be2, #00ffff)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NOC (AND ADMIN) PROGRESS MODAL: ONLY IN PROGRESS OR COMPLETED */}
      {progressTask && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '420px', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.35)', borderRadius: '20px', padding: '28px' }}>
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
                        onClick={() => {
                          setProgressStatus(stateOption);
                          if (stateOption === 'Completed') {
                            setProgressPercent(100);
                          } else if (progressPercent >= 100) {
                            setProgressPercent(50);
                          }
                        }}
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

              {progressStatus === 'In Progress' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <label style={{ color: '#ccc' }}>Completion %</label>
                    <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{progressPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={95}
                    step={5}
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#00ffff', cursor: 'pointer' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Progress
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

      {/* ADMIN ADD / FULL EDIT MODAL */}
      {isAdmin && showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '480px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.35)', borderRadius: '20px', padding: '28px' }}>
            <h2 style={{ margin: '0 0 18px 0', color: '#00ffff', fontSize: '1.2rem' }}>
              {editingTask ? 'Edit NOC Task' : 'Add New NOC Task'}
            </h2>

            <form onSubmit={handleSaveAdminTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Gateway Latency Check"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Description / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Step-by-step instructions or checklist..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Assigned To</label>
                  <input
                    type="text"
                    placeholder="e.g. All NOC, Shahmi, Dani"
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' }}>Progress</label>
                <select
                  value={formStatus}
                  onChange={(e) => {
                    const next = e.target.value as TaskProgressStatus;
                    setFormStatus(next);
                    if (next === 'Completed') setFormProgress(100);
                    else if (formProgress >= 100) setFormProgress(50);
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1c1c24', border: '1px solid #333', color: '#fff' }}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {formStatus === 'In Progress' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.75rem', color: '#aaa' }}>
                    <span>COMPLETION %</span>
                    <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{formProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={95}
                    step={5}
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#00ffff' }}
                  />
                </div>
              )}

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