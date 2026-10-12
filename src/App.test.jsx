import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('App', () => {
  it('navigates between Home and Favourites', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Find your next movie' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Favourites' }))
    expect(screen.getByRole('heading', { name: 'Your favourites' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Home' }))
    expect(screen.getByRole('heading', { name: 'Find your next movie' })).toBeInTheDocument()
  })
})
