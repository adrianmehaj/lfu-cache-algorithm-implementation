import type { Locale } from './translations';

export interface TheorySection {
  title: string;
  body: string;
  codeBlock?: string[];
  list?: string[];
  /** Paragraph after the list (optional). */
  afterList?: string;
  pre?: string;
}

export interface TheoryBundle {
  title: string;
  subtitle: string;
  sections: TheorySection[];
}

const en: TheoryBundle = {
  title: 'LFU cache',
  subtitle:
    'From caching basics to O(1) LFU, plus LRU and FIFO as comparison policies — including the same trio used in the benchmark lab.',
  sections: [
    {
      title: 'Introduction — what is caching?',
      body: 'A cache is a fast, capacity-limited store that mirrors a subset of data held in a slower backing store (disk, network, or larger RAM). Each lookup tries the cache first so repeated accesses avoid paying the full slow-path cost. When the cache is full, admitting a new item forces an eviction — a policy decides which resident entry to discard. In plain terms: a small shelf beside a huge warehouse. Only a few boxes fit on the shelf; the eviction rule answers “which box goes back to storage when I need space?”',
    },
    {
      title: 'What is LFU (Least Frequently Used)?',
      body: 'LFU evicts the key with the lowest access frequency among keys currently in the cache. Successful operations (typically PUT and GET hit) bump that key’s counter. On eviction under capacity pressure, the victim is the minimum-frequency key.',
      list: [
        'PUT on a key (insert or update) increases its frequency.',
        'GET hit increases frequency; GET miss does not alter the cache.',
        'Tie on minimum frequency: break with LRU inside that frequency bucket — remove the least recently used among the tied keys.',
      ],
    },
    {
      title: 'LFU vs LRU — comparison',
      body: 'LRU looks only at time: evict whoever was touched longest ago. LFU looks at counts: evict whoever was touched the fewest times overall. “One-hit wonders” can linger under LRU; steady hot keys are rewarded by LFU. No single policy wins every workload — recency-heavy traffic suits LRU; stable popularity suits LFU.',
      codeBlock: [
        'LFU: minimum frequency out; ties → LRU within that frequency.',
        'LRU: oldest last-access time out — frequency ignored.',
      ],
    },
    {
      title: 'FIFO (First In First Out)',
      body: 'FIFO evicts the key that was admitted to the cache earliest — a queue: first inserted, first removed when space is needed. It does not use access frequency (unlike LFU) nor “time since last touch” as the primary rule (unlike LRU). It is simple, predictable, and a standard pedagogical baseline. On skewed or hot-set workloads, LFU or LRU often achieve better hit rates; FIFO still matters as an easy-to-reason-about reference point.',
      list: [
        'On eviction under a full cache, the victim is the oldest key by insertion order (front of the queue).',
        'This app’s benchmark replays the same random workload against LFU, LRU, and FIFO side by side so differences come only from the policy.',
        'FIFO appears in real pipelines too (e.g. bounded queues, some network buffers) — less often as the main CPU/page replacement policy than LRU variants, but the idea is ubiquitous.',
      ],
      codeBlock: ['FIFO: “The key that entered first leaves first when we need a slot.”'],
    },
    {
      title: 'Data structures — how get and put stay O(1)',
      body: 'Scanning all keys each time would be O(n). Instead: a hash map gives key → node in expected O(1). Each distinct frequency maps to a doubly linked list of nodes at that count; inside the list, order is LRU. A touch moves the node to another frequency list or reorders within the same list — constant pointer work. Sentinel head/tail nodes keep inserts and deletes uniform.',
      list: [
        'Hash map: direct jump to any key’s node.',
        'Frequency buckets: doubly linked lists, LRU order inside each bucket.',
        'Eviction: lowest non-empty frequency; take the LRU end — never scan the entire cache.',
      ],
      afterList:
        'The visualiser’s frequency buckets follow this model: same frequency → same bucket; eviction candidate → LRU within the minimum bucket.',
      pre: `freq=1: [A, B]
freq=2: [C]

Evict → B   (LRU within freq=1)`,
    },
    {
      title: 'Big-O notation — what does O(1) mean?',
      body: 'Big-O describes how work grows with problem size n — here, roughly the number of keys in the cache. O(1) means each GET or PUT does a bounded number of steps (map lookups, a few link updates); cost does not scale linearly with n. O(n) would mean touching every entry, e.g. a full scan to pick a victim.',
      codeBlock: [
        'O(1): flat cost as cache grows — no full scan.',
        'O(n): cost proportional to cache size — e.g. scan all keys.',
      ],
    },
    {
      title: 'Real-world usage',
      body: 'Replacement policies appear wherever a small fast tier sits in front of a slower one. Production systems often blend recency and frequency rather than pure LFU alone — but the same vocabulary applies.',
      list: [
        'Databases — buffer pools keep hot pages in RAM; eviction hits query latency.',
        'CDNs / edge caches — popular objects stay near users; policy shapes hit rate.',
        'Web — HTTP caches (browser, reverse proxy) bound memory while reusing responses.',
        'Operating systems — page cache, memory hierarchies; hardware and software eviction under fixed budgets.',
      ],
    },
    {
      title: 'Key takeaways',
      body: 'Short recap of the main ideas covered above.',
      list: [
        'Cache = fast tier, fixed size; policy picks the eviction victim.',
        'LFU = evict least frequent; ties → LRU inside that frequency.',
        'LRU = evict stalest last access — different objective.',
        'FIFO = evict oldest by admission order — simple queue rule; used as a benchmark baseline here.',
        'O(1) = hash map + per-frequency doubly linked lists; no global scan.',
        'Same ideas as DB pools, CDNs, HTTP caches, OS memory layers.',
      ],
    },
  ],
};

const sq: TheoryBundle = {
  title: 'Memoria përkohëse LFU',
  subtitle:
    'Nga bazat e cache-it te LFU O(1), plus LRU dhe FIFO si politika krahasimi — i njëjti tresh në laboratorin e benchmark-ut.',
  sections: [
    {
      title: 'Hyrje — çfarë është caching-u?',
      body: 'Cache është një depo e shpejtë dhe e kufizuar që pasqyron një pjesë të të dhënave që jetojnë më tej në një depo më të ngadaltë (disk, rrjet ose RAM më e madhe). Kërkimi provon së pari cache-in që akseset e përsëritura të mos paguajnë çdo herë “rrugën e ngadaltë”. Kur cache-i mbushet, futja e një elementi të ri kërkon dëbim — politika përcakton cilin element ekzistues heq. Me fjalë të thjeshta: raft i vogël pranë magazine së madhe; në raft ka pak vend; rregulli i dëbimit përgjigjet: “cila kuti kthehet në magazine kur më duhet vend?”',
    },
    {
      title: 'Çfarë është LFU (Least Frequently Used)?',
      body: 'LFU dëbon çelësin me frekuencën më të ulët të aksesit midis atyre që janë aktualisht në cache. Operacionet e suksesshme (zakonisht PUT dhe GET hit) rrisin numëruesin e atij çelësi. Nën presion kapaciteti, viktima është çelësi me frekuencën minimale.',
      list: [
        'PUT mbi një çelës (futje ose përditësim) rrit frekuencën e tij.',
        'GET hit rrit frekuencën; GET miss nuk ndryshon cache-in.',
        'Barazim në frekuencën minimale: zgjidhet me LRU brenda bucket-it — largohet më pak i përdoruri së fundmi midis të barazuarve.',
      ],
    },
    {
      title: 'LFU kundrejt LRU — krahasim',
      body: 'LRU shikon vetëm kohën: dëbon atë që nuk është prekur më gjatë. LFU shikon numërimin: dëbon atë që është prekur më pak herë në total. “Një herë dhe u largua” mund të mbijetojë më gjatë me LRU; çelësat e qëndrueshëm të nxehtë favorizohen nga LFU. Asnjë politikë nuk fiton çdo ngarkesë — trafiku i orientuar nga “e fundit” përshtatet me LRU; popullariteti i qëndrueshëm me LFU.',
      codeBlock: [
        'LFU: jashtë frekuenca minimale; barazim → LRU në atë frekuencë.',
        'LRU: jashtë koha më e vjetër e aksesit të fundit — frekuenca injorohet.',
      ],
    },
    {
      title: 'FIFO (First In First Out)',
      body: 'FIFO dëbon çelësin që është futur më herët në cache — radhë: i pari që hyn, i pari që del kur duhet vend. Nuk përdor frekuencën e akseseve (si LFU) as “koha nga prekja e fundit” si rregull kryesor (si LRU). Është i thjeshtë, i parashikueshëm dhe një bazë standarde mësimore. Në ngarkesa me “çelësa të nxehtë” ose shpërndarje të skewed, LFU o LRU shpesh japin hit rate më të mirë; FIFO mbetet pikë referimi e qartë.',
      list: [
        'Kur cache-i është plot, viktima është çelësi më i vjetër sipas radhës së futjes (fillimi i radhës).',
        'Benchmark-u në këtë app riluan të njëjtën ngarkesë të rastësishme mbi LFU, LRU dhe FIFO njëkohësisht — dallimet vijnë vetëm nga politika.',
        'FIFO haset edhe në rrjedha reale (p.sh. radhë me kufi, disa buffer rrjeti); më rrallë si politika kryesore e zëvendësimit të faqeve se LRU, por ideja është e përhapur.',
      ],
      codeBlock: ['FIFO: “Çelësi që u fut i pari del i pari kur na duhet një vend.”'],
    },
    {
      title: 'Strukturat e të dhënave — pse get dhe put janë O(1)',
      body: 'Skanimi i të gjithë çelësave çdo herë do ishte O(n). Në vend të kësaj: një hartë hash jep çelës → nyjë në O(1) të pritur. Çdo frekuencë e dallueshme lidhet me një listë të dyfishtë nyjash me atë numër; brenda listës, rendi është LRU. Një prekje zhvendos nyjen në listën e frekuencës tjetër ose e rirendit brenda së njëjtës — punë konstante me pointerë. Nyjet sentinel (kokë/fund) e standardizojnë futjen dhe heqjen.',
      list: [
        'Hartë hash: kërcim i drejtpërdrejtë te nyja e çelësit.',
        'Grupet e frekuencës: lista të dyfishta, rend LRU brenda çdo grupi.',
        'Dëbim: frekuenca më e vogël jo-bosh; merret skaji LRU — kurrë skanim i të gjithë cache-it.',
      ],
      afterList:
        'Bucket-et e frekuencës në vizualizues pasqyrojnë të njëjtën logjikë: e njëjta frekuencë → i njëjti grup; kandidati për dëbim → LRU brenda grupit minimal.',
      pre: `freq=1: [A, B]
freq=2: [C]

Dëbim → B   (LRU brenda freq=1)`,
    },
    {
      title: 'Notacioni asimptotik — çfarë do të thotë O(1)?',
      body: 'Big-O përshkruan si rritet kostoja me madhësinë n të problemit — këtu, afërsisht numri i çelësave në cache. O(1) do të thotë se çdo GET ose PUT kryen një numër të kufizuar hapash (kërkime në mapë, disa përditësime lidhjesh); kostoja nuk shkallëzohet linearisht me n. O(n) do të thotë prekje e çdo hyrjeje, p.sh. skanim i plotë për të zgjedhur viktimën.',
      codeBlock: [
        'O(1): kosto e sheshtë kur cache rritet — pa skanim të plotë.',
        'O(n): kosto që rritet me madhësinë e cache-it — p.sh. skanim linear.',
      ],
    },
    {
      title: 'Përdorimi në botën reale',
      body: 'Politikat e zëvendësimit shfaqen kudo ku një shtresë e shpejtë dhe e vogël qëndron përpara një të ngadaltë. Në prodhim shpesh përdoren hibride recency + frequency — por fjalori është i njëjti.',
      list: [
        'Baza të dhënash — buffer pools mbajnë faqe të nxehtë në RAM; dëbimi ndikon në vonesë.',
        'CDN / cache në skaj — objektet popullore afër përdoruesve; politika formon hit rate.',
        'Web — cache HTTP (shfletues, proxy përmbys) kufizon memoren dhe ripërdor përgjigjet.',
        'Sisteme operativë — cache faqesh, hierarki memorie; dëbim harduerik/softuerik me buxhet fiks.',
      ],
    },
    {
      title: 'Pikat kryesore',
      body: 'Përmbledhje e shkurtër e ideve kryesore të trajtuara më sipër.',
      list: [
        'Cache = shtresë e shpejtë, madhësi fiks; politika zgjedh viktimën e dëbimit.',
        'LFU = dëbon më pak të frekuentuarin; barazimet → LRU brenda asaj frekuence.',
        'LRU = dëbon sipas kohës së fundit të aksesit — objektiv tjetër.',
        'FIFO = dëbon sipas radhës së futjes — rregull i thjeshtë radhe; përdoret si bazë krahasimi në benchmark.',
        'O(1) = hartë hash + lista të dyfishta për frekuencë; pa skanim global.',
        'E njëjta logjikë si në pishina buffer DB, CDN, cache HTTP, shtresa memorie në OS.',
      ],
    },
  ],
};

export function getTheory(locale: Locale): TheoryBundle {
  return locale === 'sq' ? sq : en;
}
