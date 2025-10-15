import React, { useMemo, useRef, useState } from "react";
import * as fb from "../../firebase";

/**
 * Writing – Part 1 Guide
 * Short, exam-accurate guidance + two tiny practice widgets:
 *  - Trim It: tap words to strike out and make the answer shorter.
 *  - Fix It: choose the best (short) answer from options.
 *
 * Props (all optional):
 *  - onBack(): go back to Writing menu
 *  - onStartPractice(): jump straight into Part 1 task
 */
export default function WritingPart1Guide({ onBack, onStartPractice, user }) {
    // ⬇️ ADD THESE TWO RIGHT HERE (before return)
  const fixRefs = useRef([]);

  async function saveGuideAttempt(meta, attempt) {
    if (typeof fb.saveWritingP1GuideEdits !== "function") return;
    try {
      await fb.saveWritingP1GuideEdits({
        prompt: meta.q,
        original: meta.bad,
        suggestion: meta.model,
        attempt: (attempt || "").trim(),
      });
    } catch (e) {
      console.warn("[Guide] saveWritingP1GuideEdits failed", e);
    }
  }
  return (
    <div className="aptis-writing-p1-guide game-wrapper">
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Writing – Part 1 Guide</h2>
          <p className="intro">
  Part 1 is about <strong>very short, clear answers</strong> to five personal questions.
  1–5 words is perfect. There are <em>no extra points</em> for long sentences.
  In fact, <strong>long sentences often add mistakes and don’t improve your score</strong>.
</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={onBack}>← Back</button>
          <button className="btn primary" onClick={onStartPractice}>Start Part 1</button>
        </div>
      </header>

      <div className="single-panel">
        <section className="panel">
          <Section title="What is Part 1?">
            <ul className="bullets">
              <li>5 short questions about you (e.g. <em>What’s your favourite food?</em>)</li>
              <li>Write very brief answers: <strong>1–5 words</strong>.</li>
              <li>Spelling and clarity matter more than long grammar.</li>
            </ul>
          </Section>

          <Section title="How to answer (examples)">
            <div className="cards">
              <GoodBad
                q="What’s your favourite colour?"
                bad="My favourite colour is the colour blue because I think it is very beautiful."
                good="Blue"
              />
              <GoodBad
                q="Where do you live?"
                bad="I live in a small apartment that is near the city centre with my friend."
                good="Near the city centre"
              />
              <GoodBad
                q="What do you usually have for breakfast?"
                bad="I normally have coffee and sometimes toast when I have time in the morning."
                good="Coffee and toast"
              />
            </div>
          </Section>

          <Section title="Micro-practice: Trim the answer">
            <p className="muted" style={{ marginTop: 0 }}>
              Tap words to <strong>cross out</strong> anything extra. Aim for 1–5 words.
            </p>
            <TrimIt
              prompt="What did you do yesterday?"
              sentence="Yesterday I went to the gym after work with my friend."
              keepHint="(I) Went to the gym"
            />
            <TrimIt
              prompt="How do you get to work?"
              sentence="I usually get to work by car in the morning."
              keepHint="By car"
            />
            <TrimIt
              prompt="What do you do at the weekend?"
              sentence="At the weekend I usually meet my friends and go to the cinema."
              keepHint="Meet (my) friends"
            />
            <TrimIt
              prompt="What time do you go to bed?"
              sentence="I usually go to bed at around eleven o'clock at night."
              keepHint="Around 11 o'clock (11 PM)"
            />
            <TrimIt
              prompt="What do you usually do in the evening?"
              sentence="In the evening I normally watch TV or read a book before going to sleep."
              keepHint="Watch TV or read"
            />
            <TrimIt
              prompt="How do you usually celebrate your birthday?"
              sentence="I usually celebrate my birthday by having dinner with my family at home."
              keepHint="Dinner with my family"
            />
          </Section>
          

          <Section title="Micro-practice: Improve the answer">
  <p className="muted" style={{ marginTop: 0 }}>
    The following answers contain typical mistakes in Part 1 questions — 
    either with grammar or meaning. Try to <strong>improve them</strong> and 
    then compare with our <strong>suggested answers</strong>.
  </p>

  <FixOpen
    ref={el => (fixRefs.current[0] = el)}
    q="What time do you get up?"
    bad="It's depends of the day."
    model="It depends on the day."
    explanation="Use “It depends on …”, not “It’s depends of …”. A simpler answer would be 'at 7 o'clock' or similar."
    onEnterNext={() => fixRefs.current[1]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "What time do you get up?",
          bad: "It's depends of the day.",
          model: "It depends on the day.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[1] = el)}
    q="What did you do at the weekend?"
    bad="I will go to a bar."
    model="(I) Went to a bar."
    explanation="Question is past → answer in past. Keep it short: In informal English 'I? can be omitted here."
    onEnterNext={() => fixRefs.current[2]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "What did you do at the weekend?",
          bad: "I will go to a bar.",
          model: "(I) Went to a bar.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[2] = el)}
    q="What’s the weather like today?"
    bad="Today is sunny day."
    model="(It’s a) sunny (day)."
    explanation="Original answer is missing the subject 'it' and article 'a'. But 'sunny' alone is enough."
    onEnterNext={() => fixRefs.current[3]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "What’s the weather like today?",
          bad: "Today is sunny day.",
          model: "(It’s a) sunny (day).",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[3] = el)}
    q="How do you travel around your city?"
    bad="In car."
    model="By car."
    explanation="Transport uses “by”: by bus / by car / by train. Except: on foot.!"
    onEnterNext={() => fixRefs.current[4]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "How do you travel around your city?",
          bad: "In car.",
          model: "By car.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[4] = el)}
    q="Where do you work or study?"
    bad="I study cinema."
    model="at the university of Salamanca."
    explanation="'I study cinema' answers the question 'what do you do?' not 'where'."
    onEnterNext={() => fixRefs.current[5]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "Where do you work or study?",
          bad: "I study cinema.",
          model: "at the university of Salamanca.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[5] = el)}
    q="Where were you born?"
    bad="I born in Cuba."
    model="(I was born in) Cuba."
    explanation="Use 'be born' in English. born is an adjective, not a verb. Writing 'Cuba' is enough."
    onEnterNext={() => fixRefs.current[6]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "Where were you born?",
          bad: "I born in Cuba.",
          model: "(I was born in) Cuba.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[6] = el)}
    q="What do you do?"
    bad="Work."
    model="I’m a teacher."
    explanation="'Work' is not specific enough for this question. Say your job or occupation."
    onEnterNext={() => fixRefs.current[7]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "What do you do?",
          bad: "Work.",
          model: "I’m a teacher.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[7] = el)}
    q="What do you do?"
    bad="Student."
    model="I’m a student/I study."
    explanation="'Student alone' is not a full answer. Add 'I am' or 'I study' to make it complete."
    onEnterNext={() => fixRefs.current[8]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "What do you do?",
          bad: "Student.",
          model: "I’m a student/I study.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[8] = el)}
    q="What do you do?"
    bad="I'm mechanical engineer."
    model="(I’m) a mechanical engineer."
    explanation="Add the article ‘a’ before a singular job title."
    onEnterNext={() => fixRefs.current[9]?.focus()}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "What do you do?",
          bad: "I'm mechanical engineer.",
          model: "(I’m) a mechanical engineer.",
        },
        attempt
      )
    }
  />

  <FixOpen
    ref={el => (fixRefs.current[9] = el)}
    q="What’s the weather like today?"
    bad="Sun."
    model="Sunny."
    explanation="Use the adjective ‘sunny’ instead of the noun ‘sun’ when describing weather."
    onEnterNext={() => {}}
    onReveal={(attempt) =>
      saveGuideAttempt(
        {
          q: "What’s the weather like today?",
          bad: "Sun.",
          model: "Sunny.",
        },
        attempt
      )
    }
  />
</Section>


          <Section title="Quick tips">
            <ul className="bullets">
              <li>Answer the question directly: <em>Who?</em> <em>What?</em> <em>Where?</em> <em>How often?</em></li>
              <li>Use nouns, short noun phrases, or very short verb phrases.</li>
              <li>Capitalize proper nouns: <em>London, Netflix</em>.</li>
              <li>Spell carefully; keep punctuation simple.</li>
            </ul>
          </Section>
        </section>
      </div>
    </div>
  );
}

/* ---------- Small pieces ---------- */

function Section({ title, children }) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

function GoodBad({ q, good, bad }) {
  return (
    <div className="gb">
      <div className="gb-q">{q}</div>
      <div className="gb-row">
        <span className="tag bad">Too long</span>
        <span className="gb-text">{bad}</span>
      </div>
      <div className="gb-row">
        <span className="tag good">Better</span>
        <span className="gb-text strong">{good}</span>
      </div>
    </div>
  );
}

function TrimIt({ prompt, sentence, keepHint }) {
    const words = useMemo(() => sentence.split(/(\s+)/), [sentence]); // keep spaces for nicer layout
    const [off, setOff] = useState(new Set()); // indices of crossed words (skip spaces)
    const [showHint, setShowHint] = useState(false); // ← NEW: hide hint until revealed
  
    function toggle(i) {
      if (words[i].trim() === "") return; // ignore space tokens
      const next = new Set(off);
      next.has(i) ? next.delete(i) : next.add(i);
      setOff(next);
    }
  
    function reset() {
      setOff(new Set());
      setShowHint(false); // optional: also hide the hint on reset
    }
  
    const compact = words
      .map((w, i) => (off.has(i) ? "" : w))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  
    return (
      <div className="trim-box">
        <div className="trim-q"><strong>Q:</strong> {prompt}</div>
  
        <div className="trim-sentence">
          {words.map((w, i) =>
            w.trim() === "" ? (
              <span key={i} className="sp">{w}</span>
            ) : (
              <button
                key={i}
                type="button"
                className={`wbtn ${off.has(i) ? "off" : ""}`}
                onClick={() => toggle(i)}
                aria-pressed={off.has(i)}
                title="Toggle"
              >
                {w}
              </button>
            )
          )}
        </div>
  
        <div className="trim-output">
          <span className="muted">Short answer:</span>{" "}
          <span className="ans">{compact || "…"}</span>
        </div>
  
        {/* Actions: Reset + Show/Hide suggestion */}
        <div style={{ display: "flex", gap: ".5rem", marginTop: ".45rem", flexWrap: "wrap" }}>
          <button className="btn" type="button" onClick={reset}>Reset</button>
          <button
            className="btn"
            type="button"
            onClick={() => setShowHint(s => !s)}
            aria-expanded={showHint}
          >
            {showHint ? "Hide suggestion" : "Show suggestion"}
          </button>
        </div>
  
        {/* Only show hint if user asks */}
        {showHint && keepHint && (
          <div className="muted hint" style={{ marginTop: ".35rem" }}>
            Suggested (short & natural): <em>{keepHint}</em>
          </div>
        )}
      </div>
    );
  }
  

  // Drop-in replacement for FixOpen
const FixOpen = React.forwardRef(function FixOpen(
    { q, bad, model, explanation, onEnterNext, onReveal },
    ref
  ) {
    const [val, setVal] = useState("");
    const [show, setShow] = useState(false);
    const taRef = useRef(null);
  
    // expose focus() so parent can focus the next item
    React.useImperativeHandle(ref, () => ({
      focus: () => taRef.current?.focus(),
    }));
  

      function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          (async () => {
            try {
              // Save to Firestore via your provided callback
              await onReveal?.(val);     // <- this should call saveGuideAttempt(...)
              setShow(true);             // reveal suggestion/explanation
              onEnterNext?.();           // focus the next box
            } catch (err) {
              console.error("[FixOpen] save on Enter failed:", err);
            }
          })();
        }
      }
      
  
    return (
      <div className="fix open">
        <div className="fix-q"><strong>Q:</strong> {q}</div>
        <div className="bad"><span className="tag bad">Original</span> {bad}</div>
  
        <label className="muted" style={{ display: "block", margin: ".4rem 0 .25rem" }}>
          Your improved (short) answer:
        </label>
        <textarea
          ref={taRef}
          className="opt ta"
          rows={2}
          placeholder="Type a short answer (1–5 words)…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
  
        <div className="actions" style={{ marginTop: ".4rem" }}>
          <button
            className="btn"
            onClick={async () => {
              if (!show) await onReveal?.(val);
              setShow((s) => !s);
            }}
          >
            {show ? "Hide suggestion" : "Show suggestion & explanation"}
          </button>
        </div>
  
        {show && (
          <div className="suggest-panel" style={{ marginTop: ".5rem" }}>
            <div><strong>Suggestion:</strong> {model}</div>
            <div className="muted" style={{ marginTop: ".25rem" }}>
              <strong>Why:</strong> {explanation}
            </div>
          </div>
        )}
      </div>
    );
  });
  
  
  

/* ---------- Local styles (match your theme) ---------- */
function StyleScope() {
  return (
    <style>{`
      .aptis-writing-p1-guide { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .title{margin:0;font-size:1.4rem;color:var(--ink)}
      .intro{margin:.25rem 0 0;color:var(--muted)}
      .actions{display:flex;gap:.5rem;flex-wrap:wrap}
      .btn{background:#24365d;border:1px solid #335086;color:var(--ink);padding:.45rem .7rem;border-radius:10px;cursor:pointer}
      .btn.primary{background:#294b84;border-color:#3a6ebd}

      .grid{display:grid;gap:1rem;grid-template-columns:1fr}
      @media(min-width:960px){ .grid{grid-template-columns:1.2fr .8fr} }
      .panel{background:var(--panel);border:1px solid #203258;border-radius:16px;padding:1rem;box-shadow:0 6px 18px rgba(0,0,0,.25)}
      .muted{color:var(--muted)}
      .header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;margin-bottom:1rem}

      .section{margin-bottom:1rem}
      .section-title{margin:.1rem 0 .5rem;font-size:1.05rem}
      .bullets{margin:.25rem 0 0 1rem}
      .bullets li{margin:.2rem 0}

      /* Good/Bad cards */
      .cards{display:grid;gap:.6rem}
      .gb{background:#0f1b31;border:1px solid #2c416f;border-radius:10px;padding:.6rem}
      .gb-q{color:#cfe1ff;margin-bottom:.35rem}
      .gb-row{display:flex;gap:.5rem;align-items:flex-start;margin:.2rem 0}
      .tag{border-radius:999px;padding:.15rem .5rem;font-size:.75rem;border:1px solid #335086}
      .tag.bad{background:#2a2031;color:#ffd0d0;border-color:#6e3a4a}
      .tag.good{background:#203226;color:#caffd1;border-color:#3a6e4f}
      .gb-text{flex:1}
      .gb-text.strong{font-weight:600}

      /* Trim It */
      .trim-box{background:#0f1b31;border:1px solid #2c416f;border-radius:10px;padding:.6rem;margin:.5rem 0}
      .trim-q{color:#cfe1ff;margin-bottom:.35rem}
      .trim-sentence{display:flex;flex-wrap:wrap;gap:.25rem}
      .wbtn{background:#24365d;border:1px solid #335086;color:#e6f0ff;padding:.15rem .4rem;border-radius:8px;cursor:pointer}
      .wbtn.off{opacity:.45;text-decoration:line-through}
      .trim-output{margin-top:.45rem}
      .trim-output .ans{color:#e6f0ff;font-weight:600}
      .hint{margin-top:.3rem;font-size:.9rem}

      /* Fix It */
      .fix{background:#0f1b31;border:1px solid #2c416f;border-radius:10px;padding:.6rem;margin:.5rem 0}
      .fix-q{color:#cfe1ff;margin-bottom:.35rem}
      .fix-options{display:grid;gap:.35rem}
      .opt{background:#24365d;border:1px solid #335086;color:#e6f0ff;padding:.4rem .55rem;border-radius:10px;text-align:left;cursor:pointer}
      .opt.chosen{outline:2px solid #3a6ebd}
      .fix-result{margin-top:.4rem;font-weight:600}
      .fix-result.ok{color:#b9f5c5}
      .fix-result.no{color:#ffd0d0}

      /* Aside */
      .aside-title{margin:.1rem 0 .4rem}
      .aside-sub{margin:.5rem 0 .25rem}
      .patterns{margin:.25rem 0 0 .9rem}
      .patterns li{margin:.2rem 0}
      .eg{opacity:.9}
      .divider{height:1px;background:#25406f;margin:.8rem 0;border-radius:999px}
      /* FixOpen (open answer improver) */
.fixopen{background:#0f1b31;border:1px solid #2c416f;border-radius:10px;padding:.6rem;margin:.6rem 0}
.fixopen-q{color:#cfe1ff;margin-bottom:.35rem}
.fixopen-bad{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin:.25rem 0 .5rem}
.fixopen-text{color:#ffd0d0}
.tag.warn{background:#2a2031;color:#ffd0d0;border:1px solid #6e3a4a;border-radius:999px;padding:.12rem .45rem;font-size:.75rem}
.tag.good{background:#203226;color:#caffd1;border:1px solid #3a6e4f;border-radius:999px;padding:.12rem .45rem;font-size:.75rem}
.fixopen-label{display:block;margin:.25rem 0 .25rem;color:#cfe1ff}
.fixopen-input{width:100%;background:#13213b;border:1px solid #335086;color:#e6f0ff;border-radius:10px;padding:.5rem .6rem}
.fixopen-input:focus{outline:none;border-color:#4a79d8}
.fixopen-suggest{margin-top:.6rem;background:#101c33;border:1px solid #2a4a80;border-radius:10px;padding:.55rem}
.fixopen-suggest .row{display:flex;gap:.45rem;align-items:center;margin-bottom:.25rem}
.fixopen-suggest .model{font-weight:700;color:#e6f0ff}
.fixopen-suggest .explain{color:#cfe1ff;opacity:.95}
.hint{color:#a9b7d1}
/* quick aliases so .fix.open uses the same look */
.fix.open { background:#0f1b31; border:1px solid #2c416f; border-radius:10px; padding:.6rem; margin:.6rem 0; }
.fix .fix-q { color:#cfe1ff; margin-bottom:.35rem; }
.fix .bad { display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; margin:.25rem 0 .5rem; color:#ffd0d0; }
.fix .opt.ta { width:100%; background:#13213b; border:1px solid #335086; color:#e6f0ff; border-radius:10px; padding:.5rem .6rem; }
.fix .opt.ta:focus { outline:none; border-color:#4a79d8; }

    `}</style>
  );
}
