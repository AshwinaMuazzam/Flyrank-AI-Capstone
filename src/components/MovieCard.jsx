   import { useState } from 'react';
   import './MovieCard.css';

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="445"><rect width="100%25" height="100%25" fill="%231e1e2e"/><text x="50%25" y="50%25" fill="%23888" font-family="sans-serif" font-size="20" text-anchor="middle" dy=".3em">No Poster</text></svg>';

export default function MovieCard({ movie, isFavourite, onToggleFavourite }) {
     const [posterFailed, setPosterFailed] = useState(false);
   const poster =
     !posterFailed && movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : FALLBACK_POSTER;

  return (
    <article className="movie-card">
      <img
        className="movie-card__poster"
        src={poster}
        alt={`Poster for ${movie.Title}`}
        loading="lazy"    onError={() => setPosterFailed(true)}
      />
      <div className="movie-card__body">
        <h2 className="movie-card__title">{movie.Title}</h2>
        <p className="movie-card__meta">
          {movie.Year} &middot; {movie.Type}
        </p>
        {movie.reason && <p className="movie-card__reason">{movie.reason}</p>}
        {/* The visible text is part of the accessible name (WCAG 2.5.3 Label in Name);
            the movie title is appended for screen-reader users only. */}
        <button
          type="button"
          className={`movie-card__fav-btn ${isFavourite ? 'is-active' : ''}`}
          onClick={() => onToggleFavourite(movie)}
          aria-pressed={isFavourite}
        >
          <span aria-hidden="true">{isFavourite ? '★ ' : '☆ '}</span>
          {isFavourite ? 'Favourited' : 'Add to favourites'}{' '}
          <span className="sr-only">{movie.Title}</span>
        </button>
      </div>
    </article>
  );
}
