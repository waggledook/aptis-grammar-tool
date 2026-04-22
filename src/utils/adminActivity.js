export const WRITING_GENERAL_SUBMISSION_TYPE = "writing_general_submission";
export const WRITING_GENERAL_GUEST_USER_ID = "__guest_aptis_writing_general__";
export const WRITING_GENERAL_GUEST_LABEL = "Guest (Aptis Writing General)";

export const ACTIVITY_TYPE_LABELS = {
  grammar_session: "Grammar Session",
  vocab_set_completed: "Vocabulary Set Completed",
  grammar_set_completed: "Grammar Set Completed",
  live_game_played: "Live Game Played",
  writing_submitted: "Writing Submitted",
  speaking_note_submitted: "Speaking Note Submitted",
  reading_completed: "Reading Activity",
  speaking_task_completed: "Speaking Task Completed",
  vocab_flashcards_session: "Vocabulary Flashcards",
  vocab_match_session: "Vocabulary Match",
  reading_guide_viewed: "Reading Guide Viewed",
  reading_guide_clue_reveal: "Reading Guide Clue Reveal",
  reading_guide_reorder_check: "Reading Guide Check",
  reading_guide_show_answers: "Reading Guide Answers Shown",
  reading_guide_reorder_completed: "Reading Guide Completed",
  reading_reorder_completed: "Reading Reorder Completed",
  reading_part4_attempted: "Reading Part 4 Attempt",
  reading_part4_completed: "Reading Part 4 Completed",
  reading_part3_attempted: "Reading Part 3 Attempt",
  reading_part3_completed: "Reading Part 3 Completed",
  listening_part1_attempted: "Listening Part 1 Attempt",
  listening_part1_completed: "Listening Part 1 Completed",
  listening_part2_attempted: "Listening Part 2 Attempt",
  listening_part2_completed: "Listening Part 2 Completed",
  listening_part3_attempted: "Listening Part 3 Attempt",
  listening_part3_completed: "Listening Part 3 Completed",
  listening_part4_attempted: "Listening Part 4 Attempt",
  listening_part4_completed: "Listening Part 4 Completed",
  hub_grammar_submitted: "Hub Grammar Submitted",
  hub_dictation_completed: "Hub Dictation Completed",
  hub_flashcards_started: "Hub Flashcards Started",
  hub_spanglish_started: "Hub Spanglish Started",
  hub_spanglish_review_started: "Hub Spanglish Review Started",
  hub_spanglish_completed: "Hub Spanglish Completed",
  hub_spanglish_live_hosted: "Hub Spanglish Live Hosted",
  hub_spanglish_live_started: "Hub Spanglish Live Started",
  hub_spanglish_live_finished: "Hub Spanglish Live Finished",
  hub_spanglish_live_report_viewed: "Hub Spanglish Live Report Viewed",
  hub_dependent_preps_started: "Hub Dependent Prepositions Started",
  hub_dependent_preps_review_started: "Hub Dependent Prepositions Review Loaded",
  hub_dependent_preps_completed: "Hub Dependent Prepositions Completed",
  hub_negatris_started: "Hub Negatris Started",
  hub_negatris_completed: "Hub Negatris Completed",
  hub_keyword_started: "Hub Keyword Started",
  hub_keyword_review_loaded: "Hub Keyword Review Loaded",
  hub_keyword_completed: "Hub Keyword Completed",
  hub_open_cloze_started: "Hub Open Cloze Started",
  hub_open_cloze_review_loaded: "Hub Open Cloze Review Loaded",
  hub_open_cloze_completed: "Hub Open Cloze Completed",
  hub_word_formation_started: "Hub Word Formation Started",
  hub_word_formation_review_loaded: "Hub Word Formation Review Loaded",
  hub_word_formation_completed: "Hub Word Formation Completed",
  collocation_dash_started: "Collocation Dash Started",
  collocation_dash_completed: "Collocation Dash Completed",
  synonym_trainer_started: "Synonym Trainer Started",
  synonym_trainer_review_loaded: "Synonym Trainer Review Loaded",
  synonym_trainer_completed: "Synonym Trainer Completed",
  writing_p1_guide_activity_started: "Writing Part 1 Guide Activity Started",
  writing_p4_register_guide_activity_started: "Writing Part 4 Register Guide Activity Started",
  writing_guide_viewed: "Writing Guide Viewed",
  [WRITING_GENERAL_SUBMISSION_TYPE]: "Writing General Mock Submitted",
};

function getDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function stripHtmlToText(html = "") {
  if (typeof document === "undefined") {
    return String(html).replace(/<[^>]*>/g, " ");
  }

  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
}

function countWords(text = "") {
  const matches = String(text).trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function getWordCountFromHtml(html = "") {
  return countWords(stripHtmlToText(html));
}

function getNonEmptyCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.filter((item) => stripHtmlToText(item).trim()).length;
}

export function buildWritingGeneralSubmissionActivity(docSnap) {
  const data = docSnap.data() || {};
  const createdAt = getDate(data.createdAt);
  if (!createdAt) return null;

  const answers = data.answers || {};
  const part1Answers = Array.isArray(answers[1]) ? answers[1] : [];
  const part2Answer = typeof answers[2] === "string" ? answers[2] : "";
  const part3Answers = Array.isArray(answers[3]) ? answers[3] : [];
  const part4Answers = Array.isArray(answers[4]) ? answers[4] : [];

  const part1Answered = getNonEmptyCount(part1Answers);
  const part2Words = getWordCountFromHtml(part2Answer);
  const part3WordCounts = part3Answers.map((answer) => getWordCountFromHtml(answer));
  const part4WordCounts = part4Answers.map((answer) => getWordCountFromHtml(answer));
  const part3Answered = part3WordCounts.filter(Boolean).length;
  const part4Answered = part4WordCounts.filter(Boolean).length;
  const attemptedParts = [
    part1Answered > 0,
    part2Words > 0,
    part3Answered > 0,
    part4Answered > 0,
  ].filter(Boolean).length;
  const totalWords =
    part1Answers.reduce((sum, answer) => sum + getWordCountFromHtml(answer), 0) +
    part2Words +
    part3WordCounts.reduce((sum, count) => sum + count, 0) +
    part4WordCounts.reduce((sum, count) => sum + count, 0);

  return {
    id: `submission:${docSnap.id}`,
    userId: WRITING_GENERAL_GUEST_USER_ID,
    userEmail: WRITING_GENERAL_GUEST_LABEL,
    type: WRITING_GENERAL_SUBMISSION_TYPE,
    details: {
      submissionId: docSnap.id,
      attemptedParts,
      totalWords,
      part1Answered,
      part2Words,
      part3WordCounts,
      part4WordCounts,
      sourceCollection: "submissions",
    },
    createdAt,
  };
}

export function sortActivitiesByDateDesc(a, b) {
  return b.createdAt.getTime() - a.createdAt.getTime();
}

function titleCaseFromSnakeCase(value = "") {
  return String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCount(value, noun) {
  return `${value ?? "?"} ${noun}${value === 1 ? "" : "s"}`;
}

function joinParts(parts) {
  return parts.filter(Boolean).join(" · ");
}

function formatScore(score, total) {
  return `${score ?? "?"}/${total ?? "?"}`;
}

function formatUnknownDetails(details) {
  const entries = Object.entries(details || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const label = titleCaseFromSnakeCase(key);
      const text = Array.isArray(value) ? value.join(", ") : String(value);
      return `${label}: ${text}`;
    });

  return entries.length ? entries.join(" · ") : "No details";
}

export function getActivityTypeLabel(type) {
  return ACTIVITY_TYPE_LABELS[type] || titleCaseFromSnakeCase(type || "unknown_event");
}

export function getActivityTypeOptions() {
  return Object.entries(ACTIVITY_TYPE_LABELS)
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function formatActivityDetails(log) {
  const d = log.details || {};

  switch (log.type) {
    case "grammar_session": {
      const modeLabel = d.mode === "test" ? "Test mode" : "Practice";
      return joinParts([modeLabel, formatCount(d.totalItems, "item")]);
    }
    case "vocab_set_completed": {
      const stats =
        typeof d.correctFirstTry === "number" || typeof d.mistakesCount === "number"
          ? `First try ${d.correctFirstTry ?? "?"}, mistakes ${d.mistakesCount ?? "?"}`
          : "";
      return joinParts([
        d.topic || "Unknown topic",
        d.setId || "",
        d.mode || "review",
        formatCount(d.totalItems, "item"),
        stats,
      ]);
    }
    case "speaking_task_completed": {
      const partLabels = {
        part1: "Part 1 short answers",
        part2: "Part 2 photo description",
        part3: "Part 3 comparing photos",
        part4: "Part 4 long turn",
      };
      const qCount =
        typeof d.questionCount === "number"
          ? d.questionCount
          : Array.isArray(d.questionIds)
          ? d.questionIds.length
          : null;
      return joinParts([partLabels[d.part] || d.part || "Speaking", d.taskId || "", formatCount(qCount, "question")]);
    }
    case "speaking_note_submitted": {
      const guideLabels = {
        photoGuide_speculation: "Photo guide speculation",
        part3_similarities: "Part 3 similarities guide",
      };
      return joinParts([
        guideLabels[d.guideId] || d.guideId || "Speaking guide",
        d.photoKey || "",
        typeof d.chars === "number" ? `${d.chars} chars` : "",
        typeof d.lines === "number" ? formatCount(d.lines, "line") : "",
      ]);
    }
    case "vocab_flashcards_session":
      return joinParts([d.topic || "Unknown topic", "Flashcards", formatCount(d.totalCards, "card"), d.isAuthenticated ? "Signed in" : "Guest"]);
    case "vocab_match_session":
      return joinParts([d.topic || "Unknown topic", d.setId || "", "Match", formatCount(d.totalPairs, "pair")]);
    case "reading_guide_viewed":
      return d.guideId || "Reading guide";
    case "reading_guide_clue_reveal":
      return joinParts([d.taskId || "Task", "Clue revealed"]);
    case "reading_guide_reorder_check":
      return joinParts([d.taskId || "Task", d.correct ? "Correct" : "Not correct yet"]);
    case "reading_guide_show_answers":
      return joinParts([d.taskId || "Task", "Answers shown"]);
    case "reading_guide_reorder_completed":
    case "reading_reorder_completed":
      return joinParts([d.taskId || "Task", "Completed"]);
    case "reading_part4_attempted":
    case "reading_part3_attempted":
      return joinParts([d.taskId || "Task", `Score ${formatScore(d.score, d.total)}`]);
    case "reading_part4_completed":
    case "reading_part3_completed":
      return joinParts([d.taskId || "Task", "Completed"]);
    case "listening_part1_attempted":
    case "listening_part2_attempted":
    case "listening_part3_attempted":
    case "listening_part4_attempted":
      return joinParts([d.taskId || "Task", `Score ${formatScore(d.score, d.total)}`, typeof d.playsUsed === "number" ? `Listens ${d.playsUsed}/2` : ""]);
    case "listening_part1_completed":
    case "listening_part2_completed":
    case "listening_part3_completed":
    case "listening_part4_completed":
      return joinParts([d.taskId || "Task", "Completed", typeof d.playsUsed === "number" ? `Listens ${d.playsUsed}/2` : ""]);
    case "hub_grammar_submitted":
      return joinParts([d.activityTitle || d.activityId || "Grammar activity", `${d.score ?? "?"}%`, `Correct ${formatScore(d.correct, d.total)}`]);
    case "hub_dictation_completed":
      return joinParts([d.mode || "game", d.setLabel || d.setId || "All sentences", `Score ${d.score ?? "?"}`, `Completed ${formatScore(d.completed, d.totalPlayed)}`]);
    case "hub_flashcards_started":
      return joinParts([d.mode || "deck", d.deckTitle || d.deckId || "Flashcards", formatCount(d.total, "card")]);
    case "hub_spanglish_started":
      return joinParts([d.mode || "normal", formatCount(d.totalItems, "item")]);
    case "hub_spanglish_review_started":
      return joinParts([d.mode || "review", formatCount(d.total, "item")]);
    case "hub_spanglish_completed":
      return joinParts([`${d.score ?? "?"} pts`, `Saved for review ${d.wrongAnswers ?? "?"}`, formatCount(d.totalItems, "item")]);
    case "hub_spanglish_live_hosted":
      return joinParts([`PIN ${d.pin ?? "?"}`, formatCount(d.roundCount, "round")]);
    case "hub_spanglish_live_started":
      return joinParts([`PIN ${d.pin ?? "?"}`, formatCount(d.playerCount, "player"), formatCount(d.roundCount, "round")]);
    case "hub_spanglish_live_finished":
      return joinParts([`PIN ${d.pin ?? "?"}`, formatCount(d.playerCount, "player"), `Rounds ${d.completedRounds ?? d.roundCount ?? "?"}/${d.roundCount ?? "?"}`]);
    case "hub_spanglish_live_report_viewed":
      return joinParts([`PIN ${d.pin ?? "?"}`, formatCount(d.playerCount, "player")]);
    case "hub_dependent_preps_started":
      return joinParts([d.level || d.levelId || "Level", `${d.roundSeconds ?? "?"}s rounds`, `Pool ${d.totalItems ?? "?"}`]);
    case "hub_dependent_preps_review_started":
      return joinParts([d.level || d.levelId || "Level", formatCount(d.total, "item")]);
    case "hub_dependent_preps_completed":
      return joinParts([d.level || d.levelId || "Level", `${d.score ?? "?"} pts`, `Correct ${formatScore(d.correct, d.attempted)}`]);
    case "hub_negatris_started":
      return joinParts([`Lives ${d.startingLives ?? "?"}`, `Extra life every ${d.extraLifeStreak ?? "?"}`]);
    case "hub_negatris_completed":
      return joinParts([`Score ${d.score ?? "?"}`, `Mistakes ${d.mistakes ?? "?"}`, `Streak ${d.streak ?? "?"}`, `Lives left ${d.livesRemaining ?? "?"}`]);
    case "hub_keyword_started":
    case "hub_open_cloze_started":
    case "hub_word_formation_started":
      return joinParts([d.mode || "normal", `Pool ${d.poolSize ?? "?"}`, `Set ${d.total ?? "?"}`]);
    case "hub_keyword_review_loaded":
    case "hub_open_cloze_review_loaded":
    case "hub_word_formation_review_loaded":
      return joinParts([d.mode || "review", formatCount(d.total, "item")]);
    case "hub_keyword_completed":
    case "hub_open_cloze_completed":
    case "hub_word_formation_completed":
      return joinParts([d.mode || "normal", `Correct ${formatScore(d.correct, d.total)}`]);
    case "collocation_dash_started":
      return joinParts([formatCount(d.roundsPlanned, "round"), `${d.roundSeconds ?? "?"}s`]);
    case "collocation_dash_completed":
      return joinParts([`${d.score ?? "?"} pts`, `Round ${d.roundsReached ?? "?"}`, `Review ${d.reviewCount ?? "?"}`]);
    case "synonym_trainer_started":
      return joinParts([
        d.practiceMode || "learn",
        d.mode || "normal",
        d.examPartOfSpeech || d.partOfSpeech || "",
        d.topic || "",
        d.maxAmbiguity ? `Ambiguity ${d.maxAmbiguity}` : "",
        `Pool ${d.poolSize ?? "?"}`,
        `Set ${d.total ?? "?"}`,
      ]);
    case "synonym_trainer_review_loaded":
      return joinParts([d.mode || "review", formatCount(d.total, "item")]);
    case "synonym_trainer_completed":
      return joinParts([
        d.practiceMode || "learn",
        d.mode || "normal",
        d.partOfSpeech || "",
        d.topic || "",
        d.maxAmbiguity ? `Ambiguity ${d.maxAmbiguity}` : "",
        `Correct ${formatScore(d.correct, d.total)}`,
      ]);
    case "writing_submitted": {
      const partLabels = {
        part1: "Part 1 short answers",
        part2: "Part 2 form",
        part3: "Part 3 chat",
        part4: "Part 4 emails",
      };
      if (d.part === "part1") return joinParts([partLabels.part1, formatCount(d.totalItems, "item")]);
      if (d.part === "part2") return joinParts([partLabels.part2, d.taskId || "", `${d.wordCount ?? "?"} words`]);
      if (d.part === "part3") {
        const total = d.totalWords ?? (Array.isArray(d.wordCounts) ? d.wordCounts.reduce((a, b) => a + b, 0) : "?");
        return joinParts([partLabels.part3, d.taskId || "", `${total} words`]);
      }
      if (d.part === "part4") {
        const friend = d.counts?.friend ?? "?";
        const formal = d.counts?.formal ?? "?";
        const total = d.totalWords ?? `${friend}+${formal}`;
        return joinParts([partLabels.part4, d.taskId || "", `${total} words`, `Friend ${friend}`, `Formal ${formal}`]);
      }
      return partLabels[d.part] || d.part || "Writing";
    }
    case "writing_p1_guide_activity_started":
      return joinParts([
        d.guideId === "writing_p1_guide" ? "Part 1 guide" : d.guideId || "Guide",
        "Started",
        d.activity === "trim_it" ? "Trim It" : d.activity === "improve_answer" ? "Improve the answer" : d.activity || "Activity",
      ]);
    case "writing_guide_viewed":
      return joinParts([d.part ? `Part ${String(d.part).replace("part", "")}` : "Writing", "Guide"]);
    case "writing_p4_register_guide_activity_started":
      return joinParts([
        "Part 4 register guide",
        "Started",
        d.activity === "formal_informal_quiz"
          ? "Formal vs Informal quiz"
          : d.activity === "tone_transformation"
          ? "Tone transformation"
          : d.activity || "Activity",
      ]);
    case WRITING_GENERAL_SUBMISSION_TYPE: {
      const part3Total = Array.isArray(d.part3WordCounts) ? d.part3WordCounts.reduce((sum, count) => sum + count, 0) : 0;
      const part4Total = Array.isArray(d.part4WordCounts) ? d.part4WordCounts.reduce((sum, count) => sum + count, 0) : 0;
      return joinParts([
        "Guest mock test",
        `Parts ${d.attemptedParts ?? "?"}/4`,
        `${d.totalWords ?? "?"} words`,
        `P1 ${d.part1Answered ?? 0}/5`,
        `P2 ${d.part2Words ?? 0}`,
        `P3 ${part3Total}`,
        `P4 ${part4Total}`,
      ]);
    }
    default:
      return formatUnknownDetails(d);
  }
}
