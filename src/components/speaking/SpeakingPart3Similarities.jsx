// src/components/speaking/SpeakingPart3Similarities.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function normalise(text) {
  return text.trim().toLowerCase().replace(/\s+/, " ");
}

// ─────────────────────────────────────────────────────────────
// Guided gap items – Painting scenes
// ─────────────────────────────────────────────────────────────
const PAINTING_ITEMS = [
        {
          id: "paint1",
          label: "Sentence 1",
          gap: "In ___ pictures people are doing something creative.",
          words: 1,
          answers: ["both"],
          explanation:
            "Use 'both' to talk about something that is true in picture 1 and picture 2.",
        },
        {
          id: "paint2",
          label: "Sentence 2",
          gap: "The first picture shows children painting their father's face, ___ the second picture shows a woman painting a mural.",
          words: 1,
          answers: ["whereas", "while"],
          explanation:
            "Use 'whereas' or 'while' to contrast the two photos in one sentence.",
        },
        {
          id: "paint3",
          label: "Sentence 3",
          gap: "One ___ between the pictures is that the people seem to be enjoying themselves in both photos.",
          words: 1,
          answers: ["similarity"],
          explanation:
            "We can talk about 'a similarity between the pictures' when something is the same in both.",
        },
        {
          id: "paint4",
          label: "Sentence 4",
          gap: "On the ___, the first picture shows a calm family moment; on the other hand, the second picture shows a large public mural.",
          words: 2,
          answers: ["one hand"],
          explanation:
            "We use 'on the one hand… on the other hand…' to introduce two contrasting ideas.",
        },
        {
          id: "paint5",
          label: "Sentence 5",
          gap: "One ___ between the pictures is that in the first one the children are painting on a person, while in the second one the woman is painting on a wall.",
          words: 1,
          answers: ["difference"],
          explanation:
            "Use 'a difference between the pictures' when something is not the same.",
        },
      ];      

// ─────────────────────────────────────────────────────────────
// Guided gap items – Rainy scenes
// ─────────────────────────────────────────────────────────────
const RAINY_ITEMS = [
    {
      id: "rain1",
      label: "Sentence 1",
      gap: "___ pictures show people in the rain.",
      words: 1,
      answers: ["both"],
      explanation:
        "Use 'both' to talk about something that is true in picture 1 and picture 2.",
    },
    {
      id: "rain2",
      label: "Sentence 2",
      gap: "The woman in the first picture is smiling, ___ the man in the second picture looks miserable.",
      words: 1,
      answers: ["whereas", "while"],
      explanation:
        "'Whereas' and 'while' are common ways to contrast people's feelings.",
    },
    {
      id: "rain3",
      label: "Sentence 3",
      gap: "___ the first picture, the second one shows someone who really seems to hate the rain.",
      words: 1,
      answers: ["unlike"],
      explanation:
        "We use 'unlike' to introduce a contrast between two pictures or situations.",
    },
    {
      id: "rain4",
      label: "Sentence 4",
      gap: "The second picture seems much ___ enjoyable than the first one.",
      words: 1,
      answers: ["less"],
      explanation:
        "Here we compare the level of enjoyment: 'much less enjoyable'.",
    },
    {
      id: "rain5",
      label: "Sentence 5",
      gap: "___ to the first picture, the second one looks much more negative.",
      words: 1,
      answers: ["compared"],
      explanation:
        "Use 'compared to' when you describe how one picture is different from another.",
    },
  ];  

export default function SpeakingPart3Similarities() {
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [checkState, setCheckState] = useState({});

  // Free-practice text
  const [freeParenting, setFreeParenting] = useState("");
  const [freeCustomer, setFreeCustomer] = useState("");

  // Status messages for saving free-practice notes
  const [freeStatus, setFreeStatus] = useState({
    parenting: null,
    customer: null,
  });

  // NEW: has the student “submitted” this note (summary mode)?
  const [freeParentingSubmitted, setFreeParentingSubmitted] = useState(false);
  const [freeCustomerSubmitted, setFreeCustomerSubmitted] = useState(false);

  // 👇 NEW: visibility of model answers for free practice
const [freeModelVisible, setFreeModelVisible] = useState({
    parenting: false,
    customer: false,
  });

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (checkState[id]) {
      setCheckState((prev) => ({
        ...prev,
        [id]: { ...prev[id], checked: false },
      }));
    }
  };

  const checkItem = (item) => {
    const raw = answers[item.id] || "";
    if (!raw.trim()) return;
    const user = normalise(raw);
    const ok = (item.answers || []).some(
      (ans) => normalise(ans) === user
    );

    setCheckState((prev) => ({
      ...prev,
      [item.id]: { ...(prev[item.id] || {}), checked: true, ok },
    }));
  };

  const showModel = (id) => {
    setCheckState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), showModel: true },
    }));
  };

  const saveFreeNote = async (which) => {
    const user = auth.currentUser;

    if (!user) {
      setFreeStatus((prev) => ({ ...prev, [which]: "anon" }));
      return;
    }

    const rawText =
      which === "parenting" ? freeParenting.trim() : freeCustomer.trim();

    if (!rawText) {
      setFreeStatus((prev) => ({ ...prev, [which]: "empty" }));
      return;
    }

    try {
        await addDoc(
          collection(db, "users", user.uid, "speakingSpeculationNotes"),
          {
            userId: user.uid,
            photoKey:
              which === "parenting"
                ? "part3_parenting_similarities"
                : "part3_customer_similarities",
            text: rawText,
            source: "part3Similarities",
            createdAt: serverTimestamp(),
          }
        );
  
        setFreeStatus((prev) => ({ ...prev, [which]: "saved" }));
  
        // NEW – switch to “submitted view” like in speculation
        if (which === "parenting") {
          setFreeParentingSubmitted(true);
        } else {
          setFreeCustomerSubmitted(true);
        }
      } catch (err) {
        console.error("Error saving similarities note:", err);
        setFreeStatus((prev) => ({ ...prev, [which]: "error" }));
      }
    };

  const handleCopyFreeNote = async (which) => {
    const textToCopy =
      which === "parenting" ? freeParenting.trim() : freeCustomer.trim();

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      // optional: toast or message if you want
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };


  const renderGapLine = (item) => {
    const [left, right] = item.gap.split("___");
    const state = checkState[item.id] || {};
    const { checked, ok, showModel } = state;
    
  
    return (
      <div className="gap-item" key={item.id}>
        <label>
          <span style={{ fontWeight: 600 }}>{item.label}</span>
          <div className="gap-row">
            {/* NEW: text + gap in one block */}
            <div className="gap-text">
              <span>{left}</span>
              <input
                type="text"
                className="spec-gap-input"
                value={answers[item.id] || ""}
                onChange={(e) => handleChange(item.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    checkItem(item);
                  }
                }}
                placeholder={
                  item.words === 1 ? "1 word" : `${item.words} words`
                }
              />
              <span>{right}</span>
            </div>
  
            {/* NEW: buttons in their own block */}
            <div className="gap-buttons">
              <button
                type="button"
                className="btn tiny"
                onClick={() => checkItem(item)}
              >
                Check
              </button>
              <button
                type="button"
                className="btn tiny ghost"
                onClick={() => showModel(item.id)}
              >
                Show suggestion
              </button>
            </div>
          </div>
        </label>
  
        {/* feedback bits stay the same… */}
        {checked && (
          <p className={`feedback ${ok ? "ok" : "wrong"}`}>
            {ok
              ? "Nice – that works well for this comparison."
              : "Not quite – check the target language again or show the suggestion."}
          </p>
        )}
  
        {showModel && (
          <>
            <p className="feedback">
              Answer:{" "}
              <strong>
                {item.answers.length > 1
                  ? item.answers.join(" / ")
                  : item.answers[0]}
              </strong>
            </p>
            {item.explanation && (
              <p className="feedback note">{item.explanation}</p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="game-wrapper speaking-guide">
      <Seo
        title="Speaking Part 3 – Similarities & Differences | Seif Aptis Trainer"
        description="Practise useful language for expressing similarities and differences when comparing photos in Aptis Speaking Part 3."
      />

      <header className="header">
        <div>
          <h2 className="title">Similarities &amp; differences</h2>
          <p className="intro">
            Practise the key language you need to talk about{" "}
            <strong>what the pictures have in common</strong> and{" "}
            <strong>how they are different</strong> in Aptis Speaking Part 3.
          </p>
        </div>

        <div className="actions">
          <button
            className="btn"
            onClick={() => navigate("/speaking/part3-comparing")}
          >
            ← Back to Comparing Menu
          </button>
        </div>
      </header>

      <main className="guide-body">
        {/* Panel 1 – unchanged language summary */}
        <section className="panel">
          <h2>Key ideas for similarities and differences</h2>
          <p className="panel-text">
            When you compare the two photos, it's good to use different expressions to describe {" "}
            <strong>similarities</strong> and{" "}
            <strong>differences</strong>. Here are a few common phrases to help you:
          </p>
          <div className="phrases-grid">
            <div className="phrase-box">
              <h3>Similarities</h3>
              <ul>
                <li>Both pictures show…</li>
                <li>In both pictures we can see…</li>
                <li>The photos are similar because…</li>
                <li>They both involve…</li>
              </ul>
            </div>
            <div className="phrase-box">
              <h3>Differences</h3>
              <ul>
                <li>In the first picture…, whereas in the second…</li>
                <li>Unlike the first photo, the second one…</li>
                <li>One main difference is that…</li>
                <li>The second picture is more…, while the first is…</li>
              </ul>
            </div>
          </div>
          <p className="tip">
            Tip: Don’t just list things. Try to{" "}
            <strong>connect the pictures in one sentence</strong> using{" "}
            <em>both, whereas, while, similar, different, compared to…</em>
          </p>
        </section>

        {/* Panel 2 – Guided activity 1: Painting scenes */}
        <section className="panel">
          <h2>Guided Activity 1</h2>
          <p className="panel-text">
            First, look at the two parts of the picture and think about what
            they have in common and how they are different.
          </p>

          <img
            src="/images/speaking/part3-comparing/painting-scenes.png"
            alt="Children painting their father's face and a woman painting a mural."
            className="exercise-image wide"
            draggable="false"
          />

          <p className="panel-text" style={{ marginTop: "0.75rem" }}>
            Now complete the sentences with <strong>one word</strong>.
          </p>

          <div className="gap-exercise">
            {PAINTING_ITEMS.map((item) => renderGapLine(item))}
          </div>
        </section>

        {/* Panel 3 – Guided activity 2: Rainy weather scenes */}
        <section className="panel">
          <h2>Guided Activity 2</h2>
          <p className="panel-text">
            Again, start by thinking about one similarity and one difference
            between the two scenes.
          </p>

          <img
            src="/images/speaking/part3-comparing/rainy-scenes.png"
            alt="One person enjoying the rain with an umbrella and another person walking unhappily in heavy rain."
            className="exercise-image wide"
            draggable="false"
          />

          <p className="panel-text" style={{ marginTop: "0.75rem" }}>
            Now complete the sentences with <strong>one word</strong>.
          </p>

          <div className="gap-exercise">
            {RAINY_ITEMS.map((item) => renderGapLine(item))}
          </div>
        </section>

        {/* Panel 4 – Freer practice 1: Parenting styles */}
        <section className="panel">
          <h2>Freer practice 1</h2>
          <p className="panel-text">
            Look at the two parenting scenes and write a short description
            comparing them. Try to mention at least one similarity and one
            difference, using phrases like{" "}
            <em>both…, whereas…, unlike…, one main difference is that…</em>
          </p>

          <img
            src="/images/speaking/part3-comparing/parenting-scenes.png"
            alt="Contrasting parenting scenes with children behaving differently."
            className="exercise-image wide"
            draggable="false"
          />

<div className="spec-items">
            <div className="spec-item-card">
              <p className="target">
                🎯 <strong>Describe and compare the photos</strong>
              </p>
              {!freeParentingSubmitted ? (
  <>
    <textarea
      className="free-spec-textarea"
      rows={4}
      value={freeParenting}
      onChange={(e) => {
        setFreeParenting(e.target.value);
        if (freeStatus.parenting) {
          setFreeStatus((prev) => ({ ...prev, parenting: null }));
        }
      }}
      placeholder="Write a short comparison here, mentioning at least one similarity and one difference..."
    />

    <div className="free-note-actions">
      <button
        type="button"
        className="btn tiny"
        onClick={() => saveFreeNote("parenting")}
      >
        Save note to my profile
      </button>

      {freeStatus.parenting === "anon" && (
        <p className="feedback note">
          You need to be signed in to save your notes.
        </p>
      )}
      {freeStatus.parenting === "empty" && (
        <p className="feedback note">
          Write something first before saving.
        </p>
      )}
      {freeStatus.parenting === "saved" && (
        <p className="feedback ok">
          Saved ✅ – you can now see your note in submitted form.
        </p>
      )}
      {freeStatus.parenting === "error" && (
        <p className="feedback wrong">
          Something went wrong while saving. Please try again.
        </p>
      )}
    </div>
  </>
) : (
  <div className="free-spec-summary">
    <div className="free-spec-summary-header">
      <h4 style={{ margin: 0 }}>Your saved comparison</h4>
      <div className="summary-actions">
        <button
          type="button"
          className="btn tiny"
          onClick={() => {
            setFreeParentingSubmitted(false);
            setFreeStatus((prev) => ({ ...prev, parenting: null }));
          }}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn tiny"
          onClick={() => handleCopyFreeNote("parenting")}
        >
          Copy text
        </button>
      </div>
    </div>

    <div className="free-spec-preview">{freeParenting}</div>

    {freeStatus.parenting === "saved" && (
      <p className="feedback ok" style={{ marginTop: "0.4rem" }}>
        Saved ✅ – this version is stored in your speaking notes.
      </p>
    )}

    {/* Model answer – only available after submit */}
    <div className="model-answer" style={{ marginTop: "0.6rem" }}>
      {!freeModelVisible.parenting ? (
        <button
          type="button"
          className="btn tiny ghost"
          onClick={() =>
            setFreeModelVisible((prev) => ({ ...prev, parenting: true }))
          }
        >
          Show a model answer
        </button>
      ) : (
        <p className="feedback note">
          <strong>Example answer:</strong>{" "}
          Both pictures show parents spending time with their children at home,
          but the first scene looks quiet and calm, while in the second
          picture the boy is running around and creating a lot more mess.
        </p>
      )}
    </div>
  </div>
)}
            </div>
          </div>
        </section>

        {/* Panel 5 – Freer practice 2: Customer or everyday scenes */}
        <section className="panel">
          <h2>Freer practice 2</h2>
          <p className="panel-text">
            Finally, look at another pair of pictures. Write a short description
            comparing them, mentioning similarities and differences using the
            language from the top of the page.
          </p>

          <img
            src="/images/speaking/part3-comparing/customer-scenes.png"
            alt="Contrasting customer service scenes in everyday life."
            className="exercise-image wide"
            draggable="false"
          />

<div className="spec-items">
            <div className="spec-item-card">
              <p className="target">
                🎯 <strong>Describe and compare the photos</strong>
              </p>
              {!freeCustomerSubmitted ? (
  <>
    <textarea
      className="free-spec-textarea"
      rows={4}
      value={freeCustomer}
      onChange={(e) => {
        setFreeCustomer(e.target.value);
        if (freeStatus.customer) {
          setFreeStatus((prev) => ({ ...prev, customer: null }));
        }
      }}
      placeholder="Write a short comparison here, mentioning at least one similarity and one difference..."
    />

    <div className="free-note-actions">
      <button
        type="button"
        className="btn tiny"
        onClick={() => saveFreeNote("customer")}
      >
        Save note to my profile
      </button>

      {freeStatus.customer === "anon" && (
        <p className="feedback note">
          You need to be signed in to save your notes.
        </p>
      )}
      {freeStatus.customer === "empty" && (
        <p className="feedback note">
          Write something first before saving.
        </p>
      )}
      {freeStatus.customer === "saved" && (
        <p className="feedback ok">
          Saved ✅ – you can now see your note in submitted form.
        </p>
      )}
      {freeStatus.customer === "error" && (
        <p className="feedback wrong">
          Something went wrong while saving. Please try again.
        </p>
      )}
    </div>
  </>
) : (
  <div className="free-spec-summary">
    <div className="free-spec-summary-header">
      <h4 style={{ margin: 0 }}>Your saved comparison</h4>
      <div className="summary-actions">
        <button
          type="button"
          className="btn tiny"
          onClick={() => {
            setFreeCustomerSubmitted(false);
            setFreeStatus((prev) => ({ ...prev, customer: null }));
          }}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn tiny"
          onClick={() => handleCopyFreeNote("customer")}
        >
          Copy text
        </button>
      </div>
    </div>

    <div className="free-spec-preview">{freeCustomer}</div>

    {freeStatus.customer === "saved" && (
      <p className="feedback ok" style={{ marginTop: "0.4rem" }}>
        Saved ✅ – this version is stored in your speaking notes.
      </p>
    )}

    <div className="model-answer" style={{ marginTop: "0.6rem" }}>
      {!freeModelVisible.customer ? (
        <button
          type="button"
          className="btn tiny ghost"
          onClick={() =>
            setFreeModelVisible((prev) => ({ ...prev, customer: true }))
          }
        >
          Show a model answer
        </button>
      ) : (
        <p className="feedback note">
          <strong>Example answer:</strong>{" "}
          In both pictures, we can see customers returning items, but in the
          first case the diner appears to be upset with the waiter, whereas
          in the second, the woman seems to be calmly returning a sweater.
        </p>
      )}
    </div>
  </div>
)}
            </div>
          </div>
        </section>
      </main>

      {/* ===== Styles (same speaking-guide styles + exercise layout) ===== */}
      <style>{`
        .speaking-guide {
          --panel: #13213b;
          --ink: #e6f0ff;
          --muted: #a9b7d1;
          --accent: #f6d365;
          color: var(--ink);
        }

        .speaking-guide .header {
          margin-bottom: 1rem;
        }

        .speaking-guide .title {
          margin: 0;
          font-size: 1.5rem;
          color: var(--accent);
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
          color: var(--accent);
        }

        .speaking-guide .panel h3 {
          margin: 0 0 0.35rem;
          color: var(--ink);
        }

        .speaking-guide .panel-text {
          margin-bottom: 0.75rem;
          color: var(--muted);
        }

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

        .speaking-guide .btn {
          background: #24365d;
          border: 1px solid #335086;
          color: var(--ink);
          padding: 0.45rem 0.7rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
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

        .exercise-image {
          width: 100%;
          max-width: 480px;
          border-radius: 0.75rem;
          margin: 0.4rem auto 0.4rem;
          display: block;
        }

        .exercise-image.wide {
          max-width: 640px;
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
  gap: 0.5rem;
  align-items: flex-start;
}

        .spec-gap-input {
  display: inline-block;
  min-width: 80px;
  max-width: 140px;         /* smaller box */
  padding: 0.2rem 0.4rem;   /* slightly tighter */
  margin: 0 0.25rem;
  border-radius: 0.45rem;
  border: 1px solid #4b5563;
  background: #020617;
  color: #e5e7eb;
  font-size: 0.9rem;
}

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

        .spec-item-card .target {
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
          color: var(--ink);
        }

        .free-spec-textarea {
          width: 100%;
          resize: vertical;
          min-height: 3.5rem;
          padding: 0.45rem 0.55rem;
          border-radius: 0.5rem;
          border: 1px solid #4b5563;
          background: #020617;
          color: #e5e7eb;
          font-size: 0.9rem;
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
    flex-wrap: wrap;           /* keep items on one line if possible */
    align-items: center;
  }

  .spec-gap-input {
    width: auto;               /* no full-width bar */
    min-width: 80px;
    max-width: 130px;
  }

          .gap-row .btn.tiny {
            align-self: flex-start;
            margin-top: 0.25rem;
          }

          .exercise-image {
            max-width: 100%;
          }
        }
        .sentence-line {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.sentence-line input {
  display: inline-block;
  width: 110px;       /* smaller width */
  padding: 4px 8px;
  font-size: 0.95rem;
  margin: 0 4px;      /* spacing so words don't touch */
  border-radius: 6px;
  border: 1px solid #6b7280;
  background: #111827;
  color: white;
}

.sentence-line input:focus {
  outline: 2px solid #3b82f6;
}

.sentence-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.sentence-wrapper {
  margin-bottom: 2rem;
}
          .free-note-actions {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        @media (min-width: 640px) {
          .free-note-actions {
            flex-direction: row;
            align-items: center;
          }
        }

          .free-spec-summary {
          margin-top: 0.6rem;
          background: #0b1527;
          border-radius: 0.75rem;
          border: 1px solid #243b63;
          padding: 0.6rem 0.7rem;
        }

        .free-spec-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }

        .summary-actions {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .free-spec-preview {
          white-space: pre-wrap;
          font-size: 0.9rem;
          color: var(--ink);
        }

        .model-answer {
          margin-top: 0.5rem;
        }



      `}</style>
    </div>
  );
}
