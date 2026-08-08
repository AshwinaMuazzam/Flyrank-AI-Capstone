import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import styles from './SettingsForm.module.css'

const settingsSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  notificationPreference: z.custom(
    (val) => ['Email', 'SMS', 'None'].includes(val),
    { message: 'Please select a notification preference' },
  ),
})

export default function SettingsForm() {
  const [savedMessage, setSavedMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
    },
  })

  const onSubmit = async () => {
    setSavedMessage('')
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSavedMessage('Settings saved')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Settings form"
      >
        <div className={styles.field}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            className={styles.input}
            aria-invalid={errors.fullName ? 'true' : 'false'}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            {...register('fullName')}
          />
          {errors.fullName && (
            <span id="fullName-error" className={styles.error} role="alert">
              {errors.fullName.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <span id="email-error" className={styles.error} role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Notification Preference</legend>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="Email"
                className={styles.radio}
                aria-describedby={
                  errors.notificationPreference
                    ? 'notificationPreference-error'
                    : undefined
                }
                {...register('notificationPreference')}
              />
              Email
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="SMS"
                className={styles.radio}
                aria-describedby={
                  errors.notificationPreference
                    ? 'notificationPreference-error'
                    : undefined
                }
                {...register('notificationPreference')}
              />
              SMS
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="None"
                className={styles.radio}
                aria-describedby={
                  errors.notificationPreference
                    ? 'notificationPreference-error'
                    : undefined
                }
                {...register('notificationPreference')}
              />
              None
            </label>
          </div>
          {errors.notificationPreference && (
            <span
              id="notificationPreference-error"
              className={styles.error}
              role="alert"
            >
              {errors.notificationPreference.message}
            </span>
          )}
        </fieldset>

        <button
          type="submit"
          className={styles.submit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>

        {savedMessage && (
          <p className={styles.success} role="status" aria-live="polite">
            {savedMessage}
          </p>
        )}
      </form>
    </div>
  )
}
