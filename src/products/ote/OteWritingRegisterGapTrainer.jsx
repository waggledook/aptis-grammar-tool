import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, FileText, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { requestOteRegisterGapFeedback } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const TASKS = [
  {
    id: "formal-to-informal",
    label: "Formal to informal",
    title: "Nature Trail Booking",
    prompt: "Complete the informal email so it keeps the same meaning as the formal email.",
    leftTitle: "Formal email",
    leftSubtitle: "From Nature Coordinator",
    rightTitle: "Informal email",
    rightSubtitle: "To a friend",
    gaps: {
      1: {
        answers: ["excited", "pumped"],
        suggestion: "excited / pumped",
        note: "This downshifts delighted into friendly enthusiasm.",
        sourceMeaning: "We are delighted that you have chosen to visit the national park.",
        sentenceBefore: "I'm so",
        sentenceAfter: "to visit the national park!",
      },
      2: {
        answers: ["take", "catch", "hop on", "get"],
        suggestion: "take / catch / hop on",
        note: "A simple transport verb sounds more natural than method of transport.",
        sourceMeaning: "The most convenient method of transport to the site is the local bus.",
        sentenceBefore: "We should probably",
        sentenceAfter: "the local bus - it leaves every hour from the main station.",
      },
      3: {
        answers: ["rain", "be rainy", "be awful", "be wet"],
        suggestion: "rain / be awful",
        note: "Inclement weather conditions becomes everyday weather language.",
        sourceMeaning: "We anticipate inclement weather conditions.",
        sentenceBefore: "It looks like it's going to",
        sentenceAfter: ", so make sure you bring a raincoat or something waterproof.",
      },
      4: {
        answers: ["bring", "wear", "pack", "take"],
        suggestion: "bring / wear / pack",
        note: "Advisable to wear waterproof attire becomes a direct friendly reminder.",
        sourceMeaning: "It is advisable to wear waterproof attire.",
        sentenceBefore: "Make sure you",
        sentenceAfter: "a raincoat or something waterproof.",
      },
      5: {
        answers: ["joins", "comes with", "comes along with", "tags along with", "comes along", "tags along"],
        suggestion: "joins / comes with / tags along with",
        note: "Accommodate your cousin within the tour group becomes a natural friend-to-friend request.",
        sourceMeaning: "We would be pleased to accommodate your cousin within the tour group.",
        sentenceBefore: "Is it okay if my cousin Danny",
        sentenceAfter: "us?",
      },
      6: {
        answers: ["bye", "ciao", "that's all", "all the best"],
        suggestion: "Bye / Ciao / That's all",
        note: "Yours sincerely needs an informal closing that works before for now.",
        sourceMeaning: "Yours sincerely,",
        sentenceBefore: "",
        sentenceAfter: "for now,",
        idiomNote: "The full phrase is '[answer] for now'. 'Bye for now' and 'Ciao for now' are idiomatic. 'See you for now', 'Speak soon for now', and 'Thanks for now' are not natural closings.",
      },
    },
  },
  {
    id: "informal-to-formal",
    label: "Informal to formal",
    title: "Study Trip Arrangements",
    prompt: "Complete the formal email so it keeps the same meaning as the informal email.",
    leftTitle: "Informal email",
    leftSubtitle: "To a classmate",
    rightTitle: "Formal email",
    rightSubtitle: "To the principal",
    gaps: {
      1: {
        answers: ["cover", "fund", "subsidize", "subsidise", "pay for"],
        suggestion: "cover / fund / subsidize",
        note: "Paying for becomes a more formal funding verb.",
        sourceMeaning: "The college is paying for our museum tickets.",
        sentenceBefore: "The college's decision to",
        sentenceAfter: "our museum admission fees.",
      },
      2: {
        answers: ["suggest", "propose", "recommend"],
        suggestion: "suggest / propose",
        note: "I think becomes a formal suggestion frame.",
        sourceMeaning: "I think the museum cafe looks like the best option.",
        sentenceBefore: "I would like to",
        sentenceAfter: "that we utilize the museum cafe.",
      },
      3: {
        answers: ["economical", "affordable", "inexpensive", "reasonably priced"],
        suggestion: "economical / affordable",
        note: "Cheap is usually too direct for a formal email.",
        sourceMeaning: "The museum cafe is cheap and nearby.",
        sentenceBefore: "It is both",
        sentenceAfter: "and located in close proximity.",
      },
      4: {
        answers: ["collect", "gather"],
        suggestion: "collect / gather",
        note: "This keeps the practical action but sounds more neutral.",
        sourceMeaning: "I can collect them from everyone.",
        sentenceBefore: "I shall",
        sentenceAfter: "them from the students.",
      },
      5: {
        answers: ["deliver", "submit", "return", "bring"],
        suggestion: "deliver / submit / return",
        note: "Bring becomes a more formal action verb.",
        sourceMeaning: "I can bring them to the office on Friday.",
        sentenceBefore: "I shall collect them from the students and",
        sentenceAfter: "them to your office this Friday.",
      },
      6: {
        answers: ["sincerely", "faithfully"],
        suggestion: "sincerely",
        note: "Yours sincerely is the standard closing when the recipient is named.",
        sourceMeaning: "See you later,",
        sentenceBefore: "Yours",
        sentenceAfter: ",",
        idiomNote: "The full phrase is 'Yours [answer],'. With a named recipient, 'Yours sincerely,' is the expected formal closing.",
      },
    },
  },
];

const IDENTIFICATION_ITEMS = [
  {
    id: "id-1",
    phrase: "I'm sorry, but I can't make it to the meeting on Friday.",
    register: "informal",
    why: "It uses contractions and the casual phrase make it.",
    alternative: "I regret to inform you that I will be unable to attend the meeting on Friday.",
  },
  {
    id: "id-2",
    phrase: "Should you require any further information, please do not hesitate to contact me.",
    register: "formal",
    why: "It uses formal inversion and polite business vocabulary such as require and hesitate.",
    alternative: "If you need to know anything else, just let me know!",
  },
  {
    id: "id-3",
    phrase: "How about we grab a bite to eat at the museum cafe?",
    register: "informal",
    why: "How about we and grab a bite are conversational choices.",
    alternative: "I would like to suggest using the dining facilities at the museum cafe.",
  },
  {
    id: "id-4",
    phrase: "I am writing to express my dissatisfaction with the recent course arrangements.",
    register: "formal",
    why: "It uses a standard formal opening and the formal noun phrase express my dissatisfaction.",
    alternative: "I just wanted to say I'm pretty unhappy with how the course is going.",
  },
  {
    id: "id-5",
    phrase: "Don't worry about the transport, I can sort it out.",
    register: "informal",
    why: "Don't worry and sort it out are conversational and direct.",
    alternative: "Please do not be concerned about the transport arrangements, as I shall take responsibility for them.",
  },
  {
    id: "id-6",
    phrase: "I would like to express my gratitude for your kind invitation.",
    register: "formal",
    why: "It uses an indirect gratitude phrase instead of a direct thanks.",
    alternative: "Thanks a lot for inviting me!",
  },
  {
    id: "id-7",
    phrase: "By the way, my cousin Danny wants to tag along with us.",
    register: "informal",
    why: "By the way and tag along are friendly, conversational choices.",
    alternative: "Furthermore, I would like to ask whether it would be possible to include my cousin, Danny, in the group.",
  },
  {
    id: "id-8",
    phrase: "We are pleased to inform you that your application has been successful.",
    register: "formal",
    why: "It uses standard professional phrasing and a formal adjective.",
    alternative: "Great news! You got the spot!",
  },
  {
    id: "id-9",
    phrase: "Anyway, what do you reckon we should bring to the party?",
    register: "informal",
    why: "Anyway and reckon make the sentence sound conversational.",
    alternative: "Regarding the event, could you please advise us on what items we are expected to provide?",
  },
  {
    id: "id-10",
    phrase: "Please find attached the documentation you requested.",
    register: "formal",
    why: "Please find attached is formulaic professional email language.",
    alternative: "Here's the stuff you asked for!",
  },
];

const REWRITE_ITEMS = [
  {
    id: "rw-1",
    functionLabel: "Reacting to news",
    sourceRegister: "informal",
    targetRegister: "formal",
    prompt: "That's awesome news! I'd love to come.",
    suggestedAnswers: [
      "I am delighted to receive this news, and I would be pleased to attend.",
      "That is excellent news, and I would be delighted to participate.",
    ],
    keyFeatures: ["no contractions", "formal adjective", "would be pleased/delighted"],
  },
  {
    id: "rw-2",
    functionLabel: "Requesting details",
    sourceRegister: "formal",
    targetRegister: "informal",
    prompt: "Could you please inform me of the scheduled arrival time?",
    suggestedAnswers: ["Can you let me know when we're getting there?", "What time do we arrive?"],
    keyFeatures: ["direct question", "simple vocabulary", "contraction allowed"],
  },
  {
    id: "rw-3",
    functionLabel: "Making a suggestion",
    sourceRegister: "informal",
    targetRegister: "formal",
    prompt: "What about checking out the park this weekend instead?",
    suggestedAnswers: [
      "I would like to propose visiting the park this upcoming weekend as an alternative.",
      "Perhaps we could consider visiting the park this weekend instead.",
    ],
    keyFeatures: ["would like to propose", "perhaps we could", "as an alternative"],
  },
  {
    id: "rw-4",
    functionLabel: "Offering assistance",
    sourceRegister: "formal",
    targetRegister: "informal",
    prompt: "I would be more than happy to assist with organizing the upcoming event.",
    suggestedAnswers: [
      "I'm happy to give you a hand setting up the event if you want!",
      "I can help sort out the event if you need.",
    ],
    keyFeatures: ["give you a hand", "help sort out", "friendly offer"],
  },
  {
    id: "rw-5",
    functionLabel: "Closing the email",
    sourceRegister: "informal",
    targetRegister: "formal",
    prompt: "Write back soon and let me know.",
    suggestedAnswers: [
      "I look forward to receiving your prompt response.",
      "I look forward to hearing from you at your earliest convenience.",
    ],
    keyFeatures: ["I look forward to", "hearing from you", "prompt response"],
  },
  {
    id: "rw-6",
    functionLabel: "Stating purpose",
    sourceRegister: "formal",
    targetRegister: "informal",
    prompt: "I am writing with reference to your email concerning the college's 25th birthday celebrations.",
    suggestedAnswers: [
      "I'm just writing about the college's 25th anniversary party.",
      "Just checking in about the college birthday event.",
    ],
    keyFeatures: ["just writing about", "checking in", "simple noun phrase"],
  },
  {
    id: "rw-7",
    functionLabel: "Declining an invitation",
    sourceRegister: "informal",
    targetRegister: "formal",
    prompt: "I'd love to help, but I'm completely swamped with work next week.",
    suggestedAnswers: [
      "Although I would be eager to assist, I regret that I have prior professional commitments next week.",
      "I would be pleased to help; however, I am unfortunately unable to do so due to a heavy workload next week.",
    ],
    keyFeatures: ["although/however", "I regret", "unable to", "professional commitments"],
  },
  {
    id: "rw-8",
    functionLabel: "Giving a reason",
    sourceRegister: "formal",
    targetRegister: "informal",
    prompt: "Due to the fact that weather conditions are unpredictable, outdoor activities may be postponed.",
    suggestedAnswers: [
      "Because the weather is so unpredictable, the outdoor activities might be put off until later.",
      "Since the weather is dodgy, we might have to change our outdoor plans.",
    ],
    keyFeatures: ["because/since", "weather", "might have to", "put off/change plans"],
  },
  {
    id: "rw-9",
    functionLabel: "Apologizing",
    sourceRegister: "informal",
    targetRegister: "formal",
    prompt: "Sorry for the late reply, I've been away from my computer.",
    suggestedAnswers: [
      "Please accept my sincere apologies for the delay in my response, as I have been away from my workstation.",
      "I apologize for the delay in replying to your email.",
    ],
    keyFeatures: ["apologize/apologies", "delay in replying", "no contractions"],
  },
  {
    id: "rw-10",
    functionLabel: "Email sign-off",
    sourceRegister: "formal",
    targetRegister: "informal",
    prompt: "Yours sincerely,",
    suggestedAnswers: ["Cheers,", "Best,", "See you soon,"],
    keyFeatures: ["short friendly closing", "Cheers", "Best", "See you soon"],
  },
];

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");
}

function isCorrect(value, gap) {
  const normal = normalizeAnswer(value);
  return gap.answers.some((answer) => normalizeAnswer(answer) === normal);
}

function blankState() {
  return TASKS.reduce((acc, task) => {
    acc[task.id] = Object.keys(task.gaps).reduce((answers, key) => {
      answers[key] = "";
      return answers;
    }, {});
    return acc;
  }, {});
}

function blankRewriteState() {
  return REWRITE_ITEMS.reduce((acc, item) => {
    acc[item.id] = "";
    return acc;
  }, {});
}

export default function OteWritingRegisterGapTrainer({ user, onRequireSignIn, nativeRoutes = false }) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(TASKS[0].id);
  const [answers, setAnswers] = useState(() => blankState());
  const [checked, setChecked] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiError, setAiError] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const activeTask = TASKS.find((task) => task.id === activeId) || TASKS[0];
  const currentAnswers = answers[activeTask.id] || {};
  const trainingPath = getSitePath(nativeRoutes ? "/writing/training/email" : "/ote/writing/training/email");

  const score = useMemo(() => {
    const entries = Object.entries(activeTask.gaps);
    const correct = entries.filter(([number, gap]) => isCorrect(currentAnswers[number], gap)).length;
    return { correct, total: entries.length };
  }, [activeTask, currentAnswers]);
  function updateGap(number, value) {
    setAnswers((prev) => ({
      ...prev,
      [activeTask.id]: {
        ...(prev[activeTask.id] || {}),
        [number]: value,
      },
    }));
    setAiFeedback(null);
    setAiError("");
    setAiStatus("idle");
  }

  function resetTask() {
    setAnswers((prev) => ({
      ...prev,
      [activeTask.id]: Object.keys(activeTask.gaps).reduce((next, key) => {
        next[key] = "";
        return next;
      }, {}),
    }));
    setChecked(false);
    setShowKey(false);
    setAiStatus("idle");
    setAiError("");
    setAiFeedback(null);
  }

  function switchTask(id) {
    setActiveId(id);
    setChecked(false);
    setShowKey(false);
    setAiStatus("idle");
    setAiError("");
    setAiFeedback(null);
  }

  function buildAiPayload() {
    const targetRegister = activeTask.id === "formal-to-informal" ? "informal email to a friend" : "formal email to a principal";
    const sourceRegister = activeTask.id === "formal-to-informal" ? "formal email from an organisation" : "informal email to a classmate";
    return {
      taskId: activeTask.id,
      title: activeTask.title,
      direction: activeTask.label,
      sourceRegister,
      targetRegister,
      instructions: activeTask.prompt,
      gaps: Object.entries(activeTask.gaps).map(([number, gap]) => ({
        number,
        studentAnswer: currentAnswers[number] || "",
        sentenceBefore: gap.sentenceBefore || "",
        sentenceAfter: gap.sentenceAfter || "",
        sourceMeaning: gap.sourceMeaning || "",
        idiomNote: gap.idiomNote || "",
        acceptedAnswers: gap.answers,
      })),
    };
  }

  async function handleAiFeedback() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    if (!Object.values(currentAnswers).some((value) => String(value || "").trim())) {
      setAiStatus("error");
      setAiError("Add at least one answer before requesting feedback.");
      return;
    }

    setAiStatus("loading");
    setAiError("");
    setAiFeedback(null);

    try {
      const result = await requestOteRegisterGapFeedback(buildAiPayload());
      setAiFeedback(result?.feedback || null);
      setAiStatus("ready");
    } catch (error) {
      console.warn("[OTE register gap] AI feedback failed", error);
      setAiStatus("error");
      setAiError(error?.message || "Could not generate register feedback.");
    }
  }

  return (
    <main className="ote-training-page ote-register-gap-page">
      <Seo
        title="OTE Email Register Gap Trainer | Seif English"
        description="Practise formal and informal OTE email register through parallel gap-fill tasks."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(trainingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to email training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 1</p>
        <h1>Register Gap Trainer</h1>
        <p>Complete parallel emails by choosing words that carry the same meaning in a different register.</p>
      </header>

      <div className="ote-register-tabs" role="tablist" aria-label="Register gap tasks">
        {TASKS.map((task) => (
          <button
            key={task.id}
            type="button"
            className={task.id === activeTask.id ? "is-active" : ""}
            onClick={() => switchTask(task.id)}
          >
            {task.label}
          </button>
        ))}
      </div>

      <section className="ote-register-gap-shell">
        <div className="ote-register-gap-head">
          <div>
            <p className="ote-kicker">{activeTask.label}</p>
            <h2>{activeTask.title}</h2>
            <p>{activeTask.prompt}</p>
          </div>
          {checked ? (
            <div className="ote-register-score" aria-live="polite">
              <strong>{score.correct}/{score.total}</strong>
              <span>accepted</span>
            </div>
          ) : null}
        </div>

        {activeTask.id === "formal-to-informal" ? (
          <FormalToInformalTask
            task={activeTask}
            answers={currentAnswers}
            checked={checked}
            showKey={showKey}
            onChange={updateGap}
          />
        ) : (
          <InformalToFormalTask
            task={activeTask}
            answers={currentAnswers}
            checked={checked}
            showKey={showKey}
            onChange={updateGap}
          />
        )}

        <div className="ote-recorder-actions ote-register-actions">
          <button type="button" onClick={() => setChecked(true)}>
            <CheckCircle2 size={18} aria-hidden="true" />
            Check answers
          </button>
          <button type="button" onClick={() => setShowKey((prev) => !prev)}>
            <Eye size={18} aria-hidden="true" />
            {showKey ? "Hide suggestions" : "Show suggestions"}
          </button>
          <button type="button" disabled={aiStatus === "loading"} onClick={handleAiFeedback}>
            <FileText size={18} aria-hidden="true" />
            {aiStatus === "loading" ? "Checking register..." : "Get AI feedback"}
          </button>
          <button type="button" onClick={resetTask}>
            <RotateCcw size={18} aria-hidden="true" />
            Reset task
          </button>
        </div>

        <RegisterFeedback task={activeTask} answers={currentAnswers} checked={checked} showKey={showKey} />
        <AiRegisterFeedback feedback={aiFeedback} status={aiStatus} error={aiError} />
      </section>
    </main>
  );
}

function GapInput({ number, task, answers, checked, showKey, onChange, width = "8.5rem" }) {
  const gap = task.gaps[number];
  const value = answers[number] || "";
  const correct = checked && isCorrect(value, gap);
  const wrong = checked && value.trim() && !correct;
  return (
    <span className={`ote-gap-wrap ${correct ? "is-correct" : wrong ? "is-wrong" : ""}`} style={{ "--gap-width": width }}>
      <span className="ote-gap-number">({number})</span>
      <input
        value={value}
        aria-label={`Gap ${number}`}
        onChange={(event) => onChange(number, event.target.value)}
        spellCheck={false}
      />
      {showKey ? <span className="ote-gap-key">{gap.suggestion}</span> : null}
    </span>
  );
}

function FormalToInformalTask(props) {
  return (
    <div className="ote-register-email-grid">
      <EmailPanel title={props.task.leftTitle} subtitle={props.task.leftSubtitle}>
        <p>Dear Visitor,</p>
        <p>I am writing to confirm your booking for the guided nature trail this weekend.</p>
        <p>We are delighted that you have chosen to visit the national park.</p>
        <p>
          In response to your inquiry, the most convenient method of transport to the site is the local bus, which
          departs hourly from the central station.
        </p>
        <p>
          Please note that we anticipate inclement weather conditions. Consequently, it is advisable to wear
          waterproof attire.
        </p>
        <p>Lastly, we would be pleased to accommodate your cousin within the tour group.</p>
        <p>Yours sincerely,</p>
        <p>Brenda Vance</p>
      </EmailPanel>

      <EmailPanel title={props.task.rightTitle} subtitle={props.task.rightSubtitle}>
        <p>Hi Charlie,</p>
        <p>
          I'm just writing to <span className="ote-gap-example">(0) check in</span> about our nature walk this weekend.
          I'm so <GapInput number="1" {...props} /> to visit the national park!
        </p>
        <p>
          You asked about the best way to get there. We should probably <GapInput number="2" {...props} /> the local
          bus - it leaves every hour from the main station.
        </p>
        <p>
          Also, it looks like it's going to <GapInput number="3" {...props} />, so make sure you{" "}
          <GapInput number="4" {...props} /> a raincoat or something waterproof.
        </p>
        <p>
          Finally, is it okay if my cousin Danny <GapInput number="5" {...props} width="11rem" /> us? He loves nature
          and really wants to come.
        </p>
        <p>
          <GapInput number="6" {...props} width="7.5rem" /> for now,
        </p>
        <p>Alex</p>
      </EmailPanel>
    </div>
  );
}

function InformalToFormalTask(props) {
  return (
    <div className="ote-register-email-grid">
      <EmailPanel title={props.task.leftTitle} subtitle={props.task.leftSubtitle}>
        <p>Hi Leo,</p>
        <p>I'm writing about our trip next month. It's great that the college is paying for our museum tickets!</p>
        <p>
          Anyway, about where to eat - I think the museum cafe looks like the best option because it's cheap and nearby.
        </p>
        <p>
          Also, don't worry about the booking forms. I can collect them from everyone and bring them to the office on
          Friday.
        </p>
        <p>See you later,</p>
        <p>Alex</p>
      </EmailPanel>

      <EmailPanel title={props.task.rightTitle} subtitle={props.task.rightSubtitle}>
        <p>Dear Mr. Gilbert,</p>
        <p>
          I am writing with <span className="ote-gap-example">(0) reference</span> to our upcoming study trip next
          month. I would like to express our gratitude for the college's decision to{" "}
          <GapInput number="1" {...props} /> our museum admission fees.
        </p>
        <p>
          Regarding our dining arrangements, I would like to <GapInput number="2" {...props} /> that we utilize the
          museum cafe, as it is both <GapInput number="3" {...props} /> and located in close proximity.
        </p>
        <p>
          Furthermore, you do not need to take responsibility for the booking forms. I shall{" "}
          <GapInput number="4" {...props} /> them from the students and <GapInput number="5" {...props} /> them to your
          office this Friday.
        </p>
        <p>
          Yours <GapInput number="6" {...props} width="7.5rem" />,
        </p>
        <p>Alex Reed</p>
      </EmailPanel>
    </div>
  );
}

function IdentificationCard({ item, index, selected, onChoose }) {
  const answered = !!selected;
  const correct = selected === item.register;
  return (
    <article className={`ote-register-id-card ${answered ? (correct ? "is-correct" : "is-wrong") : ""}`}>
      <span>Sentence {index + 1}</span>
      <p>{item.phrase}</p>
      <div className="ote-register-choice-row">
        {["formal", "informal"].map((choice) => (
          <button
            key={choice}
            type="button"
            className={selected === choice ? "is-selected" : ""}
            onClick={() => onChoose(item.id, choice)}
          >
            {choice}
          </button>
        ))}
      </div>
      {answered ? (
        <div className="ote-register-card-feedback">
          <strong>{correct ? "Correct" : `This is ${item.register}.`}</strong>
          <p>{item.why}</p>
          <p><b>Opposite register:</b> {item.alternative}</p>
        </div>
      ) : null}
    </article>
  );
}

function RewriteCard({ item, index, answer, checked, onChange, onCheck }) {
  const local = analyzeRewrite(answer, item);
  return (
    <article className={`ote-register-rewrite-card ${checked ? `is-${local.status}` : ""}`}>
      <div className="ote-register-rewrite-top">
        <span>Rewrite {index + 1}</span>
        <strong>{item.functionLabel}</strong>
      </div>
      <p className="ote-register-prompt">
        <b>{item.sourceRegister}:</b> {item.prompt}
      </p>
      <label>
        <span>Make it {item.targetRegister}</span>
        <textarea
          value={answer}
          onChange={(event) => onChange(item.id, event.target.value)}
          placeholder={`Write a ${item.targetRegister} version...`}
          spellCheck={false}
        />
      </label>
      <div className="ote-register-rewrite-actions">
        <button type="button" onClick={() => onCheck(item.id)}>
          <CheckCircle2 size={16} aria-hidden="true" />
          Check
        </button>
      </div>
      {checked ? (
        <div className="ote-register-card-feedback">
          <strong>{local.title}</strong>
          <p>{local.message}</p>
          <p><b>Suggested answer:</b> {item.suggestedAnswers[0]}</p>
          {item.suggestedAnswers[1] ? <p><b>Also possible:</b> {item.suggestedAnswers[1]}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function analyzeRewrite(answer, item) {
  const text = normalizeAnswer(answer);
  if (!text) {
    return {
      status: "empty",
      title: "Add your rewrite first",
      message: "Try to keep the meaning but change the register.",
    };
  }
  const hasContraction = /\b\w+'(m|re|ve|d|ll|s|t)\b/i.test(answer);
  const hasFormalMarker = /\b(would|could|please|regret|apologize|apologies|regarding|concerning|delighted|pleased|assist|unable|sincerely|response|inform|propose|consider)\b/i.test(answer);
  const hasInformalMarker = /\b(just|thanks|cheers|awesome|grab|stuff|sort|reckon|let me know|give you a hand|swamped|dodgy|soon|best)\b/i.test(answer);
  const targetFormal = item.targetRegister === "formal";

  if (targetFormal && (hasFormalMarker || !hasContraction) && !hasInformalMarker) {
    return { status: "good", title: "Good formal direction", message: "Your answer is moving toward a formal register. Compare it with the model for precision and natural phrasing." };
  }
  if (!targetFormal && (hasInformalMarker || hasContraction) && !/\b(regarding|concerning|hereby|sincerely|documentation)\b/i.test(answer)) {
    return { status: "good", title: "Good informal direction", message: "Your answer sounds more conversational. Compare it with the model for idiomatic phrasing." };
  }
  return {
    status: "mixed",
    title: "Check the register",
    message: targetFormal
      ? "Try using more neutral vocabulary, fewer contractions, and a more polite structure."
      : "Try making it simpler, more direct, and more conversational.",
  };
}

function EmailPanel({ title, subtitle, children }) {
  return (
    <article className="ote-register-email-panel">
      <div className="ote-register-email-title">
        <span>{subtitle}</span>
        <h3>{title}</h3>
      </div>
      <div className="ote-register-email-body">{children}</div>
    </article>
  );
}

function RegisterFeedback({ task, answers, checked, showKey }) {
  if (!checked && !showKey) return null;
  return (
    <div className="ote-register-feedback">
      {Object.entries(task.gaps).map(([number, gap]) => {
        const value = answers[number] || "";
        const correct = isCorrect(value, gap);
        return (
          <article key={number} className={checked ? (correct ? "is-correct" : "is-wrong") : ""}>
            <strong>Gap {number}: {gap.suggestion}</strong>
            <p>{gap.note}</p>
          </article>
        );
      })}
    </div>
  );
}

function AiRegisterFeedback({ feedback, status, error }) {
  if (status === "idle") return null;
  if (status === "loading") {
    return (
      <section className="ote-register-ai-feedback is-loading" aria-live="polite">
        <strong>Checking syntax, lexis, and register...</strong>
      </section>
    );
  }
  if (status === "error") {
    return (
      <section className="ote-register-ai-feedback is-error" aria-live="polite">
        <strong>Feedback unavailable</strong>
        <p>{error}</p>
      </section>
    );
  }
  if (!feedback) return null;

  return (
    <section className="ote-register-ai-feedback" aria-live="polite">
      <div className="ote-register-ai-head">
        <div>
          <p className="ote-kicker">AI register feedback</p>
          <h3>{feedback.overall?.registerControl?.replace(/_/g, " ") || "Register review"}</h3>
        </div>
        <p>{feedback.overall?.summary}</p>
      </div>
      <div className="ote-register-ai-gap-list">
        {(feedback.gaps || []).map((gap) => (
          <article key={gap.number} className={`is-${gap.verdict}`}>
            <div className="ote-register-ai-gap-top">
              <strong>Gap {gap.number}: {gap.studentAnswer || "blank"}</strong>
              <span>{String(gap.verdict || "").replace(/_/g, " ")}</span>
            </div>
            <p><b>Register:</b> {gap.register}</p>
            <p><b>Syntax:</b> {gap.syntax}</p>
            <p><b>Lexis:</b> {gap.lexis}</p>
            {shouldShowBetterAnswer(gap) ? <p><b>Try:</b> {gap.betterAnswer}</p> : null}
            <p>{gap.explanation}</p>
          </article>
        ))}
      </div>
      {feedback.overall?.mainAdvice ? <p className="ote-register-ai-advice">{feedback.overall.mainAdvice}</p> : null}
      {feedback.teacherComment ? <p className="ote-register-ai-advice">{feedback.teacherComment}</p> : null}
    </section>
  );
}

function AiRewriteFeedback({ feedback, status, error }) {
  if (status === "idle") return null;
  if (status === "loading") {
    return (
      <section className="ote-register-ai-feedback is-loading" aria-live="polite">
        <strong>Checking your reformulations...</strong>
      </section>
    );
  }
  if (status === "error") {
    return (
      <section className="ote-register-ai-feedback is-error" aria-live="polite">
        <strong>Feedback unavailable</strong>
        <p>{error}</p>
      </section>
    );
  }
  if (!feedback) return null;

  return (
    <section className="ote-register-ai-feedback" aria-live="polite">
      <div className="ote-register-ai-head">
        <div>
          <p className="ote-kicker">AI rewrite feedback</p>
          <h3>{feedback.overall?.registerControl?.replace(/_/g, " ") || "Rewrite review"}</h3>
        </div>
        <p>{feedback.overall?.summary}</p>
      </div>
      <div className="ote-register-ai-gap-list">
        {(feedback.items || []).map((item) => (
          <article key={item.id} className={`is-${item.verdict}`}>
            <div className="ote-register-ai-gap-top">
              <strong>{item.id?.replace("rw-", "Rewrite ") || "Rewrite"}</strong>
              <span>{String(item.verdict || "").replace(/_/g, " ")}</span>
            </div>
            <p><b>Register:</b> {item.register}</p>
            <p><b>Syntax:</b> {item.syntax}</p>
            <p><b>Lexis:</b> {item.lexis}</p>
            {shouldShowRewriteSuggestion(item) ? <p><b>Try:</b> {item.suggestedRewrite}</p> : null}
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>
      {feedback.overall?.mainAdvice ? <p className="ote-register-ai-advice">{feedback.overall.mainAdvice}</p> : null}
      {feedback.teacherComment ? <p className="ote-register-ai-advice">{feedback.teacherComment}</p> : null}
    </section>
  );
}

function shouldShowBetterAnswer(gap) {
  const verdict = String(gap?.verdict || "");
  const better = normalizeAnswer(gap?.betterAnswer || "");
  const student = normalizeAnswer(gap?.studentAnswer || "");
  if (!better || better === student) return false;
  return verdict !== "excellent";
}

function shouldShowRewriteSuggestion(item) {
  const verdict = String(item?.verdict || "");
  const suggestion = normalizeAnswer(item?.suggestedRewrite || "");
  const student = normalizeAnswer(item?.studentAnswer || "");
  if (!suggestion || suggestion === student) return false;
  return verdict !== "excellent";
}
