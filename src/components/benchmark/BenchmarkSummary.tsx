import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BenchmarkResult } from '../../types';

interface Props {
  results: BenchmarkResult[];
  labels: {
    bestHit: string;
    fastest: string;
  };
}

export const BenchmarkSummary = memo(function BenchmarkSummary({ results, labels }: Props) {
  const best = useMemo(() => {
    let maxHit = results[0];
    let minLat = results[0];
    for (const r of results) {
      if (r.hitRate > maxHit.hitRate) maxHit = r;
      if (r.avgLatencyUs < minLat.avgLatencyUs) minLat = r;
    }
    return { maxHit, minLat };
  }, [results]);

  return (
    <div className="bench-summary">
      <motion.div
        className="bench-summary__card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <span className="bench-summary__label">{labels.bestHit}</span>
        <span className="bench-summary__value bench-summary__value--hit">{best.maxHit.policy}</span>
        <span className="bench-summary__meta">{best.maxHit.hitRate.toFixed(2)}%</span>
      </motion.div>
      <motion.div
        className="bench-summary__card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <span className="bench-summary__label">{labels.fastest}</span>
        <span className="bench-summary__value bench-summary__value--lat">{best.minLat.policy}</span>
        <span className="bench-summary__meta">{best.minLat.avgLatencyUs.toFixed(2)} µs / op</span>
      </motion.div>
    </div>
  );
});
