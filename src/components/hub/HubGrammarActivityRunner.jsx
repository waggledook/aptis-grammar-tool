import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { getHubGrammarActivity } from "../../data/hubGrammarActivities.js";
import { saveHubGrammarSubmission } from "../../firebase";
import { toast } from "../../utils/toast";

function normalizeAnswer(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/^'m\b/g, "am")
    .replace(/^'re\b/g, "are")
    .replace(/^'ve\b/g, "have")
    .replace(/^'ll\b/g, "will")
    .replace(/^'s\b(?=\s+(used to|getting used to)\b)/g, "is")
    .replace(/\b(can)'t\b/g, "$1 not")
    .replace(/\b(won)'t\b/g, "$1 not")
    .replace(/\b([a-z]+)n't\b/g, "$1 not")
    .replace(/\b(i)'m\b/g, "$1 am")
    .replace(/\b([a-z]+)'re\b/g, "$1 are")
    .replace(/\b([a-z]+)'ve\b/g, "$1 have")
    .replace(/\b([a-z]+)'ll\b/g, "$1 will")
    .replace(/\b(i|you|we|they|he|she|it|that|there|here)'s used to\b/g, "$1 is used to")
    .replace(/\b(i|you|we|they|he|she|it|that|there|here)'s getting used to\b/g, "$1 is getting used to")
    .replace(/\b(what|who|where|when|why|how)'s\b/g, "$1 is")
    .replace(/\s+/g, " ")
    .replace(/\s+([?!.,])/g, "$1")
    .replace(/[?!.,]+$/g, "");
}

function buildInitialAnswers(activity) {
  const state = {};
  activity.items.forEach((item) => {
    item.gaps.forEach((gap) => {
      state[`${item.id}:${gap.id}`] = "";
    });
  });
  return state;
}

function renderSentence(
  parts,
  itemId,
  answers,
  handleChange,
  handleAdvance,
  disabled,
  registerInput
) {
  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <React.Fragment key={`${itemId}-text-${index}`}>{part}</React.Fragment>;
    }

    const key = `${itemId}:${part.gapId}`;
    return (
      <input
        key={key}
        type="text"
        className="hub-grammar-gap"
        value={answers[key] || ""}
        onChange={(event) => handleChange(key, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleAdvance(key);
          }
        }}
        ref={registerInput(key)}
        disabled={disabled}
      />
    );
  });
}

export default function HubGrammarActivityRunner() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const activity = getHubGrammarActivity(activityId);
  const inputRefs = useRef([]);
  const [answers, setAnswers] = useState(() => (activity ? buildInitialAnswers(activity) : {}));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const totalGaps = useMemo(
    () => (activity ? activity.items.reduce((sum, item) => sum + item.gaps.length, 0) : 0),
    [activity]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    inputRefs.current = [];
    setAnswers(activity ? buildInitialAnswers(activity) : {});
    setSubmitted(false);
    setSaving(false);
    setResult(null);
  }, [activityId, activity]);

  useEffect(() => {
    if (!submitted) {
      inputRefs.current[0]?.focus();
    }
  }, [activityId, submitted]);

  if (!activity) {
    return (
      <div className="game-wrapper">
        <p className="muted">That grammar activity could not be found.</p>
        <button className="review-btn" onClick={() => navigate(getSitePath("/grammar"))}>
          Back to grammar menu
        </button>
      </div>
    );
  }

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const registerInput = (key) => (node) => {
    if (!node) return;

    const existingIndex = inputRefs.current.findIndex(
      (input) => input?.dataset.answerKey === key
    );

    node.dataset.answerKey = key;

    if (existingIndex >= 0) {
      inputRefs.current[existingIndex] = node;
    } else {
      inputRefs.current.push(node);
    }
  };

  const focusNextInput = (key) => {
    const currentIndex = inputRefs.current.findIndex(
      (input) => input?.dataset.answerKey === key
    );

    if (currentIndex >= 0) {
      const nextInput = inputRefs.current[currentIndex + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select?.();
        return;
      }
    }

    if (!submitted) {
      handleSubmit();
    }
  };

  const handleReset = () => {
    setAnswers(buildInitialAnswers(activity));
    setSubmitted(false);
    setResult(null);
  };

  const handleSubmit = async () => {
    const evaluatedItems = activity.items.map((item) => {
      const evaluatedGaps = item.gaps.map((gap) => {
        const answerKey = `${item.id}:${gap.id}`;
        const rawAnswer = answers[answerKey] || "";
        const normalized = normalizeAnswer(rawAnswer);
        const matched = gap.acceptedAnswers.some(
          (accepted) => normalizeAnswer(accepted) === normalized
        );

        return {
          gapId: gap.id,
          answer: rawAnswer,
          acceptedAnswers: gap.acceptedAnswers,
          isCorrect: matched,
          feedback: gap.feedback,
        };
      });

      return {
        id: item.id,
        prompt: item.prompt,
        gaps: evaluatedGaps,
      };
    });

    const correct = evaluatedItems.reduce(
      (sum, item) => sum + item.gaps.filter((gap) => gap.isCorrect).length,
      0
    );
    const score = totalGaps ? Math.round((correct / totalGaps) * 100) : 0;
    const payload = {
      activityId: activity.id,
      activityTitle: activity.title,
      items: evaluatedItems,
      score,
      correct,
      total: totalGaps,
    };

    setSubmitted(true);
    setResult(payload);
    setSaving(true);

    try {
      await saveHubGrammarSubmission(payload);
      toast("Grammar activity submitted and saved.");
    } catch (error) {
      console.error("[HubGrammarActivityRunner] save failed", error);
      toast("Your feedback was shown, but the submission could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hub-grammar-page">
      <Seo
        title={`${activity.title} | Seif Hub`}
        description={activity.shortDescription}
      />

      <div className="hub-grammar-shell">
        <div className="hub-grammar-topbar">
          <button className="review-btn" onClick={() => navigate(getSitePath("/grammar/mini-tests"))}>
            ← Back to mini tests
          </button>
        </div>

        <header className="hub-grammar-header">
          <span className="hub-grammar-kicker">Seif Hub Grammar Activity</span>
          <h1>{activity.title}</h1>
          <p>{activity.intro}</p>
        </header>

        {result && (
          <section className="hub-grammar-summary">
            <div>
              <span className="hub-grammar-summary-label">Score</span>
              <strong>{result.score}%</strong>
            </div>
            <div>
              <span className="hub-grammar-summary-label">Correct</span>
              <strong>
                {result.correct}/{result.total}
              </strong>
            </div>
            <div>
              <span className="hub-grammar-summary-label">Status</span>
              <strong>{saving ? "Saving..." : "Saved to profile"}</strong>
            </div>
          </section>
        )}

        <div className="hub-grammar-list">
          {activity.items.map((item, index) => {
            const evaluatedItem = result?.items.find((entry) => entry.id === item.id);

            return (
              <article key={item.id} className="hub-grammar-card">
                <div className="hub-grammar-card-head">
                  <span className="hub-grammar-number">{index + 1}</span>
                  <p>{item.prompt}</p>
                </div>

                <label className="hub-grammar-sentence">
                  {renderSentence(
                    item.parts,
                    item.id,
                    answers,
                    handleChange,
                    focusNextInput,
                    submitted,
                    registerInput
                  )}
                </label>

                {submitted && evaluatedItem && (
                  <div className="hub-grammar-feedback-list">
                    {evaluatedItem.gaps.map((gap) => (
                      <div
                        key={`${item.id}:${gap.gapId}`}
                        className={`hub-grammar-feedback ${gap.isCorrect ? "is-correct" : "is-wrong"}`}
                      >
                        <strong>{gap.isCorrect ? "Correct" : "Try again"}</strong>
                        {!gap.isCorrect && (
                          <p>
                            Accepted answers: {gap.acceptedAnswers.join(" / ")}
                          </p>
                        )}
                        <p>{gap.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="hub-grammar-actions">
          <button className="generate-btn" onClick={handleSubmit} disabled={submitted || saving}>
            {submitted ? "Submitted" : "Submit answers"}
          </button>
          <button className="ghost-btn" onClick={handleReset}>
            Reset activity
          </button>
        </div>
      </div>

      <style>{`
        .hub-grammar-page {
          width: 100%;
        }

        .hub-grammar-shell {
          max-width: 920px;
          margin: 0 auto;
        }

        .hub-grammar-topbar {
          margin-bottom: 1rem;
        }

        .hub-grammar-header {
          margin-bottom: 1rem;
          padding: 1.2rem 1.25rem;
          border-radius: 1rem;
          background: linear-gradient(180deg, rgba(24,41,79,0.98), rgba(20,36,71,0.98));
          border: 1px solid rgba(53, 80, 142, 0.8);
        }

        .hub-grammar-kicker {
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

        .hub-grammar-header h1 {
          margin-bottom: 0.45rem;
          text-align: left;
        }

        .hub-grammar-header p {
          margin: 0;
          color: #dbe7ff;
          line-height: 1.55;
        }

        .hub-grammar-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .hub-grammar-summary > div {
          padding: 0.9rem 1rem;
          border-radius: 0.9rem;
          background: rgba(2,6,23,0.4);
          border: 1px solid rgba(51,65,85,0.7);
        }

        .hub-grammar-summary-label {
          display: block;
          margin-bottom: 0.25rem;
          color: #94a3b8;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .hub-grammar-summary strong {
          font-size: 1.2rem;
          color: #f8fafc;
        }

        .hub-grammar-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .hub-grammar-card {
          padding: 1.2rem 1.2rem 1rem;
          border-radius: 1rem;
          background: linear-gradient(180deg, rgba(24,41,79,0.98), rgba(20,36,71,0.98));
          border: 1px solid rgba(53, 80, 142, 0.8);
          box-shadow: 0 10px 22px rgba(0,0,0,0.12);
        }

        .hub-grammar-card-head {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          margin-bottom: 0.85rem;
        }

        .hub-grammar-number {
          width: 2rem;
          height: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(253, 191, 45, 0.14);
          border: 1px solid rgba(253, 191, 45, 0.24);
          color: #ffd56e;
          font-weight: 700;
          flex-shrink: 0;
        }

        .hub-grammar-card-head p {
          margin: 0;
          color: #f8fafc;
          font-size: 1.05rem;
          line-height: 1.45;
        }

        .hub-grammar-sentence {
          display: block;
          padding: 0.9rem 1rem;
          border-radius: 0.85rem;
          background: rgba(2,6,23,0.38);
          border: 1px solid rgba(51,65,85,0.8);
          color: #e5efff;
          line-height: 1.7;
        }

        .hub-grammar-gap {
          width: min(100%, 18rem);
          margin: 0 0.25rem;
          padding: 0.55rem 0.7rem;
          border-radius: 0.7rem;
          border: 1px solid #3b4f7e;
          background: #020617;
          color: #f8fafc;
          font-size: 1rem;
        }

        .hub-grammar-feedback-list {
          margin-top: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .hub-grammar-feedback {
          padding: 0.75rem 0.85rem;
          border-radius: 0.8rem;
          border: 1px solid transparent;
        }

        .hub-grammar-feedback strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .hub-grammar-feedback p {
          margin: 0.2rem 0 0;
          line-height: 1.5;
        }

        .hub-grammar-feedback.is-correct {
          background: rgba(52, 211, 153, 0.12);
          border-color: rgba(52, 211, 153, 0.22);
          color: #d1fae5;
        }

        .hub-grammar-feedback.is-wrong {
          background: rgba(248, 113, 113, 0.12);
          border-color: rgba(248, 113, 113, 0.22);
          color: #fee2e2;
        }

        .hub-grammar-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 720px) {
          .hub-grammar-summary {
            grid-template-columns: 1fr;
          }

          .hub-grammar-gap {
            width: 100%;
            margin: 0.35rem 0;
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
