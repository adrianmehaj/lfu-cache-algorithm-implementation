import type { CacheStateSnapshot } from '../types/cache.types';

interface CacheVisualizerProps {
  snapshot: CacheStateSnapshot;
}

/**
 * Visualizes the LFU cache state grouped by frequency.
 * Highlights evicted node and shows minFreq.
 */
export function CacheVisualizer({ snapshot }: CacheVisualizerProps) {
  const { capacity, size, minFreq, freqToKeys, lastEvictedKey } = snapshot;

  const sortedFreqs = Array.from(freqToKeys.keys()).sort((a, b) => a - b);

  return (
    <div className="visualizer">
      <h2>Cache State</h2>
      <div className="meta">
        <span>Capacity: {capacity}</span>
        <span>Size: {size}</span>
        <span className="min-freq">minFreq: {minFreq}</span>
      </div>
      {lastEvictedKey != null && (
        <div className="evicted" role="status">
          Evicted: {lastEvictedKey}
        </div>
      )}
      <div className="freq-groups">
        {sortedFreqs.length === 0 ? (
          <p className="empty">Cache is empty</p>
        ) : (
          sortedFreqs.map((freq) => (
            <div key={freq} className="freq-group">
              <div className="freq-label">Freq {freq}:</div>
              <div className="keys-row">
                {freqToKeys.get(freq)!.map((k) => (
                  <span
                    key={k}
                    className={`key-badge ${k === lastEvictedKey ? 'evicted' : ''}`}
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
