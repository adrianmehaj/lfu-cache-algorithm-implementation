import { useState } from 'react';
import { CacheControls } from './components/CacheControls';
import { CacheVisualizer } from './components/CacheVisualizer';
import { useLFUCache } from './hooks/useLFUCache';

function App() {
  const [capacity, setCapacity] = useState(2);
  const { put, get, reset, snapshot } = useLFUCache(capacity);

  return (
    <main className="app">
      <header>
        <h1>LFU Cache Algorithm</h1>
        <p className="subtitle">
          O(1) get & put · Evict least frequently used, LRU tiebreaker
        </p>
      </header>
      <section className="capacity-section">
        <label>
          Capacity:
          <input
            type="number"
            min={1}
            max={20}
            value={capacity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v) && v >= 1) {
                setCapacity(v);
                reset();
              }
            }}
          />
        </label>
      </section>
      <div className="content">
        <CacheControls onPut={put} onGet={get} onReset={reset} />
        <CacheVisualizer snapshot={snapshot} />
      </div>
    </main>
  );
}

export default App;
