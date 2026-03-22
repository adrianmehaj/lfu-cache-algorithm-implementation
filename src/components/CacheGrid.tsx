import type { CacheStateSnapshot, CacheNodeSnapshot } from '../types/cache.types';

interface CacheGridProps {
  snapshot: CacheStateSnapshot;
}

function getNodeStatus(
  node: CacheNodeSnapshot,
  highlight: CacheStateSnapshot['highlight']
): 'default' | 'inserted' | 'accessed' | 'updated' | 'evicted' {
  if (node.key === highlight.evictedKey) return 'evicted';
  if (node.key === highlight.insertedKey) return 'inserted';
  if (node.key === highlight.accessedKey) return 'accessed';
  if (node.key === highlight.updatedKey) return 'updated';
  return 'default';
}

export function CacheGrid({ snapshot }: CacheGridProps) {
  const { entries, highlight } = snapshot;

  return (
    <div className="cache-grid">
      <h3 className="cache-grid__title">Cache Entries</h3>
      {entries.length === 0 ? (
        <p className="cache-grid__empty">Cache is empty</p>
      ) : (
        <div className="cache-grid__list">
          {entries.map((node) => {
            const status = getNodeStatus(node, highlight);
            return (
              <div
                key={node.key}
                className={`cache-grid__card cache-grid__card--${status}`}
              >
                <div className="cache-grid__card-header">
                  <span className="cache-grid__key">key: {node.key}</span>
                  {status !== 'default' && (
                    <span className={`cache-grid__badge cache-grid__badge--${status}`}>
                      {status}
                    </span>
                  )}
                </div>
                <div className="cache-grid__card-body">
                  <span className="cache-grid__value">value: {node.value}</span>
                  <span className="cache-grid__freq">freq: {node.freq}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
