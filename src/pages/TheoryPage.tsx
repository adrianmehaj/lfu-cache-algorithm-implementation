import { useI18n } from '../i18n/I18nContext';
import { getTheory } from '../i18n/theoryContent';

export function TheoryPage() {
  const { locale } = useI18n();
  const bundle = getTheory(locale);

  return (
    <div className="page">
      <h1 className="page__title">{bundle.title}</h1>
      <p className="page__sub">{bundle.subtitle}</p>

      {bundle.sections.map((sec, i) => (
        <div key={i} className="theory-card">
          <div className="theory-card__head">
            <span className="theory-card__icon">
              {i === 0 && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              )}
              {i === 1 && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round"/></svg>
              )}
              {i === 2 && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 5v14a2 2 0 0 0 2 2h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 19v-14a2 2 0 0 0-2-2h-14"/></svg>
              )}
              {i === 3 && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              )}
              {i === 4 && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 18V7M4 18h15" strokeLinecap="round" />
                  <line x1="5" y1="11" x2="18" y2="11" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <h2>{sec.title}</h2>
          </div>
          <p className="theory-text">{sec.body}</p>
          {sec.codeBlock && (
            <div className="theory-block">
              {sec.codeBlock.map((line, j) => (
                <code key={j}>{line}</code>
              ))}
            </div>
          )}
          {sec.list && (
            <ul className="theory-list">
              {sec.list.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )}
          {sec.afterList && <p className="theory-text">{sec.afterList}</p>}
          {sec.pre && (
            <div className="theory-block">
              <pre>{sec.pre}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
