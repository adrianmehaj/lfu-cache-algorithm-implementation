import { useState, useEffect, lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { VisualizerPage } from './pages/VisualizerPage';
import { I18nProvider } from './i18n/I18nContext';

const BenchmarksPage = lazy(() => import('./pages/BenchmarksPage').then((m) => ({ default: m.BenchmarksPage })));
const TheoryPage = lazy(() => import('./pages/TheoryPage').then((m) => ({ default: m.TheoryPage })));

type Tab = 'visualizer' | 'benchmarks' | 'theory';

export default function App() {
  const [tab, setTab] = useState<Tab>('visualizer');
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <I18nProvider>
      <Layout tab={tab} onTab={setTab} dark={dark} onTheme={() => setDark(!dark)}>
        {tab === 'visualizer' && <VisualizerPage />}
        <Suspense fallback={null}>
          {tab === 'benchmarks' && <BenchmarksPage />}
          {tab === 'theory'     && <TheoryPage />}
        </Suspense>
      </Layout>
    </I18nProvider>
  );
}
