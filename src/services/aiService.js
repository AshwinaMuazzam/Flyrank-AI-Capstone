import { getMovieByTitle } from './omdbService.js';

/**
 * Ask the backend (/api/recommend -> Gemini) for movie ideas matching a
 * natural-language description.
 * @returns {Promise<{recommendations: Array<{title:string, year:number|null, reason:string}>, error: string|null}>}
 */
export async function getRecommendations(query) {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return { recommendations: [], error: data?.error || `AI request failed (${response.status}).` };
    }
    if (!data || !Array.isArray(data.recommendations)) {
      return { recommendations: [], error: 'The AI returned an unexpected response.' };
    }
    return { recommendations: data.recommendations, error: null };
  } catch {
    return { recommendations: [], error: 'Could not reach the AI service.' };
  }
}

/**
 * Full AI search: get suggestions from the LLM, then verify each one against
 * OMDb. Titles OMDb can't find (possible hallucinations) are silently dropped.
 * Each returned movie has the same shape as a search result, plus `reason`.
 */
export async function aiSearchMovies(query) {
  const { recommendations, error } = await getRecommendations(query);
  if (error) return { results: [], error };

  const lookups = await Promise.all(
    recommendations.map(async (rec) => {
      const { movie } = await getMovieByTitle(rec.title, rec.year);
      if (!movie) return null;
      return {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Type: movie.Type,
        Poster: movie.Poster,
        reason: rec.reason,
      };
    })
  );

  const results = lookups.filter(Boolean);
  const unique = results.filter((m, i) => results.findIndex((x) => x.imdbID === m.imdbID) === i);

  if (unique.length === 0) {
    return { results: [], error: 'The AI had no verified suggestions for that. Try rephrasing.' };
  }
  return { results: unique, error: null };
}
