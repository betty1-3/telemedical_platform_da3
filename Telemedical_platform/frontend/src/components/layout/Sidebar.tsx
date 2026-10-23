import React from 'react';
import { NavLink } from 'react-router-dom';
import { ActivityIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';
import { navGroups } from '../../data/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className={`flex h-full flex-col bg-[#0c233c] text-slate-200 border-r border-slate-800/80 transition-[width] duration-200 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      <div className={`flex items-center gap-2.5 border-b border-white/10 px-4 py-4 ${collapsed ? 'justify-center px-0' : ''}`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 shadow-sm">
          <ActivityIcon size={18} aria-hidden="true" />
        </span>
        {!collapsed ? (
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-white">MediCore</span>
            <span className="block text-2xs font-medium text-emerald-400">Telemedical Management</span>
          </span>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {!collapsed ? (
              <p className="px-4 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-sky-300/70">{group.label}</p>
            ) : (
              <div className="mx-4 mb-2 border-t border-white/10" />
            )}
            <ul>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all duration-150 ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-sky-500/20 font-semibold text-white shadow-xs before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r before:bg-sky-400 text-sky-100'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={16} aria-hidden="true" className="shrink-0" />
                    {!collapsed ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        className={`flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-slate-300 transition-colors duration-150 hover:bg-white/5 hover:text-white ${
          collapsed ? 'justify-center px-0' : ''
        }`}
      >
        {collapsed ? <PanelLeftOpenIcon size={16} aria-hidden="true" /> : <PanelLeftCloseIcon size={16} aria-hidden="true" />}
        {!collapsed ? <span>Collapse</span> : null}
      </button>
    </nav>
  );
}
