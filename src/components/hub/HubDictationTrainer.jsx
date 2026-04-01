import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { HUB_DICTATION_ALL_SET_ID, HUB_DICTATION_SETS } from "../../data/hubDictationSets.js";
import { saveHubDictationSession } from "../../firebase";
import { toast } from "../../utils/toast";

const ROUND_DURATION = 90;
const LAST_SCORE_KEY = "seifhub-dictation-last-score";
const BEST_SCORE_KEY = "seifhub-dictation-best-score";

const spellingVariants = new Map([
  ["apologise", "apologize"],
  ["apologised", "apologized"],
  ["apologising", "apologizing"],
  ["apologises", "apologizes"],
  ["cheque", "check"],
  ["cheques", "checks"],
  ["checkout", "check out"],
  ["favourite", "favorite"],
  ["favourites", "favorites"],
  ["grey", "gray"],
  ["realise", "realize"],
  ["realised", "realized"],
  ["realising", "realizing"],
  ["realises", "realizes"],
]);

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\b[\w']+\b/g, (word) => spellingVariants.get(word) || word)
    .replace(/\s+/g, " ");
}

function tokenize(text) {
  const normalized = normalize(text);
  return normalized ? normalized.split(" ") : [];
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderCorrectSentence(text) {
  return tokenize(text)
    .map((token) => `<span class="token correct">${escapeHtml(token)}</span>`)
    .join("");
}

function compareWords(userText, correctText) {
  const userWords = tokenize(userText);
  const correctWords = tokenize(correctText);
  const dp = Array.from({ length: userWords.length + 1 }, () =>
    Array(correctWords.length + 1).fill(0)
  );

  for (let i = 0; i <= userWords.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= correctWords.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= userWords.length; i += 1) {
    for (let j = 1; j <= correctWords.length; j += 1) {
      if (userWords[i - 1] === correctWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }

  const aligned = [];
  let i = userWords.length;
  let j = correctWords.length;

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      userWords[i - 1] === correctWords[j - 1] &&
      dp[i][j] === dp[i - 1][j - 1]
    ) {
      aligned.push({ token: correctWords[j - 1], className: "correct" });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
      aligned.push({ token: "&nbsp;", className: "missing" });
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      aligned.push({ token: userWords[i - 1], className: "wrong" });
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      i -= 1;
    }
  }

  return aligned
    .reverse()
    .map(({ token, className }) => {
      const content = token === "&nbsp;" ? token : escapeHtml(token);
      return `<span class="token ${className}">${content}</span>`;
    })
    .join("");
}

function buildReportMarkup(history) {
  if (!history.length) {
    return '<p class="report-empty">No sentences were played this round.</p>';
  }

  return history
    .map((entry, index) => {
      let statusLabel = "Not answered";
      let statusClass = "bad";
      const attemptRows = [];

      if (entry.answeredCorrectly) {
        statusLabel =
          entry.correctAttempt === 1 ? "Correct on attempt 1" : "Correct on attempt 2";
        statusClass = "ok";
      } else if (entry.attempts.length > 0) {
        statusLabel =
          entry.attempts.length === 1 ? "Incorrect after 1 attempt" : "Incorrect after 2 attempts";
      }

      entry.attempts.forEach((attemptText, attemptIndex) => {
        const isCorrectAttempt =
          entry.answeredCorrectly && entry.correctAttempt === attemptIndex + 1;
        const attemptMarkup = isCorrectAttempt
          ? renderCorrectSentence(entry.sentence)
          : compareWords(attemptText, entry.sentence);
        const attemptStatus = isCorrectAttempt ? "Correct" : "Try";

        attemptRows.push(`
          <div class="report-attempt">
            <div class="report-attempt-label">Attempt ${attemptIndex + 1} · ${attemptStatus}</div>
            <div class="feedback">${attemptMarkup}</div>
          </div>
        `);
      });

      if (!attemptRows.length) {
        attemptRows.push('<p class="report-empty">No answer submitted.</p>');
      }

      const reportButtons = [
        `<button class="small-btn report-replay-btn" type="button" data-audio="${escapeHtml(
          entry.audio
        )}">▶ Replay</button>`,
      ];

      if (!entry.answeredCorrectly) {
        reportButtons.push(
          `<button class="small-btn show-correct-btn" type="button" data-target="correct-${index}">Show correct sentence</button>`
        );
      }

      const correctSentenceBlock = entry.answeredCorrectly
        ? ""
        : `
          <div class="inline-correct hidden" id="correct-${index}">
            <div class="report-attempt-label">Correct sentence</div>
            <div class="feedback">${renderCorrectSentence(entry.sentence)}</div>
          </div>
        `;

      return `
        <div class="report-item">
          <div class="report-meta">
            <span>Sentence ${index + 1}</span>
            <span class="report-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="report-attempts">${attemptRows.join("")}</div>
          <div class="report-actions">${reportButtons.join("")}</div>
          ${correctSentenceBlock}
        </div>
      `;
    })
    .join("");
}

export default function HubDictationTrainer() {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const reportRef = useRef(null);
  const latestScoreRef = useRef(0);
  const latestCompletedRef = useRef(0);
  const latestHistoryRef = useRef([]);
  const roundOverRef = useRef(false);

  const [mode, setMode] = useState("game");
  const [selectedSetId, setSelectedSetId] = useState(HUB_DICTATION_ALL_SET_ID);
  const [trainingSentenceCount, setTrainingSentenceCount] = useState(5);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeSentences, setActiveSentences] = useState([]);
  const [order, setOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [attempt, setAttempt] = useState(1);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [roundHistory, setRoundHistory] = useState([]);
  const [currentRoundEntry, setCurrentRoundEntry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [roundOver, setRoundOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [feedbackHtml, setFeedbackHtml] = useState("");
  const [message, setMessage] = useState({
    tone: "info",
    text: "Choose a set and press start when you're ready.",
  });
  const [statusText, setStatusText] = useState("Ready");
  const [nextEnabled, setNextEnabled] = useState(false);
  const [bestScore, setBestScore] = useState(() =>
    Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0)
  );
  const [reportHtml, setReportHtml] = useState("");

  const isTrainingMode = mode === "training";

  const setOptions = useMemo(
    () => [
      { value: HUB_DICTATION_ALL_SET_ID, label: "All sentences" },
      ...HUB_DICTATION_SETS.map((set) => ({ value: set.id, label: set.label })),
    ],
    []
  );

  const selectedSetLabel = useMemo(() => {
    if (selectedSetId === HUB_DICTATION_ALL_SET_ID) return "All sentences";
    return HUB_DICTATION_SETS.find((set) => set.id === selectedSetId)?.label || "All sentences";
  }, [selectedSetId]);

  const statOneValue = isTrainingMode
    ? `${Math.min(roundHistory.length, trainingSentenceCount)} / ${trainingSentenceCount}`
    : formatTime(timeLeft);

  useEffect(() => {
    latestScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    latestCompletedRef.current = completed;
  }, [completed]);

  useEffect(() => {
    latestHistoryRef.current = roundHistory;
  }, [roundHistory]);

  useEffect(() => {
    roundOverRef.current = roundOver;
  }, [roundOver]);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }

  function stopTimers() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function getSelectedSentences() {
    if (selectedSetId === HUB_DICTATION_ALL_SET_ID) {
      return HUB_DICTATION_SETS.flatMap((set) => set.sentences);
    }
    return HUB_DICTATION_SETS.find((set) => set.id === selectedSetId)?.sentences
      || HUB_DICTATION_SETS.flatMap((set) => set.sentences);
  }

  function playAudioFromPath(path) {
    stopAudio();
    const audio = new Audio(path);
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    audio.play().catch(() => {
      setStatusText("Audio error");
      setMessage({
        tone: "bad",
        text: `Could not play ${path}. Please check that the audio file exists.`,
      });
    });
  }

  function getSentenceIndex(index = currentIndex, currentOrder = order) {
    return currentOrder[index];
  }

  function beginRoundEntry(sentences, currentOrder, index) {
    const sentence = sentences[getSentenceIndex(index, currentOrder)];
    return {
      sentence: sentence.text,
      acceptedTexts: sentence.acceptedTexts || [sentence.text],
      audio: sentence.audio,
      attempts: [],
      answeredCorrectly: false,
      correctAttempt: null,
    };
  }

  function loadSentence(sentences, currentOrder, index) {
    if (roundOver) return;
    const entry = beginRoundEntry(sentences, currentOrder, index);
    setFeedbackHtml("");
    setMessage({ tone: "info", text: "Listen and type the sentence." });
    setStatusText(selectedSetLabel);
    setInputValue("");
    setNextEnabled(false);
    setCurrentRoundEntry(entry);
    setRoundHistory((prev) => [...prev, entry]);
    window.setTimeout(() => inputRef.current?.focus(), 0);
    playAudioFromPath(sentences[getSentenceIndex(index, currentOrder)].audio);
  }

  function endGame(
    finalScore = latestScoreRef.current,
    finalCompleted = latestCompletedRef.current,
    finalHistory = latestHistoryRef.current
  ) {
    if (roundOverRef.current) return;

    stopTimers();
    stopAudio();
    setRoundOver(true);
    setGameStarted(false);
    setStatusText("Finished");

    const nextBestScore = Math.max(
      finalScore,
      Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0)
    );
    window.localStorage.setItem(LAST_SCORE_KEY, String(finalScore));
    window.localStorage.setItem(BEST_SCORE_KEY, String(nextBestScore));
    setBestScore(nextBestScore);

    setReportHtml(buildReportMarkup(finalHistory));
    if (isTrainingMode) {
      setMessage({
        tone: "ok",
        text: `Training complete. Correct sentences: ${finalCompleted} out of ${trainingSentenceCount}.`,
      });
    } else {
      setMessage({
        tone: "ok",
        text: `Time's up. Final score: ${finalScore}. Sentences completed: ${finalCompleted}. Best score: ${nextBestScore}.`,
      });
    }

    saveHubDictationSession({
      mode,
      setId: selectedSetId,
      setLabel: selectedSetLabel,
      score: finalScore,
      completed: finalCompleted,
      totalPlayed: finalHistory.length,
      trainingTarget: isTrainingMode ? trainingSentenceCount : null,
      history: finalHistory,
    }).catch((error) => {
      console.error("[HubDictationTrainer] failed to save session", error);
      toast("The dictation session finished, but it could not be saved to the activity log.");
    });
  }

  function nextSentence(forceAdvance = false) {
    if ((!nextEnabled && !forceAdvance) || roundOver) return;

    if (isTrainingMode && latestHistoryRef.current.length >= trainingSentenceCount) {
      endGame(
        latestScoreRef.current,
        latestCompletedRef.current,
        latestHistoryRef.current
      );
      return;
    }

    let nextOrder = order;
    let nextActiveSentences = activeSentences;
    let nextIndex;

    if (currentIndex >= order.length - 1) {
      nextActiveSentences = getSelectedSentences();
      nextOrder = shuffle(nextActiveSentences.map((_, index) => index));
      setActiveSentences(nextActiveSentences);
      setOrder(nextOrder);
      nextIndex = 0;
    } else {
      nextIndex = currentIndex + 1;
    }

    setCurrentIndex(nextIndex);
    setAttempt(1);
    loadSentence(nextActiveSentences, nextOrder, nextIndex);
  }

  function submitAnswer() {
    if (currentIndex < 0 || roundOver || !currentRoundEntry) return;

    const sentenceConfig = activeSentences[getSentenceIndex()];
    const target = sentenceConfig.text;
    const acceptedTargets = sentenceConfig.acceptedTexts || [target];
    const typed = inputValue;
    const updatedEntry = {
      ...currentRoundEntry,
      attempts: [...currentRoundEntry.attempts, typed],
    };
    setCurrentRoundEntry(updatedEntry);
    setFeedbackHtml(compareWords(typed, target));

    if (acceptedTargets.some((candidate) => normalize(typed) === normalize(candidate))) {
      const points = attempt === 1 ? 10 : 5;
      const correctEntry = {
        ...updatedEntry,
        answeredCorrectly: true,
        correctAttempt: attempt,
      };
      const nextHistory = [...roundHistory];
      nextHistory[nextHistory.length - 1] = correctEntry;

      setCurrentRoundEntry(correctEntry);
      setRoundHistory(nextHistory);
      setScore((prev) => prev + points);
      setCompleted((prev) => prev + 1);
      setStatusText("Correct");
      setMessage({ tone: "ok", text: `Correct. +${points} points.` });
      setNextEnabled(false);

      timeoutRef.current = window.setTimeout(() => {
        if (!roundOverRef.current) nextSentence(true);
      }, 700);
      return;
    }

    if (attempt === 1) {
      const nextHistory = [...roundHistory];
      nextHistory[nextHistory.length - 1] = updatedEntry;
      setRoundHistory(nextHistory);
      setAttempt(2);
      setStatusText("Try again");
      setMessage({ tone: "bad", text: "Not quite. Listen again and try one more time." });
      playAudioFromPath(activeSentences[getSentenceIndex()].audio);
      return;
    }

    const nextHistory = [...roundHistory];
    nextHistory[nextHistory.length - 1] = updatedEntry;
    setRoundHistory(nextHistory);
    setStatusText("Answer shown");
    setMessage({ tone: "bad", text: "Second attempt incorrect." });
    setNextEnabled(true);
  }

  function startGame() {
    stopTimers();
    stopAudio();

    const sentences = getSelectedSentences();
    const nextOrder = shuffle(sentences.map((_, index) => index));
    const nextIndex = 0;

    setActiveSentences(sentences);
    setOrder(nextOrder);
    setCurrentIndex(nextIndex);
    setAttempt(1);
    setScore(0);
    setCompleted(0);
    setRoundHistory([]);
    setCurrentRoundEntry(null);
    setTimeLeft(isTrainingMode ? 0 : ROUND_DURATION);
    setRoundOver(false);
    roundOverRef.current = false;
    setGameStarted(true);
    setReportHtml("");
    setStatusText(selectedSetLabel);
    setMessage({
      tone: "info",
      text: `Playing from ${selectedSetLabel}.`,
    });

    if (!isTrainingMode) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
            endGame(
              latestScoreRef.current,
              latestCompletedRef.current,
              latestHistoryRef.current
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    const firstEntry = beginRoundEntry(sentences, nextOrder, nextIndex);
    setRoundHistory([firstEntry]);
    setCurrentRoundEntry(firstEntry);
    setFeedbackHtml("");
    setInputValue("");
    setNextEnabled(false);

    window.setTimeout(() => {
      inputRef.current?.focus();
      playAudioFromPath(sentences[getSentenceIndex(nextIndex, nextOrder)].audio);
    }, 0);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      stopTimers();
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || roundOver || isTrainingMode) return;
    if (timeLeft <= 0) {
      endGame();
    }
  }, [timeLeft, gameStarted, roundOver, isTrainingMode]);

  function handleReportClick(event) {
    const replayButton = event.target.closest(".report-replay-btn");
    if (replayButton) {
      playAudioFromPath(replayButton.dataset.audio);
      return;
    }

    const showCorrectButton = event.target.closest(".show-correct-btn");
    if (showCorrectButton) {
      const targetId = showCorrectButton.dataset.target;
      const correctBlock = reportRef.current?.querySelector(`#${CSS.escape(targetId)}`);
      if (!correctBlock) return;
      const isHidden = correctBlock.classList.toggle("hidden");
      showCorrectButton.textContent = isHidden ? "Show correct sentence" : "Hide correct sentence";
    }
  }

  const finalSummary = isTrainingMode
    ? `Training complete. Correct sentences: ${completed} out of ${trainingSentenceCount}.`
    : `Time's up. Final score: ${score}. Sentences completed: ${completed}. Best score: ${bestScore}.`;

  return (
    <div className="hub-dictation-page">
      <Seo
        title="Dictation Trainer | Seif Hub"
        description="Play the Seif Hub dictation trainer in game mode or training mode."
      />

      <div className="hub-dictation-app">
        <div className="hub-dictation-header">
          <button className="review-btn" onClick={() => navigate(getSitePath("/listening"))}>
            ← Back to listening
          </button>
          <h1>Dictation Trainer</h1>
          <p className="hub-dictation-sub">
            Listen carefully, type what you hear, and train your listening accuracy inside the hub.
          </p>
        </div>

        <div className="hub-dictation-stats">
          <div className="hub-dictation-stat">
            <div className="stat-label">{isTrainingMode ? "Sentence" : "Time Left"}</div>
            <div className="stat-value">{statOneValue}</div>
          </div>
          <div className="hub-dictation-stat">
            <div className="stat-label">Attempt</div>
            <div className="stat-value">{currentIndex >= 0 && gameStarted ? `${attempt} / 2` : "—"}</div>
          </div>
          <div className="hub-dictation-stat">
            <div className="stat-label">{isTrainingMode ? "Correct" : "Score"}</div>
            <div className="stat-value">{isTrainingMode ? completed : score}</div>
          </div>
          <div className="hub-dictation-stat">
            <div className="stat-label">Status</div>
            <div className="stat-value">{statusText}</div>
          </div>
        </div>

        <div className="hub-dictation-card">
          <div className="hub-dictation-settings">
            <div className="field">
              <label><strong>Mode</strong></label>
              <div className="mode-toggle">
                <label className="switch" htmlFor="modeToggle">
                  <input
                    id="modeToggle"
                    type="checkbox"
                    checked={isTrainingMode}
                    onChange={(event) => setMode(event.target.checked ? "training" : "game")}
                    disabled={gameStarted}
                  />
                  <span className="slider" />
                </label>
                <div className="mode-toggle-text">
                  <div className="mode-toggle-label">{isTrainingMode ? "Training mode" : "Game mode"}</div>
                  <div className="mode-toggle-value">Switch on for training</div>
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="setSelect"><strong>Sentence set</strong></label>
              <select
                id="setSelect"
                value={selectedSetId}
                onChange={(event) => setSelectedSetId(event.target.value)}
                disabled={gameStarted}
              >
                {setOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {isTrainingMode && (
              <>
                <div className="field">
                  <label htmlFor="trainingCountSelect"><strong>Training sentences</strong></label>
                  <select
                    id="trainingCountSelect"
                    value={trainingSentenceCount}
                    onChange={(event) => setTrainingSentenceCount(Number(event.target.value))}
                    disabled={gameStarted}
                  >
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="speedRange"><strong>Playback speed</strong></label>
                  <input
                    id="speedRange"
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={playbackRate}
                    onChange={(event) => setPlaybackRate(Number(event.target.value))}
                    disabled={gameStarted}
                  />
                  <div className="help">{Math.round(playbackRate * 100)}%</div>
                </div>
              </>
            )}
          </div>

          <p className="mode-summary">
            {isTrainingMode
              ? "Training mode lets you choose 1 to 10 sentences, removes the timer, and plays audio at your chosen speed."
              : "Game mode uses a 1 minute 30 second round with shuffled sentences and scoring."}
          </p>
        </div>

        {!gameStarted && !roundOver && (
          <div className="hub-dictation-card">
            <p style={{ marginTop: 0 }}><strong>How it works</strong></p>
            <ul className="list">
              <li>Click <strong>Start</strong> to begin.</li>
              <li>If you leave the set on <strong>All sentences</strong>, the round mixes every sentence in the app.</li>
              <li>You have <strong>1 minute 30 seconds</strong> per round in game mode.</li>
              <li>Each sentence can be answered twice.</li>
              <li>You get <strong>10 points</strong> on the first attempt and <strong>5 points</strong> on the second.</li>
              <li>Press <strong>Enter</strong> to check your answer.</li>
            </ul>
            <div className="controls">
              <button className="primary" onClick={startGame}>
                {isTrainingMode ? "Start training" : "Start"}
              </button>
            </div>
          </div>
        )}

        {gameStarted && (
          <>
            <div className="hub-dictation-card">
              <div className="controls" style={{ marginTop: 0, marginBottom: "14px" }}>
                <button className="primary" onClick={() => playAudioFromPath(activeSentences[getSentenceIndex()].audio)}>
                  ▶ Play audio
                </button>
                <button onClick={() => playAudioFromPath(activeSentences[getSentenceIndex()].audio)}>
                  ↻ Replay
                </button>
                <button className="warn" onClick={() => nextSentence()} disabled={!nextEnabled}>
                  Next sentence
                </button>
              </div>

              <label htmlFor="userInput"><strong>Type what you hear</strong></label>
              <textarea
                id="userInput"
                ref={inputRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Type the sentence here..."
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                autoComplete="off"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitAnswer();
                  }
                }}
              />
              <div className="help">
                Punctuation is ignored. Apostrophes are accepted in curly or straight form.
              </div>

              <div className="controls">
                <button className="success" onClick={submitAnswer}>
                  Check answer
                </button>
              </div>
            </div>

            <div className="hub-dictation-card">
              <p style={{ marginTop: 0 }}><strong>Feedback</strong></p>
              <div className="feedback" dangerouslySetInnerHTML={{ __html: feedbackHtml }} />
              <div className={`message ${message.tone}`}>{message.text}</div>
            </div>
          </>
        )}

        {roundOver && (
          <div className="hub-dictation-card">
            <p style={{ marginTop: 0 }}><strong>Finished</strong></p>
            <p>{finalSummary}</p>
            <div
              ref={reportRef}
              className="report-list"
              onClick={handleReportClick}
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
            <div className="controls">
              <button className="primary" onClick={startGame}>Play again</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hub-dictation-page {
          width: 100%;
        }

        .hub-dictation-app {
          max-width: 980px;
          margin: 0 auto;
        }

        .hub-dictation-header {
          margin-bottom: 1rem;
        }

        .hub-dictation-header h1 {
          margin: 0.9rem 0 0.5rem;
        }

        .hub-dictation-sub {
          margin: 0;
          color: #cdd9f4;
          line-height: 1.5;
        }

        .hub-dictation-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 1rem;
        }

        .hub-dictation-stat,
        .hub-dictation-card {
          background: linear-gradient(180deg, rgba(24,41,79,0.98), rgba(20,36,71,0.98));
          border: 1px solid rgba(53, 80, 142, 0.8);
          border-radius: 16px;
          box-shadow: 0 10px 22px rgba(0,0,0,0.12);
        }

        .hub-dictation-stat {
          padding: 14px;
        }

        .hub-dictation-card {
          padding: 20px;
          margin-bottom: 18px;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
        }

        .hub-dictation-settings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          align-items: end;
        }

        .field {
          display: grid;
          gap: 8px;
        }

        .mode-toggle {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .switch {
          position: relative;
          display: inline-flex;
          width: 78px;
          height: 42px;
          cursor: pointer;
        }

        .switch input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .slider {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: #334155;
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: inset 0 1px 3px rgba(0,0,0,.35);
          transition: background .2s ease;
        }

        .slider::before {
          content: "";
          position: absolute;
          top: 4px;
          left: 4px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f8fafc;
          box-shadow: 0 2px 8px rgba(0,0,0,.35);
          transition: transform .2s ease;
        }

        .switch input:checked + .slider {
          background: rgba(56,189,248,.28);
        }

        .switch input:checked + .slider::before {
          transform: translateX(36px);
        }

        .mode-toggle-text {
          display: grid;
          gap: 2px;
        }

        .mode-toggle-label {
          font-weight: 700;
        }

        .mode-toggle-value,
        .mode-summary,
        .help,
        .list,
        .report-empty,
        .report-meta {
          color: #94a3b8;
        }

        .mode-summary {
          margin: 14px 0 0;
          line-height: 1.5;
        }

        select,
        textarea {
          width: 100%;
          background: #0b1220;
          color: #e5e7eb;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 15px;
        }

        textarea {
          min-height: 88px;
          resize: vertical;
          font-size: 18px;
          line-height: 1.5;
        }

        input[type="range"] {
          width: 100%;
          accent-color: #38bdf8;
        }

        .controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .controls button,
        .small-btn {
          border: 0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          background: #334155;
          color: white;
        }

        .controls .primary {
          background: #38bdf8;
          color: #082f49;
        }

        .controls .success {
          background: #22c55e;
          color: #052e16;
        }

        .controls .warn {
          background: #f59e0b;
          color: #451a03;
        }

        .controls button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .feedback {
          min-height: 92px;
          line-height: 1.8;
          font-size: 20px;
        }

        .token {
          display: inline-block;
          margin: 0 6px 8px 0;
          padding: 3px 8px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: #0b1220;
        }

        .correct {
          color: #bbf7d0;
          background: rgba(34,197,94,.14);
          border-color: rgba(34,197,94,.35);
        }

        .wrong {
          color: #fecaca;
          background: rgba(239,68,68,.14);
          border-color: rgba(239,68,68,.35);
        }

        .missing {
          color: transparent;
          background: rgba(239,68,68,.2);
          border-color: rgba(239,68,68,.45);
          min-width: 38px;
          text-decoration: none;
        }

        .message {
          margin-top: 14px;
          font-weight: 700;
        }

        .message.ok,
        .report-status.ok {
          color: #86efac;
        }

        .message.bad,
        .report-status.bad {
          color: #fca5a5;
        }

        .message.info {
          color: #7dd3fc;
        }

        .list {
          margin: 0;
          padding-left: 20px;
          line-height: 1.7;
        }

        .report-list,
        .report-attempts {
          display: grid;
          gap: 14px;
        }

        .report-item,
        .report-attempt {
          display: grid;
          gap: 6px;
        }

        .report-item {
          background: #0b1220;
          border: 1px solid #334155;
          border-radius: 14px;
          padding: 14px;
        }

        .report-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .report-attempt-label {
          color: #94a3b8;
          font-size: 14px;
        }

        .report-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .inline-correct {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #334155;
        }

        .small-btn {
          padding: 8px 12px;
          font-size: 13px;
          border-radius: 10px;
        }

        .hidden {
          display: none;
        }

        @media (max-width: 700px) {
          .hub-dictation-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .feedback {
            font-size: 18px;
          }

          textarea {
            min-height: 110px;
          }
        }
      `}</style>
    </div>
  );
}
