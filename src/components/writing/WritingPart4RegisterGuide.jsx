import React, { useRef, useState } from "react";
import * as fb from "../../firebase";

/**
 * Writing – Part 4 Guide: Register & Tone (mock-up)
 * - Minimal, self-contained; no Firebase needed
 * - Activities:
 *    1) Formal vs Informal (click-to-classify with feedback)
 *    2) Tone Transformation (rewrite; reveal suggestion)
 *
 * Props:
 *  - onBack(): go back to Part 4 Guide hub
 *  - onStartPractice(): open the live Part 4 Emails tool
 */
export default function WritingPart4RegisterGuide({ onBack, onStartPractice }) {
  const fixRefs = useRef([]);

// --- Activity 2 bank (mix of informal ↔ formal) ---
const TRANSFORM_ITEMS = [
  {
    q: "Rewrite in a formal register:",
    original: "Can you send me the details ASAP?",
    model: "Could you please send me the details at your earliest convenience?",
    why: "Replace ‘ASAP’ with a polite, time-sensitive request. ‘Could you please’ is less direct/more polite.",
  },
  {
    q: "Rewrite in an informal register (friend):",
    original: "I would appreciate it if you could inform me of your availability.",
    model: "Let me know when you’re free!",
    why: "Use direct, friendly phrasing with a contraction.",
  },
  {
    q: "Rewrite in a formal register:",
    original: "I don’t think the fee is a great idea, maybe do a fundraiser instead?",
    model: "I have reservations about introducing a fee; might I suggest a fundraising event as a suitable alternative?",
    why: "Neutral tone + indirect evaluation; polite suggestion ‘might I suggest’.",
  },
  {
    q: "Rewrite in an informal register (friend):",
    original: "I am writing with reference to your message about the trip.",
    model: "About your message re the trip…/Did you see the email about the trip?",
    why: "avoids the very formal standard opening expressing the purpose of a formal email; keep it concise and friendly.",
  },
  {
    q: "Rewrite in a formal register:",
    original: "Hey guys, can you tell me if I can come to the meeting?",
    model: "Dear Committee Members, I would like to know whether I may attend the meeting.",
    why: "Neutral opening + polite indirect question, with more formal use of ‘whether’",
  },
  {
    q: "Rewrite in an informal register (friend):",
    original: "I would be most grateful if you could share your opinion.",
    model: "What do you think?",
    why: "Simple, direct question suits an informal message.",
  },
  {
    q: "Rewrite in a formal register:",
    original: "Nobody signed up, so we should just cancel it.",
    model: "Since no one has registered, I recommend cancelling the event.",
    why: "No one is a little more formal; impersonal tone + measured recommendation. Use of more formal ‘since’ linker to express reason",
  },
  {
  q: "Rewrite in an informal register (friend):",
  original: "I suggest we postpone the meeting until next week.",
  model: "Let’s do it next week instead.",
  why: "Use the contraction 'let’s' and drop formal verbs for a direct, conversational tone.",
},  
{
    q: "Rewrite in a formal register:",
    original: "Why don’t we do it another day?",
    model: "Perhaps we could reschedule for another day./ I recommend postponing the event to a later date",
    why: "Polite, tentative suggestion with ‘perhaps’ and ‘could’.",
  },
  {
    q: "Rewrite in an informal register (friend):",
    original: "I would like to express my appreciation for your help.",
    model: "Thanks so much for your help!",
    why: "Use a direct thank-you and exclamation, ‘!’.",
  },
];

// --- shuffle helper + state ---
function shuffleOnce(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const [transformItems] = useState(() => shuffleOnce(TRANSFORM_ITEMS));

async function saveRegisterAttempt(meta, attempt) {
  if (typeof fb.saveWritingP4RegisterAttempts !== "function") return;
  try {
    await fb.saveWritingP4RegisterAttempts({
      prompt: meta.q,
      original: meta.original,
      model: meta.model,
      attempt: (attempt || "").trim(),
    });
  } catch (e) {
    console.warn("[Guide] saveWritingP4RegisterAttempts failed", e);
  }
}



  return (
    <div className="p4-register game-wrapper">
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Writing – Part 4: Register & Tone</h2>
          <p className="intro">
            In Part 4, you write two emails about the same situation:
            <br />• an <strong>informal email</strong> (≈50 words) to a <strong>friend</strong>
            <br />• a <strong>formal email</strong> (≈120–150 words) to a <strong>club, committee or organisation</strong>.
          </p>
          <p className="intro">
            No fixed timing per email, but most candidates spend about <strong>30 minutes total</strong>
            — roughly <strong>10 minutes</strong> for the informal and <strong>20 minutes</strong> for the formal message.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={onBack}>← Back</button>
          <button className="btn primary" onClick={onStartPractice}>Open Part 4 Practice</button>
        </div>
      </header>

      <div className="single-panel">
        <section className="panel">
          <Section title="What are we practising?">
            <ul className="bullets">
              <li><strong>Choose the right register:</strong> informal (friend) vs formal (organisation).</li>
              <li><strong>Rewrite for tone:</strong> soften/neutralise or make more friendly & direct.</li>
              <li><strong>Use typical phrases:</strong> polite requests, hedging, friendly closings.</li>
            </ul>
          </Section>

          {/* Activity 1 */}
          <Section title="Activity 1: Formal or Informal?">
            <p className="muted" style={{ marginTop: 0 }}>
              Decide if each expression fits a <em>formal</em> email or an <em>informal</em> message. You’ll get a short explanation.
            </p>
            <RegisterQuiz
              items={[
                { phrase: "Would you mind sharing the details of the meeting?", key: "formal", why: "Polite, indirect request with 'would you mind' → formal." },
                { phrase: "Hey, can you send me the link?", key: "informal", why: "Casual greeting ('Hey') + direct 'can you' is informal. Compare 'I would appreciate it if you could send me the link'." },
                { phrase: "I would appreciate it if you could confirm by Friday.", key: "formal", why: "Set phrase for polite requests in formal emails." },
                { phrase: "Sounds good to me!", key: "informal", why: "Informal use of exclamation mark '!' and informal omission of subject 'It'." },
                { phrase: "I have some reservations about the proposal.", key: "formal", why: "Neutral, hedged evaluation suits formal tone." },
                { phrase: "Let me know what you think!", key: "informal", why: "Fixed phrases like 'let me know', and the use of the exclamation '!'." },
                { phrase: "I look forward to hearing from you.", key: "formal", why: "Set phrase in formal writing. Compare in an informal email, '(I'm) looking forward to seeign you'" },
                { phrase: "Speak to you soon!", key: "informal", why: "Informal goodbye; omits the subject and auxiliary verb (I will). This type of omission is typical of informal writing." },
                {
                  phrase: "I think they should refund the full amount, don’t you?",
                  key: "informal",
                  why: "Direct opinion + tag question. Formal: “I believe a full refund would be appropriate.”",
                },
                {
                  phrase: "I think it’s ok.",
                  key: "informal",
                  why: "Very casual, vague evaluation. Formal: “I consider this acceptable.”",
                },
                {
                  phrase: "I’m so disappointed by the news.",
                  key: "informal",
                  why: "Emotive, personal tone (“so disappointed”) + use of contraction 'I'm'.",
                },
                {
                  phrase: "First of all, I would like to show my appreciation for…",
                  key: "formal",
                  why: "Formal linker: 'First of all', and polite use of 'would like' compared to 'want'.",
                },
                {
                  phrase: "I believe the proposed alternative would be satisfactory.",
                  key: "formal",
                  why: "Indirect, impersonal evaluation, without being too strong, with formal vocabulary. Compare: 'I think it's ok.'",
                },
                {
                  phrase: "Nobody signed up for the trip.",
                  key: "informal",
                  why: "Use of infomal phrasal verb. Formal: “No one has registered for the trip.”",
                },
                {
                  phrase: "Why don’t we do it another day?",
                  key: "informal",
                  why: "Direct suggestion phrased as a question, + use of contraction. Formal: “May I suggest...?”",
                },
                {
                  phrase: "Also, I’d like to…",
                  key: "informal",
                  why: "Casual linker (“Also”) + contraction (“I’d”). Formal: “Additionally, I would like to…”.",
                },
                {
                  phrase: "I am writing with reference to your recent email regarding…",
                  key: "formal",
                  why: "Standard formal opener referencing previous correspondence, and indicating the purpose of the email.",
                },
                {
                  phrase: "I would recommend postponing the event…",
                  key: "formal",
                  why: "Polite, measured recommendation → formal. Note use of recommend + gerund.",
                },
                {
                  phrase: "Yours faithfully,",
                  key: "formal",
                  why: "Standard formal sign-off (use when recipient’s name is unknown). Compare the informal 'Best wishes,' or 'Speak soon,'.",
                },
              ]}
            />
          </Section>

          <Section title="Activity 2: Tone Transformation">
        <p className="muted" style={{ marginTop: 0 }}>
          Rewrite the sentence in the <strong>target register</strong>. Press <kbd>Enter</kbd> (or click the button) to reveal a suggestion.
        </p>

        {transformItems.map((it, idx) => (
  <FixOpen
    key={idx}
    ref={(el) => (fixRefs.current[idx] = el)}
    q={it.q}
    original={it.original}
    model={it.model}
    why={it.why}
    onEnterNext={() => fixRefs.current[idx + 1]?.focus()}
    onReveal={(attempt) => saveRegisterAttempt(it, attempt)}
  />
))}
      </Section>

          <Section title="Quick takeaways">
            <ul className="bullets">
              <li><strong>Friend:</strong> direct, friendly; contractions and exclamation points are fine in moderation.</li>
              <li><strong>Organisation:</strong> neutral/impersonal tone, indirect requests, fixed closings.</li>
              <li><strong>Purpose first:</strong> state your view, give reasons, and (in formal emails) offer constructive suggestions.</li>
            </ul>
          </Section>
        </section>
      </div>
    </div>
  );
}

/* ————— Small building blocks ————— */

function Section({ title, children }) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

function RegisterQuiz({ items }) {
  // Shuffle once on mount
  const [shuffled] = useState(() => {
    // shallow copy → Fisher-Yates shuffle
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  return (
    <div className="rq">
      {shuffled.map((it, i) => (
        <RegisterItem key={i} item={it} />
      ))}
    </div>
  );
}

function RegisterItem({ item }) {
  const [choice, setChoice] = useState(null); // "formal" | "informal"
  const [show, setShow] = useState(false);

  function pick(sel) {
    setChoice(sel);
    setShow(true);
  }

  const correct = show && choice === item.key;

  return (
    <div className="rq-item">
      <div className="rq-phrase">“{item.phrase}”</div>
      <div className="rq-actions">
        <button
          className={`opt ${choice === "formal" ? "chosen" : ""}`}
          onClick={() => pick("formal")}
        >
          Formal
        </button>
        <button
          className={`opt ${choice === "informal" ? "chosen" : ""}`}
          onClick={() => pick("informal")}
        >
          Informal
        </button>
      </div>
      {show && (
        <div className="rq-feedback">
          <span className={`result ${correct ? "ok" : "no"}`}>
            {correct ? "✓ Correct" : "✗ Not quite"}
          </span>
          <span className="why"> — {item.why}</span>
        </div>
      )}
    </div>
  );
}

const FixOpen = React.forwardRef(function FixOpen(
  { q, original, model, why, onEnterNext, onReveal }, // 👈 added onReveal here
  ref
) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  const taRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => taRef.current?.focus(),
  }));

  async function reveal() {
    setShow(true);
    console.log("[FixOpen] reveal fired, attempt =", val);
    if (onReveal) onReveal(val); // 👈 triggers save to Firestore
    onEnterNext?.();
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      reveal();
    }
  }

  return (
    <div className="fix open">
      <div className="fix-q"><strong>Task:</strong> {q}</div>
      <div className="bad"><span className="tag bad">Original</span> {original}</div>

      <label className="muted" style={{ display: "block", margin: ".4rem 0 .25rem" }}>
        Your rewritten version:
      </label>
      <textarea
        ref={taRef}
        className="opt ta"
        rows={2}
        placeholder="Type your reformulation… (Press Enter to reveal)"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <div className="actions" style={{ marginTop: ".4rem" }}>
        <button className="btn" onClick={reveal}>
          {show ? "Show again" : "Show suggestion & explanation"}
        </button>
      </div>

      {show && (
        <div className="suggest-panel" style={{ marginTop: ".5rem" }}>
          <div><strong>Suggestion:</strong> {model}</div>
          <div className="muted" style={{ marginTop: ".25rem" }}>
            <strong>Why:</strong> {why}
          </div>
        </div>
      )}
    </div>
  );
});

/* ————— Local styles (matches your theme) ————— */
function StyleScope() {
  return (
    <style>{`
      .p4-register { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; color:var(--ink); }
      .title{margin:0;font-size:1.4rem}
      .intro{margin:.25rem 0 0;color:var(--muted)}
      .actions{display:flex;gap:.5rem;flex-wrap:wrap}
      .btn{background:#24365d;border:1px solid #335086;color:var(--ink);padding:.45rem .7rem;border-radius:10px;cursor:pointer}
      .btn.primary{background:#294b84;border-color:#3a6ebd}

      .single-panel{display:grid}
      .panel{background:var(--panel);border:1px solid #203258;border-radius:16px;padding:1rem;box-shadow:0 6px 18px rgba(0,0,0,.25)}
      .muted{color:var(--muted)}
      .header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;margin-bottom:1rem}

      .section{margin-bottom:1rem}
      .section-title{margin:.1rem 0 .5rem;font-size:1.05rem}
      .bullets{margin:.25rem 0 0 1rem}
      .bullets li{margin:.2rem 0}

      /* Register Quiz */
      .rq{display:grid;gap:.6rem;margin:.4rem 0}
      .rq-item{background:#0f1b31;border:1px solid #2c416f;border-radius:10px;padding:.65rem}
      .rq-phrase{color:#cfe1ff;margin-bottom:.45rem}
      .rq-actions{display:flex;gap:.5rem;flex-wrap:wrap}
      .opt{background:#24365d;border:1px solid #335086;color:#e6f0ff;padding:.35rem .6rem;border-radius:10px;cursor:pointer}
      .opt.chosen{outline:2px solid #3a6ebd}
      .rq-feedback{margin-top:.4rem}
      .result.ok{color:#b9f5c5;font-weight:600}
      .result.no{color:#ffd0d0;font-weight:600}
      .why{color:#e6f0ff;opacity:.95;margin-left:.25rem}

      /* FixOpen */
      .fix{background:#0f1b31;border:1px solid #2c416f;border-radius:10px;padding:.6rem;margin:.6rem 0}
      .fix .fix-q{color:#cfe1ff;margin-bottom:.35rem}
      .fix .bad{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin:.25rem 0 .5rem;color:#ffd0d0}
      .fix .opt.ta{width:100%;background:#13213b;border:1px solid #335086;color:#e6f0ff;border-radius:10px;padding:.5rem .6rem}
      .fix .opt.ta:focus{outline:none;border-color:#4a79d8}

      .tag{border-radius:999px;padding:.15rem .5rem;font-size:.75rem;border:1px solid #335086}
      .tag.bad{background:#2a2031;color:#ffd0d0;border-color:#6e3a4a}
    `}</style>
  );
}
