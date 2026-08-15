import { useState } from 'react';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Favourites from './pages/Favourites.jsx';
import { useFavourites } from './hooks/useFavourites.js';
import './App.css';

export default function App() {
  const [view, setView] = useState('home');
  const { favourites, isFavourite, toggleFavourite } = useFavourites();

  return (
    <div className="app">
      <Header activeView={view} onNavigate={setView} favouriteCount={favourites.length} />
      <main>
        {view === 'home' ? (
          <Home isFavourite={isFavourite} onToggleFavourite={toggleFavourite} />
        ) : (
          <Favourites favourites={favourites} onToggleFavourite={toggleFavourite} />
        )}
      </main>
    </div>
  );
}