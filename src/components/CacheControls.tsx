import { useState, FormEvent } from 'react';

interface CacheControlsProps {
  capacity: number;
  onCapacityChange: (capacity: number) => void;
  onPut: (key: number, value: number) => void;
  onGet: (key: number) => number;
  onReset: () => void;
  onLoadDemo: () => void;
  onStepDemo: () => void;
  hasMoreDemoSteps: boolean;
}

export function CacheControls({
  capacity,
  onCapacityChange,
  onPut,
  onGet,
  onReset,
  onLoadDemo,
  onStepDemo,
  hasMoreDemoSteps,
}: CacheControlsProps) {
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [getResult, setGetResult] = useState<number | null>(null);

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

  const handleReset = () => {
    onReset();
    setKey('');
    setValue('');
    setGetResult(null);
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!Number.isNaN(v) && v >= 0) {
      onCapacityChange(v);
      setKey('');
      setValue('');
      setGetResult(null);
    }
  };

  return (
    <div className="control-panel">
      <h2 className="control-panel__title">Control Panel</h2>
      <div className="control-panel__row">
        <label className="control-panel__field">
          <span>Capacity</span>
          <input
            type="number"
            min={0}
            max={20}
            value={capacity}
            onChange={handleCapacityChange}
            aria-label="Cache capacity"
          />
        </label>
        <form onSubmit={handlePut} className="control-panel__put-form">
          <label className="control-panel__field">
            <span>Key</span>
            <input
              type="number"
              placeholder="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              aria-label="Cache key"
            />
          </label>
          <label className="control-panel__field">
            <span>Value</span>
            <input
              type="number"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Cache value"
            />
          </label>
          <button type="submit" className="btn btn--primary">
            PUT
          </button>
        </form>
      </div>
      <div className="control-panel__actions">
        <form onSubmit={handleGet} className="control-panel__get-form">
          <button type="submit" className="btn btn--secondary">
            GET
          </button>
          {getResult !== null && (
            <span
              className="control-panel__result"
              data-hit={getResult !== -1}
            >
              {getResult === -1 ? 'miss' : `→ ${getResult}`}
            </span>
          )}
        </form>
        <button type="button" className="btn btn--danger" onClick={handleReset}>
          RESET
        </button>
        <button
          type="button"
          className="btn btn--accent"
          onClick={onLoadDemo}
        >
          LOAD DEMO
        </button>
        <button
          type="button"
          className="btn btn--demo"
          onClick={onStepDemo}
          disabled={!hasMoreDemoSteps}
        >
          STEP TEST
        </button>
      </div>
    </div>
  );
}
