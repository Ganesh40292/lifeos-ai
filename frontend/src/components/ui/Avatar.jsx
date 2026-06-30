import clsx from 'clsx';
import { getInitials } from '@/utils/formatters';

const sizeStyles = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

/**
 * Avatar component with image support and initials fallback.
 *
 * @param {string} src - Image URL
 * @param {string} name - User's full name (used for initials fallback and alt text)
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {string} className
 */
const Avatar = ({ src, name, size = 'md', className, ...props }) => {
  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full',
        'bg-primary-muted text-primary font-semibold',
        'flex-shrink-0 overflow-hidden',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
