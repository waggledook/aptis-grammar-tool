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
import ReadingGuide from './reading/ReadingGuide';
import MainMenu from './components/MainMenu';
import Profile from "./components/profile/Profile";
import WritingMenu from './components/writing/WritingMenu';
import WritingPart1 from './components/writing/WritingPart1';
import WritingPart1Guide from "./components/writing/WritingPart1Guide.jsx";
import WritingPart4Guide from "./components/writing/WritingPart4Guide";
import WritingPart4Emails from "./components/writing/WritingPart4Emails";
import WritingPart4RegisterGuide from "./components/writing/WritingPart4RegisterGuide";
import ReadingMenu from './components/ReadingMenu';
import SpeakingMenu from './components/speaking/SpeakingMenu';
import SpeakingPart1 from "./components/speaking/SpeakingPart1";
import SpeakingPart2 from './components/speaking/SpeakingPart2';
import SpeakingPart3 from './components/speaking/SpeakingPart3';
import SpeakingPart4 from "./components/speaking/SpeakingPart4";
import AptisPart2Reorder from './reading/AptisPart2Reorder';
import AptisPart3Matching from './reading/AptisPart3Matching';
import VocabularyMenu from "./components/vocabulary/VocabularyMenu";
import ToastHost from './components/ToastHost';
import Footer from "./components/common/Footer";
import VocabularyTopics from "./components/vocabulary/VocabularyTopics";
import TopicTrainer from "./components/vocabulary/TopicTrainer";
import './App.css'

export default function App() {
  // — AUTH STATE —
const [user,     setUser]     = useState(null)
const [showAuth, setShowAuth] = useState(false)
const [view, setView] = useState('menu'); // 'menu' | 'grammar' | 'readingMenu' | 'reading' | 'readingGuide' | 'mistakes' | 'favourites' | 'speakingMenu' | 'speakingPart2' |

useEffect(() => {
  const unsub = onAuthStateChanged(auth, u => {
    setUser(u)
    if (!u) {
      setShowAuth(false)
      setView('menu')        // ← was 'home'
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

  const [readingMode, setReadingMode] = useState('menu'); // 'menu' | 'guide' | 'practice'

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

  const newSetSameSettings = () => {
    if (loading || tagsLoading) return;
    generate();                              // re-runs with current levels/tag/count
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const clearExercises = () => {
    setItems([]);
    setAnsweredCount(0);
    setError(null);
    setRunKey(k => k + 1);                   // ensures any child state is reset
  };
  
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
    <div style={{ textAlign: "right", marginBottom: "1rem", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
  <button onClick={() => setView("menu")} className="topbar-btn">
    Home
  </button>

  {user ? (
    <>
      <button onClick={doSignOut} className="topbar-btn">
        Sign Out
      </button>

      <button
        onClick={() => setView("profile")}
        className="profile-badge-btn"
        aria-label="Open profile"
        title={user.email || "My Profile"}
      >
        <span className="avatar">
          {((user.displayName || user.email || "U")[0] || "U").toUpperCase()}
        </span>
      </button>
    </>
  ) : (
    <button onClick={() => setShowAuth(true)} className="topbar-btn">
      Sign In / Sign Up
    </button>
  )}
</div>

    {/* ————— Show the right “page” ————— */}

{view === 'menu' && (
  <MainMenu onSelect={(next) => setView(next)} />
)}

{view === 'grammar' && (
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
          <button className="review-btn mistakes" onClick={() => setView('mistakes')}>Review Mistakes</button>
          <button className="review-btn favourites" onClick={() => setView('favourites')}>Review Favourites</button>
        </>
      )}
    </div>

    {error && <p className="error-text">{error}</p>}

    {!error && (
      <>
        <GapFillList
          key={runKey}
          items={items}
          onAnswer={() => setAnsweredCount(c => c + 1)}
        />
        <ProgressTracker answered={answeredCount} total={items.length} />

        {items.length > 0 && (
          <div className="exercise-footer">
            <button type="button" className="review-btn" onClick={newSetSameSettings} disabled={loading || tagsLoading}>Replay</button>
            <button type="button" className="ghost-btn" onClick={clearExercises} disabled={loading}>Clear page</button>
          </div>
        )}
      </>
    )}
  </>
)}

{view === 'mistakes' && (
  <>
    <button
      onClick={() => setView('grammar')}
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
      onClick={() => setView('grammar')}
      className="review-btn"
      style={{ marginBottom: '1rem' }}
    >
      ← Back
    </button>
    <ReviewFavourites />
  </>
)}

{view === 'writingMenu' && (
  <WritingMenu
  onSelect={(part) => setView(`writing_${part}`)} // 'writing_part1', etc.
  onBack={() => setView('menu')}                  // your app uses 'menu'
  />
)}

{view === "writing_part1" && (
  <WritingPart1
    onBack={() => setView("writingMenu")}
    user={user}
  />
)}

{view === "writing_part1Guide" && (
  <WritingPart1Guide
    user={user}
    onBack={() => setView("writingMenu")}
    onStartPractice={() => setView("writing_part1")}
  />
)}

{view === "writing_part4" && (
  <WritingPart4Emails
    user={user}
    onBack={() => setView("writingMenu")}
  />
)}

{view === "writing_part4Guide" && (
  <WritingPart4Guide
    onBack={() => setView("writingMenu")}
    onOpen={(slug) => {
      if (slug === "register") return setView("writing_p4-register");
      if (slug === "practice") return setView("writing_part4"); // ← send to emails tool
      // fallback (for future slugs, if you add them)
      setView(`writing_p4-${slug}`);
    }}
  />
)}

{view === "writing_p4-register" && (
  <WritingPart4RegisterGuide
    onBack={() => setView("writing_part4Guide")}
    onStartPractice={() => setView("writing_part4")}
  />
)}

{view === 'readingMenu' && (
  <ReadingMenu
    onSelect={(next) => setView(next)}  // expects 'readingGuide' or 'reading'
    onBack={() => setView('menu')}
  />
)}

{view === 'readingGuide' && (
  <>
    <button
      onClick={() => setView('readingMenu')}
      className="review-btn"
      style={{ marginBottom: '1rem' }}
    >
      ← Back
    </button>
    <ReadingGuide />
  </>
)}

{view === 'reading' && (
  <>
    <button
      onClick={() => setView('readingMenu')}
      className="review-btn"
      style={{ marginBottom: '1rem' }}
    >
      ← Back
    </button>
    <AptisPart2Reorder
      user={user}
      onRequireSignIn={() => setShowAuth(true)}
    />
  </>
)}

{view === 'readingPart3' && (
  <>
    <button
      onClick={() => setView('readingMenu')}
      className="review-btn"
      style={{ marginBottom: '1rem' }}
    >
      ← Back
    </button>

    <AptisPart3Matching
      user={user}
      onRequireSignIn={() => setShowAuth(true)}
    />
  </>
)}


{view === 'speakingMenu' && (
  <SpeakingMenu
    onBack={() => setView('menu')}
    onSelect={(key) => {
      if (key === 'part1') setView('speakingPart1');
      if (key === 'part2') setView('speakingPart2');
      if (key === 'part3') setView('speakingPart3');   // ✅ route Part 3
      if (key === 'part4') setView('speakingPart4');
    }}
  />
)}


{view === 'speakingPart1' && (
  <SpeakingPart1
    user={user}
    speakSeconds={30}         // tweak if you want
  />
)}

{view === 'speakingPart2' && (
  <SpeakingPart2
    onBack={() => setView('speakingMenu')}
    user={user}                          // ✅ unlocks tasks 3+ when signed in
    onRequireSignIn={() => setView('menu')} // or open your auth modal here
    // tasks={myPart2Tasks}               // optional: provide your own bank
  />
)}

{view === 'speakingPart3' && (
  <SpeakingPart3
    user={user}
    // onRequireSignIn={() => setShowAuth(true)}
    // tasks={myPart3Bank} // optional override when your photos are ready
  />
)}

{view === 'speakingPart4' && (
  <SpeakingPart4
    user={user}
    // prepareSeconds={60}
    // speakSeconds={120}
  />
)}

{view === "vocabularyMenu" && (
  <VocabularyMenu
    onSelect={(section) => setView(section)}
    onBack={() => setView("menu")}
  />
)}

{view === "vocabTopics" && (
  <VocabularyTopics
    onBack={() => setView("vocabularyMenu")}
    isAuthenticated={!!user}   // 👈 tell it whether the user is signed in
  />
)}

{view === 'profile' && (
  <Profile
    user={user}
    onBack={() => setView('menu')}
    onGoMistakes={() => setView('mistakes')}
    onGoFavourites={() => setView('favourites')}
  />
)}

<Footer />

  </div>
</div>

  )
}
