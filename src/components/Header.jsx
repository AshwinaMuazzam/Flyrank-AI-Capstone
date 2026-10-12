import './Header.css';

export default function Header({ activeView, onNavigate, favouriteCount }) {
  return (
    <header className="app-header">
      <p className="app-header__logo">🎬 MovieFinder</p>
      <nav className="app-header__nav" aria-label="Main">
        <button
          type="button"
          className={activeView === 'home' ? 'is-active' : ''}
          aria-current={activeView === 'home' ? 'page' : undefined}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={activeView === 'favourites' ? 'is-active' : ''}
          aria-current={activeView === 'favourites' ? 'page' : undefined}
          onClick={() => onNavigate('favourites')}
        >
          Favourites{favouriteCount > 0 ? ` (${favouriteCount})` : ''}
        </button>
      </nav>
    </header>
  );
}
