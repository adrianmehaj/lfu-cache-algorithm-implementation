import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { VisualizerPage } from './pages/VisualizerPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { TheoryPage } from './pages/TheoryPage';
import { I18nProvider } from './i18n/I18nContext';

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
        {tab === 'benchmarks' && <BenchmarksPage />}
        {tab === 'theory'     && <TheoryPage />}
      </Layout>
    </I18nProvider>
  );
}
