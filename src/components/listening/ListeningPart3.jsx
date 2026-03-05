import React, { useEffect, useMemo, useRef, useState } from "react";
import Seo from "../common/Seo.jsx";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Task bank (move to /banks later if you like)
// ─────────────────────────────────────────────────────────────────────────────
const PART3_LISTENING_TASKS = [
  {
    id: "subscriptions",
    title: "Subscriptions",
    intro:
      "Listen to two people discussing subscription services. Read the statements (a–d) and decide who expresses each opinion — the man, the woman, or both. You can listen to the discussion twice.",
    audioSrc: "/audio/listening/part3/subscriptions.mp3",
    statements: [
      {
        key: "a",
        text: "Subscriptions are useful because they help people plan their spending.",
        answer: "man",
        scriptLineIndex: 1,
        evidenceParts: [
          "A fixed monthly payment is predictable",
          "makes budgeting easier",
        ],
        explanation:
          "The man focuses on predictability: a fixed monthly cost feels easier to budget for than paying one larger amount at once.",
      },
      {
        key: "b",
        text: "Subscription services can end up costing more than people realise.",
        answer: "woman",
        scriptLineIndex: 2,
        evidenceParts: [
          "the total can be higher than people expect",
          "A small fee doesn’t seem significant",
        ],
        explanation:
          "The woman argues that individual fees feel small, but the combined total across several services can be surprisingly high.",
      },
      {
        key: "c",
        text: "People often forget what they are paying for each month.",
        answer: "both",
        scriptLineIndex: 3,
        evidenceParts: [
          "lose track",
          "stop noticing them",
          "I’d forgotten it was even active",
        ],
        explanation:
          "Both speakers support this idea: the woman says people ‘lose track’, and the man gives a personal example of forgetting a subscription was still active.",
      },
      {
        key: "d",
        text: "Some subscriptions are difficult to cancel.",
        answer: "both",
        scriptLineIndex: 6,
        evidenceParts: [
          "cancellation process",
          "it takes much longer than it should",
          "discourages people from leaving",
          "require customers to contact support",
        ],
        explanation:
          "Both speakers mention cancellation problems: the woman says it can be unnecessarily long, and the man adds that it can discourage people from leaving.",
      },
    ],
    script: [
      {
        speaker: "Woman",
        text:
          "I was checking my bank statement last night and I realised how many monthly subscriptions I have. It’s not just films and music anymore. There are apps, storage, deliveries, even websites that used to be free.",
      },
      {
        speaker: "Man",
        text:
          "That’s true. The subscription model is everywhere now. I can see why people accept it, though. A fixed monthly payment is predictable, so for some people it makes budgeting easier than paying one large amount at once.",
      },
      {
        speaker: "Woman",
        text:
          "Predictability helps, but it can also be misleading. A small fee doesn’t seem significant on its own, yet when you add several services together, the total can be higher than people expect. It’s easy to lose track of what you’re spending in a month.",
      },
      {
        speaker: "Man",
        text:
          "And a lot of people do lose track. Many payments are taken automatically, so you stop noticing them. I recently found one service I hadn’t used for months, but I was still paying for it because I’d forgotten it was even active.",
      },
      {
        speaker: "Woman",
        text:
          "Free trials contribute to that. They encourage people to sign up quickly, and if you don’t cancel immediately, the payment becomes part of your normal routine. People often assume they will deal with it later, but later never arrives.",
      },
      {
        speaker: "Man",
        text:
          "From the company’s point of view, that makes sense. A small monthly charge is less noticeable than a single large payment, so customers are less likely to question it. The system works best for the provider when users are not checking regularly.",
      },
      {
        speaker: "Woman",
        text:
          "Another issue is the cancellation process. With some services, it is straightforward, but with others it takes much longer than it should. You can register in a minute, yet cancelling may involve searching through settings, answering questions, or confirming the decision several times.",
      },
      {
        speaker: "Man",
        text:
          "In theory, that might be to prevent accidental cancellations. In practice, it discourages people from leaving. Some companies even require customers to contact support, which can feel unnecessary when the subscription is only a few euros.",
      },
      {
        speaker: "Woman",
        text:
          "Having said that, I don’t think subscriptions are always poor value. If you use a service every day, the monthly cost can be reasonable.",
      },
      {
        speaker: "Man",
        text:
          "I agree with that point. Subscriptions are convenient, but only when people monitor them and keep the ones they genuinely use.",
      },
    ],
  },
];

const WHO_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "both", label: "Both" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ListeningPart3({ user }) {
  const items = PART3_LISTENING_TASKS;

  const [taskIndex, setTaskIndex] = useState(0);
  const current = items[taskIndex] || items[0];

  // answers + feedback
  const [answers, setAnswers] = useState({}); // key -> man|woman|both
  const [feedback, setFeedback] = useState({}); // key -> true/false
  const [checkedOnce, setCheckedOnce] = useState(false);

  // script toggle (only available after first check)
  const [showScript, setShowScript] = useState(false);

  // “Why?” support (modelled on Reading Part 3)
  const [whyOpen, setWhyOpen] = useState(null); // statement key, e.g. "a"
  const scriptLineRefs = useRef({}); // lineIndex -> DOM node

  // audio / play limit (2 plays max)
  const audioRef = useRef(null);
  const [playsUsed, setPlaysUsed] = useState(0); // 0..2
  const [isPlaying, setIsPlaying] = useState(false);

  // task picker items (future-proof)
  const decoratedItems = useMemo(
    () =>
      items.map((t, i) => ({
        ...t,
        title: `${i + 1}. ${t.title}`,
      })),
    [items]
  );

  // reset on task change
  useEffect(() => {
    setAnswers({});
    setFeedback({});
    setCheckedOnce(false);
    setShowScript(false);
    setWhyOpen(null);

    // stop audio + reset listen count
    stopAudio(true);
    setPlaysUsed(0);
  }, [current?.id]);

  // If a “Why?” is opened, auto-show the script and scroll to the relevant line
  useEffect(() => {
    if (!whyOpen) return;
    const stmt = current?.statements?.find((s) => s.key === whyOpen);
    if (!stmt) return;

    setShowScript(true);

    const node = scriptLineRefs.current?.[stmt.scriptLineIndex];
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [whyOpen, current]);

  // keep isPlaying in sync when audio ends
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    el.addEventListener("ended", onEnded);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);

    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, [current?.id]);

  function handleSelectTask(nextIndex) {
    setTaskIndex(nextIndex);
  }

  function handleChange(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (whyOpen === key) setWhyOpen(null);
    setFeedback((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  function handleReset() {
    setAnswers({});
    setFeedback({});
    setWhyOpen(null);
    // NOTE: do not reset playsUsed (exam-like)
    toast("Answers cleared.");
  }

  function handleShowAnswers() {
    const ans = {};
    const fbMap = {};
    current.statements.forEach((s) => {
      ans[s.key] = s.answer;
      fbMap[s.key] = true;
    });
    setAnswers(ans);
    setFeedback(fbMap);
    setCheckedOnce(true);
    setShowScript(true);
    setWhyOpen(null);
  }

  async function handleCheck() {
    setWhyOpen(null);

    const fbMap = {};
    let correct = 0;

    current.statements.forEach((s) => {
      const chosen = (answers[s.key] || "").trim();
      const ok = chosen && chosen === s.answer;
      fbMap[s.key] = !!ok;
      if (ok) correct += 1;
    });

    setFeedback(fbMap);
    setCheckedOnce(true);

    const total = current.statements.length;
    if (correct === total) {
      toast("Perfect ✓");

      // Optional logging if you have helpers (safe/no-op if not present)
      try {
        if (user && fb.logListeningPart3Completed) {
          await fb.logListeningPart3Completed({
            taskId: current.id,
            playsUsed,
            source: "ListeningPart3",
          });
        }
      } catch (e) {
        console.warn("[listening p3] completion log failed:", e);
      }
    } else {
      toast(`${correct}/${total} correct`);
    }

    // Attempt logging (each Check counts as an attempt)
    try {
        if (user && fb.logListeningPart3Attempted) {
          await fb.logListeningPart3Attempted({
            taskId: current.id,
            score: correct,
            total,
            playsUsed,
            source: "ListeningPart3",
          });
        }
      } catch (e) {
        console.warn("[listening p3] attempt log failed:", e);
      }
  }

  function stopAudio(silent = false) {
    const el = audioRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
      setIsPlaying(false);
      if (!silent) toast("Stopped.");
    } catch {}
  }

  async function handlePlayStop() {
    const el = audioRef.current;
    if (!el) return;

    // Stop if currently playing
    if (isPlaying) {
      stopAudio(true);
      return;
    }

    // Enforce 2 plays max (exam-like: count on click)
    if (playsUsed >= 2) {
      toast("You’ve used both listens.");
      return;
    }

    setPlaysUsed((p) => p + 1);

    try {
      await el.play();
    } catch (e) {
      console.warn("[listening p3] play blocked:", e);
      toast("Click again to allow audio.");
    }
  }

  const listensLeft = Math.max(0, 2 - playsUsed);
  const playDisabled = playsUsed >= 2 && !isPlaying;

  const activeStmt = whyOpen
    ? current.statements.find((x) => x.key === whyOpen)
    : null;
  const activeParts = activeStmt?.evidenceParts || [];

  return (
    <div className="aptis-listening3 game-wrapper">
      <StyleScope />

      <Seo
        title="Listening Part 3 | Seif Aptis Trainer"
        description="Opinion matching: decide whether the man, the woman or both express each opinion."
      />

<header className="top">
  <div className="titleblock">
    <h2 className="title">Listening – Part 3 (Opinion Matching)</h2>

    {/* Dropdown sits directly under the title */}
    <div className="tools tools-inline">
      <ChipDropdown
        items={decoratedItems}
        value={taskIndex}
        onChange={handleSelectTask}
        label="Task"
      />
    </div>

    {/* Intro comes after */}
    <p className="intro">{current?.intro}</p>
  </div>
</header>

      <section className="panel">
        <div className="panelbar">
          <div className="audioBox">
            <audio ref={audioRef} src={current.audioSrc} preload="auto" />

            <button
              type="button"
              className={`btn ${isPlaying ? "danger" : "primary"}`}
              onClick={handlePlayStop}
              disabled={playDisabled}
              title={playsUsed >= 2 ? "No listens remaining" : "Play audio"}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>

            <div className="listenMeta">
              <span className={`pill ${playsUsed >= 2 ? "pill-dim" : ""}`}>
                Listens left: <strong>{listensLeft}</strong>/2
              </span>
              {playsUsed > 0 && (
                <span className="smallnote">(You’ve used {playsUsed} of 2)</span>
              )}
            </div>
          </div>

          <div className="controls">
            <button className="btn" onClick={handleReset}>
              Reset
            </button>
            <button className="btn primary" onClick={handleCheck}>
              Check
            </button>
            <button className="btn ghost" onClick={handleShowAnswers}>
              Show answers
            </button>
          </div>
        </div>

        <h3 className="minihead">Who expresses which opinion?</h3>

        <div className="rows">
          {current.statements.map((s, idx) => {
            const chosen = answers[s.key] || "";
            const fbItem = feedback[s.key];
            const status = fbItem === true ? "ok" : fbItem === false ? "bad" : "";

            return (
              <React.Fragment key={s.key}>
                <div className="row">
                  <div className="stmt">
                    <span className="num">{idx + 1}.</span> {s.text}
                  </div>

                  <div className="answerCol">
                    <select
                      className={`select ${status}`}
                      value={chosen}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      aria-label={`Choose who expresses opinion ${idx + 1}`}
                    >
                      <option value="">—</option>
                      {WHO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="why-btn"
                      disabled={!checkedOnce}
                      onClick={() =>
                        setWhyOpen((cur) => (cur === s.key ? null : s.key))
                      }
                      title={checkedOnce ? "Show explanation" : "Check first to unlock"}
                    >
                      Why?
                    </button>
                  </div>
                </div>

                {whyOpen === s.key && (
                  <div className="why-box">
                    <div className="why-row">
                      <span className="why-label">Answer:</span>
                      <strong>
                        {WHO_OPTIONS.find((o) => o.value === s.answer)?.label}
                      </strong>
                    </div>
                    <div className="why-row">
                      <span className="why-label">Evidence:</span>
                      <span className="why-evidence">
                        {Array.isArray(s.evidenceParts)
                          ? s.evidenceParts.join(" … ")
                          : ""}
                      </span>
                    </div>
                    <div className="why-row">
                      <span className="why-label">Explanation:</span>
                      <span>{s.explanation}</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="scriptWrap">
          <button
            type="button"
            className="linkbtn"
            disabled={!checkedOnce}
            onClick={() => setShowScript((v) => !v)}
            title={checkedOnce ? "Toggle script" : "Check first to unlock"}
          >
            {showScript ? "Hide script" : "Show script"}
          </button>

          {showScript && checkedOnce && (
            <div className="scriptPanel">
              <h4 className="scriptTitle">Script</h4>
              <div className="scriptLines">
                {current.script.map((line, i) => {
                  const isTarget = activeStmt?.scriptLineIndex === i;
                  return (
                    <div
                      className={`scriptLine ${isTarget ? "active-script-line" : ""}`}
                      key={i}
                      ref={(node) => {
                        scriptLineRefs.current[i] = node;
                      }}
                    >
                      <span className="speaker">{line.speaker}:</span>{" "}
                      <span className="text">
                        {whyOpen ? highlightEvidence(line.text, activeParts) : line.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function highlightEvidence(text, parts = []) {
  if (!parts || parts.length === 0) return text;

  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = parts
    .map((p) => String(p || "").trim())
    .filter(Boolean);
  if (cleaned.length === 0) return text;

  const regex = new RegExp("(" + cleaned.map((p) => escapeRegex(p)).join("|") + ")", "gi");

  const segments = String(text).split(regex);
  return segments.map((seg, i) => {
    const isHit = cleaned.some((p) => seg.toLowerCase() === p.toLowerCase());
    return isHit ? (
      <mark key={i} className="evidence">
        {seg}
      </mark>
    ) : (
      <React.Fragment key={i}>{seg}</React.Fragment>
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ChipDropdown (copied pattern from your Reading Part 4 / Speaking)
// ─────────────────────────────────────────────────────────────────────────────
function ChipDropdown({ items, value, onChange, label = "Task" }) {
  return (
    <div className="chipwrap">
      <span className="chiplabel">{label}</span>
      <select
        className="chipselect"
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        aria-label={label}
      >
        {items.map((it, i) => (
          <option key={it.id || i} value={i}>
            {it.title}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoped styles
// ─────────────────────────────────────────────────────────────────────────────
function StyleScope() {
  return (
    <style>{`
      .aptis-listening3 { max-width: 1100px; margin: 0 auto; }
.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
        .title { margin: 0 0 .25rem; font-size: 1.65rem; }
      .intro { margin: 0; color: #a9b7d1; max-width: 70ch; }
      .tools { min-width: 240px; }

      /* ✅ mobile: stack */
@media (max-width: 720px) {
  .top { flex-direction: column; }
  .tools { width: 100%; min-width: 0; }
  .chipselect { width: 100%; }
}

      .panel {
        background: #0f1b33;
        border: 1px solid #2c4b83;
        border-radius: 14px;
        padding: 1rem;
      }

      .panelbar {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .audioBox { display:flex; align-items:center; gap:.75rem; flex-wrap: wrap; }
      .listenMeta { display:flex; align-items:baseline; gap:.5rem; flex-wrap: wrap; }
      .smallnote { color: #a9b7d1; font-size: .9rem; }

      .minihead { margin: .25rem 0 1rem; font-size: 1.05rem; color: #e6f0ff; }
      .rows { display:flex; flex-direction:column; gap: .85rem; }

      .row {
        display:grid;
        grid-template-columns: 1fr 320px;
        gap: .75rem;
        align-items:center;
      }
      @media (max-width: 720px){
        .row { grid-template-columns: 1fr; }
      }

      .answerCol { display:flex; gap: .6rem; align-items:center; }
      @media (max-width: 720px){
        .answerCol { justify-content: flex-start; }
      }

      .stmt { color:#e6f0ff; line-height: 1.35; }
      .num { display:inline-block; min-width: 1.4rem; color:#cfe0ff; font-weight: 700; }

      .select {
        width: 100%;
        flex: 1;
        background:#101f3f;
        border: 1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 10px;
        padding: .6rem .7rem;
        outline: none;
      }
      .select.ok { border-color: rgba(70, 200, 120, .85); box-shadow: 0 0 0 2px rgba(70,200,120,.15); }
      .select.bad { border-color: rgba(235, 80, 80, .85); box-shadow: 0 0 0 2px rgba(235,80,80,.15); }

      .why-btn {
        background:#13213b;
        border:1px solid #2c4b83;
        color:#9fc2ff;
        font-weight:800;
        border-radius: 10px;
        padding: .55rem .75rem;
        cursor:pointer;
        white-space: nowrap;
      }
      .why-btn:hover { border-color:#4a79d8; }
      .why-btn:disabled { opacity:.55; cursor:not-allowed; }

      .why-box {
        margin-top: .55rem;
        margin-bottom: .25rem;
        background:#0f1b31;
        border:1px solid rgba(210,225,255,.18);
        border-radius: 12px;
        padding: .75rem .85rem;
      }
      .why-row { display:flex; gap:.5rem; flex-wrap: wrap; line-height: 1.45; }
      .why-label { color:#9fc2ff; font-weight: 900; }
      .why-evidence { font-style: italic; color:#cfd9f3; }

      .controls { display:flex; gap:.6rem; flex-wrap: wrap; }

      .btn {
        background:#13213b;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 10px;
        padding: .55rem .8rem;
        cursor:pointer;
        font-weight: 700;
      }
      .btn:hover { border-color:#4a79d8; }
      .btn:disabled { opacity:.55; cursor:not-allowed; }

      .btn.primary {
        background: linear-gradient(180deg, rgba(88,150,255,.35), rgba(88,150,255,.15));
        border-color: rgba(88,150,255,.85);
      }
      .btn.danger {
        background: linear-gradient(180deg, rgba(235,80,80,.25), rgba(235,80,80,.12));
        border-color: rgba(235,80,80,.8);
      }
      .btn.ghost {
        background: transparent;
        border-color: rgba(210, 225, 255, .35);
      }

      .linkbtn {
        background: transparent;
        border: none;
        color: #9fc2ff;
        padding: 0;
        cursor: pointer;
        font-weight: 800;
      }
      .linkbtn:disabled { opacity:.55; cursor:not-allowed; }

      .pill {
        display:inline-flex;
        align-items:center;
        gap:.35rem;
        padding: .25rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.18);
        background: rgba(255,255,255,.06);
        color: #e6f0ff;
        font-size: .9rem;
      }
      .pill-dim { opacity: .75; }

      .scriptWrap { margin-top: 1rem; }
      .scriptPanel {
        margin-top: .75rem;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(210,225,255,.18);
        border-radius: 12px;
        padding: .9rem;
      }
      .scriptTitle { margin: 0 0 .5rem; }
      .scriptLines { display:flex; flex-direction:column; gap:.65rem; }
      .scriptLine { color: #e6f0ff; line-height: 1.45; }
      .scriptLine.active-script-line {
        border-left: 4px solid rgba(110,168,255,.6);
        padding-left: .6rem;
      }
      .speaker { font-weight: 900; color: #cfe0ff; }

      mark.evidence {
        background: rgba(255,214,102,.18);
        border-bottom: 2px solid rgba(255,214,102,.55);
        color: #e6f0ff;
        padding: 0 .1rem;
        border-radius: 2px;
      }

      /* ChipDropdown */
      .chipwrap { display:flex; flex-direction:column; gap:.35rem; }
      .chiplabel { color:#a9b7d1; font-weight: 800; font-size:.85rem; }
      .chipselect {
        background:#101f3f;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 999px;
        padding: .5rem .8rem;
        outline:none;
      }
    `}</style>
  );
}