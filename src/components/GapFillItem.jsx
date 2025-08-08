// src/components/GapFillItem.jsx
import React, { useState, useEffect } from 'react'
import { auth, sendReport, recordMistake,
         addFavourite, removeFavourite, fetchFavourites } from '../firebase'
import { AlertCircle, Star } from 'lucide-react'
import { toast } from '../utils/toast'
import '../index.css'     // your global styles

export default function GapFillItem({ item, onAnswer }) {
  const { id, sentence, options, answerIndex, explanations, level } = item

  const [sel, setSel]             = useState(null)
  const [showReport, setShowReport]       = useState(false)
  const [reportReason, setReportReason]   = useState('')
  const [otherText, setOtherText]         = useState('')
  const [isFav, setIsFav]                 = useState(false)

  // Pre-split for rendering
  const [before, after] = sentence.split('___')

  //
  // 1) Load whether this item is already a favourite
  //
  useEffect(() => {
    if (!auth.currentUser) return
    fetchFavourites()
      .then(ids => setIsFav(ids.includes(id)))
      .catch(console.error)
  }, [id])

  //
  // 2) Handle answer clicks (and record mistakes)
  //
  const handleClick = idx => {
    if (sel !== null) return
    onAnswer()
    setSel(idx)
    if (idx !== answerIndex) {
      recordMistake(id).catch(console.error)
    }
  }

  // 3) Toggle favourite on/off
const toggleFav = async () => {
  if (!auth.currentUser) return
  try {
    if (isFav) {
      await removeFavourite(id)
      setIsFav(false)
      toast('Removed from favourites');
    } else {
      await addFavourite(id)
      setIsFav(true)
      toast('Added to favourites');
    }
  } catch (e) {
    console.error('Favourite error', e)
  }
}
  //
  // 4) Send a report
  //
  // 4) Send a report
const handleSendReport = async () => {
  if (!reportReason) return
  try {
    await sendReport({
      itemId: id,
      question: sentence,
      issue: reportReason === 'other' ? 'other' : reportReason,
      comments: otherText.trim(),
      // extra metadata helps the email/report
      level,
      selectedOption: sel != null ? options[sel] : null,
      correctOption: options[answerIndex],
    })

    // optional: nicer UX than alert (you already import toast)
    // toast('Thanks! Your report has been sent.')
    setShowReport(false)
    setReportReason('')
    setOtherText('')
  } catch (err) {
    console.error('Report error:', err)
    // toast('Failed to send report. Please try again later.')
  }
}

  return (
    <div className="card gapfill-card">
      {/* Header: CEFR badge + favourite star */}
      <div className="card-header">
        <span className={`cefr-badge cefr-${level}`}>
          {level || '–'}
        </span>
        {auth.currentUser && (
          <button
          className={`fav-btn ${isFav ? 'active' : ''}`}
          onClick={toggleFav}
          aria-pressed={isFav}
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          title={isFav ? 'Remove from favourites' : 'Add to favourites'}
        >
          {isFav ? (
            // Filled star (gold)
            <Star size={18} fill="#ffd36a" stroke="#ffd36a" />
          ) : (
            // Outline star
            <Star size={18} />
          )}
        </button>
        )}
      </div>

      {/* The sentence with a blank */}
      <p className="sentence-text">
        {before}
        <strong className="blank">_____</strong>
        {after}
      </p>

      {/* Multiple-choice options */}
      <div className="options-row">
        {options.map((opt, i) => (
          <button
            key={i}
            className={`
              option-btn
              ${sel !== null
                ? i === answerIndex
                  ? 'correct'
                  : i === sel
                    ? 'incorrect'
                    : ''
                : ''}
            `}
            onClick={() => handleClick(i)}
            disabled={sel !== null}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {sel !== null && (
        <div className="explanation">
          <p className="explanation-title">Feedback:</p>
          <ul className="explanation-list">
            {options.map((opt, i) => (
              <li
                key={i}
                className={`explanation-item ${
                  i === answerIndex ? 'correct' : 'incorrect'
                }`}
              >
                <span className="explanation-flag">
                  {i === answerIndex ? '✔' : '✖'}
                </span>
                <span className="explanation-option">{opt}</span>
                <p className="explanation-text">{explanations[i]}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Report icon */}
      <button
        className="report-icon-btn"
        onClick={() => setShowReport(true)}
        title="Report a problem"
      >
        <AlertCircle size={20} />
        <span className="tooltip-text">Report a problem</span>
      </button>

      {/* Report form */}
      {showReport && (
  <div className="report-bar">
    <div className="report-fields">
    <select
  className="select"
  value={reportReason}
  onChange={e => setReportReason(e.target.value)}
>
  <option value="">{'-- select problem --'}</option>
  <option value="Incorrect answer">The answer is incorrect</option>
  <option value="Wrong explanation">The explanation is wrong</option>
  <option value="Multiple correct">Multiple options are correct</option>
  <option value="None correct">None of the options are correct</option>
  <option value="Other">Other</option>
</select>
      <textarea
        className="report-input"
        placeholder="Add details (optional)…"
        value={otherText}
        onChange={e => setOtherText(e.target.value)}
        rows={3}
      />
    </div>

    <div className="report-actions">
      <button
        className="review-btn"
        onClick={handleSendReport}
        disabled={!reportReason}
      >
        Send report
      </button>
      <button className="review-btn" onClick={() => setShowReport(false)}>
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  )
}
