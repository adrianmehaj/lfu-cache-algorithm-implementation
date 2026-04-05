/**
 * Demo orchestration: LeetCode sequence, recorded replay, countdown, pause/resume.
 * Consumers typically import from `../useDemoOrchestration` (re-export barrel).
 */
export { useDemoOrchestration, snap, uid } from './useDemoOrchestration';
export type { RecordedAction } from './types';
export { DEMO_STEP_MS } from './constants';
