import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Lightbulb,
  ListChecks,
  Mic2,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getAptisSpeakingStrategyGuide } from "./aptisSpeakingStrategyGuideData.js";
import "../../reading/aptisReadingStrategyGuide.css";

const FACT_ICONS = [Mic2, ListChecks, Clock3];

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

export default function AptisSpeakingStrategyGuide({ partNumber: partNumberOverride = "" }) {
  const navigate = useNavigate();
  const { partNumber: routePartNumber = "" } = useParams();
  const partNumber = partNumberOverride || routePartNumber;
  const guide = getAptisSpeakingStrategyGuide(partNumber);
  const [answers, setAnswers] = useState({});

  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => guide?.quiz.filter((question) => answers[question.id] === question.answer).length || 0,
    [answers, guide]
  );

  useEffect(() => {
    if (!guide) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    setAnswers({});
  }, [guide]);

  if (!guide) return <Navigate to="/speaking" replace />;

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  return (
    <main className="aptis-strategy-page aptis-speaking-strategy-page">
      <Seo
        title={`Aptis Speaking Part ${guide.number}: ${guide.title} Strategy Guide | Seif Aptis Trainer`}
        description={guide.seoDescription}
      />

      <button className="aptis-strategy-back" type="button" onClick={() => navigate(guide.menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part {guide.number}
      </button>

      <header className="aptis-strategy-hero">
        <p className="aptis-strategy-kicker">Aptis Speaking Part {guide.number}</p>
        <h1>{guide.title}</h1>
        <p>Learn a clear method, avoid the most common mistakes, then take the three-question Quick Check.</p>
      </header>

      <section className="aptis-strategy-facts" aria-label={`Part ${guide.number} essentials`}>
        {guide.facts.map((fact, index) => {
          const FactIcon = FACT_ICONS[index] || Mic2;
          return (
            <article key={fact.value}>
              <FactIcon size={24} aria-hidden="true" />
              <div>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="aptis-strategy-section">
        <h2>The task</h2>
        {guide.task.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section className="aptis-strategy-section">
        <h2>A good strategy</h2>
        <ol className="aptis-strategy-steps">
          {guide.steps.map((step, index) => (
            <li key={step.title}>
              <span className="aptis-strategy-step-number" aria-hidden="true">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {step.prompts ? (
                  <ul>{step.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>
                ) : null}
                {step.example ? (
                  <div className="aptis-strategy-example">
                    <strong>Example</strong>
                    <span>{step.example.first}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                    <span>{step.example.second}</span>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="aptis-strategy-section">
        <h2>Watch out for…</h2>
        <div className="aptis-strategy-warning-grid">
          {guide.warnings.map((warning) => (
            <article key={warning.title}>
              <ShieldAlert size={21} aria-hidden="true" />
              <h3>{warning.title}</h3>
              <p>{warning.body}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="aptis-strategy-reminder" aria-label="Quick reminder">
        <Lightbulb size={24} aria-hidden="true" />
        <div>
          <strong>Quick reminder</strong>
          <p>{guide.reminder}</p>
        </div>
      </aside>

      <section className="aptis-strategy-section aptis-strategy-quiz">
        <header>
          <div>
            <p className="aptis-strategy-kicker">Three questions</p>
            <h2>Quick Check</h2>
            <p>Choose an answer to see feedback straight away.</p>
          </div>
          <div className="aptis-strategy-score" aria-live="polite">
            {correctCount}/{guide.quiz.length}
          </div>
        </header>

        {guide.quiz.map((question) => (
          <QuickCheckQuestion
            key={question.id}
            question={question}
            selectedAnswer={answers[question.id]}
            onSelect={selectAnswer}
          />
        ))}

        {answeredCount === guide.quiz.length ? (
          <div className="aptis-strategy-complete" role="status">
            <CheckCircle2 size={25} aria-hidden="true" />
            <div>
              <strong>{correctCount === guide.quiz.length ? "Excellent—you’re ready to practise." : "Quick Check complete."}</strong>
              <span>
                You got {correctCount} out of {guide.quiz.length}. Review the feedback above or try the questions again.
              </span>
            </div>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" /> Try again
            </button>
          </div>
        ) : null}
      </section>

      <section className="aptis-strategy-next">
        <div>
          <strong>Ready to use the strategy?</strong>
          <span>Open the Part {guide.number} task library and apply the method to exam-style practice.</span>
        </div>
        <button type="button" onClick={() => navigate(guide.practicePath)}>
          Open Part {guide.number} practice <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}
