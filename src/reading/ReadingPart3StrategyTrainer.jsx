import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/common/Seo.jsx";
import { logReadingGuideViewed, saveReadingProgress } from "../firebase";
import { getSitePath } from "../siteConfig.js";
import {
  PHONE_QUESTIONS,
  PHONE_SPEAKERS,
} from "./part3StrategyTrainerData.js";

const STAGE_LABELS = [
  "Your strategy",
  "Analyse one question",
  "Analyse all questions",
  "Meet Grace",
  "Reject partial matches",
  "Meet Leo",
  "Compare Nadia and Ethan",
  "Phone task recap",
  "Final strategy",
];

const REMAINING_QUESTION_ANALYSIS = [
  {
    id: "professional",
    question: PHONE_QUESTIONS[0].text,
    keyIndices: [3, 4, 7, 8, 10, 11],
    keywordExplanation:
      "Respond promptly and other people can continue working preserve both the need for speed and its effect on other people’s work.",
    modelAnswer: "Someone who must answer quickly so that other people can keep working.",
    comparisonHint: "Check that your version includes both a quick response and its effect on other people’s work.",
  },
  {
    id: "grouped",
    question: PHONE_QUESTIONS[1].text,
    keyIndices: [1, 2, 4, 6, 7, 12],
    keywordExplanation:
      "Receives alerts in groups, set times and as they arrive establish both the grouping and the contrast with immediate delivery.",
    modelAnswer: "Someone who sees groups of alerts at scheduled times instead of immediately.",
    comparisonHint: "Check that your version includes grouping, scheduled times and the contrast with immediate alerts.",
  },
  {
    id: "urgent",
    question: PHONE_QUESTIONS[2].text,
    keyIndices: [1, 3, 4, 6, 8, 9, 10],
    keywordExplanation:
      "Relies, another form of contact and genuinely urgent matters express the complete idea.",
    modelAnswer: "Someone who uses a different contact method in an emergency.",
    comparisonHint: "Check that your version includes a different method and an urgent situation.",
  },
  {
    id: "social",
    question: PHONE_QUESTIONS[3].text,
    keyIndices: [1, 2, 3, 5, 6, 7],
    keywordExplanation:
      "Keeps notifications, mainly and maintaining social contact show both what the person keeps and their main reason.",
    modelAnswer: "Someone who keeps alerts on mainly to stay connected with other people.",
    comparisonHint: "Check that your version includes keeping alerts for a mainly social reason.",
  },
  {
    id: "concentration",
    question: PHONE_QUESTIONS[5].text,
    keyIndices: [2, 3, 6, 8],
    keywordExplanation:
      "Frequent alerts, harder and concentrate carry the cause-and-effect relationship in the question.",
    modelAnswer: "Someone who finds it harder to focus when alerts arrive often.",
    comparisonHint: "Check that your version connects frequent alerts with difficulty concentrating.",
  },
  {
    id: "remember",
    question: PHONE_QUESTIONS[6].text,
    keyIndices: [4, 5, 6, 7, 9, 10],
    keywordExplanation:
      "Most complete solution and created a new responsibility preserve both the attempted solution and its unintended consequence.",
    modelAnswer: "Someone who tried the most complete fix but rejected the extra task it created.",
    comparisonHint: "Check that your version includes both the attempted solution and the new responsibility.",
  },
];

function evidenceText(question) {
  const parts = Array.isArray(question.evidenceParts)
    ? question.evidenceParts
    : question.evidence
      ? [question.evidence]
      : [];
  return parts.join(" … ");
}

function SpeakerText({ speaker, compact = false }) {
  return (
    <article className={`p3s-speaker ${compact ? "is-compact" : ""}`}>
      <div className="p3s-speaker-head">
        <h3>{speaker.name}</h3>
      </div>
      <p>{speaker.text}</p>
    </article>
  );
}

function Feedback({ correct, children }) {
  return (
    <div className={`p3s-feedback ${correct ? "is-correct" : "is-wrong"}`} role="status">
      <strong>{correct ? "That’s it." : "Not quite yet."}</strong>
      <p>{children}</p>
    </div>
  );
}

function Callout({ variant = "info", role, children }) {
  const icon = variant === "warning" ? "!" : variant === "note" ? "✦" : "i";

  return (
    <div className={`p3s-callout is-${variant}`} role={role}>
      <span className="p3s-callout-icon" aria-hidden="true">{icon}</span>
      <div className="p3s-callout-copy">{children}</div>
    </div>
  );
}

function SingleChoice({ prompt, options, answer, explanation, onCorrect }) {
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = selected === answer;

  function check() {
    if (!selected) return;
    setChecked(true);
    if (correct) onCorrect?.();
  }

  return (
    <div className="p3s-quiz-card">
      <h3>{prompt}</h3>
      <div className="p3s-options" role="radiogroup" aria-label={prompt}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`p3s-option ${selected === option.value ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name={prompt}
              value={option.value}
              checked={selected === option.value}
              onChange={() => {
                setSelected(option.value);
                setChecked(false);
              }}
            />
            <span className="p3s-option-letter">{option.value}</span>
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <button className="p3s-button" type="button" disabled={!selected} onClick={check}>
        Check
      </button>
      {checked ? <Feedback correct={correct}>{explanation}</Feedback> : null}
    </div>
  );
}

function MultiChoice({ prompt, options, answers, explanation, onCorrect }) {
  const [selected, setSelected] = useState(() => new Set());
  const [checked, setChecked] = useState(false);
  const answerSet = useMemo(() => new Set(answers), [answers]);
  const correct =
    selected.size === answerSet.size && [...selected].every((id) => answerSet.has(id));

  function toggle(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setChecked(false);
  }

  function check() {
    if (!selected.size) return;
    setChecked(true);
    if (correct) onCorrect?.();
  }

  return (
    <div className="p3s-quiz-card">
      <h3>{prompt}</h3>
      <p className="p3s-hint">Choose all that apply.</p>
      <div className="p3s-options">
        {options.map((option) => (
          <label
            key={option.id}
            className={`p3s-option ${selected.has(option.id) ? "is-selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={selected.has(option.id)}
              onChange={() => toggle(option.id)}
            />
            <span className="p3s-option-letter">{option.label}</span>
            <span>{option.text}</span>
          </label>
        ))}
      </div>
      <button className="p3s-button" type="button" disabled={!selected.size} onClick={check}>
        Check choices
      </button>
      {checked ? <Feedback correct={correct}>{explanation}</Feedback> : null}
    </div>
  );
}

function KeywordParaphraseActivity({
  activityId,
  question,
  keyIndices,
  keywordExplanation,
  modelAnswer,
  comparisonHint,
  onComplete,
}) {
  const words = question.replace(/\?$/, "").split(" ");
  const [selected, setSelected] = useState(() => new Set());
  const [checked, setChecked] = useState(false);
  const [paraphrase, setParaphrase] = useState("");
  const [compared, setCompared] = useState(false);
  const completionSent = useRef(false);

  useEffect(() => {
    if (checked && compared && !completionSent.current) {
      completionSent.current = true;
      onComplete();
    }
  }, [checked, compared, onComplete]);

  function toggleWord(index) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setChecked(false);
  }

  return (
    <div className="p3s-quiz-card p3s-question-analysis">
      <div className="p3s-analysis-step">
        <span>1 · Find the key words</span>
        <h3>Click the words that carry the question’s main meaning.</h3>
        <p className="p3s-hint">Choose content words. You do not need small grammar words.</p>
      </div>
      <div className="p3s-clickable-question" aria-label="Select the key words in the question">
        {words.map((word, index) => (
          <button
            key={`${activityId}-${index}`}
            type="button"
            className={selected.has(index) ? "is-selected" : ""}
            aria-pressed={selected.has(index)}
            onClick={() => toggleWord(index)}
          >
            {word}
          </button>
        ))}
        <span aria-hidden="true">?</span>
      </div>
      <button
        className="p3s-button"
        type="button"
        disabled={!selected.size}
        onClick={() => setChecked(true)}
      >
        Compare key words
      </button>
      {checked ? (
        <div className="p3s-keyword-comparison" role="status">
          <div>
            <strong>Your selection</strong>
            <p className="p3s-keyword-line is-user">
              {words.map((word, index) => (
                <span key={`${activityId}-user-${index}`} className={selected.has(index) ? "is-highlighted" : ""}>
                  {word}
                </span>
              ))}
              <span>?</span>
            </p>
          </div>
          <div>
            <strong>One possible selection</strong>
            <p className="p3s-keyword-line is-model">
              {words.map((word, index) => (
                <span key={`${activityId}-model-${index}`} className={keyIndices.includes(index) ? "is-highlighted" : ""}>
                  {word}
                </span>
              ))}
              <span>?</span>
            </p>
          </div>
          <p className="p3s-keyword-note">
            {keywordExplanation} Your selection does not need to be identical if it preserves the complete idea.
          </p>
        </div>
      ) : null}

      {checked ? (
        <div className="p3s-paraphrase-step">
          <div className="p3s-analysis-step">
            <span>2 · Simplify the meaning</span>
            <h3>Write the same idea in simpler English.</h3>
            <p className="p3s-hint">You do not need to write a complete question.</p>
          </div>
          <label htmlFor={`p3s-paraphrase-${activityId}`}>Your simple paraphrase</label>
          <textarea
            id={`p3s-paraphrase-${activityId}`}
            rows="3"
            value={paraphrase}
            placeholder="Write the idea in your own words…"
            onChange={(event) => {
              setParaphrase(event.target.value);
              setCompared(false);
            }}
          />
          <button
            className="p3s-button"
            type="button"
            disabled={paraphrase.trim().length < 5}
            onClick={() => setCompared(true)}
          >
            Compare my paraphrase
          </button>
          {compared ? (
            <div className="p3s-model-answer" role="status">
              <div><strong>Your version</strong><p>{paraphrase.trim()}</p></div>
              <div><strong>One possible paraphrase</strong><p>{modelAnswer}</p></div>
              <small>Your wording can be different. {comparisonHint}</small>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StageOne({ onComplete }) {
  const [done, setDone] = useState(() => new Set());
  const completionSent = useRef(false);

  useEffect(() => {
    if (done.size === 1 && !completionSent.current) {
      completionSent.current = true;
      onComplete();
    }
  }, [done, onComplete]);

  function completePart(id) {
    setDone((current) => new Set(current).add(id));
  }

  return (
    <>
      <Callout>
        <strong>Match the idea, not just the words.</strong>
        <p>
          First identify the important chunks. Then express the complete idea in simpler
          English before you search the comments.
        </p>
      </Callout>
      <KeywordParaphraseActivity
        activityId="availability"
        question={PHONE_QUESTIONS[4].text}
        keyIndices={[1, 3, 7, 9]}
        keywordExplanation="Limits, availability and time of day preserve the two essential ideas: availability changes, and the change depends on time."
        modelAnswer="Someone who chooses to be available at certain times but not at others."
        comparisonHint="Check that it includes both availability and time."
        onComplete={() => completePart("analysis")}
      />
    </>
  );
}

function FullQuestionAnalysisStage({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(() => new Set());
  const completionSent = useRef(false);
  const activity = REMAINING_QUESTION_ANALYSIS[currentIndex];

  useEffect(() => {
    if (
      completed.size === REMAINING_QUESTION_ANALYSIS.length &&
      !completionSent.current
    ) {
      completionSent.current = true;
      onComplete();
    }
  }, [completed, onComplete]);

  function completeQuestion(id) {
    setCompleted((current) => new Set(current).add(id));
  }

  const currentComplete = completed.has(activity.id);
  const isLast = currentIndex === REMAINING_QUESTION_ANALYSIS.length - 1;

  return (
    <>
      <Callout>
        <strong>Read every question before you read the comments.</strong>
        <p>
          Work through the other six questions. Find the words carrying the main
          meaning, then put each complete idea into simpler English.
        </p>
      </Callout>
      <div className="p3s-analysis-progress" aria-label={`${completed.size} of 6 questions analysed`}>
        <div><strong>Question {currentIndex + 1} of 6</strong><span>{completed.size} completed</span></div>
        <div><span style={{ width: `${(completed.size / REMAINING_QUESTION_ANALYSIS.length) * 100}%` }} /></div>
      </div>
      <KeywordParaphraseActivity
        key={activity.id}
        activityId={activity.id}
        question={activity.question}
        keyIndices={activity.keyIndices}
        keywordExplanation={activity.keywordExplanation}
        modelAnswer={activity.modelAnswer}
        comparisonHint={activity.comparisonHint}
        onComplete={() => completeQuestion(activity.id)}
      />
      {currentComplete && !isLast ? (
        <button
          className="p3s-button is-large"
          type="button"
          onClick={() => setCurrentIndex((index) => index + 1)}
        >
          Next question
        </button>
      ) : null}
      {currentComplete && isLast ? (
        <Callout variant="note" role="status">
          <strong>All seven questions analysed.</strong>
          <p>You now know the ideas you need to look for in the four comments.</p>
        </Callout>
      ) : null}
    </>
  );
}

function GraceStage({ onComplete }) {
  const grace = PHONE_SPEAKERS.find((speaker) => speaker.name === "Grace");
  const [done, setDone] = useState(() => new Set());
  const completionSent = useRef(false);

  useEffect(() => {
    if (done.size === 2 && !completionSent.current) {
      completionSent.current = true;
      onComplete();
    }
  }, [done, onComplete]);

  function completePart(id) {
    setDone((current) => new Set(current).add(id));
  }

  return (
    <>
      <SpeakerText speaker={grace} />
      <SingleChoice
        prompt="Which summary gives the best picture of Grace?"
        options={[
          { value: "A", label: "She dislikes phones and tries not to use hers." },
          { value: "B", label: "She wants to control when her phone interrupts her." },
          { value: "C", label: "She only keeps notifications from family members." },
        ]}
        answer="B"
        explanation="Grace still checks her phone regularly. Her problem is not the phone itself; it is being interrupted whenever an app chooses."
        onCorrect={() => completePart("summary")}
      />
      <MultiChoice
        prompt="Which two questions match Grace?"
        options={[
          { id: 1, label: "A", text: PHONE_QUESTIONS[0].text },
          { id: 3, label: "B", text: PHONE_QUESTIONS[2].text },
          { id: 4, label: "C", text: PHONE_QUESTIONS[3].text },
          { id: 6, label: "D", text: PHONE_QUESTIONS[5].text },
        ]}
        answers={[3, 6]}
        explanation="B matches call if it’s urgent. D matches sounds breaking her concentration and finding it easier to focus without interruptions."
        onCorrect={() => completePart("questions")}
      />
      <div className="p3s-evidence-grid">
        <div><strong>Question idea</strong><span>urgent → contact me another way</span></div>
        <div><strong>Grace’s evidence</strong><span>“my family know to call if it’s urgent”</span></div>
        <div><strong>Question idea</strong><span>alerts make concentration harder</span></div>
        <div><strong>Grace’s evidence</strong><span>“every little sound was breaking my concentration”</span></div>
      </div>
    </>
  );
}

function PartialMatchStage({ onComplete }) {
  const grace = PHONE_SPEAKERS.find((speaker) => speaker.name === "Grace");

  return (
    <>
      <Callout variant="warning">
        <strong>A shared topic is not enough.</strong>
        <p>
          Grace mentions switching notifications off, so she looks tempting. Check whether
          she expresses every part of the question.
        </p>
      </Callout>
      <details className="p3s-reference" open>
        <summary>Grace’s comment · reference</summary>
        <SpeakerText speaker={grace} compact />
      </details>
      <SingleChoice
        prompt="Could Grace answer: Who rejected disabling everything because it created another thing to remember?"
        options={[
          { value: "A", label: "Yes—she mentions disabling notifications." },
          { value: "B", label: "No—the complete idea is not in her comment." },
        ]}
        answer="B"
        explanation="Grace is happy with her solution. She never says it caused a new problem or gave her something else to remember. The shared topic points to the right area, but it does not prove the answer."
        onCorrect={onComplete}
      />
      <div className="p3s-rule">
        <span>Golden rule</span>
        <strong>Does this speaker express the complete idea?</strong>
      </div>
    </>
  );
}

function LeoStage({ onComplete }) {
  const leo = PHONE_SPEAKERS.find((speaker) => speaker.name === "Leo");
  const [done, setDone] = useState(() => new Set());
  const completionSent = useRef(false);

  useEffect(() => {
    if (done.size === 2 && !completionSent.current) {
      completionSent.current = true;
      onComplete();
    }
  }, [done, onComplete]);

  function completePart(id) {
    setDone((current) => new Set(current).add(id));
  }

  return (
    <>
      <SpeakerText speaker={leo} />
      <SingleChoice
        prompt="Complete the mini-summary: Leo wants to be…"
        options={[
          { value: "A", label: "available all the time." },
          { value: "B", label: "available quickly for work, but only during working hours." },
          { value: "C", label: "contacted by clients only in emergencies." },
        ]}
        answer="B"
        explanation="Leo needs to respond quickly during work, but Do Not Disturb at six creates a clear boundary at the end of the working day."
        onCorrect={() => completePart("summary")}
      />
      <MultiChoice
        prompt="Which two questions match Leo?"
        options={[
          { id: 1, label: "A", text: PHONE_QUESTIONS[0].text },
          { id: 2, label: "B", text: PHONE_QUESTIONS[1].text },
          { id: 5, label: "C", text: PHONE_QUESTIONS[4].text },
          { id: 6, label: "D", text: PHONE_QUESTIONS[5].text },
        ]}
        answers={[1, 5]}
        explanation="A matches work messages and clients needing quick answers. C matches Do Not Disturb at six and Leo’s stricter end to the working day."
        onCorrect={() => completePart("questions")}
      />
    </>
  );
}

function NadiaEthanStage({ onComplete }) {
  const nadia = PHONE_SPEAKERS.find((speaker) => speaker.name === "Nadia");
  const ethan = PHONE_SPEAKERS.find((speaker) => speaker.name === "Ethan");
  const [done, setDone] = useState(() => new Set());
  const completionSent = useRef(false);

  useEffect(() => {
    if (done.size === 2 && !completionSent.current) {
      completionSent.current = true;
      onComplete();
    }
  }, [done, onComplete]);

  function completePart(id) {
    setDone((current) => new Set(current).add(id));
  }

  return (
    <>
      <SpeakerText speaker={nadia} />
      <SingleChoice
        prompt="Which question matches Nadia?"
        options={[
          { value: "A", label: PHONE_QUESTIONS[2].text },
          { value: "B", label: PHONE_QUESTIONS[3].text },
          { value: "C", label: PHONE_QUESTIONS[5].text },
          { value: "D", label: PHONE_QUESTIONS[4].text },
        ]}
        answer="B"
        explanation="Friends, group chats, keeping up with people and not missing plans combine to express the broader idea of maintaining social contact."
        onCorrect={() => completePart("nadia")}
      />
      <SpeakerText speaker={ethan} />
      <MultiChoice
        prompt="Which two questions match Ethan?"
        options={[
          { id: 2, label: "A", text: PHONE_QUESTIONS[1].text },
          { id: 7, label: "B", text: PHONE_QUESTIONS[6].text },
          { id: 6, label: "C", text: PHONE_QUESTIONS[5].text },
          { id: 4, label: "D", text: PHONE_QUESTIONS[3].text },
        ]}
        answers={[2, 7]}
        explanation="A matches alerts collected at lunchtime and in the evening. B matches rejecting a complete switch-off because he had to remember which apps to check."
        onCorrect={() => completePart("ethan")}
      />
      <Callout variant="note">
        <strong>Why is concentration tempting here?</strong>
        <p>
          Ethan says his alerts interrupt him less, so he overlaps with Grace. Grace is the
          better answer because she explicitly says sounds were breaking her concentration
          and that she can focus more easily without them. Choose the best-supported match.
        </p>
      </Callout>
    </>
  );
}

function FullMatchingTask({ speakers, questions, onComplete }) {
  const names = speakers.map((speaker) => speaker.name);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const score = questions.reduce(
    (total, question) => total + (answers[question.id] === question.answer ? 1 : 0),
    0
  );
  const allAnswered = questions.every((question) => answers[question.id]);

  function check() {
    setChecked(true);
    onComplete?.();
  }

  return (
    <>
      <div className="p3s-task-intro">
        <strong>Reconstruct the complete phone task</strong>
        <p>You have met every speaker. Now rebuild all seven matches from the evidence you analysed.</p>
      </div>
      <div className="p3s-speaker-stack">
        {speakers.map((speaker) => <SpeakerText key={speaker.name} speaker={speaker} compact />)}
      </div>
      <ol className="p3s-question-list">
        {questions.map((question) => {
          const correct = answers[question.id] === question.answer;
          return (
            <li key={question.id} className={checked ? (correct ? "is-correct" : "is-wrong") : ""}>
              <div className="p3s-question-row">
                <span>{question.text}</span>
                <select
                  aria-label={`Answer question ${question.id}`}
                  value={answers[question.id] || ""}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, [question.id]: event.target.value }));
                    setChecked(false);
                  }}
                >
                  <option value="">Choose</option>
                  {names.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              {checked ? (
                <div className="p3s-answer-detail">
                  <strong>{correct ? "Correct" : `Answer: ${question.answer}`}</strong>
                  <p><span>Evidence:</span> “{evidenceText(question)}”</p>
                  <p>{question.explanation}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <button className="p3s-button" type="button" disabled={!allAnswered} onClick={check}>
        Check all answers
      </button>
      {checked ? (
        <div className="p3s-score" role="status">
          <strong>{score} / {questions.length}</strong>
          <span>{score === questions.length ? "Excellent—every match is supported." : "Review the evidence, then change any answers you want to retry."}</span>
        </div>
      ) : null}
    </>
  );
}

export default function ReadingPart3StrategyTrainer() {
  const navigate = useNavigate();
  const topRef = useRef(null);
  const [stage, setStage] = useState(0);
  const [completed, setCompleted] = useState(() => new Set([0]));

  useEffect(() => {
    window.scrollTo(0, 0);
    logReadingGuideViewed({ guideId: "reading_part3_strategy_trainer" });
  }, []);

  useEffect(() => {
    if (stage === STAGE_LABELS.length - 1) {
      saveReadingProgress("part3-strategy", "guide");
    }
  }, [stage]);

  function completeStage(index) {
    setCompleted((current) => new Set(current).add(index));
  }

  function goToStage(nextStage) {
    setStage(nextStage);
    window.requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const stageContent = [
    <div key="intro" className="p3s-intro-stage">
      <div className="p3s-hero-copy">
        <span className="p3s-kicker">Aptis Reading Part 3</span>
        <h1>Match the idea, not just the words</h1>
        <p>
          Four people give opinions on one topic. Your job is to match seven questions
          to the people who express the same complete ideas in different language.
        </p>
      </div>
      <div className="p3s-strategy-flow" aria-label="Four-step strategy">
        <div><span>1</span><strong>Understand</strong><small>Find the key chunks.</small></div>
        <div><span>2</span><strong>Simplify</strong><small>Say the idea in easier English.</small></div>
        <div><span>3</span><strong>Match</strong><small>Look for the complete meaning.</small></div>
        <div><span>4</span><strong>Prove</strong><small>Find evidence in the comment.</small></div>
      </div>
      <Callout variant="note">
        <strong>A shared word is a clue, not proof.</strong>
        <p>Different words can express the same idea, while the same word can appear in a distractor.</p>
      </Callout>
    </div>,
    <StageOne key="understand" onComplete={() => completeStage(1)} />,
    <FullQuestionAnalysisStage key="all-questions" onComplete={() => completeStage(2)} />,
    <GraceStage key="grace" onComplete={() => completeStage(3)} />,
    <PartialMatchStage key="partial" onComplete={() => completeStage(4)} />,
    <LeoStage key="leo" onComplete={() => completeStage(5)} />,
    <NadiaEthanStage key="nadia-ethan" onComplete={() => completeStage(6)} />,
    <FullMatchingTask
      key="recap"
      speakers={PHONE_SPEAKERS}
      questions={PHONE_QUESTIONS}
      onComplete={() => completeStage(7)}
    />,
    <div key="final" className="p3s-final">
      <span className="p3s-kicker">Keep this for the exam</span>
      <h2>Your four-step Part 3 strategy</h2>
      <ol>
        <li><strong>Understand the question.</strong><span>Identify the key chunks, not just individual words.</span></li>
        <li><strong>Simplify the idea.</strong><span>Ask: What does this mean in easier English?</span></li>
        <li><strong>Match the complete meaning.</strong><span>A speaker may mention the same topic without answering the question.</span></li>
        <li><strong>Prove your answer.</strong><span>Find the phrase or idea in the comment that supports the match.</span></li>
      </ol>
      <div className="p3s-rule"><span>Remember</span><strong>Don’t match words. Match complete ideas.</strong></div>
      <button className="p3s-button is-large" type="button" onClick={() => navigate(getSitePath("/reading/part3"))}>
        Continue to Part 3 practice
      </button>
    </div>,
  ];

  return (
    <main className="part3-strategy-trainer game-wrapper" ref={topRef}>
      <Seo
        title="Aptis Reading Part 3 Strategy Trainer | Seif Aptis Trainer"
        description="Learn to paraphrase questions, reject partial matches and prove answers in Aptis Reading Part 3."
      />
      <StyleScope />

      <header className="p3s-progress-head">
        <div>
          <span>Stage {stage + 1} of {STAGE_LABELS.length}</span>
          <strong>{STAGE_LABELS[stage]}</strong>
        </div>
        <div className="p3s-progress-track" aria-label={`${stage + 1} of ${STAGE_LABELS.length} stages`}>
          <span style={{ width: `${((stage + 1) / STAGE_LABELS.length) * 100}%` }} />
        </div>
      </header>

      <section className="p3s-stage" aria-label={STAGE_LABELS[stage]}>
        {stage > 0 && stage < STAGE_LABELS.length - 1 ? (
          <div className="p3s-stage-heading">
            <span>Stage {stage + 1}</span>
            <h2 id="p3s-stage-title">{STAGE_LABELS[stage]}</h2>
          </div>
        ) : null}
        {stageContent.map((content, index) => (
          <div key={STAGE_LABELS[index]} hidden={stage !== index}>{content}</div>
        ))}
      </section>

      <nav className="p3s-stage-nav" aria-label="Strategy trainer stages">
        <button
          className="p3s-button is-secondary"
          type="button"
          disabled={stage === 0}
          onClick={() => goToStage(stage - 1)}
        >
          Previous
        </button>
        {stage < STAGE_LABELS.length - 1 ? (
          <button
            className="p3s-button"
            type="button"
            disabled={!completed.has(stage)}
            onClick={() => goToStage(stage + 1)}
          >
            Continue
          </button>
        ) : null}
      </nav>
    </main>
  );
}

function StyleScope() {
  return <style>{`
    .part3-strategy-trainer {
      --p3s-ink: var(--color-text, #eaf2ff);
      --p3s-soft: var(--color-text-soft, #b9c7da);
      --p3s-surface: var(--color-surface-raised, #13213b);
      --p3s-surface-2: color-mix(in srgb, var(--p3s-surface) 82%, #24365d);
      --p3s-border: var(--color-border, #334b72);
      --p3s-accent: var(--color-accent, #6ea8ff);
      --p3s-gold: #f2b705;
      --p3s-green: #36c58a;
      --p3s-red: #ef7b7b;
      color: var(--p3s-ink);
      max-width: 980px;
      margin-inline: auto;
    }
    .part3-strategy-trainer [hidden] { display:none !important; }
    .p3s-progress-head {
      position:sticky;
      top:.5rem;
      z-index:20;
      padding:.8rem 1rem;
      margin-bottom:1rem;
      border:1px solid var(--p3s-border);
      border-radius:14px;
      background:color-mix(in srgb, var(--p3s-surface) 94%, transparent);
      backdrop-filter:blur(12px);
      box-shadow:0 10px 24px rgba(0,0,0,.18);
    }
    .p3s-progress-head > div:first-child { display:flex; justify-content:space-between; gap:1rem; }
    .p3s-progress-head span { color:var(--p3s-soft); font-size:.82rem; }
    .p3s-progress-track { height:6px; margin-top:.6rem; background:rgba(255,255,255,.1); border-radius:99px; overflow:hidden; }
    .p3s-progress-track span { display:block; height:100%; background:linear-gradient(90deg, var(--p3s-gold), var(--p3s-accent)); transition:width .25s ease; }
    .p3s-stage {
      background:var(--p3s-surface);
      border:1px solid var(--p3s-border);
      border-radius:22px;
      padding:clamp(1rem, 3vw, 2rem);
      box-shadow:0 18px 45px rgba(0,0,0,.2);
    }
    .p3s-stage-heading { margin-bottom:1.25rem; }
    .p3s-stage-heading span, .p3s-kicker { color:var(--p3s-gold); font-size:.78rem; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
    .p3s-stage-heading h2 { margin:.2rem 0 0; font-size:clamp(1.5rem, 4vw, 2.25rem); }
    .p3s-hero-copy { max-width:760px; }
    .p3s-hero-copy h1 { margin:.35rem 0 .7rem; font-size:clamp(2rem, 6vw, 3.5rem); line-height:1.02; letter-spacing:-.035em; }
    .p3s-hero-copy p { color:var(--p3s-soft); font-size:1.05rem; line-height:1.65; }
    .p3s-strategy-flow { display:grid; grid-template-columns:repeat(4,1fr); gap:.7rem; margin:1.5rem 0; }
    .p3s-strategy-flow div { padding:1rem; border:1px solid var(--p3s-border); border-radius:14px; background:var(--p3s-surface-2); }
    .p3s-strategy-flow div > span { display:grid; place-items:center; width:1.8rem; height:1.8rem; margin-bottom:.6rem; border-radius:50%; background:var(--p3s-gold); color:#152033; font-weight:900; }
    .p3s-strategy-flow strong, .p3s-strategy-flow small { display:block; }
    .p3s-strategy-flow small { color:var(--p3s-soft); margin-top:.2rem; line-height:1.35; }
    .p3s-callout {
      --p3s-callout-color:var(--p3s-accent);
      position:relative;
      isolation:isolate;
      overflow:hidden;
      margin:1.1rem 0;
      padding:1.15rem 1.3rem 1.15rem 4.45rem;
      border:1px solid color-mix(in srgb, var(--p3s-callout-color) 38%, var(--p3s-border));
      border-radius:18px;
      background:
        radial-gradient(circle at 92% 0%, color-mix(in srgb, var(--p3s-callout-color) 18%, transparent), transparent 35%),
        linear-gradient(135deg, color-mix(in srgb, var(--p3s-callout-color) 11%, var(--p3s-surface-2)), var(--p3s-surface-2) 72%);
      box-shadow:inset 0 1px 0 color-mix(in srgb, white 10%, transparent), 0 12px 28px rgba(0,0,0,.13);
    }
    .p3s-callout-icon {
      position:absolute;
      z-index:1;
      top:1.05rem;
      left:1.15rem;
      display:grid;
      place-items:center;
      width:2.25rem;
      height:2.25rem;
      border:1px solid color-mix(in srgb, var(--p3s-callout-color) 58%, transparent);
      border-radius:12px;
      background:color-mix(in srgb, var(--p3s-callout-color) 20%, var(--p3s-surface));
      color:var(--p3s-callout-color);
      font-size:1.05rem;
      font-weight:900;
      font-style:normal;
      box-shadow:inset 0 1px 0 color-mix(in srgb, white 14%, transparent);
    }
    .p3s-callout-copy { position:relative; z-index:1; }
    .p3s-callout::after {
      content:"";
      position:absolute;
      z-index:-1;
      right:-2.5rem;
      bottom:-4.5rem;
      width:10rem;
      height:10rem;
      border:1px solid color-mix(in srgb, var(--p3s-callout-color) 16%, transparent);
      border-radius:50%;
    }
    .p3s-callout.is-warning { --p3s-callout-color:var(--p3s-gold); }
    .p3s-callout.is-note { --p3s-callout-color:var(--p3s-green); }
    .p3s-callout strong { display:block; margin-bottom:.3rem; color:var(--p3s-ink); font-size:1.02rem; line-height:1.4; }
    .p3s-callout p { margin:0; color:var(--p3s-soft); line-height:1.6; }
    .p3s-quiz-card { margin:1rem 0; padding:1rem; border:1px solid var(--p3s-border); border-radius:16px; background:var(--p3s-surface-2); }
    .p3s-quiz-card h3 { margin:0 0 .4rem; font-size:1.03rem; line-height:1.45; }
    .p3s-hint { color:var(--p3s-soft); margin:.15rem 0 .75rem; font-size:.88rem; }
    .p3s-analysis-step > span { display:block; margin-bottom:.25rem; color:var(--p3s-accent); font-size:.76rem; font-weight:900; letter-spacing:.07em; text-transform:uppercase; }
    .p3s-clickable-question { display:flex; flex-wrap:wrap; align-items:baseline; gap:.35rem; margin:.9rem 0 1rem; padding:1rem; border:1px solid var(--p3s-border); border-radius:13px; background:color-mix(in srgb, var(--p3s-surface) 90%, transparent); font-size:clamp(1.15rem, 3vw, 1.45rem); line-height:1.7; }
    .p3s-clickable-question button { appearance:none; padding:.08rem .24rem; border:0; border-radius:6px; background:transparent; color:var(--p3s-ink); font:inherit; cursor:pointer; text-decoration:underline; text-decoration-color:color-mix(in srgb, var(--p3s-accent) 38%, transparent); text-underline-offset:.22rem; }
    .p3s-clickable-question button:hover { background:color-mix(in srgb, var(--p3s-accent) 12%, transparent); }
    .p3s-clickable-question button.is-selected { background:color-mix(in srgb, var(--p3s-gold) 78%, #fff); color:#172033; font-weight:800; text-decoration:none; box-shadow:0 0 0 2px color-mix(in srgb, var(--p3s-gold) 32%, transparent); }
    .p3s-keyword-comparison { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; margin-top:.8rem; padding:.85rem; border:1px solid var(--p3s-border); border-radius:12px; background:color-mix(in srgb, var(--p3s-surface) 88%, transparent); }
    .p3s-keyword-comparison > div { padding:.75rem; border-radius:10px; background:var(--p3s-surface-2); }
    .p3s-keyword-comparison > div > strong { display:block; margin-bottom:.45rem; color:var(--p3s-accent); font-size:.8rem; }
    .p3s-keyword-line { display:flex; flex-wrap:wrap; gap:.28rem; margin:0; color:var(--p3s-soft); line-height:1.7; }
    .p3s-keyword-line span { padding:.02rem .18rem; border-radius:5px; }
    .p3s-keyword-line.is-user span.is-highlighted { background:color-mix(in srgb, var(--p3s-gold) 78%, #fff); color:#172033; font-weight:800; }
    .p3s-keyword-line.is-model span.is-highlighted { background:color-mix(in srgb, var(--p3s-green) 72%, #fff); color:#10261e; font-weight:800; }
    .p3s-keyword-note { grid-column:1 / -1; margin:0; color:var(--p3s-soft); font-size:.9rem; line-height:1.5; }
    .p3s-paraphrase-step { margin-top:1.1rem; padding-top:1.1rem; border-top:1px solid var(--p3s-border); }
    .p3s-paraphrase-step label { display:block; margin:.8rem 0 .35rem; font-size:.86rem; font-weight:800; }
    .p3s-paraphrase-step textarea { box-sizing:border-box; width:100%; resize:vertical; margin-bottom:.7rem; padding:.75rem .8rem; border:1px solid var(--p3s-border); border-radius:11px; background:color-mix(in srgb, var(--p3s-surface) 90%, transparent); color:var(--p3s-ink); font:inherit; line-height:1.5; }
    .p3s-paraphrase-step textarea:focus { outline:2px solid color-mix(in srgb, var(--p3s-accent) 55%, transparent); outline-offset:2px; }
    .p3s-paraphrase-step textarea::placeholder { color:var(--p3s-soft); }
    .p3s-model-answer { display:grid; gap:.65rem; margin-top:.8rem; padding:.85rem; border:1px solid color-mix(in srgb, var(--p3s-green) 55%, transparent); border-radius:11px; background:color-mix(in srgb, var(--p3s-green) 10%, transparent); }
    .p3s-model-answer div { display:grid; gap:.15rem; }
    .p3s-model-answer strong { color:var(--p3s-green); font-size:.8rem; }
    .p3s-model-answer p { margin:0; line-height:1.5; }
    .p3s-model-answer small { color:var(--p3s-soft); line-height:1.45; }
    .p3s-analysis-progress { margin:1rem 0; }
    .p3s-analysis-progress > div:first-child { display:flex; justify-content:space-between; gap:1rem; margin-bottom:.45rem; }
    .p3s-analysis-progress > div:first-child span { color:var(--p3s-soft); font-size:.86rem; }
    .p3s-analysis-progress > div:last-child { height:8px; overflow:hidden; border-radius:99px; background:color-mix(in srgb, var(--p3s-border) 55%, transparent); }
    .p3s-analysis-progress > div:last-child span { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg, var(--p3s-gold), var(--p3s-green)); transition:width .2s ease; }
    .p3s-options { display:grid; gap:.55rem; margin:.8rem 0; }
    .p3s-option { display:flex; gap:.7rem; align-items:flex-start; padding:.72rem .8rem; border:1px solid var(--p3s-border); border-radius:12px; background:color-mix(in srgb, var(--p3s-surface) 90%, transparent); cursor:pointer; line-height:1.45; transition:border-color .15s ease, transform .15s ease; }
    .p3s-option:hover { border-color:var(--p3s-accent); transform:translateY(-1px); }
    .p3s-option.is-selected { border-color:var(--p3s-accent); box-shadow:0 0 0 2px color-mix(in srgb, var(--p3s-accent) 25%, transparent); }
    .p3s-option input { margin-top:.25rem; accent-color:var(--p3s-accent); }
    .p3s-option-letter { color:var(--p3s-accent); font-weight:900; min-width:1.1rem; }
    .p3s-button { appearance:none; border:1px solid color-mix(in srgb, var(--p3s-accent) 75%, white); border-radius:11px; background:color-mix(in srgb, var(--p3s-accent) 55%, #16325c); color:white; font-weight:800; padding:.65rem .95rem; cursor:pointer; }
    .p3s-button:hover:not(:disabled) { filter:brightness(1.08); }
    .p3s-button:disabled { opacity:.42; cursor:not-allowed; }
    .p3s-button.is-secondary { background:transparent; color:var(--p3s-ink); border-color:var(--p3s-border); }
    .p3s-button.is-large { margin-top:1rem; padding:.8rem 1.15rem; }
    .p3s-feedback { margin-top:.8rem; padding:.75rem .85rem; border-radius:11px; border:1px solid; }
    .p3s-feedback.is-correct { border-color:color-mix(in srgb, var(--p3s-green) 60%, transparent); background:color-mix(in srgb, var(--p3s-green) 12%, transparent); }
    .p3s-feedback.is-wrong { border-color:color-mix(in srgb, var(--p3s-red) 60%, transparent); background:color-mix(in srgb, var(--p3s-red) 10%, transparent); }
    .p3s-feedback p { margin:.25rem 0 0; color:var(--p3s-soft); line-height:1.5; }
    .p3s-speaker { margin:1rem 0; padding:1rem; border:1px solid var(--p3s-border); border-radius:16px; background:color-mix(in srgb, var(--p3s-surface) 88%, #1b3154); }
    .p3s-speaker-head { margin-bottom:.45rem; }
    .p3s-speaker h3 { margin:0; color:var(--p3s-green); }
    .p3s-speaker p { margin:0; line-height:1.65; }
    .p3s-speaker.is-compact p { font-size:.94rem; }
    .p3s-evidence-grid { display:grid; grid-template-columns:1fr 1.5fr; gap:1px; margin:1rem 0; overflow:hidden; border:1px solid var(--p3s-border); border-radius:14px; background:var(--p3s-border); }
    .p3s-evidence-grid div { display:flex; flex-direction:column; gap:.25rem; padding:.75rem; background:var(--p3s-surface-2); }
    .p3s-evidence-grid strong { color:var(--p3s-accent); font-size:.82rem; }
    .p3s-evidence-grid span { line-height:1.45; }
    .p3s-rule { display:flex; flex-direction:column; gap:.25rem; margin:1rem 0; padding:1rem; border-radius:14px; background:linear-gradient(110deg, color-mix(in srgb, var(--p3s-gold) 22%, var(--p3s-surface)), var(--p3s-surface-2)); }
    .p3s-rule span { color:var(--p3s-gold); font-size:.75rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
    .p3s-reference { margin:1rem 0; border:1px solid var(--p3s-border); border-radius:14px; background:var(--p3s-surface-2); overflow:hidden; }
    .p3s-reference summary { padding:.8rem 1rem; color:var(--p3s-accent); font-weight:800; cursor:pointer; }
    .p3s-reference[open] summary { border-bottom:1px solid var(--p3s-border); }
    .p3s-reference .p3s-speaker { margin:.75rem; }
    .p3s-question-row select { background:#24365d; color:var(--p3s-ink); border:1px solid #4a6695; border-radius:9px; padding:.45rem .55rem; }
    .p3s-task-intro { margin-bottom:1rem; padding:1rem; border-radius:14px; background:linear-gradient(110deg, color-mix(in srgb, var(--p3s-accent) 18%, var(--p3s-surface)), var(--p3s-surface-2)); }
    .p3s-task-intro strong { font-size:1.25rem; }
    .p3s-task-intro p { margin:.3rem 0 0; color:var(--p3s-soft); }
    .p3s-speaker-stack { display:grid; gap:.7rem; }
    .p3s-speaker-stack .p3s-speaker { margin:0; }
    .p3s-question-list { display:grid; gap:.7rem; padding-left:1.7rem; margin:1.2rem 0; }
    .p3s-question-list > li { padding:.8rem; border:1px solid var(--p3s-border); border-radius:12px; background:var(--p3s-surface-2); }
    .p3s-question-list > li.is-correct { border-color:color-mix(in srgb, var(--p3s-green) 60%, transparent); }
    .p3s-question-list > li.is-wrong { border-color:color-mix(in srgb, var(--p3s-red) 60%, transparent); }
    .p3s-question-row { display:flex; gap:.8rem; justify-content:space-between; align-items:flex-start; line-height:1.45; }
    .p3s-question-row span { flex:1; }
    .p3s-answer-detail { margin-top:.65rem; padding-top:.65rem; border-top:1px solid var(--p3s-border); font-size:.9rem; }
    .p3s-answer-detail strong { color:var(--p3s-accent); }
    .p3s-answer-detail p { margin:.3rem 0 0; color:var(--p3s-soft); line-height:1.45; }
    .p3s-answer-detail p span { color:var(--p3s-ink); font-weight:800; }
    .p3s-score { display:flex; align-items:center; gap:.8rem; margin-top:1rem; padding:.8rem 1rem; border-radius:12px; background:color-mix(in srgb, var(--p3s-green) 12%, var(--p3s-surface-2)); }
    .p3s-score strong { font-size:1.35rem; color:var(--p3s-green); }
    .p3s-score span { color:var(--p3s-soft); }
    .p3s-final h2 { margin:.3rem 0 1rem; font-size:clamp(1.7rem, 5vw, 2.6rem); }
    .p3s-final ol { display:grid; gap:.7rem; padding-left:1.5rem; }
    .p3s-final li { padding:.7rem .8rem; border:1px solid var(--p3s-border); border-radius:12px; background:var(--p3s-surface-2); }
    .p3s-final li strong, .p3s-final li span { display:block; }
    .p3s-final li span { color:var(--p3s-soft); margin-top:.2rem; }
    .p3s-stage-nav { display:flex; justify-content:space-between; gap:1rem; margin-top:1rem; }
    @media (max-width:720px) {
      .p3s-strategy-flow { grid-template-columns:1fr 1fr; }
      .p3s-evidence-grid { grid-template-columns:1fr; }
      .p3s-keyword-comparison { grid-template-columns:1fr; }
      .p3s-keyword-note { grid-column:1; }
      .p3s-question-row { flex-direction:column; }
      .p3s-question-row select { width:100%; }
      .p3s-progress-head > div:first-child { flex-direction:column; gap:.15rem; }
    }
    @media (max-width:460px) {
      .p3s-strategy-flow { grid-template-columns:1fr; }
      .p3s-stage { border-radius:16px; padding:.9rem; }
      .p3s-callout { padding:1rem 1rem 1rem 3.9rem; border-radius:15px; }
      .p3s-callout-icon { top:.9rem; left:.9rem; width:2.1rem; height:2.1rem; }
    }
  `}</style>;
}
