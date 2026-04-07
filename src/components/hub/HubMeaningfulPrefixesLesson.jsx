import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";

const LESSON_STAGES = [
  {
    id: "match-1",
    kind: "match",
    title: "Meaningful Prefixes 1",
    intro: "Match each highlighted prefix to its meaning.",
    items: [
      {
        id: "re",
        sentence: "After reading my essay, the teacher asked me to rewrite the introduction.",
        word: "rewrite",
        prefix: "re",
        meaning: "again",
      },
      {
        id: "pre",
        sentence: "We need to do some pre-course reading before classes begin.",
        word: "pre-course",
        prefix: "pre",
        meaning: "before",
      },
      {
        id: "post",
        sentence: "She decided to do a postgraduate course in linguistics.",
        word: "postgraduate",
        prefix: "post",
        meaning: "after",
      },
      {
        id: "mis",
        sentence: "Sorry, I misheard you. Could you repeat that?",
        word: "misheard",
        prefix: "mis",
        meaning: "wrongly",
      },
      {
        id: "under",
        sentence: "The chicken was still pink because it was undercooked.",
        word: "undercooked",
        prefix: "under",
        meaning: "not enough",
      },
      {
        id: "over",
        sentence: "He tends to overreact when things go wrong.",
        word: "overreact",
        prefix: "over",
        meaning: "too much",
      },
      {
        id: "co",
        sentence: "The two organisations agreed to cooperate on the project.",
        word: "cooperate",
        prefix: "co",
        meaning: "together",
      },
      {
        id: "anti",
        sentence: "This spray is antibacterial, so it helps kill germs.",
        word: "antibacterial",
        prefix: "anti",
        meaning: "against",
      },
    ],
  },
  {
    id: "match-2",
    kind: "match",
    title: "Meaningful Prefixes 2",
    intro: "Keep matching the highlighted prefix with the correct meaning.",
    items: [
      {
        id: "multi",
        sentence: "She takes a multivitamin every morning.",
        word: "multivitamin",
        prefix: "multi",
        meaning: "many / more than one",
      },
      {
        id: "mono",
        sentence: "“Dog” is a monosyllabic word.",
        word: "monosyllabic",
        prefix: "mono",
        meaning: "one",
      },
      {
        id: "bi",
        sentence: "Our school offers a bilingual programme.",
        word: "bilingual",
        prefix: "bi",
        meaning: "two",
      },
      {
        id: "out",
        sentence: "My son has outgrown most of his trousers this year.",
        word: "outgrown",
        prefix: "out",
        meaning: "beyond / bigger than",
      },
      {
        id: "auto",
        sentence: "This camera has an autofocus function.",
        word: "autofocus",
        prefix: "auto",
        meaning: "by itself / automatically",
      },
      {
        id: "micro",
        sentence: "Some microorganisms can only be seen with a microscope.",
        word: "microorganisms",
        prefix: "micro",
        meaning: "extremely small",
      },
      {
        id: "super",
        sentence: "With a superhuman effort, he lifted the box by himself.",
        word: "superhuman",
        prefix: "super",
        meaning: "above normal / more than usual",
      },
      {
        id: "inter",
        sentence: "We need to look at the problem from an interpersonal point of view.",
        word: "interpersonal",
        prefix: "inter",
        meaning: "between",
      },
    ],
  },
  {
    id: "choose-prefix",
    kind: "mcq",
    title: "Add the Correct Prefix",
    intro: "Choose the prefix that completes each word. After each choice, you will move straight to the next sentence.",
    items: [
      {
        id: "misquoted",
        prompt: "I think the journalist completely ______quoted the politician's statement.",
        options: ["pre-", "mis-", "over-", "co-", "bi-"],
        answer: "mis-",
        fullAnswer: "misquoted",
      },
      {
        id: "rebuild",
        prompt: "The company had to ______build the website after the original version crashed.",
        options: ["re-", "under-", "anti-", "mono-", "inter-"],
        answer: "re-",
        fullAnswer: "rebuild",
      },
      {
        id: "overcook",
        prompt: "If you ______cook the pasta, it goes soft and unpleasant.",
        options: ["post-", "sub-", "over-", "auto-", "out-"],
        answer: "over-",
        fullAnswer: "overcook",
      },
      {
        id: "underfunded",
        prompt: "Some schools are seriously ______funded and struggle to buy basic materials.",
        options: ["mis-", "under-", "super-", "re-", "multi-"],
        answer: "under-",
        fullAnswer: "underfunded",
      },
      {
        id: "coauthor",
        prompt: "The two writers decided to ______author the article.",
        options: ["inter-", "pre-", "co-", "out-", "mono-"],
        answer: "co-",
        fullAnswer: "co-author",
      },
      {
        id: "antismoking",
        prompt: "The government launched an ______smoking campaign aimed at teenagers.",
        options: ["anti-", "auto-", "post-", "bi-", "re-"],
        answer: "anti-",
        fullAnswer: "anti-smoking",
      },
      {
        id: "preface",
        prompt: "You should read the ______face before the introduction to understand the context of the book.",
        options: ["out-", "pre-", "super-", "mis-", "inter-"],
        answer: "pre-",
        fullAnswer: "preface",
      },
      {
        id: "postnatal",
        prompt: "The patient needed several weeks of ______natal care after giving birth.",
        options: ["over-", "mono-", "post-", "sub-", "co-"],
        answer: "post-",
        fullAnswer: "postnatal",
      },
      {
        id: "rewrite",
        prompt: "He had to ______write the exam because he had been ill the first time.",
        options: ["bi-", "re-", "under-", "anti-", "micro-"],
        answer: "re-",
        fullAnswer: "rewrite",
      },
      {
        id: "overcharging",
        prompt: "The company was accused of ______charging customers for repairs they didn't need.",
        options: ["auto-", "inter-", "over-", "pre-", "mono-"],
        answer: "over-",
        fullAnswer: "overcharging",
      },
      {
        id: "misjudged",
        prompt: "I think we may have ______judged her — she was actually very capable.",
        options: ["mis-", "out-", "sub-", "co-", "post-"],
        answer: "mis-",
        fullAnswer: "misjudged",
      },
      {
        id: "outlive",
        prompt: "This species can easily ______live many of its natural predators.",
        options: ["pre-", "out-", "under-", "bi-", "anti-"],
        answer: "out-",
        fullAnswer: "outlive",
      },
      {
        id: "interdepartmental",
        prompt: "Our department needs better ______departmental communication to avoid confusion.",
        options: ["multi-", "re-", "inter-", "super-", "auto-"],
        answer: "inter-",
        fullAnswer: "interdepartmental",
      },
      {
        id: "multipurpose",
        prompt: "She bought a ______purpose cleaner for the kitchen and bathroom.",
        options: ["mono-", "anti-", "under-", "multi-", "post-"],
        answer: "multi-",
        fullAnswer: "multipurpose",
      },
      {
        id: "bilateral",
        prompt: "The two countries signed a ______lateral trade agreement last year.",
        options: ["bi-", "pre-", "mis-", "out-", "sub-"],
        answer: "bi-",
        fullAnswer: "bilateral",
      },
      {
        id: "supernatural",
        prompt: "The film presents the hero as an almost ______natural figure with impossible strength.",
        options: ["co-", "post-", "super-", "under-", "inter-"],
        answer: "super-",
        fullAnswer: "supernatural",
      },
    ],
  },
  {
    id: "word-formation-challenge",
    kind: "challenge",
    title: "Word Formation Challenge",
    intro: "Type the correct missing word. You will get 8 random sentences from the bank, and you can replay with a new set when you finish.",
  },
];

const MCQ_FEEDBACK_DELAY_MS = 900;
const CHALLENGE_SET_SIZE = 8;
const CHALLENGE_BANK = [
  {
    id: "rebuilt",
    prompt: "After months of delay, the bridge was finally ______ after the storm damage.",
    base: "BUILD",
    answer: "rebuilt",
  },
  {
    id: "reworking",
    prompt: "The manager said the proposal needed some major ______ before it could be approved.",
    base: "WORK",
    answer: "reworking",
  },
  {
    id: "remake",
    prompt: "The film was a commercial success, but critics questioned the ______ of such a recent classic.",
    base: "MAKE",
    answer: "remake",
  },
  {
    id: "reconsideration",
    prompt: "Following the interview, the committee agreed that her application deserved ______.",
    base: "CONSIDER",
    answer: "reconsideration",
  },
  {
    id: "reintegration",
    prompt: "One of the charity's main aims is the ______ of people who have been out of work for a long time.",
    base: "INTEGRATE",
    answer: "reintegration",
  },
  {
    id: "preconceptions",
    prompt: "Many children arrive at school with certain ______ about what their classmates will be like.",
    base: "CONCEIVE",
    answer: "preconceptions",
  },
  {
    id: "prepayment",
    prompt: "Guests are asked to make full ______ at least seven days before arrival.",
    base: "PAY",
    answer: "prepayment",
  },
  {
    id: "prejudicial",
    prompt: "The lawyer argued that the comments might influence the jury and therefore be ______.",
    base: "JUDGE",
    answer: "prejudicial",
  },
  {
    id: "preplanning",
    prompt: "The success of the project depends on careful ______ before any work begins.",
    base: "PLAN",
    answer: "preplanning",
  },
  {
    id: "pre-war",
    prompt: "The soldiers returned to a country that no longer resembled their ______ world.",
    base: "WAR",
    answer: "pre-war",
  },
  {
    id: "post-war",
    prompt: "In the years immediately after the conflict, the country faced serious ______ shortages.",
    base: "WAR",
    answer: "post-war",
  },
  {
    id: "postgraduate-life",
    prompt: "Students often find the move from university to ______ life more difficult than expected.",
    base: "GRADUATE",
    answer: "postgraduate",
  },
  {
    id: "post-operative",
    prompt: "The patient will need regular monitoring during the ______ period.",
    base: "OPERATE",
    answer: "post-operative",
  },
  {
    id: "post-election",
    prompt: "After the election, there was a long period of ______ analysis in the media.",
    base: "ELECT",
    answer: "post-election",
  },
  {
    id: "postcolonial",
    prompt: "Some critics argue that the country is still dealing with the social effects of its ______ past.",
    base: "COLONY",
    answer: "postcolonial",
  },
  {
    id: "misunderstanding",
    prompt: "The whole argument seems to be based on a complete ______ of what the report actually says.",
    base: "UNDERSTAND",
    answer: "misunderstanding",
  },
  {
    id: "misidentified",
    prompt: "The witness later admitted that she may have ______ the man she saw leaving the building.",
    base: "IDENTIFY",
    answer: "misidentified",
  },
  {
    id: "misrepresentation",
    prompt: "The article was criticised for its ______ of the scientist's original findings.",
    base: "REPRESENT",
    answer: "misrepresentation",
  },
  {
    id: "misspelling",
    prompt: "A simple ______ on the form led to a long delay in processing the application.",
    base: "SPELL",
    answer: "misspelling",
  },
  {
    id: "misconception",
    prompt: "There is still a widespread ______ that the disease only affects older people.",
    base: "CONCEIVE",
    answer: "misconception",
  },
  {
    id: "underpaid",
    prompt: "Teachers in many regions complain of being overworked and ______.",
    base: "PAY",
    answer: "underpaid",
  },
  {
    id: "underinvestment",
    prompt: "The town's transport system has suffered for years from chronic ______.",
    base: "INVEST",
    answer: "underinvestment",
  },
  {
    id: "underestimation",
    prompt: "The problem was made worse by the government's ______ of the scale of the crisis.",
    base: "ESTIMATE",
    answer: "underestimation",
  },
  {
    id: "underprivileged",
    prompt: "The charity is trying to support young people from ______ communities.",
    base: "PRIVILEGE",
    answer: "underprivileged",
  },
  {
    id: "understaffing",
    prompt: "Several hospitals are facing serious problems because of continued ______.",
    base: "STAFF",
    answer: "understaffing",
  },
  {
    id: "overemphasis",
    prompt: "One risk of exam preparation is the ______ of grammar rules that students already know well.",
    base: "EMPHASISE",
    answer: "overemphasis",
  },
  {
    id: "overstatement",
    prompt: "The interview panel felt that his confidence sometimes turned into ______.",
    base: "STATE",
    answer: "overstatement",
  },
  {
    id: "overanalyse",
    prompt: "Children can become anxious if adults are too protective and ______ their behaviour.",
    base: "ANALYSE",
    answer: "overanalyse",
  },
  {
    id: "overdosing",
    prompt: "The medicine is safe when used properly, but ______ can cause serious side effects.",
    base: "DOSE",
    answer: "overdosing",
  },
  {
    id: "overscheduling",
    prompt: "Some parents worry that their children are being exposed to too much pressure and ______.",
    base: "SCHEDULE",
    answer: "overscheduling",
  },
  {
    id: "co-authored",
    prompt: "The book was written by two researchers and is officially listed as a ______ work.",
    base: "AUTHOR",
    answer: "co-authored",
  },
  {
    id: "cooperation",
    prompt: "The success of the project depended on close ______ between the school and local families.",
    base: "OPERATE",
    answer: "cooperation",
  },
  {
    id: "co-founders",
    prompt: "The company's two ______ rarely agreed on long-term strategy.",
    base: "FOUND",
    answer: "co-founders",
  },
  {
    id: "coexistence",
    prompt: "Many animals can survive in the same environment through peaceful ______.",
    base: "EXIST",
    answer: "coexistence",
  },
  {
    id: "cooperate",
    prompt: "The two departments were expected to ______ more closely on future projects.",
    base: "OPERATE",
    answer: "cooperate",
  },
  {
    id: "interpersonal-relationships",
    prompt: "Good communication skills are essential for building strong ______ relationships at work.",
    base: "PERSON",
    answer: "interpersonal",
  },
  {
    id: "interdisciplinary",
    prompt: "The issue is so complex that it requires an ______ approach involving several fields of study.",
    base: "DISCIPLINE",
    answer: "interdisciplinary",
  },
  {
    id: "international",
    prompt: "The conference focuses on ______ trade and economic policy.",
    base: "NATION",
    answer: "international",
  },
  {
    id: "intercultural",
    prompt: "The museum exhibition explores the long history of ______ exchange in the Mediterranean.",
    base: "CULTURE",
    answer: "intercultural",
  },
  {
    id: "intercity",
    prompt: "The town's poor rail links have made ______ travel difficult for commuters.",
    base: "CITY",
    answer: "intercity",
  },
  {
    id: "anti-bullying",
    prompt: "Many schools now have clear ______ policies to deal with harassment.",
    base: "BULLY",
    answer: "anti-bullying",
  },
  {
    id: "anti-inflammatory",
    prompt: "The medicine contains ______ substances that reduce pain and swelling.",
    base: "INFLAME",
    answer: "anti-inflammatory",
  },
  {
    id: "anti-smoking",
    prompt: "The organisation launched an ______ campaign aimed at reducing cigarette use.",
    base: "SMOKE",
    answer: "anti-smoking",
  },
  {
    id: "antibacterial-2",
    prompt: "Some household products are advertised as having ______ properties that kill bacteria.",
    base: "BACTERIA",
    answer: "antibacterial",
  },
  {
    id: "anti-terrorist",
    prompt: "The government introduced stricter ______ measures at major airports.",
    base: "TERROR",
    answer: "anti-terrorist",
  },
  {
    id: "multitasking",
    prompt: "In many modern workplaces, employees are expected to be good at ______ and handling several tasks at once.",
    base: "TASK",
    answer: "multitasking",
  },
  {
    id: "multicultural",
    prompt: "The city is known for its ______ population and wide range of cultural festivals.",
    base: "CULTURE",
    answer: "multicultural",
  },
  {
    id: "multipurpose",
    prompt: "The charity supports a number of ______ projects involving health, education, and housing.",
    base: "PURPOSE",
    answer: "multipurpose",
  },
  {
    id: "multilingual",
    prompt: "The course is designed for students from a ______ background, so classes are taught in several different languages.",
    base: "LANGUAGE",
    answer: "multilingual",
  },
  {
    id: "multicoloured",
    prompt: "The artist is famous for his bold use of ______ patterns in his paintings.",
    base: "COLOUR",
    answer: "multicoloured",
  },
  {
    id: "monolingual",
    prompt: "The dictionary is aimed at advanced learners and is entirely ______.",
    base: "LANGUAGE",
    answer: "monolingual",
  },
  {
    id: "monochrome",
    prompt: "The room was decorated in a simple ______ style, using only black and white.",
    base: "CHROME",
    answer: "monochrome",
  },
  {
    id: "monocausal",
    prompt: "The explanation was too ______, as if the problem had only one cause.",
    base: "CAUSE",
    answer: "monocausal",
  },
  {
    id: "monocultural",
    prompt: "In the past, some schools promoted a more ______ view of national identity.",
    base: "CULTURE",
    answer: "monocultural",
  },
  {
    id: "monosyllabic",
    prompt: "The teacher asked students to identify whether the stressed word was ______ or polysyllabic.",
    base: "SYLLABLE",
    answer: "monosyllabic",
  },
  {
    id: "bilateral-negotiations",
    prompt: "The agreement was the result of several months of ______ negotiations between the two countries.",
    base: "LATERAL",
    answer: "bilateral",
  },
  {
    id: "bilingual-household",
    prompt: "She grew up in a ______ household, speaking both Spanish and English at home.",
    base: "LANGUAGE",
    answer: "bilingual",
  },
  {
    id: "bicultural",
    prompt: "The city has a rich ______ identity, shaped by both European and North African influences.",
    base: "CULTURE",
    answer: "bicultural",
  },
  {
    id: "bimonthly",
    prompt: "The magazine is published on a ______ basis, so a new issue comes out every two months.",
    base: "MONTH",
    answer: "bimonthly",
  },
  {
    id: "bifocal",
    prompt: "The optician said I might need ______ glasses for reading and distance vision.",
    base: "FOCUS",
    answer: "bifocal",
  },
  {
    id: "outgrow-shoes",
    prompt: "Children often ______ their shoes long before the rest of their clothes wear out.",
    base: "GROW",
    answer: "outgrow",
  },
  {
    id: "outperform",
    prompt: "The smaller company managed to ______ several of its larger competitors last year.",
    base: "PERFORM",
    answer: "outperform",
  },
  {
    id: "outnumber",
    prompt: "In some regions, women now ______ men at university.",
    base: "NUMBER",
    answer: "outnumber",
  },
  {
    id: "outweigh",
    prompt: "The debate over animal testing is unlikely to disappear, because the benefits are often said to ______ the risks.",
    base: "WEIGH",
    answer: "outweigh",
  },
  {
    id: "outlive-predators",
    prompt: "Some desert plants can ______ other species by surviving for long periods without water.",
    base: "LIVE",
    answer: "outlive",
  },
  {
    id: "autofocus-systems",
    prompt: "Modern cameras can adjust to changing light conditions through their ______ systems.",
    base: "FOCUS",
    answer: "autofocus",
  },
  {
    id: "autocorrect",
    prompt: "Many phones now include an ______ feature that corrects spelling as you type.",
    base: "CORRECT",
    answer: "autocorrect",
  },
  {
    id: "auto-shutoff",
    prompt: "The machine has an ______ function, so it switches itself off after ten minutes of inactivity.",
    base: "SHUT",
    answer: "auto-shutoff",
  },
  {
    id: "automated",
    prompt: "The app can generate an ______ reply when the user is unavailable.",
    base: "RESPOND",
    answer: "automated",
  },
  {
    id: "microorganisms-digestion",
    prompt: "Scientists are still studying the role of ______ in human digestion.",
    base: "ORGANISE",
    answer: "microorganisms",
  },
  {
    id: "microscopic",
    prompt: "Some insects are so small that their features are only visible at a ______ level.",
    base: "SCOPE",
    answer: "microscopic",
  },
  {
    id: "microenterprises",
    prompt: "The report focuses on ______ businesses with fewer than ten employees.",
    base: "ENTERPRISE",
    answer: "microenterprises",
  },
  {
    id: "microfinance",
    prompt: "In some countries, small loans are used as a form of ______ to support new businesses.",
    base: "FINANCE",
    answer: "microfinance",
  },
  {
    id: "microplastics",
    prompt: "Researchers found tiny fragments of plastic, known as ______, in seawater samples.",
    base: "PLASTIC",
    answer: "microplastics",
  },
  {
    id: "superhuman-strength",
    prompt: "With what seemed like ______ strength, she managed to lift the table on her own.",
    base: "HUMAN",
    answer: "superhuman",
  },
  {
    id: "supernatural-figure",
    prompt: "Some critics say the film treats its hero as a ______ figure rather than a believable person.",
    base: "NATURE",
    answer: "supernatural",
  },
  {
    id: "supersonic",
    prompt: "The technology has spread at a ______ speed over the past decade.",
    base: "SONIC",
    answer: "supersonic",
  },
  {
    id: "superconducting",
    prompt: "Scientists are studying ______ materials that allow electricity to pass without resistance.",
    base: "CONDUCT",
    answer: "superconducting",
  },
  {
    id: "supercomputer",
    prompt: "The company developed a ______ capable of processing huge amounts of data.",
    base: "COMPUTE",
    answer: "supercomputer",
  },
];

function highlightPrefixInWord(word, prefix) {
  const safeWord = String(word || "");
  const safePrefix = String(prefix || "");
  if (!safeWord || !safePrefix) return safeWord;
  if (!safeWord.toLowerCase().startsWith(safePrefix.toLowerCase())) return safeWord;

  return (
    <>
      <span className="hub-prefixes-highlight">{safeWord.slice(0, safePrefix.length)}</span>
      {safeWord.slice(safePrefix.length)}
    </>
  );
}

function renderSentenceWithHighlight(sentence, word, prefix) {
  const safeSentence = String(sentence || "");
  const safeWord = String(word || "");
  if (!safeSentence || !safeWord || !safeSentence.includes(safeWord)) return safeSentence;

  const [before, after] = safeSentence.split(safeWord);
  return (
    <>
      {before}
      <strong className="hub-prefixes-target">{highlightPrefixInWord(safeWord, prefix)}</strong>
      {after}
    </>
  );
}

function buildInitialMatchAnswers() {
  return Object.fromEntries(
    LESSON_STAGES.filter((stage) => stage.kind === "match").flatMap((stage) =>
      stage.items.map((item) => [item.id, { value: "", correct: null }])
    )
  );
}

function buildInitialMcqAnswers() {
  return Object.fromEntries(
    LESSON_STAGES.filter((stage) => stage.kind === "mcq").flatMap((stage) =>
      stage.items.map((item) => [item.id, { value: "", correct: null }])
    )
  );
}

function normalizeChallengeAnswer(text) {
  return String(text || "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function HubMeaningfulPrefixesLesson() {
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);
  const [matchAnswers, setMatchAnswers] = useState(buildInitialMatchAnswers);
  const [mcqAnswers, setMcqAnswers] = useState(buildInitialMcqAnswers);
  const [activeMcqIndex, setActiveMcqIndex] = useState(0);
  const [mcqFeedback, setMcqFeedback] = useState(null);
  const [isAdvancingMcq, setIsAdvancingMcq] = useState(false);
  const [challengeItems, setChallengeItems] = useState(() => shuffle(CHALLENGE_BANK).slice(0, CHALLENGE_SET_SIZE));
  const [challengeAnswers, setChallengeAnswers] = useState({});
  const [challengeChecked, setChallengeChecked] = useState(false);

  const stage = LESSON_STAGES[stageIndex];
  const totalStages = LESSON_STAGES.length;

  useEffect(() => {
    setMcqFeedback(null);
    setIsAdvancingMcq(false);
    if (stage.kind === "mcq") {
      const nextUnanswered = stage.items.findIndex((item) => !mcqAnswers[item.id]?.value);
      setActiveMcqIndex(nextUnanswered >= 0 ? nextUnanswered : Math.min(stage.items.length - 1, 0));
    }
    if (stage.kind === "challenge") {
      setChallengeChecked(false);
    }
  }, [stageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const meaningOptions = useMemo(() => {
    if (stage.kind !== "match") return [];
    return stage.items.map((item) => item.meaning);
  }, [stage]);

  const stageSummary = useMemo(() => {
    if (stage.kind === "match") {
      const total = stage.items.length;
      const answered = stage.items.filter((item) => matchAnswers[item.id]?.value).length;
      const correct = stage.items.filter((item) => matchAnswers[item.id]?.correct === true).length;
      return { total, answered, correct };
    }

    if (stage.kind === "challenge") {
      return {
        total: challengeItems.length,
        answered: challengeItems.filter((item) => String(challengeAnswers[item.id] || "").trim()).length,
        correct: challengeItems.filter(
          (item) => normalizeChallengeAnswer(challengeAnswers[item.id]) === normalizeChallengeAnswer(item.answer)
        ).length,
      };
    }

    const total = stage.items.length;
    const answered = stage.items.filter((item) => mcqAnswers[item.id]?.value).length;
    const correct = stage.items.filter((item) => mcqAnswers[item.id]?.correct === true).length;
    return { total, answered, correct };
  }, [challengeAnswers, challengeItems, matchAnswers, mcqAnswers, stage]);

  const challengeSummary = useMemo(() => {
    const total = challengeItems.length;
    const answered = challengeItems.filter((item) => String(challengeAnswers[item.id] || "").trim()).length;
    const correct = challengeItems.filter(
      (item) => normalizeChallengeAnswer(challengeAnswers[item.id]) === normalizeChallengeAnswer(item.answer)
    ).length;
    return { total, answered, correct };
  }, [challengeAnswers, challengeItems]);

  const currentMcqItem = stage.kind === "mcq" ? stage.items[activeMcqIndex] : null;
  const currentMcqAnswer = currentMcqItem ? mcqAnswers[currentMcqItem.id] || { value: "", correct: null } : null;

  function handleMatchSelect(item, value) {
    setMatchAnswers((prev) => ({
      ...prev,
      [item.id]: {
        value,
        correct: value === item.meaning,
      },
    }));
  }

  function goToNextStage() {
    setStageIndex((prev) => Math.min(totalStages - 1, prev + 1));
  }

  function handleChallengeAnswerChange(itemId, value) {
    setChallengeAnswers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  }

  function checkChallengeAnswers() {
    setChallengeChecked(true);
  }

  function replayChallenge() {
    setChallengeItems(shuffle(CHALLENGE_BANK).slice(0, CHALLENGE_SET_SIZE));
    setChallengeAnswers({});
    setChallengeChecked(false);
  }

  function handleMcqChoice(item, value) {
    if (!item || isAdvancingMcq) return;

    const correct = value === item.answer;
    setMcqAnswers((prev) => ({
      ...prev,
      [item.id]: {
        value,
        correct,
      },
    }));
    setMcqFeedback({
      correct,
      text: correct ? `Correct: ${item.fullAnswer}` : `Not quite. The answer is ${item.fullAnswer}.`,
    });
    setIsAdvancingMcq(true);

    window.setTimeout(() => {
      const isLastQuestion = activeMcqIndex >= stage.items.length - 1;
      if (isLastQuestion) {
        setMcqFeedback(null);
        setIsAdvancingMcq(false);
        return;
      }
      setActiveMcqIndex((prev) => prev + 1);
      setMcqFeedback(null);
      setIsAdvancingMcq(false);
    }, MCQ_FEEDBACK_DELAY_MS);
  }

  function renderMatchStage() {
    return (
      <>
        <section className="hub-prefixes-summary">
          <div>
            <span className="hub-prefixes-summary-label">Answered</span>
            <strong>{stageSummary.answered}/{stageSummary.total}</strong>
          </div>
          <div>
            <span className="hub-prefixes-summary-label">Correct</span>
            <strong>{stageSummary.correct}/{stageSummary.total}</strong>
          </div>
          <div>
            <span className="hub-prefixes-summary-label">Focus</span>
            <strong>Prefix meaning</strong>
          </div>
        </section>

        <section className="hub-prefixes-bank">
          <span className="hub-prefixes-bank-label">Meaning bank</span>
          <div className="hub-prefixes-bank-grid">
            {meaningOptions.map((meaning) => (
              <span key={`${stage.id}:${meaning}`} className="hub-prefixes-bank-chip">
                {meaning}
              </span>
            ))}
          </div>
        </section>

        <section className="hub-prefixes-list">
          {stage.items.map((item, index) => {
            const answer = matchAnswers[item.id] || { value: "", correct: null };
            const toneClass =
              answer.correct === true ? "is-correct" : answer.correct === false ? "is-wrong" : "";

            return (
              <article key={item.id} className={`hub-prefixes-card ${toneClass}`}>
                <div className="hub-prefixes-card-head">
                  <span className="hub-prefixes-number">{index + 1}</span>
                  <div>
                    <p className="hub-prefixes-sentence">
                      {renderSentenceWithHighlight(item.sentence, item.word, item.prefix)}
                    </p>
                    <div className="hub-prefixes-prefix-chip">
                      Prefix: <strong>{item.prefix}-</strong>
                    </div>
                  </div>
                </div>

                <div className="hub-prefixes-answer-row">
                  <label className="hub-prefixes-answer-label" htmlFor={`prefix-${item.id}`}>
                    Meaning
                  </label>
                  <select
                    id={`prefix-${item.id}`}
                    className={`input hub-prefixes-select ${answer.value ? "is-selected" : ""} ${toneClass}`}
                    value={answer.value}
                    onChange={(event) => handleMatchSelect(item, event.target.value)}
                  >
                    <option value="">Choose…</option>
                    {meaningOptions.map((meaning) => (
                      <option key={`${item.id}:${meaning}`} value={meaning}>
                        {meaning}
                      </option>
                    ))}
                  </select>
                </div>

                {answer.correct === true ? (
                  <p className="hub-prefixes-feedback is-correct">Correct</p>
                ) : answer.correct === false ? (
                  <p className="hub-prefixes-feedback is-wrong">Not quite. Try a different meaning.</p>
                ) : null}
              </article>
            );
          })}
        </section>
      </>
    );
  }

  function renderMcqStage() {
    if (!currentMcqItem || !currentMcqAnswer) return null;

    return (
      <>
        <section className="hub-prefixes-summary">
          <div>
            <span className="hub-prefixes-summary-label">Question</span>
            <strong>{Math.min(activeMcqIndex + 1, stageSummary.total)}/{stageSummary.total}</strong>
          </div>
          <div>
            <span className="hub-prefixes-summary-label">Answered</span>
            <strong>{stageSummary.answered}/{stageSummary.total}</strong>
          </div>
          <div>
            <span className="hub-prefixes-summary-label">Correct</span>
            <strong>{stageSummary.correct}/{stageSummary.total}</strong>
          </div>
        </section>

        <section className="hub-prefixes-mcq-stage">
          <article
            key={currentMcqItem.id}
            className={`hub-prefixes-mcq-card ${mcqFeedback?.correct === true ? "is-correct" : ""} ${mcqFeedback?.correct === false ? "is-wrong" : ""} ${isAdvancingMcq ? "is-locked" : ""}`}
          >
            <div className="hub-prefixes-mcq-top">
              <span className="hub-prefixes-number">{activeMcqIndex + 1}</span>
              <div className="hub-prefixes-mcq-prompt-wrap">
                <span className="hub-prefixes-kicker hub-prefixes-mcq-kicker">Add the correct prefix</span>
                <p className="hub-prefixes-mcq-prompt">{currentMcqItem.prompt}</p>
              </div>
            </div>

            <div className="hub-prefixes-mcq-options">
              {currentMcqItem.options.map((option, index) => {
                const isSelected = currentMcqAnswer.value === option;
                const isCorrectOption = mcqFeedback && option === currentMcqItem.answer;
                const isWrongSelected = mcqFeedback && isSelected && option !== currentMcqItem.answer;
                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={`${currentMcqItem.id}:${option}`}
                    type="button"
                    className={`hub-prefixes-option-btn ${isSelected ? "is-selected" : ""} ${isCorrectOption ? "is-correct" : ""} ${isWrongSelected ? "is-wrong" : ""}`}
                    onClick={() => handleMcqChoice(currentMcqItem, option)}
                    disabled={isAdvancingMcq}
                  >
                    <span className="hub-prefixes-option-letter">{letter}</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="hub-prefixes-mcq-feedback-row">
              {mcqFeedback ? (
                <p className={`hub-prefixes-feedback ${mcqFeedback.correct ? "is-correct" : "is-wrong"}`}>
                  {mcqFeedback.text}
                </p>
              ) : (
                <p className="hub-prefixes-feedback hub-prefixes-feedback-placeholder">Choose one option.</p>
              )}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderChallengeStage() {
    return (
      <>
        <section className="hub-prefixes-summary">
          <div>
            <span className="hub-prefixes-summary-label">Set size</span>
            <strong>{challengeSummary.total}</strong>
          </div>
          <div>
            <span className="hub-prefixes-summary-label">Answered</span>
            <strong>{challengeSummary.answered}/{challengeSummary.total}</strong>
          </div>
          <div>
            <span className="hub-prefixes-summary-label">Correct</span>
            <strong>{challengeChecked ? `${challengeSummary.correct}/${challengeSummary.total}` : "Check at the end"}</strong>
          </div>
        </section>

        <section className="hub-prefixes-list">
          {challengeItems.map((item, index) => {
            const userAnswer = challengeAnswers[item.id] || "";
            const isCorrect =
              normalizeChallengeAnswer(userAnswer) === normalizeChallengeAnswer(item.answer);
            const toneClass = challengeChecked ? (isCorrect ? "is-correct" : "is-wrong") : "";

            return (
              <article key={item.id} className={`hub-prefixes-card ${toneClass}`}>
                <div className="hub-prefixes-card-head">
                  <span className="hub-prefixes-number">{index + 1}</span>
                  <div className="hub-prefixes-challenge-head">
                    <p className="hub-prefixes-sentence">{item.prompt}</p>
                    <div className="hub-prefixes-prefix-chip">
                      Base word: <strong>{item.base}</strong>
                    </div>
                  </div>
                </div>

                <div className="hub-prefixes-challenge-input-row">
                  <label className="hub-prefixes-answer-label" htmlFor={`challenge-${item.id}`}>
                    Missing word
                  </label>
                  <input
                    id={`challenge-${item.id}`}
                    className={`input hub-prefixes-text-input ${toneClass}`}
                    type="text"
                    value={userAnswer}
                    onChange={(event) => handleChallengeAnswerChange(item.id, event.target.value)}
                    placeholder="Type your answer"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                {challengeChecked ? (
                  isCorrect ? (
                    <p className="hub-prefixes-feedback is-correct">Correct</p>
                  ) : (
                    <p className="hub-prefixes-feedback is-wrong">Correct answer: {item.answer}</p>
                  )
                ) : null}
              </article>
            );
          })}
        </section>

        <section className="hub-prefixes-challenge-controls">
          <button type="button" className="generate-btn" onClick={checkChallengeAnswers}>
            Check answers
          </button>
          <button type="button" className="ghost-btn" onClick={replayChallenge}>
            Replay with a new set
          </button>
        </section>
      </>
    );
  }

  return (
    <div className="hub-prefixes-page">
      <Seo
        title="Meaningful Prefixes | Seif Hub"
        description="Build prefix meaning through staged matching and multiple-choice word formation practice."
      />

      <div className="hub-prefixes-shell">
        <div className="hub-prefixes-topbar">
          <button className="ghost-btn" type="button" onClick={() => navigate(getSitePath("/use-of-english"))}>
            Back to Use of English
          </button>
          <div className="hub-prefixes-progress-chip">
            Screen {stageIndex + 1} of {totalStages}
          </div>
        </div>

        <header className="hub-prefixes-header">
          <span className="hub-prefixes-kicker">Word Formation Lesson</span>
          <h1>{stage.title}</h1>
          <p>{stage.intro}</p>
        </header>

        {stage.kind === "match"
          ? renderMatchStage()
          : stage.kind === "mcq"
            ? renderMcqStage()
            : renderChallengeStage()}

        <div className="hub-prefixes-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setStageIndex((prev) => Math.max(0, prev - 1))}
            disabled={stageIndex === 0}
          >
            Previous screen
          </button>

          <button
            type="button"
            className="generate-btn"
            onClick={goToNextStage}
            disabled={stageIndex === totalStages - 1}
          >
            Next screen
          </button>
        </div>
      </div>

      <style>{`
        .hub-prefixes-page {
          width: 100%;
        }

        .hub-prefixes-shell {
          max-width: 1040px;
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }

        .hub-prefixes-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .hub-prefixes-progress-chip {
          padding: 0.5rem 0.9rem;
          border-radius: 999px;
          background: rgba(246, 189, 96, 0.14);
          border: 1px solid rgba(246, 189, 96, 0.3);
          color: #ffd27c;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .hub-prefixes-header,
        .hub-prefixes-summary > div,
        .hub-prefixes-bank,
        .hub-prefixes-card,
        .hub-prefixes-mcq-card {
          background: linear-gradient(180deg, rgba(24, 41, 79, 0.98), rgba(19, 35, 69, 0.98));
          border: 1px solid rgba(53, 80, 142, 0.78);
          border-radius: 22px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
        }

        .hub-prefixes-header {
          padding: 1.45rem 1.5rem;
        }

        .hub-prefixes-kicker {
          display: inline-block;
          margin-bottom: 0.5rem;
          padding: 0.28rem 0.7rem;
          border-radius: 999px;
          background: rgba(246, 189, 96, 0.14);
          border: 1px solid rgba(246, 189, 96, 0.3);
          color: #ffd27c;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hub-prefixes-header h1 {
          margin: 0 0 0.45rem;
          color: #eef4ff;
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.02;
        }

        .hub-prefixes-header p {
          margin: 0;
          color: #dbe7ff;
          line-height: 1.55;
          font-size: 1.02rem;
        }

        .hub-prefixes-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
        }

        .hub-prefixes-summary > div {
          padding: 1rem 1.05rem;
        }

        .hub-prefixes-summary-label {
          display: block;
          margin-bottom: 0.3rem;
          color: #94a3b8;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .hub-prefixes-summary strong {
          color: #f8fafc;
          font-size: 1.2rem;
        }

        .hub-prefixes-bank {
          padding: 1rem 1.05rem;
        }

        .hub-prefixes-bank-label {
          display: inline-block;
          margin-bottom: 0.75rem;
          color: #c9d7f4;
          font-size: 0.84rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .hub-prefixes-bank-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .hub-prefixes-bank-chip {
          padding: 0.55rem 0.8rem;
          border-radius: 999px;
          background: rgba(7, 12, 26, 0.36);
          border: 1px solid rgba(92, 117, 177, 0.48);
          color: #eef4ff;
          font-size: 0.96rem;
        }

        .hub-prefixes-list {
          display: grid;
          gap: 0.9rem;
        }

        .hub-prefixes-card,
        .hub-prefixes-mcq-card {
          padding: 1.15rem 1.15rem 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
        }

        .hub-prefixes-card.is-correct,
        .hub-prefixes-mcq-card.is-correct {
          border-color: rgba(62, 175, 124, 0.85);
          box-shadow: 0 12px 28px rgba(20, 98, 66, 0.24);
        }

        .hub-prefixes-card.is-wrong,
        .hub-prefixes-mcq-card.is-wrong {
          border-color: rgba(202, 96, 109, 0.88);
          box-shadow: 0 12px 28px rgba(116, 35, 49, 0.24);
        }

        .hub-prefixes-mcq-card.is-locked {
          transform: translateY(-1px);
        }

        .hub-prefixes-card-head,
        .hub-prefixes-mcq-top {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.9rem;
          align-items: start;
          margin-bottom: 0.95rem;
        }

        .hub-prefixes-number {
          width: 2.2rem;
          height: 2.2rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #ffd27c;
          background: rgba(246, 189, 96, 0.14);
          border: 1px solid rgba(246, 189, 96, 0.28);
          flex-shrink: 0;
        }

        .hub-prefixes-sentence,
        .hub-prefixes-mcq-prompt {
          margin: 0 0 0.6rem;
          color: #eef4ff;
          line-height: 1.6;
          font-size: 1.04rem;
        }

        .hub-prefixes-mcq-prompt {
          font-size: clamp(1.12rem, 2vw, 1.35rem);
          margin-bottom: 0;
        }

        .hub-prefixes-mcq-kicker {
          margin-bottom: 0.7rem;
        }

        .hub-prefixes-target {
          font-weight: 800;
          color: #fff7dc;
        }

        .hub-prefixes-highlight {
          color: #f6bd60;
          text-decoration: underline;
          text-decoration-thickness: 0.12em;
          text-underline-offset: 0.14em;
        }

        .hub-prefixes-prefix-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.34rem 0.7rem;
          border-radius: 999px;
          background: rgba(7, 12, 26, 0.36);
          border: 1px solid rgba(92, 117, 177, 0.44);
          color: #dbe7ff;
          font-size: 0.92rem;
        }

        .hub-prefixes-answer-row {
          display: grid;
          grid-template-columns: 5rem minmax(0, 22rem);
          gap: 0.8rem;
          align-items: center;
        }

        .hub-prefixes-answer-label {
          color: #c9d7f4;
          font-weight: 700;
        }

        .hub-prefixes-select {
          min-height: 3rem;
          background: #0a1630;
          color: #eef4ff;
          border: 1px solid #3d568f;
          border-radius: 14px;
          padding: 0.75rem 0.95rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
        }

        .hub-prefixes-select.is-correct {
          border-color: rgba(62, 175, 124, 0.85);
        }

        .hub-prefixes-select.is-wrong {
          border-color: rgba(202, 96, 109, 0.88);
        }

        .hub-prefixes-text-input {
          min-height: 3rem;
          background: #0a1630;
          color: #eef4ff;
          border: 1px solid #3d568f;
          border-radius: 14px;
          padding: 0.75rem 0.95rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
        }

        .hub-prefixes-text-input.is-correct {
          border-color: rgba(62, 175, 124, 0.85);
        }

        .hub-prefixes-text-input.is-wrong {
          border-color: rgba(202, 96, 109, 0.88);
        }

        .hub-prefixes-mcq-stage {
          display: grid;
        }

        .hub-prefixes-mcq-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .hub-prefixes-option-btn {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          min-height: 3.5rem;
          padding: 0.85rem 1rem;
          border-radius: 16px;
          border: 1px solid rgba(92, 117, 177, 0.46);
          background: rgba(8, 18, 42, 0.66);
          color: #eef4ff;
          text-align: left;
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
        }

        .hub-prefixes-option-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: #6b8ee4;
          background: rgba(13, 27, 61, 0.88);
        }

        .hub-prefixes-option-btn:disabled {
          cursor: default;
        }

        .hub-prefixes-option-btn.is-selected {
          border-color: #85a7ff;
          background: rgba(28, 52, 108, 0.72);
        }

        .hub-prefixes-option-btn.is-correct {
          border-color: rgba(62, 175, 124, 0.85);
          background: rgba(18, 69, 53, 0.82);
        }

        .hub-prefixes-option-btn.is-wrong {
          border-color: rgba(202, 96, 109, 0.88);
          background: rgba(91, 28, 42, 0.78);
        }

        .hub-prefixes-option-letter {
          width: 2rem;
          height: 2rem;
          flex-shrink: 0;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(246, 189, 96, 0.12);
          border: 1px solid rgba(246, 189, 96, 0.22);
          color: #ffd27c;
          font-weight: 800;
        }

        .hub-prefixes-mcq-feedback-row {
          min-height: 2rem;
          margin-top: 1rem;
        }

        .hub-prefixes-challenge-input-row {
          display: grid;
          grid-template-columns: 7rem minmax(0, 20rem);
          gap: 0.8rem;
          align-items: center;
        }

        .hub-prefixes-challenge-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .hub-prefixes-feedback {
          margin: 0.8rem 0 0;
          font-weight: 700;
        }

        .hub-prefixes-feedback.is-correct {
          color: #8be0b2;
        }

        .hub-prefixes-feedback.is-wrong {
          color: #ffb4bf;
        }

        .hub-prefixes-feedback-placeholder {
          color: #94a3b8;
        }

        .hub-prefixes-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 0.6rem;
        }

        @media (max-width: 840px) {
          .hub-prefixes-summary {
            grid-template-columns: 1fr;
          }

          .hub-prefixes-answer-row,
          .hub-prefixes-mcq-options,
          .hub-prefixes-challenge-input-row {
            grid-template-columns: 1fr;
          }

          .hub-prefixes-actions,
          .hub-prefixes-topbar,
          .hub-prefixes-challenge-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
