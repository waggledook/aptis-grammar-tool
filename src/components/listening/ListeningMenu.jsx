import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { toast } from "../../utils/toast";

export default function ListeningMenu() {
  const navigate = useNavigate();

  return (
    <div className="listening-menu game-wrapper">
      <Seo
        title="Aptis Listening Practice | Seif Aptis Trainer"
        description="Practise all parts of the Aptis Listening test: multiple-choice extracts, speaker matching, opinion matching and longer monologues."
      />

      <header className="header">
        <h2 className="title">Listening</h2>
        <p className="intro">
          Practise Aptis Listening Tasks parts 1 to 4.
        </p>
      </header>

      <div className="cards">
        {/* Part 1 (Coming soon) */}
        <button
  className="card soon-card"
  onClick={() => toast("Listening Part 1 coming soon 👀")}
>
  <div className="card-head">
    <h3>Part 1: Information Recognition (Q1–13)</h3>
    <span className="soon-pill">Coming soon</span>
  </div>
  <p>Multiple choice extracts.</p>
</button>


        <button className="card" onClick={() => navigate("/listening/part2")}>
            <h3>Part 2: Information Matching (Q14)</h3>
          <p>Matching speakers.</p>
        </button>

        {/* Part 3 (Active) */}
        <button className="card" onClick={() => navigate("/listening/part3")}>
          <h3>Part 3: Inference – Discussion (Q15)</h3>
          <p>Opinion matching.</p>
        </button>

        
        <button className="card" onClick={() => navigate("/listening/part4")}>
            <h3>Part 4: Inference – Longer Monologues (Q16–17)</h3>
          <p>Multiple-choice extracts.</p>
        </button>
      </div>

      {/* Back to main menu */}
      <button
        className="topbar-btn"
        onClick={() => navigate("/")}
        style={{ marginTop: "1rem" }}
      >
        ← Back to main menu
      </button>

      <style>{`
  .header { margin-bottom: 1rem; }
  .title { font-size: 1.6rem; margin-bottom: .3rem; }
  .intro { color: #a9b7d1; max-width: 600px; }

  .cards { display:grid; gap:1rem; grid-template-columns:1fr; }
  @media (min-width:720px){ .cards{ grid-template-columns: repeat(2,1fr);} }

  .card {
    background:#13213b;
    border:1px solid #2c4b83;
    border-radius:12px;
    color:#e6f0ff;
    padding:1rem;
    text-align:left;
    cursor:pointer;
    transition: transform .08s ease, box-shadow .08s ease, border-color .08s;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow:0 6px 18px rgba(0,0,0,.25);
    border-color:#4a79d8;
  }

  .card-head{
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:.6rem;
    margin-bottom:.35rem;
  }

  .card h3 { margin:0; font-size:1.05rem; font-weight:600; }
  .card p { margin:0; color:#cfd9f3; font-size:.9rem; line-height:1.4; }

  /* Coming soon: dim + dashed (CollocationMenu style) */
  .soon-card{
    opacity:.65;
    background:#1a2747;
    border:1px dashed #3a5ba0;
  }
  .soon-card:hover{
    transform:none;
    box-shadow:none;
    border-color:#3a5ba0;
  }

  .soon-pill{
    background:#24365d;
    border:1px solid #37598e;
    color:#9eb7e5;
    font-size:.75rem;
    line-height:1.2;
    padding:.2rem .5rem;
    border-radius:999px;
    font-weight:600;
    white-space:nowrap;
  }

  /* Optional: use this if you add a “Live” pill to Part 3 */
  .live-pill{
    background: rgba(46, 125, 79, 0.18);
    border: 1px solid rgba(46, 125, 79, 0.55);
    color: #8ee6b5;
    font-size: .75rem;
    line-height: 1.2;
    padding: .2rem .5rem;
    border-radius: 999px;
    font-weight: 600;
    white-space: nowrap;
  }
`}</style>
    </div>
  );
}