import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { findNavItem, navGroups } from '../../data/navigation';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const item = findNavItem(location.pathname);
  const section = navGroups.find((group) => group.items.some((entry) => entry.to === item.to))?.label ?? 'Overview';

  return (
    <div className="flex h-full min-h-screen w-full bg-canvas">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar section={section} item={item} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>);

}