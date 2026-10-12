import { useState, useRef } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import MovieCard from '../components/MovieCard.jsx';
import { searchMovies } from '../services/omdbService.js';
import { aiSearchMovies } from '../services/aiService.js';
import './Home.css';

const MODES = {
  title: {
    label: 'Search by title',
    inputLabel: 'Search for a movie by title',
    placeholder: 'Search for a movie, e.g. Inception',
    button: 'Search',
  },
  ai: {
    label: 'Describe what you want',
    inputLabel: 'Describe the kind of movie you want to watch',
    placeholder: 'e.g. a slow-burn sci-fi like Arrival, but less sad',
    button: 'Ask AI',
  },
};

export default function Home({ isFavourite, onToggleFavourite }) {
  const [mode, setMode] = useState('title');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Tracks the most recent search so a slower, older request can't
  // overwrite the results of a newer one that resolved first.
  const latestRequestId = useRef(0);

  function reset() {
    latestRequestId.current += 1;
    setResults([]);
    setHasSearched(false);
    setStatus('idle');
    setError(null);
    setNotice(null);
  }

  function changeMode(next) {
    if (next === mode) return;
    setMode(next);
    reset();
  }

  async function handleSearch(query) {
    if (!query) {
      reset();
      return;
    }

    const requestId = ++latestRequestId.current;

    setStatus('loading');
    setError(null);
    setNotice(null);
    setHasSearched(true);

    let outcome;
    let fallbackNotice = null;

    if (mode === 'ai') {
      const ai = await aiSearchMovies(query);
      if (requestId !== latestRequestId.current) return;

      if (ai.error) {
        // Fail safely: the app still works without the AI by falling back to a plain title search.
        fallbackNotice = `${ai.error} Showing title matches instead.`;
        outcome = await searchMovies(query);
      } else {
        outcome = ai;
      }
    } else {
      outcome = await searchMovies(query);
    }

    // A newer search started while this one was in flight — discard this result.
    if (requestId !== latestRequestId.current) return;

    setNotice(fallbackNotice);

    if (outcome.error) {
      setError(outcome.error);
      setResults([]);
      setStatus('error');
      return;
    }

    setResults(outcome.results);
    setStatus('success');
  }

  const m = MODES[mode];

  return (
    <div className="home-page">
      <h1 className="home-page__heading">Find your next movie</h1>

      <div className="home-page__modes" role="group" aria-label="Search mode">
        {Object.entries(MODES).map(([key, value]) => (
          <button
            key={key}
            type="button"
            className={`home-page__mode ${mode === key ? 'is-active' : ''}`}
            aria-pressed={mode === key}
            onClick={() => changeMode(key)}
          >
            {value.label}
          </button>
        ))}
      </div>

      <SearchBar
        key={mode}
        id="movie-search"
        label={m.inputLabel}
        placeholder={m.placeholder}
        buttonLabel={m.button}
        onSearch={handleSearch}
      />

      {status === 'loading' && (
        <p className="home-page__status" role="status">
          {mode === 'ai' ? 'Asking the AI…' : 'Searching…'}
        </p>
      )}

      {notice && (
        <p className="home-page__status home-page__status--notice" role="status">
          {notice}
        </p>
      )}

      {status === 'error' && (
        <p className="home-page__status home-page__status--error" role="alert">
          {error}
        </p>
      )}

      {status === 'success' && results.length === 0 && (
        <p className="home-page__status" role="status">
          No movies found. Try a different title.
        </p>
      )}

      {!hasSearched && status === 'idle' && (
        <p className="home-page__status">
          {mode === 'ai'
            ? 'Describe a mood, genre or a movie you liked, and the AI will suggest titles.'
            : 'Search for a movie title to get started.'}
        </p>
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
