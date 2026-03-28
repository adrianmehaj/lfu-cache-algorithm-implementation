export type Locale = 'en' | 'sq';

/** Nested message map (avoids circular type alias). */
export interface MessageDict {
  [key: string]: string | MessageDict;
}

const en: MessageDict = {
  nav: {
    brand: 'LFU cache visual simulator',
    visualizer: 'Visualizer',
    benchmarks: 'Benchmarks',
    theory: 'Theory',
    langEn: 'EN',
    langSq: 'SQ',
    themeToggle: 'Toggle light / dark theme',
    menu: 'Navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  sidebar: {
    capacity: 'Capacity',
    set: 'Apply',
    size: 'Occupied',
    cap: 'Capacity',
    minF: 'Min. frequency',
    operations: 'Operations',
    key: 'Key',
    value: 'Value',
    keyPh: 'Enter key',
    valuePh: 'Enter value',
    put: 'PUT',
    get: 'GET',
    miss: 'miss (not found)',
    clearCache: 'Reset cache',
    presets: 'Quick scenarios',
    leetDemo: 'LeetCode — example 1',
    stepDemo: 'Step-by-step demo (10 operations)',
  },
  viz: {
    freqBuckets: 'Buckets by access frequency',
    freqHint:
      'Top = most recently used, bottom = least recently used within the same frequency. The last item is the LRU candidate for eviction at that frequency.',
    noEntries: 'No items in the cache',
    frequency: 'Frequency',
    minFreqTag: '← lowest frequency (eviction tier)',
    key: 'Key',
    value: 'Value',
    cacheMap: 'Cache contents (table)',
    searchLabel: 'Filter table',
    filter: 'Search…',
    thKey: 'Key',
    thValue: 'Value',
    thFreq: 'Frequency',
    emptyCache: 'The cache is empty',
    noMatch: 'No rows match your search',
    evictedTitle: 'Evicted key',
    evictedHint:
      'The cache was full, so one entry had to be removed. Under LFU, the removed key had the smallest access count. If several keys shared that count, the one touched longest ago was removed (LRU tie-break within the same frequency).',
  },
  log: {
    title: 'Operation log',
    empty: 'No operations recorded yet',
    evict: 'EVICT — key {key}',
    put: 'PUT({key}, {value})',
    putUpdate: 'PUT({key}, {value}) [value updated]',
    get: 'GET({key}) → {result}',
  },
  bench: {
    title: 'Benchmark lab',
    subtitle: 'Compare LFU, LRU, and FIFO replacement policies on synthetic workloads.',
    capacity: 'Cache capacity',
    totalOps: 'Number of operations',
    readRatio: 'Read / write mix (0–1)',
    workload: 'Access pattern',
    run: 'Run benchmark',
    running: 'Running…',
    policy: 'Policy',
    hitRate: 'Hit rate',
    missRate: 'Miss rate',
    avgLatency: 'Average latency',
    totalTime: 'Wall time',
    hitChart: 'Hit rate by policy',
    latChart: 'Average latency by policy',
    wlUniform: 'Uniform (random)',
    wlZipf: 'Zipf (80/20)',
    wlSequential: 'Sequential scan',
    wlTemporal: 'Temporal locality',
  },
};

const sq: MessageDict = {
  nav: {
    brand: 'Simulator Vizual i LFU Cache',
    visualizer: 'Vizualizimi',
    benchmarks: 'Krahasime',
    theory: 'Teoria',
    langEn: 'EN',
    langSq: 'SQ',
    themeToggle: 'Ndrysho temën (e çelët / e errët)',
    menu: 'Navigimi',
    openMenu: 'Hap menunë',
    closeMenu: 'Mbyll menunë',
  },
  sidebar: {
    capacity: 'Kapaciteti i memories',
    set: 'Apliko',
    size: 'Të zëna',
    cap: 'Kapaciteti',
    minF: 'Freq. minimale',
    operations: 'Veprimet',
    key: 'Çelësi',
    value: 'Vlera',
    keyPh: 'Shkruaj çelësin',
    valuePh: 'Shkruaj vlerën',
    put: 'VENDOS',
    get: 'GET',
    miss: 'mungesë (nuk u gjet)',
    clearCache: 'Rivendos memorien',
    presets: 'Shembuj të gatshëm',
    leetDemo: 'LeetCode — shembulli 1',
    stepDemo: 'Demonstrim hap pas hapi (10 veprime)',
  },
  viz: {
    freqBuckets: 'Grupet sipas frekuencës së aksesit',
    freqHint:
      'Lart = më i përdoruri së fundmi, poshtë = më i vjetri në rend brenda së njëjtës frekuencë. Elementi i fundit është kandidati LRU për dëbim në atë frekuencë.',
    noEntries: 'Nuk ka asnjë element në memorie',
    frequency: 'Frekuenca',
    minFreqTag: '← frekuenca më e ulët (niveli i dëbimit)',
    key: 'Çelësi',
    value: 'Vlera',
    cacheMap: 'Përmbajtja e memories (tabelë)',
    searchLabel: 'Filtro tabelën',
    filter: 'Kërko…',
    thKey: 'Çelësi',
    thValue: 'Vlera',
    thFreq: 'Frekuenca',
    emptyCache: 'Memoria është e zbrazët',
    noMatch: 'Asnjë rresht nuk përputhet me kërkimin',
    evictedTitle: 'Çelësi i dëbuar nga memoria',
    evictedHint:
      'Memoria ishte plot, prandaj duhej hequr një element. Sipas LFU-së, u hoq çelësi me numrin më të vogël të akseseve. Nëse disa çelësa kishin të njëjtën frekuencë, u hoq ai që nuk ishte prekur më gjatë (barazimi LRU brenda së njëjtës frekuencë).',
  },
  log: {
    title: 'Regjistri i veprimeve',
    empty: 'Ende nuk është regjistruar asnjë veprim',
    evict: 'DËBIM — çelësi {key}',
    put: 'VENDOS({key}, {value})',
    putUpdate: 'VENDOS({key}, {value}) [vlera e përditësuar]',
    get: 'GET({key}) → {result}',
  },
  bench: {
    title: 'Laboratori i krahasimit të performancës',
    subtitle:
      'Krahaso politikat e zëvendësimit LFU, LRU dhe FIFO në ngarkesa të simuluara.',
    capacity: 'Kapaciteti i memories',
    totalOps: 'Numri i veprimeve',
    readRatio: 'Përzierja lexim / shkrim (0–1)',
    workload: 'Modeli i aksesit',
    run: 'Nis krahasimin',
    running: 'Duke u ekzekutuar…',
    policy: 'Politika',
    hitRate: 'Shkalla e goditjeve (hit)',
    missRate: 'Shkalla e mungesave (miss)',
    avgLatency: 'Vonesa mesatare',
    totalTime: 'Koha e përgjithshme',
    hitChart: 'Goditjet sipas politikës',
    latChart: 'Vonesa mesatare sipas politikës',
    wlUniform: 'Uniforme (e rastësishme)',
    wlZipf: 'Zipf (80/20)',
    wlSequential: 'Radhitëse (sekuenciale)',
    wlTemporal: 'Lokalitet kohor',
  },
};

const dicts: Record<Locale, MessageDict> = { en, sq };

function deepGet(obj: MessageDict | string | undefined, path: string): string | undefined {
  if (typeof obj === 'string' || obj === undefined) return typeof obj === 'string' ? obj : undefined;
  const i = path.indexOf('.');
  if (i === -1) {
    const v = obj[path];
    return typeof v === 'string' ? v : undefined;
  }
  const head = path.slice(0, i);
  const tail = path.slice(i + 1);
  const next = obj[head];
  if (typeof next === 'object' && next !== null && !Array.isArray(next)) return deepGet(next as MessageDict, tail);
  return undefined;
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let s = deepGet(dicts[locale], key) ?? deepGet(dicts.en, key) ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      const token = `{${k}}`;
      const rep = String(v);
      while (s.includes(token)) s = s.split(token).join(rep);
    }
  }
  return s;
}
