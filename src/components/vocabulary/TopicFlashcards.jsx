// src/components/vocabulary/TopicFlashcards.jsx
import React, { useMemo } from "react";
import FlashcardsPlayer from "./FlashcardsPlayer";

import { travelData } from "./data/travelData";
import { workData } from "./data/workData";
import { peopleData } from "./data/peopleData";
import { relationshipsData } from "./data/relationshipsData";
import { healthData } from "./data/healthData";
import { clothesData } from "./data/clothesData";
import { emotionsData } from "./data/emotionsData";
import { foodData } from "./data/foodData";

const TOPIC_DATA = {
  travel: travelData,
  work: workData,
  people: peopleData,
  relationships: relationshipsData,
  health: healthData,
  clothes: clothesData,
  emotions: emotionsData,
  food: foodData,
};

export default function TopicFlashcards({ topic, onBack, isAuthenticated = false }) {
  const topicInfo = TOPIC_DATA[topic] || null;

  if (!topicInfo) {
    return (
      <div className="topic-trainer game-wrapper">
        <header className="header">
          <h2 className="title">Topic not found</h2>
          <p className="intro">No flashcards available for this topic yet.</p>
        </header>

        <button className="topbar-btn" onClick={onBack}>
          ← Back to Topics
        </button>
      </div>
    );
  }

  const allowedSets = useMemo(() => {
    const sets = topicInfo.sets || [];
    if (!isAuthenticated && sets.length > 2) return sets.slice(0, 2);
    return sets;
  }, [topicInfo, isAuthenticated]);

  const fullDeck = useMemo(() => {
    return allowedSets.flatMap((set) =>
      (set.pairs || []).map((p) => ({
        key: `${set.id}::${p.term}`, // keep existing key format
        term: p.term,
        definition: p.definition,
        image: p.image,
        setTitle: set.title,
      }))
    );
  }, [allowedSets]);

  return (
    <>
      {!isAuthenticated && topicInfo.sets.length > 2 && (
        <p className="locked-note">
          You&apos;re seeing flashcards from the first <strong>two sets</strong>.
          Sign in to unlock all sets in this topic.
        </p>
      )}

      <FlashcardsPlayer
        items={fullDeck}
        onBack={onBack}
        isAuthenticated={isAuthenticated}
        storageKey={`vocabFlashcards_${topic}`}
        logTopic={topic}
        title={`${topic} • Flashcards`}
        subtitle="Flip each card to check the answer. Mark whether you knew it or not, then review only the unknown cards."
      />
    </>
  );
}