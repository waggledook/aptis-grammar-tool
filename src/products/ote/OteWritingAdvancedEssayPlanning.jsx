import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Eye, Lightbulb, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const prompts = ["impact on children", "impact on families", "impact on businesses"];

const suggestionsFor = [
  "Children may not recognise persuasive techniques.",
  "Advertising can create pressure on parents.",
  "Some products may be unsuitable for children.",
];

const suggestionsAgainst = [
  "Parents make the final purchasing decision.",
  "Not all advertising is harmful.",
  "Businesses need to promote their products.",
];

const structures = [
  {
    id: "one-sided",
    title: "Option A: One-sided essay",
    bestFor: "Best when most of your strongest ideas support the same opinion.",
    paragraphs: [
      "Introduction: introduce the debate.",
      "Main paragraph 1: develop your first reason.",
      "Main paragraph 2: develop your second reason.",
      "Conclusion: give your final answer.",
    ],
    note: "You may briefly acknowledge the other view, but the essay mainly supports one position.",
  },
  {
    id: "balanced",
    title: "Option B: Balanced essay",
    bestFor: "Best when you want to consider both opinions before deciding.",
    paragraphs: [
      "Introduction: introduce the debate.",
      "Main paragraph 1: explain the arguments for prohibition.",
      "Main paragraph 2: explain the arguments against prohibition.",
      "Conclusion: say which view you find more convincing.",
    ],
    note: "Balanced does not mean undecided. Your conclusion should still answer the question.",
  },
];

const positions = [
  "Advertising aimed at children should be prohibited.",
  "Parents should remain responsible for controlling their children’s choices.",
  "Advertising should be permitted but subject to stricter limits.",
];

function countNotes(value) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function NotesBox({ label, value, onChange, placeholder }) {
  const count = countNotes(value);
  return (
    <label className="ote-writing-draft-box ote-essay-planning-notes">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      <small>{count} note{count === 1 ? "" : "s"}</small>
    </label>
  );
}

function PromptSelector({ selected, onToggle, label, options = prompts }) {
  return (
    <div className="ote-advanced-planning-prompt-selector">
      <strong>{label}</strong>
      <div>
        {options.map((prompt) => {
          const active = selected.includes(prompt);
          return (
            <button
              key={prompt}
              type="button"
              className={active ? "is-selected" : ""}
              aria-pressed={active}
              onClick={() => onToggle(prompt)}
            >
              {active ? <CheckCircle2 size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
              {prompt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlanBox({ title, prompt, value, onChange, children }) {
  return (
    <article className="ote-advanced-planning-box">
      <h3>{title}</h3>
      <p>{prompt}</p>
      {children}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="Write short planning notes, not the finished paragraph." />
    </article>
  );
}

function StatusItem({ complete, children }) {
  return (
    <li className={complete ? "is-complete" : ""}>
      {complete ? <CheckCircle2 size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
      <span>{children}</span>
    </li>
  );
}

export default function OteWritingAdvancedEssayPlanning({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-essay" : "/ote/writing/training/advanced-essay");
  const [forNotes, setForNotes] = useState("");
  const [againstNotes, setAgainstNotes] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [structure, setStructure] = useState("");
  const [position, setPosition] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [introductionPlan, setIntroductionPlan] = useState("");
  const [mainOnePlan, setMainOnePlan] = useState("");
  const [mainTwoPlan, setMainTwoPlan] = useState("");
  const [conclusionPlan, setConclusionPlan] = useState("");
  const [mainOnePrompts, setMainOnePrompts] = useState([]);
  const [mainTwoPrompts, setMainTwoPrompts] = useState([]);

  const canRevealSuggestions = Boolean(forNotes.trim() && againstNotes.trim());
  const coveredPrompts = useMemo(
    () => new Set([...mainOnePrompts, ...mainTwoPrompts]),
    [mainOnePrompts, mainTwoPrompts]
  );
  const promptCoverageComplete =
    selectedPrompts.length >= 2 && selectedPrompts.every((prompt) => coveredPrompts.has(prompt));
  const checks = {
    structure: Boolean(structure),
    position: Boolean(position),
    promptSelection: selectedPrompts.length >= 2,
    introduction: Boolean(introductionPlan.trim()),
    mainParagraphs:
      Boolean(mainOnePlan.trim() && mainTwoPlan.trim()) && mainOnePrompts.length > 0 && mainTwoPrompts.length > 0,
    promptCoverage: promptCoverageComplete,
    conclusion: Boolean(conclusionPlan.trim()),
  };
  const planComplete = Object.values(checks).every(Boolean);

  function toggleInList(setter, value) {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  function toggleSelectedPrompt(prompt) {
    if (selectedPrompts.includes(prompt)) {
      setSelectedPrompts((current) => current.filter((item) => item !== prompt));
      setMainOnePrompts((items) => items.filter((item) => item !== prompt));
      setMainTwoPrompts((items) => items.filter((item) => item !== prompt));
      return;
    }
    setSelectedPrompts((current) => [...current, prompt]);
  }

  function toggleParagraphPrompt(setter, prompt) {
    if (!selectedPrompts.includes(prompt)) return;
    toggleInList(setter, prompt);
  }

  function resetPlanning() {
    setForNotes("");
    setAgainstNotes("");
    setSuggestionsVisible(false);
    setStructure("");
    setPosition("");
    setSelectedPrompts([]);
    setIntroductionPlan("");
    setMainOnePlan("");
    setMainTwoPlan("");
    setConclusionPlan("");
    setMainOnePrompts([]);
    setMainTwoPrompts([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Essay Planning | Seif English"
        description="Plan an OTE Advanced essay by brainstorming, choosing a structure, selecting prompts and building a four-paragraph plan."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to advanced essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced essay · Lesson 3</p>
        <h1>Essay Planning</h1>
        <p>
          Turn quick notes into a focused four-paragraph plan. Choose a structure that suits your
          argument, develop at least two prompts and decide how the essay will answer the question.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div><p className="ote-kicker">Practice task</p><h2>Advertising aimed at children</h2></div>
          <div className="ote-guided-timing-note"><span>220–280 words</span><span>Plan first</span></div>
        </div>
        <p>
          You have been discussing advertising in your class. Some people believe that advertising
          aimed directly at children should be prohibited. Others argue that parents should decide
          what their children are allowed to buy.
        </p>
        <p><strong>Which opinion do you agree with?</strong></p>
        <p>Your essay must include at least two ideas:</p>
        <ul>{prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>
        <div className="ote-advanced-planning-reminder">
          Whichever structure you choose, include at least two prompts, support your ideas and answer the question clearly.
        </div>
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Step 1</p>
        <h2>Make Quick Notes</h2>
        <p className="ote-section-lead">Brainstorm both sides before deciding how to organise your argument. Use notes, not full paragraphs.</p>
        <div className="ote-essay-planning-grid">
          <NotesBox label="Reasons to prohibit advertising" value={forNotes} onChange={setForNotes} placeholder={"Children: ...\nFamilies: ..."} />
          <NotesBox label="Reasons not to prohibit advertising" value={againstNotes} onChange={setAgainstNotes} placeholder={"Parents: ...\nBusinesses: ..."} />
        </div>
        <div className="ote-starter-card ote-writing-brainstorm-card">
          <div className="ote-writing-brainstorm-head">
            <strong><Lightbulb size={17} aria-hidden="true" /> Suggested planning notes</strong>
            <button
              type="button"
              disabled={!canRevealSuggestions}
              onClick={() => setSuggestionsVisible((current) => !current)}
            >
              <Eye size={17} aria-hidden="true" /> {suggestionsVisible ? "Hide suggestions" : "Show suggestions"}
            </button>
          </div>
          {!canRevealSuggestions ? <p className="ote-section-lead">Add at least one note to both boxes before revealing suggestions.</p> : null}
          {suggestionsVisible ? (
            <div className="ote-essay-planning-grid">
              <div className="ote-essay-planning-suggestions"><strong>Reasons to prohibit</strong><ul>{suggestionsFor.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div className="ote-essay-planning-suggestions"><strong>Reasons not to prohibit</strong><ul>{suggestionsAgainst.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Step 2</p>
        <h2>Choose a Structure</h2>
        <p className="ote-section-lead">Which structure gives your strongest ideas the clearest development?</p>
        <div className="ote-essay-structure-grid">
          {structures.map((item) => {
            const active = structure === item.id;
            return (
              <article key={item.id} className={`ote-essay-structure-card ${active ? "is-selected" : ""}`}>
                <div className="ote-essay-structure-head"><h3>{item.title}</h3>{active ? <CheckCircle2 size={22} aria-hidden="true" /> : null}</div>
                <p>{item.bestFor}</p>
                <ol>{item.paragraphs.map((paragraph) => <li key={paragraph}>{paragraph}</li>)}</ol>
                <p className="ote-advanced-planning-structure-note">{item.note}</p>
                <button type="button" onClick={() => setStructure(item.id)}>{active ? "Selected" : "Choose this structure"}</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Step 3</p>
        <h2>Choose Your Final Position</h2>
        <p className="ote-section-lead">Structure and position are separate decisions. A balanced essay must still reach a clear judgement.</p>
        <div className="ote-training-options">
          {positions.map((item) => {
            const active = position === item;
            return (
              <button key={item} type="button" className={`ote-training-option ${active ? "is-selected" : ""}`} aria-pressed={active} onClick={() => setPosition(item)}>
                <span>{item}</span>{active ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Step 4</p>
        <h2>Check Prompt Coverage</h2>
        <p className="ote-section-lead">Select at least two prompts that your essay will genuinely develop.</p>
        <PromptSelector selected={selectedPrompts} onToggle={toggleSelectedPrompt} label={`${selectedPrompts.length} of 3 prompts selected`} />
        {selectedPrompts.length > 0 && selectedPrompts.length < 2 ? <p className="ote-warning">Choose at least one more prompt.</p> : null}
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Step 5</p>
        <h2>Make the Paragraph Plan</h2>
        <p className="ote-section-lead">Give each paragraph one clear job. Link the main paragraphs to the prompts selected above.</p>
        <div className="ote-advanced-planning-plan-grid">
          <PlanBox title="Introduction" prompt="What precise debate will you introduce?" value={introductionPlan} onChange={setIntroductionPlan} />
          <PlanBox title="Main paragraph 1" prompt="What is the main point, and how would you support it?" value={mainOnePlan} onChange={setMainOnePlan}>
            <PromptSelector selected={mainOnePrompts} onToggle={(prompt) => toggleParagraphPrompt(setMainOnePrompts, prompt)} label="Prompt(s) covered" options={selectedPrompts} />
            {!selectedPrompts.length ? <small>Select essay prompts in Step 4 first.</small> : null}
          </PlanBox>
          <PlanBox title="Main paragraph 2" prompt="What is the main point, and how would you support it?" value={mainTwoPlan} onChange={setMainTwoPlan}>
            <PromptSelector selected={mainTwoPrompts} onToggle={(prompt) => toggleParagraphPrompt(setMainTwoPrompts, prompt)} label="Prompt(s) covered" options={selectedPrompts} />
            {!selectedPrompts.length ? <small>Select essay prompts in Step 4 first.</small> : null}
          </PlanBox>
          <PlanBox title="Conclusion" prompt="What is your final answer?" value={conclusionPlan} onChange={setConclusionPlan} />
        </div>
        {selectedPrompts.length ? (
          <p className={`ote-advanced-planning-coverage ${promptCoverageComplete ? "is-complete" : ""}`}>
            {promptCoverageComplete
              ? "Every selected prompt is assigned to at least one main paragraph."
              : "Assign every selected prompt to at least one main paragraph."}
          </p>
        ) : null}
      </section>

      <section className={`ote-training-section ote-advanced-planning-completion ${planComplete ? "is-complete" : ""}`}>
        <div>
          <p className="ote-kicker">Plan check</p>
          <h2>{planComplete ? "Your plan is ready" : "Complete the planning decisions"}</h2>
        </div>
        <ul>
          <StatusItem complete={checks.structure}>Structure selected</StatusItem>
          <StatusItem complete={checks.position}>Final position selected</StatusItem>
          <StatusItem complete={checks.promptSelection}>At least two prompts selected</StatusItem>
          <StatusItem complete={checks.introduction}>Introduction debate planned</StatusItem>
          <StatusItem complete={checks.mainParagraphs}>Both main points planned and linked to prompts</StatusItem>
          <StatusItem complete={checks.promptCoverage}>Every selected prompt assigned</StatusItem>
          <StatusItem complete={checks.conclusion}>Final answer planned</StatusItem>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={resetPlanning}><RotateCcw size={17} aria-hidden="true" /> Reset planning</button>
      </section>
    </main>
  );
}
