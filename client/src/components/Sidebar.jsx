import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Camera,
  Video,
  ClipboardCheck,
  FileText,
  BarChart2,
  Building2,
  LogOut,
  X,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'pmu'] },
    { path: '/cctv', name: 'Live CCTV Surveillance', icon: Camera, roles: ['admin', 'pmu'] },
    { path: '/video-conference', name: 'Video Conference', icon: Video, roles: ['admin', 'pmu', 'ngo'] },
    { path: '/inspections', name: 'Inspection Module', icon: ClipboardCheck, roles: ['admin', 'pmu', 'ngo'] },
    { path: '/reports', name: 'Inspection Reports', icon: FileText, roles: ['admin', 'pmu'] },
    { path: '/analytics', name: 'AI Analytics', icon: BarChart2, roles: ['admin'] },
    { path: '/communications', name: 'Bot Alerts & Grants', icon: MessageSquare, roles: ['admin', 'pmu'] },
    { path: '/ngo-portal', name: 'NGO Portal', icon: Building2, roles: ['ngo', 'beneficiary'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(user?.role || 'admin'));

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <h1 className="text-sm font-bold tracking-wider text-amber-400 leading-tight">DoSJE MONITOR</h1>
                <p className="text-[10px] text-slate-400">Govt. of India Platform</p>
              </div>
            </div>
            {/* Close Button (Mobile Only) */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 px-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Authorized User'}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/50 uppercase tracking-wider">
                {user?.role || 'User'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (setMobileOpen) setMobileOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
