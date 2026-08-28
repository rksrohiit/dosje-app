import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', trend, trendValue, subtitle }) => {
  const colorMap = {
    blue:   { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'bg-blue-600 text-white' },
    green:  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bg-emerald-600 text-white' },
    orange: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'bg-amber-600 text-white' },
    red:    { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'bg-rose-600 text-white' },
  };

  const currentTheme = colorMap[color] || colorMap.blue;
  const isPositive = trend === 'up';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shadow-xs ${currentTheme.icon}`}>
          <Icon className="w-5.5 h-5.5" />
        </div>

        {trend && (
          <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${
            isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <span className="text-xs text-slate-500 font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
