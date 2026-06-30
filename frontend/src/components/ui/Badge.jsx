import clsx from 'clsx';

const variantStyles = {
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  info: 'bg-info-muted text-info',
  primary: 'bg-primary-muted text-primary',
  accent: 'bg-accent-muted text-accent',
  neutral: 'bg-bg-elevated text-text-muted',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

/**
 * Badge component for status indicators and labels.
 *
 * @param {'success'|'warning'|'danger'|'info'|'primary'|'accent'|'neutral'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} dot - Show leading status dot
 * @param {string} className
 */
const Badge = ({ children, variant = 'neutral', size = 'md', dot = false, className, ...props }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'info' && 'bg-info',
            variant === 'primary' && 'bg-primary',
            variant === 'accent' && 'bg-accent',
            variant === 'neutral' && 'bg-text-muted'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
