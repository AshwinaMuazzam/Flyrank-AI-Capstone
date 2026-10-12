import { render, screen } from '@testing-library/react'
import Favourites from './Favourites.jsx'

describe('Favourites', () => {
  it('shows an empty state', () => {
    render(<Favourites favourites={[]} onToggleFavourite={() => {}} />)
    expect(screen.getByText(/haven't added any favourites/i)).toBeInTheDocument()
  })

  it('lists saved movies', () => {
    const favs = [{ imdbID: 'tt1', Title: 'Heat', Year: '1995', Type: 'movie', Poster: 'N/A' }]
    render(<Favourites favourites={favs} onToggleFavourite={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Heat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /favourited/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
