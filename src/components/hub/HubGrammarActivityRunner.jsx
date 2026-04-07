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

function buildCommaSentence(words = [], positions = []) {
  if (!Array.isArray(words) || !words.length) return "";

  const activePositions = new Set(Array.isArray(positions) ? positions : []);
  return words
    .map((word, index) => {
      if (index === words.length - 1) return word;
      return activePositions.has(index) ? `${word},` : word;
    })
    .join(" ");
}

function sameCommaPositions(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function buildInitialAnswers(activity) {
  const state = {};
  activity.items.forEach((item) => {
    if (item.type === "multiple-choice" || item.type === "error-correction") {
      state[item.id] = "";
      if (item.type === "error-correction") {
        state[`${item.id}:correction`] = "";
      }
      return;
    }

    if (item.type === "comma-placement") {
      state[item.id] = [];
      return;
    }

    item.gaps.forEach((gap) => {
      state[`${item.id}:${gap.id}`] = "";
    });
  });
  return state;
}

function highlightSentence(sentence, highlighted) {
  const full = String(sentence || "");
  const target = String(highlighted || "");
  if (!target) return full;

  const normalizedFull = full
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u0060\u00B4]/g, "'");
  const normalizedTarget = target
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u0060\u00B4]/g, "'");

  const index = normalizedFull.indexOf(normalizedTarget);
  if (index === -1) return full;

  return (
    <>
      {full.slice(0, index)}
      <mark className="hub-grammar-highlight">{full.slice(index, index + target.length)}</mark>
      {full.slice(index + target.length)}
    </>
  );
}

function renderSentence(
  item,
  answers,
  handleChange,
  handleAdvance,
  disabled,
  registerInput,
  handleChoiceSelect
) {
  const gapMap = new Map((item.gaps || []).map((gap) => [gap.id, gap]));

  const parts = item.parts || [];
  const itemId = item.id;

  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <React.Fragment key={`${itemId}-text-${index}`}>{part}</React.Fragment>;
    }

    const key = `${itemId}:${part.gapId}`;
    const gap = gapMap.get(part.gapId);

    if (Array.isArray(gap?.choices) && gap.choices.length) {
      return (
        <select
          key={key}
          className="hub-grammar-gap hub-grammar-inline-select"
          value={answers[key] || ""}
          onChange={(event) => handleChoiceSelect(item, gap, event.target.value)}
          disabled={disabled}
          ref={registerInput(`${key}:option:0`)}
        >
          <option value="">Choose...</option>
          {gap.choices.map((choice) => (
            <option key={`${key}:${choice}`} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      );
    }

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
  const inputRefs = useRef({});
  const itemRefs = useRef({});
  const [answers, setAnswers] = useState(() => (activity ? buildInitialAnswers(activity) : {}));
  const [confirmedCorrections, setConfirmedCorrections] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const orderedInputKeys = useMemo(() => {
    if (!activity) return [];

    return activity.items.flatMap((item) => {
      if (item.type === "error-correction") {
        return [`${item.id}:correction`];
      }

      if (item.type === "comma-placement") {
        return [];
      }

      if (item.type === "multiple-choice") {
        return [];
      }

      return item.gaps.map((gap) => `${item.id}:${gap.id}`);
    });
  }, [activity]);

  const firstControlKeysByItem = useMemo(() => {
    if (!activity) return {};

    return Object.fromEntries(
      activity.items.map((item) => {
        if (item.type === "multiple-choice") {
          return [item.id, `${item.id}:option:0`];
        }

        if (item.type === "error-correction") {
          return [item.id, `${item.id}:judge:correct`];
        }

        if (item.type === "comma-placement") {
          return [item.id, `${item.id}:comma:none`];
        }

        const firstGap = item.gaps[0];
        if (Array.isArray(firstGap?.choices) && firstGap.choices.length) {
          return [item.id, `${item.id}:${firstGap.id}:option:0`];
        }

        return [item.id, `${item.id}:${firstGap?.id}`];
      })
    );
  }, [activity]);

  const totalGaps = useMemo(
    () =>
      activity
        ? activity.items.reduce((sum, item) => {
            if (
              item.type === "multiple-choice" ||
              item.type === "error-correction" ||
              item.type === "comma-placement"
            ) {
              return sum + 1;
            }
            return sum + item.gaps.length;
          }, 0)
        : 0,
    [activity]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    inputRefs.current = {};
    itemRefs.current = {};
    setAnswers(activity ? buildInitialAnswers(activity) : {});
    setConfirmedCorrections({});
    setSubmitted(false);
    setSaving(false);
    setResult(null);
  }, [activityId, activity]);

  useEffect(() => {
    if (!submitted) {
      const firstKey = orderedInputKeys[0];
      if (firstKey) {
        inputRefs.current[firstKey]?.focus();
      }
    }
  }, [activityId, orderedInputKeys, submitted]);

  useEffect(() => {
    if (!submitted || !result || !activity?.items?.length) return;

    const firstItemId = activity.items[0]?.id;
    const node = firstItemId ? itemRefs.current[firstItemId] : null;
    if (!node) return;

    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [submitted, result, activity]);

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
    if (!node) {
      delete inputRefs.current[key];
      return;
    }

    node.dataset.answerKey = key;
    inputRefs.current[key] = node;
  };

  const registerItem = (itemId) => (node) => {
    if (!node) {
      delete itemRefs.current[itemId];
      return;
    }

    itemRefs.current[itemId] = node;
  };

  const focusControl = (key) => {
    const node = inputRefs.current[key];
    if (!node) return false;
    node.focus();
    node.select?.();
    return true;
  };

  const focusNextQuestion = (itemId) => {
    if (!activity) return;

    const currentIndex = activity.items.findIndex((item) => item.id === itemId);
    const nextItem = currentIndex >= 0 ? activity.items[currentIndex + 1] : null;
    if (!nextItem) return;

    const nextKey = firstControlKeysByItem[nextItem.id];
    if (nextKey) {
      focusControl(nextKey);
    }
  };

  const focusNextInput = (key) => {
    const currentIndex = orderedInputKeys.indexOf(key);
    const nextKey = currentIndex >= 0 ? orderedInputKeys[currentIndex + 1] : null;

    if (nextKey && inputRefs.current[nextKey]) {
      focusControl(nextKey);
    }
  };

  const handleJudgeSelection = (itemId, value) => {
    handleChange(itemId, value);

    if (value === "wrong") {
      setConfirmedCorrections((prev) => ({ ...prev, [itemId]: false }));
      requestAnimationFrame(() => {
        focusControl(`${itemId}:correction`);
      });
      return;
    }

    setConfirmedCorrections((prev) => ({ ...prev, [itemId]: false }));
  };

  const confirmCorrection = (itemId) => {
    const correctionKey = `${itemId}:correction`;
    const value = String(answers[correctionKey] || "").trim();
    if (!value) {
      focusControl(correctionKey);
      return;
    }

    setConfirmedCorrections((prev) => ({ ...prev, [itemId]: true }));
    requestAnimationFrame(() => {
      focusNextQuestion(itemId);
    });
  };

  const handleGapChoiceSelect = (item, gap, choice) => {
    const key = `${item.id}:${gap.id}`;
    handleChange(key, choice);

    const gapIndex = item.gaps.findIndex((entry) => entry.id === gap.id);
    const nextGap = gapIndex >= 0 ? item.gaps[gapIndex + 1] : null;

    requestAnimationFrame(() => {
      if (nextGap) {
        if (Array.isArray(nextGap.choices) && nextGap.choices.length) {
          focusControl(`${item.id}:${nextGap.id}:option:0`);
        } else {
          focusControl(`${item.id}:${nextGap.id}`);
        }
        return;
      }

      focusNextQuestion(item.id);
    });
  };

  const handleCommaToggle = (item, position) => {
    const current = Array.isArray(answers[item.id]) ? answers[item.id] : [];
    const next = current.includes(position)
      ? current.filter((entry) => entry !== position)
      : [...current, position].sort((a, b) => a - b);

    handleChange(item.id, next);
  };

  const clearCommas = (itemId) => {
    handleChange(itemId, []);
  };

  const handleReset = () => {
    setAnswers(buildInitialAnswers(activity));
    setConfirmedCorrections({});
    setSubmitted(false);
    setResult(null);
  };

  const handleSubmit = async () => {
    const evaluatedItems = activity.items.map((item) => {
      if (item.type === "multiple-choice") {
        const rawAnswer = answers[item.id];
        const selectedIndex =
          rawAnswer === "" || rawAnswer == null ? null : Number(rawAnswer);
        const isCorrect = selectedIndex === item.answerIndex;

        return {
          id: item.id,
          type: "multiple-choice",
          prompt: item.prompt,
          question: item.question,
          options: item.options,
          answer: selectedIndex,
          selectedOption:
            selectedIndex != null && selectedIndex >= 0 ? item.options[selectedIndex] : "",
          correctOption: item.options[item.answerIndex],
          isCorrect,
          explanation: item.explanation,
        };
      }

      if (item.type === "error-correction") {
        const rawAnswer = answers[item.id];
        const selectedValue = String(rawAnswer || "");
        const correctionText = answers[`${item.id}:correction`] || "";
        const normalizedCorrection = normalizeAnswer(correctionText);
        const acceptedCorrections = Array.isArray(item.correction)
          ? item.correction
          : String(item.correction || "")
              .split("/")
              .map((entry) => entry.trim())
              .filter(Boolean);
        const normalizedExpectedCorrections = acceptedCorrections.map((entry) =>
          normalizeAnswer(entry)
        );
        const selectedIsCorrect = selectedValue === "correct";
        const selectedIsWrong = selectedValue === "wrong";
        const hasAnswer = selectedIsCorrect || selectedIsWrong;
        const correctionMatches =
          !item.isCorrect && normalizedExpectedCorrections.length
            ? normalizedExpectedCorrections.includes(normalizedCorrection)
            : true;
        const isCorrect = hasAnswer
          ? item.isCorrect
            ? selectedIsCorrect
            : selectedIsWrong && correctionMatches
          : false;

        return {
          id: item.id,
          type: "error-correction",
          prompt: item.prompt,
          sentence: item.sentence,
          highlighted: item.highlighted,
          answer: selectedValue,
          correctionAnswer: correctionText,
          selectedLabel:
            selectedValue === "correct"
              ? "Correct"
              : selectedValue === "wrong"
                ? "Wrong"
                : "",
          expectedLabel: item.isCorrect ? "Correct" : "Wrong",
          isCorrect,
          correction: acceptedCorrections,
          explanation: item.explanation,
        };
      }

      if (item.type === "comma-placement") {
        const selectedPositions = Array.isArray(answers[item.id]) ? answers[item.id] : [];
        const expectedPositions = Array.isArray(item.commaPositions) ? item.commaPositions : [];
        const words = Array.isArray(item.words)
          ? item.words
          : String(item.sentence || "")
              .trim()
              .split(/\s+/)
              .filter(Boolean);
        const isCorrect = sameCommaPositions(selectedPositions, expectedPositions);

        return {
          id: item.id,
          type: "comma-placement",
          prompt: item.prompt,
          sentence: item.sentence,
          words,
          selectedCommaPositions: selectedPositions,
          expectedCommaPositions: expectedPositions,
          selectedSentence: buildCommaSentence(words, selectedPositions),
          corrected: item.corrected,
          needsCommas: item.needsCommas,
          isCorrect,
          explanation: item.explanation,
        };
      }

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
        type: "gap-fill",
        prompt: item.prompt,
        parts: item.parts,
        gaps: evaluatedGaps,
      };
    });

    const correct = evaluatedItems.reduce(
      (sum, item) => {
        if (
          item.type === "multiple-choice" ||
          item.type === "error-correction" ||
          item.type === "comma-placement"
        ) {
          return sum + (item.isCorrect ? 1 : 0);
        }
        return sum + item.gaps.filter((gap) => gap.isCorrect).length;
      },
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
              <article
                key={item.id}
                className="hub-grammar-card"
                ref={registerItem(item.id)}
              >
                <div className="hub-grammar-card-head">
                  <span className="hub-grammar-number">{index + 1}</span>
                  <p>{item.prompt}</p>
                </div>

                {item.type === "multiple-choice" ? (
                  <>
                    <div className="hub-grammar-sentence hub-grammar-question-text">
                      {item.question}
                    </div>
                    <div className="hub-grammar-options">
                      {item.options.map((option, optionIndex) => {
                        const selected = answers[item.id] === String(optionIndex);
                        const isRightAnswer = submitted && optionIndex === item.answerIndex;
                        const isWrongSelection =
                          submitted && selected && optionIndex !== item.answerIndex;

                        return (
                          <button
                            key={`${item.id}-option-${optionIndex}`}
                            type="button"
                            className={[
                              "hub-grammar-option",
                              selected ? "is-selected" : "",
                              isRightAnswer ? "is-correct" : "",
                              isWrongSelection ? "is-wrong" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => handleChange(item.id, String(optionIndex))}
                            disabled={submitted}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : item.type === "error-correction" ? (
                  <>
                    <div className="hub-grammar-sentence hub-grammar-question-text">
                      {highlightSentence(item.sentence, item.highlighted)}
                    </div>
                    <div className="hub-grammar-options">
                      {[
                        { value: "correct", label: "Correct" },
                        { value: "wrong", label: "Wrong" },
                      ].map((option) => {
                        const selected = answers[item.id] === option.value;
                        const shouldBeSelected =
                          submitted &&
                          ((item.isCorrect && option.value === "correct") ||
                            (!item.isCorrect && option.value === "wrong"));
                        const wrongSelection =
                          submitted && selected && !shouldBeSelected;

                        return (
                          <button
                            key={`${item.id}-${option.value}`}
                            type="button"
                            className={[
                              "hub-grammar-option",
                              selected ? "is-selected" : "",
                              shouldBeSelected ? "is-correct" : "",
                              wrongSelection ? "is-wrong" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => handleJudgeSelection(item.id, option.value)}
                            ref={registerInput(`${item.id}:judge:${option.value}`)}
                            disabled={submitted}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    {answers[item.id] === "wrong" ? (
                      <label className="hub-grammar-correction-block">
                        <span>Write the correction</span>
                        <div className="hub-grammar-correction-row">
                          <input
                            type="text"
                            className="hub-grammar-gap hub-grammar-inline-correction"
                            value={answers[`${item.id}:correction`] || ""}
                            onChange={(event) => {
                              handleChange(`${item.id}:correction`, event.target.value);
                              setConfirmedCorrections((prev) => ({ ...prev, [item.id]: false }));
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                confirmCorrection(item.id);
                              }
                            }}
                            ref={registerInput(`${item.id}:correction`)}
                            disabled={submitted || Boolean(confirmedCorrections[item.id])}
                            placeholder="Type the corrected form..."
                          />
                          <button
                            type="button"
                            className="hub-grammar-inline-btn"
                            onClick={() => confirmCorrection(item.id)}
                            disabled={submitted}
                          >
                            OK
                          </button>
                        </div>
                      </label>
                    ) : null}
                  </>
                ) : item.type === "comma-placement" ? (
                  <div className="hub-grammar-comma-builder">
                    <div className="hub-grammar-comma-sentence">
                      {(item.words || []).map((word, wordIndex) => {
                        const selectedPositions = Array.isArray(answers[item.id]) ? answers[item.id] : [];
                        const isLast = wordIndex === item.words.length - 1;
                        const isActive = selectedPositions.includes(wordIndex);

                        return (
                          <React.Fragment key={`${item.id}:word:${wordIndex}`}>
                            <span className="hub-grammar-comma-word">{word}</span>
                            {!isLast ? (
                              <button
                                type="button"
                                className={[
                                  "hub-grammar-comma-toggle",
                                  isActive ? "is-active" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                onClick={() => handleCommaToggle(item, wordIndex)}
                                disabled={submitted}
                                ref={wordIndex === 0 ? registerInput(`${item.id}:comma:none`) : undefined}
                              >
                                ,
                              </button>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className={[
                        "hub-grammar-inline-btn",
                        "hub-grammar-no-commas-btn",
                        Array.isArray(answers[item.id]) && answers[item.id].length === 0
                          ? "is-selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => clearCommas(item.id)}
                      disabled={submitted}
                    >
                      No commas needed
                    </button>
                  </div>
	                ) : (
	                  <>
	                    {item.originalSentence ? (
	                      <p className="hub-grammar-original-sentence">
	                        <strong>{item.originalSentence}</strong>
	                      </p>
	                    ) : null}
	                    <label className="hub-grammar-sentence">
	                      {renderSentence(
	                        item,
	                        answers,
	                        handleChange,
	                        focusNextInput,
	                        submitted,
	                        registerInput,
	                        handleGapChoiceSelect
	                      )}
	                    </label>
	                  </>
	                )}

                {submitted && evaluatedItem && (
                  <div className="hub-grammar-feedback-list">
                    {evaluatedItem.type === "multiple-choice" ? (
                      <div
                        className={`hub-grammar-feedback ${evaluatedItem.isCorrect ? "is-correct" : "is-wrong"}`}
                      >
                        <strong>{evaluatedItem.isCorrect ? "Correct" : "Try again"}</strong>
                        {!evaluatedItem.isCorrect ? (
                          <p>Correct answer: {evaluatedItem.correctOption}</p>
                        ) : null}
                        <p>{evaluatedItem.explanation}</p>
                      </div>
                    ) : evaluatedItem.type === "error-correction" ? (
                      <div
                        className={`hub-grammar-feedback ${evaluatedItem.isCorrect ? "is-correct" : "is-wrong"}`}
                      >
                        <strong>{evaluatedItem.isCorrect ? "Correct" : "Try again"}</strong>
                        {!evaluatedItem.isCorrect ? (
                          <p>
                            Correct answer: {evaluatedItem.expectedLabel}
                            {evaluatedItem.correction?.length
                              ? ` — ${evaluatedItem.correction.join(" / ")}`
                              : ""}
                          </p>
                        ) : null}
                        {!evaluatedItem.isCorrect && evaluatedItem.answer === "wrong" ? (
                          <p>Your correction: {evaluatedItem.correctionAnswer || "(blank)"}</p>
                        ) : null}
                        <p>{evaluatedItem.explanation}</p>
                      </div>
                    ) : evaluatedItem.type === "comma-placement" ? (
                      <div
                        className={`hub-grammar-feedback ${evaluatedItem.isCorrect ? "is-correct" : "is-wrong"}`}
                      >
                        <strong>{evaluatedItem.isCorrect ? "Correct" : "Try again"}</strong>
                        <p>Your version: {evaluatedItem.selectedSentence || evaluatedItem.sentence}</p>
                        {!evaluatedItem.isCorrect ? (
                          <p>Correct version: {evaluatedItem.corrected || "—"}</p>
                        ) : null}
                        <p>{evaluatedItem.explanation}</p>
                      </div>
                    ) : (
                      evaluatedItem.gaps.map((gap) => (
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
                      ))
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="hub-grammar-actions">
          <button
            className="generate-btn"
            onClick={handleSubmit}
            disabled={submitted || saving}
          >
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

        .hub-grammar-original-sentence {
          margin: 0 0 0.75rem;
          color: #eef4ff;
          line-height: 1.55;
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

        .hub-grammar-question-text {
          font-size: 1.02rem;
          line-height: 1.65;
        }

        .hub-grammar-inline-choice-set {
          display: inline-flex;
          vertical-align: middle;
          margin: 0 0.25rem;
        }

        .hub-grammar-inline-select {
          width: auto;
          min-width: 5.8rem;
          margin: 0 0.25rem;
          padding-right: 2rem;
        }

        .hub-grammar-correction-block {
          display: grid;
          gap: 0.4rem;
          margin-top: 0.85rem;
          color: #dbe7ff;
          font-weight: 600;
        }

        .hub-grammar-correction-row {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .hub-grammar-inline-correction {
          margin: 0;
          width: min(100%, 24rem);
        }

        .hub-grammar-inline-btn {
          min-height: 44px;
          padding: 0.65rem 0.95rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(74, 107, 192, 0.55);
          background: rgba(2, 6, 23, 0.42);
          color: #eef4ff;
          font-weight: 700;
          cursor: pointer;
        }

        .hub-grammar-inline-btn:hover:not(:disabled) {
          border-color: rgba(115, 146, 223, 0.72);
        }

        .hub-grammar-comma-builder {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .hub-grammar-comma-sentence {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.35rem;
          padding: 1rem 1.05rem;
          border-radius: 0.85rem;
          background: rgba(2, 6, 23, 0.38);
          border: 1px solid rgba(51, 65, 85, 0.8);
          color: #e5efff;
          line-height: 1.85;
        }

        .hub-grammar-comma-word {
          font-size: 1.02rem;
          color: #eef4ff;
        }

        .hub-grammar-comma-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.45rem;
          height: 1.45rem;
          border-radius: 999px;
          border: 1px dashed rgba(121, 152, 230, 0.55);
          background: rgba(10, 16, 34, 0.95);
          color: rgba(160, 187, 255, 0.55);
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease,
            color 0.12s ease, box-shadow 0.12s ease;
        }

        .hub-grammar-comma-toggle:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: rgba(115, 146, 223, 0.72);
          color: #dbeafe;
        }

        .hub-grammar-comma-toggle.is-active {
          border-style: solid;
          border-color: rgba(94, 234, 212, 0.65);
          background: rgba(20, 184, 166, 0.18);
          color: #d7fff6;
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.12);
        }

        .hub-grammar-no-commas-btn {
          align-self: flex-start;
        }

        .hub-grammar-no-commas-btn.is-selected {
          border-color: rgba(94, 234, 212, 0.65);
          background: rgba(20, 184, 166, 0.16);
          color: #d7fff6;
        }

        .hub-grammar-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-top: 0.9rem;
        }

        .hub-grammar-option {
          padding: 0.7rem 0.95rem;
          border-radius: 0.8rem;
          border: 1px solid rgba(74, 107, 192, 0.55);
          background: rgba(2,6,23,0.42);
          color: #eef4ff;
          font-size: 0.98rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
        }

        .hub-grammar-option:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: rgba(115, 146, 223, 0.72);
        }

        .hub-grammar-option.is-selected {
          background: rgba(74,107,192,0.22);
          border-color: rgba(115, 146, 223, 0.8);
        }

        .hub-grammar-option.is-correct {
          background: rgba(52, 211, 153, 0.16);
          border-color: rgba(52, 211, 153, 0.34);
          color: #d1fae5;
        }

        .hub-grammar-option.is-wrong {
          background: rgba(248, 113, 113, 0.14);
          border-color: rgba(248, 113, 113, 0.32);
          color: #fee2e2;
        }

        .hub-grammar-highlight {
          display: inline-block;
          margin: 0 0.18rem;
          padding: 0.02rem 0.45rem;
          border-radius: 0.55rem;
          background: rgba(246, 189, 96, 0.18);
          border: 1px solid rgba(246, 189, 96, 0.32);
          color: #fff0bf;
          font-weight: 700;
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

          .hub-grammar-inline-choice-set {
            display: flex;
            margin: 0.35rem 0;
          }

          .hub-grammar-inline-select {
            width: 100%;
            margin: 0.35rem 0;
            display: block;
          }

          .hub-grammar-options {
            flex-direction: column;
          }

          .hub-grammar-correction-row {
            align-items: stretch;
          }

          .hub-grammar-inline-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
