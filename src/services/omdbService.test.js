import { vi } from 'vitest'

const ok = (body) => ({ ok: true, status: 200, json: async () => body })

async function load(key = 'test-key') {
  vi.resetModules()
  vi.stubEnv('VITE_OMDB_API_KEY', key)
  return import('./omdbService.js')
}

afterEach(() => vi.unstubAllEnvs())

describe('searchMovies', () => {
  it('returns empty results for a blank query without calling the network', async () => {
    const { searchMovies } = await load()
    const spy = vi.fn()
    vi.stubGlobal('fetch', spy)
    expect(await searchMovies('   ')).toEqual({ results: [], totalResults: 0, error: null })
    expect(spy).not.toHaveBeenCalled()
  })

  it('reports a missing API key', async () => {
    const { searchMovies } = await load('')
    expect((await searchMovies('batman')).error).toMatch(/Missing OMDb API key/)
  })

  it('maps a successful response', async () => {
    const { searchMovies } = await load()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ Response: 'True', Search: [{ imdbID: 'tt1' }], totalResults: '12' })))
    expect(await searchMovies('batman')).toEqual({ results: [{ imdbID: 'tt1' }], totalResults: 12, error: null })
  })

  it('handles OMDb "Response: False" bodies', async () => {
    const { searchMovies } = await load()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ Response: 'False', Error: 'Movie not found!' })))
    expect((await searchMovies('zzzz')).error).toBe('Movie not found!')
  })

  it('handles HTTP and network errors', async () => {
    const { searchMovies } = await load()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }))
    expect((await searchMovies('x')).error).toMatch(/401/)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect((await searchMovies('x')).error).toBe('offline')
  })
})

describe('getMovieDetails / getMovieByTitle', () => {
  it('fetches details by id', async () => {
    const { getMovieDetails } = await load()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ Response: 'True', Title: 'Heat' })))
    expect((await getMovieDetails('tt0113277')).movie.Title).toBe('Heat')
  })

  it('looks up by exact title and year', async () => {
    const { getMovieByTitle } = await load()
    const spy = vi.fn().mockResolvedValue(ok({ Response: 'True', Title: 'Arrival' }))
    vi.stubGlobal('fetch', spy)
    const out = await getMovieByTitle('Arrival', 2016)
    expect(out.movie.Title).toBe('Arrival')
    expect(spy.mock.calls[0][0]).toContain('t=Arrival&y=2016')
  })

  it('returns an error for an unknown title', async () => {
    const { getMovieByTitle } = await load()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ Response: 'False', Error: 'Movie not found!' })))
    const out = await getMovieByTitle('Nope')
    expect(out.movie).toBeNull()
    expect(out.error).toBe('Movie not found!')
  })
})
