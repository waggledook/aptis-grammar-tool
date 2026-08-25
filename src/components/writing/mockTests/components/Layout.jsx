import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TimerContext } from '../context/timerContext.js';
import { AnswersContext } from '../context/answersContext.js';
import { useWritingMock } from '../context/MockContext';
import { auth } from '../../../../firebase.js';
import { saveSubmission } from '../services/submissions';
import { getDraftKey, stripHtmlToText } from '../utils/answerContent';
import { clearExamTimer, EXAM_DURATION_SECONDS } from '../utils/timer';
import {
  getWritingMockPath,
  getWritingMockSubmissionPath,
  WRITING_MOCK_ROOT
} from '../routes';
import styles from './Layout.module.css';

export default function Layout() {
  const { timeLeft, timerRunning, startTimer } = useContext(TimerContext);
  const { answers } = useContext(AnswersContext);
  const mock = useWritingMock();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [timeUpHandled, setTimeUpHandled] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);

  const nav = useNavigate();
  const { pathname } = useLocation();
  const instructionsPath = getWritingMockPath(mock.id, 'instructions');
  const reviewPath = getWritingMockPath(mock.id, 'review');

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const timerLabel = `${minutes}:${seconds}`;

  // Progress bar percentage
  const percent = Math.max(
    0,
    Math.min(100, (timeLeft / EXAM_DURATION_SECONDS) * 100)
  );

  // Determine Next path
  let nextPath;
  if (pathname === instructionsPath) {
    nextPath = getWritingMockPath(mock.id, 'part/1');
  } else if (pathname.includes('/part/')) {
    const pathParts = pathname.split('/');
    const partNum = parseInt(pathParts[pathParts.length - 1], 10);
    // now handles parts 1–4
    nextPath = partNum < 4
      ? getWritingMockPath(mock.id, `part/${partNum + 1}`)
      : reviewPath;
  }

  // Handle Next button
  const handleNext = () => {
    if (isSubmitting) {
      return;
    }

    if (pathname === instructionsPath && nextPath) {
      startTimer();
      nav(nextPath);
    } else if (nextPath === reviewPath) {
      setShowReview(true);
    } else if (nextPath) {
      nav(nextPath);
    }
  };

  const submitExam = useCallback(async () => {
    if (submitInFlightRef.current || examSubmitted) {
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const newId = await saveSubmission(answers, {
        mockId: mock.id,
        user: auth.currentUser
      });
      localStorage.removeItem(getDraftKey(mock.id));
      clearExamTimer(mock.id);
      setExamSubmitted(true);
      nav(getWritingMockSubmissionPath(newId), { replace: true });
    } catch (err) {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
      setSubmissionError(err.message || 'Unknown submission error');
    }
  }, [answers, examSubmitted, mock.id, nav]);

  useEffect(() => {
    if (timerRunning && timeLeft <= 0 && !timeUpHandled) {
      setTimeUpHandled(true);
      setShowTimeUpModal(true);
      setShowSubmitConfirm(false);
      setShowReview(false);
      submitExam();
    }
  }, [submitExam, timerRunning, timeLeft, timeUpHandled]);

  const isExamActive = !examSubmitted && !pathname.startsWith(`${WRITING_MOCK_ROOT}/submitted/`);

  const partStatus = {
    1:
      Array.isArray(answers[1]) &&
      answers[1].some((html) => stripHtmlToText(html).trim() !== '')
        ? 'Attempted'
        : 'Not Attempted',
    2: stripHtmlToText(answers[2] || '').trim() ? 'Attempted' : 'Not Attempted',
    3:
      Array.isArray(answers[3]) &&
      answers[3].some((html) => stripHtmlToText(html).trim() !== '')
      ? 'Attempted'
      : 'Not Attempted',
    4:
      Array.isArray(answers[4]) &&
      answers[4].some((html) => stripHtmlToText(html).trim() !== '')
      ? 'Attempted'
      : 'Not Attempted',
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.timerDisplay}>
          <div className={styles.mockLabel}>{mock.title}</div>
          <div className={styles.timerValue}>{timerLabel}</div>
          <div className={styles.timerText}>Time remaining</div>
        </div>
        <div className={styles.timeBarContainer}>
          <div
            className={styles.timeBar}
            style={{ width: `${percent}%` }}
          />
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Bottom bar (only while exam active) */}
      {isExamActive && (
        <footer className={styles.bottomBar}>
          <button
            className={styles.menuButton}
            disabled={isSubmitting}
            onClick={() => setMenuOpen((open) => !open)}
          >
            ☰
          </button>
          <button
            className={styles.nextButton}
            disabled={isSubmitting}
            onClick={handleNext}
          >
            Next →
          </button>
        </footer>
      )}

      {/* Menu drawer (only while exam active) */}
      {isExamActive && menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
        >
          <nav
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className={styles.drawerList}>
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>
                  <button
                    onClick={() => {
                      if (isSubmitting) return;
                      nav(getWritingMockPath(mock.id, `part/${n}`));
                      setMenuOpen(false);
                    }}
                  >
                    Part {n}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    if (isSubmitting) return;
                    nav(WRITING_MOCK_ROOT);
                    setMenuOpen(false);
                  }}
                >
                  Mock menu
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowReview(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalHeader}>Question Review</h3>
            <p className={styles.modalSubheader}>
              Please review the following parts
            </p>
            <ul className={styles.partList}>
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className={styles.partItem}>
                  <button
                    className={styles.partButton}
                    onClick={() => {
                      if (isSubmitting) return;
                      nav(getWritingMockPath(mock.id, `part/${n}`));
                      setShowReview(false);
                    }}
                  >
                    <span>
                      <strong>Part {n}</strong>
                    </span>
                    <span>{partStatus[n]}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.modalFooter}>
              <button
                className={styles.reviewButton}
                onClick={() => {
                  if (isSubmitting) return;
                  nav(getWritingMockPath(mock.id, 'part/1'));
                  setShowReview(false);
                }}
              >
                Review Questions
              </button>
              <button
                className={styles.submitButton}
                disabled={isSubmitting}
                onClick={() => {
                  setShowReview(false);
                  setShowSubmitConfirm(true);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalHeader}>Submit Test?</h3>
            <p className={styles.modalSubheader}>
              Once you submit, you will no longer have access to the questions.
            </p>
            <div className={styles.confirmFooter}>
              <button
                className={styles.cancelButton}
                disabled={isSubmitting}
                onClick={() => setShowSubmitConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.submitConfirmButton}
                disabled={isSubmitting}
                onClick={() => {
                  setShowSubmitConfirm(false);
                  submitExam();
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit test'}
              </button>
            </div>
            {submissionError && (
              <p className={styles.errorText}>Submission failed: {submissionError}</p>
            )}
          </div>
        </div>
      )}

      {/* Time-Up Modal */}
      {showTimeUpModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => {}}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalHeader}>Time’s up!</h3>
            <p className={styles.modalSubheader}>
              {submissionError
                ? 'We could not submit automatically. Please try again.'
                : 'Your time has run out. We are submitting your exam now.'}
            </p>
            <div className={styles.confirmFooter}>
              {submissionError ? (
                <button
                  className={styles.submitConfirmButton}
                  disabled={isSubmitting}
                  onClick={submitExam}
                >
                  {isSubmitting ? 'Submitting...' : 'Try again'}
                </button>
              ) : (
                <button
                  className={styles.submitConfirmButton}
                  disabled
                >
                  Submitting...
                </button>
              )}
            </div>
            {submissionError && (
              <p className={styles.errorText}>Submission failed: {submissionError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
