import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const QUESTION_SECONDS = 80;

const pilotSet1Questions = [
  {
    id: "family-correspondence",
    source: "Blog entry",
    title: "Family correspondence",
    text: "Last month, my aunt gave me a box of family correspondence discovered while clearing my grandmother's attic. At first, it seemed like a small archive: dozens of letters, several with envelopes bearing dates and addresses. Unfortunately, years ago, someone had removed every letter and stored the envelopes separately, apparently to save space. A few pages were faded and some dealt with ordinary domestic matters, but that was not the real problem. Most of the letters were undated, and several relatives shared the same first names. Without knowing which envelope belonged to which letter, I could not establish a dependable sequence of events. The collection was fascinating, but far less useful as a historical record than I had hoped.",
    prompt: "What caused the blogger's main disappointment?",
    options: [
      "Some of the letters were too damaged to interpret accurately.",
      "Their contents revealed little about the relatives who wrote them.",
      "Their original order and context could not be reconstructed.",
    ],
    answer: 2,
    feedback: "The dates and addresses were on envelopes that had been separated from mostly undated letters, so the writer could not reliably reconstruct the sequence of events.",
  },
  {
    id: "citystride",
    source: "App review",
    title: "CityStride",
    text: "At first glance, CityStride looks much like any other journey-planning app. It combines walking, buses and trains efficiently, and its live alerts usually warn users about delays before station announcements do. The interface is clear, although hardly memorable. What makes it worth keeping is a less obvious feature: routes can be adjusted according to how crowded, noisy or exposed particular streets are likely to be. On a hot afternoon, it may favour shaded streets over the quickest route; at closing time, it can steer users away from packed shopping areas. This recognises that the shortest journey is not necessarily the most comfortable one, and gives the app a practical advantage over its polished competitors.",
    prompt: "Which feature makes CityStride stand out, according to the reviewer?",
    options: [
      "It responds to likely conditions along different routes.",
      "It integrates several forms of transport efficiently.",
      "It delivers travel warnings before official announcements.",
    ],
    answer: 0,
    feedback: "The reviewer calls the route adjustments for crowding, noise, shade, and exposure the feature that gives the app its practical advantage.",
  },
  {
    id: "formal-dinner",
    source: "Extract from a novel",
    title: "Formal dinner",
    text: "The jacket belonged to my brother and was slightly too broad at the shoulders, though I hoped the dim lighting would disguise this. At the table, I waited for the woman opposite to choose a glass before touching mine. She appeared to know what happened next. When the others laughed, I joined them a fraction late, having missed the remark while checking which fork they had picked up. I had prepared several observations about the exhibition, but each seemed less impressive once somebody else began speaking. Only when a lawyer dropped a spoon did I relax. He smiled, the conversation continued, and I realised that perhaps the evening contained rules which even its most accomplished guests occasionally failed to follow.",
    prompt: "The narrator's behaviour suggests that he is ...",
    options: [
      "eager to impress the other guests with his knowledge.",
      "anxious about revealing his unfamiliarity with the occasion.",
      "amused by the importance the guests place on etiquette.",
    ],
    answer: 1,
    feedback: "He copies the other guests' choices and hesitates to speak, which suggests anxiety about exposing his lack of familiarity with the occasion.",
  },
  {
    id: "measuring-productivity",
    source: "Workplace journal",
    title: "Measuring productivity",
    text: "Studies of hybrid working frequently use keyboard activity, mouse movement and time spent in applications as indicators of productivity. Such measures are convenient, but they record visible behaviour rather than the value of the work produced. In our pilot study, employees with the highest activity scores were not necessarily those who completed the most tasks or received the strongest quality ratings. Some were switching repeatedly between applications, while others spent long periods reading, planning or reviewing material without generating much digital activity. We therefore judged screen-based monitoring to be an unreliable proxy for productive work. In the main study, productivity was assessed through completed output and independent evaluations of its quality, rather than through employees' interactions with their devices.",
    prompt: "Why does the writer refer to the pilot study?",
    options: [
      "To demonstrate that switching between applications reduces work quality.",
      "To show that employees devote too much working time to planning.",
      "To explain why a different measure of productivity was adopted.",
    ],
    answer: 2,
    feedback: "The pilot showed that visible computer activity did not reliably match the amount or quality of completed work, explaining the new measurement method.",
  },
  {
    id: "changing-careers",
    source: "Careers blog",
    title: "Changing careers",
    text: "People considering a change of career often assume that their first step must be an expensive qualification. In some professions, formal training will eventually be essential, but enrolling immediately can be a costly way of testing an idealised impression of the work. Before making that commitment, try to obtain some direct exposure. A short course, a day spent shadowing someone, voluntary work or even several detailed conversations with people in the field may reveal more than a prospectus can. Salary and long-term security matter, of course, but the initial question is simpler: would the daily reality of this work suit you? A qualification may form part of the destination, but it should not be your first experiment.",
    prompt: "According to the writer, potential career changers should begin by ...",
    options: [
      "gaining limited first-hand experience of the new field.",
      "comparing the financial prospects offered by different sectors.",
      "starting the necessary qualifications while remaining employed.",
    ],
    answer: 0,
    feedback: "The writer recommends limited direct exposure, such as shadowing or voluntary work, before making a larger commitment to qualifications.",
  },
  {
    id: "shuttle-trial",
    source: "Letter to a university newspaper",
    title: "Shuttle trial",
    text: "The university says that its six-week evening shuttle trial is intended to establish whether there is sufficient demand to retain the service. Yet the version being tested runs half as often as before and no longer stops beside the two main halls of residence. It is difficult to regard falling passenger numbers as meaningful when the service has been made substantially less convenient. Publicity for the trial has also been limited, but the larger concern is that low usage may later be presented as evidence that students never needed the original service. I nevertheless urge students to complete the travel survey and record journeys they were unable to make. Otherwise, a questionable experiment may produce a conveniently predictable conclusion.",
    prompt: "What is the writer's main concern about the trial?",
    options: [
      "Too few students have been informed that it is taking place.",
      "The altered service may create a justification for ending it.",
      "The six-week period is too short for demand to become established.",
    ],
    answer: 1,
    feedback: "The writer fears low use of the deliberately less convenient service could later be used as evidence to cancel the original service.",
  },
];

const pilotSet2Questions = [
  {
    id: "wildlife-recording",
    source: "Blog entry",
    title: "Wildlife recording",
    text: "During a weekend wildlife survey, our group placed recording devices around a marsh where an endangered bittern had occasionally been reported. On Monday, one file contained the unmistakable booming call we had hoped for. I had already begun imagining the conservation notice when I examined the device settings. Its memory card had been reused after surveys at two other wetlands and had not been cleared. Worse, the internal clock had reset during a battery change, and the recording contained no background sounds that could connect it confidently to our marsh. The call itself was genuine, and beautifully clear, but we could not establish where or when it had been captured. Scientifically, our most exciting result was almost useless.",
    prompt: "What disappointed the blogger about the recording?",
    options: ["Its quality had been affected by a fault in the equipment.", "It could not be reliably connected with the survey location.", "The group was unable to identify the bird that had produced it."],
    answer: 1,
    feedback: "The clear and genuine call could not be proven to have been recorded at the survey marsh because the reused card and reset clock removed its reliable context.",
  },
  {
    id: "aviation-exhibition",
    source: "Exhibition review",
    title: "Aviation exhibition",
    text: "The new exhibition on early aviation is full of remarkable objects, including hand-drawn designs and fragments from experimental aircraft. Yet its real strength lies less in what it displays than in how it handles uncertainty. Instead of presenting every invention as an inevitable step towards modern flight, the curators repeatedly show how many promising ideas failed, were abandoned or led nowhere. An interactive map even allows visitors to follow rival designs that disappeared from the historical record. Some labels are unnecessarily dense, and the final room feels cramped, but the exhibition resists the comforting myth that progress follows a tidy path. That makes it more thought-provoking than many larger and more spectacular displays.",
    prompt: "What does the reviewer particularly value about the exhibition?",
    options: ["the amount of technical information provided", "the range of rare original objects on display", "the way it challenges a simplified view of progress"],
    answer: 2,
    feedback: "Its real strength is presented as its refusal to show technological progress as simple and inevitable, including failed and abandoned ideas.",
  },
  {
    id: "promotion",
    source: "Extract from a novel",
    title: "Promotion",
    text: "When the director announced my promotion, the room broke into applause before I had fully understood what she had said. I smiled, shook hands and accepted congratulations from people who had barely noticed me the week before. My new office was upstairs, with a wider desk and a window overlooking the square. Still, at lunchtime I carried my tray back to the crowded corner where the junior staff sat, only to find someone else using my usual chair. They moved at once, embarrassed, but I told them not to. From the upstairs corridor later, I could see the old table below. It looked smaller than I remembered, though strangely harder to leave behind.",
    prompt: "The narrator's reaction to the promotion suggests that they are ...",
    options: ["emotionally attached to their former place in the organisation.", "doubtful that they have the skills required for the new role.", "irritated by the sudden attention of previously distant colleagues."],
    answer: 0,
    feedback: "Returning to the junior staff table and looking back at it from upstairs shows an emotional attachment to the narrator's former place in the organisation.",
  },
  {
    id: "presentation-training",
    source: "Professional journal",
    title: "Presentation training",
    text: "Previous studies of presentation training have often compared employees who volunteered for coaching with colleagues who did not. The coached groups generally improved more, but volunteers may already have been more motivated, confident or willing to practise. This makes it difficult to determine how much of the difference was caused by the training itself. In our study, eligible employees were assigned at random either to a four-week coaching programme or to a waiting-list group. Both groups completed the same presentation tasks before and after the programme, and independent assessors rated the recordings without knowing who had received coaching. This design allowed us to separate the effect of the intervention from participants' initial enthusiasm.",
    prompt: "Why does the writer refer to previous studies?",
    options: ["To show that coaching mainly benefits highly motivated employees.", "To identify a possible bias that the new research sought to avoid.", "To explain why assessors were not told who had received training."],
    answer: 1,
    feedback: "Earlier volunteer-based research may have contained self-selection bias. Random assignment was used in the new study to reduce that problem.",
  },
  {
    id: "productive-meetings",
    source: "Workplace advice blog",
    title: "Productive meetings",
    text: "Meetings often continue long after the useful discussion has ended because nobody wants to appear impatient or close-minded. A chairperson may keep asking whether there are any further comments, even when the same points are simply being repeated. The solution is not to force agreement. In complex decisions, complete consensus may be unrealistic and can conceal genuine differences. Instead, summarise what has been agreed, identify the remaining disagreement and assign a clear next step to a named person. Participants are more likely to accept an unfinished discussion when they know what will happen afterwards. A productive meeting is not one in which every issue disappears, but one that ends with responsibility and direction.",
    prompt: "According to the writer, what is most important when ending a meeting?",
    options: ["ensuring that everybody has had sufficient time to contribute", "reaching agreement on the most significant matters discussed", "establishing who is responsible for what happens next"],
    answer: 2,
    feedback: "The writer says productive meetings can end with disagreement, as long as a clear next step is assigned to a named person.",
  },
  {
    id: "park-consultation",
    source: "Letter to a local newspaper",
    title: "Park consultation",
    text: "The council describes its online questionnaire on the future of Westbrook Park as an open consultation. In practice, residents are asked to choose between constructing a large events venue and replacing the sports courts with commercial cafes. There is no option to support repairing the existing facilities, despite this being the proposal most frequently raised at public meetings. Officials may argue that respondents can add comments, but these are unlikely to carry the same weight as the headline figures produced by the fixed choices. I encourage residents to complete the survey nonetheless and state their preferred alternative clearly. Otherwise, the council may later claim public support for a change that the questionnaire itself has effectively predetermined.",
    prompt: "What concern does the writer express about the questionnaire?",
    options: ["It may make one of the listed changes appear more popular than it really is.", "It prevents residents from expressing any preference beyond the two fixed choices.", "It assumes that residents are equally familiar with both development proposals."],
    answer: 0,
    feedback: "Leaving out the popular repair option could make one of the council's fixed changes appear to have more support than it really has.",
  },
];

const practiceSets = {
  "pilot-1": { id: "pilot-1", title: "Pilot Set 1", questions: pilotSet1Questions },
  "pilot-2": { id: "pilot-2", title: "Pilot Set 2", questions: pilotSet2Questions },
};

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function OteAdvancedReadingPart1Practice({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { setId = "pilot-1" } = useParams();
  const practiceSet = practiceSets[setId] || practiceSets["pilot-1"];
  const questions = practiceSet.questions;
  const menuPath = getSitePath(nativeRoutes ? "/reading/advanced/part-1-short-texts" : "/ote/reading/advanced/part-1-short-texts");
  const [phase, setPhase] = useState("ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const completionLogged = useRef(false);
  const question = questions[questionIndex];
  const score = questions.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0);

  useEffect(() => {
    if (user?.oteVersion && user.oteVersion !== "advanced") return undefined;
    if (phase !== "active" || revealed) return undefined;
    if (secondsLeft <= 0) {
      setRevealed(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, questionIndex, revealed, secondsLeft, user?.oteVersion]);

  if (user && user.oteVersion !== "advanced") {
    return (
      <main className="ote-training-page">
        <button className="ote-training-back" type="button" onClick={() => navigate(getSitePath(nativeRoutes ? "/reading" : "/ote/reading"))}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to reading
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Advanced Reading Part 1</p>
          <h1>Practice not available</h1>
          <p>This timed set is available in the Advanced OTE workspace.</p>
        </header>
        <section className="ote-practice-runner">
          <article className="ote-practice-task-card">
            <div className="ote-recorder-actions">
              <button type="button" onClick={() => navigate(getSitePath(nativeRoutes ? "/reading" : "/ote/reading"))}>Back to reading</button>
            </div>
          </article>
        </section>
      </main>
    );
  }

  function startPractice() {
    completionLogged.current = false;
    setQuestionIndex(0);
    setAnswers({});
    setRevealed(false);
    setSecondsLeft(QUESTION_SECONDS);
    setPhase("active");
    logOteTrainingStarted({
      section: "reading",
      part: "part-1",
      mode: "timed_practice",
      taskId: `advanced-reading-part-1-${practiceSet.id}`,
      taskTitle: `Advanced Reading Part 1 ${practiceSet.title}`,
      variant: "advanced",
    });
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
      logOteTrainingCompleted({
        section: "reading",
        part: "part-1",
        mode: "timed_practice",
        taskId: `advanced-reading-part-1-${practiceSet.id}`,
        taskTitle: `Advanced Reading Part 1 ${practiceSet.title}`,
        variant: "advanced",
        score,
        total: questions.length,
      });
    }
  }

  function chooseAnswer(optionIndex) {
    if (revealed) return;
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
    setRevealed(true);
  }

  return (
    <main className="ote-training-page ote-reading-practice-page">
      <Seo
        title="OTE Advanced Reading Part 1 Timed Practice | Seif English"
        description="Timed Advanced OTE Reading Part 1 practice with six short texts."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 1
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 1</p>
        <h1>{practiceSet.title}</h1>
        <p>Six short texts. Choose one answer for each question before the timer runs out.</p>
      </header>

      {phase === "active" ? (
        <div className="ote-writing-floating-timer" aria-live="polite">
          <Clock3 size={20} aria-hidden="true" />
          <strong>{formatTime(secondsLeft)}</strong>
          <span>Question</span>
        </div>
      ) : null}

      <section className="ote-practice-runner">
        <div className="ote-practice-progress">
          <div>
            <span>{phase === "complete" ? "Complete" : phase === "active" ? `Question ${questionIndex + 1} of ${questions.length}` : "Timed practice"}</span>
            <strong>{phase === "complete" ? `${score} / ${questions.length} correct` : "1 minute 20 seconds per question"}</strong>
          </div>
          <div className="ote-practice-progress-bar" aria-hidden="true">
            <span style={{ width: `${phase === "complete" ? 100 : phase === "active" ? ((questionIndex + (revealed ? 1 : 0)) / questions.length) * 100 : 0}%` }} />
          </div>
        </div>

        {phase === "ready" ? (
          <article className="ote-practice-task-card ote-reading-ready-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">Ready to start</p>
                <h2>Timed reading set</h2>
              </div>
              <div className="ote-recorder-timer is-ready">
                <Clock3 size={22} aria-hidden="true" />
                <strong>01:20</strong>
                <span>Per question</span>
              </div>
            </div>
            <div className="ote-training-rule-grid">
              <article><h3>Six questions</h3><p>Read one short text at a time and select the best answer.</p></article>
              <article><h3>Individual timer</h3><p>The timer restarts for each new question and moves you on when it reaches zero.</p></article>
              <article><h3>Review at the end</h3><p>Your score and explanations appear after the final question.</p></article>
            </div>
            {!user ? <p className="ote-warning">Sign in to save this completed practice set to your progress.</p> : null}
            <div className="ote-recorder-actions">
              <button type="button" onClick={startPractice}><Clock3 size={18} aria-hidden="true" /> Start timed practice</button>
            </div>
          </article>
        ) : phase === "active" ? (
          <article className="ote-practice-task-card ote-reading-native-task">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">Question {questionIndex + 1} of {questions.length}</p>
                <h2>{question.prompt}</h2>
              </div>
              <div className="ote-recorder-timer is-recording" aria-hidden="true">
                <Clock3 size={22} />
                <strong>{formatTime(secondsLeft)}</strong>
                <span>Remaining</span>
              </div>
            </div>
            <div className="ote-reading-native-layout">
              <div>
                <p className="ote-instructions">Read the {question.source.toLowerCase()} and choose the correct answer.</p>
                <div className="ote-training-options" role="radiogroup" aria-label={question.prompt}>
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={option}
                      className={`ote-training-option ${answers[question.id] === optionIndex ? "is-selected" : ""} ${revealed && optionIndex === question.answer ? "is-answer" : ""} ${revealed && answers[question.id] === optionIndex && optionIndex !== question.answer ? "is-incorrect" : ""}`}
                      type="button"
                      role="radio"
                      aria-checked={answers[question.id] === optionIndex}
                      aria-disabled={revealed}
                      onClick={() => chooseAnswer(optionIndex)}
                    >
                      <span><strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option}</span>
                    </button>
                  ))}
                </div>
                {revealed ? <ItemFeedback question={question} answer={answers[question.id]} /> : null}
              </div>
              <ReadingSourceFrame question={question} />
            </div>
            <div className="ote-recorder-actions">
              <button type="button" onClick={advanceQuestion} disabled={!revealed}>{questionIndex === questions.length - 1 ? "Finish and review" : "Next question"}</button>
            </div>
          </article>
        ) : (
          <ReadingComplete score={score} answers={answers} questions={questions} setTitle={practiceSet.title} onRetry={startPractice} onBack={() => navigate(menuPath)} />
        )}
      </section>
    </main>
  );
}

function ItemFeedback({ question, answer }) {
  const isCorrect = answer === question.answer;
  return <div className={`ote-reading-item-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}><strong>{answer == null ? "Time's up." : isCorrect ? "Correct." : "Not quite."}</strong><p>{question.feedback}</p></div>;
}

function ReadingSourceFrame({ question }) {
  const frame = getSourceFrame(question);
  return (
    <article className={`ote-reading-source-card is-${frame.kind}`}>
      <header className="ote-reading-source-masthead">
        <span className="ote-reading-source-publication">{frame.publication}</span>
        <span>{frame.section}</span>
      </header>
      <div className="ote-reading-source-body">
        <p className="ote-reading-source-meta">{frame.meta}</p>
        <h3>{question.title}</h3>
        {frame.byline ? <p className="ote-reading-source-byline">{frame.byline}</p> : null}
        <p>{question.text}</p>
      </div>
    </article>
  );
}

function getSourceFrame(question) {
  if (question.source === "Extract from a novel") {
    return { kind: "fiction", publication: "A novel extract", section: "Chapter reading", meta: "From Chapter 6", byline: "" };
  }
  if (question.source.includes("journal")) {
    return { kind: "journal", publication: "Workplace Review", section: "Research notes", meta: "Evidence and practice", byline: "" };
  }
  if (question.source.includes("letter")) {
    return { kind: "letter", publication: question.id === "park-consultation" ? "The Westbrook Gazette" : "The Campus Chronicle", section: "Letters", meta: "Published correspondence", byline: "" };
  }
  if (question.source.includes("review")) {
    return { kind: question.id === "citystride" ? "app" : "review", publication: question.id === "citystride" ? "AppField" : "The Museum Review", section: "Reviews", meta: question.id === "citystride" ? "Independent app review" : "Exhibition review", byline: "By the editorial team" };
  }
  if (question.source.includes("careers")) {
    return { kind: "blog", publication: "Next Step", section: "Career notes", meta: "Practical career advice", byline: "By Maya Ellis" };
  }
  if (question.source.includes("advice")) {
    return { kind: "blog", publication: "Working Better", section: "Team habits", meta: "Workplace advice", byline: "By the editorial team" };
  }
  return { kind: "blog", publication: question.id === "wildlife-recording" ? "Marsh Notes" : "Family Archive", section: "Field journal", meta: "Personal blog", byline: "By a contributor" };
}

function ReadingComplete({ score, answers, questions, setTitle, onRetry, onBack }) {
  return (
    <section className="ote-practice-complete ote-reading-native-complete">
      <CheckCircle2 size={38} aria-hidden="true" />
      <div>
        <p className="ote-kicker">{setTitle} complete</p>
        <h2>{score} / {questions.length}</h2>
        <p>{score === questions.length ? "Excellent work. Every answer was correct." : "Your answers and explanations are below."}</p>
        <div className="ote-reading-review-list">
          {questions.map((item, index) => {
            const isCorrect = answers[item.id] === item.answer;
            return (
              <article className={isCorrect ? "is-correct" : "is-wrong"} key={item.id}>
                <div><strong>{index + 1}. {item.title}</strong><span>{isCorrect ? "Correct" : "Review"}</span></div>
                <p><b>Answer:</b> {String.fromCharCode(65 + item.answer)}. {item.options[item.answer]}</p>
                <p>{item.feedback}</p>
              </article>
            );
          })}
        </div>
        <div className="ote-complete-actions">
          <button type="button" onClick={onBack}>Back to Part 1</button>
          <button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button>
        </div>
      </div>
    </section>
  );
}
