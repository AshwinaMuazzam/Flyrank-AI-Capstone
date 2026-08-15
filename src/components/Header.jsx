import './Header.css';

export default function Header({ activeView, onNavigate, favouriteCount }) {
  return (
    <header className="app-header">
      <h1 className="app-header__logo">🎬 MovieFinder</h1>
      <nav className="app-header__nav">
        <button
          type="button"
          className={activeView === 'home' ? 'is-active' : ''}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={activeView === 'favourites' ? 'is-active' : ''}
          onClick={() => onNavigate('favourites')}
        >
          Favourites {favouriteCount > 0 ? `(${favouriteCount})` : ''}
        </button>
      </nav>
    </header>
  );
}
