import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Eye,
  Headphones,
  Play,
  RotateCcw,
  Square,
  Users,
} from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { rtdb } from "../../firebase.js";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import { getSitePath } from "../../siteConfig.js";
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
import {
  LISTEN_AGAIN_PROMPT_SRC,
  normaliseListeningAnswer,
} from "./utils/listeningLive.js";
import "./styles/ote.css";
import "./styles/listening-live.css";

const BETWEEN_AUDIO_MS = 700;

export default function OteListeningLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState("");
  const [copyState, setCopyState] = useState("");
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const playbackTokenRef = useRef(0);

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
      setGame(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [gameId]);

  useEffect(() => () => {
    playbackTokenRef.current += 1;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const activity = getOteListeningLiveActivity(game?.activityId);
  const items = getOteListeningItems(activity);
  const players = useMemo(
    () => Object.entries(game?.players || {})
      .map(([id, player]) => ({ id, ...player }))
      .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)),
    [game?.players]
  );
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex || 0;
  const reviewIndex = game?.state?.reviewIndex || 0;
  const currentItem =
    activity?.format === "part1"
      ? items[questionIndex]
      : items[reviewIndex];
  const isHost = !!user && game?.ownerUid === user.uid;
  const joinPath = getSitePath("/live/join");
  const joinUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}${joinPath}?pin=${encodeURIComponent(game?.pin || "")}`;

  function stopAudio(updateRemote = true) {
    playbackTokenRef.current += 1;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying("");
    if (updateRemote && gameId) {
      setLiveGameState(gameId, { audioStage: "idle" }).catch(() => {});
    }
  }

  function playSource(src, token) {
    return new Promise((resolve, reject) => {
      if (!src || token !== playbackTokenRef.current) {
        resolve();
        return;
      }
      const audio = new Audio(src);
      audio.volume = 0.86;
      audioRef.current = audio;
      audio.onended = resolve;
      audio.onerror = () => reject(new Error(`Could not play ${src}`));
      audio.play().catch(reject);
    });
  }

  function shortPause(token) {
    return new Promise((resolve) => {
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        resolve(token === playbackTokenRef.current);
      }, BETWEEN_AUDIO_MS);
    });
  }

  async function playSequence(label, sources, nextPlayCount = null) {
    if (playing) return;
    const token = ++playbackTokenRef.current;
    setPlaying(label);
    try {
      await setLiveGameState(gameId, {
        audioStage: label,
        ...(typeof nextPlayCount === "number" ? { playCount: nextPlayCount } : {}),
      });
      for (let index = 0; index < sources.length; index += 1) {
        if (token !== playbackTokenRef.current) return;
        await playSource(sources[index], token);
        if (index < sources.length - 1) await shortPause(token);
      }
    } catch (error) {
      console.error("[OteListeningLiveHost] playback failed", error);
      toast("The audio could not be played. Check that screen-share audio is enabled and try again.");
    } finally {
      if (token === playbackTokenRef.current) {
        audioRef.current = null;
        setPlaying("");
        await setLiveGameState(gameId, { audioStage: "idle" }).catch(() => {});
      }
    }
  }

  function questionAudioSources() {
    if (!activity) return [];
    if (activity.format !== "part1") return [activity.set.instructionAudioSrc];
    return [
      currentItem?.instructionAudioSrc,
      currentItem?.optionsAudioSrc,
    ].filter(Boolean);
  }

  async function beginSession() {
    if (!players.length) {
      toast("Wait for at least one student to join.");
      return;
    }
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, {
      phase: "task",
      questionIndex: 0,
      reviewIndex: 0,
      playCount: 0,
      audioStage: "idle",
    });
  }

  async function revealFeedback() {
    stopAudio();
    if (activity.format === "part1") {
      const answered = answerCount(currentItem.id);
      if (answered < players.length && !window.confirm(`${players.length - answered} student(s) have not answered. Reveal feedback anyway?`)) return;
      await setLiveGameState(gameId, { phase: "review", reviewIndex: questionIndex });
      return;
    }
    await setLiveGameState(gameId, { phase: "review", reviewIndex: 0 });
  }

  async function nextFromReview() {
    stopAudio();
    if (activity.format === "part1") {
      if (questionIndex < items.length - 1) {
        await setLiveGameState(gameId, {
          phase: "task",
          questionIndex: questionIndex + 1,
          reviewIndex: questionIndex + 1,
          playCount: 0,
          audioStage: "idle",
        });
      } else {
        await finishSession();
      }
      return;
    }
    if (reviewIndex < items.length - 1) {
      await setLiveGameState(gameId, { reviewIndex: reviewIndex + 1 });
    } else {
      await finishSession();
    }
  }

  async function finishSession() {
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished", audioStage: "idle" });
  }

  function answerCount(itemId) {
    return players.filter((player) => player.listeningAnswers?.[itemId]).length;
  }

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState(""), 1500);
    } catch {
      setCopyState("Copy failed");
    }
  }

  if (loading) return <main className="ote-listening-live-page"><p>Loading listening room…</p></main>;
  if (!game || game.type !== OTE_LISTENING_LIVE_GAME_TYPE || !activity) {
    return <main className="ote-listening-live-page"><h1>Live Listening</h1><p>Session not found.</p></main>;
  }
  if (!isHost) {
    return <main className="ote-listening-live-page"><h1>Live Listening</h1><p>You are not the host of this session.</p></main>;
  }

  const playCount = game.state?.playCount || 0;
  const displayedPin = String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2");
  return (
    <main className="ote-listening-live-page ote-listening-live-host">
      <Seo title={`Host Live Listening: ${activity.title}`} description="Teacher-controlled OTE listening session." />
      <header className="ote-listening-live-header">
        <div>
          <p>OTE {activity.variant === "advanced" ? "Advanced" : "General"} Listening · Part {activity.part}</p>
          <h1>{activity.title}</h1>
        </div>
        <span className="ote-listening-live-phase">
          {phase === "lobby" ? "Lobby" : phase === "review" ? `Review ${reviewIndex + 1}/${items.length}` : phase === "finished" ? "Complete" : activity.format === "part1" ? `Question ${questionIndex + 1}/${items.length}` : "Live task"}
        </span>
      </header>

      {phase === "lobby" ? (
        <section className="ote-listening-live-lobby">
          <div className="ote-listening-live-pin">
            <p>Students join with PIN</p>
            <strong aria-label={`PIN ${String(game.pin || "").split("").join(" ")}`}>
              {displayedPin}
            </strong>
            <QRCodeSVG value={joinUrl} size={184} includeMargin />
            <button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button>
          </div>
          <div className="ote-listening-live-roster">
            <div><Users size={23} /><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div>
            <ul>
              {players.map((player) => <li key={player.id}>{player.name}</li>)}
              {!players.length ? <li>Waiting for students…</li> : null}
            </ul>
            <button className="ote-listening-live-primary" type="button" onClick={beginSession} disabled={!players.length}>
              <Play size={18} /> Open the task
            </button>
          </div>
        </section>
      ) : null}

      {phase === "task" ? (
        <section className="ote-listening-live-stage">
          <ListeningLiveStatus>
            {playing
              ? playing === "question" ? "Question audio is playing" : playing === "first" ? "First listening is playing" : "Repeat is playing"
              : "Audio is controlled here and heard through the teacher’s shared screen"}
          </ListeningLiveStatus>

          <div className="ote-listening-live-controls">
            {activity.format === "part1" || activity.set.instructionAudioReady !== false ? (
              <button type="button" disabled={!!playing} onClick={() => playSequence("question", questionAudioSources())}>
                <Headphones size={18} /> Play question
              </button>
            ) : null}
            <button type="button" disabled={!!playing} onClick={() => playSequence("first", [activity.format === "part1" ? currentItem.audioSrc : activity.set.audioSrc], Math.max(1, playCount))}>
              <Play size={18} /> Play first listen
            </button>
            <button type="button" disabled={!!playing} onClick={() => playSequence("repeat", [LISTEN_AGAIN_PROMPT_SRC, activity.format === "part1" ? currentItem.audioSrc : activity.set.audioSrc], 2)}>
              <RotateCcw size={18} /> Say “Now listen again” and repeat
            </button>
            <button className="is-stop" type="button" disabled={!playing} onClick={() => stopAudio()}>
              <Square size={17} /> Stop
            </button>
          </div>

          <div className="ote-listening-live-response-bar">
            <span><Users size={17} /> {activity.format === "part1" ? `${answerCount(currentItem.id)} of ${players.length} answered` : `${players.reduce((total, player) => total + items.filter((item) => player.listeningAnswers?.[item.id]).length, 0)} of ${players.length * items.length} answers received`}</span>
            <span>{playCount}/2 main plays started</span>
          </div>
          <ListeningTask activity={activity} answers={{}} disabled questionIndex={questionIndex} />
          <button className="ote-listening-live-primary" type="button" onClick={revealFeedback}>
            <Eye size={18} /> Reveal detailed feedback
          </button>
        </section>
      ) : null}

      {phase === "review" && currentItem ? (
        <section className="ote-listening-live-stage">
          <ListeningLiveStatus>
            Detailed feedback is now visible on every student screen
          </ListeningLiveStatus>
          <ListeningFeedback
            activity={activity}
            item={currentItem}
            selectedValue={currentItem.answer}
            showAudio
          />
          <button className="ote-listening-live-primary" type="button" onClick={nextFromReview}>
            <ChevronRight size={18} />
            {activity.format === "part1"
              ? questionIndex === items.length - 1 ? "Finish session" : `Open Question ${questionIndex + 2}`
              : reviewIndex === items.length - 1 ? "Finish session" : `Review answer ${reviewIndex + 2}`}
          </button>
        </section>
      ) : null}

      {phase === "finished" ? (
        <ListeningLiveReport activity={activity} items={items} players={players} />
      ) : null}
    </main>
  );
}

function ListeningLiveReport({ activity, items, players }) {
  function isCorrect(item, value) {
    if (activity.format === "advanced-part2") {
      return normaliseListeningAnswer(value) === normaliseListeningAnswer(item.answer);
    }
    if (activity.format === "part3") {
      return value === item.answer;
    }
    return Number(value) === item.answer;
  }

  return (
    <section className="ote-listening-live-stage">
      <div className="ote-listening-live-complete">
        <CheckCircle2 size={34} />
        <div><p>Session complete</p><h2>Class results</h2></div>
      </div>
      <div className="ote-listening-live-report">
        {players.map((player) => {
          const score = items.filter((item) => isCorrect(item, player.listeningAnswers?.[item.id]?.value)).length;
          return <div key={player.id}><strong>{player.name}</strong><span>{score}/{items.length}</span></div>;
        })}
      </div>
    </section>
  );
}
