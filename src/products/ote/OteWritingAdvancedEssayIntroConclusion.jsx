import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  RotateCcw,
  Scale,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { requestOteAdvancedIntroConclusionFeedback } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const problemQuestions = [
  {
    id: "problem-1",
    label: "Introduction 1",
    text: "Food has always played an important role in human history, and everybody needs it in order to survive.",
    options: [
      "It is too general and does not focus on the task.",
      "It gives the writer’s opinion too clearly.",
      "It contains too much supporting evidence.",
    ],
    answer: "It is too general and does not focus on the task.",
    explanation:
      "The sentence could introduce almost any essay about food. It does not establish the debate about appearance standards and edible produce.",
  },
  {
    id: "problem-2",
    label: "Introduction 2",
    text: "In this essay, I am going to discuss whether supermarkets should sell fruit and vegetables that do not look perfect.",
    options: [
      "It introduces an irrelevant example.",
      "It describes the essay instead of beginning the argument.",
      "It uses language that is too advanced.",
    ],
    answer: "It describes the essay instead of beginning the argument.",
    explanation:
      "This is not grammatically incorrect, but it is mechanical. A stronger introduction begins with the issue itself.",
  },
  {
    id: "problem-3",
    label: "Introduction 3",
    text: "Rejecting ugly fruit is ridiculous, and supermarkets need to stop doing it immediately.",
    options: [
      "It is too informal and makes an emotional judgement.",
      "It does not express an opinion.",
      "It is too cautious and indirect.",
    ],
    answer: "It is too informal and makes an emotional judgement.",
    explanation:
      "‘Ugly fruit’, ‘ridiculous’ and ‘need to stop immediately’ create an emotional tone. A clear academic position should still be measured.",
  },
  {
    id: "problem-4",
    label: "Conclusion 1",
    text: "In conclusion, there are advantages and disadvantages to selling imperfect fruit, and different people may have different opinions.",
    options: [
      "It contains an unnecessary example.",
      "It does not provide a meaningful final judgement.",
      "It is too strongly opposed to the policy.",
    ],
    answer: "It does not provide a meaningful final judgement.",
    explanation:
      "The conclusion acknowledges that a debate exists but never answers whether supermarkets should be required to sell the produce.",
  },
  {
    id: "problem-5",
    label: "Conclusion 2",
    text: "Overall, selling imperfect produce would reduce waste and support farmers. Supermarkets could also donate some of this food to schools and hospitals.",
    options: [
      "It introduces a new point that should have been developed earlier.",
      "It repeats the writer’s opinion too clearly.",
      "It is too short to function as a conclusion.",
    ],
    answer: "It introduces a new point that should have been developed earlier.",
    explanation:
      "Donations to schools and hospitals are a substantial new idea. They should not appear for the first time in the conclusion.",
  },
  {
    id: "problem-6",
    label: "Conclusion 3",
    text: "Selling safe but imperfect produce is clearly the right decision. Why should appearance matter more than the environment?",
    options: [
      "It uses an unnecessarily complicated structure.",
      "It ends with a direct and slightly promotional rhetorical question.",
      "It does not refer to the topic.",
    ],
    answer: "It ends with a direct and slightly promotional rhetorical question.",
    explanation:
      "The question sounds more like a speech or campaign slogan. A measured final judgement is more suitable for an academic tutor.",
  },
];

const strongestIntroduction = {
  id: "strongest-introduction",
  prompt: "Which introduction frames the precise essay question most effectively?",
  options: [
    "Food waste has become a significant environmental and economic concern in many countries. It occurs at every stage of the supply chain, from agricultural production and transport to retail and household consumption. Reducing this waste will require changes in the behaviour of businesses, governments and individual consumers.",
    "Supermarkets should be required to sell imperfect fruit and vegetables because rejecting them creates unnecessary waste and reduces farmers’ earnings. Consumers would soon become accustomed to buying such products, particularly if retailers offered them at lower prices and explained that appearance has no effect on quality.",
    "Supermarkets commonly apply visual standards to fresh produce, even when variations in shape or size do not affect whether it is safe to eat. This practice has prompted debate over whether retailers should be obliged to offer edible fruit and vegetables regardless of their appearance.",
  ],
  answer:
    "Supermarkets commonly apply visual standards to fresh produce, even when variations in shape or size do not affect whether it is safe to eat. This practice has prompted debate over whether retailers should be obliged to offer edible fruit and vegetables regardless of their appearance.",
  explanation:
    "Option C clearly restates the precise issue without copying the task. It establishes the current practice and the decision being debated, leaving the main arguments for the body of the essay.",
  optionFeedback: [
    "Option A is formal, coherent and relevant to food waste. However, it remains at the level of the general topic and does not identify the specific issue of supermarkets rejecting produce because of its appearance.",
    "Option B gives a clear position, which is entirely acceptable in an introduction. However, it immediately begins developing several arguments: waste, farmers’ earnings, pricing and changes in consumer behaviour. These points belong in the main paragraphs.",
    "Option C clearly restates the precise issue without copying the task. It establishes both the current practice and the decision being debated, leaving the main arguments for the body of the essay.",
  ],
};

const buildQuestions = [
  {
    id: "best-paraphrase",
    prompt: "Step 1: Choose the best paraphrase",
    options: [
      "Supermarkets often reject fruit and vegetables because they do not meet appearance standards.",
      "Retail appearance standards prevent a proportion of edible produce from reaching consumers.",
      "Supermarkets throw away lots of strange-looking fruit even though there is nothing wrong with it.",
    ],
    answer: "Retail appearance standards prevent a proportion of edible produce from reaching consumers.",
    explanation:
      "This preserves the central meaning without copying the task and uses concise, neutral language.",
  },
  {
    id: "best-debate-frame",
    prompt: "Step 2: Choose the clearest framing of the debate",
    options: [
      "This is an important issue and there are reasonable arguments on both sides.",
      "The central question is whether retailers should be obliged to sell safe produce even when it fails to meet visual standards.",
      "Supermarkets must change because the current system harms farmers, wastes food and gives consumers fewer choices.",
    ],
    answer:
      "The central question is whether retailers should be obliged to sell safe produce even when it fails to meet visual standards.",
    explanation:
      "This identifies the exact decision the essay must address without announcing a conclusion or beginning to develop the supporting arguments.",
  },
];

const strongestConclusion = {
  id: "strongest-conclusion",
  prompt: "Which conclusion answers the question most effectively?",
  options: [
    "Overall, supermarkets should be required to sell imperfect produce because current standards create unnecessary waste and restrict farmers’ incomes. Governments should also introduce national advertising campaigns and offer tax incentives to make these products cheaper, since regulation alone may be insufficient to change established shopping habits.",
    "Overall, concerns about consumer demand are understandable, but they do not justify rejecting food that is safe to eat. Requiring supermarkets to offer imperfect produce would reduce avoidable waste and allow farmers to sell more of each harvest, while leaving shoppers free to decide whether they wish to buy it.",
    "To conclude, requiring supermarkets to stock imperfect produce could reduce food waste and create new opportunities for farmers. Nevertheless, retailers would still need to respond to consumer preferences, and some shoppers might continue choosing products with a more conventional appearance. The proposal therefore presents both potential benefits and practical difficulties.",
  ],
  answer:
    "Overall, concerns about consumer demand are understandable, but they do not justify rejecting food that is safe to eat. Requiring supermarkets to offer imperfect produce would reduce avoidable waste and allow farmers to sell more of each harvest, while leaving shoppers free to decide whether they wish to buy it.",
  explanation:
    "Option B acknowledges the main counterargument before giving a clear final judgement. It brings together the effects on waste, farmers and consumers without introducing a separate policy or overstating the likely results.",
  optionFeedback: [
    "Option A answers the question clearly and refers to two relevant prompts. However, it introduces two substantial new measures—advertising campaigns and tax incentives—which would need to have been developed in the body of the essay.",
    "Option B acknowledges the main counterargument before giving a clear final judgement. It brings together the effects on waste, farmers and consumers without introducing a separate policy or overstating the likely results.",
    "Option C summarises the two sides accurately and uses an appropriate academic style. However, it stops at the observation that benefits and difficulties exist. It does not give a definite final answer to ‘Do you agree?’",
  ],
};

const combinedIntroduction =
  "Retail appearance standards prevent a proportion of edible produce from reaching consumers, despite its remaining safe to eat. This practice has led to debate over whether supermarkets should be required to offer fruit and vegetables regardless of variations in their shape, size or appearance.";

const introChecklist = [
  "I have established the precise issue being debated.",
  "I have restated the two positions in my own words.",
  "I have provided a clear starting point for the discussion.",
  "I have avoided developing supporting arguments in detail.",
];

const conclusionChecklist = [
  "The conclusion matches my introduction.",
  "I have brought the central arguments together.",
  "I have answered the question clearly.",
  "I have not introduced a new argument or policy.",
];

const transferPositions = [
  "Advertising aimed at children should be prohibited.",
  "Parents should remain responsible for controlling their children’s choices.",
  "Advertising should be permitted but subject to stricter limits.",
];

const transferIdeas = ["impact on children", "impact on families", "impact on businesses"];

const pairChecklist = [
  "The introduction clearly identifies the debate.",
  "The introduction saves detailed reasoning and examples for the main paragraphs.",
  "The conclusion provides a definite final judgement.",
  "That judgement is consistent with the position I selected.",
  "The two paragraphs sound as though they belong to the same essay.",
  "The register is appropriately formal without sounding artificial.",
];

function countWords(value) {
  const text = String(value || "").trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function ChoiceQuestion({ question, selected, onSelect, optionLabels = false }) {
  const answered = Boolean(selected);
  const isCorrect = selected === question.answer;

  return (
    <article className={`ote-training-quiz-item ${answered ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}>
      {question.label ? <p className="ote-kicker">{question.label}</p> : null}
      {question.text ? <blockquote className="ote-advanced-writing-quote">“{question.text}”</blockquote> : null}
      {question.prompt ? <h3>{question.prompt}</h3> : null}
      <div className="ote-training-options">
        {question.options.map((option, index) => {
          const isSelected = selected === option;
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
              <span>{optionLabels ? <strong>Option {String.fromCharCode(65 + index)}. </strong> : null}{option}</span>
              {answered && isAnswer ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              {answered && isSelected && !isAnswer ? <XCircle size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="ote-training-feedback" aria-live="polite">
          <strong>{isCorrect ? "Correct." : "Not quite."}</strong>{" "}
          {question.optionFeedback
            ? question.optionFeedback[question.options.indexOf(selected)]
            : question.explanation}
        </p>
      ) : null}
    </article>
  );
}

function StructureBreakdown({ title, parts, note }) {
  return (
    <div className="ote-model-answer ote-advanced-writing-breakdown">
      <strong>{title}</strong>
      <div className="ote-advanced-writing-structure">
        {parts.map((part) => (
          <p key={part.label}>
            <span>{part.label}</span>
            {part.text}
          </p>
        ))}
      </div>
      <p className="ote-advanced-writing-note">{note}</p>
    </div>
  );
}

function Checklist({ items, checked, onToggle }) {
  return (
    <div className="ote-advanced-writing-checklist">
      {items.map((item) => (
        <label key={item}>
          <input type="checkbox" checked={Boolean(checked[item])} onChange={() => onToggle(item)} />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

function DraftBox({ label, value, onChange, minWords, maxWords, checklist, checked, onToggle }) {
  const wordCount = countWords(value);
  const inRange = wordCount >= minWords && wordCount <= maxWords;
  const rangeMessage = !wordCount
    ? `Aim for ${minWords}–${maxWords} words.`
    : wordCount < minWords
      ? `${minWords - wordCount} more word${minWords - wordCount === 1 ? "" : "s"} to reach the target.`
      : wordCount > maxWords
        ? `${wordCount - maxWords} word${wordCount - maxWords === 1 ? "" : "s"} over the target.`
        : "Within the target range.";

  return (
    <div className="ote-advanced-writing-draft">
      <label className="ote-writing-draft-box">
        <span>{label}</span>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={`Write ${minWords}–${maxWords} words.`} />
        <small className={inRange ? "is-in-range" : ""}>{wordCount} words · {rangeMessage}</small>
      </label>
      <div>
        <strong>Check before revealing the model</strong>
        <Checklist items={checklist} checked={checked} onToggle={onToggle} />
      </div>
    </div>
  );
}

export default function OteWritingAdvancedEssayIntroConclusion({
  user,
  onRequireSignIn,
  nativeRoutes = false,
}) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-essay" : "/ote/writing/training/advanced-essay");
  const [answers, setAnswers] = useState({});
  const [introduction, setIntroduction] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [introChecks, setIntroChecks] = useState({});
  const [conclusionChecks, setConclusionChecks] = useState({});
  const [pairChecks, setPairChecks] = useState({});
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiError, setAiError] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);

  const allQuestions = useMemo(
    () => [...problemQuestions, strongestIntroduction, ...buildQuestions, strongestConclusion],
    []
  );
  const answeredCount = Object.keys(answers).length;
  const correctCount = allQuestions.filter((question) => answers[question.id] === question.answer).length;

  function selectAnswer(id, answer) {
    setAnswers((current) => ({ ...current, [id]: answer }));
  }

  function toggleCheck(setter, item) {
    setter((current) => ({ ...current, [item]: !current[item] }));
  }

  function clearAiFeedback() {
    setAiStatus("idle");
    setAiError("");
    setAiFeedback(null);
  }

  function selectPosition(position) {
    setSelectedPosition(position);
    clearAiFeedback();
  }

  function toggleIdea(idea) {
    setSelectedIdeas((current) =>
      current.includes(idea) ? current.filter((item) => item !== idea) : [...current, idea]
    );
    clearAiFeedback();
  }

  async function handleAiFeedback() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    if (!selectedPosition) {
      setAiStatus("error");
      setAiError("Choose your overall position before requesting feedback.");
      return;
    }
    if (selectedIdeas.length < 2) {
      setAiStatus("error");
      setAiError("Select at least two ideas before requesting feedback.");
      return;
    }
    if (!introduction.trim() || !conclusion.trim()) {
      setAiStatus("error");
      setAiError("Write both paragraphs before requesting feedback.");
      return;
    }

    setAiStatus("loading");
    setAiError("");
    setAiFeedback(null);

    try {
      const result = await requestOteAdvancedIntroConclusionFeedback({
        taskId: "advanced-essay-introductions-conclusions-advertising",
        title: "Advertising aimed at children",
        taskPrompt:
          "Some people believe that advertising aimed directly at children should be prohibited. Others argue that parents should decide what their children are allowed to buy. Which opinion do you agree with?",
        availableIdeas: transferIdeas,
        selectedPosition,
        selectedIdeas,
        introduction: {
          text: introduction.trim(),
          wordCount: countWords(introduction),
        },
        conclusion: {
          text: conclusion.trim(),
          wordCount: countWords(conclusion),
        },
      });
      setAiFeedback(result?.feedback || null);
      setAiStatus("ready");
    } catch (error) {
      console.warn("[OTE advanced intro/conclusion] AI feedback failed", error);
      setAiStatus("error");
      setAiError(error?.message || "Could not generate paragraph feedback.");
    }
  }

  function resetLesson() {
    setAnswers({});
    setIntroduction("");
    setConclusion("");
    setIntroChecks({});
    setConclusionChecks({});
    setPairChecks({});
    setSelectedPosition("");
    setSelectedIdeas([]);
    clearAiFeedback();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Essay Introductions and Conclusions | Seif English"
        description="Build precise OTE Advanced essay introductions and conclusions through diagnosis, paragraph construction, and guided writing practice."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to advanced essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced essay · Lesson 2</p>
        <h1>Introductions and Conclusions</h1>
        <p>
          A strong introduction gives the reader a clear direction. A strong conclusion brings the
          argument together and answers the question.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Paragraph length guidance">
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>35–50 words</strong>
          <span>A focused introduction in a 220–280-word essay.</span>
        </div>
        <div>
          <Target size={24} aria-hidden="true" />
          <strong>Frame the debate</strong>
          <span>Identify the exact issue without developing the arguments too early.</span>
        </div>
        <div>
          <Scale size={24} aria-hidden="true" />
          <strong>35–50 words</strong>
          <span>A measured conclusion that answers the exact question.</span>
        </div>
      </section>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Practice task</p>
            <h2>Should appearance standards decide what supermarkets sell?</h2>
          </div>
          <div className="ote-guided-timing-note">
            <span>220–280 words</span>
            <span>Academic tutor</span>
          </div>
        </div>
        <p>
          You have been discussing food waste in your class. Supermarkets often reject fruit and
          vegetables because they do not meet appearance standards. Some people argue that retailers
          should be required to sell produce that is safe to eat regardless of how it looks.
        </p>
        <p><strong>Do you agree?</strong></p>
        <p>Your essay must include at least two of these ideas:</p>
        <ul>
          <li>impact on food waste</li>
          <li>impact on consumers</li>
          <li>impact on farmers</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>What Should Each Paragraph Do?</h2>
        <p className="ote-section-lead">
          The introduction should clearly frame the precise issue the essay must address. It may
          indicate the writer’s position, but it does not need to announce the conclusion or list
          the arguments.
        </p>
        <div className="ote-advanced-writing-do-dont">
          <article>
            <h3>Introduction</h3>
            <strong>Do</strong>
            <ul>
              <li>Establish the precise topic.</li>
              <li>Restate the central issue or debate in your own words.</li>
              <li>Create a clear starting point for the discussion.</li>
            </ul>
            <p className="ote-advanced-writing-optional-position">
              You may indicate your position if it fits naturally, but this is optional.
            </p>
            <strong>Avoid</strong>
            <ul>
              <li>Discussing the general topic without identifying the specific issue.</li>
              <li>Copying the task wording or developing supporting arguments.</li>
              <li>Detailed examples or lists of the three prompts.</li>
              <li>Mechanical announcements such as “This essay will discuss…”</li>
            </ul>
          </article>
          <article>
            <h3>Conclusion</h3>
            <strong>Do</strong>
            <ul>
              <li>Bring the main arguments together.</li>
              <li>Answer the question clearly.</li>
              <li>Remain consistent with the essay.</li>
            </ul>
            <strong>Avoid</strong>
            <ul>
              <li>A new main argument or copied introduction.</li>
              <li>Vague endings or direct appeals to the reader.</li>
              <li>Claims stronger than the essay has supported.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <p className="ote-kicker">Exercise 1</p>
            <h2>What Is the Problem?</h2>
            <p>Choose the main problem with each introduction or conclusion.</p>
          </div>
          <div className="ote-training-score" aria-live="polite">
            {problemQuestions.filter((question) => answers[question.id] === question.answer).length}/{problemQuestions.length}
          </div>
        </div>
        {problemQuestions.map((question) => (
          <ChoiceQuestion key={question.id} question={question} selected={answers[question.id]} onSelect={selectAnswer} />
        ))}
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Exercise 2</p>
        <h2>Choose the Most Effective Introduction</h2>
        <p className="ote-section-lead">
          All three introductions are formal and relevant to the general topic. Choose the one that
          frames the precise essay question most effectively.
        </p>
        <ChoiceQuestion
          question={strongestIntroduction}
          selected={answers[strongestIntroduction.id]}
          onSelect={selectAnswer}
          optionLabels
        />
        {answers[strongestIntroduction.id] ? (
          <StructureBreakdown
            title="Key distinction"
            parts={[
              { label: "Option A", text: "Introduces the general subject but not the exact debate." },
              { label: "Option B", text: "Begins arguing before the issue has been properly framed." },
              { label: "Option C", text: "Establishes the precise issue and objective of the essay clearly." },
            ]}
            note="An explicit position is acceptable, but it is not an exam requirement. The essential job of the introduction is to frame the precise issue."
          />
        ) : null}
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Exercise 3</p>
        <h2>Build an Introduction</h2>
        <p className="ote-section-lead">
          First paraphrase the practice, then frame the exact decision the essay must discuss.
        </p>
        {buildQuestions.map((question) => (
          <ChoiceQuestion key={question.id} question={question} selected={answers[question.id]} onSelect={selectAnswer} />
        ))}
        {buildQuestions.every((question) => answers[question.id]) ? (
          <div className="ote-model-answer">
            <p className="ote-kicker">Combined model introduction · {countWords(combinedIntroduction)} words</p>
            <blockquote>{combinedIntroduction}</blockquote>
          </div>
        ) : null}
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Exercise 4</p>
        <h2>Choose the Most Effective Conclusion</h2>
        <p className="ote-section-lead">
          All three conclusions refer to relevant arguments. Choose the one that answers the
          question most effectively without becoming vague or introducing undeveloped ideas.
        </p>
        <ChoiceQuestion
          question={strongestConclusion}
          selected={answers[strongestConclusion.id]}
          onSelect={selectAnswer}
          optionLabels
        />
        {answers[strongestConclusion.id] ? (
          <StructureBreakdown
            title="Key distinction"
            parts={[
              { label: "Option A", text: "Decides but introduces new arguments." },
              { label: "Option B", text: "Synthesises and reaches a consistent judgement." },
              { label: "Option C", text: "Synthesises but does not decide." },
            ]}
            note="The conclusion brings the discussion together and confirms the essay’s final position. This is where the question must ultimately receive a clear answer."
          />
        ) : null}
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Exercise 5</p>
        <h2>Apply It to a New Topic</h2>
        <p className="ote-section-lead">
          Transfer the same principles to a different essay question. Plan a coherent position,
          then write only the introduction and conclusion.
        </p>

        <div className="ote-guided-task-card ote-advanced-writing-transfer-task">
          <p className="ote-kicker">New essay task</p>
          <h3>Advertising aimed at children</h3>
          <p>
            You have been discussing advertising in your class. Some people believe that advertising
            aimed directly at children should be prohibited. Others argue that parents should decide
            what their children are allowed to buy.
          </p>
          <p><strong>Which opinion do you agree with?</strong></p>
          <p>Your essay must include at least two of the following ideas:</p>
          <ul>
            {transferIdeas.map((idea) => <li key={idea}>{idea}</li>)}
          </ul>
        </div>

        <div className="ote-advanced-writing-plan">
          <div>
            <h3>Plan your position</h3>
            <p>Choose the overall position your essay would take.</p>
            <div className="ote-training-options">
              {transferPositions.map((position) => (
                <button
                  key={position}
                  type="button"
                  className={`ote-training-option ${selectedPosition === position ? "is-selected" : ""}`}
                  aria-pressed={selectedPosition === position}
                  onClick={() => selectPosition(position)}
                >
                  <span>{position}</span>
                  {selectedPosition === position ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3>Select at least two ideas</h3>
            <p>{selectedIdeas.length} of 3 selected</p>
            <div className="ote-advanced-writing-checklist">
              {transferIdeas.map((idea) => (
                <label key={idea}>
                  <input
                    type="checkbox"
                    checked={selectedIdeas.includes(idea)}
                    onChange={() => toggleIdea(idea)}
                  />
                  <span>{idea}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="ote-advanced-writing-draft-intro">
          <h3>Write your introduction</h3>
          <p>
            Write approximately 35–50 words. You may indicate your position, but you do not need to
            announce it explicitly.
          </p>
        </div>
        <DraftBox
          label="Your introduction"
          value={introduction}
          onChange={(value) => {
            setIntroduction(value);
            clearAiFeedback();
          }}
          minWords={35}
          maxWords={50}
          checklist={introChecklist}
          checked={introChecks}
          onToggle={(item) => toggleCheck(setIntroChecks, item)}
        />

        <div className="ote-advanced-writing-draft-intro">
          <h3>Write your conclusion</h3>
          <p>
            Write approximately 35–50 words. Imagine that the main paragraphs have developed your
            chosen position and prompts.
          </p>
        </div>
        <DraftBox
          label="Your conclusion"
          value={conclusion}
          onChange={(value) => {
            setConclusion(value);
            clearAiFeedback();
          }}
          minWords={35}
          maxWords={50}
          checklist={conclusionChecklist}
          checked={conclusionChecks}
          onToggle={(item) => toggleCheck(setConclusionChecks, item)}
        />

        <div className="ote-model-answer ote-advanced-writing-pair-check">
          <strong>Check the two paragraphs together</strong>
          <Checklist
            items={pairChecklist}
            checked={pairChecks}
            onToggle={(item) => toggleCheck(setPairChecks, item)}
          />
        </div>

        <div className="ote-model-card ote-advanced-writing-ai-card">
          <div>
            <p className="ote-kicker">Independent transfer</p>
            <h2>Get Focused AI Feedback</h2>
            <p>
              Review issue framing, argument control, final judgement, consistency, and academic register.
              No model answer is revealed.
            </p>
          </div>
          <button type="button" disabled={aiStatus === "loading"} onClick={handleAiFeedback}>
            <FileText size={18} aria-hidden="true" />
            {aiStatus === "loading" ? "Checking paragraphs..." : "Get AI feedback"}
          </button>
        </div>
        <AdvancedIntroConclusionFeedback feedback={aiFeedback} status={aiStatus} error={aiError} />
      </section>

      <section className="ote-training-section ote-advanced-writing-finish">
        <div>
          <h2>Lesson progress</h2>
          <p>{answeredCount} of {allQuestions.length} questions answered · {correctCount} correct</p>
        </div>
        <button className="ote-training-primary-link" type="button" onClick={resetLesson}>
          <RotateCcw size={17} aria-hidden="true" /> Reset lesson
        </button>
      </section>
    </main>
  );
}

function FeedbackCriterion({ title, criterion }) {
  if (!criterion) return null;
  return (
    <article>
      <div className="ote-advanced-writing-feedback-head">
        <h3>{title}</h3>
        <span>{String(criterion.status || "").replace(/_/g, " ")}</span>
      </div>
      <p>{criterion.feedback}</p>
    </article>
  );
}

function AdvancedIntroConclusionFeedback({ feedback, status, error }) {
  if (status === "idle") return null;
  if (status === "loading") {
    return (
      <section className="ote-ai-feedback-panel" aria-live="polite">
        <h2>Focused feedback</h2>
        <p>Checking how the two paragraphs work separately and together...</p>
      </section>
    );
  }
  if (status === "error") {
    return (
      <section className="ote-ai-feedback-panel is-error" role="alert">
        <h2>Focused feedback</h2>
        <p>{error || "Could not generate paragraph feedback."}</p>
      </section>
    );
  }
  if (!feedback) return null;

  return (
    <section className="ote-ai-feedback-panel">
      <div className="ote-ai-feedback-heading">
        <div>
          <h2>Focused feedback</h2>
          <p className="ote-ai-feedback-auto-note">Generated automatically to support independent practice.</p>
          <p>{feedback.overall?.summary}</p>
        </div>
        <strong>{String(feedback.overall?.verdict || "").replace(/_/g, " ")}</strong>
      </div>

      <div className="ote-ai-feedback-overview">
        <article>
          <h3>Main strength</h3>
          <p>{feedback.overall?.mainStrength}</p>
        </article>
        <article>
          <h3>Main priority</h3>
          <p>{feedback.overall?.mainPriority}</p>
        </article>
      </div>

      <div className="ote-advanced-writing-feedback-grid">
        <FeedbackCriterion title="Issue framing" criterion={feedback.issueFraming} />
        <FeedbackCriterion title="Argument control" criterion={feedback.argumentControl} />
        <FeedbackCriterion title="Final judgement" criterion={feedback.finalJudgement} />
        <FeedbackCriterion title="Consistency" criterion={feedback.consistency} />
        <FeedbackCriterion title="Register" criterion={feedback.register} />
      </div>

      {feedback.languageCorrections?.length ? (
        <div className="ote-ai-feedback-mistakes">
          <h3>Language corrections</h3>
          <ul>
            {feedback.languageCorrections.map((item) => (
              <li key={`${item.original}-${item.correction}`}>
                <strong>{item.original}</strong> → {item.correction}
                <em>{item.explanation}</em>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="ote-advanced-writing-teacher-comment"><strong>Teacher note:</strong> {feedback.teacherComment}</p>
    </section>
  );
}
