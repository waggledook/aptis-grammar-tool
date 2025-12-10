// src/components/vocabulary/data/vocabTopics.js
import { travelData } from "./travelData";
import { workData } from "./workData";
import { peopleData } from "./peopleData";
import { relationshipsData } from "./relationshipsData"; // 👈 NEW
import { healthData } from "./healthData";
import { clothesData } from "./clothesData";

export const TOPIC_DATA = {
  travel: travelData,
  work: workData,
  people: peopleData,
  relationships: relationshipsData, // 👈 NEW
  health: healthData, // 👈 new
  clothes: clothesData, // 👈 new
};

// Helper: total number of sets across ALL topics
export function getTotalVocabSets() {
  return Object.values(TOPIC_DATA).reduce((sum, topic) => {
    const sets = topic?.sets;
    return sum + (Array.isArray(sets) ? sets.length : 0);
  }, 0);
}
