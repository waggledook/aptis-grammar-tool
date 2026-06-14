// src/components/writing/WritingPart3.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";
import RichTextExamEditor from "../common/RichTextExamEditor";
import WritingAssignButton from "./WritingAssignButton";
import { getSitePath } from "../../siteConfig.js";
import WritingDemoNotice from "./WritingDemoNotice.jsx";

/**
 * Aptis Writing – Part 3 (three short responses, 30–40 words each)
 * FULLY UPGRADED (Option B)
 * - Submit → Summary view (Edit / Copy / Download)
 * - HTML normalisation (same as Part 4)
 * - Locked tasks for guest users
 * - Polished layout + game-wrapper structure
 */

const TASKS = [
    {
      id: "sports-fee",
      title: "Sports Club",
      context:
        "You are chatting online with other members of the sports club. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        {
          name: "Marta",
          question:
            "Hi and welcome to the club! What kind of sports do you usually play or watch, and how often do you do sport?",
        },
        {
          name: "Jon",
          question:
            "Great to meet you! Can you tell us about a live sporting event you went to?",
        },
        {
          name: "Priya",
          question:
            "We want to plan more activities this year. What extra training sessions, events or competitions would you like the club to organise?",
        },
      ],
    },
    {
      id: "debate-club",
      title: "Debate Club",
      context:
        "You are chatting online with other members of the debate club. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        {
          name: "Leo",
          question:
            "Hi! Which topics do you enjoy debating the most, and why do you find them interesting or important?",
        },
        {
          name: "Amira",
          question:
            "Welcome! Why did you decide to join the club?",
        },
        {
          name: "Sam",
          question:
            "Some members are nervous about speaking in front of a group. What advice would you give them to feel more confident during debates?",
        },
      ],
    },
    {
      id: "volunteer-change",
      title: "Volunteer Group",
      context:
        "You are chatting online with other members of the volunteer group. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        {
          name: "Carla",
          question:
            "Welcome to the group! Could you tell us a bit about your availabilty to take part in club projects?",
        },
        {
          name: "Ravi",
          question:
            "We're always looking for new ideas. How do you think we could help the local community?",
        },
        {
          name: "Emma",
          question:
            "Sometimes it is hard to keep volunteers motivated. What can organisers do to make people feel valued and willing to come back?",
        },
      ],
    },
    {
      id: "travel-club",
      title: "Travel Club",
      context:
        "You are chatting online with other members of the travel club. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        {
          name: "Diego",
          question:
            "Hi! What kind of trips do you usually enjoy – city breaks, beach holidays or something else?",
        },
        {
          name: "Nora",
          question:
            "Thanks for joining! Could you tell us about a memorable trip you went on recently?",
        },
        {
          name: "Hanna",
          question:
            "Some members travel on a very low budget, while others like more comfort. What is your opinion about travelling cheaply versus travelling in more style?",
        },
      ],
    },
    {
      id: "ebook-switch",
      title: "Book Club",
      context:
        "You are chatting online with other members of the book club. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        {
          name: "James",
          question:
            "Hi and welcome! What kinds of books do you usually enjoy reading, and is there a particular author you really like?",
        },
        {
          name: "Sofia",
          question:
            "Hey there. How do you feel about reading e-books instead of printed books?",
        },
        {
          name: "Omar",
          question:
            "Welcome! Do you prefer reading in English or your own language?",
        },
      ],
    },
    {
      id: "book-exchange",
      title: "Book Exchange Website",
      context:
        "You are chatting online with other users on a book-exchange website. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        {
          name: "Lena",
          question:
            "Hi! What genres of book are you most interested in reading?",
        },
        {
          name: "Marco",
          question:
            "Welcome! I really like collecting older books. How about you?",
        },
        {
          name: "Aya",
          question:
            "We are considering adding audiobooks to the website. How do you feel about listening to books?",
        },
      ],
    },
    {
      id: "film-club",
      title: "Film Club",
      context:
        "You are chatting online with other members of the film club. Answer their messages. Write 30–40 words for each answer.",
      chats: [
        {
          name: "Tom",
          question:
            "Hi! Is there a film you would really like the club to watch together?",
        },
        {
          name: "Sara",
          question:
            "Thanks for joining! Do you prefer watching films at home or in the cinema?",
        },
        {
          name: "Bilal",
          question:
            "Personally, I always watch flims in their original language with subtitles. How about you?",
        },
      ],
    },
  ];

export default function WritingPart3({ user, aptisAccess, onSignIn, onRequireSignIn, allowedTaskIds = [] }) {
  const [searchParams] = useSearchParams();
  const allowedTaskSet = useMemo(() => new Set(allowedTaskIds), [allowedTaskIds]);
  const hasTaskAllowlist = allowedTaskSet.size > 0;
  const firstAvailableTaskIndex = useMemo(() => {
    if (!hasTaskAllowlist) return 0;
    const nextIndex = TASKS.findIndex((task) => allowedTaskSet.has(task.id));
    return nextIndex >= 0 ? nextIndex : 0;
  }, [allowedTaskSet, hasTaskAllowlist]);
  const [taskIndex, setTaskIndex] = useState(0);
  const current = TASKS[taskIndex] || TASKS[0];

  // 3 responses — each is { html, text }
  const [answersHTML, setAnswersHTML] = useState(["", "", ""]);
  const [answersText, setAnswersText] = useState(["", "", ""]);

  // summary toggle
  const [showSummary, setShowSummary] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState("idle");
  const [feedbackError, setFeedbackError] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [feedbackMeta, setFeedbackMeta] = useState(null);
  const [submissionId, setSubmissionId] = useState("");

  // derived word counts
  const counts = useMemo(
    () => answersText.map((t) => wordCount(t)),
    [answersText]
  );

  // reset answers when task changes
  useEffect(() => {
    setAnswersHTML(["", "", ""]);
    setAnswersText(["", "", ""]);
    setShowSummary(false);
    setSubmissionId("");
    resetFeedback();
  }, [current.id]);

  useEffect(() => {
    const requestedTaskId = searchParams.get("task");
    if (!requestedTaskId) return;

    const nextIdx = TASKS.findIndex((task) => task.id === requestedTaskId);
    if (nextIdx === -1) return;
    if (hasTaskAllowlist && !allowedTaskSet.has(TASKS[nextIdx].id)) {
      setTaskIndex(firstAvailableTaskIndex);
      return;
    }
    setTaskIndex(nextIdx);
  }, [allowedTaskSet, firstAvailableTaskIndex, hasTaskAllowlist, searchParams]);

  useEffect(() => {
    if (hasTaskAllowlist && !allowedTaskSet.has(current.id)) {
      setTaskIndex(firstAvailableTaskIndex);
    }
  }, [allowedTaskSet, current.id, firstAvailableTaskIndex, hasTaskAllowlist]);

  function handleSelectTask(nextIdx) {
    if (hasTaskAllowlist && !allowedTaskSet.has(TASKS[nextIdx]?.id)) {
      toast("That writing task is included with full access.");
      onRequireSignIn?.();
      return;
    }
    setTaskIndex(nextIdx);
  }

  function handleAnswerChange(idx, { html, text }) {
    setAnswersHTML((p) => {
      const c = [...p]; c[idx] = html; return c;
    });
    setAnswersText((p) => {
      const c = [...p]; c[idx] = text; return c;
    });
  }

  /* -------------------------------------------------------
   * Submission summary builders (adapted from Part 4)
   * ----------------------------------------------------- */

  function buildSummaryPlain() {
    const parts = [];

    parts.push(`Aptis Writing – Part 3`);
    parts.push(`Task: ${current.title}`, "");

    current.chats.forEach((chat, idx) => {
      const plain = htmlToPlainKeepLines(answersHTML[idx], answersText[idx]);
      parts.push(`— Reply ${idx + 1} —`, plain || "(empty)", "");
    });

    parts.push(`Word counts: ${counts.join(", ")}`);
    return parts.join("\n");
  }

  function buildSummaryHtml() {
    const replies = current.chats.map((chat, idx) => {
      const clean = normalizeHtmlForClipboard(answersHTML[idx], answersText[idx]) || "<em>(empty)</em>";
      return `
        <h4 style="margin:.8rem 0 .3rem 0;">Reply ${idx + 1}</h4>
        ${clean}
        <p style="margin:.4rem 0; opacity:.7;">${counts[idx]} words</p>
      `;
    });

    return `
      <div>
        <h3 style="margin:0 0 .4rem 0;">Aptis Writing – Part 3</h3>
        <p style="margin:.25rem 0;"><strong>Task:</strong> ${current.title}</p>
        ${replies.join("")}
      </div>
    `;
  }

  async function handleCopy() {
    try {
      const html = buildSummaryHtml();
      const text = buildSummaryPlain();

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      toast("Answers copied ✓");
    } catch {
      toast("Copy failed — try manually.");
    }
  }

  function handleDownload() {
    const text = buildSummaryPlain();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aptis-writing-p3-${current.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit() {
    // basic validation: all three answers should have some text
    const trimmed = answersText.map((t) => t.trim());
    if (trimmed.some((t) => !t)) {
      toast("Please answer all three messages before submitting.");
      return;
    }

    // Save to Firestore if logged in and helper exists
    if (user && fb?.saveWritingP3Submission) {
      try {
        const savedId = await fb.saveWritingP3Submission({
          taskId: current.id,
          answersText: trimmed,
          answersHTML,
          counts, // [n1, n2, n3]
        });
        setSubmissionId(savedId || "");

        // ✅ activity log — correct placement
    await fb.logWritingSubmitted({
      part: "part3",
      taskId: current.id,
      wordCounts: counts,                 // e.g. [34, 31, 39]
      totalWords: counts.reduce((a, b) => a + b, 0),
    });
    
      } catch (e) {
        console.warn("[WritingP3] save failed", e);
      }
    }

    toast("Saved ✓");
    // whatever you’re using to show the summary panel:
    setShowSummary(true);
  }

  function resetFeedback() {
    setFeedbackStatus("idle");
    setFeedbackError("");
    setAiFeedback(null);
    setFeedbackMeta(null);
  }

  async function handleGenerateFeedback() {
    if (!user) {
      toast("Sign in to get feedback.");
      return;
    }
    const trimmed = answersText.map((text) => text.trim());
    if (trimmed.some((text) => !text)) {
      toast("Please answer all three messages before generating feedback.");
      return;
    }
    if (!submissionId) {
      toast("Submit your answers first so the feedback can be saved to your profile.");
      return;
    }

    setFeedbackStatus("loading");
    setFeedbackError("");
    setAiFeedback(null);
    setFeedbackMeta(null);

    const feedbackPayload = {
        part: "part3",
        taskId: current.id,
        title: current.title,
        context: current.context,
        chats: current.chats.map((chat) => ({
          name: chat.name,
          question: chat.question,
        })),
        answers: trimmed.map((text, index) => ({
          text,
          wordCount: counts[index],
        })),
      };

    try {
      const result = await fb.requestAptisWritingPart23Feedback(feedbackPayload);
      setAiFeedback(result?.feedback || null);
      setFeedbackMeta(result?.meta || null);
      if (submissionId && result?.feedback && fb?.saveWritingAiFeedback) {
        try {
          await fb.saveWritingAiFeedback({
            kind: "part3",
            submissionId,
            feedback: result.feedback,
            meta: result?.meta || null,
          });
        } catch (saveError) {
          console.warn("[WritingP3] AI feedback save failed", saveError);
          toast("Feedback generated, but it could not be saved to your profile.");
        }
      }
      setFeedbackStatus("ready");
    } catch (error) {
      console.warn("[WritingP3] AI feedback failed", {
        error,
        code: error?.code,
        message: error?.message,
        details: error?.details,
        customData: error?.customData,
        payloadSummary: {
          taskId: feedbackPayload.taskId,
          chatCount: feedbackPayload.chats.length,
          answerCount: feedbackPayload.answers.length,
          wordCounts: feedbackPayload.answers.map((answer) => answer.wordCount),
          answerChars: feedbackPayload.answers.map((answer) => answer.text.length),
        },
      });
      setFeedbackStatus("error");
      setFeedbackError(
        [error?.code, error?.message].filter(Boolean).join(": ") ||
        "Could not generate feedback."
      );
    }
  }


  function handleReset() {
    setAnswersHTML(["", "", ""]);
    setAnswersText(["", "", ""]);
    setShowSummary(false);
    setSubmissionId("");
    resetFeedback();
  }

  /* -------------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------- */

  const decorated = decorateTasks(TASKS, { hasTaskAllowlist, allowedTaskSet });

  return (
    <div className="aptis-writing-p3 game-wrapper">
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Writing – Part 3 (Three responses)</h2>
          <p className="intro">
            You are taking part in an online chat. Answer{" "}
            <strong>three messages</strong>. Write{" "}
            <strong>30–40 words</strong> each.
          </p>
        </div>
        <div className="actions">
          <ChipDropdown
            items={decorated}
            value={taskIndex}
            onChange={handleSelectTask}
            label="Task"
          />
          <WritingAssignButton
            user={user}
            activityId="writing-part-3"
            activityLabel={`Aptis Writing Part 3 — ${current.title}`}
            routePath={getSitePath(`/writing/part3?task=${encodeURIComponent(current.id)}`)}
            taskId={current.id}
            taskTitle={current.title}
          />
        </div>
      </header>

      <WritingDemoNotice user={user} aptisAccess={aptisAccess} onSignIn={onSignIn}>
        Demo mode includes one Part 3 chat task. The other Part 3 tasks stay visible but require full access.
      </WritingDemoNotice>

      <div className="grid">
        {showSummary ? (
          /* ------------------ SUMMARY PANEL ------------------ */
          <section className="panel summary">
            <div className="summary-header">
              <h4 style={{ margin: 0 }}>Complete</h4>
              <div className="summary-actions">
                <button className="btn" onClick={() => setShowSummary(false)}>
                  Edit
                </button>
                <button className="btn" onClick={handleCopy}>
                  Copy answers
                </button>
                <button className="btn" onClick={handleDownload}>
                  Download .txt
                </button>
                <button
                  className="btn primary"
                  disabled={feedbackStatus === "loading"}
                  onClick={handleGenerateFeedback}
                >
                  {feedbackStatus === "loading" ? "Getting feedback..." : "Get feedback"}
                </button>
              </div>
            </div>

            <div className="summary-grid">
              {current.chats.map((chat, idx) => (
                <div key={idx} className="card">
                  <div className="card-title">Reply {idx + 1}</div>
                  <div className="card-meta">{counts[idx]} words</div>
                  <div
                    className="preview submitted-html"
                    dangerouslySetInnerHTML={{
                      __html: normalizeHtmlForClipboard(
                        answersHTML[idx],
                        answersText[idx]
                      ),
                    }}
                  />
                </div>
              ))}
            </div>
            <AptisWritingPart23Feedback
              feedback={aiFeedback}
              status={feedbackStatus}
              error={feedbackError}
            />
          </section>
        ) : (
          /* ------------------ FORM PANEL ------------------ */
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <h3 style={{ marginTop: 0 }}>{current.title}</h3>
            <p className="muted" style={{ marginBottom: "1rem" }}>
              {current.context}
            </p>

            {current.chats.map((chat, idx) => (
              <div className="block" key={`${current.id}-${idx}`}>
                <div className="chat-header">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-label">
                    Member message {idx + 1} of 3
                  </span>
                </div>

                <p className="chat-question">{chat.question}</p>

                <RichTextExamEditor
                  valueHTML={answersHTML[idx]}
                  placeholder="Write 30–40 words…"
                  ariaLabel={`Part 3 answer ${idx + 1}`}
                  onChange={(payload) => handleAnswerChange(idx, payload)}
                />

                <div className="meter">
                  <span className={`pill ${within(counts[idx], 20, 60) ? "ok" : ""}`}>
                    {counts[idx]} words (aim 30–40)
                  </span>
                </div>
              </div>
            ))}

            <div className="actions">
            <button type="button" className="btn primary" onClick={handleSubmit}>
  Submit
</button>
              <button type="button" className="btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AptisWritingPart23Feedback({ feedback, status, error }) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <section className="ai-p23-feedback" aria-live="polite">
        <h4>Feedback</h4>
        <p>Checking task fulfilment, language, and word count...</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="ai-p23-feedback error" role="alert">
        <h4>Feedback</h4>
        <p>{error || "Could not generate feedback."}</p>
      </section>
    );
  }

  if (!feedback) return null;

  return (
    <section className="ai-p23-feedback">
      <div className="ai-p23-head">
        <div>
          <h4>Feedback</h4>
          <p className="ai-feedback-note">Generated automatically to help you improve your writing.</p>
          <p>{feedback.overall?.summary}</p>
        </div>
        <span>{feedback.overall?.taskFulfilment?.replace(/_/g, " ")}</span>
      </div>
      {feedback.overall?.wordCountComment ? <p>{feedback.overall.wordCountComment}</p> : null}

      <div className="ai-p23-list">
        {(feedback.answers || []).map((item, index) => (
          <article key={item.index ?? index}>
            <div className="ai-p23-card-head">
              <strong>Reply {index + 1}</strong>
              <small>{item.wordCount} words · {item.wordCountStatus?.replace(/_/g, " ")}</small>
            </div>
            <p><span>Task:</span> {item.taskFulfilment}</p>
            <p><span>Grammar:</span> {item.grammar}</p>
            <p><span>Vocabulary:</span> {item.vocabulary}</p>
            <p><span>Punctuation/spelling:</span> {item.punctuationSpelling}</p>
            <p><span>Cohesion:</span> {item.cohesion}</p>
            <LanguageFixes items={item.languageErrors} />
            <div className="ai-p23-improved">
              <strong>Improved version</strong>
              <p>{item.improvedVersion}</p>
            </div>
          </article>
        ))}
      </div>

      {feedback.priorityAdvice?.length ? (
        <div className="ai-p23-advice">
          <strong>Priority advice</strong>
          <ul>
            {feedback.priorityAdvice.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}
      <blockquote>{feedback.teacherComment}</blockquote>
    </section>
  );
}

function LanguageFixes({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="ai-p23-language-fixes">
      <h5>Mistakes to fix</h5>
      <ul>
        {items.map((item, index) => (
          <li key={`${item.category}-${item.original}-${index}`}>
            <small className={item.category}>{String(item.category || "").replace(/_/g, " ")}</small>
            <p><span>{item.original}</span> → <strong>{item.correction}</strong></p>
            {item.explanation ? <em>{item.explanation}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------
 * HELPERS (copied from Part 4 for consistency)
 * ----------------------------------------------------------- */

function wordCount(s = "") {
  return (s.trim().match(/\b[\p{L}\p{N}’'-]+\b/gu) || []).length;
}
function within(n, min, max) {
  return n >= min && n <= max;
}

function decorateTasks(tasks, { hasTaskAllowlist, allowedTaskSet }) {
  return tasks.map((t, i) => {
    const locked = hasTaskAllowlist && !allowedTaskSet.has(t.id);
    return {
      ...t,
      locked,
      title: `${t.title}${locked ? " 🔒" : ""}`,
    };
  });
}

/* ----- ChipDropdown (same as Part 4) ----- */
function ChipDropdown({ items, value, onChange, label = "Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const current = items[value];

  return (
    <div className="chip-select" ref={ref}>
      <button
        type="button"
        className={`count-chip ${open ? "selected" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value + 1}. ${current?.title || ""}`}
      >
        {value + 1}
        <span className="chip-caret" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <ul className="chip-menu" role="listbox">
          {items.map((it, i) => {
            const active = i === value;
            const locked = !!it.locked;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-disabled={locked}
                  className={`chip-option ${active ? "active" : ""} ${
                    locked ? "locked" : ""
                  }`}
                  onClick={() => {
                    onChange(i);
                    if (!locked) setOpen(false);
                  }}
                  title={it.title}
                >
                  <strong className="num">{i + 1}.</strong>
                  <span className="ttl">{it.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------ HTML ↔ plain text helpers (identical to Part 4) ------------ */

function looksLikeHtml(s = "") {
  return /<([a-z][\w:-]*)\b[^>]*>/i.test(s);
}

function textToHtml(txt = "") {
  const clean = (txt + "").replace(/^\u200E+/, "");
  const safe = clean.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paras = safe.split(/\n{2,}/).map((p) => p.replace(/\n/g, "<br/>"));
  return `<p>${paras.join("</p><p>")}</p>`;
}

function normalizeHtmlForClipboard(html, fallbackText) {
  const plain = htmlToPlainKeepLines(html, fallbackText);
  return textToHtml(plain);
}

function htmlToPlainKeepLines(html = "", fallbackText = "") {
  if (!html) return (fallbackText || "").replace(/\r\n/g, "\n").trim();

  const tmp = document.createElement("div");
  tmp.innerHTML = html.replace(/^\u200E+/, "");

  tmp.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));

  const blocks = [];
  const isBlock = (n) =>
    /^(P|DIV|LI|H[1-6]|PRE|BLOCKQUOTE)$/i.test(n.nodeName);

  if ([...tmp.childNodes].some((n) => n.nodeType === 1 && isBlock(n))) {
    tmp.childNodes.forEach((n) => {
      if (n.nodeType === 1) {
        const t = n.textContent
          .replace(/\u00A0/g, " ")
          .replace(/[ \t]+\n/g, "\n")
          .trimEnd();
        if (t) blocks.push(t);
        if (isBlock(n)) blocks.push("");
      } else if (n.nodeType === 3) {
        const t = n.nodeValue.replace(/\u00A0/g, " ");
        if (t.trim()) blocks.push(t.trimEnd());
      }
    });
  }

  let out = blocks.length ? blocks.join("\n") : tmp.textContent;

  return out
    .replace(/\u00A0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---------- STYLES (matches Part 4) ---------- */

function StyleScope() {
  return (
    <style>{`
      .aptis-writing-p3 { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; color:var(--ink); }
      .aptis-writing-p3 .header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
      .aptis-writing-p3 .title { margin:0; font-size:1.35rem; }
      .aptis-writing-p3 .intro { margin:.25rem 0 0; color:var(--muted); }
      .aptis-writing-p3 .panel { background:var(--panel); border:1px solid #203258; border-radius:16px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,.25); }
      .aptis-writing-p3 .muted { color:var(--muted); }
      .aptis-writing-p3 .grid { display:grid; gap:1rem; }
      .aptis-writing-p3 .block { margin:.75rem 0 1rem; }
      .aptis-writing-p3 .chat-header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:.25rem; }
      .aptis-writing-p3 .chat-name { font-weight:600; }
      .aptis-writing-p3 .chat-label { color:var(--muted); font-size:.85rem; }
      .aptis-writing-p3 .chat-question { margin:.25rem 0 .5rem; }
      .aptis-writing-p3 .pill { padding:.2rem .55rem; border-radius:999px; background:#24365d; border:1px solid #335086; }
      .aptis-writing-p3 .pill.ok { border-color:#2f9d69; }
      .aptis-writing-p3 .meter { margin-top:.35rem; }
      .aptis-writing-p3 .actions { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:1rem; }

      /* Summary styling (from Part 4) */
      .aptis-writing-p3 .summary-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.6rem; }
      .aptis-writing-p3 .summary-actions { display:flex; gap:.4rem; flex-wrap:wrap; }
      .aptis-writing-p3 .summary-grid { display:grid; gap:.8rem; }
      @media(min-width:900px){ .aptis-writing-p3 .summary-grid { grid-template-columns:1fr 1fr 1fr; } }
      .aptis-writing-p3 .card { background:#0f1b31; border:1px solid #2c416f; border-radius:12px; padding:.8rem; }
      .aptis-writing-p3 .card-title { font-weight:700; margin-bottom:.2rem; }
      .aptis-writing-p3 .card-meta { color:var(--muted); font-size:.9rem; margin-bottom:.5rem; }
      .aptis-writing-p3 .preview { background:#0a1528; border:1px solid #223a68; border-radius:10px; padding:.65rem; min-height:3.5rem; white-space:pre-wrap; }

      /* Buttons */
      .aptis-writing-p3 .btn { background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:.45rem .7rem; border-radius:10px; cursor:pointer; }
      .aptis-writing-p3 .btn.primary { background:#294b84; border-color:#3a6ebd; }

      /* Chip dropdown (same as P4) */
      .aptis-writing-p3 .chip-select { position:relative; display:inline-block; }
      .aptis-writing-p3 .count-chip { min-width:2.4rem; display:flex; align-items:center; justify-content:center; gap:.25rem; background:#24365d; border:1px solid #335086; padding:.35rem .5rem; border-radius:999px; }
      .aptis-writing-p3 .count-chip.selected { background:#294b84; border-color:#3a6ebd; }
      .aptis-writing-p3 .chip-menu { position:absolute; right:0; margin-top:.4rem; background:#132647; border:1px solid #2c4b83; border-radius:12px; padding:.35rem; list-style:none; min-width:16rem; max-height:50vh; overflow:auto; z-index:40; }
      .aptis-writing-p3 .chip-option { width:100%; text-align:left; background:transparent; border:0; color:#e6f0ff; padding:.45rem .6rem; border-radius:10px; display:flex; gap:.5rem; cursor:pointer; }
      .aptis-writing-p3 .chip-option.active { background:#294b84; }
      .aptis-writing-p3 .chip-option.locked { opacity:.55; cursor:not-allowed; }

      /* --- Rich text editor host (match Part 4) --- */
.aptis-writing-p3 .rte-editable {
  direction: ltr;
  unicode-bidi: plaintext;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

.aptis-writing-p3 .rte-editable:empty::before {
  content: "\\200E";
  display: inline-block;
}

/* --- Rich text toolbar + buttons (match Part 4) --- */
.aptis-writing-p3 .rte-toolbar {
  display: flex;
  gap: .4rem;
  margin: .35rem 0 .5rem;
}

.aptis-writing-p3 .rte-btn {
  background: #24365d;
  border: 1px solid #335086;
  color: #e6f0ff;
  padding: .35rem .6rem;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: .02em;
  line-height: 1;
  box-shadow: 
    0 1px 0 rgba(0,0,0,.25),
    inset 0 -1px 0 rgba(255,255,255,.03);
  transition:
    transform .06s ease,
    background .12s ease,
    border-color .12s ease,
    box-shadow .12s ease;
}

.aptis-writing-p3 .rte-btn:hover {
  background: #294b84;
  border-color: #3a6ebd;
  box-shadow: 
    0 2px 8px rgba(0,0,0,.25),
    inset 0 -1px 0 rgba(255,255,255,.05);
}

.aptis-writing-p3 .rte-btn:active {
  transform: translateY(1px);
}

.aptis-writing-p3 .rte-btn.active {
  background: #3a6ebd;
  border-color: #6ea8ff;
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,.25),
    0 0 0 1px rgba(110,168,255,.15);
}

.aptis-writing-p3 .rte-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.aptis-writing-p3 .ai-p23-feedback {
  margin-top: .9rem;
  background:#0f1b31;
  border:1px solid #2c416f;
  border-radius:12px;
  padding:.85rem;
}

.aptis-writing-p3 .ai-p23-feedback.error {
  border-color:#c2410c;
  background:#2a1720;
}

.aptis-writing-p3 .ai-p23-feedback h4,
.aptis-writing-p3 .ai-p23-feedback p {
  margin-top:0;
}

.aptis-writing-p3 .ai-p23-head,
.aptis-writing-p3 .ai-p23-card-head {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:.75rem;
}

.aptis-writing-p3 .ai-p23-head span {
  flex:0 0 auto;
  border:1px solid #3a6ebd;
  border-radius:999px;
  padding:.2rem .5rem;
  color:#cfe1ff;
  text-transform:capitalize;
}

.aptis-writing-p3 .ai-feedback-note {
  margin:.1rem 0 .35rem;
  color:#a9b7d1;
  font-size:.9rem;
}

.aptis-writing-p3 .ai-p23-list {
  display:grid;
  gap:.65rem;
}

.aptis-writing-p3 .ai-p23-list article,
.aptis-writing-p3 .ai-p23-advice,
.aptis-writing-p3 .ai-p23-improved {
  background:#13213b;
  border:1px solid #2c416f;
  border-radius:10px;
  padding:.7rem;
}

.aptis-writing-p3 .ai-p23-card-head small,
.aptis-writing-p3 .ai-p23-meta {
  color:#a9b7d1;
}

.aptis-writing-p3 .ai-p23-list p {
  margin:.3rem 0;
  color:#d8e7ff;
}

.aptis-writing-p3 .ai-p23-list span {
  color:#cfe1ff;
  font-weight:700;
}

.aptis-writing-p3 .ai-p23-improved {
  margin-top:.55rem;
}

.aptis-writing-p3 .ai-p23-language-fixes {
  margin:.75rem 0;
  background:#111f38;
  border:1px solid #315184;
  border-left:3px solid #f59e0b;
  border-radius:10px;
  padding:.75rem;
}

.aptis-writing-p3 .ai-p23-language-fixes h5 {
  margin:0 0 .55rem;
  color:#f8fbff;
  font-size:1rem;
}

.aptis-writing-p3 .ai-p23-language-fixes ul {
  display:grid;
  gap:.55rem;
  margin:0;
  padding:0;
}

.aptis-writing-p3 .ai-p23-language-fixes li {
  list-style:none;
  background:#0f1b31;
  border:1px solid #27436f;
  border-radius:8px;
  padding:.65rem;
}

.aptis-writing-p3 .ai-p23-language-fixes small {
  display:inline-block;
  margin-bottom:.25rem;
  padding:.12rem .45rem;
  border-radius:999px;
  font-size:.78rem;
  font-weight:800;
  text-transform:capitalize;
}

.aptis-writing-p3 .ai-p23-language-fixes small.grammar,
.aptis-writing-p3 .ai-p23-language-fixes small.spelling,
.aptis-writing-p3 .ai-p23-language-fixes small.punctuation {
  color:#fecaca;
  background:rgba(185,28,28,.18);
  border:1px solid rgba(248,113,113,.24);
}

.aptis-writing-p3 .ai-p23-language-fixes small.vocabulary {
  color:#bbf7d0;
  background:rgba(4,120,87,.18);
  border:1px solid rgba(52,211,153,.24);
}

.aptis-writing-p3 .ai-p23-language-fixes small.word_order,
.aptis-writing-p3 .ai-p23-language-fixes small.missing_word,
.aptis-writing-p3 .ai-p23-language-fixes small.cohesion {
  color:#bfdbfe;
  background:rgba(29,78,216,.2);
  border:1px solid rgba(96,165,250,.25);
}

.aptis-writing-p3 .ai-p23-language-fixes p {
  margin:.25rem 0 .2rem;
  color:#e6f0ff;
}

.aptis-writing-p3 .ai-p23-language-fixes span {
  color:#fca5a5;
  font-weight:600;
}

.aptis-writing-p3 .ai-p23-language-fixes strong {
  color:#86efac;
}

.aptis-writing-p3 .ai-p23-language-fixes em {
  display:block;
  color:#a9b7d1;
}

:root[data-theme="light"] .aptis-writing-p3 .ai-p23-language-fixes {
  background:#f4f8ff !important;
  border-color:#bfd3ee !important;
  border-left-color:#f59e0b !important;
  color:#172033 !important;
}

:root[data-theme="light"] .aptis-writing-p3 .ai-p23-language-fixes h5 {
  color:#172033 !important;
}

:root[data-theme="light"] .aptis-writing-p3 .ai-p23-language-fixes li {
  background:#ffffff !important;
  border-color:#d9e5f3 !important;
}

:root[data-theme="light"] .aptis-writing-p3 .ai-p23-language-fixes p {
  color:#172033 !important;
}

:root[data-theme="light"] .aptis-writing-p3 .ai-p23-language-fixes span {
  color:#b42318 !important;
}

:root[data-theme="light"] .aptis-writing-p3 .ai-p23-language-fixes strong {
  color:#067647 !important;
}

:root[data-theme="light"] .aptis-writing-p3 .ai-p23-language-fixes em {
  color:#536171 !important;
}

.aptis-writing-p3 .ai-p23-advice {
  margin-top:.75rem;
}

.aptis-writing-p3 .ai-p23-advice ul {
  margin:.4rem 0 0;
  padding-left:1.2rem;
}

.aptis-writing-p3 .ai-p23-feedback blockquote {
  margin:.8rem 0 0;
  padding-left:.75rem;
  border-left:3px solid #4a79d8;
  color:#d8e7ff;
}

.aptis-writing-p3 .ai-p23-meta {
  margin:.65rem 0 0;
  font-size:.85rem;
}

/* compact mobile variant */
@media (max-width: 520px) {
  .aptis-writing-p3 .rte-btn {
    padding: .32rem .5rem;
    border-radius: 10px;
  }
}

    `}</style>
  );
}
