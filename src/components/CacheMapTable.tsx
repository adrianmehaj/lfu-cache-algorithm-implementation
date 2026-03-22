import { useState } from 'react';
import type { CacheStateSnapshot } from '../types/cache.types';

interface CacheMapTableProps {
  snapshot: CacheStateSnapshot;
}

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export function CacheMapTable({ snapshot }: CacheMapTableProps) {
  const [search, setSearch] = useState('');
  const { entries } = snapshot;

  const filtered = search
    ? entries.filter((e) =>
        String(e.key).includes(search) || String(e.value).includes(search)
      )
    : entries;

  return (
    <div className="cache-map">
      <div className="cache-map__header">
        <h3 className="cache-map__title">Cache Map</h3>
        <div className="cache-map__search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Filter keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cache-map__search-input"
            aria-label="Search keys"
          />
        </div>
      </div>
      <div className="cache-map__table-wrap">
        <table className="cache-map__table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Freq</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="cache-map__empty">
                  {entries.length === 0 ? 'Cache is empty' : 'No matching keys'}
                </td>
              </tr>
            ) : (
              filtered.map((node) => (
                <tr key={node.key}>
                  <td className="cache-map__mono">{node.key}</td>
                  <td className="cache-map__mono">{node.value}</td>
                  <td className="cache-map__mono">{node.freq}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
