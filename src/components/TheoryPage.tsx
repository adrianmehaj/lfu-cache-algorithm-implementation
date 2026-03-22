const DatabaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const ExchangeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 5v14a2 2 0 0 0 2 2h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 19v-14a2 2 0 0 0-2-2h-14" />
  </svg>
);

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export function TheoryPage() {
  return (
    <div className="theory">
      <header className="theory__header">
        <h1 className="theory__title">LFU Cache — Theory</h1>
        <p className="theory__subtitle">
          Understanding Least Frequently Used caching and its O(1) implementation.
        </p>
      </header>

      <div className="theory__card">
        <div className="theory__card-header">
          <span className="theory__card-icon">
            <DatabaseIcon />
          </span>
          <h2>What is Caching?</h2>
        </div>
        <p className="theory__text">
          A cache is a high-speed data storage layer that stores a subset of data, typically transient
          in nature, so that future requests for that data are served faster. When the cache is full,
          an <strong>eviction policy</strong> determines which item to remove to make room for new data.
        </p>
      </div>

      <div className="theory__card">
        <div className="theory__card-header">
          <span className="theory__card-icon">
            <ExchangeIcon />
          </span>
          <h2>LFU vs LRU</h2>
        </div>
        <p className="theory__text">
          <strong>LFU (Least Frequently Used)</strong> evicts the item with the smallest access count.
          {' '}<strong>LRU (Least Recently Used)</strong> evicts the item that was accessed least recently.
          LFU favors items that have been used many times; LRU favors recently used items regardless
          of total usage.
        </p>
        <div className="theory__mnemonic">
          <code>LFU: "Used rarely → evict"</code>
          <code>LRU: "Haven't seen you lately → evict"</code>
        </div>
      </div>

      <div className="theory__card">
        <div className="theory__card-header">
          <span className="theory__card-icon">
            <CodeIcon />
          </span>
          <h2>O(1) Data Structures</h2>
        </div>
        <p className="theory__text">
          The LFU cache achieves O(1) <code>get</code> and <code>put</code> using:
        </p>
        <ul className="theory__list">
          <li><code>Map&lt;key → Node&gt;</code> — HashMap for O(1) key lookup</li>
          <li><code>Map&lt;frequency → DoublyLinkedList&gt;</code> — HashMap mapping frequency to nodes</li>
          <li><strong>Doubly Linked List</strong> — Per-frequency LRU ordering (head = MRU, tail = LRU)</li>
        </ul>
        <div className="theory__diagram">
          <pre>{`freq=1: [head] ⇄ [node] ⇄ [node] ⇄ [tail]  ← evict from tail
freq=2: [head] ⇄ [node] ⇄ [tail]`}</pre>
        </div>
      </div>
    </div>
  );
}
