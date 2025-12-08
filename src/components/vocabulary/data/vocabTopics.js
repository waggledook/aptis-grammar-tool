// src/components/vocabulary/data/vocabTopics.js
import { travelData } from "./travelData";
import { workData } from "./workData";
import { peopleData } from "./peopleData";
// later: import { healthData } from "./healthData"; etc.

// Single source of truth for all vocab topics
export const TOPIC_DATA = {
  travel: travelData,
  work: workData,
  people: peopleData,
  // When you add a new topic, register it here once.
  // health: healthData,
};

// Helper: total number of sets across ALL topics
export function getTotalVocabSets() {
  return Object.values(TOPIC_DATA).reduce((sum, topic) => {
    const sets = topic?.sets;
    return sum + (Array.isArray(sets) ? sets.length : 0);
  }, 0);
}
