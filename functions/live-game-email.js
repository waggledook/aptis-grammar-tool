/* eslint-disable no-undef */

const SITES = {
  aptis: {label: "Seif Aptis Trainer", origin: "https://aptis-trainer.beeskillsenglish.com"},
  seifhub: {label: "Seif Hub", origin: "https://seifhub.beeskillsenglish.com"},
  ote: {label: "OTE Seif", origin: "https://ote-seif.beeskillsenglish.com"},
};

// Match the game types and host routes in src/api/liveGames.js and src/App.jsx.
const ACTIVITY_TYPES = {
  grammar: ["Grammar quiz", "aptis", "/live/host/"],
  vocab: ["Vocabulary quiz", "aptis", "/live/host/"],
  "textbook-vocabulary-live": ["Textbook Vocabulary Quiz", "seifhub", "/live/textbook-vocabulary/host/"],
  "collocation-team": ["Collocation Team Challenge", "aptis", "/live/collocations/host/"],
  spanglish_fixit: ["Spanglish Fix-It", "seifhub", "/games/spanglish-fix-it/host/"],
  "aptis-reading-part1-teacher": ["Aptis Reading Part 1", "aptis", "/live/aptis-reading-part1/host/"],
  "aptis-reading-part2-teacher": ["Aptis Reading Part 2", "aptis", "/live/aptis-reading-part2/host/"],
  "aptis-reading-part3-live": ["Aptis Reading Part 3", "aptis", "/live/aptis-reading-part3/host/"],
  "aptis-reading-part4-live": ["Aptis Reading Part 4", "aptis", "/live/aptis-reading-part4/host/"],
  aptis_listening_part2_teacher: ["Aptis Listening Part 2", "aptis", "/live/aptis-listening-part2/host/"],
  aptis_listening_part3_teacher: ["Aptis Listening Part 3", "aptis", "/live/aptis-listening-part3/host/"],
  aptis_listening_part4_teacher: ["Aptis Listening Part 4", "aptis", "/live/aptis-listening-part4/host/"],
  "aptis-writing-teacher": ["Aptis Writing", "aptis", "/live/aptis-writing/host/"],
  "aptis-writing-register-surgery": ["Aptis Writing Part 4 · Register Surgery", "aptis", "/live/register-surgery/host/"],
  "aptis-writing-part4-error-detective": ["Aptis Writing Part 4 · Error Detective", "aptis", "/live/error-detective/host/"],
  "ote-advanced-reading-part4-option-jury": ["OTE Advanced Reading Part 4 · Option Jury", "ote", "/live/option-jury/host/"],
  "ote-advanced-reading-part4-evidence-live": ["OTE Advanced Reading Part 4 · Evidence Reveal", "ote", "/live/part4-evidence/host/"],
  ote_listening_teacher: ["OTE Listening", "ote", "/live/ote-listening/host/"],
  "ote-advanced-reading-part2-live": ["OTE Advanced Reading Part 2", "ote", "/live/ote-reading-part2/host/"],
  "ote-advanced-reading-part2-paragraph-live": ["OTE Advanced Reading Part 2 · Paragraph Lesson", "ote", "/live/ote-reading-part2-paragraph/host/"],
  ote_advanced_reading_cohesion_challenge: ["OTE Advanced Reading · Cohesion Challenge", "ote", "/live/cohesion-challenge/host/"],
  "ote-advanced-reading-part3-free-things-lesson": ["OTE Advanced Reading Part 3 · Guided Lesson", "ote", "/live/free-things-lesson/host/"],
};

function clean(value, limit = 200) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).replace(/[\r\n\t]+/g, " ").trim().slice(0, limit)
    : "";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function values(value) {
  return value && typeof value === "object" ? Object.values(value).filter((entry) => entry != null) : [];
}

function timestamp(value) {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > 0 ? date.getTime() : null;
}

function formatDate(value) {
  const milliseconds = timestamp(value);
  return milliseconds == null ? "Not recorded" : new Date(milliseconds).toLocaleString("en-GB", {
    timeZone: "Europe/Madrid", dateStyle: "medium", timeStyle: "short",
  }) + " (Madrid)";
}

function getActivityMetadata(game, set = {}) {
  const type = clean(game.type);
  const definition = Object.hasOwn(ACTIVITY_TYPES, type) ? ACTIVITY_TYPES[type] : null;
  const recordedSite = {"aptis-trainer": "aptis", aptisTrainer: "aptis"}[game.site || game.app] || game.site || game.app;
  const siteId = Object.hasOwn(SITES, recordedSite) ? recordedSite : definition?.[1];
  const site = siteId ? SITES[siteId] : null;
  const items = values(game.items);
  const taskIds = [...new Set([
    ...values(game.taskIds), game.taskId, game.activityId,
  ].map((value) => clean(value, 120)).filter(Boolean))];
  const levels = [...new Set([game.level, set.level, ...items.map((item) => item.level)]
    .map((value) => clean(value, 40)).filter(Boolean))];
  const topics = [...new Set([set.topicName, set.topic, ...items.map((item) => item.sourceThemeTitle || item.topic)]
    .map((value) => clean(value, 100)).filter(Boolean))];
  return {
    type,
    activity: definition?.[0] || clean(type.replace(/[-_]+/g, " ")) || "Live activity",
    title: clean(game.title) || clean(set.title || set.name) || definition?.[0] || "Live activity",
    siteLabel: site?.label || "Site not recorded",
    siteInferred: !recordedSite && !!site,
    // Unknown activity types have no guessed route. The email still identifies
    // the session, and a future type can add its actual host route here.
    hostOrigin: site?.origin || null,
    hostPath: definition?.[2] || null,
    taskIds,
    levels,
    topics,
    questionCount: items.length || values(game.questionIds).length || values(set.itemIds).length || null,
  };
}

function quizResults(game, participants, expectedResponses) {
  const perPlayer = new Map(participants.map(([id]) => [id, []]));
  const questions = [];
  const addQuestion = (label, answers) => {
    let incorrect = 0;
    let graded = 0;
    for (const [id, answer] of Object.entries(answers || {})) {
      if (!perPlayer.has(id) || !answer || typeof answer !== "object") continue;
      perPlayer.get(id).push(answer);
      if (typeof answer.correct === "boolean") {
        graded += 1;
        if (!answer.correct) incorrect += 1;
      }
    }
    if (incorrect) questions.push({label, incorrect, graded});
  };
  if (game.type === "spanglish_fixit") {
    for (const [index, round] of Object.entries(game.rounds || {})) {
      const label = clean(game.items?.[index]?.sentence || game.items?.[index]?.text) || `Round ${Number(index) + 1}`;
      addQuestion(`${label} · spot the error`, round.clickAnswers);
      addQuestion(`${label} · correction`, round.correctionAnswers);
    }
  } else {
    for (const [index, answers] of Object.entries(game.answers || {})) {
      const item = game.items?.[index];
      addQuestion(clean(item?.sentence || item?.question || item?.prompt || item?.text) || `Question ${Number(index) + 1}`, answers);
    }
  }
  const rows = participants.map(([id, player]) => {
    const answers = perPlayer.get(id);
    let correct = 0;
    let graded = 0;
    for (const answer of answers) {
      if (typeof answer.correct !== "boolean") continue;
      // Matching rounds can earn partial credit; do not report them as zero.
      const partial = Number.isFinite(answer.correctCount) && Number.isFinite(answer.totalCount) && answer.totalCount > 0;
      correct += partial ? answer.correctCount : Number(answer.correct);
      graded += partial ? answer.totalCount : 1;
    }
    const completed = expectedResponses ? answers.length >= expectedResponses : null;
    const points = answers.reduce((sum, answer) => sum + (Number(answer.scoreDelta) || 0), 0);
    return {
      name: clean(player.name) || "Unnamed participant",
      completed,
      participation: `${answers.length}${expectedResponses ? `/${expectedResponses}` : ""} rounds answered`,
      result: graded ? `${correct}/${graded} correct (${Math.round(correct / graded * 100)}%) · ${points} points` : "No graded answers",
    };
  });
  return {
    rows,
    missed: questions.sort((a, b) => b.incorrect / b.graded - a.incorrect / a.graded || b.incorrect - a.incorrect).slice(0, 5),
  };
}

function responseCount(value) {
  if (!value || typeof value !== "object") return 0;
  if (value.submittedAt || value.updatedAt || value.answeredAt) return 1;
  return values(value).reduce((count, entry) => count + responseCount(entry), 0);
}

function getParticipation(game, metadata) {
  const participants = Object.entries(game.players || {}).filter(([, player]) => player && typeof player === "object");
  if (["grammar", "vocab", "textbook-vocabulary-live", "spanglish_fixit"].includes(game.type)) {
    const expected = metadata.questionCount && metadata.questionCount * (game.type === "spanglish_fixit" ? 2 : 1);
    return quizResults(game, participants, expected);
  }
  const rows = participants.map(([id, player]) => {
    const base = {name: clean(player.name) || "Unnamed participant", completed: null, result: "See activity for review"};
    if (game.type === "aptis-writing-teacher") {
      const submitted = !!player.writingSubmission?.submittedAt;
      return {...base, completed: submitted, participation: submitted ? "Writing submitted" : "No writing submission", result: submitted ? "Ready for review" : "—"};
    }
    if (game.type === "collocation-team") {
      const team = game.teams?.[player.teamId];
      const answers = values(game.teamAnswers?.[player.teamId]);
      const score = answers.reduce((sum, answer) => sum + (Number(answer.score) || 0), 0);
      const possible = answers.reduce((sum, answer) => sum + (Number(answer.possibleScore) || 0), 0);
      const teamName = clean(team?.name) || "Unassigned team";
      return {
        ...base,
        completed: metadata.questionCount ? answers.length >= metadata.questionCount : null,
        participation: `${teamName} · ${answers.length}/${metadata.questionCount || "?"} team rounds answered`,
        result: possible ? `Team first pass: ${score}/${possible} collocations correct` : "No team answers",
      };
    }
    const readingFields = ["readingPart1Submission", "readingPart3Submission", "readingPart4Submission", "oteReadingPart2Submission"];
    const reading = readingFields.map((field) => player[field]).find(Boolean);
    if (reading) {
      const answered = reading.answeredCount ?? values(reading.answers).length;
      const complete = reading.complete === true || (!!reading.submittedAt && reading.complete !== false);
      return {...base, completed: complete, participation: `${complete ? "Submitted" : "In progress"} · ${answered} answers recorded`};
    }
    if (game.type === "aptis-reading-part2-teacher") {
      const submissions = values(player.readingPart2Submissions);
      const complete = submissions.filter((submission) => submission.complete).length;
      const expected = metadata.taskIds.length;
      return {...base, completed: expected ? complete >= expected : null, participation: `${complete}/${expected || "?"} tasks completed`};
    }
    if (game.type === "ote-advanced-reading-part2-paragraph-live") {
      const submitted = values(player.oteReadingPart2ParagraphSubmissions).filter((submission) => submission.submitted).length;
      return {...base, completed: submitted >= 3, participation: `${submitted}/3 paragraph responses submitted`};
    }
    if (/listening/.test(game.type || "")) {
      const count = values(player.listeningAnswers).length;
      return {...base, participation: `${count} answers recorded${player.listeningFirstRoundSubmittedAt ? " · first round submitted" : ""}`};
    }
    if (["aptis-reading-part1-teacher", "aptis-reading-part3-live", "aptis-reading-part4-live", "ote-advanced-reading-part2-live"].includes(game.type)) {
      return {...base, completed: false, participation: "No submission"};
    }
    const count = responseCount(player.cohesionAnswers) + responseCount(player.errorDetective) +
      responseCount(player.errorDetectiveCorrections) + responseCount(player.registerSurgery) +
      responseCount(game.investigations?.[id]) + responseCount(game.part3LessonPlacements?.[id]) +
      values(game.finalVotes).filter((answers) => answers?.[id]).length +
      values(game.part4Answers).filter((answers) => answers?.[id]).length;
    return {...base, participation: count ? `${count} responses recorded` : "No responses recorded"};
  });
  return {rows, missed: []};
}

function buildLiveGameEmail({kind, gameId, game, host = {}, set = {}, createdAt, startedAt, finishedAt}) {
  const metadata = getActivityMetadata(game, set);
  const finished = kind === "finished";
  const hostName = clean(host.displayName || host.name || host.username) || clean(host.email) || clean(game.ownerUid) || "Unknown host";
  const hostEmail = clean(host.email, 320);
  const heading = finished ? "Live activity completed" : "Live activity launched";
  const fields = [
    ["Activity", metadata.title],
    ["Type", metadata.activity],
    ...(game.part ? [["Exam part", `Part ${clean(game.part, 10)}`]] : []),
    ["Host", hostName],
    ...(hostEmail ? [["Host email", hostEmail]] : []),
    ["Site", metadata.siteLabel + (metadata.siteInferred ? " (inferred from activity type)" : "")],
    ...(metadata.levels.length ? [["Level", metadata.levels.join(", ")]] : []),
    ...(metadata.topics.length ? [["Topics", metadata.topics.slice(0, 8).join(", ")]] : []),
    ...(metadata.questionCount ? [["Questions / rounds", metadata.questionCount]] : []),
    ...(game.interactionType ? [["Format", clean(game.interactionType)]] : []),
    ...(metadata.taskIds.length ? [["Task / activity IDs", metadata.taskIds.join(", ")]] : []),
    ...(game.setId ? [["Content set", clean(game.setId)]] : []),
    ...(game.className ? [["Class", clean(game.className)]] : []),
    ["Created", formatDate(createdAt || game.createdAt)],
    ["PIN", clean(game.pin) || "Not recorded"],
    ["Session ID", clean(gameId)],
  ];
  let participation = null;
  if (finished) {
    fields.push(["Started", formatDate(startedAt)], ["Finished", formatDate(finishedAt)]);
    const start = timestamp(startedAt);
    const end = timestamp(finishedAt);
    if (start && end && end >= start) {
      const seconds = Math.round((end - start) / 1000);
      fields.push(["Duration", `${Math.floor(seconds / 60)}m ${seconds % 60}s`]);
    }
    participation = getParticipation(game, metadata);
    fields.push(["Participants", participation.rows.length]);
    if (participation.rows.length && participation.rows.every((row) => row.completed !== null)) {
      fields.push(["Submitted / completed", `${participation.rows.filter((row) => row.completed).length}/${participation.rows.length}`]);
    }
  } else {
    fields.push(["Status", "Lobby created; participation and results follow when the host finishes the activity."]);
  }
  const origin = metadata.hostOrigin;
  const hostUrl = origin && metadata.hostPath ? `${origin}${metadata.hostPath}${encodeURIComponent(gameId)}` : null;
  const textLines = [heading, "", ...fields.map(([label, value]) => `${label}: ${value}`)];
  let html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#172033"><div style="max-width:760px;margin:24px auto;background:#fff;padding:28px;border:1px solid #dbe3ec;border-radius:12px"><p style="color:#52627a;font-size:13px;margin:0 0 8px">SEIF · CLASSROOM ACTIVITY</p><h1 style="font-size:24px;margin:0 0 24px">${heading}</h1><table role="presentation" style="border-collapse:collapse;width:100%;font-size:14px">`;
  html += fields.map(([label, value]) => `<tr><th style="text-align:left;vertical-align:top;padding:8px 12px 8px 0;width:160px;border-bottom:1px solid #edf1f5">${escapeHtml(label)}</th><td style="padding:8px 0;border-bottom:1px solid #edf1f5;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("");
  html += "</table>";
  if (hostUrl) {
    textLines.push("", `${finished ? "Review activity" : "Open teacher view"}: ${hostUrl}`, "Teacher sign-in is required.");
    html += `<p style="margin:24px 0"><a href="${escapeHtml(hostUrl)}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">${finished ? "Review activity" : "Open teacher view"}</a></p><p style="font-size:12px;color:#52627a">Teacher sign-in is required.</p>`;
  }
  if (participation?.rows.length) {
    textLines.push("", "Participants and responses:");
    html += '<h2 style="font-size:18px;margin-top:28px">Participants and responses</h2><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th style="text-align:left;padding:8px;background:#edf2f8">Participant</th><th style="text-align:left;padding:8px;background:#edf2f8">Participation</th><th style="text-align:left;padding:8px;background:#edf2f8">Result</th></tr></thead><tbody>';
    for (const row of participation.rows.slice(0, 100)) {
      textLines.push(`${row.name} — ${row.participation} — ${row.result}`);
      html += `<tr>${[row.name, row.participation, row.result].map((cell) => `<td style="vertical-align:top;padding:8px;border-bottom:1px solid #edf1f5">${escapeHtml(cell)}</td>`).join("")}</tr>`;
    }
    html += "</tbody></table>";
    if (participation.rows.length > 100) {
      textLines.push("Showing the first 100 participants. Open the activity for the full roster.");
      html += "<p>Showing the first 100 participants. Open the activity for the full roster.</p>";
    }
  }
  if (participation?.missed.length) {
    textLines.push("", "Most missed (among submitted answers):");
    html += '<h2 style="font-size:18px;margin-top:28px">Most missed</h2><p style="font-size:13px;color:#52627a">Among submitted answers; a missing response is not counted as incorrect.</p><ul>';
    for (const item of participation.missed) {
      const line = `${item.label} — ${item.incorrect}/${item.graded} incorrect`;
      textLines.push(line);
      html += `<li style="margin:10px 0">${escapeHtml(line)}</li>`;
    }
    html += "</ul>";
  }
  html += '<p style="margin-top:24px;font-size:12px;color:#52627a">Only recorded submissions and scores are shown. Teacher-led activities may have responses without an automatic score.</p></div></body></html>';
  return {
    subject: `${heading} · ${metadata.title} · ${hostName}`.slice(0, 240),
    text: textLines.join("\n"),
    html,
    ...(hostEmail.includes("@") && !/[\r\n]/.test(hostEmail) ? {replyTo: hostEmail} : {}),
  };
}

module.exports = {ACTIVITY_TYPES, buildLiveGameEmail, getActivityMetadata, getParticipation, timestamp};
