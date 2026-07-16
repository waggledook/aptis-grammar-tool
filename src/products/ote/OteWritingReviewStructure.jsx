import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Lightbulb,
  ListChecks,
  PenLine,
  RotateCcw,
  Sparkles,
  Utensils,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { REVIEW_PLANS, STRUCTURE_QUIZ } from "./data/oteReviewStructureData.js";
import "./styles/ote.css";

function sameAnswers(selected = [], answers = []) {
  return selected.length === answers.length && answers.every((answer) => selected.includes(answer));
}

export default function OteWritingReviewStructure({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [reviewId, setReviewId] = useState(REVIEW_PLANS[0].id);
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [notes, setNotes] = useState({});
  const [suggestionsShown, setSuggestionsShown] = useState({});
  const [modelsShown, setModelsShown] = useState({});
  const [overlayShown, setOverlayShown] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState({});
  const loggedRef = useRef(false);
  const review = REVIEW_PLANS.find((item) => item.id === reviewId) || REVIEW_PLANS[0];
  const paragraph = review.paragraphs[paragraphIndex];
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/article-review" : "/ote/writing/training/article-review");
  const vocabularyPath = getSitePath(nativeRoutes ? "/writing/training/article-review/vocabulary" : "/ote/writing/training/article-review/vocabulary");
  const quizScore = useMemo(
    () => STRUCTURE_QUIZ.filter((question) => quizChecked[question.id] && sameAnswers(quizAnswers[question.id], question.answers)).length,
    [quizAnswers, quizChecked]
  );
  const quizComplete = STRUCTURE_QUIZ.every((question) => quizChecked[question.id]);
  const lessonComplete = REVIEW_PLANS.every((item) => modelsShown[item.id]) && quizComplete;

  useEffect(() => {
    if (!lessonComplete || loggedRef.current) return;
    loggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "writing.article-review.structure",
      section: "writing",
      part: "part-2",
      mode: "review_structure",
      taskId: "review-structure",
      taskTitle: "Review planning and structure",
      score: quizScore,
      total: STRUCTURE_QUIZ.length,
    }).catch((error) => console.warn("[OTE review structure] completion save failed", error));
  }, [lessonComplete, quizScore]);

  function selectReview(id) {
    setReviewId(id);
    setParagraphIndex(0);
  }

  function noteKey(fieldIndex) {
    return `${review.id}-${paragraphIndex}-${fieldIndex}`;
  }

  function updateNote(fieldIndex, value) {
    setNotes((current) => ({ ...current, [noteKey(fieldIndex)]: value }));
  }

  function toggleQuizOption(question, optionIndex) {
    if (quizChecked[question.id]) return;
    setQuizAnswers((current) => {
      const selected = current[question.id] || [];
      if (!question.multiple) return { ...current, [question.id]: [optionIndex] };
      return {
        ...current,
        [question.id]: selected.includes(optionIndex)
          ? selected.filter((value) => value !== optionIndex)
          : [...selected, optionIndex],
      };
    });
    if (!question.multiple) setQuizChecked((current) => ({ ...current, [question.id]: true }));
  }

  function resetQuiz() {
    setQuizAnswers({});
    setQuizChecked({});
    loggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-review-structure-page">
      <Seo
        title="OTE Review Planning and Structure | Seif English"
        description="Plan and organise OTE restaurant and experience reviews using an adaptable paragraph structure."
      />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} /> Back to article / review training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 2 · Review planning</p>
        <h1>Review Planning and Structure</h1>
        <p>A successful review does more than describe something. It evaluates specific features and helps the reader decide whether it is worth trying.</p>
      </header>

      <aside className="ote-review-flexible-note">
        <Lightbulb size={25} />
        <div>
          <strong>A reliable route, not a fixed formula</strong>
          <p>The four-paragraph structure in this lesson is our recommended approach because it gives every paragraph a clear purpose. Other structures can be equally effective if they answer the task fully, organise ideas logically and stay within the word limit.</p>
        </div>
      </aside>

      <section className="ote-review-structure-intro">
        <div><span>1</span><p><strong>Plan</strong> with short notes</p></div>
        <ChevronRight size={18} />
        <div><span>2</span><p><strong>Compare</strong> suggested ideas</p></div>
        <ChevronRight size={18} />
        <div><span>3</span><p><strong>Analyse</strong> the complete model</p></div>
      </section>

      <section className="ote-review-planner">
        <nav className="ote-review-selector" aria-label="Choose a review to plan">
          {REVIEW_PLANS.map((item) => (
            <button type="button" className={`${review.id === item.id ? "is-active" : ""} ${modelsShown[item.id] ? "is-complete" : ""}`} onClick={() => selectReview(item.id)} key={item.id}>
              {item.id === "restaurant" ? <Utensils size={21} /> : <Sparkles size={21} />}
              <span><small>Review {REVIEW_PLANS.indexOf(item) + 1}</small><strong>{item.tabLabel}</strong></span>
              {modelsShown[item.id] ? <CheckCircle2 size={19} /> : <ChevronRight size={19} />}
            </button>
          ))}
        </nav>

        <article className="ote-review-task-card">
          <div className="ote-review-task-label"><FileText size={19} /><span>Task</span><strong>100–160 words</strong></div>
          <h2>{review.kicker}</h2>
          <p><strong>{review.task}</strong></p>
          <p>{review.questions}</p>
          <p className="ote-review-publication">{review.publication}</p>
        </article>

        <div className="ote-review-paragraph-stepper" aria-label="Review paragraphs">
          {review.paragraphs.map((item, index) => {
            const hasNotes = item.fields.some((_, fieldIndex) => notes[`${review.id}-${index}-${fieldIndex}`]?.trim());
            return (
              <button type="button" className={paragraphIndex === index ? "is-active" : ""} onClick={() => setParagraphIndex(index)} key={item.label}>
                <span>{hasNotes ? <Check size={15} /> : index + 1}</span>
                <small>Paragraph {index + 1}</small>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </div>

        <section className="ote-review-plan-workspace">
          <header>
            <div><p className="ote-kicker">Paragraph {paragraphIndex + 1} of 4</p><h2>{paragraph.label}</h2></div>
            <span className="ote-review-purpose-pill">{paragraph.purpose}</span>
          </header>
          <div className="ote-review-plan-columns">
            <div className="ote-review-guiding-questions">
              <h3>Think about these questions</h3>
              <ul>{paragraph.questions.map((question) => <li key={question}>{question}</li>)}</ul>
            </div>
            <div className="ote-review-note-fields">
              <h3>Your short notes</h3>
              {paragraph.fields.map((field, fieldIndex) => (
                <label key={field}>{field}<input type="text" value={notes[noteKey(fieldIndex)] || ""} onChange={(event) => updateNote(fieldIndex, event.target.value)} placeholder="Add a brief idea…" /></label>
              ))}
            </div>
          </div>
          <button className="ote-review-reveal-button" type="button" onClick={() => setSuggestionsShown((current) => ({ ...current, [`${review.id}-${paragraphIndex}`]: !current[`${review.id}-${paragraphIndex}`] }))}>
            <Eye size={18} /> {suggestionsShown[`${review.id}-${paragraphIndex}`] ? "Hide suggested notes" : "Show suggested notes"}
          </button>
          {suggestionsShown[`${review.id}-${paragraphIndex}`] ? (
            <div className="ote-review-suggested-notes"><span>Suggested notes</span><div>{paragraph.suggestions.map((suggestion) => <span key={suggestion}>{suggestion}</span>)}</div></div>
          ) : null}
          {paragraph.tip ? <aside className="ote-review-planning-tip"><Lightbulb size={20} /><div><strong>Planning tip</strong><p>{paragraph.tip}</p>{paragraph.comparison ? <div className="ote-review-plan-comparison"><span>{paragraph.comparison[0]}</span><ArrowRight size={17} /><span>{paragraph.comparison[1]}</span></div> : null}</div></aside> : null}
          <footer>
            <button type="button" disabled={paragraphIndex === 0} onClick={() => setParagraphIndex((current) => current - 1)}><ArrowLeft size={17} /> Previous</button>
            {paragraphIndex < 3 ? <button type="button" onClick={() => setParagraphIndex((current) => current + 1)}>Next paragraph <ArrowRight size={17} /></button> : <button type="button" onClick={() => setModelsShown((current) => ({ ...current, [review.id]: true }))}>Reveal complete model <Sparkles size={17} /></button>}
          </footer>
        </section>

        {modelsShown[review.id] ? (
          <section className="ote-review-structure-model">
            <header><div><p className="ote-kicker">Complete model</p><h2>{review.modelTitle}</h2></div><button type="button" className={overlayShown[review.id] ? "is-active" : ""} onClick={() => setOverlayShown((current) => ({ ...current, [review.id]: !current[review.id] }))}><ListChecks size={18} /> {overlayShown[review.id] ? "Hide structure labels" : "Show structure labels"}</button></header>
            <div>{review.paragraphs.map((item, index) => <article className={overlayShown[review.id] ? "has-label" : ""} key={item.model}>{overlayShown[review.id] ? <span>Paragraph {index + 1}<strong>{item.purpose}</strong></span> : null}<p>{item.model}</p></article>)}</div>
            <strong className="ote-review-model-count">{review.wordCount} words</strong>
          </section>
        ) : null}
      </section>

      <section className="ote-training-section ote-review-structure-quiz">
        <div className="ote-training-quiz-header"><div><p className="ote-kicker">Model analysis</p><h2>Compare the Models</h2><p>Check what makes both reviews clear and convincing.</p></div><div className="ote-training-score">{quizScore}/{STRUCTURE_QUIZ.length}</div></div>
        {STRUCTURE_QUIZ.map((question, questionIndex) => {
          const selected = quizAnswers[question.id] || [];
          const checked = quizChecked[question.id];
          const correct = checked && sameAnswers(selected, question.answers);
          return (
            <article className={`ote-review-quiz-card ${checked ? (correct ? "is-correct" : "is-wrong") : ""}`} key={question.id}>
              <h3>{questionIndex + 1}. {question.prompt}</h3>
              <div>{question.options.map((option, optionIndex) => {
                const isSelected = selected.includes(optionIndex);
                const isAnswer = question.answers.includes(optionIndex);
                return <button type="button" disabled={checked} className={`${isSelected ? "is-selected" : ""} ${checked && isAnswer ? "is-answer" : ""}`} onClick={() => toggleQuizOption(question, optionIndex)} key={option}><span>{question.multiple ? (isSelected ? <Check size={15} /> : "") : String.fromCharCode(65 + optionIndex)}</span>{option}</button>;
              })}</div>
              {question.multiple && !checked ? <button className="ote-review-check-multiple" type="button" disabled={!selected.length} onClick={() => setQuizChecked((current) => ({ ...current, [question.id]: true }))}>Check selections</button> : null}
              {checked ? <p className="ote-review-quiz-feedback">{correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span><strong>{correct ? "Correct." : "Review this answer."}</strong> {question.feedback}</span></p> : null}
            </article>
          );
        })}
        {quizComplete ? <div className="ote-training-complete"><strong>{quizScore === STRUCTURE_QUIZ.length ? "Excellent analysis." : "Models reviewed."}</strong><span>You answered {quizScore} of {STRUCTURE_QUIZ.length} correctly.</span><button type="button" onClick={resetQuiz}><RotateCcw size={17} /> Try again</button></div> : null}
      </section>

      <section className="ote-training-section ote-review-cheat-sheet">
        <div className="ote-review-cheat-heading"><div><p className="ote-kicker">Quick reference</p><h2>Review Structure Cheat Sheet</h2></div><PenLine size={30} /></div>
        <div className="ote-review-cheat-grid">
          <article><span>1</span><h3>Introduce it</h3><p>Say what it is and when, where or why you tried it.</p><small>I recently visited… · I decided to try…</small></article>
          <article><span>2</span><h3>Evaluate strengths</h3><p>Choose two or three aspects and support opinions with details.</p><small>What impressed me most was…</small></article>
          <article><span>3</span><h3>Explain a limitation</h3><p>Describe one clear weakness and explain its effect.</p><small>The main drawback was…</small></article>
          <article><span>4</span><h3>Judge and recommend</h3><p>Give your opinion, target reader and any final condition.</p><small>I would recommend it, although…</small></article>
        </div>
        <aside className="ote-review-three-paragraph"><strong>Three paragraphs can work too</strong><p>When the limitation is brief, include it in the main evaluation: introduction → strengths plus a brief limitation → recommendation. Four paragraphs are often clearest near the upper word limit, but the number of paragraphs matters less than giving each one a clear purpose.</p><blockquote>The food was fresh and reasonably priced, although the limited menu may disappoint vegetarian customers.</blockquote></aside>
        <div className="ote-review-final-reminder"><span>Introduce</span><ArrowRight size={17} /><span>Evaluate</span><ArrowRight size={17} /><span>Explain a limitation</span><ArrowRight size={17} /><span>Recommend</span></div>
      </section>

      <section className="ote-review-structure-next">
        <div><p className="ote-kicker">Next lesson</p><h2>Build precise review vocabulary</h2><p>Now choose stronger language for the specific aspects you want to evaluate.</p></div>
        <button type="button" onClick={() => navigate(vocabularyPath)}>Continue to Review Vocabulary <ArrowRight size={18} /></button>
      </section>
    </main>
  );
}
