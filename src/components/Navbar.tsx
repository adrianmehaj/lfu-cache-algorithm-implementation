type TabId = 'visualizer' | 'benchmarks' | 'theory';

interface NavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
}

const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export function Navbar({ activeTab, onTabChange, darkMode, onThemeToggle }: NavbarProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'visualizer', label: 'Visualizer' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'theory', label: 'Theory' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__icon">
          <DatabaseIcon />
        </span>
        <span className="navbar__title">LFU Cache Visualizer</span>
      </div>
      <div className="navbar__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`navbar__tab ${activeTab === tab.id ? 'navbar__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button
        className="navbar__theme-btn"
        onClick={onThemeToggle}
        aria-label="Toggle theme"
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </button>
    </nav>
  );
}
