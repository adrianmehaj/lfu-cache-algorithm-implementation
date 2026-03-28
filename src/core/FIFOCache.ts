/**
 * FIFO Cache — O(1) get/put. Used for benchmark comparison.
 */
export class FIFOCache {
  private cap: number;
  private map = new Map<number, number>();
  private queue: number[] = [];

  constructor(capacity: number) { this.cap = capacity; }

  get(key: number): number { return this.map.get(key) ?? -1; }

  put(key: number, value: number): void {
    if (this.cap === 0) return;
    if (this.map.has(key)) { this.map.set(key, value); return; }
    if (this.map.size === this.cap) { this.map.delete(this.queue.shift()!); }
    this.map.set(key, value);
    this.queue.push(key);
  }
}
