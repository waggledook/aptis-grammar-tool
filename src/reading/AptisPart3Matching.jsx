// src/reading/AptisPart3Matching.jsx
import React, { useState, useEffect } from "react";
import { saveReadingCompletion, fetchReadingCompletions } from "../firebase";
import { toast } from "../utils/toast";

// ---------- Demo dataset ----------
const DEMO_TASKS = [
  {
    id: "remote-work",
    title: "Remote Work and Office Life",
    comments: [
      { name: "Emma", text: "When I first started working remotely, I thought it would be easy. But I soon realised that being productive at home requires self-discipline. In an office, you have natural routines and a sense of accountability to others. At home, it’s easy to get distracted. On the positive side, I can organise my day around my children, and that flexibility is priceless. Still, I think younger workers miss out on learning from more experienced colleagues when they’re isolated at home. There’s so much you absorb just by being around people in a professional environment." },
      { name: "Ryan", text: "Remote work is here to stay, and that’s a good thing. For years, employers assumed people couldn’t be trusted to work without supervision, but that’s nonsense. Most people are more focused when they’re comfortable. Personally, I’ve saved hours every week by cutting out the commute. Companies benefit too; less need for expensive office space. As long as the targets are met, who cares where the work is done? The world is moving forward, and managers need to stop thinking like it’s still 1995." },
      { name: "Leo", text: "I can’t stand working from home. It blurs the line between my job and personal life. When I leave the office, I want to forget about it all. Something I can’t do when my computer is in the next room. I also miss the energy of being surrounded by people. Online meetings feel awkward and artificial, and they rarely spark creativity. I understand why some people enjoy the flexibility, and while most of us can be relied on to work well on our own, without supervision, surely many will abuse the freedom to do their own thing, won’t they?" },
      { name: "Sofia", text: "I’ve been homeworking for a couple of years now, and though not getting in the busy trains is awesome, I like having a few days in the office to collaborate face to face. But I also value quiet time at home to concentrate. What worries me is that remote workers are often overlooked for promotions- out of sight, out of mind. Employers need to make sure opportunities are equal for everyone. Still, in terms of productivity, it really depends on you, you know?  Some are lazier at home, but others find it easier to focus." },
    ],
    questions: [
      { id: 1, text: "Who says working remotely makes it difficult to switch off from work?", answer: "Leo" },
      { id: 2, text: "Who thinks some workers have an unfair advantage due to visibility?", answer: "Sofia" },
      { id: 3, text: "Who believes that employees can be counted on to work independently?", answer: "Ryan" },
      { id: 4, text: "Who says remote work can make people less productive?", answer: "Emma" },
      { id: 5, text: "Who appreciates the time saved by not travelling to work?", answer: "Ryan" },
      { id: 6, text: "Who worries that home workers lose opportunities for informal learning?", answer: "Emma" },
      { id: 7, text: "Who says the best option is combining office and home work?", answer: "Sofia" },
    ],
  },
];

// ---------- Component ----------
export default function AptisPart3Matching({ tasks = DEMO_TASKS, user, onRequireSignIn }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [completed, setCompleted] = useState(new Set());
  const current = tasks[taskIndex];

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return setCompleted(new Set());
      const done = await fetchReadingCompletions();
      if (alive) setCompleted(done);
    })();
    return () => (alive = false);
  }, [user]);

  const names = current.comments.map((c) => c.name);

  function handleChange(qid, val) {
    setAnswers((p) => ({ ...p, [qid]: val }));
    setFeedback((p) => ({ ...p, [qid]: null }));
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
  }

  function handleReset() {
    setAnswers({});
    setFeedback({});
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
        {current.comments.map((c, i) => (
          <div key={i} className="comment">
            <strong>{c.name}</strong>
            <p>{c.text}</p>
          </div>
        ))}
      </section>

      {/* ---------- Questions section ---------- */}
      <section className="questions-section">
        <h3>Questions</h3>
        <ol className="questions">
          {current.questions.map((q) => {
            const fb = feedback[q.id];
            const cls = fb === true ? "ok" : fb === false ? "bad" : "";
            return (
              <li key={q.id} className={cls}>
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
              </li>
            );
          })}
        </ol>

        <div className="controls">
          <button className="btn" onClick={handleReset}>Reset</button>
          <button className="btn primary" onClick={handleCheck}>Check</button>
          <button className="btn ghost" onClick={handleShowAnswers}>Show answers</button>
        </div>
      </section>
    </div>
  );
}

// ---------- Styles ----------
function StyleScope() {
  return (
    <style>{`
      .aptis-matching { --bg:#0e1a2f; --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; --ok:#2fb67c; --bad:#e46c6c; color:var(--ink); }
      .aptis-matching .header { margin-bottom:1rem; }
      .aptis-matching .title { margin:0; font-size:1.4rem; }
      .aptis-matching .intro { color:var(--muted); margin-top:.2rem; }

      /* COMMENTS */
      .aptis-matching .comments { background:var(--panel); border-radius:16px; padding:1rem; margin-bottom:1.5rem; }
      .aptis-matching .comments h3 { margin-top:0; color:var(--ok); font-size:1.1rem; }
      .aptis-matching .comment { margin-bottom:1rem; }
      .aptis-matching .comment strong { color:var(--ok); display:block; margin-bottom:.25rem; }

      /* QUESTIONS */
      .aptis-matching .questions-section { background:var(--panel); border-radius:16px; padding:1rem; }
      .aptis-matching .questions-section h3 { margin-top:0; color:#6ea8ff; font-size:1.1rem; }

      .aptis-matching .questions { list-style:decimal; padding-left:1.2rem; display:flex; flex-direction:column; gap:.7rem; }
      .aptis-matching select { margin-left:.5rem; background:#24365d; color:var(--ink); border-radius:8px; border:1px solid #37598e; padding:.3rem .4rem; }
      .aptis-matching li.ok { color:var(--ok); }
      .aptis-matching li.bad { color:var(--bad); }

      .aptis-matching .controls { margin-top:1rem; display:flex; gap:.5rem; flex-wrap:wrap; }
      .aptis-matching .btn { background:#24365d; border:1px solid #335086; color:var(--ink); padding:.45rem .7rem; border-radius:10px; cursor:pointer; }
      .aptis-matching .btn.primary { background:#294b84; border-color:#3a6ebd; }
      .aptis-matching .btn.ghost { background:transparent; border-color:#37598e; }
    `}</style>
  );
}
