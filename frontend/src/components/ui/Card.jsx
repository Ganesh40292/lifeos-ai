import clsx from 'clsx';

/**
 * Reusable Card component with optional header, padding, and hover effect.
 *
 * @param {React.ReactNode} children - Card body content
 * @param {string} title - Optional card header title
 * @param {React.ReactNode} action - Optional header action element
 * @param {boolean} hover - Enable hover lift effect
 * @param {boolean} noPadding - Remove default body padding
 * @param {string} className - Additional Tailwind classes
 */
const Card = ({ children, title, action, hover = false, noPadding = false, className, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-xl border border-border bg-bg-card',
        'shadow-sm',
        'transition-all duration-[var(--transition-base)]',
        hover && 'hover:shadow-md hover:border-border-light hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          {title && (
            <h3 className="text-sm font-semibold text-text">{title}</h3>
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={clsx(!noPadding && 'p-5')}>
        {children}
      </div>
    </div>
  );
};

export default Card;
