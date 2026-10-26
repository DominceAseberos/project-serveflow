import React from 'react';

interface ContentHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; active?: boolean }[];
  actions?: React.ReactNode;
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="mt-3 sm:mt-0 flex items-center space-x-3">
        {actions}
        {breadcrumbs && (
          <nav className="hidden md:flex text-xs text-slate-500 space-x-1.5 items-center">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                <span className={crumb.active ? 'text-slate-800 font-semibold' : ''}>
                  {crumb.label}
                </span>
                {idx < breadcrumbs.length - 1 && <span className="text-slate-300">/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};
