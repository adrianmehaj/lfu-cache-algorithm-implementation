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
  title: 'LFU cache — theory',
  subtitle:
    'Plain language: cache, LFU vs LRU, how the data structure keeps each get/put fast, and a recap of what O(1) means.',
  sections: [
    {
      title: 'What is a cache?',
      body:
        'Think of a cache as a small shelf next to a large warehouse. You can only keep a few boxes on the shelf; the rest stay in the back. When you need something often, you want it on the shelf so you do not walk to the warehouse every time. When the shelf is full and you bring a new box, you must remove an old one. The replacement policy is simply the rule for which box goes back to storage.',
    },
    {
      title: 'What is LFU (Least Frequently Used)?',
      body:
        'LFU evicts the key that has been used the fewest times. The cache keeps a counter per key: each time you PUT that key or GET it successfully, the counter goes up. When the cache is full and a new key must be stored, the key with the smallest counter is removed. If several keys share that lowest count, the usual tie-break is LRU inside that group: remove the one that was touched longest ago among those tied keys.',
      list: [
        'PUT inserts or updates a key and increases its frequency.',
        'A GET that finds the key (a hit) increases its frequency; a miss does nothing to the cache.',
        'Eviction = drop the least frequent key; use LRU order only when counts are equal.',
      ],
    },
    {
      title: 'LFU vs LRU — intuition',
      body:
        'LRU only looks at the last time each key was used and evicts the one that has been idle the longest. LFU looks at how many times each key was used in total. A key you opened once yesterday might linger under LRU; LFU prefers to keep keys that were opened many times overall. Which policy is better depends on whether your traffic looks like “steady favorites” (LFU-friendly) or “always the latest thing” (LRU-friendly).',
      codeBlock: [
        'LFU: “Who has the smallest hit count? Remove that (ties → oldest in that group).”',
        'LRU: “Who was touched longest ago? Remove that.”',
      ],
    },
    {
      title: 'Why get and put can be O(1)',
      body:
        'The implementation does not scan all keys. A hash map stores key → node so you jump straight to any entry. Another structure maps each frequency to a doubly linked list of all keys that currently have that count; inside each list, order is LRU (most recently used at one end). Moving a key after an access means unlinking it from one list and linking it into another frequency list, or moving within the same list—only a few pointer updates.',
      list: [
        'Hash map: key → node in O(1).',
        'Per frequency: a doubly linked list of nodes with that count, in LRU order within the bucket.',
      ],
      afterList:
        'Dummy head and tail nodes (“sentinels”) make insert and remove predictable. To evict: use the smallest frequency that still has keys, then take the LRU side of that list—the same idea shown in this app’s frequency buckets.',
      pre: `freq=1: [head] ⇄ A ⇄ B ⇄ [tail]   ← evict B (LRU among count 1)
freq=2: [head] ⇄ C ⇄ [tail]`,
    },
    {
      title: 'What does O(1) mean?',
      body:
        'Big-O notation describes how the cost of one step grows when the input grows. Here the “input size” is roughly how many keys sit in the cache. O(1)—read “order 1” or constant time—means a single GET or PUT does about the same amount of work whether the cache holds 10 keys or 10,000: you do not loop over every key each time. By contrast, O(n) would mean the work grows with the number of keys n—for example, scanning the whole cache on every operation. A proper LFU design avoids that full scan by using hash maps and linked lists so each operation only touches a few links or buckets.',
      codeBlock: [
        'O(1): cost stays flat as the cache gets bigger (no full scan).',
        'O(n): cost grows with the number of keys (e.g. walk every entry).',
      ],
    },
  ],
};

const sq: TheoryBundle = {
  title: 'Memoria përkohëse LFU — teoria',
  subtitle:
    'Me fjalë të thjeshta: cache, LFU kundrejt LRU, si struktura e të dhënave e mban çdo get/put të shpejtë, dhe një përmbledhje: çfarë do të thotë O(1).',
  sections: [
    {
      title: 'Çfarë është një cache?',
      body:
        'Mendoje cache-in si një raft të vogël pranë një magazine të madhe. Në raft ke vend vetëm për pak kuti; pjesa tjetër është në fund. Kur të duhet shpesh e njëjta gjë, do ta mbash në raft që të mos shkosh në magazine sa herë. Kur rafti mbushet dhe sjell një kuti të re, duhet të heqësh një të vjetër. Politika e zëvendësimit është thjesht rregulli: cila kuti të largohet.',
    },
    {
      title: 'Çfarë është LFU (Least Frequently Used)?',
      body:
        'LFU heq çelësin që është përdorur më pak herë. Cache mban një numërues për çdo çelës: sa herë bën PUT për atë çelës ose GET dhe gjendet (hit), numëruesi rritet. Kur cache është plot dhe duhet të futet një çelës i ri, largohet ai me numrin më të vogël përdorimesh. Nëse disa kanë të njëjtin minimum, zakonisht përdoret barazimi LRU brenda atij grupi: largohet ai që nuk është prekur më gjatë midis atyre që janë baraz.',
      list: [
        'PUT fut ose përditëson një çelës dhe rrit frekuencën e tij.',
        'GET që e gjen çelësin (hit) rrit frekuencën; GET që nuk e gjen (miss) nuk ndryshon cache-in.',
        'Dëbim = heq çelësin më pak të frekuentuar; kur ka barazim përdoret rendi LRU në atë grup.',
      ],
    },
    {
      title: 'LFU dhe LRU — ideja',
      body:
        'LRU shikon vetëm herën e fundit që u prek çdo çelës dhe heq atë që ka qëndruar më gjatë pa u prekur. LFU shikon sa herë në total është përdorur çdo çelës. Një çelës që e hape një herë dje mund të mbetet më gjatë me LRU; LFU preferon të mbajë ata që janë hapur shumë herë në përgjithësi. Cila politikë është më e mirë varet nga ngarkesa: “të përhershmit e preferuar” (më mirë për LFU) apo “gjithmonë e fundit” (më mirë për LRU).',
      codeBlock: [
        'LFU: “Kush ka numrin më të vogël të përdorimeve? Heq ate (barazim → më i vjetri në grup).”',
        'LRU: “Kush nuk është prekur më gjatë? Heq ate.”',
      ],
    },
    {
      title: 'Pse get dhe put mund të jenë O(1)',
      body:
        'Implementimi nuk i kalon të gjithë çelësat. Një hartë hash mban çelës → nyjë, që të shkosh direkt te çdo element. Një strukturë tjetër lidh çdo frekuencë me një listë të dyfishtë të çelësave që kanë atë numër; brenda listës, rendi është LRU (më i freskëti nga një skaj). Pas një aksesi, nyja zhvendoset në listën e frekuencës së re ose brenda së njëjtës listë — vetëm disa lidhje pointerësh.',
      list: [
        'Hartë hash: çelësi → nyja në O(1).',
        'Për çdo frekuencë: listë e dyfishtë e nyjeve me atë numër, në rend LRU brenda grupit.',
      ],
      afterList:
        'Nyjet “sentinel” (kokë dhe fund fiktiv) e bëjnë futjen dhe heqjen të parashikueshme. Për dëbim: merr frekuencën më të ulët që ka ende elemente, pastaj anën LRU të asaj liste — e njëjta ide si te grupet e frekuencës në këtë aplikacion.',
      pre: `freq=1: [kokë] ⇄ A ⇄ B ⇄ [fund]   ← dëbim i B (LRU te frekuenca 1)
freq=2: [kokë] ⇄ C ⇄ [fund]`,
    },
    {
      title: 'Çfarë do të thotë O(1)?',
      body:
        'Shënimi “big-O” tregon se si rritet kostoja e një hapi kur rritet madhësia e problemit. Këtu “madhësia” është afërsisht sa çelësa ka në cache. O(1)—lexohet “rendi 1” ose kohë konstante—do të thotë se një GET ose një PUT bën afërsisht të njëjtën punë nëse cache ka 10 çelësa apo 10 000: nuk kalon të gjithë çelësat çdo herë. Ndërsa O(n) do të thotë se kostoja rritet me numrin e çelësave n—p.sh. kur duhet të shikosh çdo element në çdo veprim. Një LFU i mirë e shmang këtë skanim të plotë duke përdorur harta hash dhe lista të lidhura, që çdo veprim të prekë vetëm disa lidhje ose grupe.',
      codeBlock: [
        'O(1): kostoja mbetet e njëjtë kur cache rritet (pa skanim të plotë).',
        'O(n): kostoja rritet me numrin e çelësave (p.sh. kalon çdo hyrje).',
      ],
    },
  ],
};

export function getTheory(locale: Locale): TheoryBundle {
  return locale === 'sq' ? sq : en;
}
