import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearHubKeywordMistakes,
  clearHubOpenClozeMistakes,
  clearHubWordFormationMistakes,
  createGrammarSetAttemptDraft,
  getGrammarSet,
  recordHubKeywordMistake,
  recordHubOpenClozeMistake,
  recordHubWordFormationMistake,
  saveHubKeywordResult,
  saveHubOpenClozeResult,
  saveHubWordFormationResult,
  updateGrammarSetAttemptDraft,
} from "../../firebase";
import { toast } from "../../utils/toast";

const LEVEL_COLORS = {
  b1: "#5bc0eb",
  b2: "#ffd166",
  c1: "#7bd389",
  c2: "#c792ea",
};

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

function normalizeKeywordAnswer(value) {
  return expandSafeContractions(value)
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeLetterAnswer(value) {
  return String(value || "")
    .replace(/[’‘]/g, "'")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeAnswer(value, source) {
  return source === "keyword"
    ? normalizeKeywordAnswer(value)
    : normalizeLetterAnswer(value)
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .trim();
}

function tokenizeKeyword(text) {
  const normalized = normalizeKeywordAnswer(text).trim();
  return normalized ? normalized.split(" ") : [];
}

function toLetterChars(text) {
  return Array.from(
    String(text || "")
      .replace(/[’‘]/g, "'")
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function buildWordFeedback(userText, correctText) {
  const userWords = tokenizeKeyword(userText);
  const correctWords = tokenizeKeyword(correctText);
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

function buildLetterFeedback(userText, correctText) {
  const userChars = toLetterChars(userText);
  const correctChars = toLetterChars(correctText);
  const dp = Array.from({ length: userChars.length + 1 }, () =>
    Array(correctChars.length + 1).fill(0)
  );

  for (let i = 0; i <= userChars.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= correctChars.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= userChars.length; i += 1) {
    for (let j = 1; j <= correctChars.length; j += 1) {
      if (userChars[i - 1] === correctChars[j - 1]) {
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
  let i = userChars.length;
  let j = correctChars.length;

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      userChars[i - 1] === correctChars[j - 1] &&
      dp[i][j] === dp[i - 1][j - 1]
    ) {
      aligned.push({ token: correctChars[j - 1], className: "correct" });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
      aligned.push({ token: "·", className: "missing" });
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      aligned.push({ token: userChars[i - 1], className: "wrong" });
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      aligned.push({ token: userChars[i - 1], className: "extra" });
      i -= 1;
    } else {
      break;
    }
  }

  return {
    distance: dp[userChars.length][correctChars.length],
    letters: aligned.reverse(),
  };
}

function getBestLetterFeedback(userText, acceptedAnswers) {
  const answers = Array.isArray(acceptedAnswers) ? acceptedAnswers : [];
  if (!answers.length) return null;

  return answers.reduce((best, answer) => {
    const next = buildLetterFeedback(userText, answer);
    if (!best || next.distance < best.distance) {
      return { ...next, answer };
    }
    return best;
  }, null);
}

function getAcceptedAnswers(item) {
  if (Array.isArray(item?.acceptedAnswers) && item.acceptedAnswers.length) {
    return item.acceptedAnswers
      .map((entry) => normalizeAnswer(entry, item.source))
      .filter(Boolean);
  }

  return String(item?.answer || "")
    .split("/")
    .map((entry) => normalizeAnswer(entry, item.source))
    .filter(Boolean);
}

function displayAcceptedAnswers(item) {
  if (Array.isArray(item?.acceptedAnswers) && item.acceptedAnswers.length) {
    return item.acceptedAnswers.join(" / ");
  }

  return item?.answer || "";
}

function getBestFeedback(item, userAnswer) {
  const acceptedAnswers = getAcceptedAnswers(item);
  if (item.source === "keyword") {
    return getBestWordFeedback(userAnswer, acceptedAnswers);
  }
  return getBestLetterFeedback(userAnswer, acceptedAnswers);
}

function getPromptLabel(item) {
  if (item.source === "keyword") return "Enter your transformation";
  if (item.source === "word-formation") return "Enter the correct form";
  return "Enter the missing word";
}

async function syncHubProgressForItem(item, isCorrect, hadIncorrectAttempt) {
  const tags = item.tags || "";

  if (item.source === "keyword") {
    await saveHubKeywordResult(item.id, tags, isCorrect);
    if (isCorrect && !hadIncorrectAttempt) {
      await clearHubKeywordMistakes(item.id);
      return;
    }
    if (isCorrect) return;
    await recordHubKeywordMistake({
      itemId: item.id,
      keyWord: item.keyWord || "",
      gapFill: item.gapFill || item.title || "",
      fullSentence: item.fullSentence || "",
      acceptedAnswers: getAcceptedAnswers(item),
      tags,
    });
    return;
  }

  if (item.source === "word-formation") {
    await saveHubWordFormationResult(item.id, tags, isCorrect);
    if (isCorrect && !hadIncorrectAttempt) {
      await clearHubWordFormationMistakes(item.id);
      return;
    }
    if (isCorrect) return;
    await recordHubWordFormationMistake({
      itemId: item.id,
      base: item.base || "",
      gappedSentence: item.gappedSentence || item.title || "",
      acceptedAnswers: getAcceptedAnswers(item),
      tags,
    });
    return;
  }

  await saveHubOpenClozeResult(item.id, tags, isCorrect);
  if (isCorrect && !hadIncorrectAttempt) {
    await clearHubOpenClozeMistakes(item.id);
    return;
  }
  if (isCorrect) return;
  await recordHubOpenClozeMistake({
    itemId: item.id,
    gappedSentence: item.gappedSentence || item.title || "",
    acceptedAnswers: getAcceptedAnswers(item),
    tags,
  });
}

function renderPrompt(item) {
  if (item.source === "keyword") {
    return (
      <>
        <p className="hub-keyword-source">{item.fullSentence || item.title}</p>
        <div className="hub-keyword-keyline">
          <span className="hub-keyword-keylabel">Key word</span>
          <strong>{String(item.keyWord || "").toUpperCase()}</strong>
        </div>
        <p className="hub-keyword-gapfill">{item.gapFill || item.title}</p>
      </>
    );
  }

  if (item.source === "word-formation") {
    return (
      <>
        <p className="hub-keyword-gapfill">{item.gappedSentence || item.title}</p>
        <div className="hub-keyword-keyline">
          <span className="hub-keyword-keylabel">Base word</span>
          <strong>{String(item.base || "").toUpperCase()}</strong>
        </div>
      </>
    );
  }

  return <p className="hub-keyword-gapfill">{item.gappedSentence || item.title}</p>;
}

export default function UseOfEnglishCustomQuizRunner({ user }) {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [setMeta, setSetMeta] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const meta = await getGrammarSet(setId);
        if (
          !meta ||
          meta.visibility !== "published" ||
          meta.setType !== "use_of_english_custom"
        ) {
          if (!cancelled) setSetMeta(null);
          return;
        }

        if (!cancelled) setSetMeta(meta);
      } catch (error) {
        console.error("[UseOfEnglishCustomQuizRunner] load failed", error);
        if (!cancelled) setSetMeta(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [setId]);

  const items = useMemo(
    () => (Array.isArray(setMeta?.quizItems) ? setMeta.quizItems : []),
    [setMeta]
  );

  const checkedCount = useMemo(
    () => Object.keys(results).length,
    [results]
  );

  const scoreCount = useMemo(
    () => Object.values(results).filter((entry) => entry?.firstAttemptCorrect).length,
    [results]
  );

  function updateAnswer(itemId, value) {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  }

  function buildAttemptAnswers(nextResults) {
    return items
      .filter((item) => nextResults[item.id])
      .map((item) => {
        const result = nextResults[item.id];
        return {
          itemId: item.id,
          source: item.source,
          prompt:
            item.title ||
            item.gappedSentence ||
            item.gapFill ||
            item.fullSentence ||
            "",
          support: item.support || "",
          studentAnswer: result.studentAnswer || "",
          firstAttempt: result.firstAttempt || result.studentAnswer || "",
          attempts: result.attempts || [],
          selectedOption: result.studentAnswer || "",
          correctAnswer: displayAcceptedAnswers(item),
          correctOption: displayAcceptedAnswers(item),
          isCorrect: !!result.isCorrect,
          firstAttemptCorrect: !!result.firstAttemptCorrect,
        };
      });
  }

  async function persistAttempt(nextResults) {
    const answerDetails = buildAttemptAnswers(nextResults);
    const checked = answerDetails.length;
    const score = answerDetails.filter((entry) => entry.firstAttemptCorrect).length;

    if (!checked) return;

    const payload = {
      setId,
      setTitle: setMeta?.title || "",
      ownerUid: setMeta?.ownerId || null,
      studentUid: user?.uid || null,
      studentEmail: user?.email || null,
      score,
      total: items.length,
      checkedCount: checked,
      answers: answerDetails,
      completed: checked === items.length,
      submittedAt: checked === items.length ? new Date() : null,
    };

    if (!attemptId) {
      const createdId = await createGrammarSetAttemptDraft(payload);
      setAttemptId(createdId);
      setSyncMessage("Progress saved.");
      return;
    }

    await updateGrammarSetAttemptDraft(attemptId, payload);
    setSyncMessage(payload.completed ? "All checked. Progress saved." : "Progress saved.");
  }

  async function checkItem(item) {
    const rawAnswer = answers[item.id] || "";
    const previous = results[item.id];
    const normalizedAnswer = normalizeAnswer(rawAnswer, item.source);
    const accepted = getAcceptedAnswers(item);
    const isCorrect = accepted.some((answer) => normalizeAnswer(answer, item.source) === normalizedAnswer);
    const bestFeedback = getBestFeedback(item, rawAnswer);
    const hadIncorrectAttempt = Boolean((previous && previous.hadIncorrectAttempt) || !isCorrect);
    const attemptEntry = {
      answer: rawAnswer,
      isCorrect,
      checkedAt: new Date().toISOString(),
    };

    const nextResults = {
      ...results,
      [item.id]: {
        isCorrect,
        studentAnswer: rawAnswer,
        acceptedAnswers: accepted,
        displayAcceptedAnswers: displayAcceptedAnswers(item),
        bestFeedback,
        hadIncorrectAttempt,
        firstAttempt: results[item.id]?.firstAttempt ?? rawAnswer,
        firstAttemptCorrect: results[item.id]?.firstAttemptCorrect ?? isCorrect,
        attempts: [...(results[item.id]?.attempts || []), attemptEntry],
      },
    };

    setResults((prev) => ({
      ...prev,
      [item.id]: nextResults[item.id],
    }));

    try {
      await syncHubProgressForItem(item, isCorrect, hadIncorrectAttempt);
      await persistAttempt(nextResults);
    } catch (error) {
      console.error("[UseOfEnglishCustomQuizRunner] item save failed", error);
    }
  }

  function handleAnswerKeyDown(event, item) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    checkItem(item);
  }

  function revealItemAnswer(itemId) {
    setRevealedAnswers((prev) => ({ ...prev, [itemId]: true }));
  }

  if (!user) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Please sign in to access this quiz.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Loading quiz…</p>
      </div>
    );
  }

  if (!setMeta) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Sorry, this quiz is not available.</p>
        <button className="btn" type="button" onClick={() => navigate("/")}>
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="hub-page">
      <section className="hub-keyword-shell uoe-custom-shell">
        <div className="uoe-custom-topbar">
          <div>
            <h1 className="hub-title" style={{ marginBottom: ".25rem" }}>
              {setMeta.title}
            </h1>
            <p className="hub-subtitle" style={{ marginBottom: 0 }}>
              Custom Use of English quiz • {items.length} item{items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {syncMessage ? (
          <p className="hub-subtitle" style={{ marginTop: "-.35rem", marginBottom: "0.1rem" }}>
            {syncMessage}
          </p>
        ) : null}

        {!!items.length && (
          <section className="hub-keyword-summary">
            <div>
              <span className="hub-keyword-summary-label">Checked</span>
              <strong>{checkedCount}/{items.length}</strong>
            </div>
            <div>
              <span className="hub-keyword-summary-label">Score</span>
              <strong>{scoreCount}/{items.length}</strong>
            </div>
            <div>
              <span className="hub-keyword-summary-label">Tracking</span>
              <strong>{attemptId ? "Live" : "Starts on first check"}</strong>
            </div>
          </section>
        )}

        {items.map((item) => {
          const result = results[item.id];
          const levelTag = String(item.level || "").toLowerCase();
          const isRevealed = !!revealedAnswers[item.id];
          const answerValue = answers[item.id] || "";
          const firstTryCorrect = !!result?.firstAttemptCorrect;
          const currentCorrect = !!result?.isCorrect;
          const feedbackClass = result
            ? currentCorrect
              ? firstTryCorrect
                ? "is-correct"
                : "is-recovered"
              : "is-wrong"
            : "";

          return (
            <article key={item.id} className="hub-keyword-card hub-keyword-challenge">
              <div className="card-header hub-keyword-card-header">
                <div className="hub-keyword-card-meta">
                  {levelTag ? (
                    <span
                      className="cefr-badge"
                      style={{ "--badge-color": LEVEL_COLORS[levelTag] || "#8aa0ff" }}
                    >
                      {levelTag.toUpperCase()}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="hub-keyword-prompt">{renderPrompt(item)}</div>

              <div className="hub-keyword-answer-row">
                <input
                  type="text"
                  value={answerValue}
                  onChange={(event) => updateAnswer(item.id, event.target.value)}
                  onKeyDown={(event) => handleAnswerKeyDown(event, item)}
                  placeholder={getPromptLabel(item)}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  autoComplete="off"
                />
                <button
                  className="generate-btn hub-check-btn"
                  onClick={() => {
                    checkItem(item);
                  }}
                >
                  Check
                </button>
              </div>

              {result ? (
                <div className={`hub-keyword-feedback ${feedbackClass}`}>
                  <strong>
                    {currentCorrect
                      ? firstTryCorrect
                        ? "Correct"
                        : "Correct now"
                      : "Try again"}
                  </strong>
                  {!currentCorrect && item.source === "keyword" && !!result.bestFeedback?.tokens?.length ? (
                    <div className="hub-keyword-token-feedback">
                      {result.bestFeedback.tokens.map((entry, tokenIndex) => (
                        <span
                          key={`${entry.className}-${entry.token}-${tokenIndex}`}
                          className={`hub-keyword-token ${entry.className}`}
                        >
                          {entry.token}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {!currentCorrect && item.source !== "keyword" && !!result.bestFeedback?.letters?.length ? (
                    <div className="uoe-letter-feedback">
                      {result.bestFeedback.letters.map((entry, tokenIndex) => (
                        <span
                          key={`${entry.className}-${entry.token}-${tokenIndex}`}
                          className={`uoe-letter-token ${entry.className}`}
                        >
                          {entry.token}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {!currentCorrect && !isRevealed ? (
                    <button
                      type="button"
                      className="review-btn hub-reveal-btn"
                      onClick={() => revealItemAnswer(item.id)}
                    >
                      Show possible answers
                    </button>
                  ) : null}
                  {!currentCorrect && isRevealed ? (
                    <p>Possible answers: {result.displayAcceptedAnswers}</p>
                  ) : null}
                  {currentCorrect && !firstTryCorrect ? (
                    <p>Accepted now, but this item still counts as incorrect for score and mistake review.</p>
                  ) : null}
                  {currentCorrect && firstTryCorrect ? (
                    <p>Counts as correct for score.</p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <style>{`
        .hub-page {
          width: 100%;
        }
        .hub-keyword-shell {
          max-width: 940px;
          margin: 0 auto;
        }
        .uoe-custom-shell {
          display: grid;
          gap: 1rem;
        }
        .uoe-custom-topbar {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .hub-keyword-card,
        .hub-keyword-summary > div {
          background: linear-gradient(180deg, rgba(24,41,79,0.98), rgba(20,36,71,0.98));
          border: 1px solid rgba(53, 80, 142, 0.8);
          border-radius: 1rem;
          box-shadow: 0 10px 22px rgba(0,0,0,0.12);
        }
        .hub-keyword-card {
          padding: 1.2rem 1.25rem;
          margin-bottom: 1rem;
          position: relative;
        }
        .hub-keyword-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
          margin-bottom: 1rem;
        }
        .hub-keyword-summary > div {
          padding: 0.9rem 1rem;
        }
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
        .cefr-badge {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          border-radius: 999px;
          padding: .34rem .72rem;
          background: rgba(10,15,33,.58);
          border: 1px solid rgba(132,158,222,.24);
          color: #edf3ff;
          font-size: .78rem;
          font-weight: 700;
          letter-spacing: .02em;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.02);
        }
        .cefr-badge::before {
          content: "";
          width: .5rem;
          height: .5rem;
          border-radius: 999px;
          background: var(--badge-color, #8aa0ff);
          box-shadow: 0 0 0 3px rgba(255,255,255,.04);
        }
        .hub-keyword-prompt {
          display: grid;
          gap: 0.55rem;
          margin-bottom: 0.85rem;
        }
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
        .hub-keyword-answer-row input {
          width: 100%;
          background: #020617;
          color: #f8fafc;
          border: 1px solid #3b4f7e;
          border-radius: 0.75rem;
          padding: 0.75rem 0.85rem;
          font-size: 1rem;
        }
        .hub-keyword-answer-row button,
        .review-btn {
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
          display: grid;
          gap: .45rem;
        }
        .hub-keyword-feedback strong {
          display: block;
          margin-bottom: 0.1rem;
        }
        .hub-keyword-feedback p {
          margin: 0;
          line-height: 1.5;
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
        .hub-keyword-feedback.is-recovered {
          background: rgba(250, 204, 21, 0.12);
          border-color: rgba(250, 204, 21, 0.22);
          color: #fef3c7;
        }
        .hub-keyword-token-feedback,
        .uoe-letter-feedback {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.25rem;
        }
        .hub-keyword-token,
        .uoe-letter-token {
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
        .hub-keyword-token.correct,
        .uoe-letter-token.correct {
          background: rgba(52, 211, 153, 0.18);
          border-color: rgba(52, 211, 153, 0.32);
          color: #d1fae5;
        }
        .hub-keyword-token.wrong,
        .uoe-letter-token.wrong {
          background: rgba(248, 113, 113, 0.18);
          border-color: rgba(248, 113, 113, 0.32);
          color: #ffe4e6;
        }
        .hub-keyword-token.missing,
        .uoe-letter-token.missing {
          background: rgba(250, 204, 21, 0.16);
          border-color: rgba(250, 204, 21, 0.3);
          color: #fef3c7;
        }
        .hub-keyword-token.extra,
        .uoe-letter-token.extra {
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
        .hub-reveal-btn {
          margin-top: 0.15rem;
          align-self: flex-start;
        }
        @media (max-width: 760px) {
          .hub-keyword-summary {
            grid-template-columns: 1fr;
          }
          .hub-keyword-answer-row {
            flex-direction: column;
            align-items: stretch;
          }
          .hub-keyword-answer-row button {
            width: 100%;
          }
          .hub-keyword-source,
          .hub-keyword-gapfill {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
