const BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

/**
 * Search movies by title using the OMDb API.
 * @param {string} query - the search term
 * @param {number} page - page number (OMDb paginates 10 results per page)
 * @returns {Promise<{results: Array, totalResults: number, error: string|null}>}
 */
export async function searchMovies(query, page = 1) {
  if (!query || !query.trim()) {
    return { results: [], totalResults: 0, error: null };
  }

  if (!API_KEY) {
    return {
      results: [],
      totalResults: 0,
      error: 'Missing OMDb API key. Add VITE_OMDB_API_KEY to your .env file.',
    };
  }

  const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const data = await response.json();

    // OMDb returns { Response: "False", Error: "..." } instead of an HTTP error
    // when there are no matches or the request is otherwise invalid.
    if (data.Response === 'False') {
      return { results: [], totalResults: 0, error: data.Error || 'No results found.' };
    }

    return {
      results: data.Search || [],
      totalResults: Number(data.totalResults) || 0,
      error: null,
    };
  } catch (err) {
    return {
      results: [],
      totalResults: 0,
      error: err.message || 'Something went wrong while searching.',
    };
  }
}

/**
 * Fetch full details for a single movie by its IMDb ID.
 * @param {string} imdbID
 */
export async function getMovieDetails(imdbID) {
  if (!API_KEY) {
    return { movie: null, error: 'Missing OMDb API key.' };
  }

  const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const data = await response.json();
    if (data.Response === 'False') {
      return { movie: null, error: data.Error || 'Movie not found.' };
    }

    return { movie: data, error: null };
  } catch (err) {
    return { movie: null, error: err.message || 'Something went wrong.' };
  }
}

/**
 * Look up one movie by exact title (and optional year). Used to verify that a
 * title suggested by the AI really exists before showing it to the user.
 * @returns {Promise<{movie: object|null, error: string|null}>}
 */
export async function getMovieByTitle(title, year) {
  if (!API_KEY) {
    return { movie: null, error: 'Missing OMDb API key.' };
  }

  const yearParam = year ? `&y=${year}` : '';
  const url = `${BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}${yearParam}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const data = await response.json();
    if (data.Response === 'False') {
      return { movie: null, error: data.Error || 'Movie not found.' };
    }
    return { movie: data, error: null };
  } catch (err) {
    return { movie: null, error: err.message || 'Something went wrong.' };
  }
}
