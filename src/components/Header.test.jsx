import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from './Header.jsx'

describe('Header', () => {
  it('marks the active view with aria-current', () => {
    render(<Header activeView="favourites" onNavigate={() => {}} favouriteCount={0} />)
    expect(screen.getByRole('button', { name: 'Favourites' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('shows the favourite count only when above zero', () => {
    const { rerender } = render(<Header activeView="home" onNavigate={() => {}} favouriteCount={0} />)
    expect(screen.getByRole('button', { name: 'Favourites' })).toBeInTheDocument()
    rerender(<Header activeView="home" onNavigate={() => {}} favouriteCount={3} />)
    expect(screen.getByRole('button', { name: 'Favourites (3)' })).toBeInTheDocument()
  })

  it('calls onNavigate with the chosen view', async () => {
    const onNavigate = vi.fn()
    render(<Header activeView="home" onNavigate={onNavigate} favouriteCount={0} />)
    await userEvent.click(screen.getByRole('button', { name: 'Favourites' }))
    expect(onNavigate).toHaveBeenCalledWith('favourites')
  })
})
