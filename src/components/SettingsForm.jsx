import { useState } from 'react'
import './SettingsForm.css'

const DEFAULT_SETTINGS = {
  displayName: '',
  email: '',
  defaultModel: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2048,
  emailDigest: true,
  pushNotifications: false,
  shareUsageData: false,
}

const MODEL_OPTIONS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-sonnet', label: 'Claude Sonnet' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
]

function SettingsForm() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS)
  const [status, setStatus] = useState(null)

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings)

  function updateField(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setStatus(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!settings.displayName.trim()) {
      setStatus({ type: 'error', message: 'Display name is required.' })
      return
    }

    if (!settings.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' })
      return
    }

    setSavedSettings(settings)
    setStatus({ type: 'success', message: 'Settings saved successfully.' })
  }

  function handleReset() {
    setSettings(savedSettings)
    setStatus(null)
  }

  function handleRestoreDefaults() {
    setSettings(DEFAULT_SETTINGS)
    setStatus(null)
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Manage your profile, AI preferences, and notifications.</p>
      </header>

      <form className="settings-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="settings-section">
          <legend>Profile</legend>

          <div className="field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              type="text"
              value={settings.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </fieldset>

        <fieldset className="settings-section">
          <legend>AI preferences</legend>

          <div className="field">
            <label htmlFor="defaultModel">Default model</label>
            <select
              id="defaultModel"
              value={settings.defaultModel}
              onChange={(e) => updateField('defaultModel', e.target.value)}
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="temperature">
              Temperature
              <span className="field-value">{settings.temperature.toFixed(1)}</span>
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateField('temperature', Number(e.target.value))}
            />
            <p className="field-hint">Lower values are more focused; higher values are more creative.</p>
          </div>

          <div className="field">
            <label htmlFor="maxTokens">Max tokens</label>
            <input
              id="maxTokens"
              type="number"
              min="256"
              max="8192"
              step="256"
              value={settings.maxTokens}
              onChange={(e) => updateField('maxTokens', Number(e.target.value))}
            />
          </div>
        </fieldset>

        <fieldset className="settings-section">
          <legend>Notifications</legend>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={settings.emailDigest}
              onChange={(e) => updateField('emailDigest', e.target.checked)}
            />
            <span>
              <strong>Weekly email digest</strong>
              <small>Receive a summary of your activity and insights.</small>
            </span>
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => updateField('pushNotifications', e.target.checked)}
            />
            <span>
              <strong>Push notifications</strong>
              <small>Get notified when jobs complete or need attention.</small>
            </span>
          </label>
        </fieldset>

        <fieldset className="settings-section">
          <legend>Privacy</legend>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={settings.shareUsageData}
              onChange={(e) => updateField('shareUsageData', e.target.checked)}
            />
            <span>
              <strong>Share anonymous usage data</strong>
              <small>Help improve Flyrank by sharing non-identifiable analytics.</small>
            </span>
          </label>
        </fieldset>

        {status && (
          <p className={`settings-status settings-status--${status.type}`} role="status">
            {status.message}
          </p>
        )}

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary" disabled={!isDirty}>
            Save changes
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={!isDirty}
          >
            Discard changes
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleRestoreDefaults}>
            Restore defaults
          </button>
        </div>
      </form>
    </div>
  )
}

export default SettingsForm
