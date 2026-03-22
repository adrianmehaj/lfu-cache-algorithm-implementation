import { Node } from './Node';
import { DoublyLinkedList } from './DoublyLinkedList';

/**
 * LFU (Least Frequently Used) Cache with O(1) get and put.
 *
 * Eviction policy:
 * 1. Evict the key with the smallest frequency.
 * 2. If multiple keys have the same frequency, evict the least recently used (LRU).
 *
 * Data structures:
 * - keyTable: Map<key, Node> - O(1) lookup by key
 * - freqTable: Map<frequency, DoublyLinkedList> - O(1) access to frequency lists
 * - Each frequency list maintains LRU order (head = MRU, tail = LRU)
 */
export class LFUCache {
  readonly capacity: number;
  size: number;
  minFreq: number;
  private keyTable: Map<number, Node>;
  private freqTable: Map<number, DoublyLinkedList>;
  /** Track last evicted key for UI highlighting */
  lastEvictedKey: number | null = null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.size = 0;
    this.minFreq = 0;
    this.keyTable = new Map();
    this.freqTable = new Map();
  }

  /**
   * O(1) get: Returns value if key exists, -1 otherwise.
   * On access, increases frequency and moves node to the new frequency list.
   */
  get(key: number): number {
    const node = this.keyTable.get(key);
    if (node == null) return -1;
    this.updateFrequency(node);
    return node.value;
  }

  /**
   * O(1) put: Inserts or updates key-value pair.
   * Evicts LRU among minFreq keys when cache is full.
   */
  put(key: number, value: number): void {
    if (this.capacity === 0) return;

    this.lastEvictedKey = null;

    const existing = this.keyTable.get(key);
    if (existing != null) {
      existing.value = value;
      this.updateFrequency(existing);
      return;
    }

    if (this.size === this.capacity) {
      const list = this.freqTable.get(this.minFreq)!;
      const evicted = list.removeLast();
      if (evicted != null) {
        this.keyTable.delete(evicted.key);
        this.lastEvictedKey = evicted.key;
        this.size--;
      }
    }

    const node = new Node(key, value, 1);
    this.keyTable.set(key, node);
    this.ensureFreqList(1).addFirst(node);
    this.minFreq = 1;
    this.size++;
  }

  /**
   * When a node is accessed:
   * 1. Remove from old frequency list
   * 2. If old list is empty and was minFreq, increment minFreq
   * 3. Increment node frequency
   * 4. Add to new frequency list (front = MRU)
   */
  private updateFrequency(node: Node): void {
    const oldFreq = node.freq;
    const list = this.freqTable.get(oldFreq)!;
    list.remove(node);

    if (list.isEmpty()) {
      this.freqTable.delete(oldFreq);
      if (oldFreq === this.minFreq) {
        this.minFreq = oldFreq + 1;
      }
    }

    node.freq = oldFreq + 1;
    this.ensureFreqList(node.freq).addFirst(node);
  }

  /** Gets or creates the doubly linked list for a given frequency. */
  private ensureFreqList(freq: number): DoublyLinkedList {
    let list = this.freqTable.get(freq);
    if (list == null) {
      list = new DoublyLinkedList();
      this.freqTable.set(freq, list);
    }
    return list;
  }

  /** Returns a snapshot of cache state for UI visualization. */
  getStateSnapshot(): {
    capacity: number;
    size: number;
    minFreq: number;
    freqToKeys: Map<number, number[]>;
    lastEvictedKey: number | null;
  } {
    const freqToKeys = new Map<number, number[]>();
    for (const [freq, list] of this.freqTable.entries()) {
      const keys = list.getKeys();
      if (keys.length > 0) {
        freqToKeys.set(freq, keys);
      }
    }
    return {
      capacity: this.capacity,
      size: this.size,
      minFreq: this.minFreq,
      freqToKeys,
      lastEvictedKey: this.lastEvictedKey,
    };
  }

  /** Resets the cache to empty state. */
  reset(): void {
    this.size = 0;
    this.minFreq = 0;
    this.keyTable.clear();
    this.freqTable.clear();
    this.lastEvictedKey = null;
  }
}
