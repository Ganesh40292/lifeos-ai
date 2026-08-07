import React from 'react';
import clsx from 'clsx';

export const SkeletonCard = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'p-5 rounded-xl border border-border bg-bg-card skeleton-shimmer space-y-3',
            className
          )}
        >
          <div className="h-4 w-1/3 bg-bg-elevated rounded-md" />
          <div className="h-8 w-2/3 bg-bg-elevated rounded-md" />
          <div className="h-3 w-1/2 bg-bg-elevated rounded-md" />
        </div>
      ))}
    </>
  );
};

export const SkeletonList = ({ count = 3, className }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-border bg-bg-card skeleton-shimmer flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-lg bg-bg-elevated flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-1/3 bg-bg-elevated rounded" />
              <div className="h-3 w-1/4 bg-bg-elevated rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-bg-elevated rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 4, cols = 4 }) => {
  return (
    <div className="w-full border border-border rounded-xl bg-bg-card overflow-hidden">
      <div className="p-4 border-b border-border bg-bg-elevated/40 flex items-center justify-between">
        <div className="h-5 w-32 bg-bg-elevated rounded skeleton-shimmer" />
        <div className="h-8 w-24 bg-bg-elevated rounded-lg skeleton-shimmer" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={clsx(
                  'h-4 bg-bg-elevated rounded skeleton-shimmer',
                  c === 0 ? 'w-1/4' : 'w-1/6'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;
