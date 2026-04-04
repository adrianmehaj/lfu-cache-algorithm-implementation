import { useCallback, useRef, useState } from 'react';
import { LFUCache } from '../core/LFUCacheAlgorithm';
import type { CacheSnapshot, Highlight, LogEntry, Stats } from '../types';
import { emptyHighlight, emptyStats } from '../types';
import { useI18n } from '../i18n/I18nContext';

let seq = 0;
const uid = () => `l${++seq}`;

/** Auto “Load demo” / recorded replay: ms per full step (modal → viz → log). */
const DEMO_STEP_MS = 14_000;
/** From step start: leave explanation on modal, then run op in viz. */
const DEMO_REVEAL_VIZ_MS = 5_000;
/** From step start: move focus to event log. */
const DEMO_FOCUS_LOGS_MS = 9_500;
const DEMO_COUNTDOWN_TICK_MS = 1_200;
const DEMO_AFTER_COUNTDOWN_MS = 3 * DEMO_COUNTDOWN_TICK_MS + 400;
const DEMO_DONE_HOLD_MS = 6_500;
const DEMO_RECORDED_DONE_MS = 5_500;

const VIZ_SEGMENT_MS = DEMO_FOCUS_LOGS_MS - DEMO_REVEAL_VIZ_MS;
const LOGS_SEGMENT_MS = DEMO_STEP_MS - DEMO_FOCUS_LOGS_MS;
const LAST_COUNTDOWN_SEGMENT_MS = DEMO_AFTER_COUNTDOWN_MS - 2 * DEMO_COUNTDOWN_TICK_MS;

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

type DemoKind = 'load' | 'recorded';

type PauseSnapshot = {
  kind: DemoKind;
  phase: string;
  remainingMs: number;
};

type SeqStep = {
  op: 'put' | 'get';
  k: number;
  v?: number;
  msgKey: string;
  vars?: Record<string, string | number>;
};

const DEMO_SEQUENCE: SeqStep[] = [
  { op: 'put', k: 1, v: 1, msgKey: 'demo.put' },
  { op: 'put', k: 2, v: 2, msgKey: 'demo.putFull' },
  { op: 'get', k: 1, msgKey: 'demo.getFreq', vars: { f1: 1, f2: 2 } },
  { op: 'put', k: 3, v: 3, msgKey: 'demo.evict', vars: { old: 2, oldVal: 2, f: 1 } },
  { op: 'get', k: 2, msgKey: 'demo.miss' },
  { op: 'get', k: 3, msgKey: 'demo.get', vars: { f: 2 } },
  { op: 'put', k: 4, v: 4, msgKey: 'demo.tieBreak', vars: { old: 1, oldVal: 1, f: 2 } },
  { op: 'get', k: 1, msgKey: 'demo.missEvict', vars: { new: 4 } },
  { op: 'get', k: 3, msgKey: 'demo.get', vars: { f: 3 } },
  { op: 'get', k: 4, msgKey: 'demo.get', vars: { f: 2 } },
];

export function useLFUCache(initCap = 2) {
  const { t } = useI18n();
  const cacheRef = useRef(new LFUCache(initCap));
  const [capacity, setCapState] = useState(initCap);
  const [snapshot, setSnap] = useState<CacheSnapshot>(() => snap(cacheRef.current, emptyHighlight()));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [, setDemoIdx] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [demoFocus, setDemoFocus] = useState<'modal' | 'viz' | 'logs' | null>(null);
  const [recordedActions, setRecordedActions] = useState<
    Array<{
      op: 'put' | 'get';
      k: number;
      v?: number;
      cap: number;
      type: 'put' | 'update' | 'evict' | 'hit' | 'miss';
      old?: number;
      oldVal?: number;
    }>
  >([]);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const demoSegmentEndsAtRef = useRef<number | null>(null);
  const demoPhaseRef = useRef<string>('idle');
  const demoKindRef = useRef<DemoKind | 'idle'>('idle');
  const pauseSnapshotRef = useRef<PauseSnapshot | null>(null);
  const tRef = useRef(t);
  tRef.current = t;
  const recordedActionsRef = useRef(recordedActions);
  recordedActionsRef.current = recordedActions;

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const pushTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const markSegment = useCallback((durationMs: number) => {
    demoSegmentEndsAtRef.current = Date.now() + durationMs;
  }, []);

  const applyStepOp = useCallback((s: SeqStep) => {
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
  }, []);

  const applyRecordedStep = useCallback(
    (s: { op: 'put' | 'get'; k: number; v?: number }) => {
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
    },
    []
  );

  const scheduleLoadDone = useCallback(() => {
    const tt = tRef.current;
    demoPhaseRef.current = 'done';
    markSegment(DEMO_DONE_HOLD_MS);
    setDemoMessage(tt('demo.done'));
    setDemoFocus('modal');
    pushTimeout(() => {
      setDemoMessage(null);
      setDemoActive(false);
      setDemoFocus(null);
      demoPhaseRef.current = 'idle';
      demoKindRef.current = 'idle';
      demoSegmentEndsAtRef.current = null;
    }, DEMO_DONE_HOLD_MS);
  }, [markSegment, pushTimeout]);

  const scheduleLoadStepModal = useCallback(
    (i: number, delayMs: number) => {
      const tt = tRef.current;
      const s = DEMO_SEQUENCE[i];
      const total = DEMO_SEQUENCE.length;
      pushTimeout(() => {
        demoPhaseRef.current = `s:${i}:modal`;
        markSegment(DEMO_REVEAL_VIZ_MS);
        setDemoMessage(tt('demo.step', { n: i + 1, msg: tt(s.msgKey, defined({ k: s.k, v: s.v ?? 0, ...s.vars })) }));
        setDemoFocus('modal');

        pushTimeout(() => {
          demoPhaseRef.current = `s:${i}:viz`;
          markSegment(VIZ_SEGMENT_MS);
          setDemoFocus('viz');
          applyStepOp(s);
          setDemoIdx(i + 1);
        }, DEMO_REVEAL_VIZ_MS);

        pushTimeout(() => {
          demoPhaseRef.current = `s:${i}:logs`;
          markSegment(LOGS_SEGMENT_MS);
          setDemoFocus('logs');
        }, DEMO_FOCUS_LOGS_MS);

        if (i === total - 1) {
          pushTimeout(() => scheduleLoadDone(), DEMO_STEP_MS);
        }
      }, delayMs);
    },
    [applyStepOp, markSegment, pushTimeout, scheduleLoadDone]
  );

  const scheduleRecordedStepModal = useCallback(
    (i: number, delayMs: number, actions: typeof recordedActions) => {
      const tt = tRef.current;
      const s = actions[i];
      const total = actions.length;
      pushTimeout(() => {
        let msg = '';
        if (s.type === 'put') msg = tt('demo.customPut', { k: s.k, v: s.v ?? 0 });
        else if (s.type === 'update') msg = tt('demo.customUpdate', { k: s.k, v: s.v ?? 0 });
        else if (s.type === 'evict') msg = tt('demo.customEvict', { k: s.k, v: s.v ?? 0, old: s.old ?? 0, oldVal: s.oldVal ?? 0 });
        else if (s.type === 'hit') msg = tt('demo.customHit', { k: s.k, v: s.v ?? 0 });
        else if (s.type === 'miss') msg = tt('demo.customMiss', { k: s.k });

        demoPhaseRef.current = `s:${i}:modal`;
        markSegment(DEMO_REVEAL_VIZ_MS);
        setDemoMessage(msg);
        setDemoFocus('modal');

        pushTimeout(() => {
          demoPhaseRef.current = `s:${i}:viz`;
          markSegment(VIZ_SEGMENT_MS);
          setDemoFocus('viz');
          applyRecordedStep(s);
          setDemoIdx(i + 1);
        }, DEMO_REVEAL_VIZ_MS);

        pushTimeout(() => {
          demoPhaseRef.current = `s:${i}:logs`;
          markSegment(LOGS_SEGMENT_MS);
          setDemoFocus('logs');
        }, DEMO_FOCUS_LOGS_MS);

        if (i === total - 1) {
          pushTimeout(() => {
            const t2 = tRef.current;
            demoPhaseRef.current = 'done';
            markSegment(DEMO_RECORDED_DONE_MS);
            setDemoMessage(t2('demo.customDone'));
            setDemoFocus('modal');
            pushTimeout(() => {
              setDemoMessage(null);
              setDemoActive(false);
              setDemoFocus(null);
              demoPhaseRef.current = 'idle';
              demoKindRef.current = 'idle';
              demoSegmentEndsAtRef.current = null;
            }, DEMO_RECORDED_DONE_MS);
          }, DEMO_STEP_MS);
        }
      }, delayMs);
    },
    [applyRecordedStep, markSegment, pushTimeout]
  );

  const scheduleLoadMainLoop = useCallback(
    (startStepIndex: number, firstDelayMs: number) => {
      let off = firstDelayMs;
      for (let i = startStepIndex; i < DEMO_SEQUENCE.length; i++) {
        scheduleLoadStepModal(i, off);
        off += DEMO_STEP_MS;
      }
    },
    [scheduleLoadStepModal]
  );

  const resumeFromSnapshot = useCallback(
    (snap: PauseSnapshot) => {
      const { phase, remainingMs, kind } = snap;
      const rem = Math.max(0, remainingMs);
      const tt = tRef.current;
      const ra = recordedActionsRef.current;

      const runCountdownFrom = (cdIndex: number, firstRem: number, afterCountdown: 'load' | 'recorded') => {
        const startAfterCountdown = () => {
          if (afterCountdown === 'load') {
            scheduleLoadMainLoop(0, 0);
          } else {
            const actions = [...recordedActionsRef.current];
            for (let j = 0; j < actions.length; j++) {
              scheduleRecordedStepModal(j, j * DEMO_STEP_MS, actions);
            }
          }
        };
        if (cdIndex === 0) {
          pushTimeout(() => {
            setDemoMessage('2');
            demoPhaseRef.current = 'cd:1';
            markSegment(DEMO_COUNTDOWN_TICK_MS);
            pushTimeout(() => {
              setDemoMessage('1');
              demoPhaseRef.current = 'cd:2';
              markSegment(LAST_COUNTDOWN_SEGMENT_MS);
              pushTimeout(() => startAfterCountdown(), LAST_COUNTDOWN_SEGMENT_MS);
            }, DEMO_COUNTDOWN_TICK_MS);
          }, firstRem);
        } else if (cdIndex === 1) {
          pushTimeout(() => {
            setDemoMessage('1');
            demoPhaseRef.current = 'cd:2';
            markSegment(LAST_COUNTDOWN_SEGMENT_MS);
            pushTimeout(() => startAfterCountdown(), LAST_COUNTDOWN_SEGMENT_MS);
          }, firstRem);
        } else {
          pushTimeout(() => startAfterCountdown(), firstRem);
        }
      };

      if (phase.startsWith('cd:')) {
        const idx = parseInt(phase.slice(3), 10);
        if (kind !== 'load' && kind !== 'recorded') return;
        runCountdownFrom(idx, rem, kind === 'load' ? 'load' : 'recorded');
        return;
      }

      if (phase === 'done') {
        pushTimeout(() => {
          setDemoMessage(null);
          setDemoActive(false);
          setDemoFocus(null);
          demoPhaseRef.current = 'idle';
          demoKindRef.current = 'idle';
          demoSegmentEndsAtRef.current = null;
        }, rem);
        return;
      }

      const m = /^s:(\d+):(modal|viz|logs)$/.exec(phase);
      if (!m) return;
      const stepIndex = parseInt(m[1], 10);
      const sub = m[2];

      if (kind === 'load') {
        const s = DEMO_SEQUENCE[stepIndex];
        const total = DEMO_SEQUENCE.length;
        if (sub === 'modal') {
          pushTimeout(() => {
            demoPhaseRef.current = `s:${stepIndex}:viz`;
            markSegment(VIZ_SEGMENT_MS);
            setDemoFocus('viz');
            applyStepOp(s);
            setDemoIdx(stepIndex + 1);
          }, rem);
          pushTimeout(() => {
            demoPhaseRef.current = `s:${stepIndex}:logs`;
            markSegment(LOGS_SEGMENT_MS);
            setDemoFocus('logs');
          }, rem + DEMO_REVEAL_VIZ_MS);
          if (stepIndex === total - 1) {
            pushTimeout(() => scheduleLoadDone(), rem + DEMO_STEP_MS - DEMO_REVEAL_VIZ_MS);
          } else {
            let off = rem + DEMO_STEP_MS;
            for (let j = stepIndex + 1; j < total; j++) {
              scheduleLoadStepModal(j, off);
              off += DEMO_STEP_MS;
            }
          }
          return;
        }
        if (sub === 'viz') {
          pushTimeout(() => {
            demoPhaseRef.current = `s:${stepIndex}:logs`;
            markSegment(LOGS_SEGMENT_MS);
            setDemoFocus('logs');
          }, rem);
          if (stepIndex === total - 1) {
            pushTimeout(() => scheduleLoadDone(), rem + LOGS_SEGMENT_MS);
          } else {
            let off = rem + LOGS_SEGMENT_MS;
            for (let j = stepIndex + 1; j < total; j++) {
              scheduleLoadStepModal(j, off);
              off += DEMO_STEP_MS;
            }
          }
          return;
        }
        if (sub === 'logs') {
          if (stepIndex === total - 1) {
            pushTimeout(() => scheduleLoadDone(), rem);
          } else {
            let off = rem;
            for (let j = stepIndex + 1; j < total; j++) {
              scheduleLoadStepModal(j, off);
              off += DEMO_STEP_MS;
            }
          }
        }
        return;
      }

      if (kind === 'recorded' && ra.length > 0) {
        const s = ra[stepIndex];
        const total = ra.length;
        const finishRecorded = () => {
          demoPhaseRef.current = 'done';
          markSegment(DEMO_RECORDED_DONE_MS);
          setDemoMessage(tt('demo.customDone'));
          setDemoFocus('modal');
          pushTimeout(() => {
            setDemoMessage(null);
            setDemoActive(false);
            setDemoFocus(null);
            demoPhaseRef.current = 'idle';
            demoKindRef.current = 'idle';
            demoSegmentEndsAtRef.current = null;
          }, DEMO_RECORDED_DONE_MS);
        };

        if (sub === 'modal') {
          pushTimeout(() => {
            demoPhaseRef.current = `s:${stepIndex}:viz`;
            markSegment(VIZ_SEGMENT_MS);
            setDemoFocus('viz');
            applyRecordedStep(s);
            setDemoIdx(stepIndex + 1);
          }, rem);
          pushTimeout(() => {
            demoPhaseRef.current = `s:${stepIndex}:logs`;
            markSegment(LOGS_SEGMENT_MS);
            setDemoFocus('logs');
          }, rem + DEMO_REVEAL_VIZ_MS);
          if (stepIndex === total - 1) {
            pushTimeout(() => finishRecorded(), rem + DEMO_STEP_MS - DEMO_REVEAL_VIZ_MS);
          } else {
            let off = rem + DEMO_STEP_MS;
            for (let j = stepIndex + 1; j < total; j++) {
              scheduleRecordedStepModal(j, off, ra);
              off += DEMO_STEP_MS;
            }
          }
          return;
        }
        if (sub === 'viz') {
          pushTimeout(() => {
            demoPhaseRef.current = `s:${stepIndex}:logs`;
            markSegment(LOGS_SEGMENT_MS);
            setDemoFocus('logs');
          }, rem);
          if (stepIndex === total - 1) {
            pushTimeout(() => finishRecorded(), rem + LOGS_SEGMENT_MS);
          } else {
            let off = rem + LOGS_SEGMENT_MS;
            for (let j = stepIndex + 1; j < total; j++) {
              scheduleRecordedStepModal(j, off, ra);
              off += DEMO_STEP_MS;
            }
          }
          return;
        }
        if (sub === 'logs') {
          if (stepIndex === total - 1) {
            pushTimeout(() => finishRecorded(), rem);
          } else {
            let off = rem;
            for (let j = stepIndex + 1; j < total; j++) {
              scheduleRecordedStepModal(j, off, ra);
              off += DEMO_STEP_MS;
            }
          }
        }
      }
    },
    [
      applyRecordedStep,
      applyStepOp,
      markSegment,
      pushTimeout,
      scheduleLoadDone,
      scheduleLoadMainLoop,
      scheduleLoadStepModal,
      scheduleRecordedStepModal,
    ]
  );

  const pauseDemo = useCallback(() => {
    if (!demoActive || demoPaused) return;
    const end = demoSegmentEndsAtRef.current;
    const rem = end != null ? Math.max(0, end - Date.now()) : 0;
    const kind = demoKindRef.current;
    if (kind !== 'load' && kind !== 'recorded') return;
    clearAllTimeouts();
    pauseSnapshotRef.current = { kind, phase: demoPhaseRef.current, remainingMs: rem };
    setDemoPaused(true);
  }, [clearAllTimeouts, demoActive, demoPaused]);

  const resumeDemo = useCallback(() => {
    if (!demoActive || !demoPaused) return;
    const snap = pauseSnapshotRef.current;
    pauseSnapshotRef.current = null;
    setDemoPaused(false);
    if (snap) resumeFromSnapshot(snap);
  }, [demoActive, demoPaused, resumeFromSnapshot]);

  const stopDemo = useCallback(() => {
    clearAllTimeouts();
    setDemoActive(false);
    setDemoPaused(false);
    setDemoMessage(null);
    setDemoFocus(null);
    demoPhaseRef.current = 'idle';
    demoKindRef.current = 'idle';
    demoSegmentEndsAtRef.current = null;
    pauseSnapshotRef.current = null;
  }, [clearAllTimeouts]);

  /** Stops LeetCode demo or “Replay my actions” when the mobile nav drawer opens. */
  const interruptActiveDemoForMobileNav = useCallback(() => {
    if (!demoActive) return;
    stopDemo();
  }, [demoActive, stopDemo]);

  const put = useCallback(
    (key: number, value: number) => {
      if (demoActive) stopDemo();
      const c = cacheRef.current;
      const isUpdate = c.getState().freqBuckets.some((b) => b.nodes.some((n) => n.key === key));
      const { evicted } = c.put(key, value);

      setRecordedActions((p) => [
        ...p,
        {
          op: 'put',
          k: key,
          v: value,
          cap: capacity,
          type: isUpdate ? 'update' : evicted ? 'evict' : 'put',
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
    [capacity, demoActive, stopDemo]
  );

  const get = useCallback(
    (key: number) => {
      if (demoActive) stopDemo();
      const result = cacheRef.current.get(key);
      const hit = result !== -1;

      setRecordedActions((p) => [...p, { op: 'get', k: key, v: result, cap: capacity, type: hit ? 'hit' : 'miss' }]);

      setSnap(snap(cacheRef.current, { ...emptyHighlight(), accessedKey: hit ? key : null }));
      setLogs((p) => [...p, { id: uid(), type: 'get', key, result, hit }]);
      setStats((s) => ({ ...s, gets: s.gets + 1, hits: s.hits + (hit ? 1 : 0), misses: s.misses + (hit ? 0 : 1) }));
      return result;
    },
    [capacity, demoActive, stopDemo]
  );

  const reset = useCallback(() => {
    stopDemo();
    cacheRef.current.reset(capacity);
    setSnap(snap(cacheRef.current, emptyHighlight()));
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);
    setRecordedActions([]);
  }, [capacity, stopDemo]);

  const setCapacity = useCallback((cap: number) => {
    if (cap < 0) return;
    stopDemo();
    setCapState(cap);
    cacheRef.current = new LFUCache(cap);
    setSnap(snap(cacheRef.current, emptyHighlight()));
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);
    setRecordedActions([]);
  }, [stopDemo]);

  const loadDemo = useCallback(() => {
    stopDemo();
    setDemoActive(true);
    setDemoPaused(false);
    demoKindRef.current = 'load';

    cacheRef.current = new LFUCache(2);
    setCapState(2);
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);

    setDemoMessage('3');
    setDemoFocus('modal');
    demoPhaseRef.current = 'cd:0';
    markSegment(DEMO_COUNTDOWN_TICK_MS);

    pushTimeout(() => {
      setDemoMessage('2');
      demoPhaseRef.current = 'cd:1';
      markSegment(DEMO_COUNTDOWN_TICK_MS);
    }, DEMO_COUNTDOWN_TICK_MS);

    pushTimeout(() => {
      setDemoMessage('1');
      demoPhaseRef.current = 'cd:2';
      markSegment(LAST_COUNTDOWN_SEGMENT_MS);
    }, 2 * DEMO_COUNTDOWN_TICK_MS);

    pushTimeout(() => scheduleLoadMainLoop(0, 0), DEMO_AFTER_COUNTDOWN_MS);
  }, [stopDemo, markSegment, pushTimeout, scheduleLoadMainLoop]);

  const runRecordedDemo = useCallback(() => {
    if (recordedActions.length === 0) return;
    stopDemo();
    setDemoActive(true);
    setDemoPaused(false);
    demoKindRef.current = 'recorded';

    const startCap = recordedActions[0].cap;
    cacheRef.current = new LFUCache(startCap);
    setCapState(startCap);
    setLogs([]);
    setStats(emptyStats);
    setDemoIdx(0);

    const ra = [...recordedActions];

    setDemoMessage('3');
    setDemoFocus('modal');
    demoPhaseRef.current = 'cd:0';
    markSegment(DEMO_COUNTDOWN_TICK_MS);

    pushTimeout(() => {
      setDemoMessage('2');
      demoPhaseRef.current = 'cd:1';
      markSegment(DEMO_COUNTDOWN_TICK_MS);
    }, DEMO_COUNTDOWN_TICK_MS);

    pushTimeout(() => {
      setDemoMessage('1');
      demoPhaseRef.current = 'cd:2';
      markSegment(LAST_COUNTDOWN_SEGMENT_MS);
    }, 2 * DEMO_COUNTDOWN_TICK_MS);

    pushTimeout(() => {
      for (let i = 0; i < ra.length; i++) {
        scheduleRecordedStepModal(i, i * DEMO_STEP_MS, ra);
      }
    }, DEMO_AFTER_COUNTDOWN_MS);
  }, [recordedActions, scheduleRecordedStepModal, stopDemo, markSegment, pushTimeout]);

  return {
    put,
    get,
    reset,
    setCapacity,
    loadDemo,
    runRecordedDemo,
    stopDemo,
    interruptActiveDemoForMobileNav,
    pauseDemo,
    resumeDemo,
    capacity,
    snapshot,
    logs,
    stats,
    demoMessage,
    demoActive,
    demoPaused,
    demoFocus,
    hasRecordedActions: recordedActions.length > 0,
  };
}
