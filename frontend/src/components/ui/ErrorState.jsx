import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Standardized error state component with message and retry CTA.
 */
const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load data. Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-danger/20 bg-danger-muted/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-danger-muted flex items-center justify-center text-danger mb-4 border border-danger/30">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-md mb-5 leading-relaxed">{message}</p>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;
