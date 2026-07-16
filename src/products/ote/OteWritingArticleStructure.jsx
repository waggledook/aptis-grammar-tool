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
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { ARTICLE_PLANS, ARTICLE_STRUCTURE_QUIZ } from "./data/oteArticleStructureData.js";
import "./styles/ote.css";

function sameAnswers(selected = [], answers = []) {
  return selected.length === answers.length && answers.every((answer) => selected.includes(answer));
}

export default function OteWritingArticleStructure({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [articleId, setArticleId] = useState(ARTICLE_PLANS[0].id);
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [contentSelections, setContentSelections] = useState({});
  const [contentChecked, setContentChecked] = useState({});
  const [planAnswers, setPlanAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [suggestionsShown, setSuggestionsShown] = useState({});
  const [openingAnswers, setOpeningAnswers] = useState({});
  const [endingAnswers, setEndingAnswers] = useState({});
  const [modelsShown, setModelsShown] = useState({});
  const [overlayShown, setOverlayShown] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState({});
  const loggedRef = useRef(false);
  const article = ARTICLE_PLANS.find((item) => item.id === articleId) || ARTICLE_PLANS[0];
  const paragraph = article.paragraphs[paragraphIndex];
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/article-review" : "/ote/writing/training/article-review");
  const reviewStructurePath = getSitePath(nativeRoutes ? "/writing/training/article-review/structure" : "/ote/writing/training/article-review/structure");
  const quizScore = useMemo(
    () => ARTICLE_STRUCTURE_QUIZ.filter((question) => quizChecked[question.id] && sameAnswers(quizAnswers[question.id], question.answers)).length,
    [quizAnswers, quizChecked]
  );
  const quizComplete = ARTICLE_STRUCTURE_QUIZ.every((question) => quizChecked[question.id]);
  const lessonComplete = ARTICLE_PLANS.every((item) => modelsShown[item.id]) && quizComplete;
  const currentContent = contentSelections[article.id] || [];
  const contentIsCorrect = contentChecked[article.id] && sameAnswers(currentContent, article.contentAnswers);

  useEffect(() => {
    if (!lessonComplete || loggedRef.current) return;
    loggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "writing.article-review.article-structure",
      section: "writing",
      part: "part-2",
      mode: "article_structure",
      taskId: "article-structure",
      taskTitle: "Article planning and structure",
      score: quizScore,
      total: ARTICLE_STRUCTURE_QUIZ.length,
    }).catch((error) => console.warn("[OTE article structure] completion save failed", error));
  }, [lessonComplete, quizScore]);

  function selectArticle(id) {
    setArticleId(id);
    setParagraphIndex(0);
  }

  function toggleContent(optionIndex) {
    if (contentChecked[article.id]) return;
    setContentSelections((current) => {
      const selected = current[article.id] || [];
      if (selected.includes(optionIndex)) return { ...current, [article.id]: selected.filter((value) => value !== optionIndex) };
      if (selected.length >= 3) return current;
      return { ...current, [article.id]: [...selected, optionIndex] };
    });
  }

  function noteKey(fieldIndex) {
    return `${article.id}-${paragraphIndex}-${fieldIndex}`;
  }

  function updateNote(fieldIndex, value) {
    setNotes((current) => ({ ...current, [noteKey(fieldIndex)]: value }));
  }

  function toggleQuizOption(question, optionIndex) {
    if (quizChecked[question.id]) return;
    setQuizAnswers((current) => {
      const selected = current[question.id] || [];
      if (!question.multiple) return { ...current, [question.id]: [optionIndex] };
      return { ...current, [question.id]: selected.includes(optionIndex) ? selected.filter((value) => value !== optionIndex) : [...selected, optionIndex] };
    });
    if (!question.multiple) setQuizChecked((current) => ({ ...current, [question.id]: true }));
  }

  function resetQuiz() {
    setQuizAnswers({});
    setQuizChecked({});
    loggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-review-structure-page ote-article-structure-page">
      <Seo title="OTE Article Planning and Structure | Seif English" description="Plan connected, reader-friendly OTE articles that answer every content point." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} /> Back to article / review training</button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 2 · Article planning</p>
        <h1>Article Planning and Structure</h1>
        <p>An article should answer every question in the advert, but it should not read like a list of separate answers.</p>
      </header>

      <aside className="ote-review-flexible-note">
        <Lightbulb size={25} />
        <div><strong>Cover the task, then connect it</strong><p>Use the advert questions as a content checklist. Your structure can vary, but the finished article should develop those points naturally, engage the reader and end with a clear reflection or message.</p></div>
      </aside>

      <section className="ote-review-structure-intro">
        <div><span>1</span><p><strong>Extract</strong> the content points</p></div><ChevronRight size={18} />
        <div><span>2</span><p><strong>Build</strong> a connected plan</p></div><ChevronRight size={18} />
        <div><span>3</span><p><strong>Analyse</strong> the complete article</p></div>
      </section>

      <section className="ote-review-planner">
        <nav className="ote-review-selector" aria-label="Choose an article to plan">
          {ARTICLE_PLANS.map((item, index) => <button type="button" className={`${article.id === item.id ? "is-active" : ""} ${modelsShown[item.id] ? "is-complete" : ""}`} onClick={() => selectArticle(item.id)} key={item.id}><PenLine size={21} /><span><small>Article {index + 1}</small><strong>{item.tabLabel}</strong></span>{modelsShown[item.id] ? <CheckCircle2 size={19} /> : <ChevronRight size={19} />}</button>)}
        </nav>

        <article className="ote-review-task-card">
          <div className="ote-review-task-label"><FileText size={19} /><span>Task</span><strong>100–160 words</strong></div>
          <h2>{article.kicker}</h2><p><strong>{article.task}</strong></p><p>{article.questions}</p><p className="ote-review-publication">{article.publication}</p>
        </article>

        <section className="ote-article-preplan-grid">
          <article className={`ote-article-content-check ${contentChecked[article.id] ? (contentIsCorrect ? "is-correct" : "is-wrong") : ""}`}>
            <header><span>Part 1</span><h2>Find the content points</h2><p>Which three things must the article include?</p></header>
            <div>{article.contentOptions.map((option, optionIndex) => {
              const selected = currentContent.includes(optionIndex);
              const answer = article.contentAnswers.includes(optionIndex);
              return <button type="button" disabled={contentChecked[article.id]} className={`${selected ? "is-selected" : ""} ${contentChecked[article.id] && answer ? "is-answer" : ""}`} onClick={() => toggleContent(optionIndex)} key={option}><span>{selected ? <Check size={15} /> : ""}</span>{option}</button>;
            })}</div>
            {!contentChecked[article.id] ? <button className="ote-article-check-button" type="button" disabled={currentContent.length !== 3} onClick={() => setContentChecked((current) => ({ ...current, [article.id]: true }))}>Check three points</button> : <p className="ote-article-preplan-feedback">{contentIsCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span><strong>{contentIsCorrect ? "Correct." : "Review the highlighted points."}</strong> The advert questions form your content checklist. You can add relevant detail, but all three must be clearly covered.</span></p>}
          </article>

          <article className="ote-article-plan-choice">
            <header><span>Part 2</span><h2>Choose the strongest plan</h2><p>Which plan covers the task as one connected article?</p></header>
            <div>{article.plans.map((plan, planIndex) => {
              const answered = planAnswers[article.id] != null;
              const selected = planAnswers[article.id] === planIndex;
              return <button type="button" disabled={answered} className={`${selected ? "is-selected" : ""} ${answered && planIndex === article.planAnswer ? "is-answer" : ""}`} onClick={() => setPlanAnswers((current) => ({ ...current, [article.id]: planIndex }))} key={plan.label}><strong>{plan.label}</strong><ul>{plan.points.map((point) => <li key={point}>{point}</li>)}</ul></button>;
            })}</div>
            {planAnswers[article.id] != null ? <p className={`ote-article-preplan-feedback ${planAnswers[article.id] === article.planAnswer ? "is-correct" : "is-wrong"}`}>{planAnswers[article.id] === article.planAnswer ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span><strong>{planAnswers[article.id] === article.planAnswer ? "Strong choice." : `The strongest choice is Plan ${String.fromCharCode(65 + article.planAnswer)}.`}</strong> {article.planFeedback}</span></p> : null}
          </article>
        </section>

        <div className="ote-review-paragraph-stepper" aria-label="Article paragraphs">
          {article.paragraphs.map((item, index) => {
            const hasNotes = item.fields.some((_, fieldIndex) => notes[`${article.id}-${index}-${fieldIndex}`]?.trim());
            return <button type="button" className={paragraphIndex === index ? "is-active" : ""} onClick={() => setParagraphIndex(index)} key={item.label}><span>{hasNotes ? <Check size={15} /> : index + 1}</span><small>Paragraph {index + 1}</small><strong>{item.label}</strong></button>;
          })}
        </div>

        <section className="ote-review-plan-workspace">
          <header><div><p className="ote-kicker">Guided planning · Paragraph {paragraphIndex + 1} of 4</p><h2>{paragraph.label}</h2></div><span className="ote-review-purpose-pill">{paragraph.purpose}</span></header>
          <div className="ote-review-plan-columns">
            <div className="ote-review-guiding-questions"><h3>Think about these questions</h3><ul>{paragraph.questions.map((question) => <li key={question}>{question}</li>)}</ul></div>
            <div className="ote-review-note-fields"><h3>Your short notes</h3>{paragraph.fields.map((field, fieldIndex) => <label key={field}>{field}<input type="text" value={notes[noteKey(fieldIndex)] || ""} onChange={(event) => updateNote(fieldIndex, event.target.value)} placeholder="Add a brief idea…" /></label>)}</div>
          </div>
          <button className="ote-review-reveal-button" type="button" onClick={() => setSuggestionsShown((current) => ({ ...current, [`${article.id}-${paragraphIndex}`]: !current[`${article.id}-${paragraphIndex}`] }))}><Eye size={18} /> {suggestionsShown[`${article.id}-${paragraphIndex}`] ? "Hide suggested notes" : "Show suggested notes"}</button>
          {suggestionsShown[`${article.id}-${paragraphIndex}`] ? <div className="ote-review-suggested-notes"><span>Suggested notes</span><div>{paragraph.suggestions.map((suggestion) => <span key={suggestion}>{suggestion}</span>)}</div></div> : null}
          {paragraph.tip ? <aside className="ote-review-planning-tip"><Lightbulb size={20} /><div><strong>Planning tip</strong><p>{paragraph.tip}</p>{paragraph.comparison ? <div className="ote-review-plan-comparison"><span>{paragraph.comparison[0]}</span><ArrowRight size={17} /><span>{paragraph.comparison[1]}</span></div> : null}</div></aside> : null}
          <footer><button type="button" disabled={paragraphIndex === 0} onClick={() => setParagraphIndex((current) => current - 1)}><ArrowLeft size={17} /> Previous</button>{paragraphIndex < 3 ? <button type="button" onClick={() => setParagraphIndex((current) => current + 1)}>Next paragraph <ArrowRight size={17} /></button> : null}</footer>
        </section>

        <section className="ote-article-opening-ending">
          <div><p className="ote-kicker">Opening and ending check</p><h2>Make the article feel complete</h2></div>
          {[article.opening, article.ending].map((checkItem, checkIndex) => {
            const answerMap = checkIndex === 0 ? openingAnswers : endingAnswers;
            const setter = checkIndex === 0 ? setOpeningAnswers : setEndingAnswers;
            const selected = answerMap[article.id];
            return <article key={checkItem.prompt}><h3>{checkItem.prompt}</h3><div>{checkItem.options.map((option, optionIndex) => <button type="button" disabled={selected != null} className={`${selected === optionIndex ? "is-selected" : ""} ${selected != null && optionIndex === checkItem.answer ? "is-answer" : ""}`} onClick={() => setter((current) => ({ ...current, [article.id]: optionIndex }))} key={option}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>{selected != null ? <p className={selected === checkItem.answer ? "is-correct" : "is-wrong"}>{selected === checkItem.answer ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span><strong>{selected === checkItem.answer ? "Correct." : `The strongest answer is ${String.fromCharCode(65 + checkItem.answer)}.`}</strong> {checkItem.feedback}</span></p> : null}</article>;
          })}
          <button className="ote-article-model-reveal" type="button" disabled={openingAnswers[article.id] == null || endingAnswers[article.id] == null} onClick={() => setModelsShown((current) => ({ ...current, [article.id]: true }))}>Show complete model <Sparkles size={18} /></button>
        </section>

        {modelsShown[article.id] ? <section className="ote-review-structure-model">
          <header><div><p className="ote-kicker">Complete model</p><h2>{article.modelTitle}</h2></div><button type="button" className={overlayShown[article.id] ? "is-active" : ""} onClick={() => setOverlayShown((current) => ({ ...current, [article.id]: !current[article.id] }))}><ListChecks size={18} /> {overlayShown[article.id] ? "Hide structure labels" : "Show structure labels"}</button></header>
          <div>{article.paragraphs.map((item, index) => <article className={overlayShown[article.id] ? "has-label" : ""} key={item.model}>{overlayShown[article.id] ? <span>Paragraph {index + 1}<strong>{item.purpose}</strong></span> : null}<p>{item.model}</p></article>)}</div>
          <div className="ote-article-model-meta"><strong>{article.wordCount} words</strong><span>{article.sequence}</span></div>
        </section> : null}
      </section>

      <section className="ote-training-section ote-review-structure-quiz">
        <div className="ote-training-quiz-header"><div><p className="ote-kicker">Model analysis</p><h2>Compare the Articles</h2><p>Notice how the structure changes with the writer’s purpose.</p></div><div className="ote-training-score">{quizScore}/{ARTICLE_STRUCTURE_QUIZ.length}</div></div>
        {ARTICLE_STRUCTURE_QUIZ.map((question, questionIndex) => {
          const selected = quizAnswers[question.id] || [];
          const checked = quizChecked[question.id];
          const correct = checked && sameAnswers(selected, question.answers);
          return <article className={`ote-review-quiz-card ${checked ? (correct ? "is-correct" : "is-wrong") : ""}`} key={question.id}><h3>{questionIndex + 1}. {question.prompt}</h3><div>{question.options.map((option, optionIndex) => { const isSelected = selected.includes(optionIndex); const isAnswer = question.answers.includes(optionIndex); return <button type="button" disabled={checked} className={`${isSelected ? "is-selected" : ""} ${checked && isAnswer ? "is-answer" : ""}`} onClick={() => toggleQuizOption(question, optionIndex)} key={option}><span>{question.multiple ? (isSelected ? <Check size={15} /> : "") : String.fromCharCode(65 + optionIndex)}</span>{option}</button>; })}</div>{question.multiple && !checked ? <button className="ote-review-check-multiple" type="button" disabled={!selected.length} onClick={() => setQuizChecked((current) => ({ ...current, [question.id]: true }))}>Check selections</button> : null}{checked ? <p className="ote-review-quiz-feedback">{correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span><strong>{correct ? "Correct." : "Review this answer."}</strong> {question.feedback}</span></p> : null}</article>;
        })}
        {quizComplete ? <div className="ote-training-complete"><strong>{quizScore === ARTICLE_STRUCTURE_QUIZ.length ? "Excellent analysis." : "Articles reviewed."}</strong><span>You answered {quizScore} of {ARTICLE_STRUCTURE_QUIZ.length} correctly.</span><button type="button" onClick={resetQuiz}><RotateCcw size={17} /> Try again</button></div> : null}
      </section>

      <section className="ote-training-section ote-review-cheat-sheet">
        <div className="ote-review-cheat-heading"><div><p className="ote-kicker">Quick reference</p><h2>Article Structure Cheat Sheet</h2></div><PenLine size={30} /></div>
        <div className="ote-article-cheat-types">
          <article><span>Type 1</span><h3>A Personal Experience or Change</h3><ol><li><strong>Hook and situation</strong> — begin with a moment, detail or natural question.</li><li><strong>What happened</strong> — explain the decision, event and any difficulty.</li><li><strong>Effects and significance</strong> — show results through an example.</li><li><strong>Final reflection</strong> — say why it mattered and address the reader.</li></ol><p>Situation → action → result → reflection</p></article>
          <article><span>Type 2</span><h3>An Informative or Recommendation Article</h3><ol><li><strong>Hook and topic</strong> — show immediately why it matters.</li><li><strong>Explain or describe</strong> — give useful background.</li><li><strong>Benefits and evidence</strong> — demonstrate its value.</li><li><strong>Message to the reader</strong> — encourage and leave a final thought.</li></ol><p>Introduce → explain → demonstrate → encourage</p></article>
        </div>
      </section>

      <section className="ote-review-structure-next"><div><p className="ote-kicker">Next lesson</p><h2>Plan and structure a review</h2><p>Now apply a similarly clear but evaluative structure to two review tasks.</p></div><button type="button" onClick={() => navigate(reviewStructurePath)}>Continue to Review Planning <ArrowRight size={18} /></button></section>
    </main>
  );
}
