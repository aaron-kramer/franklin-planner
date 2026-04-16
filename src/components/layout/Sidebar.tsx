import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  BookOpen,
  Target,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type Page = 'dashboard' | 'daily' | 'weekly' | 'monthly' | 'roles' | 'mission';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { page: Page; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'daily', label: 'Daily', icon: CalendarDays },
  { page: 'weekly', label: 'Weekly', icon: CalendarRange },
  { page: 'monthly', label: 'Monthly', icon: BookOpen },
  { page: 'roles', label: 'Roles', icon: Target },
  { page: 'mission', label: 'Values', icon: Heart },
];

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-[#1e3a5f] text-white transition-all duration-300 shrink-0 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="shrink-0 w-8 h-8 bg-[#d4a017] rounded-lg flex items-center justify-center font-bold text-[#1e3a5f] text-sm">
            FP
          </div>
          {!collapsed && (
            <div>
              <div className="font-semibold text-sm leading-tight">Franklin</div>
              <div className="text-[#d4a017] text-xs font-medium">Planner</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ page, label, icon: Icon }) => {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 rounded-lg mx-1 ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                style={{ width: collapsed ? 'calc(100% - 8px)' : 'calc(100% - 8px)' }}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-white/10 p-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center py-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1e3a5f] border-t border-white/10 flex items-stretch">
        {navItems.map(({ page, label, icon: Icon }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-all ${
                isActive ? 'text-[#d4a017]' : 'text-white/60 active:text-white'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span>{label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-[#d4a017]" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}
