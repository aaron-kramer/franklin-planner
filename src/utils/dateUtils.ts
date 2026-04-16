import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isSameMonth,
  isToday,
  getWeek,
} from 'date-fns';

export const TODAY = '2026-04-16';

export function formatDate(date: Date | string, fmt: string = 'yyyy-MM-dd'): string {
  if (typeof date === 'string') {
    return format(parseISO(date), fmt);
  }
  return format(date, fmt);
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

export function getWeekStart(dateStr: string): string {
  const date = parseISO(dateStr);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return format(weekStart, 'yyyy-MM-dd');
}

export function getWeekDays(weekStartStr: string): string[] {
  const weekStart = parseISO(weekStartStr);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => format(d, 'yyyy-MM-dd'));
}

export function getMonthDays(dateStr: string): Date[] {
  const date = parseISO(dateStr);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Get the full calendar grid (including padding days from prev/next month)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function addDay(dateStr: string): string {
  return format(addDays(parseISO(dateStr), 1), 'yyyy-MM-dd');
}

export function subDay(dateStr: string): string {
  return format(subDays(parseISO(dateStr), 1), 'yyyy-MM-dd');
}

export function nextWeek(weekStartStr: string): string {
  return format(addWeeks(parseISO(weekStartStr), 1), 'yyyy-MM-dd');
}

export function prevWeek(weekStartStr: string): string {
  return format(subWeeks(parseISO(weekStartStr), 1), 'yyyy-MM-dd');
}

export function isSameDayStr(a: string, b: string): boolean {
  return isSameDay(parseISO(a), parseISO(b));
}

export function isSameMonthStr(a: string, b: string): boolean {
  return isSameMonth(parseISO(a), parseISO(b));
}

export function isTodayStr(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function getWeekNumber(dateStr: string): number {
  return getWeek(parseISO(dateStr), { weekStartsOn: 1 });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 5; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 22) slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
