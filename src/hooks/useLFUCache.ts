import { useCallback, useRef, useState } from 'react';
import { LFUCache } from '../core/LFUCacheAlgorithm';
import type { CacheSnapshot, Highlight, LogEntry, Stats } from '../types';
import { emptyHighlight, emptyStats } from '../types';
import { useI18n } from '../i18n/I18nContext';

let seq = 0;
const uid = () => `l${++seq}`;

function defined(obj: Record<string, string | number | undefined>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

function snap(c: LFUCache, hl: Highlight): CacheSnapshot {
  const s = c.getState();
  return {
    ...s,
    entries: s.freqBuckets.flatMap((b) => b.nodes),
    freqBuckets: s.freqBuckets.map((b) => ({ ...b, isMinFreq: b.freq === s.minFreq })),
    highlight: hl,
  };
}

export function useLFUCache(initCap = 2) {
  const { t } = useI18n();
  const cacheRef = useRef(new LFUCache(initCap));
  const [capacity, setCapState] = useState(initCap);
  const [snapshot, setSnap] = useState<CacheSnapshot>(() => snap(cacheRef.current, emptyHighlight()));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [demoIdx, setDemoIdx] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [demoFocus, setDemoFocus] = useState<'modal' | 'viz' | 'logs' | null>(null);
  const [recordedActions, setRecordedActions] = useState<Array<{ op: 'put' | 'get'; k: number; v?: number; cap: number; type: 'put' | 'update' | 'evict' | 'hit' | 'miss'; old?: number; oldVal?: number }>>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const stopDemo = useCallback(() => {
    clearAllTimeouts();
    setDemoActive(false);
    setDemoMessage(null);
    setDemoFocus(null);
  }, [clearAllTimeouts]);

  const sequence = [
    { op: 'put' as const, k: 1, v: 1, msgKey: 'demo.put' },
    { op: 'put' as const, k: 2, v: 2, msgKey: 'demo.putFull' },
    { op: 'get' as const, k: 1, msgKey: 'demo.getFreq', vars: { f1: 1, f2: 2 } },
    { op: 'put' as const, k: 3, v: 3, msgKey: 'demo.evict', vars: { old: 2, oldVal: 2, f: 1 } },
    { op: 'get' as const, k: 2, msgKey: 'demo.miss' },
    { op: 'get' as const, k: 3, msgKey: 'demo.get', vars: { f: 2 } },
    { op: 'put' as const, k: 4, v: 4, msgKey: 'demo.tieBreak', vars: { old: 1, oldVal: 1, f: 2 } },
    { op: 'get' as const, k: 1, msgKey: 'demo.missEvict', vars: { new: 4 } },
    { op: 'get' as const, k: 3, msgKey: 'demo.get', vars: { f: 3 } },
    { op: 'get' as const, k: 4, msgKey: 'demo.get', vars: { f: 2 } },
  ];

  const put = useCallback((key: number, value: number) => {
    if (demoActive) stopDemo();
    const c = cacheRef.current;
    const isUpdate = c.getState().freqBuckets.some(b => b.nodes.some(n => n.key === key));
    const { evicted } = c.put(key, value);

    setRecordedActions(p => [...p, { 
      op: 'put', k: key, v: value, cap: capacity,
      type: isUpdate ? 'update' : (evicted ? 'evict' : 'put'),
      old: evicted?.key,
      oldVal: evicted?.value
    }]);

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
  }, [capacity, demoActive, stopDemo]);

  const get = useCallback((key: number) => {
    if (demoActive) stopDemo();
    const result = cacheRef.current.get(key);
    const hit = result !== -1;

    setRecordedActions(p => [...p, { 
      op: 'get', k: key, v: result, cap: capacity,
      type: hit ? 'hit' : 'miss'
    }]);

    setSnap(snap(cacheRef.current, { ...emptyHighlight(), accessedKey: hit ? key : null }));
    setLogs((p) => [...p, { id: uid(), type: 'get', key, result, hit }]);
    setStats((s) => ({ ...s, gets: s.gets + 1, hits: s.hits + (hit ? 1 : 0), misses: s.misses + (hit ? 0 : 1) }));
    return result;
  }, [capacity, demoActive, stopDemo]);

  const reset = useCallback(() => {
    cacheRef.current.reset(capacity);
    setSnap(snap(cacheRef.current, emptyHighlight()));
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);
    setRecordedActions([]);
  }, [capacity]);

  const setCapacity = useCallback((cap: number) => {
    if (cap < 0) return;
    setCapState(cap);
    cacheRef.current = new LFUCache(cap);
    setSnap(snap(cacheRef.current, emptyHighlight()));
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);
    setRecordedActions([]);
  }, []);

  const loadDemo = useCallback(() => {
    if (demoActive) return;
    setDemoActive(true);
    
    cacheRef.current = new LFUCache(2);
    setCapState(2);
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);
    
    [3, 2, 1].forEach((n, i) => {
      const t_count = setTimeout(() => {
        setDemoMessage(String(n));
        setDemoFocus('modal');
      }, i * 800);
      timeoutsRef.current.push(t_count);
    });

    const startT = setTimeout(() => {
      sequence.forEach((s, i) => {
        const stepTime = 8000;
        const t1 = setTimeout(() => {
          setDemoMessage(t('demo.step', { n: i + 1, msg: t(s.msgKey, defined({ k: s.k, v: s.v ?? 0, ...s.vars })) }));
          setDemoFocus('modal');

          const t2 = setTimeout(() => {
            setDemoFocus('viz');
            let hl: Highlight;
            const newLogs: LogEntry[] = [];

            if (s.op === 'put') {
              const { evicted } = cacheRef.current.put(s.k, s.v!);
              hl = { insertedKey: s.k, updatedKey: null, accessedKey: null, evictedKey: evicted?.key ?? null, evictedValue: evicted?.value ?? null };
              if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
              newLogs.push({ id: uid(), type: 'put', key: s.k, value: s.v!, update: false });
            } else {
              const result = cacheRef.current.get(s.k);
              const hit = result !== -1;
              hl = { insertedKey: null, updatedKey: null, accessedKey: hit ? s.k : null, evictedKey: null, evictedValue: null };
              newLogs.push({ id: uid(), type: 'get', key: s.k, result, hit });
            }

            setSnap(snap(cacheRef.current, hl));
            setLogs((p) => [...p, ...newLogs]);
            setDemoIdx(i + 1);
          }, 3000);
          timeoutsRef.current.push(t2);

          const t3 = setTimeout(() => setDemoFocus('logs'), 6000);
          timeoutsRef.current.push(t3);

          if (i === sequence.length - 1) {
            const t4 = setTimeout(() => {
              setDemoMessage(t('demo.done'));
              setDemoFocus('modal');
              const t5 = setTimeout(() => {
                setDemoMessage(null);
                setDemoActive(false);
                setDemoFocus(null);
              }, 5000);
              timeoutsRef.current.push(t5);
            }, stepTime);
            timeoutsRef.current.push(t4);
          }
        }, i * stepTime);
        timeoutsRef.current.push(t1);
      });
    }, 2400);
    timeoutsRef.current.push(startT);
  }, [demoActive, sequence, t]);

  const stepDemo = useCallback(() => {
    if (demoIdx >= sequence.length) {
      cacheRef.current = new LFUCache(2);
      setCapState(2);
      setLogs([]);
      setStats(emptyStats);
      setDemoIdx(0);
      setDemoMessage(t('demo.manualStart'));
      setTimeout(() => setDemoMessage(null), 2000);
      return;
    }

    const s = sequence[demoIdx];
    setDemoMessage(t('demo.step', { n: demoIdx + 1, msg: t(s.msgKey, defined({ k: s.k, v: s.v ?? 0, ...s.vars })) }));
    setDemoFocus('modal');

    setTimeout(() => {
      setDemoFocus('viz');
      let hl: Highlight;
      const newLogs: LogEntry[] = [];

      if (s.op === 'put') {
        const { evicted } = cacheRef.current.put(s.k, s.v!);
        hl = { insertedKey: s.k, updatedKey: null, accessedKey: null, evictedKey: evicted?.key ?? null, evictedValue: evicted?.value ?? null };
        if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
        newLogs.push({ id: uid(), type: 'put', key: s.k, value: s.v!, update: false });
      } else {
        const result = cacheRef.current.get(s.k);
        const hit = result !== -1;
        hl = { insertedKey: null, updatedKey: null, accessedKey: hit ? s.k : null, evictedKey: null, evictedValue: null };
        newLogs.push({ id: uid(), type: 'get', key: s.k, result, hit });
      }

      setSnap(snap(cacheRef.current, hl));
      setLogs((p) => [...p, ...newLogs]);
      setDemoIdx((i) => i + 1);

      setTimeout(() => {
        setDemoFocus('logs');
        setTimeout(() => {
          setDemoFocus(null);
          if (demoIdx + 1 === sequence.length) {
            setDemoMessage(t('demo.manualDone'));
            setTimeout(() => setDemoMessage(null), 3000);
          }
        }, 1500);
      }, 2000);
    }, 2000);
  }, [demoIdx, sequence, t]);

  const runRecordedDemo = useCallback(() => {
    if (demoActive || recordedActions.length === 0) return;
    setDemoActive(true);
    
    const startCap = recordedActions[0].cap;
    cacheRef.current = new LFUCache(startCap);
    setCapState(startCap);
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);

    const stepTime = 8000;
    
    recordedActions.forEach((s, i) => {
      const t1 = setTimeout(() => {
        let msg = '';
        if (s.type === 'put') msg = t('demo.customPut', { k: s.k, v: s.v ?? 0 });
        else if (s.type === 'update') msg = t('demo.customUpdate', { k: s.k, v: s.v ?? 0 });
        else if (s.type === 'evict') msg = t('demo.customEvict', { k: s.k, v: s.v ?? 0, old: s.old ?? 0, oldVal: s.oldVal ?? 0 });
        else if (s.type === 'hit') msg = t('demo.customHit', { k: s.k, v: s.v ?? 0 });
        else if (s.type === 'miss') msg = t('demo.customMiss', { k: s.k });

        setDemoMessage(msg);
        setDemoFocus('modal');

        const t2 = setTimeout(() => {
          setDemoFocus('viz');
          let hl: Highlight;
          const newLogs: LogEntry[] = [];

          if (s.op === 'put') {
            const { evicted } = cacheRef.current.put(s.k, s.v ?? 0);
            hl = { insertedKey: s.k, updatedKey: null, accessedKey: null, evictedKey: evicted?.key ?? null, evictedValue: evicted?.value ?? null };
            if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
            newLogs.push({ id: uid(), type: 'put', key: s.k, value: s.v ?? 0, update: false });
          } else {
            const result = cacheRef.current.get(s.k);
            const hit = result !== -1;
            hl = { insertedKey: null, updatedKey: null, accessedKey: hit ? s.k : null, evictedKey: null, evictedValue: null };
            newLogs.push({ id: uid(), type: 'get', key: s.k, result, hit });
          }

          setSnap(snap(cacheRef.current, hl));
          setLogs((p) => [...p, ...newLogs]);
          setDemoIdx(i + 1);
        }, 3000);
        timeoutsRef.current.push(t2);

        const t3 = setTimeout(() => setDemoFocus('logs'), 6000);
        timeoutsRef.current.push(t3);

        if (i === recordedActions.length - 1) {
          const t4 = setTimeout(() => {
            setDemoMessage(t('demo.customDone'));
            setDemoFocus('modal');
            const t5 = setTimeout(() => {
              setDemoMessage(null);
              setDemoActive(false);
              setDemoFocus(null);
            }, 4000);
            timeoutsRef.current.push(t5);
          }, stepTime);
          timeoutsRef.current.push(t4);
        }
      }, i * stepTime);
      timeoutsRef.current.push(t1);
    });
  }, [demoActive, recordedActions, t]);

  return {
    put, get, reset, setCapacity, loadDemo, stepDemo, runRecordedDemo, stopDemo,
    capacity, snapshot, logs, stats,
    hasMoreDemoSteps: demoIdx < sequence.length, demoStepIndex: demoIdx,
    demoMessage, demoActive, demoFocus, hasRecordedActions: recordedActions.length > 0,
  };
}
