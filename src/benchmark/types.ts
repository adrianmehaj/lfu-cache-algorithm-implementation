export type WorkloadType = 'uniform' | 'zipf' | 'sequential' | 'temporal';

export interface BenchmarkConfig {
  capacity: number;
  totalOps: number;
  readRatio: number; // 0–1
  workload: WorkloadType;
  keySpace?: number; // max key for uniform/zipf
}

export type OpType = 'get' | 'put';

export interface BenchmarkOp {
  type: OpType;
  key: number;
  value?: number;
}

export interface BenchmarkResult {
  policy: 'LFU' | 'LRU' | 'FIFO';
  hits: number;
  misses: number;
  hitRate: number;
  missRate: number;
  totalTimeMs: number;
  avgLatencyUs: number;
}
