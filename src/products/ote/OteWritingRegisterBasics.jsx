import React, { useMemo, useState } from "react";
import { ArrowLeft, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { requestOteRegisterRewriteFeedback } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

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
    keyFeatures: ["would like to propose", "perhaps we could", "recommend is acceptable", "as an alternative"],
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
    keyFeatures: ["although/however", "I regret", "unable to", "professional commitments", "elevated formal phrasing is acceptable"],
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
    suggestedAnswers: ["Cheers,", "Best,", "See you soon,", "Speak soon,"],
    keyFeatures: ["short friendly closing", "Cheers", "Best", "See you soon", "Speak soon"],
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

function blankRewriteState() {
  return REWRITE_ITEMS.reduce((acc, item) => {
    acc[item.id] = "";
    return acc;
  }, {});
}

function shuffleOnce(list) {
  const shuffled = [...list];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export default function OteWritingRegisterBasics({ user, onRequireSignIn, nativeRoutes = false }) {
  const navigate = useNavigate();
  const [identificationItems] = useState(() => shuffleOnce(IDENTIFICATION_ITEMS));
  const [rewriteItems] = useState(() => shuffleOnce(REWRITE_ITEMS));
  const [identificationAnswers, setIdentificationAnswers] = useState({});
  const [rewriteAnswers, setRewriteAnswers] = useState(() => blankRewriteState());
  const [rewriteSuggestionsShown, setRewriteSuggestionsShown] = useState({});
  const [rewriteAiStatus, setRewriteAiStatus] = useState("idle");
  const [rewriteAiError, setRewriteAiError] = useState("");
  const [rewriteAiFeedback, setRewriteAiFeedback] = useState(null);
  const trainingPath = getSitePath(nativeRoutes ? "/writing/training/email" : "/ote/writing/training/email");
  const identificationScore = useMemo(
    () => identificationItems.filter((item) => identificationAnswers[item.id] === item.register).length,
    [identificationAnswers, identificationItems]
  );
  const rewriteCompleted = useMemo(
    () => rewriteItems.filter((item) => rewriteAnswers[item.id]?.trim()).length,
    [rewriteAnswers, rewriteItems]
  );

  function chooseIdentification(itemId, value) {
    setIdentificationAnswers((prev) => ({ ...prev, [itemId]: value }));
  }

  function updateRewrite(itemId, value) {
    setRewriteAnswers((prev) => ({ ...prev, [itemId]: value }));
    setRewriteAiFeedback(null);
    setRewriteAiError("");
    setRewriteAiStatus("idle");
  }

  function showRewriteSuggestion(itemId) {
    setRewriteSuggestionsShown((prev) => ({ ...prev, [itemId]: true }));
  }

  function buildRewritePayload() {
    return {
      taskId: "register-rewrite",
      title: "Register reformulation practice",
      instructions: "Rewrite each prompt into the opposite register while preserving the original meaning.",
      items: rewriteItems.map((item) => ({
        id: item.id,
        functionLabel: item.functionLabel,
        sourceRegister: item.sourceRegister,
        targetRegister: item.targetRegister,
        prompt: item.prompt,
        studentAnswer: rewriteAnswers[item.id] || "",
        suggestedAnswers: item.suggestedAnswers,
        keyFeatures: item.keyFeatures,
      })),
    };
  }

  async function handleRewriteAiFeedback() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    if (!rewriteCompleted) {
      setRewriteAiStatus("error");
      setRewriteAiError("Add at least one rewrite before requesting feedback.");
      return;
    }

    setRewriteAiStatus("loading");
    setRewriteAiError("");
    setRewriteAiFeedback(null);

    try {
      const result = await requestOteRegisterRewriteFeedback(buildRewritePayload());
      setRewriteAiFeedback(result?.feedback || null);
      setRewriteAiStatus("ready");
    } catch (error) {
      console.warn("[OTE register rewrite] AI feedback failed", error);
      setRewriteAiStatus("error");
      setRewriteAiError(error?.message || "Could not generate rewrite feedback.");
    }
  }

  return (
    <main className="ote-training-page ote-register-gap-page">
      <Seo
        title="OTE Email Register Basics | Seif English"
        description="Practise identifying and rewriting formal and informal OTE email language."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(trainingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to email training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 1</p>
        <h1>Register Basics</h1>
        <p>Notice formal and informal language, then reformulate sentences for the opposite register.</p>
      </header>

      <section className="ote-register-lesson-section">
        <div className="ote-register-lesson-head">
          <div>
            <p className="ote-kicker">Exercise 1</p>
            <h2>Formal or informal?</h2>
            <p>Choose the register for each sentence. Feedback appears immediately after you answer.</p>
          </div>
          <div className="ote-register-score">
            <strong>{identificationScore}/{identificationItems.length}</strong>
            <span>correct</span>
          </div>
        </div>
        <div className="ote-register-identification-grid">
          {identificationItems.map((item, index) => (
            <IdentificationCard
              key={item.id}
              item={item}
              index={index}
              selected={identificationAnswers[item.id]}
              onChoose={chooseIdentification}
            />
          ))}
        </div>
      </section>

      <section className="ote-register-lesson-section">
        <div className="ote-register-lesson-head">
          <div>
            <p className="ote-kicker">Exercise 2</p>
            <h2>Rewrite in the opposite register</h2>
            <p>Write your version, reveal a suggested answer, then request AI feedback when you want a fuller review.</p>
          </div>
          <div className="ote-register-score">
            <strong>{rewriteCompleted}/{rewriteItems.length}</strong>
            <span>answered</span>
          </div>
        </div>
        <div className="ote-register-rewrite-list">
          {rewriteItems.map((item, index) => (
            <RewriteCard
              key={item.id}
              item={item}
              index={index}
              answer={rewriteAnswers[item.id] || ""}
              suggestionShown={!!rewriteSuggestionsShown[item.id]}
              onChange={updateRewrite}
              onShowSuggestion={showRewriteSuggestion}
            />
          ))}
        </div>
        <div className="ote-recorder-actions ote-register-actions">
          <button type="button" disabled={rewriteAiStatus === "loading"} onClick={handleRewriteAiFeedback}>
            <FileText size={18} aria-hidden="true" />
            {rewriteAiStatus === "loading" ? "Checking rewrites..." : "Get AI feedback on rewrites"}
          </button>
        </div>
        <AiRewriteFeedback
          feedback={rewriteAiFeedback}
          status={rewriteAiStatus}
          error={rewriteAiError}
          items={rewriteItems}
          answers={rewriteAnswers}
        />
      </section>
    </main>
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

function RewriteCard({ item, index, answer, suggestionShown, onChange, onShowSuggestion }) {
  return (
    <article className="ote-register-rewrite-card">
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
        <button type="button" onClick={() => onShowSuggestion(item.id)}>
          <Eye size={16} aria-hidden="true" />
          Show suggestion
        </button>
      </div>
      {suggestionShown ? (
        <div className="ote-register-card-feedback">
          <p><b>Suggested answer:</b> {item.suggestedAnswers[0]}</p>
          {item.suggestedAnswers[1] ? <p><b>Also possible:</b> {item.suggestedAnswers[1]}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function AiRewriteFeedback({ feedback, status, error, items = [], answers = {} }) {
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
  const feedbackById = (feedback.items || []).reduce((acc, item) => {
    if (item?.id) acc[item.id] = item;
    return acc;
  }, {});

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
        {items.map((sourceItem, index) => {
          const item = feedbackById[sourceItem.id];
          if (!item) return null;
          const studentAnswer = answers[sourceItem.id] || item.studentAnswer || "";
          return (
          <article key={sourceItem.id} className={`is-${item.verdict}`}>
            <div className="ote-register-ai-gap-top">
              <strong>Rewrite {index + 1}: {sourceItem.functionLabel}</strong>
              <span>{String(item.verdict || "").replace(/_/g, " ")}</span>
            </div>
            <p><b>Prompt:</b> {sourceItem.prompt}</p>
            <p><b>Your answer:</b> {studentAnswer || "blank"}</p>
            <p><b>Register:</b> {item.register}</p>
            <p><b>Syntax:</b> {item.syntax}</p>
            <p><b>Lexis:</b> {item.lexis}</p>
            {shouldShowRewriteSuggestion(item) ? <p><b>Try:</b> {item.suggestedRewrite}</p> : null}
            <p>{item.explanation}</p>
          </article>
        );
        })}
      </div>
      {feedback.overall?.mainAdvice ? <p className="ote-register-ai-advice">{feedback.overall.mainAdvice}</p> : null}
      {feedback.teacherComment ? <p className="ote-register-ai-advice">{feedback.teacherComment}</p> : null}
    </section>
  );
}

function shouldShowRewriteSuggestion(item) {
  const verdict = String(item?.verdict || "");
  const suggestion = normalizeAnswer(item?.suggestedRewrite || "");
  const student = normalizeAnswer(item?.studentAnswer || "");
  if (!suggestion || suggestion === student) return false;
  return verdict !== "excellent";
}
