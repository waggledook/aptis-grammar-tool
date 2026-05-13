import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 560;
const BASE_X = 0;
const BASE_WIDTH = 148;
const BASE_HEIGHT = 118;
const DOCK_WIDTH = 118;
const DOCK_LINE_X = 170;
const DOCK_LEFT = DOCK_LINE_X;
const DOCK_ASSET = "/images/syntax-sentinel/docking-gate-slim.png";
const SHIP_X = DOCK_LINE_X + 58;
const SHIP_WIDTH = 91;
const SHIP_HEIGHT = 77;
const SHIP_MUZZLE_X = 89;
const SHIP_MUZZLE_Y = 52;
const SHIP_ASSET = "/images/syntax-sentinel/ship-no-boost-tight.png";
const BACKGROUND_TRACK = "/sounds/syntax-sentinel-void-protocol.mp3";
const BACKGROUND_TRACK_VOLUME = 0.22;
const BLASTER_SOUND = "/sounds/syntax-sentinel-blaster.mp3";
const BLASTER_VOLUME = 0.42;
const CORRECT_DOCK_SOUND = "/sounds/syntax-sentinel-correct-dock.mp3";
const CORRECT_DOCK_VOLUME = 0.48;
const BAD_DOCK_SOUND = "/sounds/syntax-sentinel-bad-dock.mp3";
const BAD_DOCK_VOLUME = 0.5;
const SHATTER_SOUND = "/sounds/syntax-sentinel-shatter.mp3";
const SHATTER_VOLUME = 0.56;
const PROJECTILE_HEIGHT = 7;
const PROJECTILE_WIDTH = 36;
const PROJECTILE_SPEED = 680;
const DEBRIS_HEIGHT = 38;
const DEBRIS_SPAWN_GAP_MIN = 28;
const DEBRIS_SPAWN_GAP_MAX = 96;
const DEBRIS_TOP_BOUND = 48;
const DEBRIS_BOTTOM_PADDING = 28;
const DEBRIS_VERTICAL_GAP = 76;
const MIN_SPAWN_DELAY_MS = 850;
const MAX_SPAWN_DELAY_MS = 2800;
const PROMPT_DEPART_DELAY_MS = 760;
const PROMPT_ARRIVE_DELAY_MS = 980;
const MAX_SHIELD = 4;
const DEFAULT_STAGE_SIZE = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
};
const PROMPT_SETS = [
  {
    id: "mind",
    prompt: "I don't mind",
    note: "mind + -ing / if-clause",
    correctEndings: [
      { id: "waiting", text: "...waiting" },
      { id: "her-coming", text: "...her coming" },
      { id: "if-late", text: "...if you're late" },
    ],
    distractors: ["...to wait", "...wait", "...she comes", "...for you late", "...that you late"],
  },
  {
    id: "suggested",
    prompt: "She suggested",
    note: "suggest + -ing / that-clause",
    correctEndings: [
      { id: "leaving", text: "...leaving early" },
      { id: "that-we-leave", text: "...that we leave early" },
      { id: "a-new-plan", text: "...a new plan" },
    ],
    distractors: ["...to leave early", "...leave early", "...us to leave early", "...that we to leave"],
  },
  {
    id: "avoided",
    prompt: "We avoided",
    note: "avoid + -ing / noun phrase",
    correctEndings: [
      { id: "making-noise", text: "...making noise" },
      { id: "the-main-road", text: "...the main road" },
      { id: "being-seen", text: "...being seen" },
    ],
    distractors: ["...to make noise", "...make noise", "...that made noise", "...to be seen"],
  },
  {
    id: "looking-forward",
    prompt: "I'm looking forward to",
    note: "look forward to + -ing / noun",
    correctEndings: [
      { id: "seeing-you", text: "...seeing you" },
      { id: "the-weekend", text: "...the weekend" },
      { id: "hearing-news", text: "...hearing the news" },
    ],
    distractors: ["...see you", "...to see you", "...that weekend", "...hear the news"],
  },
  {
    id: "decided",
    prompt: "They decided",
    note: "decide + to infinitive / that-clause",
    correctEndings: [
      { id: "to-stay", text: "...to stay at home" },
      { id: "not-to-go", text: "...not to go out" },
      { id: "that-it-was-best", text: "...that it was best to wait" },
    ],
    distractors: ["...staying at home", "...stay at home", "...not going out", "...that to wait"],
  },
  {
    id: "agreed",
    prompt: "We agreed",
    note: "agree + to infinitive / on + noun/-ing / that-clause",
    correctEndings: [
      { id: "to-meet", text: "...to meet at six" },
      { id: "on-a-date", text: "...on a date for the meeting" },
      { id: "that-it-was-fair", text: "...that it was fair" },
    ],
    distractors: ["...meeting at six", "...meet at six", "...with meet at six", "...on to meet at six"],
  },
  {
    id: "refused",
    prompt: "He refused",
    note: "refuse + to infinitive",
    correctEndings: [
      { id: "to-answer", text: "...to answer the question" },
      { id: "to-apologise", text: "...to apologise" },
      { id: "to-help", text: "...to help us" },
    ],
    distractors: ["...answering the question", "...answer the question", "...that answered", "...helping us"],
  },
  {
    id: "managed",
    prompt: "I managed",
    note: "manage + to infinitive",
    correctEndings: [
      { id: "to-finish", text: "...to finish on time" },
      { id: "to-find", text: "...to find a solution" },
      { id: "to-get", text: "...to get home safely" },
    ],
    distractors: ["...finishing on time", "...finish on time", "...that I finished", "...for finish on time"],
  },
  {
    id: "cant-stand",
    prompt: "I can't stand",
    note: "can't stand + -ing / noun phrase",
    correctEndings: [
      { id: "waiting-in-queues", text: "...waiting in queues" },
      { id: "people-shouting", text: "...people shouting" },
      { id: "loud-music", text: "...loud music" },
    ],
    distractors: ["...to wait in queues", "...wait in queues", "...that people shout", "...people to shout"],
  },
  {
    id: "considered",
    prompt: "We considered",
    note: "consider + -ing / noun phrase",
    correctEndings: [
      { id: "moving-abroad", text: "...moving abroad" },
      { id: "the-alternatives", text: "...the alternatives" },
      { id: "taking-action", text: "...taking action" },
    ],
    distractors: ["...to move abroad", "...move abroad", "...that move abroad", "...for moving abroad"],
  },
  {
    id: "admitted",
    prompt: "He admitted",
    note: "admit + -ing / that-clause",
    correctEndings: [
      { id: "making-mistake", text: "...making a mistake" },
      { id: "that-he-was-wrong", text: "...that he was wrong" },
      { id: "being-responsible", text: "...being responsible" },
    ],
    distractors: ["...to make a mistake", "...make a mistake", "...that being wrong", "...to be responsible"],
  },
  {
    id: "denied",
    prompt: "She denied",
    note: "deny + -ing / that-clause / noun phrase",
    correctEndings: [
      { id: "taking-money", text: "...taking the money" },
      { id: "that-she-knew", text: "...that she knew anything" },
      { id: "any-involvement", text: "...any involvement" },
    ],
    distractors: ["...to take the money", "...take the money", "...that taking the money", "...to know anything"],
  },
  {
    id: "risked",
    prompt: "They risked",
    note: "risk + -ing / noun phrase",
    correctEndings: [
      { id: "losing-everything", text: "...losing everything" },
      { id: "being-caught", text: "...being caught" },
      { id: "their-reputation", text: "...their reputation" },
    ],
    distractors: ["...to lose everything", "...lose everything", "...that they lost", "...to be caught"],
  },
  {
    id: "recommended",
    prompt: "The doctor recommended",
    note: "recommend + -ing / that-clause / noun phrase",
    correctEndings: [
      { id: "resting", text: "...resting for a few days" },
      { id: "that-i-rest", text: "...that I rest for a few days" },
      { id: "a-short-break", text: "...a short break" },
    ],
    distractors: ["...me to rest", "...to rest for a few days", "...rest for a few days", "...that I to rest"],
  },
  {
    id: "worth",
    prompt: "It's worth",
    note: "worth + -ing / noun phrase",
    correctEndings: [
      { id: "trying-again", text: "...trying again" },
      { id: "visiting", text: "...visiting at least once" },
      { id: "the-extra-money", text: "...the extra money" },
    ],
    distractors: ["...to try again", "...try again", "...that you try again", "...for trying again"],
  },
  {
    id: "let",
    prompt: "They let us",
    note: "let someone + bare infinitive",
    correctEndings: [
      { id: "leave-early", text: "...leave early" },
      { id: "use-the-room", text: "...use the room" },
      { id: "stay-longer", text: "...stay a bit longer" },
    ],
    distractors: ["...to leave early", "...leaving early", "...that we leave early", "...us to leave early"],
  },
  {
    id: "made",
    prompt: "The film made me",
    note: "make someone + bare infinitive / adjective",
    correctEndings: [
      { id: "cry", text: "...cry" },
      { id: "think", text: "...think about my childhood" },
      { id: "sad", text: "...sad" },
    ],
    distractors: ["...to cry", "...crying", "...that I cried", "...me crying"],
  },
  {
    id: "had-better",
    prompt: "You'd better",
    note: "had better + bare infinitive",
    correctEndings: [
      { id: "leave-now", text: "...leave now" },
      { id: "not-forget", text: "...not forget your passport" },
      { id: "check-again", text: "...check again" },
    ],
    distractors: ["...to leave now", "...leaving now", "...not to forget", "...that you leave now"],
  },
  {
    id: "would-you-mind",
    prompt: "Would you mind",
    note: "Would you mind + -ing / if + past simple",
    correctEndings: [
      { id: "opening-window", text: "...opening the window?" },
      { id: "helping-me", text: "...helping me for a moment?" },
      { id: "if-i-sat", text: "...if I sat here?" },
    ],
    distractors: ["...to open the window?", "...open the window?", "...if I to sit here?", "...that I sit here?"],
  },
  {
    id: "used-to",
    prompt: "I'm used",
    note: "be used to + -ing / noun phrase",
    correctEndings: [
      { id: "to-getting-up-early", text: "...to getting up early" },
      { id: "to-cold-weather", text: "...to cold weather" },
      { id: "to-working-under-pressure", text: "...to working under pressure" },
    ],
    distractors: [
      "...to get up early",
      "...get up early",
      "...that I get up early",
      "...with working under pressure",
    ],
  },
  {
    id: "would-rather",
    prompt: "I'd rather",
    note: "would rather + bare infinitive / subject + past simple",
    correctEndings: [
      { id: "stay-home", text: "...stay at home" },
      { id: "you-stayed-home", text: "...you stayed at home" },
      { id: "she-didnt-say-anything", text: "...she didn't say anything" },
    ],
    distractors: [
      "...to stay at home",
      "...staying at home",
      "...you stay at home",
      "...she doesn't say anything",
    ],
  },
  {
    id: "no-point",
    prompt: "There's no point",
    note: "there's no point in + -ing",
    correctEndings: [
      { id: "in-arguing", text: "...in arguing about it" },
      { id: "in-waiting", text: "...in waiting any longer" },
      { id: "in-complaining", text: "...in complaining now" },
    ],
    distractors: [
      "...to argue about it",
      "...argue about it",
      "...that we argue",
      "...for arguing about it",
    ],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPromptOrder() {
  return shuffle(PROMPT_SETS.map((_, index) => index));
}

function estimateDebrisWidth(text) {
  return clamp(text.length * 9.2 + 30, 76, 230);
}

function clampToStage(value, min, max) {
  const safeMax = Math.max(min, max);
  return clamp(value, min, safeMax);
}

function chooseDebrisY(stageSize, activeDebris) {
  const minY = DEBRIS_TOP_BOUND;
  const maxY = Math.max(minY, stageSize.height - DEBRIS_HEIGHT - DEBRIS_BOTTOM_PADDING);
  const lanes = [];

  for (let y = minY; y <= maxY; y += DEBRIS_VERTICAL_GAP) {
    lanes.push(y);
  }

  if (!lanes.length) return minY;

  const openLanes = lanes.filter((laneY) =>
    activeDebris.every((item) => Math.abs(item.y - laneY) >= DEBRIS_VERTICAL_GAP),
  );
  const pool = openLanes.length ? openLanes : lanes;
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeDebris(promptItem, difficulty, stageSize = DEFAULT_STAGE_SIZE, unavailableCorrectIds = new Set(), activeDebris = []) {
  const remainingCorrect = promptItem.correctEndings.filter((ending) => !unavailableCorrectIds.has(ending.id));
  const isGood = remainingCorrect.length > 0 && Math.random() < 0.42;
  const correctEnding = isGood ? remainingCorrect[Math.floor(Math.random() * remainingCorrect.length)] : null;
  const distractor = promptItem.distractors[Math.floor(Math.random() * promptItem.distractors.length)];
  const text = correctEnding?.text || distractor;
  const width = estimateDebrisWidth(text);
  const speed = randomBetween(82 + difficulty * 9, 118 + difficulty * 12);
  const y = chooseDebrisY(stageSize, activeDebris);
  const drift = randomBetween(10, 24);
  const driftDirection = Math.random() < 0.5 ? -1 : 1;
  const driftRate = randomBetween(500, 900);

  return {
    id: `debris-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    isGood,
    correctId: correctEnding?.id || null,
    width,
    x: stageSize.width + randomBetween(DEBRIS_SPAWN_GAP_MIN, DEBRIS_SPAWN_GAP_MAX),
    y,
    speed,
    drift,
    driftDirection,
    driftRate,
    wobble: randomBetween(0, Math.PI * 2),
  };
}

function formatMultiplier(streak) {
  return `x${Math.max(1, Math.floor(streak / 3) + 1)}`;
}

function getMultiplier(streak) {
  return Math.max(1, Math.floor(streak / 3) + 1);
}

function getDifficultyLevel(stats) {
  const progress = (stats?.docked || 0) + (stats?.protected || 0);
  return Math.min(12, Math.floor(progress / 3));
}

function getSpawnDelay(difficulty) {
  const eased = Math.pow(clamp(difficulty / 12, 0, 1), 0.78);
  return Math.round(MAX_SPAWN_DELAY_MS - (MAX_SPAWN_DELAY_MS - MIN_SPAWN_DELAY_MS) * eased);
}

function getMaxActiveDebris(difficulty) {
  return difficulty >= 5 ? 2 : 1;
}

function isTouchViewport() {
  return typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

export default function HubSyntaxSentinelGame() {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const gameZoomRef = useRef(null);
  const keysRef = useRef(new Set());
  const lastFrameRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const promptTransitionRef = useRef(null);
  const dockEffectTimeoutRef = useRef(null);
  const shotEffectTimeoutRef = useRef(null);
  const animationRef = useRef(null);
  const musicRef = useRef(null);
  const blasterRef = useRef(null);
  const correctDockSoundRef = useRef(null);
  const badDockSoundRef = useRef(null);
  const shatterSoundRef = useRef(null);
  const stageSizeRef = useRef(DEFAULT_STAGE_SIZE);
  const debrisRef = useRef([]);
  const projectilesRef = useRef([]);
  const shipXRef = useRef(SHIP_X);
  const shipYRef = useRef(GAME_HEIGHT / 2);
  const modeRef = useRef("intro");
  const basePhaseRef = useRef("active");
  const pendingPromptLaunchRef = useRef(false);
  const completedCorrectIdsRef = useRef(new Set());
  const shieldRef = useRef(MAX_SHIELD);
  const shieldCracksRef = useRef(0);
  const streakRef = useRef(0);
  const scoreRef = useRef(0);
  const statsRef = useRef({ protected: 0, docked: 0, mistakes: 0 });
  const promptIndexRef = useRef(0);
  const promptOrderRef = useRef(buildPromptOrder());
  const promptOrderCursorRef = useRef(0);

  const [mode, setMode] = useState("intro");
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedBaseWidth, setExpandedBaseWidth] = useState(GAME_WIDTH);
  const [expandedScale, setExpandedScale] = useState(1.16);
  const [stageSize, setStageSize] = useState(DEFAULT_STAGE_SIZE);
  const [shipX, setShipX] = useState(SHIP_X);
  const [shipY, setShipY] = useState(GAME_HEIGHT / 2);
  const [debris, setDebris] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shield, setShield] = useState(MAX_SHIELD);
  const [shieldCracks, setShieldCracks] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [basePhase, setBasePhase] = useState("active");
  const [completedCorrectIds, setCompletedCorrectIds] = useState([]);
  const [dockEffect, setDockEffect] = useState(null);
  const [shotEffect, setShotEffect] = useState(null);
  const [flash, setFlash] = useState("idle");
  const [feedback, setFeedback] = useState("Shoot the wrong endings. Let the correct ending dock with the prompt.");
  const [stats, setStats] = useState({
    protected: 0,
    docked: 0,
    mistakes: 0,
  });

  const promptItem = PROMPT_SETS[promptIndex];
  const multiplier = useMemo(() => getMultiplier(streak), [streak]);
  const level = useMemo(() => Math.floor(score / 180), [score]);
  const remainingCorrectCount = promptItem.correctEndings.length - completedCorrectIds.length;

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    basePhaseRef.current = basePhase;
  }, [basePhase]);

  useEffect(() => {
    completedCorrectIdsRef.current = new Set(completedCorrectIds);
  }, [completedCorrectIds]);

  useEffect(() => {
    stageSizeRef.current = stageSize;
  }, [stageSize]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    function updateStageSize() {
      const rect = stage.getBoundingClientRect();
      const nextSize = {
        width: Math.round(stage.clientWidth || rect.width || GAME_WIDTH),
        height: Math.round(stage.clientHeight || rect.height || GAME_HEIGHT),
      };
      stageSizeRef.current = nextSize;
      setStageSize(nextSize);
    }

    updateStageSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateStageSize);
      return () => window.removeEventListener("resize", updateStageSize);
    }

    const observer = new ResizeObserver(updateStageSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    shieldRef.current = shield;
  }, [shield]);

  useEffect(() => {
    shieldCracksRef.current = shieldCracks;
  }, [shieldCracks]);

  useEffect(() => {
    promptIndexRef.current = promptIndex;
  }, [promptIndex]);

  useEffect(() => {
    debrisRef.current = debris;
  }, [debris]);

  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);

  useEffect(() => {
    shipXRef.current = shipX;
  }, [shipX]);

  useEffect(() => {
    shipYRef.current = shipY;
  }, [shipY]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "W", "a", "A", "s", "S", "d", "D"].includes(event.key)) {
        event.preventDefault();
      }
      keysRef.current.add(event.key);
      if (event.key === " " && modeRef.current === "playing") {
        fireProjectile();
      }
      if (event.key === "Enter" && modeRef.current !== "playing") {
        startGame();
      }
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    }

    function handleKeyUp(event) {
      keysRef.current.delete(event.key);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      if (promptTransitionRef.current) window.clearTimeout(promptTransitionRef.current);
      if (dockEffectTimeoutRef.current) window.clearTimeout(dockEffectTimeoutRef.current);
      if (shotEffectTimeoutRef.current) window.clearTimeout(shotEffectTimeoutRef.current);
      stopBackgroundTrack();
    };
  }, []);

  useEffect(() => {
    if (mode !== "playing") return undefined;
    lastFrameRef.current = performance.now();
    animationRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, [mode]);

  useEffect(() => {
    if (!isExpanded || typeof window === "undefined") return undefined;

    function syncExpandedScale() {
      if (isTouchViewport()) {
        const fittedWidth = Math.min(window.innerWidth - 28, ((window.innerHeight - 34) * GAME_WIDTH) / (GAME_HEIGHT + 40));
        setExpandedBaseWidth(Math.max(300, Math.floor(fittedWidth)));
        setExpandedScale(1);
        return;
      }

      setExpandedScale(1.16);
    }

    syncExpandedScale();
    window.addEventListener("resize", syncExpandedScale);
    window.addEventListener("orientationchange", syncExpandedScale);
    return () => {
      window.removeEventListener("resize", syncExpandedScale);
      window.removeEventListener("orientationchange", syncExpandedScale);
    };
  }, [isExpanded]);

  function syncFrame(nextDebris, nextProjectiles, nextShipX, nextShipY) {
    debrisRef.current = nextDebris;
    projectilesRef.current = nextProjectiles;
    shipXRef.current = nextShipX;
    shipYRef.current = nextShipY;
    setDebris(nextDebris);
    setProjectiles(nextProjectiles);
    setShipX(nextShipX);
    setShipY(nextShipY);
  }

  function pulse(type) {
    setFlash(type);
    window.setTimeout(() => setFlash("idle"), 220);
  }

  function showDockEffect(type, y) {
    if (dockEffectTimeoutRef.current) window.clearTimeout(dockEffectTimeoutRef.current);
    setDockEffect({
      id: `${type}-${Date.now()}`,
      type,
      y: clamp(y, 90, stageSizeRef.current.height - 70),
    });
    dockEffectTimeoutRef.current = window.setTimeout(() => {
      setDockEffect(null);
      dockEffectTimeoutRef.current = null;
    }, 520);
  }

  function showShotEffect(type, x, y) {
    if (shotEffectTimeoutRef.current) window.clearTimeout(shotEffectTimeoutRef.current);
    setShotEffect({
      id: `${type}-${Date.now()}`,
      type,
      x: clamp(x, 28, stageSizeRef.current.width - 28),
      y: clamp(y, 64, stageSizeRef.current.height - 28),
    });
    shotEffectTimeoutRef.current = window.setTimeout(() => {
      setShotEffect(null);
      shotEffectTimeoutRef.current = null;
    }, 460);
  }

  function updateFeedback(text) {
    setFeedback(text);
  }

  function openExpandedView() {
    if (isTouchViewport()) {
      const fittedWidth = Math.min(window.innerWidth - 28, ((window.innerHeight - 34) * GAME_WIDTH) / (GAME_HEIGHT + 40));
      setExpandedBaseWidth(Math.max(300, Math.floor(fittedWidth)));
      setExpandedScale(1);
      setIsExpanded(true);
      return;
    }

    const width = gameZoomRef.current?.getBoundingClientRect().width || GAME_WIDTH;
    setExpandedBaseWidth(Math.round(width));
    setExpandedScale(1.16);
    setIsExpanded(true);
  }

  function playBackgroundTrack() {
    if (typeof window === "undefined") return;
    if (!musicRef.current) {
      musicRef.current = new window.Audio(BACKGROUND_TRACK);
      musicRef.current.loop = true;
    }
    musicRef.current.volume = BACKGROUND_TRACK_VOLUME;
    musicRef.current.currentTime = 0;
    musicRef.current.play().catch(() => {});
  }

  function stopBackgroundTrack() {
    const music = musicRef.current;
    if (!music) return;
    music.pause();
    music.currentTime = 0;
  }

  function playBlasterSound() {
    if (typeof window === "undefined") return;
    if (!blasterRef.current) {
      blasterRef.current = new window.Audio(BLASTER_SOUND);
    }
    const blaster = blasterRef.current;
    blaster.volume = BLASTER_VOLUME;
    blaster.currentTime = 0;
    blaster.play().catch(() => {});
  }

  function playCorrectDockSound() {
    if (typeof window === "undefined") return;
    if (!correctDockSoundRef.current) {
      correctDockSoundRef.current = new window.Audio(CORRECT_DOCK_SOUND);
    }
    const sound = correctDockSoundRef.current;
    sound.volume = CORRECT_DOCK_VOLUME;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function playBadDockSound() {
    if (typeof window === "undefined") return;
    if (!badDockSoundRef.current) {
      badDockSoundRef.current = new window.Audio(BAD_DOCK_SOUND);
    }
    const sound = badDockSoundRef.current;
    sound.volume = BAD_DOCK_VOLUME;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function playShatterSound() {
    if (typeof window === "undefined") return;
    if (!shatterSoundRef.current) {
      shatterSoundRef.current = new window.Audio(SHATTER_SOUND);
    }
    const sound = shatterSoundRef.current;
    sound.volume = SHATTER_VOLUME;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function launchNextPromptSet() {
    if (promptTransitionRef.current) window.clearTimeout(promptTransitionRef.current);

    pendingPromptLaunchRef.current = true;
    basePhaseRef.current = "complete";
    setBasePhase("complete");
    spawnTimerRef.current = Number.POSITIVE_INFINITY;
    updateFeedback("Set complete. Clear the last attack before the next prompt docks.");
  }

  function beginPromptDeparture() {
    if (promptTransitionRef.current || !pendingPromptLaunchRef.current) return;

    pendingPromptLaunchRef.current = false;
    basePhaseRef.current = "departing";
    setBasePhase("departing");
    projectilesRef.current = [];
    setProjectiles([]);

    promptTransitionRef.current = window.setTimeout(() => {
      if (promptOrderCursorRef.current >= promptOrderRef.current.length) {
        promptOrderRef.current = buildPromptOrder();
        promptOrderCursorRef.current = 0;
      }

      const nextPrompt = promptOrderRef.current[promptOrderCursorRef.current] ?? 0;
      promptOrderCursorRef.current += 1;
      promptIndexRef.current = nextPrompt;
      completedCorrectIdsRef.current = new Set();
      spawnTimerRef.current = 1200;
      setPromptIndex(nextPrompt);
      setRound((current) => current + 1);
      setCompletedCorrectIds([]);
      setBasePhase("arriving");
      basePhaseRef.current = "arriving";
      updateFeedback(`${PROMPT_SETS[nextPrompt].prompt} is docking. New endings incoming.`);

      promptTransitionRef.current = window.setTimeout(() => {
        setBasePhase("active");
        basePhaseRef.current = "active";
        promptTransitionRef.current = null;
      }, PROMPT_ARRIVE_DELAY_MS);
    }, PROMPT_DEPART_DELAY_MS);
  }

  function damageShield(reason, options = {}) {
    if (!options.skipSound) playBadDockSound();
    shieldCracksRef.current = 0;
    setShieldCracks(0);
    const nextShield = shieldRef.current - 1;
    shieldRef.current = nextShield;
    setShield(nextShield);
    setStreak(0);
    if (!options.skipMistake) {
      setStats((current) => ({ ...current, mistakes: current.mistakes + 1 }));
    }
    pulse("bad");
    updateFeedback(reason);

    if (nextShield <= 0) {
      setMode("gameover");
      modeRef.current = "gameover";
      stopBackgroundTrack();
      updateFeedback("The shield collapsed. Reset and try to hold the line longer.");
    }
  }

  function punishFriendlyFire(debrisItem) {
    playShatterSound();
    setStreak(0);
    streakRef.current = 0;
    setStats((current) => ({ ...current, mistakes: current.mistakes + 1 }));
    pulse("bad");

    if (shieldCracksRef.current > 0) {
      shieldCracksRef.current = 0;
      setShieldCracks(0);
      damageShield(`Second friendly-fire hit: ${debrisItem.text} shattered a shield segment.`, {
        skipSound: true,
        skipMistake: true,
      });
      return;
    }

    shieldCracksRef.current = 1;
    setShieldCracks(1);
    updateFeedback(`Careful: ${debrisItem.text} was correct. One more friendly-fire hit will break a shield segment.`);
  }

  function rewardDock(debrisItem) {
    if (!debrisItem.correctId || completedCorrectIdsRef.current.has(debrisItem.correctId)) return;

    playCorrectDockSound();
    const nextStreak = streakRef.current + 1;
    const points = 45 * getMultiplier(nextStreak);
    const prompt = PROMPT_SETS[promptIndexRef.current];
    const nextCompleted = new Set(completedCorrectIdsRef.current);
    nextCompleted.add(debrisItem.correctId);

    completedCorrectIdsRef.current = nextCompleted;
    streakRef.current = nextStreak;
    scoreRef.current += points;
    setCompletedCorrectIds([...nextCompleted]);
    setStreak(nextStreak);
    setScore(scoreRef.current);
    setStats((current) => ({ ...current, docked: current.docked + 1 }));
    pulse("good");
    updateFeedback(`${debrisItem.text} clicked into place. ${prompt.note}.`);

    if (nextCompleted.size >= prompt.correctEndings.length) {
      launchNextPromptSet();
    }
  }

  function rewardShot(debrisItem) {
    const nextStreak = streakRef.current + 1;
    const points = 25 * getMultiplier(nextStreak);
    streakRef.current = nextStreak;
    scoreRef.current += points;
    setStreak(nextStreak);
    setScore(scoreRef.current);
    setStats((current) => ({ ...current, protected: current.protected + 1 }));
    updateFeedback(`${debrisItem.text} neutralised. Keep the correct -ing forms alive.`);
  }

  function fireProjectile() {
    playBlasterSound();
    const projectile = {
      id: `bolt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: shipXRef.current + SHIP_MUZZLE_X,
      y: shipYRef.current - SHIP_HEIGHT / 2 + SHIP_MUZZLE_Y - PROJECTILE_HEIGHT / 2,
      speed: PROJECTILE_SPEED,
    };
    const nextProjectiles = [...projectilesRef.current, projectile];
    projectilesRef.current = nextProjectiles;
    setProjectiles(nextProjectiles);
  }

  function startGame() {
    if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    if (promptTransitionRef.current) window.clearTimeout(promptTransitionRef.current);
    promptTransitionRef.current = null;
    keysRef.current.clear();
    lastFrameRef.current = performance.now();
    spawnTimerRef.current = 0;
    pendingPromptLaunchRef.current = false;
    debrisRef.current = [];
    projectilesRef.current = [];
    shipXRef.current = SHIP_X;
    shipYRef.current = stageSizeRef.current.height / 2;
    modeRef.current = "playing";
    basePhaseRef.current = "active";
    pendingPromptLaunchRef.current = false;
    completedCorrectIdsRef.current = new Set();
    shieldRef.current = MAX_SHIELD;
    shieldCracksRef.current = 0;
    streakRef.current = 0;
    scoreRef.current = 0;
    promptOrderRef.current = buildPromptOrder();
    promptOrderCursorRef.current = 1;
    promptIndexRef.current = promptOrderRef.current[0] ?? 0;

    setMode("playing");
    setDebris([]);
    setProjectiles([]);
    setShipX(SHIP_X);
    setShipY(stageSizeRef.current.height / 2);
    setRound(1);
    setScore(0);
    setStreak(0);
    setShield(MAX_SHIELD);
    setShieldCracks(0);
    setPromptIndex(promptIndexRef.current);
    setBasePhase("active");
    setCompletedCorrectIds([]);
    setFlash("idle");
    setStats({ protected: 0, docked: 0, mistakes: 0 });
    statsRef.current = { protected: 0, docked: 0, mistakes: 0 };
    setFeedback("The first wave is incoming.");
    playBackgroundTrack();
    stageRef.current?.focus();
  }

  function tick(now) {
    if (modeRef.current !== "playing") return;

    const dt = Math.min(0.032, (now - lastFrameRef.current) / 1000 || 0);
    lastFrameRef.current = now;

    let nextShipX = shipXRef.current;
    let nextShipY = shipYRef.current;
    const stage = stageSizeRef.current;
    const keys = keysRef.current;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) nextShipX -= 360 * dt;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) nextShipX += 360 * dt;
    if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) nextShipY -= 360 * dt;
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) nextShipY += 360 * dt;
    nextShipX = clampToStage(nextShipX, 10, stage.width - SHIP_WIDTH - 18);
    nextShipY = clampToStage(nextShipY, 42, stage.height - 42);

    if (basePhaseRef.current === "active") {
      spawnTimerRef.current -= dt * 1000;
    }
    let nextDebris = debrisRef.current.map((item) => ({
      ...item,
      x: item.x - item.speed * dt,
      y: clamp(
        item.y + Math.sin(now / item.driftRate + item.wobble) * item.drift * item.driftDirection * dt,
        DEBRIS_TOP_BOUND,
        stage.height - DEBRIS_HEIGHT - DEBRIS_BOTTOM_PADDING,
      ),
    }));

    if (
      basePhaseRef.current === "active" &&
      spawnTimerRef.current <= 0 &&
      nextDebris.length < getMaxActiveDebris(getDifficultyLevel(statsRef.current))
    ) {
      const unavailableCorrectIds = new Set(completedCorrectIdsRef.current);
      nextDebris.forEach((item) => {
        if (item.correctId) unavailableCorrectIds.add(item.correctId);
      });
      nextDebris = [
        ...nextDebris,
        makeDebris(
          PROMPT_SETS[promptIndexRef.current],
          getDifficultyLevel(statsRef.current),
          stage,
          unavailableCorrectIds,
          nextDebris,
        ),
      ];
      spawnTimerRef.current = getSpawnDelay(getDifficultyLevel(statsRef.current));
    }

    let nextProjectiles = projectilesRef.current
      .map((projectile) => ({ ...projectile, x: projectile.x + projectile.speed * dt }))
      .filter((projectile) => projectile.x < stage.width - PROJECTILE_WIDTH / 2);

    const hitDebrisIds = new Set();
    const hitProjectileIds = new Set();

    for (const projectile of nextProjectiles) {
      for (const item of nextDebris) {
        if (hitDebrisIds.has(item.id)) continue;
        const projectileCenterX = projectile.x + PROJECTILE_WIDTH / 2;
        const projectileCenterY = projectile.y + PROJECTILE_HEIGHT / 2;
        const debrisCenterX = item.x + item.width / 2;
        const debrisCenterY = item.y + DEBRIS_HEIGHT / 2;
        const dx = Math.abs(projectileCenterX - debrisCenterX);
        const dy = Math.abs(projectileCenterY - debrisCenterY);
        if (dx < item.width / 2 + PROJECTILE_WIDTH / 2 && dy < DEBRIS_HEIGHT / 2) {
          hitDebrisIds.add(item.id);
          hitProjectileIds.add(projectile.id);
          if (item.isGood) {
            showShotEffect("friendly", item.x + item.width / 2, item.y + DEBRIS_HEIGHT / 2);
            punishFriendlyFire(item);
          } else {
            showShotEffect("enemy", item.x + item.width / 2, item.y + DEBRIS_HEIGHT / 2);
            rewardShot(item);
          }
          break;
        }
      }
    }

    nextDebris = nextDebris.filter((item) => !hitDebrisIds.has(item.id));
    nextProjectiles = nextProjectiles.filter((projectile) => !hitProjectileIds.has(projectile.id));

    const dockedOrDamagedIds = new Set();
    for (const item of nextDebris) {
      if (item.x <= DOCK_LINE_X) {
        dockedOrDamagedIds.add(item.id);
        if (item.isGood && basePhaseRef.current === "active") {
          showDockEffect("good", item.y + DEBRIS_HEIGHT / 2);
          rewardDock(item);
        } else {
          showDockEffect("bad", item.y + DEBRIS_HEIGHT / 2);
          damageShield(`${item.text} hit the gate. Bad endings drain the shield.`);
        }
      }
    }

    nextDebris = nextDebris.filter((item) => !dockedOrDamagedIds.has(item.id));
    if (pendingPromptLaunchRef.current && nextDebris.length === 0) {
      beginPromptDeparture();
    }
    syncFrame(nextDebris, nextProjectiles, nextShipX, nextShipY);
    animationRef.current = window.requestAnimationFrame(tick);
  }

  const dockedEndingLabels = promptItem.correctEndings
    .filter((ending) => completedCorrectIds.includes(ending.id))
    .map((ending) => ending.text.replace("...", ""));
  const promptCompletion = dockedEndingLabels.length
    ? `${promptItem.prompt} ${dockedEndingLabels[dockedEndingLabels.length - 1]}`
    : promptItem.note;

  return (
    <div className="syntax-sentinel-page">
      <Seo
        title="The Syntax Sentinel | Seif Hub"
        description="Protect the prompt by blasting bad grammar endings and letting correct endings pass through."
      />

      <div className="sentinel-topbar">
        <button className="sentinel-back" type="button" onClick={() => navigate(getSitePath("/games"))}>
          Back
        </button>
        <div className="sentinel-title-lockup">
          <span>Games</span>
          <h1>The Syntax Sentinel</h1>
        </div>
        <div className="sentinel-topbar-actions">
          <button className="sentinel-expand-toggle" type="button" onClick={isExpanded ? () => setIsExpanded(false) : openExpandedView}>
            {isExpanded ? "Close" : "Full screen"}
          </button>
          <button className="sentinel-restart" type="button" onClick={startGame}>
            {mode === "playing" ? "Reset" : "Start"}
          </button>
        </div>
      </div>

      <div className={`sentinel-game-shell ${isExpanded ? "expanded" : ""}`}>
        <section className="sentinel-mobile-landscape-card">
          <span>Mobile play mode</span>
          <h2>Open the landscape cockpit</h2>
          <p>
            This game needs a wide arena. Open the larger play view, then rotate your phone sideways for the best
            controls and phrase spacing.
          </p>
          <button type="button" onClick={openExpandedView}>
            Open landscape mode
          </button>
        </section>

        {isExpanded ? (
          <button className="sentinel-expanded-close" type="button" onClick={() => setIsExpanded(false)}>
            Close
          </button>
        ) : null}
        <div
          ref={gameZoomRef}
          className="sentinel-game-zoom"
          style={
            isExpanded
              ? { "--expanded-base-width": `${expandedBaseWidth}px`, "--expanded-scale": expandedScale }
              : undefined
          }
        >
          <div className="sentinel-hud" aria-label="Game status">
            <span>Score {score}</span>
            <span>Streak {streak}</span>
            <span>Multiplier {formatMultiplier(streak)}</span>
            <span className="sentinel-shield-meter">
              <b>Shield</b>
              <i aria-label={`${shield} shield units remaining`}>
                {Array.from({ length: MAX_SHIELD }, (_, index) => (
                  <em
                    key={index}
                    className={[
                      index < shield ? "charged" : "",
                      shieldCracks > 0 && index === shield - 1 ? "cracked" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ))}
              </i>
            </span>
          </div>

          <main
            ref={stageRef}
            className={`sentinel-stage ${flash}`}
            tabIndex={0}
            aria-label="The Syntax Sentinel game stage"
          >
        <div className="sentinel-atmosphere" aria-hidden="true" />
        <div className="sentinel-grid" aria-hidden="true" />
        <div className="sentinel-stars" />
        <div className="sentinel-particles near" aria-hidden="true" />
        <div className="sentinel-particles far" aria-hidden="true" />
        <div className="sentinel-stream-lines" aria-hidden="true" />
        <img className="sentinel-dock-mouth" src={DOCK_ASSET} alt="" draggable="false" />
        {dockEffect ? (
          <span
            key={dockEffect.id}
            className={`sentinel-dock-effect ${dockEffect.type}`}
            style={{ left: `${DOCK_LINE_X - 24}px`, top: `${dockEffect.y - 24}px` }}
          />
        ) : null}
        <div className="sentinel-round-badge">Round {round}</div>
        <div className={`sentinel-prompt-base phase-${basePhase}`}>
          <small>Prompt Core</small>
          <strong>{promptItem.prompt}</strong>
          <em>{mode === "playing" && flash === "good" ? promptCompletion : promptItem.note}</em>
          <div className="sentinel-prompt-progress" aria-label="Prompt endings completed">
            {promptItem.correctEndings.map((ending) => (
              <span
                key={ending.id}
                className={completedCorrectIds.includes(ending.id) ? "complete" : ""}
                title={ending.text}
              />
            ))}
          </div>
        </div>

        <div className="sentinel-dpad-shell" aria-hidden="true">
          <span />
        </div>
        <button
          type="button"
          className="sentinel-ship-control up"
          aria-label="Move up"
          onPointerDown={() => keysRef.current.add("ArrowUp")}
          onPointerUp={() => keysRef.current.delete("ArrowUp")}
          onPointerLeave={() => keysRef.current.delete("ArrowUp")}
        >
          ▲
        </button>
        <button
          type="button"
          className="sentinel-ship-control left"
          aria-label="Move left"
          onPointerDown={() => keysRef.current.add("ArrowLeft")}
          onPointerUp={() => keysRef.current.delete("ArrowLeft")}
          onPointerLeave={() => keysRef.current.delete("ArrowLeft")}
        >
          ◀
        </button>
        <button
          type="button"
          className="sentinel-ship-control right"
          aria-label="Move right"
          onPointerDown={() => keysRef.current.add("ArrowRight")}
          onPointerUp={() => keysRef.current.delete("ArrowRight")}
          onPointerLeave={() => keysRef.current.delete("ArrowRight")}
        >
          ▶
        </button>
        <button
          type="button"
          className="sentinel-ship-control down"
          aria-label="Move down"
          onPointerDown={() => keysRef.current.add("ArrowDown")}
          onPointerUp={() => keysRef.current.delete("ArrowDown")}
          onPointerLeave={() => keysRef.current.delete("ArrowDown")}
        >
          ▼
        </button>
        <button type="button" className="sentinel-fire-control" onClick={fireProjectile} aria-label="Fire">
          <span aria-hidden="true" />
          <b>Fire</b>
        </button>

        <div className="sentinel-ship" style={{ transform: `translate(${shipX}px, ${shipY - SHIP_HEIGHT / 2}px)` }}>
          <img src={SHIP_ASSET} alt="" draggable="false" />
          <span className="sentinel-ship-muzzle" />
        </div>

        {projectiles.map((projectile) => (
          <span
            key={projectile.id}
            className="sentinel-bolt"
            style={{ transform: `translate(${projectile.x}px, ${projectile.y}px)` }}
          />
        ))}

        {shotEffect ? (
          <span
            key={shotEffect.id}
            className={`sentinel-shot-effect ${shotEffect.type}`}
            style={{ left: `${shotEffect.x - 26}px`, top: `${shotEffect.y - 26}px` }}
          />
        ) : null}

        {debris.map((item) => (
          <span
            key={item.id}
            className="sentinel-debris syntax-fragment"
            style={{ width: `${item.width}px`, transform: `translate(${item.x}px, ${item.y}px)` }}
          >
            {item.text}
          </span>
        ))}

        {mode !== "playing" ? (
          <div className="sentinel-overlay">
            <div>
              <span className="sentinel-overlay-kicker">{mode === "gameover" ? "Signal lost" : "Prototype ready"}</span>
              <h2>{mode === "gameover" ? "Shield breached" : "Guard the grammar core"}</h2>
              <p>{feedback}</p>
              <button type="button" onClick={startGame}>
                {mode === "gameover" ? "Try again" : "Launch"}
              </button>
            </div>
          </div>
        ) : null}
          </main>

          <section className="sentinel-readout">
            <p>{feedback}</p>
            <div>
              <span>Bad endings cleared: {stats.protected}</span>
              <span>Good endings docked: {stats.docked}</span>
              <span>Needed here: {remainingCorrectCount}</span>
              <span>Mistakes: {stats.mistakes}</span>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .syntax-sentinel-page {
          min-height: 100vh;
          padding: 1.1rem clamp(0.75rem, 3vw, 2rem) 2rem;
          color: #f7fbff;
          background:
            radial-gradient(circle at 12% 18%, rgba(63, 220, 184, 0.22), transparent 28%),
            radial-gradient(circle at 82% 10%, rgba(255, 199, 85, 0.2), transparent 25%),
            linear-gradient(135deg, #10131d 0%, #182638 48%, #231828 100%);
        }

        .sentinel-topbar {
          width: min(100%, ${GAME_WIDTH}px);
          margin: 0 auto 0.8rem;
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr) minmax(150px, auto);
          align-items: center;
          gap: 0.75rem;
        }

        .sentinel-title-lockup {
          text-align: center;
          min-width: 0;
        }

        .sentinel-title-lockup span {
          display: block;
          font-size: 0.76rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7ee8cc;
        }

        .sentinel-title-lockup h1 {
          margin: 0.12rem 0 0;
          font-size: clamp(1.7rem, 2.8rem, 2.8rem);
          line-height: 1;
          color: #fff6d9;
          text-shadow: 0 3px 0 rgba(0, 0, 0, 0.26);
        }

        .sentinel-back,
        .sentinel-expand-toggle,
        .sentinel-restart,
        .sentinel-expanded-close,
        .sentinel-overlay button,
        .sentinel-fire-control,
        .sentinel-ship-control {
          border: 0;
          border-radius: 8px;
          font-weight: 900;
          cursor: pointer;
          color: #10131d;
          background: linear-gradient(180deg, #f8d35d, #f49b45);
          box-shadow: 0 8px 0 rgba(0, 0, 0, 0.18);
        }

        .sentinel-back,
        .sentinel-expand-toggle,
        .sentinel-expanded-close,
        .sentinel-restart {
          min-height: 44px;
        }

        .sentinel-topbar-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .sentinel-expand-toggle,
        .sentinel-restart {
          padding: 0 0.85rem;
        }

        .sentinel-mobile-landscape-card {
          display: none;
        }

        .sentinel-game-shell.expanded {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          align-items: start;
          justify-items: center;
          padding: clamp(0.8rem, 2vw, 1.4rem);
          overflow: auto;
          background:
            radial-gradient(circle at 20% 20%, rgba(126, 232, 204, 0.18), transparent 28%),
            radial-gradient(circle at 80% 10%, rgba(178, 104, 255, 0.14), transparent 30%),
            rgba(5, 8, 15, 0.92);
          backdrop-filter: blur(8px);
        }

        .sentinel-expanded-close {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 2;
          padding: 0 1rem;
        }

        .sentinel-game-zoom {
          width: min(100%, ${GAME_WIDTH}px);
          transform-origin: top center;
        }

        .sentinel-game-shell.expanded .sentinel-game-zoom {
          width: var(--expanded-base-width, ${GAME_WIDTH}px);
          max-width: none;
          transform: scale(var(--expanded-scale, 1.16));
          margin-top: 1.2rem;
        }

        .sentinel-game-shell.expanded .sentinel-stage {
          width: 100%;
          height: calc(var(--expanded-base-width, ${GAME_WIDTH}px) * ${GAME_HEIGHT / GAME_WIDTH});
          min-height: 0;
          max-height: none;
          aspect-ratio: auto;
        }

        .sentinel-hud {
          width: min(100%, ${GAME_WIDTH}px);
          margin: 0 auto 0.45rem;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .sentinel-hud span {
          min-width: 0;
          border-radius: 8px;
          padding: 0.48rem 0.65rem;
          background: rgba(10, 14, 24, 0.74);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 0 18px rgba(126, 232, 204, 0.04), 0 10px 22px rgba(0, 0, 0, 0.18);
          font-size: 0.88rem;
          font-weight: 900;
          text-align: center;
          white-space: nowrap;
        }

        .sentinel-shield-meter {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
        }

        .sentinel-shield-meter b {
          font: inherit;
        }

        .sentinel-shield-meter i {
          display: grid;
          grid-template-columns: repeat(${MAX_SHIELD}, 1fr);
          gap: 3px;
          width: min(48%, 92px);
          min-width: 62px;
          height: 10px;
          padding: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        .sentinel-shield-meter em {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
        }

        .sentinel-shield-meter em.charged {
          background: linear-gradient(90deg, #60f7ff, #7ee8cc);
          box-shadow: 0 0 10px rgba(126, 232, 204, 0.62);
        }

        .sentinel-shield-meter em.cracked {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(120deg, transparent 0 38%, rgba(255, 246, 217, 0.98) 39% 45%, transparent 46% 100%),
            linear-gradient(90deg, #60f7ff, #7ee8cc);
          box-shadow:
            0 0 12px rgba(255, 246, 217, 0.62),
            0 0 14px rgba(126, 232, 204, 0.46);
          animation: shieldCrackPulse 0.8s ease-in-out infinite;
        }

        .sentinel-shield-meter em.cracked::after {
          content: "";
          position: absolute;
          inset: -1px 35% -1px auto;
          width: 2px;
          background: rgba(20, 24, 34, 0.72);
          transform: rotate(24deg);
          box-shadow:
            5px 3px 0 rgba(20, 24, 34, 0.56),
            -4px 5px 0 rgba(255, 246, 217, 0.7);
        }

        .sentinel-stage {
          position: relative;
          width: min(100%, ${GAME_WIDTH}px);
          aspect-ratio: ${GAME_WIDTH} / ${GAME_HEIGHT};
          max-height: calc(100vh - 250px);
          min-height: 360px;
          margin: 0 auto;
          overflow: hidden;
          outline: none;
          border: 3px solid rgba(247, 251, 255, 0.22);
          border-radius: 8px;
          background:
            radial-gradient(circle at 16% 48%, rgba(80, 255, 220, 0.16), transparent 28%),
            radial-gradient(circle at 72% 82%, rgba(164, 86, 255, 0.13), transparent 35%),
            radial-gradient(circle at 55% 18%, rgba(78, 126, 255, 0.08), transparent 32%),
            linear-gradient(180deg, #0f1c30 0%, #141d31 48%, #22172d 100%);
          box-shadow: 0 24px 58px rgba(0, 0, 0, 0.35);
        }

        .sentinel-stage.good {
          box-shadow: 0 0 0 4px rgba(78, 244, 162, 0.5), 0 24px 58px rgba(0, 0, 0, 0.35);
        }

        .sentinel-stage.bad {
          box-shadow: 0 0 0 4px rgba(255, 91, 91, 0.58), 0 24px 58px rgba(0, 0, 0, 0.35);
        }

        .sentinel-atmosphere,
        .sentinel-grid,
        .sentinel-stars,
        .sentinel-particles,
        .sentinel-stream-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .sentinel-atmosphere {
          z-index: 0;
          background:
            linear-gradient(90deg, rgba(120, 255, 240, 0.14), rgba(166, 82, 255, 0.055) 18%, transparent 42%),
            radial-gradient(circle at 20% 42%, rgba(120, 255, 224, 0.2), transparent 30%),
            radial-gradient(circle at 84% 20%, rgba(94, 144, 255, 0.08), transparent 24%);
          filter: blur(10px);
          opacity: 0.7;
          animation: dockWakePulse 4.8s ease-in-out infinite;
        }

        .sentinel-grid {
          z-index: 0;
          background:
            linear-gradient(rgba(120, 255, 240, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 255, 240, 0.018) 1px, transparent 1px),
            linear-gradient(115deg, transparent 0 48%, rgba(176, 118, 255, 0.026) 49%, transparent 50% 100%);
          background-size: 170px 112px, 170px 112px, 260px 260px;
          opacity: 0.22;
          transform: perspective(520px) rotateX(0deg);
          animation: gridDrift 10s linear infinite;
        }

        .sentinel-stars {
          z-index: 0;
          background-image:
            radial-gradient(circle, rgba(255,255,255,.78) 1px, transparent 1.7px),
            radial-gradient(circle, rgba(126,232,204,.6) 1px, transparent 1.5px),
            radial-gradient(circle, rgba(195,156,255,.5) 1px, transparent 1.5px);
          background-position: 17px 23px, 73px 41px, 28px 76px;
          background-size: 160px 116px, 230px 170px, 310px 210px;
          animation: sentinelStarDrift 15s linear infinite;
          opacity: 0.45;
        }

        .sentinel-particles {
          z-index: 1;
          opacity: 0.36;
          background-repeat: repeat;
          mix-blend-mode: screen;
        }

        .sentinel-particles.far {
          background-image:
            radial-gradient(circle, rgba(120, 255, 240, 0.62) 1px, transparent 1.8px),
            radial-gradient(circle, rgba(247, 240, 211, 0.32) 1px, transparent 1.8px);
          background-position: 31px 18px, 120px 92px;
          background-size: 260px 190px, 340px 250px;
          animation: particleDriftFar 18s linear infinite;
        }

        .sentinel-particles.near {
          background-image:
            radial-gradient(circle, rgba(178, 104, 255, 0.42) 1px, transparent 2px),
            radial-gradient(circle, rgba(120, 255, 240, 0.34) 1px, transparent 2px);
          background-position: 80px 130px, 210px 24px;
          background-size: 290px 180px, 410px 260px;
          animation: particleDriftNear 7s linear infinite;
          opacity: 0.24;
        }

        .sentinel-stream-lines {
          z-index: 1;
          opacity: 0.24;
          background:
            linear-gradient(90deg, transparent 0 18%, rgba(126, 232, 204, 0.12) 20%, transparent 28%),
            linear-gradient(90deg, transparent 0 58%, rgba(178, 104, 255, 0.09) 60%, transparent 70%);
          background-size: 620px 100%, 920px 100%;
          filter: blur(0.8px);
          mix-blend-mode: screen;
          animation: syntaxStreamRush 7s linear infinite;
        }

        .sentinel-stream-lines::before {
          content: "-ing   to   if   that   []   {}";
          position: absolute;
          inset: 0;
          display: block;
          color: rgba(126, 232, 204, 0.075);
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 2.6rem;
          white-space: nowrap;
          transform: translateX(100%);
          animation: syntaxGlyphDrift 9s linear infinite;
        }

        .sentinel-dock-mouth {
          position: absolute;
          left: ${DOCK_LEFT}px;
          top: 50%;
          z-index: 5;
          width: ${DOCK_WIDTH}px;
          height: calc(100% + 18px);
          max-width: none;
          transform: translateY(-50%);
          object-fit: contain;
          object-position: left center;
          filter: drop-shadow(8px 0 18px rgba(0, 0, 0, 0.38));
          animation: dockTravelHum 2.8s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }

        .sentinel-dock-effect {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 7;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          pointer-events: none;
          animation: dockBurst 0.52s ease-out forwards;
        }

        .sentinel-dock-effect::before,
        .sentinel-dock-effect::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
        }

        .sentinel-dock-effect.good {
          background: radial-gradient(circle, rgba(126, 255, 204, 0.9), rgba(126, 255, 204, 0.24) 42%, transparent 68%);
          box-shadow: 0 0 28px rgba(126, 255, 204, 0.72);
        }

        .sentinel-dock-effect.good::before {
          border: 2px solid rgba(126, 255, 204, 0.8);
          animation: dockRing 0.52s ease-out forwards;
        }

        .sentinel-dock-effect.good::after {
          background:
            linear-gradient(90deg, transparent 46%, rgba(247, 255, 235, 0.85) 48% 52%, transparent 54%),
            linear-gradient(0deg, transparent 46%, rgba(247, 255, 235, 0.72) 48% 52%, transparent 54%);
          filter: blur(0.2px);
        }

        .sentinel-dock-effect.bad {
          background: radial-gradient(circle, rgba(255, 83, 130, 0.92), rgba(255, 83, 130, 0.22) 40%, transparent 70%);
          box-shadow: 0 0 30px rgba(255, 83, 130, 0.7);
        }

        .sentinel-dock-effect.bad::before {
          border: 2px solid rgba(255, 83, 130, 0.86);
          animation: dockRing 0.52s ease-out forwards;
        }

        .sentinel-dock-effect.bad::after {
          clip-path: polygon(50% 0, 61% 37%, 100% 44%, 66% 59%, 76% 100%, 50% 70%, 22% 100%, 34% 59%, 0 44%, 39% 37%);
          background: rgba(255, 245, 206, 0.88);
          transform: scale(0.42);
        }

        .sentinel-round-badge {
          position: absolute;
          top: calc(50% - ${BASE_HEIGHT / 2}px - 34px);
          left: ${DOCK_LINE_X - BASE_WIDTH - 12}px;
          z-index: 4;
          min-width: 82px;
          padding: 0.28rem 0.52rem;
          border-radius: 999px;
          border: 1px solid rgba(248, 211, 93, 0.42);
          background:
            linear-gradient(180deg, rgba(59, 44, 18, 0.72), rgba(13, 18, 28, 0.58));
          box-shadow:
            0 0 16px rgba(248, 211, 93, 0.14),
            inset 0 0 14px rgba(248, 211, 93, 0.06);
          color: #f8d35d;
          font-size: 0.62rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-align: center;
          text-transform: uppercase;
          pointer-events: none;
        }

        .sentinel-prompt-base {
          position: absolute;
          top: 50%;
          left: ${DOCK_LINE_X - BASE_WIDTH - 12}px;
          z-index: 3;
          width: ${BASE_WIDTH}px;
          height: ${BASE_HEIGHT}px;
          box-sizing: border-box;
          padding: 0.78rem 0.62rem;
          transform: translateY(-50%);
          border: 1px solid rgba(180, 255, 246, 0.34);
          border-radius: 6px;
          background: rgba(8, 18, 26, 0.24);
          box-shadow: inset 0 0 28px rgba(126, 232, 204, 0.1);
          opacity: 1;
          transition:
            transform 0.82s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.52s ease,
            filter 0.52s ease;
          overflow: hidden;
          backdrop-filter: blur(0.5px);
          will-change: transform, opacity;
        }

        .sentinel-prompt-base.phase-departing {
          transform: translate(-135%, -50%) scale(0.96);
          opacity: 0;
          filter: blur(1px);
        }

        .sentinel-prompt-base.phase-arriving {
          transform: translateY(-50%);
          opacity: 1;
          filter: none;
          animation: promptDockIn ${PROMPT_ARRIVE_DELAY_MS}ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .sentinel-prompt-base small,
        .sentinel-prompt-base em {
          display: block;
          color: rgba(247, 251, 255, 0.68);
          font-style: normal;
          font-size: 0.62rem;
          font-weight: 800;
          transition: opacity 0.28s ease;
        }

        .sentinel-prompt-base strong {
          display: block;
          margin: 0.22rem 0;
          font-size: 0.98rem;
          line-height: 1.05;
          color: #fff6d9;
          transition: opacity 0.28s ease;
        }

        .sentinel-prompt-progress {
          position: absolute;
          left: 0.62rem;
          right: 0.62rem;
          bottom: 0.5rem;
          display: flex;
          gap: 0.32rem;
        }

        .sentinel-prompt-progress span {
          flex: 1;
          height: 6px;
          border-radius: 999px;
          background: rgba(247, 251, 255, 0.2);
          border: 1px solid rgba(247, 251, 255, 0.18);
        }

        .sentinel-prompt-progress span.complete {
          background: #7ee8cc;
          border-color: rgba(126, 232, 204, 0.88);
          box-shadow: 0 0 10px rgba(126, 232, 204, 0.52);
        }

        .sentinel-ship {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 5;
          width: ${SHIP_WIDTH}px;
          height: ${SHIP_HEIGHT}px;
          transition: transform 36ms linear;
          pointer-events: none;
        }

        .sentinel-ship img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.35));
          animation: sentinelHover 1.65s ease-in-out infinite;
          user-select: none;
        }

        .sentinel-ship-muzzle {
          position: absolute;
          left: ${SHIP_MUZZLE_X - 7}px;
          top: ${SHIP_MUZZLE_Y - 5}px;
          z-index: 2;
          width: 14px;
          height: 10px;
          border-radius: 999px;
          background: #f8d35d;
          box-shadow: 0 0 14px rgba(248, 211, 93, 0.85);
        }

        .sentinel-bolt {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 6;
          width: ${PROJECTILE_WIDTH}px;
          height: ${PROJECTILE_HEIGHT}px;
          border-radius: 999px;
          background: #f8d35d;
          box-shadow: 0 0 16px rgba(248, 211, 93, 0.9);
        }

        .sentinel-shot-effect {
          position: absolute;
          z-index: 7;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          pointer-events: none;
          animation: shotPop 0.46s ease-out forwards;
        }

        .sentinel-shot-effect::before,
        .sentinel-shot-effect::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
        }

        .sentinel-shot-effect.enemy {
          background:
            radial-gradient(circle, rgba(255, 230, 92, 0.95), rgba(255, 142, 67, 0.28) 36%, transparent 70%);
          box-shadow:
            0 0 22px rgba(255, 199, 85, 0.72),
            0 0 38px rgba(120, 255, 240, 0.26);
        }

        .sentinel-shot-effect.enemy::before {
          inset: 9px;
          border: 2px solid rgba(120, 255, 240, 0.76);
          animation: shotRing 0.46s ease-out forwards;
        }

        .sentinel-shot-effect.enemy::after {
          background:
            linear-gradient(90deg, transparent 45%, rgba(255, 246, 217, 0.88) 47% 53%, transparent 55%),
            linear-gradient(0deg, transparent 45%, rgba(255, 246, 217, 0.72) 47% 53%, transparent 55%);
          transform: rotate(20deg) scale(0.72);
        }

        .sentinel-shot-effect.friendly {
          background:
            radial-gradient(circle, rgba(255, 83, 130, 0.92), rgba(255, 83, 130, 0.22) 40%, transparent 72%);
          box-shadow:
            0 0 24px rgba(255, 83, 130, 0.74),
            0 0 34px rgba(255, 230, 92, 0.2);
          animation-name: shotWarningPop;
        }

        .sentinel-shot-effect.friendly::before {
          inset: 8px;
          border: 2px dashed rgba(255, 246, 217, 0.82);
          animation: shotRing 0.46s ease-out forwards;
        }

        .sentinel-shot-effect.friendly::after {
          inset: 12px;
          border-radius: 0;
          background: rgba(255, 246, 217, 0.9);
          clip-path: polygon(46% 0, 58% 0, 56% 58%, 48% 58%, 46% 0, 44% 74%, 60% 74%, 60% 90%, 44% 90%, 44% 74%);
          transform: scale(1.05);
        }

        .sentinel-debris {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 3;
          height: ${DEBRIS_HEIGHT}px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.34rem 0.58rem;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: #f7f0d3;
          text-align: center;
          white-space: nowrap;
          will-change: transform;
        }

        .syntax-fragment {
          overflow: hidden;
          border: 2px solid rgba(210, 225, 215, 0.58);
          background:
            linear-gradient(180deg, rgba(30, 43, 62, 0.94), rgba(12, 19, 32, 0.96));
          clip-path: polygon(
            10px 0,
            calc(100% - 10px) 0,
            100% 10px,
            100% calc(100% - 10px),
            calc(100% - 10px) 100%,
            10px 100%,
            0 calc(100% - 10px),
            0 10px
          );
          box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.24),
            0 0 18px rgba(105, 244, 232, 0.12),
            inset 0 0 18px rgba(105, 244, 232, 0.07);
        }

        .syntax-fragment::before {
          content: "";
          position: absolute;
          inset: 5px;
          border: 1px solid rgba(126, 232, 204, 0.16);
          clip-path: inherit;
          pointer-events: none;
        }

        .syntax-fragment::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(115, 255, 240, 0.16),
            transparent
          );
          transform: translateX(-125%);
          animation: syntaxScan 3.2s ease-in-out infinite;
          pointer-events: none;
        }

        .syntax-fragment.is-destroyed {
          border-color: rgba(255, 85, 140, 0.95);
          animation: fragmentBreak 0.22s ease-out forwards;
        }

        .syntax-fragment.is-docking {
          border-color: rgba(120, 255, 190, 0.95);
          box-shadow:
            0 0 24px rgba(120, 255, 190, 0.35),
            inset 0 0 22px rgba(120, 255, 190, 0.14);
        }

        .sentinel-overlay {
          position: absolute;
          inset: 0;
          z-index: 8;
          display: grid;
          place-items: center;
          padding: 1rem;
          background: rgba(8, 10, 18, 0.64);
          backdrop-filter: blur(4px);
        }

        .sentinel-overlay > div {
          width: min(92%, 460px);
          padding: 1.25rem;
          border-radius: 8px;
          background: rgba(16, 24, 39, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        .sentinel-overlay-kicker {
          color: #7ee8cc;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sentinel-overlay h2 {
          margin: 0.25rem 0 0.55rem;
          color: #fff6d9;
          font-size: 2rem;
          line-height: 1.05;
        }

        .sentinel-overlay p {
          margin: 0 0 1rem;
          color: rgba(247, 251, 255, 0.82);
          line-height: 1.45;
        }

        .sentinel-overlay button {
          min-height: 44px;
          padding: 0 1.25rem;
        }

        .sentinel-dpad-shell,
        .sentinel-ship-control,
        .sentinel-fire-control {
          display: none;
          position: absolute;
          z-index: 7;
        }

        .sentinel-dpad-shell {
          pointer-events: none;
        }

        .sentinel-ship-control.up {
          left: 12px;
          bottom: 122px;
        }

        .sentinel-ship-control.left {
          left: 12px;
          bottom: 68px;
        }

        .sentinel-ship-control.right {
          left: 68px;
          bottom: 68px;
        }

        .sentinel-ship-control.down {
          left: 12px;
          bottom: 14px;
        }

        .sentinel-fire-control {
          right: 12px;
          bottom: 14px;
        }

        .sentinel-readout {
          width: min(100%, ${GAME_WIDTH}px);
          margin: 0.85rem auto 0;
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
          gap: 0.75rem;
          align-items: center;
        }

        .sentinel-readout p,
        .sentinel-readout div {
          margin: 0;
          border-radius: 8px;
          background: rgba(8, 12, 20, 0.48);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.82rem 0.95rem;
          color: rgba(247, 251, 255, 0.84);
          font-weight: 800;
        }

        .sentinel-readout div {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.5rem;
          text-align: center;
          font-size: 0.84rem;
        }

        @keyframes sentinelStarDrift {
          from { background-position: 17px 23px, 73px 41px, 28px 76px; }
          to { background-position: -303px 23px, -387px 41px, -592px 76px; }
        }

        @keyframes dockWakePulse {
          0%, 100% {
            opacity: 0.72;
            transform: translateX(0) scaleX(1);
          }

          50% {
            opacity: 0.95;
            transform: translateX(10px) scaleX(1.06);
          }
        }

        @keyframes gridDrift {
          from {
            background-position: 0 0, 0 0, 0 0;
          }

          to {
            background-position: -170px 0, -170px 0, -260px 0;
          }
        }

        @keyframes particleDriftFar {
          from {
            background-position: 31px 18px, 120px 92px;
          }

          to {
            background-position: -489px 18px, -560px 92px;
          }
        }

        @keyframes particleDriftNear {
          from {
            background-position: 80px 130px, 210px 24px;
          }

          to {
            background-position: -500px 130px, -610px 24px;
          }
        }

        @keyframes syntaxStreamRush {
          from {
            background-position: 0 0, 0 0;
          }

          to {
            background-position: -620px 0, -920px 0;
          }
        }

        @keyframes syntaxGlyphDrift {
          from {
            transform: translateX(104%);
          }

          to {
            transform: translateX(-120%);
          }
        }

        @keyframes dockTravelHum {
          0%, 100% {
            transform: translateY(-50%) translateX(0);
            filter: drop-shadow(8px 0 18px rgba(0, 0, 0, 0.38)) brightness(1);
          }

          50% {
            transform: translateY(calc(-50% - 1px)) translateX(1px);
            filter: drop-shadow(10px 0 22px rgba(126, 232, 204, 0.18)) brightness(1.06);
          }
        }

        @keyframes sentinelHover {
          0%, 100% {
            transform: translateY(0) rotate(-0.35deg);
            filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.35)) brightness(1);
          }

          50% {
            transform: translateY(-2px) rotate(0.45deg);
            filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.36)) brightness(1.05);
          }
        }

        @keyframes dockBurst {
          0% {
            opacity: 0;
            transform: scale(0.55);
            filter: brightness(1.5);
          }

          25% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: scale(1.75);
            filter: brightness(1.1) blur(1px);
          }
        }

        @keyframes dockRing {
          0% {
            transform: scale(0.55);
            opacity: 0.95;
          }

          100% {
            transform: scale(2.15);
            opacity: 0;
          }
        }

        @keyframes shotPop {
          0% {
            opacity: 0;
            transform: scale(0.42) rotate(0deg);
            filter: brightness(1.7);
          }

          28% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: scale(1.45) rotate(18deg);
            filter: brightness(1.1) blur(1px);
          }
        }

        @keyframes shotWarningPop {
          0% {
            opacity: 0;
            transform: scale(0.44) skewX(0deg);
            filter: brightness(1.8);
          }

          30% {
            opacity: 1;
            transform: scale(1.04) skewX(-8deg);
          }

          100% {
            opacity: 0;
            transform: scale(1.32) skewX(10deg);
            filter: brightness(1.3) blur(1.4px);
          }
        }

        @keyframes shotRing {
          0% {
            opacity: 0.95;
            transform: scale(0.45);
          }

          100% {
            opacity: 0;
            transform: scale(2.2);
          }
        }

        @keyframes syntaxScan {
          0%, 48% {
            transform: translateX(-125%);
          }

          68%, 100% {
            transform: translateX(125%);
          }
        }

        @keyframes promptDockIn {
          0% {
            transform: translate(-160%, -50%) scale(0.96);
            opacity: 0;
            filter: blur(1.4px);
          }

          70% {
            transform: translateY(-50%) scale(1);
            opacity: 1;
            filter: none;
          }

          82% {
            transform: translate(3px, -50%) scale(1.012);
          }

          90% {
            transform: translate(-2px, -50%) scale(0.997);
          }

          100% {
            transform: translateY(-50%) scale(1);
          }
        }

        @keyframes fragmentBreak {
          0% {
            transform: scale(1);
            opacity: 1;
            filter: brightness(1);
          }

          45% {
            transform: scale(1.06) skewX(-4deg);
            opacity: 1;
            filter: brightness(1.45);
          }

          100% {
            transform: scale(0.72) skewX(10deg);
            opacity: 0;
            filter: brightness(2) blur(2px);
          }
        }

        @keyframes shieldCrackPulse {
          0%, 100% {
            filter: brightness(1);
          }

          50% {
            filter: brightness(1.45);
          }
        }

        @media (max-width: 760px) {
          .syntax-sentinel-page {
            padding-inline: 0.6rem;
          }

          .sentinel-topbar {
            grid-template-columns: 68px minmax(0, 1fr);
          }

          .sentinel-topbar-actions {
            grid-column: 1 / -1;
            justify-content: center;
          }

          .sentinel-title-lockup h1 {
            font-size: 1.65rem;
          }

          .sentinel-game-shell:not(.expanded) .sentinel-game-zoom {
            display: none;
          }

          .sentinel-mobile-landscape-card {
            display: block;
            width: min(100%, 420px);
            margin: 0.75rem auto 1rem;
            padding: 1.1rem;
            border-radius: 14px;
            background:
              radial-gradient(circle at 16% 20%, rgba(126, 232, 204, 0.22), transparent 34%),
              linear-gradient(145deg, rgba(12, 22, 36, 0.92), rgba(20, 16, 35, 0.92));
            border: 1px solid rgba(180, 255, 246, 0.26);
            box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
          }

          .sentinel-mobile-landscape-card span {
            color: #7ee8cc;
            font-size: 0.76rem;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .sentinel-mobile-landscape-card h2 {
            margin: 0.28rem 0 0.45rem;
            color: #fff6d9;
            font-size: 1.45rem;
            line-height: 1.05;
          }

          .sentinel-mobile-landscape-card p {
            margin: 0 0 0.9rem;
            color: rgba(247, 251, 255, 0.78);
            line-height: 1.45;
          }

          .sentinel-mobile-landscape-card button {
            min-height: 48px;
            border: 0;
            border-radius: 10px;
            padding: 0 1rem;
            font-weight: 900;
            color: #10131d;
            background: linear-gradient(180deg, #f8d35d, #f49b45);
            box-shadow: 0 8px 0 rgba(0, 0, 0, 0.18);
          }

          .sentinel-game-shell.expanded {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.45rem;
            overflow: hidden;
          }

          .sentinel-game-shell.expanded .sentinel-mobile-landscape-card {
            display: none;
          }

          .sentinel-game-shell.expanded .sentinel-game-zoom {
            width: var(--expanded-base-width, calc(100vw - 28px));
            max-width: none;
            margin-top: 0;
            transform: none;
          }

          .sentinel-game-shell.expanded .sentinel-stage {
            width: 100%;
            height: calc(var(--expanded-base-width, calc(100vw - 28px)) * ${GAME_HEIGHT / GAME_WIDTH});
            min-height: 0;
            max-height: none;
            aspect-ratio: auto;
          }

          .sentinel-game-shell.expanded .sentinel-hud {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0.28rem;
            margin-bottom: 0.28rem;
          }

          .sentinel-game-shell.expanded .sentinel-hud span {
            min-height: 24px;
            border-radius: 5px;
            padding: 0.18rem 0.32rem;
            font-size: 0.56rem;
            box-shadow: none;
          }

          .sentinel-game-shell.expanded .sentinel-shield-meter {
            gap: 0.24rem;
          }

          .sentinel-game-shell.expanded .sentinel-shield-meter i {
            min-width: 34px;
            height: 7px;
            gap: 2px;
            padding: 1px;
          }

          .sentinel-game-shell.expanded .sentinel-expanded-close {
            top: 0.42rem;
            right: 0.42rem;
            min-height: 30px;
            width: 30px;
            padding: 0;
            border-radius: 999px;
            font-size: 0;
            line-height: 1;
            box-shadow: 0 5px 12px rgba(0, 0, 0, 0.25);
          }

          .sentinel-game-shell.expanded .sentinel-expanded-close::before {
            content: "×";
            font-size: 1.05rem;
            font-weight: 900;
          }

          .sentinel-prompt-base {
            width: 148px;
            min-height: 92px;
          }

          .sentinel-round-badge {
            left: ${DOCK_LINE_X - BASE_WIDTH - 12}px;
            min-width: 70px;
            padding: 0.22rem 0.42rem;
            font-size: 0.54rem;
          }

          .sentinel-prompt-base strong {
            font-size: 1.08rem;
          }

          .sentinel-debris {
            font-size: 0.72rem;
            padding: 0.32rem 0.48rem;
          }

          .sentinel-dpad-shell,
          .sentinel-ship-control,
          .sentinel-fire-control {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .sentinel-game-shell.expanded .sentinel-dpad-shell {
            left: 22px;
            bottom: 18px;
            width: 124px;
            height: 124px;
            border-radius: 38% 38% 38% 38% / 44% 44% 44% 44%;
            background:
              radial-gradient(circle at 50% 50%, rgba(129, 232, 255, 0.3), rgba(94, 143, 255, 0.13) 30%, transparent 33%),
              radial-gradient(circle at 50% 12%, rgba(126, 232, 204, 0.28), transparent 22%),
              radial-gradient(circle at 12% 50%, rgba(126, 232, 204, 0.26), transparent 22%),
              radial-gradient(circle at 88% 50%, rgba(126, 232, 204, 0.26), transparent 22%),
              radial-gradient(circle at 50% 88%, rgba(178, 104, 255, 0.28), transparent 22%),
              linear-gradient(145deg, rgba(65, 96, 151, 0.38), rgba(42, 35, 92, 0.42));
            border: 2px solid rgba(126, 232, 204, 0.58);
            box-shadow:
              0 0 22px rgba(126, 232, 204, 0.28),
              0 0 34px rgba(178, 104, 255, 0.22),
              inset 0 0 24px rgba(255, 255, 255, 0.08);
            clip-path: polygon(37% 0, 63% 0, 72% 25%, 100% 37%, 100% 63%, 72% 75%, 63% 100%, 37% 100%, 28% 75%, 0 63%, 0 37%, 28% 25%);
          }

          .sentinel-game-shell.expanded .sentinel-dpad-shell span {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: radial-gradient(circle at 40% 35%, rgba(180, 244, 255, 0.38), rgba(75, 112, 176, 0.22) 62%, rgba(26, 23, 52, 0.62));
            border: 2px solid rgba(126, 232, 204, 0.7);
            box-shadow:
              0 0 18px rgba(126, 232, 204, 0.42),
              inset 0 0 18px rgba(255, 255, 255, 0.1);
          }

          .sentinel-game-shell.expanded .sentinel-ship-control {
            width: 42px;
            height: 42px;
            min-height: 0;
            padding: 0;
            border-radius: 16px;
            color: rgba(219, 255, 249, 0.94);
            background: transparent;
            border: 0;
            box-shadow: none;
            text-shadow: 0 0 12px rgba(126, 232, 204, 0.8);
            font-size: 1.05rem;
            line-height: 1;
            -webkit-tap-highlight-color: transparent;
          }

          .sentinel-game-shell.expanded .sentinel-ship-control:active {
            color: #fff6d9;
            transform: scale(0.92);
            filter: drop-shadow(0 0 10px rgba(126, 232, 204, 0.9));
          }

          .sentinel-game-shell.expanded .sentinel-ship-control.up {
            left: 63px;
            bottom: 100px;
          }

          .sentinel-game-shell.expanded .sentinel-ship-control.left {
            left: 25px;
            bottom: 59px;
          }

          .sentinel-game-shell.expanded .sentinel-ship-control.right {
            left: 104px;
            bottom: 59px;
          }

          .sentinel-game-shell.expanded .sentinel-ship-control.down {
            left: 63px;
            bottom: 20px;
          }

          .sentinel-game-shell.expanded .sentinel-fire-control {
            right: 26px;
            bottom: 22px;
            width: 102px;
            height: 102px;
            min-height: 0;
            padding: 0;
            flex-direction: column;
            gap: 0.18rem;
            border-radius: 28px;
            color: #fff6d9;
            background:
              radial-gradient(circle at 45% 28%, rgba(126, 232, 204, 0.32), transparent 34%),
              linear-gradient(145deg, rgba(67, 101, 153, 0.5), rgba(45, 37, 95, 0.58));
            border: 2px solid rgba(126, 232, 204, 0.68);
            box-shadow:
              0 0 24px rgba(126, 232, 204, 0.26),
              0 0 34px rgba(178, 104, 255, 0.24),
              inset 0 0 26px rgba(255, 255, 255, 0.08),
              0 11px 0 rgba(0, 0, 0, 0.2);
            font-size: 1.26rem;
            text-shadow: 0 0 12px rgba(126, 232, 204, 0.52);
            -webkit-tap-highlight-color: transparent;
          }

          .sentinel-game-shell.expanded .sentinel-fire-control span {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(247, 251, 255, 0.86);
            border-radius: 50%;
            background:
              linear-gradient(90deg, transparent 46%, rgba(247, 251, 255, 0.86) 47% 53%, transparent 54%),
              linear-gradient(0deg, transparent 46%, rgba(247, 251, 255, 0.86) 47% 53%, transparent 54%);
            box-shadow: 0 0 12px rgba(126, 232, 204, 0.42);
          }

          .sentinel-game-shell.expanded .sentinel-fire-control b {
            font: inherit;
            font-weight: 900;
          }

          .sentinel-game-shell.expanded .sentinel-fire-control:active {
            transform: translateY(4px) scale(0.97);
            box-shadow:
              0 0 28px rgba(126, 232, 204, 0.36),
              inset 0 0 28px rgba(255, 255, 255, 0.12),
              0 5px 0 rgba(0, 0, 0, 0.22);
          }

          .sentinel-game-shell.expanded .sentinel-readout {
            display: none;
          }

          .sentinel-readout {
            grid-template-columns: 1fr;
          }

          .sentinel-readout div {
            grid-template-columns: 1fr;
            text-align: left;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .sentinel-dpad-shell,
          .sentinel-ship-control,
          .sentinel-fire-control {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .sentinel-dpad-shell {
            left: 22px;
            bottom: 18px;
            width: 124px;
            height: 124px;
            border-radius: 38% 38% 38% 38% / 44% 44% 44% 44%;
            background:
              radial-gradient(circle at 50% 50%, rgba(129, 232, 255, 0.3), rgba(94, 143, 255, 0.13) 30%, transparent 33%),
              radial-gradient(circle at 50% 12%, rgba(126, 232, 204, 0.28), transparent 22%),
              radial-gradient(circle at 12% 50%, rgba(126, 232, 204, 0.26), transparent 22%),
              radial-gradient(circle at 88% 50%, rgba(126, 232, 204, 0.26), transparent 22%),
              radial-gradient(circle at 50% 88%, rgba(178, 104, 255, 0.28), transparent 22%),
              linear-gradient(145deg, rgba(65, 96, 151, 0.38), rgba(42, 35, 92, 0.42));
            border: 2px solid rgba(126, 232, 204, 0.58);
            box-shadow:
              0 0 22px rgba(126, 232, 204, 0.28),
              0 0 34px rgba(178, 104, 255, 0.22),
              inset 0 0 24px rgba(255, 255, 255, 0.08);
            clip-path: polygon(37% 0, 63% 0, 72% 25%, 100% 37%, 100% 63%, 72% 75%, 63% 100%, 37% 100%, 28% 75%, 0 63%, 0 37%, 28% 25%);
          }

          .sentinel-dpad-shell span {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: radial-gradient(circle at 40% 35%, rgba(180, 244, 255, 0.38), rgba(75, 112, 176, 0.22) 62%, rgba(26, 23, 52, 0.62));
            border: 2px solid rgba(126, 232, 204, 0.7);
            box-shadow:
              0 0 18px rgba(126, 232, 204, 0.42),
              inset 0 0 18px rgba(255, 255, 255, 0.1);
          }

          .sentinel-ship-control {
            width: 42px;
            height: 42px;
            min-height: 0;
            padding: 0;
            border-radius: 16px;
            color: rgba(219, 255, 249, 0.94);
            background: transparent;
            border: 0;
            box-shadow: none;
            text-shadow: 0 0 12px rgba(126, 232, 204, 0.8);
            font-size: 1.05rem;
            line-height: 1;
            -webkit-tap-highlight-color: transparent;
          }

          .sentinel-ship-control:active {
            color: #fff6d9;
            transform: scale(0.92);
            filter: drop-shadow(0 0 10px rgba(126, 232, 204, 0.9));
          }

          .sentinel-ship-control.up {
            left: 63px;
            bottom: 100px;
          }

          .sentinel-ship-control.left {
            left: 25px;
            bottom: 59px;
          }

          .sentinel-ship-control.right {
            left: 104px;
            bottom: 59px;
          }

          .sentinel-ship-control.down {
            left: 63px;
            bottom: 20px;
          }

          .sentinel-fire-control {
            right: 26px;
            bottom: 22px;
            width: 102px;
            height: 102px;
            min-height: 0;
            padding: 0;
            flex-direction: column;
            gap: 0.18rem;
            border-radius: 28px;
            color: #fff6d9;
            background:
              radial-gradient(circle at 45% 28%, rgba(126, 232, 204, 0.32), transparent 34%),
              linear-gradient(145deg, rgba(67, 101, 153, 0.5), rgba(45, 37, 95, 0.58));
            border: 2px solid rgba(126, 232, 204, 0.68);
            box-shadow:
              0 0 24px rgba(126, 232, 204, 0.26),
              0 0 34px rgba(178, 104, 255, 0.24),
              inset 0 0 26px rgba(255, 255, 255, 0.08),
              0 11px 0 rgba(0, 0, 0, 0.2);
            font-size: 1.26rem;
            text-shadow: 0 0 12px rgba(126, 232, 204, 0.52);
            -webkit-tap-highlight-color: transparent;
          }

          .sentinel-fire-control span {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(247, 251, 255, 0.86);
            border-radius: 50%;
            background:
              linear-gradient(90deg, transparent 46%, rgba(247, 251, 255, 0.86) 47% 53%, transparent 54%),
              linear-gradient(0deg, transparent 46%, rgba(247, 251, 255, 0.86) 47% 53%, transparent 54%);
            box-shadow: 0 0 12px rgba(126, 232, 204, 0.42);
          }

          .sentinel-fire-control b {
            font: inherit;
            font-weight: 900;
          }

          .sentinel-fire-control:active {
            transform: translateY(4px) scale(0.97);
            box-shadow:
              0 0 28px rgba(126, 232, 204, 0.36),
              inset 0 0 28px rgba(255, 255, 255, 0.12),
              0 5px 0 rgba(0, 0, 0, 0.22);
          }

          .sentinel-game-shell.expanded {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.45rem;
            overflow: hidden;
          }

          .sentinel-game-shell.expanded .sentinel-game-zoom {
            width: var(--expanded-base-width, calc(100vw - 28px));
            max-width: none;
            margin-top: 0;
            transform: none;
          }

          .sentinel-game-shell.expanded .sentinel-stage {
            width: 100%;
            height: calc(var(--expanded-base-width, calc(100vw - 28px)) * ${GAME_HEIGHT / GAME_WIDTH});
            min-height: 0;
            max-height: none;
            aspect-ratio: auto;
          }

          .sentinel-game-shell.expanded .sentinel-hud {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0.28rem;
            margin-bottom: 0.28rem;
          }

          .sentinel-game-shell.expanded .sentinel-hud span {
            min-height: 24px;
            border-radius: 5px;
            padding: 0.18rem 0.32rem;
            font-size: 0.56rem;
            box-shadow: none;
          }

          .sentinel-game-shell.expanded .sentinel-shield-meter {
            gap: 0.24rem;
          }

          .sentinel-game-shell.expanded .sentinel-shield-meter i {
            min-width: 34px;
            height: 7px;
            gap: 2px;
            padding: 1px;
          }

          .sentinel-game-shell.expanded .sentinel-expanded-close {
            top: 0.42rem;
            right: 0.42rem;
            min-height: 30px;
            width: 30px;
            padding: 0;
            border-radius: 999px;
            font-size: 0;
            line-height: 1;
            box-shadow: 0 5px 12px rgba(0, 0, 0, 0.25);
          }

          .sentinel-game-shell.expanded .sentinel-expanded-close::before {
            content: "×";
            font-size: 1.05rem;
            font-weight: 900;
          }

          .sentinel-game-shell.expanded .sentinel-readout {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
