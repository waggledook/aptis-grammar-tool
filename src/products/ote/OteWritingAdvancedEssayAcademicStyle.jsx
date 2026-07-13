import React, { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  RotateCcw,
  Scale,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import {
  requestOteAdvancedAcademicStyleFeedback,
  saveOteAdvancedAcademicStyleRewrites,
  saveWritingAiFeedback,
} from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const academicChoices = [
  {
    id: "academic-1",
    prompt: "Choose the version that is formal, precise and natural.",
    options: [
      "Loads of old public buildings are just sitting around doing nothing.",
      "A considerable multitude of publicly possessed edifices remain in a condition of non-utilisation.",
      "Many publicly owned buildings remain unused for extended periods.",
    ],
    answer: "Many publicly owned buildings remain unused for extended periods.",
    feedback:
      "This replaces conversational language without becoming inflated. ‘Publicly owned buildings’ and ‘remain unused’ are precise and natural.",
  },
  {
    id: "academic-2",
    prompt: "Choose the version that is formal, precise and natural.",
    options: [
      "It is incontrovertibly apparent that the totality of citizens would derive substantial benefit from such facilities.",
      "Such facilities could benefit many residents, particularly in areas with limited access to local services.",
      "Obviously, everybody would benefit from having more community centres.",
    ],
    answer: "Such facilities could benefit many residents, particularly in areas with limited access to local services.",
    feedback:
      "This avoids claiming that the benefit is obvious or universal and specifies who is most likely to benefit.",
  },
  {
    id: "academic-3",
    prompt: "Choose the version that is formal, precise and natural.",
    options: [
      "Maintaining an unused property can place a continuing burden on public finances.",
      "It costs a ton of money to look after a building that nobody uses.",
      "The maintenance of non-operational architectural assets precipitates considerable fiscal ramifications.",
    ],
    answer: "Maintaining an unused property can place a continuing burden on public finances.",
    feedback:
      "The idea is formal but remains easy to understand. The modal ‘can’ also avoids suggesting that the effect is identical in every case.",
  },
  {
    id: "academic-4",
    prompt: "Choose the version that is formal, precise and natural.",
    options: [
      "If you ask me, councils should sort these buildings out instead of flogging them off.",
      "Local authorities should consider converting suitable buildings rather than selling them immediately.",
      "It is the contention of the present writer that municipal bodies should undertake the repurposing of the aforementioned premises.",
    ],
    answer: "Local authorities should consider converting suitable buildings rather than selling them immediately.",
    feedback:
      "This removes conversational and highly personal language while avoiding the artificial phrase ‘the present writer’.",
  },
  {
    id: "academic-5",
    prompt: "Choose the version that is formal, precise and natural.",
    options: [
      "Community centres will definitely solve loneliness in every neighbourhood.",
      "Community facilities might perhaps potentially contribute in some limited way to problems associated with loneliness.",
      "Community facilities may help reduce social isolation by creating regular opportunities for residents to meet.",
    ],
    answer: "Community facilities may help reduce social isolation by creating regular opportunities for residents to meet.",
    feedback:
      "This makes a measured claim and explains the mechanism. It is cautious without becoming weak or evasive.",
  },
  {
    id: "academic-6",
    prompt: "Choose the version that is formal, precise and natural.",
    options: [
      "By hosting classes, advice services and social events, these centres can respond to several local needs.",
      "These centres provide classes. They provide advice. They are places where people meet. This is useful.",
      "Through the provision of the facilitation of educational, advisory and interpersonal activities, multiple requirements may be responded to.",
    ],
    answer: "By hosting classes, advice services and social events, these centres can respond to several local needs.",
    feedback:
      "This connects related examples efficiently. The inflated alternative uses too many abstract nouns and is harder to understand.",
  },
];

const styleProblems = [
  {
    id: "problem-1",
    sentence: "There are loads of things local people could do in these buildings.",
    highlights: ["loads of things"],
    primary: "Vague language",
    secondary: "Also slightly conversational",
    feedback: "‘Loads of things’ gives the reader no useful information. Name the activities or services being discussed.",
    upgrade: "The buildings could accommodate training courses, advice services and cultural events.",
  },
  {
    id: "problem-2",
    sentence: "Everybody knows that private developers only care about making money.",
    highlights: ["Everybody knows", "only care about making money"],
    primary: "Unsupported generalisation",
    secondary: "Also overly absolute",
    feedback: "The claim assumes that all developers have the same priorities and that the reader already agrees.",
    upgrade: "Selling the buildings to private developers may prioritise short-term revenue over their potential social value.",
  },
  {
    id: "problem-3",
    sentence: "If you live alone, you could go there and meet loads of new people.",
    highlights: ["you", "loads of new people"],
    primary: "Direct address",
    secondary: "Also conversational and vague",
    feedback: "Addressing the reader as ‘you’ makes the sentence sound conversational and personal.",
    upgrade: "People living alone could use these facilities to participate in local activities and develop social connections.",
  },
  {
    id: "problem-4",
    sentence: "I reckon councils should sort the problem out as soon as possible.",
    highlights: ["I reckon", "sort the problem out"],
    primary: "Conversational language",
    secondary: "Also personally framed",
    feedback: "‘I reckon’ and ‘sort the problem out’ are more natural in speech than in an academic essay.",
    upgrade: "Local authorities should address the problem without unnecessary delay.",
  },
  {
    id: "problem-5",
    sentence: "Selling these incredibly valuable buildings would be a complete disaster for local people.",
    highlights: ["incredibly valuable", "complete disaster"],
    primary: "Emotional exaggeration",
    secondary: "Also an unsupported overstatement",
    feedback: "‘Incredibly valuable’ and ‘complete disaster’ make the claim sound emotional rather than reasoned.",
    upgrade: "Selling buildings with significant community potential could reduce the availability of local services.",
  },
  {
    id: "problem-6",
    sentence: "In my opinion, I personally believe that community relationships are extremely important.",
    highlights: ["In my opinion, I personally believe", "extremely important"],
    primary: "Overly personal framing",
    secondary: "Also relies on unnecessary intensification",
    feedback: "The sentence spends more time announcing the opinion than explaining it.",
    upgrade: "Strong community relationships can improve social support and encourage greater local participation.",
  },
  {
    id: "problem-7",
    sentence: "And another thing is that these buildings could be used for adult education.",
    highlights: ["And another thing is"],
    primary: "Weak paragraph connection",
    secondary: "Also conversational",
    feedback: "‘And another thing is’ is conversational and does not show how the point relates to the previous argument.",
    upgrade: "In addition to providing social spaces, the buildings could support adult education.",
  },
  {
    id: "problem-8",
    sentence: "The facilitation of community-oriented utilisation could result in the enhancement of interpersonal connectedness.",
    highlights: ["facilitation of community-oriented utilisation", "enhancement of interpersonal connectedness"],
    primary: "Unnecessarily complicated language",
    secondary: "Also relies too heavily on abstract nouns",
    feedback: "The sentence relies on abstract nouns where clear verbs would communicate the idea more effectively.",
    upgrade: "Using the buildings for community activities could help residents form stronger relationships.",
  },
];

const rewriteItems = [
  {
    id: "rewrite-1",
    source: "Councils should not just flog these places off to the highest bidder.",
    suggestion: "Local authorities should not automatically sell these properties to the highest bidder.",
    features: ["‘local authorities’ is slightly more formal", "‘sell’ replaces ‘flog’", "‘automatically’ clarifies the criticism"],
  },
  {
    id: "rewrite-2",
    source: "These centres would be great for old people who have nothing to do.",
    suggestion: "These centres could provide older residents with accessible social and educational activities.",
    features: ["respectful, neutral reference to older residents", "specific explanation of the benefit", "‘could’ avoids an absolute prediction"],
  },
  {
    id: "rewrite-3",
    source: "Everyone knows private companies only care about making money.",
    suggestion: "Private development may generate revenue, but it does not necessarily address the wider social needs of the area.",
    features: ["removes ‘everyone knows’", "avoids assumptions about every company", "creates a balanced contrast"],
  },
  {
    id: "rewrite-4",
    source: "You could go there to learn stuff or get help with things.",
    suggestion: "Residents could use the facilities to attend courses or access practical support services.",
    features: ["removes direct address", "replaces ‘stuff’ and ‘things’ with precise examples", "uses natural academic collocations"],
  },
  {
    id: "rewrite-5",
    source: "Fixing the buildings up would cost loads.",
    suggestion: "Renovating the buildings could require substantial public investment.",
    features: ["‘renovating’ replaces conversational wording", "‘substantial public investment’ specifies the issue", "‘could’ makes the claim appropriately cautious"],
  },
  {
    id: "rewrite-6",
    source: "This is a massive problem for communities these days.",
    suggestion: "The shortage of accessible public spaces is a significant problem in some communities.",
    features: ["identifies what ‘this’ refers to", "replaces ‘massive’ with ‘significant’", "avoids claiming every community is affected"],
  },
  {
    id: "rewrite-7",
    source: "And another thing is that people might get to know each other better.",
    suggestion: "Such spaces may also strengthen community relationships by encouraging regular interaction between residents.",
    features: ["creates a link with the previous idea", "uses precise topic vocabulary", "explains how the benefit could occur"],
  },
  {
    id: "rewrite-8",
    source: "At the end of the day, using the buildings for local people is obviously the best idea.",
    suggestion: "Overall, community use may offer greater long-term value than an immediate sale, particularly in areas with limited public services.",
    features: ["replaces a conversational concluding phrase", "removes ‘obviously’", "qualifies and explains the judgement"],
  },
];

const paragraphIssueCategories = {
  conversational: {
    label: "Conversational language",
    description: "Natural in speech, but too casual or formulaic here.",
  },
  vague: {
    label: "Vague wording",
    description: "The reader needs more precise meaning or detail.",
  },
  unsupported: {
    label: "Unsupported claims",
    description: "The language assumes agreement or makes the claim too absolute.",
  },
  overstated: {
    label: "Emotional or overstated",
    description: "The wording is stronger or more emotional than the argument supports.",
  },
  control: {
    label: "Argument control",
    description: "The phrasing weakens the connection or focuses unnecessarily on the writer.",
  },
};

const paragraphIssues = [
  { id: "p-1", phrase: "Loads of", category: "conversational", note: "Too conversational for an academic discussion." },
  { id: "p-2", phrase: "sitting around doing nothing", category: "conversational", note: "Informal; ‘remain unused’ would be more controlled." },
  { id: "p-3", phrase: "massive waste", category: "overstated", note: "Exaggerates a point that has not yet been explained." },
  { id: "p-4", phrase: "all sorts of things", category: "vague", note: "Does not identify the activities or services intended." },
  { id: "p-5", phrase: "obviously", category: "unsupported", note: "Assumes that the reader already agrees." },
  { id: "p-6", phrase: "everyone", category: "unsupported", note: "Generalises about all local residents without support." },
  { id: "p-7", phrase: "fix loneliness", category: "overstated", note: "Overstates what a community centre could realistically achieve." },
  { id: "p-8", phrase: "And another thing is", category: "control", note: "Does not show how the next point relates to the argument." },
  { id: "p-9", phrase: "private companies only care about making money", category: "unsupported", note: "Makes a sweeping claim about every private company." },
  { id: "p-10", phrase: "terrible", category: "overstated", note: "Gives an emotional judgement instead of a specific consequence." },
  { id: "p-11", phrase: "I think", category: "control", note: "Announces an opinion that the argument should make clear." },
  { id: "p-12", phrase: "definitely", category: "unsupported", note: "Makes the recommendation too absolute." },
  { id: "p-13", phrase: "sort this out", category: "conversational", note: "Sounds conversational and does not identify the action required." },
  { id: "p-14", phrase: "now more than ever", category: "control", note: "Adds urgency without supplying evidence." },
];

const originalParagraph =
  "Loads of old public buildings are sitting around doing nothing, which is a massive waste. If councils turned them into community centres, people could go there and do all sorts of things. This would obviously make everyone happier and fix loneliness in the area. And another thing is that private companies only care about making money, so selling the buildings to them would be terrible. I think councils should definitely sort this out because communities need places like this now more than ever.";

const modelParagraph =
  "Leaving publicly owned buildings unused can represent a significant waste of existing resources. Converting suitable properties into community centres could provide space for educational activities, advice services and social events. Such facilities may also reduce isolation by creating regular opportunities for residents to meet. Although selling the buildings to private developers could generate immediate revenue, conversion may offer greater long-term social value in areas where accessible public facilities are limited.";

const modelStrengths = [
  "makes each claim more precise",
  "replaces emotional language with measured evaluation",
  "explains how community use could benefit residents",
  "acknowledges a reasonable opposing argument",
  "connects the financial and social considerations",
  "uses complex structures only where they clarify the argument",
];

const finalChecks = [
  "Is any language more suitable for conversation than an academic essay?",
  "Have I used vague words where I could be specific?",
  "Have I presented opinions as unquestionable facts?",
  "Have I made claims that are stronger than my evidence?",
  "Have I announced my opinion repeatedly instead of developing it?",
  "Are any sentences complicated simply to sound advanced?",
  "Can the reader follow the relationship between my ideas?",
];

function countWords(value) {
  const text = String(value || "").trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function ChoiceQuestion({ number, item, selected, onSelect }) {
  const answered = Boolean(selected);
  const correct = selected === item.answer;
  return (
    <article className={`ote-training-quiz-item ${answered ? (correct ? "is-correct" : "is-wrong") : ""}`}>
      <p className="ote-kicker">Sentence {number}</p>
      <h3>{item.prompt}</h3>
      <div className="ote-training-options">
        {item.options.map((option, index) => {
          const isAnswer = option === item.answer;
          const isSelected = option === selected;
          return (
            <button
              key={option}
              type="button"
              className={`ote-training-option ${isSelected ? "is-selected" : ""} ${answered && isAnswer ? "is-answer" : ""}`}
              onClick={() => onSelect(item.id, option)}
            >
              <span><strong>Option {String.fromCharCode(65 + index)}. </strong>{option}</span>
              {answered && isAnswer ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              {answered && isSelected && !isAnswer ? <XCircle size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? <p className="ote-training-feedback"><strong>{correct ? "Correct." : "Not quite."}</strong> {item.feedback}</p> : null}
    </article>
  );
}

function HighlightedSentence({ sentence, highlights }) {
  const parts = [];
  let cursor = 0;
  let key = 0;

  while (cursor < sentence.length) {
    const next = highlights
      .map((phrase) => ({ phrase, index: sentence.indexOf(phrase, cursor) }))
      .filter((match) => match.index >= 0)
      .sort((a, b) => a.index - b.index)[0];

    if (!next) {
      parts.push(<React.Fragment key={`text-${key++}`}>{sentence.slice(cursor)}</React.Fragment>);
      break;
    }
    if (next.index > cursor) {
      parts.push(<React.Fragment key={`text-${key++}`}>{sentence.slice(cursor, next.index)}</React.Fragment>);
    }
    parts.push(<mark key={`mark-${key++}`}>{next.phrase}</mark>);
    cursor = next.index + next.phrase.length;
  }

  return parts;
}

function AnnotatedParagraph({ text, issues }) {
  const parts = [];
  let cursor = 0;
  let key = 0;

  while (cursor < text.length) {
    const next = issues
      .map((issue) => ({ ...issue, index: text.indexOf(issue.phrase, cursor) }))
      .filter((issue) => issue.index >= 0)
      .sort((a, b) => a.index - b.index)[0];

    if (!next) {
      parts.push(<React.Fragment key={`paragraph-text-${key++}`}>{text.slice(cursor)}</React.Fragment>);
      break;
    }
    if (next.index > cursor) {
      parts.push(<React.Fragment key={`paragraph-text-${key++}`}>{text.slice(cursor, next.index)}</React.Fragment>);
    }
    parts.push(
      <mark
        className={`ote-paragraph-issue-highlight is-${next.category}`}
        key={next.id}
        title={paragraphIssueCategories[next.category]?.label}
      >
        {next.phrase}
      </mark>
    );
    cursor = next.index + next.phrase.length;
  }

  return parts;
}

function ParagraphIssueNotes() {
  return (
    <div className="ote-academic-style-issue-groups">
      {Object.entries(paragraphIssueCategories).map(([categoryId, category]) => {
        const issues = paragraphIssues.filter((issue) => issue.category === categoryId);
        return (
          <article className={`ote-academic-style-issue-group is-${categoryId}`} key={categoryId}>
            <header>
              <span aria-hidden="true" />
              <div>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
              </div>
            </header>
            <ul>
              {issues.map((issue) => (
                <li key={issue.id}>
                  <strong>{issue.phrase}</strong>
                  <span>{issue.note}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

function NoticeCard({ number, item, revealed, onReveal }) {
  return (
    <article className={`ote-training-quiz-item ote-academic-style-notice-card ${revealed ? "is-revealed" : ""}`}>
      <p className="ote-kicker">Sentence {number}</p>
      <blockquote className="ote-advanced-writing-quote">
        “{revealed
          ? <HighlightedSentence sentence={item.sentence} highlights={item.highlights} />
          : item.sentence}”
      </blockquote>
      <button className="ote-academic-style-reveal-notes" type="button" onClick={() => onReveal(item.id)} disabled={revealed}>
        <Eye size={17} aria-hidden="true" /> {revealed ? "Notes revealed" : "Reveal notes"}
      </button>
      {revealed ? (
        <div className="ote-academic-style-notice-notes">
          <div className="ote-academic-style-issue-labels">
            <span><strong>Primary issue</strong>{item.primary}</span>
            <span><strong>Also notice</strong>{item.secondary}</span>
          </div>
          <p>{item.feedback}</p>
          <p className="ote-academic-style-upgrade"><strong>Possible upgrade</strong>{item.upgrade}</p>
        </div>
      ) : null}
    </article>
  );
}

function RewriteCard({ number, item, value, submitted, saving, blocked, error, onChange, onSubmit }) {
  return (
    <article className={`ote-academic-style-rewrite-card ${submitted ? "is-submitted" : ""}`}>
      <p className="ote-kicker">Rewrite {number}</p>
      <blockquote>“{item.source}”</blockquote>
      <label>
        <span>Your academic version</span>
        <textarea
          value={value}
          onChange={(event) => onChange(item.id, event.target.value)}
          placeholder="Preserve the meaning, but improve the style."
          disabled={submitted || saving}
        />
      </label>
      <button type="button" onClick={() => onSubmit(item.id)} disabled={!value.trim() || submitted || blocked}>
        <CheckCircle2 size={17} aria-hidden="true" />
        {saving ? "Saving rewrite..." : submitted ? "Rewrite submitted" : "Submit rewrite"}
      </button>
      {error ? <p className="ote-academic-style-save-error" role="alert">{error}</p> : null}
      {submitted ? (
        <div className="ote-academic-style-suggestion">
          <p><strong>Suggested answer:</strong> {item.suggestion}</p>
          <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        </div>
      ) : null}
    </article>
  );
}

export default function OteWritingAdvancedEssayAcademicStyle({ user, onRequireSignIn, nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-essay" : "/ote/writing/training/advanced-essay");
  const [academicAnswers, setAcademicAnswers] = useState({});
  const [revealedProblems, setRevealedProblems] = useState({});
  const [rewrites, setRewrites] = useState({});
  const [revealedRewrites, setRevealedRewrites] = useState({});
  const [rewriteSaveStatus, setRewriteSaveStatus] = useState({});
  const [rewriteSaveErrors, setRewriteSaveErrors] = useState({});
  const [rewriteAiStatus, setRewriteAiStatus] = useState("idle");
  const [rewriteAiError, setRewriteAiError] = useState("");
  const [rewriteAiFeedback, setRewriteAiFeedback] = useState(null);
  const rewriteSavingRef = useRef(false);
  const [paragraph, setParagraph] = useState("");
  const [problemsVisible, setProblemsVisible] = useState(false);
  const [modelVisible, setModelVisible] = useState(false);
  const [checks, setChecks] = useState({});

  const academicScore = academicChoices.filter((item) => academicAnswers[item.id] === item.answer).length;
  const reviewedProblems = Object.keys(revealedProblems).length;
  const submittedRewriteCount = Object.keys(revealedRewrites).length;
  const rewriteSubmissionBusy = Object.values(rewriteSaveStatus).includes("saving");
  const totalReviewed = Object.keys(academicAnswers).length + reviewedProblems;
  const wordCount = useMemo(() => countWords(paragraph), [paragraph]);

  function selectAnswer(setter, id, answer) {
    setter((current) => ({ ...current, [id]: answer }));
  }

  function clearRewriteAiFeedback() {
    setRewriteAiStatus("idle");
    setRewriteAiError("");
    setRewriteAiFeedback(null);
  }

  function buildSubmittedRewriteItems(nextSubmitted = revealedRewrites) {
    return rewriteItems
      .filter((item) => nextSubmitted[item.id] && rewrites[item.id]?.trim())
      .map((item) => ({
        id: item.id,
        source: item.source,
        studentAnswer: rewrites[item.id].trim(),
        suggestedAnswer: item.suggestion,
        keyFeatures: item.features,
      }));
  }

  function buildSavedRewritePayload(items) {
    const answerText = items.map((item, index) => [
      `Rewrite ${index + 1}`,
      `Original: ${item.source}`,
      `Student rewrite: ${item.studentAnswer}`,
    ].join("\n")).join("\n\n");
    return {
      answers: { task: answerText },
      counts: {
        task: items.reduce((sum, item) => sum + countWords(item.studentAnswer), 0),
        rewrites: items.length,
      },
      tasks: {
        practice: {
          title: "Academic style sentence rewrites",
          type: "advanced-academic-style-rewrites",
          typeLabel: "Academic style rewrites",
          instruction: "Rewrite conversational, vague or overstated sentences in a precise and measured academic style.",
          items,
        },
      },
      finishedAt: new Date().toISOString(),
      reason: "rewrite_submitted",
    };
  }

  async function submitRewrite(itemId) {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    if (!rewrites[itemId]?.trim() || revealedRewrites[itemId] || rewriteSavingRef.current) return;

    const nextSubmitted = { ...revealedRewrites, [itemId]: true };
    const items = buildSubmittedRewriteItems(nextSubmitted);
    rewriteSavingRef.current = true;
    setRewriteSaveStatus((current) => ({ ...current, [itemId]: "saving" }));
    setRewriteSaveErrors((current) => ({ ...current, [itemId]: "" }));

    try {
      await saveOteAdvancedAcademicStyleRewrites(buildSavedRewritePayload(items));
      setRevealedRewrites(nextSubmitted);
      setRewriteSaveStatus((current) => ({ ...current, [itemId]: "saved" }));
      clearRewriteAiFeedback();
    } catch (error) {
      console.warn("[OTE academic style] Could not save rewrite", error);
      setRewriteSaveStatus((current) => ({ ...current, [itemId]: "error" }));
      setRewriteSaveErrors((current) => ({
        ...current,
        [itemId]: error?.message || "Your rewrite could not be saved. Please try again.",
      }));
    } finally {
      rewriteSavingRef.current = false;
    }
  }

  async function handleRewriteAiFeedback() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    const items = buildSubmittedRewriteItems();
    if (!items.length) {
      setRewriteAiStatus("error");
      setRewriteAiError("Submit at least one rewrite before requesting feedback.");
      return;
    }

    setRewriteAiStatus("loading");
    setRewriteAiError("");
    setRewriteAiFeedback(null);
    try {
      const result = await requestOteAdvancedAcademicStyleFeedback({
        taskId: "advanced-academic-style-rewrites",
        title: "Advanced Essay: Academic Style Rewrites",
        instructions: "Preserve each sentence's central meaning while making its style precise, measured, natural and suitable for an academic essay.",
        items,
      });
      const feedback = result?.feedback || null;
      setRewriteAiFeedback(feedback);
      setRewriteAiStatus("ready");
      if (feedback) {
        await saveWritingAiFeedback({
          kind: "ote",
          submissionId: "advanced-academic-style-rewrites",
          feedback,
          meta: result?.meta || null,
        });
      }
    } catch (error) {
      console.warn("[OTE academic style] AI feedback failed", error);
      setRewriteAiStatus("error");
      setRewriteAiError(error?.message || "Could not generate rewrite feedback.");
    }
  }

  function resetLesson() {
    setAcademicAnswers({});
    setRevealedProblems({});
    setRewrites({});
    setRevealedRewrites({});
    setRewriteSaveStatus({});
    setRewriteSaveErrors({});
    clearRewriteAiFeedback();
    setParagraph("");
    setProblemsVisible(false);
    setModelVisible(false);
    setChecks({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Essay Academic Style | Seif English"
        description="Develop clear, precise and controlled academic style for the OTE Advanced essay."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to advanced essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced essay · Lesson 4</p>
        <h1>Academic Style</h1>
        <p>
          Academic writing does not need to sound complicated. The strongest essays communicate
          complex ideas clearly, precisely and with appropriate control.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Academic style essentials">
        <div><Target size={24} aria-hidden="true" /><strong>Precise</strong><span>Replace vague language with specific meaning.</span></div>
        <div><Scale size={24} aria-hidden="true" /><strong>Measured</strong><span>Qualify claims instead of overstating them.</span></div>
        <div><Sparkles size={24} aria-hidden="true" /><strong>Natural</strong><span>Choose clarity rather than inflated vocabulary.</span></div>
      </section>

      <section className="ote-training-section">
        <h2>Clear, Precise and Controlled</h2>
        <div className="ote-academic-style-shifts" role="table" aria-label="Academic style shifts">
          <div role="row"><strong role="columnheader">Less suitable</strong><strong role="columnheader">More suitable</strong></div>
          {[
            ["conversational", "neutral"], ["vague", "precise"], ["emotional", "measured"],
            ["absolute", "appropriately qualified"], ["highly personal", "focused on the issue"],
            ["repetitive or disconnected", "logically connected"],
          ].map(([from, to]) => <div role="row" key={from}><span role="cell">{from}</span><span role="cell">{to}</span></div>)}
        </div>
        <div className="ote-model-answer ote-academic-style-myths">
          <strong>Academic writing does not mean:</strong>
          <ul>
            <li>replacing every simple word with a longer one</li>
            <li>using the passive in every sentence</li>
            <li>avoiding all phrasal verbs</li>
            <li>filling paragraphs with memorised expressions</li>
            <li>making simple ideas unnecessarily complicated</li>
          </ul>
        </div>
      </section>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div><p className="ote-kicker">Practice task</p><h2>Empty public buildings</h2></div>
          <div className="ote-guided-timing-note"><span>220–280 words</span><span>Academic tutor</span></div>
        </div>
        <p>
          You have been discussing the use of public buildings in your class. Empty public buildings
          should be converted into spaces for local communities instead of being sold to private developers.
        </p>
        <p><strong>Do you agree?</strong></p>
        <p>Your essay must include at least two ideas:</p>
        <ul><li>impact on public finances</li><li>impact on local services</li><li>impact on community relationships</li></ul>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div><p className="ote-kicker">Exercise 1</p><h2>Choose the Best Academic Version</h2><p>One alternative is too conversational; another is unnecessarily complicated.</p></div>
          <div className="ote-training-score" aria-live="polite">{academicScore}/{academicChoices.length}</div>
        </div>
        {academicChoices.map((item, index) => (
          <ChoiceQuestion key={item.id} number={index + 1} item={item} selected={academicAnswers[item.id]} onSelect={(id, answer) => selectAnswer(setAcademicAnswers, id, answer)} />
        ))}
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <p className="ote-kicker">Exercise 2</p>
            <h2>Why is the style of the sentence inappropriate for an academic essay?</h2>
          </div>
          <div className="ote-training-score" aria-live="polite">{reviewedProblems}/{styleProblems.length}</div>
        </div>
        {styleProblems.map((item, index) => (
          <NoticeCard
            key={item.id}
            number={index + 1}
            item={item}
            revealed={Boolean(revealedProblems[item.id])}
            onReveal={(id) => setRevealedProblems((current) => ({ ...current, [id]: true }))}
          />
        ))}
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Exercise 3</p>
        <h2>Rewrite in an Academic Style</h2>
        <p className="ote-section-lead">Preserve the original meaning, but make each sentence more precise, measured and suitable for an academic tutor. Submit each answer to save it and reveal a suggested version.</p>
        <div className="ote-academic-style-rewrite-grid">
          {rewriteItems.map((item, index) => (
            <RewriteCard
              key={item.id}
              number={index + 1}
              item={item}
              value={rewrites[item.id] || ""}
              submitted={Boolean(revealedRewrites[item.id])}
              saving={rewriteSaveStatus[item.id] === "saving"}
              blocked={rewriteSubmissionBusy}
              error={rewriteSaveErrors[item.id] || ""}
              onChange={(id, value) => {
                setRewrites((current) => ({ ...current, [id]: value }));
                setRewriteSaveErrors((current) => ({ ...current, [id]: "" }));
                clearRewriteAiFeedback();
              }}
              onSubmit={submitRewrite}
            />
          ))}
        </div>
        <div className="ote-model-card ote-advanced-writing-ai-card">
          <div>
            <p className="ote-kicker">{submittedRewriteCount}/{rewriteItems.length} saved</p>
            <h2>Get AI Feedback on Your Rewrites</h2>
            <p>Receive focused feedback on meaning, precision, academic register and natural phrasing for every rewrite you have submitted.</p>
          </div>
          <button type="button" disabled={!submittedRewriteCount || rewriteAiStatus === "loading"} onClick={handleRewriteAiFeedback}>
            <FileText size={18} aria-hidden="true" />
            {rewriteAiStatus === "loading" ? "Checking rewrites..." : "Get AI feedback"}
          </button>
        </div>
        <AcademicStyleRewriteFeedback
          feedback={rewriteAiFeedback}
          status={rewriteAiStatus}
          error={rewriteAiError}
          items={rewriteItems}
          answers={rewrites}
        />
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Exercise 4</p>
        <h2>Upgrade the Paragraph</h2>
        <p className="ote-section-lead">Read the paragraph, identify its style problems, then rewrite it in approximately 70–90 words.</p>
        <blockquote className={`ote-academic-style-source-paragraph ${problemsVisible ? "has-annotations" : ""}`}>
          {problemsVisible
            ? <AnnotatedParagraph text={originalParagraph} issues={paragraphIssues} />
            : originalParagraph}
        </blockquote>
        <button className="ote-training-primary-link" type="button" onClick={() => setProblemsVisible((current) => !current)}>
          <Eye size={17} aria-hidden="true" /> {problemsVisible ? "Hide highlights and notes" : "Reveal style problems"}
        </button>
        {problemsVisible ? <ParagraphIssueNotes /> : null}

        <div className="ote-academic-style-paragraph-task">
          <div>
            <strong>Try to:</strong>
            <ul><li>preserve the central argument</li><li>give specific examples</li><li>qualify claims where necessary</li><li>explain how benefits might occur</li><li>acknowledge the financial alternative fairly</li></ul>
          </div>
          <label className="ote-writing-draft-box">
            <span>Your upgraded paragraph</span>
            <textarea value={paragraph} onChange={(event) => setParagraph(event.target.value)} placeholder="Write approximately 70–90 words." />
            <small className={wordCount >= 70 && wordCount <= 90 ? "is-in-range" : ""}>{wordCount} words · {wordCount >= 70 && wordCount <= 90 ? "Within the target range." : "Target: 70–90 words."}</small>
          </label>
        </div>

        <div className="ote-model-card">
          <div><p className="ote-kicker">Model upgrade</p><h2>Compare Your Paragraph</h2><p>Look for clearer claims and connections, not merely more advanced vocabulary.</p></div>
          <button type="button" disabled={modelVisible} onClick={() => setModelVisible(true)}><Eye size={18} aria-hidden="true" /> Show model</button>
        </div>
        {modelVisible ? (
          <div className="ote-model-answer">
            <p className="ote-kicker">{countWords(modelParagraph)} words</p>
            <blockquote>{modelParagraph}</blockquote>
            <strong>Why the model is stronger</strong>
            <ul>{modelStrengths.map((strength) => <li key={strength}>{strength}</li>)}</ul>
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Final review</p>
        <h2>Final Style Check</h2>
        <p className="ote-section-lead">Use these questions before finishing any Advanced essay.</p>
        <div className="ote-advanced-writing-checklist ote-academic-style-final-check">
          {finalChecks.map((item) => (
            <label key={item}><input type="checkbox" checked={Boolean(checks[item])} onChange={() => setChecks((current) => ({ ...current, [item]: !current[item] }))} /><span>{item}</span></label>
          ))}
        </div>
      </section>

      <section className="ote-training-section ote-advanced-writing-finish">
        <div>
          <h2>Lesson progress</h2>
          <p>{totalReviewed} of {academicChoices.length + styleProblems.length} guided items reviewed · {academicScore}/{academicChoices.length} choices correct</p>
        </div>
        <button className="ote-training-primary-link" type="button" onClick={resetLesson}><RotateCcw size={17} aria-hidden="true" /> Reset lesson</button>
      </section>
    </main>
  );
}

function AcademicStyleRewriteFeedback({ feedback, status, error, items = [], answers = {} }) {
  if (status === "idle") return null;
  if (status === "loading") {
    return (
      <section className="ote-register-ai-feedback is-loading" aria-live="polite">
        <strong>Checking your academic style...</strong>
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

  const sourceById = Object.fromEntries(items.map((item, index) => [item.id, { ...item, index }]));
  return (
    <section className="ote-register-ai-feedback" aria-live="polite">
      <div className="ote-register-ai-head">
        <div>
          <p className="ote-kicker">AI academic style feedback</p>
          <h3>{academicStyleControlLabel(feedback.overall?.styleControl)}</h3>
        </div>
        <p>{feedback.overall?.summary}</p>
      </div>
      <div className="ote-register-ai-gap-list">
        {(feedback.items || []).map((item) => {
          const source = sourceById[item.id] || {};
          return (
            <article key={item.id} className={`is-${item.verdict}`}>
              <div className="ote-register-ai-gap-top">
                <strong>Rewrite {(source.index ?? 0) + 1}</strong>
                <span>{academicStyleVerdictLabel(item.verdict)}</span>
              </div>
              {source.source ? <p><b>Original:</b> {source.source}</p> : null}
              <p><b>Your answer:</b> {answers[item.id] || item.studentAnswer || "blank"}</p>
              <p><b>Meaning:</b> {item.meaning}</p>
              <p><b>Academic style:</b> {item.academicStyle}</p>
              <p><b>Language:</b> {item.language}</p>
              {item.suggestedRewrite ? <p><b>Try:</b> {item.suggestedRewrite}</p> : null}
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

function academicStyleVerdictLabel(verdict) {
  return {
    excellent: "Strong rewrite",
    acceptable: "Effective · small fix",
    partly_appropriate: "Developing",
    not_appropriate: "Needs revision",
    blank: "Not submitted",
  }[verdict] || "Reviewed";
}

function academicStyleControlLabel(value) {
  return {
    strong: "Strong academic style",
    mostly_good: "Mostly effective",
    mixed: "Developing consistency",
    needs_work: "More practice needed",
    too_incomplete: "More writing needed",
  }[value] || "Rewrite review";
}
