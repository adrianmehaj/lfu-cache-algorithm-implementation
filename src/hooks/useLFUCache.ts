import { useCallback, useRef, useState } from 'react';
import { LFUCache } from '../core/LFUCacheAlgorithm';
import type { CacheSnapshot, Highlight, LogEntry, Stats } from '../types';
import { emptyHighlight, emptyStats } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { useTimeouts } from './useTimeouts';
import { useDemoOrchestration, snap, uid, type RecordedAction } from './useDemoOrchestration';

export function useLFUCache(initCap = 2) {
  const { t } = useI18n();
  const cacheRef = useRef(new LFUCache(initCap));
  const [capacity, setCapState] = useState(initCap);
  const [snapshot, setSnap] = useState<CacheSnapshot>(() => snap(cacheRef.current, emptyHighlight()));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);

  const { push, clearAll } = useTimeouts();

  const demo = useDemoOrchestration({
    push,
    clearAll,
    cacheRef: cacheRef as React.RefObject<LFUCache>,
    setSnap,
    setLogs,
    t,
  });

  /* ── Cache operations ── */

  const put = useCallback(
    (key: number, value: number) => {
      if (demo.demoActive) demo.stopDemo();
      const c = cacheRef.current;
      const isUpdate = c.has(key);
      const { evicted } = c.put(key, value);

      setRecordedActions((p) => [
        ...p,
        {
          op: 'put' as const,
          k: key,
          v: value,
          cap: capacity,
          type: isUpdate ? 'update' as const : evicted ? 'evict' as const : 'put' as const,
          old: evicted?.key,
          oldVal: evicted?.value,
        },
      ]);

      const hl: Highlight = {
        insertedKey: isUpdate ? null : key,
        updatedKey: isUpdate ? key : null,
        accessedKey: null,
        evictedKey: evicted?.key ?? null,
        evictedValue: evicted?.value ?? null,
      };
      setSnap(snap(c, hl));

      const newLogs: LogEntry[] = [];
      if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
      newLogs.push({ id: uid(), type: 'put', key, value, update: isUpdate });
      setLogs((p) => [...p, ...newLogs]);
      setStats((s) => ({ ...s, puts: s.puts + 1, evictions: s.evictions + (evicted ? 1 : 0) }));
    },
    [capacity, demo.demoActive, demo.stopDemo],
  );

  const get = useCallback(
    (key: number) => {
      if (demo.demoActive) demo.stopDemo();
      const result = cacheRef.current.get(key);
      const hit = result !== -1;

      setRecordedActions((p) => [...p, { op: 'get' as const, k: key, v: result, cap: capacity, type: hit ? 'hit' as const : 'miss' as const }]);

      setSnap(snap(cacheRef.current, { ...emptyHighlight(), accessedKey: hit ? key : null }));
      setLogs((p) => [...p, { id: uid(), type: 'get', key, result, hit }]);
      setStats((s) => ({ ...s, gets: s.gets + 1, hits: s.hits + (hit ? 1 : 0), misses: s.misses + (hit ? 0 : 1) }));
      return result;
    },
    [capacity, demo.demoActive, demo.stopDemo],
  );

  const reset = useCallback(() => {
    demo.stopDemo();
    cacheRef.current.reset(capacity);
    setSnap(snap(cacheRef.current, emptyHighlight()));
    setLogs([]);
    setStats(emptyStats);
    setRecordedActions([]);
  }, [capacity, demo.stopDemo]);

  const setCapacity = useCallback(
    (cap: number) => {
      if (cap < 0) return;
      demo.stopDemo();
      setCapState(cap);
      cacheRef.current = new LFUCache(cap);
      setSnap(snap(cacheRef.current, emptyHighlight()));
      setLogs([]);
      setStats(emptyStats);
      setRecordedActions([]);
    },
    [demo.stopDemo],
  );

  const loadDemo = useCallback(() => {
    cacheRef.current = new LFUCache(2);
    setCapState(2);
    setLogs([]);
    setStats(emptyStats);
    demo.loadDemo();
  }, [demo.loadDemo]);

  const runRecordedDemo = useCallback(() => {
    if (recordedActions.length === 0) return;
    const startCap = recordedActions[0].cap;
    cacheRef.current = new LFUCache(startCap);
    setCapState(startCap);
    setLogs([]);
    setStats(emptyStats);
    demo.runRecordedDemo(recordedActions);
  }, [recordedActions, demo.runRecordedDemo]);

  return {
    put,
    get,
    reset,
    setCapacity,
    loadDemo,
    runRecordedDemo,
    stopDemo: demo.stopDemo,
    interruptActiveDemoForMobileNav: demo.interruptActiveDemoForMobileNav,
    pauseDemo: demo.pauseDemo,
    resumeDemo: demo.resumeDemo,
    capacity,
    snapshot,
    logs,
    stats,
    demoMessage: demo.demoMessage,
    demoActive: demo.demoActive,
    demoPaused: demo.demoPaused,
    demoFocus: demo.demoFocus,
    hasRecordedActions: recordedActions.length > 0,
  };
}
