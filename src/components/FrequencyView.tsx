import type { CacheSnapshot } from '../types';
import { useI18n } from '../i18n/I18nContext';

function nodeClass(key: number, h: CacheSnapshot['highlight']): string {
  if (key === h.evictedKey)  return 'node node--evicted';
  if (key === h.insertedKey) return 'node node--inserted';
  if (key === h.accessedKey) return 'node node--accessed';
  if (key === h.updatedKey)  return 'node node--updated';
  return 'node';
}

export function FrequencyView({ snapshot }: { snapshot: CacheSnapshot }) {
  const { t } = useI18n();
  const { freqBuckets, highlight } = snapshot;

  return (
    <div className="card">
      <h3 className="card__title">{t('viz.freqBuckets')}</h3>
      <p className="card__hint">{t('viz.freqHint')}</p>
      {freqBuckets.length === 0 ? (
        <p style={{ fontSize: '.875rem', color: 'var(--dim)' }}>{t('viz.noEntries')}</p>
      ) : (
        <div className="buckets">
          {freqBuckets.map((b) => (
            <div key={b.freq} className={`bucket ${b.isMinFreq ? 'bucket--min' : ''}`}>
              <div className="bucket__head">
                <span className="bucket__freq">{t('viz.frequency')} = {b.freq}</span>
                {b.isMinFreq && <span className="bucket__tag">{t('viz.minFreqTag')}</span>}
              </div>
              <div className="bucket__nodes">
                {b.nodes.map((n) => (
                  <div key={n.key} className={nodeClass(n.key, highlight)}>
                    <span className="node__key"><span className="node__lbl">{t('viz.key')}:</span> {n.key}</span>
                    <span className="node__val"><span className="node__lbl">{t('viz.value')}:</span> {n.value}</span>
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
