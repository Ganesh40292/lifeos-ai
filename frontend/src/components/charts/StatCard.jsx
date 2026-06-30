import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

/**
 * Dashboard stat card displaying a metric with trend indicator.
 *
 * @param {string} title - Metric label
 * @param {string|number} value - Primary metric value
 * @param {string} subtitle - Secondary info below value
 * @param {React.ReactNode} icon - Lucide icon element
 * @param {'up'|'down'|null} trend - Trend direction
 * @param {string} trendValue - Trend percentage string (e.g. "+12%")
 * @param {string} iconBg - Background color class for icon container
 * @param {string} iconColor - Text color class for icon
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  iconBg = 'bg-primary-muted',
  iconColor = 'text-primary',
  className,
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl border border-border bg-bg-card p-5',
        'transition-all duration-[var(--transition-base)]',
        'hover:shadow-md hover:border-border-light hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {title}
        </p>
        <div className={clsx('p-2 rounded-lg', iconBg, iconColor)}>
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-text mb-1">{value}</p>

      <div className="flex items-center gap-2">
        {trend && trendValue && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              trend === 'up' ? 'text-success' : 'text-danger'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-text-faint">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
