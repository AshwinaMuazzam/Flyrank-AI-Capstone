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

const normalise = (t) =>
  String(t)
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * OMDb's title lookup returns its "best guess", which can be a different
 * work (e.g. a TV episode that merely contains the title). Only accept a match
 * when the returned title is the requested one, or the requested title plus a
 * subtitle after a colon.
 */
export function titlesMatch(requested, returned) {
  const a = normalise(requested);
  const b = normalise(returned);
  if (!a || !b) return false;
  if (a === b) return true;
  const colon = String(returned).toLowerCase().replace(/^the\s+/, '');
  return colon.startsWith(`${String(requested).toLowerCase().replace(/^the\s+/, '')}:`);
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
      if (!movie || !titlesMatch(rec.title, movie.Title)) return null;
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
