// src/components/GapFillItem.jsx
import React, { useState, useEffect } from 'react'
import { auth, sendReport, recordMistake,
         addFavourite, removeFavourite, fetchFavourites, saveGrammarResult } from '../firebase'
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
  const [sendingReport, setSendingReport] = useState(false)

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
  const handleClick = (idx) => {
    if (sel !== null) return; // already answered
  
    setSel(idx);
  
    const isCorrect = idx === answerIndex;
  
    // Tell parent (GrammarSetRunner / main trainer) what happened
    if (typeof onAnswer === "function") {
      try {
        onAnswer({
          itemId: id,
          isCorrect,
          selectedIndex: idx,
          correctIndex: answerIndex,
          selectedOption: options?.[idx] ?? null,
          correctOption: options?.[answerIndex] ?? null,
        });
      } catch (err) {
        console.error("[GapFillItem] onAnswer handler failed:", err);
      }
    }
  
    // Only write to Firestore if signed in
    const user = auth.currentUser;
    if (!user) return;
  
    if (!isCorrect) {
      recordMistake(id).catch((err) =>
        console.error("[GapFillItem] recordMistake error:", err)
      );
    }
  
    saveGrammarResult(id, isCorrect).catch((err) =>
      console.error("[GapFillItem] saveGrammarResult error:", err)
    );
  };  

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
    if (!reportReason || sendingReport) return;
    setSendingReport(true);
    try {
      await sendReport({
        itemId: id,
        question: sentence,
        issue: reportReason === 'other' ? 'other' : reportReason,
        comments: otherText.trim(),
        level,
        selectedOption: sel != null ? options[sel] : null,
        correctOption: options[answerIndex],
      });
  
      toast(
        auth.currentUser?.email
          ? `Thanks — we emailed a copy to ${auth.currentUser.email}.`
          : 'Thanks — your report was sent.'
      );
  
      setShowReport(false);
      setReportReason('');
      setOtherText('');
    } catch (err) {
      console.error('Report error:', err);
      toast('Sorry — failed to send. Please try again.');
    } finally {
      setSendingReport(false);
    }
  };

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
          type="button"  // 👈 explicitly a button, not a form submit
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
      {sel !== null && (() => {
  // Pair option + explanation + meta
  const feedback = options.map((opt, i) => ({
    key: i,                 // original index
    opt,
    exp: explanations[i],
    isCorrect: i === answerIndex,
    isChosen: i === sel
  }));

  // Order: correct first, then chosen (if wrong), then original order
  const ordered = feedback.sort((a, b) => {
    if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1;
    if (a.isChosen !== b.isChosen)   return a.isChosen ? -1 : 1;
    return a.key - b.key;
  });

  return (
    <div className="explanation">
      <p className="explanation-title">Feedback:</p>
      <ul className="explanation-list">
        {ordered.map(f => (
          <li
            key={f.key}
            className={`explanation-item ${f.isCorrect ? 'correct' : 'incorrect'}`}
          >
            <span className="explanation-flag">{f.isCorrect ? '✔' : '✖'}</span>
            <span className="explanation-option">{f.opt}</span>
            <p className="explanation-text">{f.exp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
})()}


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
  disabled={!reportReason || sendingReport}
>
  {sendingReport ? 'Sending…' : 'Send report'}
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
