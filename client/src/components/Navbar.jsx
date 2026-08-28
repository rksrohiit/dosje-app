import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const routeName = path.substring(1).replace('-', ' ');
    return routeName.charAt(0).toUpperCase() + routeName.slice(1);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center justify-center flex-1">
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium border border-red-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          LIVE Real-time Monitoring Active
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm font-medium text-gray-600">
          {time.toLocaleTimeString()}
        </div>
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
            3
          </span>
        </div>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
          <span className="text-xl" title="India">🇮🇳</span>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
