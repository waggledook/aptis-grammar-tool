import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { HUB_DICTATION_ALL_SET_ID, HUB_DICTATION_SETS } from "../../data/hubDictationSets.js";
import { getAssignedActivity, saveHubDictationSession } from "../../firebase";
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

const numberWordVariants = new Map([
  ["0", "zero"],
  ["1", "one"],
  ["2", "two"],
  ["3", "three"],
  ["4", "four"],
  ["5", "five"],
  ["6", "six"],
  ["7", "seven"],
  ["8", "eight"],
  ["9", "nine"],
  ["10", "ten"],
  ["11", "eleven"],
  ["12", "twelve"],
  ["13", "thirteen"],
  ["14", "fourteen"],
  ["15", "fifteen"],
  ["16", "sixteen"],
  ["17", "seventeen"],
  ["18", "eighteen"],
  ["19", "nineteen"],
  ["20", "twenty"],
  ["100", "one hundred"],
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
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\b[\w']+\b/g, (word) => spellingVariants.get(word) || word)
    .replace(/\b\d+\b/g, (word) => numberWordVariants.get(word) || word)
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

function maskToken(token) {
  const length = Math.max(String(token || "").length, 1);
  return "•".repeat(length);
}

function renderClueSummaryMarkup(text, clueLevels = {}) {
  const tokens = tokenize(text);
  const used = tokens
    .map((token, index) => ({ token, index, level: Number(clueLevels?.[index] || 0) }))
    .filter((entry) => entry.level > 0);

  if (!used.length) return "";

  return used
    .map(({ token, index, level }) => {
      const label = level >= 2 ? token : `${token.charAt(0)}…`;
      const className = level >= 2 ? "clue-word" : "clue-letter";
      return `<span class="token ${className}">Word ${index + 1}: ${escapeHtml(label)}</span>`;
    })
    .join("");
}

function getComparisonTokens(userText, correctText) {
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
      aligned.push({
        token: correctWords[j - 1],
        className: "correct",
        correctIndex: j - 1,
        correctToken: correctWords[j - 1],
      });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
      aligned.push({
        token: "&nbsp;",
        className: "missing",
        correctIndex: j - 1,
        correctToken: correctWords[j - 1],
      });
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      aligned.push({
        token: userWords[i - 1],
        className: "wrong",
        correctIndex: j - 1,
        correctToken: correctWords[j - 1],
      });
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      aligned.push({
        token: userWords[i - 1],
        className: "wrong",
        correctIndex: null,
        correctToken: "",
      });
      i -= 1;
    }
  }

  return aligned.reverse();
}

function compareWords(userText, correctText) {
  return getComparisonTokens(userText, correctText)
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
        statusLabel = `Correct on attempt ${entry.correctAttempt || 1}`;
        statusClass = "ok";
      } else if (entry.attempts.length > 0) {
        statusLabel = `Incorrect after ${entry.attempts.length} attempt${entry.attempts.length === 1 ? "" : "s"}`;
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

      const clueMarkup = renderClueSummaryMarkup(entry.sentence, entry.clueLevels);

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
          ${clueMarkup
            ? `<div class="report-clues"><div class="report-attempt-label">Clues used</div><div class="feedback">${clueMarkup}</div></div>`
            : ""}
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
  const location = useLocation();
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const reportRef = useRef(null);
  const latestScoreRef = useRef(0);
  const latestCompletedRef = useRef(0);
  const latestHistoryRef = useRef([]);
  const roundOverRef = useRef(false);

  const [mode, setMode] = useState("training");
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
  const [feedbackTokens, setFeedbackTokens] = useState([]);
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
  const [assignment, setAssignment] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const assignmentId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const directAssignmentId = params.get("assignment");
    if (directAssignmentId) return directAssignmentId;

    const malformedSiteValue = params.get("site") || "";
    const malformedMatch = malformedSiteValue.match(/[?&]assignment=([^&]+)/);
    return malformedMatch ? decodeURIComponent(malformedMatch[1]) : "";
  }, [location.search]);
  const assignmentSentences = assignment?.dictationConfig?.sentences || [];
  const isAssignmentMode = !!assignmentId && !!assignment && assignmentSentences.length > 0;
  const isTrainingMode = isAssignmentMode || mode === "training";

  const setOptions = useMemo(
    () => [
      { value: HUB_DICTATION_ALL_SET_ID, label: "All sentences" },
      ...HUB_DICTATION_SETS.map((set) => ({ value: set.id, label: set.label })),
    ],
    []
  );

  const selectedSetLabel = useMemo(() => {
    if (isAssignmentMode) return assignment.activityLabel || "Assigned dictation";
    if (selectedSetId === HUB_DICTATION_ALL_SET_ID) return "All sentences";
    return HUB_DICTATION_SETS.find((set) => set.id === selectedSetId)?.label || "All sentences";
  }, [assignment, isAssignmentMode, selectedSetId]);

  const statOneValue = isTrainingMode
    ? `${Math.min(roundHistory.length, trainingSentenceCount)} / ${trainingSentenceCount}`
    : formatTime(timeLeft);
  const answerAlreadyCorrect = !!currentRoundEntry?.answeredCorrectly;
  const attemptDisplayValue =
    currentIndex >= 0 && gameStarted
      ? isTrainingMode
        ? String(attempt)
        : `${attempt} / 2`
      : "—";
  const canShowClueHint =
    isTrainingMode &&
    !answerAlreadyCorrect &&
    currentRoundEntry &&
    currentRoundEntry.attempts.length > 0 &&
    feedbackTokens.some((token) => token.className === "wrong" || token.className === "missing");

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
    if (isAssignmentMode) {
      return assignmentSentences.map((sentence) => ({
        text: sentence.text,
        acceptedTexts: sentence.acceptedTexts || [sentence.text],
        audio: sentence.audio,
      }));
    }
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
      clueLevels: {},
      clueEvents: [],
      answeredCorrectly: false,
      correctAttempt: null,
    };
  }

  function updateCurrentRoundEntry(updater) {
    setCurrentRoundEntry((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      setRoundHistory((historyPrev) => {
        if (!historyPrev.length) return historyPrev;
        const nextHistory = [...historyPrev];
        nextHistory[nextHistory.length - 1] = next;
        return nextHistory;
      });
      return next;
    });
  }

  function handleClueWordClick(wordIndex) {
    if (!isTrainingMode || roundOver || answerAlreadyCorrect || !currentRoundEntry) return;

    const clueToken = tokenize(currentRoundEntry.sentence)?.[wordIndex] || "";
    const currentLevel = Number(currentRoundEntry.clueLevels?.[wordIndex] || 0);
    if (!clueToken || currentLevel >= 2) return;

    updateCurrentRoundEntry((prev) => ({
      ...prev,
      clueLevels: {
        ...(prev.clueLevels || {}),
        [wordIndex]: currentLevel + 1,
      },
      clueEvents: [
        ...(prev.clueEvents || []),
        { wordIndex, level: currentLevel + 1, attempt },
      ],
    }));

    setStatusText("Clue used");
    setMessage({
      tone: "info",
      text:
        currentLevel === 0
          ? `Clue: word ${wordIndex + 1} starts with "${clueToken.charAt(0)}".`
          : `Clue revealed: word ${wordIndex + 1} is "${clueToken}".`,
    });
  }

  function renderFeedbackToken(token, index) {
    const clueLevel = Number(currentRoundEntry?.clueLevels?.[token.correctIndex] || 0);
    const canShowClue =
      isTrainingMode &&
      !answerAlreadyCorrect &&
      currentRoundEntry &&
      currentRoundEntry.attempts.length > 0 &&
      (token.className === "wrong" || token.className === "missing") &&
      Number.isInteger(token.correctIndex);

    const isClued = canShowClue && clueLevel > 0;
    const displayText = isClued
      ? clueLevel >= 2
        ? token.correctToken
        : `${token.correctToken?.charAt(0) || ""}…`
      : token.token;
    const className = isClued
      ? clueLevel >= 2
        ? "clue-word"
        : "clue-letter"
      : token.className;
    const content = displayText === "&nbsp;" ? "\u00A0" : displayText;

    if (canShowClue) {
      return (
        <button
          key={`feedback-token-${index}`}
          type="button"
          className={`token token-button ${className}`}
          onClick={() => handleClueWordClick(token.correctIndex)}
          disabled={clueLevel >= 2}
          title={clueLevel === 0 ? "Click for first-letter clue" : clueLevel === 1 ? "Click to reveal the word" : "Word revealed"}
        >
          {content}
        </button>
      );
    }

    return (
      <span key={`feedback-token-${index}`} className={`token ${className}`}>
        {content}
      </span>
    );
  }

  function loadSentence(sentences, currentOrder, index) {
    if (roundOver) return;
    const entry = beginRoundEntry(sentences, currentOrder, index);
    setFeedbackHtml("");
    setFeedbackTokens([]);
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
      assignmentId: assignment?.id || "",
      assignmentLabel: assignment?.activityLabel || "",
      teacherUid: assignment?.teacherUid || "",
      teacherName: assignment?.teacherName || "",
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
    if (currentIndex < 0 || roundOver || !currentRoundEntry || answerAlreadyCorrect) return;

    const sentenceConfig = activeSentences[getSentenceIndex()];
    const target = sentenceConfig.text;
    const acceptedTargets = sentenceConfig.acceptedTexts || [target];
    const typed = inputValue;
    const updatedEntry = {
      ...currentRoundEntry,
      attempts: [...currentRoundEntry.attempts, typed],
    };
    setCurrentRoundEntry(updatedEntry);
    setFeedbackTokens(getComparisonTokens(typed, target));
    setFeedbackHtml(compareWords(typed, target));

    if (acceptedTargets.some((candidate) => normalize(typed) === normalize(candidate))) {
      const points = isTrainingMode ? 0 : attempt === 1 ? 10 : 5;
      const correctEntry = {
        ...updatedEntry,
        answeredCorrectly: true,
        correctAttempt: attempt,
      };
      const nextHistory = [...roundHistory];
      nextHistory[nextHistory.length - 1] = correctEntry;

      setCurrentRoundEntry(correctEntry);
      setRoundHistory(nextHistory);
      if (!isTrainingMode) {
        setScore((prev) => prev + points);
      }
      setCompleted((prev) => prev + 1);
      setStatusText("Correct");
      setMessage({
        tone: "ok",
        text: isTrainingMode ? `Correct on attempt ${attempt}.` : `Correct. +${points} points.`,
      });
      setNextEnabled(false);

      timeoutRef.current = window.setTimeout(() => {
        if (!roundOverRef.current) nextSentence(true);
      }, 700);
      return;
    }

    if (isTrainingMode) {
      const nextHistory = [...roundHistory];
      nextHistory[nextHistory.length - 1] = updatedEntry;
      setRoundHistory(nextHistory);
      setAttempt((prev) => prev + 1);
      setStatusText("Try again");
      setMessage({ tone: "bad", text: `Attempt ${attempt} incorrect. Listen again and try attempt ${attempt + 1}.` });
      playAudioFromPath(activeSentences[getSentenceIndex()].audio);
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

  function revealAnswer() {
    if (!isTrainingMode || currentIndex < 0 || roundOver || !currentRoundEntry) return;

    const sentenceConfig = activeSentences[getSentenceIndex()];
    setFeedbackHtml(renderCorrectSentence(sentenceConfig.text));
    setFeedbackTokens(
      tokenize(sentenceConfig.text).map((token, index) => ({
        token,
        className: "correct",
        correctIndex: index,
        correctToken: token,
      }))
    );
    setStatusText("Answer revealed");
    setMessage({
      tone: "info",
      text: "Answer revealed. Replay it if you want, then move on when you're ready.",
    });
    setNextEnabled(true);
  }

  function startGame() {
    if (assignmentId && assignmentLoading) {
      toast("Still loading the assigned dictation.");
      return;
    }

    if (assignmentId && !isAssignmentMode) {
      toast("This assigned dictation could not be loaded.");
      return;
    }

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
    setFeedbackTokens([]);
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
    let alive = true;

    async function loadAssignment() {
      if (!assignmentId) {
        setAssignment(null);
        setAssignmentLoading(false);
        return;
      }

      setAssignmentLoading(true);
      try {
        const row = await getAssignedActivity(assignmentId);
        if (!alive) return;
        if (row?.activityType === "dictation" && Array.isArray(row?.dictationConfig?.sentences)) {
          setAssignment(row);
          setMode("training");
          setTrainingSentenceCount(row.dictationConfig.sentences.length || 1);
          setMessage({
            tone: "info",
            text: "Assigned dictation loaded. Press start when you're ready.",
          });
        } else {
          setAssignment(null);
          setMessage({
            tone: "bad",
            text: "This assigned dictation could not be found.",
          });
        }
      } catch (error) {
        console.error("[HubDictationTrainer] failed to load assignment", error);
        if (!alive) return;
        setAssignment(null);
        setMessage({
          tone: "bad",
          text: "This assigned dictation could not be loaded.",
        });
      } finally {
        if (alive) setAssignmentLoading(false);
      }
    }

    loadAssignment();
    return () => {
      alive = false;
    };
  }, [assignmentId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (!gameStarted || roundOver || answerAlreadyCorrect) return;
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [currentIndex, gameStarted, roundOver, answerAlreadyCorrect]);

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
  const headerSummary = isAssignmentMode
    ? `${assignment.teacherName || "Your teacher"} set ${assignmentSentences.length} sentence${assignmentSentences.length === 1 ? "" : "s"} for you.`
    : "Listen carefully, type what you hear, and train your listening accuracy.";
  const statusTone = message.tone === "bad" ? "warn" : message.tone === "ok" ? "success" : "neutral";

  return (
    <div className="hub-dictation-page">
      <Seo
        title="Dictation Trainer | Seif Hub"
        description="Play the Seif Hub dictation trainer in game mode or training mode."
      />

      <div className="hub-dictation-app">
        <div className="hub-dictation-header">
          <div className="hub-dictation-header-top">
            <button className="review-btn" onClick={() => navigate(getSitePath("/listening"))}>
              ← Back to listening
            </button>
          </div>
          <div className="hub-dictation-title-row">
            <div>
              <h1>{isAssignmentMode ? "Assigned Dictation" : "Dictation Trainer"}</h1>
              <p className="hub-dictation-sub">{headerSummary}</p>
            </div>
          </div>
        </div>

        <div className="hub-dictation-statusbar">
          <span className="statusbar-item">
            <span className="statusbar-label">{isTrainingMode ? "Sentence" : "Time"}</span>
            <strong className="statusbar-value">{statOneValue}</strong>
          </span>
          <span className="statusbar-sep" aria-hidden="true">·</span>
          <span className="statusbar-item">
            <span className="statusbar-label">Attempt</span>
            <strong className="statusbar-value">{attemptDisplayValue}</strong>
          </span>
          <span className="statusbar-sep" aria-hidden="true">·</span>
          <span className="statusbar-item">
            <span className="statusbar-label">{isTrainingMode ? "Correct" : "Score"}</span>
            <strong className="statusbar-value">{isTrainingMode ? completed : score}</strong>
          </span>
          <span className="statusbar-sep" aria-hidden="true">·</span>
          <span className={`statusbar-item statusbar-status tone-${statusTone}`}>
            <span className="statusbar-label">Status</span>
            <strong className="statusbar-value">{statusText}</strong>
          </span>
        </div>

        <div className="hub-dictation-card settings-card">
          {!isAssignmentMode ? (
          <div className="hub-dictation-settings">
            {!gameStarted ? (
              <>
                <div className="field">
                  <label><strong>Mode</strong></label>
                  <div className="mode-toggle">
                    <label className="switch" htmlFor="modeToggle">
                      <input
                        id="modeToggle"
                        type="checkbox"
                        checked={!isTrainingMode}
                        onChange={(event) => setMode(event.target.checked ? "game" : "training")}
                        disabled={gameStarted}
                      />
                      <span className="slider" />
                    </label>
                    <div className="mode-toggle-text">
                      <div className="mode-toggle-label">{isTrainingMode ? "Training mode" : "Game mode"}</div>
                      <div className="mode-toggle-value">
                        {isTrainingMode ? "Switch on for game mode" : "Switch off for training mode"}
                      </div>
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
                <div className="field compact-select">
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
                )}
              </>
            ) : null}

            {isTrainingMode ? (
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
                />
                <div className="help">{Math.round(playbackRate * 100)}%</div>
              </div>
            ) : !gameStarted ? (
              <div className="field settings-static-note">
                <label><strong>Round</strong></label>
                <div className="help">Game mode uses a 1 minute 30 second timed round.</div>
              </div>
            ) : null}
          </div>
          ) : (
            <div className="hub-dictation-assignment-note">
              <div className="assignment-note-head">
                <strong>{assignment.activityLabel || "Assigned dictation"}</strong>
                {assignment.notes ? <p>{assignment.notes}</p> : null}
              </div>
              <div className="field">
                <label htmlFor="assignmentSpeedRange"><strong>Playback speed</strong></label>
                <input
                  id="assignmentSpeedRange"
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={playbackRate}
                  onChange={(event) => setPlaybackRate(Number(event.target.value))}
                />
                <div className="help">{Math.round(playbackRate * 100)}%</div>
              </div>
            </div>
          )}

          <p className="mode-summary">
            {isAssignmentMode
              ? "Complete this custom set in training mode. Your teacher will see the same attempt feedback after you finish."
              : isTrainingMode
              ? "Training mode lets you choose 1 to 10 sentences, removes the timer, and plays audio at your chosen speed."
              : "Game mode uses a 1 minute 30 second round with shuffled sentences and scoring."}
          </p>
          {!gameStarted && !roundOver ? (
            <div className="settings-footer">
              <ul className="list compact-list">
                <li>Press Start when you’re ready.</li>
                <li>{isTrainingMode ? "If your answer is wrong, the audio plays again and your next attempt begins." : "Each sentence gives you two tries and score-based feedback."}</li>
                {!isAssignmentMode && !isTrainingMode ? <li>You have 1 minute 30 seconds to score as highly as possible.</li> : null}
                <li>Press <strong>Enter</strong> to check your answer.</li>
              </ul>
              <button className="primary settings-start-btn" onClick={startGame}>
                {isTrainingMode ? "Start training" : "Start"}
              </button>
            </div>
          ) : null}
        </div>

        {gameStarted && (
          <>
            <div className="hub-dictation-card">
              <div className="controls" style={{ marginTop: 0, marginBottom: "14px" }}>
                <button className="primary" onClick={() => playAudioFromPath(activeSentences[getSentenceIndex()].audio)}>
                  ↻ Replay audio
                </button>
                {isTrainingMode && (
                  <button onClick={revealAnswer}>
                    Show answer
                  </button>
                )}
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
                disabled={answerAlreadyCorrect}
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
                Punctuation is ignored. Apostrophes are accepted in straight, curly, or accent-key form.
              </div>

              <div className="controls">
                <button className="success" onClick={submitAnswer} disabled={answerAlreadyCorrect}>
                  Check answer
                </button>
              </div>
            </div>

            <div className="hub-dictation-card">
              <p style={{ marginTop: 0 }}><strong>Feedback</strong></p>
              <div className="feedback">
                {feedbackTokens.length
                  ? feedbackTokens.map((token, index) => renderFeedbackToken(token, index))
                  : null}
              </div>
              {canShowClueHint ? (
                <div className="feedback-hint">Tip: click a red word or gap for a clue.</div>
              ) : null}
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
          margin-bottom: 0.85rem;
        }

        .hub-dictation-header-top {
          margin-bottom: 0.55rem;
        }

        .hub-dictation-title-row {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
        }

        .hub-dictation-header h1 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.4rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: #f8c44f;
        }

        .hub-dictation-sub {
          margin: 0.45rem 0 0;
          color: #cdd9f4;
          line-height: 1.35;
          font-size: 1rem;
        }

        .hub-dictation-statusbar,
        .hub-dictation-card {
          background: linear-gradient(180deg, rgba(24,41,79,0.98), rgba(20,36,71,0.98));
          border: 1px solid rgba(53, 80, 142, 0.8);
          border-radius: 16px;
          box-shadow: 0 10px 22px rgba(0,0,0,0.12);
        }

        .hub-dictation-statusbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 0.85rem;
          padding: 10px 14px;
        }

        .hub-dictation-card {
          padding: 16px;
          margin-bottom: 14px;
        }

        .statusbar-item {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          min-width: 0;
        }

        .statusbar-label {
          color: #94a3b8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .statusbar-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1;
        }

        .statusbar-sep {
          color: rgba(148, 163, 184, 0.65);
          font-size: 1rem;
        }

        .statusbar-status.tone-success .statusbar-value {
          color: #86efac;
        }

        .statusbar-status.tone-warn .statusbar-value {
          color: #fca5a5;
        }

        .hub-dictation-settings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          align-items: end;
        }

        .settings-card {
          padding-bottom: 14px;
        }

        .settings-footer {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 14px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(71, 85, 105, 0.55);
        }

        .settings-start-btn {
          border: 0;
          border-radius: 12px;
          padding: 11px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          background: #38bdf8;
          color: #082f49;
          min-width: 160px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        .field.compact-select {
          max-width: 180px;
        }

        .mode-toggle {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-height: 52px;
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
          min-width: 0;
          flex: 1;
        }

        .mode-toggle-label {
          font-weight: 700;
          line-height: 1.1;
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
          margin: 12px 0 0;
          line-height: 1.35;
          font-size: 0.95rem;
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
          min-height: 72px;
          resize: vertical;
          font-size: 17px;
          line-height: 1.45;
        }

        input[type="range"] {
          width: 100%;
          accent-color: #38bdf8;
        }

        .controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .controls button,
        .small-btn {
          border: 0;
          border-radius: 12px;
          padding: 11px 15px;
          font-size: 14px;
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
          min-height: 56px;
          line-height: 1.65;
          font-size: 18px;
        }

        .feedback-hint {
          margin-top: 6px;
          color: rgba(148, 163, 184, 0.82);
          font-size: 13px;
        }

        .token {
          display: inline-block;
          margin: 0 6px 8px 0;
          padding: 3px 8px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: #0b1220;
        }

        .token-button {
          font: inherit;
          cursor: pointer;
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

        .clue-letter {
          color: #fde68a;
          background: rgba(245,158,11,.14);
          border-color: rgba(245,158,11,.35);
        }

        .clue-word {
          color: #bfdbfe;
          background: rgba(59,130,246,.16);
          border-color: rgba(59,130,246,.36);
        }

        .message {
          margin-top: 10px;
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
          line-height: 1.55;
        }

        .compact-list {
          font-size: 0.94rem;
          max-width: 700px;
        }

        .report-list,
        .report-attempts {
          display: grid;
          gap: 14px;
        }

        .report-clues {
          display: grid;
          gap: 6px;
          margin-bottom: 4px;
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

        .assignment-note-head p {
          margin: 0.35rem 0 0;
          color: #cdd9f4;
          line-height: 1.35;
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

        .token-button:disabled {
          opacity: .92;
          cursor: default;
        }

        .hidden {
          display: none;
        }

        @media (max-width: 700px) {
          .settings-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .feedback {
            font-size: 18px;
          }

          textarea {
            min-height: 96px;
          }
        }

        @media (max-width: 640px) {
          .hub-dictation-title-row {
            align-items: start;
          }

          .hub-dictation-statusbar {
            gap: 6px;
            padding: 10px 12px;
          }

          .hub-dictation-settings {
            grid-template-columns: 1fr;
          }

          .statusbar-sep {
            display: none;
          }

          .statusbar-item {
            width: 100%;
            justify-content: space-between;
          }

          .controls {
            flex-direction: column;
          }

          .controls button,
          .small-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
