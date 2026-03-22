export function Legend() {
  return (
    <div className="legend">
      <h3 className="legend__title">Legend</h3>
      <ul className="legend__list">
        <li>
          <span className="legend__swatch legend__swatch--inserted" /> inserted
        </li>
        <li>
          <span className="legend__swatch legend__swatch--accessed" /> accessed
        </li>
        <li>
          <span className="legend__swatch legend__swatch--updated" /> updated
        </li>
        <li>
          <span className="legend__swatch legend__swatch--evicted" /> evicted
        </li>
        <li>
          <span className="legend__swatch legend__swatch--minfreq" /> minFreq bucket
        </li>
        <li>
          <span className="legend__hint" /> LRU = rightmost in same freq
        </li>
      </ul>
      <p className="legend__explanation">
        LFU removes the least frequently used item; when frequencies are equal,
        it removes the least recently used among them.
      </p>
      <p className="legend__arch">
        <strong>Data structures:</strong> HashMap + Doubly Linked List
      </p>
    </div>
  );
}
