import { Sidebar } from '../components/Sidebar';
import { FrequencyView } from '../components/FrequencyView';
import { CacheTable } from '../components/CacheTable';
import { EventLog } from '../components/EventLog';
import { useLFUCache } from '../hooks/useLFUCache';
import { useI18n } from '../i18n/I18nContext';

export function VisualizerPage() {
  const { t } = useI18n();
  const { put, get, reset, setCapacity, loadDemo, stepDemo, capacity, snapshot, logs, hasMoreDemoSteps } = useLFUCache(2);

  return (
    <div className="viz-layout">
      <div className="viz-rail viz-rail--left">
        <Sidebar
          capacity={capacity} size={snapshot.size} minFreq={snapshot.minFreq}
          onCapacity={setCapacity} onPut={put} onGet={get}
          onReset={reset} onLoadDemo={loadDemo} onStep={stepDemo} hasSteps={hasMoreDemoSteps}
        />
      </div>
      <main className="viz-main">
        <FrequencyView snapshot={snapshot} />
        <CacheTable snapshot={snapshot} />
        {snapshot.highlight.evictedKey != null && (
          <div className="evict-banner" role="status">
            <div className="evict-banner__title">
              {t('viz.evictedTitle')}: <strong>{snapshot.highlight.evictedKey}</strong>
            </div>
            <p className="evict-banner__hint">{t('viz.evictedHint')}</p>
          </div>
        )}
      </main>
      <div className="viz-rail viz-rail--right">
        <div className="card viz-rail-card">
          <EventLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
