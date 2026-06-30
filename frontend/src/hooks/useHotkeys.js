import { useEffect, useCallback } from 'react';

/**
 * Global keyboard shortcuts registry.
 * Each shortcut is { key, ctrl, shift, alt, handler, description, section }.
 */
const useHotkeys = (shortcuts, deps = []) => {
  const handleKeyDown = useCallback((e) => {
    // Don't trigger when user is typing in an input/textarea
    const tag = e.target.tagName.toLowerCase();
    const isEditable = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    for (const shortcut of shortcuts) {
      const needsCtrl = shortcut.ctrl || false;
      const needsShift = shortcut.shift || false;
      const needsAlt = shortcut.alt || false;

      const ctrlMatch = needsCtrl ? (e.metaKey || e.ctrlKey) : !(e.metaKey || e.ctrlKey);
      const shiftMatch = needsShift ? e.shiftKey : !e.shiftKey;
      const altMatch = needsAlt ? e.altKey : !e.altKey;

      if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        // Allow Ctrl+K etc. even in inputs, but skip plain key shortcuts when typing
        if (isEditable && !needsCtrl && !needsAlt) continue;

        e.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, [shortcuts, ...deps]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useHotkeys;
