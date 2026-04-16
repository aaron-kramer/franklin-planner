import { useState } from 'react';
import { Plus, Trash2, ArrowRight, UserCheck } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import type { Task, Priority, TaskStatus } from '../../types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface TaskListProps {
  date: string;
}

export function TaskList({ date }: TaskListProps) {
  const { tasks, roles, addTask, updateTask, deleteTask } = usePlannerStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [form, setForm] = useState({
    title: '',
    priority: 'B' as Priority,
    roleId: '',
    notes: '',
    delegatedTo: '',
  });

  const dayTasks = tasks
    .filter(t => t.date === date)
    .sort((a, b) => {
      const priorityOrder = { A: 0, B: 1, C: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority])
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      return a.priorityNumber - b.priorityNumber;
    });

  const openAdd = () => {
    setForm({ title: '', priority: 'B', roleId: '', notes: '', delegatedTo: '' });
    setEditingTask(null);
    setShowAddModal(true);
  };

  const openEdit = (task: Task) => {
    setForm({
      title: task.title,
      priority: task.priority,
      roleId: task.roleId || '',
      notes: task.notes || '',
      delegatedTo: task.delegatedTo || '',
    });
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingTask) {
      updateTask(editingTask.id, {
        title: form.title.trim(),
        priority: form.priority,
        roleId: form.roleId || undefined,
        notes: form.notes || undefined,
        delegatedTo: form.delegatedTo || undefined,
      });
    } else {
      const count = tasks.filter(t => t.date === date && t.priority === form.priority).length;
      addTask({
        title: form.title.trim(),
        priority: form.priority,
        priorityNumber: count + 1,
        date,
        status: 'pending',
        roleId: form.roleId || undefined,
        notes: form.notes || undefined,
        delegatedTo: form.delegatedTo || undefined,
      });
    }
    setShowAddModal(false);
  };

  const cycleStatus = (task: Task) => {
    const next: Record<TaskStatus, TaskStatus> = {
      pending: 'completed',
      completed: 'pending',
      'carried-forward': 'completed',
      delegated: 'completed',
      eliminated: 'pending',
    };
    updateTask(task.id, { status: next[task.status] });
  };

  const carryForward = (task: Task) => {
    updateTask(task.id, { status: 'carried-forward' });
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const count = tasks.filter(t => t.date === tomorrowStr && t.priority === task.priority).length;
    addTask({
      title: task.title,
      priority: task.priority,
      priorityNumber: count + 1,
      date: tomorrowStr,
      status: 'pending',
      roleId: task.roleId,
      notes: task.notes,
      originalDate: task.date,
    });
  };

  const getStatusDisplay = (task: Task) => {
    switch (task.status) {
      case 'completed':
        return { checkbox: '✓', borderColor: 'border-[#4aaa60]', bgColor: 'bg-[#0f2010]', textColor: 'text-[#4aaa60]', lineThrough: true };
      case 'carried-forward':
        return { checkbox: '→', borderColor: 'border-[#6a88c0]', bgColor: 'bg-[#0a0e18]', textColor: 'text-[#6a88c0]', lineThrough: false };
      case 'delegated':
        return { checkbox: 'D', borderColor: 'border-[#a060c0]', bgColor: 'bg-[#120a18]', textColor: 'text-[#a060c0]', lineThrough: false };
      case 'eliminated':
        return { checkbox: '✗', borderColor: 'border-[#8b1515]', bgColor: 'bg-[#1a0a0a]', textColor: 'text-[#8b1515]', lineThrough: true };
      default:
        return { checkbox: '', borderColor: 'border-[#4a2a18]', bgColor: '', textColor: 'text-[#4a2a18]', lineThrough: false };
    }
  };

  const getPriorityColor = (priority: Priority) => {
    return {
      A: 'bg-[#8b1515] text-[#f0d090]',
      B: 'bg-[#904008] text-[#f0d090]',
      C: 'bg-[#4a3020] text-[#b89060]',
    }[priority];
  };

  const getRoleColor = (roleId?: string) => {
    if (!roleId) return '#6a4828';
    return roles.find(r => r.id === roleId)?.color || '#6a4828';
  };

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null;
    return roles.find(r => r.id === roleId)?.name;
  };

  const groups = [
    { label: 'A — Must Do (Vital)', tasks: dayTasks.filter(t => t.priority === 'A') },
    { label: 'B — Should Do (Important)', tasks: dayTasks.filter(t => t.priority === 'B') },
    { label: 'C — Could Do (Optional)', tasks: dayTasks.filter(t => t.priority === 'C') },
  ];

  const inputClass = "w-full border border-[#5a2a18] rounded-lg px-3 py-2 text-sm bg-[#140e0a] text-[#e8d4a0] placeholder-[#3a2010] focus:outline-none focus:ring-2 focus:ring-[#8b1515]/40";

  return (
    <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3a2010]">
        <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Prioritized Task List</h2>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} /> Add Task
        </Button>
      </div>

      {/* Priority legend */}
      <div className="flex gap-3 md:gap-4 px-5 py-2.5 bg-[#140e0a] border-b border-[#3a2010] text-xs text-[#6a4828] flex-wrap">
        <span><strong className="text-[#c02020]">A</strong> = Must Do</span>
        <span><strong className="text-[#c05808]">B</strong> = Should Do</span>
        <span><strong className="text-[#6a5838]">C</strong> = Could Do</span>
        <span className="ml-auto"><strong className="text-[#6a88c0]">→</strong> = Carried</span>
        <span><strong className="text-[#a060c0]">D</strong> = Delegated</span>
      </div>

      {/* Tasks by group */}
      <div>
        {groups.map(group => (
          <div key={group.label}>
            <div className="px-5 py-2 bg-[#140e0a] border-b border-[#3a2010]">
              <span className="text-xs font-semibold text-[#6a4828] uppercase tracking-wider font-['Cinzel',serif]">{group.label}</span>
            </div>
            {group.tasks.length === 0 ? (
              <div className="px-5 py-3 text-sm text-[#3a2010] italic">No tasks</div>
            ) : (
              group.tasks.map(task => {
                const display = getStatusDisplay(task);
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 px-5 py-3 border-b border-[#2a1808] hover:bg-[#221810] group transition-colors ${
                      task.status === 'completed' || task.status === 'eliminated' ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Status checkbox */}
                    <button
                      onClick={() => cycleStatus(task)}
                      className={`shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold mt-0.5 transition-all ${display.borderColor} ${display.bgColor} ${display.textColor}`}
                    >
                      {display.checkbox}
                    </button>

                    {/* Priority badge */}
                    <span className={`shrink-0 ${getPriorityColor(task.priority)} text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 font-['Cinzel',serif]`}>
                      {task.priority}{task.priorityNumber}
                    </span>

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium cursor-pointer hover:text-[#e8d4a0] transition-colors ${
                          display.lineThrough ? 'line-through text-[#3a2010]' : 'text-[#d4b880]'
                        }`}
                        onClick={() => openEdit(task)}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {task.roleId && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRoleColor(task.roleId) }} />
                            <span className="text-xs text-[#6a4828]">{getRoleName(task.roleId)}</span>
                          </div>
                        )}
                        {task.delegatedTo && (
                          <span className="text-xs text-[#a060c0]">→ {task.delegatedTo}</span>
                        )}
                        {task.originalDate && (
                          <span className="text-xs text-[#6a88c0]">Carried from {task.originalDate}</span>
                        )}
                        {task.notes && (
                          <span className="text-xs text-[#5a3828] italic truncate">{task.notes}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions — always visible on mobile, hover on desktop */}
                    <div className="shrink-0 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => carryForward(task)}
                          title="Carry forward to tomorrow"
                          className="p-1 rounded hover:bg-[#0a0e18] text-[#4a5868] hover:text-[#6a88c0]"
                        >
                          <ArrowRight size={14} />
                        </button>
                      )}
                      {task.status === 'pending' && (
                        <button
                          onClick={() => updateTask(task.id, { status: 'delegated' })}
                          title="Mark as delegated"
                          className="p-1 rounded hover:bg-[#120a18] text-[#6a4878] hover:text-[#a060c0]"
                        >
                          <UserCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="p-1 rounded hover:bg-[#1a0808] text-[#3a2010] hover:text-[#c02020]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>

      {dayTasks.length === 0 && (
        <div className="px-5 py-10 text-center text-[#3a2010] text-sm">
          <p className="mb-2 italic">No tasks planned. The darkness awaits your orders.</p>
          <Button size="sm" variant="secondary" onClick={openAdd}>
            <Plus size={14} /> Add your first task
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Task Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              className={inputClass}
              placeholder="What must be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Priority</label>
            <div className="flex gap-2">
              {(['A', 'B', 'C'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all font-['Cinzel',serif] ${
                    form.priority === p
                      ? p === 'A' ? 'border-[#8b1515] bg-[#1a0808] text-[#f0d090]'
                        : p === 'B' ? 'border-[#904008] bg-[#1a0e04] text-[#f0d090]'
                        : 'border-[#4a3020] bg-[#140e08] text-[#b89060]'
                      : 'border-[#3a2010] text-[#4a3020] hover:border-[#5a3020]'
                  }`}
                >
                  {p} – {p === 'A' ? 'Must Do' : p === 'B' ? 'Should Do' : 'Could Do'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Role (optional)</label>
            <select
              value={form.roleId}
              onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
              className={inputClass + ' bg-[#140e0a]'}
            >
              <option value="">— No specific role —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c8aa78] mb-1 font-['Cinzel',serif]">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className={inputClass}
              placeholder="Additional details…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              {editingTask ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
