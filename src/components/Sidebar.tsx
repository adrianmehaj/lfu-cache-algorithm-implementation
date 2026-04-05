import { useState, useEffect, type FormEvent } from 'react';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  capacity: number;
  size: number;
  minFreq: number;
  onCapacity: (c: number) => void;
  onPut: (k: number, v: number) => void;
  onGet: (k: number) => number;
  onReset: () => void;
  onLoadDemo: () => void;
  onRunRecorded: () => void;
  hasRecorded: boolean;
}

export function Sidebar({
  capacity,
  size,
  minFreq,
  onCapacity,
  onPut,
  onGet,
  onReset,
  onLoadDemo,
  onRunRecorded,
  hasRecorded,
}: Props) {
  const { t } = useI18n();
  const [cap, setCap] = useState(String(capacity));
  const [key, setKey] = useState('');
  const [val, setVal] = useState('');
  const [getRes, setGetRes] = useState<number | null>(null);

  useEffect(() => setCap(String(capacity)), [capacity]);

  const handleSet = () => {
    const n = parseInt(cap);
    if (!isNaN(n) && n >= 0) onCapacity(n);
  };
  const handlePut = (e: FormEvent) => {
    e.preventDefault();
    const k = parseInt(key),
      v = parseInt(val);
    if (!isNaN(k) && !isNaN(v)) {
      onPut(k, v);
      setGetRes(null);
    }
  };
  const handleGet = (e: FormEvent) => {
    e.preventDefault();
    const k = parseInt(key);
    if (!isNaN(k)) setGetRes(onGet(k));
  };
  const handleClear = () => {
    onReset();
    setKey('');
    setVal('');
    setGetRes(null);
  };

  return (
    <div className="viz-rail-stack" role="complementary" aria-label={t('sidebar.operations')}>
      <div className="card viz-rail-card">
        <div className="sidebar__section sidebar__section--flush">
          <h3 className="card__title sidebar__card-title">{t('sidebar.capacity')}</h3>
          <div className="sidebar__row">
            <input
              className="input"
              type="number"
              min={0}
              max={64}
              value={cap}
              onChange={(e) => setCap(e.target.value)}
            />
            <button className="btn btn--sm btn--primary" type="button" onClick={handleSet}>
              {t('sidebar.set')}
            </button>
          </div>
          <div className="stats-row">
            <div className="stat">
              <span className="stat__label">{t('sidebar.size')}</span>
              <span className="stat__value">{size}</span>
            </div>
            <div className="stat">
              <span className="stat__label">{t('sidebar.cap')}</span>
              <span className="stat__value">{capacity}</span>
            </div>
            <div className="stat stat--accent">
              <span className="stat__label">{t('sidebar.minF')}</span>
              <span className="stat__value">{minFreq}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card viz-rail-card">
        <div className="sidebar__section sidebar__section--flush">
          <h3 className="card__title sidebar__card-title">{t('sidebar.operations')}</h3>
          <form onSubmit={handlePut} className="sidebar__form">
            <div className="field">
              <label>{t('sidebar.key')}</label>
              <input
                className="input"
                type="number"
                placeholder={t('sidebar.keyPh')}
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t('sidebar.value')}</label>
              <input
                className="input"
                type="number"
                placeholder={t('sidebar.valuePh')}
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
            </div>
            <button className="btn btn--primary btn--blk" type="submit">
              {t('sidebar.put')}
            </button>
          </form>
          <form onSubmit={handleGet} className="sidebar__get-row">
            <button className="btn btn--secondary btn--blk sidebar__get-btn" type="submit">
              {t('sidebar.get')}
            </button>
            {getRes !== null && (
              <span className={`result ${getRes !== -1 ? 'result--hit' : 'result--miss'}`}>
                {getRes === -1 ? t('sidebar.miss') : `→ ${getRes}`}
              </span>
            )}
          </form>
          <div style={{ marginTop: '0.75rem' }}>
            <button className="btn btn--danger btn--blk btn--row" type="button" onClick={handleClear}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {t('sidebar.clearCache')}
            </button>
          </div>
        </div>

        <div className="sidebar__section">
          <h3 className="sidebar__heading">{t('sidebar.presets')}</h3>
          <div className="sidebar__preset-list">
            <button className="btn btn--preset" type="button" onClick={onLoadDemo}>
              {t('sidebar.leetDemo')}
            </button>
            {hasRecorded && (
              <button className="btn btn--preset btn--recorded" type="button" onClick={onRunRecorded}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: '8px' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {t('sidebar.runRecorded')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
