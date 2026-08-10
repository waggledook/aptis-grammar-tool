import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Lightbulb,
  ListChecks,
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

const GUIDE_ID = "grammar_strategy_guide";

const QUIZ = [
  {
    id: "whole-sentence",
    prompt: "What should you do before choosing an option?",
    answer: "B",
    options: [
      { id: "A", label: "Read only the words immediately next to the gap" },
      { id: "B", label: "Read the complete sentence and look for clues" },
      { id: "C", label: "Choose the grammar form you use most often" },
    ],
    feedback: "Information elsewhere in the sentence may tell you which grammar form is needed.",
  },
  {
    id: "apply-clues",
    prompt: "Marta has worked here ___ 2022. What is the best way to decide between ‘since’, ‘for’ and ‘during’?",
    answer: "A",
    options: [
      { id: "A", label: "Use both the verb form and the specific starting point" },
      { id: "B", label: "Choose the option that looks most familiar" },
      { id: "C", label: "Look only at the word immediately before the gap" },
    ],
    feedback: "The present perfect form and the specific starting point work together as clues. The correct choice is ‘since’.",
  },
  {
    id: "move-on",
    prompt: "You have spent too long on one question and still aren’t sure. What should you do?",
    answer: "B",
    options: [
      { id: "A", label: "Stay there until you are completely certain" },
      { id: "B", label: "Flag it, move on and return later if time remains" },
      { id: "C", label: "Leave the remaining Grammar questions unfinished" },
    ],
    feedback: "Grammar and Vocabulary share one timer, so moving on protects the time available for easier questions.",
  },
];

const FACTS = [
  { value: "25 questions", label: "Grammar items", icon: FileCheck2 },
  { value: "3 options", label: "For every question", icon: ListChecks },
  { value: "25 minutes", label: "Shared with Vocabulary", icon: Clock3 },
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
              className={`aptis-strategy-option ${selected ? "is-selected" : ""} ${
                answered && isAnswer ? "is-answer" : ""
              } ${answered && selected && !isAnswer ? "is-wrong" : ""}`}
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

export default function AptisGrammarStrategyGuide() {
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
      skill: "grammar",
      part: "",
      guideId: GUIDE_ID,
      guideTitle: "Grammar Strategy Guide",
    });
  }, []);

  useEffect(() => {
    if (answeredCount < QUIZ.length) return;

    if (!completionLoggedRef.current) {
      completionLoggedRef.current = true;
      logStrategyGuideCompleted({
        skill: "grammar",
        part: "",
        guideId: GUIDE_ID,
        guideTitle: "Grammar Strategy Guide",
        score: correctCount,
        total: QUIZ.length,
      });
    }

    if (!completionSavedRef.current) {
      completionSavedRef.current = true;
      saveAptisStrategyGuideProgress({
        skill: "grammar",
        part: "",
        guideId: GUIDE_ID,
        score: correctCount,
        total: QUIZ.length,
      }).catch((error) => {
        completionSavedRef.current = false;
        console.warn("[Aptis Grammar] strategy progress save failed", error);
      });
    }
  }, [answeredCount, correctCount]);

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  return (
    <main className="aptis-strategy-page aptis-grammar-strategy-page">
      <Seo
        title="Aptis Grammar Strategy Guide | Seif Aptis Trainer"
        description="Learn how to identify grammar clues, compare answer options, check completed sentences and manage time in the Aptis Grammar section."
      />

      <button className="aptis-strategy-back" type="button" onClick={() => navigate("/grammar")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Grammar
      </button>

      <header className="aptis-strategy-hero">
        <p className="aptis-strategy-kicker">Aptis Grammar</p>
        <h1>Grammar Strategy Guide</h1>
        <p>Learn a reliable five-step method, avoid common mistakes, then take the three-question Quick Check.</p>
      </header>

      <section className="aptis-strategy-facts" aria-label="Grammar section essentials">
        {FACTS.map((fact) => {
          const FactIcon = fact.icon;
          return (
            <article key={fact.value}>
              <FactIcon size={24} aria-hidden="true" />
              <div><strong>{fact.value}</strong><span>{fact.label}</span></div>
            </article>
          );
        })}
      </section>

      <section className="aptis-strategy-section">
        <h2>The task</h2>
        <p>In the Grammar section, you answer 25 multiple-choice questions. Each question contains a sentence with a missing word or phrase, and you choose the correct answer from three options. The questions cover a range of grammar points and difficulty levels.</p>
        <p>Grammar and Vocabulary share a total time of 25 minutes, so you need to work efficiently and avoid spending too long on one difficult question.</p>
      </section>

      <section className="aptis-strategy-section">
        <h2>A good strategy</h2>
        <ol className="aptis-strategy-steps">
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">1</span>
            <div><h3>Read the whole sentence first</h3><p>Don’t focus only on the words next to the gap. Look at the complete sentence and try to understand what it means.</p></div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">2</span>
            <div>
              <h3>Look for clues</h3>
              <p>Before choosing, notice anything that helps you identify the grammar you need:</p>
              <ul>
                <li>time expressions</li>
                <li>verb forms</li>
                <li>prepositions</li>
                <li>words before and after the gap</li>
                <li>whether the sentence is positive, negative or a question</li>
              </ul>
              <p>If possible, predict what kind of answer would fit before checking the options.</p>
            </div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">3</span>
            <div><h3>Compare all three options</h3><p>Don’t choose the first answer that looks possible. Ask yourself why each option does or doesn’t work.</p><p>In the exam, you don’t need to analyse every option for a long time—but eliminating an answer you know is wrong can make a difficult question much easier.</p></div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">4</span>
            <div><h3>Read the completed sentence again</h3><p>Put your choice into the gap and check the whole sentence. Does it make sense, and is the grammar correct?</p></div>
          </li>
          <li>
            <span className="aptis-strategy-step-number" aria-hidden="true">5</span>
            <div><h3>Don’t get stuck</h3><p>There are 50 Grammar and Vocabulary questions in 25 minutes. If you can’t decide reasonably quickly, flag the question, move on and return to it later if you have time.</p></div>
          </li>
        </ol>
      </section>

      <section className="aptis-strategy-section">
        <h2>Watch out for…</h2>
        <div className="aptis-strategy-warning-grid">
          <article><ShieldAlert size={21} aria-hidden="true" /><h3>Reading only around the gap</h3><p>An important clue may appear earlier or later in the sentence.</p></article>
          <article><ShieldAlert size={21} aria-hidden="true" /><h3>Choosing something because it “looks familiar”</h3><p>Check that it actually fits the complete sentence.</p></article>
          <article><ShieldAlert size={21} aria-hidden="true" /><h3>Spending too long on one item</h3><p>Some questions are meant to be harder than others. One difficult question isn’t worth losing time you could use on several easier ones.</p></article>
        </div>
      </section>

      <aside className="aptis-strategy-reminder" aria-label="Quick reminder">
        <Lightbulb size={24} aria-hidden="true" />
        <div><strong>Quick reminder</strong><p>Read the whole sentence → find the clues → compare the options → check the completed sentence → move on if you’re stuck.</p></div>
      </aside>

      <section className="aptis-strategy-section aptis-strategy-quiz">
        <header>
          <div><p className="aptis-strategy-kicker">Three questions</p><h2>Quick Check</h2><p>Choose an answer to see feedback straight away.</p></div>
          <div className="aptis-strategy-score" aria-live="polite">{correctCount}/{QUIZ.length}</div>
        </header>

        {QUIZ.map((question) => (
          <QuickCheckQuestion
            key={question.id}
            question={question}
            selectedAnswer={answers[question.id]}
            onSelect={selectAnswer}
          />
        ))}

        {answeredCount === QUIZ.length ? (
          <div className="aptis-strategy-complete" role="status">
            <CheckCircle2 size={25} aria-hidden="true" />
            <div><strong>{correctCount === QUIZ.length ? "Excellent—you’re ready to practise." : "Quick Check complete."}</strong><span>You got {correctCount} out of {QUIZ.length}. Review the feedback above or try the questions again.</span></div>
            <button type="button" onClick={() => setAnswers({})}><RotateCcw size={17} aria-hidden="true" /> Try again</button>
          </div>
        ) : null}
      </section>

      <section className="aptis-strategy-next">
        <div><strong>Ready to use the strategy?</strong><span>Generate a focused grammar set and apply the five-step method.</span></div>
        <button type="button" onClick={() => navigate("/grammar/aptis")}>Open Grammar Trainer <ArrowRight size={18} aria-hidden="true" /></button>
      </section>
    </main>
  );
}
