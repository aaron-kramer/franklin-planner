import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import {
  TODAY,
  getWeekStart,
  getWeekDays,
  nextWeek,
  prevWeek,
  formatShortDate,
  getWeekNumber,
} from '../../utils/dateUtils';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import type { BigRock } from '../../types';
import { format, parseISO } from 'date-fns';

interface WeeklyPlannerProps {
  onNavigateToDay: (date: string) => void;
}

export function WeeklyPlanner({ onNavigateToDay }: WeeklyPlannerProps) {
  const { roles, bigRocks, tasks, appointments, addBigRock, updateBigRock, deleteBigRock } = usePlannerStore();
  const [weekStart, setWeekStart] = useState(getWeekStart(TODAY));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRock, setEditingRock] = useState<BigRock | null>(null);
  const [form, setForm] = useState({ title: '', roleId: '', scheduledDate: '' });

  const weekDays = getWeekDays(weekStart);
  const weekNum = getWeekNumber(weekStart);
  const weekBigRocks = bigRocks.filter(b => b.weekStart === weekStart);

  const openAdd = () => {
    setEditingRock(null);
    setForm({ title: '', roleId: roles[0]?.id || '', scheduledDate: '' });
    setShowAddModal(true);
  };

  const openEdit = (rock: BigRock) => {
    setEditingRock(rock);
    setForm({ title: rock.title, roleId: rock.roleId, scheduledDate: rock.scheduledDate || '' });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.roleId) return;
    if (editingRock) {
      updateBigRock(editingRock.id, {
        title: form.title.trim(),
        roleId: form.roleId,
        scheduledDate: form.scheduledDate || undefined,
      });
    } else {
      addBigRock({
        weekStart,
        roleId: form.roleId,
        title: form.title.trim(),
        scheduledDate: form.scheduledDate || undefined,
      });
    }
    setShowAddModal(false);
  };

  const getRoleColor = (roleId: string) => roles.find(r => r.id === roleId)?.color || '#9ca3af';
  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Unknown';

  const getDayTasks = (day: string) => tasks.filter(t => t.date === day);
  const getDayAppointments = (day: string) => appointments.filter(a => a.date === day);
  const getDayRocks = (day: string) => weekBigRocks.filter(b => b.scheduledDate === day);

  const isToday = (day: string) => day === TODAY;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setWeekStart(prevWeek(weekStart))}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-[#1e3a5f] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setWeekStart(nextWeek(weekStart))}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-[#1e3a5f] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1e3a5f]">
              <span className="hidden sm:inline">Week {weekNum} — </span>
              {formatShortDate(weekStart)} – {formatShortDate(weekDays[6])}
            </h1>
            <p className="hidden sm:block text-sm text-gray-400">Weekly Planning</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setWeekStart(getWeekStart(TODAY))}>
            <Calendar size={14} /> This Week
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus size={14} /> Add Big Rock
          </Button>
        </div>
      </div>

      {/* Big Rocks Section */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-[#1e3a5f]">
          <h2 className="font-semibold text-white">Big Rocks — This Week's Priorities</h2>
          <p className="text-xs text-white/60 mt-0.5">Schedule important items first, then fill in the rest</p>
        </div>

        <div className="p-4">
          {weekBigRocks.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm mb-3">No Big Rocks defined for this week.</p>
              <Button variant="secondary" size="sm" onClick={openAdd}>
                <Plus size={14} /> Add your first Big Rock
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {weekBigRocks.map(rock => {
                const color = getRoleColor(rock.roleId);
                return (
                  <div
                    key={rock.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group"
                    style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">{rock.title}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: color }}
                        >
                          {getRoleName(rock.roleId)}
                        </span>
                        {rock.scheduledDate && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {formatShortDate(rock.scheduledDate)} ({format(parseISO(rock.scheduledDate), 'EEE')})
                          </span>
                        )}
                        {!rock.scheduledDate && (
                          <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                            Unscheduled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(rock)}
                        className="text-xs text-[#1e3a5f] hover:text-[#1e3a5f]/70 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBigRock(rock.id)}
                        className="p-1 rounded hover:bg-red-100 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Week Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1e3a5f]">Week at a Glance</h2>
        </div>

        <div className="overflow-x-auto">
        <div className="grid grid-cols-7 divide-x divide-gray-100 min-w-[560px]">
          {weekDays.map(day => {
            const dayTasks = getDayTasks(day);
            const dayAppts = getDayAppointments(day);
            const dayRocks = getDayRocks(day);
            const dayName = format(parseISO(day), 'EEE');
            const dayNum = format(parseISO(day), 'd');
            const today = isToday(day);

            return (
              <div key={day} className={`min-w-[120px] ${today ? 'bg-amber-50/50' : ''}`}>
                {/* Day header */}
                <div
                  className={`px-3 py-2.5 border-b text-center cursor-pointer hover:bg-[#1e3a5f]/5 transition-colors ${
                    today ? 'bg-[#1e3a5f] text-white' : 'border-gray-100'
                  }`}
                  onClick={() => onNavigateToDay(day)}
                >
                  <div className={`text-xs font-medium uppercase tracking-wider ${today ? 'text-white/80' : 'text-gray-400'}`}>
                    {dayName}
                  </div>
                  <div className={`text-lg font-bold ${today ? 'text-white' : 'text-gray-700'}`}>{dayNum}</div>
                  {today && <div className="text-xs text-[#d4a017] font-medium">Today</div>}
                </div>

                {/* Day content */}
                <div className="p-2 space-y-1.5 min-h-[180px]">
                  {/* Big rocks for this day */}
                  {dayRocks.map(rock => (
                    <div
                      key={rock.id}
                      className="text-xs px-2 py-1 rounded font-medium text-white truncate"
                      style={{ backgroundColor: getRoleColor(rock.roleId) }}
                      title={rock.title}
                    >
                      ⬡ {rock.title}
                    </div>
                  ))}

                  {/* Appointments */}
                  {dayAppts.slice(0, 3).map(appt => (
                    <div
                      key={appt.id}
                      className="text-xs px-2 py-1 rounded bg-[#1e3a5f]/10 text-[#1e3a5f] truncate"
                      title={`${appt.title} ${appt.startTime}`}
                    >
                      {appt.startTime.slice(0, 5)} {appt.title}
                    </div>
                  ))}

                  {/* Tasks */}
                  {dayTasks.filter(t => t.status !== 'completed').slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs px-2 py-0.5 rounded truncate ${
                        task.priority === 'A' ? 'text-red-700 bg-red-50' :
                        task.priority === 'B' ? 'text-amber-700 bg-amber-50' :
                        'text-gray-600 bg-gray-50'
                      }`}
                      title={task.title}
                    >
                      {task.priority}{task.priorityNumber} {task.title}
                    </div>
                  ))}

                  {(dayTasks.length + dayAppts.length) > 6 && (
                    <div className="text-xs text-gray-400 text-center">
                      +{dayTasks.length + dayAppts.length - 6} more
                    </div>
                  )}

                  {dayTasks.length === 0 && dayAppts.length === 0 && dayRocks.length === 0 && (
                    <button
                      onClick={() => onNavigateToDay(day)}
                      className="w-full text-xs text-gray-300 py-2 hover:text-gray-400 transition-colors text-center"
                    >
                      + Plan day
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>{/* end overflow-x-auto */}
      </div>

      {/* Roles Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1e3a5f]">Roles Balance This Week</h2>
          <p className="text-xs text-gray-400 mt-0.5">Are you spending time in all your key roles?</p>
        </div>
        <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {roles.sort((a, b) => a.order - b.order).map(role => {
            const roleRocks = weekBigRocks.filter(b => b.roleId === role.id);
            const roleTasks = tasks.filter(t => weekDays.includes(t.date) && t.roleId === role.id);
            const roleAppts = appointments.filter(a => weekDays.includes(a.date) && a.roleId === role.id);
            const total = roleRocks.length + roleTasks.length + roleAppts.length;

            return (
              <div key={role.id} className="text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: role.color }}
                >
                  {role.name[0]}
                </div>
                <div className="text-xs font-medium text-gray-700 truncate">{role.name}</div>
                <div className="text-xs text-gray-400">{total} items</div>
                <div
                  className="h-1 rounded-full mt-1 mx-auto"
                  style={{
                    backgroundColor: role.color,
                    width: `${Math.min(100, total * 20)}%`,
                    minWidth: total > 0 ? '20%' : '0%',
                    opacity: total === 0 ? 0.2 : 0.8,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingRock ? 'Edit Big Rock' : 'Add Big Rock'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Big Rock Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              placeholder="What's your most important priority this week?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={form.roleId}
              onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
            >
              <option value="">— Select a role —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule for Day (optional)</label>
            <select
              value={form.scheduledDate}
              onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
            >
              <option value="">— Unscheduled —</option>
              {weekDays.map(d => (
                <option key={d} value={d}>
                  {format(parseISO(d), 'EEEE, MMM d')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim() || !form.roleId}>
              {editingRock ? 'Save Changes' : 'Add Big Rock'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
