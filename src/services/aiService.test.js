import { vi } from 'vitest'

vi.mock('./omdbService.js', () => ({ getMovieByTitle: vi.fn() }))
import { getMovieByTitle } from './omdbService.js'
import { getRecommendations, aiSearchMovies } from './aiService.js'

const ok = (body) => ({ ok: true, status: 200, json: async () => body })
const fail = (status, body) => ({ ok: false, status, json: async () => body })

const recs = [
  { title: 'Arrival', year: 2016, reason: 'Thoughtful first contact.' },
  { title: 'Made Up Movie', year: 2020, reason: 'Invented by the model.' },
]

beforeEach(() => {
  getMovieByTitle.mockReset()
})

describe('getRecommendations', () => {
  it('returns recommendations on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ recommendations: recs })))
    const out = await getRecommendations('slow sci-fi')
    expect(out.error).toBeNull()
    expect(out.recommendations).toHaveLength(2)
  })

  it('surfaces the server error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(502, { error: 'The AI service is unavailable right now.' })))
    expect((await getRecommendations('x y z')).error).toBe('The AI service is unavailable right now.')
  })

  it('handles a non-JSON error body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('bad') } }))
    expect((await getRecommendations('x y z')).error).toMatch(/500/)
  })

  it('rejects an unexpected response shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ nope: true })))
    expect((await getRecommendations('x y z')).error).toMatch(/unexpected/i)
  })

  it('handles network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect((await getRecommendations('x y z')).error).toMatch(/could not reach/i)
  })
})

describe('aiSearchMovies', () => {
  it('keeps only titles that OMDb can verify', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ recommendations: recs })))
    getMovieByTitle.mockImplementation(async (title) =>
      title === 'Arrival'
        ? { movie: { imdbID: 'tt2543164', Title: 'Arrival', Year: '2016', Type: 'movie', Poster: 'p' }, error: null }
        : { movie: null, error: 'Movie not found!' }
    )
    const out = await aiSearchMovies('slow sci-fi')
    expect(out.error).toBeNull()
    expect(out.results).toHaveLength(1)
    expect(out.results[0]).toMatchObject({ Title: 'Arrival', reason: 'Thoughtful first contact.' })
  })

  it('de-duplicates movies that resolve to the same imdbID', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ recommendations: recs })))
    getMovieByTitle.mockResolvedValue({ movie: { imdbID: 'tt1', Title: 'Same', Year: '1', Type: 'movie', Poster: 'p' }, error: null })
    expect((await aiSearchMovies('q q q')).results).toHaveLength(1)
  })

  it('returns an error when nothing can be verified', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ recommendations: recs })))
    getMovieByTitle.mockResolvedValue({ movie: null, error: 'Movie not found!' })
    const out = await aiSearchMovies('q q q')
    expect(out.results).toEqual([])
    expect(out.error).toMatch(/no verified suggestions/i)
  })

  it('passes the AI error through', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const out = await aiSearchMovies('q q q')
    expect(out.results).toEqual([])
    expect(out.error).toBeTruthy()
  })
})
