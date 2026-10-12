import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './SearchBar.jsx'

describe('SearchBar', () => {
  it('exposes the input through an accessible label', () => {
    render(<SearchBar onSearch={() => {}} />)
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByLabelText('Search for a movie')).toBeInTheDocument()
  })

  it('submits the trimmed value', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox'), '  Inception  ')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith('Inception')
  })

  it('submits with the Enter key', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox'), 'Heat{Enter}')
    expect(onSearch).toHaveBeenCalledWith('Heat')
  })

  it('accepts custom label, placeholder and button text', () => {
    render(<SearchBar onSearch={() => {}} label="Describe it" placeholder="mood…" buttonLabel="Ask AI" />)
    expect(screen.getByLabelText('Describe it')).toHaveAttribute('placeholder', 'mood…')
    expect(screen.getByRole('button', { name: 'Ask AI' })).toBeInTheDocument()
  })
})
