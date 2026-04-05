import type { MutableRefObject } from 'react';
import * as C from './constants';
import { DEMO_SEQUENCE, type SeqStep } from './leetCodeSequence';
import type { DemoFocus, PauseSnapshot, PushTimeout, RecordedAction } from './types';

export interface ResumeFromPauseContext {
  snapshot: PauseSnapshot;
  push: PushTimeout;
  markSegment: (ms: number) => void;
  setDemoMessage: (m: string | null) => void;
  setDemoFocus: (f: DemoFocus) => void;
  setDemoActive: (a: boolean) => void;
  demoPhaseRef: MutableRefObject<string>;
  demoKindRef: MutableRefObject<'idle' | 'load' | 'recorded'>;
  demoSegmentEndsAtRef: MutableRefObject<number | null>;
  recordedActions: RecordedAction[];
  applyStepOp: (s: SeqStep) => void;
  applyRecordedStep: (s: { op: 'put' | 'get'; k: number; v?: number }) => void;
  scheduleLoadDone: () => void;
  scheduleLoadStepModal: (i: number, delayMs: number) => void;
  scheduleLoadMainLoop: (start: number, firstDelay: number) => void;
  scheduleRecordedStepModal: (i: number, delayMs: number, actions: RecordedAction[]) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

/**
 * Re-schedules timeouts after a pause so the demo continues from the saved phase + remaining ms.
 * Keeps phase strings in sync with useDemoOrchestration schedulers.
 */
export function scheduleResumeFromPause(ctx: ResumeFromPauseContext): void {
  const {
    snapshot: ss,
    push,
    markSegment,
    setDemoMessage,
    setDemoFocus,
    setDemoActive,
    demoPhaseRef,
    demoKindRef,
    demoSegmentEndsAtRef,
    recordedActions: ra,
    applyStepOp,
    applyRecordedStep,
    scheduleLoadDone,
    scheduleLoadStepModal,
    scheduleLoadMainLoop,
    scheduleRecordedStepModal,
    t,
  } = ctx;

  const { phase, remainingMs, kind } = ss;
  const rem = Math.max(0, remainingMs);

  const runCountdownFrom = (cdIndex: number, firstRem: number, after: 'load' | 'recorded') => {
    const startAfterCountdown = () => {
      if (after === 'load') scheduleLoadMainLoop(0, 0);
      else {
        const actions = [...ra];
        for (let j = 0; j < actions.length; j++) scheduleRecordedStepModal(j, j * C.DEMO_STEP_MS, actions);
      }
    };
    if (cdIndex === 0) {
      push(() => {
        setDemoMessage('2');
        demoPhaseRef.current = 'cd:1';
        markSegment(C.DEMO_COUNTDOWN_TICK_MS);
        push(() => {
          setDemoMessage('1');
          demoPhaseRef.current = 'cd:2';
          markSegment(C.LAST_COUNTDOWN_SEGMENT_MS);
          push(() => startAfterCountdown(), C.LAST_COUNTDOWN_SEGMENT_MS);
        }, C.DEMO_COUNTDOWN_TICK_MS);
      }, firstRem);
    } else if (cdIndex === 1) {
      push(() => {
        setDemoMessage('1');
        demoPhaseRef.current = 'cd:2';
        markSegment(C.LAST_COUNTDOWN_SEGMENT_MS);
        push(() => startAfterCountdown(), C.LAST_COUNTDOWN_SEGMENT_MS);
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
      push(() => {
        demoPhaseRef.current = `s:${stepIndex}:viz`;
        markSegment(C.VIZ_SEGMENT_MS);
        setDemoFocus('viz');
        applyStepOp(s);
      }, rem);
      push(() => {
        demoPhaseRef.current = `s:${stepIndex}:logs`;
        markSegment(C.LOGS_SEGMENT_MS);
        setDemoFocus('logs');
      }, rem + C.DEMO_REVEAL_VIZ_MS);
      if (stepIndex === total - 1) push(() => scheduleLoadDone(), rem + C.DEMO_STEP_MS - C.DEMO_REVEAL_VIZ_MS);
      else {
        let off = rem + C.DEMO_STEP_MS;
        for (let j = stepIndex + 1; j < total; j++) {
          scheduleLoadStepModal(j, off);
          off += C.DEMO_STEP_MS;
        }
      }
      return;
    }
    if (sub === 'viz') {
      push(() => {
        demoPhaseRef.current = `s:${stepIndex}:logs`;
        markSegment(C.LOGS_SEGMENT_MS);
        setDemoFocus('logs');
      }, rem);
      if (stepIndex === total - 1) push(() => scheduleLoadDone(), rem + C.LOGS_SEGMENT_MS);
      else {
        let off = rem + C.LOGS_SEGMENT_MS;
        for (let j = stepIndex + 1; j < total; j++) {
          scheduleLoadStepModal(j, off);
          off += C.DEMO_STEP_MS;
        }
      }
      return;
    }
    if (sub === 'logs') {
      if (stepIndex === total - 1) push(() => scheduleLoadDone(), rem);
      else {
        let off = rem;
        for (let j = stepIndex + 1; j < total; j++) {
          scheduleLoadStepModal(j, off);
          off += C.DEMO_STEP_MS;
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
      markSegment(C.DEMO_RECORDED_DONE_MS);
      setDemoMessage(t('demo.customDone'));
      setDemoFocus('modal');
      push(() => {
        setDemoMessage(null);
        setDemoActive(false);
        setDemoFocus(null);
        demoPhaseRef.current = 'idle';
        demoKindRef.current = 'idle';
        demoSegmentEndsAtRef.current = null;
      }, C.DEMO_RECORDED_DONE_MS);
    };
    if (sub === 'modal') {
      push(() => {
        demoPhaseRef.current = `s:${stepIndex}:viz`;
        markSegment(C.VIZ_SEGMENT_MS);
        setDemoFocus('viz');
        applyRecordedStep(s);
      }, rem);
      push(() => {
        demoPhaseRef.current = `s:${stepIndex}:logs`;
        markSegment(C.LOGS_SEGMENT_MS);
        setDemoFocus('logs');
      }, rem + C.DEMO_REVEAL_VIZ_MS);
      if (stepIndex === total - 1) push(() => finishRecorded(), rem + C.DEMO_STEP_MS - C.DEMO_REVEAL_VIZ_MS);
      else {
        let off = rem + C.DEMO_STEP_MS;
        for (let j = stepIndex + 1; j < total; j++) {
          scheduleRecordedStepModal(j, off, ra);
          off += C.DEMO_STEP_MS;
        }
      }
      return;
    }
    if (sub === 'viz') {
      push(() => {
        demoPhaseRef.current = `s:${stepIndex}:logs`;
        markSegment(C.LOGS_SEGMENT_MS);
        setDemoFocus('logs');
      }, rem);
      if (stepIndex === total - 1) push(() => finishRecorded(), rem + C.LOGS_SEGMENT_MS);
      else {
        let off = rem + C.LOGS_SEGMENT_MS;
        for (let j = stepIndex + 1; j < total; j++) {
          scheduleRecordedStepModal(j, off, ra);
          off += C.DEMO_STEP_MS;
        }
      }
      return;
    }
    if (sub === 'logs') {
      if (stepIndex === total - 1) push(() => finishRecorded(), rem);
      else {
        let off = rem;
        for (let j = stepIndex + 1; j < total; j++) {
          scheduleRecordedStepModal(j, off, ra);
          off += C.DEMO_STEP_MS;
        }
      }
    }
  }
}
