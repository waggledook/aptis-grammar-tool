// src/components/vocabulary/TopicFlashcards.jsx
import React, { useMemo } from "react";
import FlashcardsPlayer from "./FlashcardsPlayer";
import { TOPIC_DATA } from "./data/vocabTopics";
import { makeVocabFavouriteId } from "./utils/vocabFavourites";

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
        favouriteId: makeVocabFavouriteId({
          topicId: topic,
          setId: set.id,
          term: p.term,
        }),
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
        logTopic={topic}
        savedModeLabel={`Saved in ${topicInfo.topicTitle || topic}`}
        title={`${topic} • Flashcards`}
        subtitle="Flip through the cards, save useful ones, and come back to your saved set anytime."
      />
    </>
  );
}
