/**
 * LFU Cache types for algorithm implementation and UI.
 */

/** Cache entry snapshot for UI display (key, value, frequency) */
export interface CacheNodeSnapshot {
  key: number;
  value: number;
  freq: number;
}

/** Single frequency bucket with nodes in MRU→LRU order */
export interface FrequencyBucketSnapshot {
  freq: number;
  nodes: CacheNodeSnapshot[];
  isMinFreq: boolean;
}

/** Ephemeral highlight state for visualizing operations */
export type NodeHighlight =
  | 'inserted'
  | 'accessed'
  | 'updated'
  | 'evicted'
  | null;

export interface HighlightState {
  insertedKey: number | null;
  accessedKey: number | null;
  updatedKey: number | null;
  evictedKey: number | null;
}

/** Operation log entry */
export type LogEntryType = 'put' | 'get' | 'reset' | 'evict';

export interface OperationLogEntry {
  id: string;
  type: LogEntryType;
  /** Human-readable description */
  message: string;
  /** For put: key, value. For get: key. */
  args?: { key?: number; value?: number };
  /** For get: returned value. For put: undefined. */
  result?: number;
  /** Hit/miss for GET */
  hit?: boolean;
}

/** Aggregate statistics */
export interface CacheStats {
  totalPut: number;
  totalGet: number;
  evictions: number;
  hits: number;
  misses: number;
}

/** Full cache state snapshot for UI - derived from real internal state */
export interface CacheStateSnapshot {
  capacity: number;
  size: number;
  minFreq: number;
  /** All cache entries (for grid view) */
  entries: CacheNodeSnapshot[];
  /** Frequency buckets with MRU→LRU ordering */
  freqBuckets: FrequencyBucketSnapshot[];
  highlight: HighlightState;
}
