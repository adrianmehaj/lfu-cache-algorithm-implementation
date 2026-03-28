/**
 * Doubly linked list node for LFU Cache.
 * Stores key, value, access frequency, and prev/next pointers.
 */
export class Node {
  key: number;
  value: number;
  freq: number;
  prev: Node | null = null;
  next: Node | null = null;

  constructor(key: number, value: number, freq = 1) {
    this.key = key;
    this.value = value;
    this.freq = freq;
  }
}
