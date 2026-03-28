import { Node } from './Node';

/**
 * Doubly linked list with sentinel head/tail for O(1) operations.
 * Maintains LRU ordering per frequency: head.next = MRU, tail.prev = LRU.
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

  /** Insert node right after head (MRU position). O(1). */
  addFirst(node: Node): void {
    node.prev = this.head;
    node.next = this.head.next!;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  /** Detach a node from the list. O(1). */
  remove(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  /** Remove and return tail.prev (LRU). Returns null if empty. */
  removeLast(): Node | null {
    if (this.isEmpty()) return null;
    const node = this.tail.prev!;
    this.remove(node);
    return node;
  }

  isEmpty(): boolean {
    return this.head.next === this.tail;
  }

  /** Snapshot: returns node data in MRU→LRU order. For visualization only. */
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
