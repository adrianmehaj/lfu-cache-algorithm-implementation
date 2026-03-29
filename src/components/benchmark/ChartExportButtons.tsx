import { memo, useCallback, useState, type RefObject } from 'react';
import { motion } from 'framer-motion';
import type { BenchmarkResult } from '../../types';
import { buildBenchmarkSvg, downloadText, exportChartsPng, stamp } from '../../utils/benchmarkExport';

interface Props {
  results: BenchmarkResult[];
  chartRef: RefObject<HTMLDivElement | null>;
  labels: {
    exportPng: string;
    exportSvg: string;
    sectionCharts: string;
    hintPng: string;
    hintSvg: string;
    svgTitle: string;
    svgHit: string;
    svgLat: string;
  };
}

const btnMotion = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: { duration: 0.2 } };

export const ChartExportButtons = memo(function ChartExportButtons({ results, chartRef, labels }: Props) {
  const [busy, setBusy] = useState(false);

  const doPng = useCallback(async () => {
    setBusy(true);
    try {
      const ts = stamp();
      await exportChartsPng(chartRef.current, `lfu-benchmark-charts-${ts}.png`);
    } finally {
      setBusy(false);
    }
  }, [chartRef]);

  const doSvg = useCallback(() => {
    const ts = stamp();
    const svg = buildBenchmarkSvg(results, labels.svgTitle, labels.svgHit, labels.svgLat);
    downloadText(`lfu-benchmark-charts-${ts}.svg`, svg, 'image/svg+xml;charset=utf-8');
  }, [results, labels.svgTitle, labels.svgHit, labels.svgLat]);

  return (
    <div className="bench-export-charts">
      <p className="bench-export__intro">{labels.sectionCharts}</p>
      <div className="bench-export-row bench-export-row--charts">
        <motion.button
          type="button"
          className="btn btn--secondary bench-export-btn"
          {...btnMotion}
          onClick={doPng}
          disabled={busy}
          title={labels.hintPng}
        >
          {labels.exportPng}
        </motion.button>
        <motion.button
          type="button"
          className="btn btn--secondary bench-export-btn"
          {...btnMotion}
          onClick={doSvg}
          disabled={busy}
          title={labels.hintSvg}
        >
          {labels.exportSvg}
        </motion.button>
      </div>
      <p className="bench-export__hints bench-export__hints--inline">
        <span className="bench-export__hint">{labels.hintPng}</span>
        <span className="bench-export__hint">{labels.hintSvg}</span>
      </p>
    </div>
  );
});
