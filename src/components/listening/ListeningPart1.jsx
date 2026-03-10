import React, { useEffect, useMemo, useRef, useState } from "react";
import Seo from "../common/Seo.jsx";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Task bank
// Expand this over time.
// tags = useful for future filtering / stats / review modes
// ─────────────────────────────────────────────────────────────────────────────
const PART1_LISTENING_TASKS = [
  {
    id: "message-time-1",
    title: "Friend arranging a visit",
    tags: ["phone-message", "time", "personal-message"],
    intro:
      "Listen to the message and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/message-time-1.mp3",
    question: "Your friend calls to arrange a visit. When does she want you to come?",
    stem: "She wants you to come __________.",
    answer: "2",
    scriptLineIndex: 0,
    evidenceParts: [
      "my sister and her family are arriving for lunch at one o’clock",
      "after that the house will be a bit noisy",
      "So before one is probably best",
      "If you came around midday",
    ],
    explanation:
      "Rachel says that after one o’clock the house will be noisy because her sister’s family will be there, so she clearly prefers the visit to happen before one.",
    options: [
      { value: "1", text: "at 1.00" },
      { value: "2", text: "before 1.00" },
      { value: "3", text: "after 1.00" },
    ],
    script: [
      {
        speaker: "Rachel",
        text:
          "Hi, it’s Rachel. Just calling about tomorrow. Thanks again for saying you’d drop by. You can really come whenever suits you, but my sister and her family are arriving for lunch at one o’clock, and after that the house will be a bit noisy. So before one is probably best. If you came around midday, we could have a proper chat. Let me know.",
      },
    ],
  },
  {
    id: "PA-shopping-1",
    title: "Shopping centre weekend event",
    tags: ["public-announcement", "shopping-centre"],
    intro:
      "Listen to the announcement and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/PA-shopping-1.mp3",
    question: "Listen to the shopping centre announcement. Who is the event mainly for?",
    stem: "The event is mainly for __________.",
    answer: "2",
    scriptLineIndex: 0,
    evidenceParts: [
      "there will be a cooking demonstration",
      "fashion stores will be presenting their new collections aimed at younger shoppers",
      "our main event begins at midday",
      "families can enjoy face painting, storytelling and games",
      "if you’re visiting with little ones this weekend",
    ],
    explanation:
      "The announcement mentions cooking and fashion events, but it says the main event begins at midday and then describes activities like face painting, storytelling and games for families with little ones. So it is mainly for parents with young children.",
    options: [
      { value: "1", text: "people who enjoy cooking" },
      { value: "2", text: "parents with young children" },
      { value: "3", text: "teenagers interested in fashion" },
    ],
    script: [
      {
        speaker: "",
        text:
          "Welcome to Riverside Shopping Centre. This Saturday, we’ll be holding a number of special events throughout the day. At eleven o’clock, there will be a cooking demonstration in the food hall for anyone interested in easy summer meals. Later in the afternoon, several fashion stores will be presenting their new collections aimed at younger shoppers. However, our main event begins at midday in the central atrium, where families can enjoy face painting, storytelling and games, as well as live music and free balloons. So if you’re visiting with little ones this weekend, there’ll be plenty to keep them entertained while you shop. We look forward to seeing you.",
      },
    ],
  },

  {
    id: "message-time-2",
    title: "Colleague changing a meeting time",
    tags: ["phone-message", "time", "work-message"],
    intro:
      "Listen to the message and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/message-time-2.mp3",
    question: "Your colleague leaves a message about a meeting. What time will the meeting start?",
    stem: "The meeting will start at __________.",
    answer: "2",
    scriptLineIndex: 0,
    evidenceParts: [
      "We first said quarter past 2",
      "we’re putting it back slightly",
      "It’ll now begin at quarter to 3",
    ],
    explanation:
      "Ben contrasts the original time with the updated one. The meeting was first planned for 2.15, but he says it will now begin at quarter to 3, which is 2.45.",
    options: [
      { value: "1", text: "2.15 pm" },
      { value: "2", text: "2.45 pm" },
      { value: "3", text: "3.15 pm" },
    ],
    script: [
      {
        speaker: "Ben",
        text:
          "Hello, it’s Ben from the office. I’m just ringing about this afternoon’s meeting. We first said quarter past 2, and I know that’s what’s in most people’s diaries, but the manager is still with a client and won’t be free in time. So we’re putting it back slightly. It’ll now begin at quarter to 3 in the small conference room, not the main one. See you later.",
      },
    ],
  },

  {
    id: "message-detail-1",
    title: "Friend missing an item after a visit",
    tags: ["phone-message", "personal-message", "details"],
    intro:
      "Listen to the message and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/message-detail-1.mp3",
    question: "Your friend leaves you a message after visiting your house. What has she lost?",
    stem: "She has lost her __________.",
    answer: "1",
    scriptLineIndex: 0,
    evidenceParts: [
      "I’ve got my bag and my umbrella with me, so it’s not that",
      "but I can’t find my scarf anywhere",
      "I think I may have left it on the back of the chair",
    ],
    explanation:
      "Joanna rules out the umbrella and then says she can’t find her scarf anywhere, so the missing item is her scarf.",
    options: [
      { value: "1", text: "scarf" },
      { value: "2", text: "glasses" },
      { value: "3", text: "umbrella" },
    ],
    script: [
      {
        speaker: "Joanna",
        text:
          "Hi, it’s Joanna. Thanks so much again for having me over yesterday — I had a lovely time. But I’ve just got to work and realised I’m missing something. I’ve got my bag and my umbrella with me, so it’s not that, but I can’t find my scarf anywhere. It’s dark blue, and I think I may have left it on the back of the chair in your living room. Let me know if you see it. Bye!",
      },
    ],
  },

  {
    id: "message-detail-2",
    title: "Message about a daughter’s breakfast",
    tags: ["phone-message", "personal-message", "details"],
    intro:
      "Listen to the message and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/message-detail-2.mp3",
    question: "Your friend leaves a message about his daughter. What does she usually drink with breakfast?",
    stem: "She usually drinks __________.",
    answer: "3",
    scriptLineIndex: 0,
    evidenceParts: [
      "she likes to have a glass of orange juice with breakfast",
      "but just give her water if that’s easier",
      "She doesn’t usually want milk unless it’s before bed",
    ],
    explanation:
      "The message says she likes to have a glass of orange juice with breakfast. Water is presented only as an easier alternative, and milk is associated with before bed, not breakfast.",
    options: [
      { value: "1", text: "milk" },
      { value: "2", text: "water" },
      { value: "3", text: "orange juice" },
    ],
    script: [
      {
        speaker: "Dave",
        text:
          "Hello, it’s Dave here. Thanks so much for agreeing to look after Ellie on Saturday. Eerm, she’s very easy, really. In the morning she normally has some toast or cereal, and she likes to have a glass of orange juice with breakfast but just give her water if that’s easier. She doesn’t usually want milk unless it’s before bed. Lunch can be something simple like pasta or a sandwich. Thanks again — I really appreciate it.",
      },
    ],
  },

  {
    id: "message-time-3",
    title: "Neighbour collecting a parcel",
    tags: ["phone-message", "time", "personal-message"],
    intro:
      "Listen to the message and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/message-time-3.mp3",
    question: "Your neighbour calls about picking something up. When will she come round?",
    stem: "She will come round at __________.",
    answer: "2",
    scriptLineIndex: 0,
    evidenceParts: [
      "I finish work at five",
      "at first I thought I’d come straight over then",
      "I usually get in a bit later because of traffic",
      "So I’ll probably knock on your door at about half past five",
    ],
    explanation:
      "Nina first mentions five o’clock as her finishing time, but then explains that traffic and the bus usually delay her. She therefore says she will probably come round at about half past five.",
    options: [
      { value: "1", text: "5.00 pm" },
      { value: "2", text: "5.30 pm" },
      { value: "3", text: "6.00 pm" },
    ],
    script: [
      {
        speaker: "Nina",
        text:
          "Hi Tom, it’s Nina next door. Thanks for taking in my parcel this morning. I finish work at five, so at first I thought I’d come straight over then. But the bus home has been terrible this week, and I usually get in a bit later because of traffic. So I’ll probably knock on your door at about half past five. Hope that’s alright, and thanks again.",
      },
    ],
  },

  {
    id: "PA-sports-1",
    title: "Sports centre announcement",
    tags: ["public-announcement", "prices"],
    intro:
      "Listen to the announcement and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/PA-sports-1.mp3",
    question: "Listen to the announcement at a sports centre. Which class is cheaper this month?",
    stem: "The cheaper class this month is __________.",
    answer: "3",
    scriptLineIndex: 0,
    evidenceParts: [
      "yoga classes will continue at the usual rate of eight pounds",
      "adult swimming sessions are slightly reduced and now cost six pounds",
      "evening badminton classes ... for just five pounds a session",
    ],
    explanation:
      "Yoga costs eight pounds, swimming costs six, and badminton costs five if booked in advance. That makes badminton the cheapest class this month.",
    options: [
      { value: "1", text: "yoga" },
      { value: "2", text: "swimming" },
      { value: "3", text: "badminton" },
    ],
    script: [
      {
        speaker: "",
        text:
          "Hello everyone, and welcome to Green Park Sports Centre. We’d just like to let members know about some changes to our class prices this month. Our yoga classes will continue at the usual rate of eight pounds per session. The adult swimming sessions are slightly reduced and now cost six pounds instead of seven. However, the biggest change is in our evening badminton classes, which are available this month for just five pounds a session if booked in advance. These classes are proving very popular, so we recommend booking early. Please ask at reception if you’d like more details about times, equipment or membership discounts.",
      },
    ],
  },
  {
    id: "PA-airport-1",
    title: "Airport departure announcement",
    tags: ["public-announcement", "time"],
    intro:
      "Listen to the announcement and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/PA-airport-1.mp3",
    question: "Listen to the airport announcement. What time will the flight leave?",
    stem: "The flight will leave at __________.",
    answer: "3",
    scriptLineIndex: 0,
    evidenceParts: [
      "Boarding was due to begin at 4.20 pm",
      "We now expect boarding to start at approximately four thirty",
      "with the flight leaving at ten to five",
    ],
    explanation:
      "The announcement first mentions 4.20 pm, but that was the original boarding time, not the departure time. It then says boarding should start at 4.30 and the flight will leave at ten to five, which is 4.50.",
    options: [
      { value: "1", text: "16:20" },
      { value: "2", text: "17:10" },
      { value: "3", text: "16:50" },
    ],
    script: [
      {
        speaker: "",
        text:
          "Ladies and gentlemen, may we have your attention please. This is an announcement for passengers travelling on Flight 624 to Rome. Boarding was due to begin at 4.20 pm, but there has been a short delay while the aircraft is prepared for departure. We now expect boarding to start at approximately four thirty, with the flight leaving at ten to five. Please do not go to the gate yet, as staff are still assisting arriving passengers there. We apologise for the inconvenience and thank you for your patience. Further information will be given in around fifteen minutes. Please continue to check the departure screens for updates.",
      },
    ],
  },
  {
    id: "PA-shopping-2",
    title: "Department store weekend offers",
    tags: ["public-announcement", "shopping", "prices"],
    intro:
      "Listen to the announcement and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/PA-shopping-2.mp3",
    question: "Listen to the announcement in a department store. Which items have the biggest discount this weekend?",
    stem: "The biggest discount is on __________.",
    answer: "1",
    scriptLineIndex: 0,
    evidenceParts: [
      "winter coats are reduced by 15%",
      "sports shoes now available at 50% of the original price",
      "kitchen appliances ... are marked down by 40%",
    ],
    explanation:
      "Winter coats are reduced by 15%, kitchen appliances by 40%, and sports shoes by 50% of the original price. That makes sports shoes the biggest discount.",
    options: [
      { value: "1", text: "sports shoes" },
      { value: "2", text: "kitchen appliances" },
      { value: "3", text: "winter coats" },
    ],
    script: [
      {
        speaker: "",
        text:
          "Good morning, customers. Here is some information about our weekend offers across the store. On the second floor, all winter coats are reduced by 15%, and there are also lower prices on selected hats, scarves and gloves. If you’re visiting the ground floor, you’ll find a range of sports shoes now available at 50% of the original price on selected brands and sizes only. And on the fourth floor, many kitchen appliances, including kettles, mixers and coffee machines, are marked down by 40% until the end of the weekend. Store card holders can also collect extra points on all purchases made before we close on Sunday.",
      },
    ],
  },
  {
    id: "reporter-1",
    title: "Reporter on overcrowded trains",
    tags: ["report", "transport"],
    intro:
      "Listen to the report and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/reporter-1.mp3",
    question: "Listen to a reporter talking about overcrowded trains. What was the main reason conditions got worse this year?",
    stem: "The main reason was __________.",
    answer: "B",
    scriptLineIndex: 1,
    evidenceParts: [
      "more employees are now going back into the office",
      "discounted fares have encouraged more people to travel",
      "what seems to have made the biggest difference is the fact that the operator has been running fewer services since January because of staff shortages",
    ],
    explanation:
      "The report mentions people returning to the office and discounted fares as possible factors, but it then says that what made the biggest difference was that the operator had been running fewer services since January. So the main reason was fewer services running.",
    options: [
      { value: "A", text: "Ticket prices were reduced" },
      { value: "B", text: "Fewer services were running" },
      { value: "C", text: "More people returned to the office" },
    ],
    script: [
      {
        speaker: "Reporter",
        text:
          "Passengers travelling into the city have been complaining for months about increasingly crowded trains, especially during the morning rush hour. Rail users have suggested a number of possible explanations.",
      },
      {
        speaker: "Reporter",
        text:
          "One obvious factor is that more employees are now going back into the office after several years of working partly from home. Some passengers also point out that discounted fares have encouraged more people to travel at busy times. But what seems to have made the biggest difference is the fact that the operator has been running fewer services since January because of staff shortages.",
      },
      {
        speaker: "Reporter",
        text:
          "With fewer trains available, even a fairly small rise in passenger numbers has had a noticeable effect on comfort and space.",
      },
    ],
  },
  {
    id: "reporter-2",
    title: "Reporter on litter in a public park",
    tags: ["report"],
    intro:
      "Listen to the report and answer the question below. You can listen to the recording twice.",
    audioSrc: "/audio/listening/part1/reporter-2.mp3",
    question: "Listen to a reporter talking about litter in a public park. What was the main reason the problem became worse?",
    stem: "The main reason was __________.",
    answer: "B",
    scriptLineIndex: 1,
    evidenceParts: [
      "the park has hosted more concerts and food markets this summer",
      "the real turning point came when a number of waste containers were removed during renovation work earlier in the year",
      "Some people have also blamed the later start time for the cleaning teams",
    ],
    explanation:
      "The report mentions more events and later cleaning times, but it says the real turning point came when waste containers were removed during renovation work. So the main reason was that fewer bins were available.",
    options: [
      { value: "A", text: "There were more weekend events" },
      { value: "B", text: "Fewer bins were available" },
      { value: "C", text: "Cleaning staff started work later" },
    ],
    script: [
      {
        speaker: "Reporter",
        text:
          "Residents have recently been complaining about the amount of litter being left in Westfield Park, particularly on Sundays and after public events. Several contributing factors have been put forward by residents.",
      },
      {
        speaker: "Reporter",
        text:
          "It’s certainly true that the park has hosted more concerts and food markets this summer. Even so, local officials say the real turning point came when a number of waste containers were removed during renovation work earlier in the year. Some people have also blamed the later start time for the cleaning teams, especially at weekends, when the park tends to get particularly busy.",
      },
    ],
  },
];

const GUEST_TASK_LIMIT = 3;
const MAX_SESSION_SIZE = 13;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPrioritisedTaskSet(tasks, statsById, count, mode = "all") {
  let pool = [...tasks];

  if (mode === "wrongOnly") {
    pool = pool.filter((t) => statsById?.[t.id]?.needsReview === true);
  }

  if (!pool.length) return [];

  const unseen = [];
  const seen = [];

  pool.forEach((task) => {
    const stats = statsById?.[task.id];
    if (!stats || !stats.seenAt) unseen.push(task);
    else seen.push(task);
  });

  const sortedSeen = [...seen].sort((a, b) => {
    const aStats = statsById?.[a.id] || {};
    const bStats = statsById?.[b.id] || {};

    const aWrong = aStats.wrongCount || 0;
    const bWrong = bStats.wrongCount || 0;
    if (bWrong !== aWrong) return bWrong - aWrong;

    const aAttempts = aStats.attempts || 0;
    const bAttempts = bStats.attempts || 0;
    if (aAttempts !== bAttempts) return aAttempts - bAttempts;

    return 0;
  });

  const prioritised = [...shuffle(unseen), ...shuffle(sortedSeen)];
  return prioritised.slice(0, Math.min(count, prioritised.length));
}

function highlightEvidence(text, parts = []) {
  if (!parts?.length) return text;

  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = parts.map((p) => String(p || "").trim()).filter(Boolean);
  if (!cleaned.length) return text;

  const regex = new RegExp(`(${cleaned.map(escapeRegex).join("|")})`, "gi");
  const segments = String(text).split(regex);

  return segments.map((seg, i) => {
    const isHit = cleaned.some((p) => seg.toLowerCase() === p.toLowerCase());
    return isHit ? (
      <mark key={i} className="evidence">
        {seg}
      </mark>
    ) : (
      <React.Fragment key={i}>{seg}</React.Fragment>
    );
  });
}

function getDefaultSessionCount(taskCount) {
    return Math.min(5, Math.max(1, taskCount));
  }

  function formatTagLabel(tag) {
    if (tag === "all") return "All task types";
    return tag
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ListeningPart1({ user, onRequireSignIn }) {
  const [statsById, setStatsById] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);

  const [setSize, setSetSize] = useState(1);
  const [mode, setMode] = useState("all"); // "all" | "wrongOnly"

  const [sessionTasks, setSessionTasks] = useState([]);
  const [sessionIndex, setSessionIndex] = useState(0);

  const [answersByTask, setAnswersByTask] = useState({});
  const [feedbackByTask, setFeedbackByTask] = useState({});
  const [checkedByTask, setCheckedByTask] = useState({});
  const [showScriptByTask, setShowScriptByTask] = useState({});
  const [whyOpenByTask, setWhyOpenByTask] = useState({});
  const [playsUsedByTask, setPlaysUsedByTask] = useState({});

  const audioRef = useRef(null);
  const scriptLineRefs = useRef({});
  const [isPlaying, setIsPlaying] = useState(false);

  const [selectedTag, setSelectedTag] = useState("all");

  const availableTasks = useMemo(
    () =>
      user
        ? PART1_LISTENING_TASKS
        : PART1_LISTENING_TASKS.slice(0, GUEST_TASK_LIMIT),
    [user]
  );

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    availableTasks.forEach((task) => {
      (task.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return ["all", ...Array.from(tagSet).sort()];
  }, [availableTasks]);

  const filteredTasks = useMemo(() => {
    if (selectedTag === "all") return availableTasks;
    return availableTasks.filter((task) => (task.tags || []).includes(selectedTag));
  }, [availableTasks, selectedTag]);

  useEffect(() => {
    setSetSize((prev) => {
      const max = Math.max(1, filteredTasks.length);
      const defaultCount = getDefaultSessionCount(filteredTasks.length);
  
      if (!prev) return defaultCount;
      if (prev > max) return defaultCount;
      return prev;
    });
  }, [filteredTasks.length]);

  useEffect(() => {
    let alive = true;

    async function loadStats() {
      if (!user || !fb.getListeningPart1TaskStats) {
        setStatsById({});
        return;
      }

      setLoadingStats(true);
      try {
        const stats = await fb.getListeningPart1TaskStats();
        if (alive) setStatsById(stats || {});
      } catch (err) {
        console.warn("[listening p1] stats load failed:", err);
      } finally {
        if (alive) setLoadingStats(false);
      }
    }

    loadStats();
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    generateNewSet(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingStats]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    el.addEventListener("ended", onEnded);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);

    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, []);

  const current = sessionTasks[sessionIndex] || null;
  const currentId = current?.id || null;

  const currentAnswer = currentId ? answersByTask[currentId] || "" : "";
  const currentFeedback = currentId ? feedbackByTask[currentId] : undefined;
  const currentChecked = !!(currentId && checkedByTask[currentId]);
  const currentShowScript = !!(currentId && showScriptByTask[currentId]);
  const currentWhyOpen = currentId ? whyOpenByTask[currentId] || false : false;
  const playsUsed = currentId ? playsUsedByTask[currentId] || 0 : 0;

  const listensLeft = Math.max(0, 2 - playsUsed);
  const playDisabled = !current?.audioSrc || (playsUsed >= 2 && !isPlaying);

  const maxSelectable = Math.min(MAX_SESSION_SIZE, filteredTasks.length || 1);

  const sessionSummary = useMemo(() => {
    if (!sessionTasks.length) return { checked: 0, correct: 0 };

    let checked = 0;
    let correct = 0;

    sessionTasks.forEach((task) => {
      if (checkedByTask[task.id]) checked += 1;
      if (feedbackByTask[task.id] === true) correct += 1;
    });

    return { checked, correct };
  }, [sessionTasks, checkedByTask, feedbackByTask]);

  useEffect(() => {
    if (!currentWhyOpen || !current) return;

    setShowScriptByTask((prev) => ({ ...prev, [current.id]: true }));

    const node = scriptLineRefs.current?.[`${current.id}-${current.scriptLineIndex}`];
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentWhyOpen, current]);

  function generateNewSet(nextMode = mode) {
    if (nextMode === "wrongOnly" && !user) {
      onRequireSignIn?.();
      return;
    }

    const picked = buildPrioritisedTaskSet(
        filteredTasks,
        user ? statsById : {},
        setSize,
        nextMode
      );

    if (!picked.length) {
      if (nextMode === "wrongOnly") {
        toast("No wrong-task history yet.");
      } else {
        toast("No listening tasks available yet.");
      }
      setSessionTasks([]);
      setSessionIndex(0);
      return;
    }

    stopAudio(true);
    setMode(nextMode);
    setSessionTasks(picked);
    setSessionIndex(0);
  }

  function stopAudio(silent = false) {
    const el = audioRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
      setIsPlaying(false);
      if (!silent) toast("Stopped.");
    } catch {}
  }

  async function handlePlayStop() {
    const el = audioRef.current;
    if (!el || !current?.audioSrc) {
      toast("Audio will be added soon.");
      return;
    }

    if (isPlaying) {
      stopAudio(true);
      return;
    }

    if (playsUsed >= 2) {
      toast("You’ve used both listens.");
      return;
    }

    setPlaysUsedByTask((prev) => ({
      ...prev,
      [current.id]: (prev[current.id] || 0) + 1,
    }));

    try {
      await el.play();
    } catch (e) {
      console.warn("[listening p1] play blocked:", e);
      toast("Click again to allow audio.");
    }
  }

  function handleSelect(value) {
    if (!current) return;
  
    setAnswersByTask((prev) => ({ ...prev, [current.id]: value }));
    setWhyOpenByTask((prev) => ({ ...prev, [current.id]: false }));
    setCheckedByTask((prev) => ({ ...prev, [current.id]: false }));
    setFeedbackByTask((prev) => {
      const copy = { ...prev };
      delete copy[current.id];
      return copy;
    });
  }

  function handleResetTask() {
    if (!current) return;

    setAnswersByTask((prev) => ({ ...prev, [current.id]: "" }));
    setFeedbackByTask((prev) => {
      const copy = { ...prev };
      delete copy[current.id];
      return copy;
    });
    setCheckedByTask((prev) => ({ ...prev, [current.id]: false }));
    setShowScriptByTask((prev) => ({ ...prev, [current.id]: false }));
    setWhyOpenByTask((prev) => ({ ...prev, [current.id]: false }));
    setPlaysUsedByTask((prev) => ({ ...prev, [current.id]: 0 }));
    stopAudio(true);
    toast("Task reset.");
  }

  function handleShowAnswer() {
    if (!current) return;

    setAnswersByTask((prev) => ({ ...prev, [current.id]: current.answer }));
    setFeedbackByTask((prev) => ({ ...prev, [current.id]: true }));
    setCheckedByTask((prev) => ({ ...prev, [current.id]: true }));
    setShowScriptByTask((prev) => ({ ...prev, [current.id]: true }));
    setWhyOpenByTask((prev) => ({ ...prev, [current.id]: false }));
  }

  async function handleCheck() {
    if (!current) return;

    const chosen = (answersByTask[current.id] || "").trim();
    if (!chosen) {
      toast("Choose an answer first.");
      return;
    }

    const isCorrect = chosen === current.answer;

    setFeedbackByTask((prev) => ({ ...prev, [current.id]: isCorrect }));
    setCheckedByTask((prev) => ({ ...prev, [current.id]: true }));
    setWhyOpenByTask((prev) => ({ ...prev, [current.id]: false }));

    toast(isCorrect ? "Correct ✓" : "Not quite");

    const plays = playsUsedByTask[current.id] || 0;

    try {
      if (user && fb.updateListeningPart1TaskProgress) {
        await fb.updateListeningPart1TaskProgress({
          taskId: current.id,
          correct: isCorrect,
          playsUsed: plays,
          tags: current.tags || [],
          source: "ListeningPart1",
        });
      }

      if (user && fb.logListeningPart1Attempted) {
        await fb.logListeningPart1Attempted({
          taskId: current.id,
          score: isCorrect ? 1 : 0,
          total: 1,
          playsUsed: plays,
          source: "ListeningPart1",
        });
      }

      if (user && isCorrect && fb.logListeningPart1Completed) {
        await fb.logListeningPart1Completed({
          taskId: current.id,
          playsUsed: plays,
          source: "ListeningPart1",
        });
      }

      if (user && fb.getListeningPart1TaskStats) {
        const fresh = await fb.getListeningPart1TaskStats();
        setStatsById(fresh || {});
      }
    } catch (err) {
      console.warn("[listening p1] logging/progress failed:", err);
    }
  }

  function goToTask(nextIndex) {
    if (nextIndex < 0 || nextIndex >= sessionTasks.length) return;
    stopAudio(true);
    setSessionIndex(nextIndex);
  }

  if (!sessionTasks.length) {
    return (
      <div className="aptis-listening1 game-wrapper">
        <StyleScope />
        <Seo
          title="Listening Part 1 | Seif Aptis Trainer"
          description="Short listening extracts with random task generation."
        />

        <header className="top">
          <h2 className="title">Listening – Part 1 (Short Extracts)</h2>
          <p className="intro">
            Build a random practice set from the listening task bank.
          </p>
        </header>

        <section className="panel">
        <div className="setupRow">
  <label className="field">
    <span className="fieldLabel">Number of tasks</span>
    <select
      className="select"
      value={setSize}
      onChange={(e) => setSetSize(Number(e.target.value))}
    >
      {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  </label>

  <label className="field">
    <span className="fieldLabel">Task type</span>
    <select
      className="select"
      value={selectedTag}
      onChange={(e) => setSelectedTag(e.target.value)}
    >
      {availableTags.map((tag) => (
  <option key={tag} value={tag}>
    {formatTagLabel(tag)}
  </option>
))}
    </select>
  </label>

            <div className="setupBtns">
              <button className="btn primary" onClick={() => generateNewSet("all")}>
                Generate practice set
              </button>
              <button
                className="btn ghost"
                onClick={() => generateNewSet("wrongOnly")}
                disabled={!user}
              >
                Review mistakes
              </button>
            </div>
          </div>

          {!user && (
            <p className="lock-note">
              Guest users can practise the starter bank only. Sign in to unlock all Part 1 tasks, review mistakes and avoid completed tasks.
            </p>
          )}
          
        </section>
      </div>
    );
  }

  return (
    <div className="aptis-listening1 game-wrapper">
      <StyleScope />

      <Seo
        title="Listening Part 1 | Seif Aptis Trainer"
        description="Short listening extracts with random task generation."
      />

      <audio
        ref={audioRef}
        src={current?.audioSrc || undefined}
        preload="auto"
      />

      <header className="top">
        <div className="titleblock">
          <h2 className="title">Listening – Part 1 (Short Extracts)</h2>

          <div className="setupRow compact">
            <label className="field">
              <span className="fieldLabel">Number of tasks</span>
              <select
                className="select"
                value={setSize}
                onChange={(e) => setSetSize(Number(e.target.value))}
              >
                {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
  <span className="fieldLabel">Task type</span>
  <select
    className="select"
    value={selectedTag}
    onChange={(e) => setSelectedTag(e.target.value)}
  >
    {availableTags.map((tag) => (
  <option key={tag} value={tag}>
    {formatTagLabel(tag)}
  </option>
))}
  </select>
</label>

            <div className="setupBtns">
              <button className={`modeBtn ${mode === "all" ? "active" : ""}`} onClick={() => generateNewSet("all")}>
                New mixed set
              </button>
              <button
                className={`modeBtn ${mode === "wrongOnly" ? "active" : ""}`}
                onClick={() => generateNewSet("wrongOnly")}
                disabled={!user}
              >
                Review mistakes
              </button>
            </div>
          </div>

          {!user && (
            <p className="lock-note">
              You’re using the free starter bank. Sign in to unlock the full task bank and save your wrong-task history.
            </p>
          )}

<div className="sessionMeta">
<span className="pill">
  Available tasks <strong>{filteredTasks.length}</strong>
  {selectedTag !== "all" ? ` (${formatTagLabel(selectedTag)})` : ""}
  {!user ? ` / ${PART1_LISTENING_TASKS.length}` : ""}
</span>
            <span className="pill">
              Task <strong>{sessionIndex + 1}</strong> / {sessionTasks.length}
            </span>
            <span className="pill">
              Checked <strong>{sessionSummary.checked}</strong> / {sessionTasks.length}
            </span>
            <span className="pill">
              Correct <strong>{sessionSummary.correct}</strong> / {sessionTasks.length}
            </span>
            {mode === "wrongOnly" && <span className="pill warn">Wrong-task review</span>}
          </div>
          <p className="intro">{current?.intro}</p>
        </div>
      </header>

      <section className="panel">
        <div className="panelbar">
          <div className="audioBox">
            <button
              type="button"
              className={`btn ${isPlaying ? "danger" : "primary"}`}
              onClick={handlePlayStop}
              disabled={playDisabled}
              title={!current?.audioSrc ? "Audio coming soon" : playsUsed >= 2 ? "No listens remaining" : "Play audio"}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>

            <div className="listenMeta">
              <span className={`pill ${playsUsed >= 2 ? "pill-dim" : ""}`}>
                Listens left: <strong>{listensLeft}</strong>/2
              </span>
              {playsUsed > 0 && (
                <span className="smallnote">(You’ve used {playsUsed} of 2)</span>
              )}
            </div>
          </div>

          <div className="controls">
            <button className="btn" onClick={handleResetTask}>
              Reset task
            </button>
            <button className="btn primary" onClick={handleCheck}>
              Check
            </button>
            <button className="btn ghost" onClick={handleShowAnswer}>
              Show answer
            </button>
          </div>
        </div>

        <div className="questionCard">

          <div className="questionTop">
            <div className="questionText">{current.question}</div>

            <button
              type="button"
              className="why-btn"
              disabled={!currentChecked}
              onClick={() =>
                setWhyOpenByTask((prev) => ({
                  ...prev,
                  [current.id]: !prev[current.id],
                }))
              }
              title={currentChecked ? "Show explanation" : "Check first to unlock"}
            >
              Why?
            </button>
          </div>

          <div className="stem">{current.stem}</div>

          <div className="optionGrid">
            {current.options.map((opt) => {
              const selected = currentAnswer === opt.value;
              const status =
                selected && currentFeedback === true
                  ? "ok"
                  : selected && currentFeedback === false
                  ? "bad"
                  : "";

              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`optionBtn ${selected ? "selected" : ""} ${status}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className="optionLetter">{opt.value}</span>
                  <span className="optionText">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {currentWhyOpen && (
          <div className="why-box">
            <div className="why-row">
              <span className="why-label">Answer:</span>
              <strong>
                {current.options.find((o) => o.value === current.answer)?.text || current.answer}
              </strong>
            </div>
            <div className="why-row">
              <span className="why-label">Evidence:</span>
              <span className="why-evidence">
                {(current.evidenceParts || []).join(" … ")}
              </span>
            </div>
            <div className="why-row">
              <span className="why-label">Explanation:</span>
              <span>{current.explanation}</span>
            </div>
          </div>
        )}

        <div className="scriptWrap">
          <button
            type="button"
            className="linkbtn"
            disabled={!currentChecked || !current.script?.length}
            onClick={() =>
              setShowScriptByTask((prev) => ({
                ...prev,
                [current.id]: !prev[current.id],
              }))
            }
          >
            {currentShowScript ? "Hide script" : "Show script"}
          </button>

          {currentShowScript && currentChecked && !!current.script?.length && (
            <div className="scriptPanel">
              <h4 className="scriptTitle">Script</h4>
              <div className="scriptLines">
                {current.script.map((line, i) => {
                  const lineKey = `${current.id}-${i}`;
                  const isTarget = current.scriptLineIndex === i;

                  return (
                    <div
                      key={lineKey}
                      className={`scriptLine ${isTarget ? "active-script-line" : ""}`}
                      ref={(node) => {
                        scriptLineRefs.current[lineKey] = node;
                      }}
                    >
                      {line.speaker ? (
                        <>
                          <span className="speaker">{line.speaker}:</span>{" "}
                          <span className="text">
                            {currentWhyOpen
                              ? highlightEvidence(line.text, current.evidenceParts)
                              : line.text}
                          </span>
                        </>
                      ) : (
                        <span className="text">
                          {currentWhyOpen
                            ? highlightEvidence(line.text, current.evidenceParts)
                            : line.text}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="navRow">
          <button
            className="btn"
            onClick={() => goToTask(sessionIndex - 1)}
            disabled={sessionIndex === 0}
          >
            ← Previous
          </button>

          <div className="navDots">
            {sessionTasks.map((task, i) => {
              const checked = !!checkedByTask[task.id];
              const correct = feedbackByTask[task.id] === true;
              return (
                <button
                  key={task.id}
                  type="button"
                  className={`dot ${i === sessionIndex ? "active" : ""} ${checked ? "checked" : ""} ${correct ? "correct" : ""}`}
                  onClick={() => goToTask(i)}
                  title={`Task ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <button
            className="btn"
            onClick={() => goToTask(sessionIndex + 1)}
            disabled={sessionIndex === sessionTasks.length - 1}
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  );
}

function StyleScope() {
  return (
    <style>{`
      .aptis-listening1 { max-width: 1100px; margin: 0 auto; }

      .top { margin-bottom: 1rem; }
      .title { margin: 0 0 .25rem; font-size: 1.65rem; }
      .intro { margin: 0; color: #a9b7d1; max-width: 70ch; }

      .titleblock { max-width: 960px; }

      .panel {
        background: #0f1b33;
        border: 1px solid #2c4b83;
        border-radius: 14px;
        padding: 1rem;
      }

      .setupRow {
        display: flex;
        gap: 1rem;
        align-items: end;
        flex-wrap: wrap;
        margin: .7rem 0 1rem;
      }

      .setupRow.compact {
        margin: .55rem 0 .8rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: .35rem;
      }

      .fieldLabel {
        color: #a9b7d1;
        font-weight: 800;
        font-size: .86rem;
      }

      .select {
        background:#101f3f;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 999px;
        padding: .55rem .85rem;
        outline: none;
        min-width: 92px;
      }

      .setupBtns {
        display: flex;
        gap: .6rem;
        flex-wrap: wrap;
      }

      .modeBtn {
        background:#13213b;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 999px;
        padding: .58rem .9rem;
        cursor:pointer;
        font-weight: 700;
      }

      .modeBtn.active {
        background: linear-gradient(180deg, rgba(88,150,255,.35), rgba(88,150,255,.15));
        border-color: rgba(88,150,255,.85);
      }

      .modeBtn:disabled {
        opacity: .55;
        cursor: not-allowed;
      }

      .lock-note { margin: 0; color: #9fc2ff; font-size: .92rem; }

      .sessionMeta {
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
        margin: 0 0 .75rem;
      }

      .panelbar {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .audioBox { display:flex; align-items:center; gap:.75rem; flex-wrap: wrap; }
      .listenMeta { display:flex; align-items:baseline; gap:.5rem; flex-wrap: wrap; }
      .smallnote { color: #a9b7d1; font-size: .9rem; }

      .questionCard {
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(210,225,255,.14);
        border-radius: 12px;
        padding: .95rem;
      }

      .questionTop {
        display:flex;
        justify-content:space-between;
        gap: 1rem;
        align-items:flex-start;
        margin-bottom: .75rem;
      }

      .questionText {
        color:#e6f0ff;
        line-height: 1.4;
        font-size: 1.02rem;
        font-weight: 700;
      }

      .stem {
        margin-bottom: .85rem;
        color: #cfd9f3;
      }

      .optionGrid {
        display:flex;
        flex-direction:column;
        gap:.65rem;
      }

      .optionBtn {
        display:grid;
        grid-template-columns: 54px 1fr;
        align-items:center;
        gap: .8rem;
        width:100%;
        text-align:left;
        background:#101f3f;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 10px;
        padding: 0;
        cursor:pointer;
        overflow:hidden;
      }

      .optionBtn:hover {
        border-color:#4a79d8;
      }

      .optionBtn.selected {
        background: rgba(88,150,255,.14);
        border-color: rgba(88,150,255,.85);
        box-shadow: 0 0 0 2px rgba(88,150,255,.18);
      }

      .optionBtn.selected .optionLetter {
        background: rgba(88,150,255,.22);
        color: #ffffff;
      }

      .optionBtn.selected .optionText {
        color: #ffffff;
      }

      .optionBtn.ok {
        border-color: rgba(70, 200, 120, .85);
        box-shadow: 0 0 0 2px rgba(70,200,120,.15);
      }

      .optionBtn.bad {
        border-color: rgba(235, 80, 80, .85);
        box-shadow: 0 0 0 2px rgba(235,80,80,.15);
      }

      .optionLetter {
        display:flex;
        align-items:center;
        justify-content:center;
        min-height: 64px;
        font-size: 1.05rem;
        font-weight: 800;
        color:#e6f0ff;
        background: rgba(255,255,255,.05);
        border-right: 1px solid rgba(210,225,255,.14);
      }

      .optionText {
        padding: .8rem .95rem .8rem 0;
        line-height: 1.35;
      }

      .why-btn {
        background:#13213b;
        border:1px solid #2c4b83;
        color:#9fc2ff;
        font-weight:800;
        border-radius: 10px;
        padding: .55rem .75rem;
        cursor:pointer;
        white-space: nowrap;
      }

      .why-btn:hover { border-color:#4a79d8; }
      .why-btn:disabled { opacity:.55; cursor:not-allowed; }

      .why-box {
        margin-top: .85rem;
        background:#0f1b31;
        border:1px solid rgba(210,225,255,.18);
        border-radius: 12px;
        padding: .75rem .85rem;
      }

      .why-row { display:flex; gap:.5rem; flex-wrap: wrap; line-height: 1.45; }
      .why-label { color:#9fc2ff; font-weight: 900; }
      .why-evidence { font-style: italic; color:#cfd9f3; }

      .controls { display:flex; gap:.6rem; flex-wrap: wrap; }

      .btn {
        background:#13213b;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 10px;
        padding: .55rem .8rem;
        cursor:pointer;
        font-weight: 700;
      }

      .btn:hover { border-color:#4a79d8; }
      .btn:disabled { opacity:.55; cursor:not-allowed; }

      .btn.primary {
        background: linear-gradient(180deg, rgba(88,150,255,.35), rgba(88,150,255,.15));
        border-color: rgba(88,150,255,.85);
      }

      .btn.danger {
        background: linear-gradient(180deg, rgba(235,80,80,.25), rgba(235,80,80,.12));
        border-color: rgba(235,80,80,.8);
      }

      .btn.ghost {
        background: transparent;
        border-color: rgba(210, 225, 255, .35);
      }

      .linkbtn {
        background: transparent;
        border: none;
        color: #9fc2ff;
        padding: 0;
        cursor: pointer;
        font-weight: 800;
      }

      .linkbtn:disabled { opacity:.55; cursor:not-allowed; }

      .pill {
        display:inline-flex;
        align-items:center;
        gap:.35rem;
        padding: .25rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.18);
        background: rgba(255,255,255,.06);
        color: #e6f0ff;
        font-size: .9rem;
      }

      .pill-dim { opacity: .75; }
      .pill.warn {
        border-color: rgba(255,214,102,.4);
        background: rgba(255,214,102,.09);
      }

      .scriptWrap { margin-top: 1rem; }
      .scriptPanel {
        margin-top: .75rem;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(210,225,255,.18);
        border-radius: 12px;
        padding: .9rem;
      }

      .scriptTitle { margin: 0 0 .5rem; }
      .scriptLines { display:flex; flex-direction:column; gap:.65rem; }
      .scriptLine { color: #e6f0ff; line-height: 1.45; }

      .scriptLine.active-script-line {
        border-left: 4px solid rgba(110,168,255,.6);
        padding-left: .6rem;
      }

      .speaker { font-weight: 900; color: #cfe0ff; }

      mark.evidence {
        background: rgba(255,214,102,.18);
        border-bottom: 2px solid rgba(255,214,102,.55);
        color: #e6f0ff;
        padding: 0 .1rem;
        border-radius: 2px;
      }

      .navRow {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }

      .navDots {
        display: flex;
        gap: .45rem;
        flex-wrap: wrap;
        justify-content: center;
        flex: 1;
      }

      .dot {
        min-width: 38px;
        height: 38px;
        border-radius: 999px;
        border: 1px solid #2c4b83;
        background: #101f3f;
        color: #e6f0ff;
        cursor: pointer;
        font-weight: 800;
      }

      .dot.active {
        box-shadow: 0 0 0 2px rgba(88,150,255,.22);
        border-color: rgba(88,150,255,.85);
      }

      .dot.checked {
        background: rgba(255,255,255,.08);
      }

      .dot.correct {
        border-color: rgba(70,200,120,.85);
      }

      @media (max-width: 720px) {
        .questionTop {
          flex-direction: column;
        }

        .navRow {
          align-items: stretch;
        }

        .navDots {
          order: 3;
          width: 100%;
        }
      }
    `}</style>
  );
}