/**
 * LFU Cache types for the algorithm implementation.
 */

export interface CacheNode {
  key: number;
  value: number;
  freq: number;
}

/**
 * Snapshot of cache state for UI visualization.
 * Groups keys by their access frequency for display.
 */
export interface CacheStateSnapshot {
  capacity: number;
  size: number;
  minFreq: number;
  /** Map of frequency -> array of keys (LRU order: first = most recent) */
  freqToKeys: Map<number, number[]>;
  /** Key that was last evicted (for highlighting) */
  lastEvictedKey: number | null;
  /** Last operation result (for GET feedback) */
  lastGetResult: number | null;
}
