import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: string;
  tools?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'outline';
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  tools,
  footer,
  children,
  variant = 'outline',
  className = '',
  bodyClassName = 'p-5',
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'primary':
        return 'border-t-4 border-t-emerald-800';
      case 'success':
        return 'border-t-4 border-t-emerald-600';
      case 'warning':
        return 'border-t-4 border-t-amber-500';
      case 'danger':
        return 'border-t-4 border-t-rose-600';
      case 'info':
        return 'border-t-4 border-t-blue-500';
      case 'dark':
        return 'border-t-4 border-t-slate-800';
      default:
        return 'border-t border-slate-200';
    }
  };

  return (
    <div className={`bg-white rounded shadow-sm border border-slate-200 ${getBorderColor()} ${className}`}>
      {(title || tools) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {tools && <div className="flex items-center space-x-2">{tools}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b text-sm text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};
