
export class LFUNode {
  key:   number;
  value: number;
  freq:  number;
  prev:  LFUNode | null = null;
  next:  LFUNode | null = null;

  constructor(key: number, value: number, freq = 1) {
    this.key   = key;
    this.value = value;
    this.freq  = freq;
  }
}


// ─── 2. FreqBucket (lista e dyfishtë e lidhur) ───────────────────────────────

export class FreqBucket {
  private head: LFUNode;
  private tail: LFUNode;

  constructor() {
    // Sentinel nodes — nuk mbajnë të dhëna reale, thjeshtojnë operacionet
    this.head      = new LFUNode(-1, -1, -1);
    this.tail      = new LFUNode(-1, -1, -1);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /** Shto nyjen menjëherë pas head (pozicioni MRU). O(1). */
  addFirst(node: LFUNode): void {
    node.prev            = this.head;
    node.next            = this.head.next!;
    this.head.next!.prev = node;
    this.head.next       = node;
  }

  /** Hiq nyjen nga lista. O(1). */
  remove(node: LFUNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  /** Hiq dhe kthe tail.prev (LRU — i aksesuar më rrallë). O(1). */
  removeLast(): LFUNode | null {
    if (this.isEmpty()) return null;
    const node = this.tail.prev!;
    this.remove(node);
    return node;
  }

  /** Lista është bosh kur head dhe tail janë drejtpërdrejt të lidhur. */
  isEmpty(): boolean {
    return this.head.next === this.tail;
  }

  /** Snapshot MRU→LRU. Përdoret vetëm për vizualizim. */
  toArray(): Array<{ key: number; value: number; freq: number }> {
    const result: Array<{ key: number; value: number; freq: number }> = [];
    let curr = this.head.next;
    while (curr && curr !== this.tail) {
      result.push({ key: curr.key, value: curr.value, freq: curr.freq });
      curr = curr.next;
    }
    return result;
  }
}


// ─── 3. LFUCache ─────────────────────────────────────────────────────────────

export class LFUCache {
  capacity: number;
  size     = 0;
  minFreq  = 0;
  private keyMap  = new Map<number, LFUNode>();
  private freqMap = new Map<number, FreqBucket>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  // ── get ──────────────────────────────────────────────────────────────────

  has(key: number): boolean {
    return this.keyMap.has(key);
  }

  get(key: number): number {
    const node = this.keyMap.get(key);
    if (!node) return -1;
    this.touch(node);
    return node.value;
  }

  // ── put ──────────────────────────────────────────────────────────────────

  put(key: number, value: number): { evicted?: { key: number; value: number } } {
    if (this.capacity === 0) return {};

    // Çelësi ekziston — përditëso vlerën dhe rrit frekuencën
    const existing = this.keyMap.get(key);
    if (existing) {
      existing.value = value;
      this.touch(existing);
      return {};
    }

    // Memoria plot — dëbo LRU nga lista e minFreq
    let evictedInfo: { key: number; value: number } | undefined;
    if (this.size === this.capacity) {
      const list    = this.freqMap.get(this.minFreq)!;
      const evicted = list.removeLast()!;
      evictedInfo   = { key: evicted.key, value: evicted.value };
      this.keyMap.delete(evicted.key);
      this.size--;
    }

    // Shto elementin e ri me frekuencë 1
    const node = new LFUNode(key, value, 1);
    this.keyMap.set(key, node);
    this.getList(1).addFirst(node);
    this.minFreq = 1;
    this.size++;
    return { evicted: evictedInfo };
  }

  // ── Ndihmës: rrit frekuencën dhe zhvendos nyjen ──────────────────────────

  private touch(node: LFUNode): void {
    const oldFreq = node.freq;
    const list    = this.freqMap.get(oldFreq)!;
    list.remove(node);

    if (list.isEmpty()) {
      this.freqMap.delete(oldFreq);
      if (oldFreq === this.minFreq) this.minFreq++;
    }

    node.freq++;
    this.getList(node.freq).addFirst(node);
  }

  // ── Ndihmës: merr ose krijo listën e një frekuence ───────────────────────

  private getList(freq: number): FreqBucket {
    if (!this.freqMap.has(freq)) {
      this.freqMap.set(freq, new FreqBucket());
    }
    return this.freqMap.get(freq)!;
  }

  // ── Snapshot për vizualizim ───────────────────────────────────────────────

  getState() {
    const freqBuckets: Array<{
      freq:  number;
      nodes: Array<{ key: number; value: number; freq: number }>;
    }> = [];

    const sortedFreqs = Array.from(this.freqMap.keys()).sort((a, b) => a - b);
    for (const freq of sortedFreqs) {
      const nodes = this.freqMap.get(freq)!.toArray();
      if (nodes.length > 0) freqBuckets.push({ freq, nodes });
    }

    return {
      size:        this.size,
      capacity:    this.capacity,
      minFreq:     this.minFreq,
      freqBuckets,
    };
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  reset(newCapacity?: number): void {
    if (newCapacity != null) this.capacity = newCapacity;
    this.size    = 0;
    this.minFreq = 0;
    this.keyMap.clear();
    this.freqMap.clear();
  }
}
