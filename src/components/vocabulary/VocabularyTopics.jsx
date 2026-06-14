// src/components/vocabulary/VocabularyTopics.jsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopicTrainer from "./TopicTrainer";
import TopicFlashcards from "./TopicFlashcards";
import VocabMistakeReview from "./VocabMistakeReview";
import { toast } from "../../utils/toast";
import { getSitePath } from "../../siteConfig.js";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";

export default function VocabularyTopics({
  onSelect,
  onBack,
  isAuthenticated = false,
  user = null,
  aptisAccess,
  demoTopicIds = [],
  demoTopicSetIds = {},
  onSignIn,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic");
  const setFromUrl = searchParams.get("set");
  const [selectedTopic, setSelectedTopic] = React.useState(topicFromUrl || null);
  const [topicView, setTopicView] = React.useState("practice");
  const isDemoMode = !!aptisAccess?.isDemoMode;
  const demoTopicSet = React.useMemo(() => new Set(demoTopicIds), [demoTopicIds]);
  const [lockedTopic, setLockedTopic] = React.useState("");

  React.useEffect(() => {
    setSelectedTopic(topicFromUrl || null);
  }, [topicFromUrl]);

  React.useEffect(() => {
    if (!isDemoMode || !selectedTopic || demoTopicSet.has(selectedTopic)) return;
    const next = new URLSearchParams(searchParams);
    next.delete("topic");
    next.delete("set");
    setSearchParams(next);
    setSelectedTopic(null);
    setLockedTopic("That topic");
  }, [demoTopicSet, isDemoMode, searchParams, selectedTopic, setSearchParams]);

  if (topicView === "mistakes") {
    return (
      <VocabMistakeReview
        onBack={() => setTopicView("practice")}
      />
    );
  }

  if (selectedTopic && (!isDemoMode || demoTopicSet.has(selectedTopic))) {
    if (topicView === "flashcards") {
      return (
        <TopicFlashcards
          topic={selectedTopic}
          onBack={() => setTopicView("practice")}
          isAuthenticated={isAuthenticated}
        />
      );
    }

    if (topicView === "mistakes") {
      return (
        <VocabMistakeReview
          onBack={() => setTopicView("practice")}
        />
      );
    }

      return (
        <TopicTrainer
          topic={selectedTopic}
          initialSetId={setFromUrl || ""}
          user={user}
          aptisAccess={aptisAccess}
          allowedSetIds={isDemoMode ? demoTopicSetIds[selectedTopic] || [] : []}
          onSetChange={(setId) => {
            const next = new URLSearchParams(searchParams);
            next.set("topic", selectedTopic);
            if (setId) next.set("set", setId);
            else next.delete("set");
            setSearchParams(next);
          }}
          onBack={() => {
            setSearchParams({});
            setSelectedTopic(null);
            setTopicView("practice");
          }}
          isAuthenticated={isAuthenticated}
          onShowFlashcards={() => setTopicView("flashcards")}
      />
    );
  }

  const topics = [
    {
      id: "transport",
      name: "Transport",
      emoji: "🚌",
      desc: "Means of transport and getting around.",
      active: true,
      isNew: true,
    },
    {
      id: "education",
      name: "Education",
      emoji: "🏫",
      desc: "School, university, exams...",
      active: true,
      isNew: true,
    },
    {
      id: "tv_cinema",
      name: "TV & Cinema",
      emoji: "🎬",
      desc: "TV programmes, film genres, and screen vocabulary.",
      active: true,
      isNew: true,
    },
    {
      id: "travel",
      name: "Travel",
      emoji: "🧳",
      desc: "Transport, holidays, accommodation...",
      active: true,
    },
    {
      id: "work",
      name: "Work",
      emoji: "💼",
      desc: "Jobs, offices, responsibilities...",
      active: true,
    },
    {
      id: "people",
      name: "Describing people",
      emoji: "🧑‍🤝‍🧑",
      desc: "Appearance and personality vocabulary.",
      active: true,
    },
    {
      id: "relationships",
      name: "Relationships",
      emoji: "❤️",
      desc: "Family, romantic and other relationship verbs.",
      active: true,
    },
    {
      id: "health",
      name: "Health",
      emoji: "🍎",
      desc: "Exercise, medicine, healthy living...",
      active: true,
    },
    {
      id: "clothes",
      name: "Clothes & accessories",
      emoji: "👕",
      desc: "Clothing, accessories and verb phrases.",
      active: true,
    },
    {
      id: "emotions",
      name: "Describing feelings",
      emoji: "🎭",
      desc: "Adjectives and expressions for feelings and emotions.",
      active: true,
    },
    {
      id: "food",
      name: "Food",
      emoji: "🍝",
      desc: "Cooking, restaurants, ingredients...",
      active: true,
    },
    // ── Coming soon topics ───────────────────────────
    {
      id: "technology",
      name: "Technology",
      emoji: "💻",
      desc: "Computers, gadgets, the internet...",
    },
  ];  

  function renderTopicPill(topic) {
    if (!isDemoMode) return null;
    if (topic.active && demoTopicSet.has(topic.id)) {
      return <span className="topic-access-pill demo">Demo available</span>;
    }
    if (topic.active) {
      return <span className="topic-access-pill locked">Full access</span>;
    }
    return null;
  }

  return (
    <div className="vocab-topics game-wrapper">
      <header className="header">
        <h2 className="title">Topic Practice</h2>
        <p className="intro">
          Choose a topic to explore key vocabulary and practise using it in context.
        </p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {isDemoMode && lockedTopic ? (
        <div className="topic-access-prompt" role="status">
          <strong>{lockedTopic} is included with full access.</strong>
          <p>The topic demo currently includes Transport and Education.</p>
        </div>
      ) : null}

<div className="featured-cards">
  <button
    className={`card featured-card ${isDemoMode ? "locked-card" : ""}`}
    onClick={() => {
      if (isDemoMode) {
        setLockedTopic("Vocab Lab");
        return;
      }
      if (isAuthenticated) navigate("/vocabulary/lab");
      else toast("Please sign in to use Vocab Lab 🔒");
    }}
  >
    <div className="card-head" style={{ marginBottom: 8 }}>
      <h3 style={{ margin: 0 }}>
        🎯 Vocab Lab (Mixed practice)
      </h3>
      <span className="soon-pill">{isDemoMode ? "Full access" : "New"}</span>
    </div>
    <p style={{ margin: 0 }}>
      Generate a random session across topics — flashcards or test sentences.
    </p>
  </button>

  <button
    className={`card featured-card ${isDemoMode ? "locked-card" : ""}`}
    onClick={() => {
      if (isDemoMode) {
        setLockedTopic("Review mistakes");
        return;
      }
      if (isAuthenticated) setTopicView("mistakes");
      else toast("Please sign in to review saved mistakes 🔒");
    }}
  >
    <div className="card-head" style={{ marginBottom: 8 }}>
      <h3 style={{ margin: 0 }}>
        🔁 Review mistakes
      </h3>
    </div>
    <p style={{ margin: 0 }}>
      Revisit vocabulary mistakes saved across all topic sets.
    </p>
  </button>
</div>

<div className="cards">
  
        {topics.map((t) => (
          <button
            key={t.id}
            className={`card ${t.active ? "" : "soon-card"} ${isDemoMode && t.active && !demoTopicSet.has(t.id) ? "locked-card" : ""}`}
            onClick={() => {
              if (!t.active) {
                toast(`${t.name} topic coming soon 👀`);
                return;
              }
              if (isDemoMode && !demoTopicSet.has(t.id)) {
                setLockedTopic(t.name);
                return;
              }
              setSearchParams({ topic: t.id });
            }}
          >
            <div className="card-head">
              <h3>
                <span style={{ fontSize: "1.3rem" }}>{t.emoji}</span> {t.name}
              </h3>
              {renderTopicPill(t) || (t.isNew ? (
                <span className="new-pill">New</span>
              ) : !t.active ? (
                <span className="soon-pill">Coming soon</span>
              ) : null)}
            </div>
            <p>{t.desc}</p>
          </button>
        ))}
      </div>

      <button
        className="topbar-btn"
        onClick={() => navigate(getSitePath("/vocabulary"))}
        style={{ marginTop: "1rem" }}
      >
        ← Back to Vocabulary Menu
      </button>

      <style>{`
        .header { margin-bottom: 1rem; }
        .title { font-size: 1.6rem; margin-bottom: .3rem; }
        .intro { color: #a9b7d1; max-width: 640px; }

        .topic-access-prompt {
          margin: 0 0 1rem;
          padding: .8rem .95rem;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
          background:
            linear-gradient(100deg, color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-raised)), var(--color-surface-raised));
        }

        .topic-access-prompt strong {
          display: block;
          margin-bottom: .2rem;
          color: var(--color-text);
        }

        .topic-access-prompt p {
          margin: 0;
          color: var(--color-text-soft);
          line-height: 1.38;
          font-size: .9rem;
        }

        .cards {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        .featured-cards {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
          margin-bottom: 1rem;
        }
        @media (min-width: 720px) {
          .featured-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          .cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .featured-card {
          min-height: unset;
          padding: 14px 16px;
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

        .locked-card {
          opacity: .72;
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

        .new-pill {
          background: rgba(255, 196, 86, 0.14);
          border: 1px solid rgba(255, 196, 86, 0.42);
          color: #ffd36a;
          font-size: .75rem;
          line-height: 1.2;
          padding: .2rem .55rem;
          border-radius: 999px;
          font-weight: 700;
          white-space: nowrap;
        }

        .topic-access-pill {
          border-radius: 999px;
          border: 1px solid var(--color-border);
          color: var(--color-text-soft);
          font-size: .68rem;
          line-height: 1.2;
          padding: .18rem .48rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .topic-access-pill.demo {
          border-color: color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
          background: color-mix(in srgb, var(--color-accent) 16%, transparent);
          color: var(--color-accent);
        }

        .topic-access-pill.locked {
          border-color: color-mix(in srgb, #94a3b8 42%, var(--color-border));
          background: color-mix(in srgb, #94a3b8 10%, transparent);
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
