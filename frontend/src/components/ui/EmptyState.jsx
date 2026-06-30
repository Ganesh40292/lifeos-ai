import clsx from 'clsx';
import Button from './Button';

/**
 * EmptyState component for pages/sections with no data.
 *
 * @param {React.ReactNode} icon - Lucide icon or illustration
 * @param {string} title - Primary message
 * @param {string} description - Secondary explanation
 * @param {string} actionLabel - CTA button label
 * @param {function} onAction - CTA click handler
 * @param {string} className
 */
const EmptyState = ({ icon, title, description, actionLabel, onAction, className }) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        'animate-[fade-in_0.3s_ease-out]',
        className
      )}
    >
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-bg-elevated text-text-faint">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
