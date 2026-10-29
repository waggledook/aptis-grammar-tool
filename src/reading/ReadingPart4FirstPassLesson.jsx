import React, { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createReadingPart4LiveGame } from "../api/liveGames.js";
import { getSitePath } from "../siteConfig.js";
import Seo from "../components/common/Seo.jsx";
import { SAVING_SMELLS_FIRST_PASS_TASK as task } from "./savingSmellsFirstPass.js";
import { FirstPassExample, FirstPassReviewNote } from "./ReadingPart4FirstPassShared.jsx";
import "./readingPart4FirstPass.css";

export default function ReadingPart4FirstPassLesson() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function launch() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { gameId } = await createReadingPart4LiveGame({ taskId: task.id, title: `Aptis Reading Part 4 · ${task.title} · Main idea first` });
      navigate(getSitePath(`/live/aptis-reading-part4/host/${gameId}`));
    } catch (cause) { setError(cause.message || "The reading room could not be created."); }
    finally { setBusy(false); }
  }
  return <main className="sfp-page sfp-lesson"><Seo title={`${task.title} · Reading Part 4 classroom lesson`} description="A main-idea-first live lesson: a worked example, seven scaffolded paragraph rounds and a final full-bank matching review." /><Link className="sfp-back" to={getSitePath("/teacher-resources")}><ArrowLeft size={16} />Classroom resources</Link><header className="sfp-lesson-hero"><div><p className="sfp-kicker">Aptis Reading Part 4 · Teacher lesson</p><h1>{task.title}</h1><p>Understand the paragraph first. Find the heading second.</p><span className="sfp-level">B2 classroom practice · 7 student rounds</span></div><BookOpen size={48} /></header><section className="sfp-panel"><div className="sfp-lesson-flow">{["Worked example", "Main idea in your own words", "Four headings", "Anonymous discussion", "Full-bank review"].map((label, index) => <React.Fragment key={label}><span>{label}</span>{index < 4 && <ArrowRight size={15} />}</React.Fragment>)}</div><p>Each student writes a short main idea while the headings are hidden. You then reveal four headings, collect choices and discuss the answer with a few anonymous responses. After all seven paragraphs, open the complete article and the original eight headings for a final matching review.</p><p className="sfp-muted">Reading and writing: around 60–90 seconds. Heading choice: around 20–30 seconds. Timings are flexible and every stage waits for you. The written responses are ungraded; small language mistakes do not matter.</p><button className="sfp-button sfp-primary" disabled={busy} type="button" onClick={launch}><Play size={18} />{busy ? "Creating lesson room…" : "Host first-pass lesson"}</button></section><FirstPassExample task={task} /><FirstPassReviewNote task={task} /><details className="sfp-teacher-notes"><summary>Teacher preparation · models, headings and evidence</summary><p>These are discussion models, not exact-match answers. Accessible B2 is a drafting target, not an officially calibrated level.</p><p><strong>Useful comparisons:</strong> paragraphs 1 and 2 (how a smell forms / how it is recorded); paragraphs 3 and 4 (collecting human responses / helping visitors learn); paragraphs 6 and 7 (what makes a smell worth recording / who should help choose).</p>{task.paragraphs.map((paragraph) => <section key={paragraph.id}><h2>Paragraph {paragraph.id}</h2><p>{paragraph.text}</p><strong>Main idea: {paragraph.modelMainIdea}</strong><ol>{paragraph.roundOptions.map((heading, index) => <li key={heading}>{heading}{index === paragraph.correctOptionIndex ? " ✓" : ""}</li>)}</ol><p>{paragraph.roundExplanation}</p><blockquote>{paragraph.evidenceParts[0]}</blockquote></section>)}<p>Final key: {task.paragraphs.map((paragraph) => `${paragraph.id} ${paragraph.answer}`).join(" · ")}. Unused: E.</p><p>{task.firstPass.unusedExplanation}</p></details><details className="sfp-teacher-notes"><summary>Research and format notes · teacher only</summary><p>This original teaching passage simplifies the sources below. Its workshop, bakery, harbour and factory scenarios are illustrative. The four-option rounds and written responses are classroom scaffolding. The words “strong” and “sweet” in paragraph 5 illustrate imprecise descriptions; they are not quotations from a named historical document.</p><p>The Bembibre and Strlič paper is published under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>; this original teaching passage simplifies and reorganises its ideas.</p><ul>{task.firstPass.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></details>{error && <p className="sfp-error" role="alert">{error}</p>}</main>;
}
