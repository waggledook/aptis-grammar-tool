// src/components/ReadingMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "./common/Seo.jsx";

export default function ReadingMenu() {
  const navigate = useNavigate();
  return (
    <div className="reading-menu game-wrapper">
      <Seo
        title="Aptis Reading Practice | Seif Aptis Trainer"
        description="Practise Aptis Reading tasks, including sentence order (Part 2) and matching opinions (Part 3), plus a strategy guide for Part 2."
      />
      <header className="header">
        <h2 className="title">Reading Practice</h2>
        <p className="intro">
          Choose a Reading task. Practise individual parts of the Aptis Reading
          test, or explore the strategy guide for Part&nbsp;2.
        </p>
      </header>

      <div className="cards">
        {/* 🧩 Part 2: Sentence Order */}
        <button className="card" onClick={() => navigate("/reading/part2")}>
          <h3>Part 2: Sentence Order</h3>
          <p>Reorder sentences to form a logical paragraph.</p>
        </button>

        {/* 📘 Part 2 Guide */}
        <button className="card" onClick={() => navigate("/reading/part2-guide")}>
          <h3>Part 2 Guide: Sentence Order</h3>
          <p>Learn how to spot cohesive clues and link ideas when reordering sentences.</p>
        </button>

        {/* 🗣️ Part 3: Matching Opinions */}
        <button className="card" onClick={() => navigate("/reading/part3")}>
          <h3>Part 3: Matching Opinions</h3>
          <p>Read four short comments and decide who says what.</p>
        </button>

        {/* 🧠 Part 4: Heading Matching */}
<button className="card" onClick={() => navigate("/reading/part4")}>
  <h3>Part 4: Heading Matching</h3>
  <p>Match headings to paragraphs (one heading is extra).</p>
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
        .intro { color: #a9b7d1; max-width: 640px; }

        .cards {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }

        @media (min-width:900px){
          .cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .card {
          background: #13213b;
          border: 1px solid #2c4b83;
          border-radius: 12px;
          color: #e6f0ff;
          padding: 1rem;
          text-align: left;
          cursor: pointer;
          transition:
            transform .08s ease,
            box-shadow .08s ease,
            border-color .08s;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,.25);
          border-color: #4a79d8;
        }

        .card h3 {
          margin: 0 0 .35rem;
          font-size: 1.05rem;
          color: #e6f0ff;
          font-weight: 600;
          line-height: 1.3;
        }

        .card p {
          margin: 0;
          color: #cfd9f3;
          font-size: .9rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
