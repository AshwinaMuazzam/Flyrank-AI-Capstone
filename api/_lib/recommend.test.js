import { vi } from 'vitest'
import {
  handleRecommend,
  parseModelJson,
  validateRecommendations,
  isRateLimited,
} from './recommend.js'

const geminiReply = (text) =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  })

const good = JSON.stringify({
  recommendations: [{ title: 'Arrival', year: 2016, reason: 'Thoughtful first contact.' }],
})

describe('parseModelJson', () => {
  it('parses plain JSON', () => {
    expect(parseModelJson('{"a":1}')).toEqual({ a: 1 })
  })
  it('strips markdown fences and surrounding prose', () => {
    expect(parseModelJson('Sure!\n```json\n{"a":1}\n```')).toEqual({ a: 1 })
  })
  it('throws when there is no JSON', () => {
    expect(() => parseModelJson('no json here')).toThrow()
  })
})

describe('validateRecommendations', () => {
  it('drops malformed and duplicate items and cleans fields', () => {
    const out = validateRecommendations({
      recommendations: [
        { title: ' Arrival ', year: 2016, reason: 'ok' },
        { title: 'arrival', year: 2016, reason: 'dup' },
        { year: 2000 },
        null,
        { title: 'Heat', year: 'nineteen', reason: 5 },
      ],
    })
    expect(out).toEqual([
      { title: 'Arrival', year: 2016, reason: 'ok' },
      { title: 'Heat', year: null, reason: '' },
    ])
  })
  it('throws when recommendations is missing', () => {
    expect(() => validateRecommendations({})).toThrow()
  })
})

describe('handleRecommend', () => {
  it('rejects too-short and too-long queries', async () => {
    expect((await handleRecommend({ query: 'a' }, { apiKey: 'k' })).status).toBe(400)
    expect((await handleRecommend({ query: 'a'.repeat(301) }, { apiKey: 'k' })).status).toBe(400)
    expect((await handleRecommend({}, { apiKey: 'k' })).status).toBe(400)
  })

  it('returns 503 when the API key is not configured', async () => {
    expect((await handleRecommend({ query: 'slow sci-fi' }, {})).status).toBe(503)
  })

  it('returns validated recommendations on success and sends the system prompt', async () => {
    const fetchImpl = geminiReply(good)
    const out = await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', ip: 'ok-ip', fetchImpl })
    expect(out.status).toBe(200)
    expect(out.body.recommendations[0].title).toBe('Arrival')
    const [url, init] = fetchImpl.mock.calls[0]
    const sent = JSON.parse(init.body)
    expect(url).toContain('generativelanguage.googleapis.com')
    expect(url).toContain('gemini-3.5-flash-lite:generateContent')
    expect(sent.systemInstruction.parts[0].text).toMatch(/ONLY a JSON object/)
    expect(sent.contents[0].parts[0].text).toBe('slow sci-fi')
    expect(sent.generationConfig.responseMimeType).toBe('application/json')
    expect(init.headers['x-goog-api-key']).toBe('k')
    // the key goes in a header, never in the URL
    expect(url).not.toContain('k=')
  })

  it('returns 502 for invalid model output instead of crashing', async () => {
    const out = await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', ip: 'bad-json', fetchImpl: geminiReply('I think you would like Arrival!') })
    expect(out.status).toBe(502)
    expect(out.body.error).toMatch(/unreadable/i)
  })

  it('returns a friendly message when the free-tier limit is hit (429)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    const out = await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', ip: 'quota', fetchImpl })
    expect(out.status).toBe(502)
    expect(out.body.error).toMatch(/busy/i)
  })

  it('returns 502 when the response has no candidates (e.g. blocked)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ candidates: [] }) })
    const out = await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', ip: 'blocked', fetchImpl })
    expect(out.status).toBe(502)
    expect(out.body.error).toMatch(/unreadable/i)
  })

  it('uses a custom model when provided', async () => {
    const fetchImpl = geminiReply(good)
    await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', model: 'gemini-test', ip: 'model', fetchImpl })
    expect(fetchImpl.mock.calls[0][0]).toContain('/gemini-test:generateContent')
  })

  it('returns 502 when the AI responds with an error status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 529 })
    const out = await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', ip: 'down', fetchImpl })
    expect(out.status).toBe(502)
    expect(out.body.error).toMatch(/unavailable/i)
  })

  it('returns 502 with a timeout message when the request aborts', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' })
    const out = await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', ip: 'slow', fetchImpl: vi.fn().mockRejectedValue(abort) })
    expect(out.status).toBe(502)
    expect(out.body.error).toMatch(/too long/i)
  })

  it('rate limits a client after 10 requests per minute', async () => {
    const fetchImpl = geminiReply(good)
    let last
    for (let i = 0; i < 11; i++) {
      last = await handleRecommend({ query: 'slow sci-fi' }, { apiKey: 'k', ip: 'spammer', fetchImpl })
    }
    expect(last.status).toBe(429)
  })
})

describe('isRateLimited', () => {
  it('forgets requests outside the window', () => {
    const t = 1_000_000
    for (let i = 0; i < 10; i++) isRateLimited('window-test', t)
    expect(isRateLimited('window-test', t)).toBe(true)
    expect(isRateLimited('window-test', t + 61_000)).toBe(false)
  })
})
