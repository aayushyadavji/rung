'use client';

import React from 'react';
import { CircleDollarSign, FileCheck2, FileDown, History, House, Plus, Settings } from 'lucide-react';

interface SidebarProps { currentTab: string; onSelectTab: (tab: string) => void; onNewPlan: () => void; }
const items = [
  { id: 'home', action: 'dashboard', label: 'Home', Icon: House },
  { id: 'new-plan', action: 'new-plan', label: 'New Plan', Icon: Plus },
  { id: 'review', action: 'review', label: 'Task Review', Icon: FileCheck2 },
  { id: 'history', action: 'history', label: 'History', Icon: History },
  { id: 'cost', action: 'cost', label: 'Cost & Assumptions', Icon: CircleDollarSign },
  { id: 'settings', action: 'settings', label: 'Settings', Icon: Settings },
  { id: 'export', action: 'export', label: 'Export Plan', Icon: FileDown },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onNewPlan }) => (
  <aside className="sidebar-container">
    <a className="sidebar-brand" href="/?view=home" aria-label="Rung workspace home"><svg className="brand-mark" viewBox="0 0 36 30" aria-hidden="true"><path d="M3 25 14 4l7 13 5-9 8 17"/><path d="m12 25 6-12 7 12"/></svg><span className="brand-title">Rung</span></a>
    <nav className="sidebar-nav" aria-label="Workspace">
      {items.map(({ id, action, label, Icon }) => <button key={id} type="button" className={`nav-item ${currentTab === id ? 'active' : ''}`} aria-current={currentTab === id ? 'page' : undefined} onClick={() => id === 'new-plan' ? onNewPlan() : onSelectTab(action)}><Icon size={17} aria-hidden="true"/><span>{label}</span></button>)}
    </nav>
    <div className="sidebar-bottom-badge"><span className="hackathon-name">Build With AI: Basics</span><span className="powered-by">Rung · multi-provider task routing</span></div>
  </aside>
);
