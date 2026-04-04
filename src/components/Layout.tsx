import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nContext';

type Tab = 'visualizer' | 'benchmarks' | 'theory';

interface Props {
  tab: Tab;
  onTab: (t: Tab) => void;
  dark: boolean;
  onTheme: () => void;
  children: ReactNode;
}

const TAB_IDS: Tab[] = ['visualizer', 'benchmarks', 'theory'];

const TAB_KEYS: Record<Tab, string> = {
  visualizer: 'nav.visualizer',
  benchmarks: 'nav.benchmarks',
  theory: 'nav.theory',
};

function DrawerTabIcon({ tab }: { tab: Tab }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24' as const, fill: 'none' as const, stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true as const };
  switch (tab) {
    case 'visualizer':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'benchmarks':
      return (
        <svg {...p}>
          <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
        </svg>
      );
    case 'theory':
      return (
        <svg {...p}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
  }
}

/** Fired when the slide-out nav opens on a narrow viewport; Visualizer stops any running demo. */
export const LFU_NAV_DRAWER_OPEN_EVENT = 'lfu-nav-drawer-open';

export function Layout({ tab, onTab, dark, onTheme, children }: Props) {
  const { locale, setLocale, t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prevDrawerOpenRef = useRef(false);

  useEffect(() => {
    const isMobileNav = () => typeof window !== 'undefined' && !window.matchMedia('(min-width: 900px)').matches;
    if (drawerOpen && !prevDrawerOpenRef.current && isMobileNav()) {
      window.dispatchEvent(new CustomEvent(LFU_NAV_DRAWER_OPEN_EVENT));
    }
    prevDrawerOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const close = () => {
      if (mq.matches) setDrawerOpen(false);
    };
    mq.addEventListener('change', close);
    close();
    return () => mq.removeEventListener('change', close);
  }, []);

  const drawerRef = useRef<HTMLElement>(null);
  const touchRef = useRef<{ x0: number; y0: number; edge: boolean } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x0: t.clientX, y0: t.clientY, edge: t.clientX < 28 };
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    const start = touchRef.current;
    if (!start) return;
    touchRef.current = null;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x0;
    const dy = Math.abs(t.clientY - start.y0);
    if (dy > Math.abs(dx) * 0.75) return;

    if (!drawerOpen && start.edge && dx > 60) {
      setDrawerOpen(true);
    } else if (drawerOpen && dx < -60) {
      setDrawerOpen(false);
    }
  }, [drawerOpen]);

  useEffect(() => {
    const el = document.documentElement;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchEnd]);

  const selectTab = (id: Tab) => {
    onTab(id);
    setDrawerOpen(false);
  };

  return (
    <div className="app">
      <nav className="nav" aria-label="Main">
        <button
          type="button"
          className={`nav__menu-btn ${drawerOpen ? 'nav__menu-btn--open' : ''}`}
          aria-expanded={drawerOpen}
          aria-controls="nav-drawer"
          aria-label={drawerOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <span className="hamburger" aria-hidden>
            <span className="hamburger__line" />
            <span className="hamburger__line" />
            <span className="hamburger__line" />
          </span>
        </button>

        <div className="nav__brand">
          <span className="nav__icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="nav-logo-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <rect x="4" y="20" width="5" height="7" rx="1" fill="url(#nav-logo-g)" opacity=".85"/>
              <rect x="10.5" y="14" width="5" height="13" rx="1" fill="url(#nav-logo-g)" opacity=".9"/>
              <rect x="17" y="8" width="5" height="19" rx="1" fill="url(#nav-logo-g)" opacity=".95"/>
              <rect x="23.5" y="5" width="5" height="22" rx="1" fill="url(#nav-logo-g)"/>
            </svg>
          </span>
          <span className="nav__title">{t('nav.brand')}</span>
        </div>

        <div className="nav__tabs-outer">
          <div className="nav__tabs" role="tablist">
            {TAB_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`nav__tab ${tab === id ? 'nav__tab--on' : ''}`}
                onClick={() => onTab(id)}
              >
                {t(TAB_KEYS[id])}
              </button>
            ))}
          </div>
        </div>

        <div className="nav__actions nav__toolbar">
          <div className="nav__lang" role="group" aria-label="Language">
            <button type="button" className={`nav__lang-btn ${locale === 'en' ? 'nav__lang-btn--on' : ''}`} onClick={() => setLocale('en')}>
              {t('nav.langEn')}
            </button>
            <button type="button" className={`nav__lang-btn ${locale === 'sq' ? 'nav__lang-btn--on' : ''}`} onClick={() => setLocale('sq')}>
              {t('nav.langSq')}
            </button>
          </div>
          <button type="button" className="nav__theme" onClick={onTheme} aria-label={t('nav.themeToggle')}>
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </nav>

      <div
        className={`nav__drawer-backdrop ${drawerOpen ? 'nav__drawer-backdrop--open' : ''}`}
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        ref={drawerRef}
        id="nav-drawer"
        className={`nav__drawer ${drawerOpen ? 'nav__drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!drawerOpen}
        aria-label={t('nav.menu')}
      >
        <div className="nav__drawer-head">
          <div className="nav__drawer-head-main">
            <div className="nav__drawer-title-row">
              <span className="nav__drawer-logo" aria-hidden>
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="drawer-logo-g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                  <rect x="4" y="20" width="5" height="7" rx="1" fill="url(#drawer-logo-g)" opacity=".85"/>
                  <rect x="10.5" y="14" width="5" height="13" rx="1" fill="url(#drawer-logo-g)" opacity=".9"/>
                  <rect x="17" y="8" width="5" height="19" rx="1" fill="url(#drawer-logo-g)" opacity=".95"/>
                  <rect x="23.5" y="5" width="5" height="22" rx="1" fill="url(#drawer-logo-g)"/>
                </svg>
              </span>
              <span className="nav__drawer-brand">{t('nav.brand')}</span>
            </div>
          </div>
          <button
            type="button"
            className="nav__drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('nav.closeMenu')}
          >
            <span className="hamburger hamburger--active" aria-hidden>
              <span className="hamburger__line" />
              <span className="hamburger__line" />
              <span className="hamburger__line" />
            </span>
          </button>
        </div>
        <nav className="nav__drawer-nav" aria-label={t('nav.menu')}>
          {TAB_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`nav__drawer-link ${tab === id ? 'nav__drawer-link--on' : ''}`}
              onClick={() => selectTab(id)}
            >
              <span className="nav__drawer-link-icon">
                <DrawerTabIcon tab={id} />
              </span>
              <span className="nav__drawer-link-text">{t(TAB_KEYS[id])}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="app__content">{children}</div>

      <footer className="app__footer">
        <p className="app__copyright">{t('nav.copyright')}</p>
      </footer>
    </div>
  );
}
