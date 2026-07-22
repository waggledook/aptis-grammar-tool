import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  GitCompareArrows,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import ReadingCaseNavigator from "./ReadingCaseNavigator.jsx";
import "./styles/ote.css";

const DIAGNOSES = [
  { id: "exact", label: "Exact match", description: "Every important part of the question is present." },
  { id: "related", label: "Related, but different", description: "The same area is discussed, but the candidate makes a different point without directly opposing the question." },
  { id: "opposite", label: "Opposite view", description: "The candidate clearly contradicts or rules out the idea in the question." },
];

const PROFILES = [
  {
    id: "A",
    name: "Mara Singh",
    role: "Cultural journalist",
    paragraphs: [
      "When I saw the title Night Shift: Cities After Dark, I expected a loud celebration of neon signs, entertainment districts and all-night clubs. Instead, the exhibition begins quietly, with bakers preparing bread before dawn, hospital staff changing shifts and cleaners entering offices after everyone else has left. This is a much more interesting decision. The recorded testimony is the exhibition’s greatest strength. Workers describe how darkness changes their relationships with familiar streets, and their voices prevent the subject from becoming an abstract discussion of planning and architecture.",
      "A large digital map comparing several neighbourhoods in the 1950s with the same areas today is useful, although so much information appears at once that it can be difficult to follow. I understand why the curators have built most of the exhibition around three cities, as this gives the material some coherence. Even so, the outer districts receive far less attention than the centres.",
      "The route through the galleries is clear, and the audio guide adds extra voices rather than information essential to understanding the displays. Some of the written explanations assume a fair amount of historical knowledge, however, so school groups would probably benefit from a guide. The final film follows night workers leaving the city as the first morning commuters arrive. I found this simple handover unexpectedly moving.",
    ],
  },
  {
    id: "B",
    name: "Theo Grant",
    role: "Urban historian",
    paragraphs: [
      "I approached the exhibition with some caution. Museums often present the urban past through attractive photographs of gas lamps, empty streets and elegant late-night cafés, encouraging visitors to feel nostalgic for a period that was uncomfortable or dangerous for many people. I was relieved that the curators largely resist that temptation. Alongside advertisements and theatre programmes, they include police records, workplace regulations and accounts of people who were excluded from particular areas after dark. For me, these documents provide the exhibition’s real authority.",
      "The recorded voices are welcome, but they occasionally seem to have been selected more for emotional effect than for the information they provide. I was less convinced by an interactive screen that allows visitors to alter the level of street lighting and watch patterns of movement change. It is enjoyable to use, but it risks suggesting that complicated questions of safety, work and public behaviour can be solved simply by making streets brighter.",
      "The decision to concentrate on a limited number of cities is sensible; the brief comparisons with places elsewhere are among the least convincing sections. Younger visitors should find the physical objects and concise explanations accessible without specialist help. The route is also intuitive, so I saw no particular need for the audio guide. My main reservation concerns the final film. I could see why other visitors found its contrast between departing night workers and arriving commuters poignant, but its point is clear within the first few minutes and it continues for nearly twenty.",
    ],
  },
  {
    id: "C",
    name: "Elena Álvarez",
    role: "Exhibition designer",
    paragraphs: [
      "Night Shift presents itself as an exploration of how cities around the world change after dark. That promise is only partly fulfilled. Nearly all the major examples come from Western Europe, with other regions appearing in a few photographs near the end. A genuinely wider geographical range would have shown whether apparently universal experiences of darkness are actually shaped by climate, culture and local working practices.",
      "Some of the strongest moments are the personal recordings, particularly an account by a nurse who describes the strange calm of travelling home while the city is beginning to wake. Unfortunately, these voices are relatively scarce and are sometimes placed where visitors may pass without noticing them. Visually, the exhibition is impressive. The large projection showing how people move through streets as lighting changes makes an otherwise technical subject immediately understandable. Elsewhere, though, the use of sepia photographs and old-fashioned lettering occasionally slips into precisely the kind of comfortable nostalgia the exhibition claims to question.",
      "The visual displays should hold the attention of younger visitors, and most of the central argument can be followed without much additional explanation. Navigation is a more serious problem. Several themes continue in rooms on a different floor, and visitors are repeatedly sent backwards. The audio guide is therefore almost essential, not because the displays are unclear individually, but because it explains how the scattered sections connect. The final film is beautifully produced, though I admired its construction more than I responded to it emotionally.",
    ],
  },
];

const QUESTIONS = [
  {
    id: "geographical-range",
    title: "Geographical range",
    question: "Who believes that the exhibition should represent a wider range of countries?",
    answer: "C",
    distinction: "More areas within the same cities is not the same as more countries.",
    candidates: {
      A: { diagnosis: "related", highlights: ["the outer districts receive far less attention than the centres"], why: "Mara wants more coverage outside the city centres, not a wider range of countries." },
      B: { diagnosis: "opposite", highlights: ["The decision to concentrate on a limited number of cities is sensible"], why: "Theo supports the restricted geographical focus and dislikes the brief comparisons elsewhere." },
      C: { diagnosis: "exact", highlights: ["A genuinely wider geographical range would have shown whether apparently universal experiences of darkness are actually shaped by climate, culture and local working practices"], why: "Elena explicitly argues for examples from a broader range of countries and regions." },
    },
  },
  {
    id: "nostalgia",
    title: "Avoiding nostalgia",
    question: "Who was pleased that the exhibition avoided presenting the past too sentimentally?",
    answer: "B",
    distinction: "Expecting nostalgia and feeling relieved is different from believing that nostalgia remains.",
    candidates: {
      A: { diagnosis: "related", highlights: ["I expected a loud celebration of neon signs, entertainment districts and all-night clubs"], why: "Mara’s expectations were corrected, but she expected a flashy celebration of nightlife rather than a sentimental view of the past." },
      B: { diagnosis: "exact", highlights: ["I was relieved that the curators largely resist that temptation"], why: "Theo expected romanticised history but was pleased to find evidence of danger, restrictions and exclusion." },
      C: { diagnosis: "related", highlights: ["occasionally slips into precisely the kind of comfortable nostalgia the exhibition claims to question"], why: "Elena discusses nostalgia, but criticises its occasional presence rather than expressing Theo’s relief that it was largely avoided." },
    },
  },
  {
    id: "recorded-testimony",
    title: "The strongest feature",
    question: "Who regards the recorded experiences of individuals as the exhibition’s most successful feature?",
    answer: "A",
    distinction: "One of the strongest features is not necessarily the strongest feature overall.",
    candidates: {
      A: { diagnosis: "exact", highlights: ["The recorded testimony is the exhibition’s greatest strength"], why: "Mara directly identifies the workers’ recorded voices as the best feature." },
      B: { diagnosis: "related", highlights: ["The recorded voices are welcome, but they occasionally seem to have been selected more for emotional effect than for the information they provide"], why: "Theo welcomes the recordings but has reservations and gives the historical documents greater authority." },
      C: { diagnosis: "related", highlights: ["Some of the strongest moments are the personal recordings"], why: "Elena values the recordings, but does not call them the exhibition’s single greatest strength." },
    },
  },
  {
    id: "interactive-feature",
    title: "Oversimplification",
    question: "Who thinks that an interactive feature makes a complicated issue appear too simple?",
    answer: "B",
    distinction: "Too much information is not the same problem as a misleadingly simple explanation.",
    candidates: {
      A: { diagnosis: "related", highlights: ["so much information appears at once that it can be difficult to follow"], why: "Mara criticises a digital feature for containing too much information, not for making the issue too simple." },
      B: { diagnosis: "exact", highlights: ["it risks suggesting that complicated questions of safety, work and public behaviour can be solved simply by making streets brighter"], why: "Theo thinks the screen reduces a complex social question to an overly simple solution." },
      C: { diagnosis: "related", highlights: ["makes an otherwise technical subject immediately understandable"], why: "Elena discusses simplifying a technical subject, but praises its clarity rather than judging whether it reduces the issue too far." },
    },
  },
  {
    id: "younger-visitors",
    title: "Additional help",
    question: "Who believes that some younger visitors may require additional help?",
    answer: "A",
    distinction: "Needing help with the ideas is different from needing help to find the correct route.",
    candidates: {
      A: { diagnosis: "exact", highlights: ["Some of the written explanations assume a fair amount of historical knowledge", "school groups would probably benefit from a guide"], why: "Mara thinks school groups may need support with some of the written material." },
      B: { diagnosis: "opposite", highlights: ["Younger visitors should find the physical objects and concise explanations accessible without specialist help"], why: "Theo explicitly believes that younger visitors can understand the exhibition without specialist support." },
      C: { diagnosis: "related", highlights: ["The visual displays should hold the attention of younger visitors", "most of the central argument can be followed without much additional explanation"], why: "Elena discusses younger visitors and accessibility, but her need for extra guidance concerns navigation rather than understanding the material." },
    },
  },
  {
    id: "final-film",
    title: "An emotional response",
    question: "Who was particularly emotionally affected by the exhibition’s final film?",
    answer: "A",
    distinction: "Recognising another person’s emotional response is not the same as experiencing it yourself.",
    candidates: {
      A: { diagnosis: "exact", highlights: ["I found this simple handover unexpectedly moving"], why: "Mara describes a clear personal emotional response to the film’s final handover." },
      B: { diagnosis: "related", highlights: ["I could see why other visitors found its contrast between departing night workers and arriving commuters poignant"], why: "Theo recognises why other people found the film moving, but does not describe that response as his own." },
      C: { diagnosis: "opposite", highlights: ["I admired its construction more than I responded to it emotionally"], why: "Elena praises the production while explicitly denying a strong emotional response." },
    },
  },
  {
    id: "audio-guide",
    title: "Difficult navigation",
    question: "Who believes that the audio guide is necessary because the exhibition is difficult to navigate?",
    answer: "C",
    distinction: "The guide is needed because sections are scattered, not because individual displays are hard to understand.",
    candidates: {
      A: { diagnosis: "opposite", highlights: ["The route through the galleries is clear", "the audio guide adds extra voices rather than information essential to understanding the displays"], why: "Mara finds the route clear and considers the guide optional." },
      B: { diagnosis: "opposite", highlights: ["The route is also intuitive, so I saw no particular need for the audio guide"], why: "Theo also believes visitors can navigate without the guide." },
      C: { diagnosis: "exact", highlights: ["visitors are repeatedly sent backwards", "The audio guide is therefore almost essential"], why: "Elena needs the guide to connect sections that are physically scattered around the exhibition." },
    },
  },
];

const LECTURE_PROFILES = [
  {
    id: "A",
    name: "Dr Priya Shah",
    role: "Learning-sciences researcher",
    paragraphs: [
      "Recorded lectures are often presented as a neutral convenience, but their availability can change the way students behave. In research across six university departments, we found that students who attended regularly tended to use recordings selectively, returning to short sections they had found difficult. By contrast, those who missed several classes often allowed the recordings to accumulate and watched them shortly before an assessment. The technology did not create procrastination, but it certainly made postponement easier.",
      "I therefore resist describing recording as an automatic solution to accessibility. A fast lecture preserved with poor audio and inaccurate captions may reproduce barriers rather than remove them. I am also concerned about its effect on teaching. When every remark is permanently stored, some lecturers become less willing to improvise, test unfinished examples or invite controversial discussion. That loss is difficult to measure, but it matters. I do not argue for switching cameras off whenever teaching becomes interactive. It is often enough to pause the recording during a sensitive exchange and resume afterwards.",
      "Nor do I accept that recordings make attendance pointless: students who come to class generally use them more effectively. What worries me is the assumption that because a session can be replayed, active listening and note-making are no longer necessary. Students still need to decide what matters while the ideas are being developed. Recordings work best when integrated into a clear study routine, not treated as an archive to be opened at the end of term.",
    ],
  },
  {
    id: "B",
    name: "Martin Cole",
    role: "Senior history lecturer",
    paragraphs: [
      "When our university introduced automatic lecture capture, I opposed it. I expected attendance to collapse and assumed that most students would treat recordings as a substitute for being in the room. Neither prediction was borne out in my classes. Attendance remained broadly stable, and students showed me how they used the files: they returned to maps, statistics and explanations they had not fully understood the first time. That changed my position. I now describe the recording as a safety net, not a second version of the course. The live session still matters because questions, brief discussions and the pace of the room shape how I explain the material.",
      "Recording has altered my teaching, though not entirely negatively. I am more conscious of structure and less likely to wander away from the main argument. Perhaps I am also slightly less spontaneous, but the trade-off seems worthwhile. I do not think every event should be captured. Small seminars, language classes and practical workshops depend on students taking risks, and a permanent record can make them cautious. In those formats, recording should normally be off unless there is a particular reason to use it.",
      "In large lectures, however, I record by default. I encourage students to make brief notes rather than transcribe every slide, then revisit any difficult section within a day or two. The system works badly only when students assume that having access to a recording is equivalent to having engaged with it.",
    ],
  },
  {
    id: "C",
    name: "Amara Okafor",
    role: "University accessibility adviser",
    paragraphs: [
      "As an accessibility adviser, I have consistently argued that lecture recording should not be treated as an optional extra for a small, identifiable group. Many students who benefit from it never disclose a condition to their department. Others are managing temporary illness, anxiety, fatigue, caring responsibilities or studying in a second language; their needs may not fit a neat administrative category. Requiring each person to request special access creates unnecessary obstacles. Recording should therefore be the default, with narrow exceptions for genuine privacy concerns.",
      "That does not mean every minute must be preserved. A confidential discussion can be paused, but an entire session should not disappear simply because a lecturer prefers not to be recorded. Nor should staff anxiety about sounding less natural outweigh students’ access. Training and clear policies can help lecturers feel more comfortable. For many learners, knowing that they can replay an explanation improves what happens in the room: instead of trying to write down every sentence, they can note the main point, listen carefully and return later for detail.",
      "I have also seen students attend sessions they might otherwise avoid because the recording reduces their fear of missing something important. Of course, a file cannot reproduce live interaction. For some students, however, it is not merely a supplement; on a difficult day, it may be their only realistic route into the material. The goal is not to replace teaching but to make access less dependent on perfect health, confidence and circumstances.",
    ],
  },
];

const LECTURE_QUESTIONS = [
  {
    id: "lecture-delayed-engagement",
    title: "Delayed engagement",
    question: "Who believes that access to recordings can make it easier for students to postpone dealing with course content?",
    answer: "A",
    distinction: "Failing to engage properly is not necessarily the same as delaying engagement until later.",
    candidates: {
      A: { diagnosis: "exact", highlights: ["those who missed several classes often allowed the recordings to accumulate and watched them shortly before an assessment", "it certainly made postponement easier"], why: "Priya explicitly says that recording technology can make postponement easier." },
      B: { diagnosis: "related", highlights: ["The system works badly only when students assume that having access to a recording is equivalent to having engaged with it"], why: "Martin criticises passive access without real engagement, but does not specifically describe delaying the work." },
      C: { diagnosis: "related", highlights: ["students attend sessions they might otherwise avoid because the recording reduces their fear of missing something important"], why: "Amara describes recording as encouraging participation, not as a reason for postponing course content." },
    },
  },
  {
    id: "lecture-changed-opinion",
    title: "A changed opinion",
    question: "Who reports changing their view after learning how students actually used the recordings?",
    answer: "B",
    distinction: "Learning something from evidence does not automatically mean that the writer changed their opinion.",
    candidates: {
      A: { diagnosis: "related", highlights: ["In research across six university departments, we found that students who attended regularly tended to use recordings selectively"], why: "Priya reports research findings, but does not say that they changed her own position." },
      B: { diagnosis: "exact", highlights: ["students showed me how they used the files", "That changed my position"], why: "Martin originally opposed recording but reconsidered after seeing students use it constructively." },
      C: { diagnosis: "opposite", highlights: ["I have consistently argued that lecture recording should not be treated as an optional extra"], why: "Amara explicitly presents her position as consistent rather than changed." },
    },
  },
  {
    id: "lecture-undisclosed-needs",
    title: "Undisclosed needs",
    question: "Who believes recordings are important partly because students may not tell the university about difficulties affecting their studies?",
    answer: "C",
    distinction: "Providing support when a need is known is not the same as recognising that some needs may never be disclosed.",
    candidates: {
      A: { diagnosis: "related", highlights: ["A fast lecture preserved with poor audio and inaccurate captions may reproduce barriers rather than remove them"], why: "Priya discusses accessibility barriers, but not students whose needs remain unknown to the university." },
      B: { diagnosis: "related", highlights: ["recording should normally be off unless there is a particular reason to use it"], why: "Martin allows exceptions where a reason exists, but does not discuss students who have not formally identified their needs." },
      C: { diagnosis: "exact", highlights: ["Many students who benefit from it never disclose a condition to their department"], why: "Amara directly argues that access should not depend on students revealing or proving a difficulty." },
    },
  },
  {
    id: "lecture-spontaneity",
    title: "Less natural teaching",
    question: "Who treats reduced spontaneity as a significant disadvantage of recording lectures?",
    answer: "A",
    distinction: "Noticing the same possible disadvantage is not the same as giving it equal importance.",
    candidates: {
      A: { diagnosis: "exact", highlights: ["some lecturers become less willing to improvise, test unfinished examples or invite controversial discussion", "That loss is difficult to measure, but it matters"], why: "Priya considers the loss of spontaneity an important, if difficult-to-measure, cost." },
      B: { diagnosis: "related", highlights: ["Perhaps I am also slightly less spontaneous, but the trade-off seems worthwhile"], why: "Martin notices the same effect but accepts it as a reasonable price for the benefits." },
      C: { diagnosis: "related", highlights: ["Nor should staff anxiety about sounding less natural outweigh students’ access"], why: "Amara recognises the concern but gives students’ access greater weight." },
    },
  },
  {
    id: "lecture-unrecorded-classes",
    title: "Classes left unrecorded",
    question: "Who believes that certain types of class should normally not be recorded?",
    answer: "B",
    distinction: "Pausing part of a session is not the same as normally leaving the entire class unrecorded.",
    candidates: {
      A: { diagnosis: "opposite", highlights: ["I do not argue for switching cameras off whenever teaching becomes interactive", "It is often enough to pause the recording during a sensitive exchange and resume afterwards"], why: "Priya prefers temporary pauses rather than leaving whole interactive sessions unrecorded." },
      B: { diagnosis: "exact", highlights: ["Small seminars, language classes and practical workshops", "recording should normally be off unless there is a particular reason to use it"], why: "Martin identifies complete types of class that should generally remain unrecorded." },
      C: { diagnosis: "opposite", highlights: ["Recording should therefore be the default, with narrow exceptions for genuine privacy concerns", "an entire session should not disappear simply because a lecturer prefers not to be recorded"], why: "Amara supports recording by default and accepts only narrow exceptions." },
    },
  },
  {
    id: "lecture-note-taking",
    title: "Listening and note-taking",
    question: "Who believes recordings help students focus on listening instead of trying to write down everything?",
    answer: "C",
    distinction: "Discussing shorter notes is not the same as explicitly connecting replay access with more attentive listening.",
    candidates: {
      A: { diagnosis: "related", highlights: ["What worries me is the assumption that because a session can be replayed, active listening and note-making are no longer necessary"], why: "Priya discusses the effect on listening and notes, but warns that students must continue doing both actively." },
      B: { diagnosis: "related", highlights: ["I encourage students to make brief notes rather than transcribe every slide, then revisit any difficult section"], why: "Martin recommends shorter notes and later review, but does not explicitly present improved live listening as the benefit." },
      C: { diagnosis: "exact", highlights: ["instead of trying to write down every sentence, they can note the main point, listen carefully and return later for detail"], why: "Amara directly connects replay access with listening carefully instead of capturing every sentence." },
    },
  },
  {
    id: "lecture-safety-net",
    title: "A backup, not a replacement",
    question: "Who describes recordings as a form of backup rather than an alternative to attending?",
    answer: "B",
    distinction: "Something can usually be a supplement while still becoming the main form of access for certain students.",
    candidates: {
      A: { diagnosis: "related", highlights: ["students who come to class generally use them more effectively"], why: "Priya links attendance with more effective recording use, but does not explicitly define the recording as a backup." },
      B: { diagnosis: "exact", highlights: ["I now describe the recording as a safety net, not a second version of the course"], why: "Martin clearly presents it as support for the live course rather than a replacement." },
      C: { diagnosis: "opposite", highlights: ["it is not merely a supplement", "it may be their only realistic route into the material"], why: "Amara argues that for some learners the recording may temporarily replace access to the live session." },
    },
  },
];

const ROUNDS = [
  {
    id: "museum",
    label: "Round 1",
    title: "Night Shift: Cities After Dark",
    description: "Three critics review the same museum exhibition.",
    profiles: PROFILES,
    questions: QUESTIONS,
  },
  {
    id: "lectures",
    label: "Round 2",
    title: "Recorded Lectures: Help or Hindrance?",
    description: "Three university professionals discuss whether lectures should automatically be recorded.",
    profiles: LECTURE_PROFILES,
    questions: LECTURE_QUESTIONS,
  },
];

function getDiagnosis(id) {
  return DIAGNOSES.find((diagnosis) => diagnosis.id === id);
}

function getShortName(profile) {
  return profile.name.replace(/^(Dr|Professor)\s+/, "").split(" ")[0];
}

function HighlightedParagraph({ text, fragments = [] }) {
  const ranges = fragments
    .map((fragment) => ({ fragment, start: text.indexOf(fragment) }))
    .filter(({ start }) => start >= 0)
    .sort((a, b) => a.start - b.start);
  if (!ranges.length) return text;
  const output = [];
  let cursor = 0;
  ranges.forEach(({ fragment, start }) => {
    if (start < cursor) return;
    if (start > cursor) output.push(text.slice(cursor, start));
    output.push(<mark key={`${fragment}:${start}`}>{fragment}</mark>);
    cursor = start + fragment.length;
  });
  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

function ReviewProfiles({ profiles, question = null }) {
  return profiles.map((profile) => (
    <article className="ote-decode-profile" key={profile.id}>
      <header><span>{profile.id}</span><div><h3>{profile.name}</h3><p>{profile.role}</p></div></header>
      <p>
        {profile.paragraphs.map((paragraph, index) => (
          <React.Fragment key={`${profile.id}:${index}`}>
            {index > 0 ? " " : ""}
            <HighlightedParagraph text={paragraph} fragments={question?.candidates?.[profile.id]?.highlights || []} />
          </React.Fragment>
        ))}
      </p>
    </article>
  ));
}

function getDiagnosticFeedback(matchScore, diagnosisScore) {
  if (matchScore === 7 && diagnosisScore === 14) return ["Excellent: you identified every exact match and diagnosed every alternative accurately."];
  const feedback = [];
  if (matchScore >= 6 && diagnosisScore < 10) feedback.push("You identify the exact answer, but inspect why the highlighted alternatives fail instead of relying on instinct.");
  if (matchScore < 5 && diagnosisScore >= 11) feedback.push("Your alternative analysis is careful. Compare every part of the question before choosing the exact label.");
  if (diagnosisScore < 8) feedback.push("Do not accept a shared topic as proof. Compare the exact opinion, reason, situation and degree.");
  if (matchScore < 5) feedback.push("Use the highlighted evidence to compare all three meanings before assigning the single exact-match label.");
  if (!feedback.length) feedback.push("Strong work. Recheck the few cases where a candidate shared the topic but changed the exact meaning.");
  return feedback.slice(0, 2);
}

function getRoundScores(round, work) {
  const matchScore = round.questions.filter((entry) => work[entry.id]?.diagnoses?.[entry.answer] === "exact").length;
  const diagnosisScore = round.questions.reduce((total, entry) => {
    const row = work[entry.id] || {};
    return total + round.profiles.filter((profile) => profile.id !== entry.answer && row.diagnoses?.[profile.id] === entry.candidates[profile.id].diagnosis).length;
  }, 0);
  const completed = round.questions.filter((entry) => work[entry.id]?.checked).length;
  return { matchScore, diagnosisScore, completed };
}

export default function OteAdvancedReadingCompareCandidates({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [work, setWork] = useState({});
  const loggedRoundsRef = useRef(new Set());
  const round = ROUNDS[roundIndex];
  const profiles = round.profiles;
  const questions = round.questions;
  const question = questions[questionIndex];
  const questionWork = work[question.id] || {};
  const allDiagnosed = profiles.every((profile) => questionWork.diagnoses?.[profile.id]);
  const roundScores = useMemo(() => ROUNDS.map((entry) => getRoundScores(entry, work)), [work]);
  const currentScores = roundScores[roundIndex];
  const completedCount = currentScores.completed;
  const basePath = nativeRoutes ? "/reading/advanced/part-2-matching" : "/ote/reading/advanced/part-2-matching";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/c1-pilot-1`);

  useEffect(() => {
    if (stage !== "round-complete" || loggedRoundsRef.current.has(round.id)) return;
    loggedRoundsRef.current.add(round.id);
    logOteTrainingCompleted({
      progressId: roundIndex === 0 ? "reading.part2.advanced-compare-candidates" : "reading.part2.advanced-compare-candidates-round-2",
      section: "reading",
      part: "part-2",
      mode: `compare_candidates_${round.id}`,
      taskId: `advanced-reading-part-2-compare-candidates-${round.id}`,
      taskTitle: `Compare the Candidates · ${round.label}`,
      variant: "advanced",
      score: currentScores.matchScore + currentScores.diagnosisScore,
      total: 21,
      matchScore: currentScores.matchScore,
      diagnosisScore: currentScores.diagnosisScore,
    });
  }, [currentScores.diagnosisScore, currentScores.matchScore, round.id, round.label, roundIndex, stage]);

  function updateQuestion(changes) {
    setWork((current) => ({ ...current, [question.id]: { ...(current[question.id] || {}), ...changes } }));
  }

  function chooseDiagnosis(profileId, diagnosis) {
    const diagnoses = { ...(questionWork.diagnoses || {}) };
    if (diagnosis === "exact") {
      profiles.forEach((profile) => {
        if (profile.id !== profileId && diagnoses[profile.id] === "exact") delete diagnoses[profile.id];
      });
    }
    diagnoses[profileId] = diagnosis;
    updateQuestion({ diagnoses });
  }

  function goNext() {
    if (completedCount === questions.length) {
      setStage("round-complete");
      return;
    }
    const next = questions.findIndex((entry, index) => index > questionIndex && !work[entry.id]?.checked);
    const first = questions.findIndex((entry) => !work[entry.id]?.checked);
    setQuestionIndex(next >= 0 ? next : first);
  }

  function resetActivity() {
    setStage("intro");
    setRoundIndex(0);
    setQuestionIndex(0);
    setWork({});
    loggedRoundsRef.current = new Set();
  }

  function startActivity() {
    setStage("run");
    setQuestionIndex(0);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function selectRound(index) {
    setRoundIndex(index);
    setQuestionIndex(0);
    setStage("intro");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  return (
    <main className="ote-training-page ote-decode-page ote-candidates-page">
      <Seo title="Compare the Candidates | OTE Advanced Reading Part 2 | Seif English" description="Compare exact matches with plausible alternatives in OTE Advanced Reading Part 2." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 2 training</button>
      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 2 · {round.label}</p>
        <h1>Compare the Candidates</h1>
        <p>{stage === "intro" ? `Begin with a quick first reading of “${round.title}”. The questions and evidence highlights will appear when you are ready.` : stage === "run" ? "The relevant evidence is already highlighted. Compare its precise meaning and decide how closely each candidate answers the question." : "Review your scores or continue with another comparison round."}</p>
      </header>

      {stage === "run" ? <>
        <section className="ote-training-summary" aria-label="Compare the Candidates overview">
          <div><CircleHelp size={24} aria-hidden="true" /><strong>1. Question</strong><span>Read the complete question carefully.</span></div>
          <div><Eye size={24} aria-hidden="true" /><strong>2. Inspect</strong><span>Read each highlighted passage in its original context.</span></div>
          <div><GitCompareArrows size={24} aria-hidden="true" /><strong>3. Evaluate</strong><span>Assign one exact match and diagnose the alternatives.</span></div>
        </section>

        <details className="ote-reading-target-reference ote-candidates-reference">
          <summary>The three comparison labels</summary>
          <div>{DIAGNOSES.map((diagnosis) => <article key={diagnosis.id}><strong>{diagnosis.label}</strong><span>{diagnosis.description}</span></article>)}</div>
        </details>
      </> : null}

      {stage === "intro" ? (
        <section className="ote-training-section ote-candidates-intro">
          <div className="ote-candidates-round-selector" aria-label="Choose a comparison round">
            {ROUNDS.map((entry, index) => {
              const scores = roundScores[index];
              return <button className={index === roundIndex ? "is-active" : ""} type="button" key={entry.id} onClick={() => selectRound(index)}><span>{entry.label}</span><strong>{entry.title}</strong><small>{scores.completed === entry.questions.length ? `${scores.matchScore}/7 exact · ${scores.diagnosisScore}/14 alternatives` : index === 0 ? "Core comparison round" : "Follow-up round"}</small></button>;
            })}
          </div>
          <div className="ote-candidates-intro-prompt">
            <Eye size={30} aria-hidden="true" />
            <div>
              <p className="ote-kicker">Before the questions</p>
              <h2>Skim the three reviews</h2>
              <p>{roundIndex === 0 ? "Read each critic’s review once to understand their main opinions. Do not search for answers or analyse every detail yet—the relevant evidence will be highlighted after you begin." : "You already know the method. Skim the three new responses for their main positions; the relevant evidence will be highlighted when the questions begin."}</p>
            </div>
          </div>
          <div className="ote-decode-profile-stack">
            <div className="ote-decode-text-heading"><p className="ote-kicker">{round.title}</p><h2>{round.description}</h2></div>
            <ReviewProfiles profiles={profiles} />
          </div>
          <div className="ote-candidates-intro-action">
            <p>Finished your first reading?</p>
            <button type="button" onClick={startActivity}>Start comparing <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : stage === "round-complete" ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><GitCompareArrows size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">{round.label} complete</p>
          <h2>{round.title}</h2>
          <div className="ote-cohesion-score-grid">
            <article><span>Best matches</span><strong>{currentScores.matchScore} / 7</strong><p>The person whose complete meaning answers the question.</p></article>
            <article><span>Alternative diagnoses</span><strong>{currentScores.diagnosisScore} / 14</strong><p>Why the two non-answer candidates fail to match exactly.</p></article>
          </div>
          <div className="ote-decode-diagnostic">{getDiagnosticFeedback(currentScores.matchScore, currentScores.diagnosisScore).map((message) => <p key={message}>{message}</p>)}</div>
          <div className="ote-reading-target-results">
            {questions.map((entry, index) => {
              const row = work[entry.id] || {};
              const alternativeScore = profiles.filter((profile) => profile.id !== entry.answer && row.diagnoses?.[profile.id] === entry.candidates[profile.id].diagnosis).length;
              const exactCorrect = row.diagnoses?.[entry.answer] === "exact";
              const allCorrect = exactCorrect && alternativeScore === 2;
              return <button key={entry.id} type="button" onClick={() => { setQuestionIndex(index); setStage("run"); }}>{allCorrect ? <CheckCircle2 size={19} aria-hidden="true" /> : <XCircle size={19} aria-hidden="true" />}<span>Question {index + 1}: {entry.title}</span><small>{exactCorrect ? 1 : 0}/1 · {alternativeScore}/2</small></button>;
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={() => setStage("complete")}>Finish for now</button>
            {roundIndex === 0 ? <button type="button" onClick={() => selectRound(1)}>Continue to Round 2 <ChevronRight size={17} aria-hidden="true" /></button> : <button type="button" onClick={() => setStage("complete")}>View lesson report <ChevronRight size={17} aria-hidden="true" /></button>}
          </div>
        </section>
      ) : stage === "complete" ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><GitCompareArrows size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Compare the Candidates</p>
          <h2>{roundScores.every((scores) => scores.completed === 7) ? "Both rounds complete" : "Your lesson report"}</h2>
          <div className="ote-candidates-lesson-report">
            {ROUNDS.map((entry, index) => {
              const scores = roundScores[index];
              const complete = scores.completed === entry.questions.length;
              return <article key={entry.id}><span>{entry.label}</span><h3>{entry.title}</h3>{complete ? <><strong>{scores.matchScore}/7 exact · {scores.diagnosisScore}/14 alternatives</strong><button type="button" onClick={() => selectRound(index)}>Review this round</button></> : <><p>Optional follow-up available.</p><button type="button" onClick={() => selectRound(index)}>Open this round</button></>}</article>;
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Start again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-decode-runner">
          <ReadingCaseNavigator items={questions} currentIndex={questionIndex} label={`Choose a ${round.label.toLowerCase()} question`} isComplete={(entry) => Boolean(work[entry.id]?.checked)} onSelect={setQuestionIndex} />
          <div className="ote-decode-search-layout">
            <div className="ote-decode-profile-stack">
              <div className="ote-decode-text-heading"><p className="ote-kicker">{round.title}</p><h2>{round.description}</h2></div>
              <ReviewProfiles profiles={profiles} question={question} />
            </div>

            <aside className="ote-decode-task-panel ote-candidates-task-panel">
              <p className="ote-kicker">{round.label} · Question {questionIndex + 1} of {questions.length}</p>
              <h2>{question.question}</h2>

              <section className="ote-decode-task-step">
                <h3>Evaluate the highlighted evidence</h3>
                <p>Choose one exact match. The other candidates may make a related but different point or express the opposite view.</p>
                <div className="ote-candidate-diagnosis-stack">
                  {profiles.map((profile) => {
                    const candidate = question.candidates[profile.id];
                    const selected = questionWork.diagnoses?.[profile.id];
                    const correct = selected === candidate.diagnosis;
                    return (
                      <article className={`ote-candidate-diagnosis ${questionWork.checked ? correct ? "is-correct" : "is-wrong" : ""}`} key={profile.id}>
                        <header><strong>{profile.id} — {getShortName(profile)}</strong>{questionWork.checked ? <span>{getDiagnosis(candidate.diagnosis)?.label}</span> : null}</header>
                        <div className="ote-candidate-label-row">{DIAGNOSES.map((diagnosis) => <button className={selected === diagnosis.id ? "is-selected" : ""} type="button" key={diagnosis.id} disabled={questionWork.checked} onClick={() => chooseDiagnosis(profile.id, diagnosis.id)}>{diagnosis.label}</button>)}</div>
                        {questionWork.checked ? <div className="ote-candidate-inline-feedback">{correct ? <CheckCircle2 size={17} aria-hidden="true" /> : <XCircle size={17} aria-hidden="true" />}<p><strong>{correct ? "Correct." : `Best label: ${getDiagnosis(candidate.diagnosis)?.label}.`}</strong> {candidate.why}</p></div> : null}
                      </article>
                    );
                  })}
                </div>
                {!questionWork.checked ? <button className="ote-reading-target-check" type="button" disabled={!allDiagnosed} onClick={() => updateQuestion({ checked: true })}>Check the comparison</button> : <div className="ote-candidates-distinction"><strong>Key distinction</strong><p>{question.distinction}</p></div>}
              </section>

              <div className="ote-cohesion-actions">
                <button className="is-secondary" type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => Math.max(0, current - 1))}><ChevronLeft size={17} aria-hidden="true" /> Previous question</button>
                <button type="button" disabled={!questionWork.checked} onClick={goNext}>{completedCount === questions.length ? `Complete ${round.label}` : "Next question"}<ChevronRight size={17} aria-hidden="true" /></button>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
