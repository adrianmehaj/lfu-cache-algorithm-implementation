import { Node } from './Node';
import { DoublyLinkedList } from './DoublyLinkedList';

/**
 * LFU Cache — O(1) get and put.
 * Matches LeetCode 460 specification exactly.
 *
 * Eviction: remove least-frequency key; ties broken by LRU.
 * Data structures: HashMap<key,Node> + HashMap<freq,DoublyLinkedList>.
 */
export class LFUCache {
  capacity: number;
  size = 0;
  minFreq = 0;
  private keyMap = new Map<number, Node>();
  private freqMap = new Map<number, DoublyLinkedList>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    const node = this.keyMap.get(key);
    if (!node) return -1;
    this.touch(node);
    return node.value;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;

    const existing = this.keyMap.get(key);
    if (existing) {
      existing.value = value;
      this.touch(existing);
      return;
    }

    if (this.size === this.capacity) {
      const list = this.freqMap.get(this.minFreq)!;
      const evicted = list.removeLast()!;
      this.keyMap.delete(evicted.key);
      this.size--;
    }

    const node = new Node(key, value, 1);
    this.keyMap.set(key, node);
    this.getList(1).addFirst(node);
    this.minFreq = 1;
    this.size++;
  }

  /** Promote node: remove from old freq list, add to freq+1 list. */
  private touch(node: Node): void {
    const oldFreq = node.freq;
    const list = this.freqMap.get(oldFreq)!;
    list.remove(node);

    if (list.isEmpty()) {
      this.freqMap.delete(oldFreq);
      if (oldFreq === this.minFreq) this.minFreq++;
    }

    node.freq++;
    this.getList(node.freq).addFirst(node);
  }

  private getList(freq: number): DoublyLinkedList {
    let list = this.freqMap.get(freq);
    if (!list) {
      list = new DoublyLinkedList();
      this.freqMap.set(freq, list);
    }
    return list;
  }

  /** Raw state for external consumption (visualization, tests). */
  getState() {
    const freqBuckets: Array<{ freq: number; nodes: Array<{ key: number; value: number; freq: number }> }> = [];
    const sortedFreqs = Array.from(this.freqMap.keys()).sort((a, b) => a - b);
    for (const freq of sortedFreqs) {
      const nodes = this.freqMap.get(freq)!.toArray();
      if (nodes.length > 0) freqBuckets.push({ freq, nodes });
    }
    return { size: this.size, capacity: this.capacity, minFreq: this.minFreq, freqBuckets };
  }

  reset(newCapacity?: number): void {
    if (newCapacity != null) this.capacity = newCapacity;
    this.size = 0;
    this.minFreq = 0;
    this.keyMap.clear();
    this.freqMap.clear();
  }
}
