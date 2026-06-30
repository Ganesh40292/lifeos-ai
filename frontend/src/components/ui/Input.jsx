import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

/**
 * Reusable Input component with label, error state, icon, and password toggle.
 *
 * @param {string} label - Input label text
 * @param {string} error - Error message to display
 * @param {React.ReactNode} icon - Leading icon element
 * @param {string} helperText - Helper text below input
 * @param {string} className - Additional container classes
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      icon,
      helperText,
      className,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={clsx(
              'w-full rounded-lg border bg-bg-input px-3 py-2.5 text-sm text-text',
              'placeholder:text-text-faint',
              'transition-colors duration-[var(--transition-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
              icon && 'pl-10',
              isPassword && 'pr-10',
              error
                ? 'border-danger focus:ring-danger/50'
                : 'border-border hover:border-border-light'
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-danger mt-0.5">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-faint mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
