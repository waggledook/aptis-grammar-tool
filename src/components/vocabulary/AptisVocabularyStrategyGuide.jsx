import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Languages,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  logStrategyGuideCompleted,
  logStrategyGuideViewed,
  saveAptisStrategyGuideProgress,
} from "../../firebase.js";
import Seo from "../common/Seo.jsx";
import "../../reading/aptisReadingStrategyGuide.css";

const GUIDE_ID = "vocabulary_strategy_guide";

const FACTS = [
  { value: "25 questions", label: "Vocabulary items", icon: FileCheck2 },
  { value: "4 task types", label: "Meaning, use and combinations", icon: Languages },
  { value: "25 minutes", label: "Shared with Grammar", icon: Clock3 },
];

const QUIZ = [
  {
    id: "similar-meaning",
    prompt: "The task asks for a word with a similar meaning to ‘journey’. Which is the best match?",
    answer: "A",
    options: [
      { id: "A", label: "trip" },
      { id: "B", label: "train" },
      { id: "C", label: "ticket" },
    ],
    feedback: "‘Trip’ is the closest match in meaning. ‘Train’ and ‘ticket’ are related to the same topic, but they are not synonyms.",
  },
  {
    id: "sentence-context",
    prompt: "You need to choose a word to complete a sentence. What should you do first?",
    answer: "A",
    options: [
      { id: "A", label: "Read the whole sentence and predict the meaning you need" },
      { id: "B", label: "Choose the most familiar word" },
      { id: "C", label: "Translate every option before reading the sentence" },
    ],
    feedback: "The context can help you work out what kind of word would make sense before you compare the options.",
  },
  {
    id: "natural-combination",
    prompt: "Which is the natural English combination?",
    answer: "B",
    options: [
      { id: "A", label: "strong rain" },
      { id: "B", label: "heavy rain" },
      { id: "C", label: "powerful rain" },
    ],
    feedback: "‘Heavy rain’ is a common English word combination. Collocation questions test words that naturally occur together.",
  },
];

function QuickCheckQuestion({ question, selectedAnswer, onSelect }) {
  const answered = Boolean(selectedAnswer);
  const correct = selectedAnswer === question.answer;

  return (
    <article className={`aptis-strategy-question ${answered ? (correct ? "is-correct" : "is-wrong") : ""}`}>
      <h3>{question.prompt}</h3>
      <div className="aptis-strategy-options" role="group" aria-label={question.prompt}>
        {question.options.map((option) => {
          const selected = selectedAnswer === option.id;
          const isAnswer = option.id === question.answer;
          return (
            <button
              className={`aptis-strategy-option ${selected ? "is-selected" : ""} ${answered && isAnswer ? "is-answer" : ""} ${answered && selected && !isAnswer ? "is-wrong" : ""}`}
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(question.id, option.id)}
            >
              <span className="aptis-strategy-option-letter" aria-hidden="true">{option.id}</span>
              <span>{option.label}</span>
              {answered && isAnswer ? <CheckCircle2 size={20} aria-hidden="true" /> : null}
              {answered && selected && !isAnswer ? <XCircle size={20} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className="aptis-strategy-feedback" role="status">
          <strong>{correct ? "That’s right." : "Not quite."}</strong>
          <span>{question.feedback}</span>
        </div>
      ) : null}
    </article>
  );
}

export default function AptisVocabularyStrategyGuide() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completionLoggedRef = useRef(false);
  const completionSavedRef = useRef(false);
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => QUIZ.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    logStrategyGuideViewed({
      skill: "vocabulary",
      part: "",
      guideId: GUIDE_ID,
      guideTitle: "Vocabulary Strategy Guide",
    });
  }, []);

  useEffect(() => {
    if (answeredCount < QUIZ.length) return;

    if (!completionLoggedRef.current) {
      completionLoggedRef.current = true;
      logStrategyGuideCompleted({
        skill: "vocabulary",
        part: "",
        guideId: GUIDE_ID,
        guideTitle: "Vocabulary Strategy Guide",
        score: correctCount,
        total: QUIZ.length,
      });
    }

    if (!completionSavedRef.current) {
      completionSavedRef.current = true;
      saveAptisStrategyGuideProgress({
        skill: "vocabulary",
        part: "",
        guideId: GUIDE_ID,
        score: correctCount,
        total: QUIZ.length,
      }).catch((error) => {
        completionSavedRef.current = false;
        console.warn("[Aptis Vocabulary] strategy progress save failed", error);
      });
    }
  }, [answeredCount, correctCount]);

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  return (
    <main className="aptis-strategy-page aptis-vocabulary-strategy-page">
      <Seo
        title="Aptis Vocabulary Strategy Guide | Seif Aptis Trainer"
        description="Learn how to approach synonyms, definitions, word-use questions and natural word combinations in the Aptis Vocabulary section."
      />

      <button className="aptis-strategy-back" type="button" onClick={() => navigate("/vocabulary")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Vocabulary
      </button>

      <header className="aptis-strategy-hero">
        <p className="aptis-strategy-kicker">Aptis Vocabulary</p>
        <h1>Vocabulary Strategy Guide</h1>
        <p>Learn a reliable five-step method, avoid common mistakes, then take the three-question Quick Check.</p>
      </header>

      <section className="aptis-strategy-facts" aria-label="Vocabulary section essentials">
        {FACTS.map((fact) => {
          const FactIcon = fact.icon;
          return <article key={fact.value}><FactIcon size={24} aria-hidden="true" /><div><strong>{fact.value}</strong><span>{fact.label}</span></div></article>;
        })}
      </section>

      <section className="aptis-strategy-section">
        <h2>The task</h2>
        <p>In the Vocabulary section, you answer 25 questions. The questions test vocabulary in several different ways: matching words with similar meanings, matching words to definitions, choosing the right word for a sentence, and identifying words that are commonly used together.</p>
        <p>Grammar and Vocabulary share a total time of 25 minutes, so work steadily and don’t spend too long on an item when you simply don’t know the word.</p>
      </section>

      <section className="aptis-strategy-section">
        <h2>A good strategy</h2>
        <ol className="aptis-strategy-steps">
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">1</span>
            <div>
              <h3>Know what kind of match you need</h3>
              <p>The best strategy changes slightly with the question type:</p>
              <ul>
                <li><strong>Similar meaning:</strong> look for the word with the closest meaning.</li>
                <li><strong>Definition:</strong> identify the main idea in the definition.</li>
                <li><strong>Word in a sentence:</strong> use the whole sentence to work out what kind of word makes sense.</li>
                <li><strong>Words that go together:</strong> look for words that are commonly used together in English.</li>
              </ul>
              <p>For example, with <em>heavy</em>, you might choose <em>rain</em> because <em>heavy rain</em> is a common combination.</p>
            </div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">2</span>
            <div><h3>Try to predict before searching the options</h3><p>For sentence questions especially, read the complete sentence first. Think about the meaning you need, then compare all the choices.</p><p>This can stop a tempting but incorrect option from distracting you.</p></div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">3</span>
            <div><h3>Start with the answers you know</h3><p>When several words and options appear together, make the confident matches first. You will then have fewer possibilities for the difficult ones.</p><p>Before leaving the set, check that every choice matches exactly what the question asks.</p></div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">4</span>
            <div><h3>Match meaning, not just topic</h3><p>Two words can be connected without having the same meaning.</p><p>For example, <em>journey</em> and <em>train</em> are related, but they are not synonyms. If the task asks for a word with a similar meaning, the connection must be much closer.</p></div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">5</span>
            <div><h3>Don’t get stuck on an unknown word</h3><p>English has a huge vocabulary, and nobody knows every English word. If you cannot find an answer reasonably quickly, flag the question, continue and return to it later if you have time.</p></div>
          </li>
        </ol>
      </section>

      <section className="aptis-strategy-section">
        <h2>Watch out for…</h2>
        <div className="aptis-strategy-warning-grid">
          <article><ShieldAlert size={21} aria-hidden="true" /><h3>Choosing a word because it is related</h3><p>Check what the task requires: the same meaning, the correct definition, the right word in context or a common word combination.</p></article>
          <article><ShieldAlert size={21} aria-hidden="true" /><h3>Ignoring the sentence</h3><p>In word-use questions, the context is there to help you. Read the complete sentence rather than looking only at the gap.</p></article>
          <article><ShieldAlert size={21} aria-hidden="true" /><h3>Translating everything</h3><p>It is often quicker to use the meaning or the English combination directly instead of translating every option first.</p></article>
        </div>
      </section>

      <aside className="aptis-strategy-reminder" aria-label="Quick reminder">
        <Lightbulb size={24} aria-hidden="true" />
        <div><strong>Quick reminder</strong><p>Identify the task → use the meaning or context → make the easy matches first → check what fits naturally → move on if you’re stuck.</p></div>
      </aside>

      <section className="aptis-strategy-section aptis-strategy-quiz">
        <header><div><p className="aptis-strategy-kicker">Three questions</p><h2>Quick Check</h2><p>Choose an answer to see feedback straight away.</p></div><div className="aptis-strategy-score" aria-live="polite">{correctCount}/{QUIZ.length}</div></header>
        {QUIZ.map((question) => <QuickCheckQuestion key={question.id} question={question} selectedAnswer={answers[question.id]} onSelect={selectAnswer} />)}

        {answeredCount === QUIZ.length ? (
          <div className="aptis-strategy-complete" role="status">
            <CheckCircle2 size={25} aria-hidden="true" />
            <div><strong>{correctCount === QUIZ.length ? "Excellent—you’re ready to practise." : "Quick Check complete."}</strong><span>You got {correctCount} out of {QUIZ.length}. Review the feedback above or try the questions again.</span></div>
            <button type="button" onClick={() => setAnswers({})}><RotateCcw size={17} aria-hidden="true" /> Try again</button>
          </div>
        ) : null}
      </section>

      <section className="aptis-strategy-next">
        <div><strong>Ready to use the strategy?</strong><span>Open mixed exam-style vocabulary sets and apply the five-step method.</span></div>
        <button type="button" onClick={() => navigate("/vocabulary/exercises")}>Open Vocabulary Trainer <ArrowRight size={18} aria-hidden="true" /></button>
      </section>
    </main>
  );
}
