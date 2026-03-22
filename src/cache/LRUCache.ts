/**
 * LRU (Least Recently Used) Cache - O(1) get and put.
 * Evicts the least recently accessed item.
 */

interface LRUNode {
  key: number;
  value: number;
  prev: LRUNode | null;
  next: LRUNode | null;
}

export class LRUCache {
  private capacity: number;
  private map = new Map<number, LRUNode>();
  private head: LRUNode;
  private tail: LRUNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = { key: -1, value: -1, prev: null, next: null };
    this.tail = { key: -1, value: -1, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    const node = this.map.get(key);
    if (node == null) return -1;
    this.moveToFront(node);
    return node.value;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;
    const existing = this.map.get(key);
    if (existing != null) {
      existing.value = value;
      this.moveToFront(existing);
      return;
    }
    if (this.map.size === this.capacity) {
      const last = this.tail.prev!;
      this.remove(last);
      this.map.delete(last.key);
    }
    const node: LRUNode = { key, value, prev: this.head, next: this.head.next! };
    this.head.next!.prev = node;
    this.head.next = node;
    this.map.set(key, node);
  }

  private moveToFront(node: LRUNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    node.prev = this.head;
    node.next = this.head.next!;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private remove(node: LRUNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }
}
