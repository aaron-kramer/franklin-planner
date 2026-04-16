import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, startOfMonth } from 'date-fns';
import { usePlannerStore } from '../../store/plannerStore';
import { TODAY, getMonthDays, isSameMonthStr } from '../../utils/dateUtils';
import { Button } from '../shared/Button';

interface MonthlyCalendarProps {
  onNavigateToDay: (date: string) => void;
}

const DOW_LABELS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOW_LABELS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function MonthlyCalendar({ onNavigateToDay }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(parseISO(TODAY)));
  const { tasks, appointments, roles } = usePlannerStore();

  const monthStr = format(currentMonth, 'yyyy-MM-dd');
  const days = getMonthDays(monthStr);

  const getTasksForDay = (dateStr: string) => tasks.filter(t => t.date === dateStr);
  const getApptsForDay = (dateStr: string) => appointments.filter(a => a.date === dateStr);

  const getRoleColor = (roleId?: string) => {
    if (!roleId) return '#8b1515';
    return roles.find(r => r.id === roleId)?.color || '#8b1515';
  };

  const isThisMonth = (date: Date) => isSameMonthStr(format(date, 'yyyy-MM-dd'), monthStr);
  const isToday = (date: Date) => format(date, 'yyyy-MM-dd') === TODAY;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-2 rounded-lg hover:bg-[#2a1810] text-[#6a4828] hover:text-[#e8d4a0] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-2 rounded-lg hover:bg-[#2a1810] text-[#6a4828] hover:text-[#e8d4a0] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#e8d4a0]">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <p className="hidden sm:block text-xs text-[#6a4828] font-['Cinzel',serif] tracking-widest uppercase mt-0.5">Monthly Overview</p>
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

      <div className="rune-divider mb-4 md:mb-6" />

      {/* Calendar grid */}
      <div className="bg-[#1a1210] rounded-xl border border-[#3a2010] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
        {/* Day of week headers */}
        <div className="grid grid-cols-7 border-b border-[#3a2010]">
          {DOW_LABELS_FULL.map((d, i) => (
            <div key={d + i} className="py-2 md:py-3 text-center text-xs font-semibold text-[#6a4828] uppercase tracking-wider font-['Cinzel',serif]">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{DOW_LABELS_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 divide-x divide-[#2a1808]">
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
                className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 cursor-pointer transition-colors border-b border-[#2a1808] hover:bg-[#221810] active:bg-[#221810] ${
                  !inMonth ? 'bg-[#120e0a] opacity-50' : ''
                }`}
                style={today ? { boxShadow: 'inset 0 0 0 2px #8b1515', background: '#1e0a0a' } : {}}
              >
                {/* Date number */}
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={`text-xs md:text-sm font-semibold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full font-['Cinzel',serif] ${
                      today
                        ? 'text-[#f0d090]'
                        : inMonth
                        ? 'text-[#c8aa78]'
                        : 'text-[#3a2010]'
                    }`}
                    style={today ? { backgroundColor: '#8b1515', boxShadow: '0 0 6px rgba(139,21,21,0.5)' } : {}}
                  >
                    {format(date, 'd')}
                  </span>
                  {/* Task counts */}
                  {(pending > 0 || completed > 0) && (
                    <div className="flex gap-0.5 flex-wrap justify-end">
                      {completed > 0 && (
                        <span className="text-[10px] md:text-xs bg-[#0f2010] text-[#4aaa60] px-1 rounded font-medium hidden sm:block">{completed}✓</span>
                      )}
                      {pending > 0 && (
                        <span className="text-[10px] md:text-xs bg-[#2a1808] text-[#8a6848] px-1 rounded font-medium hidden sm:block">{pending}</span>
                      )}
                      {/* Mobile dots */}
                      <div className="sm:hidden flex gap-0.5 mt-0.5">
                        {completed > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#4aaa60]" />}
                        {pending > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#6a4828]" />}
                      </div>
                    </div>
                  )}
                </div>

                {/* Appointments */}
                {dayAppts.slice(0, 2).map(appt => (
                  <div
                    key={appt.id}
                    className="hidden sm:block text-xs mb-0.5 px-1.5 py-0.5 rounded truncate font-medium text-white"
                    style={{ backgroundColor: getRoleColor(appt.roleId), opacity: 0.85 }}
                    title={appt.title}
                  >
                    {appt.startTime.slice(0, 5)} {appt.title}
                  </div>
                ))}

                {/* A-task preview */}
                {dayTasks.filter(t => t.priority === 'A').slice(0, 1).map(task => (
                  <div
                    key={task.id}
                    className={`hidden sm:block text-xs mb-0.5 px-1.5 py-0.5 rounded truncate ${
                      task.status === 'completed'
                        ? 'bg-[#0f2010] text-[#4aaa60] line-through'
                        : 'bg-[#8b1515]/15 text-[#f0a0a0] border border-[#8b1515]/20'
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}

                {/* Appointment dot — mobile only */}
                {dayAppts.length > 0 && (
                  <div className="sm:hidden w-1.5 h-1.5 rounded-full bg-[#8b1515] mt-0.5" style={{ boxShadow: '0 0 3px #8b1515' }} />
                )}

                {(dayTasks.length + dayAppts.length) > 3 && (
                  <div className="hidden sm:block text-xs text-[#4a3020] mt-0.5">
                    +{dayTasks.length + dayAppts.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 md:gap-4 text-xs text-[#6a4828]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#8b1515] inline-block" style={{ boxShadow: '0 0 4px #8b1515' }} /> Appointment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#8b1515]/15 inline-block border border-[#8b1515]/30" /> A-Priority Task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-bold text-[#4aaa60]">✓</span> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#8b1515', boxShadow: 'inset 0 0 0 2px #8b1515, 0 0 4px #8b1515' }} /> Today
        </span>
        <span className="hidden sm:inline ml-auto text-[#3a2010] italic">Tap any day to open its Daily Page</span>
      </div>
    </div>
  );
}
