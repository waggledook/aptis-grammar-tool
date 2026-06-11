import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Link2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const taskText =
  "You have had a class discussion on technology. Your teacher now wants you to write an essay. Title: Should smartphones be banned in classrooms? Write 100-160 words.";

const topicSentenceQuestions = [
  {
    id: "distraction",
    idea: "Smartphones cause distractions in class.",
    answer: "b",
    options: [
      {
        id: "a",
        text: "I think phones are bad because students text their friends all the time.",
        feedback: "This is clear, but it sounds too conversational for an essay.",
      },
      {
        id: "b",
        text: "One of the main arguments against allowing smartphones in schools is the distraction they cause.",
        feedback: "Good choice. It introduces the main point clearly and uses a more formal style.",
      },
      {
        id: "c",
        text: "Smartphones have big screens and lots of games like Candy Crush.",
        feedback: "This is too narrow. A topic sentence should introduce the paragraph's main idea.",
      },
    ],
  },
  {
    id: "research",
    idea: "Smartphones are useful for quick research.",
    answer: "a",
    options: [
      {
        id: "a",
        text: "On the other hand, mobile devices can be useful educational tools for quick research.",
        feedback: "Good choice. The linker shows contrast, and the sentence introduces the paragraph clearly.",
      },
      {
        id: "b",
        text: "You can look up words on Google very fast if you do not have a book.",
        feedback: "This is more like an example. It is also too conversational for a formal essay.",
      },
      {
        id: "c",
        text: "Smartphones are good for research, and also you can call your mum.",
        feedback: "This mixes two ideas. A topic sentence should keep one clear paragraph focus.",
      },
    ],
  },
  {
    id: "cheating",
    idea: "Using phones can make cheating easier.",
    answer: "c",
    options: [
      {
        id: "a",
        text: "Teachers get really angry when students cheat on tests with phones.",
        feedback: "This focuses on teachers' feelings, not the main essay point.",
      },
      {
        id: "b",
        text: "Cheating is a big problem in schools nowadays.",
        feedback: "This is true, but it is too general. It does not mention phones.",
      },
      {
        id: "c",
        text: "Furthermore, internet-connected devices can increase the risk of cheating during exams.",
        feedback: "Good choice. It uses a linker and gives a clear, formal paragraph focus.",
      },
    ],
  },
];

const linkerFunctions = [
  {
    id: "add",
    title: "Add another point",
    hint: "Use these when you want to give one more supporting idea.",
  },
  {
    id: "sentence-contrast",
    title: "Contrast two sentences",
    hint: "Use these to start a new contrasting sentence.",
  },
  {
    id: "same-sentence-contrast",
    title: "Contrast inside one sentence",
    hint: "Use these when the contrast stays in the same sentence.",
  },
  {
    id: "example",
    title: "Give an example",
    hint: "Use these before a specific example.",
  },
  {
    id: "result",
    title: "Show a result",
    hint: "Use these when one idea is the effect of another idea.",
  },
  {
    id: "reason",
    title: "Give a reason",
    hint: "Use these to explain why something happens.",
  },
];

const linkers = [
  { id: "furthermore", text: "Furthermore", functionId: "add" },
  { id: "in-addition", text: "In addition", functionId: "add" },
  { id: "moreover", text: "Moreover", functionId: "add" },
  { id: "however", text: "However", functionId: "sentence-contrast" },
  { id: "on-the-other-hand", text: "On the other hand", functionId: "sentence-contrast" },
  { id: "nevertheless", text: "Nevertheless", functionId: "sentence-contrast" },
  { id: "although", text: "Although", functionId: "same-sentence-contrast" },
  { id: "despite", text: "Despite", functionId: "same-sentence-contrast" },
  { id: "in-spite-of", text: "In spite of", functionId: "same-sentence-contrast" },
  { id: "for-instance", text: "For instance", functionId: "example" },
  { id: "such-as", text: "Such as", functionId: "example" },
  { id: "to-illustrate", text: "To illustrate", functionId: "example" },
  { id: "consequently", text: "Consequently", functionId: "result" },
  { id: "therefore", text: "Therefore", functionId: "result" },
  { id: "as-a-result", text: "As a result", functionId: "result" },
  { id: "because-of", text: "Because of", functionId: "reason" },
  { id: "due-to", text: "Due to", functionId: "reason" },
  { id: "since", text: "Since", functionId: "reason" },
];

const grammarClues = [
  "Although is followed by a subject and verb: Although students need technology, ...",
  "Despite and in spite of are followed by a noun or -ing form: Despite having phones, ...",
  "Because of and due to are followed by a noun phrase: due to constant notifications.",
  "However and on the other hand usually start a new sentence and use a comma.",
];

const grammarQuizQuestions = [
  {
    id: "since",
    sentence: "_____ the classroom environment can be unpredictable, teachers must have firm control over tech usage.",
    answer: "b",
    options: [
      { id: "a", text: "Due to" },
      { id: "b", text: "Since" },
      { id: "c", text: "Consequently" },
    ],
    feedback:
      "Since means because here and can connect to a full clause: the classroom environment can be unpredictable.",
  },
  {
    id: "however",
    sentence: "Buying new clothes can make people feel happy. _____, this feeling often disappears very quickly.",
    answer: "c",
    options: [
      { id: "a", text: "Although" },
      { id: "b", text: "In addition" },
      { id: "c", text: "However" },
    ],
    feedback:
      "However is correct because it starts a new sentence and introduces a contrast.",
  },
  {
    id: "due-to",
    sentence: "Many students struggle to focus in class _____ the constant notifications on their devices.",
    answer: "a",
    options: [
      { id: "a", text: "due to" },
      { id: "b", text: "since" },
      { id: "c", text: "although" },
    ],
    feedback:
      "Due to means because of and is followed by a noun phrase: the constant notifications.",
  },
  {
    id: "despite",
    sentence: "_____ having access to the internet at all times, many young people feel lonelier than ever.",
    answer: "b",
    options: [
      { id: "a", text: "Although" },
      { id: "b", text: "Despite" },
      { id: "c", text: "Furthermore" },
    ],
    feedback:
      "Despite is followed by a noun or -ing form. Here, having access works well after Despite.",
  },
  {
    id: "moreover",
    sentence: "School uniforms promote a sense of equality. _____, they prevent students from bullying others based on their clothes.",
    answer: "c",
    options: [
      { id: "a", text: "On the other hand" },
      { id: "b", text: "Consequently" },
      { id: "c", text: "Moreover" },
    ],
    feedback:
      "Moreover adds another supporting point. Both sentences support the same side.",
  },
  {
    id: "as-a-result",
    sentence: "Many teenagers spend too much money on fashion trends. _____, they often lack savings for more important future expenses.",
    answer: "a",
    options: [
      { id: "a", text: "As a result" },
      { id: "b", text: "In spite of" },
      { id: "c", text: "Such as" },
    ],
    feedback:
      "As a result introduces the consequence of spending too much money.",
  },
  {
    id: "such-as",
    sentence: "Many public schools have limited budgets. They cannot afford high-tech gear, _____ virtual reality headsets.",
    answer: "b",
    options: [
      { id: "a", text: "furthermore" },
      { id: "b", text: "such as" },
      { id: "c", text: "therefore" },
    ],
    feedback:
      "Such as introduces a specific example: virtual reality headsets.",
  },
  {
    id: "although",
    sentence: "_____ some parents believe video games are bad for kids, studies show they can improve problem-solving skills.",
    answer: "a",
    options: [
      { id: "a", text: "Although" },
      { id: "b", text: "In addition" },
      { id: "c", text: "Because of" },
    ],
    feedback:
      "Although connects two contrasting ideas inside one sentence.",
  },
];

function shuffleItems(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export default function OteWritingEssayBodyParagraphs({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/essay" : "/ote/writing/training/essay");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [matches, setMatches] = useState({});
  const [selectedLinkerId, setSelectedLinkerId] = useState("");
  const [checkVisible, setCheckVisible] = useState(false);
  const [shuffledLinkers, setShuffledLinkers] = useState(() => shuffleItems(linkers));
  const [quizAnswers, setQuizAnswers] = useState({});

  const matchedCount = Object.keys(matches).length;
  const correctCount = linkers.filter((linker) => matches[linker.id] === linker.functionId).length;
  const quizAnsweredCount = Object.keys(quizAnswers).length;
  const quizCorrectCount = grammarQuizQuestions.filter((question) => quizAnswers[question.id] === question.answer).length;

  function chooseTopicAnswer(questionId, optionId) {
    setSelectedAnswers((current) => ({ ...current, [questionId]: optionId }));
  }

  function placeLinker(linkerId, functionId) {
    setMatches((current) => ({ ...current, [linkerId]: functionId }));
    setSelectedLinkerId("");
  }

  function resetLinkers() {
    setMatches({});
    setSelectedLinkerId("");
    setCheckVisible(false);
    setShuffledLinkers(shuffleItems(linkers));
  }

  function chooseQuizAnswer(questionId, optionId) {
    setQuizAnswers((current) => ({ ...current, [questionId]: optionId }));
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Essay Body Paragraphs | Seif English"
        description="Practise topic sentences and linking words for OTE essay body paragraphs."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 4</p>
        <h1>Body Paragraphs</h1>
        <p>
          Build stronger body paragraphs with clear topic sentences and linking words. A good
          topic sentence introduces one main idea. Linkers help the reader follow your argument.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Task 2: Essay</p>
            <h2>Smartphones in classrooms</h2>
          </div>
          <div className="ote-guided-timing-note">
            <span>100-160 words</span>
            <span>Formal style</span>
          </div>
        </div>
        <p>{taskText}</p>
      </section>

      <section className="ote-training-section">
        <h2>Part 1: Choose the Best Topic Sentence</h2>
        <p className="ote-section-lead">
          Choose the sentence that best opens a body paragraph. It should introduce the main idea,
          not give a tiny detail or sound too conversational.
        </p>

        <div className="ote-topic-sentence-list">
          {topicSentenceQuestions.map((question, index) => {
            const selected = selectedAnswers[question.id];
            const selectedOption = question.options.find((option) => option.id === selected);
            const isCorrect = selected === question.answer;

            return (
              <article key={question.id} className="ote-topic-sentence-card">
                <p className="ote-kicker">Idea {index + 1}</p>
                <h3>{question.idea}</h3>
                <div className="ote-topic-option-grid">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={selected === option.id ? "is-selected" : ""}
                      onClick={() => chooseTopicAnswer(question.id, option.id)}
                    >
                      <strong>{option.id.toUpperCase()}</strong>
                      <span>{option.text}</span>
                    </button>
                  ))}
                </div>
                {selectedOption && (
                  <div className={`ote-topic-feedback ${isCorrect ? "is-correct" : "is-review"}`}>
                    {isCorrect ? <CheckCircle2 size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
                    <p>{selectedOption.feedback}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Part 2: Match the Linkers</h2>
        <p className="ote-section-lead">
          Match each linker to its purpose. Click a linker and then click a box, or drag a linker
          into a box.
        </p>

        <div className="ote-linker-match-progress">
          <span>{matchedCount} of {linkers.length} matched</span>
          {checkVisible ? <strong>{correctCount} correct</strong> : null}
          <button type="button" onClick={() => setCheckVisible(true)}>Check answers</button>
          <button type="button" onClick={resetLinkers}>Shuffle and reset</button>
        </div>

        <div className="ote-linker-chip-bank" aria-label="Linkers to match">
          {shuffledLinkers.map((linker) => {
            const matchedTo = matches[linker.id];
            const isSelected = selectedLinkerId === linker.id;
            const isCorrect = checkVisible && matchedTo === linker.functionId;
            const isWrong = checkVisible && matchedTo && matchedTo !== linker.functionId;

            return (
              <button
                key={linker.id}
                type="button"
                draggable
                className={[
                  "ote-linker-chip",
                  isSelected ? "is-selected" : "",
                  matchedTo ? "is-matched" : "",
                  isCorrect ? "is-correct" : "",
                  isWrong ? "is-wrong" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedLinkerId((current) => (current === linker.id ? "" : linker.id))}
                onDragStart={(event) => event.dataTransfer.setData("text/plain", linker.id)}
              >
                {linker.text}
              </button>
            );
          })}
        </div>

        <div className="ote-linker-function-grid">
          {linkerFunctions.map((item) => {
            const assigned = linkers.filter((linker) => matches[linker.id] === item.id);
            return (
              <section
                key={item.id}
                className={`ote-linker-dropzone ${selectedLinkerId ? "is-ready" : ""}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const linkerId = event.dataTransfer.getData("text/plain");
                  if (linkerId) placeLinker(linkerId, item.id);
                }}
              >
                <button
                  type="button"
                  onClick={() => selectedLinkerId && placeLinker(selectedLinkerId, item.id)}
                  disabled={!selectedLinkerId}
                >
                  <strong>{item.title}</strong>
                  <span>{item.hint}</span>
                </button>
                <div className="ote-linker-dropzone-items">
                  {assigned.length ? (
                    assigned.map((linker) => (
                      <button
                        key={linker.id}
                        type="button"
                        onClick={() =>
                          setMatches((current) => {
                            const next = { ...current };
                            delete next[linker.id];
                            return next;
                          })
                        }
                      >
                        {linker.text}
                      </button>
                    ))
                  ) : (
                    <span>Drop or click a linker here.</span>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <div className="ote-model-answer">
          <strong>Grammar clues</strong>
          <ul>
            {grammarClues.map((clue) => (
              <li key={clue}>{clue}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Part 3: Grammar and Meaning Quiz</h2>
        <p className="ote-section-lead">
          Choose the linker that fits both the meaning and the grammar of the sentence.
        </p>

        <div className="ote-linker-quiz-progress">
          <span>{quizAnsweredCount} of {grammarQuizQuestions.length} answered</span>
          <strong>{quizCorrectCount} correct so far</strong>
        </div>

        <div className="ote-linker-quiz-list">
          {grammarQuizQuestions.map((question, index) => {
            const selected = quizAnswers[question.id];
            const isCorrect = selected === question.answer;

            return (
              <article key={question.id} className="ote-linker-quiz-card">
                <p className="ote-kicker">Question {index + 1}</p>
                <h3>{question.sentence}</h3>
                <div className="ote-linker-quiz-options">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={selected === option.id ? "is-selected" : ""}
                      onClick={() => chooseQuizAnswer(question.id, option.id)}
                    >
                      <strong>{option.id.toUpperCase()}</strong>
                      <span>{option.text}</span>
                    </button>
                  ))}
                </div>
                {selected && (
                  <div className={`ote-topic-feedback ${isCorrect ? "is-correct" : "is-review"}`}>
                    {isCorrect ? <CheckCircle2 size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
                    <p>{question.feedback}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
