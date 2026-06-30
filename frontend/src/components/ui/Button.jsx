import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-sm',
  secondary:
    'bg-bg-elevated text-text-secondary border border-border hover:bg-bg-hover hover:text-text',
  danger:
    'bg-danger text-white hover:bg-danger-hover shadow-sm',
  ghost:
    'bg-transparent text-text-muted hover:bg-bg-hover hover:text-text',
  accent:
    'bg-accent text-white hover:bg-accent-hover shadow-sm',
  outline:
    'bg-transparent text-primary border border-primary hover:bg-primary-muted',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
};

/**
 * Reusable Button component with variants, sizes, loading state, and icon support.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'|'accent'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - Shows spinner and disables interaction
 * @param {boolean} fullWidth - Stretches to fill container
 * @param {React.ReactNode} icon - Leading icon element
 * @param {string} className - Additional Tailwind classes
 */
const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      icon,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-[var(--transition-fast)]',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',
          'cursor-pointer',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
