/**
 * FIFO Cache — O(1) get/put via doubly linked list + hash map.
 * Used for benchmark comparison.
 */

interface FIFONode {
  key: number;
  value: number;
  prev: FIFONode | null;
  next: FIFONode | null;
}

export class FIFOCache {
  private cap: number;
  private map = new Map<number, FIFONode>();
  private head: FIFONode;
  private tail: FIFONode;

  constructor(capacity: number) {
    this.cap = capacity;
    this.head = { key: -1, value: -1, prev: null, next: null };
    this.tail = { key: -1, value: -1, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    return this.map.get(key)?.value ?? -1;
  }

  put(key: number, value: number): void {
    if (this.cap === 0) return;
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      return;
    }
    if (this.map.size === this.cap) {
      const oldest = this.head.next!;
      this.detach(oldest);
      this.map.delete(oldest.key);
    }
    const n: FIFONode = { key, value, prev: null, next: null };
    this.append(n);
    this.map.set(key, n);
  }

  private detach(n: FIFONode): void {
    n.prev!.next = n.next;
    n.next!.prev = n.prev;
  }

  private append(n: FIFONode): void {
    n.prev = this.tail.prev;
    n.next = this.tail;
    this.tail.prev!.next = n;
    this.tail.prev = n;
  }
}
