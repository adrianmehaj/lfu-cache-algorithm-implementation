import { memo } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { CacheSnapshot } from '../types';
import { useI18n } from '../i18n/I18nContext';

function nodeClass(key: number, h: CacheSnapshot['highlight']): string {
  if (key === h.evictedKey)  return 'node node--evicted';
  if (key === h.insertedKey) return 'node node--inserted';
  if (key === h.accessedKey) return 'node node--accessed';
  if (key === h.updatedKey)  return 'node node--updated';
  return 'node';
}

export const FrequencyView = memo(function FrequencyView({ snapshot }: { snapshot: CacheSnapshot }) {
  const { t } = useI18n();
  const { freqBuckets, highlight } = snapshot;

  return (
    <div className="card">
      <h3 className="card__title">{t('viz.freqBuckets')}</h3>
      <p className="card__hint">{t('viz.freqHint')}</p>
      {freqBuckets.length === 0 ? (
        <p style={{ fontSize: '.875rem', color: 'var(--dim)' }}>{t('viz.noEntries')}</p>
      ) : (
        <LayoutGroup>
          <div className="buckets">
            <AnimatePresence mode="popLayout">
              {freqBuckets.map((b) => (
                <motion.div
                  key={b.freq}
                  className={`bucket ${b.isMinFreq ? 'bucket--min' : ''}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="bucket__head">
                    <div className="bucket__freq-badge">
                      <span className="bucket__freq-num">{b.freq}</span>
                      <span className="bucket__freq-label">{t('viz.frequency')}</span>
                    </div>
                    {b.isMinFreq && <span className="bucket__tag">{t('viz.minFreqTag')}</span>}
                  </div>
                  {b.nodes.length > 1 && (
                    <div className="bucket__dir">
                      <span className="bucket__dir-label bucket__dir-label--mru">MRU ↑</span>
                    </div>
                  )}
                  <div className="bucket__nodes">
                    <AnimatePresence mode="popLayout">
                      {b.nodes.map((n, idx) => (
                        <motion.div
                          key={n.key}
                          layoutId={`node-${n.key}`}
                          className={nodeClass(n.key, highlight)}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85, x: -30 }}
                          layout
                          transition={{
                            layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                            default: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                          }}
                        >
                          <span className="node__key">
                            <span className="node__lbl">{t('viz.key')}:</span> {n.key}
                          </span>
                          <span className="node__val">
                            <span className="node__lbl">{t('viz.value')}:</span> {n.value}
                          </span>
                          {idx === b.nodes.length - 1 && b.isMinFreq && (
                            <span className="node__lru-badge">LRU</span>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {b.nodes.length > 1 && (
                    <div className="bucket__dir bucket__dir--bottom">
                      <span className="bucket__dir-label bucket__dir-label--lru">LRU ↓</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      )}
    </div>
  );
});
