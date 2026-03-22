import { useCallback, useRef, useState } from 'react';
import { LFUCache } from '../lfu/LFUCache';
import type {
  CacheStateSnapshot,
  CacheStats,
  HighlightState,
  OperationLogEntry,
} from '../types/cache.types';

const DEFAULT_CAPACITY = 2;

const DEMO_STEPS: Array<{ op: 'put' | 'get'; key: number; value?: number }> = [
  { op: 'put', key: 1, value: 1 },
  { op: 'put', key: 2, value: 2 },
  { op: 'get', key: 1 },
  { op: 'put', key: 3, value: 3 },
  { op: 'get', key: 2 },
  { op: 'get', key: 3 },
  { op: 'put', key: 4, value: 4 },
  { op: 'get', key: 1 },
  { op: 'get', key: 3 },
  { op: 'get', key: 4 },
];

function genId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * React hook that wraps LFUCache with UI state, logs, stats, and demo controls.
 */
export function useLFUCache(initialCapacity: number = DEFAULT_CAPACITY) {
  const [capacity, setCapacityState] = useState(initialCapacity);
  const cacheRef = useRef<LFUCache | null>(null);
  const [logs, setLogs] = useState<OperationLogEntry[]>([]);
  const [stats, setStats] = useState<CacheStats>({
    totalPut: 0,
    totalGet: 0,
    evictions: 0,
    hits: 0,
    misses: 0,
  });
  const [highlight, setHighlight] = useState<HighlightState>({
    insertedKey: null,
    accessedKey: null,
    updatedKey: null,
    evictedKey: null,
  });
  const [demoStepIndex, setDemoStepIndex] = useState(0);

  if (cacheRef.current == null) {
    cacheRef.current = new LFUCache(capacity);
  }
  const cache = cacheRef.current;

  const [snapshot, setSnapshot] = useState<CacheStateSnapshot>(() =>
    cache.snapshot(highlight)
  );

  const clearHighlight = useCallback(() => {
    setHighlight({
      insertedKey: null,
      accessedKey: null,
      updatedKey: null,
      evictedKey: null,
    });
  }, []);

  const setCapacity = useCallback((newCapacity: number) => {
    if (newCapacity < 0) return;
    setCapacityState(newCapacity);
    cacheRef.current = new LFUCache(newCapacity);
    setLogs([]);
    setStats({
      totalPut: 0,
      totalGet: 0,
      evictions: 0,
      hits: 0,
      misses: 0,
    });
    clearHighlight();
    setSnapshot(cacheRef.current.snapshot(emptyHighlight()));
    setDemoStepIndex(0);
  }, [clearHighlight]);

  const put = useCallback(
    (key: number, value: number) => {
      const cache = cacheRef.current!;
      const result = cache.put(key, value);
      const hl: HighlightState = {
        insertedKey: result.action === 'insert' ? key : null,
        accessedKey: null,
        updatedKey: result.action === 'update' ? key : null,
        evictedKey: result.evictedKey,
      };
      setHighlight(hl);
      setSnapshot(cache.snapshot(hl));

      setStats((s) => ({
        ...s,
        totalPut: s.totalPut + 1,
        evictions: s.evictions + (result.evictedKey != null ? 1 : 0),
      }));

      const entries: OperationLogEntry[] = [];
      if (result.evictedKey != null) {
        entries.push({
          id: genId(),
          type: 'evict',
          message: `EVICT key=${result.evictedKey}`,
          args: {},
        });
      }
      entries.push({
        id: genId(),
        type: 'put',
        message:
          result.action === 'update'
            ? `PUT(${key}, ${value}) [updated]`
            : `PUT(${key}, ${value})`,
        args: { key, value },
      });
      setLogs((prev) => [...prev, ...entries]);
    },
    []
  );

  const get = useCallback((key: number) => {
    const cache = cacheRef.current!;
    const result = cache.get(key);
    const hit = result !== -1;
    const hl: HighlightState = {
      insertedKey: null,
      accessedKey: hit ? key : null,
      updatedKey: null,
      evictedKey: null,
    };
    setHighlight(hl);
    setSnapshot(cache.snapshot(hl));

    setStats((s) => ({
      ...s,
      totalGet: s.totalGet + 1,
      hits: s.hits + (hit ? 1 : 0),
      misses: s.misses + (hit ? 0 : 1),
    }));

    setLogs((prev) => [
      ...prev,
      {
        id: genId(),
        type: 'get',
        message: `GET(${key}) => ${result}`,
        args: { key },
        result,
        hit,
      },
    ]);

    return result;
  }, []);

  const reset = useCallback(() => {
    const cache = cacheRef.current!;
    cache.reset(capacity);
    setLogs([]);
    setStats({
      totalPut: 0,
      totalGet: 0,
      evictions: 0,
      hits: 0,
      misses: 0,
    });
    clearHighlight();
    setSnapshot(cache.snapshot(emptyHighlight()));
    setDemoStepIndex(0);
  }, [capacity, clearHighlight]);

  const loadDemo = useCallback(() => {
    setCapacity(2);
  }, [setCapacity]);

  const stepDemo = useCallback(() => {
    if (demoStepIndex >= DEMO_STEPS.length) return;
    const step = DEMO_STEPS[demoStepIndex];
    if (step.op === 'put' && step.value != null) {
      put(step.key, step.value);
    } else {
      get(step.key);
    }
    setDemoStepIndex((i) => i + 1);
  }, [put, get, demoStepIndex]);

  const hasMoreDemoSteps = demoStepIndex < DEMO_STEPS.length;

  return {
    put,
    get,
    reset,
    setCapacity,
    loadDemo,
    stepDemo,
    capacity,
    snapshot,
    logs,
    stats,
    hasMoreDemoSteps,
    demoStepIndex,
  };
}

function emptyHighlight(): HighlightState {
  return {
    insertedKey: null,
    accessedKey: null,
    updatedKey: null,
    evictedKey: null,
  };
}
