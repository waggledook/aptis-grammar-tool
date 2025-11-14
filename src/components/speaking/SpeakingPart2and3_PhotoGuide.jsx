// src/components/speaking/SpeakingPart2and3_PhotoGuide.jsx
import React, { useState, useRef } from "react";
import Seo from "../common/Seo.jsx";
import UnderConstructionPanel from "../common/UnderConstructionPanel";

/* =========================
 * DATA: office / park / mountain
 * ========================= */

const officeItems = [
  {
    id: "office1",
    sentence: "The man is walking ___ the room.",
    answer: "into",
    words: 1,
    explanation:
      "He is moving from the corridor to inside the room, so we use INTO.",
  },
  {
    id: "office2",
    sentence: "The woman is sitting ___ the desk.",
    answer: "at",
    words: 1,
  },
  {
    id: "office3",
    sentence: "The computer is ___ the desk.",
    answer: "on",
    words: 1,
  },
  {
    id: "office4",
    sentence: "The shelf is ___ the desk.",
    answer: "above",
    words: 1,
  },
  {
    id: "office5",
    sentence: "The plant is ___ ___ the desk.",
    answer: "next to",
    words: 2,
    explanation: "The plant is close to the desk, but not touching it.",
  },
];

const parkItems = [
  {
    id: "park1",
    sentence: "The woman is sitting ___ the bench.",
    answer: "on",
    words: 1,
  },
  {
    id: "park2",
    sentence: "The dog is ___ ___ ___ the bench.",
    answer: "in front of",
    words: 3,
    explanation: "The dog is directly in front of the bench, facing us.",
  },
  {
    id: "park3",
    sentence: "The man is standing ___ the woman.",
    answer: "behind",
    words: 1,
  },
  {
    id: "park4",
    sentence: "The ball is ___ ___ the man.",
    answer: "next to",
    words: 2,
  },
  {
    id: "park5",
    sentence: "The fountain is ___ the right of the picture.",
    answer: "on",
    words: 1,
  },
  {
    id: "park6",
    sentence: "The bike is ___ the bench and the fountain.",
    answer: "between",
    words: 1,
    explanation: "The bike is in the middle of the bench and the fountain.",
  },
];

const mountainItems = [
  {
    id: "mount1",
    sentence: "The woman is running ___ the mountain path. (following the path)",
    answer: "along",
    words: 1,
    explanation:
      "Along = following the line of something, like a road or path.",
  },
  {
    id: "mount2",
    sentence: "The path continues ___ the forest. (from one side to the other)",
    answer: "through",
    words: 1,
    explanation: "Through = moving inside an area with limits (e.g. a forest).",
  },
  {
    id: "mount3",
    sentence: "There is a small wooden cabin ___ the top of the hill.",
    answer: "at",
    words: 1,
    explanation: "At the top = common phrase for the highest point.",
  },
  {
    id: "mount4",
    sentence:
      "There is a hot-air balloon ___ the top-right corner of the picture.",
    answer: "in",
    words: 1,
    explanation: "In the corner = fixed expression for pictures.",
  },
  {
    id: "mount5",
    sentence: "The woman is running ___ the forest. (in the direction of)",
    answers: ["towards", "toward"], 
    words: 1,
    explanation: "Towards = in the direction of something.",
  },
];

/* =========================
 * DATA: speculation photo sets
 * ========================= */

const SPEC_SETS = [
  {
    id: "balcony",
    title: "Balcony breakfast mystery",
    image: "/images/speaking/describing-pictures/balcony-scene.png",
    intro:
      "You don’t really know this person’s situation. Rewrite the strong sentences using speculative language.",
    items: [
      {
        id: "balcony1",
        strong: "He is travelling on business.",
        target: "Use must.",
        keywords: ["must"],
        model: "He must be travelling on business.",
        explanation:
          "Use must + be + -ing for a strong deduction in the present.",
      },
      {
        id: "balcony2",
        strong: "He is sad.",
        target: "Use looks.",
        keywords: ["looks", "look"],
        model: "He looks sad.",
        explanation:
          "Use look / looks + adjective to talk about appearance.",
      },
      {
        id: "balcony3",
        strong: "He feels lonely.",
        target: "Use probably.",
        keywords: ["probably"],
        model: "He probably feels lonely.",
        explanation:
          "Probably shows that you think something is quite likely, but not certain.",
      },
    ],
  },
  {
    id: "bench",
    title: "Park bench meeting",
    image: "/images/speaking/describing-pictures/bench-scene.png",
    intro:
      "Look at the people on the bench. We can guess, but we don’t know for sure.",
    items: [
      {
        id: "bench1",
        strong: "The two people are a couple.",
        target: "Use may.",
        keywords: ["may"],
        model: "They may be a couple.",
        explanation: "May is a modal for possibility, similar to might / could.",
      },
      {
        id: "bench2",
        strong: "She is angry with him.",
        target: "Use seem / seems.",
        keywords: ["seems", "seem"],
        model: "She seems angry with him.",
        explanation:
          "Seem is useful when you talk about impressions or feelings.",
      },
      {
        id: "bench3",
        strong: "They had a fight.",
        target: "Use could.",
        keywords: ["could"],
        model: "They could have had a fight.",
        explanation: "Could have + past participle is good for past possibilities.",
      },
    ],
  },
  {
    id: "runner",
    title: "Unexpected street moment",
    image: "/images/speaking/describing-pictures/runner-scene.png",
    intro:
      "Here you can use different structures to show how sure you are about your ideas.",
    items: [
      {
        id: "runner1",
        strong: "He has got lost.",
        target: "Use must.",
        keywords: ["must"],
        model: "He must have got lost.",
        explanation:
          "Must have + past participle shows a strong deduction about the past.",
      },
      {
        id: "runner2",
        strong: "He is from another city.",
        target: "Use almost certainly.",
        keywords: ["almost certainly"],
        model: "He is almost certainly from another city.",
        explanation:
          "Almost certainly shows you are very sure, but still not 100%.",
      },
      {
        id: "runner3",
        strong: "The other person wants to give him directions.",
        target: "Use I guess.",
        keywords: ["i guess"],
        model: "I guess the other person wants to give him directions.",
        explanation:
          "I guess is a nice informal way to show you are making a guess.",
      },
    ],
  },
];

/* =========================
 * MAIN COMPONENT
 * ========================= */

export default function SpeakingPart2and3_PhotoGuide({
  onBack,
  onStartPractice,
}) {
  // which screen are we on? menu | language | prepositions | speculation
  const [view, setView] = useState("menu");

  // shared state for gap-fills
  const [answers, setAnswers] = useState({});
  const [checkState, setCheckState] = useState({});
  const inputRefs = useRef({});

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const focusNext = (currentId, itemsArray) => {
    const index = itemsArray.findIndex((item) => item.id === currentId);
    if (index === -1) return;
    const nextItem = itemsArray[index + 1];
    if (!nextItem) return;
    const nextEl = inputRefs.current[nextItem.id];
    if (nextEl) {
      nextEl.focus();
      nextEl.select?.();
    }
  };

  const checkOne = (id, correctAnswers, explanation, itemsArray) => {
    const user = (answers[id] || "").trim().toLowerCase();
  
    // Support single string OR array of strings
    const list = Array.isArray(correctAnswers)
      ? correctAnswers.map(a => a.toLowerCase())
      : [String(correctAnswers || "").toLowerCase()];
  
    const ok = list.includes(user);
  
    setCheckState(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        touched: true,
        ok,
      },
    }));
  
    if (ok && itemsArray) {
      focusNext(id, itemsArray);
    }
  };  

  const revealAnswer = (id) => {
    setCheckState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        showAnswer: true,
      },
    }));
  };

  // state for speculation tasks
  const makeInitialSpecAnswers = () => {
    const init = {};
    SPEC_SETS.forEach((set) => {
      set.items.forEach((item) => {
        init[item.id] = "";
      });
    });
    return init;
  };

  const [specAnswers, setSpecAnswers] = useState(makeInitialSpecAnswers);
  const [specState, setSpecState] = useState({});

  const handleSpecChange = (id, value) => {
    setSpecAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const checkSpecItem = (item) => {
    const user = (specAnswers[item.id] || "").toLowerCase();
    const ok = item.keywords.some((kw) => user.includes(kw));

    setSpecState((prev) => ({
      ...prev,
      [item.id]: {
        ...(prev[item.id] || {}),
        checked: true,
        ok,
        // auto-show model when target word is used
        showModel: ok ? true : prev[item.id]?.showModel ?? false,
      },
    }));
  };

  const showSpecModel = (itemId) => {
    setSpecState((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        showModel: true,
      },
    }));
  };

  const openSection = (section) => setView(section);

  /* --------- Render helpers for sub-screens --------- */

  const renderLanguageScreen = () => (
    <main className="guide-body">
      <section className="panel">
        <h2>Useful phrases to talk about photos</h2>
        <p className="panel-text">
          Try to use <strong>simple, clear sentences</strong> when you describe the
          photo. These phrases also work in Part 3 when you compare two pictures.
        </p>

        <div className="phrases-grid">
          <div className="phrase-box">
            <h3>Starting</h3>
            <ul>
              <li>In this picture, I can see…</li>
              <li>This photo shows…</li>
              <li>In the foreground / background, there is…</li>
              <li>On the left / on the right, you can see…</li>
            </ul>
          </div>

          <div className="phrase-box">
            <h3>People &amp; actions</h3>
            <ul>
              <li>The man on the left is… (+ -ing)</li>
              <li>The people seem to be…</li>
              <li>They look (really) + adjective (tired / happy / relaxed)</li>
              <li>They are probably… (+ -ing)</li>
            </ul>
          </div>

          <div className="phrase-box">
            <h3>Place</h3>
            <ul>
              <li>They are in an office / in a park / at home.</li>
              <li>In the background there are some buildings.</li>
              <li>There is a table between them.</li>
              <li>Behind them you can see…</li>
            </ul>
          </div>

          <div className="phrase-box">
            <h3>Opinion / feeling</h3>
            <ul>
              <li>It looks like they are enjoying themselves.</li>
              <li>I guess they might be at work.</li>
              <li>They probably know each other well.</li>
              <li>It seems like a relaxed atmosphere.</li>
            </ul>
          </div>
        </div>

        <p className="tip">
          🔑 <strong>Tip:</strong> Describe from general to specific: first the place,
          then the people, then small details and your opinion.
        </p>
      </section>
    </main>
  );

  const renderPrepositionsScreen = () => (
    <main className="guide-body">
      {/* Office */}
      <section className="panel">
        <h2>Prepositions in an office scene</h2>
        <p className="panel-text">
          Look at the picture and complete the sentences with the correct preposition
          or prepositional phrase.
        </p>

        <img
          src="/images/speaking/describing-pictures/office-scene.png"
          alt="Office scene with man entering and woman at desk"
          className="exercise-image"
          draggable="false"
        />

        <div className="gap-exercise">
          {officeItems.map((item) => {
            const result = checkState[item.id] || {};
            const isChecked = result.touched;
            const isCorrect = result.ok;
            const showAnswer = result.showAnswer;

            return (
              <div key={item.id} className="gap-item">
                <label>
                  {item.sentence}
                  <div className="gap-row">
                    <input
                      ref={(el) => {
                        inputRefs.current[item.id] = el;
                      }}
                      type="text"
                      value={answers[item.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(item.id, e.target.value)
                      }
                      placeholder={`${item.words} word${
                        item.words > 1 ? "s" : ""
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          checkOne(
                            item.id,
                            item.answers || item.answer,
                            item.explanation,
                            officeItems
                          );
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="btn tiny"
                      onClick={() =>
                        checkOne(
                          item.id,
                          item.answers || item.answer,
                          item.explanation,
                          officeItems
                        )
                      }
                    >
                      Check
                    </button>

                    <button
                      type="button"
                      className="btn tiny ghost"
                      onClick={() => revealAnswer(item.id)}
                    >
                      Show answer
                    </button>
                  </div>
                </label>

                {isChecked && (
                  <p className={`feedback ${isCorrect ? "ok" : "wrong"}`}>
                    {isCorrect ? "✓ Correct" : "✗ Not quite"}
                  </p>
                )}

                {isChecked &&
                  !isCorrect &&
                  item.explanation &&
                  !showAnswer && (
                    <p className="feedback note">Hint: {item.explanation}</p>
                  )}

                {showAnswer && (
                  <p className="feedback note">
                    Answer: <strong>{item.answer}</strong>
                    {item.explanation ? ` – ${item.explanation}` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Park */}
      <section className="panel">
        <h2>Prepositions in a park scene</h2>
        <p className="panel-text">
          Now look at this outdoor scene and complete the sentences with the correct
          prepositional phrase.
        </p>

        <img
          src="/images/speaking/describing-pictures/par-scene.png"
          alt="Park scene with bench, woman, dog, fountain, tree, bike and ball"
          className="exercise-image"
          draggable="false"
        />

        <div className="gap-exercise">
          {parkItems.map((item) => {
            const result = checkState[item.id] || {};
            const isChecked = result.touched;
            const isCorrect = result.ok;
            const showAnswer = result.showAnswer;

            return (
              <div key={item.id} className="gap-item">
                <label>
                  {item.sentence}
                  <div className="gap-row">
                    <input
                      ref={(el) => {
                        inputRefs.current[item.id] = el;
                      }}
                      type="text"
                      value={answers[item.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(item.id, e.target.value)
                      }
                      placeholder={`${item.words} word${
                        item.words > 1 ? "s" : ""
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          checkOne(
                            item.id,
                            item.answers || item.answer,
                            item.explanation,
                            parkItems
                          );
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="btn tiny"
                      onClick={() =>
                        checkOne(
                          item.id,
                          item.answers || item.answer,
                          item.explanation,
                          parkItems
                        )
                      }
                    >
                      Check
                    </button>

                    <button
                      type="button"
                      className="btn tiny ghost"
                      onClick={() => revealAnswer(item.id)}
                    >
                      Show answer
                    </button>
                  </div>
                </label>

                {isChecked && (
                  <p className={`feedback ${isCorrect ? "ok" : "wrong"}`}>
                    {isCorrect ? "✓ Correct" : "✗ Not quite"}
                  </p>
                )}

                {isChecked &&
                  !isCorrect &&
                  item.explanation &&
                  !showAnswer && (
                    <p className="feedback note">Hint: {item.explanation}</p>
                  )}

                {showAnswer && (
                  <p className="feedback note">
                    Answer: <strong>{item.answer}</strong>
                    {item.explanation ? ` – ${item.explanation}` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mountain */}
      <section className="panel">
        <h2>Prepositions in a mountain scene</h2>
        <p className="panel-text">
          Look at this mountain landscape and complete the sentences using the correct
          preposition.
        </p>

        <img
          src="/images/speaking/describing-pictures/mountain-scene.png"
          alt="Mountain scene with runner, forest, cabin and hot-air balloon"
          className="exercise-image"
          draggable="false"
        />

        <div className="gap-exercise">
          {mountainItems.map((item) => {
            const result = checkState[item.id] || {};
            const isChecked = result.touched;
            const isCorrect = result.ok;
            const showAnswer = result.showAnswer;

            return (
              <div key={item.id} className="gap-item">
                <label>
                  {item.sentence}
                  <div className="gap-row">
                    <input
                      ref={(el) => {
                        inputRefs.current[item.id] = el;
                      }}
                      type="text"
                      value={answers[item.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(item.id, e.target.value)
                      }
                      placeholder={`${item.words} word${
                        item.words > 1 ? "s" : ""
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          checkOne(
                            item.id,
                            item.answers || item.answer,
                            item.explanation,
                            mountainItems
                          );
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="btn tiny"
                      onClick={() =>
                        checkOne(
                          item.id,
                          item.answers || item.answer,
                          item.explanation,
                          mountainItems
                        )
                      }
                    >
                      Check
                    </button>

                    <button
                      type="button"
                      className="btn tiny ghost"
                      onClick={() => revealAnswer(item.id)}
                    >
                      Show answer
                    </button>
                  </div>
                </label>

                {isChecked && (
                  <p className={`feedback ${isCorrect ? "ok" : "wrong"}`}>
                    {isCorrect ? "✓ Correct" : "✗ Not quite"}
                  </p>
                )}

                {isChecked &&
                  !isCorrect &&
                  item.explanation &&
                  !showAnswer && (
                    <p className="feedback note">Hint: {item.explanation}</p>
                  )}

                {showAnswer && (
                  <p className="feedback note">
                    Answer: <strong>{item.answer}</strong>
                    {item.explanation ? ` – ${item.explanation}` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );

  const renderSpeculationScreen = () => (
    <main className="guide-body">
      <section className="panel">
        <h2>Speculating about unusual photos</h2>
        <p className="panel-text">
          In the exam you don’t <strong>know</strong> the real situation, so avoid very
          strong statements like <em>They are colleagues</em> or <em>He is late</em>.
          Use language that shows you are guessing:
          <em>
            {" "}
            They might be colleagues, He’s probably late, It looks like he’s in a
            hurry…
          </em>
        </p>

        {SPEC_SETS.map((set, index) => (
          <div key={set.id} className="spec-block">
            <h3>
              Photo {index + 1}: {set.title}
            </h3>

            <img
              src={set.image}
              alt={set.title}
              className="speculation-image"
              draggable="false"
            />

            <p className="panel-text small">{set.intro}</p>

            <div className="spec-items">
              {set.items.map((item) => {
                const state = specState[item.id] || {};
                const { checked, ok, showModel } = state;

                return (
                  <div key={item.id} className="spec-item-card">
                    <p className="strong">
                      <strong>Strong sentence:</strong> {item.strong}
                    </p>
                    <p className="target">
  🎯 <strong>Target:</strong>
  <span className="target-pill">{item.target}</span>
</p>

                    <textarea
                      rows={2}
                      value={specAnswers[item.id]}
                      onChange={(e) =>
                        handleSpecChange(item.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          checkSpecItem(item);
                        }
                      }}
                      placeholder="Rewrite the sentence using the target words…"
                    />

                    <div className="spec-actions">
                      <button
                        type="button"
                        className="btn tiny"
                        onClick={() => checkSpecItem(item)}
                      >
                        Check
                      </button>
                      <button
                        type="button"
                        className="btn tiny ghost"
                        onClick={() => showSpecModel(item.id)}
                      >
                        Show suggestion
                      </button>
                    </div>

                    {checked && (
  <p className={`feedback ${ok ? "ok" : "wrong"}`}>
    {ok ? "Good!" : "Try again – use the target word or structure."}
  </p>
)}

{showModel && (
  <p className="suggested-answer">
    Suggested answer: <strong>{item.model}</strong>
  </p>
)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );

  /* =========================
   * RENDER
   * ========================= */

  const inMenu = view === "menu";

  return (
    <div className="game-wrapper speaking-guide">
      <Seo
        title="Speaking Part 2 & 3 Photo Guide | Seif Aptis Trainer"
        description="Learn useful phrases for describing photos, practise prepositions of place, and use speculative language in Aptis Speaking Part 2 & 3."
      />

      {inMenu ? (
        <>
          <header className="header">
            <div>
              <h2 className="title">Speaking – Part 2 &amp; 3 Photo Guide</h2>
              <p className="intro">
                In Parts 2 and 3 you describe one or two pictures and answer extra
                questions. This guide helps you with{" "}
                <strong>useful phrases, prepositions of place, and speculation.</strong>
              </p>
            </div>
            <div className="actions">
              {onBack && (
                <button className="btn" onClick={onBack}>
                  ← Back
                </button>
              )}
              {onStartPractice && (
                <button className="btn primary" onClick={onStartPractice}>
                  Go to Part 2 practice
                </button>
              )}
            </div>
          </header>

        <UnderConstructionPanel
        title="Photo description guide in progress"
        message="This section is still being expanded with more practice tasks, common mistakes, and extra examples for Parts 2 and 3."
        />

          <section className="panel">
            <h3>What you’ll practise in this guide</h3>
            <ul className="bullets">
              <li>Starting a clear description of a photo</li>
              <li>Using <strong>prepositions of place</strong> accurately</li>
              <li>
                Showing different levels of certainty with{" "}
                <strong>speculative language</strong>
              </li>
              <li>Organising your description from general to specific</li>
            </ul>
          </section>

          <section className="panel">
            <h3>Choose a section to explore</h3>
            <div className="grid-menu">
              <button
                className="menu-card"
                onClick={() => openSection("language")}
              >
                <h4>Useful language</h4>
                <p>Phrases to start, describe people and places, and give opinions.</p>
              </button>

              <button
                className="menu-card"
                onClick={() => openSection("prepositions")}
              >
                <h4>Prepositions with pictures</h4>
                <p>
                  Office, park and mountain scenes to practise{" "}
                  <strong>in / on / at / between</strong>, etc.
                </p>
              </button>

              <button
                className="menu-card"
                onClick={() => openSection("speculation")}
              >
                <h4>Speculating about photos</h4>
                <p>
                  Rewrite strong statements with <strong>might, must, seem</strong>,
                  and more.
                </p>
              </button>

              <button
                className="menu-card disabled"
                onClick={() => {}}
                aria-disabled="true"
                tabIndex={-1}
              >
                <h4>
                  Typical mistakes <span className="soon">Coming soon</span>
                </h4>
                <p>Fix common errors in photo descriptions and speculative language.</p>
              </button>
            </div>
          </section>
        </>
      ) : (
        <>
          <header className="header">
            <div>
              <h2 className="title">
                {view === "language" && "Useful photo description language"}
                {view === "prepositions" && "Prepositions of place with pictures"}
                {view === "speculation" && "Speculating about photos"}
              </h2>
              <p className="intro">
                Use the practice below, then return to the menu to try the other
                sections.
              </p>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => setView("menu")}>
                ← Back to guide menu
              </button>
              {onStartPractice && (
                <button className="btn primary" onClick={onStartPractice}>
                  Go to Part 2 practice
                </button>
              )}
            </div>
          </header>

          {view === "language" && renderLanguageScreen()}
          {view === "prepositions" && renderPrepositionsScreen()}
          {view === "speculation" && renderSpeculationScreen()}
        </>
      )}

      {/* ===== Styles (scoped to speaking-guide) ===== */}
      <style>{`
        .speaking-guide {
  --panel: #13213b;
  --ink: #e6f0ff;
  --muted: #a9b7d1;
  --accent: #f6d365;     /* ← NEW: same yellow as the rest of the app */
  color: var(--ink);
}

        .speaking-guide .header {
          margin-bottom: 1rem;
        }

        .speaking-guide .title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--accent);   /* was var(--ink) */
}

        .speaking-guide .intro {
          margin: 0.25rem 0 0;
          color: var(--muted);
          max-width: 700px;
        }

        .speaking-guide .actions {
          margin-top: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .guide-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Panels */
        .speaking-guide .panel {
          background: var(--panel);
          border: 1px solid #2c4b83;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 0.2rem;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        }

        .speaking-guide .panel h2 {
  font-size: 1.15rem;
  margin: 0 0 0.35rem;
  color: var(--accent);   /* was var(--ink) */
}

        .speaking-guide .panel h3 {
          margin: 0 0 0.35rem;
          color: var(--ink);
        }

        .speaking-guide .panel-text {
          margin-bottom: 0.75rem;
          color: var(--muted);
        }

        .bullets {
          padding-left: 1.1rem;
          font-size: 0.9rem;
          color: var(--ink);
        }

        .bullets li + li {
          margin-top: 0.2rem;
        }

        /* Menu grid (copied/adapted from Writing P4) */
        .speaking-guide .grid-menu {
          display: grid;
          gap: 1rem;
          margin-top: 0.75rem;
        }

        @media (min-width: 720px) {
          .speaking-guide .grid-menu {
            grid-template-columns: 1fr 1fr;
          }
        }

        .speaking-guide .menu-card {
          background: #0f1b31;
          border: 1px solid #2c416f;
          border-radius: 12px;
          padding: 0.9rem;
          text-align: left;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.08s ease;
        }

        .speaking-guide .menu-card:hover {
          background: #182c52;
          border-color: #3a6ebd;
          transform: translateY(-1px);
        }

        .speaking-guide .menu-card h4 {
          margin: 0 0 0.3rem;
          font-size: 1.05rem;
          color: #cfe1ff;
          display: flex;
          gap: 0.5rem;
          align-items: baseline;
        }

        .speaking-guide .menu-card p {
          margin: 0;
          color: var(--muted);
        }

        .speaking-guide .menu-card.disabled {
          opacity: 0.6;
          cursor: default;
          pointer-events: none;
          border-style: dashed;
          border-color: #2a3d67;
        }

        .speaking-guide .soon {
          background: #5b8ff2;
          color: #0b1730;
          font-weight: 700;
          padding: 0.05rem 0.4rem;
          border-radius: 999px;
          font-size: 0.75rem;
          letter-spacing: 0.02em;
        }

        /* Phrase boxes */
        .phrases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
        }

        .phrase-box {
          background: #0f1b31;
          border-radius: 0.75rem;
          padding: 0.6rem 0.7rem;
          border: 1px solid #2c416f;
        }

        .phrase-box h3 {
          font-size: 0.95rem;
          margin-bottom: 0.3rem;
          color: var(--ink);
        }

        .phrase-box ul {
          margin: 0;
          padding-left: 1.1rem;
          font-size: 0.9rem;
          color: var(--ink);
        }

        .phrase-box li + li {
          margin-top: 0.15rem;
        }

        .tip {
          margin-top: 0.7rem;
          font-size: 0.9rem;
          color: #d1fae5;
        }

        /* Buttons */
        .speaking-guide .btn {
          background: #24365d;
          border: 1px solid #335086;
          color: var(--ink);
          padding: 0.45rem 0.7rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .speaking-guide .btn.primary {
          background: #294b84;
          border-color: #3a6ebd;
          color: var(--ink);
          font-weight: 600;
        }

        .speaking-guide .btn.tiny {
          padding: 0.25rem 0.65rem;
          font-size: 0.8rem;
          border-radius: 999px;
          background: #24365d;
          border: 1px solid #335086;
        }

        .speaking-guide .btn.tiny.ghost {
          background: transparent;
          border: 1px solid #335086;
        }

        /* Images & gap layout */
        .exercise-image {
  width: 100%;
  max-width: 550px;
  border-radius: 0.75rem;
  margin: 0.7rem auto 1rem;   /* <-- auto centres horizontally */
  display: block;
}

        .gap-exercise {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .gap-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.2rem;
        }

        .gap-item label {
          font-size: 0.95rem;
          color: var(--ink);
        }

        .gap-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          align-items: center;
          margin-top: 0.25rem;
        }

        .gap-item input {
          padding: 0.25rem 0.5rem;
          border-radius: 0.4rem;
          border: 1px solid #4b5563;
          background: #020617;
          color: #e5e7eb;
          width: auto;
          max-width: 180px;
          font-size: 0.9rem;
        }

        /* Feedback */
        .feedback {
          font-size: 0.8rem;
          margin-top: 0.15rem;
          font-weight: bold;
        }

        .feedback.ok {
          color: #86efac;
        }

        .feedback.wrong {
          color: #fca5a5;
        }

        .feedback.note {
          font-weight: normal;
          color: var(--muted);
          margin-top: 0.1rem;
        }

        /* Speculation section */
        .spec-block {
          margin-top: 0.75rem;
        }

        .spec-block + .spec-block {
          margin-top: 1.1rem;
        }

        .panel-text.small {
          font-size: 0.85rem;
          margin-top: 0.1rem;
        }

        .spec-items {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          margin-top: 0.6rem;
        }

        .spec-item-card {
          background: #0f1b31;
          border-radius: 0.75rem;
          padding: 0.6rem 0.7rem;
          border: 1px solid #2c416f;
        }

        .spec-item-card .strong {
          margin: 0 0 0.25rem;
          color: var(--ink);
        }

        .spec-item-card .target {
          margin: 0 0 0.4rem;
          font-size: 0.85rem;
          color: var(--muted);
        }

        .spec-item-card textarea {
          width: 100%;
          resize: vertical;
          min-height: 2.5rem;
          padding: 0.35rem 0.45rem;
          border-radius: 0.5rem;
          border: 1px solid #4b5563;
          background: #020617;
          color: #e5e7eb;
          font-size: 0.9rem;
        }

        .spec-actions {
          margin-top: 0.4rem;
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .speculation-image {
          max-width: 450px;
          height: auto;
          border-radius: 8px;
          margin: 0 auto 1.5rem;
          display: block;
        }

        .suggested-answer {
  font-size: 1rem;          /* slightly bigger (default is ~0.85–0.9) */
  color: var(--ink);
  margin-top: 0.35rem;
  line-height: 1.4;
}


        @media (max-width: 600px) {
          .speaking-guide .title {
            font-size: 1.3rem;
          }

          .game-wrapper.speaking-guide {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          .speaking-guide .panel {
            width: 100%;
            box-sizing: border-box;
          }

          .gap-row {
            flex-direction: column;
            align-items: stretch;
          }

          .gap-item input {
            width: 100%;
            max-width: 100%;
          }

          .gap-row .btn.tiny {
            align-self: flex-start;
            margin-top: 0.25rem;
          }

          .exercise-image,
          .speculation-image {
            width: 100%;
            max-width: 100%;
          }
        }

        .target-pill {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.2rem 0.55rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: #3b82f6;   /* blue highlight, matches your palette */
  border-radius: 999px;
}

.spec-item-card .target {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: var(--ink);
}
      `}</style>
    </div>
  );
}
