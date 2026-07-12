import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, Clock3, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const TIME_SECONDS = 8 * 60;
const tasks = {
  "b2-reading-together": {
    title: "Reading Together in Silence",
    heading: "Reading together in silence",
    paragraphs: [
      "Book clubs usually involve lively discussion, but a newer kind of group asks members to do something much quieter. At a silent reading club, people meet in a café, library or park, talk briefly, and then spend an hour reading their own books. The idea has become increasingly popular in cities where many adults say they struggle to concentrate at home.",
      "I went to one meeting expecting it to feel slightly unnecessary. After all, reading is an activity people can easily do alone. Yet I soon understood the attraction. At home, I often interrupt myself to check messages, make tea or complete a small job that suddenly seems urgent. In the club, everyone had made the same decision to read, and leaving my chair to look at my phone would have felt strangely rude. Nobody was watching me, but the presence of other readers made it easier to remain focused.",
      "The organiser, Priya Shah, says the club is not intended to replace traditional book groups. ‘Some people love analysing a novel together,’ she explains. ‘Others just need a reason to protect an hour from everything else.’ Members bring anything they want, from crime fiction to history books, and no one has to describe or defend their choice. This freedom is important because many readers have negative memories of being told at school which books were worthwhile.",
      "There is still a social element. Conversations before and after the reading period are relaxed because everyone already shares an interest, but nobody is under pressure to be entertaining. One member told me that ordinary social events often leave her exhausted because she worries about keeping conversations going. Here, silence is not an awkward gap but the main activity.",
      "Of course, joining a group is not the only way to improve concentration. People can switch off notifications or choose a regular reading time at home. But such plans are easy to abandon when nobody else knows about them. The club’s real value may lie less in silence itself than in a shared commitment. Reading remains private, but the decision to make time for it becomes public.",
    ],
    questions: [
      { prompt: "Why have silent reading clubs become popular?", options: ["Many people want help concentrating on reading.", "Traditional book groups have become too serious.", "Readers prefer meeting outside their own homes."], answer: 0, feedback: "The first paragraph says the clubs are popular among adults who find it difficult to concentrate at home. Their meeting places are incidental, not the reason for their popularity." },
      { prompt: "What did the writer discover during the meeting?", options: ["Other members expected her to avoid using her phone.", "Reading beside other people helped her control distractions.", "She concentrated because she was interested in the group’s books."], answer: 1, feedback: "The presence of other readers helped the writer resist checking her phone and remain focused. Nobody directly monitored or instructed her." },
      { prompt: "What does ‘This freedom’ refer to in the third paragraph?", options: ["Being able to read without discussing the book afterwards", "Being allowed to choose any kind of book without explaining why", "Being able to decide whether to join a traditional book group"], answer: 1, feedback: "Members may bring any book and are not required to justify their choice. This is the specific freedom referred to in the previous sentence." },
      { prompt: "What is the writer’s main conclusion about silent reading clubs?", options: ["Their social atmosphere is more important than the reading itself.", "Their effectiveness comes partly from making a private intention public.", "They provide a better solution to distraction than changing habits at home."], answer: 1, feedback: "The shared commitment may matter more than the silence. Publicly setting aside the time makes the plan harder to abandon, although home-based methods can also work." },
    ],
  },
  "b2-holiday-time": {
    title: "Why Holidays Seem to Change Speed",
    heading: "Why holidays seem to change speed",
    paragraphs: [
      "A week at work can disappear before we notice it, while the first two days in an unfamiliar place may feel surprisingly long. Then, just as we learn the streets and settle into a routine, the holiday seems to speed up. This difference is caused by the way attention and memory shape our experience of time.",
      "Psychologist Dr Lena Ortiz explains that new situations demand more mental effort. In an unfamiliar town, we notice signs, buildings and decisions about where to go. A normal journey to work contains fewer surprises, so the brain pays less attention. While it is happening, an unfamiliar day can feel slow. Later, however, the memories created can make the same period seem rich and extensive.",
      "This explains an apparent contradiction. People often say that an enjoyable holiday passed quickly, yet when they look back, it seems to occupy a large space in their memory. By contrast, a routine month may feel long while we are living through it but leave few distinct memories afterwards. We judge time differently depending on whether we are experiencing it or remembering it.",
      "Travel can also produce the ‘return journey effect’. The trip home often seems shorter than the outward journey, even when the distance and traffic are identical. Ortiz says this may happen because the first journey gives us an inaccurate expectation of how long the route should take. On the return trip, the surroundings are more familiar and our estimate is corrected. It is not simply that excitement makes the outward journey feel longer.",
      "Some travel companies use this research to recommend filling every day with new activities. That may create more memories, but it can also turn a holiday into an exhausting list of tasks. Novelty is useful only when we have enough attention to experience it. A different walk or conversation may be more memorable than rushing between famous sights.",
      "We cannot make a holiday last longer, but we can affect how fully it is experienced and remembered. The answer is not constant entertainment. It is to introduce enough variety to remain attentive while leaving enough space to notice what is happening.",
    ],
    questions: [
      { prompt: "According to Dr Ortiz, unfamiliar experiences may seem longer because …", options: ["people make a greater effort to remember them.", "the brain pays closer attention to what is happening.", "people have to make more important decisions than usual."], answer: 1, feedback: "New surroundings contain more information, so the brain pays greater attention to signs, buildings and decisions. This is attention during the experience, not a deliberate attempt to remember." },
      { prompt: "What is the ‘apparent contradiction’ mentioned in the third paragraph?", options: ["A holiday can feel brief at the time but substantial in memory.", "Enjoyable experiences can create fewer memories than ordinary ones.", "Routine periods seem shorter even though they contain more activity."], answer: 0, feedback: "An enjoyable holiday may appear to pass quickly while it is happening but later seem long because it has produced many distinct memories." },
      { prompt: "Why may the return journey seem shorter?", options: ["Travellers are less excited and therefore judge time more accurately.", "The outward journey usually involves less familiar roads and heavier traffic.", "Experience of the outward journey changes expectations about the route."], answer: 2, feedback: "The outward journey provides information about the route’s duration, making expectations more accurate on the way back. Excitement is explicitly rejected as the explanation." },
      { prompt: "What does the writer recommend for making a holiday memorable?", options: ["Include variety without trying to fill every available moment.", "Concentrate on unfamiliar experiences rather than famous attractions.", "Plan enough activities to prevent the holiday becoming routine."], answer: 0, feedback: "The writer recommends enough novelty to maintain attention while leaving enough free space to experience it fully." },
    ],
  },
  "a2-new-dog": {
    title: "Our New Dog",
    heading: "Our new dog",
    paragraphs: [
      "When my daughter Lily asked for a dog, I said no at first. We live in a small flat, and I was worried that a dog would be unhappy there. But Lily did not give up, so we visited a local animal centre. A worker showed us several dogs and explained what each one needed.",
      "We met Max, a small brown dog who was five years old. He was quiet and friendly, and he did not need a large garden. The worker told us that Max had lived with an older man before, so he was used to a calm home. This made me think he might be right for us.",
      "The first week was not easy. Max was nervous and did not eat much. He also cried at night. Lily wanted to sleep beside him, but the worker said it was better to give him time to get used to his new home. After a few days, Max began to relax.",
      "Now he follows Lily everywhere and waits by the door when she comes home. We take him for three short walks every day. Having a dog means more work, especially when it rains, but it has changed our routine in a good way. We spend more time outside and talk to more people nearby.",
      "I am glad we chose an older dog. Max was already calm and knew how to behave indoors.",
    ],
    questions: [
      { prompt: "Why did the writer say no to getting a dog at first?", options: ["She thought a dog might not like living in their flat.", "She did not think Lily would look after a dog.", "She wanted to wait until they had a garden."], answer: 0, feedback: "The writer worries that a dog would be unhappy in their small flat. She does not question Lily’s care or say they must wait for a garden." },
      { prompt: "What does ‘This’ refer to in the second paragraph?", options: ["Max being a small and friendly dog", "Max being used to living in a quiet home", "Max not needing to spend time outside"], answer: 1, feedback: "‘This’ refers to the information that Max had previously lived with an older man and was familiar with a calm home." },
      { prompt: "Why did the worker tell Lily not to sleep beside Max?", options: ["Max needed time to feel comfortable in the flat.", "Max was likely to wake her during the night.", "Max had to learn to sleep in a different room."], answer: 0, feedback: "The worker believes Max needs time to become comfortable in his new surroundings." },
      { prompt: "What does the writer say about having Max?", options: ["It is easier than she expected.", "It has helped the family meet more people.", "It has made Lily spend less time at home."], answer: 1, feedback: "The family spends more time outside and speaks to more people in the neighbourhood." },
    ],
  },
  "a2-useful-things": {
    title: "A Library of Useful Things",
    heading: "A library of useful things",
    paragraphs: [
      "Most libraries lend books, but the West Park Library also lends useful objects. People can borrow tools, games, camping equipment and small kitchen machines. The service started last year after local people said they did not want to buy things they would use only once or twice.",
      "To borrow an object, members choose it on the library website and collect it the next day. Most things can be kept for one week. The service is free, but members must return everything clean and in good condition. If an object is late, another person may have to wait for it.",
      "The most popular item is a machine for cleaning carpets. Many people need one for only a few hours, so buying their own would be expensive. Tents and board games are also borrowed a lot, especially during school holidays.",
      "The library checks every object when it comes back. This is important because broken tools or machines can be dangerous. Staff also show members how to use some items safely. They cannot repair everything, so people are asked to report any problem instead of trying to fix it themselves.",
      "The service helps families save money and means fewer objects are thrown away. It also gives people a chance to try something before deciding whether to buy it. The library hopes to add bicycles next year, but first it needs more space to keep them.",
    ],
    questions: [
      { prompt: "Why did the library begin lending objects?", options: ["Local people wanted to borrow things they rarely needed.", "The library wanted more people to use its website.", "Families had asked for cheaper camping equipment."], answer: 0, feedback: "The service began because people did not want to buy objects they would use only once or twice. Camping equipment is only one type of object available." },
      { prompt: "What does ‘it’ refer to at the end of the second paragraph?", options: ["the library service", "the borrowed object", "the library website"], answer: 1, feedback: "Another member may have to wait for the object that has been returned late." },
      { prompt: "Why does the library check returned objects?", options: ["To make sure they are safe to use", "To decide how long members can keep them", "To find out whether members have cleaned them"], answer: 0, feedback: "Broken tools and machines may be dangerous, so the library checks them before they are lent again. Safety is the stated reason." },
      { prompt: "Why can members not borrow bicycles yet?", options: ["The library cannot repair them.", "The library does not have enough room.", "The library has not found a safe place to use them."], answer: 1, feedback: "The library needs additional storage space before it can add bicycles." },
    ],
  },
  "b1-second-life": {
    title: "Giving Old Bicycles a Second Life",
    heading: "Giving old bicycles a second life",
    paragraphs: [
      "When Rosa Martinez left school, she trained as a bicycle mechanic and found work in a sports shop. She enjoyed repairing bikes, but most of her time was spent assembling new ones. Customers often brought in older bicycles and were told that fixing them would cost more than replacing them. Rosa disliked seeing useful machines thrown away, so she began repairing a few in her garage.",
      "At first, she planned to sell the finished bikes online. Then a youth centre asked whether she could teach some teenagers basic repair skills. Rosa agreed, although she had never taught before. The first session was chaotic: tools went missing, tyres were fitted incorrectly, and nobody finished on time. Even so, the students wanted to return the following week. Rosa realised that their interest mattered more than completing every repair perfectly.",
      "A year later, she opened a workshop called Second Spin. People donate unwanted bicycles, and young volunteers help repair them. Some bikes are sold cheaply, while others are given to people who need transport for work or college. The income from sales pays for tools and parts.",
      "Running the workshop is not always easy. Rosa has to apply for funding, organise volunteers and explain why an old bicycle is worth saving. However, she says these tasks have changed the way she thinks about her job. ‘I used to believe a mechanic’s work ended when the bike was fixed,’ she says. ‘Now I know the real aim is helping someone use it again.’",
      "Rosa hopes to move into a larger building next year, but she does not want Second Spin to become an ordinary bike shop. For her, success means repairing more bicycles without losing the welcoming atmosphere that made the project useful.",
    ],
    questions: [
      { prompt: "Why did Rosa begin repairing bicycles in her garage?", options: ["She wanted to practise before applying for another job.", "She was unhappy that repairable bicycles were being discarded.", "She hoped to earn additional money by selling bicycles online."], answer: 1, feedback: "Rosa disliked seeing useful bicycles thrown away and began repairing them herself. Selling them was her original plan for the finished bikes, not her main reason for starting." },
      { prompt: "What did Rosa learn from her first teaching session?", options: ["The students valued taking part even when the results were imperfect.", "The students needed to understand how to use the tools safely.", "The students already had more repair experience than she expected."], answer: 0, feedback: "Although the session was disorganised and repairs were unfinished, the teenagers wanted to return. Rosa recognised that participation and interest mattered more than perfect results." },
      { prompt: "How does Second Spin pay for some of its equipment?", options: ["It charges volunteers for repair lessons.", "It receives regular payments from the youth centre.", "It sells some of the bicycles that volunteers repair."], answer: 2, feedback: "Some repaired bicycles are sold, and that income pays for tools and replacement parts." },
      { prompt: "What is suggested about Rosa’s plans for Second Spin?", options: ["She wants it to grow without losing its original character.", "She hopes it will eventually compete with ordinary bicycle shops.", "She thinks moving buildings will solve its financial problems."], answer: 0, feedback: "Rosa wants a larger workshop and more repairs, but she does not want the project to become an ordinary shop or lose its welcoming atmosphere." },
    ],
  },
  "b1-city-trees": {
    title: "Why City Trees Matter",
    heading: "Why city trees matter",
    paragraphs: [
      "For many years, city trees were treated mainly as decoration. They made streets look more attractive, but were not always considered essential. This attitude is changing as researchers discover that trees can affect temperature, air quality and even the way people use public spaces.",
      "One of their clearest benefits is shade. During a summer study, researchers placed temperature sensors on streets with and without trees. They found that shaded pavements were much cooler in the afternoon. Buildings beside them also needed less energy for air conditioning. The difference was greatest in areas with wide branches and several trees growing close together.",
      "Trees may influence people’s behaviour as well. In neighbourhoods with pleasant green streets, residents often spend more time outdoors and meet their neighbours more frequently. Children may be more likely to walk to school if the route feels cooler and safer. This does not mean that planting a few trees will solve every social problem, but good public spaces can make contact between people easier.",
      "However, city planting requires careful planning. Some species need large amounts of water, while others have roots that can damage pavements. Young trees must be protected and watered for several years before they provide much shade. A city may proudly announce that it has planted thousands of trees, but the number that survive is more important than the number put into the ground.",
      "Urban planner Mei Tan says local knowledge is essential. ‘A tree that grows well in one city may fail in another,’ she explains. ‘You have to consider the climate, the available space and who will care for it.’ In her view, the best projects do not simply add trees. They choose the right trees and make long-term plans to keep them healthy.",
    ],
    questions: [
      { prompt: "What does the writer say about changing attitudes towards city trees?", options: ["People are becoming more interested in how attractive they look.", "They are increasingly recognised as having practical benefits.", "Researchers now consider them more useful than city buildings."], answer: 1, feedback: "Trees were once regarded mainly as decoration but are now valued for effects on temperature, air quality and public spaces." },
      { prompt: "Why did researchers put sensors on different streets?", options: ["To discover which time of day was the hottest", "To find out how close together trees should be planted", "To compare temperatures in shaded and unshaded places"], answer: 2, feedback: "The sensors were placed on streets both with and without trees so researchers could compare their temperatures." },
      { prompt: "What is the main point of the third paragraph?", options: ["Green streets can encourage people to spend time outside together.", "Trees make neighbourhoods safe enough for children to walk alone.", "Residents prefer meeting outdoors when the weather is warm."], answer: 0, feedback: "The paragraph explains that green streets may encourage residents to go outside, meet neighbours and walk more." },
      { prompt: "According to Mei Tan, a successful tree-planting project must …", options: ["use trees that have already grown successfully in other cities.", "plant enough trees to replace those that may not survive.", "choose suitable trees and arrange for their future care."], answer: 2, feedback: "Mei Tan emphasises local climate, available space and responsibility for long-term care." },
    ],
  },
};

const formatTime = (seconds) => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, "0")}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;

export default function OteGeneralReadingPart4Practice({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { setId = "b2-reading-together" } = useParams();
  const task = tasks[setId] || tasks["b2-reading-together"];
  const level = setId.startsWith("a2-") ? "A2" : setId.startsWith("b1-") ? "B1" : "B2";
  const menuPath = getSitePath(nativeRoutes ? "/reading/general/part-4-long-text" : "/ote/reading/general/part-4-long-text");
  const [phase, setPhase] = useState("ready");
  const [answers, setAnswers] = useState({});
  const [expanded, setExpanded] = useState(task.questions[0].prompt);
  const [secondsLeft, setSecondsLeft] = useState(TIME_SECONDS);
  const logged = useRef(false);
  const count = Object.keys(answers).length;
  const score = useMemo(() => task.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0), [answers, task.questions]);

  useEffect(() => {
    if (user?.oteVersion === "advanced" || phase !== "active") return undefined;
    if (secondsLeft <= 0) { check("time"); return undefined; }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, secondsLeft, user?.oteVersion]);

  function record(reason) {
    if (logged.current) return;
    logged.current = true;
    logOteTrainingCompleted({ section: "reading", part: "part-4", mode: "timed_practice", taskId: `general-reading-part-4-${setId}`, taskTitle: `General Reading Part 4 ${task.title}`, variant: "general", score, total: 4, reason });
  }

  function start() {
    logged.current = false; setAnswers({}); setExpanded(task.questions[0].prompt); setSecondsLeft(TIME_SECONDS); setPhase("active");
    logOteTrainingStarted({ section: "reading", part: "part-4", mode: "timed_practice", taskId: `general-reading-part-4-${setId}`, taskTitle: `General Reading Part 4 ${task.title}`, variant: "general" });
  }

  function check(reason = "checked") { setPhase("review"); record(reason); }

  if (user?.oteVersion === "advanced") return <Unavailable onBack={() => navigate(getSitePath(nativeRoutes ? "/reading" : "/ote/reading"))} />;

  return <main className="ote-training-page ote-reading-practice-page ote-reading-matching-page"><Seo title="OTE General Reading Part 4 Timed Practice | Seif English" description="Timed OTE General Reading Part 4 long-text practice." /><button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} /> Back to Part 4</button><header className="ote-training-hero"><p className="ote-kicker">General Reading Part 4 · {level}</p><h1>{task.title}</h1><p>Read the passage and choose the correct answer for each question.</p></header>{phase === "active" ? <div className="ote-writing-floating-timer"><Clock3 size={20} /><strong>{formatTime(secondsLeft)}</strong><span>Long text</span></div> : null}<section className="ote-practice-runner"><div className="ote-practice-progress"><div><span>{phase === "complete" ? "Complete" : phase === "review" ? "Answers checked" : `${count} of 4 answered`}</span><strong>{phase === "active" ? "8 minutes for the full task" : `${score} / 4 correct`}</strong></div><div className="ote-practice-progress-bar"><span style={{ width: `${phase === "active" ? (count / 4) * 100 : 100}%` }} /></div></div>{phase === "ready" ? <Ready onStart={start} user={user} /> : phase === "complete" ? <Complete task={task} answers={answers} score={score} onRetry={start} onBack={() => navigate(menuPath)} /> : <article className="ote-practice-task-card ote-reading-matching-task"><div className="ote-reading-matching-layout"><div className="ote-reading-match-list">{task.questions.map((question, index) => { const open = expanded === question.prompt; const correct = answers[index] === question.answer; return <article className={`ote-reading-match-item ${open ? "is-open" : ""} ${phase === "review" ? (correct ? "is-correct" : "is-wrong") : ""}`} key={question.prompt}><button className="ote-reading-match-toggle" type="button" onClick={() => setExpanded(open ? "" : question.prompt)}><span>{index + 1}. {question.prompt}</span><ChevronDown size={22} /></button>{open ? <div className="ote-reading-match-options">{question.options.map((option, optionIndex) => <button key={option} type="button" disabled={phase === "review"} className={`${answers[index] === optionIndex ? "is-selected" : ""} ${phase === "review" && optionIndex === question.answer ? "is-answer" : ""} ${phase === "review" && answers[index] === optionIndex && !correct ? "is-incorrect" : ""}`} onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}>{String.fromCharCode(65 + optionIndex)}. {option}</button>)}{phase === "review" ? <div className={`ote-reading-item-feedback ${correct ? "is-correct" : "is-wrong"}`}><strong>{correct ? "Correct." : "Review this answer."}</strong><p>{question.feedback}</p></div> : null}</div> : null}</article>; })}</div><article className="ote-reading-matching-source ote-reading-long-source"><header><p className="ote-kicker">Passage</p><h3>{task.heading}</h3></header>{task.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></div><div className="ote-recorder-actions">{phase === "review" ? <button type="button" onClick={() => setPhase("complete")}>View final report</button> : <button type="button" disabled={count !== 4} onClick={() => check()}>Check answers</button>}</div></article>}</section></main>;
}

function Ready({ user, onStart }) { return <article className="ote-practice-task-card ote-reading-ready-card"><div className="ote-recorder-top"><div><p className="ote-kicker">Ready to start</p><h2>Timed long-text set</h2></div><div className="ote-recorder-timer is-ready"><Clock3 size={22} /><strong>08:00</strong><span>Full task</span></div></div><div className="ote-training-rule-grid"><article><h3>Four questions</h3><p>Read one passage and choose the best answer each time.</p></article><article><h3>One full timer</h3><p>You have eight minutes for the complete task.</p></article><article><h3>Review after checking</h3><p>Check all answers together before reviewing feedback.</p></article></div>{!user ? <p className="ote-warning">Sign in to save this completed practice set to your progress.</p> : null}<div className="ote-recorder-actions"><button type="button" onClick={onStart}><Clock3 size={18} /> Start timed practice</button></div></article>; }
function Complete({ task, answers, score, onRetry, onBack }) { return <section className="ote-practice-complete ote-reading-native-complete"><CheckCircle2 size={38} /><div><p className="ote-kicker">{task.title} complete</p><h2>{score} / 4</h2><p>{score === 4 ? "Excellent work. Every answer was correct." : "Review the questions and explanations below."}</p><div className="ote-reading-review-list">{task.questions.map((question, index) => <article className={answers[index] === question.answer ? "is-correct" : "is-wrong"} key={question.prompt}><div><strong>{index + 1}. {question.prompt}</strong><span>{answers[index] === question.answer ? "Correct" : "Review"}</span></div><p><b>Answer:</b> {String.fromCharCode(65 + question.answer)}. {question.options[question.answer]}</p><p>{question.feedback}</p></article>)}</div><div className="ote-complete-actions"><button type="button" onClick={onBack}>Back to Part 4</button><button type="button" onClick={onRetry}><RotateCcw size={18} /> Try again</button></div></div></section>; }
function Unavailable({ onBack }) { return <main className="ote-training-page"><button className="ote-training-back" type="button" onClick={onBack}><ArrowLeft size={18} /> Back to reading</button><header className="ote-training-hero"><p className="ote-kicker">General Reading Part 4</p><h1>Practice not available</h1><p>This timed set is available in the General OTE workspace.</p></header></main>; }

export { tasks as generalReadingPart4PracticeSets };
