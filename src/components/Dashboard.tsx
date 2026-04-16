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
    if (!roleId) return '#9ca3af';
    return roles.find(r => r.id === roleId)?.color || '#9ca3af';
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
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <Circle size={16} className="text-gray-300" />;
    }
  };

  const getPriorityBadge = (priority: Priority, num: number) => {
    const colors = { A: 'bg-red-600', B: 'bg-amber-600', C: 'bg-gray-500' };
    return (
      <span className={`${colors[priority]} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>
        {priority}{num}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="text-[#d4a017] font-medium text-sm uppercase tracking-wider mb-1">Today</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">{formatDisplayDate(TODAY)}</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<CheckCircle2 className="text-green-500" />} label="Completed" value={completedToday} total={todayTasks.length} color="green" />
        <StatCard icon={<Circle className="text-amber-500" />} label="Pending Tasks" value={pendingToday} color="amber" />
        <StatCard icon={<Clock className="text-blue-500" />} label="Appointments" value={todayAppointments.length} color="blue" />
        <StatCard icon={<Target className="text-purple-500" />} label="Goals Active" value={totalGoals - completedGoals} total={totalGoals} color="purple" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Tasks */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#1e3a5f]">Today's Task List</h2>
            <button
              onClick={() => onNavigateToDay(TODAY)}
              className="text-sm text-[#d4a017] hover:text-[#b8880f] font-medium"
            >
              Open Daily Page →
            </button>
          </div>

          {/* Quick Add */}
          <div className="px-4 md:px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              <select
                value={quickPriority}
                onChange={e => setQuickPriority(e.target.value as Priority)}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 shrink-0"
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
                placeholder="Quick add task…"
                className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              />
              <Button size="sm" onClick={handleQuickAdd}>
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>

          {/* Task list */}
          <div className="divide-y divide-gray-50">
            {todayTasks.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No tasks for today. Add one above!</p>
            ) : (
              todayTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${
                    task.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(task.priority, task.priorityNumber)}
                      <span className={`text-sm font-medium text-gray-800 ${task.status === 'completed' ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    {task.roleId && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRoleColor(task.roleId) }} />
                        <span className="text-xs text-gray-400">{getRoleName(task.roleId)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#1e3a5f]">Today's Schedule</h2>
            </div>
            <div className="p-4 space-y-2">
              {todayAppointments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">No appointments today</p>
              ) : (
                todayAppointments.map(appt => (
                  <div key={appt.id} className="flex gap-3 p-2 rounded-lg bg-[#faf8f3]">
                    <div className="w-1 rounded-full bg-[#1e3a5f] shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{appt.title}</div>
                      <div className="text-xs text-gray-400">
                        {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                      </div>
                      {appt.location && (
                        <div className="text-xs text-gray-400">{appt.location}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#d4a017]" />
                <h2 className="font-semibold text-[#1e3a5f]">Goal Progress</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {goals.filter(g => !g.completed).slice(0, 4).map(goal => {
                const role = roles.find(r => r.id === goal.roleId);
                return (
                  <div key={goal.id} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: role?.color || '#9ca3af' }} />
                    <div>
                      <div className="text-sm text-gray-700">{goal.title}</div>
                      {role && <div className="text-xs text-gray-400">{role.name}</div>}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => onNavigate('roles')}
                className="text-xs text-[#d4a017] hover:text-[#b8880f] font-medium mt-1"
              >
                View all goals →
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
  const bgColors: Record<string, string> = {
    green: 'bg-green-50 border-green-100',
    amber: 'bg-amber-50 border-amber-100',
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
  };

  return (
    <div className={`${bgColors[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500 font-medium">{label}</span></div>
      <div className="text-2xl font-bold text-gray-800">
        {value}
        {total !== undefined && <span className="text-sm text-gray-400 font-normal">/{total}</span>}
      </div>
    </div>
  );
}
