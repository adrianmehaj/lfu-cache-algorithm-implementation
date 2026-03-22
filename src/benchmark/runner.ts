import { LFUCache } from '../lfu/LFUCache';
import { LRUCache } from '../cache/LRUCache';
import { FIFOCache } from '../cache/FIFOCache';
import type { BenchmarkConfig, BenchmarkOp, BenchmarkResult } from './types';
import { generateWorkload } from './workload';

export function runBenchmark(config: BenchmarkConfig): BenchmarkResult[] {
  const {
    capacity,
    totalOps,
    readRatio,
    workload,
    keySpace = 1000,
  } = config;

  const ops = generateWorkload(totalOps, readRatio, workload, keySpace);

  const results: BenchmarkResult[] = [
    runPolicy('LFU', ops, capacity, (cap) => new LFUCache(cap)),
    runPolicy('LRU', ops, capacity, (cap) => new LRUCache(cap)),
    runPolicy('FIFO', ops, capacity, (cap) => new FIFOCache(cap)),
  ];

  return results;
}

interface CacheLike {
  get(key: number): number;
  put(key: number, value: number): void;
}

function runPolicy(
  policy: string,
  ops: BenchmarkOp[],
  capacity: number,
  createCache: (cap: number) => CacheLike
): BenchmarkResult {
  const cache = createCache(capacity);
  let hits = 0;
  let misses = 0;

  const start = performance.now();

  for (const op of ops) {
    if (op.type === 'get') {
      const result = cache.get(op.key);
      if (result !== -1) hits++;
      else misses++;
    } else {
      cache.put(op.key, op.value ?? op.key);
    }
  }

  const totalTimeMs = performance.now() - start;
  const total = hits + misses;

  return {
    policy: policy as BenchmarkResult['policy'],
    hits,
    misses,
    hitRate: total > 0 ? (hits / total) * 100 : 0,
    missRate: total > 0 ? (misses / total) * 100 : 0,
    totalTimeMs,
    avgLatencyUs: ops.length > 0 ? (totalTimeMs * 1000) / ops.length : 0,
  };
}
