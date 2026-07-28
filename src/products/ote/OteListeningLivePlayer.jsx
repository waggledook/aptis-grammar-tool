import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Headphones, Radio, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import {
  auth,
  logOteTrainingCompleted,
  logOteTrainingStarted,
  rtdb,
} from "../../firebase.js";
import { submitOteListeningLiveAnswer } from "../../api/liveGames.js";
import { toast } from "../../utils/toast.js";
import {
  OTE_LISTENING_LIVE_GAME_TYPE,
  getOteListeningItems,
  getOteListeningLiveActivity,
} from "./data/oteListeningLive.js";
import {
  ListeningFeedback,
  ListeningLiveStatus,
  ListeningTask,
} from "./OteListeningLiveShared.jsx";
import { normaliseListeningAnswer } from "./utils/listeningLive.js";
import "./styles/ote.css";
import "./styles/listening-live.css";

export default function OteListeningLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localAnswers, setLocalAnswers] = useState({});
  const activityLogPendingRef = useRef(new Set());

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
      setGame(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const activity = getOteListeningLiveActivity(game?.activityId);
  const items = getOteListeningItems(activity);
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex || 0;
  const reviewIndex = game?.state?.reviewIndex || 0;
  const reviewItem = items[activity?.format === "part1" ? questionIndex : reviewIndex];
  const remoteAnswers = useMemo(() => {
    if (!uid) return {};
    return Object.fromEntries(
      items
        .map((item) => [item.id, player?.listeningAnswers?.[item.id]?.value])
        .filter(([, value]) => value !== undefined)
    );
  }, [items, player?.listeningAnswers, uid]);
  const answers = useMemo(
    () => ({ ...remoteAnswers, ...localAnswers }),
    [localAnswers, remoteAnswers]
  );

  useEffect(() => {
    setLocalAnswers((current) => {
      const next = { ...current };
      Object.entries(remoteAnswers).forEach(([itemId, value]) => {
        if (next[itemId] === value) delete next[itemId];
      });
      return next;
    });
  }, [remoteAnswers]);

  useEffect(() => {
    if (!uid || !player || !activity || phase === "lobby") return;

    const taskId = `${activity.variant}-listening-part-${activity.part}-${activity.set.id}`;
    const taskTitle = `${activity.variant === "advanced" ? "Advanced" : "General"} Listening Part ${activity.part} ${activity.title}`;
    const commonDetails = {
      section: "listening",
      part: `part-${activity.part}`,
      mode: "teacher_led_live",
      taskId,
      taskTitle,
      variant: activity.variant,
      level: activity.level,
      gameId,
      participantRole: "student",
    };
    const startedStorageKey = `ote_listening_live_started:${gameId}:${uid}`;

    if (
      !window.localStorage.getItem(startedStorageKey) &&
      !activityLogPendingRef.current.has(startedStorageKey)
    ) {
      activityLogPendingRef.current.add(startedStorageKey);
      window.localStorage.setItem(startedStorageKey, "1");
      logOteTrainingStarted(commonDetails)
        .catch((error) => {
          window.localStorage.removeItem(startedStorageKey);
          console.error("[OteListeningLivePlayer] start log failed", error);
        })
        .finally(() => activityLogPendingRef.current.delete(startedStorageKey));
    }

    if (phase !== "finished") return;

    const completedStorageKey = `ote_listening_live_completed:${gameId}:${uid}`;
    if (
      window.localStorage.getItem(completedStorageKey) ||
      activityLogPendingRef.current.has(completedStorageKey)
    ) return;

    const score = items.filter((item) => {
      if (activity.format === "advanced-part2") {
        return normaliseListeningAnswer(answers[item.id]) === normaliseListeningAnswer(item.answer);
      }
      if (activity.format === "part3") {
        return answers[item.id] === item.answer;
      }
      return Number(answers[item.id]) === item.answer;
    }).length;
    const answeredCount = items.filter((item) => {
      const value = answers[item.id];
      return value !== undefined && value !== null && String(value).trim() !== "";
    }).length;

    activityLogPendingRef.current.add(completedStorageKey);
    window.localStorage.setItem(completedStorageKey, "1");
    logOteTrainingCompleted({
      ...commonDetails,
      score,
      total: items.length,
      answeredCount,
      completionReason: "host_finished",
    })
      .catch((error) => {
        window.localStorage.removeItem(completedStorageKey);
        console.error("[OteListeningLivePlayer] completion log failed", error);
      })
      .finally(() => activityLogPendingRef.current.delete(completedStorageKey));
  }, [activity, answers, gameId, items, phase, player, uid]);

  async function saveAnswer(itemId, value) {
    setLocalAnswers((current) => ({ ...current, [itemId]: value }));
    try {
      await submitOteListeningLiveAnswer({ gameId, itemId, value });
    } catch (error) {
      console.error("[OteListeningLivePlayer] answer save failed", error);
      toast("Your answer could not be saved. Please try again.");
    }
  }

  if (loading) return <main className="ote-listening-live-page"><p>Joining listening room…</p></main>;
  if (!game || game.type !== OTE_LISTENING_LIVE_GAME_TYPE || !activity) {
    return <main className="ote-listening-live-page"><h1>Live Listening</h1><p>Session not found.</p></main>;
  }
  if (!player) {
    return <main className="ote-listening-live-page"><h1>Live Listening</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;
  }

  const audioStage = game.state?.audioStage || "idle";
  const audioMessage =
    audioStage === "question"
      ? "The teacher is playing the question"
      : audioStage === "first"
        ? "First listening is playing from the teacher’s screen"
        : audioStage === "repeat"
          ? "The repeat is playing from the teacher’s screen"
          : "Listen to the audio shared by your teacher";

  return (
    <main className="ote-listening-live-page ote-listening-live-player">
      <Seo title={`Live Listening: ${activity.title}`} description="Student OTE listening response screen." />
      <header className="ote-listening-live-header">
        <div>
          <p>OTE {activity.variant === "advanced" ? "Advanced" : "General"} Listening · Part {activity.part}</p>
          <h1>{activity.title}</h1>
        </div>
        <span className="ote-listening-live-phase">
          {phase === "lobby" ? "Waiting" : phase === "review" ? `Review ${reviewIndex + 1}/${items.length}` : phase === "finished" ? "Complete" : activity.format === "part1" ? `Question ${questionIndex + 1}/${items.length}` : "Live task"}
        </span>
      </header>

      {phase === "lobby" ? (
        <section className="ote-listening-live-wait">
          <Users size={42} />
          <h2>You’re in the room</h2>
          <p>Your teacher will open the listening task when everyone is ready.</p>
        </section>
      ) : null}

      {phase === "task" ? (
        <section className="ote-listening-live-stage">
          <ListeningLiveStatus>{audioMessage}</ListeningLiveStatus>
          <ListeningTask
            activity={activity}
            answers={answers}
            onChange={saveAnswer}
            questionIndex={questionIndex}
          />
          <div className="ote-listening-live-saved">
            <CheckCircle2 size={18} />
            Answers are saved automatically. You can change them until feedback is revealed.
          </div>
        </section>
      ) : null}

      {phase === "review" && reviewItem ? (
        <section className="ote-listening-live-stage">
          <ListeningLiveStatus>Follow the explanation on your screen while the teacher reviews it</ListeningLiveStatus>
          <ListeningFeedback
            activity={activity}
            item={reviewItem}
            selectedValue={answers[reviewItem.id]}
          />
          <div className="ote-listening-live-wait is-compact">
            <Radio size={25} />
            <p>Your teacher controls when the class moves on.</p>
          </div>
        </section>
      ) : null}

      {phase === "finished" ? (
        <StudentResult activity={activity} answers={answers} items={items} />
      ) : null}
    </main>
  );
}

function StudentResult({ activity, answers, items }) {
  const score = items.filter((item) => {
    if (activity.format === "advanced-part2") {
      return normaliseListeningAnswer(answers[item.id]) === normaliseListeningAnswer(item.answer);
    }
    if (activity.format === "part3") {
      return answers[item.id] === item.answer;
    }
    return Number(answers[item.id]) === item.answer;
  }).length;
  return (
    <section className="ote-listening-live-stage">
      <div className="ote-listening-live-wait">
        <CheckCircle2 size={42} />
        <h2>Session complete</h2>
        <p>You answered {score} of {items.length} questions correctly.</p>
      </div>
    </section>
  );
}
