import { forwardRef, memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import type { BenchmarkResult } from '../../types';

interface Props {
  results: BenchmarkResult[];
  hitTitle: string;
  latTitle: string;
  hitLabel: string;
  missLabel: string;
  latAxisLabel: string;
}

export const BenchmarkCharts = memo(
  forwardRef<HTMLDivElement, Props>(function BenchmarkCharts(
    { results, hitTitle, latTitle, hitLabel, missLabel, latAxisLabel },
    ref,
  ) {
    const hitData = useMemo(
      () => results.map((r) => ({ name: r.policy, hit: r.hitRate, miss: r.missRate })),
      [results],
    );
    const latData = useMemo(
      () => results.map((r) => ({ name: r.policy, latency: r.avgLatencyUs })),
      [results],
    );

    const axis = { stroke: 'var(--dim)', fontSize: 11 };
    const grid = { stroke: 'var(--border-sub)', strokeDasharray: '3 3' };
    const tooltip = {
      contentStyle: {
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 12,
      },
      labelStyle: { color: 'var(--text)' },
    };

    return (
      <motion.div
        ref={ref}
        className="bench-charts-export"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bench-chart-panel">
          <h4 className="card__title bench-chart-panel__title">{hitTitle}</h4>
          <div className="bench-chart-panel__inner">
            <ResponsiveContainer width="100%" height={280} minHeight={220}>
              <BarChart data={hitData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }} barCategoryGap="18%">
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
                <YAxis tick={axis} tickLine={false} axisLine={false} unit=" %" domain={[0, 'auto']} />
                <Tooltip {...tooltip} formatter={(v: number) => [`${v.toFixed(2)}%`, '']} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="hit"
                  name={hitLabel}
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  animationDuration={400}
                  animationEasing="ease-in-out"
                />
                <Bar
                  dataKey="miss"
                  name={missLabel}
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  animationDuration={400}
                  animationEasing="ease-in-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bench-chart-panel">
          <h4 className="card__title bench-chart-panel__title">{latTitle}</h4>
          <div className="bench-chart-panel__inner">
            <ResponsiveContainer width="100%" height={280} minHeight={220}>
              <BarChart data={latData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }} barCategoryGap="22%">
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
                <YAxis tick={axis} tickLine={false} axisLine={false} unit=" µs" domain={[0, 'auto']} />
                <Tooltip {...tooltip} formatter={(v: number) => [`${v.toFixed(2)} µs`, latAxisLabel]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="latency"
                  name={latAxisLabel}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  animationDuration={400}
                  animationEasing="ease-in-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  }),
);
