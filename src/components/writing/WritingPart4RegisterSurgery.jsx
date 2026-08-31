import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, Mail, RotateCcw, Scissors } from "lucide-react";
import {
  logAptisWritingTeacherActivityCompleted,
  logAptisWritingTeacherActivityStarted,
} from "../../firebase.js";
import Seo from "../common/Seo.jsx";
import {
  REGISTER_SURGERY_COMPARISONS,
  REGISTER_SURGERY_EMAILS,
  REGISTER_SURGERY_SCENARIO,
} from "./data/aptisWritingRegisterSurgery.js";
import "./writingPart4RegisterSurgery.css";

const LAST_STEP = 4;

function getSectionNumber(step) {
  if (step <= 1) return 1;
  if (step <= 3) return 2;
  return 3;
}

export default function WritingPart4RegisterSurgery({ onBack }) {
  const activityRef = useRef(null);
  const analyticsRef = useRef({ started: false, completed: false });
  const [step, setStep] = useState(0);
  const [stimulusOpen, setStimulusOpen] = useState(true);
  const [selected, setSelected] = useState({ informal: [], formal: [] });
  const [checked, setChecked] = useState({ informal: false, formal: false });
  const [rewrites, setRewrites] = useState({});
  const [suggestionsShown, setSuggestionsShown] = useState({});
  const [comparisonsShown, setComparisonsShown] = useState([]);
  const [complete, setComplete] = useState(false);
  const sectionNumber = getSectionNumber(step);

  function goToStep(nextStep) {
    setStep(Math.max(0, Math.min(LAST_STEP, nextStep)));
    setStimulusOpen(false);
    window.requestAnimationFrame(() => activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function toggleSelection(kind, chunkId) {
    if (checked[kind]) return;
    setSelected((current) => {
      const values = new Set(current[kind]);
      if (values.has(chunkId)) values.delete(chunkId);
      else values.add(chunkId);
      return { ...current, [kind]: [...values] };
    });
  }

  function checkSelections(kind) {
    if (!analyticsRef.current.started) {
      analyticsRef.current.started = true;
      void logAptisWritingTeacherActivityStarted({
        activityType: "register-surgery",
        activityTitle: "Register Surgery",
        part: 4,
        taskId: "part4-register-surgery",
      });
    }
    setChecked((current) => ({ ...current, [kind]: true }));
  }

  function completeActivity() {
    setComparisonsShown(REGISTER_SURGERY_COMPARISONS.map((_, index) => index));
    setComplete(true);
    if (analyticsRef.current.completed) return;
    analyticsRef.current.completed = true;
    void logAptisWritingTeacherActivityCompleted({
      activityType: "register-surgery",
      activityTitle: "Register Surgery",
      part: 4,
      taskId: "part4-register-surgery",
      itemCount: REGISTER_SURGERY_COMPARISONS.length,
    });
  }

  function changeSelections(kind) {
    setChecked((current) => ({ ...current, [kind]: false }));
  }

  function updateRewrite(itemId, value) {
    setRewrites((current) => ({ ...current, [itemId]: value }));
  }

  function revealSuggestion(itemId) {
    setSuggestionsShown((current) => ({ ...current, [itemId]: true }));
  }

  function revealAllSuggestions(kind) {
    const ids = REGISTER_SURGERY_EMAILS[kind].rewrites.map((item) => item.id);
    setSuggestionsShown((current) => ids.reduce((next, id) => ({ ...next, [id]: true }), { ...current }));
  }

  function toggleComparison(index) {
    setComparisonsShown((current) => current.includes(index)
      ? current.filter((value) => value !== index)
      : [...current, index]);
  }

  function resetActivity() {
    if (!window.confirm("Reset the whole Register Surgery activity?")) return;
    setStep(0);
    setStimulusOpen(true);
    setSelected({ informal: [], formal: [] });
    setChecked({ informal: false, formal: false });
    setRewrites({});
    setSuggestionsShown({});
    setComparisonsShown([]);
    setComplete(false);
    analyticsRef.current = { started: false, completed: false };
    window.requestAnimationFrame(() => activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <main className="register-surgery-page game-wrapper" ref={activityRef}>
      <Seo
        title="Part 4 Register Surgery | Seif Aptis Trainer"
        description="Spot and improve formal and informal register in complete Aptis Writing Part 4 emails."
      />

      <div className="register-surgery-topbar">
        <button type="button" onClick={onBack}><ArrowLeft size={18} /> Back to Part 4</button>
        <button type="button" onClick={resetActivity}><RotateCcw size={17} /> Reset activity</button>
      </div>

      <header className="register-surgery-hero">
        <div className="register-surgery-hero-icon"><Scissors size={31} /></div>
        <div>
          <p>Aptis Writing Part 4 · Classroom training</p>
          <h1>Part 4 Register Surgery</h1>
          <span>Spot language that does not suit the reader and make it more appropriate.</span>
        </div>
      </header>

      <section className="register-surgery-intro">
        <p>In Aptis Writing Part 4, you write about the same situation for two different readers. The information may be similar, but the language should change.</p>
        <p>Some expressions below are in the wrong register. Find them and suggest better alternatives.</p>
      </section>

      <details
        className="register-surgery-stimulus"
        open={stimulusOpen}
        onToggle={(event) => setStimulusOpen(event.currentTarget.open)}
      >
        <summary><Mail size={18} /><span><strong>Original task</strong>{REGISTER_SURGERY_SCENARIO.title}</span><em>{stimulusOpen ? "Hide" : "View"}</em></summary>
        <div>
          <h2>{REGISTER_SURGERY_SCENARIO.sourceTitle}</h2>
          {REGISTER_SURGERY_SCENARIO.source.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </details>

      <div className="register-surgery-progress" aria-label={`Section ${sectionNumber} of 3`}>
        {[1, 2, 3].map((number) => (
          <span className={number <= sectionNumber ? "is-active" : ""} key={number}>
            <i>{number}</i>{number === 1 ? "Informal email" : number === 2 ? "Formal email" : "Compare"}
          </span>
        ))}
      </div>

      {step === 0 ? (
        <SpotStage
          checked={checked.informal}
          email={REGISTER_SURGERY_EMAILS.informal}
          kind="informal"
          onChangeSelections={() => changeSelections("informal")}
          onCheck={() => checkSelections("informal")}
          onContinue={() => goToStep(1)}
          onToggle={toggleSelection}
          selected={selected.informal}
        />
      ) : null}

      {step === 1 ? (
        <RewriteStage
          answers={rewrites}
          email={REGISTER_SURGERY_EMAILS.informal}
          kind="informal"
          onBack={() => goToStep(0)}
          onChange={updateRewrite}
          onContinue={() => goToStep(2)}
          onReveal={revealSuggestion}
          onRevealAll={() => revealAllSuggestions("informal")}
          suggestionsShown={suggestionsShown}
        />
      ) : null}

      {step === 2 ? (
        <SpotStage
          checked={checked.formal}
          email={REGISTER_SURGERY_EMAILS.formal}
          kind="formal"
          onBack={() => goToStep(1)}
          onChangeSelections={() => changeSelections("formal")}
          onCheck={() => checkSelections("formal")}
          onContinue={() => goToStep(3)}
          onToggle={toggleSelection}
          selected={selected.formal}
        />
      ) : null}

      {step === 3 ? (
        <RewriteStage
          answers={rewrites}
          email={REGISTER_SURGERY_EMAILS.formal}
          kind="formal"
          onBack={() => goToStep(2)}
          onChange={updateRewrite}
          onContinue={() => goToStep(4)}
          onReveal={revealSuggestion}
          onRevealAll={() => revealAllSuggestions("formal")}
          suggestionsShown={suggestionsShown}
        />
      ) : null}

      {step === 4 ? (
        <ComparisonStage
          complete={complete}
          onBack={() => goToStep(3)}
          onComplete={completeActivity}
          onRevealAll={() => setComparisonsShown(REGISTER_SURGERY_COMPARISONS.map((_, index) => index))}
          onToggle={toggleComparison}
          shown={comparisonsShown}
        />
      ) : null}
    </main>
  );
}

function SpotStage({ kind, email, selected, checked, onToggle, onCheck, onChangeSelections, onContinue, onBack }) {
  const result = useMemo(() => {
    const selectedSet = new Set(selected);
    const selectableChunks = email.blocks.flatMap((block) => block.chunks).filter((chunk) => chunk.selectable);
    return {
      found: selectableChunks.filter((chunk) => chunk.target && selectedSet.has(chunk.id)).length,
      extras: selectableChunks.filter((chunk) => !chunk.target && selectedSet.has(chunk.id)).length,
    };
  }, [email.blocks, selected]);

  return (
    <section className="register-surgery-stage">
      <StageHeading eyebrow={kind === "informal" ? "1 · Email to a friend" : "2 · Email to the committee"} title={email.heading} copy={email.instruction} />
      <EmailPanel checked={checked} email={email} kind={kind} onToggle={onToggle} selected={selected} />

      {checked ? (
        <div className="register-surgery-result" role="status">
          <CheckCircle2 size={24} />
          <div>
            <strong>{result.found} of {email.targetCount} register problems found</strong>
            <span>{result.extras ? `${result.extras} appropriate ${result.extras === 1 ? "expression was" : "expressions were"} also selected.` : "No appropriate expressions were selected unnecessarily."}</span>
          </div>
        </div>
      ) : null}

      <div className="register-surgery-stage-actions">
        {onBack ? <button type="button" onClick={onBack}><ArrowLeft size={17} /> Previous</button> : <span />}
        <div>
          {checked ? <button type="button" onClick={onChangeSelections}>Change selections</button> : null}
          {!checked ? (
            <button className="is-primary" disabled={!selected.length} type="button" onClick={onCheck}>Check selections</button>
          ) : (
            <button className="is-primary" type="button" onClick={onContinue}>Rewrite the expressions <ArrowRight size={17} /></button>
          )}
        </div>
      </div>
    </section>
  );
}

function EmailPanel({ kind, email, selected, checked, onToggle }) {
  const selectedSet = new Set(selected);
  return (
    <article className={`register-surgery-email is-${kind}`}>
      <header><span>{email.audience}</span><small>{kind === "informal" ? "About 50 words" : "About 130 words"}</small></header>
      <div className="register-surgery-email-body">
        {email.blocks.map((block) => (
          <p key={block.id}>
            {block.chunks.map((chunk, index) => {
              if (!chunk.selectable) return <React.Fragment key={`${block.id}-${index}`}>{chunk.text}</React.Fragment>;
              const isSelected = selectedSet.has(chunk.id);
              const resultClass = checked
                ? chunk.target
                  ? isSelected ? "is-correct" : "is-missed"
                  : isSelected ? "is-extra" : ""
                : "";
              return (
                <button
                  aria-pressed={isSelected}
                  className={`${isSelected ? "is-selected" : ""} ${resultClass}`.trim()}
                  key={chunk.id}
                  onClick={() => onToggle(kind, chunk.id)}
                  type="button"
                >
                  {chunk.text}
                </button>
              );
            })}
          </p>
        ))}
      </div>
    </article>
  );
}

function RewriteStage({ kind, email, answers, suggestionsShown, onChange, onReveal, onRevealAll, onContinue, onBack }) {
  return (
    <section className="register-surgery-stage">
      <StageHeading
        eyebrow={kind === "informal" ? "1 · Email to a friend" : "2 · Email to the committee"}
        title={`Improve the ${kind} email`}
        copy={`Make the highlighted expressions sound more natural in an email to ${kind === "informal" ? "a friend" : "the committee"}. There can be more than one good answer.`}
      />
      <div className="register-surgery-rewrite-list">
        {email.rewrites.map((item, index) => (
          <article className="register-surgery-rewrite" key={item.id}>
            <div className="register-surgery-rewrite-number">{index + 1}</div>
            <div>
              <p><span>Original</span>{item.original}</p>
              <label>
                <span>Your version</span>
                <textarea
                  onChange={(event) => onChange(item.id, event.target.value)}
                  placeholder="Write an alternative…"
                  rows={2}
                  value={answers[item.id] || ""}
                />
              </label>
              <button className="register-surgery-compare-button" type="button" onClick={() => onReveal(item.id)}>
                <Eye size={16} /> {suggestionsShown[item.id] ? "Suggestions shown" : "Compare with suggestions"}
              </button>
              {suggestionsShown[item.id] ? (
                <div className="register-surgery-suggestions">
                  <strong>Possible alternatives</strong>
                  {item.suggestions.map((suggestion) => <p key={suggestion}>{suggestion}</p>)}
                  <span>{item.explanation}</span>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <div className="register-surgery-stage-actions">
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> Previous</button>
        <div>
          <button type="button" onClick={onRevealAll}>Reveal all suggestions</button>
          <button className="is-primary" type="button" onClick={onContinue}>{kind === "informal" ? "Open the formal email" : "Compare the registers"} <ArrowRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}

function ComparisonStage({ shown, complete, onToggle, onRevealAll, onComplete, onBack }) {
  return (
    <section className="register-surgery-stage">
      <StageHeading eyebrow="3 · Final comparison" title="Same situation. Different reader." copy="Reveal each row and notice what changes when the reader changes." />
      <div className="register-surgery-comparison" aria-label="Informal and formal register comparison">
        <div className="register-surgery-comparison-head">
          <span>Area</span><span>Informal</span><span>Formal / neutral</span>
        </div>
        {REGISTER_SURGERY_COMPARISONS.map((item, index) => {
          const revealed = shown.includes(index);
          return (
            <button aria-expanded={revealed} key={item.area} onClick={() => onToggle(index)} type="button">
              <strong>{item.area}</strong>
              {revealed ? <><span>{item.informal}</span><span>{item.formal}</span></> : <span className="register-surgery-reveal-label"><Eye size={16} /> Reveal contrast</span>}
            </button>
          );
        })}
      </div>
      <div className="register-surgery-takeaway">
        <strong>Formal does not mean “use the most complicated English possible”.</strong>
        <p>In Aptis Part 4, aim for language that is appropriate to the reader: friendly and conversational for someone you know, and clear, polite and neutral when writing to an organisation.</p>
        <p>You can often keep the same idea while changing only the way you express it.</p>
      </div>
      {complete ? (
        <div className="register-surgery-complete"><CheckCircle2 size={34} /><div><strong>Register Surgery complete ✓</strong><span>You are ready to apply the same register choices to a full Part 4 task.</span></div></div>
      ) : null}
      <div className="register-surgery-stage-actions">
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> Previous</button>
        <div>
          <button type="button" onClick={onRevealAll}>Reveal all</button>
          <button className="is-primary" type="button" onClick={onComplete}>Complete activity</button>
        </div>
      </div>
    </section>
  );
}

function StageHeading({ eyebrow, title, copy }) {
  return (
    <header className="register-surgery-stage-heading">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{copy}</span>
    </header>
  );
}
