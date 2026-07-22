import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, GripVertical, RotateCcw, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const TIME_SECONDS = 11 * 60;
const sentences = {
  A: "Active choice appears to require travellers to compare possibilities and connect what they see with an emerging understanding of the area.",
  B: "A dead battery, loss of signal or unexpected road closure can leave an otherwise confident traveller unable to continue independently.",
  C: "The sensible response is therefore not to reject digital guidance, but to think more carefully about the kind of dependence it creates.",
  D: "Professional drivers may also use route-planning systems to reduce fuel consumption and avoid delays caused by heavy traffic.",
  E: "Digital guidance, by contrast, can divide the same journey into isolated actions without revealing the overall geographical pattern.",
  F: "Just as muscles develop through manageable resistance, certain mental abilities may depend on having to make some effort.",
  G: "When this pattern is repeated at scale, route-selection algorithms effectively participate in shaping the economic and social life of a place.",
};
const answers = { 1: "E", 2: "B", 3: "A", 4: "F", 5: "G", 6: "C" };
const rationales = {
  1: "This contrasts the whole-route view provided by traditional maps with turn-by-turn guidance, before the text explains the consequence of seeing only the next turn.",
  2: "This supplies concrete examples of guidance disappearing, which the next sentence refers to as 'such moments'.",
  3: "This explains why making route decisions strengthens a cognitive map: it requires comparison and connection rather than passive following.",
  4: "This analogy introduces the idea of productive mental effort, which the next sentence applies directly.",
  5: "This draws the wider conclusion from repeated route recommendations before the text moves to their collective effects on neighbourhoods.",
  6: "This provides the balanced conclusion after rejecting both total dependence on apps and a return to paper maps.",
};
const additionalTasks = {
  "c1-pilot-2": {
    title: "Why We Keep Souvenirs", heading: "Why we keep souvenirs",
    sentences: { A: "The act of selecting a future reminder can therefore alter how a person attends to the present moment.", B: "It is possible to recognise this loss as symbolic without believing that the memory itself will actually vanish.", C: "Objects help by supplying sensory and contextual clues from which a wider scene can be rebuilt.", D: "Museums perform a similar function by preserving objects that communities consider historically important.", E: "Nevertheless, commercial origin does not prevent an object from acquiring intensely personal significance.", F: "An object may evoke an entire relationship for one person because of circumstances that are invisible to everyone else.", G: "When almost every moment leaves a record, finding the few traces that still carry meaning becomes increasingly difficult." },
    answers: { 1: "C", 2: "F", 3: "A", 4: "E", 5: "B", 6: "G" },
    rationales: { 1: "This explains how objects prompt reconstructed memories before the text gives examples involving smell, texture and sight.", 2: "This develops the owner's private relationship with an object before the contrast with somebody else follows.", 3: "This states how choosing a future reminder can change attention in the present, leading into the future self who will look back.", 4: "This concedes that commercial production does not prevent personal meaning before the magnet example makes that point concrete.", 5: "This separates the symbolic feeling of loss from the literal disappearance of memory.", 6: "This identifies the problem created by abundant digital records before the physical-versus-digital contrast follows." },
    paragraphs: [
      "A souvenir is an object kept because it is connected with a place, person or event. It may be expensive, but often it is not: a train ticket, a shell or a receipt can matter more than something deliberately bought as a keepsake. Indeed, the accidental keepsake and the object sold specifically to tourists may eventually perform much the same psychological function. Such objects appear trivial until we try to throw them away. Their value lies less in what they are than in what they allow us to recover.",
      ["Memory does not operate like a complete recording stored in the mind. We reconstruct past experiences from fragments, and physical objects can provide unusually effective prompts. ", 1, " The smell of an old book, the texture of a worn ticket or the sight of a hotel key may restore details that seemed to have disappeared. This is one reason apparently ordinary objects can become emotionally irreplaceable."],
      ["Yet the object does not contain the memory in any literal sense. Its meaning depends on the relationship between the owner and the event it represents. ", 2, " To somebody else, the same object may be worthless or even incomprehensible. The emotional value of a souvenir is therefore private, although the kinds of things people preserve are influenced by shared customs."],
      ["Souvenirs do not merely record experiences after they happen; they can also shape the experience while it is taking place. Travellers sometimes choose, photograph or carefully protect an object because they already imagine remembering the journey through it later. ", 3, " The present is partly organised for the benefit of a future self who will look back on it. This can deepen attention, but it can also make people observe an experience as though they were already outside it."],
      ["The souvenir industry depends on this desire to carry something home. Its products are often criticised for being standardised and disconnected from the places they claim to represent. A miniature landmark may have been manufactured thousands of kilometres away, while identical objects appear in shops across the world. ", 4, " A mass-produced magnet can acquire a unique history once it has been chosen during a particular journey and placed among the objects of a particular household."],
      ["The problem becomes more obvious when possessions accumulate. A single ticket may recall an important friendship; several boxes of unsorted papers may produce only guilt. People who attempt to reduce clutter often discover that discarding an object feels uncomfortably similar to discarding the person or period associated with it. ", 5, " This explains why advice to photograph an object before giving it away works for some people but not for others. The image preserves information, but not necessarily the object's physical role in memory."],
      ["Digital technology has greatly expanded what can function as a souvenir. Messages, location histories and thousands of photographs preserve traces of everyday life that previous generations would have lost. Their abundance, however, creates a new problem. Digital storage encourages preservation without selection, since keeping another photograph costs almost nothing and requires no visible shelf space. ", 6, " A physical object occupies space and may repeatedly attract attention; a digital record can remain perfectly preserved while becoming practically invisible."],
      "Perhaps the most useful way to think about souvenirs is neither as sacred containers of the past nor as meaningless clutter. They are tools through which people organise memory and identity. Some deserve to be kept, some can be released, and their importance may change over time. What matters is not preserving everything, but understanding why particular objects continue to connect us with experiences we still wish to carry.",
    ],
  },
  "c1-pilot-3": {
    title: "The Value of Being Bored", heading: "The value of being bored",
    sentences: { A: "It is important, however, to distinguish temporary boredom from the chronic powerlessness of having no meaningful choices.", B: "The unoccupied intervals in which attention once wandered are increasingly filled before discomfort can fully develop.", C: "The aim is not to seek boredom as an achievement, but to become less frightened of moments offering no instant reward.", D: "Some workplaces have introduced creativity rooms filled with games, coloured furniture and walls on which employees can write.", E: "Boredom may therefore be less an absence of attention than a demand for a more satisfying object of attention.", F: "If every loss of interest is immediately answered with stimulation, people may get little practice in directing attention for themselves.", G: "The repetitive activity may simply create a mental gap in which thoughts that were previously unrelated have room to combine." },
    answers: { 1: "E", 2: "B", 3: "G", 4: "A", 5: "F", 6: "C" },
    rationales: { 1: "This reformulates boredom as a demand for a more satisfying focus before the broader interpretation begins.", 2: "This explains how smartphones fill previously empty intervals before the text considers what unfilled moments allow the mind to do.", 3: "This cautiously explains why a repetitive task might help unrelated ideas combine; the next sentence refers back to that mental gap.", 4: "This sets up the contrast between limited, temporary boredom and long-term lack of control illustrated by the traveller and worker.", 5: "This explains how constant novelty can reduce practice in directing attention before the text qualifies that enduring dullness is not the solution.", 6: "This clarifies that leaving moments unfilled is not about celebrating boredom, but tolerating a lack of instant reward." },
    paragraphs: [
      "Boredom has a poor reputation. It is associated with wasted time, dull company and tasks that ought to have been designed better. Modern life offers countless ways to escape it: a phone can fill a queue, a journey or the few minutes before a meeting. This seems like straightforward progress. Yet boredom is not merely an unpleasant space from which nothing useful can emerge. It is also a signal about attention, motivation and the relationship between what we are doing and what we believe we could be doing instead.",
      ["People often describe boredom as having nothing to do, but the experience is more complicated. A person may be surrounded by possible activities and still find none of them worth beginning. They want to engage, yet cannot attach their attention to the options available. ", 1, " Seen this way, boredom is not simply emptiness. It is an uncomfortable awareness that our present activity lacks meaning, challenge or connection with our goals."],
      ["For much of history, minor periods of boredom were difficult to avoid. People waited for transport, stood in queues and performed repetitive household tasks without carrying a portable source of entertainment. Smartphones have not removed waiting, but they have changed its psychological character. ", 2, " This matters because the mind behaves differently when it is not continuously supplied with a ready-made focus. It may revisit an unfinished problem, recall a neglected intention or notice details in the surrounding environment."],
      ["This possibility has encouraged claims that boredom makes people creative. Some experiments support a modest version of the idea. Participants asked to complete a repetitive task sometimes perform more imaginatively on a later exercise than participants who began immediately. The result is often presented as though dullness itself produces originality. ", 3, " That gap gives the mind an opportunity to move away from the obvious use of an object or the first solution to a problem. Even so, laboratory tasks do not prove that prolonged boredom will turn anyone into an inventor."],
      ["There are also reasons to be cautious about praising boredom. A short period of under-stimulation chosen during a safe afternoon is very different from months of repetitive work, unemployment or social isolation. ", 4, " A traveller whose train is delayed may eventually enjoy watching the crowd; a worker given no control, variety or prospect of change may experience boredom as evidence that their time is not valued. The second condition is not a useful exercise in creativity but a form of deprivation."],
      ["Education presents a related dilemma. Teachers cannot make every topic immediately exciting, and students need to develop the ability to remain with material that reveals its value slowly. At the same time, a lesson that repeatedly fails to involve learners should not be defended merely because concentration is virtuous. Digital resources can help, but they can also create an expectation that each moment must contain novelty, rapid feedback or visual stimulation. ", 5, " But simply forcing students to endure dull tasks is unlikely to teach this skill. Attention develops when learners have some responsibility for questions, methods and outcomes."],
      ["A healthier response to boredom may therefore involve neither constant escape nor deliberate suffering. People can leave some routine moments unfilled, allow a walk to take place without headphones or postpone checking a phone the instant a conversation pauses. ", 6, " These small practices preserve the possibility that attention will find its own direction. Sometimes nothing important will happen, and the experience will merely be boring. On other occasions, an idea, memory or observation may appear precisely because there was no competing demand prepared to replace the silence."],
      "Boredom is unlikely to become desirable, and perhaps it should not. Its discomfort tells us something about what we need from an activity and can motivate us to change direction. The danger lies in treating the feeling either as an emergency that must always be eliminated or as a moral test that people should simply endure. Properly understood, boredom is information. What we do with that information depends on whether we have the freedom, patience and imagination to respond.",
    ],
  },
};

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function OteAdvancedReadingPart3Practice({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { setId = "c1-pilot-1" } = useParams();
  const additionalTask = additionalTasks[setId];
  const activeSentences = additionalTask?.sentences || sentences;
  const activeAnswers = additionalTask?.answers || answers;
  const activeRationales = additionalTask?.rationales || rationales;
  const taskTitle = additionalTask?.title || "The Case for Getting Slightly Lost";
  const taskHeading = additionalTask?.heading || "The case for getting slightly lost";
  const menuPath = getSitePath(nativeRoutes ? "/reading/advanced/part-3-gapped-text" : "/ote/reading/advanced/part-3-gapped-text");
  const [phase, setPhase] = useState("ready");
  const [placements, setPlacements] = useState({});
  const [selectedSentence, setSelectedSentence] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TIME_SECONDS);
  const completionLogged = useRef(false);
  const completionPromise = useRef(null);
  const placedCount = Object.keys(placements).length;
  const score = useMemo(() => Object.entries(activeAnswers).reduce((total, [gap, answer]) => total + (placements[gap] === answer ? 1 : 0), 0), [activeAnswers, placements]);
  const available = Object.keys(activeSentences).filter((id) => !Object.values(placements).includes(id));

  useEffect(() => {
    if (user?.oteVersion && user.oteVersion !== "advanced") return undefined;
    if (phase !== "active") return undefined;
    if (secondsLeft <= 0) {
      checkAnswers("time");
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, secondsLeft, user?.oteVersion]);

  function startPractice() {
    completionLogged.current = false;
    completionPromise.current = null;
    setPlacements({});
    setSelectedSentence("");
    setSecondsLeft(TIME_SECONDS);
    setPhase("active");
    logOteTrainingStarted({ section: "reading", part: "part-3", mode: "timed_practice", taskId: `advanced-reading-part-3-${setId}`, taskTitle: `Advanced Reading Part 3 ${taskTitle}`, variant: "advanced" });
  }

  function placeSentence(gap, sentenceId) {
    if (phase !== "active" || !sentenceId) return;
    setPlacements((current) => ({ ...current, [gap]: sentenceId }));
    setSelectedSentence("");
  }

  function clearGap(gap) {
    if (phase !== "active") return;
    setPlacements((current) => {
      const next = { ...current };
      delete next[gap];
      return next;
    });
  }

  function recordCompletion(reason) {
    if (completionLogged.current) return Promise.resolve(true);
    if (completionPromise.current) return completionPromise.current;
    completionPromise.current = logOteTrainingCompleted({ section: "reading", part: "part-3", mode: "timed_practice", taskId: `advanced-reading-part-3-${setId}`, taskTitle: `Advanced Reading Part 3 ${taskTitle}`, variant: "advanced", score, total: 6, reason })
      .then(() => {
        completionLogged.current = true;
        return true;
      })
      .catch((error) => {
        console.warn("[OTE Reading Part 3] completion save failed", error);
        return false;
      })
      .finally(() => {
        completionPromise.current = null;
      });
    return completionPromise.current;
  }

  function checkAnswers(reason = "checked") {
    const completionReason = typeof reason === "string" ? reason : "checked";
    setPhase("review");
    recordCompletion(completionReason);
  }

  async function finishPractice(reason = "manual") {
    setPhase("complete");
    const saved = await recordCompletion(reason);
    if (!saved) void recordCompletion(reason);
  }

  if (user?.oteVersion && user.oteVersion !== "advanced") return <Unavailable onBack={() => navigate(getSitePath(nativeRoutes ? "/reading" : "/ote/reading"))} />;

  return <main className="ote-training-page ote-reading-practice-page ote-reading-gapped-page">
    <Seo title="OTE Advanced Reading Part 3 Timed Practice | Seif English" description="Timed Advanced OTE Reading Part 3 gapped-text practice." />
    <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 3</button>
    <header className="ote-training-hero"><p className="ote-kicker">Advanced Reading Part 3</p><h1>{taskTitle}</h1><p>Insert the six missing sentences into the text. One sentence is extra.</p></header>
    {phase === "active" ? <div className="ote-writing-floating-timer" aria-live="polite"><Clock3 size={20} aria-hidden="true" /><strong>{formatTime(secondsLeft)}</strong><span>Gapped text</span></div> : null}
    <section className="ote-practice-runner">
      <div className="ote-practice-progress"><div><span>{phase === "complete" ? "Complete" : phase === "review" ? "Answers checked" : `${placedCount} of 6 gaps filled`}</span><strong>{phase === "active" ? "11 minutes for the full task" : `${score} / 6 correct`}</strong></div><div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${phase === "active" ? (placedCount / 6) * 100 : 100}%` }} /></div></div>
      {phase === "ready" ? <ReadyCard user={user} onStart={startPractice} /> : phase === "complete" ? <CompleteCard score={score} placements={placements} answersMap={activeAnswers} sentencesMap={activeSentences} rationalesMap={activeRationales} title={taskTitle} onRetry={startPractice} onBack={() => navigate(menuPath)} /> : <article className="ote-practice-task-card ote-reading-gapped-task">
        <div className="ote-recorder-top"><div><p className="ote-kicker">Gapped text</p><h2>Drag a sentence into each gap</h2></div><div className="ote-recorder-timer is-recording" aria-hidden="true"><Clock3 size={22} /><strong>{formatTime(secondsLeft)}</strong><span>{phase === "review" ? "Checked" : "Remaining"}</span></div></div>
        <div className="ote-reading-gapped-layout"><SentenceBank available={available} selected={selectedSentence} onSelect={setSelectedSentence} sentencesMap={activeSentences} />{additionalTask ? <GenericTextArticle task={additionalTask} placements={placements} selectedSentence={selectedSentence} onPlace={placeSentence} onClear={clearGap} reviewed={phase === "review"} /> : <TextArticle placements={placements} selectedSentence={selectedSentence} onPlace={placeSentence} onClear={clearGap} reviewed={phase === "review"} />}</div>
        <div className="ote-recorder-actions">{phase === "review" ? <button type="button" onClick={() => finishPractice("manual")}>View final report</button> : <button type="button" disabled={placedCount !== 6} onClick={() => checkAnswers("checked")}>Check answers</button>}</div>
      </article>}
    </section>
  </main>;
}

function SentenceBank({ available, selected, onSelect, sentencesMap }) {
  return <aside className="ote-gapped-sentence-bank"><div><p className="ote-kicker">Missing sentences</p><h2>Choose or drag</h2></div>{available.map((id) => <button key={id} type="button" draggable className={selected === id ? "is-selected" : ""} onDragStart={(event) => event.dataTransfer.setData("text/plain", id)} onClick={() => onSelect(selected === id ? "" : id)}><GripVertical size={18} aria-hidden="true" /><strong>{id}</strong><span>{sentencesMap[id]}</span></button>)}<p className="ote-gapped-extra">One sentence will remain unused.</p></aside>;
}

function Gap({ id, placement, selectedSentence, onPlace, onClear, reviewed }) {
  const correct = placement === answers[id];
  return <span className={`ote-reading-gap ${placement ? "is-filled" : ""} ${reviewed ? (correct ? "is-correct" : "is-wrong") : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onPlace(id, event.dataTransfer.getData("text/plain")); }}>
    {placement ? <span className="ote-reading-gap-answer"><strong>{placement}</strong> {sentences[placement]}{!reviewed ? <button type="button" onClick={() => onClear(id)} aria-label={`Remove sentence from gap ${id}`}><X size={15} /></button> : null}</span> : <button type="button" onClick={() => onPlace(id, selectedSentence)} disabled={!selectedSentence || reviewed}>Gap {id}</button>}
    {reviewed ? <span className="ote-reading-gap-feedback"><strong>{correct ? "Correct." : `Answer: ${answers[id]}.`}</strong> {rationales[id]}</span> : null}
  </span>;
}

function TextArticle(props) {
  return <article className="ote-reading-gapped-text"><header><p className="ote-kicker">Article</p><h2>The case for getting slightly lost</h2></header><p>Digital navigation has transformed the experience of travelling through unfamiliar places. A journey that once required preparation, observation and occasional requests for help can now be completed by following a sequence of spoken instructions. This is clearly useful. Navigation systems reduce anxiety, assist emergency services and make independent travel possible for people who might otherwise struggle. Yet their success raises an interesting question: when a tool becomes extremely good at guiding us, do we gradually lose the ability to guide ourselves?</p><p>Traditional maps demand a particular kind of attention. Before beginning a journey, the user normally looks at the route as a whole, identifies major roads or landmarks and forms at least a rough idea of how the destination relates to the starting point. <Gap id="1" placement={props.placements[1]} {...props} /> The screen may display only the next turn, while the spoken instruction requires no understanding of what lies beyond it. As a result, somebody may reach a destination accurately while retaining almost no sense of the area through which they have travelled.</p><p>This does not necessarily mean that people who use navigation technology are lazy or incapable. Following instructions is often the most sensible response when time is limited or the surroundings are unfamiliar. The weakness becomes apparent mainly when the guidance suddenly disappears. <Gap id="2" placement={props.placements[2]} {...props} /> Such moments expose the difference between being successfully directed and actually knowing where one is.</p><p>Psychologists sometimes describe our internal understanding of an area as a "cognitive map". This is not a perfect mental image of every street. Rather, it is a flexible collection of landmarks, directions and relationships that allows us to estimate where things are and how they connect. Research suggests that people develop stronger cognitive maps when they make active decisions during a journey. Participants who select their own routes, for example, tend to remember more landmarks than those who simply follow instructions chosen for them. <Gap id="3" placement={props.placements[3]} {...props} /> The issue, then, may not be the presence of technology itself, but the amount of judgement that the technology leaves to its user.</p><p>There is a temptation to treat all unnecessary difficulty as bad design. If an application can remove uncertainty, why should it not do so? But effortless performance and deep understanding are not always the same thing. Students who are given an answer immediately may complete a task more quickly while learning less from it; drivers who are always guided may arrive efficiently while developing little awareness of the wider area. <Gap id="4" placement={props.placements[4]} {...props} /> A small amount of productive difficulty may encourage people to notice, predict and remember.</p><p>The effect may extend beyond individual memory. Navigation applications do not merely describe cities; through their recommendations, they influence how cities are experienced. If thousands of users are directed along the same "fastest" route, certain streets receive greater flows of pedestrians or traffic, while others are quietly ignored. Businesses on recommended routes may benefit, and supposedly hidden locations may become crowded almost overnight. <Gap id="5" placement={props.placements[5]} {...props} /> What appears to be a private decision between a user and a device can therefore have collective consequences for neighbourhoods.</p><p>None of this provides a convincing argument for returning entirely to paper maps. They can be difficult to update, impossible to consult safely while moving and inaccessible to many users. Nor did people necessarily possess excellent geographical knowledge before digital navigation appeared; plenty of travellers became lost while holding a map. <Gap id="6" placement={props.placements[6]} {...props} /> The goal should therefore be to preserve the benefits of guidance without making the traveller completely passive.</p><p>Applications might occasionally display the wider route before giving turn-by-turn instructions, ask users to choose between two reasonable alternatives or encourage them to identify a visible landmark. A traveller could also review a journey afterwards or attempt familiar sections without assistance. These are minor interventions, but they restore an element of participation. The most useful navigation tool may not be the one that demands the least possible thought. It may be the one that helps us arrive while still allowing us to understand where we have been.</p></article>;
}

function GenericTextArticle({ task, placements, selectedSentence, onPlace, onClear, reviewed }) {
  return <article className="ote-reading-gapped-text"><header><p className="ote-kicker">Article</p><h2>{task.heading}</h2></header>{task.paragraphs.map((paragraph, index) => Array.isArray(paragraph) ? <p key={index}>{paragraph[0]}<TaskGap id={String(paragraph[1])} placement={placements[paragraph[1]]} selectedSentence={selectedSentence} onPlace={onPlace} onClear={onClear} reviewed={reviewed} sentencesMap={task.sentences} answersMap={task.answers} rationalesMap={task.rationales} />{paragraph[2]}</p> : <p key={index}>{paragraph}</p>)}</article>;
}

function TaskGap({ id, placement, selectedSentence, onPlace, onClear, reviewed, sentencesMap, answersMap, rationalesMap }) {
  const correct = placement === answersMap[id];
  return <span className={`ote-reading-gap ${placement ? "is-filled" : ""} ${reviewed ? (correct ? "is-correct" : "is-wrong") : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onPlace(id, event.dataTransfer.getData("text/plain")); }}>
    {placement ? <span className="ote-reading-gap-answer"><strong>{placement}</strong> {sentencesMap[placement]}{!reviewed ? <button type="button" onClick={() => onClear(id)} aria-label={`Remove sentence from gap ${id}`}><X size={15} /></button> : null}</span> : <button type="button" onClick={() => onPlace(id, selectedSentence)} disabled={!selectedSentence || reviewed}>Gap {id}</button>}
    {reviewed ? <span className="ote-reading-gap-feedback"><strong>{correct ? "Correct." : `Answer: ${answersMap[id]}.`}</strong> {rationalesMap[id]}</span> : null}
  </span>;
}

function ReadyCard({ user, onStart }) { return <article className="ote-practice-task-card ote-reading-ready-card"><div className="ote-recorder-top"><div><p className="ote-kicker">Ready to start</p><h2>Timed gapped text</h2></div><div className="ote-recorder-timer is-ready"><Clock3 size={22} aria-hidden="true" /><strong>11:00</strong><span>Full task</span></div></div><div className="ote-training-rule-grid"><article><h3>Six gaps</h3><p>Place six sentences into the text.</p></article><article><h3>One extra sentence</h3><p>One of the seven options is not needed.</p></article><article><h3>Review after checking</h3><p>Check all placements together, then review each link.</p></article></div>{!user ? <p className="ote-warning">Sign in to save this completed practice set to your progress.</p> : null}<div className="ote-recorder-actions"><button type="button" onClick={onStart}><Clock3 size={18} aria-hidden="true" /> Start timed practice</button></div></article>; }
function CompleteCard({ score, placements, answersMap, sentencesMap, rationalesMap, title, onRetry, onBack }) { return <section className="ote-practice-complete ote-reading-native-complete"><CheckCircle2 size={38} aria-hidden="true" /><div><p className="ote-kicker">{title} complete</p><h2>{score} / 6</h2><p>{score === 6 ? "Excellent work. Every placement was correct." : "Review the gap-by-gap explanations below."}</p><div className="ote-reading-review-list">{Object.keys(answersMap).map((gap) => <article className={placements[gap] === answersMap[gap] ? "is-correct" : "is-wrong"} key={gap}><div><strong>Gap {gap}</strong><span>{placements[gap] === answersMap[gap] ? "Correct" : "Review"}</span></div><p><b>Answer:</b> {answersMap[gap]}. {sentencesMap[answersMap[gap]]}</p><p>{rationalesMap[gap]}</p></article>)}</div><div className="ote-complete-actions"><button type="button" onClick={onBack}>Back to Part 3</button><button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button></div></div></section>; }
function Unavailable({ onBack }) { return <main className="ote-training-page"><button className="ote-training-back" type="button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to reading</button><header className="ote-training-hero"><p className="ote-kicker">Advanced Reading Part 3</p><h1>Practice not available</h1><p>This timed set is available in the Advanced OTE workspace.</p></header></main>; }
