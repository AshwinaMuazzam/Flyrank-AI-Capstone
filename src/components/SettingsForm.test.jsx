import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import SettingsForm from './SettingsForm'

describe('SettingsForm', () => {
  it('renders all fields', () => {
    render(<SettingsForm />)

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'SMS' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'None' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<SettingsForm />)

    const form = screen.getByRole('form', { name: 'Settings form' })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
    })
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(
      screen.getByText('Please select a notification preference'),
    ).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<SettingsForm />)

    await user.type(screen.getByLabelText('Full Name'), 'Jane Doe')
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'not-an-email')
    await user.click(screen.getByRole('radio', { name: 'SMS' }))

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address'),
      ).toBeInTheDocument()
    })
  })

  it('successfully submits with valid data and shows confirmation message', async () => {
    const user = userEvent.setup()
    render(<SettingsForm />)

    await user.type(screen.getByLabelText('Full Name'), 'Jane Doe')
    await user.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'jane@example.com',
    )
    await user.click(screen.getByRole('radio', { name: 'Email' }))

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await waitFor(() => expect(saveButton).toBeEnabled())
    await user.click(saveButton)

    await waitFor(
      () => {
        expect(screen.getByText('Settings saved')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })
})
