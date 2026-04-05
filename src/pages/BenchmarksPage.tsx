import { useRef, useEffect, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBenchmark } from '../hooks/useBenchmark';
import type { WorkloadType } from '../types';
import { useI18n } from '../i18n/I18nContext';
import {
  BenchmarkCharts,
  BenchmarkTable,
  BenchmarkSummary,
  TableExportButton,
  ChartExportButtons,
} from '../components/benchmark';

const opsOpts = [
  { v: 1000, l: '1K' },
  { v: 5000, l: '5K' },
  { v: 10_000, l: '10K' },
  { v: 50_000, l: '50K' },
  { v: 100_000, l: '100K' },
];
const wlOpts: { v: WorkloadType; tk: string }[] = [
  { v: 'uniform', tk: 'bench.wlUniform' },
  { v: 'zipf', tk: 'bench.wlZipf' },
  { v: 'sequential', tk: 'bench.wlSequential' },
  { v: 'temporal', tk: 'bench.wlTemporal' },
];

export function BenchmarksPage() {
  const { t } = useI18n();
  const { config, setConfig, results, running, run } = useBenchmark();
  const set = (p: Partial<typeof config>) => setConfig((c) => ({ ...c, ...p }));
  const chartsRef = useRef<HTMLDivElement>(null);
  const prevRunning = useRef(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (prevRunning.current && !running && results && results.length > 0) {
      setShowComplete(true);
      const id = window.setTimeout(() => setShowComplete(false), 5000);
      return () => clearTimeout(id);
    }
    prevRunning.current = running;
  }, [running, results]);

  const tableHeaders = {
    policy: t('bench.policy'),
    hitRate: t('bench.hitRate'),
    missRate: t('bench.missRate'),
    avgLatency: t('bench.avgLatency'),
    totalTime: t('bench.totalTime'),
  };

  const tableTooltips = {
    policy: t('bench.ttPolicy'),
    hitRate: t('bench.ttHitRate'),
    missRate: t('bench.ttMissRate'),
    avgLatency: t('bench.ttAvgLatency'),
    totalTime: t('bench.ttTotalTime'),
  };

  const chartExportLabels = {
    exportPng: t('bench.exportPng'),
    exportSvg: t('bench.exportSvg'),
    sectionCharts: t('bench.sectionCharts'),
    hintPng: t('bench.hintPng'),
    hintSvg: t('bench.hintSvg'),
    svgTitle: t('bench.svgTitle'),
    svgHit: t('bench.svgHit'),
    svgLat: t('bench.svgLat'),
  };

  const summaryLabels = {
    bestHit: t('bench.summaryBestHit'),
    fastest: t('bench.summaryFastest'),
    ttBestHit: t('bench.ttSummaryBestHit'),
    ttFastest: t('bench.ttSummaryFastest'),
  };

  /** Slower motion for larger workloads — matches minLoaderMs in useBenchmark. */
  const benchLoadingStyle = (
    running
      ? {
          ['--bench-spin-dur' as string]: `${0.68 + Math.min(1.05, config.totalOps / 85_000)}s`,
          ['--bench-indet-dur' as string]: `${0.95 + Math.min(1.5, config.totalOps / 60_000)}s`,
        }
      : undefined
  ) as CSSProperties | undefined;

  return (
    <div className="page bench-page">
      <h1 className="page__title">{t('bench.title')}</h1>
      <p className="page__sub">{t('bench.subtitle')}</p>

      <AnimatePresence>
        {showComplete && results && (
          <motion.div
            className="bench-toast"
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {t('bench.simulationComplete')}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card page__card bench-cfg-card">
        <div className={`bench-cfg-wrap ${running ? 'bench-cfg-wrap--loading' : ''}`}>
          <div className="bench-cfg">
            <div className="field">
              <label>{t('bench.capacity')}</label>
              <input
                type="number"
                min={1}
                max={512}
                value={config.capacity}
                onChange={(e) => set({ capacity: Math.max(1, +e.target.value || 1) })}
                disabled={running}
              />
            </div>
            <div className="field">
              <label>{t('bench.totalOps')}</label>
              <select value={config.totalOps} onChange={(e) => set({ totalOps: +e.target.value })} disabled={running}>
                {opsOpts.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t('bench.readRatio')}</label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={config.readRatio}
                onChange={(e) => set({ readRatio: Math.min(1, Math.max(0, +e.target.value || 0)) })}
                disabled={running}
              />
            </div>
            <div className="field">
              <label>{t('bench.workload')}</label>
              <select
                value={config.workload}
                onChange={(e) => set({ workload: e.target.value as WorkloadType })}
                disabled={running}
              >
                {wlOpts.map((o) => (
                  <option key={o.v} value={o.v}>
                    {t(o.tk)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {running && (
            <div className="bench-loading" style={benchLoadingStyle} aria-busy="true" aria-live="polite">
              <div className="bench-loading__spinner" />
              <p className="bench-loading__title">{t('bench.loading')}</p>
              <div className="bench-loading__bar" role="progressbar" aria-valuetext={t('bench.loading')}>
                <div className="bench-loading__bar-fill" />
              </div>
              <p className="bench-loading__sub">{t('bench.loadingSub')}</p>
            </div>
          )}
        </div>
        <motion.button
          className="btn btn--primary bench-run"
          onClick={run}
          disabled={running}
          whileHover={{ scale: running ? 1 : 1.02 }}
          whileTap={{ scale: running ? 1 : 0.98 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
          {running ? t('bench.loading') : t('bench.run')}
        </motion.button>
      </div>

      {results && (
        <>
          <BenchmarkSummary results={results} labels={summaryLabels} />

          <motion.div
            className="card page__card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <TableExportButton
              results={results}
              sectionTitle={t('bench.sectionSpreadsheet')}
              label={t('bench.exportExcel')}
              hint={t('bench.exportExcelHint')}
              headers={tableHeaders}
              sheetName={t('bench.excelSheet')}
            />
            <BenchmarkTable results={results} labels={tableHeaders} tooltips={tableTooltips} />
          </motion.div>

          <div className="bench-charts-outer card page__card">
            <ChartExportButtons results={results} chartRef={chartsRef} labels={chartExportLabels} />
            <BenchmarkCharts
              ref={chartsRef}
              results={results}
              hitTitle={t('bench.hitChart')}
              latTitle={t('bench.latChart')}
              hitTitleHint={t('bench.ttHitChart')}
              latTitleHint={t('bench.ttLatChart')}
              hitLabel={t('bench.chartHit')}
              missLabel={t('bench.chartMiss')}
              latAxisLabel={t('bench.avgLatency')}
            />
          </div>
        </>
      )}
    </div>
  );
}
