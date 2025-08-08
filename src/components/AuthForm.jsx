// src/components/AuthForm.jsx
import React, { useState } from 'react'
import { doSignIn, doSignUp } from '../firebase'

export default function AuthForm({ onSuccess }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]         = useState('signIn') // or 'signUp'
  const [error, setError]       = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'signIn') {
        await doSignIn(email, password)
      } else {
        await doSignUp(email, password)
      }
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">{mode === 'signIn' ? 'Sign In' : 'Create Account'}</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            />
          </div>

          <div className="actions">
            <button type="submit" className="primary-btn">
              {mode === 'signIn' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          {mode === 'signIn' ? "Don't have an account?" : 'Already have one?'}{' '}
          <button
            type="button"
            onClick={() => { setMode(m => (m === 'signIn' ? 'signUp' : 'signIn')); setError('') }}
            className="link-btn"
          >
            {mode === 'signIn' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
