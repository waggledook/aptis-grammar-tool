import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Layers3,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const overarchingOptions = [
  {
    id: "A",
    text: "Fermentation was discovered before people understood how microorganisms worked.",
  },
  {
    id: "B",
    text: "Food preservation slows spoilage by controlling the conditions in which damaging processes occur, and fermentation is one way of doing this.",
  },
  {
    id: "C",
    text: "Modern food producers must consider the cost, convenience and flavour of every preservation method.",
  },
];

const textbookParts = [
  { text: "As we saw in the previous section, preservation does not always involve destroying every microorganism. " },
  { text: "Fermentation, one of the oldest preservation methods, instead encourages selected bacteria or yeasts to become dominant. ", type: "idea-2" },
  { text: "Historically, these processes were discovered long before microorganisms were understood. ", type: "lower" },
  { text: "In yoghurt, pickled vegetables and some cheeses, ", type: "lower" },
  { text: "lactic acid bacteria convert sugars into acid. The increasing acidity slows the growth of many organisms that would otherwise spoil the food. ", type: "idea-2" },
  { text: "Yeast works differently, producing carbon dioxide and alcohol; this process is used in bread and some drinks. ", type: "detail-2" },
  { text: "Fermented foods may last longer and develop distinctive flavours, textures or nutritional qualities. ", type: "lower" },
  { text: "However, the process must be carefully controlled. ", type: "idea-3" },
  { text: "Temperature, salt levels and cleanliness influence which microorganisms grow, and unsuitable conditions may allow contamination. ", type: "detail-3" },
  { text: "Fermentation therefore reduces the risk of spoilage but does not make food permanently safe or remove the need for correct storage.", type: "idea-3" },
];

const lectureParts = [
  { text: "‘So, why does food spoil? Well, in most cases, " },
  { text: "microorganisms, natural enzymes and chemical reactions gradually change its smell, texture and safety. Preservation methods work by slowing or interrupting these processes. ", type: "idea-1" },
  { text: "Refrigeration reduces biological activity, while heating can destroy many microorganisms and enzymes. Drying removes the water they need, and salt or sugar make the remaining water less available. Sealed containers and packaging can also limit oxygen or prevent new contamination after processing. ", type: "detail-1" },
  { text: "Fermentation may seem different because living organisms are deliberately encouraged, but it follows the same general principle: useful bacteria or yeasts alter the food’s conditions so that harmful organisms find it harder to grow. ", type: "idea-2" },
  { text: "No single method suits every product, ", type: "idea-3" },
  { text: "and each can affect flavour, nutrition, cost, convenience and energy use. ", type: "lower" },
  { text: "For this reason, modern food production often combines several techniques rather than relying on only one.’", type: "idea-3" },
];

const summaries = [
  {
    student: "Student A",
    words: 87,
    text: "Food spoilage is caused by microorganisms, enzymes and chemical reactions, so preservation methods alter the conditions these processes need. Cooling slows activity, while heating, drying, salt, sugar and packaging can destroy microbes or limit water, oxygen and contamination. Fermentation follows the same principle by encouraging selected bacteria or yeasts to produce acid, alcohol or gas, making food less suitable for harmful organisms. However, its conditions must be controlled and safe storage remains necessary. Since no method suits every product, modern food production often combines several preservation techniques.",
  },
  {
    student: "Student B",
    words: 88,
    text: "Fermentation is one of the oldest methods of preserving food and was discovered before people understood microorganisms. Yoghurt, pickled vegetables and cheese contain bacteria that turn sugar into acid, while yeast produces carbon dioxide and alcohol in bread and drinks. Fermented foods can have different flavours, textures and nutritional qualities. Food also spoils because of microorganisms, enzymes and chemical reactions. Refrigeration, heating, drying, salt, sugar and sealed packaging can slow these processes. Each method affects cost, convenience, flavour and energy use, and several techniques are sometimes used together.",
  },
];

const weaknessOptions = [
  { id: "examples", text: "It gives too much space to historical information and examples.", correct: true },
  { id: "no-lecture", text: "It contains no information from the lecture.", correct: false },
  { id: "separate", text: "It largely treats fermentation and general preservation as separate topics.", correct: true },
  { id: "principle", text: "It does not clearly explain how fermentation follows the same preservation principle.", correct: true },
  { id: "inaccurate", text: "It contains several inaccurate facts.", correct: false },
  { id: "control", text: "It omits the need for controlled conditions and safe storage.", correct: true },
];

function SourceText({ parts, reveals }) {
  return (
    <p>
      {parts.map((part, index) => {
        const isIdea = part.type?.startsWith("idea-");
        const isDetail = part.type?.startsWith("detail-");
        const visible = (isIdea && reveals.main) || (isDetail && reveals.details) || (part.type === "lower" && reveals.lower);
        return (
          <span className={visible ? `ote-summary-highlight is-${part.type}` : ""} key={`${part.text}-${index}`}>
            {part.text}
          </span>
        );
      })}
    </p>
  );
}

function SingleChoice({ answer, correctAnswer, onSelect, options, prompt, feedback }) {
  const answered = Boolean(answer);
  return (
    <article className={`ote-training-quiz-item ${answered ? (answer === correctAnswer ? "is-correct" : "is-wrong") : ""}`}>
      <h3>{prompt}</h3>
      <div className="ote-training-options">
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.id;
          const label = typeof option === "string" ? option : `${option.id}. ${option.text}`;
          const selected = answer === value;
          return (
            <button
              aria-pressed={selected}
              className={`ote-training-option ${selected ? "is-selected" : ""} ${answered && value === correctAnswer ? "is-answer" : ""} ${answered && selected && value !== correctAnswer ? "is-incorrect" : ""}`}
              key={value}
              onClick={() => onSelect(value)}
              type="button"
            >
              <span>{label}</span>
              {answered && value === correctAnswer ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              {answered && selected && value !== correctAnswer ? <XCircle size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className="ote-training-feedback">
          <strong>{answer === correctAnswer ? "Correct." : "Not quite."}</strong>
          <p>{feedback}</p>
        </div>
      ) : null}
    </article>
  );
}

export default function OteWritingAdvancedSummaryMainIdeas({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const completionLogged = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-summary" : "/ote/writing/training/advanced-summary");
  const [overarchingAnswer, setOverarchingAnswer] = useState("");
  const [reveals, setReveals] = useState({ main: false, details: false, lower: false });
  const [strongerAnswer, setStrongerAnswer] = useState("");
  const [reasonAnswer, setReasonAnswer] = useState("");
  const [weaknessAnswers, setWeaknessAnswers] = useState([]);
  const [weaknessChecked, setWeaknessChecked] = useState(false);

  const weaknessCorrect = useMemo(() => {
    const correct = weaknessOptions.filter((option) => option.correct).map((option) => option.id).sort();
    return weaknessAnswers.slice().sort().join("|") === correct.join("|");
  }, [weaknessAnswers]);
  const lessonComplete = Boolean(strongerAnswer && reasonAnswer && weaknessChecked);

  useEffect(() => {
    if (!lessonComplete || completionLogged.current) return;
    completionLogged.current = true;
    logOteTrainingCompleted({
      progressId: "writing.advanced-summary.main-ideas",
      section: "writing",
      part: "part-2",
      mode: "main_ideas_lesson",
      taskId: "finding-main-ideas",
      taskTitle: "Finding the Main Ideas",
      score: Number(strongerAnswer === "Student A") + Number(reasonAnswer === "B") + Number(weaknessCorrect),
      total: 3,
    }).catch(() => {});
  }, [lessonComplete, reasonAnswer, strongerAnswer, weaknessCorrect]);

  function toggleWeakness(id) {
    if (weaknessChecked) return;
    setWeaknessAnswers((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function resetLesson() {
    setOverarchingAnswer("");
    setReveals({ main: false, details: false, lower: false });
    setStrongerAnswer("");
    setReasonAnswer("");
    setWeaknessAnswers([]);
    setWeaknessChecked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="ote-training-page ote-summary-main-ideas-page">
      <Seo
        title="Finding the Main Ideas | OTE Advanced Summary Training"
        description="Learn to identify information hierarchy and compare synthesis in OTE Advanced summary writing."
      />

      <button className="ote-training-back" onClick={() => navigate(menuPath)} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to advanced summary training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Training Lesson 1 · Writing Part 2</p>
        <h1>Finding the Main Ideas</h1>
        <p>Recognise the information hierarchy and discover why one summary synthesises the sources more successfully than another.</p>
      </header>

      <section className="ote-training-section ote-summary-lesson-task">
        <div className="ote-summary-lesson-heading">
          <div>
            <p className="ote-kicker">Stage 1 · Read the task</p>
            <h2>Part 2 Summary</h2>
          </div>
          <span>20 minutes · 80–100 words</span>
        </div>
        <p>You have been learning about an aspect of food science for a college course. You have read a textbook extract and attended a lecture and now your tutor has asked you to write a summary of the main ideas for your classmates to read.</p>
        <p>Write <strong>one paragraph</strong>, combining information from the textbook extract and the lecture transcript to summarize the main ideas. Your summary should provide the reader with enough information to understand the main ideas from both texts.</p>
        <p>Write full sentences, using <strong>your own words</strong> where possible. Do <strong>NOT</strong> write more than 100 words.</p>

        <div className="ote-summary-lesson-source-grid">
          <article>
            <h3>Textbook extract</h3>
            <SourceText parts={textbookParts} reveals={reveals} />
          </article>
          <article>
            <h3>Lecture transcript</h3>
            <SourceText parts={lectureParts} reveals={reveals} />
          </article>
        </div>

        <div className="ote-summary-glossary-list" aria-label="Glossary">
          <h3>Glossary</h3>
          <dl>
            <div><dt>microorganism</dt><dd>a living thing too small to be seen without a microscope</dd></div>
            <div><dt>enzyme</dt><dd>a substance that causes a chemical process in a living thing</dd></div>
            <div><dt>dominant</dt><dd>more common or powerful than others</dd></div>
            <div><dt>contamination</dt><dd>the presence of something harmful or unwanted</dd></div>
          </dl>
        </div>

        <aside className="ote-summary-pause-note">
          <Eye size={22} aria-hidden="true" />
          <strong>Do not start writing yet.</strong>
          <span>First, work out how the information is organised.</span>
        </aside>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Stage 2 · Identify the overarching idea</p>
        <SingleChoice
          answer={overarchingAnswer}
          correctAnswer="B"
          feedback="The overarching idea is the central message connecting both sources. A is a minor historical detail. C is a secondary point from the lecture. B combines the lecture’s general explanation of preservation with the textbook’s explanation of fermentation."
          onSelect={setOverarchingAnswer}
          options={overarchingOptions}
          prompt="What is the overall message shared by both texts?"
        />
        {overarchingAnswer ? (
          <aside className="ote-summary-key-message">
            <Target size={22} aria-hidden="true" />
            <div>
              <strong>Key message</strong>
              <p>The overarching idea may not appear as one complete sentence. You may need to infer it by combining information from both texts.</p>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Stage 3 · Explore the information structure</p>
        <h2>Reveal the hierarchy gradually</h2>
        <div className="ote-summary-reveal-controls">
          <button disabled={!overarchingAnswer} className={reveals.main ? "is-active" : ""} onClick={() => setReveals((current) => ({ ...current, main: !current.main }))} type="button">
            <Layers3 size={18} aria-hidden="true" /> Show main ideas
          </button>
          <button disabled={!reveals.main} className={reveals.details ? "is-active" : ""} onClick={() => setReveals((current) => ({ ...current, details: !current.details }))} type="button">
            Show supporting details
          </button>
          <button disabled={!reveals.main} className={reveals.lower ? "is-active" : ""} onClick={() => setReveals((current) => ({ ...current, lower: !current.lower }))} type="button">
            Show lower-priority information
          </button>
        </div>
        {!overarchingAnswer ? <p className="ote-summary-control-hint">Answer the overarching-idea question to unlock the information map.</p> : null}
        {reveals.main ? (
          <div className="ote-summary-highlight-legend">
            <span className="is-idea-1">Main idea 1 · How preservation works</span>
            <span className="is-idea-2">Main idea 2 · How fermentation works</span>
            <span className="is-idea-3">Main idea 3 · Limitations and control</span>
            {reveals.details ? <span className="is-detail">Supporting details</span> : null}
            {reveals.lower ? <span className="is-lower">Lower-priority information</span> : null}
          </div>
        ) : null}
        <p>The main ideas form the framework of the summary. Supporting details explain them, but not every detail needs to be included.</p>
        <p>Notice that related information appears in both sources. A good summary connects these ideas instead of treating the textbook and lecture separately.</p>
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Stage 4 · Compare two summaries</p>
        <h2>Both are accurate—but are they equally effective?</h2>
        <div className="ote-summary-comparison-grid">
          {summaries.map((summary) => (
            <article key={summary.student}>
              <header><h3>{summary.student}</h3><span>{summary.words} words</span></header>
              <p>{summary.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Stage 5 · Analyse the summaries</p>
        <h2>Check the selection and synthesis</h2>
        <SingleChoice
          answer={strongerAnswer}
          correctAnswer="Student A"
          feedback="Student A is the stronger summary. It selects the central framework and connects related information from the two sources."
          onSelect={setStrongerAnswer}
          options={["Student A", "Student B"]}
          prompt="1. Which summary is stronger?"
        />
        <SingleChoice
          answer={reasonAnswer}
          correctAnswer="B"
          feedback="Student A uses the main ideas as its framework. It explains the general principle of preservation and then shows how fermentation fits that principle."
          onSelect={setReasonAnswer}
          options={[
            { id: "A", text: "It contains more technical vocabulary." },
            { id: "B", text: "It organises the paragraph around the main ideas and connects fermentation to the general principle of preservation." },
            { id: "C", text: "It includes more information from the textbook." },
          ]}
          prompt="2. Why is Student A stronger?"
        />

        <article className={`ote-training-quiz-item ${weaknessChecked ? (weaknessCorrect ? "is-correct" : "is-wrong") : ""}`}>
          <h3>3. What are the main weaknesses of Student B? Select all that apply.</h3>
          <div className="ote-training-options">
            {weaknessOptions.map((option) => {
              const selected = weaknessAnswers.includes(option.id);
              return (
                <button
                  aria-pressed={selected}
                  className={`ote-training-option ${selected ? "is-selected" : ""} ${weaknessChecked && option.correct ? "is-answer" : ""} ${weaknessChecked && selected && !option.correct ? "is-incorrect" : ""}`}
                  disabled={weaknessChecked}
                  key={option.id}
                  onClick={() => toggleWeakness(option.id)}
                  type="button"
                >
                  <span>{option.text}</span>
                  {weaknessChecked && option.correct ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
                  {weaknessChecked && selected && !option.correct ? <XCircle size={18} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
          {!weaknessChecked ? (
            <button className="ote-training-primary-link ote-summary-check-button" disabled={!weaknessAnswers.length} onClick={() => setWeaknessChecked(true)} type="button">Check selected answers</button>
          ) : (
            <div className="ote-training-feedback">
              <strong>{weaknessCorrect ? "Correct." : "Review the highlighted answers."}</strong>
              <p>Student B is mostly accurate and its language is clear. However, it gives too much space to examples and follows the sources too closely.</p>
            </div>
          )}
        </article>

        {lessonComplete ? (
          <>
            <div className="ote-summary-final-feedback">
              <CheckCircle2 size={24} aria-hidden="true" />
              <div>
                <strong>Why Student A succeeds</strong>
                <p>Student A is stronger because it selects the main ideas, connects related information from both sources and includes an important limitation.</p>
              </div>
            </div>
            <aside className="ote-summary-takeaway">
              <Target size={25} aria-hidden="true" />
              <div>
                <strong>Lesson takeaway</strong>
                <p>Use the main ideas as the framework of your summary. Then add selected supporting details from either source where they help explain those ideas.</p>
              </div>
            </aside>
            <div className="ote-training-complete">
              <strong>Lesson complete.</strong>
              <span>You have practised identifying hierarchy, selecting detail and connecting sources.</span>
              <button onClick={resetLesson} type="button"><RotateCcw size={17} aria-hidden="true" /> Try again</button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
