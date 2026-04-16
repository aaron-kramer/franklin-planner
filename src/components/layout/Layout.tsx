import { useState } from 'react';
import { Sidebar } from './Sidebar';
import type { Page } from './Sidebar';
import { Dashboard } from '../Dashboard';
import { DailyPage } from '../daily/DailyPage';
import { WeeklyPlanner } from '../weekly/WeeklyPlanner';
import { MonthlyCalendar } from '../monthly/MonthlyCalendar';
import { RolesGoals } from '../planning/RolesGoals';
import { MissionValues } from '../planning/MissionValues';
import { TODAY } from '../../utils/dateUtils';

export function Layout() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const handleNavigateToDay = (date: string) => {
    setSelectedDate(date);
    setCurrentPage('daily');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigateToDay={handleNavigateToDay} onNavigate={setCurrentPage} />;
      case 'daily':
        return <DailyPage selectedDate={selectedDate} onDateChange={setSelectedDate} />;
      case 'weekly':
        return <WeeklyPlanner onNavigateToDay={handleNavigateToDay} />;
      case 'monthly':
        return <MonthlyCalendar onNavigateToDay={handleNavigateToDay} />;
      case 'roles':
        return <RolesGoals />;
      case 'mission':
        return <MissionValues />;
      default:
        return <Dashboard onNavigateToDay={handleNavigateToDay} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0806]">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      {/* pb-20 on mobile reserves space above the bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {renderPage()}
      </main>
    </div>
  );
}
