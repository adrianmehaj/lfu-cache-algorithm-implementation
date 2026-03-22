import { Node } from './Node';
import { DoublyLinkedList } from './DoublyLinkedList';
import type {
  CacheStateSnapshot,
  HighlightState,
  CacheNodeSnapshot,
  FrequencyBucketSnapshot,
} from '../types/cache.types';

export type PutAction = 'insert' | 'update' | 'evict_then_insert';
export interface PutResult {
  evictedKey: number | null;
  action: PutAction;
}

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
  capacity: number;
  size: number;
  minFreq: number;
  private keyTable: Map<number, Node>;
  private freqTable: Map<number, DoublyLinkedList>;

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
   * Returns put result for logging and UI.
   */
  put(key: number, value: number): PutResult {
    if (this.capacity === 0) {
      return { evictedKey: null, action: 'update' };
    }

    const existing = this.keyTable.get(key);
    if (existing != null) {
      existing.value = value;
      this.updateFrequency(existing);
      return { evictedKey: null, action: 'update' };
    }

    let evictedKey: number | null = null;
    if (this.size === this.capacity) {
      const list = this.freqTable.get(this.minFreq);
      if (list != null) {
        const evicted = list.removeLast();
        if (evicted != null) {
          this.keyTable.delete(evicted.key);
          evictedKey = evicted.key;
          this.size--;
        }
      }
    }

    const node = new Node(key, value, 1);
    this.keyTable.set(key, node);
    this.ensureFreqList(1).addFirst(node);
    this.minFreq = 1;
    this.size++;

    return {
      evictedKey,
      action: evictedKey != null ? 'evict_then_insert' : 'insert',
    };
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

  /**
   * Returns a UI-friendly snapshot of actual internal state.
   * Does not mutate cache; safe to call after any operation.
   */
  snapshot(highlight: HighlightState = emptyHighlight()): CacheStateSnapshot {
    const entries: CacheNodeSnapshot[] = [];
    const freqBuckets: FrequencyBucketSnapshot[] = [];

    const sortedFreqs = Array.from(this.freqTable.keys()).sort((a, b) => a - b);

    for (const freq of sortedFreqs) {
      const list = this.freqTable.get(freq)!;
      const nodes = list.toArray();
      for (const n of nodes) {
        entries.push(n);
      }
      freqBuckets.push({
        freq,
        nodes,
        isMinFreq: freq === this.minFreq,
      });
    }

    return {
      capacity: this.capacity,
      size: this.size,
      minFreq: this.minFreq,
      entries,
      freqBuckets,
      highlight,
    };
  }

  /**
   * Resets cache to empty state.
   * If newCapacity is provided, updates capacity (for capacity changes).
   */
  reset(newCapacity?: number): void {
    if (newCapacity != null && newCapacity >= 0) {
      this.capacity = newCapacity;
    }
    this.size = 0;
    this.minFreq = 0;
    this.keyTable.clear();
    this.freqTable.clear();
  }
}

function emptyHighlight(): HighlightState {
  return {
    insertedKey: null,
    accessedKey: null,
    updatedKey: null,
    evictedKey: null,
  };
}
