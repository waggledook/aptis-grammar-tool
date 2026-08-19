import React, { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Radio,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { createCohesionChallengeLiveGame } from "../../api/liveGames.js";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { cohesionChallengeTask } from "./data/oteAdvancedReadingCohesionChallenge.js";
import "./styles/ote.css";
import "./styles/cohesion-challenge.css";

const EMPTY_WORK = { answer: "", clueId: "", checked: false };

export default function OteAdvancedReadingCohesionChallenge({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const [caseIndex, setCaseIndex] = useState(0);
  const [work, setWork] = useState({});
  const [showReport, setShowReport] = useState(false);
  const [creatingLive, setCreatingLive] = useState(false);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const task = cohesionChallengeTask;
  const item = task.cases[caseIndex];
  const itemWork = work[item.id] || EMPTY_WORK;
  const canHost = user?.role === "teacher" || user?.role === "admin";
  const menuPath = getSitePath(
    `${nativeRoutes ? "/reading" : "/ote/reading"}/advanced/part-3-gapped-text`
  );
  const completedCount = task.cases.filter((entry) => work[entry.id]?.checked).length;
  const score = task.cases.filter(
    (entry) => work[entry.id]?.checked && work[entry.id]?.answer === entry.answer
  ).length;
  const readyToReveal = Boolean(itemWork.answer && itemWork.clueId);

  const resultLabel = useMemo(() => {
    if (score === task.cases.length) return "Excellent: every cohesion decision was correct.";
    if (score >= 4) return "Strong work. Review the cases where paragraph function outweighed topic fit.";
    return "Review how the sentence after each gap limits the possible discourse job.";
  }, [score, task.cases.length]);

  function updateItem(patch) {
    setWork((current) => ({
      ...current,
      [item.id]: { ...EMPTY_WORK, ...current[item.id], ...patch },
    }));
  }

  function checkCase() {
    if (!readyToReveal || itemWork.checked) return;
    updateItem({ checked: true });
    if (!startedRef.current) {
      startedRef.current = true;
      logOteTrainingStarted({
        section: "reading",
        part: "part-3",
        mode: "classroom_cohesion_challenge",
        taskId: "advanced-reading-part-3-classroom-cohesion-challenge",
        taskTitle: task.title,
        variant: "advanced",
      }).catch(() => {});
    }

    if (completedCount === task.cases.length - 1 && !completedRef.current) {
      completedRef.current = true;
      const finalScore = score + (itemWork.answer === item.answer ? 1 : 0);
      logOteTrainingCompleted({
        progressId: "reading.part3.advanced-classroom-cohesion-challenge",
        section: "reading",
        part: "part-3",
        mode: "classroom_cohesion_challenge",
        taskId: "advanced-reading-part-3-classroom-cohesion-challenge",
        taskTitle: task.title,
        variant: "advanced",
        score: finalScore,
        total: task.cases.length,
      }).catch(() => {});
    }
  }

  function nextCase() {
    if (caseIndex === task.cases.length - 1) {
      setShowReport(true);
      return;
    }
    setCaseIndex((current) => current + 1);
  }

  function resetActivity() {
    setWork({});
    setCaseIndex(0);
    setShowReport(false);
    startedRef.current = false;
    completedRef.current = false;
  }

  async function createLiveSession() {
    if (!canHost || creatingLive) return;
    setCreatingLive(true);
    try {
      const { gameId } = await createCohesionChallengeLiveGame({ title: task.title });
      navigate(getSitePath(`/live/cohesion-challenge/host/${gameId}`));
    } catch (error) {
      console.error("[CohesionChallenge] live session creation failed", error);
      toast(error.message || "Could not create the cohesion room.");
      setCreatingLive(false);
    }
  }

  return (
    <main className="ote-training-page cohesion-challenge-page">
      <Seo
        title="Classroom Cohesion Challenge | OTE Advanced Reading Part 3"
        description="Detect decisive cohesion clues and discuss coherent distractors in six OTE Advanced Reading cases."
      />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Part 3 training
      </button>

      <header className="ote-training-hero cohesion-challenge-hero">
        <div>
          <p className="ote-kicker">Advanced Reading Part 3 · Classroom extension</p>
          <h1>{task.title}</h1>
          <p>Choose the missing sentence, detect the decisive clue, then discuss why the alternatives are coherent but wrong here.</p>
        </div>
        {canHost ? (
          <button className="cohesion-live-launch" type="button" onClick={createLiveSession} disabled={creatingLive}>
            <Radio size={20} aria-hidden="true" />
            {creatingLive ? "Creating room…" : "Start live session"}
          </button>
        ) : null}
      </header>

      <section className="ote-training-summary" aria-label="Activity instructions">
        <article><Search size={22} /><strong>Detect</strong><span>Choose one sentence and the clue that most strongly supports it.</span></article>
        <article><MessageCircle size={22} /><strong>Discuss</strong><span>Explain aloud why a tempting alternative still performs the wrong job.</span></article>
        <article><Eye size={22} /><strong>Reveal</strong><span>Compare the full answer, decisive link and both distractor explanations.</span></article>
      </section>

      {showReport ? (
        <section className="ote-training-section cohesion-challenge-complete">
          <CheckCircle2 size={42} aria-hidden="true" />
          <p className="ote-kicker">Challenge complete</p>
          <h2>{score} / {task.cases.length}</h2>
          <p>{resultLabel}</p>
          <p className="cohesion-clue-score">Only the sentence choices form the score. The clue choices and discussion prompts are reflective.</p>
          <div className="cohesion-result-links">
            {task.cases.map((entry, index) => (
              <div key={entry.id}>
                {work[entry.id]?.answer === entry.answer ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>{index + 1}. {entry.title}</span>
              </div>
            ))}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} /> Start again</button>
            <button type="button" onClick={() => navigate(menuPath)}>Back to Part 3</button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section cohesion-challenge-runner">
          <div className="cohesion-challenge-progress">
            <span>Case {caseIndex + 1} of {task.cases.length}</span>
            <strong>{completedCount} complete</strong>
            <i aria-hidden="true"><b style={{ width: `${(completedCount / task.cases.length) * 100}%` }} /></i>
          </div>

          <article className="cohesion-challenge-case">
            <header><span>Case {caseIndex + 1}</span><h2>{item.title}</h2></header>
            <div className="cohesion-challenge-passage">
              {item.before.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="cohesion-challenge-gap">Missing sentence</div>
              {item.after.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>

          <section className="cohesion-challenge-work">
            <div>
              <h3 className="cohesion-step-title"><span>1</span> Which sentence belongs in the gap?</h3>
              <div className="cohesion-challenge-options" role="radiogroup" aria-label={`Options for case ${caseIndex + 1}`}>
                {Object.entries(item.options).map(([letter, text]) => {
                  const selected = itemWork.answer === letter;
                  const correct = itemWork.checked && item.answer === letter;
                  const wrong = itemWork.checked && selected && letter !== item.answer;
                  return (
                    <button
                      className={`${selected ? "is-selected" : ""} ${correct ? "is-answer" : ""} ${wrong ? "is-wrong" : ""}`}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={itemWork.checked}
                      key={letter}
                      onClick={() => updateItem({ answer: letter })}
                    >
                      <strong>{letter}</strong><span>{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="cohesion-clue-task">
              <h3 className="cohesion-step-title"><span>2</span> What most strongly decides the gap?</h3>
              <p>Select the most useful clue. This choice helps you inspect your reasoning; it is not added to your answer score.</p>
              <div className="cohesion-clue-options" role="radiogroup" aria-label="Possible decisive clues">
                {item.clueChoices.map((choice) => {
                  const selected = itemWork.clueId === choice.id;
                  const correct = itemWork.checked && item.clueAnswer === choice.id;
                  const wrong = itemWork.checked && selected && choice.id !== item.clueAnswer;
                  return (
                    <button
                      className={`${selected ? "is-selected" : ""} ${correct ? "is-answer" : ""} ${wrong ? "is-wrong" : ""}`}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={itemWork.checked}
                      key={choice.id}
                      onClick={() => updateItem({ clueId: choice.id })}
                    >
                      <span>{choice.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!itemWork.checked ? (
              <>
                {readyToReveal ? (
                  <aside className="cohesion-discussion-prompt">
                    <MessageCircle size={21} aria-hidden="true" />
                    <div><strong>Pause and discuss</strong><p>Which other option is most tempting? Why is it coherent—and why might it still be wrong in this exact gap?</p></div>
                  </aside>
                ) : null}
                <button className="cohesion-check-button" type="button" disabled={!readyToReveal} onClick={checkCase}>
                  <Eye size={18} /> Reveal answer and explanation
                </button>
              </>
            ) : (
              <div className={`cohesion-challenge-feedback ${itemWork.answer === item.answer ? "is-correct" : "is-wrong"}`}>
                <header>
                  {itemWork.answer === item.answer ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  <div><span>{itemWork.answer === item.answer ? "Decision confirmed" : `Best answer: ${item.answer}`}</span><h3>{item.clue}</h3></div>
                </header>
                <div className="cohesion-correct-sentence"><strong>{item.answer}</strong><p>{item.options[item.answer]}</p></div>
                <p>{item.explanation}</p>
                <blockquote><strong>Decisive evidence</strong>{item.evidence}</blockquote>
                <p className={`cohesion-clue-result ${itemWork.clueId === item.clueAnswer ? "is-correct" : ""}`}>
                  <strong>{itemWork.clueId === item.clueAnswer ? "You identified the decisive clue." : "A stronger clue was available."}</strong>{" "}
                  {item.clueChoices.find((choice) => choice.id === item.clueAnswer)?.text}
                </p>
                <div className="cohesion-challenge-key-reasons">
                  {Object.entries(item.why).map(([letter, reason]) => <p key={letter}><strong>Why {letter} is tempting—but fails:</strong> {reason}</p>)}
                </div>
                <aside className="cohesion-discussion-prompt is-after-reveal">
                  <MessageCircle size={21} aria-hidden="true" />
                  <div><strong>Discuss the distractors</strong><p>Did your reason match the explanation? Could you change one distractor so that it performed the required discourse job?</p></div>
                </aside>
              </div>
            )}
          </section>

          <div className="ote-cohesion-actions">
            <button className="is-secondary" type="button" disabled={caseIndex === 0} onClick={() => setCaseIndex((current) => current - 1)}><ChevronLeft size={17} /> Previous</button>
            <button type="button" disabled={!itemWork.checked} onClick={nextCase}>{caseIndex === task.cases.length - 1 ? "View report" : "Next case"}<ChevronRight size={17} /></button>
          </div>
        </section>
      )}
    </main>
  );
}
