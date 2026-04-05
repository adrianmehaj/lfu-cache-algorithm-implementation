import { useCallback, useRef, useState } from 'react';
import type { Highlight, LogEntry } from '../../types';
import * as C from './constants';
import { defined, snap, uid } from './cacheUiSync';
import { DEMO_SEQUENCE, type SeqStep } from './leetCodeSequence';
import { scheduleResumeFromPause } from './resumeFromDemoPause';
import type { DemoFocus, DemoKind, DemoOrchestrationDeps, PauseSnapshot, RecordedAction } from './types';

export type { RecordedAction } from './types';
export { DEMO_STEP_MS } from './constants';
export { snap, uid } from './cacheUiSync';

export function useDemoOrchestration(deps: DemoOrchestrationDeps) {
  const { push, clearAll, cacheRef, setSnap, setLogs, t } = deps;

  const [demoActive, setDemoActive] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [demoFocus, setDemoFocus] = useState<DemoFocus>(null);

  const demoSegmentEndsAtRef = useRef<number | null>(null);
  const demoPhaseRef = useRef<string>('idle');
  const demoKindRef = useRef<DemoKind | 'idle'>('idle');
  const pauseSnapshotRef = useRef<PauseSnapshot | null>(null);
  const recordedActionsRef = useRef<RecordedAction[]>([]);
  const tRef = useRef(t);
  tRef.current = t;

  const markSegment = useCallback((ms: number) => {
    demoSegmentEndsAtRef.current = Date.now() + ms;
  }, []);

  const applyStepOp = useCallback(
    (s: SeqStep) => {
      let hl: Highlight;
      const newLogs: LogEntry[] = [];
      if (s.op === 'put') {
        const { evicted } = cacheRef.current!.put(s.k, s.v!);
        hl = {
          insertedKey: s.k,
          updatedKey: null,
          accessedKey: null,
          evictedKey: evicted?.key ?? null,
          evictedValue: evicted?.value ?? null,
        };
        if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
        newLogs.push({ id: uid(), type: 'put', key: s.k, value: s.v!, update: false });
      } else {
        const result = cacheRef.current!.get(s.k);
        const hit = result !== -1;
        hl = {
          insertedKey: null,
          updatedKey: null,
          accessedKey: hit ? s.k : null,
          evictedKey: null,
          evictedValue: null,
        };
        newLogs.push({ id: uid(), type: 'get', key: s.k, result, hit });
      }
      setSnap(snap(cacheRef.current!, hl));
      setLogs((p) => [...p, ...newLogs]);
    },
    [cacheRef, setSnap, setLogs],
  );

  const applyRecordedStep = useCallback(
    (s: { op: 'put' | 'get'; k: number; v?: number }) => {
      let hl: Highlight;
      const newLogs: LogEntry[] = [];
      if (s.op === 'put') {
        const { evicted } = cacheRef.current!.put(s.k, s.v ?? 0);
        hl = {
          insertedKey: s.k,
          updatedKey: null,
          accessedKey: null,
          evictedKey: evicted?.key ?? null,
          evictedValue: evicted?.value ?? null,
        };
        if (evicted) newLogs.push({ id: uid(), type: 'evict', key: evicted.key, value: evicted.value });
        newLogs.push({ id: uid(), type: 'put', key: s.k, value: s.v ?? 0, update: false });
      } else {
        const result = cacheRef.current!.get(s.k);
        const hit = result !== -1;
        hl = {
          insertedKey: null,
          updatedKey: null,
          accessedKey: hit ? s.k : null,
          evictedKey: null,
          evictedValue: null,
        };
        newLogs.push({ id: uid(), type: 'get', key: s.k, result, hit });
      }
      setSnap(snap(cacheRef.current!, hl));
      setLogs((p) => [...p, ...newLogs]);
    },
    [cacheRef, setSnap, setLogs],
  );

  const scheduleLoadDone = useCallback(() => {
    const tt = tRef.current;
    demoPhaseRef.current = 'done';
    markSegment(C.DEMO_DONE_HOLD_MS);
    setDemoMessage(tt('demo.done'));
    setDemoFocus('modal');
    push(() => {
      setDemoMessage(null);
      setDemoActive(false);
      setDemoFocus(null);
      demoPhaseRef.current = 'idle';
      demoKindRef.current = 'idle';
      demoSegmentEndsAtRef.current = null;
    }, C.DEMO_DONE_HOLD_MS);
  }, [markSegment, push]);

  const scheduleLoadStepModal = useCallback(
    (i: number, delayMs: number) => {
      const tt = tRef.current;
      const s = DEMO_SEQUENCE[i];
      const total = DEMO_SEQUENCE.length;
      push(() => {
        demoPhaseRef.current = `s:${i}:modal`;
        markSegment(C.DEMO_REVEAL_VIZ_MS);
        setDemoMessage(tt('demo.step', { n: i + 1, msg: tt(s.msgKey, defined({ k: s.k, v: s.v ?? 0, ...s.vars })) }));
        setDemoFocus('modal');

        push(() => {
          demoPhaseRef.current = `s:${i}:viz`;
          markSegment(C.VIZ_SEGMENT_MS);
          setDemoFocus('viz');
          applyStepOp(s);
        }, C.DEMO_REVEAL_VIZ_MS);

        push(() => {
          demoPhaseRef.current = `s:${i}:logs`;
          markSegment(C.LOGS_SEGMENT_MS);
          setDemoFocus('logs');
        }, C.DEMO_FOCUS_LOGS_MS);

        if (i === total - 1) push(() => scheduleLoadDone(), C.DEMO_STEP_MS);
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
        else if (s.type === 'evict')
          msg = tt('demo.customEvict', { k: s.k, v: s.v ?? 0, old: s.old ?? 0, oldVal: s.oldVal ?? 0 });
        else if (s.type === 'hit') msg = tt('demo.customHit', { k: s.k, v: s.v ?? 0 });
        else if (s.type === 'miss') msg = tt('demo.customMiss', { k: s.k });

        demoPhaseRef.current = `s:${i}:modal`;
        markSegment(C.DEMO_REVEAL_VIZ_MS);
        setDemoMessage(msg);
        setDemoFocus('modal');

        push(() => {
          demoPhaseRef.current = `s:${i}:viz`;
          markSegment(C.VIZ_SEGMENT_MS);
          setDemoFocus('viz');
          applyRecordedStep(s);
        }, C.DEMO_REVEAL_VIZ_MS);

        push(() => {
          demoPhaseRef.current = `s:${i}:logs`;
          markSegment(C.LOGS_SEGMENT_MS);
          setDemoFocus('logs');
        }, C.DEMO_FOCUS_LOGS_MS);

        if (i === total - 1) {
          push(() => {
            const t2 = tRef.current;
            demoPhaseRef.current = 'done';
            markSegment(C.DEMO_RECORDED_DONE_MS);
            setDemoMessage(t2('demo.customDone'));
            setDemoFocus('modal');
            push(() => {
              setDemoMessage(null);
              setDemoActive(false);
              setDemoFocus(null);
              demoPhaseRef.current = 'idle';
              demoKindRef.current = 'idle';
              demoSegmentEndsAtRef.current = null;
            }, C.DEMO_RECORDED_DONE_MS);
          }, C.DEMO_STEP_MS);
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
        off += C.DEMO_STEP_MS;
      }
    },
    [scheduleLoadStepModal],
  );

  const resumeFromSnapshot = useCallback(
    (ss: PauseSnapshot) => {
      scheduleResumeFromPause({
        snapshot: ss,
        push,
        markSegment,
        setDemoMessage,
        setDemoFocus,
        setDemoActive,
        demoPhaseRef,
        demoKindRef,
        demoSegmentEndsAtRef,
        recordedActions: recordedActionsRef.current,
        applyStepOp,
        applyRecordedStep,
        scheduleLoadDone,
        scheduleLoadStepModal,
        scheduleLoadMainLoop,
        scheduleRecordedStepModal,
        t: tRef.current,
      });
    },
    [
      applyRecordedStep,
      applyStepOp,
      markSegment,
      push,
      scheduleLoadDone,
      scheduleLoadMainLoop,
      scheduleLoadStepModal,
      scheduleRecordedStepModal,
    ],
  );

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
    const snapPause = pauseSnapshotRef.current;
    pauseSnapshotRef.current = null;
    setDemoPaused(false);
    if (snapPause) resumeFromSnapshot(snapPause);
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

  const startCountdown = useCallback(
    (afterFn: () => void) => {
      setDemoMessage('3');
      setDemoFocus('modal');
      demoPhaseRef.current = 'cd:0';
      markSegment(C.DEMO_COUNTDOWN_TICK_MS);
      push(() => {
        setDemoMessage('2');
        demoPhaseRef.current = 'cd:1';
        markSegment(C.DEMO_COUNTDOWN_TICK_MS);
      }, C.DEMO_COUNTDOWN_TICK_MS);
      push(() => {
        setDemoMessage('1');
        demoPhaseRef.current = 'cd:2';
        markSegment(C.LAST_COUNTDOWN_SEGMENT_MS);
      }, 2 * C.DEMO_COUNTDOWN_TICK_MS);
      push(afterFn, C.DEMO_AFTER_COUNTDOWN_MS);
    },
    [markSegment, push],
  );

  const loadDemo = useCallback(() => {
    stopDemo();
    setDemoActive(true);
    setDemoPaused(false);
    demoKindRef.current = 'load';
    startCountdown(() => scheduleLoadMainLoop(0, 0));
  }, [stopDemo, startCountdown, scheduleLoadMainLoop]);

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
        for (let i = 0; i < ra.length; i++) scheduleRecordedStepModal(i, i * C.DEMO_STEP_MS, ra);
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
