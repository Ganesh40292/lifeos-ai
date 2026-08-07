import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Standardized empty state card component with icon, description, and action CTA.
 * Robustly accepts either a component type (icon={StickyNote}) or JSX element (icon={<StickyNote />}).
 */
const EmptyState = ({
  icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at the moment.',
  actionLabel,
  onAction,
  className = '',
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon;
    return <IconComponent className="w-6 h-6 text-primary" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-border bg-bg-card/60 backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-bg-hover flex items-center justify-center text-text-muted mb-4 border border-border">
        {renderIcon()}
      </div>
      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm mb-5 leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
