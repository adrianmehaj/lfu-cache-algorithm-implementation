import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { CacheSnapshot, LogEntry } from '../../types';
import type { LFUCache } from '../../core/LFUCacheAlgorithm';

export type DemoKind = 'load' | 'recorded';

export type PauseSnapshot = {
  kind: DemoKind;
  phase: string;
  remainingMs: number;
};

export type DemoFocus = 'modal' | 'viz' | 'logs' | null;

export type RecordedAction = {
  op: 'put' | 'get';
  k: number;
  v?: number;
  cap: number;
  type: 'put' | 'update' | 'evict' | 'hit' | 'miss';
  old?: number;
  oldVal?: number;
};

export type PushTimeout = (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;

export interface DemoOrchestrationDeps {
  push: PushTimeout;
  clearAll: () => void;
  cacheRef: RefObject<LFUCache>;
  setSnap: Dispatch<SetStateAction<CacheSnapshot>>;
  setLogs: Dispatch<SetStateAction<LogEntry[]>>;
  t: (key: string, vars?: Record<string, string | number>) => string;
}
