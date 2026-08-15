import './MovieCard.css';

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="445"><rect width="100%25" height="100%25" fill="%231e1e2e"/><text x="50%25" y="50%25" fill="%23888" font-family="sans-serif" font-size="20" text-anchor="middle" dy=".3em">No Poster</text></svg>';

export default function MovieCard({ movie, isFavourite, onToggleFavourite }) {
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : FALLBACK_POSTER;

  return (
    <div className="movie-card">
      <img
        className="movie-card__poster"
        src={poster}
        alt={`Poster for ${movie.Title}`}
        loading="lazy"
      />
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.Title}</h3>
        <p className="movie-card__meta">
          {movie.Year} &middot; {movie.Type}
        </p>
        <button
          type="button"
          className={`movie-card__fav-btn ${isFavourite ? 'is-active' : ''}`}
          onClick={() => onToggleFavourite(movie)}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? `Remove ${movie.Title} from favourites` : `Add ${movie.Title} to favourites`}
        >
          {isFavourite ? '★ Favourited' : '☆ Add to favourites'}
        </button>
      </div>
    </div>
  );
}
