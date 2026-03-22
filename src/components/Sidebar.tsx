import { useState, FormEvent, useEffect } from 'react';

interface SidebarProps {
  capacity: number;
  size: number;
  minFreq: number;
  onCapacityChange: (capacity: number) => void;
  onPut: (key: number, value: number) => void;
  onGet: (key: number) => number;
  onReset: () => void;
  onLoadDemo: () => void;
  onStepDemo: () => void;
  hasMoreDemoSteps: boolean;
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function Sidebar({
  capacity,
  size,
  minFreq,
  onCapacityChange,
  onPut,
  onGet,
  onReset,
  onLoadDemo,
  onStepDemo,
  hasMoreDemoSteps,
}: SidebarProps) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [getResult, setGetResult] = useState<number | null>(null);
  const [capInput, setCapInput] = useState(String(capacity));
  useEffect(() => setCapInput(String(capacity)), [capacity]);

  const handleSetCapacity = () => {
    const v = parseInt(capInput, 10);
    if (!Number.isNaN(v) && v >= 0) {
      onCapacityChange(v);
      setKey('');
      setValue('');
      setGetResult(null);
    }
  };

  const handlePut = (e: FormEvent) => {
    e.preventDefault();
    const k = parseInt(key, 10);
    const v = parseInt(value, 10);
    if (!Number.isNaN(k) && !Number.isNaN(v)) {
      onPut(k, v);
      setGetResult(null);
    }
  };

  const handleGet = (e: FormEvent) => {
    e.preventDefault();
    const k = parseInt(key, 10);
    if (!Number.isNaN(k)) {
      const result = onGet(k);
      setGetResult(result);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <h3 className="sidebar__title">Capacity</h3>
        <div className="sidebar__capacity-row">
          <input
            type="number"
            min={0}
            max={64}
            value={capInput}
            onChange={(e) => setCapInput(e.target.value)}
            className="sidebar__input"
            aria-label="Cache capacity"
          />
          <button type="button" className="btn btn--sm btn--primary" onClick={handleSetCapacity}>
            Set
          </button>
        </div>
        <div className="sidebar__stats">
          <div className="stat-card">
            <span className="stat-card__label">Size</span>
            <span className="stat-card__value">{size}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Cap</span>
            <span className="stat-card__value">{capacity}</span>
          </div>
          <div className="stat-card stat-card--accent">
            <span className="stat-card__label">MinF</span>
            <span className="stat-card__value">{minFreq}</span>
          </div>
        </div>
      </div>

      <div className="sidebar__section">
        <h3 className="sidebar__title">Operations</h3>
        <form onSubmit={handlePut} className="sidebar__form">
          <div className="sidebar__field">
            <label>Key</label>
            <input
              type="number"
              placeholder="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="sidebar__input"
            />
          </div>
          <div className="sidebar__field">
            <label>Value</label>
            <input
              type="number"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="sidebar__input"
            />
          </div>
          <button type="submit" className="btn btn--primary btn--block">
            PUT
          </button>
        </form>
        <form onSubmit={handleGet} className="sidebar__form sidebar__form--row">
          <button type="submit" className="btn btn--secondary">
            GET
          </button>
          {getResult !== null && (
            <span className={`sidebar__result ${getResult !== -1 ? 'hit' : 'miss'}`}>
              {getResult === -1 ? 'miss' : `→ ${getResult}`}
            </span>
          )}
        </form>
        <button
          type="button"
          className="btn btn--danger btn--block btn--icon"
          onClick={onReset}
        >
          <TrashIcon />
          Clear Cache
        </button>
      </div>

      <div className="sidebar__section">
        <h3 className="sidebar__title">Presets</h3>
        <div className="sidebar__presets">
          <button type="button" className="btn btn--preset" onClick={onLoadDemo}>
            LeetCode Example 1
          </button>
          <button
            type="button"
            className="btn btn--preset"
            onClick={onStepDemo}
            disabled={!hasMoreDemoSteps}
          >
            Step Demo (10 ops)
          </button>
        </div>
      </div>
    </aside>
  );
}
