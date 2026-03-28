import { useState } from 'react';
import type { CacheSnapshot } from '../types';
import { useI18n } from '../i18n/I18nContext';

export function CacheTable({ snapshot }: { snapshot: CacheSnapshot }) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const rows = q ? snapshot.entries.filter((e) => String(e.key).includes(q) || String(e.value).includes(q)) : snapshot.entries;

  return (
    <div className="card">
      <div className="card__headrow cache-table__head">
        <h3 className="card__title card__title--inline">{t('viz.cacheMap')}</h3>
        <div className="cache-table__search-block">
          <span className="cache-table__search-lbl">{t('viz.searchLabel')}</span>
          <div className="ctable__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder={t('viz.filter')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('viz.filter')} type="search" enterKeyHint="search" autoComplete="off" />
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="ctable">
          <thead><tr><th>{t('viz.thKey')}</th><th>{t('viz.thValue')}</th><th>{t('viz.thFreq')}</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="ctable__empty">{snapshot.entries.length === 0 ? t('viz.emptyCache') : t('viz.noMatch')}</td></tr>
            ) : rows.map((n) => (
              <tr key={n.key}><td>{n.key}</td><td>{n.value}</td><td>{n.freq}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
