import { memo } from 'react';
import { motion } from 'framer-motion';
import type { BenchmarkResult } from '../../types';

interface Props {
  results: BenchmarkResult[];
  labels: {
    policy: string;
    hitRate: string;
    missRate: string;
    avgLatency: string;
    totalTime: string;
  };
  tooltips: {
    policy: string;
    hitRate: string;
    missRate: string;
    avgLatency: string;
    totalTime: string;
  };
}

export const BenchmarkTable = memo(function BenchmarkTable({ results, labels, tooltips }: Props) {
  return (
    <div className="bench-table-wrap">
      <table className="bench-table">
        <thead>
          <tr>
            <th className="bench-th--hint" title={tooltips.policy}>{labels.policy}</th>
            <th className="bench-th--hint" title={tooltips.hitRate}>{labels.hitRate}</th>
            <th className="bench-th--hint" title={tooltips.missRate}>{labels.missRate}</th>
            <th className="bench-th--hint" title={tooltips.avgLatency}>{labels.avgLatency}</th>
            <th className="bench-th--hint" title={tooltips.totalTime}>{labels.totalTime}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <motion.tr
              key={r.policy}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <td style={{ fontWeight: 600 }}>{r.policy}</td>
              <td className="bench-hit">{r.hitRate.toFixed(1)}%</td>
              <td className="bench-miss">{r.missRate.toFixed(1)}%</td>
              <td style={{ fontFamily: 'var(--mono)' }}>{r.avgLatencyUs.toFixed(2)} µs</td>
              <td style={{ fontFamily: 'var(--mono)' }}>{r.totalTimeMs.toFixed(1)} ms</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
