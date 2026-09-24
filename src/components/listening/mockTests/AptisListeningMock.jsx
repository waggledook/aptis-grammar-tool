import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, ClipboardList, Info, LogOut, PlayCircle, Square, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../common/Seo.jsx";
import AptisListeningReview from "./AptisListeningReview.jsx";
import { LISTENING_MOCK } from "./listeningMockData.js";
import "./aptisListeningMock.css";

const questions = LISTENING_MOCK.questions;
const readyQuestionCount = questions.filter((question) => question.audioSrc && question.items.every((item) => item.answer)).length;
const mockReady = readyQuestionCount === questions.length;
const totalItemCount = questions.reduce((total, question) => total + question.items.length, 0);
const formatTime = (seconds) => `00:${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const answerKey = (questionId, itemId) => `${questionId}:${itemId}`;

export default function AptisListeningMock() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("instructions");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [plays, setPlays] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(LISTENING_MOCK.durationSeconds);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [completionReason, setCompletionReason] = useState("finished");
  const audioRef = useRef(null);
  const deadlineRef = useRef(null);
  const current = questions[index];
  const answeredCount = questions.filter((question) => question.items.every((item) => answers[answerKey(question.id, item.id)])).length;
  const answeredItemCount = questions.reduce((total, question) => total + question.items.filter((item) => answers[answerKey(question.id, item.id)]).length, 0);
  const correctAnswerCount = questions.reduce((total, question) => total + question.items.filter((item) => answers[answerKey(question.id, item.id)] === item.answer).length, 0);

  useEffect(() => {
    if (stage !== "exam") return undefined;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== "exam" || secondsLeft > 0) return;
    setCompletionReason("time expired");
    setStage("complete");
  }, [secondsLeft, stage]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
    setAudioError("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [index, stage]);

  function start() {
    deadlineRef.current = Date.now() + LISTENING_MOCK.durationSeconds * 1000;
    setSecondsLeft(LISTENING_MOCK.durationSeconds);
    setIndex(0);
    setStage("exam");
  }

  function restart() {
    setAnswers({});
    setBookmarks({});
    setPlays({});
    setDrawerOpen(false);
    setStage("instructions");
  }

  function leave() {
    if (stage === "exam" && !window.confirm("Leave this mock? Your answers will be lost.")) return;
    navigate("/listening");
  }

  function goTo(nextIndex) {
    setIndex(Math.max(0, Math.min(questions.length - 1, nextIndex)));
    setDrawerOpen(false);
  }

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio || !current.audioSrc) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      return;
    }
    if ((plays[current.id] || 0) >= 2) return;
    try {
      audio.currentTime = 0;
      await audio.play();
      setPlays((existing) => ({ ...existing, [current.id]: (existing[current.id] || 0) + 1 }));
      setPlaying(true);
      setAudioError("");
    } catch {
      setAudioError("This recording could not be played.");
    }
  }

  function finish(reason = "finished") {
    setCompletionReason(reason);
    setFinishOpen(false);
    setDrawerOpen(false);
    setStage("complete");
  }

  return (
    <div className="aptis-listening-mock">
      <Seo title="Aptis General Listening Mock | Seif Aptis Trainer" description="Practise the Aptis General Listening exam with 17 question screens and a 40-minute timer." />
      {stage === "instructions" && (
        <main className="alm-instructions">
          <p className="alm-draft">Mock 1</p>
          <h1>Aptis General Listening Instructions</h1>
          <h2>Listening</h2>
          <p>You will listen to seventeen recordings.</p>
          <p>Click on the PLAY button to listen to each recording.</p>
          <p>You can listen to each recording <strong>TWO TIMES ONLY.</strong></p>
          <p>You have 40 minutes to complete the test.</p>
          <p className="alm-instructions-last">When you click on the ‘Next’ button, the test will begin.</p>
          {!mockReady && <aside>Draft preview: {readyQuestionCount} of 17 questions {readyQuestionCount === 1 ? "has" : "have"} a recording and answer key. The remaining questions are placeholders, so this version does not calculate an overall score.</aside>}
        </main>
      )}

      {stage === "exam" && (
        <>
          <div className="alm-timer" role="timer" aria-label={`${Math.ceil(secondsLeft / 60)} minutes remaining`}>
            <strong>{formatTime(secondsLeft)}</strong>
            <span>Time remaining</span>
            <i><b style={{ width: `${(secondsLeft / LISTENING_MOCK.durationSeconds) * 100}%` }} /></i>
          </div>
          <main className="alm-paper">
            <header className="alm-question-header">
              <div><p>Listening</p><h1>Question {current.number} of {questions.length}</h1></div>
              <button className={bookmarks[current.id] ? "is-bookmarked" : ""} type="button" aria-pressed={Boolean(bookmarks[current.id])} onClick={() => setBookmarks((old) => ({ ...old, [current.id]: !old[current.id] }))}>
                <Bookmark size={19} fill={bookmarks[current.id] ? "currentColor" : "none"} /> {bookmarks[current.id] ? "Bookmarked" : "Bookmark"}
              </button>
            </header>
            <section className="alm-question-body" aria-labelledby="alm-prompt">
              <p id="alm-prompt" className="alm-prompt">{current.prompt}</p>
              <div className="alm-audio-row">
                <button type="button" onClick={toggleAudio} disabled={!current.audioSrc || (!playing && (plays[current.id] || 0) >= 2)}>
                  {playing ? <Square size={16} /> : <PlayCircle size={18} />} {playing ? "Stop" : "Play"}
                </button>
                <span>{current.audioSrc ? `${plays[current.id] || 0} of 2 plays used` : "Recording coming soon"}</span>
              </div>
              {audioError && <p className="alm-audio-error" role="alert">{audioError}</p>}
              {current.audioSrc && <audio ref={audioRef} src={current.audioSrc} preload="none" onEnded={() => setPlaying(false)} onError={() => setAudioError("This recording could not be loaded.")} />}
              {current.type === "multiple-choice" ? current.items.map((item) => (
                <div className="alm-item" key={item.id}>
                  {item.prompt && <h2>{item.prompt}</h2>}
                  <div className="alm-options" role="radiogroup" aria-label={item.prompt || current.prompt}>
                    {item.options.map((option, optionIndex) => {
                      const letter = String.fromCharCode(65 + optionIndex);
                      const selected = answers[answerKey(current.id, item.id)] === letter;
                      return <label className={selected ? "is-selected" : ""} key={letter}>
                        <input type="radio" name={answerKey(current.id, item.id)} value={letter} checked={selected} onChange={() => setAnswers((old) => ({ ...old, [answerKey(current.id, item.id)]: letter }))} />
                        <span className="alm-option-letter">{letter}</span><span className="alm-option-text">{option}</span>
                      </label>;
                    })}
                  </div>
                </div>
              )) : (
                <div className={`alm-matching ${current.type}`}>
                  {current.type === "opinion-matching" && <h2>Who expresses which opinion?</h2>}
                  {current.items.map((item, itemIndex) => <label key={item.id}>
                    <span>{current.type === "opinion-matching" ? `${itemIndex + 1}. ${item.label}` : `${item.label} ...`}</span>
                    <select value={answers[answerKey(current.id, item.id)] || ""} onChange={(event) => setAnswers((old) => ({ ...old, [answerKey(current.id, item.id)]: event.target.value }))}>
                      <option value=""> </option>
                      {current.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>)}
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {stage === "complete" && <main className="alm-complete">
        <p className="alm-draft">Mock 1</p>
        <h1>Listening mock {completionReason === "time expired" ? "time is up" : "complete"}</h1>
        <p>You completed {answeredCount} of 17 question screens and answered {answeredItemCount} of {totalItemCount} items.</p>
        {mockReady
          ? <p>You scored <strong>{correctAnswerCount} out of {totalItemCount}</strong>.</p>
          : <p>{readyQuestionCount} of 17 questions {readyQuestionCount === 1 ? "has" : "have"} a recording and answer key. The remaining questions are still being prepared, so there is no overall score yet.</p>}
        <div className="alm-complete-actions"><button type="button" onClick={() => setStage("review")}>Review answers</button><button type="button" onClick={restart}>Start again</button><button type="button" onClick={leave}>Listening practice</button></div>
      </main>}

      {stage === "review" && <AptisListeningReview questions={questions} answers={answers} onRestart={restart} onLeave={leave} />}

      {stage !== "review" && <footer className="alm-footer">
        <div className="alm-footer-left">
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Question list" title="Question list"><ClipboardList size={22} /></button>
          <button type="button" onClick={() => setInfoOpen(true)} aria-label="Instructions" title="Instructions"><Info size={22} /></button>
          <button type="button" onClick={leave} aria-label="Leave mock" title="Leave mock"><LogOut size={22} /></button>
        </div>
        <div className="alm-footer-right">
          {stage === "exam" && <button className="alm-previous" type="button" onClick={() => goTo(index - 1)} disabled={index === 0}><ArrowLeft size={20} /> Previous</button>}
          {(stage === "instructions" || stage === "exam") && <button className="alm-next" type="button" onClick={() => stage === "instructions" ? start() : index === questions.length - 1 ? setFinishOpen(true) : goTo(index + 1)}>{stage === "exam" && index === questions.length - 1 ? "Finish" : "Next"} <ArrowRight size={20} /></button>}
        </div>
      </footer>}

      {drawerOpen && <div className="alm-overlay" onClick={() => setDrawerOpen(false)}>
        <aside className="alm-drawer" onClick={(event) => event.stopPropagation()} aria-label="Question list">
          <header><div><small>Listening mock</small><h2>Questions</h2></div><button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close question list"><X size={22} /></button></header>
          <p>{answeredCount} of 17 question screens complete</p>
          <div className="alm-question-grid">{questions.map((question, questionIndex) => {
            const complete = question.items.every((item) => answers[answerKey(question.id, item.id)]);
            return <button className={`${questionIndex === index && stage === "exam" ? "is-current" : ""} ${complete ? "is-complete" : ""}`} type="button" key={question.id} onClick={() => { if (stage === "exam") goTo(questionIndex); else setDrawerOpen(false); }} disabled={stage !== "exam"} aria-label={`Question ${question.number}${complete ? ", complete" : ""}${bookmarks[question.id] ? ", bookmarked" : ""}`}>
              {question.number}{complete && <Check size={13} />}{bookmarks[question.id] && <Bookmark size={12} fill="currentColor" />}
            </button>;
          })}</div>
        </aside>
      </div>}

      {infoOpen && <div className="alm-overlay alm-dialog-overlay" onClick={() => setInfoOpen(false)}><section className="alm-dialog" role="dialog" aria-modal="true" aria-labelledby="alm-info-heading" onClick={(event) => event.stopPropagation()}><button className="alm-dialog-close" type="button" onClick={() => setInfoOpen(false)} aria-label="Close"><X size={22} /></button><h2 id="alm-info-heading">Listening instructions</h2><p>There are 17 questions and 40 minutes to complete the mock. Each recording can be played up to two times.</p>{!mockReady && <p>This is a draft preview with {readyQuestionCount} completed {readyQuestionCount === 1 ? "question" : "questions"}. No overall score is available yet.</p>}</section></div>}
      {finishOpen && <div className="alm-overlay alm-dialog-overlay" onClick={() => setFinishOpen(false)}><section className="alm-dialog" role="dialog" aria-modal="true" aria-labelledby="alm-finish-heading" onClick={(event) => event.stopPropagation()}><h2 id="alm-finish-heading">Finish listening mock?</h2><p>{answeredCount} of 17 question screens are complete. You can return to any question before finishing.</p><div><button type="button" onClick={() => setFinishOpen(false)}>Keep working</button><button type="button" onClick={() => finish()}>Finish mock</button></div></section></div>}
    </div>
  );
}
