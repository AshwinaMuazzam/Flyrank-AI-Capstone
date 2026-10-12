import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MovieCard from './MovieCard.jsx'

const movie = { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Type: 'movie', Poster: 'https://x/p.jpg' }

describe('MovieCard', () => {
  it('renders title, year, type and a descriptive poster alt', () => {
    render(<MovieCard movie={movie} isFavourite={false} onToggleFavourite={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument()
    expect(screen.getByText(/2010/)).toBeInTheDocument()
    expect(screen.getByAltText('Poster for Inception')).toHaveAttribute('src', 'https://x/p.jpg')
  })

  it('uses a fallback poster when OMDb has none', () => {
    render(<MovieCard movie={{ ...movie, Poster: 'N/A' }} isFavourite={false} onToggleFavourite={() => {}} />)
    expect(screen.getByAltText('Poster for Inception').getAttribute('src')).toMatch(/^data:image\/svg/)
  })

  it('shows the AI reason only when present', () => {
    const { rerender } = render(<MovieCard movie={movie} isFavourite={false} onToggleFavourite={() => {}} />)
    expect(screen.queryByText('Quiet and cerebral.')).not.toBeInTheDocument()
    rerender(<MovieCard movie={{ ...movie, reason: 'Quiet and cerebral.' }} isFavourite={false} onToggleFavourite={() => {}} />)
    expect(screen.getByText('Quiet and cerebral.')).toBeInTheDocument()
  })

  it('favourite button name contains its visible text and the movie title', () => {
    render(<MovieCard movie={movie} isFavourite={false} onToggleFavourite={() => {}} />)
    const btn = screen.getByRole('button', { name: /add to favourites/i })
    expect(btn).toHaveAccessibleName(/Add to favourites\s+Inception/)
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles the favourite and reflects the pressed state', async () => {
    const onToggle = vi.fn()
    const { rerender } = render(<MovieCard movie={movie} isFavourite={false} onToggleFavourite={onToggle} />)
    await userEvent.click(screen.getByRole('button', { name: /add to favourites/i }))
    expect(onToggle).toHaveBeenCalledWith(movie)
    rerender(<MovieCard movie={movie} isFavourite={true} onToggleFavourite={onToggle} />)
    expect(screen.getByRole('button', { name: /favourited/i })).toHaveAttribute('aria-pressed', 'true')
  })
  it('swaps to the fallback poster when the image fails to load', () => {
  render(<MovieCard movie={movie} isFavourite={false} onToggleFavourite={() => {}} />)
  const img = screen.getByAltText('Poster for Inception')
  fireEvent.error(img)
  expect(img.getAttribute('src')).toMatch(/^data:image\/svg/)
})
})
