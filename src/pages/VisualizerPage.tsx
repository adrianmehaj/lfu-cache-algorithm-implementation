import { useRef, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { LFU_NAV_DRAWER_OPEN_EVENT } from '../components/Layout';
import { FrequencyView } from '../components/FrequencyView';
import { CacheTable } from '../components/CacheTable';
import { EventLog } from '../components/EventLog';
import { useLFUCache } from '../hooks/useLFUCache';
import { useI18n } from '../i18n/I18nContext';

const DEMO_TAP_GAP_MS = 320;

function shouldIgnoreDemoScreenTap(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el?.closest) return true;
  return !!el.closest('button, a, input, select, textarea, label');
}

export function VisualizerPage() {
  const { t } = useI18n();
  const {
    put,
    get,
    reset,
    setCapacity,
    loadDemo,
    runRecordedDemo,
    stopDemo,
    interruptActiveDemoForMobileNav,
    pauseDemo,
    resumeDemo,
    capacity,
    snapshot,
    logs,
    demoMessage,
    demoActive,
    demoPaused,
    demoFocus,
    hasRecordedActions,
  } = useLFUCache(2);

  const vizRef = useRef<HTMLElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastDemoTapRef = useRef(0);
  const pendingDemoTapRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoActiveRef = useRef(false);
  const demoPausedRef = useRef(false);
  demoActiveRef.current = demoActive;
  demoPausedRef.current = demoPaused;

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

  useEffect(
    () => () => {
      if (pendingDemoTapRef.current) clearTimeout(pendingDemoTapRef.current);
    },
    [],
  );

  useEffect(() => {
    const onDrawerOpen = () => interruptActiveDemoForMobileNav();
    window.addEventListener(LFU_NAV_DRAWER_OPEN_EVENT, onDrawerOpen);
    return () => window.removeEventListener(LFU_NAV_DRAWER_OPEN_EVENT, onDrawerOpen);
  }, [interruptActiveDemoForMobileNav]);

  const isDemoCountdown = demoActive && demoMessage != null && /^[321]$/.test(String(demoMessage).trim());

  const onDemoScreenPointerUp = useCallback(
    (e: React.MouseEvent) => {
      if (!demoActiveRef.current) return;
      if (shouldIgnoreDemoScreenTap(e.target)) return;
      const now = Date.now();
      const since = now - lastDemoTapRef.current;
      if (since > 0 && since < DEMO_TAP_GAP_MS) {
        lastDemoTapRef.current = 0;
        if (pendingDemoTapRef.current) {
          clearTimeout(pendingDemoTapRef.current);
          pendingDemoTapRef.current = null;
        }
        stopDemo();
        return;
      }
      lastDemoTapRef.current = now;
      if (pendingDemoTapRef.current) clearTimeout(pendingDemoTapRef.current);
      pendingDemoTapRef.current = setTimeout(() => {
        pendingDemoTapRef.current = null;
        lastDemoTapRef.current = 0;
        if (!demoActiveRef.current) return;
        if (demoPausedRef.current) resumeDemo();
        else pauseDemo();
      }, DEMO_TAP_GAP_MS);
    },
    [pauseDemo, resumeDemo, stopDemo],
  );

  return (
    <div className="viz-layout" onPointerUp={onDemoScreenPointerUp}>
      {isDemoCountdown && (
        <div className="demo-countdown-overlay" aria-live="polite" aria-atomic="true">
          <div className="demo-modal demo-countdown-modal" key={demoMessage}>
            <div className="demo-modal__content">{demoMessage}</div>
          </div>
        </div>
      )}
      {demoMessage && !isDemoCountdown && (
        <div ref={modalRef} className={`demo-overlay ${demoFocus ? `demo-overlay--focus-${demoFocus}` : ''}`}>
          <div className="demo-modal">
            <div className="demo-modal__content">{demoMessage}</div>
          </div>
        </div>
      )}
      {demoActive && demoPaused && (
        <div className="demo-pause-overlay" role="status" aria-live="polite">
          <span className="sr-only">{t('demo.paused')}</span>
          <button
            type="button"
            className="demo-pause-play"
            onClick={(e) => {
              e.stopPropagation();
              resumeDemo();
            }}
            aria-label={t('demo.resume')}
          >
            <svg className="demo-pause-play__svg" viewBox="0 0 88 88" fill="none" aria-hidden>
              <circle cx="44" cy="44" r="42" stroke="currentColor" strokeWidth="1.5" opacity="0.42" />
              <path d="M38 28 L62 44 L38 60 Z" fill="currentColor" fillOpacity="0.9" />
            </svg>
          </button>
        </div>
      )}
      <div className={`viz-rail viz-rail--left ${demoActive ? 'demo-dim' : ''}`}>
        <div className="viz-rail-stack">
          <Sidebar
            capacity={capacity}
            size={snapshot.size}
            minFreq={snapshot.minFreq}
            onCapacity={setCapacity}
            onPut={put}
            onGet={get}
            onReset={reset}
            onLoadDemo={loadDemo}
            onRunRecorded={runRecordedDemo}
            hasRecorded={hasRecordedActions}
          />
        </div>
      </div>

      <main
        ref={vizRef}
        className={`viz-main ${demoActive && demoFocus !== 'viz' ? 'demo-dim' : ''} ${demoFocus === 'viz' ? 'demo-focus-ring' : ''}`}
      >
        <FrequencyView snapshot={snapshot} />
        <CacheTable snapshot={snapshot} />
        {snapshot.highlight.evictedKey != null && (
          <div className="evict-banner" role="status">
            <div className="evict-banner__title">
              {t('viz.evictedTitle')}: <strong>{snapshot.highlight.evictedKey}</strong> (Vlera:{' '}
              {snapshot.highlight.evictedValue})
            </div>
            <p className="evict-banner__hint">
              {t('viz.evictedHint', {
                key: snapshot.highlight.evictedKey,
                value: snapshot.highlight.evictedValue ?? '?',
              })}
            </p>
          </div>
        )}
      </main>

      <div
        ref={logsRef}
        className={`viz-rail viz-rail--right ${demoActive && demoFocus !== 'logs' ? 'demo-dim' : ''} ${demoFocus === 'logs' ? 'demo-focus-ring' : ''}`}
      >
        <div className="viz-rail-stack">
          <div className="card viz-rail-card">
            <EventLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
