/**
 * FIFO (First In First Out) Cache - O(1) get and put.
 * Evicts the oldest inserted item when full.
 */

export class FIFOCache {
  private capacity: number;
  private map = new Map<number, number>();
  private queue: number[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    return this.map.get(key) ?? -1;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;
    if (this.map.has(key)) {
      this.map.set(key, value);
      return;
    }
    if (this.map.size === this.capacity) {
      const oldest = this.queue.shift()!;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
    this.queue.push(key);
  }
}
