import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  relationshipAnswerBuilder,
  relationshipContextQuestions,
  relationshipPhraseCards,
  relationshipPreparationSteps,
} from "./relationshipsPreparationData";

const RELATIONSHIPS_PREPARATION_CONFIG = {
  phraseCards: relationshipPhraseCards,
  contextQuestions: relationshipContextQuestions,
  answerBuilder: relationshipAnswerBuilder,
  steps: relationshipPreparationSteps,
  copy: {
    phraseQuestion: "Which relationship phrase fits?",
    builderQuestion: "Tell me about someone you are close to.",
  },
  rehearsal: {
    part: 2,
    taskIndex: 4,
    initialQuestionIndex: 1,
    usefulPhrases: "keep in touch · get on well · rely on · grow apart",
    developmentPhrases: "The main reason is… · For example… · In general, I think…",
    checks: [
      ["answer", "I answered the exact question."],
      ["reason", "I developed an idea with a reason or example."],
      ["phrase", "I used at least one relationship phrase."],
    ],
  },
};

function readSavedProgress(key) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || "{}");
    return Array.isArray(saved.completedSteps) ? saved.completedSteps : [];
  } catch {
    return [];
  }
}

function StepActions({ stepIndex, setStepIndex, stepCount, canContinue = true }) {
  return (
    <footer className="prep-step-actions">
      <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(0, index - 1))}>
        ← Previous
      </button>
      <button
        type="button"
        disabled={!canContinue || stepIndex === stepCount - 1}
        onClick={() => setStepIndex((index) => Math.min(stepCount - 1, index + 1))}
      >
        Continue →
      </button>
    </footer>
  );
}

function PhraseActivation({ cards, copy, ratings, setRatings, onComplete, stepIndex, setStepIndex, stepCount }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[cardIndex];
  const finished = Object.keys(ratings).length === cards.length;
  const needsPractice = Object.values(ratings).filter((rating) => rating === "again").length;

  function rateCard(rating) {
    const nextRatings = { ...ratings, [card.id]: rating };
    setRatings(nextRatings);
    setFlipped(false);
    if (Object.keys(nextRatings).length === cards.length) {
      onComplete();
      return;
    }
    const nextUnrated = cards.findIndex((item, index) => index > cardIndex && !nextRatings[item.id]);
    setCardIndex(nextUnrated >= 0 ? nextUnrated : cards.findIndex((item) => !nextRatings[item.id]));
  }

  if (finished) {
    return (
      <section className="prep-activity-card prep-complete-card">
        <span className="prep-card-icon" aria-hidden="true">✓</span>
        <h2>Phrase check complete</h2>
        <p>You recalled {cards.length - needsPractice} of {cards.length} confidently. {needsPractice ? `${needsPractice} can come back in your next review.` : "Everything felt familiar."}</p>
        {needsPractice ? (
          <button
            className="workshop-secondary"
            type="button"
            onClick={() => {
              const first = cards.findIndex((item) => ratings[item.id] === "again");
              setRatings(Object.fromEntries(Object.entries(ratings).filter(([, rating]) => rating !== "again")));
              setCardIndex(Math.max(0, first));
            }}
          >
            Review the uncertain phrases
          </button>
        ) : null}
        <StepActions stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={stepCount} />
      </section>
    );
  }

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div>
          <span className="workshop-kicker">Say it before you reveal it</span>
          <h2>{copy.phraseQuestion}</h2>
        </div>
        <strong>{Object.keys(ratings).length + 1} / {cards.length}</strong>
      </div>

      <button className={`prep-flashcard ${flipped ? "is-flipped" : ""}`} type="button" onClick={() => setFlipped((value) => !value)}>
        <img src={card.image} alt="" />
        <span className="prep-flashcard-copy">
          <small>{flipped ? "Phrase" : "Visual cue"}</small>
          {flipped ? (
            <>
              <strong>{card.term}</strong>
              <span>{card.definition}</span>
            </>
          ) : (
            <>
              <strong>{card.collocation}</strong>
              <span>Say the complete phrase aloud, then tap to check.</span>
            </>
          )}
        </span>
      </button>

      <div className="prep-rating-actions">
        <button type="button" disabled={!flipped} onClick={() => rateCard("again")}>Not yet</button>
        <button type="button" disabled={!flipped} onClick={() => rateCard("know")}>Got it</button>
      </div>
      <p className="prep-support-note">This is a self-check: reveal the answer before rating yourself.</p>
      <StepActions stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={stepCount} canContinue={false} />
    </section>
  );
}

function ContextChoice({ questions, answers, setAnswers, onComplete, stepIndex, setStepIndex, stepCount }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions[questionIndex];
  const selected = answers[question.id];
  const finished = Object.keys(answers).length === questions.length;
  const score = questions.filter((item) => answers[item.id] === item.answer).length;

  function choose(option) {
    if (selected) return;
    const nextAnswers = { ...answers, [question.id]: option };
    setAnswers(nextAnswers);
    if (Object.keys(nextAnswers).length === questions.length) onComplete();
  }

  if (finished && questionIndex === questions.length - 1 && selected) {
    return (
      <section className="prep-activity-card prep-complete-card">
        <span className="prep-card-icon" aria-hidden="true">{score >= 5 ? "✓" : "↻"}</span>
        <h2>{score} / {questions.length} correct</h2>
        <p>{score >= 5 ? "These phrases are ready to use in your speaking answers." : "Good first pass. The explanations remain available if you revisit the questions."}</p>
        <button className="workshop-secondary" type="button" onClick={() => { setAnswers({}); setQuestionIndex(0); }}>Try again</button>
        <StepActions stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={stepCount} />
      </section>
    );
  }

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div>
          <span className="workshop-kicker">Vocabulary in context</span>
          <h2>Choose the phrase that fits</h2>
        </div>
        <strong>{questionIndex + 1} / {questions.length}</strong>
      </div>
      <p className="prep-context-sentence">{question.sentence}</p>
      <div className="prep-choice-grid">
        {question.options.map((option) => {
          const isCorrect = selected && option === question.answer;
          const isWrong = selected === option && option !== question.answer;
          return (
            <button key={option} type="button" className={isCorrect ? "is-correct" : isWrong ? "is-wrong" : ""} onClick={() => choose(option)}>
              {option}
            </button>
          );
        })}
      </div>
      {selected ? (
        <div className={`prep-feedback ${selected === question.answer ? "is-correct" : "is-wrong"}`}>
          <strong>{selected === question.answer ? "Correct" : `The answer is “${question.answer}”.`}</strong>
          <span>{question.explanation}</span>
        </div>
      ) : null}
      <footer className="prep-step-actions">
        <button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}>← Previous question</button>
        <button type="button" disabled={!selected} onClick={() => setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))}>Next question →</button>
      </footer>
    </section>
  );
}

function AnswerBuilder({ groups, copy, selections, setSelections, onComplete, stepIndex, setStepIndex, stepCount }) {
  const ready = groups.every((group) => selections[group.id]);

  function selectOption(groupId, option) {
    const nextSelections = { ...selections, [groupId]: option };
    setSelections(nextSelections);
    if (groups.every((group) => nextSelections[group.id])) onComplete();
  }

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div>
          <span className="workshop-kicker">Speaking functions</span>
          <h2>Build a developed answer</h2>
        </div>
      </div>
      <p className="prep-lead">Imagine the question is: <strong>“{copy.builderQuestion}”</strong> Choose one useful stem at each stage.</p>
      <div className="prep-builder-grid">
        {groups.map((group) => (
          <fieldset key={group.id}>
            <legend><strong>{group.label}</strong><span>{group.prompt}</span></legend>
            {group.options.map((option) => (
              <label key={option} className={selections[group.id] === option ? "is-selected" : ""}>
                <input
                  type="radio"
                  name={`builder-${group.id}`}
                  checked={selections[group.id] === option}
                  onChange={() => selectOption(group.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <aside className={`prep-answer-plan ${ready ? "is-ready" : ""}`}>
        <span className="workshop-kicker">Your answer framework</span>
        {groups.map((group) => <p key={group.id}>{selections[group.id] || <em>Choose a phrase above…</em>}</p>)}
        {ready ? <small>Say this framework aloud and complete each ending with your own ideas.</small> : null}
      </aside>
      <StepActions stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={stepCount} canContinue={ready} />
    </section>
  );
}

function createCheckState(items) {
  return Object.fromEntries(items.map(([id]) => [id, false]));
}

function PhotoRehearsal({ topic, rehearsal, onComplete, onOpenReference, stepIndex, setStepIndex, stepCount }) {
  const task = topic.parts[rehearsal.part].tasks[rehearsal.taskIndex];
  const [questionIndex, setQuestionIndex] = useState(rehearsal.initialQuestionIndex);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState(() => createCheckState(rehearsal.checks));
  const checkedCount = Object.values(checks).filter(Boolean).length;

  useEffect(() => {
    if (!running || secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  useEffect(() => {
    setRunning(false);
    setSecondsLeft(45);
    setChecks(createCheckState(rehearsal.checks));
  }, [questionIndex, rehearsal.checks]);

  function finish() {
    onComplete();
  }

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div>
          <span className="workshop-kicker">Short spoken rehearsal</span>
          <h2>Use the language aloud</h2>
        </div>
        <strong className={secondsLeft <= 10 ? "prep-time-low" : ""}>0:{String(secondsLeft).padStart(2, "0")}</strong>
      </div>
      <p className="prep-lead">Choose a question, take a moment to think, then speak for up to 45 seconds. This rehearsal is not recorded.</p>
      <div className="prep-rehearsal-layout">
        <img src={task.image} alt={task.alt} />
        <div>
          <div className="prep-question-tabs" role="group" aria-label="Choose a rehearsal question">
            {task.allQuestions.map((question, index) => (
              <button key={question} type="button" className={questionIndex === index ? "is-active" : ""} onClick={() => setQuestionIndex(index)}>
                Question {index + 1}
              </button>
            ))}
          </div>
          <blockquote>{task.allQuestions[questionIndex]}</blockquote>
          <details className="prep-language-help">
            <summary>Show language support</summary>
            <p><strong>Useful phrases:</strong> {rehearsal.usefulPhrases}</p>
            <p><strong>Develop:</strong> {rehearsal.developmentPhrases}</p>
            <button type="button" onClick={onOpenReference}>Open the full language guide →</button>
          </details>
          <div className="prep-timer-actions">
            <button className="workshop-primary" type="button" onClick={() => setRunning((value) => !value)}>
              {running ? "Pause" : secondsLeft === 0 ? "Finished" : secondsLeft < 45 ? "Continue" : "Start 45 seconds"}
            </button>
            <button className="workshop-secondary" type="button" onClick={() => { setRunning(false); setSecondsLeft(45); }}>Reset</button>
          </div>
        </div>
      </div>
      <fieldset className="prep-self-check">
        <legend>After speaking, check your answer</legend>
        {rehearsal.checks.map(([id, label]) => (
          <label key={id} className={checks[id] ? "is-checked" : ""}>
            <input type="checkbox" checked={checks[id]} onChange={() => setChecks((current) => ({ ...current, [id]: !current[id] }))} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <button className="prep-finish-button" type="button" disabled={checkedCount < rehearsal.checks.length} onClick={finish}>Complete preparation ✓</button>
      <StepActions stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={stepCount} />
    </section>
  );
}

export function WorkshopPreparation({ topic, user, config }) {
  const navigate = useNavigate();
  const storageKey = useMemo(() => `speaking-workshop-prep:${user?.uid || "local"}:${topic.id}:${config.storageVersion || "v1"}`, [config.storageVersion, topic.id, user?.uid]);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(() => readSavedProgress(storageKey));
  const [ratings, setRatings] = useState({});
  const [contextAnswers, setContextAnswers] = useState({});
  const [builderSelections, setBuilderSelections] = useState({});

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ completedSteps }));
  }, [completedSteps, storageKey]);

  const completedSet = useMemo(() => new Set(completedSteps), [completedSteps]);
  const currentStep = config.steps[stepIndex];
  const allComplete = completedSteps.length === config.steps.length;

  function completeStep(stepId) {
    setCompletedSteps((current) => current.includes(stepId) ? current : [...current, stepId]);
  }

  return (
    <div className="workshop-prep-shell">
      <header className="workshop-session-header prep-session-header">
        <div>
          <span className="workshop-kicker">Prepare before the workshop · {topic.title}</span>
          <h1>A short language warm-up</h1>
          <p>Activate useful vocabulary, build a longer answer, then try one short spoken rehearsal. Allow about 15 minutes.</p>
        </div>
        <div className="workshop-session-header-actions">
          <button className="workshop-secondary" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/reference`)}>Language guide</button>
          <button className="workshop-secondary" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}`)}>Change mode</button>
        </div>
      </header>

      <section className="prep-progress-summary" aria-label={`${completedSteps.length} of ${config.steps.length} preparation steps complete`}>
        <div><strong>{completedSteps.length} / {config.steps.length}</strong><span>steps complete</span></div>
        <div className="prep-progress-track" aria-hidden="true"><span style={{ width: `${(completedSteps.length / config.steps.length) * 100}%` }} /></div>
        {allComplete ? <b>Ready for the workshop ✓</b> : <small>Your progress is saved on this device.</small>}
      </section>

      <nav className="prep-step-nav" aria-label="Preparation steps">
        {config.steps.map((step, index) => (
          <button key={step.id} type="button" className={`${stepIndex === index ? "is-active" : ""} ${completedSet.has(step.id) ? "is-complete" : ""}`} onClick={() => setStepIndex(index)}>
            <span>{completedSet.has(step.id) ? "✓" : index + 1}</span>
            <strong>{step.label}</strong>
            <small>{step.title}</small>
          </button>
        ))}
      </nav>

      <div className="prep-current-intro">
        <span>Step {stepIndex + 1}</span>
        <div><h2>{currentStep.title}</h2><p>{currentStep.description}</p></div>
      </div>

      {currentStep.id === "phrases" ? <PhraseActivation cards={config.phraseCards} copy={config.copy} ratings={ratings} setRatings={setRatings} onComplete={() => completeStep("phrases")} stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={config.steps.length} /> : null}
      {currentStep.id === "context" ? <ContextChoice questions={config.contextQuestions} answers={contextAnswers} setAnswers={setContextAnswers} onComplete={() => completeStep("context")} stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={config.steps.length} /> : null}
      {currentStep.id === "builder" ? <AnswerBuilder groups={config.answerBuilder} copy={config.copy} selections={builderSelections} setSelections={setBuilderSelections} onComplete={() => completeStep("builder")} stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={config.steps.length} /> : null}
      {currentStep.id === "rehearsal" ? <PhotoRehearsal topic={topic} rehearsal={config.rehearsal} onComplete={() => completeStep("rehearsal")} onOpenReference={() => navigate(`/speaking-workshops/${topic.id}/reference`)} stepIndex={stepIndex} setStepIndex={setStepIndex} stepCount={config.steps.length} /> : null}
    </div>
  );
}

export default function RelationshipsPreparation(props) {
  return <WorkshopPreparation {...props} config={RELATIONSHIPS_PREPARATION_CONFIG} />;
}
