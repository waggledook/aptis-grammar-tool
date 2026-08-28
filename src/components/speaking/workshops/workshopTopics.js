import relationshipsFamilySource from "./content/relationships-family.md?raw";
import travelTransportSource from "./content/travel-transport.md?raw";

const PHOTO_ASSETS = {
  "relationships-family": {
    part2: [
      "/images/speaking/workshops/relationships-family/part2_task01_eating_together.webp",
      "/images/speaking/workshops/relationships-family/part2_task02_meeting_friends.webp",
      "/images/speaking/workshops/relationships-family/part2_task03_celebrating_together.webp",
      "/images/speaking/workshops/relationships-family/part2_task04_different_generations.webp",
      "/images/speaking/workshops/relationships-family/part2_task05_keeping_in_touch.webp",
      "/images/speaking/workshops/relationships-family/part2_task06_helping_someone.webp",
      "/images/speaking/workshops/relationships-family/part2_task07_shared_activities.webp",
      "/images/speaking/workshops/relationships-family/part2_task08_meeting_new_people.webp",
    ],
    part3: [
      [
        "/images/speaking/workshops/relationships-family/part3_task01A_family_eating_at_home.webp",
        "/images/speaking/workshops/relationships-family/part3_task01B_friends_eating_in_cafe.webp",
      ],
      [
        "/images/speaking/workshops/relationships-family/part3_task02A_different_generations.webp",
        "/images/speaking/workshops/relationships-family/part3_task02B_young_friends.webp",
      ],
      [
        "/images/speaking/workshops/relationships-family/part3_task03A_face_to_face_conversation.webp",
        "/images/speaking/workshops/relationships-family/part3_task03B_video_call.webp",
      ],
      [
        "/images/speaking/workshops/relationships-family/part3_task04A_small_home_gathering.webp",
        "/images/speaking/workshops/relationships-family/part3_task04B_large_celebration.webp",
      ],
      [
        "/images/speaking/workshops/relationships-family/part3_task05A_shared_activity.webp",
        "/images/speaking/workshops/relationships-family/part3_task05B_together_but_separate.webp",
      ],
      [
        "/images/speaking/workshops/relationships-family/part3_task06A_longstanding_friends.webp",
        "/images/speaking/workshops/relationships-family/part3_task06B_meeting_new_people.webp",
      ],
      [
        "/images/speaking/workshops/relationships-family/part3_task07A_friends_helping_move.webp",
        "/images/speaking/workshops/relationships-family/part3_task07B_family_helping_with_groceries.webp",
      ],
      [
        "/images/speaking/workshops/relationships-family/part3_task08A_living_with_others.webp",
        "/images/speaking/workshops/relationships-family/part3_task08B_living_alone.webp",
      ],
    ],
  },
  "travel-transport": {
    part2: [
      "/images/speaking/workshops/travel-transport/part2_task01_travelling_by_train.webp",
      "/images/speaking/workshops/travel-transport/part2_task02_busy_journey.webp",
      "/images/speaking/workshops/travel-transport/part2_task03_cycling.webp",
      "/images/speaking/workshops/travel-transport/part2_task04_travelling_by_plane.webp",
      "/images/speaking/workshops/travel-transport/part2_task05_road_trip.webp",
      "/images/speaking/workshops/travel-transport/part2_task06_visiting_a_new_place.webp",
      "/images/speaking/workshops/travel-transport/part2_task07_waiting_for_transport.webp",
      "/images/speaking/workshops/travel-transport/part2_task08_travelling_on_foot.webp",
    ],
    part3: [
      [
        "/images/speaking/workshops/travel-transport/part3_task01A_public_transport.webp",
        "/images/speaking/workshops/travel-transport/part3_task01B_private_car.webp",
      ],
      [
        "/images/speaking/workshops/travel-transport/part3_task02A_train_journey.webp",
        "/images/speaking/workshops/travel-transport/part3_task02B_plane_journey.webp",
      ],
      [
        "/images/speaking/workshops/travel-transport/part3_task03A_cycling_in_city.webp",
        "/images/speaking/workshops/travel-transport/part3_task03B_driving_in_traffic.webp",
      ],
      [
        "/images/speaking/workshops/travel-transport/part3_task04A_travelling_alone.webp",
        "/images/speaking/workshops/travel-transport/part3_task04B_travelling_together.webp",
      ],
      [
        "/images/speaking/workshops/travel-transport/part3_task05A_city_journey.webp",
        "/images/speaking/workshops/travel-transport/part3_task05B_countryside_journey.webp",
      ],
      [
        "/images/speaking/workshops/travel-transport/part3_task06A_cycling_everyday_journey.webp",
        "/images/speaking/workshops/travel-transport/part3_task06B_walking_everyday_journey.webp",
      ],
      [
        "/images/speaking/workshops/travel-transport/part3_task07A_traditional_transport.webp",
        "/images/speaking/workshops/travel-transport/part3_task07B_modern_transport.webp",
      ],
      [
        "/images/speaking/workshops/travel-transport/part3_task08A_tourist_journey.webp",
        "/images/speaking/workshops/travel-transport/part3_task08B_everyday_commute.webp",
      ],
    ],
  },
};

const TOPIC_META = {
  "relationships-family": {
    title: "Relationships & Family",
    summary: "Friends, family life, keeping in touch, shared experiences and support.",
    accent: "coral",
  },
  "travel-transport": {
    title: "Travel & Transport",
    summary: "Journeys, transport choices, travel experiences and getting around.",
    accent: "sky",
  },
};

function cleanInline(value = "") {
  return value.replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

function parseTopicSource(id, source) {
  const parts = { 1: { questions: [] }, 2: { tasks: [] }, 3: { tasks: [] }, 4: { tasks: [] } };
  let currentPart = 0;
  let currentTask = null;

  source.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    const partMatch = line.match(/^#{1,2}\s+Part\s+([1-4])\b/i);
    if (partMatch) {
      currentPart = Number(partMatch[1]);
      currentTask = null;
      return;
    }

    const taskMatch = line.match(/^##\s+Task\s+(\d+)\s+[—-]\s+(.+)$/i);
    if (taskMatch && currentPart >= 2) {
      const taskNumber = Number(taskMatch[1]);
      currentTask = {
        id: `${id}-p${currentPart}-${taskNumber}`,
        title: cleanInline(taskMatch[2]),
        questions: [],
        photoBriefs: [],
      };
      parts[currentPart].tasks.push(currentTask);
      return;
    }

    const photoMatch = line.match(/^\*\*Photo(?:\s+([AB]))?:\*\*\s*(.+)$/i);
    if (photoMatch && currentTask) {
      currentTask.photoBriefs.push({ label: photoMatch[1] || "", text: cleanInline(photoMatch[2]) });
      return;
    }

    const questionMatch = line.match(/^\d+\.\s+(.+)$/);
    if (!questionMatch || !currentPart) return;
    const question = cleanInline(questionMatch[1]);
    if (currentPart === 1) {
      parts[1].questions.push({
        id: `${id}-p1-${parts[1].questions.length + 1}`,
        text: question,
      });
    } else if (currentTask) {
      currentTask.questions.push(question);
    }
  });

  const assets = PHOTO_ASSETS[id];
  parts[2].tasks = parts[2].tasks.map((task, index) => ({
    ...task,
    image: assets.part2[index],
    alt: task.photoBriefs[0]?.text || task.title,
    photoFeedback: {
      scene: task.photoBriefs[0]?.text || task.title,
      keyDetails: [],
      usefulLanguage: [],
    },
    questions: task.questions.slice(1),
    allQuestions: task.questions,
  }));
  parts[3].tasks = parts[3].tasks.map((task, index) => ({
    ...task,
    photoA: { src: assets.part3[index]?.[0], alt: task.photoBriefs[0]?.text || "Photograph A" },
    photoB: { src: assets.part3[index]?.[1], alt: task.photoBriefs[1]?.text || "Photograph B" },
    questions: task.questions.slice(1),
    allQuestions: task.questions,
  }));
  parts[4].tasks = parts[4].tasks.map((task) => ({ ...task, qs: task.questions }));

  return {
    id,
    ...TOPIC_META[id],
    parts,
    counts: {
      1: parts[1].questions.length,
      2: parts[2].tasks.length,
      3: parts[3].tasks.length,
      4: parts[4].tasks.length,
    },
  };
}

export const SPEAKING_WORKSHOP_TOPICS = [
  parseTopicSource("relationships-family", relationshipsFamilySource),
  parseTopicSource("travel-transport", travelTransportSource),
];

export function getSpeakingWorkshopTopic(topicId) {
  return SPEAKING_WORKSHOP_TOPICS.find((topic) => topic.id === topicId) || null;
}

export const SPEAKING_PART_META = {
  1: { title: "Personal questions", shortTitle: "Part 1", timing: "30 seconds per answer", seconds: 30 },
  2: { title: "One photograph", shortTitle: "Part 2", timing: "45 seconds per answer", seconds: 45 },
  3: { title: "Two photographs", shortTitle: "Part 3", timing: "45 seconds per answer", seconds: 45 },
  4: { title: "Extended response", shortTitle: "Part 4", timing: "1 minute preparation + 2 minutes speaking", seconds: 120 },
};
