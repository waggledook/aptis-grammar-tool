import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Star } from "lucide-react";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import {
  auth,
  clearHubKeywordMistakes,
  fetchHubKeywordFavourites,
  fetchHubKeywordMistakes,
  fetchKeywordTransformations,
  logHubKeywordCompleted,
  logHubKeywordReviewLoaded,
  logHubKeywordStarted,
  recordHubKeywordMistake,
  removeHubKeywordFavourite,
  saveHubKeywordResult,
  saveHubKeywordFavourite,
  sendReport,
} from "../../firebase";
import { toast } from "../../utils/toast";

const LEVEL_TAGS = ["b2", "c1", "c2"];
const LEVEL_COLORS = {
  b1: "#7fb4ff",
  b2: "#f0c35b",
  c1: "#e69aa0",
  c2: "#c7a6ff",
};
const REPORT_REASONS = [
  { value: "Incorrect transformation", label: "The accepted transformation is incorrect" },
  { value: "Missing valid answer", label: "A valid answer is missing" },
  { value: "Gap or prompt problem", label: "The gap, prompt, or key word is wrong" },
  { value: "Tag or level problem", label: "The tag or level looks wrong" },
  { value: "Other", label: "Other" },
];

function expandSafeContractions(text) {
  return String(text || "")
    .replace(/[’‘]/g, "'")
    .replace(/\bcan't\b/gi, "cannot")
    .replace(/\bwon't\b/gi, "will not")
    .replace(/\bdon't\b/gi, "do not")
    .replace(/\bdoesn't\b/gi, "does not")
    .replace(/\bhaven't\b/gi, "have not")
    .replace(/\bhasn't\b/gi, "has not")
    .replace(/\bhadn't\b/gi, "had not")
    .replace(/\bdidn't\b/gi, "did not")
    .replace(/\bwasn't\b/gi, "was not")
    .replace(/\bweren't\b/gi, "were not")
    .replace(/\bI'm\b/gi, "I am")
    .replace(/\byou're\b/gi, "you are")
    .replace(/\bwe're\b/gi, "we are")
    .replace(/\bthey're\b/gi, "they are")
    .replace(/\bI've\b/gi, "I have")
    .replace(/\byou've\b/gi, "you have")
    .replace(/\bwe've\b/gi, "we have")
    .replace(/\bthey've\b/gi, "they have")
    .replace(/\bI'll\b/gi, "I will")
    .replace(/\byou'll\b/gi, "you will")
    .replace(/\bwe'll\b/gi, "we will")
    .replace(/\bthey'll\b/gi, "they will")
    .replace(/\b(\w+)'d(?=\s+\w+(ed|en)\b)/gi, "$1 had")
    .replace(/\b(\w+)'d\b/gi, "$1 would")
    .replace(/\b(\w+)'s\b/gi, "$1 is");
}

function normalize(text) {
  return expandSafeContractions(text)
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const normalized = normalize(text);
  return normalized ? normalized.split(" ") : [];
}

function splitAnswers(answer) {
  if (Array.isArray(answer)) return answer;
  return String(answer || "")
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getTagsArray(tags) {
  if (typeof tags !== "string") return [];
  return tags
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function stableIdFromChallenge(item) {
  const raw = `${item.keyWord || ""}::${item.fullSentence || ""}::${item.gapFill || ""}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `kw_${Math.abs(hash)}`;
}

function prepareKeywordItem(item) {
  return {
    ...item,
    itemId: item.itemId || item.id || stableIdFromChallenge(item),
    acceptedAnswers: splitAnswers(item.answer || item.acceptedAnswers || []),
  };
}

function buildWordFeedback(userText, correctText) {
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
      aligned.push({ token: "word missing", className: "missing" });
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      aligned.push({ token: userWords[i - 1], className: "wrong" });
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      aligned.push({ token: userWords[i - 1], className: "extra" });
      i -= 1;
    } else {
      break;
    }
  }

  return {
    distance: dp[userWords.length][correctWords.length],
    tokens: aligned.reverse(),
  };
}

function getBestWordFeedback(userText, acceptedAnswers) {
  const answers = Array.isArray(acceptedAnswers) ? acceptedAnswers : [];
  if (!answers.length) return null;

  return answers.reduce((best, answer) => {
    const next = buildWordFeedback(userText, answer);
    if (!best || next.distance < best.distance) {
      return { ...next, answer };
    }
    return best;
  }, null);
}

export default function HubKeywordTrainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const completionLoggedRef = useRef(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState(["b2", "c1", "c2"]);
  const [primaryTag, setPrimaryTag] = useState("all");
  const [secondaryTag, setSecondaryTag] = useState("none");
  const [challenges, setChallenges] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [reportingIndex, setReportingIndex] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [currentSetMode, setCurrentSetMode] = useState("normal");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [initialModeHandled, setInitialModeHandled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (loading || initialModeHandled) return;
    const mode = searchParams.get("mode");
    if (mode === "favourites") {
      setInitialModeHandled(true);
      loadFavouriteChallenges();
      return;
    }
    if (mode === "mistakes") {
      setInitialModeHandled(true);
      loadRecentMistakes();
      return;
    }
    setInitialModeHandled(true);
  }, [loading, initialModeHandled, searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [data, favourites] = await Promise.all([
          fetchKeywordTransformations(),
          auth.currentUser ? fetchHubKeywordFavourites() : Promise.resolve([]),
        ]);

        if (!cancelled) {
          setItems((Array.isArray(data) ? data : []).map(prepareKeywordItem));
          setFavouriteIds(new Set(favourites.map((item) => item.itemId)));
        }
      } catch (error) {
        console.error("[HubKeywordTrainer] load failed", error);
        if (!cancelled) {
          toast("Could not load keyword transformations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredByLevel = useMemo(() => {
    const selectedLevels = levels.length ? levels : LEVEL_TAGS;
    return items.filter((item) => {
      const tags = getTagsArray(item.tags);
      return selectedLevels.some((level) => tags.includes(level));
    });
  }, [items, levels]);

  const availablePrimaryTags = useMemo(() => {
    const tagSet = new Set();
    filteredByLevel.forEach((item) => {
      getTagsArray(item.tags)
        .filter((tag) => !LEVEL_TAGS.includes(tag))
        .forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [filteredByLevel]);

  const availableSecondaryTags = useMemo(() => {
    if (primaryTag === "all") return [];
    const tagSet = new Set();
    filteredByLevel
      .filter((item) => getTagsArray(item.tags).includes(primaryTag))
      .forEach((item) => {
        getTagsArray(item.tags)
          .filter((tag) => !LEVEL_TAGS.includes(tag) && tag !== primaryTag)
          .forEach((tag) => tagSet.add(tag));
      });
    return Array.from(tagSet).sort();
  }, [filteredByLevel, primaryTag]);

  const challengePool = useMemo(() => {
    let pool = filteredByLevel;

    if (primaryTag !== "all") {
      pool = pool.filter((item) => getTagsArray(item.tags).includes(primaryTag));
    }

    if (secondaryTag !== "none") {
      pool = pool.filter((item) => getTagsArray(item.tags).includes(secondaryTag));
    }

    return pool;
  }, [filteredByLevel, primaryTag, secondaryTag]);

  function resetChallengeState(nextChallenges) {
    setChallenges(nextChallenges);
    completionLoggedRef.current = false;
    setAnswers({});
    setResults({});
    setRevealedAnswers({});
    setReportingIndex(null);
    setReportReason("");
    setReportComment("");
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  function startGame() {
    if (!challengePool.length) {
      toast("No keyword transformations match those filters.");
      return;
    }

    logHubKeywordStarted({
      mode: "normal",
      total: Math.min(8, challengePool.length),
      poolSize: challengePool.length,
      levels,
      primaryTag,
      secondaryTag,
      source: "HubKeywordTrainer",
    });
    setCurrentSetMode("normal");
    resetChallengeState(shuffle(challengePool).slice(0, 8));
  }

  async function loadFavouriteChallenges() {
    try {
      const favourites = (await fetchHubKeywordFavourites()).map(prepareKeywordItem);
      if (!favourites.length) {
        toast("No favourite keyword items yet.");
        return;
      }
      await logHubKeywordReviewLoaded({
        mode: "favourites",
        total: favourites.length,
        source: "HubKeywordTrainer",
      });
      setCurrentSetMode("favourites");
      resetChallengeState(favourites);
    } catch (error) {
      console.error("[HubKeywordTrainer] load favourites failed", error);
      toast("Could not load favourite keyword items.");
    }
  }

  async function loadRecentMistakes() {
    try {
      const mistakes = (await fetchHubKeywordMistakes()).map(prepareKeywordItem);
      const deduped = [];
      const seen = new Set();

      mistakes.forEach((item) => {
        if (!seen.has(item.itemId)) {
          seen.add(item.itemId);
          deduped.push(item);
        }
      });

      if (!deduped.length) {
        toast("No recent keyword mistakes yet.");
        return;
      }

      await logHubKeywordReviewLoaded({
        mode: "mistakes",
        total: deduped.length,
        source: "HubKeywordTrainer",
      });
      setCurrentSetMode("mistakes");
      resetChallengeState(deduped);
    } catch (error) {
      console.error("[HubKeywordTrainer] load mistakes failed", error);
      toast("Could not load recent keyword mistakes.");
    }
  }

  function handleAnswerChange(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function revealAnswers(index) {
    setRevealedAnswers((prev) => ({ ...prev, [index]: true }));
  }

  function handleAnswerKeyDown(event, index) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSubmit(index);
  }

  async function handleSubmit(index) {
    const challenge = challenges[index];
    const userAnswer = answers[index] || "";
    const isCorrect = challenge.acceptedAnswers.some(
      (answer) => normalize(answer) === normalize(userAnswer)
    );
    const bestFeedback = getBestWordFeedback(userAnswer, challenge.acceptedAnswers);
    const hadIncorrectAttempt = Boolean(results[index] && !results[index].isCorrect);

    setResults((prev) => ({
      ...prev,
      [index]: {
        isCorrect,
        acceptedAnswers: challenge.acceptedAnswers,
        bestFeedback,
        hadIncorrectAttempt: prev[index]?.hadIncorrectAttempt || !isCorrect,
      },
    }));

    try {
      await saveHubKeywordResult(challenge.itemId, challenge.tags || "", isCorrect);
    } catch (error) {
      console.error("[HubKeywordTrainer] save result failed", error);
    }

    if (isCorrect && (!hadIncorrectAttempt || currentSetMode === "mistakes")) {
      try {
        await clearHubKeywordMistakes(challenge.itemId);
      } catch (error) {
        console.error("[HubKeywordTrainer] clear mistakes failed", error);
      }
      return;
    }

    try {
      await recordHubKeywordMistake({
        itemId: challenge.itemId,
        keyWord: challenge.keyWord || "",
        gapFill: challenge.gapFill || "",
        fullSentence: challenge.fullSentence || "",
        acceptedAnswers: challenge.acceptedAnswers,
        tags: challenge.tags || "",
      });
    } catch (error) {
      console.error("[HubKeywordTrainer] record mistake failed", error);
    }
  }

  async function toggleFavourite(challenge) {
    const isFavourite = favouriteIds.has(challenge.itemId);
    try {
      if (isFavourite) {
        await removeHubKeywordFavourite(challenge.itemId);
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(challenge.itemId);
          return next;
        });
        toast("Removed from favourites.");
      } else {
        await saveHubKeywordFavourite({
          itemId: challenge.itemId,
          keyWord: challenge.keyWord || "",
          gapFill: challenge.gapFill || "",
          fullSentence: challenge.fullSentence || "",
          answer: challenge.acceptedAnswers,
          tags: challenge.tags || "",
        });
        setFavouriteIds((prev) => new Set([...prev, challenge.itemId]));
        toast("Added to favourites.");
      }
    } catch (error) {
      console.error("[HubKeywordTrainer] favourite toggle failed", error);
      toast("Could not update favourites.");
    }
  }

  async function handleSendReport(index) {
    const challenge = challenges[index];
    if (!reportReason || sendingReport || !challenge) return;

    setSendingReport(true);
    try {
      const result = results[index];
      await sendReport({
        itemId: challenge.itemId,
        question: `${challenge.fullSentence}\n\n${challenge.gapFill}\n\nKey word: ${challenge.keyWord}`,
        issue: reportReason === "Other" ? "other" : reportReason,
        comments: reportComment.trim(),
        level: getTagsArray(challenge.tags).find((tag) => LEVEL_TAGS.includes(tag))?.toUpperCase() || null,
        selectedOption: answers[index] || null,
        correctOption: challenge.acceptedAnswers.join(" / "),
      });

      toast(
        auth.currentUser?.email
          ? `Thanks — we emailed a copy to ${auth.currentUser.email}.`
          : "Thanks — your report was sent."
      );

      setReportingIndex(null);
      setReportReason("");
      setReportComment("");
    } catch (error) {
      console.error("[HubKeywordTrainer] report failed", error);
      toast("Sorry — failed to send. Please try again.");
    } finally {
      setSendingReport(false);
    }
  }

  function toggleLevel(level) {
    setLevels((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  }

  useEffect(() => {
    if (primaryTag !== "all" && !availablePrimaryTags.includes(primaryTag)) {
      setPrimaryTag("all");
      setSecondaryTag("none");
    }
  }, [availablePrimaryTags, primaryTag]);

  useEffect(() => {
    if (secondaryTag !== "none" && !availableSecondaryTags.includes(secondaryTag)) {
      setSecondaryTag("none");
    }
  }, [availableSecondaryTags, secondaryTag]);

  const score = challenges.reduce((sum, _, index) => sum + (results[index]?.isCorrect ? 1 : 0), 0);
  const checkedCount = Object.keys(results).length;

  useEffect(() => {
    if (!challenges.length || checkedCount !== challenges.length || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logHubKeywordCompleted({
      mode: currentSetMode,
      answered: checkedCount,
      correct: score,
      total: challenges.length,
      levels,
      primaryTag,
      secondaryTag,
      source: "HubKeywordTrainer",
    });
  }, [checkedCount, challenges, currentSetMode, levels, primaryTag, score, secondaryTag]);

  return (
    <div className="hub-keyword-page">
      <Seo
        title="Keyword Transformations | Seif Hub"
        description="Practise keyword transformations inside the Seif English Hub."
      />

      <div className="hub-keyword-shell">
        <div className="hub-keyword-topbar">
          <button className="review-btn" onClick={() => navigate(getSitePath("/use-of-english"))}>
            ← Back to use of English
          </button>
        </div>

        <header className="hub-keyword-header">
          <span className="hub-keyword-kicker">Seif Hub Use Of English</span>
          <h1>Keyword Transformations</h1>
          <p>
            Rephrase each sentence using the given key word. Select tasks by level and language focus.
          </p>
        </header>

        <section className="hub-keyword-card">
          <div className="hub-keyword-filters">
            <div className="field-block">
              <span className="field-label">Levels</span>
              <div className="level-row">
                {LEVEL_TAGS.map((level) => (
                  <label
                    key={level}
                    className={`level-pill level-chip ${levels.includes(level) ? "selected" : ""}`}
                    style={{ "--badge-color": LEVEL_COLORS[level] || "#8aa0ff" }}
                  >
                    <input
                      type="checkbox"
                      checked={levels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />
                    <span className="dot" aria-hidden="true" />
                    <span>{level.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field-block">
              <label className="field-label" htmlFor="keyword-primary-tag">Primary tag</label>
              <select
                id="keyword-primary-tag"
                value={primaryTag}
                onChange={(event) => {
                  setPrimaryTag(event.target.value);
                  setSecondaryTag("none");
                }}
              >
                <option value="all">All tags</option>
                {availablePrimaryTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-block">
              <label className="field-label" htmlFor="keyword-secondary-tag">Secondary tag</label>
              <select
                id="keyword-secondary-tag"
                value={secondaryTag}
                onChange={(event) => setSecondaryTag(event.target.value)}
                disabled={primaryTag === "all"}
              >
                <option value="none">None</option>
                {availableSecondaryTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hub-keyword-actions">
            <button className="generate-btn" onClick={startGame} disabled={loading}>
              {loading ? "Loading..." : "Start set"}
            </button>
            <button
              className="review-btn favourites"
              onClick={loadFavouriteChallenges}
              disabled={loading}
            >
              My favourites
            </button>
            <button
              className="review-btn mistakes"
              onClick={loadRecentMistakes}
              disabled={loading}
            >
              Review recent mistakes
            </button>
            <span className="hub-keyword-meta">
              Pool: {challengePool.length} item{challengePool.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {!!challenges.length && (
          <section className="hub-keyword-summary">
            <div>
              <span className="hub-keyword-summary-label">Checked</span>
              <strong>{checkedCount}/{challenges.length}</strong>
            </div>
            <div>
              <span className="hub-keyword-summary-label">Correct</span>
              <strong>{score}/{challenges.length}</strong>
            </div>
          </section>
        )}

        {challenges.map((challenge, index) => {
          const levelTag = getTagsArray(challenge.tags).find((tag) => LEVEL_TAGS.includes(tag));
          const result = results[index];
          const isFavourite = favouriteIds.has(challenge.itemId);
          const isReporting = reportingIndex === index;

          return (
            <article key={challenge.itemId} className="hub-keyword-card hub-keyword-challenge">
              <div className="card-header hub-keyword-card-header">
                <div className="hub-keyword-card-meta">
                  {levelTag && (
                    <span
                      className="cefr-badge"
                      style={{ "--badge-color": LEVEL_COLORS[levelTag] || "#8aa0ff" }}
                    >
                      {levelTag.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="hub-keyword-prompt">
                <p className="hub-keyword-source">{challenge.fullSentence}</p>
                <div className="hub-keyword-keyline">
                  <span className="hub-keyword-keylabel">Key word</span>
                  <strong>{String(challenge.keyWord || "").toUpperCase()}</strong>
                </div>
                <p className="hub-keyword-gapfill">{challenge.gapFill}</p>
              </div>

              <div className="hub-keyword-answer-row">
                <input
                  type="text"
                  value={answers[index] || ""}
                  onChange={(event) => handleAnswerChange(index, event.target.value)}
                  onKeyDown={(event) => handleAnswerKeyDown(event, index)}
                  placeholder="Enter your transformation"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  autoComplete="off"
                />
                <button className="generate-btn hub-check-btn" onClick={() => handleSubmit(index)}>
                  Check
                </button>
              </div>

              {result && (
                <div className={`hub-keyword-feedback ${result.isCorrect ? "is-correct" : "is-wrong"}`}>
                  <strong>{result.isCorrect ? "Correct" : "Try again"}</strong>
                  {!result.isCorrect && !!result.bestFeedback?.tokens?.length && (
                    <div className="hub-keyword-token-feedback">
                      {result.bestFeedback.tokens.map((item, tokenIndex) => (
                        <span
                          key={`${item.className}-${item.token}-${tokenIndex}`}
                          className={`hub-keyword-token ${item.className}`}
                        >
                          {item.token}
                        </span>
                      ))}
                    </div>
                  )}
                  {!result.isCorrect && !revealedAnswers[index] && (
                    <button
                      type="button"
                      className="review-btn hub-reveal-btn"
                      onClick={() => revealAnswers(index)}
                    >
                      Show possible answers
                    </button>
                  )}
                  {!result.isCorrect && revealedAnswers[index] && (
                    <p>Possible answers: {result.acceptedAnswers.join(" / ")}</p>
                  )}
                </div>
              )}

              <div className="hub-keyword-footer-actions">
                <button
                  className={`fav-btn hub-footer-fav-btn ${isFavourite ? "active" : ""}`}
                  onClick={() => toggleFavourite(challenge)}
                  aria-pressed={isFavourite}
                  aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                  title={isFavourite ? "Remove from favourites" : "Add to favourites"}
                >
                  {isFavourite ? (
                    <Star size={18} fill="#ffd36a" stroke="#ffd36a" />
                  ) : (
                    <Star size={18} />
                  )}
                  <span className="hub-fav-label">
                    {isFavourite ? "Saved" : "Save"}
                  </span>
                </button>

                <button
                  className="hub-report-btn"
                  onClick={() => {
                    setReportingIndex((prev) => (prev === index ? null : index));
                    setReportReason("");
                    setReportComment("");
                  }}
                  title="Report a problem"
                >
                  <AlertCircle size={18} />
                  <span className="hub-report-label">Report</span>
                </button>
              </div>

              {isReporting && (
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

                  <div className="report-actions">
                    <button
                      className="review-btn"
                      onClick={() => handleSendReport(index)}
                      disabled={!reportReason || sendingReport}
                    >
                      {sendingReport ? "Sending…" : "Send report"}
                    </button>
                    <button className="review-btn" onClick={() => setReportingIndex(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <style>{`
        .hub-keyword-page { width: 100%; }
        .hub-keyword-shell { max-width: 940px; margin: 0 auto; }
        .hub-keyword-topbar { margin-bottom: 1rem; }
        .hub-keyword-header,
        .hub-keyword-card,
        .hub-keyword-summary > div {
          background: linear-gradient(180deg, rgba(24,41,79,0.98), rgba(20,36,71,0.98));
          border: 1px solid rgba(53, 80, 142, 0.8);
          border-radius: 1rem;
          box-shadow: 0 10px 22px rgba(0,0,0,0.12);
        }
        .hub-keyword-header,
        .hub-keyword-card { padding: 1.2rem 1.25rem; margin-bottom: 1rem; }
        .hub-keyword-challenge { position: relative; }
        .hub-keyword-kicker {
          display: inline-block;
          margin-bottom: 0.5rem;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          background: rgba(253, 191, 45, 0.12);
          border: 1px solid rgba(253, 191, 45, 0.24);
          color: #ffd56e;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .hub-keyword-header p { margin: 0; color: #dbe7ff; line-height: 1.55; }
        .hub-keyword-filters {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .field-block { display: grid; gap: 0.45rem; }
        .field-label { color: #dbe7ff; font-weight: 700; }
        .level-row { display: flex; gap: 0.55rem; flex-wrap: wrap; }
        .level-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.65rem;
          border-radius: 999px;
          border: 1px solid rgba(74, 107, 192, 0.55);
          background: rgba(2,6,23,0.3);
          color: #eef4ff;
        }
        .level-pill input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        .field-block select,
        .hub-keyword-answer-row input,
        .select,
        .report-input {
          width: 100%;
          background: #020617;
          color: #f8fafc;
          border: 1px solid #3b4f7e;
          border-radius: 0.75rem;
          padding: 0.75rem 0.85rem;
          font-size: 1rem;
        }
        .report-input {
          resize: vertical;
          min-height: 90px;
        }
        .hub-keyword-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        .hub-keyword-meta { color: #c9d7f4; }
        .hub-keyword-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
          margin-bottom: 1rem;
        }
        .hub-keyword-summary > div { padding: 0.9rem 1rem; }
        .hub-keyword-summary-label {
          display: block;
          margin-bottom: 0.25rem;
          color: #94a3b8;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .hub-keyword-card-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 0.7rem;
          min-height: 1.75rem;
          gap: 0.75rem;
        }
        .hub-keyword-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
        }
        .hub-keyword-prompt { display: grid; gap: 0.55rem; margin-bottom: 0.85rem; }
        .hub-keyword-source {
          margin: 0;
          color: #eef4ff;
          line-height: 1.55;
          font-size: 1.05rem;
          padding-right: 2.5rem;
        }
        .hub-keyword-keyline {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }
        .hub-keyword-keylabel {
          color: #7fb4ff;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.04em;
        }
        .hub-keyword-keyline strong {
          color: #ffd56e;
          font-size: 1.1rem;
        }
        .hub-keyword-gapfill {
          margin: 0;
          color: #d8e5ff;
          line-height: 1.55;
          font-size: 1.05rem;
        }
        .hub-keyword-answer-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .hub-keyword-answer-row button,
        .review-btn,
        .hub-report-btn {
          flex-shrink: 0;
          border-radius: 0.8rem;
          padding: 0.8rem 1rem;
          font-weight: 800;
          cursor: pointer;
        }
        .hub-keyword-answer-row button {
          min-width: 112px;
        }
        .hub-check-btn {
          min-height: 54px;
          white-space: nowrap;
        }
        .hub-keyword-feedback {
          margin-top: 0.85rem;
          padding: 0.75rem 0.85rem;
          border-radius: 0.8rem;
          border: 1px solid transparent;
        }
        .hub-keyword-feedback strong { display: block; margin-bottom: 0.25rem; }
        .hub-keyword-feedback p { margin: 0.2rem 0 0; line-height: 1.5; }
        .hub-reveal-btn {
          margin-top: 0.7rem;
          align-self: flex-start;
        }
        .hub-keyword-token-feedback {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.65rem;
        }
        .hub-keyword-token {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2rem;
          padding: 0.3rem 0.55rem;
          border-radius: 0.65rem;
          border: 1px solid transparent;
          font-weight: 700;
          line-height: 1.15;
          background: rgba(255,255,255,0.08);
        }
        .hub-keyword-token.correct {
          background: rgba(52, 211, 153, 0.18);
          border-color: rgba(52, 211, 153, 0.32);
          color: #d1fae5;
        }
        .hub-keyword-token.wrong {
          background: rgba(248, 113, 113, 0.18);
          border-color: rgba(248, 113, 113, 0.32);
          color: #ffe4e6;
        }
        .hub-keyword-token.missing {
          background: rgba(250, 204, 21, 0.16);
          border-color: rgba(250, 204, 21, 0.3);
          color: #fef3c7;
        }
        .hub-keyword-token.extra {
          background: rgba(96, 165, 250, 0.16);
          border-color: rgba(96, 165, 250, 0.32);
          color: #dbeafe;
        }
        .hub-keyword-token.extra::before {
          content: "Extra:";
          margin-right: 0.35rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          opacity: 0.85;
        }
        .hub-keyword-feedback.is-correct {
          background: rgba(52, 211, 153, 0.12);
          border-color: rgba(52, 211, 153, 0.22);
          color: #d1fae5;
        }
        .hub-keyword-feedback.is-wrong {
          background: rgba(248, 113, 113, 0.12);
          border-color: rgba(248, 113, 113, 0.22);
          color: #fee2e2;
        }
        .hub-keyword-footer-actions {
          margin-top: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          flex-wrap: wrap;
        }
        .hub-footer-fav-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          width: auto;
          height: auto;
          padding: 0.58rem 0.84rem;
          border-radius: 0.8rem;
          color: #eef4ff;
          background: rgba(127, 180, 255, 0.16);
          border: 1px solid rgba(127, 180, 255, 0.34);
        }
        .hub-footer-fav-btn.active {
          background: rgba(255, 211, 106, 0.12);
          border-color: rgba(255, 211, 106, 0.4);
          color: #fff3bf;
        }
        .hub-fav-label {
          font-size: 0.95rem;
          font-weight: 800;
        }
        .hub-report-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: auto;
          height: auto;
          padding: 0.58rem 0.84rem;
          gap: 0.45rem;
          border-radius: 0.8rem;
          border: 1px solid rgba(248, 113, 113, 0.32);
          background: rgba(248, 113, 113, 0.14);
          color: #ffd7d7;
          line-height: 1;
        }
        .hub-report-label { font-size: 0.95rem; font-weight: 800; }
        .report-bar {
          margin-top: 0.9rem;
          display: grid;
          gap: 0.8rem;
          padding-top: 0.9rem;
          border-top: 1px solid rgba(127, 180, 255, 0.18);
        }
        .report-fields,
        .report-actions {
          display: grid;
          gap: 0.75rem;
        }
        @media (max-width: 760px) {
          .hub-keyword-filters,
          .hub-keyword-summary { grid-template-columns: 1fr; }
          .hub-keyword-answer-row { flex-direction: column; align-items: stretch; }
          .hub-keyword-answer-row button { width: 100%; }
          .hub-keyword-footer-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .hub-footer-fav-btn,
          .hub-report-btn {
            width: 100%;
            justify-content: center;
          }
          .hub-keyword-source,
          .hub-keyword-gapfill {
            font-size: 1rem;
            line-height: 1.45;
            padding-right: 0;
          }
          .hub-keyword-card,
          .hub-keyword-header {
            padding: 1rem;
          }
        }
        @media (max-width: 520px) {
          .hub-keyword-filters .level-row {
            flex-wrap: wrap;
            overflow-x: visible;
            gap: 8px;
          }
          .hub-keyword-header h1 {
            font-size: 1.8rem;
            line-height: 1.1;
          }
          .hub-keyword-source,
          .hub-keyword-gapfill {
            font-size: 0.97rem;
          }
          .hub-keyword-keyline {
            gap: 0.4rem;
          }
          .hub-keyword-keyline strong {
            font-size: 1rem;
          }
          .hub-keyword-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .hub-keyword-actions > button {
            width: 100%;
          }
          .hub-keyword-meta {
            text-align: center;
          }
          .hub-keyword-feedback {
            padding: 0.7rem 0.75rem;
          }
          .hub-keyword-token-feedback {
            gap: 0.35rem;
          }
          .hub-keyword-token {
            min-height: 1.8rem;
            padding: 0.25rem 0.45rem;
            font-size: 0.92rem;
          }
        }
      `}</style>
    </div>
  );
}
