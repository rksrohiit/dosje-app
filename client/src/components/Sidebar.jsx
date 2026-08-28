import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Camera, Video, ClipboardCheck, FileText, BarChart2, Building2, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'pmu'] },
    { path: '/cctv', name: 'Live CCTV', icon: Camera, roles: ['admin', 'pmu'] },
    { path: '/video-conference', name: 'Video Conference', icon: Video, roles: ['admin', 'pmu', 'ngo'] },
    { path: '/inspections', name: 'Inspections', icon: ClipboardCheck, roles: ['admin', 'pmu', 'ngo'] },
    { path: '/reports', name: 'Reports', icon: FileText, roles: ['admin', 'pmu'] },
    { path: '/analytics', name: 'Analytics', icon: BarChart2, roles: ['admin'] },
    { path: '/ngo-portal', name: 'NGO Portal', icon: Building2, roles: ['ngo', 'beneficiary'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-govt-blue">DoSJE</span>
            <span className="text-sm font-semibold text-govt-orange mt-1">Monitor</span>
          </div>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
