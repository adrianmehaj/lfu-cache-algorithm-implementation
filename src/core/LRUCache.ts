/**
 * LRU Cache — O(1) get and put. Used for benchmark comparison.
 */
interface LRUNode { key: number; value: number; prev: LRUNode | null; next: LRUNode | null }

export class LRUCache {
  private cap: number;
  private map = new Map<number, LRUNode>();
  private head: LRUNode;
  private tail: LRUNode;

  constructor(capacity: number) {
    this.cap = capacity;
    this.head = { key: -1, value: -1, prev: null, next: null };
    this.tail = { key: -1, value: -1, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    const n = this.map.get(key);
    if (!n) return -1;
    this.detach(n);
    this.prepend(n);
    return n.value;
  }

  put(key: number, value: number): void {
    if (this.cap === 0) return;
    const existing = this.map.get(key);
    if (existing) { existing.value = value; this.detach(existing); this.prepend(existing); return; }
    if (this.map.size === this.cap) { const lru = this.tail.prev!; this.detach(lru); this.map.delete(lru.key); }
    const n: LRUNode = { key, value, prev: null, next: null };
    this.prepend(n);
    this.map.set(key, n);
  }

  private detach(n: LRUNode) { n.prev!.next = n.next; n.next!.prev = n.prev; }
  private prepend(n: LRUNode) { n.prev = this.head; n.next = this.head.next!; this.head.next!.prev = n; this.head.next = n; }
}
