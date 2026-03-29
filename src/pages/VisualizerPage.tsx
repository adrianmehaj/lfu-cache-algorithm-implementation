import { useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { FrequencyView } from '../components/FrequencyView';
import { CacheTable } from '../components/CacheTable';
import { EventLog } from '../components/EventLog';
import { useLFUCache } from '../hooks/useLFUCache';
import { useI18n } from '../i18n/I18nContext';

export function VisualizerPage() {
  const { t } = useI18n();
  const { put, get, reset, setCapacity, loadDemo, stepDemo, runRecordedDemo, stopDemo, capacity, snapshot, logs, hasMoreDemoSteps, demoMessage, demoActive, demoFocus, hasRecordedActions } = useLFUCache(2);

  const vizRef = useRef<HTMLElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!demoFocus) return;
    if (demoFocus === 'modal') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = demoFocus === 'viz' ? vizRef.current : demoFocus === 'logs' ? logsRef.current : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [demoFocus]);

  return (
    <div className="viz-layout" onClick={() => demoActive && stopDemo()}>
      {demoMessage && (
        <div ref={modalRef} className={`demo-overlay ${demoFocus ? `demo-overlay--focus-${demoFocus}` : ''}`}>
          <div className="demo-modal">
            <div className="demo-modal__content">
              {demoMessage}
            </div>
          </div>
        </div>
      )}
      <div className={`viz-rail viz-rail--left ${demoActive && demoFocus !== 'viz' && demoFocus !== 'logs' ? 'demo-dim' : ''}`}>
        <div className="viz-rail-stack">
          <Sidebar
            capacity={capacity} size={snapshot.size} minFreq={snapshot.minFreq}
            onCapacity={setCapacity} onPut={put} onGet={get}
            onReset={reset} onLoadDemo={loadDemo} onStep={stepDemo}
            onRunRecorded={runRecordedDemo}
            hasSteps={hasMoreDemoSteps}
            hasRecorded={hasRecordedActions}
          />
        </div>
      </div>
      
      <main ref={vizRef} className={`viz-main ${demoActive && demoFocus !== 'viz' ? 'demo-dim' : ''} ${demoFocus === 'viz' ? 'demo-focus-ring' : ''}`}>
        <FrequencyView snapshot={snapshot} />
        <CacheTable snapshot={snapshot} />
        {snapshot.highlight.evictedKey != null && (
          <div className="evict-banner" role="status">
            <div className="evict-banner__title">
              {t('viz.evictedTitle')}: <strong>{snapshot.highlight.evictedKey}</strong> (Vlera: {snapshot.highlight.evictedValue})
            </div>
            <p className="evict-banner__hint">
              {t('viz.evictedHint', { key: snapshot.highlight.evictedKey, value: snapshot.highlight.evictedValue ?? '?' })}
            </p>
          </div>
        )}
      </main>

      <div ref={logsRef} className={`viz-rail viz-rail--right ${demoActive && demoFocus !== 'logs' ? 'demo-dim' : ''} ${demoFocus === 'logs' ? 'demo-focus-ring' : ''}`}>
        <div className="viz-rail-stack">
          <div className="card viz-rail-card">
            <EventLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
