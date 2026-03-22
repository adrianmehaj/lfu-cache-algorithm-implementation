import { useCallback, useRef, useState } from 'react';
import { LFUCache } from '../lfu/LFUCache';
import type { CacheStateSnapshot } from '../types/cache.types';

const DEFAULT_CAPACITY = 2;

/**
 * React hook that wraps the LFUCache class and provides state for UI.
 * Exposes put, get, reset and a reactive snapshot of cache state.
 */
export function useLFUCache(capacity: number = DEFAULT_CAPACITY) {
  const cacheRef = useRef<LFUCache | null>(null);
  const prevCapacityRef = useRef(capacity);
  if (
    cacheRef.current == null ||
    prevCapacityRef.current !== capacity
  ) {
    cacheRef.current = new LFUCache(capacity);
    prevCapacityRef.current = capacity;
  }
  const cache = cacheRef.current;

  const [snapshot, setSnapshot] = useState<CacheStateSnapshot>(() =>
    buildSnapshot(cache, null, null)
  );

  const put = useCallback(
    (key: number, value: number) => {
      cache.put(key, value);
      setSnapshot(buildSnapshot(cache, null, null));
    },
    [cache]
  );

  const get = useCallback(
    (key: number) => {
      const result = cache.get(key);
      setSnapshot(buildSnapshot(cache, result, key));
      return result;
    },
    [cache]
  );

  const reset = useCallback(() => {
    cache.reset();
    setSnapshot(buildSnapshot(cache, null, null));
  }, [cache]);

  return { put, get, reset, snapshot };
}

function buildSnapshot(
  cache: LFUCache,
  lastGetResult: number | null,
  _lastGetKey: number | null
): CacheStateSnapshot {
  const s = cache.getStateSnapshot();
  return {
    ...s,
    lastGetResult,
  };
}
