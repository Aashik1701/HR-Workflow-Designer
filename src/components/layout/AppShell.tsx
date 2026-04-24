import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, HelpCircle, Search } from 'lucide-react';

export function AppShell() {
  return (
    <div className="flex h-screen bg-[#0f0f1a] text-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top search bar */}
        <header className="h-14 border-b border-white/5 flex items-center px-6 gap-4 flex-shrink-0 bg-[#0d0d18]/80 backdrop-blur">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 w-80 border border-white/5">
            <Search size={14} className="text-white/30" />
            <input
              className="bg-transparent text-sm text-white placeholder-white/30 outline-none flex-1"
              placeholder="Search logic, nodes, or logs..."
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="text-white/40 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              <HelpCircle size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
