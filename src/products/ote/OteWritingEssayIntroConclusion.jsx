import React, { useState } from "react";
import { ArrowLeft, ChevronDown, Eye, Lightbulb, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const taskText =
  "You have had a class discussion on technology. Your teacher now wants you to write an essay. Title: Should smartphones be banned in classrooms? Write 100-160 words.";

const introductionMistakes = [
  {
    id: "announcement",
    label: "The Announcement",
    text: "In this essay, I am going to talk about smartphones in classrooms and why I think they are bad.",
    explanation:
      "This sounds too much like a speech or class presentation. In an essay, start with the topic itself, not with what you are going to do.",
  },
  {
    id: "argument-leaker",
    label: "The Argument Leaker",
    text: "Smartphones should be banned because students text during math, look up test answers on Google, and play video games under their desks.",
    explanation:
      "This gives too many body-paragraph details too early. The introduction should open the topic and show your opinion, not list every example.",
  },
  {
    id: "topic-drifter",
    label: "The Topic Drifter",
    text: "Technology is amazing and nowadays everyone has a smartphone to check social media, play games, and call their parents from anywhere.",
    explanation:
      "This is about technology in general. The task is more specific: smartphones inside classrooms.",
  },
];

const conclusionMistakes = [
  {
    id: "lazy-sign-off",
    label: "The Lazy Sign-Off",
    text: "That is why I think phones are bad in class. Write back soon and tell me what you think.",
    explanation:
      "This sounds like an email. An essay conclusion should finish the argument, not speak directly to the examiner.",
  },
  {
    id: "surprise-argument",
    label: "The Surprise Argument",
    text: "In conclusion, phones are distracting. Also, laptops should be banned too because they are too loud and cyberbullying is getting worse.",
    explanation:
      "This adds new topics at the end. A conclusion should only return to ideas you have already discussed.",
  },
  {
    id: "fence-sitter",
    label: "The Fence-Sitter",
    text: "To sum up, smartphones have some good things and some bad things, so I am not really sure if they should be banned or not.",
    explanation:
      "This does not give a clear final opinion. The reader should know what you think by the final sentence.",
  },
];

const introductionBrainstorm = [
  {
    prompt: "What is happening with smartphones in schools now?",
    suggestion:
      "Smartphones are now part of daily life, and many students bring them to school every day.",
  },
  {
    prompt: "Why is this an important debate?",
    suggestion:
      "Teachers want students to focus, but some people believe phones can also support learning.",
  },
  {
    prompt: "Why is there no easy answer?",
    suggestion:
      "Phones can be useful for quick research, but they can also distract students during lessons.",
  },
];

const conclusionBrainstorm = [
  {
    prompt: "What is the main truth after looking at both sides?",
    suggestion:
      "Smartphones can help in some situations, but they often create more problems than benefits in class.",
  },
  {
    prompt: "What is your final opinion?",
    suggestion:
      "A classroom ban is a good idea if schools still allow phones for emergencies or special activities.",
  },
  {
    prompt: "What could happen next?",
    suggestion:
      "Schools may need clearer phone rules as mobile technology becomes even more common.",
  },
];

const openingPrompts = [
  "In recent years, the use of smartphones...",
  "Many schools are now discussing whether...",
  "Although smartphones can be useful, ...",
];

const concludingPrompts = [
  "In conclusion, although smartphones can...",
  "To sum up, the benefits of classroom phone use...",
  "Taking both sides into account, schools should...",
];

const modelOpinionIntroduction =
  "In recent years, smartphones have become a normal part of students' daily lives, and this has created debate in many schools. Although phones can sometimes support learning, I believe they should usually be banned in classrooms because they distract students too easily.";

const modelBalancedIntroduction =
  "Smartphones are now a normal part of students' lives, so it is not surprising that schools are debating their place in the classroom. They can distract learners, but they can also help with quick research and communication. Should schools ban them completely, or teach students to use them responsibly?";

const modelConclusion =
  "In conclusion, smartphones can offer some learning benefits, but their distractions are too serious to ignore. For this reason, schools should ban them during lessons while still allowing sensible exceptions when needed.";

function countWords(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function MistakeCard({ item, isOpen, onToggle }) {
  return (
    <article className={`ote-student-answer-card ${isOpen ? "is-open" : ""}`}>
      <button className="ote-student-answer-toggle" type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span>Not quite right</span>
        <strong>{item.label}</strong>
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      <blockquote>"{item.text}"</blockquote>
      {isOpen && (
        <div className="ote-student-answer-detail">
          <h3>Why it is a problem</h3>
          <p>{item.explanation}</p>
        </div>
      )}
    </article>
  );
}

function BrainstormBox({ title, items, visible, onToggle }) {
  return (
    <div className="ote-starter-card ote-writing-brainstorm-card">
      <div className="ote-writing-brainstorm-head">
        <strong>
          <Lightbulb size={17} aria-hidden="true" />
          {title}
        </strong>
        <button type="button" onClick={onToggle}>
          <Eye size={17} aria-hidden="true" />
          {visible ? "Hide suggestions" : "Show suggestions"}
        </button>
      </div>
      <div className="ote-part3-stage-grid ote-writing-brainstorm-grid">
        {items.map((item) => (
          <article key={item.prompt}>
            <h3>{item.prompt}</h3>
            {visible ? <p>{item.suggestion}</p> : <p>Think of one clear idea before you reveal a suggestion.</p>}
          </article>
        ))}
      </div>
    </div>
  );
}

function WritingBox({ label, value, onChange, placeholder }) {
  return (
    <label className="ote-writing-draft-box">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      <small>{countWords(value)} words</small>
    </label>
  );
}

export default function OteWritingEssayIntroConclusion({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/essay" : "/ote/writing/training/essay");
  const [openMistake, setOpenMistake] = useState("");
  const [introIdeasVisible, setIntroIdeasVisible] = useState(false);
  const [conclusionIdeasVisible, setConclusionIdeasVisible] = useState(false);
  const [introduction, setIntroduction] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [modelIntroVisible, setModelIntroVisible] = useState(false);
  const [modelConclusionVisible, setModelConclusionVisible] = useState(false);

  function toggleMistake(id) {
    setOpenMistake((current) => (current === id ? "" : id));
  }

  function resetDrafts() {
    setIntroduction("");
    setConclusion("");
    setModelIntroVisible(false);
    setModelConclusionVisible(false);
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Essay Introductions and Conclusions | Seif English"
        description="Practise writing clear OTE essay introductions and conclusions with examples, planning prompts, and model answers."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 2</p>
        <h1>Introductions and Conclusions</h1>
        <p>
          Learn how to start and finish an OTE essay clearly. A good introduction opens the topic
          and shows your opinion. A good conclusion brings your ideas together and gives a clear
          final thought.
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
        <h2>Part 1: Write a Strong Introduction</h2>
        <p className="ote-section-lead">
          Your introduction needs two simple things: a general sentence about the topic and a clear
          opinion. It should not list all your examples yet.
        </p>

        <BrainstormBox
          title="Brainstorm the topic"
          items={introductionBrainstorm}
          visible={introIdeasVisible}
          onToggle={() => setIntroIdeasVisible((current) => !current)}
        />

        <h3 className="ote-writing-subheading">Common introduction problems</h3>
        <div className="ote-student-answer-list">
          {introductionMistakes.map((item) => (
            <MistakeCard
              key={item.id}
              item={item}
              isOpen={openMistake === `intro:${item.id}`}
              onToggle={() => toggleMistake(`intro:${item.id}`)}
            />
          ))}
        </div>

        <div className="ote-model-answer ote-writing-prompt-bank">
          <strong>Useful opening prompts</strong>
          {openingPrompts.map((prompt) => (
            <p key={prompt}>{prompt}</p>
          ))}
        </div>

        <WritingBox
          label="Your introduction"
          value={introduction}
          onChange={setIntroduction}
          placeholder="Write 2 sentences. Aim for about 25-35 words."
        />

        <div className="ote-model-card">
          <div>
            <p className="ote-kicker">Model introductions</p>
            <h2>Compare Two Openings</h2>
            <p>Write your own introduction first. Then compare two possible approaches.</p>
          </div>
          <button type="button" onClick={() => setModelIntroVisible(true)} disabled={modelIntroVisible}>
            <Eye size={18} aria-hidden="true" />
            Show models
          </button>
        </div>
        {modelIntroVisible && (
          <div className="ote-model-answer">
            <p className="ote-kicker">Model 1: clear opinion</p>
            <blockquote>{modelOpinionIntroduction}</blockquote>
            <div className="ote-model-why">
              <p>
                <strong>Why it works:</strong> it starts with the general topic, shows both sides,
                and gives the writer's opinion straight away.
              </p>
            </div>
            <p className="ote-kicker">Model 2: balanced question</p>
            <blockquote>{modelBalancedIntroduction}</blockquote>
            <div className="ote-model-why">
              <p>
                <strong>Why it works:</strong> it introduces both sides without choosing too early.
                The final rhetorical question sets up a balanced essay.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="ote-training-section">
        <h2>Part 2: Write a Clear Conclusion</h2>
        <p className="ote-section-lead">
          Your conclusion should return to your main ideas and finish with your final opinion. Do
          not add a new argument at the end.
        </p>

        <BrainstormBox
          title="Brainstorm the ending"
          items={conclusionBrainstorm}
          visible={conclusionIdeasVisible}
          onToggle={() => setConclusionIdeasVisible((current) => !current)}
        />

        <h3 className="ote-writing-subheading">Common conclusion problems</h3>
        <div className="ote-student-answer-list">
          {conclusionMistakes.map((item) => (
            <MistakeCard
              key={item.id}
              item={item}
              isOpen={openMistake === `conclusion:${item.id}`}
              onToggle={() => toggleMistake(`conclusion:${item.id}`)}
            />
          ))}
        </div>

        <div className="ote-model-answer ote-writing-prompt-bank">
          <strong>Useful concluding prompts</strong>
          {concludingPrompts.map((prompt) => (
            <p key={prompt}>{prompt}</p>
          ))}
        </div>

        <WritingBox
          label="Your conclusion"
          value={conclusion}
          onChange={setConclusion}
          placeholder="Write your final paragraph. Aim for about 25-35 words."
        />

        <div className="ote-model-card">
          <div>
            <p className="ote-kicker">Model conclusion</p>
            <h2>Compare Your Ending</h2>
            <p>Open the model after you write. Check if your ending gives a clear final opinion.</p>
          </div>
          <button type="button" onClick={() => setModelConclusionVisible(true)} disabled={modelConclusionVisible}>
            <Eye size={18} aria-hidden="true" />
            Show model
          </button>
        </div>
        {modelConclusionVisible && (
          <div className="ote-model-answer">
            <blockquote>{modelConclusion}</blockquote>
            <div className="ote-model-why">
              <p>
                <strong>Why it works:</strong> it balances the two sides, repeats the final opinion,
                and does not introduce a new topic.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="ote-training-section">
        <button className="ote-training-primary-link" type="button" onClick={resetDrafts}>
          <RotateCcw size={17} aria-hidden="true" />
          Reset drafts
        </button>
      </section>
    </main>
  );
}
