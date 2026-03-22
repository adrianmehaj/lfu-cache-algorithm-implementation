import type { CacheStateSnapshot } from '../types/cache.types';

interface FrequencyBucketsProps {
  snapshot: CacheStateSnapshot;
}

function getNodeStatus(
  key: number,
  highlight: CacheStateSnapshot['highlight']
): string {
  if (key === highlight.evictedKey) return 'evicted';
  if (key === highlight.insertedKey) return 'inserted';
  if (key === highlight.accessedKey) return 'accessed';
  if (key === highlight.updatedKey) return 'updated';
  return 'default';
}

export function FrequencyBuckets({ snapshot }: FrequencyBucketsProps) {
  const { freqBuckets, highlight } = snapshot;

  return (
    <div className="freq-buckets">
      <h3 className="freq-buckets__title">Frequency Buckets</h3>
      <p className="freq-buckets__hint">
        oldest → newest ↓ (LRU order: rightmost = eviction candidate)
      </p>
      {freqBuckets.length === 0 ? (
        <p className="freq-buckets__empty">No entries</p>
      ) : (
        <div className="freq-buckets__list">
          {freqBuckets.map((bucket) => (
            <div
              key={bucket.freq}
              className={`freq-buckets__bucket ${
                bucket.isMinFreq ? 'freq-buckets__bucket--min' : ''
              }`}
            >
              <div className="freq-buckets__label-row">
                <span className="freq-buckets__label">freq={bucket.freq}</span>
                {bucket.isMinFreq && (
                  <span className="freq-buckets__min-tag">← MIN FREQ</span>
                )}
              </div>
              <div className="freq-buckets__nodes">
                {bucket.nodes.map((node) => (
                  <div
                    key={node.key}
                    className={`freq-buckets__node freq-buckets__node--${getNodeStatus(
                      node.key,
                      highlight
                    )}`}
                  >
                    <span className="freq-buckets__node-key">k:{node.key}</span>
                    <span className="freq-buckets__node-val">v:{node.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
