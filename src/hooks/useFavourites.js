import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'movie-app-favourites';

function loadFavourites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupted localStorage data shouldn't crash the app.
    return [];
  }
}

export function useFavourites() {
  const [favourites, setFavourites] = useState(loadFavourites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  const isFavourite = useCallback(
    (imdbID) => favourites.some((movie) => movie.imdbID === imdbID),
    [favourites]
  );

  const addFavourite = useCallback((movie) => {
    setFavourites((prev) => {
      if (prev.some((m) => m.imdbID === movie.imdbID)) return prev;
      return [...prev, movie];
    });
  }, []);

  const removeFavourite = useCallback((imdbID) => {
    setFavourites((prev) => prev.filter((m) => m.imdbID !== imdbID));
  }, []);

  const toggleFavourite = useCallback(
    (movie) => {
      if (isFavourite(movie.imdbID)) {
        removeFavourite(movie.imdbID);
      } else {
        addFavourite(movie);
      }
    },
    [isFavourite, addFavourite, removeFavourite]
  );

  return { favourites, isFavourite, addFavourite, removeFavourite, toggleFavourite };
}
