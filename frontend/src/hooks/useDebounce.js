import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce values (e.g. search inputs) for smooth performance.
 * @param {any} value - Input value to debounce
 * @param {number} delay - Debounce delay in ms (default: 250ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
