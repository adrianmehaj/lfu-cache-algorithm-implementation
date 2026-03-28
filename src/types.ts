/* ── Visualization Snapshots ── */

export interface NodeEntry { key: number; value: number; freq: number }

export interface FreqBucket { freq: number; nodes: NodeEntry[]; isMinFreq: boolean }

export interface CacheSnapshot {
  capacity: number;
  size: number;
  minFreq: number;
  entries: NodeEntry[];
  freqBuckets: FreqBucket[];
  highlight: Highlight;
}

/* ── UI Highlight (ephemeral, lives in hook) ── */

export interface Highlight {
  insertedKey: number | null;
  accessedKey: number | null;
  updatedKey: number | null;
  evictedKey: number | null;
}

export const emptyHighlight = (): Highlight => ({
  insertedKey: null, accessedKey: null, updatedKey: null, evictedKey: null,
});

/* ── Operation Log (structured for i18n) ── */

export type LogEntry =
  | { id: string; type: 'put'; key: number; value: number; update: boolean }
  | { id: string; type: 'get'; key: number; result: number; hit: boolean }
  | { id: string; type: 'evict'; key: number };

/* ── Stats ── */

export interface Stats {
  puts: number; gets: number; evictions: number; hits: number; misses: number;
}

export const emptyStats = (): Stats => ({
  puts: 0, gets: 0, evictions: 0, hits: 0, misses: 0,
});

/* ── Benchmark ── */

export type WorkloadType = 'uniform' | 'zipf' | 'sequential' | 'temporal';

export interface BenchmarkConfig {
  capacity: number; totalOps: number; readRatio: number; workload: WorkloadType;
}

export interface BenchmarkResult {
  policy: string; hitRate: number; missRate: number; avgLatencyUs: number; totalTimeMs: number;
}
