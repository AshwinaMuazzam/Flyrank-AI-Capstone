import MovieCard from '../components/MovieCard.jsx';
import '../pages/Home.css'; // reuse the grid/status styles

export default function Favourites({ favourites, onToggleFavourite }) {
  if (favourites.length === 0) {
    return (
      <div className="home-page">
        <p className="home-page__status">
          You haven't added any favourites yet. Go find something good to watch!
        </p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-page__grid">
        {favourites.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            isFavourite={true}
            onToggleFavourite={onToggleFavourite}
          />
        ))}
      </div>
    </div>
  );
}
