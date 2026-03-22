/**
 * Node for the doubly linked list used in LFU Cache.
 * Each node stores a cache entry with key, value, and access frequency.
 *
 * The doubly linked list provides O(1) add/remove when we have a reference to the node.
 * LRU ordering within each frequency level: head = most recent, tail = least recent.
 */
export class Node {
  key: number;
  value: number;
  freq: number;
  prev: Node | null;
  next: Node | null;

  constructor(key: number, value: number, freq: number = 1) {
    this.key = key;
    this.value = value;
    this.freq = freq;
    this.prev = null;
    this.next = null;
  }
}
