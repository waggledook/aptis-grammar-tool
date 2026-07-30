import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Ear,
  Headphones,
  ListChecks,
  MessageSquareText,
  RotateCcw,
  Search,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const versionRows = [
  {
    feature: "Questions",
    b2: "5",
    c1: "6",
  },
  {
    feature: "Dialogue length",
    b2: "400–525 words",
    c1: "600–650 words",
  },
  {
    feature: "Typical topics",
    b2: "Social and general interest",
    c1: "Academic or professional",
  },
  {
    feature: "Positions",
    b2: "Agreement and disagreement are more clearly signposted",
    c1: "Agreement, scope and qualification are often subtler",
  },
  {
    feature: "Language",
    b2: "Some idiomatic and reduced language",
    c1: "More complex syntax, idioms, overlap and redundancy",
  },
  {
    feature: "Main challenge",
    b2: "Following and comparing relatively clear positions",
    c1: "Reconstructing nuanced or partly implied positions",
  },
];

const quizQuestions = [
  {
    id: "recording",
    prompt: "What do you listen to in Advanced Listening Part 3?",
    options: ["Five separate short recordings", "One longer dialogue", "One academic lecture"],
    answer: "One longer dialogue",
    explanation: "A man and a woman discuss one topic and express a range of opinions.",
  },
  {
    id: "questions",
    prompt: "How many questions are there?",
    options: ["Five at B2 and six at C1", "Six at B2 and five at C1", "Six at both levels"],
    answer: "Five at B2 and six at C1",
    explanation: "The number of opinion statements depends on the selected task level.",
  },
  {
    id: "selection",
    prompt: "How is the Part 3 task level selected?",
    options: [
      "You choose B2 or C1",
      "It follows the updated ability estimate after Part 2",
      "Every candidate receives both versions",
    ],
    answer: "It follows the updated ability estimate after Part 2",
    explanation: "The adaptive test uses performance so far to select the appropriate task.",
  },
  {
    id: "limited-agreement",
    prompt: "“I see why you think that, although I’m not completely persuaded.” What does this show?",
    options: ["Complete agreement", "Understanding followed by doubt", "Complete disagreement"],
    answer: "Understanding followed by doubt",
    explanation: "Acknowledging an argument does not mean fully accepting it.",
  },
  {
    id: "different-reasons",
    prompt: "The speakers give different examples but reach the same conclusion. Which answer may be correct?",
    options: ["Woman", "Man", "Both"],
    answer: "Both",
    explanation: "Speakers can support the same opinion through different language, reasons or examples.",
  },
  {
    id: "second-listen",
    prompt: "What is the best use of the second listening?",
    options: [
      "Listen for evidence separating uncertain options",
      "Ignore the first answers and start again",
      "Write down every word spoken",
    ],
    answer: "Listen for evidence separating uncertain options",
    explanation: "Focus on ownership, qualification, implied meaning and each speaker's final position.",
  },
];

function QuizQuestion({ question, selectedAnswer, onSelect }) {
  const answered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === question.answer;

  return (
    <section className={`ote-training-quiz-item ${answered ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}>
      <h3>{question.prompt}</h3>
      <div className="ote-training-options">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isAnswer = question.answer === option;
          return (
            <button
              className={`ote-training-option ${isSelected ? "is-selected" : ""} ${
                answered && isAnswer ? "is-answer" : ""
              }`}
              key={option}
              onClick={() => onSelect(question.id, option)}
              type="button"
            >
              <span>{option}</span>
              {answered && isAnswer ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              {answered && isSelected && !isAnswer ? <XCircle size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="ote-training-feedback">
          <strong>{isCorrect ? "Correct." : "Not quite."}</strong> {question.explanation}
        </p>
      ) : null}
    </section>
  );
}

export default function OteAdvancedListeningPart3Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/listening/advanced/part-3-opinion-matching"
    : "/ote/listening/advanced/part-3-opinion-matching";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/set-1`);
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quizQuestions.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  useEffect(() => {
    if (completedLoggedRef.current || answeredCount < quizQuestions.length) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "listening.part3.advanced-guide",
      section: "listening",
      part: "part-3",
      mode: "advanced_guide",
      taskTitle: "Advanced Listening Part 3 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Listening Part 3 Guide | Matching Opinions"
        description="Prepare for OTE Advanced Listening Part 3 with its woman, man or both format, adaptive B2 and C1 versions, opinion traps and review quiz."
      />

      <button className="ote-training-back" onClick={() => navigate(menuPath)} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 3 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Listening Part 3</p>
        <h1>Matching Opinions</h1>
        <p>
          Listen to one longer conversation between a man and a woman. Decide whether each
          opinion is expressed by the woman, the man or both speakers.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Listening Part 3 essentials">
        <div>
          <MessageSquareText size={24} aria-hidden="true" />
          <strong>1 longer dialogue</strong>
          <span>A formal or semi-formal discussion of one accessible topic.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>5 or 6 opinions</strong>
          <span>The B2 version has five statements and the C1 version has six.</span>
        </div>
        <div>
          <Users size={24} aria-hidden="true" />
          <strong>Woman, man or both</strong>
          <span>Match clearly stated and implied positions to their owners.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Before the dialogue, you see a series of short opinion statements with three choices:
          woman, man or both. There is no completed example. The clock shows how much time you
          have to inspect the task before the conversation begins.
        </p>
        <p>
          You hear the dialogue twice. The statements paraphrase opinions from the recording, so
          repeated vocabulary alone is not enough. You must match the complete meaning, including
          its strength, scope and ownership.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>The Two Possible Versions</h2>
        <p>
          You do not choose B2 or C1. Your answers in Part 2 update the test's estimate of your
          listening ability, and the test selects an appropriate Part 3 task on a different topic.
        </p>
        <div className="ote-training-compare" role="table" aria-label="Advanced Listening Part 3 versions">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Feature</span>
            <span role="columnheader">B2 version</span>
            <span role="columnheader">C1 version</span>
          </div>
          {versionRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.feature}>
              <span role="cell">{row.feature}</span>
              <span role="cell">{row.b2}</span>
              <span role="cell">{row.c1}</span>
            </div>
          ))}
        </div>
        <p>
          C1 topics may be academic or professional, but they remain accessible to
          non-specialists. The questions test opinions and attitudes rather than specialist
          knowledge.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Use the Preview Time Well</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>1. Read the complete claim</h3>
            <p>
              Notice limiting words such as <em>mainly, always, only, enough, too, likely</em> and
              <em> should</em>.
            </p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>2. Identify the judgement</h3>
            <p>Ask what a speaker must genuinely believe for the entire statement to be true.</p>
          </article>
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>3. Treat “both” as two claims</h3>
            <p>Expect to locate separate supporting evidence from the woman and the man.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Two-Listening Method</h2>
        <div className="ote-training-rule-grid is-two-column">
          <article>
            <Headphones size={22} aria-hidden="true" />
            <h3>First listening: follow the positions</h3>
            <p>
              Track each speaker's main view, reasons, examples and qualifications. Make
              provisional choices but keep following the discussion when one statement remains
              uncertain.
            </p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Second listening: test the distinction</h3>
            <p>
              Ask whether both speakers really support the claim, whether it belongs to somebody
              being quoted, and whether its wording is broader or stronger than the evidence.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Why Can All Three Answers Sound Possible?</h2>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Woman:</strong> “Using recycled materials is better than throwing them away,
            although manufacturing still uses a lot of energy.”
            <br />
            <strong>Man:</strong> “That’s true, but some companies exaggerate how environmentally
            friendly their products are.”
          </p>
        </div>
        <p>
          For <em>Recycling materials does not remove every environmental problem</em>, the answer
          is both. The speakers use different evidence but support the same broader view. A
          stronger claim such as <em>Companies deliberately give customers false information</em>
          is not safely supported by the man's word <em>exaggerate</em>.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Makes C1 More Difficult?</h2>
        <ul className="ote-training-checklist">
          <li><strong>Distributed evidence:</strong> a position may become clear only across several turns.</li>
          <li><strong>Limited agreement:</strong> a speaker accepts the principle but doubts the practical result.</li>
          <li><strong>Exploration without acceptance:</strong> possible explanations are considered before the speaker's own view emerges.</li>
          <li><strong>A qualified ending:</strong> the final position may remain deliberately conditional.</li>
          <li><strong>Natural speech:</strong> overlap, repetition and reformulation can hide the structure of the argument.</li>
          <li><strong>Scope differences:</strong> words such as <em>some, often, may</em> cannot justify <em>all, always</em> or <em>will</em>.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Common Distractor Tricks</h2>
        <ul className="ote-training-checklist">
          <li><strong>Same topic, different opinion:</strong> both discuss it, but only one supports the precise claim.</li>
          <li><strong>Understanding, not agreement:</strong> acknowledgement is mistaken for a shared position.</li>
          <li><strong>Reported view:</strong> critics or supporters hold the opinion, not necessarily the speaker.</li>
          <li><strong>Partial agreement:</strong> one benefit is accepted while the overall claim is rejected.</li>
          <li><strong>First reaction, final position:</strong> later evaluation replaces an initial response.</li>
          <li><strong>Different reasons, same conclusion:</strong> separate arguments can still make the answer both.</li>
          <li><strong>Right words, wrong strength:</strong> a possibility is turned into a certainty or a minor issue into a serious one.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Helpful Words to Notice</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Agreement</h3>
            <p><em>exactly, absolutely, I agree, so do I, that's true</em></p>
          </article>
          <article>
            <h3>Qualification</h3>
            <p><em>but, although, mind you, having said that, up to a point</em></p>
          </article>
          <article>
            <h3>Personal position</h3>
            <p><em>my impression is, I tend to think, what concerns me is, I'm not convinced</em></p>
          </article>
          <article>
            <h3>Reported views</h3>
            <p><em>critics argue, supporters believe, it has been suggested, the general view is</em></p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <MessageSquareText size={22} aria-hidden="true" />
            <h3>Match the complete opinion</h3>
            <p>One repeated word or true detail cannot establish the full statement.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Track ownership and scope</h3>
            <p>Identify who believes the idea and whether the statement is stronger than their evidence.</p>
          </article>
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>Prove “both” twice</h3>
            <p>Find distinct support from each speaker, even when their reasons differ.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 3 Review Quiz</h2>
            <p>Choose an answer to get immediate feedback.</p>
          </div>
          <div className="ote-training-score" aria-live="polite">
            {correctCount}/{quizQuestions.length}
          </div>
        </div>

        {quizQuestions.map((question) => (
          <QuizQuestion
            key={question.id}
            question={question}
            selectedAnswer={answers[question.id]}
            onSelect={selectAnswer}
          />
        ))}

        {answeredCount === quizQuestions.length ? (
          <div className="ote-training-complete">
            <strong>{correctCount === quizQuestions.length ? "Excellent, full marks." : "Good review."}</strong>
            <span>
              You answered {correctCount} of {quizQuestions.length} correctly. Use the feedback
              above to sharpen how you track ownership, qualification and implied positions.
            </span>
            <button onClick={() => setAnswers({})} type="button">
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <button className="ote-training-primary-link" onClick={() => navigate(practicePath)} type="button">
          Open Advanced Part 3 practice
        </button>
      </section>
    </main>
  );
}
