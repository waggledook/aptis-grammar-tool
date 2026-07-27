import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Ear,
  Headphones,
  ListChecks,
  Map,
  RotateCcw,
  Search,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const levelRows = [
  {
    level: "A2",
    length: "150–250 words",
    challenge: "Direct information with clearly separated choices",
  },
  {
    level: "B1",
    length: "250–350 words",
    challenge: "More paraphrase and competing details",
  },
  {
    level: "B2",
    length: "350–450 words",
    challenge: "Closer distractors, revisions, conditions, and changes of plan",
  },
];

const informationRows = [
  { type: "Time or date", examples: "10.30, Saturday, 15 May" },
  { type: "Place", examples: "the café, the station, the sports centre" },
  { type: "Price or number", examples: "€15, three weeks, 20 people" },
  { type: "Person or group", examples: "students, adults, the nurse" },
  { type: "Object", examples: "an email, a map, a visitor card" },
  { type: "Activity", examples: "swimming, cleaning, welcoming visitors" },
  { type: "Reason", examples: "bad weather, high costs, safety" },
  { type: "Rule or requirement", examples: "bring a form, attend training, book online" },
];

const quizQuestions = [
  {
    id: "recording",
    prompt: "What do you listen to in General Listening Part 2?",
    options: ["Five short conversations", "One longer talk", "Two people giving opinions"],
    answer: "One longer talk",
    explanation: "One speaker gives information, and you complete notes about the talk.",
  },
  {
    id: "preview",
    prompt: "What should you identify during the 30-second preview?",
    options: [
      "The kind of information each gap needs",
      "The answer you expect the speaker to choose",
      "Every word that might appear in the recording",
    ],
    answer: "The kind of information each gap needs",
    explanation: "The title, headings, and words around each gap help you predict whether to listen for a time, place, price, activity, reason, or rule.",
  },
  {
    id: "questions",
    prompt: "How many scored questions are there?",
    options: ["Four", "Five", "Six"],
    answer: "Five",
    explanation: "There are five scored questions and one completed, unscored example.",
  },
  {
    id: "all-mentioned",
    prompt: "The speaker mentions all three options. What should you do?",
    options: [
      "Choose the first option you hear",
      "Choose the final option you hear",
      "Check which option completes the note correctly",
    ],
    answer: "Check which option completes the note correctly",
    explanation: "All three details may be true, but they can refer to different times, places, activities, or situations.",
  },
  {
    id: "missed",
    prompt: "You miss Answer 2 during the first listening. What should you do?",
    options: [
      "Keep thinking about it and stop following the talk",
      "Continue to Answer 3 and return on the second listening",
      "Leave all the remaining questions blank",
    ],
    answer: "Continue to Answer 3 and return on the second listening",
    explanation: "The answers come in order. Staying on one question may make you miss the next answers.",
  },
  {
    id: "second-listen",
    prompt: "What is the best use of the second listening?",
    options: [
      "Check difficult answers and listen for corrections",
      "Ignore your first answers and begin again",
      "Try to understand every word in the talk",
    ],
    answer: "Check difficult answers and listen for corrections",
    explanation: "Your first answers are useful. Use the second listening to confirm them or change them when better evidence appears.",
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
              key={option}
              type="button"
              className={`ote-training-option ${isSelected ? "is-selected" : ""} ${
                answered && isAnswer ? "is-answer" : ""
              }`}
              onClick={() => onSelect(question.id, option)}
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

export default function OteGeneralListeningPart2Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/listening/general/part-2-note-completion"
    : "/ote/listening/general/part-2-note-completion";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/a2-open-day`);
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quizQuestions.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  useEffect(() => {
    if (completedLoggedRef.current || answeredCount < quizQuestions.length) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "listening.part2.general-guide",
      section: "listening",
      part: "part-2",
      mode: "general_guide",
      taskTitle: "General Listening Part 2 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE General Listening Part 2 Note Completion Guide | Seif English"
        description="Prepare for OTE General Listening Part 2 with its format, level progression, preview strategy, distractor traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 2 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">General Listening Part 2</p>
        <h1>Note Completion</h1>
        <p>
          Listen to one longer talk and complete a structured set of notes. Each gap has three
          options, and you choose the detail that completes the note correctly.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="General Listening Part 2 essentials">
        <div>
          <Headphones size={24} aria-hidden="true" />
          <strong>1 longer talk</strong>
          <span>One speaker gives practical information about a single topic.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>5 scored questions</strong>
          <span>A completed, unscored example shows you how the task works.</span>
        </div>
        <div>
          <Target size={24} aria-hidden="true" />
          <strong>3 options per gap</strong>
          <span>Choose the option that matches the precise meaning of the note.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Before the recording starts, you see a title, short headings, notes with gaps, and three
          options for each question. You have 30 seconds to inspect the task. You then hear the
          recording twice and have 15 seconds at the end to check your answers.
        </p>
        <p>
          The questions follow the order of the talk: Answer 1 comes before Answer 2, and so on.
          The speaker may describe a course, journey, building, event, service, place to visit,
          activities, or accommodation.
        </p>
        <p>
          The task tests specific information. You may need to identify a time, place, price, rule,
          reason, requirement, or final plan.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>The Format Stays the Same</h2>
        <p>
          General Listening Part 2 can be at A2, B1, or B2 level. The talk becomes longer and the
          information more demanding, but you always complete five notes by choosing from three
          options.
        </p>
        <div className="ote-training-compare" role="table" aria-label="General Listening Part 2 levels">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Level</span>
            <span role="columnheader">Talk length</span>
            <span role="columnheader">Typical challenge</span>
          </div>
          {levelRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.level}>
              <span role="cell">{row.level}</span>
              <span role="cell">{row.length}</span>
              <span role="cell">{row.challenge}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>What Can Be Missing from the Notes?</h2>
        <p>Read the words around each gap. They tell you what kind of information you need.</p>
        <div className="ote-training-compare" role="table" aria-label="Information types in General Listening Part 2">
          <div className="ote-training-compare-head is-two-column" role="row">
            <span role="columnheader">Information type</span>
            <span role="columnheader">Examples</span>
          </div>
          {informationRows.map((row) => (
            <div className="ote-training-compare-row is-two-column" role="row" key={row.type}>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.examples}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Use the 30 Seconds Well</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Map size={22} aria-hidden="true" />
            <h3>1. Map the talk</h3>
            <p>Read the title and headings. They show the topic and the order the speaker will follow.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>2. Predict the detail</h3>
            <p>Read the complete note and decide whether the gap needs a time, place, object, activity, or reason.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>3. Compare the options</h3>
            <p>Identify the exact difference between the three choices, but wait for evidence before selecting one.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Two-Listening Method</h2>
        <div className="ote-training-rule-grid is-two-column">
          <article>
            <Headphones size={22} aria-hidden="true" />
            <h3>First listening: follow the talk</h3>
            <p>
              Try to answer all five questions while keeping your eyes on the notes. When the
              speaker changes topic, move to the next section. If you miss an answer, keep going so
              that you do not lose the following questions.
            </p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Second listening: check carefully</h3>
            <p>
              Return to missed or uncertain questions. Listen for a corrected detail, change of
              plan, exact reason, or distinction between two plausible options. Change an answer
              only when you hear better evidence.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Why Can All Three Options Sound Possible?</h2>
        <p>
          The speaker may mention more than one option, and sometimes all three appear close
          together. Each detail can be true, but only one completes this exact note.
        </p>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Example:</strong> “We’ll meet at 10.00. Drinks are available at 10.30. Climbing
            starts at 11.00.” If the note asks when visitors can get a drink, the answer is 10.30.
            Do not choose a detail simply because you hear it first or last.
          </p>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Common Distractor Tricks</h2>
        <ul className="ote-training-checklist">
          <li><strong>Wrong time:</strong> all three times are correct, but they refer to different activities.</li>
          <li><strong>Wrong price:</strong> one is for the full day, one for a lesson, and one for something else.</li>
          <li><strong>Wrong place:</strong> every place is mentioned, but only one is where the activity happens.</li>
          <li><strong>Original plan:</strong> the speaker gives one plan and then changes it.</li>
          <li><strong>Possible later activity:</strong> it is available eventually, while the note asks what happens first.</li>
          <li><strong>Something you receive:</strong> the note asks what to bring, but the option is given to you after arrival.</li>
          <li><strong>Right words, wrong meaning:</strong> an option repeats the talk but does not complete the note correctly.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Helpful Words to Notice</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>A change</h3>
            <p><em>but, however, actually, instead, now, in the end</em></p>
          </article>
          <article>
            <h3>A reason or rule</h3>
            <p><em>because, so, for this reason, must, have to, need to, cannot, only</em></p>
          </article>
          <article>
            <h3>The main choice</h3>
            <p><em>the best option, we recommend, particularly, mainly, the real problem is</em></p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Map size={22} aria-hidden="true" />
            <h3>Read before you listen</h3>
            <p>Know whether you need a time, place, person, price, activity, requirement, or reason.</p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Listen to the complete section</h3>
            <p>Do not choose an answer only because you hear one of the options.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Keep moving</h3>
            <p>Leave a difficult question temporarily and use the second listening to return to it.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 2 Review Quiz</h2>
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
              above to sharpen your preview and two-listening routine.
            </span>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          Open General Part 2 practice
        </button>
      </section>
    </main>
  );
}
