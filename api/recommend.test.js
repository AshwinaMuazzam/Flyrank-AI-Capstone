import { vi } from 'vitest'
import handler from './recommend.js'

function mockRes() {
  const res = { headers: {}, statusCode: 200, body: null }
  res.setHeader = (k, v) => { res.headers[k] = v }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (b) => { res.body = b; return res }
  return res
}

describe('POST /api/recommend (Vercel wrapper)', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('rejects non-POST methods with 405 and an Allow header', async () => {
    const res = mockRes()
    await handler({ method: 'GET', headers: {} }, res)
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('POST')
  })

  it('returns 503 when GEMINI_API_KEY is not set', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')
    const res = mockRes()
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, body: { query: 'slow sci-fi' } }, res)
    expect(res.statusCode).toBe(503)
  })

  it('returns 400 for a bad body', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: undefined }, res)
    expect(res.statusCode).toBe(400)
  })
})
