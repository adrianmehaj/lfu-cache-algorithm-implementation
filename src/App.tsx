import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FrequencyBuckets } from './components/FrequencyBuckets';
import { CacheMapTable } from './components/CacheMapTable';
import { OperationLog } from './components/OperationLog';
import { TheoryPage } from './components/TheoryPage';
import { BenchmarksPage } from './components/BenchmarksPage';
import { useLFUCache } from './hooks/useLFUCache';

type TabId = 'visualizer' | 'benchmarks' | 'theory';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('visualizer');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const {
    put,
    get,
    reset,
    setCapacity,
    loadDemo,
    stepDemo,
    capacity,
    snapshot,
    logs,
    hasMoreDemoSteps,
  } = useLFUCache(2);

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)}
      />

      {activeTab === 'visualizer' && (
        <div className="app__layout">
          <Sidebar
            capacity={capacity}
            size={snapshot.size}
            minFreq={snapshot.minFreq}
            onCapacityChange={setCapacity}
            onPut={put}
            onGet={get}
            onReset={reset}
            onLoadDemo={loadDemo}
            onStepDemo={stepDemo}
            hasMoreDemoSteps={hasMoreDemoSteps}
          />
          <main className="app__main">
            <div className="app__viz-section">
              <FrequencyBuckets snapshot={snapshot} />
            </div>
            <div className="app__table-section">
              <CacheMapTable snapshot={snapshot} />
            </div>
            {snapshot.highlight.evictedKey != null && (
              <div className="app__evicted">
                Evicted key: {snapshot.highlight.evictedKey}
              </div>
            )}
          </main>
          <aside className="app__events">
            <OperationLog logs={logs} />
          </aside>
        </div>
      )}

      {activeTab === 'benchmarks' && <BenchmarksPage />}
      {activeTab === 'theory' && <TheoryPage />}
    </div>
  );
}

export default App;
