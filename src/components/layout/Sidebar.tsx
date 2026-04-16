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
        className={`hidden md:flex flex-col h-screen bg-[#100808] text-[#e8d4a0] transition-all duration-300 shrink-0 border-r border-[#3a1a10] ${
          collapsed ? 'w-16' : 'w-56'
        }`}
        style={{ boxShadow: '2px 0 20px rgba(139, 21, 21, 0.15)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3a1a10]/60">
          <div
            className="shrink-0 w-8 h-8 bg-[#8b1515] rounded-lg flex items-center justify-center font-bold text-[#f0d090] text-sm font-['Cinzel',serif]"
            style={{ boxShadow: '0 0 8px rgba(139,21,21,0.6)' }}
          >
            FP
          </div>
          {!collapsed && (
            <div>
              <div className="font-semibold text-sm leading-tight text-[#e8d4a0] font-['Cinzel',serif] tracking-wider">Franklin</div>
              <div className="text-[#c05808] text-xs font-medium font-['Cinzel',serif]">Planner</div>
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
                    ? 'bg-[#8b1515]/25 text-[#f0d090] border border-[#8b1515]/40'
                    : 'text-[#b89060] hover:bg-[#8b1515]/10 hover:text-[#e8d4a0] border border-transparent'
                }`}
                style={{
                  width: collapsed ? 'calc(100% - 8px)' : 'calc(100% - 8px)',
                  ...(isActive ? { boxShadow: '0 0 6px rgba(139,21,21,0.25)' } : {}),
                }}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-[#c05808]' : ''}`}
                />
                {!collapsed && <span className="font-['Cinzel',serif] text-xs tracking-wide">{label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c05808]" style={{ boxShadow: '0 0 4px #c05808' }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Rune divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[#8b1515] to-transparent opacity-40" />

        {/* Collapse toggle */}
        <div className="p-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center py-2 text-[#6a4828] hover:text-[#e8d4a0] hover:bg-[#3a1a10] rounded-lg transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — visible only on mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#100808] border-t border-[#3a1a10] flex items-stretch"
        style={{ boxShadow: '0 -4px 20px rgba(139, 21, 21, 0.2)' }}
      >
        {navItems.map(({ page, label, icon: Icon }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-all font-['Cinzel',serif] tracking-wide ${
                isActive ? 'text-[#c05808]' : 'text-[#6a4828] active:text-[#e8d4a0]'
              }`}
              style={isActive ? { textShadow: '0 0 8px rgba(192, 88, 8, 0.6)' } : {}}
            >
              <Icon size={20} className="shrink-0" />
              <span>{label}</span>
              {isActive && (
                <div
                  className="w-1 h-1 rounded-full bg-[#c05808]"
                  style={{ boxShadow: '0 0 4px #c05808' }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
