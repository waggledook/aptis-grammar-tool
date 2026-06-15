import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  fetchReadingCompletionsByPart,
  logReadingPart1Attempted,
  logReadingPart1Completed,
} from "../firebase";
import { getSitePath } from "../siteConfig.js";
import { toast } from "../utils/toast";
import ReadingAssignButton from "./ReadingAssignButton.jsx";
import ReadingDemoNotice from "./ReadingDemoNotice.jsx";

const READING_PART1_TASKS = [
  {
    id: "cinema-plan",
    title: "Cinema plan",
    prompt:
      "Read the email from Anna to her friend. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "Best,",
    sender: "Anna",
    lines: [
      [{ text: "Hi Tom," }],
      [
        { text: "Do you want to " },
        { gap: 0 },
        { text: " to the cinema with us tonight?" },
      ],
      [{ text: "The film starts " }, { gap: 1 }, { text: " 7:15." }],
      [{ text: "I can " }, { gap: 2 }, { text: " the seats online." }],
      [{ text: "There are still " }, { gap: 3 }, { text: " seats near the front." }],
      [
        { text: "Let's meet outside the cinema " },
        { gap: 4 },
        { text: " half past six." },
      ],
      [{ text: "Please " }, { gap: 5 }, { text: " me if you can come." }],
    ],
    gaps: [
      { id: 0, answer: "come", fixed: true, options: ["come", "go", "take"] },
      { id: 1, answer: "at", options: ["on", "at", "in"], explanation: "Use at with exact times: at 7:15, at six o'clock." },
      { id: 2, answer: "book", options: ["book", "catch", "open"], explanation: "Book means reserve seats or tickets before you go." },
      { id: 3, answer: "some", options: ["some", "much", "little"], explanation: "Seats is a plural countable noun, so some fits. Much and little are used with uncountable nouns." },
      { id: 4, answer: "around", options: ["by", "around", "to"], explanation: "Around half past six means approximately 6:30." },
      { id: 5, answer: "tell", options: ["tell", "say", "talk"], explanation: "Tell is followed by a person: tell me. Say does not take the person directly, and talk needs to/with." },
    ],
  },
  {
    id: "class-homework",
    title: "Class homework",
    prompt:
      "Read the email from Mia to Leo. Choose one word from the three options for each gap. The first one is done for you.",
    sender: "Mia",
    lines: [
      [{ text: "Hi Leo," }],
      [
        { text: "Could you " },
        { gap: 0 },
        { text: " me the homework from today's class?" },
      ],
      [{ text: "I was " }, { gap: 1 }, { text: ", so I missed the lesson." }],
      [{ text: "The teacher said we have to " }, { gap: 2 }, { text: " exercise 4." }],
      [{ text: "I think it's " }, { gap: 3 }, { text: " page 27." }],
      [{ text: "Can you take a photo " }, { gap: 4 }, { text: " the board notes?" }],
      [{ text: "Thanks " }, { gap: 5 }, { text: " your help!" }],
    ],
    gaps: [
      { id: 0, answer: "send", fixed: true, options: ["send", "bring", "make"] },
      { id: 1, answer: "sick", options: ["sick", "tired", "warm"], explanation: "If Mia missed the lesson, sick explains why she was absent from class." },
      { id: 2, answer: "do", options: ["do", "make", "have"], explanation: "We normally say do an exercise when talking about homework or coursebook tasks." },
      { id: 3, answer: "on", options: ["in", "on", "at"], explanation: "Use on with page numbers: on page 27." },
      { id: 4, answer: "of", options: ["of", "to", "for"], explanation: "The fixed phrase is take a photo of something." },
      { id: 5, answer: "for", options: ["for", "from", "with"], explanation: "Thanks for your help is the standard phrase for saying why you are grateful." },
    ],
  },
  {
    id: "cafe-meeting",
    title: "Cafe meeting",
    prompt:
      "Read the email from Mark to Sara. Choose one word from the three options for each gap. The first one is done for you.",
    sender: "Mark",
    lines: [
      [{ text: "Hi Sara," }],
      [{ text: "Are you " }, { gap: 0 }, { text: " after work tomorrow?" }],
      [
        { text: "I'd like to meet for coffee and " },
        { gap: 1 },
        { text: " about the project." },
      ],
      [{ text: "There's a new cafe " }, { gap: 2 }, { text: " the station." }],
      [{ text: "It isn't expensive, and the cakes are very " }, { gap: 3 }, { text: "." }],
      [{ text: "I finish work " }, { gap: 4 }, { text: " four o'clock." }],
      [{ text: "Can you " }, { gap: 5 }, { text: " me outside the office?" }],
    ],
    gaps: [
      { id: 0, answer: "free", fixed: true, options: ["free", "full", "late"] },
      { id: 1, answer: "talk", options: ["talk", "say", "tell"], explanation: "Talk about means discuss a topic. Say and tell do not fit with about here." },
      { id: 2, answer: "near", options: ["near", "between", "over"], explanation: "Near the station means close to the station." },
      { id: 3, answer: "fresh", options: ["fresh", "fast", "heavy"], explanation: "Fresh describes food that is newly made or good quality. It fits cakes." },
      { id: 4, answer: "at", options: ["at", "on", "in"], explanation: "Use at with exact times: at four o'clock." },
      { id: 5, answer: "meet", options: ["meet", "know", "watch"], explanation: "Meet someone outside a place means arrange to see them there." },
    ],
  },
  {
    id: "doctor-appointment",
    title: "Doctor appointment",
    prompt:
      "Read the email from Ellie to her dad. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "Love,",
    sender: "Ellie",
    lines: [
      [{ text: "Hi Dad," }],
      [{ text: "I have to " }, { gap: 0 }, { text: " to the doctor this afternoon." }],
      [{ text: "My appointment is " }, { gap: 1 }, { text: " 3:40." }],
      [{ text: "Can you pick me " }, { gap: 2 }, { text: " from school?" }],
      [{ text: "I don't feel very " }, { gap: 3 }, { text: " today." }],
      [{ text: "The doctor's office is " }, { gap: 4 }, { text: " the pharmacy." }],
      [{ text: "I'll call you " }, { gap: 5 }, { text: " I finish." }],
    ],
    gaps: [
      { id: 0, answer: "go", fixed: true, options: ["go", "make", "take"] },
      { id: 1, answer: "at", options: ["at", "on", "in"], explanation: "Use at with exact appointment times: at 3:40." },
      { id: 2, answer: "up", options: ["up", "out", "off"], explanation: "Pick me up means collect me by car or take me from a place." },
      { id: 3, answer: "well", options: ["well", "quick", "loud"], explanation: "Feel well means feel healthy. Quick and loud do not describe health here." },
      { id: 4, answer: "opposite", options: ["opposite", "after", "during"], explanation: "Opposite tells us the doctor's office is across from the pharmacy." },
      { id: 5, answer: "when", options: ["when", "where", "what"], explanation: "When I finish refers to the time she will call." },
    ],
  },
  {
    id: "weekend-trip",
    title: "Weekend trip",
    prompt:
      "Read the email from Clara to Ben. Choose one word from the three options for each gap. The first one is done for you.",
    closing: "See you,",
    sender: "Clara",
    lines: [
      [{ text: "Hi Ben," }],
      [{ text: "We're going to " }, { gap: 0 }, { text: " my aunt this weekend." }],
      [{ text: "She lives in a small town " }, { gap: 1 }, { text: " the sea." }],
      [{ text: "We can travel there " }, { gap: 2 }, { text: " train." }],
      [{ text: "Please bring a " }, { gap: 3 }, { text: " because it may be cold." }],
      [{ text: "My aunt will " }, { gap: 4 }, { text: " us dinner on Saturday." }],
      [{ text: "I think we'll have a really " }, { gap: 5 }, { text: " time." }],
    ],
    gaps: [
      { id: 0, answer: "visit", fixed: true, options: ["visit", "look", "watch"] },
      { id: 1, answer: "by", options: ["by", "under", "inside"], explanation: "By the sea means next to or near the sea." },
      { id: 2, answer: "by", options: ["by", "on", "in"], explanation: "Use by to talk about a method of transport: by train, by bus, by car." },
      { id: 3, answer: "coat", options: ["coat", "ticket", "plate"], explanation: "A coat is something you bring because the weather may be cold." },
      { id: 4, answer: "cook", options: ["cook", "take", "drive"], explanation: "Cook us dinner means prepare dinner for us." },
      { id: 5, answer: "good", options: ["good", "strong", "heavy"], explanation: "Have a good time is the natural fixed phrase." },
    ],
  },
  {
    id: "birthday-present",
    title: "Birthday present",
    prompt:
      "Read the email from Lucy to Emma. Choose one word from the three options for each gap. The first one is done for you.",
    sender: "Lucy",
    lines: [
      [{ text: "Hi Emma," }],
      [{ text: "I need to " }, { gap: 0 }, { text: " a present for Jack's birthday." }],
      [{ text: "Do you know " }, { gap: 1 }, { text: " he likes?" }],
      [{ text: "Maybe we can get him a book " }, { gap: 2 }, { text: " football." }],
      [{ text: "He already has " }, { gap: 3 }, { text: " video games." }],
      [{ text: "The party is " }, { gap: 4 }, { text: " Friday evening." }],
      [{ text: "Can you come shopping with me " }, { gap: 5 }, { text: " school?" }],
    ],
    gaps: [
      { id: 0, answer: "buy", fixed: true, options: ["buy", "bring", "take"] },
      { id: 1, answer: "what", options: ["what", "which", "who"], explanation: "What he likes asks for information about his interests." },
      { id: 2, answer: "about", options: ["about", "to", "of"], explanation: "A book about football means football is the subject of the book." },
      { id: 3, answer: "many", options: ["many", "much", "little"], explanation: "Video games is plural countable, so many is correct. Much and little are for uncountable nouns." },
      { id: 4, answer: "on", options: ["on", "in", "at"], explanation: "Use on with days and day plus part of day: on Friday evening." },
      { id: 5, answer: "after", options: ["after", "between", "under"], explanation: "After school means when the school day has finished." },
    ],
  },
];

function ChipDropdown({ items, value, onChange, label = "Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const active = items[value];

  return (
    <div className="chip-select" ref={ref}>
      <button
        type="button"
        className={`count-chip ${open ? "selected" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lbl">{label}</span>
        <span className="val">{active?.title ?? "-"}</span>
        <span className="chev" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <ul className="chip-menu" role="listbox">
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === value}
                aria-disabled={!!it.locked}
                className={`chip-option ${i === value ? "active" : ""} ${
                  it.locked ? "locked" : ""
                }`}
                onClick={() => {
                  onChange(i);
                  if (!it.locked) setOpen(false);
                }}
                title={it.title}
              >
                <strong className="num">{i + 1}.</strong>
                <span className="ttl">{it.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AptisPart1({
  tasks = READING_PART1_TASKS,
  allowedTaskIds = [],
  user,
  aptisAccess,
  onSignIn,
  onRequireSignIn,
}) {
  const allowedTaskSet = useMemo(() => new Set(allowedTaskIds), [allowedTaskIds]);
  const initialTaskId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("task")
      : "";
  const initialTaskMatch = tasks.findIndex((task) => task.id === initialTaskId);
  const initialTaskIndex =
    initialTaskMatch >= 0 &&
    (!allowedTaskIds.length || allowedTaskSet.has(tasks[initialTaskMatch]?.id))
      ? initialTaskMatch
      : 0;

  const [taskIndex, setTaskIndex] = useState(initialTaskIndex);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [completed, setCompleted] = useState(new Set());
  const [whyOpen, setWhyOpen] = useState(null);
  const current = tasks[taskIndex] || tasks[0];

  useEffect(() => {
    if (!tasks.length) return;
    const selected = tasks[taskIndex];
    if (allowedTaskIds.length && selected && !allowedTaskSet.has(selected.id)) {
      setTaskIndex(0);
    }
  }, [allowedTaskIds.length, allowedTaskSet, taskIndex, tasks]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return setCompleted(new Set());
      const done = await fetchReadingCompletionsByPart("part1");
      if (alive) setCompleted(done);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const decoratedItems = useMemo(
    () =>
      tasks.map((task) => {
        const locked = allowedTaskIds.length ? !allowedTaskSet.has(task.id) : false;
        return {
          ...task,
          locked,
          title: `${task.title}${completed.has(task.id) ? " ✓" : ""}${
            locked ? " 🔒" : ""
          }`,
        };
      }),
    [allowedTaskIds.length, allowedTaskSet, completed, tasks]
  );

  function resetForTask(nextIndex) {
    setTaskIndex(nextIndex);
    setAnswers({});
    setFeedback({});
    setWhyOpen(null);
  }

  function handleSelectTask(nextIndex) {
    if (decoratedItems[nextIndex]?.locked) {
      toast("That reading task is included with full access.");
      onRequireSignIn?.();
      return;
    }
    resetForTask(nextIndex);
  }

  function handleChange(gapId, value) {
    setAnswers((prev) => ({ ...prev, [gapId]: value }));
    setFeedback((prev) => ({ ...prev, [gapId]: null }));
    if (whyOpen === gapId) setWhyOpen(null);
  }

  async function markCurrentTaskCompleted() {
    if (!user || completed.has(current.id)) return;
    try {
      await logReadingPart1Completed({ taskId: current.id, source: "AptisPart1" });
      setCompleted((prev) => new Set(prev).add(current.id));
      toast("Task marked as completed ✓");
    } catch (err) {
      console.warn("[reading p1] completion save failed:", err);
      toast("We couldn't save this completion.");
    }
  }

  async function handleCheck() {
    const nextFeedback = {};
    current.gaps
      .filter((gap) => !gap.fixed)
      .forEach((gap) => {
        const given = answers[gap.id];
        nextFeedback[gap.id] = given ? given === gap.answer : null;
      });
    setFeedback(nextFeedback);

    const answerable = current.gaps.filter((gap) => !gap.fixed);
    const total = answerable.length;
    const score = answerable.reduce(
      (acc, gap) => acc + (nextFeedback[gap.id] === true ? 1 : 0),
      0
    );

    if (user) {
      await logReadingPart1Attempted({
        taskId: current.id,
        score,
        total,
        source: "AptisPart1",
      });
    }

    if (score === total) {
      await markCurrentTaskCompleted();
    }
  }

  async function handleShowAnswers() {
    const nextAnswers = {};
    const nextFeedback = {};
    current.gaps.forEach((gap) => {
      if (gap.fixed) return;
      nextAnswers[gap.id] = gap.answer;
      nextFeedback[gap.id] = true;
    });
    setAnswers(nextAnswers);
    setFeedback(nextFeedback);
    await markCurrentTaskCompleted();
  }

  function handleReset() {
    setAnswers({});
    setFeedback({});
    setWhyOpen(null);
  }

  function renderGap(gapId) {
    const gap = current.gaps.find((item) => item.id === gapId);
    if (!gap) return null;
    if (gap.fixed) return <span className="fixed-gap">{gap.answer}</span>;

    const status = feedback[gap.id];
    const className =
      status === true ? "gap-select ok" : status === false ? "gap-select bad" : "gap-select";

    return (
      <select
        className={className}
        value={answers[gap.id] || ""}
        onChange={(event) => handleChange(gap.id, event.target.value)}
        aria-label={`Choose answer for gap ${gap.id}`}
      >
        <option value="">-</option>
        {gap.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  const answerableGaps = current.gaps.filter((gap) => !gap.fixed);
  const hasFeedback = answerableGaps.some((gap) => feedback[gap.id] !== undefined);

  return (
    <div className="aptis-p1 game-wrapper">
      <StyleScope />

      <header className="p1-top">
        <div className="p1-titleblock">
          <h2 className="p1-title">Reading - Part 1 (Word Choices)</h2>
          <p className="p1-intro">{current?.prompt}</p>
        </div>

        <div className="p1-tools">
          <ReadingAssignButton
            user={user}
            activityId="reading-part-1"
            activityLabel={`Aptis Reading Part 1 - ${current?.title || "Word choices"}`}
            routePath={getSitePath(`/reading/part1?task=${encodeURIComponent(current?.id || "")}`)}
            taskId={current?.id || ""}
            taskTitle={current?.title || ""}
          />
          <ChipDropdown
            items={decoratedItems}
            value={taskIndex}
            onChange={handleSelectTask}
            label="Task"
          />
        </div>
      </header>

      <ReadingDemoNotice user={user} aptisAccess={aptisAccess} onSignIn={onSignIn}>
        Demo mode includes two Part 1 reading tasks. The other Part 1 tasks stay visible but require full access.
      </ReadingDemoNotice>

      <section className="p1-panel">
        <div className="p1-panelbar">
          <div>
            <p className="eyebrow">Question 1 of 5</p>
            <h3>{current.title}</h3>
          </div>
          <div className="controls">
            <button className="btn" type="button" onClick={handleReset}>
              Reset
            </button>
            <button className="btn primary" type="button" onClick={handleCheck}>
              Check
            </button>
            <button className="btn ghost" type="button" onClick={handleShowAnswers}>
              Show answers
            </button>
          </div>
        </div>

        <div className="email-text">
          {current.lines.map((line, lineIndex) => (
            <p key={lineIndex}>
              {line.map((part, partIndex) =>
                Object.prototype.hasOwnProperty.call(part, "gap") ? (
                  <React.Fragment key={`${lineIndex}-${partIndex}`}>
                    {renderGap(part.gap)}
                  </React.Fragment>
                ) : (
                  <React.Fragment key={`${lineIndex}-${partIndex}`}>{part.text}</React.Fragment>
                )
              )}
            </p>
          ))}

          {current.closing ? <p>{current.closing}</p> : null}
          <p>{current.sender}</p>
        </div>

        {hasFeedback ? (
          <div className="p1-review">
            <h4>Answer review</h4>
            <ol>
              {answerableGaps.map((gap) => {
                const status = feedback[gap.id];
                const selected = answers[gap.id] || "-";
                const isOpen = whyOpen === gap.id;
                return (
                  <li
                    key={gap.id}
                    className={status === true ? "ok" : status === false ? "bad" : "empty"}
                  >
                    <div className="review-row">
                      <span className="review-gap">Gap {gap.id}</span>
                      <span className="review-choice">
                        Your answer: <strong>{selected}</strong>
                      </span>
                      <span className="review-answer">
                        Answer: <strong>{gap.answer}</strong>
                      </span>
                      <button
                        type="button"
                        className="why-btn"
                        onClick={() => setWhyOpen((cur) => (cur === gap.id ? null : gap.id))}
                      >
                        Why?
                      </button>
                    </div>
                    {isOpen ? (
                      <div className="why-box">
                        <span className="label">Explanation:</span> {gap.explanation}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StyleScope() {
  return (
    <style>{`
      .aptis-p1 {
        --panel:#13213b;
        --ink:#e6f0ff;
        --muted:#a9b7d1;
        --border:#2c4b83;
        --ok:#2fb67c;
        --bad:#e46c6c;
        --accent:#6ea8ff;
        color:var(--ink);
      }

      .aptis-p1 .p1-top {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:1rem;
        margin-bottom:1rem;
      }

      .aptis-p1 .p1-title { margin:0; font-size:1.4rem; }
      .aptis-p1 .p1-intro { margin:.35rem 0 0; color:var(--muted); max-width:76ch; }
      .aptis-p1 .p1-tools { display:flex; align-items:center; gap:.65rem; flex-wrap:wrap; justify-content:flex-end; }

      .aptis-p1 .p1-panel {
        background:var(--panel);
        border:1px solid var(--border);
        border-radius:16px;
        padding:1rem;
      }

      .aptis-p1 .p1-panelbar {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:1rem;
        flex-wrap:wrap;
        margin-bottom:1.1rem;
      }

      .aptis-p1 .eyebrow {
        margin:0 0 .2rem;
        color:var(--muted);
        font-size:.86rem;
        font-weight:800;
        text-transform:uppercase;
        letter-spacing:.08em;
      }

      .aptis-p1 .p1-panelbar h3 { margin:0; font-size:1.12rem; }

      .aptis-p1 .controls { display:flex; gap:.5rem; flex-wrap:wrap; }
      .aptis-p1 .btn {
        background:#24365d;
        border:1px solid #335086;
        color:var(--ink);
        padding:.45rem .75rem;
        border-radius:10px;
        cursor:pointer;
      }
      .aptis-p1 .btn.primary { background:#294b84; border-color:#3a6ebd; }
      .aptis-p1 .btn.ghost { background:transparent; border-color:#37598e; }

      .aptis-p1 .email-text {
        background:#0f1b31;
        border:1px solid #203258;
        border-radius:14px;
        padding:1rem;
        max-width:860px;
        line-height:1.9;
        font-size:1.02rem;
      }

      .aptis-p1 .email-text p {
        margin:.65rem 0;
      }

      .aptis-p1 .fixed-gap {
        display:inline-flex;
        align-items:center;
        min-height:2rem;
        padding:0 .55rem;
        margin:0 .18rem;
        border-radius:8px;
        background:#10223f;
        border:1px solid #4a6aa5;
        color:#e6f0ff;
        font-weight:800;
      }

      .aptis-p1 .gap-select {
        min-width:6.8rem;
        min-height:2.05rem;
        margin:0 .18rem;
        background:#24365d;
        color:var(--ink);
        border:1px solid #37598e;
        border-radius:8px;
        padding:.25rem .45rem;
      }

      .aptis-p1 .gap-select.ok {
        border-color:var(--ok);
        box-shadow:0 0 0 2px rgba(47,182,124,.2);
      }

      .aptis-p1 .gap-select.bad {
        border-color:var(--bad);
        box-shadow:0 0 0 2px rgba(228,108,108,.2);
      }

      .aptis-p1 .p1-review {
        margin-top:1rem;
        background:#0f1b31;
        border:1px solid #203258;
        border-radius:14px;
        padding:.9rem 1rem;
        max-width:860px;
      }

      .aptis-p1 .p1-review h4 {
        margin:0 0 .7rem;
        color:var(--accent);
        font-size:1rem;
      }

      .aptis-p1 .p1-review ol {
        margin:0;
        padding-left:1.2rem;
        display:flex;
        flex-direction:column;
        gap:.65rem;
      }

      .aptis-p1 .p1-review li {
        padding:.15rem 0;
      }

      .aptis-p1 .p1-review li.ok .review-gap { color:var(--ok); }
      .aptis-p1 .p1-review li.bad .review-gap { color:var(--bad); }
      .aptis-p1 .p1-review li.empty .review-gap { color:var(--muted); }

      .aptis-p1 .review-row {
        display:flex;
        align-items:center;
        gap:.55rem .8rem;
        flex-wrap:wrap;
        line-height:1.35;
      }

      .aptis-p1 .review-gap {
        font-weight:900;
      }

      .aptis-p1 .review-choice,
      .aptis-p1 .review-answer {
        color:#d7e3ff;
      }

      .aptis-p1 .why-btn {
        background:#24365d;
        border:1px solid #37598e;
        color:var(--accent);
        font-weight:800;
        border-radius:8px;
        padding:.25rem .5rem;
        line-height:1.2;
        cursor:pointer;
      }

      .aptis-p1 .why-box {
        background:#10223f;
        border:1px solid #37598e;
        border-radius:10px;
        margin:.45rem 0 0;
        padding:.55rem .65rem;
        color:var(--muted);
        line-height:1.45;
      }

      .aptis-p1 .why-box .label {
        color:var(--accent);
        font-weight:800;
      }

      .aptis-p1 .chip-select { position:relative; display:inline-block; }
      .aptis-p1 .count-chip {
        min-width:13rem;
        max-width:min(24rem, 78vw);
        display:inline-flex;
        align-items:center;
        justify-content:space-between;
        gap:.5rem;
        background:#24365d;
        border:1px solid #335086;
        color:var(--ink);
        padding:.45rem .7rem;
        border-radius:10px;
        cursor:pointer;
      }
      .aptis-p1 .count-chip .lbl { color:#cfe1ff; font-weight:800; }
      .aptis-p1 .count-chip .val {
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .aptis-p1 .chip-menu {
        position:absolute;
        right:0;
        margin-top:.4rem;
        background:#132647;
        border:1px solid #2c4b83;
        border-radius:12px;
        padding:.35rem;
        list-style:none;
        min-width:17rem;
        max-height:50vh;
        overflow:auto;
        box-shadow:0 10px 24px rgba(0,0,0,.35);
        z-index:50;
      }
      .aptis-p1 .chip-option {
        width:100%;
        text-align:left;
        background:transparent;
        border:0;
        color:#e6f0ff;
        padding:.45rem .6rem;
        border-radius:10px;
        display:flex;
        gap:.5rem;
        align-items:baseline;
        cursor:pointer;
      }
      .aptis-p1 .chip-option:hover { background:#0f1b31; }
      .aptis-p1 .chip-option.active { background:#294b84; }
      .aptis-p1 .chip-option.locked { opacity:.5; cursor:not-allowed; }
      .aptis-p1 .chip-option .num { color:#cfe1ff; width:2.2rem; display:inline-block; }
      .aptis-p1 .chip-option .ttl {
        color:#e6f0ff;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      @media (max-width:720px) {
        .aptis-p1 .p1-top { flex-direction:column; }
        .aptis-p1 .p1-tools { width:100%; justify-content:flex-start; }
        .aptis-p1 .count-chip { width:100%; }
        .aptis-p1 .chip-select { width:100%; }
        .aptis-p1 .chip-menu { left:0; right:auto; width:100%; min-width:0; }
        .aptis-p1 .email-text { font-size:.98rem; padding:.85rem; }
        .aptis-p1 .gap-select { min-width:5.8rem; }
      }
    `}</style>
  );
}
