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

  const aTaskCount = tasks.filter(t => t.date === date && t.priority === 'A').length;
  const bTaskCount = tasks.filter(t => t.date === date && t.priority === 'B').length;
  const cTaskCount = tasks.filter(t => t.date === date && t.priority === 'C').length;

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
    // Mark current as carried-forward
    updateTask(task.id, { status: 'carried-forward' });
    // Create new task for today (or next day in a real scenario — here just same date +1)
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
        return { checkbox: '✓', color: 'text-green-600', lineThrough: true };
      case 'carried-forward':
        return { checkbox: '→', color: 'text-blue-500', lineThrough: false };
      case 'delegated':
        return { checkbox: 'D', color: 'text-purple-500', lineThrough: false };
      case 'eliminated':
        return { checkbox: '✗', color: 'text-red-400', lineThrough: true };
      default:
        return { checkbox: '', color: 'text-gray-300', lineThrough: false };
    }
  };

  const getPriorityColor = (priority: Priority) => {
    return { A: 'bg-red-600', B: 'bg-amber-600', C: 'bg-gray-500' }[priority];
  };

  const getRoleColor = (roleId?: string) => {
    if (!roleId) return '#9ca3af';
    return roles.find(r => r.id === roleId)?.color || '#9ca3af';
  };

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null;
    return roles.find(r => r.id === roleId)?.name;
  };

  const groups = [
    { label: 'A – Must Do (Vital)', tasks: dayTasks.filter(t => t.priority === 'A'), count: aTaskCount },
    { label: 'B – Should Do (Important)', tasks: dayTasks.filter(t => t.priority === 'B'), count: bTaskCount },
    { label: 'C – Could Do (Optional)', tasks: dayTasks.filter(t => t.priority === 'C'), count: cTaskCount },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#1e3a5f]">Prioritized Task List</h2>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} /> Add Task
        </Button>
      </div>

      {/* Priority legend */}
      <div className="flex gap-4 px-5 py-2.5 bg-[#faf8f3] border-b border-gray-100 text-xs text-gray-500">
        <span><strong className="text-red-600">A</strong> = Must Do</span>
        <span><strong className="text-amber-600">B</strong> = Should Do</span>
        <span><strong className="text-gray-500">C</strong> = Could Do</span>
        <span className="ml-auto"><strong>→</strong> = Carried Forward</span>
        <span><strong>D</strong> = Delegated</span>
      </div>

      {/* Tasks by group */}
      <div>
        {groups.map(group => (
          <div key={group.label}>
            <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.label}</span>
            </div>
            {group.tasks.length === 0 ? (
              <div className="px-5 py-3 text-sm text-gray-400 italic">No tasks</div>
            ) : (
              group.tasks.map(task => {
                const display = getStatusDisplay(task);
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 group transition-colors ${
                      task.status === 'completed' || task.status === 'eliminated' ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Status checkbox */}
                    <button
                      onClick={() => cycleStatus(task)}
                      className={`shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold mt-0.5 transition-all ${
                        task.status === 'completed'
                          ? 'bg-green-100 border-green-400 text-green-600'
                          : task.status === 'carried-forward'
                          ? 'bg-blue-50 border-blue-300 text-blue-500'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${display.color}`}
                    >
                      {display.checkbox}
                    </button>

                    {/* Priority badge */}
                    <span className={`shrink-0 ${getPriorityColor(task.priority)} text-white text-xs font-bold px-1.5 py-0.5 rounded mt-0.5`}>
                      {task.priority}{task.priorityNumber}
                    </span>

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium text-gray-800 cursor-pointer hover:text-[#1e3a5f] ${display.lineThrough ? 'line-through' : ''}`}
                        onClick={() => openEdit(task)}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {task.roleId && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRoleColor(task.roleId) }} />
                            <span className="text-xs text-gray-400">{getRoleName(task.roleId)}</span>
                          </div>
                        )}
                        {task.delegatedTo && (
                          <span className="text-xs text-purple-400">→ {task.delegatedTo}</span>
                        )}
                        {task.originalDate && (
                          <span className="text-xs text-blue-400">Carried from {task.originalDate}</span>
                        )}
                        {task.notes && (
                          <span className="text-xs text-gray-400 italic truncate">{task.notes}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions — always visible on touch, hover-reveal on desktop */}
                    <div className="shrink-0 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => carryForward(task)}
                          title="Carry forward to tomorrow"
                          className="p-1 rounded hover:bg-blue-100 text-blue-400 hover:text-blue-600"
                        >
                          <ArrowRight size={14} />
                        </button>
                      )}
                      {task.status === 'pending' && (
                        <button
                          onClick={() => updateTask(task.id, { status: 'delegated' })}
                          title="Mark as delegated"
                          className="p-1 rounded hover:bg-purple-100 text-purple-400 hover:text-purple-600"
                        >
                          <UserCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="p-1 rounded hover:bg-red-100 text-gray-300 hover:text-red-500"
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
        <div className="px-5 py-10 text-center text-gray-400 text-sm">
          <p className="mb-2">No tasks planned for this day.</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {(['A', 'B', 'C'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    form.priority === p
                      ? p === 'A' ? 'border-red-600 bg-red-50 text-red-700'
                        : p === 'B' ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {p} – {p === 'A' ? 'Must Do' : p === 'B' ? 'Should Do' : 'Could Do'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role (optional)</label>
            <select
              value={form.roleId}
              onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
            >
              <option value="">— No specific role —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="Additional context…"
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
