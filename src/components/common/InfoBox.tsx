import React from 'react';

interface InfoBoxProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgVariant?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate';
  footerText?: string;
  onClick?: () => void;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  icon,
  title,
  value,
  bgVariant = 'emerald',
  footerText,
  onClick,
}) => {
  const getColors = () => {
    switch (bgVariant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-700 text-white',
          border: 'border-emerald-100',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500 text-white',
          border: 'border-amber-100',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-600 text-white',
          border: 'border-blue-100',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-600 text-white',
          border: 'border-rose-100',
        };
      default:
        return {
          iconBg: 'bg-slate-700 text-white',
          border: 'border-slate-100',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      onClick={onClick}
      className={`flex bg-white rounded shadow-sm border border-slate-200 overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow transition-shadow' : ''
      }`}
    >
      <div className={`flex items-center justify-center w-20 shrink-0 text-2xl ${colors.iconBg}`}>
        {icon}
      </div>
      <div className="flex flex-col justify-center px-4 py-3 min-w-0 flex-1">
        <span className="text-xs uppercase font-medium tracking-wide text-slate-500 truncate">
          {title}
        </span>
        <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">
          {value}
        </span>
        {footerText && (
          <span className="text-xs text-slate-400 mt-1 truncate">
            {footerText}
          </span>
        )}
      </div>
    </div>
  );
};
