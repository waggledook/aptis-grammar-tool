import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, Clock3, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const TIME_SECONDS = 8 * 60;

const podcastOptions = {
  A: { title: "Final Clue", text: "Final Clue has won several broadcasting awards for making complicated investigations surprisingly easy to follow. Each 35-minute episode examines a different real case, using interviews, recordings and a clear timeline to keep the listener oriented. The people involved are rarely typical: one episode features a retired magician helping police understand a fraud, while another follows a teenager who noticed a vital detail missed by adults. The presenter avoids unnecessary background and moves quickly from one discovery to the next. There are frequent reversals, and the solution is often less obvious than it first appears. Although the subject matter can be serious, the programme never becomes confusing or slow." },
  B: { title: "Roads Through Time", text: "Roads Through Time explores how particular places have changed across several centuries. The presenter travels through ports, mountain towns and old industrial centres, combining historical research with the memories of people who still live there. Episodes are long, usually just over an hour, and the pace is unhurried, but the stories often become unexpectedly emotional. In one, the presenter follows a family returning to a village their grandparents were forced to leave. The descriptions of coastlines, streets and ruined buildings are especially vivid, and listeners gradually understand why these landscapes matter so much to the people being interviewed. It is informative without sounding like a formal history lecture." },
  C: { title: "People Who Wouldn't Quit", text: "In People Who Wouldn't Quit, journalist Rosa Malik travels through ten countries to meet individuals who rebuilt their lives after major setbacks. Her guests include a doctor working after losing his sight, a farmer who created a business after repeated floods, and a young athlete recovering from a serious accident. Malik is warm, quick-witted and never treats her guests as helpless victims. The conversations are often funny, even when the experiences discussed are difficult, and the programme remains hopeful without becoming sentimental. Each episode takes place in a different country, so the series also offers a lively sense of local culture. The stories are accessible, energetic and genuinely encouraging." },
  D: { title: "Edge of Knowledge", text: "Edge of Knowledge follows researchers working in some of the world's least familiar environments, from underground lakes to Antarctic field stations. The science is explained in detail, and listeners are expected to concentrate; the programme does not interrupt every complex idea with a simple summary. Nevertheless, the researchers' dry jokes and the presenter's playful questions prevent the episodes from feeling like lectures. Recent programmes have explored how organisms survive without sunlight and why certain glaciers move faster than expected. The locations are extraordinary, but they are used to investigate demanding scientific questions rather than simply provide attractive scenery. Anyone looking for a light introduction may struggle, but curious listeners will find it rewarding." },
};

const podcastQuestions = [
  { id: "amina", name: "Amina", prompt: "Amina wants stories about people who have overcome serious difficulties. She enjoys presenters with a sense of humour and would prefer a programme that visits several countries.", answer: "C", feedback: "People Who Wouldn't Quit follows people rebuilding their lives in ten countries, with a warm and humorous presenter." },
  { id: "koji", name: "Koji", prompt: "Koji wants a prize-winning podcast that is easy to follow. He is interested in unusual individuals and does not mind episodes about crime, provided the explanations are clear.", answer: "A", feedback: "Final Clue is award-winning, clear, and built around unusual people and real investigations." },
  { id: "marta", name: "Marta", prompt: "Marta likes programmes set in unfamiliar places. She wants detailed ideas that will make her think, but also humour to break up serious material.", answer: "D", feedback: "Edge of Knowledge explores unfamiliar environments and demanding ideas, balanced by dry jokes and playful questions." },
  { id: "elena", name: "Elena", prompt: "Elena wants moving personal stories and a presenter who becomes close to the people interviewed. Vivid descriptions of places would make the programme even better.", answer: "B", feedback: "Roads Through Time combines emotional family stories, close interviews, and vivid descriptions of changing places." },
  { id: "david", name: "David", prompt: "David is looking for a crime podcast with unexpected developments. He prefers short, energetic episodes that move quickly rather than dwell on background information.", answer: "A", feedback: "Final Clue offers 35-minute crime investigations with frequent reversals and a fast-moving structure." },
  { id: "noor", name: "Noor", prompt: "Noor has a long journey coming up and wants several lengthy episodes. She would like to learn about history and how places have changed over time.", answer: "B", feedback: "Roads Through Time has hour-long episodes about the history and changing character of particular places." },
];

const courseOptions = {
  A: { title: "WorkReady Online", text: "WorkReady Online specialises in career-focused courses, including Coding from Zero and an extended programme in project management. Most lessons are recorded, so learners can study at any time, but tutors hold weekly online clinics and give individual written feedback on submitted work. The project-management programme leads to a certificate recognised by several professional organisations and includes a team-based business simulation. Companies can pay directly and receive full invoices for staff training. Shorter courses are also available, but they do not carry the same qualification. Learners should expect regular assignments, although deadlines can usually be adjusted for those in full-time employment." },
  B: { title: "OpenPath", text: "OpenPath offers free introductory courses in history, psychology, culture and personal well-being. There are no fixed starting dates or deadlines, and lessons can be read online, downloaded or played as audio through the mobile app. Courses normally take between four and twelve hours to complete, making them easy to fit around travel or work. Discussion boards are available, but there is no direct tutor feedback. Learners can pay for a digital certificate after finishing, though this is mainly a record of participation rather than a professional qualification. The range is broad, from the history of ordinary working life to practical introductions to sleep and stress." },
  C: { title: "CreativeLab", text: "CreativeLab's six-week Mobile Photography course is designed for people who want better results without purchasing a professional camera. Weekly live workshops demonstrate lighting, composition and editing techniques using ordinary smartphones. Learners upload photographs to a shared gallery, discuss one another's work and receive short comments from the course leader. Recordings are provided if a class is missed, although the course works best for those who can attend most sessions. A free editing app is used throughout, and no additional equipment is required. CreativeLab also runs design and video courses, but all follow fixed dates rather than allowing completely independent study." },
  D: { title: "GlobalTalk", text: "GlobalTalk provides live online English courses for professional situations. Its Business Communication programme focuses on meetings, presentations, negotiations and clear workplace emails. Classes take place twice a week in the evening, with learners working in pairs and small groups for much of each session. Teachers give feedback on speaking and pronunciation, while worksheets, model phrases and recorded practice activities can be downloaded between classes. The course includes a completion certificate, but it is not a formal professional qualification. Students may watch a recording after an absence, though they cannot follow the whole programme at their own pace because each group progresses together." },
};

const courseQuestions = [
  { id: "maya", name: "Maya", prompt: "Maya wants to learn basic coding but works full-time, so she needs to study whenever she is free. She would also like personal tutor feedback on submitted work.", answer: "A", feedback: "WorkReady offers Coding from Zero, flexible recorded lessons, and individual written tutor feedback." },
  { id: "oliver", name: "Oliver", prompt: "Oliver wants to improve photographs taken on his phone. He prefers live demonstrations and sharing pictures with other learners, without buying expensive equipment.", answer: "C", feedback: "CreativeLab teaches smartphone photography in live workshops and has a shared gallery with no extra equipment needed." },
  { id: "priya", name: "Priya", prompt: "Priya needs English for meetings and presentations at work. She wants evening classes with live speaking practice and downloadable materials between lessons.", answer: "D", feedback: "GlobalTalk focuses on professional English, meets in the evening, and includes live speaking plus downloadable materials." },
  { id: "leo", name: "Leo", prompt: "Leo is interested in social history but dislikes fixed deadlines. He would like audio lessons for travelling and a course he can begin for free.", answer: "B", feedback: "OpenPath offers free, flexible history courses with downloadable and audio lessons for mobile learning." },
  { id: "sara", name: "Sara", prompt: "Sara wants a recognised project-management qualification. Her employer needs a proper invoice, and she hopes for a group task as well as individual work.", answer: "A", feedback: "WorkReady's project-management programme is recognised, includes a team simulation, and provides company invoices." },
  { id: "nadia", name: "Nadia", prompt: "Nadia is curious about psychology and everyday well-being. She wants a short introductory course on her phone, without fixed class times or an initial cost.", answer: "B", feedback: "OpenPath has free, short psychology and well-being introductions available on its mobile app without fixed dates." },
];

const cookingOptions = {
  A: { title: "Marta", text: "I started cooking when I moved away from my parents for university. At first, I only made very simple meals, but I soon got bored of eating the same things. I began watching short cooking videos online and now I enjoy trying new dishes. My friends often come to my flat for dinner, which makes me very happy. Next month, I’m going to join an evening course because I want to learn how to make bread and cakes properly." },
  B: { title: "Ben", text: "My grandmother taught me to cook when I was twelve. She never used a recipe, so I had to watch carefully and remember what she did. In the beginning, I made lots of mistakes and once put salt in a cake instead of sugar! I almost stopped trying, but my grandmother told me to continue. Now I cook dinner for my family every Friday. I still use some of her old recipes, although I write everything down so I do not forget." },
  C: { title: "Yuki", text: "I decided to learn to cook because I wanted to eat healthier food and spend less money on takeaways. I usually choose easy recipes with vegetables, rice or chicken, and I prepare several meals on Sunday for the week ahead. Shopping for all the ingredients takes time, but I like knowing exactly what is in my food. I do not cook for other people very often, but my lunches at work are much better now, and I save quite a lot each month." },
};

const cookingQuestions = [
  { id: "relative", prompt: "Who learned to cook from a relative?", answer: "B", feedback: "Ben learned to cook from his grandmother.", evidence: "My grandmother taught me to cook when I was twelve." },
  { id: "lessons", prompt: "Who is going to attend cooking lessons?", answer: "A", feedback: "Marta is going to join an evening course.", evidence: "Next month, I’m going to join an evening course" },
  { id: "friends", prompt: "Who often prepares food for friends?", answer: "A", feedback: "Marta's friends often come to her flat for dinner.", evidence: "My friends often come to my flat for dinner" },
  { id: "stopped", prompt: "Who nearly stopped learning to cook?", answer: "B", feedback: "Ben says he almost stopped trying after making mistakes.", evidence: "I almost stopped trying" },
  { id: "healthier", prompt: "Who wanted to improve the food they ate?", answer: "C", feedback: "Yuki wanted to eat healthier food.", evidence: "I wanted to eat healthier food" },
  { id: "less-money", prompt: "Who says cooking helps them spend less money?", answer: "C", feedback: "Yuki saves money by avoiding takeaways and preparing meals.", evidence: "spend less money on takeaways" },
];

const volunteerOptions = {
  A: { title: "Leah", text: "I volunteer at an animal centre every Sunday morning. I usually arrive at seven because the dogs need food and exercise before visitors come. Cleaning their spaces is not the most enjoyable part, but taking them for walks is great. Some animals are frightened when they first arrive, so we have to be patient. I hope to become a vet one day, and this work is teaching me a lot about looking after different animals." },
  B: { title: "Omar", text: "A friend asked me to help at our local food bank last winter, and I have gone there every week since then. At first, I packed boxes for families, but now I also visit local shops and ask them to give us food they cannot sell. I enjoy working with the other volunteers, and I was surprised to learn how many people in our town need help. The work can be busy, but everyone works well together." },
  C: { title: "Hana", text: "I help visitors at a small museum on Saturday afternoons. I chose this work because I wanted to practise speaking English with tourists. During my first few weeks, I felt nervous when people asked questions, but the other volunteers showed me what to say. Now I am much more confident and enjoy telling visitors about the old building. I finish college next year, and I would love to get a paid job at the museum after that." },
};

const volunteerQuestions = [
  { id: "animals", prompt: "Who hopes to work with animals in the future?", answer: "A", feedback: "Leah hopes to become a vet.", evidence: "I hope to become a vet one day" },
  { id: "confidence", prompt: "Who became more confident speaking to people?", answer: "C", feedback: "Hana was nervous at first but is now more confident with visitors.", evidence: "Now I am much more confident" },
  { id: "friend", prompt: "Who started volunteering because of a friend?", answer: "B", feedback: "Omar's friend asked him to help at the food bank.", evidence: "A friend asked me to help" },
  { id: "early", prompt: "Who has to begin work early in the morning?", answer: "A", feedback: "Leah usually arrives at seven in the morning.", evidence: "I usually arrive at seven" },
  { id: "businesses", prompt: "Who asks businesses to provide something?", answer: "B", feedback: "Omar asks local shops to give the food bank unsold food.", evidence: "ask them to give us food they cannot sell" },
  { id: "paid-job", prompt: "Who would like a paid job in the same place?", answer: "C", feedback: "Hana would like a paid job at the museum.", evidence: "I would love to get a paid job at the museum" },
];

const practiceSets = {
  "a2-pilot-1": { id: "a2-pilot-1", title: "Learning to Cook", level: "A2", format: "text-matching", topic: "learning to cook", heading: "Learning to cook", intro: "Three people talk about learning to cook.", options: cookingOptions, questions: cookingQuestions },
  "a2-pilot-2": { id: "a2-pilot-2", title: "My Volunteer Work", level: "A2", format: "text-matching", topic: "voluntary work", heading: "My volunteer work", intro: "Three people talk about doing voluntary work.", options: volunteerOptions, questions: volunteerQuestions },
  "b2-pilot-1": { id: "b2-pilot-1", title: "Podcasts to Download", topic: "podcasts", heading: "Podcasts to download", intro: "Six listeners are looking for a podcast. Choose the best podcast for each person.", options: podcastOptions, questions: podcastQuestions },
  "b2-pilot-2": { id: "b2-pilot-2", title: "Online Course Providers", topic: "online courses", heading: "Online course providers", intro: "Six learners are looking for an online course. Choose the best provider for each person.", options: courseOptions, questions: courseQuestions },
};

const evidenceBySet = {
  "b2-pilot-1": {
    amina: ["travels through ten countries", "rebuilt their lives after major setbacks", "warm, quick-witted"],
    koji: ["won several broadcasting awards", "easy to follow", "The people involved are rarely typical"],
    marta: ["some of the world's least familiar environments", "The science is explained in detail", "dry jokes and the presenter's playful questions"],
    elena: ["the stories often become unexpectedly emotional", "The descriptions of coastlines, streets and ruined buildings are especially vivid"],
    david: ["Each 35-minute episode", "moves quickly from one discovery to the next", "There are frequent reversals"],
    noor: ["places have changed across several centuries", "Episodes are long, usually just over an hour"],
  },
  "b2-pilot-2": {
    maya: ["Coding from Zero", "Most lessons are recorded, so learners can study at any time", "give individual written feedback on submitted work"],
    oliver: ["Mobile Photography course", "Weekly live workshops", "upload photographs to a shared gallery", "no additional equipment is required"],
    priya: ["focuses on meetings, presentations, negotiations", "Classes take place twice a week in the evening", "recorded practice activities can be downloaded"],
    leo: ["free introductory courses in history", "There are no fixed starting dates or deadlines", "played as audio through the mobile app"],
    sara: ["certificate recognised by several professional organisations", "includes a team-based business simulation", "receive full invoices for staff training"],
    nadia: ["free introductory courses in history, psychology, culture and personal well-being", "There are no fixed starting dates or deadlines", "between four and twelve hours to complete"],
  },
};

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function OteGeneralReadingPart2Practice({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { setId = "b2-pilot-1" } = useParams();
  const practiceSet = practiceSets[setId] || practiceSets["b2-pilot-1"];
  const { questions, options } = practiceSet;
  const isTextMatching = practiceSet.format === "text-matching";
  const menuPath = getSitePath(nativeRoutes ? "/reading/general/part-2-matching" : "/ote/reading/general/part-2-matching");
  const [phase, setPhase] = useState("ready");
  const [answers, setAnswers] = useState({});
  const [expandedId, setExpandedId] = useState(questions[0].id);
  const [secondsLeft, setSecondsLeft] = useState(TIME_SECONDS);
  const completionLogged = useRef(false);
  const completionPromise = useRef(null);
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(() => questions.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0), [answers, questions]);

  useEffect(() => {
    if (user?.oteVersion === "advanced" || phase !== "active" || answeredCount === questions.length) return undefined;
    if (secondsLeft <= 0) {
      checkAnswers("time");
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [answeredCount, phase, secondsLeft, user?.oteVersion]);

  function startPractice() {
    completionLogged.current = false;
    completionPromise.current = null;
    setAnswers({});
    setExpandedId(questions[0].id);
    setSecondsLeft(TIME_SECONDS);
    setPhase("active");
    logOteTrainingStarted({ section: "reading", part: "part-2", mode: "timed_practice", taskId: `general-reading-part-2-${practiceSet.id}`, taskTitle: `General Reading Part 2 ${practiceSet.title}`, variant: "general" });
  }

  function chooseAnswer(questionId, choice) {
    if (phase !== "active") return;
    setAnswers((current) => ({ ...current, [questionId]: choice }));
  }

  function recordCompletion(reason) {
    if (completionLogged.current) return Promise.resolve(true);
    if (completionPromise.current) return completionPromise.current;
    completionPromise.current = logOteTrainingCompleted({ section: "reading", part: "part-2", mode: "timed_practice", taskId: `general-reading-part-2-${practiceSet.id}`, taskTitle: `General Reading Part 2 ${practiceSet.title}`, variant: "general", score, total: questions.length, reason: typeof reason === "string" ? reason : "checked" })
      .then(() => { completionLogged.current = true; return true; })
      .catch((error) => { console.warn("[OTE Reading Part 2] completion save failed", error); return false; })
      .finally(() => { completionPromise.current = null; });
    return completionPromise.current;
  }

  function checkAnswers(reason = "checked") {
    setPhase("review");
    recordCompletion(reason);
  }

  async function finishPractice(reason = "manual") {
    setPhase("complete");
    const saved = await recordCompletion(reason);
    if (!saved) void recordCompletion(reason);
  }

  if (user?.oteVersion === "advanced") return <Unavailable onBack={() => navigate(getSitePath(nativeRoutes ? "/reading" : "/ote/reading"))} />;

  return <main className="ote-training-page ote-reading-practice-page ote-reading-matching-page">
    <Seo title="OTE General Reading Part 2 Timed Practice | Seif English" description="Timed General OTE Reading Part 2 multiple matching practice." />
    <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 2</button>
    <header className="ote-training-hero"><p className="ote-kicker">General Reading Part 2</p><h1>{practiceSet.title}</h1><p>{isTextMatching ? "Match each question to the correct person's text." : `Match six people with the best option from a set of ${practiceSet.topic}.`}</p></header>
    {phase === "active" ? <div className="ote-writing-floating-timer" aria-live="polite"><Clock3 size={20} aria-hidden="true" /><strong>{formatTime(secondsLeft)}</strong><span>Matching</span></div> : null}
    <section className="ote-practice-runner">
      <div className="ote-practice-progress"><div><span>{phase === "complete" ? "Complete" : phase === "review" ? "Answers checked" : `${answeredCount} of ${questions.length} matched`}</span><strong>{phase === "complete" || phase === "review" ? `${score} / ${questions.length} correct` : "8 minutes for the full task"}</strong></div><div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${phase === "complete" || phase === "review" ? 100 : (answeredCount / questions.length) * 100}%` }} /></div></div>
      {phase === "ready" ? <ReadyCard user={user} onStart={startPractice} isTextMatching={isTextMatching} /> : phase === "active" || phase === "review" ? <article className="ote-practice-task-card ote-reading-matching-task">
        <div className="ote-recorder-top"><div><p className="ote-kicker">Multiple matching</p><h2>{isTextMatching ? "Which person matches each question?" : "Which option is best for each person?"}</h2></div><div className="ote-recorder-timer is-recording" aria-hidden="true"><Clock3 size={22} /><strong>{formatTime(secondsLeft)}</strong><span>Remaining</span></div></div>
        <div className="ote-reading-matching-layout"><div className="ote-reading-question-column"><div className="ote-reading-match-list">{questions.map((item, index) => {
          const expanded = expandedId === item.id;
          const answer = answers[item.id];
          const isCorrect = answer === item.answer;
          const reviewed = phase === "review";
          return <article className={`ote-reading-match-item ${expanded ? "is-open" : ""} ${reviewed ? (isCorrect ? "is-correct" : "is-wrong") : ""}`} key={item.id}>
            <button type="button" className="ote-reading-match-toggle" onClick={() => setExpandedId(expanded ? "" : item.id)} aria-expanded={expanded}><span>{index + 1}. {isTextMatching ? item.prompt : item.name}</span><ChevronDown size={22} aria-hidden="true" /></button>
            {expanded ? <div className="ote-reading-match-options">{!isTextMatching ? <p className="ote-reading-match-profile">{item.prompt}</p> : null}{Object.entries(options).map(([choice, option]) => <button key={choice} type="button" className={`${answer === choice ? "is-selected" : ""} ${reviewed && choice === item.answer ? "is-answer" : ""} ${reviewed && answer === choice && !isCorrect ? "is-incorrect" : ""}`} disabled={reviewed} onClick={() => chooseAnswer(item.id, choice)}>{choice}. {option.title}</button>)}{reviewed ? <div className={`ote-reading-item-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}><strong>{isCorrect ? "Correct." : "Not quite."}</strong><p>{item.feedback}</p></div> : null}</div> : null}
          </article>;
        })}</div><div className="ote-recorder-actions">{phase === "review" ? <button type="button" onClick={() => finishPractice("manual")}>View final report</button> : <button type="button" disabled={answeredCount !== questions.length} onClick={() => checkAnswers("checked")}>Check answers</button>}</div></div><OptionsArticle practiceSet={practiceSet} evidence={phase === "review" ? (isTextMatching ? questions.find((item) => item.id === expandedId)?.evidence : evidenceBySet[practiceSet.id]?.[expandedId]) : ""} /></div>
      </article> : <CompleteCard score={score} answers={answers} questions={questions} options={options} setTitle={practiceSet.title} onRetry={startPractice} onBack={() => navigate(menuPath)} />}
    </section>
  </main>;
}

function ReadyCard({ user, onStart, isTextMatching }) {
  return <article className="ote-practice-task-card ote-reading-ready-card"><div className="ote-recorder-top"><div><p className="ote-kicker">Ready to start</p><h2>Timed matching set</h2></div><div className="ote-recorder-timer is-ready"><Clock3 size={22} aria-hidden="true" /><strong>08:00</strong><span>Full task</span></div></div><div className="ote-training-rule-grid"><article><h3>{isTextMatching ? "Six questions" : "Six people"}</h3><p>{isTextMatching ? "Match each question with one of three personal texts." : "Match each person with one of four possible options."}</p></article><article><h3>One full timer</h3><p>You have eight minutes to complete all six matches.</p></article><article><h3>Review after checking</h3><p>Check all answers together, then inspect the highlighted source evidence.</p></article></div>{!user ? <p className="ote-warning">Sign in to save this completed practice set to your progress.</p> : null}<div className="ote-recorder-actions"><button type="button" onClick={onStart}><Clock3 size={18} aria-hidden="true" /> Start timed practice</button></div></article>;
}

function OptionsArticle({ practiceSet, evidence }) {
  return <article className="ote-reading-matching-source"><header><p className="ote-kicker">Source material</p><h3>{practiceSet.heading}</h3><strong>{practiceSet.intro}</strong></header>{Object.entries(practiceSet.options).map(([id, option]) => <section key={id}><div><span>{id}</span><h4>{option.title}</h4></div><p><HighlightedText text={option.text} phrase={evidence} /></p></section>)}</article>;
}

function HighlightedText({ text, phrase }) {
  const phrases = (Array.isArray(phrase) ? phrase : [phrase]).filter((item) => item && text.includes(item));
  if (!phrases.length) return text;
  const pattern = new RegExp(`(${phrases.sort((a, b) => b.length - a.length).map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return text.split(pattern).map((part, index) => phrases.includes(part) ? <mark className="ote-reading-evidence" key={`${part}-${index}`}>{part}</mark> : part);
}

function CompleteCard({ score, answers, questions, options, setTitle, onRetry, onBack }) {
  return <section className="ote-practice-complete ote-reading-native-complete"><CheckCircle2 size={38} aria-hidden="true" /><div><p className="ote-kicker">{setTitle} complete</p><h2>{score} / {questions.length}</h2><p>{score === questions.length ? "Excellent work. Every match was correct." : "Review the matches and rationales below."}</p><div className="ote-reading-review-list">{questions.map((item, index) => { const correct = answers[item.id] === item.answer; return <article className={correct ? "is-correct" : "is-wrong"} key={item.id}><div><strong>{index + 1}. {item.name || item.prompt}</strong><span>{correct ? "Correct" : "Review"}</span></div><p><b>Answer:</b> {item.answer}. {options[item.answer].title}</p><p>{item.feedback}</p></article>; })}</div><div className="ote-complete-actions"><button type="button" onClick={onBack}>Back to Part 2</button><button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button></div></div></section>;
}

function Unavailable({ onBack }) {
  return <main className="ote-training-page"><button className="ote-training-back" type="button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to reading</button><header className="ote-training-hero"><p className="ote-kicker">General Reading Part 2</p><h1>Practice not available</h1><p>This timed set is available in the General OTE workspace.</p></header></main>;
}
