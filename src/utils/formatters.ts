/**
 * Formatting utilities for LFU Cache UI.
 */

export function formatOpLog(msg: string): string {
  return msg;
}

export function formatHitRate(hits: number, misses: number): string {
  const total = hits + misses;
  if (total === 0) return '0%';
  return `${((hits / total) * 100).toFixed(1)}%`;
}
