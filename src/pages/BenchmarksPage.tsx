import { useBenchmark } from '../hooks/useBenchmark';
import type { WorkloadType } from '../types';
import { useI18n } from '../i18n/I18nContext';

const opsOpts = [{ v: 1000, l: '1K' }, { v: 5000, l: '5K' }, { v: 10_000, l: '10K' }, { v: 50_000, l: '50K' }, { v: 100_000, l: '100K' }];
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

  const maxHit = results ? Math.max(...results.map((r) => r.hitRate), 1) : 100;
  const maxLat = results ? Math.max(...results.map((r) => r.avgLatencyUs), 0.01) : 1;

  return (
    <div className="page">
      <h1 className="page__title">{t('bench.title')}</h1>
      <p className="page__sub">{t('bench.subtitle')}</p>

      <div className="card page__card">
        <div className="bench-cfg">
          <div className="field"><label>{t('bench.capacity')}</label><input type="number" min={1} max={512} value={config.capacity} onChange={(e) => set({ capacity: Math.max(1, +e.target.value || 1) })} /></div>
          <div className="field"><label>{t('bench.totalOps')}</label><select value={config.totalOps} onChange={(e) => set({ totalOps: +e.target.value })}>{opsOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select></div>
          <div className="field"><label>{t('bench.readRatio')}</label><input type="number" min={0} max={1} step={0.1} value={config.readRatio} onChange={(e) => set({ readRatio: Math.min(1, Math.max(0, +e.target.value || 0)) })} /></div>
          <div className="field"><label>{t('bench.workload')}</label><select value={config.workload} onChange={(e) => set({ workload: e.target.value as WorkloadType })}>{wlOpts.map((o) => <option key={o.v} value={o.v}>{t(o.tk)}</option>)}</select></div>
        </div>
        <button className="bench-run" onClick={run} disabled={running}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          {running ? t('bench.running') : t('bench.run')}
        </button>
      </div>

      {results && (
        <>
          <div className="card page__card">
            <div className="bench-table-wrap">
              <table className="bench-table">
                <thead><tr><th>{t('bench.policy')}</th><th>{t('bench.hitRate')}</th><th>{t('bench.missRate')}</th><th>{t('bench.avgLatency')}</th><th>{t('bench.totalTime')}</th></tr></thead>
                <tbody>{results.map((r) => (
                  <tr key={r.policy}>
                    <td style={{ fontWeight: 600 }}>{r.policy}</td>
                    <td className="bench-hit">{r.hitRate.toFixed(1)}%</td>
                    <td className="bench-miss">{r.missRate.toFixed(1)}%</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{r.avgLatencyUs.toFixed(2)} µs</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{r.totalTimeMs.toFixed(1)} ms</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div className="bench-charts">
            <div className="card">
              <h4 className="card__title">{t('bench.hitChart')}</h4>
              {results.map((r) => (
                <div key={r.policy} className="bar-row">
                  <span className="bar-label">{r.policy}</span>
                  <div className="bar-track"><div className="bar-fill bar-fill--hit" style={{ width: `${(r.hitRate / maxHit) * 100}%` }} /></div>
                  <span className="bar-value">{r.hitRate.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h4 className="card__title">{t('bench.latChart')}</h4>
              {results.map((r) => (
                <div key={r.policy} className="bar-row">
                  <span className="bar-label">{r.policy}</span>
                  <div className="bar-track"><div className="bar-fill bar-fill--lat" style={{ width: `${(r.avgLatencyUs / maxLat) * 100}%` }} /></div>
                  <span className="bar-value">{r.avgLatencyUs.toFixed(2)} µs</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
