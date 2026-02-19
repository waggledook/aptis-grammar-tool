import React from "react";
import { Link } from "react-router-dom";
import Seo from "../common/Seo";

function PackKeyStyleScope() {
  return (
    <style>{`
      .packkey-page { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }

      .pk-title{
        margin: 0;
        font-size: 3.2rem;
        font-weight: 800;
        letter-spacing: .5px;
        color: #f6b73c;
        text-align: center;
      }
      .pk-subtitle{
        margin: .6rem auto 1.2rem;
        max-width: 820px;
        text-align: center;
        color: rgba(255,255,255,.85);
        font-size: 1.15rem;
        line-height: 1.45;
      }

      .panel{
        background:#13213b;
        border:1px solid #2c4b83;
        border-radius:12px;
        padding:1rem;
        color:var(--ink);
      }

      .writing-sections {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
      }

      .subpanel {
        background: #0f1b31;
        border: 1px solid #2c416f;
        border-radius: 10px;
        padding: 0.95rem 1rem;
        transition: background 0.2s ease, border-color 0.2s ease, transform .12s ease;
      }
      .subpanel:hover {
        background: #122344;
        border-color: #3c5a91;
        transform: translateY(-1px);
      }

      .pk-link{
        text-decoration: none;
        color: inherit;
        display: block;
      }

      .inner-title {
        font-size: 1.05rem;
        font-weight: 700;
        margin: 0 0 .25rem 0;
        color: #f6b73c;
      }

      .muted{ color: var(--muted); }
      .small{ font-size: .9em; }

      .pk-meta{
        display:flex;
        justify-content: space-between;
        align-items: center;
        gap: .75rem;
        margin-top: .4rem;
      }

      .pk-pill{
        display:inline-block;
        font-size:.8rem;
        padding: .22rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(246,183,60,.35);
        background: rgba(246,183,60,.08);
        color: rgba(255,255,255,.88);
        font-weight: 600;
        white-space: nowrap;
      }

      .pk-disabled{
        opacity: .55;
        pointer-events: none;
      }

      @media(min-width:900px){
        .writing-sections{
          grid-template-columns: 1fr 1fr;
        }
      }
    `}</style>
  );
}

function Tile({ to, title, desc, status, disabled }) {
  const tileBody = (
    <div className={`subpanel ${disabled ? "pk-disabled" : ""}`}>
      <h3 className="inner-title">{title}</h3>
      <div className="muted small">{desc}</div>
      <div className="pk-meta">
        <span className="pk-pill">{status}</span>
      </div>
    </div>
  );

  if (disabled) return tileBody;

  return (
    <Link className="pk-link" to={to}>
      {tileBody}
    </Link>
  );
}

export default function PackKeyLanding() {
  return (
    <div className="packkey-page">
      <PackKeyStyleScope />

      <Seo
        title="Pack Key | Seif Aptis Trainer"
        description="Answer key organised by section (modular and easy to update)."
        canonical="https://aptis-trainer.beeskillsenglish.com/pack-key"
      />

      <div className="panel" style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 className="pk-title">Pack Key</h1>
        <p className="pk-subtitle">
          Answer key organised by section (so it’s easy to update when the pack changes).
        </p>

        <div className="writing-sections">
        <Tile
  to="/pack-key/core-grammar"
  title="Core Grammar"
  desc="Answer key for Core Grammar tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

<Tile
  to="/pack-key/core-vocabulary"
  title="Core Vocabulary"
  desc="Answer key for Core Vocabulary tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

<Tile
  to="/pack-key/reading-part-1"
  title="Reading Part 1"
  desc="Answer key for Reading Part 1 tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

<Tile
  to="/pack-key/reading-part-2"
  title="Reading Part 2"
  desc="Answer key for Reading Part 2 tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

<Tile
  to="/pack-key/reading-part-3"
  title="Reading Part 3"
  desc="Answer key for Reading Part 3 tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

<Tile
  to="/pack-key/reading-part-4"
  title="Reading Part 4"
  desc="Answer key for Reading Part 4 tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

<Tile
  to="/pack-key/Speaking-part-1"
  title="Speaking Part 1"
  desc="Answer key for Speaking Part 1 tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

<Tile
  to="/pack-key/Speaking-part-2"
  title="Speaking Part 2"
  desc="Answer key for Speaking Part 2 tasks in the Seif Aptis Trainer pack."
  status="Open"
/>

        </div>
      </div>
    </div>
  );
}
