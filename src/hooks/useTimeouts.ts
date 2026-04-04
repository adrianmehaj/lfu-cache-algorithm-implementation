import { useCallback, useEffect, useRef } from 'react';

/**
 * Managed timeout registry with automatic cleanup on unmount.
 * Every scheduled timeout is tracked so it can be bulk-cancelled
 * (e.g. when stopping a demo) and is always cleared when the host
 * component unmounts — preventing stale setState calls.
 */
export function useTimeouts() {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const push = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  return { push, clearAll } as const;
}
