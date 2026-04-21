// src/components/vocabulary/data/vocabTopics.js
import { travelData } from "./travelData";
import { workData } from "./workData";
import { peopleData } from "./peopleData";
import { relationshipsData } from "./relationshipsData"; // 👈 NEW
import { healthData } from "./healthData";
import { clothesData } from "./clothesData";
import { emotionsData } from "./emotionsData";
import { foodData } from "./foodData";
import { educationData } from "./educationData";
import { tvCinemaData } from "./tvCinemaData";
import { transportData } from "./transportData";

export const TOPIC_DATA = {
  travel: travelData,
  work: workData,
  people: peopleData,
  relationships: relationshipsData, // 👈 NEW
  health: healthData, // 👈 new
  clothes: clothesData, // 👈 new
  emotions: emotionsData, // 👈 new
  food: foodData, // 👈 new
  education: educationData,
  tv_cinema: tvCinemaData,
  transport: transportData,
};

// Helper: total number of sets across ALL topics
export function getTotalVocabSets() {
  return Object.values(TOPIC_DATA).reduce((sum, topic) => {
    const sets = topic?.sets;
    return sum + (Array.isArray(sets) ? sets.length : 0);
  }, 0);
}

export function getTopicSetIds(topicId) {
  const topic = TOPIC_DATA?.[topicId];
  if (!Array.isArray(topic?.sets)) return [];
  return topic.sets.map((set, idx) => set?.id || String(idx)).filter(Boolean);
}
