export type Locale = 'en' | 'sq';

/** Nested message map (avoids circular type alias). */
export interface MessageDict {
  [key: string]: string | MessageDict;
}

const en: MessageDict = {
  nav: {
    brand: 'LFU Cache Visual Simulator',
    visualizer: 'Visualizer',
    benchmarks: 'Benchmarks',
    theory: 'Theory',
    langEn: 'EN',
    langSq: 'SQ',
    themeToggle: 'Toggle light / dark theme',
    menu: 'Navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    copyright: '© 2026 Adrian Mehaj — Bachelor Thesis Project • LFU Cache Visual Simulator',
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
    runRecorded: 'Replay my actions',
  },
  viz: {
    freqBuckets: 'Buckets by access frequency',
    freqHint:
      'Top → most recently used, bottom → least recently used within the same frequency. The last item is the LRU candidate for eviction at that frequency.',
    noEntries: 'No items in the cache',
    frequency: 'Frequency',
    minFreqTag: '← lowest frequency (eviction tier)',
    key: 'Key',
    value: 'Value',
    cacheMap: 'Cache contents',
    searchLabel: 'Filter table',
    filter: 'Search…',
    thKey: 'Key',
    thValue: 'Value',
    thFreq: 'Frequency',
    emptyCache: 'The cache is empty',
    noMatch: 'No rows match your search',
    evictedTitle: 'Evicted key',
    evictedHint:
      'The cache was full, so one entry had to be removed. The pair (Key: {key}, Value: {value}) was removed. Under LFU, the removed key had the smallest access count. If several keys shared that count, the one touched longest ago was removed (LRU tie-break within the same frequency).',
    pointerHint: 'Most recent operation — this row or log entry',
  },
  log: {
    title: 'Operation log',
    empty: 'No operations recorded yet',
    evict: 'EVICT — key {key} (Value: {value})',
    put: 'PUT({key}, {value})',
    putUpdate: 'PUT({key}, {value}) [value updated]',
    get: 'GET({key}) → {result}',
  },
  demo: {
    step: 'Step {n}: {msg}',
    put: 'PUT({k}, {v}). Key {k} added. Initial frequency is 1.',
    putFull: 'PUT({k}, {v}). Key {k} added. Cache is now full (capacity 2).',
    getFreq: 'GET({k}). Key {k} accessed. Its frequency increases from {f1} to {f2} (notice the movement in Buckets).',
    evict: 'PUT({k}, {v}). Cache is full. Key {old} is evicted (lowest frequency = {f}) to make room for {k}.',
    miss: 'GET({k}). Key {k} requested, but not found (Cache Miss) as it was previously evicted.',
    missEvict: 'GET({k}). Key {k} requested, but not found (Cache Miss) as it was evicted to make room for {new}.',
    get: 'GET({k}). Key {k} accessed. Its frequency increases to {f}.',
    tieBreak:
      'PUT({k}, {v}). Cache full. Key {old} is evicted (frequency {f}, but was accessed least recently — LRU tie-break).',
    done: 'Example completed successfully! ✅ You can now try your own actions.',
    customPut: 'Insert: Key {k} added with value {v}. Initial frequency = 1.',
    customUpdate: 'Update: Key {k} updated with value {v}. Frequency increased.',
    customEvict: 'Insert with eviction: {k} added, but {old} was evicted (lowest frequency) because cache was full.',
    customHit: 'Hit: Key {k} found! Value: {v}. Frequency increased.',
    customMiss: 'Miss: Key {k} not found in cache.',
    customDone: 'Replay of your actions completed! ✅',
    paused: 'Tap the dimmed area or play to resume',
    resume: 'Resume demo',
  },
  bench: {
    title: 'Benchmark Lab',
    subtitle: 'Compare LFU, LRU, and FIFO replacement policies on synthetic workloads.',
    capacity: 'Cache capacity',
    totalOps: 'Number of operations',
    readRatio: 'Read / write mix (0–1)',
    workload: 'Access pattern',
    run: 'Run benchmark',
    running: 'Running…',
    loading: 'Loading…',
    loadingSub: 'Simulating the same GET/PUT sequence for LFU, LRU, and FIFO. Please wait.',
    policy: 'Policy',
    hitRate: 'Hit rate',
    missRate: 'Miss rate',
    avgLatency: 'Average latency',
    totalTime: 'Wall time',
    ttPolicy:
      'Replacement policy under test: LFU (least frequently used), LRU (least recently used), or FIFO (first-in first-out).',
    ttHitRate:
      'Hit rate (%): share of GET operations where the key was found in the cache — hits ÷ (hits + misses) × 100. Only reads are counted.',
    ttMissRate:
      'Miss rate (%): share of GET operations where the key was not in the cache — misses ÷ (hits + misses) × 100.',
    ttAvgLatency:
      'Average latency (µs per operation): total wall time for all GETs and PUTs divided by operation count, measured with performance.now().',
    ttTotalTime: 'Total wall time (ms) to execute the full workload once for this policy in the browser.',
    ttHitChart: 'Bar chart: hit rate (%) and miss rate (%) per policy — same metric definitions as the table.',
    ttLatChart:
      'Bar chart: average latency in microseconds (µs) per operation — same definition as the “Average latency” column.',
    ttSummaryBestHit: 'Policy with the highest hit rate (%) on this run.',
    ttSummaryFastest: 'Policy with the lowest average latency (µs per operation) on this run.',
    hitChart: 'Hit rate by policy',
    latChart: 'Average latency by policy',
    wlUniform: 'Uniform (random)',
    wlZipf: 'Zipf (80/20)',
    wlSequential: 'Sequential scan',
    wlTemporal: 'Temporal locality',
    exportExcel: 'Export spreadsheet (.xlsx)',
    exportExcelHint:
      'Formatted workbook with the results table (two decimal places, header row, alternating row shading).',
    sectionSpreadsheet: 'Spreadsheet export',
    exportPng: 'Export PNG',
    exportSvg: 'Export SVG',
    sectionCharts: 'Chart exports',
    hintPng: 'High-resolution raster image of the on-screen charts (hit rate and latency).',
    hintSvg: 'Scalable vector graphics — suitable for slides, documents, and print.',
    excelSheet: 'Benchmark',
    svgTitle: 'LFU benchmark — hit rate & latency',
    svgHit: 'Hit rate (%)',
    svgLat: 'Average latency (µs)',
    chartHit: 'Hits',
    chartMiss: 'Misses',
    summaryBestHit: 'Best hit rate',
    summaryFastest: 'Lowest latency / op',
    simulationComplete: 'Simulation complete',
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
    copyright: '© 2026 Adrian Mehaj — Projekt Diplome • Simulatori Vizual i LFU Cache',
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
    get: 'MERR',
    miss: 'mungesë (nuk u gjet)',
    clearCache: 'Rivendos memorien',
    presets: 'Skenarë të shpejtë',
    leetDemo: 'LeetCode — shembulli 1',
    runRecorded: 'Riluaj veprimet e mia',
  },
  viz: {
    freqBuckets: 'Grupet sipas frekuencës së aksesit',
    freqHint:
      'Lart → më i përdoruri së fundmi, poshtë → më i vjetri në rend brenda së njëjtës frekuencë. Elementi i fundit është kandidati LRU për dëbim në atë frekuencë.',
    noEntries: 'Nuk ka asnjë element në memorie',
    frequency: 'Frekuenca',
    minFreqTag: '← frekuenca më e ulët (niveli i dëbimit)',
    key: 'Çelësi',
    value: 'Vlera',
    cacheMap: 'Përmbajtja e memories',
    searchLabel: 'Filtro tabelën',
    filter: 'Kërko…',
    thKey: 'Çelësi',
    thValue: 'Vlera',
    thFreq: 'Frekuenca',
    emptyCache: 'Memoria është e zbrazët',
    noMatch: 'Asnjë rresht nuk përputhet me kërkimin',
    evictedTitle: 'Çelësi i dëbuar nga memoria',
    evictedHint:
      'Memoria ishte plot, prandaj duhej hequr një element. U hoq çifti (Çelësi: {key}, Vlera: {value}). Sipas LFU-së, u hoq çelësi me numrin më të vogël të akseseve. Nëse disa çelësa kishin të njëjtën frekuencë, u hoq ai që nuk ishte prekur më gjatë (barazimi LRU brenda së njëjtës frekuencë).',
    pointerHint: 'Veprimi më i fundit — ky rresht ose hyrja në regjistër',
  },
  log: {
    title: 'Regjistri i veprimeve',
    empty: 'Ende nuk është regjistruar asnjë veprim',
    evict: 'DËBIM — çelësi {key} (Vlera: {value})',
    put: 'VENDOS({key}, {value})',
    putUpdate: 'VENDOS({key}, {value}) [vlera e përditësuar]',
    get: 'MERR({key}) → {result}',
  },
  demo: {
    step: 'Hapi {n}: {msg}',
    put: 'PUT({k}, {v}). Shtohet çelësi {k}. Frekuenca fillestare është 1 sepse sapo u fut.',
    putFull: 'PUT({k}, {v}). Shtohet çelësi {k}. Tani memoria është plot (kapaciteti 2).',
    getFreq: 'MERR({k}). Aksesohet çelësi {k}. Frekuenca e tij rritet nga {f1} në {f2} (shihni lëvizjen te Buckets).',
    evict:
      'PUT({k}, {v}). Memoria është plot. Dëbohet çelësi {old} (frekuenca më e ulët = {f}) për të bërë vend për {k}.',
    miss: 'MERR({k}). Kërkohet çelësi {k}, por nuk gjendet (Cache Miss) sepse u dëbua në hapin e kaluar.',
    missEvict:
      "MERR({k}). Kërkohet çelësi {k}, por nuk gjendet (Cache Miss) sepse u dëbua për t'i lënë vend {new}-shit.",
    get: 'MERR({k}). Aksesohet çelësi {k}. Frekuenca e tij rritet në {f}.',
    tieBreak:
      'PUT({k}, {v}). Memoria plot. Dëbohet çelësi {old} (frekuenca {f}, por u aksesu më herët se të tjerët — LRU tie-break).',
    done: 'Shembulli përfundoi me sukses! ✅ Tani mund të provoni veprimet tuaja.',
    customPut: 'Shtim: U shtua çelësi {k} me vlerë {v}. Frekuenca fillestare = 1.',
    customUpdate: 'Përditësim: Çelësi {k} u përditësua me vlerën {v}. Frekuenca u rrit.',
    customEvict: 'Shtim me dëbim: U shtua {k}, por u dëbua {old} (frekuenca më e ulët) sepse memoria ishte plot.',
    customHit: 'Gjetje (Hit): Çelësi {k} u gjet! Vlera: {v}. Frekuenca u rrit.',
    customMiss: 'Mungesë (Miss): Çelësi {k} nuk u gjet në memorie.',
    customDone: 'Riluajtja e veprimeve tuaja përfundoi! ✅',
    paused: 'Prek sipërfaqen e zbehur ose play për vazhdim',
    resume: 'Vazhdo demonstrimin',
  },
  bench: {
    title: 'Laboratori i krahasimit të performancës',
    subtitle: 'Krahaso politikat e zëvendësimit LFU, LRU dhe FIFO në ngarkesa të simuluara.',
    capacity: 'Kapaciteti i memories',
    totalOps: 'Numri i veprimeve',
    readRatio: 'Përzierja lexim / shkrim (0–1)',
    workload: 'Modeli i aksesit',
    run: 'Nis krahasimin',
    running: 'Duke u ekzekutuar…',
    loading: 'Duke u ngarkuar…',
    loadingSub: 'Po simulohet e njëjta sekuencë GET/PUT për LFU, LRU dhe FIFO. Ju lutem prisni.',
    policy: 'Politika',
    hitRate: 'Shkalla e goditjeve (hit)',
    missRate: 'Shkalla e mungesave (miss)',
    avgLatency: 'Vonesa mesatare',
    totalTime: 'Koha e përgjithshme',
    ttPolicy: 'Politika e zëvendësimit: LFU (më pak i përdoruri), LRU (më i vjetri në kohë), ose FIFO (i pari që hyn).',
    ttHitRate:
      'Hit rate (%): pjesëmëria e operacioneve GET ku çelësi gjendej në cache — goditje ÷ (goditje + mungesa) × 100. Numërohen vetëm leximet.',
    ttMissRate:
      'Miss rate (%): pjesëmëria e GET-ave ku çelësi nuk ishte në cache — mungesa ÷ (goditje + mungesa) × 100.',
    ttAvgLatency:
      'Vonesa mesatare (µs për operacion): koha totale e matur me performance.now() për të gjitha GET/PUT, e ndarë me numrin e operacioneve.',
    ttTotalTime: 'Koha e plotë e ekzekutimit (ms) e të gjithë workload-it një herë për këtë politika, në shfletues.',
    ttHitChart: 'Grafik shtyllash: hit rate (%) dhe miss rate (%) sipas politikës — i njëjti kuptim si në tabelë.',
    ttLatChart:
      'Grafik shtyllash: vonesa mesatare në mikrosekonda (µs) për operacion — i njëjti kuptim si kolona “Vonesa mesatare”.',
    ttSummaryBestHit: 'Politika me hit rate më të lartë (%) në këtë ekzekutim.',
    ttSummaryFastest: 'Politika me vonesë mesatare më të ulët (µs për operacion) në këtë ekzekutim.',
    hitChart: 'Goditjet sipas politikës',
    latChart: 'Vonesa mesatare sipas politikës',
    wlUniform: 'Uniforme (e rastësishme)',
    wlZipf: 'Zipf (80/20)',
    wlSequential: 'Radhitëse (sekuenciale)',
    wlTemporal: 'Lokalitet kohor',
    exportExcel: 'Eksporto spreadsheet (.xlsx)',
    exportExcelHint:
      'Skedar Excel i formatuar me tabelën e rezultateve (dy shifra pas presjes, rresht header, rreshta të ndërsyerë).',
    sectionSpreadsheet: 'Eksporti i spreadsheet-it',
    exportPng: 'Eksporto PNG',
    exportSvg: 'Eksporto SVG',
    sectionCharts: 'Eksporti i grafikëve',
    hintPng: 'Imazh raster me rezolucion të lartë i grafikëve në ekran (hit rate dhe vonesë).',
    hintSvg: 'Grafikë vektorialë (SVG) — të përshtatshëm për prezantime, dokumente dhe shtyp.',
    excelSheet: 'Krahasim',
    svgTitle: 'Krahasim LFU — goditje & vonesë',
    svgHit: 'Shkalla e goditjeve (%)',
    svgLat: 'Vonesa mesatare (µs)',
    chartHit: 'Goditje',
    chartMiss: 'Mungesa',
    summaryBestHit: 'Më e mira (hit rate)',
    summaryFastest: 'Më e shpejta (vonesë / op)',
    simulationComplete: 'Simulimi përfundoi',
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
