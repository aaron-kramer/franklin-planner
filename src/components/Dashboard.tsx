import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, Target, TrendingUp, Circle } from 'lucide-react';
import { usePlannerStore } from '../store/plannerStore';
import { TODAY, formatDisplayDate, formatTime } from '../utils/dateUtils';
import { Button } from './shared/Button';
import type { Priority, TaskStatus } from '../types';
import type { Page } from './layout/Sidebar';

interface DashboardProps {
  onNavigateToDay: (date: string) => void;
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigateToDay, onNavigate }: DashboardProps) {
  const { tasks, appointments, roles, goals, addTask } = usePlannerStore();
  const [quickTask, setQuickTask] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('B');

  const todayTasks = tasks.filter(t => t.date === TODAY).sort((a, b) => {
    const priorityOrder = { A: 0, B: 1, C: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.priorityNumber - b.priorityNumber;
  });

  const todayAppointments = appointments
    .filter(a => a.date === TODAY)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const pendingToday = todayTasks.filter(t => t.status === 'pending').length;
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed).length;

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null;
    return roles.find(r => r.id === roleId)?.name;
  };

  const getRoleColor = (roleId?: string) => {
    if (!roleId) return '#6a4828';
    return roles.find(r => r.id === roleId)?.color || '#6a4828';
  };

  const handleQuickAdd = () => {
    if (!quickTask.trim()) return;
    const existingTasks = tasks.filter(t => t.date === TODAY && t.priority === quickPriority);
    addTask({
      title: quickTask.trim(),
      priority: quickPriority,
      priorityNumber: existingTasks.length + 1,
      date: TODAY,
      status: 'pending',
    });
    setQuickTask('');
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-[#4aaa60]" />;
      default: return <Circle size={16} className="text-[#4a3020]" />;
    }
  };

  const getPriorityBadge = (priority: Priority, num: number) => {
    const colors = {
      A: 'bg-[#8b1515] text-[#f0d090]',
      B: 'bg-[#904008] text-[#f0d090]',
      C: 'bg-[#4a3020] text-[#b89060]',
    };
    return (
      <span className={`${colors[priority]} text-xs font-bold px-1.5 py-0.5 rounded font-['Cinzel',serif]`}>
        {priority}{num}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="text-[#c05808] font-medium text-xs uppercase tracking-[0.2em] mb-1 font-['Cinzel',serif]">Today's Chronicle</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#e8d4a0]">{formatDisplayDate(TODAY)}</h1>
        <div className="rune-divider mt-3" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
        <StatCard icon={<CheckCircle2 className="text-[#4aaa60]" />} label="Slain Tasks" value={completedToday} total={todayTasks.length} color="green" />
        <StatCard icon={<Circle className="text-[#c05808]" />} label="Remaining" value={pendingToday} color="amber" />
        <StatCard icon={<Clock className="text-[#6a88c0]" />} label="Appointments" value={todayAppointments.length} color="blue" />
        <StatCard icon={<Target className="text-[#a060c0]" />} label="Active Quests" value={totalGoals - completedGoals} total={totalGoals} color="purple" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Tasks */}
        <div className="md:col-span-2 bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-[#3a2010]">
            <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Today's Task List</h2>
            <button
              onClick={() => onNavigateToDay(TODAY)}
              className="text-sm text-[#c05808] hover:text-[#d47010] font-medium transition-colors"
            >
              Open Daily Page →
            </button>
          </div>

          {/* Quick Add */}
          <div className="px-4 md:px-5 py-3 bg-[#140e0a] border-b border-[#3a2010]">
            <div className="flex flex-wrap gap-2">
              <select
                value={quickPriority}
                onChange={e => setQuickPriority(e.target.value as Priority)}
                className="border border-[#5a2a18] rounded-lg px-2 py-1.5 text-sm bg-[#1a1210] text-[#e8d4a0] focus:outline-none focus:ring-2 focus:ring-[#8b1515]/40 shrink-0"
              >
                <option value="A">A – Must Do</option>
                <option value="B">B – Should Do</option>
                <option value="C">C – Could Do</option>
              </select>
              <input
                type="text"
                value={quickTask}
                onChange={e => setQuickTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
                placeholder="Add a task…"
                className="flex-1 min-w-[120px] border border-[#5a2a18] rounded-lg px-3 py-1.5 text-sm bg-[#1a1210] text-[#e8d4a0] placeholder-[#4a3020] focus:outline-none focus:ring-2 focus:ring-[#8b1515]/40"
              />
              <Button size="sm" onClick={handleQuickAdd}>
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>

          {/* Task list */}
          <div className="divide-y divide-[#2a1808]">
            {todayTasks.length === 0 ? (
              <p className="px-5 py-8 text-center text-[#4a3020] text-sm italic">No tasks for today. The battlefield awaits.</p>
            ) : (
              todayTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-[#221810] transition-colors ${
                    task.status === 'completed' ? 'opacity-50' : ''
                  }`}
                >
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(task.priority, task.priorityNumber)}
                      <span className={`text-sm font-medium text-[#d4b880] ${task.status === 'completed' ? 'line-through text-[#4a3020]' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    {task.roleId && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRoleColor(task.roleId) }} />
                        <span className="text-xs text-[#6a4828]">{getRoleName(task.roleId)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 md:space-y-6">
          {/* Appointments */}
          <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            <div className="px-5 py-4 border-b border-[#3a2010]">
              <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Today's Schedule</h2>
            </div>
            <div className="p-4 space-y-2">
              {todayAppointments.length === 0 ? (
                <p className="text-center text-[#4a3020] text-sm py-4 italic">No appointments today</p>
              ) : (
                todayAppointments.map(appt => (
                  <div key={appt.id} className="flex gap-3 p-2 rounded-lg bg-[#140e0a] border border-[#3a1a10]">
                    <div className="w-1 rounded-full bg-[#8b1515] shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-[#d4b880]">{appt.title}</div>
                      <div className="text-xs text-[#6a4828]">
                        {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                      </div>
                      {appt.location && (
                        <div className="text-xs text-[#6a4828]">{appt.location}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            <div className="px-5 py-4 border-b border-[#3a2010]">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#c05808]" />
                <h2 className="font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide text-sm">Active Quests</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {goals.filter(g => !g.completed).slice(0, 4).map(goal => {
                const role = roles.find(r => r.id === goal.roleId);
                return (
                  <div key={goal.id} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: role?.color || '#6a4828' }} />
                    <div>
                      <div className="text-sm text-[#c8aa78]">{goal.title}</div>
                      {role && <div className="text-xs text-[#6a4828]">{role.name}</div>}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => onNavigate('roles')}
                className="text-xs text-[#c05808] hover:text-[#d47010] font-medium mt-1 transition-colors"
              >
                View all quests →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  color: string;
}

function StatCard({ icon, label, value, total, color }: StatCardProps) {
  const styles: Record<string, string> = {
    green: 'bg-[#0f2010] border-[#1a4020]',
    amber: 'bg-[#1a0e04] border-[#3a2008]',
    blue: 'bg-[#0a0e18] border-[#1a2030]',
    purple: 'bg-[#120a18] border-[#2a1430]',
  };

  return (
    <div className={`${styles[color]} border rounded-xl p-4`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-[#6a4828] font-medium font-['Cinzel',serif] tracking-wide">{label}</span></div>
      <div className="text-2xl font-bold text-[#e8d4a0]">
        {value}
        {total !== undefined && <span className="text-sm text-[#4a3020] font-normal">/{total}</span>}
      </div>
    </div>
  );
}
