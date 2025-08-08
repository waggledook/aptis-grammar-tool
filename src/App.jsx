// src/App.jsx
import React, { useState, useEffect } from 'react'
import { auth, doSignOut }        from './firebase'
import { onAuthStateChanged }      from 'firebase/auth'
import AuthForm                    from './components/AuthForm'
import FilterPanel                 from './components/FilterPanel'
import GapFillList                 from './components/GapFillList'
import ProgressTracker             from './components/ProgressTracker'
import useTags                     from './hooks/useTags'
import { fetchItems }              from './api/grammar'
import ReviewMistakes   from './components/ReviewMistakes'
import ReviewFavourites from './components/ReviewFavourites'
import ToastHost from './components/ToastHost';
import './App.css'

export default function App() {
  // — AUTH STATE —
const [user,     setUser]     = useState(null)
const [showAuth, setShowAuth] = useState(false)
const [view,     setView]     = useState('home')  // 'home' | 'mistakes' | 'favourites'

useEffect(() => {
  const unsub = onAuthStateChanged(auth, u => {
    setUser(u)
    if (!u) {
      setShowAuth(false)    // hide the login form
      setView('home')       // go back to the main practice screen
    }
  })
  return unsub
}, [])


  // — EXERCISE STATE — 
  // **Moved above any return** so hooks are always called
  const [levels,        setLevels]        = useState([])
  const [tag,           setTag]           = useState('')
  const [items,         setItems]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [count, setCount] = useState(10); // how many questions to generate
  const [runKey, setRunKey] = useState(0);

  const {
    tags: allTags,
    loading: tagsLoading,
    error: tagsError
  } = useTags()

  const generate = async () => {
    setLoading(true)
    setError(null)
    setAnsweredCount(0)
    try {
      const batch = await fetchItems({ levels, tags: tag ? [tag] : [], count })
      setItems(batch)
      setRunKey(k => k + 1)   // ← force remount for a fresh run
    } catch {
      setError('Failed to load items.')
    } finally {
      setLoading(false)
    }
  }

  // — EARLY RETURN FOR AUTH FORM —  
  // Now we’ve already registered *all* hooks, so it’s safe:
  if (showAuth && !user) {
    return <AuthForm onSuccess={() => setShowAuth(false)} />
  }

  // — RENDER MAIN APP —
  return (
    // in src/App.jsx (inside your App component’s return)
<div className="App">
<ToastHost />
  <div className="content-container">

    {/* Auth bar */}
<div style={{ textAlign: 'right', marginBottom: '1rem' }}>
  {user ? (
    <>
      <button onClick={doSignOut} className="topbar-btn">Sign Out</button>
    </>
  ) : (
    <button onClick={() => setShowAuth(true)} className="topbar-btn">
      Sign In / Sign Up
    </button>
  )}
</div>
    {/* ————— Show the right “page” ————— */}
    {view === 'mistakes' && (
      <>
      <button
  onClick={() => setView('home')}
  className="review-btn"
  style={{ marginBottom: '1rem' }}
>
  ← Back
</button>
      <ReviewMistakes />
      </>
    )}

    {view === 'favourites' && (
      <>
      <button
  onClick={() => setView('home')}
  className="review-btn"
  style={{ marginBottom: '1rem' }}
>
  ← Back
</button>
      <ReviewFavourites />
      </>
    )}

    {/* Only show the main practice UI on the “home” view */}
    {view === 'home' && (
      <>
        <h1>Aptis Grammar Practice</h1>

        {tagsLoading && <p>Loading tags…</p>}
        {tagsError   && <p className="error-text">Error loading tags.</p>}

        {!tagsLoading && !tagsError && (
          <FilterPanel
            levels={levels}
            onLevelsChange={setLevels}
            tag={tag}
            onTagChange={setTag}
            allTags={allTags}
          />
        )}

<div className="count-row" role="group" aria-label="Number of questions">
  {[5, 10, 15].map(n => (
    <button
      key={n}
      type="button"
      className={`count-chip ${count === n ? 'selected' : ''}`}
      onClick={() => setCount(n)}
      aria-pressed={count === n}
    >
      {n}
    </button>
  ))}
  <span className="count-label">questions</span>
</div>

<div className="btn-row">
  <button
    className="generate-btn"
    onClick={generate}
    disabled={loading || tagsLoading}
  >
    {loading ? 'Loading…' : 'Generate Exercises'}
  </button>

  {user && (
    <>
      <button
        className="review-btn mistakes"
        onClick={() => setView('mistakes')}
      >
        Review Mistakes
      </button>

      <button
        className="review-btn favourites"
        onClick={() => setView('favourites')}
      >
        Review Favourites
      </button>
    </>
  )}
</div>

        {error && <p className="error-text">{error}</p>}

        {!error && (
          <>
            <GapFillList
              key={runKey}                          // ← this remounts the whole list
              items={items}
              onAnswer={() => setAnsweredCount(c => c + 1)}
            />
            <ProgressTracker
              answered={answeredCount}
              total={items.length}
            />
          </>
        )}
      </>
    )}
  </div>
</div>

  )
}
