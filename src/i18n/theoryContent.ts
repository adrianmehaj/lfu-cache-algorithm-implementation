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
    'From caching basics to O(1) LFU, with LRU and FIFO as comparison policies. This app’s visualiser reflects the structure below; the benchmark lab runs identical synthetic workloads through LFU, LRU, and FIFO so measured differences isolate the replacement rule.',
  sections: [
    {
      title: 'Introduction — what is caching?',
      body: 'A cache is a fast, capacity-limited store that mirrors a subset of data held in a slower backing store (disk, network, or larger RAM). Lookups try the cache first so repeated accesses avoid the full slow-path cost. When the cache is full, admitting a new item forces an eviction: a policy chooses which resident entry to remove. Common policies such as LFU and LRU are heuristics — they do not foresee future requests; they approximate likely reuse from past accesses (counts or recency) and pick a victim when space is needed. In plain terms: a small shelf beside a huge warehouse. Only a few boxes fit on the shelf; the eviction rule answers “which box goes back to storage when I need space?”',
    },
    {
      title: 'What is LFU (Least Frequently Used)?',
      body: 'LFU is a heuristic that evicts the key with the lowest access frequency among keys currently in the cache. Successful operations (typically PUT and GET hit) bump that key’s counter. Under capacity pressure, the victim is a minimum-frequency key.',
      list: [
        'PUT on a key (insert or update) increases its frequency.',
        'GET hit increases frequency; GET miss does not alter the cache.',
        'Tie on minimum frequency: break with LRU inside that frequency bucket — remove the least recently used among the tied keys.',
      ],
    },
    {
      title: 'LFU vs LRU — comparison',
      body: 'LFU and LRU are both heuristic strategies: each compresses history into a simple score and uses it to guess which key is least worth keeping. LRU uses only recency — evict the key whose last access is oldest. LFU uses total access counts — evict the least frequently used key. “One-hit wonders” can linger under LRU; steadily popular keys are favoured by LFU. No policy is optimal for every workload: recency-heavy traffic often suits LRU; stable popularity often suits LFU.',
      codeBlock: [
        'LFU: minimum frequency out; ties → LRU within that frequency.',
        'LRU: oldest last-access time out — frequency ignored.',
      ],
    },
    {
      title: 'FIFO (First In First Out)',
      body: 'FIFO evicts the key admitted earliest — a queue: first in, first out when a slot is needed. It ignores access frequency (unlike LFU) and does not use last-access time as its primary rule (unlike LRU). It is simple, predictable, and a standard baseline. On skewed or hot-set workloads, LFU or LRU often achieve better hit rates; FIFO remains a clear reference for comparison.',
      list: [
        'When the cache is full, the victim is the oldest key by insertion order (front of the queue).',
        'The benchmark tab replays one generated workload through LFU, LRU, and FIFO so timing and access patterns match; only the replacement policy changes.',
        'FIFO appears in real pipelines too (e.g. bounded queues, some network buffers) — less often as the main CPU/page replacement policy than LRU variants, but the idea is ubiquitous.',
      ],
      codeBlock: ['FIFO: “The key that entered first leaves first when we need a slot.”'],
    },
    {
      title: 'Data structures — how get and put stay O(1)',
      body: 'A full scan over keys would be O(n) per operation. The standard design combines two ideas. A hash map stores key → node pointer, so locating a key’s node is expected O(1) without enumerating the cache. Each frequency value maps to a doubly linked list of nodes at that count; within a list, order follows LRU (most recent near one end). A get or put touches only that node and its two lists — moving or unlinking via predecessor/successor pointers is O(1). Sentinel head/tail nodes keep insertion and removal uniform at list boundaries.',
      list: [
        'Hash map: O(1) expected lookup from key to node — no linear key scan.',
        'Per-frequency doubly linked lists: O(1) splice when frequency changes or order within the bucket updates.',
        'Eviction: read the lowest non-empty frequency bucket; remove the LRU end — still no global scan.',
      ],
      afterList:
        'The visualiser’s frequency buckets follow this model: same frequency → same bucket; eviction candidate → LRU tail within the minimum-frequency bucket.',
      pre: `Example (MRU ··· LRU within each bucket):

  freq 1 :  [ A ··· B ]
  freq 2 :  [ C ]

  Evict → B   (LRU within minimum frequency)`,
    },
    {
      title: 'Big-O notation — what does O(1) mean?',
      body: 'Big-O describes how work grows with problem size n — here, roughly the number of keys in the cache. O(1) means each GET or PUT performs a bounded number of steps (hash map probe, a constant number of pointer updates); cost does not grow linearly with n. O(n) would mean visiting every entry, e.g. scanning all keys to choose a victim.',
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
        'Cache = fast tier, fixed size; the policy selects the eviction victim.',
        'LFU and LRU are heuristics: they infer future value from past accesses (counts vs recency), not from perfect foresight.',
        'LFU = evict least frequent; ties → LRU inside that frequency.',
        'LRU = evict by oldest last access — a different objective.',
        'FIFO = evict oldest by admission order — simple queue; baseline in the benchmark lab.',
        'O(1) operations = hash map for key lookup + doubly linked lists per frequency; no full-cache scan.',
        'Same ideas underpin DB buffer pools, CDNs, HTTP caches, and OS memory hierarchies.',
      ],
    },
  ],
};

const sq: TheoryBundle = {
  title: 'Memoria përkohëse LFU',
  subtitle:
    'Nga bazat e cache-it te LFU O(1), me LRU dhe FIFO si politika krahasimi. Vizualizuesi në këtë aplikacion pasqyron strukturën më poshtë; laboratori i benchmark-ut ekzekuton të njëjtat ngarkesa të simuluara mbi LFU, LRU dhe FIFO, që dallimet të izolojnë vetëm rregullin e zëvendësimit.',
  sections: [
    {
      title: 'Hyrje — çfarë është caching-u?',
      body: 'Cache është një depo e shpejtë dhe e kufizuar që pasqyron një pjesë të të dhënave në një depo më të ngadaltë (disk, rrjet ose RAM më e madhe). Kërkimet provojnë së pari cache-in që akseset e përsëritura të shmangin “rrugën e ngadaltë”. Kur cache-i mbushet, futja e një elementi të ri kërkon dëbim: politika zgjedh cilin element ekzistues heq. Politika të zakonshme si LFU dhe LRU janë strategji heuristike — nuk parashikojnë kërkesat e ardhshme; aproksimojnë ripërdorimin e mundshëm nga akseset e kaluara (numërim ose freski kohore) dhe zgjedhin viktimën kur duhet vend. Me fjalë të thjeshta: raft i vogël pranë magazine së madhe; në raft ka pak vend; rregulli i dëbimit përgjigjet: “cila kuti kthehet në magazine kur më duhet vend?”',
    },
    {
      title: 'Çfarë është LFU (Least Frequently Used)?',
      body: 'LFU është një heuristikë që dëbon çelësin me frekuencën më të ulët të aksesit midis atyre në cache. Operacionet e suksesshme (zakonisht PUT dhe GET hit) rrisin numëruesin e atij çelësi. Nën presion kapaciteti, viktima është një çelës me frekuencë minimale.',
      list: [
        'PUT mbi një çelës (futje ose përditësim) rrit frekuencën e tij.',
        'GET hit rrit frekuencën; GET miss nuk ndryshon cache-in.',
        'Barazim në frekuencën minimale: zgjidhet me LRU brenda bucket-it — largohet më pak i përdoruri së fundmi midis të barazuarve.',
      ],
    },
    {
      title: 'LFU kundrejt LRU — krahasim',
      body: 'LFU dhe LRU janë të dyja strategji heuristike: secila përmbledh historikun në një “rezultat” të thjeshtë dhe përdor atë për të hamendësuar cilin çelës vlen më pak të mbajë. LRU përdor vetëm freskinë kohore — dëbon çelësin me aksesin e fundit më të vjetër. LFU përdor numrin e akseseve — dëbon më pak të frekuentuarin. “Një herë dhe u largua” mund të mbijetojë më gjatë me LRU; çelësat e qëndrueshëm të nxehtë favorizohen nga LFU. Asnjë politikë nuk është optimale për çdo ngarkesë: trafiku me theks te “e fundit” shpesh përshtatet me LRU; popullariteti i qëndrueshëm shpesh me LFU.',
      codeBlock: [
        'LFU: jashtë frekuenca minimale; barazim → LRU në atë frekuencë.',
        'LRU: jashtë koha më e vjetër e aksesit të fundit — frekuenca injorohet.',
      ],
    },
    {
      title: 'FIFO (First In First Out)',
      body: 'FIFO dëbon çelësin e futur më herët — radhë: i pari që hyn, i pari që del kur duhet një vend. Injoron frekuencën e akseseve (si LFU) dhe nuk përdor kohën e aksesit të fundit si rregull kryesor (si LRU). Është i thjeshtë, i parashikueshëm dhe një bazë standarde krahasimi. Në ngarkesa të përqendruara te disa çelësa, LFU o LRU shpesh japin hit rate më të mirë; FIFO mbetet referencë e qartë.',
      list: [
        'Kur cache-i është plot, viktima është çelësi më i vjetër sipas radhës së futjes (fillimi i radhës).',
        'Faqja e benchmark-ut riluan një të njëjtën ngarkesë të gjeneruar mbi LFU, LRU dhe FIFO — modeli i aksesit përputhet; ndryshon vetëm politika e zëvendësimit.',
        'FIFO haset edhe në rrjedha reale (p.sh. radhë me kufi, disa buffer rrjeti); më rrallë si politika kryesore e zëvendësimit të faqeve se LRU, por ideja është e përhapur.',
      ],
      codeBlock: ['FIFO: “Çelësi që u fut i pari del i pari kur na duhet një vend.”'],
    },
    {
      title: 'Strukturat e të dhënave — pse get dhe put janë O(1)',
      body: 'Skanimi linear i çdo çelësi do ishte O(n) për operacion. Dizajni standard kombinon dy ide. Një hartë hash mban çelës → tregues te nyja, kështu gjetja e nyjes për një çelës është O(1) e pritur pa enumeruar cache-in. Çdo vlerë frekuence lidhet me një listë të dyfishtë nyjash me atë numër; brenda listës rendi ndjek LRU (më i freskëti afër një skaji). Një get ose put prek vetëm atë nyje dhe dy lista — zhvendosja ose shkëputja me paraardhës/pasardhës është O(1). Nyjet sentinel (kokë/fund) e njësojnë futjen dhe heqjen në kufijtë e listës.',
      list: [
        'Hartë hash: O(1) e pritur për kërkimin çelës → nyje — pa skanim linear të çelësave.',
        'Lista të dyfishta për frekuencë: O(1) për bashkim/shkëput kur ndryshon frekuenca ose rendi brenda bucket-it.',
        'Dëbim: lexo bucket-in me frekuencën më të ulët jo-bosh; hiq skajin LRU — ende pa skanim global.',
      ],
      afterList:
        'Bucket-et e frekuencës në vizualizues pasqyrojnë të njëjtën logjikë: e njëjta frekuencë → i njëjti grup; kandidati për dëbim → skaji LRU në bucket-in me frekuencë minimale.',
      pre: `Shembull (MRU ··· LRU brenda çdo bucket-i):

  freq 1 :  [ A ··· B ]
  freq 2 :  [ C ]

  Dëbim → B   (LRU në frekuencën minimale)`,
    },
    {
      title: 'Notacioni asimptotik — çfarë do të thotë O(1)?',
      body: 'Big-O përshkruan si rritet kostoja me madhësinë n — këtu, afërsisht numri i çelësave në cache. O(1) do të thotë se çdo GET ose PUT kryen një numër të kufizuar hapash (provë në hartën hash, disa përditësime pointerësh); kostoja nuk rritet linearisht me n. O(n) do të thotë vizitim i çdo hyrjeje, p.sh. skanim i plotë për të zgjedhur viktimën.',
      codeBlock: [
        'O(1): kosto e sheshtë kur cache rritet — pa skanim të plotë.',
        'O(n): kosto që rritet me madhësinë e cache-it — p.sh. skanim linear.',
      ],
    },
    {
      title: 'Përdorimi në botën reale',
      body: 'Politikat e zëvendësimit shfaqen kudo ku një shtresë e shpejtë dhe e vogël qëndron përpara një të ngadaltë. Në prodhim shpesh përdoren hibride freski + frekuencë në vend të LFU-së së pastër; i njëjti fjalor mbetet i vlefshëm.',
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
        'LFU dhe LRU janë heuristika: nxjerrin vlerën e ardhshme nga akseset e kaluara (numër vs freski), jo nga parashikim i përkryer.',
        'LFU = dëbon më pak të frekuentuarin; barazimet → LRU brenda asaj frekuence.',
        'LRU = dëbon sipas kohës së fundit të aksesit — objektiv tjetër.',
        'FIFO = dëbon sipas radhës së futjes — radhë e thjeshtë; bazë krahasimi në laboratorin e benchmark-ut.',
        'O(1) = hartë hash për gjetjen e çelësit + lista të dyfishta për frekuencë; pa skanim të plotë të cache-it.',
        'E njëjta logjikë si në pishinat buffer të DB, CDN, cache HTTP dhe hierarkinë e memories në OS.',
      ],
    },
  ],
};

export function getTheory(locale: Locale): TheoryBundle {
  return locale === 'sq' ? sq : en;
}
