import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { TaskList } from './TaskList';
import { DailySchedule } from './DailySchedule';
import { DailyNotes } from './DailyNotes';
import { formatDisplayDate, addDay, subDay, TODAY } from '../../utils/dateUtils';
import { Button } from '../shared/Button';

interface DailyPageProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DailyPage({ selectedDate, onDateChange }: DailyPageProps) {
  const isToday = selectedDate === TODAY;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header / Date Navigation */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onDateChange(subDay(selectedDate))}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-[#1e3a5f] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onDateChange(addDay(selectedDate))}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-[#1e3a5f] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-[#1e3a5f]">
                {formatDisplayDate(selectedDate)}
              </h1>
              {isToday && (
                <span className="bg-[#d4a017] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  TODAY
                </span>
              )}
            </div>
            <p className="hidden sm:block text-sm text-gray-400 mt-0.5">Daily Planner Page</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => e.target.value && onDateChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
            aria-label="Jump to date"
          />
          {!isToday && (
            <Button variant="secondary" size="sm" onClick={() => onDateChange(TODAY)}>
              <Calendar size={14} />
              <span className="hidden sm:inline">Today</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main content: 2 columns on large screens */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        {/* Left: Tasks + Notes */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          <TaskList date={selectedDate} />
          <DailyNotes date={selectedDate} />
        </div>

        {/* Right: Schedule */}
        <div className="lg:col-span-2">
          <DailySchedule date={selectedDate} />
        </div>
      </div>
    </div>
  );
}
