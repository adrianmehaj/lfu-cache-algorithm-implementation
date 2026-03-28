import type { LogEntry } from '../types';
import { useI18n } from '../i18n/I18nContext';

const icons: Record<LogEntry['type'], JSX.Element> = {
  put:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  get:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  evict: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
};

function formatLog(e: LogEntry, t: (k: string, v?: Record<string, string | number>) => string, missLabel: string): string {
  switch (e.type) {
    case 'evict':
      return t('log.evict', { key: e.key });
    case 'put':
      return e.update ? t('log.putUpdate', { key: e.key, value: e.value }) : t('log.put', { key: e.key, value: e.value });
    case 'get':
      return t('log.get', {
        key: e.key,
        result: e.hit ? e.result : missLabel,
      });
  }
}

export function EventLog({ logs }: { logs: LogEntry[] }) {
  const { t } = useI18n();
  const miss = t('sidebar.miss');

  return (
    <div className="elog">
      <h3 className="card__title elog__title">{t('log.title')}</h3>
      <div className="elog__list">
        {logs.length === 0 ? (
          <p className="elog__empty">{t('log.empty')}</p>
        ) : (
          [...logs].reverse().map((e) => (
            <div key={e.id} className={`elog__item elog__item--${e.type}`}>
              <span className="elog__icon">{icons[e.type]}</span>
              <span>{formatLog(e, t, miss)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
