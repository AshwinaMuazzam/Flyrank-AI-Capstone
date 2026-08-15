import { useState, useRef } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import MovieCard from '../components/MovieCard.jsx';
import { searchMovies } from '../services/omdbService.js';
import './Home.css';

export default function Home({ isFavourite, onToggleFavourite }) {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Tracks the most recent search so a slower, older request can't
  // overwrite the results of a newer one that resolved first
  // (e.g. typing "bat" then quickly "batman" — "bat" might resolve last).
  const latestRequestId = useRef(0);

  async function handleSearch(query) {
    if (!query) {
      latestRequestId.current += 1;
      setResults([]);
      setHasSearched(false);
      setStatus('idle');
      return;
    }

    const requestId = ++latestRequestId.current;

    setStatus('loading');
    setError(null);
    setHasSearched(true);

    const { results: movies, error: searchError } = await searchMovies(query);

    // A newer search started while this one was in flight — discard this result.
    if (requestId !== latestRequestId.current) return;

    if (searchError) {
      setError(searchError);
      setResults([]);
      setStatus('error');
      return;
    }

    setResults(movies);
    setStatus('success');
  }

  return (
    <div className="home-page">
      <SearchBar onSearch={handleSearch} />

      {status === 'loading' && (
        <p className="home-page__status" role="status">
          Searching…
        </p>
      )}

      {status === 'error' && (
        <p className="home-page__status home-page__status--error" role="alert">
          {error}
        </p>
      )}

      {status === 'success' && results.length === 0 && (
        <p className="home-page__status">No movies found. Try a different title.</p>
      )}

      {!hasSearched && status === 'idle' && (
        <p className="home-page__status">Search for a movie title to get started.</p>
      )}

      {results.length > 0 && (
        <div className="home-page__grid">
          {results.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              isFavourite={isFavourite(movie.imdbID)}
              onToggleFavourite={onToggleFavourite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
