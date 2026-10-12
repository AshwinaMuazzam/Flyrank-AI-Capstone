import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('../services/omdbService.js', () => ({ searchMovies: vi.fn() }))
vi.mock('../services/aiService.js', () => ({ aiSearchMovies: vi.fn() }))
import { searchMovies } from '../services/omdbService.js'
import { aiSearchMovies } from '../services/aiService.js'
import Home from './Home.jsx'

const movie = (id, title) => ({ imdbID: id, Title: title, Year: '2016', Type: 'movie', Poster: 'N/A' })

function setup() {
  render(<Home isFavourite={() => false} onToggleFavourite={() => {}} />)
}

beforeEach(() => {
  searchMovies.mockReset()
  aiSearchMovies.mockReset()
})

describe('Home – title search', () => {
  it('shows results after a search', async () => {
    searchMovies.mockResolvedValue({ results: [movie('tt1', 'Heat')], totalResults: 1, error: null })
    setup()
    await userEvent.type(screen.getByRole('textbox'), 'heat{Enter}')
    expect(await screen.findByRole('heading', { name: 'Heat' })).toBeInTheDocument()
  })

  it('shows an alert when the search fails', async () => {
    searchMovies.mockResolvedValue({ results: [], totalResults: 0, error: 'Movie not found!' })
    setup()
    await userEvent.type(screen.getByRole('textbox'), 'zzzz{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('Movie not found!')
  })

  it('ignores a stale response that resolves after a newer search', async () => {
    let resolveSlow
    searchMovies
      .mockImplementationOnce(() => new Promise((r) => (resolveSlow = r)))
      .mockResolvedValueOnce({ results: [movie('tt2', 'Batman')], totalResults: 1, error: null })
    setup()
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'bat{Enter}')
    await userEvent.clear(input)
    await userEvent.type(input, 'batman{Enter}')
    await screen.findByRole('heading', { name: 'Batman' })
    resolveSlow({ results: [movie('tt9', 'Stale Result')], totalResults: 1, error: null })
    await waitFor(() => expect(screen.queryByText('Stale Result')).not.toBeInTheDocument())
  })
})

describe('Home – AI search', () => {
  async function switchToAi() {
    await userEvent.click(screen.getByRole('button', { name: 'Describe what you want' }))
  }

  it('shows AI suggestions with their reasons', async () => {
    aiSearchMovies.mockResolvedValue({ results: [{ ...movie('tt3', 'Arrival'), reason: 'Thoughtful first contact.' }], error: null })
    setup()
    await switchToAi()
    await userEvent.type(screen.getByRole('textbox'), 'slow sci-fi{Enter}')
    expect(await screen.findByRole('heading', { name: 'Arrival' })).toBeInTheDocument()
    expect(screen.getByText('Thoughtful first contact.')).toBeInTheDocument()
    expect(searchMovies).not.toHaveBeenCalled()
  })

  it('falls back to title search and tells the user when the AI fails', async () => {
    aiSearchMovies.mockResolvedValue({ results: [], error: 'The AI service is unavailable right now.' })
    searchMovies.mockResolvedValue({ results: [movie('tt4', 'Fallback Film')], totalResults: 1, error: null })
    setup()
    await switchToAi()
    await userEvent.type(screen.getByRole('textbox'), 'slow sci-fi{Enter}')
    expect(await screen.findByRole('heading', { name: 'Fallback Film' })).toBeInTheDocument()
    expect(screen.getByText(/AI service is unavailable.*title matches/i)).toBeInTheDocument()
  })

  it('marks the active mode with aria-pressed', async () => {
    setup()
    expect(screen.getByRole('button', { name: 'Search by title' })).toHaveAttribute('aria-pressed', 'true')
    await switchToAi()
    expect(screen.getByRole('button', { name: 'Describe what you want' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Ask AI' })).toBeInTheDocument()
  })
})
