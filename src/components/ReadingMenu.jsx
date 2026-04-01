// src/components/ReadingMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "./common/Seo.jsx";

const GUIDE_CARDS = [
  {
    title: "Part 2 Guide: Sentence Order",
    description: "Learn how to spot cohesive clues and link ideas when reordering sentences.",
    path: "/reading/part2-guide",
  },
];

const PRACTICE_CARDS = [
  {
    title: "Part 2: Sentence Order",
    description: "Reorder sentences to form a logical paragraph.",
    path: "/reading/part2",
  },
  {
    title: "Part 3: Matching Opinions",
    description: "Read four short comments and decide who says what.",
    path: "/reading/part3",
  },
  {
    title: "Part 4: Heading Matching",
    description: "Match headings to paragraphs. One heading is extra.",
    path: "/reading/part4",
  },
];

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
          Practise individual parts of the Aptis Reading test, or use the guide when you want support with sentence order.
        </p>
      </header>

      <section className="menu-section guides">
        <div className="section-header">
          <h3>Guide</h3>
          <p>Get support with the main strategy guide currently available in reading.</p>
        </div>
        <div className="cards guide-cards">
          {GUIDE_CARDS.map((card) => (
            <button className="card guide-card" key={card.path} onClick={() => navigate(card.path)}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="menu-section practice">
        <div className="section-header">
          <h3>Exam Practice</h3>
          <p>Practise the reading parts directly in exam-style tasks.</p>
        </div>
        <div className="cards">
          {PRACTICE_CARDS.map((card) => (
            <button className="card practice-card" key={card.path} onClick={() => navigate(card.path)}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </button>
          ))}
        </div>
      </section>

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

        .menu-section {
          margin-top: 1.2rem;
        }

        .section-header {
          margin-bottom: .85rem;
        }

        .section-header h3 {
          margin: 0 0 .25rem;
          color: #e6f0ff;
        }

        .section-header p {
          margin: 0;
          color: #a9b7d1;
          max-width: 680px;
        }

        .cards {
          display:grid;
          gap:1rem;
          grid-template-columns:1fr;
        }

        @media (min-width:720px){
          .cards {
            grid-template-columns: repeat(2,1fr);
          }
        }

        .guide-cards {
          grid-template-columns: 1fr;
        }

        @media (min-width:720px){
          .guide-cards {
            grid-template-columns: minmax(280px, 420px);
          }
        }

        .card {
          background:#13213b;
          border:1px solid #2c4b83;
          border-radius:12px;
          color:#e6f0ff;
          padding:1rem;
          text-align:left;
          cursor:pointer;
          transition: transform .08s ease, box-shadow .08s ease, border-color .08s, background .08s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow:0 6px 18px rgba(0,0,0,.25);
        }

        .card h3 {
          margin:0 0 .35rem;
          display:flex;
          align-items:center;
          flex-wrap:wrap;
          gap:.35rem;
        }

        .card p {
          margin:0;
          color:#cfd9f3;
        }

        .guide-card {
          background: linear-gradient(180deg, #13213b 0%, #122846 100%);
          border-color: #3d5f99;
        }

        .guide-card:hover {
          border-color: #5f83c0;
        }

        .practice-card {
          background: linear-gradient(180deg, #172440 0%, #13213b 100%);
          border-color: rgba(255, 207, 64, 0.48);
        }

        .practice-card:hover {
          border-color: rgba(255, 207, 64, 0.82);
        }
      `}</style>
    </div>
  );
}
