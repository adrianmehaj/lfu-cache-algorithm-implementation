import { Node } from './Node';

/**
 * Doubly linked list with dummy head and tail for O(1) operations.
 * Used to maintain LRU order within each frequency level in the LFU cache.
 *
 * Layout: head <-> node1 <-> node2 <-> ... <-> tail
 * - addFirst: inserts at the front (after head) - most recently used
 * - removeLast: removes from the back (before tail) - least recently used
 */
export class DoublyLinkedList {
  private head: Node;
  private tail: Node;

  constructor() {
    this.head = new Node(-1, -1, -1);
    this.tail = new Node(-1, -1, -1);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Adds node at the front (most recently used position).
   * O(1) - we only modify head's next and the adjacent node.
   */
  addFirst(node: Node): void {
    node.prev = this.head;
    node.next = this.head.next!;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  /**
   * Removes the given node from the list.
   * O(1) - we have direct reference to the node.
   */
  remove(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  /**
   * Removes and returns the last node (least recently used).
   * Returns null if the list is empty (only head and tail).
   */
  removeLast(): Node | null {
    if (this.isEmpty()) return null;
    const node = this.tail.prev!;
    this.remove(node);
    return node;
  }

  /**
   * Returns true if the list has no data nodes (only dummy head/tail).
   */
  isEmpty(): boolean {
    return this.head.next === this.tail;
  }

  /**
   * Returns all keys in list order (head to tail = MRU to LRU).
   * Used for state snapshot / visualization.
   */
  getKeys(): number[] {
    const keys: number[] = [];
    let curr = this.head.next;
    while (curr && curr !== this.tail) {
      keys.push(curr.key);
      curr = curr.next;
    }
    return keys;
  }

  /**
   * Returns full node data as array (MRU to LRU order) for UI snapshot.
   */
  toArray(): Array<{ key: number; value: number; freq: number }> {
    const result: Array<{ key: number; value: number; freq: number }> = [];
    let curr = this.head.next;
    while (curr && curr !== this.tail) {
      result.push({ key: curr.key, value: curr.value, freq: curr.freq });
      curr = curr.next;
    }
    return result;
  }
}
