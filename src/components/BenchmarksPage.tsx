import { useState } from 'react';
import { runBenchmark } from '../benchmark/runner';
import type { BenchmarkConfig, BenchmarkResult, WorkloadType } from '../benchmark/types';

const totalOpsOptions = [
  { value: 1000, label: '1K' },
  { value: 5000, label: '5K' },
  { value: 10000, label: '10K' },
  { value: 50000, label: '50K' },
  { value: 100000, label: '100K' },
];

const workloadOptions: { value: WorkloadType; label: string }[] = [
  { value: 'uniform', label: 'Uniform' },
  { value: 'zipf', label: 'Zipf (80/20)' },
  { value: 'sequential', label: 'Sequential' },
  { value: 'temporal', label: 'Temporal Locality' },
];

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export function BenchmarksPage() {
  const [config, setConfig] = useState<BenchmarkConfig>({
    capacity: 64,
    totalOps: 10000,
    readRatio: 0.5,
    workload: 'uniform',
  });
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = () => {
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const r = runBenchmark(config);
      setResults(r);
      setLoading(false);
    }, 0);
  };

  const maxHitRate = results?.length
    ? Math.max(...results.map((r) => r.hitRate))
    : 100;
  const maxLatency = results?.length
    ? Math.max(...results.map((r) => r.avgLatencyUs))
    : 1;

  return (
    <div className="benchmarks">
      <header className="benchmarks__header">
        <h1 className="benchmarks__title">Benchmark Lab</h1>
        <p className="benchmarks__subtitle">
          Compare LFU vs LRU vs FIFO under different workloads
        </p>
      </header>

      <div className="benchmarks__config">
        <h3 className="benchmarks__config-title">Configuration</h3>
        <div className="benchmarks__config-grid">
          <div className="benchmarks__field">
            <label>Capacity</label>
            <input
              type="number"
              min={1}
              max={512}
              value={config.capacity}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  capacity: Math.max(1, parseInt(e.target.value, 10) || 1),
                }))
              }
            />
          </div>
          <div className="benchmarks__field">
            <label>Total Ops</label>
            <select
              value={config.totalOps}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  totalOps: parseInt(e.target.value, 10),
                }))
              }
            >
              {totalOpsOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="benchmarks__field">
            <label>Read Ratio</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={config.readRatio}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  readRatio: Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)),
                }))
              }
            />
          </div>
          <div className="benchmarks__field">
            <label>Workload</label>
            <select
              value={config.workload}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  workload: e.target.value as WorkloadType,
                }))
              }
            >
              {workloadOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="benchmarks__run-btn"
          onClick={handleRun}
          disabled={loading}
        >
          <PlayIcon />
          {loading ? 'Running...' : 'Run'}
        </button>
      </div>

      {results && (
        <>
          <div className="benchmarks__results">
            <h3 className="benchmarks__results-title">Results</h3>
            <table className="benchmarks__table">
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Hit Rate</th>
                  <th>Miss Rate</th>
                  <th>Avg Latency (µs)</th>
                  <th>Total Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.policy}>
                    <td className="benchmarks__policy">{r.policy}</td>
                    <td className="benchmarks__hit">{r.hitRate.toFixed(1)}%</td>
                    <td className="benchmarks__miss">{r.missRate.toFixed(1)}%</td>
                    <td className="benchmarks__mono">{r.avgLatencyUs.toFixed(2)}</td>
                    <td className="benchmarks__mono">{r.totalTimeMs.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="benchmarks__charts">
            <div className="benchmarks__chart">
              <h4>Hit Rate by Policy</h4>
              <div className="benchmarks__bars">
                {results.map((r) => (
                  <div key={r.policy} className="benchmarks__bar-row">
                    <span className="benchmarks__bar-label">{r.policy}</span>
                    <div className="benchmarks__bar-track">
                      <div
                        className="benchmarks__bar benchmarks__bar--hit"
                        style={{
                          width: `${(r.hitRate / maxHitRate) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="benchmarks__bar-value">{r.hitRate.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="benchmarks__chart">
              <h4>Avg Latency by Policy</h4>
              <div className="benchmarks__bars">
                {results.map((r) => (
                  <div key={r.policy} className="benchmarks__bar-row">
                    <span className="benchmarks__bar-label">{r.policy}</span>
                    <div className="benchmarks__bar-track">
                      <div
                        className="benchmarks__bar benchmarks__bar--latency"
                        style={{
                          width: `${maxLatency > 0 ? (r.avgLatencyUs / maxLatency) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="benchmarks__bar-value">{r.avgLatencyUs.toFixed(2)} µs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
