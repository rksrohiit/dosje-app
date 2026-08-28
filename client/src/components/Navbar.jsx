import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, Radio, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ setMobileOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Real-Time Monitoring Dashboard';
    if (path === '/cctv') return 'Live CCTV Surveillance';
    if (path === '/video-conference') return 'Random Video Conferencing';
    if (path === '/inspections') return 'PMU Inspection Module';
    if (path === '/reports') return 'Inspection Reports';
    if (path === '/analytics') return 'AI Anomaly Analytics';
    if (path === '/ngo-portal') return 'NGO Management Portal';
    return 'DoSJE Portal';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Official Indian Tricolor Header Accent Line */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#138808]"></div>
      </div>

      <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Dept. of Social Justice & Empowerment • Govt of India
            </p>
          </div>
        </div>

        {/* Center Section: LIVE Stream Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Real-time Monitoring Active</span>
        </div>

        {/* Right Section: Time + Notification + User Initials */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Real-time Clock */}
          <div className="hidden sm:block text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>

          {/* Alert Notifications */}
          <div className="relative cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white font-bold">
              3
            </span>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 md:pl-4">
            <span className="text-lg" title="Government of India">🇮🇳</span>
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Officer'}</p>
              <p className="text-[10px] text-slate-500 uppercase mt-0.5">{user?.role || 'DoSJE'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
