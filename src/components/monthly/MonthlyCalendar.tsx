import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, startOfMonth } from 'date-fns';
import { usePlannerStore } from '../../store/plannerStore';
import { TODAY, getMonthDays, isSameMonthStr } from '../../utils/dateUtils';
import { Button } from '../shared/Button';

interface MonthlyCalendarProps {
  onNavigateToDay: (date: string) => void;
}

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthlyCalendar({ onNavigateToDay }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(parseISO(TODAY)));
  const { tasks, appointments, roles } = usePlannerStore();

  const monthStr = format(currentMonth, 'yyyy-MM-dd');
  const days = getMonthDays(monthStr);

  const getTasksForDay = (dateStr: string) => tasks.filter(t => t.date === dateStr);
  const getApptsForDay = (dateStr: string) => appointments.filter(a => a.date === dateStr);

  const getRoleColor = (roleId?: string) => {
    if (!roleId) return '#1e3a5f';
    return roles.find(r => r.id === roleId)?.color || '#1e3a5f';
  };

  const isThisMonth = (date: Date) => isSameMonthStr(format(date, 'yyyy-MM-dd'), monthStr);
  const isToday = (date: Date) => format(date, 'yyyy-MM-dd') === TODAY;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-[#1e3a5f] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-[#1e3a5f] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <p className="text-sm text-gray-400">Monthly Overview</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentMonth(startOfMonth(parseISO(TODAY)))}
        >
          This Month
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DOW_LABELS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 divide-x divide-gray-50">
          {days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const inMonth = isThisMonth(date);
            const today = isToday(date);
            const dayTasks = getTasksForDay(dateStr);
            const dayAppts = getApptsForDay(dateStr);
            const pending = dayTasks.filter(t => t.status === 'pending').length;
            const completed = dayTasks.filter(t => t.status === 'completed').length;

            return (
              <div
                key={dateStr}
                onClick={() => onNavigateToDay(dateStr)}
                className={`min-h-[100px] p-2 cursor-pointer transition-colors border-b border-gray-50 hover:bg-[#faf8f3] ${
                  !inMonth ? 'bg-gray-50/50' : ''
                } ${today ? 'ring-2 ring-inset ring-[#d4a017]' : ''}`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                      today
                        ? 'bg-[#1e3a5f] text-white'
                        : inMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                  {(pending > 0 || completed > 0) && (
                    <div className="flex gap-0.5">
                      {completed > 0 && (
                        <span className="text-xs bg-green-100 text-green-600 px-1 rounded font-medium">{completed}✓</span>
                      )}
                      {pending > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded font-medium">{pending}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Appointments */}
                {dayAppts.slice(0, 2).map(appt => (
                  <div
                    key={appt.id}
                    className="text-xs mb-0.5 px-1.5 py-0.5 rounded truncate font-medium text-white"
                    style={{ backgroundColor: getRoleColor(appt.roleId) }}
                    title={appt.title}
                  >
                    {appt.startTime.slice(0, 5)} {appt.title}
                  </div>
                ))}

                {/* Tasks preview */}
                {dayTasks.filter(t => t.priority === 'A').slice(0, 1).map(task => (
                  <div
                    key={task.id}
                    className={`text-xs mb-0.5 px-1.5 py-0.5 rounded truncate ${
                      task.status === 'completed' ? 'bg-green-50 text-green-600 line-through' : 'bg-red-50 text-red-700'
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}

                {(dayTasks.length + dayAppts.length) > 3 && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    +{dayTasks.length + dayAppts.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#1e3a5f] inline-block" /> Appointment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-100 inline-block border border-red-200" /> A-Priority Task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-bold text-green-600">✓</span> Completed tasks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full ring-2 ring-[#d4a017] inline-block" /> Today
        </span>
        <span className="ml-auto text-gray-400 italic">Click any day to open its Daily Page</span>
      </div>
    </div>
  );
}
