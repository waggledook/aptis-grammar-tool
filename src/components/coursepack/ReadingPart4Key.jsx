// src/components/coursepack/ReadingPart4Key.jsx

import { useMemo, useState } from "react";
import Seo from "../common/Seo";
import { readingPart4Key } from "../../data/packKey/readingPart4";

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
    `}</style>
  );
}

function KeyItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="subpanel">
      <div className="pk-head">
        <div>
          <div className="pk-meta">
            {item.id} · {item.type}
          </div>
          <h3 className="pk-itemTitle">{item.title}</h3>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="pk-btn"
          type="button"
          aria-expanded={open}
        >
          {open ? "Hide key" : "Show key"}
        </button>
      </div>

      {open && (
        <div className="pk-body">
          {item.qa.map((q) => (
            <div key={q.label} className="pk-qa">
              <div>
                <span className="pk-qLabel">{q.label}.</span>
              </div>

              <div className="pk-prompt">{q.prompt}</div>

              <div className="pk-answerRow">
                <span className="pk-answerTag">Answer:</span>
                <span className="pk-mono">{q.answer}</span>
              </div>

              {q.explanation && <div className="pk-expl">{q.explanation}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReadingPart4Key() {
  const sections = useMemo(() => readingPart4Key.sections || [], []);

  return (
    <div className="packkey-page">
      <PackKeyStyleScope />

      <Seo
        title="Reading Part 4 Key | Seif Aptis Trainer"
        description="Answer key for Reading Part 4 tasks in the Seif Aptis Trainer pack."
        canonical="https://aptis-trainer.beeskillsenglish.com/pack-key/reading-part-4"
      />

      <div className="panel" style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 className="pk-title">{readingPart4Key.title} — Key</h1>
        <p className="pk-subtitle">
          Detailed answer key for the Reading Part 4 training pages shown in the pack.
        </p>

        {sections.length === 0 ? (
          <p className="pk-sectionMeta">No key content found.</p>
        ) : (
          sections.map((section) => (
            <div key={section.sectionId}>
              <h2 className="pk-sectionTitle">{section.title}</h2>

              <p className="pk-sectionMeta">
                <span className="muted">
                  {section.items?.length ?? 0} task{(section.items?.length ?? 0) === 1 ? "" : "s"}
                </span>
              </p>

              <div className="pk-list">
                {section.items?.map((item) => (
                  <KeyItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
