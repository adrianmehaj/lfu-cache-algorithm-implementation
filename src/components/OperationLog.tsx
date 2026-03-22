import type { OperationLogEntry } from '../types/cache.types';

interface OperationLogProps {
  logs: OperationLogEntry[];
}

const PutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const GetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UpdateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const EvictIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function LogIcon({ type }: { type: OperationLogEntry['type'] }) {
  switch (type) {
    case 'put':
      return <PutIcon />;
    case 'get':
      return <GetIcon />;
    case 'evict':
      return <EvictIcon />;
    case 'reset':
      return <UpdateIcon />;
    default:
      return <UpdateIcon />;
  }
}

export function OperationLog({ logs }: OperationLogProps) {
  return (
    <div className="event-log">
      <h3 className="event-log__title">Event Log</h3>
      <div className="event-log__list">
        {logs.length === 0 ? (
          <p className="event-log__empty">No operations yet</p>
        ) : (
          [...logs].reverse().map((entry) => (
            <div
              key={entry.id}
              className={`event-log__entry event-log__entry--${entry.type}`}
            >
              <span className="event-log__icon">
                <LogIcon type={entry.type} />
              </span>
              <span className="event-log__msg">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
