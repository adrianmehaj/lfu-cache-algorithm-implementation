import { useCallback, useRef, useState } from 'react';
import { LFUCache } from '../core/LFUCache';
import type { CacheSnapshot, Highlight, LogEntry, Stats } from '../types';
import { emptyHighlight, emptyStats } from '../types';

let seq = 0;
const uid = () => `l${++seq}`;

const DEMO: Array<{ op: 'put' | 'get'; k: number; v?: number }> = [
  { op: 'put', k: 1, v: 1 }, { op: 'put', k: 2, v: 2 },
  { op: 'get', k: 1 },       { op: 'put', k: 3, v: 3 },
  { op: 'get', k: 2 },       { op: 'get', k: 3 },
  { op: 'put', k: 4, v: 4 }, { op: 'get', k: 1 },
  { op: 'get', k: 3 },       { op: 'get', k: 4 },
];

function snap(c: LFUCache, hl: Highlight): CacheSnapshot {
  const s = c.getState();
  return {
    ...s,
    entries: s.freqBuckets.flatMap((b) => b.nodes),
    freqBuckets: s.freqBuckets.map((b) => ({ ...b, isMinFreq: b.freq === s.minFreq })),
    highlight: hl,
  };
}

function allKeys(c: LFUCache): Set<number> {
  return new Set(c.getState().freqBuckets.flatMap((b) => b.nodes.map((n) => n.key)));
}

export function useLFUCache(initCap = 2) {
  const cacheRef = useRef(new LFUCache(initCap));
  const [capacity, setCapState] = useState(initCap);
  const [snapshot, setSnap] = useState<CacheSnapshot>(() => snap(cacheRef.current, emptyHighlight()));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [demoIdx, setDemoIdx] = useState(0);

  const put = useCallback((key: number, value: number) => {
    const c = cacheRef.current;
    const before = allKeys(c);
    const isUpdate = before.has(key);
    c.put(key, value);
    const after = allKeys(c);

    let evictedKey: number | null = null;
    if (!isUpdate) {
      for (const k of before) {
        if (!after.has(k)) { evictedKey = k; break; }
      }
    }

    const hl: Highlight = {
      insertedKey: isUpdate ? null : key,
      updatedKey: isUpdate ? key : null,
      accessedKey: null,
      evictedKey,
    };
    setSnap(snap(c, hl));

    const newLogs: LogEntry[] = [];
    if (evictedKey != null) newLogs.push({ id: uid(), type: 'evict', key: evictedKey });
    newLogs.push({ id: uid(), type: 'put', key, value, update: isUpdate });
    setLogs((p) => [...p, ...newLogs]);
    setStats((s) => ({ ...s, puts: s.puts + 1, evictions: s.evictions + (evictedKey != null ? 1 : 0) }));
  }, []);

  const get = useCallback((key: number) => {
    const result = cacheRef.current.get(key);
    const hit = result !== -1;
    setSnap(snap(cacheRef.current, { ...emptyHighlight(), accessedKey: hit ? key : null }));
    setLogs((p) => [...p, { id: uid(), type: 'get', key, result, hit }]);
    setStats((s) => ({ ...s, gets: s.gets + 1, hits: s.hits + (hit ? 1 : 0), misses: s.misses + (hit ? 0 : 1) }));
    return result;
  }, []);

  const reset = useCallback(() => {
    cacheRef.current.reset(capacity);
    setSnap(snap(cacheRef.current, emptyHighlight()));
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);
  }, [capacity]);

  const setCapacity = useCallback((cap: number) => {
    if (cap < 0) return;
    setCapState(cap);
    cacheRef.current = new LFUCache(cap);
    setSnap(snap(cacheRef.current, emptyHighlight()));
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);
  }, []);

  const loadDemo = useCallback(() => setCapacity(2), [setCapacity]);

  const stepDemo = useCallback(() => {
    if (demoIdx >= DEMO.length) return;
    const s = DEMO[demoIdx];
    s.op === 'put' ? put(s.k, s.v!) : get(s.k);
    setDemoIdx((i) => i + 1);
  }, [demoIdx, put, get]);

  return {
    put, get, reset, setCapacity, loadDemo, stepDemo,
    capacity, snapshot, logs, stats,
    hasMoreDemoSteps: demoIdx < DEMO.length, demoStepIndex: demoIdx,
  };
}
