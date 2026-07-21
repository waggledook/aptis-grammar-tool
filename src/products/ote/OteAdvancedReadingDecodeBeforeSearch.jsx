import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Search,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import ReadingCaseNavigator from "./ReadingCaseNavigator.jsx";
import "./styles/ote.css";

const QUESTION_TYPES = [
  {
    id: "specific",
    label: "Specific information",
    description: "Look for a reason, experience, action, result, earlier situation or future plan.",
  },
  {
    id: "attitude",
    label: "Opinion or attitude",
    description: "Look for what somebody thinks, expects, appreciates, regrets, finds difficult or changes their mind about.",
  },
];

const PROFILES = [
  {
    id: "A",
    name: "Nia Patel",
    role: "Community volunteer",
    paragraphs: [
      "My friend Lucia had wanted to try the weekend radio-documentary course for months, but she disliked the idea of walking into a room where she knew nobody. I agreed to go with her, partly to keep her company and partly because I listen to a lot of documentaries and was curious about how they are made.",
      "I assumed the microphones and editing software would be the difficult part. In fact, once the tutor had shown us the basic controls, I found the hardest task was deciding what to remove. Our interview with a night-bus driver produced nearly forty minutes of lively material, yet the final piece could last only five. Cutting a good story or an amusing comment felt almost disrespectful, even when it distracted from the main idea.",
      "At the end of each day, everyone played an unfinished section to the group. Initially, I hated that. I wanted to repair every awkward pause and uneven sound level before anyone heard it. Gradually, I realised that comments made while the piece could still change were far more useful than praise after the final edit.",
      "When a low electrical hum appeared in one recording, the tutor helped me identify its source and showed me how to reduce it. I am now planning another short documentary about people who work while the city sleeps. It will follow the same interview-based format we practised, although this time I hope to make the editing decisions with more confidence.",
    ],
  },
  {
    id: "B",
    name: "Tomas Eriksen",
    role: "Museum communications officer",
    paragraphs: [
      "I enrolled because my museum is beginning to produce more audio material, and I wanted something more engaging than a list of objects and dates. I had edited short videos at work, so I expected audio to be simpler.",
      "That confidence disappeared when the voices in our first recording sounded clear through headphones but became almost inaudible once music was added. I called the tutor over, expecting her to correct the levels. Instead, she asked me to compare the original files, identify where the imbalance began and rebuild the sequence myself. At the time, I thought she was being unnecessarily strict, particularly as the rest of the group was moving ahead. Once I had solved it, however, I could repeat the process without help, and her refusal to take over became the most valuable lesson of the weekend.",
      "I enjoyed the group listening sessions from the beginning. Other participants noticed moments when my narration sounded too formal, while I was able to suggest where their stories needed more context. A few failed recordings still seemed to me like wasted time rather than useful discoveries, though I became less embarrassed by them.",
      "The course projects were all short documentaries built around interviews. My next project will be quite different: an audio walking tour in which visitors hear brief location-based scenes as they move through the museum. It will require the same recording and editing skills, but not the documentary structure we used in class.",
    ],
  },
  {
    id: "C",
    name: "Leila Haddad",
    role: "Postgraduate student",
    paragraphs: [
      "My uncle spent years recording interviews with local musicians, and as a teenager I often watched him arrive with a microphone, ask thoughtful questions and leave with several hours of conversation. Because that was the visible part of his work, I assumed interviewing was almost the whole job. The course quickly corrected that impression. We spent as much time researching the subject, requesting consent, planning a narrative and deciding how much explanation the listener needed as we did asking questions.",
      "I was comfortable playing unfinished material to the group because my university seminars regularly involve sharing work in progress. What unsettled me was deciding whether an interesting quotation was fair to use when it revealed more than the speaker may have intended.",
      "During one outdoor interview, a coffee grinder started just as our contributor described the quietest moment of her childhood. I thought the recording was ruined. The tutor asked us to listen again and consider what the unwanted sound communicated about the present-day setting. We did not keep it in the final version, but the discussion changed how I think about recording errors: they can reveal something about place, timing or method, even when they eventually need to be removed.",
      "I am now making another interview-based documentary, this time about the different routes through which members of my family arrived in the same city. The subject is personal, but the form is close to the project we completed on the course.",
    ],
  },
];

const QUESTIONS = [
  {
    id: "company",
    title: "A reason for enrolling",
    question: "Who enrolled partly because someone else did not want to attend alone?",
    type: "specific",
    typeFeedback: "You need one reason why somebody enrolled.",
    rephrases: [
      { id: "A", text: "Who went to support a friend who wanted company?" },
      { id: "B", text: "Who persuaded a friend to take the course?" },
      { id: "C", text: "Who hoped to meet new people during the course?" },
    ],
    rephraseAnswer: "A",
    targetIdeas: ["Another person did not want to attend alone", "The writer agreed to go with them"],
    answer: "A",
    evidenceOptions: [
      { id: "1", excerpts: ["Lucia … disliked the idea of walking into a room where she knew nobody.", "I agreed to go with her, partly to keep her company."] },
      { id: "2", excerpts: ["I listen to a lot of documentaries and was curious about how they are made."] },
      { id: "3", excerpts: ["My uncle spent years recording interviews with local musicians."] },
    ],
    evidenceAnswer: "1",
    evidenceFragments: ["she disliked the idea of walking into a room where she knew nobody", "I agreed to go with her, partly to keep her company"],
    why: "Lucia was uncomfortable attending without knowing anyone, and Nia agreed to accompany her.",
    alternative: "Leila mentions her uncle, but he did not attend the course and was not the reason she enrolled.",
  },
  {
    id: "technical-independence",
    title: "A changed attitude",
    question: "Who later appreciated being required to solve a technical problem without direct help?",
    type: "attitude",
    typeFeedback: "The question asks how somebody eventually felt about a teaching decision.",
    rephrases: [
      { id: "A", text: "Who later valued having to work out a technical difficulty alone?" },
      { id: "B", text: "Who believed that the tutor lacked the knowledge to help?" },
      { id: "C", text: "Who preferred learning the technical skills before beginning the project?" },
    ],
    rephraseAnswer: "A",
    targetIdeas: ["The tutor did not solve the problem", "The learner eventually saw this as useful"],
    answer: "B",
    evidenceOptions: [
      { id: "1", excerpts: ["The tutor helped me identify its source and showed me how to reduce it."] },
      { id: "2", excerpts: ["She asked me to … rebuild the sequence myself.", "Her refusal to take over became the most valuable lesson of the weekend."] },
      { id: "3", excerpts: ["The tutor asked us to listen again and consider what the unwanted sound communicated."] },
    ],
    evidenceAnswer: "2",
    evidenceFragments: ["she asked me to compare the original files, identify where the imbalance began and rebuild the sequence myself", "her refusal to take over became the most valuable lesson of the weekend"],
    why: "The tutor makes Tomas diagnose and rebuild the sequence himself. He dislikes this initially but later values it highly.",
    alternative: "Nia also has a technical problem, but her tutor directly helps her identify and reduce it.",
  },
  {
    id: "relative",
    title: "An incomplete picture",
    question: "Who realised that observing a relative had shown them only one part of the work?",
    type: "specific",
    typeFeedback: "Look for an earlier experience followed by a later discovery.",
    rephrases: [
      { id: "A", text: "Who discovered that a relative had made the work appear easier than it was?" },
      { id: "B", text: "Who realised that watching a family member had given them an incomplete picture?" },
      { id: "C", text: "Who used material originally recorded by a relative?" },
    ],
    rephraseAnswer: "B",
    targetIdeas: ["The writer had watched a relative doing the work", "The course revealed stages they had not previously seen"],
    answer: "C",
    evidenceOptions: [
      { id: "1", excerpts: ["I listen to a lot of documentaries and was curious about how they are made."] },
      { id: "2", excerpts: ["I had edited short videos at work, so I expected audio to be simpler."] },
      { id: "3", excerpts: ["I often watched [my uncle] arrive with a microphone …", "Because that was the visible part of his work, I assumed interviewing was almost the whole job."] },
    ],
    evidenceAnswer: "3",
    evidenceFragments: ["I often watched him arrive with a microphone, ask thoughtful questions and leave with several hours of conversation", "Because that was the visible part of his work, I assumed interviewing was almost the whole job", "The course quickly corrected that impression"],
    why: "Leila had watched her uncle conduct interviews but had not seen the research, consent, planning and editing involved.",
    alternative: "Tomas has previous media experience, but it came from his own work rather than observing a relative.",
  },
  {
    id: "unfinished-work",
    title: "Sharing unfinished work",
    question: "Who was initially uncomfortable with the group hearing work that was not yet finished?",
    type: "attitude",
    typeFeedback: "Find somebody’s first reaction to sharing unfinished material.",
    rephrases: [
      { id: "A", text: "Who disliked sharing incomplete audio at first?" },
      { id: "B", text: "Who thought the other participants’ comments were too critical?" },
      { id: "C", text: "Who preferred working alone because the group progressed too quickly?" },
    ],
    rephraseAnswer: "A",
    targetIdeas: ["Other learners heard the material while it was unfinished", "The person initially disliked this"],
    answer: "A",
    evidenceOptions: [
      { id: "1", excerpts: ["Everyone played an unfinished section to the group. Initially, I hated that."] },
      { id: "2", excerpts: ["I enjoyed the group listening sessions from the beginning."] },
      { id: "3", excerpts: ["I was comfortable playing unfinished material to the group."] },
    ],
    evidenceAnswer: "1",
    evidenceFragments: ["everyone played an unfinished section to the group", "Initially, I hated that"],
    why: "Nia wanted to correct the weaknesses before anyone else heard the recording.",
    alternative: "Tomas enjoyed the sessions from the beginning, while Leila was already comfortable sharing unfinished work.",
  },
  {
    id: "failed-recording",
    title: "Value in an error",
    question: "Who no longer sees an unsuccessful recording as entirely wasted?",
    type: "attitude",
    typeFeedback: "The writer’s new view is expressed indirectly. Look for an earlier reaction and a later change.",
    rephrases: [
      { id: "A", text: "Who learned that a recording error can still reveal useful information?" },
      { id: "B", text: "Who became skilled enough to avoid making recording errors?" },
      { id: "C", text: "Who believes that unwanted sounds should normally remain in the final piece?" },
    ],
    rephraseAnswer: "A",
    targetIdeas: ["Something went wrong in a recording", "The writer came to see that it still had some value"],
    answer: "C",
    evidenceOptions: [
      { id: "1", excerpts: ["The tutor helped me identify [the hum’s] source and showed me how to reduce it."] },
      { id: "2", excerpts: ["A few failed recordings still seemed to me like wasted time."] },
      { id: "3", excerpts: ["I thought the recording was ruined.", "The discussion changed how I think about recording errors: they can reveal something about place, timing or method."] },
    ],
    evidenceAnswer: "3",
    evidenceFragments: ["I thought the recording was ruined", "the discussion changed how I think about recording errors: they can reveal something about place, timing or method"],
    why: "Leila does not argue that errors belong in the finished documentary. She realises that they can still reveal useful information.",
    alternative: "Tomas mentions failed recordings, but says they still seemed like wasted time. His view is the opposite.",
  },
  {
    id: "different-project",
    title: "A future project",
    question: "Who intends to use the course skills for a different kind of audio project?",
    type: "specific",
    typeFeedback: "Look for a future plan and compare its format with the course projects.",
    rephrases: [
      { id: "A", text: "Who plans to use the techniques for something other than a documentary?" },
      { id: "B", text: "Who intends to make another documentary about a different subject?" },
      { id: "C", text: "Who hopes to teach the techniques to other people?" },
    ],
    rephraseAnswer: "A",
    targetIdeas: ["A clear future project", "The project is not another documentary"],
    answer: "B",
    evidenceOptions: [
      { id: "1", excerpts: ["I am now planning another short documentary."] },
      { id: "2", excerpts: ["The course projects were all short documentaries …", "My next project will be quite different: an audio walking tour."] },
      { id: "3", excerpts: ["I am now making another interview-based documentary."] },
    ],
    evidenceAnswer: "2",
    evidenceFragments: ["The course projects were all short documentaries built around interviews", "My next project will be quite different: an audio walking tour", "not the documentary structure we used in class"],
    why: "The course projects were documentaries, whereas Tomas plans to create a location-based museum tour.",
    alternative: "Nia and Leila change their subjects, but both intend to make another documentary in a similar format.",
  },
  {
    id: "editing-decisions",
    title: "The greater difficulty",
    question: "Who found choosing what to leave out more difficult than using the equipment?",
    type: "attitude",
    typeFeedback: "This asks for a comparison between two kinds of difficulty.",
    rephrases: [
      { id: "A", text: "Who was surprised that editing decisions were harder than the technical controls?" },
      { id: "B", text: "Who thought technical problems prevented the group from making progress?" },
      { id: "C", text: "Who regretted having to remove material that other participants enjoyed?" },
    ],
    rephraseAnswer: "A",
    targetIdeas: ["The person expected the equipment to be difficult", "Selecting or removing material proved harder"],
    answer: "A",
    evidenceOptions: [
      { id: "1", excerpts: ["I assumed the microphones and editing software would be the difficult part.", "I found the hardest task was deciding what to remove."] },
      { id: "2", excerpts: ["I expected audio to be simpler.", "The voices … became almost inaudible once music was added."] },
      { id: "3", excerpts: ["What unsettled me was deciding whether an interesting quotation was fair to use."] },
    ],
    evidenceAnswer: "1",
    evidenceFragments: ["I assumed the microphones and editing software would be the difficult part", "I found the hardest task was deciding what to remove"],
    why: "Both extracts are needed: one establishes Nia’s expected difficulty, and the other identifies the greater actual difficulty.",
    alternative: "Leila also finds an editorial decision difficult, but she never compares it with using the equipment.",
  },
];

function HighlightedParagraph({ text, fragments = [], active = false }) {
  if (!active || !fragments.length) return text;
  const ranges = fragments
    .map((fragment) => ({ fragment, start: text.indexOf(fragment) }))
    .filter(({ start }) => start >= 0)
    .sort((a, b) => a.start - b.start);
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

function Feedback({ correct, children }) {
  return <div className={`ote-reading-target-feedback ${correct ? "" : "is-wrong"}`}>{correct ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}<p>{children}</p></div>;
}

function getProfileLabel(id) {
  const profile = PROFILES.find((entry) => entry.id === id);
  return profile ? `${profile.id} — ${profile.name.split(" ")[0]}` : id;
}

function getDiagnosticFeedback({ typeScore, rephraseScore, matchScore, evidenceScore }) {
  const decodeScore = typeScore + rephraseScore;
  const searchScore = matchScore + evidenceScore;
  if (decodeScore === 14 && searchScore === 14) return ["Excellent control: you decoded, matched and proved every answer accurately."];
  const feedback = [];
  if (matchScore >= 5 && decodeScore < 10) feedback.push("Your matching is stronger than your decoding. Simplify the question before you begin searching.");
  if (decodeScore >= 10 && searchScore < 10) feedback.push("You build useful search targets, but make sure the selected profile contains every part of the target.");
  if (typeScore < 5) feedback.push("Separate facts and plans from opinions, reactions and changes of attitude.");
  if (rephraseScore < 5) feedback.push("Keep every important relationship when you simplify a question; do not reduce it to one shared topic word.");
  if (evidenceScore < 5) feedback.push("One sentence may identify the topic without proving the full answer. Read around it and check every condition.");
  if (!feedback.length) feedback.push("Strong work. Recheck the few items where a close alternative matched the topic but not the complete meaning.");
  return feedback.slice(0, 2);
}

export default function OteAdvancedReadingDecodeBeforeSearch({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState("decode");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [work, setWork] = useState({});
  const completionLoggedRef = useRef(false);
  const question = QUESTIONS[questionIndex];
  const questionWork = work[question.id] || {};
  const typeCorrect = questionWork.type === question.type;
  const rephraseCorrect = questionWork.rephrase === question.rephraseAnswer;
  const matchCorrect = questionWork.person === question.answer;
  const evidenceCorrect = questionWork.evidence === question.evidenceAnswer;
  const decodedCount = QUESTIONS.filter((entry) => work[entry.id]?.rephraseChecked).length;
  const provedCount = QUESTIONS.filter((entry) => work[entry.id]?.evidenceChecked).length;
  const basePath = nativeRoutes ? "/reading/advanced/part-2-matching" : "/ote/reading/advanced/part-2-matching";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/c1-pilot-1`);
  const typeScore = useMemo(() => QUESTIONS.filter((entry) => work[entry.id]?.type === entry.type).length, [work]);
  const rephraseScore = useMemo(() => QUESTIONS.filter((entry) => work[entry.id]?.rephrase === entry.rephraseAnswer).length, [work]);
  const matchScore = useMemo(() => QUESTIONS.filter((entry) => work[entry.id]?.person === entry.answer).length, [work]);
  const evidenceScore = useMemo(() => QUESTIONS.filter((entry) => work[entry.id]?.evidence === entry.evidenceAnswer).length, [work]);
  const decodeScore = typeScore + rephraseScore;
  const searchScore = matchScore + evidenceScore;

  useEffect(() => {
    if (stage !== "complete" || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part2.advanced-decode-before-search",
      section: "reading",
      part: "part-2",
      mode: "decode_before_search",
      taskId: "advanced-reading-part-2-decode-before-search",
      taskTitle: "Decode Before You Search",
      variant: "advanced",
      score: decodeScore + searchScore,
      total: 28,
      typeScore,
      rephraseScore,
      matchScore,
      evidenceScore,
    });
  }, [decodeScore, evidenceScore, matchScore, rephraseScore, searchScore, stage, typeScore]);

  function updateQuestion(changes) {
    setWork((current) => ({ ...current, [question.id]: { ...(current[question.id] || {}), ...changes } }));
  }

  function goToNextIncomplete(completionKey, nextStage) {
    const next = QUESTIONS.findIndex((entry, index) => index > questionIndex && !work[entry.id]?.[completionKey]);
    const first = QUESTIONS.findIndex((entry) => !work[entry.id]?.[completionKey]);
    if (first < 0) {
      setQuestionIndex(0);
      setStage(nextStage);
      return;
    }
    setQuestionIndex(next >= 0 ? next : first);
  }

  function resetActivity() {
    setStage("decode");
    setQuestionIndex(0);
    setWork({});
    completionLoggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-decode-page">
      <Seo title="Decode Before You Search | OTE Advanced Reading Part 2 | Seif English" description="Practise decoding Advanced Reading Part 2 questions, matching three texts and selecting complete supporting evidence." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 2 training</button>
      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 2 · Seven questions → three texts</p>
        <h1>Decode Before You Search</h1>
        <p>Turn each question into a complete search target. Then compare all three accounts and prove the exact match.</p>
      </header>
      <section className="ote-training-summary" aria-label="Decode Before You Search overview">
        <div><Target size={24} aria-hidden="true" /><strong>1. Decode</strong><span>Identify the question type and preserve its complete meaning.</span></div>
        <div><Search size={24} aria-hidden="true" /><strong>2. Search</strong><span>Scan all three texts for the complete idea, not one repeated word.</span></div>
        <div><Eye size={24} aria-hidden="true" /><strong>3. Prove</strong><span>Select evidence that establishes every part of the match.</span></div>
      </section>
      <details className="ote-reading-target-reference">
        <summary>The two question types</summary>
        <div className="ote-decode-type-reference">{QUESTION_TYPES.map((entry) => <article key={entry.id}><strong>{entry.label}</strong><span>{entry.description}</span></article>)}</div>
      </details>

      {stage === "complete" ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><Target size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">All seven questions complete</p>
          <h2>Your decoding and search report</h2>
          <div className="ote-cohesion-score-grid">
            <article><span>Decode score</span><strong>{decodeScore} / 14</strong><p>Question types and accurate simple rephrasings.</p></article>
            <article><span>Search-and-check score</span><strong>{searchScore} / 14</strong><p>Profile matches and complete supporting evidence.</p></article>
          </div>
          <div className="ote-decode-score-breakdown">
            <article><span>Question types</span><strong>{typeScore}/7</strong></article>
            <article><span>Rephrasings</span><strong>{rephraseScore}/7</strong></article>
            <article><span>Profile matches</span><strong>{matchScore}/7</strong></article>
            <article><span>Evidence choices</span><strong>{evidenceScore}/7</strong></article>
          </div>
          <div className="ote-decode-diagnostic">{getDiagnosticFeedback({ typeScore, rephraseScore, matchScore, evidenceScore }).map((message) => <p key={message}>{message}</p>)}</div>
          <div className="ote-reading-target-results">
            {QUESTIONS.map((entry, index) => {
              const row = work[entry.id] || {};
              const allCorrect = row.type === entry.type && row.rephrase === entry.rephraseAnswer && row.person === entry.answer && row.evidence === entry.evidenceAnswer;
              return <button key={entry.id} type="button" onClick={() => { setQuestionIndex(index); setStage("search"); }}>{allCorrect ? <CheckCircle2 size={19} aria-hidden="true" /> : <XCircle size={19} aria-hidden="true" />}<span>Question {index + 1}: {entry.title}</span><small>{[row.type === entry.type, row.rephrase === entry.rephraseAnswer, row.person === entry.answer, row.evidence === entry.evidenceAnswer].filter(Boolean).length}/4</small></button>;
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-decode-runner">
          <div className="ote-decode-round-strip">
            <div className={stage === "decode" ? "is-active" : "is-complete"}><span>Round 1</span><strong>Decode the questions</strong><small>{decodedCount}/7 complete</small></div>
            <ChevronRight size={18} aria-hidden="true" />
            <div className={stage === "search" ? "is-active" : ""}><span>Round 2</span><strong>Search, match and prove</strong><small>{provedCount}/7 complete</small></div>
          </div>
          <ReadingCaseNavigator
            items={QUESTIONS}
            currentIndex={questionIndex}
            label={stage === "decode" ? "Choose a question to decode" : "Choose a question to match"}
            isComplete={(entry) => Boolean(work[entry.id]?.[stage === "decode" ? "rephraseChecked" : "evidenceChecked"])}
            onSelect={setQuestionIndex}
          />

          {stage === "decode" ? (
            <article className="ote-decode-question-card">
              <header><p className="ote-kicker">Question {questionIndex + 1} of 7</p><h2>{question.question}</h2></header>
              <section className="ote-reading-target-step">
                <span className="ote-reading-target-step-number">1</span>
                <div><h3>What kind of information do you need?</h3><p>Choose the question type before you see the texts.</p>
                  <div className="ote-decode-choice-grid is-two">
                    {QUESTION_TYPES.map((entry) => <button className={questionWork.type === entry.id ? "is-selected" : ""} type="button" key={entry.id} disabled={questionWork.typeChecked} onClick={() => updateQuestion({ type: entry.id })}><strong>{entry.label}</strong><span>{entry.description}</span></button>)}
                  </div>
                  {!questionWork.typeChecked ? <button className="ote-reading-target-check" type="button" disabled={!questionWork.type} onClick={() => updateQuestion({ typeChecked: true })}>Check question type</button> : <Feedback correct={typeCorrect}><strong>{typeCorrect ? "Correct." : `Best type: ${QUESTION_TYPES.find((entry) => entry.id === question.type)?.label}.`}</strong> {question.typeFeedback}</Feedback>}
                </div>
              </section>
              {questionWork.typeChecked ? <section className="ote-reading-target-step">
                <span className="ote-reading-target-step-number">2</span>
                <div><h3>Choose the best simple rephrasing</h3><p>Keep the complete relationship, not only the topic.</p>
                  <div className="ote-decode-choice-grid">
                    {question.rephrases.map((entry) => <button className={questionWork.rephrase === entry.id ? "is-selected" : ""} type="button" key={entry.id} disabled={questionWork.rephraseChecked} onClick={() => updateQuestion({ rephrase: entry.id })}><strong>{entry.id}</strong><span>{entry.text}</span></button>)}
                  </div>
                  {!questionWork.rephraseChecked ? <button className="ote-reading-target-check" type="button" disabled={!questionWork.rephrase} onClick={() => updateQuestion({ rephraseChecked: true })}>Check rephrasing</button> : <><Feedback correct={rephraseCorrect}><strong>{rephraseCorrect ? "Correct." : `The best rephrasing is ${question.rephraseAnswer}.`}</strong> {question.rephrases.find((entry) => entry.id === question.rephraseAnswer)?.text}</Feedback><div className="ote-decode-target-card"><span>Your complete search target</span>{question.targetIdeas.map((idea) => <p key={idea}><CheckCircle2 size={16} aria-hidden="true" />{idea}</p>)}</div></>}
                </div>
              </section> : null}
              <div className="ote-cohesion-actions">
                <button className="is-secondary" type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => Math.max(0, current - 1))}><ChevronLeft size={17} aria-hidden="true" /> Previous question</button>
                <button type="button" disabled={!questionWork.rephraseChecked} onClick={() => goToNextIncomplete("rephraseChecked", "search")}>{decodedCount === QUESTIONS.length ? "Show the three texts" : "Next question"}<ChevronRight size={17} aria-hidden="true" /></button>
              </div>
            </article>
          ) : (
            <div className="ote-decode-search-layout">
              <div className="ote-decode-profile-stack">
                <div className="ote-decode-text-heading"><p className="ote-kicker">Making a Radio Documentary</p><h2>Three participants describe the same weekend course</h2></div>
                {PROFILES.map((profile) => <article className="ote-decode-profile" key={profile.id}><header><span>{profile.id}</span><div><h3>{profile.name}</h3><p>{profile.role}</p></div></header>{profile.paragraphs.map((paragraph, index) => <p key={`${profile.id}:${index}`}><HighlightedParagraph text={paragraph} fragments={question.evidenceFragments} active={questionWork.evidenceChecked} /></p>)}</article>)}
              </div>
              <aside className="ote-decode-task-panel">
                <p className="ote-kicker">Question {questionIndex + 1} of 7</p>
                <h2>{question.question}</h2>
                <div className="ote-decode-target-card is-pinned"><span>Decoded search target</span><strong>{question.rephrases.find((entry) => entry.id === question.rephraseAnswer)?.text}</strong>{question.targetIdeas.map((idea) => <p key={idea}><CheckCircle2 size={15} aria-hidden="true" />{idea}</p>)}</div>
                <section className="ote-decode-task-step"><h3>1. Choose the person</h3><div className="ote-decode-person-row">{PROFILES.map((profile) => <button className={questionWork.person === profile.id ? "is-selected" : ""} type="button" key={profile.id} disabled={questionWork.personChecked} onClick={() => updateQuestion({ person: profile.id })}><strong>{profile.id}</strong><span>{profile.name.split(" ")[0]}</span></button>)}</div>{!questionWork.personChecked ? <button className="ote-reading-target-check" type="button" disabled={!questionWork.person} onClick={() => updateQuestion({ personChecked: true })}>Check match</button> : <Feedback correct={matchCorrect}><strong>{matchCorrect ? "Correct." : `The correct person is ${getProfileLabel(question.answer)}.`}</strong> Now choose the evidence that proves the complete match.</Feedback>}</section>
                {questionWork.personChecked ? <section className="ote-decode-task-step"><h3>2. Choose the strongest evidence</h3><p>Some choices share the topic but do not prove every part.</p><div className="ote-decode-evidence-grid">{question.evidenceOptions.map((entry) => <button className={questionWork.evidence === entry.id ? "is-selected" : ""} type="button" key={entry.id} disabled={questionWork.evidenceChecked} onClick={() => updateQuestion({ evidence: entry.id })}><strong>{entry.id}</strong><div>{entry.excerpts.map((excerpt) => <blockquote key={excerpt}>“{excerpt}”</blockquote>)}</div></button>)}</div>{!questionWork.evidenceChecked ? <button className="ote-reading-target-check" type="button" disabled={!questionWork.evidence} onClick={() => updateQuestion({ evidenceChecked: true })}>Check evidence</button> : <><Feedback correct={evidenceCorrect}><strong>{evidenceCorrect ? "Evidence confirmed." : `The strongest evidence is ${question.evidenceAnswer}.`}</strong> {question.why}</Feedback><div className="ote-decode-alternative"><span>Closest alternative</span><p>{question.alternative}</p></div></>}</section> : null}
                <div className="ote-cohesion-actions"><button className="is-secondary" type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => Math.max(0, current - 1))}><ChevronLeft size={17} aria-hidden="true" /> Previous question</button><button type="button" disabled={!questionWork.evidenceChecked} onClick={() => goToNextIncomplete("evidenceChecked", "complete")}>{provedCount === QUESTIONS.length ? "View report" : "Next question"}<ChevronRight size={17} aria-hidden="true" /></button></div>
              </aside>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
