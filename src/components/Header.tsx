export function Header() {
  return (
    <header className="header">
      <h1 className="header__title">LFU Cache Visual Simulator</h1>
      <p className="header__subtitle">
        Interactive visualization of Least Frequently Used cache replacement with
        O(1) operations
      </p>
      <div className="header__badges">
        <span className="badge">React</span>
        <span className="badge">TypeScript</span>
        <span className="badge badge--hard">LeetCode Hard</span>
      </div>
    </header>
  );
}
