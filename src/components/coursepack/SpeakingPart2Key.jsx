// src/components/coursepack/SpeakingPart2Key.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo";
import { speakingPart2Key } from "../../data/packKey/speakingPart2";

function PackKeyStyleScope() {
  return (
    <style>{`
      .packkey-page { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; --border:#2c4b83; }

      .panel{
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1rem;
        color: var(--ink);
      }

      .pk-topbar{
        display:flex;
        justify-content: space-between;
        align-items: center;
        gap: .75rem;
        margin-bottom: .6rem;
      }

      .pk-title{
        margin: 0;
        font-size: 2.1rem;
        font-weight: 800;
        letter-spacing: .2px;
        color: #f6b73c;
      }

      .pk-subtitle{
        margin: .45rem 0 1rem;
        color: rgba(255,255,255,.85);
        line-height: 1.45;
      }

      .muted{ color: var(--muted); }
      .small{ font-size: .92em; }

      .pk-sectionTitle{
        margin: 1.15rem 0 .35rem;
        font-size: 1.4rem;
        font-weight: 800;
        color: rgba(255,255,255,.95);
      }

      .pk-sectionMeta{
        margin: 0 0 .75rem;
        color: rgba(255,255,255,.70);
        font-size: .92rem;
        line-height: 1.35;
      }

      .pk-list{
        display: grid;
        gap: 1rem;
      }

      .subpanel{
        background: #0f1b31;
        border: 1px solid #2c416f;
        border-radius: 10px;
        padding: 0.95rem 1rem;
        transition: background .2s ease, border-color .2s ease, transform .12s ease;
      }
      .subpanel:hover{
        background: #122344;
        border-color: #3c5a91;
        transform: translateY(-1px);
      }

      .pk-head{
        display:flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: .75rem;
      }

      .pk-meta{
        margin: 0 0 .25rem 0;
        font-size: .85rem;
        color: rgba(255,255,255,.65);
      }

      .pk-itemTitle{
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #f6b73c;
      }

      .pk-btn{
        appearance: none;
        border: 1px solid rgba(246,183,60,.35);
        background: rgba(246,183,60,.08);
        color: rgba(255,255,255,.9);
        font-weight: 700;
        font-size: .85rem;
        padding: .35rem .6rem;
        border-radius: 999px;
        cursor: pointer;
        white-space: nowrap;
        transition: background .15s ease, transform .12s ease;
      }
      .pk-btn:hover{
        background: rgba(246,183,60,.12);
        transform: translateY(-1px);
      }

      .pk-body{
        margin-top: .8rem;
        display: grid;
        gap: .65rem;
      }

      .pk-qa{
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.04);
        padding: .75rem .8rem;
      }

      .pk-qLabel{
        font-weight: 800;
        margin-right: .35rem;
        color: rgba(255,255,255,.95);
      }

      .pk-prompt{
        color: rgba(255,255,255,.86);
        margin: .25rem 0 .45rem;
        line-height: 1.35;
      }

      .pk-answerRow{
        display:flex;
        gap: .4rem;
        flex-wrap: wrap;
        align-items: baseline;
        margin-bottom: .25rem;
      }

      .pk-answerTag{
        font-weight: 800;
        color: rgba(255,255,255,.92);
      }

      .pk-mono{
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        color: rgba(255,255,255,.92);
        background: rgba(0,0,0,.18);
        border: 1px solid rgba(255,255,255,.10);
        padding: .12rem .35rem;
        border-radius: 6px;
      }

      .pk-expl{
        color: rgba(255,255,255,.72);
        font-size: .92rem;
        line-height: 1.35;
      }

      .pk-line{
        color: rgba(255,255,255,.85);
        line-height: 1.4;
        margin: 0;
      }

      .pk-lineList{
        display:grid;
        gap: .35rem;
      }

      .pk-sample{
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.04);
        padding: .75rem .8rem;
      }

      .pk-badge{
        display:inline-block;
        font-weight: 800;
        font-size: .82rem;
        color: rgba(255,255,255,.85);
        border: 1px solid rgba(255,255,255,.14);
        background: rgba(0,0,0,.12);
        padding: .18rem .45rem;
        border-radius: 999px;
        margin-bottom: .35rem;
      }

      .pk-errorGrid{
        display:grid;
        grid-template-columns: 1fr;
        gap: .65rem;
      }
      @media (min-width: 860px){
        .pk-errorGrid{ grid-template-columns: 1fr 1fr; }
      }

      .pk-errorCard{
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.04);
        padding: .75rem .8rem;
      }

      .pk-qRow{
        display:flex;
        gap:.5rem;
        align-items:flex-start;
        margin-bottom:.45rem;
      }

      .pk-chip{
        font-weight: 900;
        border-radius: 10px;
        padding: .18rem .45rem;
        color: rgba(255,255,255,.95);
        background: rgba(0,0,0,.18);
        border: 1px solid rgba(255,255,255,.10);
        min-width: 2.25rem;
        text-align:center;
      }

      .pk-qText{
        margin: 0;
        color: rgba(255,255,255,.90);
        line-height:1.35;
      }

      /* Exams */
      .pk-exam{
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.04);
        padding: .85rem .9rem;
      }
      .pk-examTitle{
        margin: 0;
        font-weight: 900;
        color: rgba(255,255,255,.95);
      }
      .pk-taskTitle{
        margin: .75rem 0 .35rem;
        font-weight: 900;
        color: #f6b73c;
      }
      .pk-qBlock{
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.14);
        padding: .65rem .7rem;
        margin: .45rem 0;
      }
      .pk-qPrompt{
        margin: 0 0 .35rem;
        color: rgba(255,255,255,.90);
        line-height: 1.35;
      }
      .pk-sampleAnswer{
        margin: 0;
        color: rgba(255,255,255,.84);
        line-height: 1.45;
        font-size: .98rem;
      }
    `}</style>
  );
}

function BackButton({ to }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="pk-btn"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label="Back"
      style={{ display: "inline-flex", alignItems: "center", gap: ".35rem" }}
    >
      ← Back
    </button>
  );
}

/**
 * Supports item shapes:
 * - item.qa: [{label, prompt, answer, explanation}]
 * - item.samples: [{label?, prompt, answer, notes?}]
 * - item.errors: [{q, aWrong, correction, notes?}]
 * - item.lines: ["string", ...]
 * - item.exams: [{examId, title, reminder, tasks:[{taskNo,title,questions:[{qNo,prompt,sampleAnswer}]}]}]
 */
function KeyItem({ item }) {
  const [open, setOpen] = useState(false);

  const hasAnyKeyContent =
    (item.qa && item.qa.length) ||
    (item.samples && item.samples.length) ||
    (item.errors && item.errors.length) ||
    (item.lines && item.lines.length) ||
    (item.exams && item.exams.length);

  return (
    <div className="subpanel">
      <div className="pk-head">
        <div>
          <div className="pk-meta">
            {item.id ? `${item.id} · ` : ""}
            {item.type || "Key"}
          </div>
          <h3 className="pk-itemTitle">{item.title}</h3>
        </div>

        {hasAnyKeyContent && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="pk-btn"
            type="button"
            aria-expanded={open}
          >
            {open ? "Hide key" : "Show key"}
          </button>
        )}
      </div>

      {open && (
        <div className="pk-body">
          {/* Standard QA blocks */}
          {item.qa?.map((q) => (
            <div key={q.label ?? q.prompt} className="pk-qa">
              {q.label != null && (
                <div>
                  <span className="pk-qLabel">{q.label}.</span>
                </div>
              )}

              {q.prompt && <div className="pk-prompt">{q.prompt}</div>}

              <div className="pk-answerRow">
                <span className="pk-answerTag">Answer:</span>
                <span className="pk-mono">{q.answer}</span>
              </div>

              {q.explanation && <div className="pk-expl">{q.explanation}</div>}
            </div>
          ))}

          {/* Sample answers (longer) */}
          {item.samples?.map((s, idx) => (
            <div key={s.label ?? idx} className="pk-sample">
              <div className="pk-badge">{s.label ? `Sample ${s.label}` : `Sample ${idx + 1}`}</div>
              {s.prompt && <div className="pk-prompt">{s.prompt}</div>}
              {s.answer && (
                <div
                  className="pk-expl"
                  style={{ fontSize: ".98rem", color: "rgba(255,255,255,.88)" }}
                >
                  {s.answer}
                </div>
              )}
              {s.notes && <div className="pk-expl">{s.notes}</div>}
            </div>
          ))}

          {/* Error-correction cards */}
          {item.errors?.length ? (
            <div className="pk-errorGrid">
              {item.errors.map((e, idx) => (
                <div key={idx} className="pk-errorCard">
                  {e.q && (
                    <div className="pk-qRow">
                      <span className="pk-chip">Q</span>
                      <p className="pk-qText">{e.q}</p>
                    </div>
                  )}
                  {e.aWrong && (
                    <div className="pk-qRow">
                      <span className="pk-chip">A</span>
                      <p className="pk-qText">{e.aWrong}</p>
                    </div>
                  )}
                  {e.correction && (
                    <div className="pk-answerRow" style={{ marginTop: ".2rem" }}>
                      <span className="pk-answerTag">Correction:</span>
                      <span className="pk-mono">{e.correction}</span>
                    </div>
                  )}
                  {e.notes && (
                    <div className="pk-expl" style={{ marginTop: ".25rem" }}>
                      {e.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {/* Exam practice sets */}
          {item.exams?.length ? (
            <div className="pk-lineList" style={{ gap: ".7rem" }}>
              {item.exams.map((exam) => (
                <div key={exam.examId ?? exam.title} className="pk-exam">
                  <h4 className="pk-examTitle">
                    {exam.title || "Practice set"}{" "}
                    {exam.examId ? <span className="muted small">({exam.examId})</span> : null}
                  </h4>

                  {exam.reminder && (
                    <p className="pk-sectionMeta" style={{ marginTop: ".35rem" }}>
                      {exam.reminder}
                    </p>
                  )}

                  {exam.tasks?.map((t) => (
                    <div key={t.taskNo ?? t.title}>
                      <div className="pk-taskTitle">{t.title || `Task ${t.taskNo}`}</div>

                      {t.questions?.map((q) => (
                        <div key={q.qNo ?? q.prompt} className="pk-qBlock">
                          <p className="pk-qPrompt">
                            <span className="pk-qLabel">{q.qNo ? `${q.qNo}: ` : ""}</span>
                            {q.prompt}
                          </p>

                          {q.sampleAnswer && (
                            <>
                              <div className="pk-answerRow" style={{ marginBottom: ".35rem" }}>
                                <span className="pk-answerTag">Sample answer:</span>
                              </div>
                              <p className="pk-sampleAnswer">{q.sampleAnswer}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          {/* Simple bullet-style lines */}
          {item.lines?.length ? (
            <div className="pk-lineList">
              {item.lines.map((line, idx) => (
                <p key={idx} className="pk-line">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {!hasAnyKeyContent && (
        <div className="pk-sectionMeta" style={{ marginTop: ".5rem" }}>
          No key content found for this item yet.
        </div>
      )}
    </div>
  );
}

export default function SpeakingPart2Key() {
  const sections = useMemo(() => speakingPart2Key.sections || [], []);

  return (
    <div className="packkey-page">
      <PackKeyStyleScope />

      <Seo
        title="Speaking Part 2 Key | Seif Aptis Trainer"
        description="Answer key for Speaking Part 2 (Aptis General) in the Seif Aptis Trainer pack, including suggested answers and example responses."
        canonical="https://aptis-trainer.beeskillsenglish.com/pack-key/speaking-part-2"
      />

      <div className="panel" style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="pk-topbar">
          <BackButton to="/pack-key" />
          <span />
        </div>

        <h1 className="pk-title">{speakingPart2Key.title} — Key</h1>
        <p className="pk-subtitle">
          Detailed answer key for Speaking Part 2. This key can include suggested phrases, explanations,
          and sample answers for the guided sections.
        </p>

        {sections.length === 0 ? (
          <p className="pk-sectionMeta">No key content found.</p>
        ) : (
          sections.map((section) => (
            <div key={section.sectionId}>
              <h2 className="pk-sectionTitle">{section.title}</h2>

              <p className="pk-sectionMeta">
                <span className="muted">
                  {section.items?.length ?? 0} item{(section.items?.length ?? 0) === 1 ? "" : "s"}
                </span>
              </p>

              <div className="pk-list">
                {section.items?.map((item) => (
                  <KeyItem key={item.id || item.title} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
