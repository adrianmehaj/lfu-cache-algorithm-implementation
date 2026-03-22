import type { CacheStats } from '../types/cache.types';
import { formatHitRate } from '../utils/formatters';

interface StatsPanelProps {
  stats: CacheStats;
  capacity: number;
  size: number;
  minFreq: number;
}

export function StatsPanel({
  stats,
  capacity,
  size,
  minFreq,
}: StatsPanelProps) {
  const hitRate = formatHitRate(stats.hits, stats.misses);

  return (
    <div className="stats-panel">
      <h3 className="stats-panel__title">Statistics</h3>
      <div className="stats-panel__grid">
        <div className="stats-panel__item">
          <span className="stats-panel__label">Cache Size</span>
          <span className="stats-panel__value">
            {size} / {capacity}
          </span>
        </div>
        <div className="stats-panel__item">
          <span className="stats-panel__label">minFreq</span>
          <span className="stats-panel__value stats-panel__value--accent">
            {minFreq}
          </span>
        </div>
        <div className="stats-panel__item">
          <span className="stats-panel__label">PUT operations</span>
          <span className="stats-panel__value">{stats.totalPut}</span>
        </div>
        <div className="stats-panel__item">
          <span className="stats-panel__label">GET operations</span>
          <span className="stats-panel__value">{stats.totalGet}</span>
        </div>
        <div className="stats-panel__item">
          <span className="stats-panel__label">Evictions</span>
          <span className="stats-panel__value">{stats.evictions}</span>
        </div>
        <div className="stats-panel__item">
          <span className="stats-panel__label">Hits</span>
          <span className="stats-panel__value stats-panel__value--success">
            {stats.hits}
          </span>
        </div>
        <div className="stats-panel__item">
          <span className="stats-panel__label">Misses</span>
          <span className="stats-panel__value stats-panel__value--danger">
            {stats.misses}
          </span>
        </div>
        <div className="stats-panel__item">
          <span className="stats-panel__label">Hit Rate</span>
          <span className="stats-panel__value">{hitRate}</span>
        </div>
      </div>
    </div>
  );
}
