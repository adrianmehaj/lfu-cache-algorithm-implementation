/**
 * Demo timing — single source of truth for LeetCode load + recorded replay UX.
 */

export const DEMO_STEP_MS = 22_000;
export const DEMO_REVEAL_VIZ_MS = 8_000;
export const DEMO_FOCUS_LOGS_MS = 15_000;
export const DEMO_COUNTDOWN_TICK_MS = 1_400;
export const DEMO_AFTER_COUNTDOWN_MS = 3 * DEMO_COUNTDOWN_TICK_MS + 400;
export const DEMO_DONE_HOLD_MS = 8_000;
export const DEMO_RECORDED_DONE_MS = 7_000;

export const VIZ_SEGMENT_MS = DEMO_FOCUS_LOGS_MS - DEMO_REVEAL_VIZ_MS;
export const LOGS_SEGMENT_MS = DEMO_STEP_MS - DEMO_FOCUS_LOGS_MS;
export const LAST_COUNTDOWN_SEGMENT_MS = DEMO_AFTER_COUNTDOWN_MS - 2 * DEMO_COUNTDOWN_TICK_MS;
