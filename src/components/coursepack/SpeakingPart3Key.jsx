// src/components/coursepack/SpeakingPart3Key.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo";
import { speakingPart3Key } from "../../data/packKey/speakingPart3";

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
      }

      .pk-subtitle{
        margin: .25rem 0 0;
        color: var(--muted);
        line-height: 1.35;
        font-size: 1rem;
      }

      .pk-btn{
        border: 1px solid var(--border);
        background: rgba(255,255,255,.05);
        color: var(--ink);
        padding: .55rem .8rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
      }
      .pk-btn:hover{ background: rgba(255,255,255,.09); }

      .pk-section{
        margin-top: 1rem;
        border-top: 1px solid rgba(255,255,255,.08);
        padding-top: 1rem;
      }

      .pk-section h2{
        margin: 0 0 .75rem;
        font-size: 1.3rem;
      }

      .pk-item{
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: .75rem;
        background: rgba(0,0,0,.10);
      }

      .pk-item-head{
        display:flex;
        justify-content: space-between;
        align-items: center;
        gap: .8rem;
        padding: .85rem .9rem;
        cursor: pointer;
      }

      .pk-item-title{
        margin: 0;
        font-weight: 800;
        font-size: 1.05rem;
      }

      .pk-chip{
        border: 1px solid rgba(255,255,255,.18);
        color: var(--muted);
        padding: .15rem .55rem;
        border-radius: 999px;
        font-size: .85rem;
        white-space: nowrap;
      }

      .pk-item-body{
        padding: .85rem .9rem 1rem;
        border-top: 1px solid rgba(255,255,255,.10);
      }

      .pk-row{
        padding: .55rem .65rem;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.04);
        margin-bottom: .55rem;
      }

      .pk-label{
        display:inline-block;
        font-weight: 900;
        margin-right: .35rem;
        color: #ffd27a;
      }

      .pk-q{ margin: .25rem 0 .45rem; color: var(--ink); }
      .pk-a{ margin: 0; color: #c7ffda; font-weight: 700; }
      .pk-expl{ margin: .35rem 0 0; color: var(--muted); font-size: .95rem; }

      .pk-exam{
        border: 1px dashed rgba(255,255,255,.20);
        border-radius: 12px;
        padding: .85rem .9rem;
        margin-top: .6rem;
        background: rgba(0,0,0,.08);
      }

      .pk-exam-title{
        margin: 0 0 .35rem;
        font-weight: 900;
        font-size: 1.05rem;
      }

      .pk-reminder{
        margin: 0 0 .75rem;
        color: var(--muted);
      }

      .pk-task{
        margin-top: .75rem;
        padding-top: .75rem;
        border-top: 1px solid rgba(255,255,255,.10);
      }

      .pk-task h4{
        margin: 0 0 .35rem;
        font-size: 1.05rem;
      }
    `}</style>
  );
}

function KeyItem({ item }) {
  const [open, setOpen] = useState(false);

  const renderQA = (qa) =>
    qa.map((row, i) => (
      <div className="pk-row" key={`${item.id}-qa-${i}`}>
        {row.label && <span className="pk-label">{row.label}:</span>}
        <div className="pk-q">{row.prompt}</div>
        <p className="pk-a">{row.answer}</p>
        {row.explanation && <p className="pk-expl">{row.explanation}</p>}
      </div>
    ));

  const renderSamples = (samples) =>
    samples.map((s, i) => (
      <div className="pk-row" key={`${item.id}-s-${i}`}>
        {s.label && <span className="pk-label">{s.label}:</span>}
        <div className="pk-q">{s.prompt}</div>
        <p className="pk-a">{s.answer}</p>
      </div>
    ));

  const renderExams = (exams) =>
    exams.map((ex) => (
      <div className="pk-exam" key={ex.examId}>
        <p className="pk-exam-title">{ex.title}</p>
        {ex.reminder && <p className="pk-reminder">{ex.reminder}</p>}

        {ex.tasks?.map((t) => (
          <div className="pk-task" key={`${ex.examId}-t${t.taskNo}`}>
            <h4>
              Task {t.taskNo}: {t.title.replace(/^Task \d+:\s*/i, "")}
            </h4>

            {t.questions?.map((q) => (
              <div className="pk-row" key={`${ex.examId}-t${t.taskNo}-q${q.qNo}`}>
                <span className="pk-label">{q.qNo}:</span>
                <div className="pk-q">{q.prompt}</div>
                <p className="pk-a">{q.sampleAnswer}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    ));

  return (
    <div className="pk-item">
      <div className="pk-item-head" onClick={() => setOpen((v) => !v)}>
        <div>
          <p className="pk-item-title">{item.title}</p>
        </div>
        {item.type && <span className="pk-chip">{item.type}</span>}
      </div>

      {open && (
        <div className="pk-item-body">
          {item.qa?.length ? renderQA(item.qa) : null}
          {item.samples?.length ? renderSamples(item.samples) : null}
          {item.exams?.length ? renderExams(item.exams) : null}
        </div>
      )}
    </div>
  );
}

export default function SpeakingPart3Key() {
  const navigate = useNavigate();
  const sections = useMemo(() => speakingPart3Key.sections || [], []);

  return (
    <div className="packkey-page" style={{ padding: "1rem" }}>
      <Seo title="Pack Key — Speaking Part 3" />

      <PackKeyStyleScope />

      <div className="panel">
        <div className="pk-topbar">
          <div>
            <h1 className="pk-title">{speakingPart3Key.title}</h1>
            <p className="pk-subtitle">
              Language support + sample answers for Speaking Part 3 photo tasks.
              Remember: ~45 seconds per question.
            </p>
          </div>

          <button className="pk-btn" onClick={() => navigate("/pack-key")}>
            ← Back
          </button>
        </div>

        {sections.map((sec) => (
          <div className="pk-section" key={sec.sectionId}>
            <h2>{sec.title}</h2>
            {(sec.items || []).map((item) => (
              <KeyItem key={item.id} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}