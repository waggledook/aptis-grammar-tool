import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const QUESTION_SECONDS = 80;

const pilotSet1 = [
  {
    id: "photography-class", type: "email", label: "Email", title: "Photography class", from: "Course coordinator", to: "Photography class", subject: "Tomorrow's class",
    text: "Hello everyone,\n\nTomorrow evening's photography class will take place in Room 204 of the West Building, not in the Arts Centre as planned. Repairs to the heating system there are taking longer than expected. The class will start at the usual time, but please bring photo identification, as security staff at the West Building will ask to see it before allowing visitors inside.",
    prompt: "Why has the organiser written this email?",
    options: ["To explain why the class will begin later than usual.", "To provide updated location and entry information.", "To remind students to take their equipment to another building."], answer: 1,
    feedback: "The email gives students the new location and explains that they must show identification to enter the building.",
  },
  {
    id: "museum-volunteers", type: "advert", label: "Advert", title: "Weekend museum volunteers wanted",
    text: "We need volunteers for our family history events. You do not need specialist knowledge, as full training will be provided. However, you should enjoy meeting new people and feel comfortable explaining simple activities to groups of adults and children. Volunteers must be available for at least two Saturday or Sunday mornings each month between April and September.",
    prompt: "Who would be most suitable for this role?",
    options: ["Someone knowledgeable about history who is free one Saturday each month.", "Someone comfortable speaking to families who can attend regularly at weekends.", "Someone with museum experience who prefers preparing activities away from visitors."], answer: 1,
    feedback: "The role requires someone confident communicating with families who can attend at least two weekend mornings each month.",
  },
  {
    id: "starting-photography", type: "blog", label: "Blog entry", title: "Starting photography", publication: "The Camera Notebook",
    text: "When people take up photography, they often assume that better equipment will immediately improve their pictures. I made that mistake myself. Before spending a large amount on a camera, use your phone or borrow a basic model for a few weeks. Once you know whether you enjoy portraits, landscapes or action shots, you will have a much clearer idea of what equipment is actually worth buying.",
    prompt: "What is the blogger's main advice to beginners?",
    options: ["Experiment with photography before investing in expensive equipment.", "Learn how to use a professional camera as early as possible.", "Compare the picture quality of phones and cameras carefully."], answer: 0,
    feedback: "The blogger recommends trying photography with basic or borrowed equipment before spending a large amount of money.",
  },
  {
    id: "water-maintenance", type: "notice", label: "Notice", title: "Notice to residents",
    text: "Water maintenance will take place on Tuesday 14 May. The work was originally expected to affect the whole building, but only apartments on floors six to ten will now lose their water supply. The interruption will begin at 10:00 instead of 9:00 and should last approximately two hours. Residents on lower floors can use water normally throughout the morning.",
    prompt: "What does the notice say about the water interruption?",
    options: ["It will affect fewer apartments than originally expected.", "It will happen on a different day from the one first announced.", "It will last longer than residents were originally told."], answer: 0,
    feedback: "The work was originally going to affect the whole building, but it will now affect only floors six to ten.",
  },
  {
    id: "changing-lunch", type: "message", label: "Text message", title: "Message from a colleague", sender: "Alex", recipient: "Marta",
    text: "Hi Marta, I'm afraid I can't make lunch at one after all. The client call that was planned for three has been moved forward to 12:30, and I need time to prepare beforehand. I should be finished by five, though. Would you be free for a coffee near the office then instead? Sorry for changing things at such short notice.",
    prompt: "Why does the writer want to change the arrangement?",
    options: ["The client has invited the writer to lunch.", "The writer expects to finish work later than planned.", "A work commitment will now happen earlier in the day."], answer: 2,
    feedback: "The client call has moved from three o'clock to 12:30, creating a conflict with the planned lunch.",
  },
  {
    id: "quickdrop", type: "review", label: "Review", title: "QuickDrop delivery service", publication: "Everyday Reviews",
    text: "QuickDrop is not the cheapest delivery service in town, and its app looks rather old-fashioned. However, I would still use it again. Other companies have made me wait at home for an entire afternoon, but QuickDrop gave me a one-hour delivery window and arrived within ten minutes of the stated time. For anyone with a busy schedule, that reliability is worth paying slightly more for.",
    prompt: "What does the reviewer particularly appreciate about QuickDrop?",
    options: ["It provides a fairly precise and reliable delivery time.", "It allows customers to change delivery times easily through the app.", "It usually completes deliveries faster than other companies."], answer: 0,
    feedback: "The reviewer values the narrow delivery window and the fact that QuickDrop arrived very close to the promised time.",
  },
];

const b1PilotSet1 = [
  { id: "meeting-maya", type: "email", label: "Email", title: "Meeting Maya", from: "Sam", to: "Maya", subject: "Friday and Sunday", text: "Hi Maya,\n\nThanks for inviting me to the concert on Friday. I can't come because my cousins are visiting, but I'd still love to see you. Are you free on Sunday afternoon instead? We could meet for coffee and you can tell me all about it.", prompt: "Why has the writer emailed Maya?", options: ["To explain that the concert has been cancelled.", "To ask whether her cousins can attend the concert.", "To suggest another time for them to meet."], answer: 2, feedback: "The writer cannot attend the concert but suggests meeting Maya for coffee on Sunday instead." },
  { id: "the-bicycle", type: "message", label: "Text message", title: "The bicycle", sender: "Jamie", recipient: "Ben", text: "Hi Ben. Thanks for sending me the details of your neighbour's bike. It looks in good condition and the price is reasonable, but I need something smaller that I can carry upstairs. I'll keep looking, but I really appreciate your help.", prompt: "Why has the writer sent this message?", options: ["To explain why they will not buy the bike.", "To ask Ben to help them carry the bike upstairs.", "To complain that the neighbour is asking too much for the bike."], answer: 0, feedback: "Although the writer likes the condition and price, the bike is too large to carry upstairs." },
  { id: "sports-centre", type: "notice", label: "Notice", title: "Weekend notice", text: "The sports centre is open as usual this weekend. However, the changing rooms are closed while new showers are being installed. Please arrive wearing suitable sports clothes. Lockers near reception are still available for bags and personal items.", prompt: "What should visitors do this weekend?", options: ["Bring different clothes to wear after exercising.", "Arrive at the centre ready to exercise.", "Leave their bags and personal belongings at home."], answer: 1, feedback: "Because the changing rooms are closed, visitors should put on their sports clothes before arriving." },
  { id: "learning-vocabulary", type: "blog", label: "Blog entry", title: "Learning vocabulary", publication: "Small Steps English", text: "Trying to learn fifty new words in one evening usually doesn't work. I remember vocabulary better when I choose five or six words, write my own examples and use them again the next day. Regular practice is slower, but the words stay in my memory longer.", prompt: "What is the blogger's main advice?", options: ["Write definitions of new words before trying to use them.", "Learn a long list and review it again the following day.", "Study a few words at a time and practise them regularly."], answer: 2, feedback: "The blogger recommends selecting a small number of words, producing examples, and using the words again later." },
  { id: "photography-course", type: "note", label: "Note", title: "A note for Leah", text: "Leah,\n\nGreenfield College called this morning. A place is now available on the Saturday photography course because another student has cancelled. If you still want it, phone the college before 5 p.m. tomorrow. After that, they will contact the next person on the waiting list.", prompt: "What does Leah need to do?", options: ["Tell the college quickly whether she wants the place.", "Find out why the other student left the course.", "Ask the college to put her on the waiting list."], answer: 0, feedback: "Leah must contact the college before the deadline to confirm that she still wants the place." },
  { id: "book-club", type: "group", label: "Group message", title: "Book club", sender: "Book club organiser", recipient: "Book club", text: "Hi everyone. Our book-club meeting is still at 7:30 on Thursday in the library cafe. Before you come, please think of one question about the final chapter. We spent too much time summarising the story last month, so this time let's focus on discussing our opinions.", prompt: "Why has the organiser written this message?", options: ["To inform members that the meeting arrangements have changed.", "To remind members how they should prepare for the discussion.", "To ask members to prepare a summary of the final chapter."], answer: 1, feedback: "The time and place have not changed. The organiser wants members to prepare a question so they can discuss their opinions." },
];

const a2PilotSet1 = [
  { id: "cinema-plans", type: "message", label: "Text message", title: "Cinema plans", sender: "Noah", recipient: "Eva", text: "Hi Eva, the film starts at seven, not half past. I'll wait outside the main entrance from 6:45. Please text me if you're going to be late.", prompt: "What should Eva do?", options: ["Wait for the writer inside the cinema.", "Send a message if she is delayed.", "Arrive at half past seven."], answer: 1, feedback: "Eva should text the writer if she is going to arrive late." },
  { id: "sports-shop-offer", type: "advert", label: "Advert", title: "Weekend offer!", text: "Buy any pair of sports shoes and get a free water bottle. The offer is only available in our town-centre shop on Saturday and Sunday.", prompt: "Customers who buy sports shoes can ...", options: ["receive a free gift.", "choose a second pair for less money.", "order them online at the weekend."], answer: 0, feedback: "Customers receive a free water bottle when they buy sports shoes." },
  { id: "camping-trip", type: "blog", label: "Blog entry", title: "Camping trip", publication: "Weekend Outside", text: "We arrived at the campsite in heavy rain, so putting up the tent was difficult. Luckily, the sun came out later, and we spent the evening swimming in the lake.", prompt: "What happened at the campsite?", options: ["The writers left because of the rain.", "They went swimming before putting up the tent.", "The weather became better later in the day."], answer: 2, feedback: "It was raining when they arrived, but the sun appeared later." },
  { id: "cooking-class", type: "email", label: "Email", title: "Cooking class", from: "Ella", to: "Sam", subject: "A class for you", text: "Hi Sam,\n\nI saw this beginner's cooking class and thought of you. It's on Thursday evenings near your office, and you don't need to bring anything. Shall I send you the details?", prompt: "Why is the writer emailing Sam?", options: ["To ask Sam for help with cooking.", "To recommend a class to Sam.", "To invite Sam to cook at the writer's home."], answer: 1, feedback: "The writer thinks the class may be suitable for Sam and offers to send more information." },
  { id: "library-internet", type: "notice", label: "Notice", title: "Library computers", text: "Library computers are not working today because of a network problem. You can still borrow books, but please use your own phone or laptop to access the internet.", prompt: "What should visitors do if they need the internet?", options: ["Ask a librarian to repair a computer.", "Return to the library another day.", "Use their own device."], answer: 2, feedback: "Visitors should use their own phone or laptop because the library computers are not working." },
  { id: "swimming-pool-rules", type: "notice", label: "Notice", title: "Swimming pool rules", text: "Children under 12 must be with an adult. Food is not allowed beside the pool. The pool closes at 8 p.m. every day.", prompt: "The notice says that children under 12 ...", options: ["may use the pool with an adult.", "must leave the pool before 8 a.m.", "can eat beside the pool."], answer: 0, feedback: "Children under 12 can use the pool if an adult is with them." },
];

const practiceSets = {
  "a2-pilot-1": { title: "A2 Pilot Set 1", level: "A2", questions: a2PilotSet1 },
  "pilot-1": { title: "B2 Pilot Set 1", level: "B2", questions: pilotSet1 },
  "b1-pilot-1": { title: "B1 Pilot Set 1", level: "B1", questions: b1PilotSet1 },
};

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function OteGeneralReadingPart1Practice({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { setId = "pilot-1" } = useParams();
  const practiceSet = practiceSets[setId] || practiceSets["pilot-1"];
  const questions = practiceSet.questions;
  const menuPath = getSitePath(nativeRoutes ? "/reading/general/part-1-short-texts" : "/ote/reading/general/part-1-short-texts");
  const [phase, setPhase] = useState("ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const completionLogged = useRef(false);
  const question = questions[questionIndex];
  const score = questions.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0);

  useEffect(() => {
    if (user?.oteVersion === "advanced" || phase !== "active" || revealed) return undefined;
    if (secondsLeft <= 0) {
      setRevealed(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, questionIndex, revealed, secondsLeft, user?.oteVersion]);

  function startPractice() {
    completionLogged.current = false;
    setQuestionIndex(0);
    setAnswers({});
    setRevealed(false);
    setSecondsLeft(QUESTION_SECONDS);
    setPhase("active");
    logOteTrainingStarted({ section: "reading", part: "part-1", mode: "timed_practice", taskId: `general-reading-part-1-${setId}`, taskTitle: `General Reading Part 1 ${practiceSet.title}`, variant: "general" });
  }

  function advanceQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSecondsLeft(QUESTION_SECONDS);
      setRevealed(false);
      return;
    }
    setPhase("complete");
    if (!completionLogged.current) {
      completionLogged.current = true;
      logOteTrainingCompleted({ section: "reading", part: "part-1", mode: "timed_practice", taskId: `general-reading-part-1-${setId}`, taskTitle: `General Reading Part 1 ${practiceSet.title}`, variant: "general", score, total: questions.length });
    }
  }

  if (user?.oteVersion === "advanced") {
    return <Unavailable onBack={() => navigate(getSitePath(nativeRoutes ? "/reading" : "/ote/reading"))} />;
  }

  return (
    <main className="ote-training-page ote-reading-practice-page">
      <Seo title="OTE General Reading Part 1 Timed Practice | Seif English" description="Timed General OTE Reading Part 1 practice with six short texts." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 1</button>
      <header className="ote-training-hero"><p className="ote-kicker">General Reading Part 1</p><h1>{practiceSet.title}</h1><p>Six short practical texts. Choose one answer before the timer runs out.</p></header>
      {phase === "active" ? <div className="ote-writing-floating-timer" aria-live="polite"><Clock3 size={20} aria-hidden="true" /><strong>{formatTime(secondsLeft)}</strong><span>Question</span></div> : null}

      <section className="ote-practice-runner">
        <div className="ote-practice-progress"><div><span>{phase === "complete" ? "Complete" : phase === "active" ? `Question ${questionIndex + 1} of 6` : "Timed practice"}</span><strong>{phase === "complete" ? `${score} / 6 correct` : "1 minute 20 seconds per question"}</strong></div><div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${phase === "complete" ? 100 : phase === "active" ? ((questionIndex + (revealed ? 1 : 0)) / 6) * 100 : 0}%` }} /></div></div>
        {phase === "ready" ? <ReadyCard user={user} onStart={startPractice} /> : phase === "active" ? (
          <article className="ote-practice-task-card ote-reading-native-task">
            <div className="ote-recorder-top"><div><p className="ote-kicker">Question {questionIndex + 1} of 6</p><h2>{question.prompt}</h2></div><div className="ote-recorder-timer is-recording" aria-hidden="true"><Clock3 size={22} /><strong>{formatTime(secondsLeft)}</strong><span>Remaining</span></div></div>
            <div className="ote-reading-native-layout"><div><p className="ote-instructions">Read the {question.label.toLowerCase()} and choose the correct answer.</p><div className="ote-training-options" role="radiogroup" aria-label={question.prompt}>{question.options.map((option, optionIndex) => <button key={option} className={`ote-training-option ${answers[question.id] === optionIndex ? "is-selected" : ""} ${revealed && optionIndex === question.answer ? "is-answer" : ""} ${revealed && answers[question.id] === optionIndex && optionIndex !== question.answer ? "is-incorrect" : ""}`} type="button" role="radio" aria-checked={answers[question.id] === optionIndex} aria-disabled={revealed} onClick={() => { if (revealed) return; setAnswers((current) => ({ ...current, [question.id]: optionIndex })); setRevealed(true); }}><span><strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option}</span></button>)}</div>{revealed ? <ItemFeedback question={question} answer={answers[question.id]} /> : null}</div><GeneralReadingArtifact question={question} /></div>
            <div className="ote-recorder-actions"><button type="button" disabled={!revealed} onClick={advanceQuestion}>{questionIndex === 5 ? "Finish and review" : "Next question"}</button></div>
          </article>
        ) : <CompleteCard score={score} questions={questions} answers={answers} setTitle={practiceSet.title} onBack={() => navigate(menuPath)} onRetry={startPractice} />}
      </section>
    </main>
  );
}

function ItemFeedback({ question, answer }) {
  const isCorrect = answer === question.answer;
  return <div className={`ote-reading-item-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}><strong>{answer == null ? "Time's up." : isCorrect ? "Correct." : "Not quite."}</strong><p>{question.feedback}</p></div>;
}

function ReadyCard({ user, onStart }) {
  return <article className="ote-practice-task-card ote-reading-ready-card"><div className="ote-recorder-top"><div><p className="ote-kicker">Ready to start</p><h2>Timed reading set</h2></div><div className="ote-recorder-timer is-ready"><Clock3 size={22} aria-hidden="true" /><strong>01:20</strong><span>Per question</span></div></div><div className="ote-training-rule-grid"><article><h3>Six short texts</h3><p>Read practical messages, notices, adverts, and short online content.</p></article><article><h3>Individual timer</h3><p>The timer restarts for each new question and moves you on at zero.</p></article><article><h3>Review at the end</h3><p>See your score and explanations after the final question.</p></article></div>{!user ? <p className="ote-warning">Sign in to save this completed practice set to your progress.</p> : null}<div className="ote-recorder-actions"><button type="button" onClick={onStart}><Clock3 size={18} aria-hidden="true" /> Start timed practice</button></div></article>;
}

function GeneralReadingArtifact({ question }) {
  if (question.type === "email") return <article className="ote-general-artifact is-email"><div><strong>From:</strong><span>{question.from}</span></div><div><strong>To:</strong><span>{question.to}</span></div><div><strong>Subject:</strong><span>{question.subject}</span></div><p>{question.text}</p></article>;
  if (question.type === "message" || question.type === "group") return <article className={`ote-general-artifact is-message ${question.type === "group" ? "is-group" : ""}`}><div className="ote-message-head"><strong>{question.sender}</strong><span>Message to {question.recipient}</span></div><p>{question.text}</p></article>;
  if (question.type === "note") return <article className="ote-general-artifact is-note"><h3>{question.title}</h3><p>{question.text}</p></article>;
  if (question.type === "advert" || question.type === "notice") return <article className={`ote-general-artifact is-${question.type}`}><h3>{question.title}</h3><p>{question.text}</p></article>;
  return <article className={`ote-general-artifact is-web is-${question.type}`}><header><i /><i /><i /><span>{question.publication}</span></header><div><p className="ote-general-artifact-label">{question.label}</p><h3>{question.title}</h3><p>{question.text}</p></div></article>;
}

function CompleteCard({ score, questions, answers, setTitle, onBack, onRetry }) {
  return <section className="ote-practice-complete ote-reading-native-complete"><CheckCircle2 size={38} aria-hidden="true" /><div><p className="ote-kicker">{setTitle} complete</p><h2>{score} / 6</h2><p>{score === 6 ? "Excellent work. Every answer was correct." : "Your answers and explanations are below."}</p><div className="ote-reading-review-list">{questions.map((item, index) => <article className={answers[item.id] === item.answer ? "is-correct" : "is-wrong"} key={item.id}><div><strong>{index + 1}. {item.title}</strong><span>{answers[item.id] === item.answer ? "Correct" : "Review"}</span></div><p><b>Answer:</b> {String.fromCharCode(65 + item.answer)}. {item.options[item.answer]}</p><p>{item.feedback}</p></article>)}</div><div className="ote-complete-actions"><button type="button" onClick={onBack}>Back to Part 1</button><button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button></div></div></section>;
}

function Unavailable({ onBack }) {
  return <main className="ote-training-page"><button className="ote-training-back" type="button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to reading</button><header className="ote-training-hero"><p className="ote-kicker">General Reading Part 1</p><h1>Practice not available</h1><p>This timed set is available in the General OTE workspace.</p></header></main>;
}
