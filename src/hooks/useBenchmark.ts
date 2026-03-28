import { useState, useCallback } from 'react';
import { LFUCache, LRUCache, FIFOCache } from '../core';
import type { BenchmarkConfig, BenchmarkResult, WorkloadType } from '../types';

interface CacheLike { get(k: number): number; put(k: number, v: number): void }

function genKey(i: number, type: WorkloadType, keySpace: number): number {
  switch (type) {
    case 'uniform': return Math.floor(Math.random() * keySpace);
    case 'zipf': {
      const hot = Math.max(10, Math.floor(keySpace * 0.2));
      return Math.random() < 0.8 ? Math.floor(Math.random() * hot) : hot + Math.floor(Math.random() * (keySpace - hot));
    }
    case 'sequential': return i % keySpace;
    case 'temporal': return Math.max(0, i - Math.floor(Math.random() * 50)) % keySpace;
  }
}

function runOne(label: string, cache: CacheLike, ops: Array<{ r: boolean; k: number }>): BenchmarkResult {
  let hits = 0, misses = 0;
  const t0 = performance.now();
  for (const op of ops) {
    if (op.r) { cache.get(op.k) !== -1 ? hits++ : misses++; }
    else { cache.put(op.k, op.k); }
  }
  const ms = performance.now() - t0;
  const total = hits + misses;
  return {
    policy: label,
    hitRate: total ? (hits / total) * 100 : 0,
    missRate: total ? (misses / total) * 100 : 0,
    avgLatencyUs: ops.length ? (ms * 1000) / ops.length : 0,
    totalTimeMs: ms,
  };
}

export function useBenchmark() {
  const [config, setConfig] = useState<BenchmarkConfig>({ capacity: 64, totalOps: 10_000, readRatio: 0.5, workload: 'uniform' });
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      const { capacity, totalOps, readRatio, workload } = config;
      const ks = Math.max(100, capacity * 4);
      const ops = Array.from({ length: totalOps }, (_, i) => ({ r: Math.random() < readRatio, k: genKey(i, workload, ks) }));
      setResults([
        runOne('LFU', new LFUCache(capacity), ops),
        runOne('LRU', new LRUCache(capacity), ops),
        runOne('FIFO', new FIFOCache(capacity), ops),
      ]);
      setRunning(false);
    }, 10);
  }, [config]);

  return { config, setConfig, results, running, run };
}
