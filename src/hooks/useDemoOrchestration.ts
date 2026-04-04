import { useCallback, useRef, useState } from 'react';
import type { Highlight, LogEntry } from '../types';
import { LFUCache } from '../core/LFUCacheAlgorithm';

/* ── Timing constants ── */

const DEMO_STEP_MS = 14_000;
const DEMO_REVEAL_VIZ_MS = 5_000;
const DEMO_FOCUS_LOGS_MS = 9_500;
const DEMO_COUNTDOWN_TICK_MS = 1_200;
const DEMO_AFTER_COUNTDOWN_MS = 3 * DEMO_COUNTDOWN_TICK_MS + 400;
const DEMO_DONE_HOLD_MS = 6_500;
const DEMO_RECORDED_DONE_MS = 5_500;

const VIZ_SEGMENT_MS = DEMO_FOCUS_LOGS_MS - DEMO_REVEAL_VIZ_MS;
const LOGS_SEGMENT_MS = DEMO_STEP_MS - DEMO_FOCUS_LOGS_MS;
const LAST_COUNTDOWN_SEGMENT_MS = DEMO_AFTER_COUNTDOWN_MS - 2 * DEMO_COUNTDOWN_TICK_MS;

export { DEMO_STEP_MS };

/* ── Shared helpers ── */

let seq = 0;
const uid = () => `l${++seq}`;

function defined(obj: Record<string, string | number | undefined>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

/* ── Types ── */

type DemoKind = 'load' | 'recorded';

type PauseSnapshot = {
  kind: DemoKind;
  phase: string;
  remainingMs: number;
};

type DemoFocus = 'modal' | 'viz' | 'logs' | null;

type SeqStep = {
  op: 'put' | 'get';
  k: number;
  v?: number;
  msgKey: string;
  vars?: Record<string, string | number>;
};

export type RecordedAction = {
  op: 'put' | 'get';
  k: number;
  v?: number;
  cap: number;
  type: 'put' | 'update' | 'evict' | 'hit' | 'miss';
  old?: number;
  oldVal?: number;
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

/* ── Snap helper (same as old code, centralised) ── */

function snap(c: LFUCache, hl: Highlight) {
  const s = c.getState();
  return {
    ...s,
    entries: s.freqBuckets.flatMap((b) => b.nodes),
    freqBuckets: s.freqBuckets.map((b) => ({ ...b, isMinFreq: b.freq === s.minFreq })),
    highlight: hl,
  };
}

export { snap, uid };

/* ── Hook interface ── */

interface Deps {
  push: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearAll: () => void;
  cacheRef: React.RefObject<LFUCache>;
  setSnap: React.Dispatch<React.SetStateAction<ReturnType<typeof snap>>>;
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

export function useDemoOrchestration(deps: Deps) {
  const { push, clearAll, cacheRef, setSnap, setLogs, t } = deps;

  const [demoActive, setDemoActive] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [demoFocus, setDemoFocus] = useState<DemoFocus>(null);

  const demoSegmentEndsAtRef = useRef<number | null>(null);
  const demoPhaseRef = useRef<string>('idle');
  const demoKindRef = useRef<DemoKind | 'idle'>('idle');
  const pauseSnapshotRef = useRef<PauseSnapshot | null>(null);
  const tRef = useRef(t);
  tRef.current = t;

  const markSegment = useCallback((ms: number) => {
    demoSegmentEndsAtRef.current = Date.now() + ms;
  }, []);

  /* ── Apply cache operations during demos ── */

  const applyStepOp = useCallback((s: SeqStep) => {
    let hl: Highlight;
    const newLogs: LogEntry[] = [];
    if (s.op === 'put') {
      const { evicted } = cacheRef.current!.put(s.k, s.v!);
      hl = { insertedKey: s.k, updatedKey: null, accessedKey: null, evictedKey: evicted?.key ?? null, evictedValue: evicted?.value ?? null };
      if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
      newLogs.push({ id: uid(), type: 'put', key: s.k, value: s.v!, update: false });
    } else {
      const result = cacheRef.current!.get(s.k);
      const hit = result !== -1;
      hl = { insertedKey: null, updatedKey: null, accessedKey: hit ? s.k : null, evictedKey: null, evictedValue: null };
      newLogs.push({ id: uid(), type: 'get', key: s.k, result, hit });
    }
    setSnap(snap(cacheRef.current!, hl));
    setLogs((p) => [...p, ...newLogs]);
  }, [cacheRef, setSnap, setLogs]);

  const applyRecordedStep = useCallback(
    (s: { op: 'put' | 'get'; k: number; v?: number }) => {
      let hl: Highlight;
      const newLogs: LogEntry[] = [];
      if (s.op === 'put') {
        const { evicted } = cacheRef.current!.put(s.k, s.v ?? 0);
        hl = { insertedKey: s.k, updatedKey: null, accessedKey: null, evictedKey: evicted?.key ?? null, evictedValue: evicted?.value ?? null };
        if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
        newLogs.push({ id: uid(), type: 'put', key: s.k, value: s.v ?? 0, update: false });
      } else {
        const result = cacheRef.current!.get(s.k);
        const hit = result !== -1;
        hl = { insertedKey: null, updatedKey: null, accessedKey: hit ? s.k : null, evictedKey: null, evictedValue: null };
        newLogs.push({ id: uid(), type: 'get', key: s.k, result, hit });
      }
      setSnap(snap(cacheRef.current!, hl));
      setLogs((p) => [...p, ...newLogs]);
    },
    [cacheRef, setSnap, setLogs],
  );

  /* ── Schedulers ── */

  const scheduleLoadDone = useCallback(() => {
    const tt = tRef.current;
    demoPhaseRef.current = 'done';
    markSegment(DEMO_DONE_HOLD_MS);
    setDemoMessage(tt('demo.done'));
    setDemoFocus('modal');
    push(() => {
      setDemoMessage(null);
      setDemoActive(false);
      setDemoFocus(null);
      demoPhaseRef.current = 'idle';
      demoKindRef.current = 'idle';
      demoSegmentEndsAtRef.current = null;
    }, DEMO_DONE_HOLD_MS);
  }, [markSegment, push]);

  const scheduleLoadStepModal = useCallback(
    (i: number, delayMs: number) => {
      const tt = tRef.current;
      const s = DEMO_SEQUENCE[i];
      const total = DEMO_SEQUENCE.length;
      push(() => {
        demoPhaseRef.current = `s:${i}:modal`;
        markSegment(DEMO_REVEAL_VIZ_MS);
        setDemoMessage(tt('demo.step', { n: i + 1, msg: tt(s.msgKey, defined({ k: s.k, v: s.v ?? 0, ...s.vars })) }));
        setDemoFocus('modal');

        push(() => {
          demoPhaseRef.current = `s:${i}:viz`;
          markSegment(VIZ_SEGMENT_MS);
          setDemoFocus('viz');
          applyStepOp(s);
        }, DEMO_REVEAL_VIZ_MS);

        push(() => {
          demoPhaseRef.current = `s:${i}:logs`;
          markSegment(LOGS_SEGMENT_MS);
          setDemoFocus('logs');
        }, DEMO_FOCUS_LOGS_MS);

        if (i === total - 1) {
          push(() => scheduleLoadDone(), DEMO_STEP_MS);
        }
      }, delayMs);
    },
    [applyStepOp, markSegment, push, scheduleLoadDone],
  );

  const scheduleRecordedStepModal = useCallback(
    (i: number, delayMs: number, actions: RecordedAction[]) => {
      const tt = tRef.current;
      const s = actions[i];
      const total = actions.length;
      push(() => {
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

        push(() => {
          demoPhaseRef.current = `s:${i}:viz`;
          markSegment(VIZ_SEGMENT_MS);
          setDemoFocus('viz');
          applyRecordedStep(s);
        }, DEMO_REVEAL_VIZ_MS);

        push(() => {
          demoPhaseRef.current = `s:${i}:logs`;
          markSegment(LOGS_SEGMENT_MS);
          setDemoFocus('logs');
        }, DEMO_FOCUS_LOGS_MS);

        if (i === total - 1) {
          push(() => {
            const t2 = tRef.current;
            demoPhaseRef.current = 'done';
            markSegment(DEMO_RECORDED_DONE_MS);
            setDemoMessage(t2('demo.customDone'));
            setDemoFocus('modal');
            push(() => {
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
    [applyRecordedStep, markSegment, push],
  );

  const scheduleLoadMainLoop = useCallback(
    (start: number, firstDelay: number) => {
      let off = firstDelay;
      for (let i = start; i < DEMO_SEQUENCE.length; i++) {
        scheduleLoadStepModal(i, off);
        off += DEMO_STEP_MS;
      }
    },
    [scheduleLoadStepModal],
  );

  /* ── Resume from pause snapshot ── */

  const recordedActionsRef = useRef<RecordedAction[]>([]);

  const resumeFromSnapshot = useCallback(
    (ss: PauseSnapshot) => {
      const { phase, remainingMs, kind } = ss;
      const rem = Math.max(0, remainingMs);
      const tt = tRef.current;
      const ra = recordedActionsRef.current;

      const runCountdownFrom = (cdIndex: number, firstRem: number, after: 'load' | 'recorded') => {
        const startAfterCountdown = () => {
          if (after === 'load') {
            scheduleLoadMainLoop(0, 0);
          } else {
            const actions = [...recordedActionsRef.current];
            for (let j = 0; j < actions.length; j++) scheduleRecordedStepModal(j, j * DEMO_STEP_MS, actions);
          }
        };
        if (cdIndex === 0) {
          push(() => {
            setDemoMessage('2');
            demoPhaseRef.current = 'cd:1';
            markSegment(DEMO_COUNTDOWN_TICK_MS);
            push(() => {
              setDemoMessage('1');
              demoPhaseRef.current = 'cd:2';
              markSegment(LAST_COUNTDOWN_SEGMENT_MS);
              push(() => startAfterCountdown(), LAST_COUNTDOWN_SEGMENT_MS);
            }, DEMO_COUNTDOWN_TICK_MS);
          }, firstRem);
        } else if (cdIndex === 1) {
          push(() => {
            setDemoMessage('1');
            demoPhaseRef.current = 'cd:2';
            markSegment(LAST_COUNTDOWN_SEGMENT_MS);
            push(() => startAfterCountdown(), LAST_COUNTDOWN_SEGMENT_MS);
          }, firstRem);
        } else {
          push(() => startAfterCountdown(), firstRem);
        }
      };

      if (phase.startsWith('cd:')) {
        const idx = parseInt(phase.slice(3), 10);
        if (kind !== 'load' && kind !== 'recorded') return;
        runCountdownFrom(idx, rem, kind);
        return;
      }

      if (phase === 'done') {
        push(() => {
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
          push(() => { demoPhaseRef.current = `s:${stepIndex}:viz`; markSegment(VIZ_SEGMENT_MS); setDemoFocus('viz'); applyStepOp(s); }, rem);
          push(() => { demoPhaseRef.current = `s:${stepIndex}:logs`; markSegment(LOGS_SEGMENT_MS); setDemoFocus('logs'); }, rem + DEMO_REVEAL_VIZ_MS);
          if (stepIndex === total - 1) { push(() => scheduleLoadDone(), rem + DEMO_STEP_MS - DEMO_REVEAL_VIZ_MS); }
          else { let off = rem + DEMO_STEP_MS; for (let j = stepIndex + 1; j < total; j++) { scheduleLoadStepModal(j, off); off += DEMO_STEP_MS; } }
          return;
        }
        if (sub === 'viz') {
          push(() => { demoPhaseRef.current = `s:${stepIndex}:logs`; markSegment(LOGS_SEGMENT_MS); setDemoFocus('logs'); }, rem);
          if (stepIndex === total - 1) { push(() => scheduleLoadDone(), rem + LOGS_SEGMENT_MS); }
          else { let off = rem + LOGS_SEGMENT_MS; for (let j = stepIndex + 1; j < total; j++) { scheduleLoadStepModal(j, off); off += DEMO_STEP_MS; } }
          return;
        }
        if (sub === 'logs') {
          if (stepIndex === total - 1) { push(() => scheduleLoadDone(), rem); }
          else { let off = rem; for (let j = stepIndex + 1; j < total; j++) { scheduleLoadStepModal(j, off); off += DEMO_STEP_MS; } }
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
          push(() => {
            setDemoMessage(null); setDemoActive(false); setDemoFocus(null);
            demoPhaseRef.current = 'idle'; demoKindRef.current = 'idle'; demoSegmentEndsAtRef.current = null;
          }, DEMO_RECORDED_DONE_MS);
        };
        if (sub === 'modal') {
          push(() => { demoPhaseRef.current = `s:${stepIndex}:viz`; markSegment(VIZ_SEGMENT_MS); setDemoFocus('viz'); applyRecordedStep(s); }, rem);
          push(() => { demoPhaseRef.current = `s:${stepIndex}:logs`; markSegment(LOGS_SEGMENT_MS); setDemoFocus('logs'); }, rem + DEMO_REVEAL_VIZ_MS);
          if (stepIndex === total - 1) { push(() => finishRecorded(), rem + DEMO_STEP_MS - DEMO_REVEAL_VIZ_MS); }
          else { let off = rem + DEMO_STEP_MS; for (let j = stepIndex + 1; j < total; j++) { scheduleRecordedStepModal(j, off, ra); off += DEMO_STEP_MS; } }
          return;
        }
        if (sub === 'viz') {
          push(() => { demoPhaseRef.current = `s:${stepIndex}:logs`; markSegment(LOGS_SEGMENT_MS); setDemoFocus('logs'); }, rem);
          if (stepIndex === total - 1) { push(() => finishRecorded(), rem + LOGS_SEGMENT_MS); }
          else { let off = rem + LOGS_SEGMENT_MS; for (let j = stepIndex + 1; j < total; j++) { scheduleRecordedStepModal(j, off, ra); off += DEMO_STEP_MS; } }
          return;
        }
        if (sub === 'logs') {
          if (stepIndex === total - 1) { push(() => finishRecorded(), rem); }
          else { let off = rem; for (let j = stepIndex + 1; j < total; j++) { scheduleRecordedStepModal(j, off, ra); off += DEMO_STEP_MS; } }
        }
      }
    },
    [applyRecordedStep, applyStepOp, markSegment, push, scheduleLoadDone, scheduleLoadMainLoop, scheduleLoadStepModal, scheduleRecordedStepModal],
  );

  /* ── Pause / resume / stop ── */

  const pauseDemo = useCallback(() => {
    if (!demoActive || demoPaused) return;
    const end = demoSegmentEndsAtRef.current;
    const rem = end != null ? Math.max(0, end - Date.now()) : 0;
    const kind = demoKindRef.current;
    if (kind !== 'load' && kind !== 'recorded') return;
    clearAll();
    pauseSnapshotRef.current = { kind, phase: demoPhaseRef.current, remainingMs: rem };
    setDemoPaused(true);
  }, [clearAll, demoActive, demoPaused]);

  const resumeDemo = useCallback(() => {
    if (!demoActive || !demoPaused) return;
    const ss = pauseSnapshotRef.current;
    pauseSnapshotRef.current = null;
    setDemoPaused(false);
    if (ss) resumeFromSnapshot(ss);
  }, [demoActive, demoPaused, resumeFromSnapshot]);

  const stopDemo = useCallback(() => {
    clearAll();
    setDemoActive(false);
    setDemoPaused(false);
    setDemoMessage(null);
    setDemoFocus(null);
    demoPhaseRef.current = 'idle';
    demoKindRef.current = 'idle';
    demoSegmentEndsAtRef.current = null;
    pauseSnapshotRef.current = null;
  }, [clearAll]);

  const interruptActiveDemoForMobileNav = useCallback(() => {
    if (!demoActive) return;
    stopDemo();
  }, [demoActive, stopDemo]);

  /* ── Start countdown (shared between load & recorded) ── */

  const startCountdown = useCallback(
    (afterFn: () => void) => {
      setDemoMessage('3');
      setDemoFocus('modal');
      demoPhaseRef.current = 'cd:0';
      markSegment(DEMO_COUNTDOWN_TICK_MS);
      push(() => { setDemoMessage('2'); demoPhaseRef.current = 'cd:1'; markSegment(DEMO_COUNTDOWN_TICK_MS); }, DEMO_COUNTDOWN_TICK_MS);
      push(() => { setDemoMessage('1'); demoPhaseRef.current = 'cd:2'; markSegment(LAST_COUNTDOWN_SEGMENT_MS); }, 2 * DEMO_COUNTDOWN_TICK_MS);
      push(afterFn, DEMO_AFTER_COUNTDOWN_MS);
    },
    [markSegment, push],
  );

  /* ── Load LeetCode demo ── */

  const loadDemo = useCallback(() => {
    stopDemo();
    setDemoActive(true);
    setDemoPaused(false);
    demoKindRef.current = 'load';
    startCountdown(() => scheduleLoadMainLoop(0, 0));
  }, [stopDemo, startCountdown, scheduleLoadMainLoop]);

  /* ── Replay recorded actions ── */

  const runRecordedDemo = useCallback(
    (actions: RecordedAction[]) => {
      if (actions.length === 0) return;
      stopDemo();
      recordedActionsRef.current = actions;
      setDemoActive(true);
      setDemoPaused(false);
      demoKindRef.current = 'recorded';
      startCountdown(() => {
        const ra = [...actions];
        for (let i = 0; i < ra.length; i++) scheduleRecordedStepModal(i, i * DEMO_STEP_MS, ra);
      });
    },
    [stopDemo, startCountdown, scheduleRecordedStepModal],
  );

  return {
    demoActive,
    demoPaused,
    demoMessage,
    demoFocus,
    loadDemo,
    runRecordedDemo,
    stopDemo,
    interruptActiveDemoForMobileNav,
    pauseDemo,
    resumeDemo,
  };
}
