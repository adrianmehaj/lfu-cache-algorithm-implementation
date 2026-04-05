/**
 * Fixed LeetCode-style demo sequence (PUT/GET steps + i18n message keys).
 */

export type SeqStep = {
  op: 'put' | 'get';
  k: number;
  v?: number;
  msgKey: string;
  vars?: Record<string, string | number>;
};

export const DEMO_SEQUENCE: SeqStep[] = [
  { op: 'put', k: 1, v: 1, msgKey: 'demo.put' },
  { op: 'put', k: 2, v: 2, msgKey: 'demo.putFull' },
  { op: 'get', k: 1, msgKey: 'demo.getFreq', vars: { f1: 1, f2: 2 } },
  { op: 'put', k: 3, v: 3, msgKey: 'demo.evict', vars: { old: 2, oldVal: 2, f: 1 } },
  { op: 'get', k: 2, msgKey: 'demo.miss' },
  { op: 'get', k: 3, msgKey: 'demo.get', vars: { f: 2 } },
  { op: 'put', k: 4, v: 4, msgKey: 'demo.tieBreak', vars: { old: 1, oldVal: 1, f: 2 } },
  { op: 'get', k: 1, msgKey: 'demo.missEvict', vars: { new: 4 } },
  { op: 'get', k: 3, msgKey: 'demo.get', vars: { f: 3 } },
  { op: 'get', k: 4, msgKey: 'demo.get', vars: { f: 2 } },
];
