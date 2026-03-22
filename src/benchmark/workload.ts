import type { BenchmarkOp, WorkloadType } from './types';

/**
 * Generates a sequence of cache operations for benchmarking.
 */
export function generateWorkload(
  totalOps: number,
  readRatio: number,
  workload: WorkloadType,
  keySpace: number = 1000
): BenchmarkOp[] {
  const ops: BenchmarkOp[] = [];
  const keySpaceUsed = Math.min(keySpace, Math.max(100, keySpace));

  for (let i = 0; i < totalOps; i++) {
    const isRead = Math.random() < readRatio;
    const key = getKey(i, totalOps, workload, keySpaceUsed);

    if (isRead) {
      ops.push({ type: 'get', key });
    } else {
      ops.push({ type: 'put', key, value: key * 10 + i % 100 });
    }
  }

  return ops;
}

function getKey(
  index: number,
  _totalOps: number,
  workload: WorkloadType,
  keySpace: number
): number {
  switch (workload) {
    case 'uniform':
      return Math.floor(Math.random() * keySpace);

    case 'zipf':
      // Zipf-like: ~20% of keys get 80% of traffic
      const hotKeys = Math.max(10, Math.floor(keySpace * 0.2));
      return Math.random() < 0.8
        ? Math.floor(Math.random() * hotKeys)
        : hotKeys + Math.floor(Math.random() * (keySpace - hotKeys));

    case 'sequential':
      return index % keySpace;

    case 'temporal':
      // Recent keys more likely: sliding window of last N keys
      const window = Math.min(50, keySpace);
      const base = Math.max(0, index - Math.floor(Math.random() * window));
      return base % keySpace;

    default:
      return Math.floor(Math.random() * keySpace);
  }
}
