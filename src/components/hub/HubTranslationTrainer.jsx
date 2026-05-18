import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  RotateCcw,
  Star,
} from "lucide-react";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import {
  HUB_TRANSLATION_ALL_SET_ID,
  HUB_TRANSLATION_SETS,
} from "../../data/hubTranslationSets.js";
import {
  auth,
  clearHubTranslationMistakes,
  fetchHubTranslationFavourites,
  fetchHubTranslationMistakes,
  fetchSeenHubTranslationItemIds,
  getAssignedActivity,
  recordHubTranslationMistake,
  removeHubTranslationFavourite,
  saveHubTranslationFavourite,
  saveHubTranslationResult,
  saveHubTranslationSession,
  sendReport,
} from "../../firebase";
import { toast } from "../../utils/toast";

const LAST_SCORE_KEY = "seifhub-translation-last-score";
const BEST_SCORE_KEY = "seifhub-translation-best-score";
const REPORT_REASONS = [
  { value: "Missing valid answer", label: "A valid answer is missing" },
  { value: "Incorrect translation", label: "The accepted translation is incorrect" },
  { value: "Prompt problem", label: "The Spanish prompt or wording is wrong" },
  { value: "Tag or level problem", label: "The tag or level looks wrong" },
  { value: "Other", label: "Other" },
];

const spellingVariants = new Map([
  ["apologise", "apologize"],
  ["apologised", "apologized"],
  ["favourite", "favorite"],
  ["favourites", "favorites"],
  ["film", "movie"],
  ["holiday", "vacation"],
  ["grey", "gray"],
  ["realise", "realize"],
  ["realised", "realized"],
  ["tv", "television"],
]);

const contractionVariants = new Map([
  ["aren't", "are not"],
  ["can't", "cannot"],
  ["couldn't", "could not"],
  ["didn't", "did not"],
  ["doesn't", "does not"],
  ["don't", "do not"],
  ["hadn't", "had not"],
  ["hasn't", "has not"],
  ["haven't", "have not"],
  ["he'd", "he would"],
  ["he'll", "he will"],
  ["he's", "he is"],
  ["i'd", "i would"],
  ["i'll", "i will"],
  ["i'm", "i am"],
  ["i've", "i have"],
  ["isn't", "is not"],
  ["it'd", "it would"],
  ["it'll", "it will"],
  ["it's", "it is"],
  ["let's", "let us"],
  ["shan't", "shall not"],
  ["she'd", "she would"],
  ["she'll", "she will"],
  ["she's", "she is"],
  ["shouldn't", "should not"],
  ["that's", "that is"],
  ["there's", "there is"],
  ["they'd", "they would"],
  ["they'll", "they will"],
  ["they're", "they are"],
  ["they've", "they have"],
  ["wasn't", "was not"],
  ["we'd", "we would"],
  ["we'll", "we will"],
  ["we're", "we are"],
  ["we've", "we have"],
  ["weren't", "were not"],
  ["what's", "what is"],
  ["where's", "where is"],
  ["who's", "who is"],
  ["won't", "will not"],
  ["wouldn't", "would not"],
  ["you'd", "you would"],
  ["you'll", "you will"],
  ["you're", "you are"],
  ["you've", "you have"],
]);

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[’‘`´]/g, "'")
    .replace(/\b[\w']+\b/g, (word) => contractionVariants.get(word) || word)
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
        token: "\u00A0",
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
    .map(({ token, className }) => `<span class="token ${className}">${escapeHtml(token)}</span>`)
    .join("");
}

function getEditDistance(userText, correctText) {
  const userWords = tokenize(userText);
  const correctWords = tokenize(correctText);
  const dp = Array.from({ length: userWords.length + 1 }, () =>
    Array(correctWords.length + 1).fill(0)
  );

  for (let i = 0; i <= userWords.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= correctWords.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= userWords.length; i += 1) {
    for (let j = 1; j <= correctWords.length; j += 1) {
      dp[i][j] =
        userWords[i - 1] === correctWords[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }

  return dp[userWords.length][correctWords.length];
}

function getAcceptedAnswers(item) {
  const answers = [item.english, ...(item.acceptedAnswers || [])].filter(Boolean);
  return [...new Set(answers)];
}

function getBestTarget(userText, acceptedAnswers) {
  return acceptedAnswers.reduce(
    (best, candidate) => {
      const distance = getEditDistance(userText, candidate);
      return distance < best.distance ? { text: candidate, distance } : best;
    },
    { text: acceptedAnswers[0] || "", distance: Infinity }
  ).text;
}

function isAcceptedAnswer(userText, acceptedAnswers) {
  const normalizedUser = normalize(userText);
  return acceptedAnswers.some((answer) => normalize(answer) === normalizedUser);
}

function getFeedbackSummary(tokens) {
  return tokens.reduce(
    (summary, token) => {
      if (token.className === "wrong") summary.wrong += 1;
      if (token.className === "missing") summary.missing += 1;
      return summary;
    },
    { wrong: 0, missing: 0 }
  );
}

function buildPostRoundReviewTasks(history) {
  return history.flatMap((entry) => {
    const attemptText = entry.attempts.find(
      (answer) => !isAcceptedAnswer(answer, entry.acceptedAnswers)
    );
    if (!attemptText) return [];

    const target = getBestTarget(attemptText, entry.acceptedAnswers);
    return getComparisonTokens(attemptText, target)
      .map((token, index) => {
        if (token.className === "missing") {
          return {
            id: `${entry.itemId}-missing-${index}`,
            type: "missing",
            entry,
            attemptText,
            target,
            prompt: "Add the missing word.",
            instruction: "Type the word that completes the sentence.",
            answer: token.correctToken,
            focusIndex: index,
          };
        }

        if (token.className === "wrong" && token.correctToken) {
          return {
            id: `${entry.itemId}-replace-${index}`,
            type: "replace",
            entry,
            attemptText,
            target,
            prompt: `Correct "${token.token}".`,
            instruction: "Type the word that should replace it.",
            answer: token.correctToken,
            focusIndex: index,
          };
        }

        if (token.className === "wrong") {
          return {
            id: `${entry.itemId}-remove-${index}`,
            type: "remove",
            entry,
            attemptText,
            target,
            prompt: "Remove the extra word.",
            instruction: "Type the word that does not belong.",
            answer: token.token,
            focusIndex: index,
          };
        }

        return null;
      })
      .filter(Boolean);
  });
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags : String(tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
}

function prepareTranslationItem(item) {
  return {
    ...item,
    id: item.id || item.itemId,
    itemId: item.itemId || item.id,
    acceptedAnswers: getAcceptedAnswers(item),
    tags: normalizeTags(item.tags),
  };
}

function mergeWithCanonicalTranslationItem(item, canonicalById) {
  const itemId = item?.itemId || item?.id;
  const canonical = itemId ? canonicalById.get(itemId) : null;
  if (!canonical) return prepareTranslationItem(item);

  return prepareTranslationItem({
    ...item,
    ...canonical,
    itemId: canonical.itemId || canonical.id || itemId,
    id: canonical.id || canonical.itemId || itemId,
  });
}

function buildSavedItemPayload(item) {
  if (!item?.itemId && !item?.id) return null;

  return {
    itemId: item.itemId || item.id,
    setId: item.setId || "",
    setLabel: item.setLabel || "",
    level: item.level || "",
    tags: normalizeTags(item.tags),
    questionType: item.questionType || "",
    warning: item.warning || "",
    spanish: item.spanish || "",
    english: item.english || "",
    acceptedAnswers: getAcceptedAnswers(item),
  };
}

function renderClueSummaryMarkup(text, clueLevels = {}) {
  const tokens = tokenize(text);
  return tokens
    .map((token, index) => ({ token, index, level: Number(clueLevels?.[index] || 0) }))
    .filter((entry) => entry.level > 0)
    .map(({ token, index, level }) => {
      const label = level >= 2 ? token : `${token.charAt(0)}...`;
      const className = level >= 2 ? "clue-word" : "clue-letter";
      return `<span class="token ${className}">Word ${index + 1}: ${escapeHtml(label)}</span>`;
    })
    .join("");
}

function buildReportMarkup(history, favouriteIds = new Set()) {
  if (!history.length) {
    return '<p class="report-empty">No translations were practised this round.</p>';
  }

  return history
    .map((entry, index) => {
      const statusLabel = entry.answeredCorrectly
        ? `Correct on attempt ${entry.correctAttempt || 1}`
        : entry.attempts.length
          ? `Incorrect after ${entry.attempts.length} attempt${entry.attempts.length === 1 ? "" : "s"}`
          : "Not answered";
      const statusClass = entry.answeredCorrectly ? "ok" : "bad";
      const attemptRows = entry.attempts.length
        ? entry.attempts.map((attemptText, attemptIndex) => {
          const isCorrectAttempt = entry.answeredCorrectly && entry.correctAttempt === attemptIndex + 1;
          const target = getBestTarget(attemptText, entry.acceptedAnswers);
          const attemptMarkup = isCorrectAttempt
            ? renderCorrectSentence(target)
            : compareWords(attemptText, target);
          return `
            <div class="report-attempt">
              <div class="report-attempt-label">Attempt ${attemptIndex + 1} · ${isCorrectAttempt ? "Correct" : "Try"}</div>
              <div class="feedback">${attemptMarkup}</div>
            </div>
          `;
        })
        : ['<p class="report-empty">No answer submitted.</p>'];

      const clueMarkup = renderClueSummaryMarkup(entry.feedbackTarget, entry.clueLevels);
      const variantsMarkup = entry.acceptedAnswers.length > 1
        ? `<div class="report-variants"><div class="report-attempt-label">Accepted answers</div><p>${entry.acceptedAnswers.map(escapeHtml).join(" / ")}</p></div>`
        : "";
      const warningMarkup = entry.warning
        ? `<div class="report-warning">Warning: ${escapeHtml(entry.warning)}</div>`
        : "";
      const isFavourite = favouriteIds.has(entry.itemId);
      const favouriteLabel = isFavourite ? "Saved" : "Save";

      return `
        <div class="report-item">
          <div class="report-meta">
            <span>${index + 1}. ${escapeHtml(entry.spanish)}</span>
            <span class="report-status ${statusClass}">${statusLabel}</span>
          </div>
          ${warningMarkup}
          ${clueMarkup ? `<div class="report-clues"><div class="report-attempt-label">Clues used</div><div class="feedback">${clueMarkup}</div></div>` : ""}
          <div class="report-attempts">${attemptRows.join("")}</div>
          ${variantsMarkup}
          <div class="report-actions">
            <button
              class="small-btn report-fav-btn ${isFavourite ? "active" : ""}"
              type="button"
              data-favourite-item-id="${escapeHtml(entry.itemId)}"
              aria-pressed="${isFavourite ? "true" : "false"}"
            >${favouriteLabel}</button>
            <button
              class="small-btn report-report-btn"
              type="button"
              data-report-history-index="${index}"
            >Report</button>
          </div>
        </div>
      `;
    })
    .join("");
}

export default function HubTranslationTrainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const latestHistoryRef = useRef([]);

  const [selectedSetId, setSelectedSetId] = useState(HUB_TRANSLATION_ALL_SET_ID);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [currentSetMode, setCurrentSetMode] = useState("normal");
  const [trainingCount, setTrainingCount] = useState(5);
  const [activeItems, setActiveItems] = useState([]);
  const [order, setOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [attempt, setAttempt] = useState(1);
  const [completed, setCompleted] = useState(0);
  const [roundHistory, setRoundHistory] = useState([]);
  const [currentRoundEntry, setCurrentRoundEntry] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [reviewPhase, setReviewPhase] = useState(false);
  const [reviewTasks, setReviewTasks] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewResult, setReviewResult] = useState({ tone: "info", text: "" });
  const [inputValue, setInputValue] = useState("");
  const [feedbackTokens, setFeedbackTokens] = useState([]);
  const [feedbackHtml, setFeedbackHtml] = useState("");
  const [message, setMessage] = useState({
    tone: "info",
    text: "Choose a set and press start when you're ready.",
  });
  const [statusText, setStatusText] = useState("Ready");
  const [nextEnabled, setNextEnabled] = useState(false);
  const [loadingReviewSet, setLoadingReviewSet] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [seenItemIds, setSeenItemIds] = useState(new Set());
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [reportingItemId, setReportingItemId] = useState(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [bestScore, setBestScore] = useState(() =>
    Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0)
  );
  const [reportHtml, setReportHtml] = useState("");

  const assignmentId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const directAssignmentId = params.get("assignment");
    if (directAssignmentId) return directAssignmentId;

    const malformedSiteValue = params.get("site") || "";
    const malformedMatch = malformedSiteValue.match(/[?&]assignment=([^&]+)/);
    return malformedMatch ? decodeURIComponent(malformedMatch[1]) : "";
  }, [location.search]);
  const assignmentConfig = assignment?.translationConfig || null;
  const isAssignmentMode = !!assignmentId && !!assignmentConfig;

  const levelOptions = useMemo(
    () => ["all", ...new Set(HUB_TRANSLATION_SETS.map((set) => set.level).filter(Boolean))],
    []
  );

  const setOptions = useMemo(
    () => [
      { value: HUB_TRANSLATION_ALL_SET_ID, label: "All translation sets" },
      ...HUB_TRANSLATION_SETS.map((set) => ({
        value: set.id,
        label: `${set.label} · ${set.level}`,
      })),
    ],
    []
  );

  const canonicalItemsById = useMemo(() => {
    const byId = new Map();
    HUB_TRANSLATION_SETS.forEach((set) => {
      set.items.forEach((item) => {
        const prepared = prepareTranslationItem({
          ...item,
          setId: set.id,
          setLabel: set.label,
          level: set.level,
          tags: [...(set.tags || []), ...(item.tags || [])],
        });
        byId.set(prepared.itemId, prepared);
      });
    });
    return byId;
  }, []);

  const selectedSetLabel = useMemo(() => {
    if (isAssignmentMode) return assignment.activityLabel || "Assigned translation";
    if (selectedSetId === HUB_TRANSLATION_ALL_SET_ID) return "All translation sets";
    return HUB_TRANSLATION_SETS.find((set) => set.id === selectedSetId)?.label || "All translation sets";
  }, [assignment, isAssignmentMode, selectedSetId]);

  const answerAlreadyCorrect = !!currentRoundEntry?.answeredCorrectly;
  const currentPrompt = currentRoundEntry?.spanish || "";
  const currentIsFavourite = currentRoundEntry ? favouriteIds.has(currentRoundEntry.itemId) : false;
  const hiddenQuestionTypeSetIds = new Set([
    "b1-ed-ing-adjectives",
    "b1-present-perfect-already-yet-just",
  ]);
  const shouldShowQuestionType =
    Boolean(currentRoundEntry?.questionType) &&
    !hiddenQuestionTypeSetIds.has(currentRoundEntry?.setId);
  const showPromptWarning = Boolean(currentRoundEntry?.warning) && !answerAlreadyCorrect && !nextEnabled;
  const reportingEntry = reportingItemId
    ? (currentRoundEntry?.itemId === reportingItemId
      ? currentRoundEntry
      : roundHistory.find((entry) => entry.itemId === reportingItemId) || null)
    : null;
  const statusTone = message.tone === "bad" ? "warn" : message.tone === "ok" ? "success" : "neutral";
  const canShowClueHint =
    !answerAlreadyCorrect &&
    currentRoundEntry &&
    currentRoundEntry.attempts.length > 0 &&
    feedbackTokens.some((token) => token.className === "wrong" || token.className === "missing");
  const reviewTask = reviewTasks[reviewIndex] || null;
  const reviewComplete = reviewTasks.length > 0 && reviewIndex >= reviewTasks.length;
  const reviewFeedbackTokens = useMemo(
    () => (reviewTask ? getComparisonTokens(reviewTask.attemptText, reviewTask.target) : []),
    [reviewTask]
  );
  const feedbackSummary = useMemo(() => getFeedbackSummary(reviewFeedbackTokens), [reviewFeedbackTokens]);

  useEffect(() => {
    latestHistoryRef.current = roundHistory;
  }, [roundHistory]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadUserTranslationMeta() {
      if (!auth.currentUser) {
        if (alive) {
          setFavouriteIds(new Set());
          setSeenItemIds(new Set());
        }
        return;
      }

      try {
        const [favourites, seenIds] = await Promise.all([
          fetchHubTranslationFavourites(),
          fetchSeenHubTranslationItemIds(),
        ]);
        if (alive) {
          setFavouriteIds(new Set(favourites.map((item) => item.itemId)));
          setSeenItemIds(new Set(seenIds));
        }
      } catch (error) {
        console.error("[HubTranslationTrainer] load translation meta failed", error);
      }
    }

    loadUserTranslationMeta();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (roundOver) {
      setReportHtml(buildReportMarkup(roundHistory, favouriteIds));
    }
  }, [favouriteIds, roundHistory, roundOver]);

  useEffect(() => {
    if (!gameStarted || roundOver || answerAlreadyCorrect) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [currentIndex, gameStarted, roundOver, answerAlreadyCorrect]);

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

        if (row?.activityType === "translation" && row?.translationConfig) {
          const config = row.translationConfig;
          const assignedItems = Array.isArray(config.items) ? config.items : [];
          setAssignment(row);
          setSelectedSetId(config.setId || HUB_TRANSLATION_ALL_SET_ID);
          setSelectedLevel(config.level || "all");
          setTrainingCount(Math.max(1, Number(config.questionCount || assignedItems.length || 5)));
          setMessage({
            tone: "info",
            text: "Assigned translation loaded. Press start when you're ready.",
          });
        } else {
          setAssignment(null);
          setMessage({
            tone: "bad",
            text: "This assigned translation could not be found.",
          });
        }
      } catch (error) {
        console.error("[HubTranslationTrainer] failed to load assignment", error);
        if (!alive) return;
        setAssignment(null);
        setMessage({
          tone: "bad",
          text: "This assigned translation could not be loaded.",
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

  function getSelectedItems() {
    if (isAssignmentMode && Array.isArray(assignmentConfig.items) && assignmentConfig.items.length) {
      return assignmentConfig.items.map((item) => ({
        ...item,
        id: item.id || item.itemId,
        itemId: item.itemId || item.id,
        setId: item.setId || assignmentConfig.setId || "",
        setLabel: item.setLabel || assignmentConfig.setLabel || "",
        level: item.level || assignmentConfig.level || "",
        tags: normalizeTags(item.tags),
      }));
    }

    const effectiveSetId = isAssignmentMode
      ? assignmentConfig.setId || HUB_TRANSLATION_ALL_SET_ID
      : selectedSetId;
    const effectiveLevel = isAssignmentMode
      ? assignmentConfig.level || "all"
      : selectedLevel;

    const sourceSets =
      effectiveSetId === HUB_TRANSLATION_ALL_SET_ID
        ? HUB_TRANSLATION_SETS
        : HUB_TRANSLATION_SETS.filter((set) => set.id === effectiveSetId);

    const levelFiltered = effectiveLevel === "all"
      ? sourceSets
      : sourceSets.filter((set) => set.level === effectiveLevel);

    return levelFiltered.flatMap((set) =>
      set.items.map((item) => ({
        ...item,
        setId: set.id,
        setLabel: set.label,
        level: set.level,
        tags: [...(set.tags || []), ...(item.tags || [])],
      }))
    );
  }

  function getItemIndex(index = currentIndex, currentOrder = order) {
    return currentOrder[index];
  }

  function beginRoundEntry(items, currentOrder, index) {
    const item = prepareTranslationItem(items[getItemIndex(index, currentOrder)]);
    const acceptedAnswers = getAcceptedAnswers(item);
    return {
      itemId: item.itemId || item.id,
      setId: item.setId,
      setLabel: item.setLabel,
      level: item.level,
      tags: item.tags || [],
      questionType: item.questionType || "",
      warning: item.warning || "",
      spanish: item.spanish,
      english: item.english,
      acceptedAnswers,
      feedbackTarget: item.english,
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
    if (roundOver || answerAlreadyCorrect || !currentRoundEntry) return;

    const clueToken = tokenize(currentRoundEntry.feedbackTarget)?.[wordIndex] || "";
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
      !answerAlreadyCorrect &&
      currentRoundEntry &&
      currentRoundEntry.attempts.length > 0 &&
      (token.className === "wrong" || token.className === "missing") &&
      Number.isInteger(token.correctIndex);

    const isClued = canShowClue && clueLevel > 0;
    const displayText = isClued
      ? clueLevel >= 2
        ? token.correctToken
        : `${token.correctToken?.charAt(0) || ""}...`
      : token.token;
    const className = isClued
      ? clueLevel >= 2
        ? "clue-word"
        : "clue-letter"
      : token.className;

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
          {displayText}
        </button>
      );
    }

    return (
      <span key={`feedback-token-${index}`} className={`token ${className}`}>
        {displayText}
      </span>
    );
  }

  function renderStaticFeedbackToken(token, index, isFocused = false) {
    return (
      <span key={`review-feedback-token-${index}`} className={`token ${token.className} ${isFocused ? "review-focus-token" : ""}`}>
        {token.token}
      </span>
    );
  }

  function startWithItems(items, mode = "normal") {
    if (!items.length) {
      toast("No translation items match that set and level.");
      return;
    }

    const preparedItems = items.map(prepareTranslationItem);
    const nextOrder = shuffle(preparedItems.map((_, index) => index));
    const nextIndex = 0;
    const firstEntry = beginRoundEntry(preparedItems, nextOrder, nextIndex);

    setCurrentSetMode(mode);
    setActiveItems(preparedItems);
    setOrder(nextOrder);
    setCurrentIndex(nextIndex);
    setAttempt(1);
    setCompleted(0);
    setRoundHistory([firstEntry]);
    setCurrentRoundEntry(firstEntry);
    setRoundOver(false);
    setReviewPhase(false);
    setReviewTasks([]);
    setReviewIndex(0);
    setReviewInput("");
    setReviewResult({ tone: "info", text: "" });
    setGameStarted(true);
    setReportHtml("");
    setInputValue("");
    setFeedbackHtml("");
    setFeedbackTokens([]);
    setNextEnabled(false);
    setStatusText(selectedSetLabel);
    setMessage({
      tone: "info",
      text: mode === "mistakes"
        ? "Review your recent translation mistakes."
        : mode === "favourites"
          ? "Practise your saved translation items."
          : "",
    });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function startGame() {
    if (assignmentId && assignmentLoading) {
      toast("Still loading the assigned translation.");
      return;
    }

    if (assignmentId && !isAssignmentMode) {
      toast("This assigned translation could not be loaded.");
      return;
    }

    const pool = getSelectedItems();
    if (!pool.length) {
      toast("No translation items match that set and level.");
      return;
    }

    const preparedPool = pool.map(prepareTranslationItem);
    const unseen = preparedPool.filter((item) => !seenItemIds.has(item.itemId));
    const seen = preparedPool.filter((item) => seenItemIds.has(item.itemId));
    const targetCount = isAssignmentMode
      ? Math.max(1, Number(assignmentConfig.questionCount || trainingCount || 1))
      : trainingCount;
    const nextSet = [...shuffle(unseen), ...shuffle(seen)].slice(0, targetCount);
    startWithItems(nextSet, "normal");
  }

  async function loadFavouriteItems() {
    if (!auth.currentUser) {
      toast("Sign in to review favourites.");
      return;
    }

    setLoadingReviewSet(true);
    try {
      const favourites = (await fetchHubTranslationFavourites()).map((item) =>
        mergeWithCanonicalTranslationItem(item, canonicalItemsById)
      );
      if (!favourites.length) {
        toast("No favourite translation items yet.");
        return;
      }
      setTrainingCount(Math.min(10, favourites.length));
      setFavouriteIds(new Set(favourites.map((item) => item.itemId)));
      startWithItems(favourites, "favourites");
    } catch (error) {
      console.error("[HubTranslationTrainer] load favourites failed", error);
      toast("Could not load favourite translation items.");
    } finally {
      setLoadingReviewSet(false);
    }
  }

  async function loadRecentMistakes() {
    if (!auth.currentUser) {
      toast("Sign in to review mistakes.");
      return;
    }

    setLoadingReviewSet(true);
    try {
      const latestByItem = new Map();
      (await fetchHubTranslationMistakes()).forEach((item) => {
        if (!latestByItem.has(item.itemId)) {
          latestByItem.set(
            item.itemId,
            mergeWithCanonicalTranslationItem(item, canonicalItemsById)
          );
        }
      });
      const mistakes = [...latestByItem.values()];
      if (!mistakes.length) {
        toast("No recent translation mistakes yet.");
        return;
      }
      setTrainingCount(Math.min(10, mistakes.length));
      startWithItems(mistakes, "mistakes");
    } catch (error) {
      console.error("[HubTranslationTrainer] load mistakes failed", error);
      toast("Could not load recent translation mistakes.");
    } finally {
      setLoadingReviewSet(false);
    }
  }

  function endGame(finalHistory = latestHistoryRef.current) {
    setRoundOver(true);
    setGameStarted(false);
    setReviewPhase(false);
    setReviewTasks(buildPostRoundReviewTasks(finalHistory));
    setReviewIndex(0);
    setReviewInput("");
    setReviewResult({ tone: "info", text: "" });
    setStatusText("Finished");

    const finalCompleted = finalHistory.filter((entry) => entry.answeredCorrectly).length;
    const nextBestScore = Math.max(
      finalCompleted,
      Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0)
    );
    window.localStorage.setItem(LAST_SCORE_KEY, String(finalCompleted));
    window.localStorage.setItem(BEST_SCORE_KEY, String(nextBestScore));
    setBestScore(nextBestScore);
    setReportHtml(buildReportMarkup(finalHistory, favouriteIds));
    setMessage({
      tone: "ok",
      text: `Training complete. Correct translations: ${finalCompleted} out of ${trainingCount}.`,
    });

    saveHubTranslationSession({
      mode: currentSetMode,
      assignmentId: assignment?.id || "",
      assignmentLabel: assignment?.activityLabel || "",
      teacherUid: assignment?.teacherUid || "",
      teacherName: assignment?.teacherName || "",
      setId: selectedSetId,
      setLabel: selectedSetLabel,
      level: selectedLevel,
      score: finalCompleted,
      completed: finalCompleted,
      totalPlayed: finalHistory.length,
      trainingTarget: trainingCount,
      history: finalHistory,
    }).catch((error) => {
      console.error("[HubTranslationTrainer] failed to save session", error);
      toast("The translation session finished, but it could not be saved to the activity log.");
    });
  }

  function nextItem(forceAdvance = false) {
    if ((!nextEnabled && !forceAdvance) || roundOver) return;

    if (latestHistoryRef.current.length >= trainingCount) {
      endGame(latestHistoryRef.current);
      return;
    }

    let nextOrder = order;
    let nextActiveItems = activeItems;
    let nextIndex;

    if (currentIndex >= order.length - 1) {
      nextActiveItems = currentSetMode === "normal" ? getSelectedItems() : activeItems;
      nextOrder = shuffle(nextActiveItems.map((_, index) => index));
      setActiveItems(nextActiveItems);
      setOrder(nextOrder);
      nextIndex = 0;
    } else {
      nextIndex = currentIndex + 1;
    }

    const entry = beginRoundEntry(nextActiveItems, nextOrder, nextIndex);
    setCurrentIndex(nextIndex);
    setAttempt(1);
    setCurrentRoundEntry(entry);
    setRoundHistory((prev) => [...prev, entry]);
    setInputValue("");
    setFeedbackHtml("");
    setFeedbackTokens([]);
    setNextEnabled(false);
    setStatusText(entry.level || selectedSetLabel);
    setMessage({ tone: "info", text: "" });
  }

  function resetTrainerHome() {
    setCurrentSetMode("normal");
    setActiveItems([]);
    setOrder([]);
    setCurrentIndex(-1);
    setAttempt(1);
    setCompleted(0);
    setRoundHistory([]);
    setCurrentRoundEntry(null);
    setGameStarted(false);
    setRoundOver(false);
    setReviewPhase(false);
    setReviewTasks([]);
    setReviewIndex(0);
    setReviewInput("");
    setReviewResult({ tone: "info", text: "" });
    setInputValue("");
    setFeedbackHtml("");
    setFeedbackTokens([]);
    setNextEnabled(false);
    setReportHtml("");
    setReportingItemId(null);
    setReportReason("");
    setReportComment("");
    setStatusText("Ready");
    setMessage({
      tone: "info",
      text: "Choose a set and press start when you're ready.",
    });
  }

  async function toggleFavourite(item) {
    const payload = buildSavedItemPayload(item);
    if (!payload) return;
    if (!auth.currentUser) {
      toast("Sign in to save favourites.");
      return;
    }

    const isFavourite = favouriteIds.has(payload.itemId);
    try {
      if (isFavourite) {
        await removeHubTranslationFavourite(payload.itemId);
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(payload.itemId);
          return next;
        });
        toast("Removed from favourites.");
      } else {
        await saveHubTranslationFavourite(payload);
        setFavouriteIds((prev) => new Set([...prev, payload.itemId]));
        toast("Added to favourites.");
      }
    } catch (error) {
      console.error("[HubTranslationTrainer] favourite toggle failed", error);
      toast("Could not update favourites.");
    }
  }

  function openReportForItem(item) {
    if (!item?.itemId) return;
    setReportingItemId(item.itemId);
    setReportReason("");
    setReportComment("");
  }

  function closeReportForm() {
    setReportingItemId(null);
    setReportReason("");
    setReportComment("");
  }

  async function handleSendReport() {
    if (!reportReason || sendingReport || !reportingEntry) return;

    setSendingReport(true);
    try {
      await sendReport({
        itemId: reportingEntry.itemId,
        question: `${reportingEntry.spanish}\n\nAccepted answers: ${reportingEntry.acceptedAnswers.join(" / ")}`,
        issue: reportReason === "Other" ? "other" : reportReason,
        comments: reportComment.trim(),
        level: reportingEntry.level || null,
        selectedOption: reportingEntry.attempts?.length ? reportingEntry.attempts[reportingEntry.attempts.length - 1] : null,
        correctOption: reportingEntry.acceptedAnswers.join(" / "),
      });

      toast(
        auth.currentUser?.email
          ? `Thanks — we emailed a copy to ${auth.currentUser.email}.`
          : "Thanks — your report was sent."
      );

      closeReportForm();
    } catch (error) {
      console.error("[HubTranslationTrainer] report failed", error);
      toast("Sorry — failed to send. Please try again.");
    } finally {
      setSendingReport(false);
    }
  }

  async function recordTranslationMistake(entry, typedAnswer) {
    const payload = buildSavedItemPayload(entry);
    if (!payload) return;

    try {
      await recordHubTranslationMistake({
        ...payload,
        attemptedAnswer: typedAnswer || "",
      });
    } catch (error) {
      console.error("[HubTranslationTrainer] record mistake failed", error);
    }
  }

  async function clearTranslationMistakes(itemId) {
    try {
      await clearHubTranslationMistakes(itemId);
    } catch (error) {
      console.error("[HubTranslationTrainer] clear mistakes failed", error);
    }
  }

  function submitAnswer() {
    if (currentIndex < 0 || roundOver || !currentRoundEntry || answerAlreadyCorrect) return;

    const typed = inputValue;
    const feedbackTarget = getBestTarget(typed, currentRoundEntry.acceptedAnswers);
    const updatedEntry = {
      ...currentRoundEntry,
      feedbackTarget,
      attempts: [...currentRoundEntry.attempts, typed],
    };

    setCurrentRoundEntry(updatedEntry);
    setFeedbackTokens(getComparisonTokens(typed, feedbackTarget));
    setFeedbackHtml(compareWords(typed, feedbackTarget));

    saveHubTranslationResult(
      currentRoundEntry.itemId,
      currentRoundEntry.tags || [],
      isAcceptedAnswer(typed, currentRoundEntry.acceptedAnswers)
    ).then(() => {
      setSeenItemIds((prev) => {
        const next = new Set(prev);
        next.add(currentRoundEntry.itemId);
        return next;
      });
    }).catch((error) => {
      console.error("[HubTranslationTrainer] save result failed", error);
    });

    if (isAcceptedAnswer(typed, currentRoundEntry.acceptedAnswers)) {
      const correctEntry = {
        ...updatedEntry,
        answeredCorrectly: true,
        correctAttempt: attempt,
      };
      const nextHistory = [...roundHistory];
      nextHistory[nextHistory.length - 1] = correctEntry;

      setCurrentRoundEntry(correctEntry);
      setRoundHistory(nextHistory);
      setCompleted((prev) => prev + 1);
      setStatusText("Correct");
      setMessage({ tone: "ok", text: `Correct on attempt ${attempt}.` });
      setNextEnabled(false);

      if (currentSetMode === "mistakes" && attempt === 1) {
        clearTranslationMistakes(correctEntry.itemId);
      }

      window.setTimeout(() => {
        nextItem(true);
      }, 650);
      return;
    }

    const nextHistory = [...roundHistory];
    nextHistory[nextHistory.length - 1] = updatedEntry;
    setRoundHistory(nextHistory);
    setAttempt((prev) => prev + 1);
    setStatusText("Try again");
    setMessage({ tone: "bad", text: `Attempt ${attempt} incorrect. Check the word feedback and try again.` });
    recordTranslationMistake(updatedEntry, typed);
  }

  function startPostRoundReview() {
    if (!reviewTasks.length) return;
    setReviewPhase(true);
    setReviewIndex(0);
    setReviewInput("");
    setReviewResult({ tone: "info", text: "" });
    setStatusText("Review");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function checkReviewAnswer() {
    if (!reviewTask) return;

    const isCorrect = normalize(reviewInput) === normalize(reviewTask.answer);
    if (!isCorrect) {
      setReviewResult({
        tone: "bad",
        text: "Not quite. Look at the highlighted sentence and try this small fix again.",
      });
      return;
    }

    const nextIndex = reviewIndex + 1;
    setReviewInput("");
    setReviewResult({
      tone: "ok",
      text: nextIndex >= reviewTasks.length ? "Review complete." : "Good correction.",
    });
    setReviewIndex(nextIndex);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function skipReviewTask() {
    setReviewInput("");
    setReviewResult({ tone: "info", text: "" });
    setReviewIndex((index) => Math.min(index + 1, reviewTasks.length));
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function restartPostRoundReview() {
    setReviewIndex(0);
    setReviewInput("");
    setReviewResult({ tone: "info", text: "" });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function closePostRoundReview() {
    setReviewPhase(false);
    setReviewInput("");
    setReviewResult({ tone: "info", text: "" });
    setStatusText("Finished");
  }

  function revealAnswer() {
    if (currentIndex < 0 || roundOver || !currentRoundEntry) return;
    if (
      !answerAlreadyCorrect &&
      inputValue.trim() &&
      isAcceptedAnswer(inputValue, currentRoundEntry.acceptedAnswers)
    ) {
      submitAnswer();
      return;
    }

    const target = currentRoundEntry.feedbackTarget || currentRoundEntry.english;
    setFeedbackHtml(renderCorrectSentence(target));
    setFeedbackTokens(
      tokenize(target).map((token, index) => ({
        token,
        className: "correct",
        correctIndex: index,
        correctToken: token,
      }))
    );
    setStatusText("Answer revealed");
    setMessage({
      tone: "info",
      text: "Answer revealed. Move on when you're ready.",
    });
    setNextEnabled(true);
  }

  function handleReportClick(event) {
    const favouriteButton = event.target.closest(".report-fav-btn");
    if (favouriteButton) {
      const itemId = favouriteButton.dataset.favouriteItemId;
      const entry = roundHistory.find((historyEntry) => historyEntry.itemId === itemId);
      if (entry) toggleFavourite(entry);
      return;
    }

    const reportButton = event.target.closest(".report-report-btn");
    if (!reportButton) return;
    const historyIndex = Number(reportButton.dataset.reportHistoryIndex);
    const entry = Number.isInteger(historyIndex) ? roundHistory[historyIndex] : null;
    if (entry) openReportForItem(entry);
  }

  return (
    <div className="hub-dictation-page hub-translation-page">
      <Seo
        title="Translation Trainer | Seif Hub"
        description="Practise translating Spanish prompts into English with word-by-word feedback."
      />

      <div className="hub-dictation-app">
        <div className="hub-dictation-header">
          <div className="hub-dictation-header-top">
            <button className="review-btn" onClick={() => navigate(getSitePath("/grammar"))}>
              ← Back to grammar
            </button>
          </div>
          <div className="hub-dictation-title-row">
            <div>
              <h1>Translation Trainer</h1>
              <p className="hub-dictation-sub">
                Translate Spanish prompts into English and get corrective word-by-word feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="hub-dictation-statusbar">
          <span className="statusbar-item">
            <span className="statusbar-label">Question</span>
            <strong className="statusbar-value">{Math.min(roundHistory.length, trainingCount)} / {trainingCount}</strong>
          </span>
          <span className="statusbar-sep" aria-hidden="true">·</span>
          <span className="statusbar-item">
            <span className="statusbar-label">Attempt</span>
            <strong className="statusbar-value">{currentIndex >= 0 && gameStarted ? attempt : "—"}</strong>
          </span>
          <span className="statusbar-sep" aria-hidden="true">·</span>
          <span className="statusbar-item">
            <span className="statusbar-label">Correct</span>
            <strong className="statusbar-value">{completed}</strong>
          </span>
          <span className="statusbar-sep" aria-hidden="true">·</span>
          <span className={`statusbar-item statusbar-status tone-${statusTone}`}>
            <span className="statusbar-label">Status</span>
            <strong className="statusbar-value">{statusText}</strong>
          </span>
        </div>

        {!gameStarted && !roundOver ? (
          <div className="hub-dictation-card settings-card">
            {isAssignmentMode ? (
              <div className="hub-dictation-assignment-note">
                <div className="assignment-note-head">
                  <strong>{assignment.activityLabel || "Assigned translation"}</strong>
                  {assignment.notes ? <p>{assignment.notes}</p> : null}
                </div>
                <p className="mode-summary">
                  {assignment.teacherName || "Your teacher"} set {trainingCount} translation question{trainingCount === 1 ? "" : "s"} for you.
                </p>
              </div>
            ) : null}
            <div className="hub-dictation-settings">
              <div className="field">
                <label htmlFor="translationSetSelect"><strong>Translation set</strong></label>
                <select
                  id="translationSetSelect"
                  value={selectedSetId}
                  onChange={(event) => setSelectedSetId(event.target.value)}
                  disabled={isAssignmentMode}
                >
                  {setOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field compact-select">
                <label htmlFor="translationLevelSelect"><strong>Level</strong></label>
                <select
                  id="translationLevelSelect"
                  value={selectedLevel}
                  onChange={(event) => setSelectedLevel(event.target.value)}
                  disabled={isAssignmentMode}
                >
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level === "all" ? "All levels" : level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field compact-select">
                <label htmlFor="translationCountSelect"><strong>Questions</strong></label>
                <select
                  id="translationCountSelect"
                  value={trainingCount}
                  onChange={(event) => setTrainingCount(Number(event.target.value))}
                  disabled={isAssignmentMode}
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

            </div>
            <div className="settings-footer">
              <ul className="list compact-list">
                <li>Type the English translation of the Spanish prompt.</li>
                <li>Press <strong>Enter</strong> to check your answer.</li>
              </ul>
              <div className="settings-actions-grid">
                <button className="primary settings-start-btn" onClick={startGame}>
                  {isAssignmentMode ? "Start assignment" : "Start training"}
                </button>
                {!isAssignmentMode ? (
                  <>
                    <button className="review-btn favourites settings-action-btn" onClick={loadFavouriteItems} disabled={loadingReviewSet}>
                      Favourites
                    </button>
                    <button className="review-btn mistakes settings-action-btn" onClick={loadRecentMistakes} disabled={loadingReviewSet}>
                      Recent mistakes
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {gameStarted && (
          <>
            <div className="hub-dictation-card translation-trainer-card">
              <div className="translation-prompt-shell">
                <div className="translation-prompt">
                  <div className="translation-prompt-meta">
                    <span>{currentRoundEntry?.level}</span>
                    <div className="translation-prompt-kicker">Spanish prompt</div>
                  </div>
                  <strong>{currentPrompt}</strong>
                  {shouldShowQuestionType ? (
                    <em>{currentRoundEntry.questionType}</em>
                  ) : null}
                  {showPromptWarning ? (
                    <div className="translation-warning" role="note">
                      <AlertTriangle size={16} />
                      <span>{currentRoundEntry.warning}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="translation-actions">
                <div className="controls translation-action-row translation-primary-actions">
                  <button className="success action-btn" onClick={submitAnswer} disabled={answerAlreadyCorrect}>
                    <CheckCircle2 size={22} />
                    <span>Check answer</span>
                  </button>
                  <button className="warn action-btn" onClick={() => nextItem()} disabled={!nextEnabled}>
                    <ArrowRight size={22} />
                    <span>Next question</span>
                  </button>
                </div>

                <div className="controls translation-action-row translation-secondary-actions">
                  <button className="action-btn neutral-btn" onClick={revealAnswer}>
                    <Eye size={22} />
                    <span>Show answer</span>
                  </button>
                  <button
                    className={`fav-btn action-btn secondary-action hub-footer-fav-btn ${currentIsFavourite ? "active" : ""}`}
                    onClick={() => toggleFavourite(currentRoundEntry)}
                    aria-pressed={currentIsFavourite}
                    aria-label={currentIsFavourite ? "Remove from favourites" : "Add to favourites"}
                    title={currentIsFavourite ? "Remove from favourites" : "Add to favourites"}
                  >
                    {currentIsFavourite ? (
                      <Star size={22} fill="#ffd36a" stroke="#ffd36a" />
                    ) : (
                      <Star size={22} />
                    )}
                    <span className="hub-fav-label">{currentIsFavourite ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    className="hub-report-btn action-btn secondary-action"
                    onClick={() => openReportForItem(currentRoundEntry)}
                    title="Report a problem"
                  >
                    <AlertCircle size={22} />
                    <span className="hub-report-label">Report</span>
                  </button>
                  <button
                    className="action-btn neutral-btn secondary-action"
                    onClick={resetTrainerHome}
                    title="Return to setup"
                  >
                    <RotateCcw size={22} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="translation-answer-panel">
                <label htmlFor="translationInput" className="translation-answer-label">
                  <strong>Type the English translation</strong>
                </label>
                <textarea
                  id="translationInput"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Type your English translation here..."
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
                {message.text ? (
                  <div className={`message ${message.tone}`}>{message.text}</div>
                ) : null}

                {feedbackTokens.length > 0 ? (
                  <div className="feedback" aria-live="polite">
                    {feedbackTokens.map((token, index) => renderFeedbackToken(token, index))}
                  </div>
                ) : feedbackHtml ? (
                  <div
                    className="feedback"
                    aria-live="polite"
                    dangerouslySetInnerHTML={{ __html: feedbackHtml }}
                  />
                ) : null}

                {canShowClueHint ? (
                  <div className="help clue-help">
                    Click a red or blank word once for the first letter, twice to reveal the word.
                  </div>
                ) : null}

                <div className="translation-instruction-row">
                  <BookOpen size={20} />
                  <span>Translate the Spanish sentence into English.</span>
                </div>

                {reportingEntry?.itemId === currentRoundEntry?.itemId ? (
                  <div className="report-bar">
                    <div className="report-fields">
                      <select
                        className="select"
                        value={reportReason}
                        onChange={(event) => setReportReason(event.target.value)}
                      >
                        <option value="">-- select problem --</option>
                        {REPORT_REASONS.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>

                      <textarea
                        className="report-input"
                        placeholder="Add details (optional)…"
                        value={reportComment}
                        onChange={(event) => setReportComment(event.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="report-actions-row">
                      <button
                        className="review-btn"
                        onClick={handleSendReport}
                        disabled={!reportReason || sendingReport}
                      >
                        {sendingReport ? "Sending..." : "Send report"}
                      </button>
                      <button className="review-btn" onClick={closeReportForm}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}

        {roundOver && !reviewPhase && (
          <div className="hub-dictation-card report-card">
            <h2>Round report</h2>
            <p className="final-summary">
              Training complete. Correct translations: {completed} out of {trainingCount}. Best: {bestScore}.
            </p>
            {reviewTasks.length > 0 ? (
              <div className="post-round-review-callout">
                <div>
                  <div className="guided-review-kicker">Targeted review</div>
                  <strong>{reviewTasks.length} small correction{reviewTasks.length === 1 ? "" : "s"} ready</strong>
                </div>
                <button className="primary review-start-btn" onClick={startPostRoundReview}>
                  Start review
                </button>
              </div>
            ) : null}
            <div
              className="report-list"
              onClick={handleReportClick}
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
            {reportingEntry && roundOver ? (
              <div className="report-bar">
                <div className="report-fields">
                  <select
                    className="select"
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                  >
                    <option value="">-- select problem --</option>
                    {REPORT_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>

                  <textarea
                    className="report-input"
                    placeholder="Add details (optional)…"
                    value={reportComment}
                    onChange={(event) => setReportComment(event.target.value)}
                    rows={3}
                  />
                </div>

                <div className="report-actions-row">
                  <button
                    className="review-btn"
                    onClick={handleSendReport}
                    disabled={!reportReason || sendingReport}
                  >
                    {sendingReport ? "Sending..." : "Send report"}
                  </button>
                  <button className="review-btn" onClick={closeReportForm}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            <div className="controls report-controls">
              <button className="primary" onClick={startGame}>
                Train again
              </button>
              <button onClick={() => navigate(getSitePath("/grammar"))}>
                Back to grammar
              </button>
            </div>
          </div>
        )}

        {roundOver && reviewPhase && (
          <div className="hub-dictation-card post-round-review-card">
            <div className="post-round-review-top">
              <div>
                <div className="guided-review-kicker">Targeted review</div>
                <h2>{reviewComplete ? "Review complete" : `Correction ${reviewIndex + 1} / ${reviewTasks.length}`}</h2>
              </div>
              <button className="review-btn" onClick={closePostRoundReview}>
                Round report
              </button>
            </div>

            {reviewComplete ? (
              <>
                <p className="final-summary">Nice work. You repaired the sentence-level mistakes from this round.</p>
                <div className="controls report-controls">
                  <button className="primary" onClick={startGame}>
                    Train again
                  </button>
                  <button onClick={restartPostRoundReview}>
                    Restart review
                  </button>
                  <button onClick={closePostRoundReview}>
                    Back to report
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="translation-prompt review-prompt-card">
                  <div className="translation-prompt-meta">
                    <span>{reviewTask.entry.level}</span>
                    <div className="translation-prompt-kicker">Spanish prompt</div>
                  </div>
                  <strong>{reviewTask.entry.spanish}</strong>
                </div>

                <div className="guided-review-panel">
                  <div className="guided-review-head">
                    <div>
                      <div className="guided-review-kicker">{reviewTask.type === "missing" ? "Missing word" : reviewTask.type === "replace" ? "Bad word" : "Extra word"}</div>
                      <strong>{reviewTask.prompt}</strong>
                    </div>
                    <div className="guided-review-counts" aria-label="Mistake summary">
                      {feedbackSummary.wrong > 0 ? <span>{feedbackSummary.wrong} change{feedbackSummary.wrong === 1 ? "" : "s"}</span> : null}
                      {feedbackSummary.missing > 0 ? <span>{feedbackSummary.missing} missing</span> : null}
                    </div>
                  </div>

                  <div className="feedback guided-feedback" aria-label="Sentence comparison">
                    {reviewFeedbackTokens.map((token, index) => renderStaticFeedbackToken(token, index, index === reviewTask.focusIndex))}
                  </div>
                </div>

                <div className="translation-answer-panel">
                  <label htmlFor="postRoundReviewInput" className="translation-answer-label">
                    <strong>{reviewTask.instruction}</strong>
                  </label>
                  <input
                    id="postRoundReviewInput"
                    ref={inputRef}
                    className="review-word-input"
                    value={reviewInput}
                    onChange={(event) => setReviewInput(event.target.value)}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        checkReviewAnswer();
                      }
                    }}
                  />
                  {reviewResult.text ? (
                    <div className={`message ${reviewResult.tone}`}>{reviewResult.text}</div>
                  ) : null}
                  <div className="controls report-controls">
                    <button className="primary" onClick={checkReviewAnswer}>
                      Check fix
                    </button>
                    <button onClick={resetTrainerHome}>
                      Reset
                    </button>
                    <button onClick={skipReviewTask}>
                      Skip
                    </button>
                  </div>
                </div>
              </>
            )}
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

        .hub-dictation-assignment-note {
          margin-bottom: 12px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(125, 211, 252, 0.28);
          background: rgba(15, 23, 42, 0.42);
        }

        .assignment-note-head strong {
          color: #eff6ff;
          font-size: 1.05rem;
        }

        .assignment-note-head p {
          margin: 0.35rem 0 0;
          color: #cdd9f4;
          line-height: 1.35;
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
          border-radius: 16px;
          padding: 0.9rem 1rem;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          background: #38bdf8;
          color: #082f49;
          min-height: 72px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          line-height: 1.2;
        }

        .settings-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
          width: min(100%, 720px);
          flex: 1 1 540px;
        }

        .settings-action-btn {
          min-height: 72px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0.9rem 1rem;
          border-radius: 16px;
          font-size: 1rem;
          line-height: 1.2;
          font-weight: 800;
          white-space: normal;
          text-wrap: balance;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        .field.compact-select {
          max-width: 180px;
        }

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
          min-height: 92px;
          resize: vertical;
          font-size: 17px;
          line-height: 1.45;
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

        .fav-btn,
        .hub-report-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .translation-trainer-card {
          display: grid;
          gap: 1rem;
          padding: 1.15rem;
          background: linear-gradient(180deg, rgba(11, 31, 63, 0.96) 0%, rgba(13, 34, 68, 0.92) 100%);
          border: 1px solid rgba(102, 144, 224, 0.28);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .translation-prompt-shell {
          padding: 0;
          border-radius: 0;
          background: transparent;
          border: 0;
        }

        .hub-translation-page .translation-prompt {
          display: grid;
          gap: 0.45rem;
          margin-bottom: 0;
          padding: 0.9rem 1rem 0.95rem;
          border-radius: 0.95rem;
          background: linear-gradient(135deg, rgba(40, 65, 109, 0.9) 0%, rgba(24, 42, 78, 0.92) 100%);
          border: 1px solid rgba(110, 146, 214, 0.18);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .translation-prompt-meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .hub-translation-page .translation-prompt span {
          width: max-content;
          padding: 0.18rem 0.68rem;
          border-radius: 999px;
          color: #13213b;
          background: linear-gradient(180deg, #ffcf70 0%, #f7b842 100%);
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0;
        }

        .translation-prompt-kicker {
          color: #7ba5ef;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .hub-translation-page .translation-prompt strong {
          color: #eef4ff;
          font-size: clamp(1.35rem, 3.2vw, 2.55rem);
          line-height: 1.14;
          text-wrap: balance;
        }

        .hub-translation-page .translation-prompt em {
          color: rgba(220, 231, 252, 0.78);
          font-style: normal;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .translation-actions {
          display: flex;
          gap: 0.65rem;
          flex-wrap: nowrap;
        }

        .translation-action-row {
          display: contents;
          margin-top: 0;
        }

        .translation-action-row .action-btn {
          flex: 1 1 0;
          min-height: 3.3rem;
          padding: 0.72rem 0.85rem;
          border-radius: 0.9rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 800;
          line-height: 1.1;
          border: 1px solid rgba(132, 162, 218, 0.18);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .translation-action-row .action-btn svg {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
        }

        .translation-action-row .action-btn.success {
          background: linear-gradient(180deg, #27d463 0%, #1cb955 100%);
          color: #062b16;
        }

        .translation-action-row .action-btn.warn {
          background: linear-gradient(180deg, #ffb63a 0%, #f2a82a 100%);
          color: #2a2034;
        }

        .translation-action-row .neutral-btn,
        .hub-footer-fav-btn,
        .hub-report-btn {
          background: linear-gradient(180deg, rgba(57, 78, 116, 0.94) 0%, rgba(42, 61, 95, 0.98) 100%);
          color: #eef4ff;
        }

        .hub-footer-fav-btn {
          border: 1px solid rgba(127, 180, 255, 0.22);
        }

        .hub-footer-fav-btn.active,
        .report-fav-btn.active {
          background: linear-gradient(180deg, rgba(88, 109, 146, 0.95) 0%, rgba(70, 91, 127, 0.98) 100%);
          border-color: rgba(255, 211, 106, 0.45);
          color: #fff3bf;
        }

        .hub-fav-label,
        .hub-report-label {
          font-size: 0.82rem;
          font-weight: 800;
        }

        .hub-report-btn,
        .report-report-btn {
          width: auto;
          height: auto;
          gap: 0.45rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 164, 164, 0.2);
          line-height: 1;
        }

        .translation-secondary-actions .action-btn {
          min-height: 2.8rem;
          padding: 0.58rem 0.72rem;
          font-size: 0.78rem;
          font-weight: 700;
          background: rgba(57, 78, 116, 0.64);
        }

        .translation-secondary-actions .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .controls button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .feedback {
          min-height: 56px;
          line-height: 1.65;
          font-size: 18px;
          margin-top: 10px;
        }

        .guided-review-panel {
          display: grid;
          gap: 0.65rem;
          margin-top: 0.15rem;
          padding: 0.9rem;
          border-radius: 1rem;
          border: 1px solid rgba(125, 211, 252, 0.26);
          background:
            linear-gradient(180deg, rgba(14, 32, 58, 0.92), rgba(10, 22, 42, 0.96));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .guided-review-head {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 0.8rem;
        }

        .guided-review-head strong {
          display: block;
          margin-top: 0.12rem;
          color: #eff6ff;
          font-size: 1.05rem;
        }

        .guided-review-kicker {
          color: #7dd3fc;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .guided-review-counts {
          display: flex;
          gap: 0.45rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .guided-review-counts span {
          padding: 0.22rem 0.5rem;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.14);
          border: 1px solid rgba(248, 113, 113, 0.26);
          color: #fecaca;
          font-size: 0.76rem;
          font-weight: 800;
        }

        .guided-feedback {
          min-height: 0;
          margin-top: 0;
          padding-top: 0.1rem;
        }

        .review-focus-token {
          position: relative;
          box-shadow:
            0 0 0 2px rgba(250, 204, 21, 0.88),
            0 0 0 6px rgba(250, 204, 21, 0.16);
        }

        .review-focus-token.missing {
          min-width: 48px;
          background: rgba(250, 204, 21, 0.2);
          border-color: rgba(250, 204, 21, 0.75);
        }

        .post-round-review-callout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin: 0.8rem 0 1rem;
          padding: 0.95rem;
          border-radius: 1rem;
          border: 1px solid rgba(125, 211, 252, 0.3);
          background: linear-gradient(180deg, rgba(14, 32, 58, 0.9), rgba(10, 22, 42, 0.95));
        }

        .post-round-review-callout strong {
          display: block;
          margin-top: 0.12rem;
          color: #eff6ff;
          font-size: 1.05rem;
        }

        .review-start-btn {
          border: 0;
          border-radius: 0.85rem;
          padding: 0.72rem 1rem;
          font-weight: 900;
          cursor: pointer;
        }

        .post-round-review-card {
          display: grid;
          gap: 1rem;
        }

        .post-round-review-top {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 1rem;
        }

        .post-round-review-top h2 {
          margin: 0.1rem 0 0;
        }

        .review-prompt-card {
          margin: 0;
        }

        .review-word-input {
          width: 100%;
          border-radius: 0.95rem;
          border: 1px solid rgba(161, 188, 237, 0.44);
          background: linear-gradient(180deg, rgba(17, 31, 56, 0.96) 0%, rgba(15, 26, 48, 0.98) 100%);
          color: #eef4ff;
          padding: 0.75rem 0.85rem;
          font-size: 1.05rem;
          line-height: 1.2;
        }

        .review-word-input:focus {
          outline: none;
          border-color: rgba(152, 194, 255, 0.8);
          box-shadow: 0 0 0 3px rgba(115, 176, 255, 0.14);
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

        .token-button:disabled {
          opacity: .92;
          cursor: default;
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
          margin-top: 0;
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
          margin-top: 8px;
        }

        .report-bar {
          margin-top: 0.9rem;
          display: grid;
          gap: 0.8rem;
          padding: 0.85rem;
          border-radius: 0.9rem;
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .report-fields {
          display: grid;
          gap: 0.75rem;
        }

        .select,
        .report-input {
          width: 100%;
          border-radius: 0.8rem;
          border: 1px solid rgba(127, 180, 255, 0.25);
          background: rgba(7, 12, 31, 0.9);
          color: #eef4ff;
          padding: 0.78rem 0.9rem;
          font: inherit;
        }

        .report-input {
          resize: vertical;
          min-height: 96px;
        }

        .report-actions-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          flex-wrap: wrap;
        }

        .final-summary {
          color: #cdd9f4;
        }

        .translation-answer-panel {
          display: grid;
          gap: 0.72rem;
        }

        .translation-answer-label {
          display: block;
          margin-top: 0.1rem;
          font-size: 0.95rem;
        }

        .translation-answer-panel textarea {
          min-height: 5.2rem;
          padding: 0.72rem 0.82rem;
          border-radius: 1rem;
          border: 1px solid rgba(161, 188, 237, 0.44);
          background: linear-gradient(180deg, rgba(17, 31, 56, 0.96) 0%, rgba(15, 26, 48, 0.98) 100%);
          color: #eef4ff;
          font-size: clamp(0.88rem, 1.1vw, 1rem);
          line-height: 1.32;
          box-shadow: inset 0 0 0 1px rgba(100, 140, 209, 0.14);
        }

        .translation-answer-panel textarea::placeholder {
          color: rgba(194, 205, 229, 0.46);
        }

        .translation-answer-panel textarea:focus {
          outline: none;
          border-color: rgba(152, 194, 255, 0.8);
          box-shadow:
            0 0 0 3px rgba(115, 176, 255, 0.14),
            inset 0 0 0 1px rgba(127, 180, 255, 0.2);
        }

        .translation-helper-row,
        .translation-instruction-row {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          color: rgba(196, 210, 238, 0.86);
        }

        .translation-helper-row {
          padding-bottom: 0.6rem;
          border-bottom: 1px solid rgba(108, 133, 179, 0.22);
          font-size: 0.82rem;
        }

        .translation-helper-row svg {
          margin-top: 0.05rem;
          color: #78aaf7;
          flex: 0 0 auto;
        }

        .translation-instruction-row {
          font-size: 0.9rem;
          font-weight: 800;
          color: #e9f1ff;
        }

        .translation-instruction-row svg {
          color: #7ab5ff;
          flex: 0 0 auto;
        }

        .clue-help {
          margin-top: -0.15rem;
        }

        .hub-translation-page .report-variants p {
          margin: .25rem 0 0;
          color: rgba(238, 244, 255, .82);
        }

        .hub-translation-page .translation-warning,
        .hub-translation-page .report-warning {
          display: flex;
          align-items: center;
          gap: .5rem;
          width: max-content;
          max-width: 100%;
          padding: .55rem .75rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 124, 124, 0.42);
          background: rgba(120, 23, 39, 0.28);
          color: #ffc6cc;
          font-size: .92rem;
          font-weight: 700;
          line-height: 1.35;
        }

        .hub-translation-page .translation-warning span {
          display: block;
          white-space: normal;
        }

        .hub-translation-page .report-warning {
          margin: 0 0 .8rem;
        }

        @media (max-width: 700px) {
          .translation-actions {
            display: grid;
            gap: 0.65rem;
          }

          .translation-trainer-card {
            padding: 1rem;
          }

          .translation-prompt-shell {
            padding: 0;
          }

          .hub-translation-page .translation-prompt {
            padding: 0.95rem;
          }

          .hub-translation-page .translation-prompt strong {
            font-size: clamp(1.2rem, 7vw, 1.95rem);
          }

          .translation-action-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.65rem;
          }

          .translation-primary-actions {
            grid-template-columns: 1fr 1fr;
          }

          .translation-primary-actions > :nth-child(n + 3) {
            display: none;
          }

          .translation-secondary-actions {
            grid-template-columns: repeat(4, max-content);
            justify-content: start;
          }

          .translation-action-row .action-btn {
            min-height: 3.2rem;
          }

          .settings-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .settings-actions-grid {
            width: 100%;
            grid-template-columns: 1fr;
          }

          textarea {
            min-height: 110px;
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

          .field.compact-select {
            max-width: none;
          }

          .statusbar-sep {
            display: none;
          }

          .statusbar-item {
            width: 100%;
            justify-content: space-between;
          }

          .translation-actions {
            gap: 0.55rem;
          }

          .translation-action-row {
            display: grid;
          }

          .translation-primary-actions {
            grid-template-columns: 1fr 1fr;
          }

          .translation-primary-actions .action-btn {
            min-height: 3rem;
            padding: 0.62rem 0.75rem;
            font-size: 0.78rem;
          }

          .translation-secondary-actions {
            grid-template-columns: repeat(4, max-content);
            justify-content: start;
            gap: 0.45rem;
          }

          .translation-secondary-actions .action-btn {
            min-height: 2.35rem;
            padding: 0.45rem 0.62rem;
            border-radius: 0.78rem;
            font-size: 0.74rem;
          }

          .translation-secondary-actions .action-btn svg {
            width: 14px;
            height: 14px;
          }

          .controls {
            flex-direction: column;
          }

          .translation-helper-row,
          .translation-instruction-row {
            font-size: 0.98rem;
          }
        }
      `}</style>
    </div>
  );
}
