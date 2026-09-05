import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose';
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  onClick,
  badge
}) => {
  const colorMap = {
    sky: {
      bg: 'bg-sky-50 text-sky-700 border-sky-100',
      iconBg: 'bg-sky-500 text-white',
      ring: 'hover:border-sky-300'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      ring: 'hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-800 border-amber-100',
      iconBg: 'bg-amber-500 text-white',
      ring: 'hover:border-amber-300'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
      ring: 'hover:border-indigo-300'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700 border-rose-100',
      iconBg: 'bg-rose-500 text-white',
      ring: 'hover:border-rose-300'
    }
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-card hover:-translate-y-0.5' : ''} ${scheme.ring}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
