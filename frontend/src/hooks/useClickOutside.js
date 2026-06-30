import { useEffect } from 'react';

/**
 * Hook that detects clicks outside a referenced element.
 * Useful for closing dropdowns, modals, and popovers.
 *
 * @param {React.RefObject} ref - Ref of the element to monitor
 * @param {function} handler - Callback when click occurs outside
 */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default useClickOutside;
