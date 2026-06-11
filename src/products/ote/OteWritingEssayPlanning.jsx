import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, Lightbulb, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const taskText =
  "You have had a class discussion on technology. Your teacher now wants you to write an essay. Title: Should smartphones be banned in classrooms? Write 100-160 words.";

const suggestedFor = [
  "Distraction: students text, use social media, or play games instead of listening.",
  "Cheating: it is easy to look up answers during tests.",
  "Break time: students may look at screens instead of talking to classmates.",
];

const suggestedAgainst = [
  "Research: students can use dictionaries and educational websites quickly.",
  "Safety: parents can contact students in an emergency.",
  "Engagement: teachers can use quiz apps and other classroom tools.",
];

const essayStructures = [
  {
    id: "one-sided",
    title: "Option A: One-sided essay",
    bestFor: "Use this if you have a strong opinion about one side.",
    paragraphs: [
      "Introduction: introduce the topic and clearly give your opinion.",
      "Main argument: give two strong reasons for your opinion, with simple examples.",
      "Conclusion: say your opinion again in different words and finish the essay.",
    ],
  },
  {
    id: "balanced",
    title: "Option B: Balanced essay",
    bestFor: "Use this if you think both sides have good points.",
    paragraphs: [
      "Introduction: introduce the topic and show that people have different opinions.",
      "Arguments for: explain why some people agree with the ban.",
      "Arguments against: explain why some people disagree with the ban.",
      "Conclusion: sum up both sides and give your final personal opinion.",
    ],
  },
];

function countLines(value) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function NotesBox({ label, hint, value, onChange }) {
  return (
    <label className="ote-writing-draft-box ote-essay-planning-notes">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={hint} />
      <small>{countLines(value)} note{countLines(value) === 1 ? "" : "s"}</small>
    </label>
  );
}

function SuggestedNotes({ title, items }) {
  return (
    <div className="ote-essay-planning-suggestions">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function OteWritingEssayPlanning({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/essay" : "/ote/writing/training/essay");
  const [forNotes, setForNotes] = useState("");
  const [againstNotes, setAgainstNotes] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState("");

  function resetPlanning() {
    setForNotes("");
    setAgainstNotes("");
    setSuggestionsVisible(false);
    setSelectedStructure("");
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Essay Planning | Seif English"
        description="Practise planning an OTE essay with quick for-and-against notes and a clear essay structure."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 3</p>
        <h1>Essay Planning</h1>
        <p>
          Practise making quick notes before you write. In the real computer exam, you cannot use
          paper, so type short planning notes in the answer box and delete them before you finish.
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
            <span>Plan first</span>
          </div>
        </div>
        <p>{taskText}</p>
      </section>

      <section className="ote-training-section">
        <h2>Part 1: Brainstorm Both Sides</h2>
        <p className="ote-section-lead">
          Write short notes, not full sentences. Try to find ideas for the ban and against the ban
          before you choose your essay structure.
        </p>

        <div className="ote-essay-planning-grid">
          <NotesBox
            label="Ideas for the ban"
            hint={"Example format:\nDistraction: ...\nCheating: ..."}
            value={forNotes}
            onChange={setForNotes}
          />
          <NotesBox
            label="Ideas against the ban"
            hint={"Example format:\nResearch: ...\nSafety: ..."}
            value={againstNotes}
            onChange={setAgainstNotes}
          />
        </div>

        <div className="ote-starter-card ote-writing-brainstorm-card">
          <div className="ote-writing-brainstorm-head">
            <strong>
              <Lightbulb size={17} aria-hidden="true" />
              Suggested planning notes
            </strong>
            <button type="button" onClick={() => setSuggestionsVisible((current) => !current)}>
              <Eye size={17} aria-hidden="true" />
              {suggestionsVisible ? "Hide suggestions" : "Show suggestions"}
            </button>
          </div>
          {suggestionsVisible ? (
            <div className="ote-essay-planning-grid">
              <SuggestedNotes title="Ideas for the ban" items={suggestedFor} />
              <SuggestedNotes title="Ideas against the ban" items={suggestedAgainst} />
            </div>
          ) : (
            <p className="ote-section-lead">
              Try to write two or three ideas in each box before you reveal the suggestions.
            </p>
          )}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Part 2: Choose a Structure</h2>
        <p className="ote-section-lead">
          Look at your notes. Which structure gives you the clearest essay for this topic?
        </p>

        <div className="ote-essay-structure-grid">
          {essayStructures.map((structure) => {
            const isSelected = selectedStructure === structure.id;
            return (
              <article key={structure.id} className={`ote-essay-structure-card ${isSelected ? "is-selected" : ""}`}>
                <div className="ote-essay-structure-head">
                  <h3>{structure.title}</h3>
                  {isSelected ? <CheckCircle2 size={22} aria-hidden="true" /> : null}
                </div>
                <p>{structure.bestFor}</p>
                <ol>
                  {structure.paragraphs.map((paragraph) => (
                    <li key={paragraph}>{paragraph}</li>
                  ))}
                </ol>
                <button type="button" onClick={() => setSelectedStructure(structure.id)}>
                  {isSelected ? "Selected" : "Choose this structure"}
                </button>
              </article>
            );
          })}
        </div>

        {selectedStructure && (
          <div className="ote-model-answer">
            <p>
              <strong>Next step:</strong> delete your planning notes before the end of the exam.
              Then write the essay using the structure you chose.
            </p>
          </div>
        )}
      </section>

      <section className="ote-training-section">
        <button className="ote-training-primary-link" type="button" onClick={resetPlanning}>
          <RotateCcw size={17} aria-hidden="true" />
          Reset planning
        </button>
      </section>
    </main>
  );
}
