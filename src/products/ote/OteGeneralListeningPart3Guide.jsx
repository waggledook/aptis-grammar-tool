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

const levelRows = [
  {
    level: "A2",
    length: "200–300 words",
    challenge: "Direct opinions and clear agreement or disagreement",
  },
  {
    level: "B1",
    length: "300–400 words",
    challenge: "More paraphrase and some implied opinions",
  },
  {
    level: "B2",
    length: "400–525 words",
    challenge: "Qualification, partial agreement and changes of position",
  },
];

const quizQuestions = [
  {
    id: "recording",
    prompt: "What do you listen to in General Listening Part 3?",
    options: ["Five separate short recordings", "One longer dialogue", "One informational talk"],
    answer: "One longer dialogue",
    explanation: "A man and a woman discuss one main topic.",
  },
  {
    id: "questions",
    prompt: "How many scored questions are there?",
    options: ["Four", "Five", "Six"],
    answer: "Five",
    explanation: "There are five scored opinion statements and one completed, unscored example.",
  },
  {
    id: "answers",
    prompt: "What are the three possible answers?",
    options: ["Agree, disagree or unsure", "Woman, man or both", "Speaker one, speaker two or neither"],
    answer: "Woman, man or both",
    explanation: "Match each statement to the person or people who express the complete opinion.",
  },
  {
    id: "understanding",
    prompt: "The man says, “I can see why you think that.” What should you do?",
    options: ["Choose both immediately", "Keep listening for his own opinion", "Choose the man"],
    answer: "Keep listening for his own opinion",
    explanation: "Understanding or acknowledging another view does not necessarily mean agreeing with it.",
  },
  {
    id: "reported-opinion",
    prompt: "The woman says, “Several traders think the new rent is unfair.” Who definitely holds that opinion?",
    options: ["The woman", "The traders", "Both speakers"],
    answer: "The traders",
    explanation: "She reports somebody else's opinion; this does not prove that she shares it.",
  },
  {
    id: "second-listen",
    prompt: "What is the best use of the second listening?",
    options: [
      "Begin again without looking at the first answers",
      "Listen only for words repeated in the statements",
      "Check uncertain answers and each speaker's final opinion",
    ],
    answer: "Check uncertain answers and each speaker's final opinion",
    explanation: "Focus on agreement, contrast, reported opinions and any change or qualification.",
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

export default function OteGeneralListeningPart3Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/listening/general/part-3-opinion-matching"
    : "/ote/listening/general/part-3-opinion-matching";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/b1-community-arts-centre`);
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quizQuestions.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  useEffect(() => {
    if (completedLoggedRef.current || answeredCount < quizQuestions.length) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "listening.part3.general-guide",
      section: "listening",
      part: "part-3",
      mode: "general_guide",
      taskTitle: "General Listening Part 3 guide",
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
        title="OTE General Listening Part 3 Guide | Matching Opinions"
        description="Prepare for OTE General Listening Part 3 with its woman, man or both format, A2–B2 progression, two-listening strategy, distractors and review quiz."
      />

      <button className="ote-training-back" onClick={() => navigate(menuPath)} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 3 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">General Listening Part 3</p>
        <h1>Matching Opinions</h1>
        <p>
          Listen to one longer conversation between a man and a woman. Decide whether each opinion
          is expressed by the woman, the man or both speakers.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="General Listening Part 3 essentials">
        <div>
          <MessageSquareText size={24} aria-hidden="true" />
          <strong>1 longer dialogue</strong>
          <span>A man and a woman discuss one main topic.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>5 scored opinions</strong>
          <span>A completed, unscored example shows how the matching works.</span>
        </div>
        <div>
          <Users size={24} aria-hidden="true" />
          <strong>Woman, man or both</strong>
          <span>Match the complete opinion, not merely the subject being discussed.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Before the conversation, you see six opinion statements; the first is already completed
          as an example. The clock shows how much time you have to look at the task. You then hear
          the complete conversation twice and have time to check your answers.
        </p>
        <p>
          The scored statements normally follow the order of the conversation. The task tests
          clearly stated views, opinions expressed through reasons or examples, agreement,
          disagreement and implied meaning.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>The Format Stays the Same</h2>
        <p>
          General Listening Part 3 can target A2, B1 or B2. The conversation becomes longer and
          positions become less direct, but the answer choices remain woman, man or both.
        </p>
        <div className="ote-training-compare" role="table" aria-label="General Listening Part 3 levels">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Level</span>
            <span role="columnheader">Dialogue length</span>
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
        <h2>Use the Preview Time Well</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>1. Understand each statement</h3>
            <p>Read for the complete judgement, not just the topic noun.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>2. Find the opinion language</h3>
            <p>Notice evaluative words such as <em>useful, unfair, expensive, better</em> and <em>should</em>.</p>
          </article>
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>3. Predict possible contrasts</h3>
            <p>Could the speakers disagree, express the same view differently or qualify an earlier position?</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Two-Listening Method</h2>
        <div className="ote-training-rule-grid is-two-column">
          <article>
            <Headphones size={22} aria-hidden="true" />
            <h3>First listening: follow both speakers</h3>
            <p>
              Track what the woman thinks, what the man thinks and whether they agree. Make
              provisional choices, but keep following the conversation if one answer remains
              uncertain.
            </p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Second listening: check the position</h3>
            <p>
              Return to uncertain items. Listen for contrast, reported opinions, each speaker's
              final view and separate evidence before selecting <em>both</em>.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Match the Opinion, Not the Topic</h2>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Woman:</strong> “The café was expensive, but the food was excellent.”
            <br />
            <strong>Man:</strong> “I didn’t mind the prices. The portions were large, so I thought
            it was good value.”
          </p>
        </div>
        <p>
          For the statement <em>The café was too expensive</em>, the answer is the woman. Both
          discuss price, but only she considers it expensive. For <em>The food was worth the
          price</em>, the answer could be both because each provides positive supporting evidence.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Understanding Is Not Agreement</h2>
        <p>
          Responses such as <em>I see what you mean, fair enough, maybe</em> and <em>perhaps</em>
          can acknowledge another person's point without accepting their overall opinion. Keep
          listening for what the responding speaker says next.
        </p>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Example:</strong> “Fair enough—the outdoor stalls will remain at weekends. I
            still think moving most of them indoors will remove the market's atmosphere.” The
            concession accepts one fact, but the speaker's overall concern remains.
          </p>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Common Distractor Tricks</h2>
        <ul className="ote-training-checklist">
          <li><strong>Same topic, different opinion:</strong> both discuss it but evaluate it differently.</li>
          <li><strong>Acknowledgement, not agreement:</strong> a polite concession is mistaken for a shared view.</li>
          <li><strong>Reported opinion:</strong> a speaker explains what residents or traders think without adopting it.</li>
          <li><strong>First reaction, final position:</strong> the speaker later changes direction.</li>
          <li><strong>Different words, same opinion:</strong> both support the statement through different examples.</li>
          <li><strong>One true detail:</strong> the statement contains a fact but misrepresents the overall view.</li>
          <li><strong>Suggestion assumed to be shared:</strong> one proposes an idea and the other remains uncertain.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Helpful Words to Notice</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Clear agreement</h3>
            <p><em>I agree, Exactly, That's true, So do I, You're right</em></p>
          </article>
          <article>
            <h3>Contrast or qualification</h3>
            <p><em>but, however, although, actually, on the other hand, even so</em></p>
          </article>
          <article>
            <h3>Weaker responses</h3>
            <p><em>maybe, perhaps, possibly, I suppose, I see what you mean</em></p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <MessageSquareText size={22} aria-hidden="true" />
            <h3>Match the complete opinion</h3>
            <p>Mentioning the topic does not prove that a speaker supports the statement.</p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Wait for the complete position</h3>
            <p>A speaker may correct, qualify or change an earlier reaction.</p>
          </article>
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>Prove “both” twice</h3>
            <p>Identify separate evidence from the woman and the man before choosing both.</p>
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
              above to sharpen how you track agreement, reported views and final positions.
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
          Open General Part 3 practice
        </button>
      </section>
    </main>
  );
}
