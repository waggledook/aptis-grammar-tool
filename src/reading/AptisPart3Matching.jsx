// src/reading/AptisPart3Matching.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { saveReadingCompletion, fetchReadingCompletions } from "../firebase";
import { toast } from "../utils/toast";

// ---------- Demo dataset ----------
const DEMO_TASKS = [
    {
      id: "remote-work",
      title: "Remote Work and Office Life",
      comments: [
        {
          name: "Emma",
          text:
            "When I first started working remotely, I thought it would be easy. But while in an office, you have natural routines and a sense of accountability to others, at home, it’s easy to faff about. On the positive side, I can organise my day around my children, and that flexibility is priceless. Still, I think younger workers miss out on learning from more experienced colleagues when they’re isolated at home. There’s so much you absorb just by being around people in a professional environment.",
        },
        {
          name: "Ryan",
          text:
            "Remote work is here to stay, and that’s a good thing. For years, employers assumed people couldn’t be trusted to carry out their duties without supervision, but that’s nonsense. Most people are more focused when they’re comfortable. Personally, I’ve gained back hours every week by cutting out the commute. Companies benefit too; less need for expensive office space. As long as the targets are met, who cares where the work is done? The world is moving forward, and managers need to stop thinking like it’s still 1995.",
        },
        {
          name: "Leo",
          text:
            "I can’t stand working from home. I never feel like I can log off properly and when I leave the office, I want to forget about it all. Something I can’t do when my computer is in the next room. I also miss the energy of being surrounded by people. Online meetings feel awkward and artificial, and they rarely spark creativity. I understand why some people enjoy the flexibility, and while most of us can be relied on to work well on our own, without supervision, surely many will abuse the freedom to do their own thing, won’t they?",
        },
        {
          name: "Sofia",
          text:
            "I’ve been homeworking for a couple of years now, and though not travelling to work on the busy trains is awesome, I like having a few days in the office to collaborate face to face as well: It's definitely less isolating when you can just pop over to the next desk to check up on a colleague. What worries me is that remote workers are often overlooked for promotions- out of sight, out of mind. Employers need to make sure opportunities are equal for everyone. Still, in terms of productivity, it really depends on you, you know?  Some are lazier at home, but others find it easier to focus.",
        },
      ],
      questions: [
        {
            id: 1,
            text: "Who says working remotely makes it difficult to disconnect from work?",
            answer: "Leo",
            evidenceParts: [
              "I never feel like I can log off properly",
              "when my computer is in the next room"
            ],
            explanation:
              "Log off=disconnect from a website/app. I this case Leo is using it to mean disconnect from work.",
          },
        {
          id: 2,
          text: "Who thinks some workers have an unfair advantage due to visibility?",
          answer: "Sofia",
          evidence:
            "remote workers are often overlooked for promotions- out of sight, out of mind.",
          explanation:
            "out of sight: not seen. So remote workers are not considered for better positions (overlooked=not considered).",
        },
        {
          id: 3,
          text: "Who believes that employees can be counted on to work independently?",
          answer: "Ryan",
          evidence:
            "employers assumed people couldn’t be trusted to carry out their duties without supervision, but that’s nonsense.",
          explanation:
            "counted on= relied on. So similar to 'trusted'. 'Without supervision' means independently. Ryan says that's it's nonsense to think employees can't work independently.",
        },
        {
          id: 4,
          text: "Who says remote work can make people less productive?",
          answer: "Emma",
          evidence:
            "at home, it’s easy to faff about.",
          explanation:
            "Emma says that without the structure of the office, we 'faff about': British informal phrasal verb for waste time or be unproductive. Sofia also mentions productivity, but she says it depends on the person.",
        },
        {
          id: 5,
          text: "Who appreciates the time saved by not travelling to work?",
          answer: "Ryan",
          evidence:
            "I’ve gained back hours every week by cutting out the commute.",
          explanation:
            "'commute' means travel to/from work. Ryan cuts this out: he removes it from his routine and saves time. Sofia mentions 'not travelling to work' but doesn't specifically say she saves time.",
        },
        {
          id: 6,
          text: "Who worries that home workers lose opportunities for informal learning?",
          answer: "Emma",
          evidence:
            "younger workers miss out on learning from more experienced colleagues when they’re isolated at home.",
          explanation:
            "'miss out on' = lose opportunities to experience something. Learning from experienced colleagues=informal learning.",
        },
        {
          id: 7,
          text: "Who says the best option is combining office and home work?",
          answer: "Sofia",
          evidence:
            "I like having a few days in the office to collaborate face to face as well",
          explanation:
            "Sofia likes working from home but at the office 'as well'. She describes several benefits.",
        },
      ],
    },
  ];
  

// ---------- Component ----------
export default function AptisPart3Matching({ tasks = DEMO_TASKS, user, onRequireSignIn }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [completed, setCompleted] = useState(new Set());
  const [whyOpen, setWhyOpen] = useState(null);
  const commentRefs = useRef({});
  const current = tasks[taskIndex];

  

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return setCompleted(new Set());
      const done = await fetchReadingCompletions();
      if (alive) setCompleted(done);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // 🔹 NEW SCROLL EFFECT — paste here
useEffect(() => {
    if (!whyOpen) return;
  
    // which question is open?
    const q = current.questions.find((qq) => qq.id === whyOpen);
    if (!q) return;
  
    const who = q.answer; // e.g. "Leo"
    const node = commentRefs.current[who]?.current;
    if (node) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [whyOpen, current]);

  const names = useMemo(() => current.comments.map((c) => c.name), [current]);

  function handleChange(qid, val) {
    setAnswers((p) => ({ ...p, [qid]: val }));
    setFeedback((p) => ({ ...p, [qid]: null }));
    // if they change an answer, hide any open explanation for that question
    if (whyOpen === qid) setWhyOpen(null);
  }

  function handleCheck() {
    const fb = {};
    current.questions.forEach((q) => {
      const given = answers[q.id];
      fb[q.id] = given ? given === q.answer : null;
    });
    setFeedback(fb);

    const allCorrect = Object.values(fb).every((v) => v === true);
    if (allCorrect && user) {
      saveReadingCompletion(current.id);
      setCompleted((p) => new Set(p).add(current.id));
      toast("Task marked as completed ✓");
    }
  }

  function handleShowAnswers() {
    const fb = {};
    const ans = {};
    current.questions.forEach((q) => {
      fb[q.id] = true;
      ans[q.id] = q.answer;
    });
    setAnswers(ans);
    setFeedback(fb);
    setWhyOpen(null); // close explanations so they can open them one by one
  }

  function handleReset() {
    setAnswers({});
    setFeedback({});
    setWhyOpen(null);
  }

 // helper: get highlighted version of a comment's text if it's the open explanation
 function renderCommentTextWithHighlight(commentName) {
    if (!whyOpen) return null;
  
    const q = current.questions.find((qq) => qq.id === whyOpen);
    if (!q) return null;
    if (q.answer !== commentName) return null;
  
    const fullText =
      current.comments.find((c) => c.name === commentName)?.text || "";
  
    // normalise to an array: ["part1", "part2", ...]
    const parts = Array.isArray(q.evidenceParts)
      ? q.evidenceParts
      : q.evidence
      ? [q.evidence]
      : [];
  
    if (parts.length === 0) {
      return <p>{fullText}</p>;
    }
  
    // We'll build a regex that matches any of the parts, case-insensitive.
    // We need to escape regex characters in the parts.
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
    const regex = new RegExp(
      "(" + parts.map(p => escapeRegex(p.trim())).join("|") + ")",
      "gi"
    );
  
    // Split the text on those matches, keeping the matches
    const segments = fullText.split(regex);
  
    return (
      <p>
        {segments.map((seg, i) => {
          // If this segment matches any part (case-insensitive), highlight it.
          const matchIndex = parts.findIndex(p =>
            seg.toLowerCase() === p.trim().toLowerCase()
          );
          if (matchIndex !== -1) {
            return (
              <mark key={i} className="evidence">
                {seg}
              </mark>
            );
          }
          return <React.Fragment key={i}>{seg}</React.Fragment>;
        })}
      </p>
    );
  }  

  return (
    <div className="aptis-matching game-wrapper">
      <StyleScope />
      <header className="header">
        <h2 className="title">Reading – Part 3 (Matching Opinions)</h2>
        <p className="intro"><em>{current.title}</em></p>
      </header>

      {/* ---------- Comments section ---------- */}
      <section className="comments">
  <h3>Comments</h3>

  {current.comments.map((c, i) => {
    const isActive =
      whyOpen &&
      current.questions.find((q) => q.id === whyOpen)?.answer === c.name;

    // ensure there's a ref for this name
    if (!commentRefs.current[c.name]) {
      commentRefs.current[c.name] = React.createRef();
    }

    return (
      <div
        key={i}
        ref={commentRefs.current[c.name]}
        className={`comment ${isActive ? "active-speaker" : ""}`}
      >
        <strong>{c.name}</strong>

        {isActive
          ? renderCommentTextWithHighlight(c.name)
          : <p>{c.text}</p>}
      </div>
    );
  })}
</section>


      {/* ---------- Questions section ---------- */}
      <section className="questions-section">
        <h3>Questions</h3>

        <ol className="questions">
          {current.questions.map((q) => {
            const fb = feedback[q.id];
            const cls = fb === true ? "ok" : fb === false ? "bad" : "";

            const canExplain = fb !== null && fb !== undefined; // means they've hit Check (or Show answers)
            const isOpen = whyOpen === q.id;

            return (
              <li key={q.id} className={cls}>
                <div className="q-row">
                  <span className="qtext">{q.text}</span>

                  <select
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  >
                    <option value="">—</option>
                    {names.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="why-btn"
                    disabled={!canExplain}
                    onClick={() => {
                      setWhyOpen((cur) => (cur === q.id ? null : q.id));
                    }}
                    title={canExplain ? "Show explanation" : "Check first"}
                  >
                    Why?
                  </button>
                </div>

                {isOpen && (
                  <div className="why-box">
                    <div className="why-answer">
                      <strong>Answer: {q.answer}</strong>
                    </div>
                    <div className="why-evidence">
  <span className="label">Evidence:</span>{" "}
  <em>
    {Array.isArray(q.evidenceParts)
      ? q.evidenceParts.join(" … ")
      : q.evidence}
  </em>
</div>
                    <div className="why-explain">
                      <span className="label">Explanation:</span>{" "}
                      {q.explanation}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

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
      </section>
    </div>
  );
}

// ---------- Styles ----------
function StyleScope() {
  return (
    <style>{`
        .aptis-matching {
          --bg:#0e1a2f;
          --panel:#13213b;
          --ink:#e6f0ff;
          --muted:#a9b7d1;
          --ok:#2fb67c;
          --bad:#e46c6c;
          --accent:#6ea8ff;
          --evidence-bg:rgba(255,214,102,.2);
          --evidence-border:rgba(255,214,102,.6);
          color:var(--ink);
        }
  
        .aptis-matching .header { margin-bottom:1rem; }
        .aptis-matching .title { margin:0; font-size:1.4rem; }
        .aptis-matching .intro { color:var(--muted); margin-top:.2rem; }
  
        /* COMMENTS */
        .aptis-matching .comment {
  margin-bottom:1rem;
  border:1px solid transparent;
  border-radius:10px;
  padding:.5rem .6rem;
  transition: box-shadow .18s ease, background .18s ease, border-color .18s ease;
}
        .aptis-matching .comments h3 {
          margin-top:0;
          color:var(--ok);
          font-size:1.1rem;
        }
        .aptis-matching .comment {
          margin-bottom:1rem;
          border:1px solid transparent;
          border-radius:10px;
          padding:.5rem .6rem;
        }
        .aptis-matching .comment.active-speaker {
  border-color:#37598e;
  background:#0f1b31;
  box-shadow:0 0 0 2px rgba(110,168,255,.3), 0 8px 24px rgba(0,0,0,.6);
}
        .aptis-matching .comment strong {
          color:var(--ok);
          display:block;
          margin-bottom:.25rem;
        }
  
        .aptis-matching mark.evidence {
          background:var(--evidence-bg);
          border-bottom:2px solid var(--evidence-border);
          color:var(--ink);
          padding:0 .1rem;
          border-radius:2px;
        }
  
        /* QUESTIONS */
        .aptis-matching .questions-section {
          background:var(--panel);
          border-radius:16px;
          padding:1rem;
        }
        .aptis-matching .questions-section h3 {
          margin-top:0;
          color:var(--accent);
          font-size:1.1rem;
        }
  
        .aptis-matching .questions {
          list-style:decimal;
          padding-left:1.2rem;
          display:flex;
          flex-direction:column;
          gap:.9rem;
        }
  
        .aptis-matching .q-row {
          display:flex;
          flex-wrap:wrap;
          gap:.5rem .6rem;
          align-items:flex-start;
        }
  
        .aptis-matching .qtext {
          flex:1 1 14rem;
        }
  
        .aptis-matching select {
          background:#24365d;
          color:var(--ink);
          border-radius:8px;
          border:1px solid #37598e;
          padding:.3rem .4rem;
        }
  
        .aptis-matching .why-btn {
          background:#24365d;
          border:1px solid #37598e;
          color:var(--accent);
          font-weight:600;
          border-radius:8px;
          padding:.3rem .5rem;
          line-height:1.2;
          cursor:pointer;
        }
        .aptis-matching .why-btn:disabled {
          opacity:.4;
          cursor:not-allowed;
        }
  
        .aptis-matching li.ok { color:var(--ok); }
        .aptis-matching li.bad { color:var(--bad); }
  
        .aptis-matching .why-box {
          background:#0f1b31;
          border:1px solid #37598e;
          border-radius:10px;
          padding:.6rem .7rem;
          margin-top:.5rem;
          font-size:.9rem;
          line-height:1.4;
        }
  
        .aptis-matching .why-answer {
          font-weight:600;
          margin-bottom:.4rem;
          color:var(--ink);
        }
  
        .aptis-matching .why-evidence {
          margin-bottom:.4rem;
          color:var(--ink);
        }
  
        .aptis-matching .why-explain {
          color:var(--muted);
        }
  
        .aptis-matching .why-box .label {
          color:var(--accent);
          font-weight:600;
        }
  
        .aptis-matching .controls {
          margin-top:1rem;
          display:flex;
          gap:.5rem;
          flex-wrap:wrap;
        }
  
        .aptis-matching .btn {
          background:#24365d;
          border:1px solid #335086;
          color:var(--ink);
          padding:.45rem .7rem;
          border-radius:10px;
          cursor:pointer;
        }
        .aptis-matching .btn.primary {
          background:#294b84;
          border-color:#3a6ebd;
        }
        .aptis-matching .btn.ghost {
          background:transparent;
          border-color:#37598e;
        }
      `}</style>
    );
}
