import type { Highlight } from '../../types';
import type { LFUCache } from '../../core/LFUCacheAlgorithm';

let seq = 0;
/** Monotonic ids for log rows during a session (demo + manual ops). */
export const uid = () => `l${++seq}`;

export function defined(obj: Record<string, string | number | undefined>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

/** Build a UI snapshot from the live LFU cache + transient highlight state. */
export function snap(c: LFUCache, hl: Highlight) {
  const s = c.getState();
  return {
    ...s,
    entries: s.freqBuckets.flatMap((b) => b.nodes),
    freqBuckets: s.freqBuckets.map((b) => ({ ...b, isMinFreq: b.freq === s.minFreq })),
    highlight: hl,
  };
}
