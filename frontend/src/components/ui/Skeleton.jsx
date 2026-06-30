import clsx from 'clsx';

/**
 * Loading skeleton primitives for content placeholders.
 * Use these while data is being fetched.
 */

/** Generic rectangular skeleton */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx('rounded-md skeleton-shimmer', className)}
      {...props}
    />
  );
};

/** Text line skeleton */
Skeleton.Text = ({ lines = 1, className }) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'h-3.5 rounded skeleton-shimmer',
            i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};
Skeleton.Text.displayName = 'Skeleton.Text';

/** Circle skeleton (for avatars) */
Skeleton.Circle = ({ size = 'md', className }) => {
  const sizeMap = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11', xl: 'w-14 h-14' };
  return (
    <div
      className={clsx('rounded-full skeleton-shimmer', sizeMap[size], className)}
    />
  );
};
Skeleton.Circle.displayName = 'Skeleton.Circle';

/** Card skeleton */
Skeleton.Card = ({ className }) => {
  return (
    <div className={clsx('rounded-xl border border-border bg-bg-card p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton.Circle size="sm" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton.Text lines={2} />
    </div>
  );
};
Skeleton.Card.displayName = 'Skeleton.Card';

export default Skeleton;
