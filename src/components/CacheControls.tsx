import { useState, FormEvent } from 'react';

interface CacheControlsProps {
  onPut: (key: number, value: number) => void;
  onGet: (key: number) => number;
  onReset: () => void;
}

/**
 * Control panel for PUT, GET, and RESET operations on the LFU cache.
 */
export function CacheControls({ onPut, onGet, onReset }: CacheControlsProps) {
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

  return (
    <div className="controls">
      <h2>Cache Controls</h2>
      <form onSubmit={handlePut} className="control-row">
        <input
          type="number"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          aria-label="Cache key"
        />
        <input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Cache value"
        />
        <button type="submit">PUT</button>
      </form>
      <form onSubmit={handleGet} className="control-row">
        <input
          type="number"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          aria-label="Cache key for GET"
        />
        <button type="submit">
          GET
        </button>
        {getResult !== null && (
          <span className="get-result" data-hit={getResult !== -1}>
            {getResult === -1 ? 'miss' : `→ ${getResult}`}
          </span>
        )}
      </form>
      <button type="button" onClick={handleReset} className="reset-btn">
        RESET
      </button>
    </div>
  );
}
