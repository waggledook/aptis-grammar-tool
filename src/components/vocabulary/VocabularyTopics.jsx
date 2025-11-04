// src/components/vocabulary/VocabularyTopics.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TopicTrainer from "./TopicTrainer";
import TopicFlashcards from "./TopicFlashcards";
import { toast } from "../../utils/toast";
import UnderConstructionPanel from "../common/UnderConstructionPanel";

export default function VocabularyTopics({
  onSelect,
  onBack,
  isAuthenticated = false,
}) {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = React.useState(null);
  const [topicView, setTopicView] = React.useState("practice");

  if (selectedTopic) {
    if (topicView === "flashcards") {
      return (
        <TopicFlashcards
          topic={selectedTopic}
          onBack={() => setTopicView("practice")}
          isAuthenticated={isAuthenticated}
        />
      );
    }

    return (
      <TopicTrainer
        topic={selectedTopic}
        onBack={() => {
          setSelectedTopic(null);
          setTopicView("practice");
        }}
        isAuthenticated={isAuthenticated}
        onShowFlashcards={() => setTopicView("flashcards")}
      />
    );
  }

  const topics = [
    { id: "travel", name: "Travel", emoji: "🧳", desc: "Transport, holidays, accommodation...", active: true },
    { id: "work",   name: "Work",   emoji: "💼", desc: "Jobs, offices, responsibilities...",  active: true }, // 👈 now active
    { id: "education", name: "Education", emoji: "🏫", desc: "School, university, exams..." },
    { id: "health", name: "Health", emoji: "🍎", desc: "Exercise, medicine, healthy living..." },
    { id: "technology", name: "Technology", emoji: "💻", desc: "Computers, gadgets, the internet..." },
    { id: "food", name: "Food", emoji: "🍝", desc: "Cooking, restaurants, ingredients..." },
  ];

  return (
    <div className="vocab-topics game-wrapper">
      <header className="header">
        <h2 className="title">Topic Practice</h2>
        <p className="intro">
          Choose a topic to explore key vocabulary and practise using it in context.
        </p>
      </header>

      <UnderConstructionPanel
        title="Topic practice in progress"
        message="Right now the Travel and Work topics are available. More topics (Education, Health, etc.) are on the way!"
      />

      <div className="cards">
        {topics.map((t) => (
          <button
            key={t.id}
            className={`card ${t.active ? "" : "soon-card"}`}
            onClick={() =>
              t.active
                ? setSelectedTopic(t.id)
                : toast(`${t.name} topic coming soon 👀`)
            }
          >
            <div className="card-head">
              <h3>
                <span style={{ fontSize: "1.3rem" }}>{t.emoji}</span> {t.name}
              </h3>
              {!t.active && <span className="soon-pill">Coming soon</span>}
            </div>
            <p>{t.desc}</p>
          </button>
        ))}
      </div>

      <button
        className="topbar-btn"
        onClick={() => navigate("/vocabulary")}
        style={{ marginTop: "1rem" }}
      >
        ← Back to Vocabulary Menu
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
        @media (min-width: 720px) {
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
          transition: transform .08s ease, box-shadow .08s ease, border-color .08s;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, .25);
          border-color: #4a79d8;
        }

        .soon-card {
          opacity: 0.65;
          cursor: pointer;
          background: #1a2747;
          border: 1px dashed #3a5ba0;
        }
        .soon-card:hover {
          transform: none;
          box-shadow: none;
          border-color: #3a5ba0;
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: .35rem;
        }

        .soon-pill {
          background: #24365d;
          border: 1px solid #37598e;
          color: #9eb7e5;
          font-size: .75rem;
          line-height: 1.2;
          padding: .2rem .5rem;
          border-radius: 999px;
          font-weight: 600;
          white-space: nowrap;
        }

        .card h3 {
          margin: 0;
          font-size: 1.05rem;
          color: #e6f0ff;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: .4rem;
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
