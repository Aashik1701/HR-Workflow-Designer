import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export function AppShell() {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('touchstart', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [profileMenuOpen]);

  const handleProfileAction = () => {
    setProfileMenuOpen(false);
    toast('Profile page coming soon.');
  };

  const handleSettingsAction = () => {
    setProfileMenuOpen(false);
    toast('Account settings coming soon.');
  };

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Unable to sign out right now.');
      return;
    }
    toast.success('Signed out successfully.');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#0f0f1a] text-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top search bar */}
        <header className="relative z-30 h-16 border-b border-white/5 flex items-center px-4 md:px-6 gap-3 md:gap-4 flex-shrink-0 bg-[#0d0d18]/80 backdrop-blur">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 flex-1 min-w-0 max-w-xl border border-white/5">
            <Search size={14} className="text-white/30" />
            <input
              className="bg-transparent text-sm text-white placeholder-white/30 outline-none flex-1"
              placeholder="Search logic, nodes, or logs..."
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div ref={profileMenuRef} className="relative z-40">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="group flex h-11 items-center gap-2 md:gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 md:px-3 transition-colors hover:bg-white/[0.05]"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center text-[11px] md:text-[12px] font-extrabold flex-shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.3)] text-white ring-2 ring-[#080811] group-hover:scale-105 transition-transform">
                  MA
                </div>
                <div className="min-w-0 max-w-[170px] md:max-w-[210px] text-left leading-tight">
                  <p className="text-[12px] md:text-[13px] font-bold text-white truncate group-hover:text-teal-100 transition-colors">Mohammed Aashik</p>
                  <p className="text-[9px] md:text-[10px] text-teal-400/80 font-medium tracking-wide truncate">WORKSPACE ADMIN</p>
                </div>
                <ChevronDown size={14} className={"text-white/45 transition-transform group-hover:text-white/70 " + (profileMenuOpen ? 'rotate-180' : '')} />
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-[70] w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d18]/95 p-1 shadow-2xl backdrop-blur"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleProfileAction}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    <User size={14} className="text-white/55" />
                    Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSettingsAction}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    <Settings size={14} className="text-white/55" />
                    Account settings
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-200 transition-colors hover:bg-red-500/15"
                  >
                    <LogOut size={14} className="text-red-300" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="relative z-10 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
