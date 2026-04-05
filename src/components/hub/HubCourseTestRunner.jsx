import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getHubCourseTestTemplate } from "../../data/hubCourseTestTemplates.js";
import {
  getCourseTestSession,
  getMyCourseTestAttemptForSession,
  saveCourseTestAttemptDraft,
  startCourseTestAttempt,
  submitCourseTestAttempt,
} from "../../firebase";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast";

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(value) {
  const date = timestampToDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function deriveStateMap(sections = [], rawState = {}) {
  const next = {};
  for (const section of sections) {
    next[section.id] = rawState[section.id] || "not-started";
  }
  return next;
}

function deriveAnswerMap(sections = [], rawAnswers = {}) {
  const next = {};
  for (const section of sections) {
    next[section.id] = rawAnswers[section.id] || {};
  }
  return next;
}

function normalizeAnswer(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isInlineTextInputItem(item) {
  return (
    item?.type === "text-input" &&
    Array.isArray(item.inlineParts) &&
    item.inlineParts.some((part) => part && typeof part === "object" && part.gapId)
  );
}

function isSortBySoundItem(item) {
  return (
    !item?.type &&
    typeof item?.prompt === "string" &&
    typeof item?.answer === "string" &&
    Array.isArray(item?.options)
  );
}

function buildSortBySoundDistractorItems(section) {
  const sourceItems = Array.isArray(section?.items) ? section.items : [];
  const exampleWords = Array.isArray(section?.sharedPrompt?.exampleWords)
    ? section.sharedPrompt.exampleWords.map((entry) => String(entry).toLowerCase())
    : [];

  return (Array.isArray(section?.sharedPrompt?.values) ? section.sharedPrompt.values : [])
    .filter((entry) => {
      const text = String(typeof entry === "string" ? entry : entry?.text || "").toLowerCase();
      if (!text) return false;
      if (exampleWords.includes(text)) return false;
      return !sourceItems.some((item) => String(item.prompt || "").toLowerCase() === text);
    })
    .map((entry, index) => ({
      id: `__distractor__:${index}:${typeof entry === "string" ? entry : entry?.text || ""}`,
      prompt: typeof entry === "string" ? entry : entry.text,
      highlight: typeof entry === "string" ? "" : entry.highlight,
      options: sourceItems[0]?.options || [],
      isDistractor: true,
    }));
}

function getSortBySoundPenalty(section, sectionAnswerMap = {}) {
  if (section?.taskType !== "sort-by-sound") return 0;
  return buildSortBySoundDistractorItems(section).reduce((sum, item) => {
    return sum + (sectionAnswerMap?.[item.id] ? 1 : 0);
  }, 0);
}

function getAutoItemScore(item, answer) {
  if (item?.type === "choice") {
    if (Array.isArray(item.acceptedAnswerIndexes) && item.acceptedAnswerIndexes.length) {
      return item.acceptedAnswerIndexes.map(String).includes(String(answer)) ? 1 : 0;
    }
    return String(answer) === String(item.answerIndex) ? 1 : 0;
  }

  if (item?.type === "stress-choice") {
    return String(answer) === String(item.answerIndex) ? 1 : 0;
  }

  if (item?.type === "matching-select") {
    const normalized = normalizeAnswer(answer);
    if (Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length) {
      return item.acceptedAnswers.some((entry) => normalizeAnswer(entry) === normalized) ? 1 : 0;
    }
    return normalized === normalizeAnswer(item.answer) ? 1 : 0;
  }

  if (isSortBySoundItem(item)) {
    return normalizeAnswer(answer) === normalizeAnswer(item.answer) ? 1 : 0;
  }

  if (item?.type === "text-input") {
    if (isInlineTextInputItem(item)) {
      const acceptedByGap = item.inlineAcceptedAnswers || {};
      const answerMap = answer && typeof answer === "object" ? answer : {};

      const fullCredit = Object.entries(acceptedByGap).every(([gapId, acceptedValues]) => {
        const normalized = normalizeAnswer(answerMap[gapId] || "");
        return (acceptedValues || []).some((entry) => normalizeAnswer(entry) === normalized);
      });
      if (fullCredit) return 1;

      const partialByGap = item.inlinePartialAcceptedAnswers || {};
      const hasPartial = Object.keys(partialByGap).length > 0 &&
        Object.entries(partialByGap).every(([gapId, acceptedValues]) => {
          const normalized = normalizeAnswer(answerMap[gapId] || "");
          return (acceptedValues || []).some((entry) => normalizeAnswer(entry) === normalized);
        });
      if (hasPartial) return Number(item.partialCreditValue ?? 0.5);
      return 0;
    }

    const accepted = Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers : [];
    const normalized = normalizeAnswer(answer);
    if (accepted.some((entry) => normalizeAnswer(entry) === normalized)) return 1;

    const partialAccepted = Array.isArray(item.partialAcceptedAnswers) ? item.partialAcceptedAnswers : [];
    if (partialAccepted.some((entry) => normalizeAnswer(entry) === normalized)) {
      return Number(item.partialCreditValue ?? 0.5);
    }
    return 0;
  }

  return 0;
}

function isItemCorrect(item, answer) {
  return getAutoItemScore(item, answer) >= 1;
}

function calculateAutoScore(sections = [], sectionAnswers = {}) {
  let autoScore = 0;
  let autoTotal = 0;

  for (const section of sections) {
    for (const item of section.items || []) {
      autoTotal += 1;
      const answer = sectionAnswers?.[section.id]?.[item.id];
      autoScore += getAutoItemScore(item, answer);
    }
    autoScore -= getSortBySoundPenalty(section, sectionAnswers?.[section.id] || {});
  }

  return { autoScore: Math.max(0, autoScore), autoTotal };
}

function renderOptionLabel(option) {
  if (!option || typeof option === "string") return option || "";

  const text = String(option.text || "");
  const highlightMeta = option.highlight;
  const highlight = typeof highlightMeta === "string"
    ? highlightMeta
    : String(highlightMeta?.text || "");
  const occurrence = typeof highlightMeta === "object" ? highlightMeta?.occurrence : "first";
  if (!highlight) return text;

  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const index = occurrence === "last"
    ? lowerText.lastIndexOf(lowerHighlight)
    : lowerText.indexOf(lowerHighlight);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + highlight.length);
  const after = text.slice(index + highlight.length);

  return (
    <>
      {before}
      <span className="hub-course-test-sound-highlight">{match}</span>
      {after}
    </>
  );
}

function getSharedPromptHeading(sharedPrompt) {
  if (!sharedPrompt?.title) return "";
  if (sharedPrompt.title === "Worked example") return "Example";
  if (sharedPrompt.title.startsWith("Worked example:")) {
    return sharedPrompt.title.replace("Worked example:", "Example:");
  }
  return sharedPrompt.title;
}

function renderHighlightedWord(text = "", highlight = "") {
  const safeText = String(text || "");
  const safeHighlight = typeof highlight === "string"
    ? highlight
    : String(highlight?.text || "");
  const occurrence = typeof highlight === "object" ? highlight?.occurrence : "first";
  if (!safeHighlight) return safeText;

  const lowerText = safeText.toLowerCase();
  const lowerHighlight = safeHighlight.toLowerCase();
  const index = occurrence === "last"
    ? lowerText.lastIndexOf(lowerHighlight)
    : lowerText.indexOf(lowerHighlight);
  if (index === -1) return safeText;

  const before = safeText.slice(0, index);
  const match = safeText.slice(index, index + safeHighlight.length);
  const after = safeText.slice(index + safeHighlight.length);

  return (
    <>
      {before}
      <span className="hub-course-test-sound-highlight">{match}</span>
      {after}
    </>
  );
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedPassage(text = "", highlights = []) {
  const safeText = String(text || "");
  const safeHighlights = (Array.isArray(highlights) ? highlights : [])
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!safeText || !safeHighlights.length) return safeText;

  const pattern = new RegExp(`(${safeHighlights.map(escapeRegExp).join("|")})`, "gi");
  const parts = safeText.split(pattern);

  return parts.map((part, index) => {
    const isMatch = safeHighlights.some((entry) => entry.toLowerCase() === part.toLowerCase());
    if (!isMatch) {
      return <React.Fragment key={`passage:${index}`}>{part}</React.Fragment>;
    }

    return (
      <span key={`passage:${index}`} className="hub-course-test-sound-highlight">
        {part}
      </span>
    );
  });
}

function buildPronunciationColumns(section, sectionAnswerMap = {}) {
  const sourceItems = Array.isArray(section?.items) ? section.items : [];
  const distractorItems = buildSortBySoundDistractorItems(section);
  const allItems = sourceItems.concat(distractorItems);
  const sharedValues = Array.isArray(section?.sharedPrompt?.values) ? section.sharedPrompt.values : [];
  const promptOrder = new Map(
    sharedValues.map((entry, index) => [
      String(typeof entry === "string" ? entry : entry?.text || "").toLowerCase(),
      index,
    ])
  );
  const orderIndex = new Map(allItems.map((item, index) => [item.id, index]));
  const items = allItems.slice().sort((a, b) => {
    const aPromptOrder = promptOrder.get(String(a.prompt || "").toLowerCase());
    const bPromptOrder = promptOrder.get(String(b.prompt || "").toLowerCase());
    const aOrder = Number.isFinite(Number(aPromptOrder))
      ? Number(aPromptOrder)
      : Number.isFinite(Number(a.originalOrder))
        ? Number(a.originalOrder)
        : (orderIndex.get(a.id) ?? 0) + 1;
    const bOrder = Number.isFinite(Number(bPromptOrder))
      ? Number(bPromptOrder)
      : Number.isFinite(Number(b.originalOrder))
        ? Number(b.originalOrder)
        : (orderIndex.get(b.id) ?? 0) + 1;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0);
  });
  const columnOptions = items[0]?.options || [];
  const unplaced = [];
  const columns = columnOptions.map((column) => ({ key: column, items: [] }));
  const byColumn = new Map(columns.map((column) => [column.key, column]));

  for (const item of items) {
    const answer = sectionAnswerMap?.[item.id] || "";
    if (answer && byColumn.has(answer)) {
      byColumn.get(answer).items.push(item);
    } else {
      unplaced.push(item);
    }
  }

  for (const column of columns) {
    column.items.sort((a, b) => {
      const aPromptOrder = promptOrder.get(String(a.prompt || "").toLowerCase());
      const bPromptOrder = promptOrder.get(String(b.prompt || "").toLowerCase());
      if (Number.isFinite(Number(aPromptOrder)) && Number.isFinite(Number(bPromptOrder))) {
        return Number(aPromptOrder) - Number(bPromptOrder);
      }
      const aIndex = orderIndex.get(a.id) ?? 0;
      const bIndex = orderIndex.get(b.id) ?? 0;
      return aIndex - bIndex;
    });
  }
  unplaced.sort((a, b) => {
    const aPromptOrder = promptOrder.get(String(a.prompt || "").toLowerCase());
    const bPromptOrder = promptOrder.get(String(b.prompt || "").toLowerCase());
    if (Number.isFinite(Number(aPromptOrder)) && Number.isFinite(Number(bPromptOrder))) {
      return Number(aPromptOrder) - Number(bPromptOrder);
    }
    const aIndex = orderIndex.get(a.id) ?? 0;
    const bIndex = orderIndex.get(b.id) ?? 0;
    return aIndex - bIndex;
  });

  return { unplaced, columns };
}

function formatMatchingOption(option) {
  const raw = option && typeof option === "object" ? String(option.text || option.value || "") : String(option);
  const letterMatch = raw.match(/^([A-Z])\s+(.+)$/);
  if (letterMatch) {
    return {
      value: letterMatch[1],
      label: `${letterMatch[1]} — ${letterMatch[2]}`,
    };
  }

  return {
    value: raw,
    label: raw,
  };
}

function hasAnyAnswer(value) {
  if (value == null) return false;
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value).some((entry) => hasAnyAnswer(entry));
  }
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function getListeningStartedStorageKey(attemptId) {
  return attemptId ? `course-test-listening-started:${attemptId}` : "";
}

function handleExamTextInputKeyDown(event) {
  if (event.key !== "Enter") return;

  event.preventDefault();
  const scope = event.currentTarget.closest(".hub-course-test-active-input-scope");
  if (!scope) return;

  const inputs = Array.from(
    scope.querySelectorAll('input[type="text"], input:not([type])')
  ).filter((input) => !input.disabled);
  const currentIndex = inputs.indexOf(event.currentTarget);
  if (currentIndex === -1) return;

  const nextInput = inputs[currentIndex + 1];
  if (nextInput) {
    nextInput.focus();
    nextInput.select?.();
  }
}

function renderInlineTextInput(item, answer, setGapAnswer, timeUp) {
  if (isInlineTextInputItem(item)) {
    const answerMap = answer && typeof answer === "object" ? answer : {};

    return item.inlineParts.map((part, index) => {
      if (typeof part === "string") {
        return <React.Fragment key={`${item.id}:text:${index}`}>{part}</React.Fragment>;
      }

      const widthClass = part.width ? `is-${part.width}` : "";
      return (
        <input
          key={`${item.id}:${part.gapId}`}
          type="text"
          className={["input", "hub-course-test-inline-gap", widthClass].filter(Boolean).join(" ")}
          value={answerMap[part.gapId] || ""}
          onChange={(e) => setGapAnswer(part.gapId, e.target.value)}
          onKeyDown={handleExamTextInputKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          disabled={timeUp}
        />
      );
    });
  }

  const prompt = String(item?.prompt || "");
  if (!prompt.includes("________")) return null;

  const [before, ...afterParts] = prompt.split(/_{4,}/);
  return (
    <>
      {before}
      <input
        type="text"
        className="input hub-course-test-inline-gap"
        value={typeof answer === "string" ? answer : ""}
        onChange={(e) => setGapAnswer("g1", e.target.value)}
        onKeyDown={handleExamTextInputKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        disabled={timeUp}
      />
      {afterParts.join("________")}
    </>
  );
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getSkillLabel(skill = "") {
  if (skill === "grammar") return "Grammar";
  if (skill === "vocabulary") return "Vocabulary";
  if (skill === "pronunciation") return "Pronunciation";
  if (skill === "practical-english") return "Practical English";
  if (skill === "reading") return "Reading";
  if (skill === "listening") return "Listening";
  return skill || "Section";
}

function renderChoiceControls(item, answer, onSelect, disabled = false) {
  if (item?.choiceStyle === "word-buttons") {
    return (
      <div className="hub-course-test-stress-buttons is-choice-words">
        {item.options.map((option, optionIndex) => (
          <button
            key={`${item.id}-${optionIndex}`}
            type="button"
            className={`hub-course-test-stress-btn hub-course-test-choice-word-btn ${String(answer) === String(optionIndex) ? "is-selected" : ""}`}
            onClick={() => onSelect(String(optionIndex))}
            disabled={disabled}
          >
            {renderOptionLabel(option)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="hub-course-test-choice-list">
      {item.options.map((option, optionIndex) => (
        <button
          key={`${item.id}-${optionIndex}`}
          type="button"
          className={`hub-course-test-choice-card ${String(answer) === String(optionIndex) ? "is-selected" : ""}`}
          onClick={() => onSelect(String(optionIndex))}
          disabled={disabled}
        >
          <span className="hub-course-test-choice-letter">
            {String.fromCharCode(65 + optionIndex)}
          </span>
          <span className="hub-course-test-choice-text">{renderOptionLabel(option)}</span>
        </button>
      ))}
    </div>
  );
}

function resolveMatchingOption(section, option) {
  if (option && typeof option === "object") return option;

  const raw = String(option || "");
  const wordBankValues = Array.isArray(section?.sharedPrompt?.values) ? section.sharedPrompt.values : [];
  const highlightedMatch = wordBankValues.find((entry) => {
    if (!entry || typeof entry === "string") return false;
    return String(entry.text || "").toLowerCase() === raw.toLowerCase();
  });

  return highlightedMatch || raw;
}

function MatchingSelectControl({ section, item, answer, onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const options = (item.options || []).map((option) => resolveMatchingOption(section, option));
  const selectedOption = options.find((option) => {
    const meta = formatMatchingOption(option);
    return String(meta.value) === String(answer);
  });

  return (
    <div ref={rootRef} className={`hub-course-test-matching-select ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className={`hub-course-test-matching-trigger ${answer ? "is-selected" : ""}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
      >
        <span className="hub-course-test-matching-trigger-text">
          {selectedOption ? renderOptionLabel(selectedOption) : "Choose…"}
        </span>
        <span className="hub-course-test-matching-trigger-icon">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="hub-course-test-matching-menu">
          {options.map((option, optionIndex) => {
            const { value } = formatMatchingOption(option);
            const isSelected = String(answer) === String(value);
            return (
              <button
                key={`${item.id}:matching:${value}:${optionIndex}`}
                type="button"
                className={`hub-course-test-matching-option ${isSelected ? "is-selected" : ""}`}
                onClick={() => {
                  onSelect(String(value));
                  setOpen(false);
                }}
              >
                {renderOptionLabel(option)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function calculateSkillBreakdown(sections = [], sectionAnswers = {}, teacherItemScores = {}) {
  const grouped = new Map();

  for (const section of sections) {
    const skill = section.skill || section.id;
    if (!grouped.has(skill)) {
      grouped.set(skill, {
        skill,
        label: getSkillLabel(skill),
        score: 0,
        total: 0,
      });
    }

    const entry = grouped.get(skill);
    for (const item of section.items || []) {
      const answer = sectionAnswers?.[section.id]?.[item.id];
      const overrideKey = `${section.id}:${item.id}`;
      const score =
        teacherItemScores?.[overrideKey] != null
          ? Number(teacherItemScores[overrideKey])
          : getAutoItemScore(item, answer);

      entry.score += score;
      entry.total += 1;
    }
    entry.score -= getSortBySoundPenalty(section, sectionAnswers?.[section.id] || {});
    entry.score = Math.max(0, entry.score);
  }

  return Array.from(grouped.values());
}

export default function HubCourseTestRunner({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const teacherPreview =
    (user?.role === "teacher" || user?.role === "admin") &&
    new URLSearchParams(location.search).get("teacherPreview") === "1";
  const backPath = teacherPreview ? "/teacher-tools" : "/your-class";

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState("");
  const [sectionStatuses, setSectionStatuses] = useState({});
  const [sectionAnswers, setSectionAnswers] = useState({});
  const [sectionNotes, setSectionNotes] = useState({});
  const [nowMs, setNowMs] = useState(Date.now());
  const [draggedItemId, setDraggedItemId] = useState("");
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [submittingMainPaper, setSubmittingMainPaper] = useState(false);
  const [startingListening, setStartingListening] = useState(false);
  const [finishingListening, setFinishingListening] = useState(false);
  const [listeningSectionIndex, setListeningSectionIndex] = useState(0);
  const [listeningPhase, setListeningPhase] = useState("idle");
  const [listeningCountdown, setListeningCountdown] = useState(0);
  const [listeningManualPlay, setListeningManualPlay] = useState(null);
  const autosaveIntervalRef = useRef(null);
  const hydrationDoneRef = useRef(false);
  const hydratedAttemptIdRef = useRef("");
  const sectionTopRef = useRef(null);
  const listeningElementRef = useRef(null);
  const listeningAudioRef = useRef(null);
  const listeningPreparedAudioRef = useRef(null);
  const listeningCountdownIntervalRef = useRef(null);
  const listeningRunTokenRef = useRef(0);
  const listeningAudioCacheRef = useRef({});
  const latestStateRef = useRef({
    sectionStatuses: {},
    sectionAnswers: {},
    sectionNotes: {},
    currentSectionId: "",
  });
  const attemptRef = useRef(null);
  const previousSectionIdRef = useRef("");

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!user || !sessionId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const sessionRow = await getCourseTestSession(sessionId);
        const attemptRow = teacherPreview
          ? null
          : await getMyCourseTestAttemptForSession(sessionId, user.uid);

        if (!alive) return;

        setSession(sessionRow || null);
        setAttempt(attemptRow || null);
      } catch (error) {
        console.error("[HubCourseTestRunner] load failed", error);
        toast("Could not load that test session.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [sessionId, teacherPreview, user]);

  useEffect(() => {
    if (!user || !sessionId) return;

    let alive = true;
    const refreshSession = async () => {
      try {
        const freshSession = await getCourseTestSession(sessionId);
        if (!alive || !freshSession) return;
        setSession((prev) => {
          const prevUpdated = prev?.updatedAt?.toMillis?.() || 0;
          const nextUpdated = freshSession?.updatedAt?.toMillis?.() || 0;
          if (!prev) return freshSession;
          if (nextUpdated >= prevUpdated) return { ...prev, ...freshSession };
          return prev;
        });
      } catch (error) {
        console.warn("[HubCourseTestRunner] session refresh failed", error);
      }
    };

    const interval = window.setInterval(refreshSession, 5000);
    const onFocus = () => refreshSession();
    window.addEventListener("focus", onFocus);

    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [sessionId, user]);

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  const template = useMemo(
    () => (session?.templateId ? getHubCourseTestTemplate(session.templateId) : null),
    [session]
  );

  const mainSections = useMemo(
    () => (template?.sections || []).filter((section) => section.deliveryGroup === "main-paper"),
    [template]
  );

  const listeningSections = useMemo(
    () => (template?.sections || []).filter((section) => section.deliveryGroup === "listening-paper"),
    [template]
  );
  const allSections = useMemo(() => [...mainSections, ...listeningSections], [mainSections, listeningSections]);

  function buildTeacherPreviewAttempt() {
    const initialRunnerState = {
      mainPaperStartedAt: new Date().toISOString(),
      currentSectionId: mainSections[0]?.id || "",
      sectionStatuses: deriveStateMap(mainSections, {}),
      sectionAnswers: deriveAnswerMap(allSections, {}),
      sectionNotes: {},
      mainPaperStatus: "in-progress",
      listeningSectionIndex: 0,
      listeningPhase: "idle",
    };

    return {
      id: `teacher-preview:${sessionId}`,
      isTeacherPreview: true,
      sessionId,
      templateId: template?.id || session?.templateId || "",
      runnerState: initialRunnerState,
      autoScore: 0,
      autoTotal: 0,
      percent: 0,
      completed: false,
      reviewStatus: "preview",
    };
  }

  useEffect(() => {
    if (!attempt?.id) return;
    if (hydratedAttemptIdRef.current === attempt.id) return;

    const runnerState = attempt?.runnerState || {};
    const restoredListeningPhase = runnerState.listeningPhase || "idle";
    const listeningHadStarted = Boolean(runnerState.listeningStageStartedAt);
    const listeningStartedKey = getListeningStartedStorageKey(attempt.id);
    const localListeningStarted =
      typeof window !== "undefined" && listeningStartedKey
        ? window.sessionStorage.getItem(listeningStartedKey) === "1"
        : false;
    const blockedListeningPhases = new Set([
      "preread",
      "pause",
      "playing-first",
      "playing-second",
      "awaiting-first-play",
      "awaiting-second-play",
      "between-sections",
    ]);
    const restoredStatuses = deriveStateMap(mainSections, runnerState.sectionStatuses || {});
    const restoredAnswers = deriveAnswerMap(allSections, runnerState.sectionAnswers || {});
    const restoredNotes = runnerState.sectionNotes || {};

    setSectionStatuses(restoredStatuses);
    setSectionAnswers(restoredAnswers);
    setSectionNotes(restoredNotes);
    setListeningSectionIndex(Number(runnerState.listeningSectionIndex || 0));
    setListeningPhase(
      blockedListeningPhases.has(restoredListeningPhase) ||
      ((listeningHadStarted || localListeningStarted) &&
        !["completed", "ready-finish", "resume-blocked"].includes(restoredListeningPhase))
        ? "resume-blocked"
        : restoredListeningPhase
    );
    setListeningCountdown(0);

    const firstSectionId = mainSections[0]?.id || "";
    setCurrentSectionId(runnerState.currentSectionId || firstSectionId);
    hydratedAttemptIdRef.current = attempt.id;
    hydrationDoneRef.current = true;
  }, [attempt?.id, mainSections, allSections]);

  useEffect(() => {
    if (!hydrationDoneRef.current) return;
    if (!currentSectionId) return;
    sectionTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentSectionId]);

  useEffect(() => {
    return () => {
      listeningRunTokenRef.current += 1;
      if (listeningCountdownIntervalRef.current) {
        window.clearInterval(listeningCountdownIntervalRef.current);
      }
      if (listeningAudioRef.current) {
        listeningAudioRef.current.pause();
        listeningAudioRef.current = null;
      }
      if (listeningPreparedAudioRef.current) {
        listeningPreparedAudioRef.current.pause();
        listeningPreparedAudioRef.current = null;
      }
      Object.values(listeningAudioCacheRef.current || {}).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      listeningAudioCacheRef.current = {};
    };
  }, []);

  const currentSection =
    mainSections.find((section) => section.id === currentSectionId) || mainSections[0] || null;

  const mainPaperStartedAt =
    attempt?.runnerState?.mainPaperStartedAt ||
    (attempt?.startedAt ? timestampToDate(attempt.startedAt)?.toISOString() : "");

  const mainPaperDurationMinutes = template?.deliveryPlan?.mainPaper?.durationMinutes || 70;
  const mainPaperEndsAtMs = mainPaperStartedAt
    ? new Date(mainPaperStartedAt).getTime() + mainPaperDurationMinutes * 60 * 1000
    : 0;
  const timeRemainingMs = mainPaperEndsAtMs ? mainPaperEndsAtMs - nowMs : mainPaperDurationMinutes * 60 * 1000;
  const timeUp = mainPaperEndsAtMs ? timeRemainingMs <= 0 : false;
  const mainPaperSubmitted = Boolean(attempt?.runnerState?.mainPaperSubmittedAt || attempt?.submittedAt);
  const activeListeningSection = listeningSections[listeningSectionIndex] || null;
  const listeningReadyForNext =
    listeningPhase === "ready-next" || listeningPhase === "ready-finish";
  const listeningComplete = Boolean(attempt?.completed || attempt?.submittedAt);

  const completedSections = Object.values(sectionStatuses).filter((value) => value === "done").length;
  const allDone = mainSections.length > 0 && completedSections === mainSections.length;
  const currentSectionIndex = Math.max(0, mainSections.findIndex((section) => section.id === currentSection?.id));
  const previousSection = currentSectionIndex > 0 ? mainSections[currentSectionIndex - 1] : null;
  const nextSection =
    currentSectionIndex >= 0 && currentSectionIndex < mainSections.length - 1
      ? mainSections[currentSectionIndex + 1]
      : null;
  const answeredSections = useMemo(
    () =>
      mainSections.filter((section) =>
        Object.values(sectionAnswers?.[section.id] || {}).some((value) => hasAnyAnswer(value))
      ).length,
    [mainSections, sectionAnswers]
  );

  useEffect(() => {
    latestStateRef.current = {
      sectionStatuses,
      sectionAnswers,
      sectionNotes,
      currentSectionId,
    };
  }, [sectionStatuses, sectionAnswers, sectionNotes, currentSectionId]);

  async function persistRunnerState(nextExtras = {}, stateOverride = null) {
    const activeAttempt = attemptRef.current;
    if (!activeAttempt?.id) return;

    setSaving(true);
    try {
      const stateSource = stateOverride || latestStateRef.current;
      const nextRunnerState = {
        ...(activeAttempt.runnerState || {}),
        sectionStatuses: stateSource.sectionStatuses,
        sectionAnswers: stateSource.sectionAnswers,
        sectionNotes: stateSource.sectionNotes,
        currentSectionId: stateSource.currentSectionId,
        ...nextExtras,
      };

      const { autoScore, autoTotal } = calculateAutoScore(mainSections, stateSource.sectionAnswers);
      if (activeAttempt.isTeacherPreview) {
        setAttempt((prev) =>
          prev
            ? {
                ...prev,
                runnerState: nextRunnerState,
                autoScore,
                autoTotal,
                percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
              }
            : prev
        );
        return;
      }

      await saveCourseTestAttemptDraft(activeAttempt.id, {
        runnerState: nextRunnerState,
        autoScore,
        autoTotal,
      });

      setAttempt((prev) =>
        prev
          ? {
              ...prev,
              runnerState: nextRunnerState,
              autoScore,
              autoTotal,
              percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
            }
          : prev
      );
    } catch (error) {
      console.error("[HubCourseTestRunner] save failed", error);
      toast("Could not save your progress.");
    } finally {
      setSaving(false);
    }
  }

  function clearListeningCountdown() {
    if (listeningCountdownIntervalRef.current) {
      window.clearInterval(listeningCountdownIntervalRef.current);
      listeningCountdownIntervalRef.current = null;
    }
    setListeningCountdown(0);
  }

  async function runListeningCountdown(seconds, phase, runToken) {
    clearListeningCountdown();
    setListeningPhase(phase);
    setListeningCountdown(seconds);

    if (seconds > 0) {
      listeningCountdownIntervalRef.current = window.setInterval(() => {
        setListeningCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      await sleep(seconds * 1000);
    }

    clearListeningCountdown();
    return listeningRunTokenRef.current === runToken;
  }

  async function playListeningAudio(section, playNumber, runToken, options = {}) {
    if (!section?.audioSrc) return false;
    const manual = Boolean(options.manual);
    setListeningPhase(playNumber === 1 ? "playing-first" : "playing-second");
    setListeningManualPlay(null);

    if (listeningAudioRef.current) {
      listeningAudioRef.current.pause();
    }

    let audioSrc = listeningAudioCacheRef.current[section.audioSrc];
    if (!audioSrc) {
      const response = await fetch(section.audioSrc, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`Could not load audio (${response.status})`);
      }
      const blob = await response.blob();
      audioSrc = URL.createObjectURL(blob);
      listeningAudioCacheRef.current[section.audioSrc] = audioSrc;
    }

    const preparedAudio =
      listeningPreparedAudioRef.current && listeningPreparedAudioRef.current.src === audioSrc
        ? listeningPreparedAudioRef.current
        : null;
    const elementAudio = listeningElementRef.current;

    const audio = preparedAudio || elementAudio || new Audio(audioSrc);
    if (audio.src !== audioSrc) {
      audio.src = audioSrc;
    }
    if (typeof audio.load === "function") {
      audio.load();
    }
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 1;
    listeningAudioRef.current = audio;

    try {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        await Promise.race([
          playPromise,
          sleep(manual ? 5000 : 2500).then(() => {
            throw new Error("Playback start timeout");
          }),
        ]);
      }

      await new Promise((resolve, reject) => {
        audio.addEventListener("ended", resolve, { once: true });
        audio.addEventListener("error", reject, { once: true });
      });
      return listeningRunTokenRef.current === runToken;
    } catch (error) {
      if (!manual) {
        setListeningManualPlay({ sectionIndex: listeningSectionIndex, playNumber });
        setListeningPhase(playNumber === 1 ? "awaiting-first-play" : "awaiting-second-play");
        return "manual-needed";
      }
      throw error;
    } finally {
      if (listeningAudioRef.current === audio) {
        listeningAudioRef.current = null;
      }
    }
  }

  async function prepareListeningAudio(section) {
    if (!section?.audioSrc) return null;

    let audioSrc = listeningAudioCacheRef.current[section.audioSrc];
    if (!audioSrc) {
      const response = await fetch(section.audioSrc, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`Could not load audio (${response.status})`);
      }
      const blob = await response.blob();
      audioSrc = URL.createObjectURL(blob);
      listeningAudioCacheRef.current[section.audioSrc] = audioSrc;
    }

    const prepared = new Audio(audioSrc);
    prepared.preload = "auto";
    prepared.muted = true;

    try {
      await prepared.play();
      prepared.pause();
      prepared.currentTime = 0;
    } catch (error) {
      // If the browser still blocks autoplay, we still keep the preloaded element.
    }

    listeningPreparedAudioRef.current = prepared;
    return prepared;
  }

  async function runListeningSection(sectionIndex) {
    const section = listeningSections[sectionIndex];
    if (!section) return;

    setStartingListening(true);
    setListeningSectionIndex(sectionIndex);
    const runToken = Date.now();
    listeningRunTokenRef.current = runToken;

    try {
      const timing = section.timing || {};
      const preReadSeconds = Number(timing.preReadSeconds || 45);
      const listeningStartedKey = getListeningStartedStorageKey(attemptRef.current?.id);

      if (typeof window !== "undefined" && listeningStartedKey) {
        window.sessionStorage.setItem(listeningStartedKey, "1");
      }

      await persistRunnerState({
        listeningSectionIndex: sectionIndex,
        listeningPhase: "preread",
        listeningStageStartedAt:
          attemptRef.current?.runnerState?.listeningStageStartedAt || new Date().toISOString(),
      });

      await prepareListeningAudio(section);

      if (!(await runListeningCountdown(preReadSeconds, "preread", runToken))) return;
      await continueListeningAutoplay(sectionIndex, runToken);
    } catch (error) {
      console.error("[HubCourseTestRunner] listening playback failed", error);
      toast("Could not play the listening audio.");
      setListeningPhase("idle");
      await persistRunnerState({
        listeningSectionIndex: sectionIndex,
        listeningPhase: "idle",
      });
    } finally {
      clearListeningCountdown();
      if (listeningRunTokenRef.current !== runToken) {
        setStartingListening(false);
      }
    }
  }

  async function handleManualListeningPlay() {
    if (!listeningManualPlay) return;
    const section = listeningSections[listeningManualPlay.sectionIndex];
    if (!section) return;

    setStartingListening(true);
    try {
      const runToken = listeningRunTokenRef.current || Date.now();
      listeningRunTokenRef.current = runToken;

      const playbackResult = await playListeningAudio(
        section,
        listeningManualPlay.playNumber,
        runToken,
        { manual: true }
      );
      if (!playbackResult) return;

      if (listeningManualPlay.playNumber === 1) {
        const gapBetweenPlaysSeconds = Number(section.timing?.gapBetweenPlaysSeconds || 10);
        if (gapBetweenPlaysSeconds > 0) {
          if (!(await runListeningCountdown(gapBetweenPlaysSeconds, "pause", runToken))) return;
        }
        const secondPlayback = await playListeningAudio(section, 2, runToken);
        if (secondPlayback === "manual-needed") return;
        if (!secondPlayback) return;
      }
      await advanceAfterListeningSection(listeningManualPlay.sectionIndex, runToken);
    } catch (error) {
      console.error("[HubCourseTestRunner] manual listening playback failed", error);
      toast("Could not play the listening audio.");
    } finally {
      setStartingListening(false);
    }
  }

  async function continueListeningAutoplay(sectionIndex, runToken) {
    const section = listeningSections[sectionIndex];
    if (!section) return;

    try {
      const firstPlayback = await playListeningAudio(section, 1, runToken);
      if (firstPlayback === "manual-needed") return;
      if (!firstPlayback) return;

      const gapBetweenPlaysSeconds = Number(section.timing?.gapBetweenPlaysSeconds || 10);
      if (gapBetweenPlaysSeconds > 0) {
        if (!(await runListeningCountdown(gapBetweenPlaysSeconds, "pause", runToken))) return;
      }

      const secondPlayback = await playListeningAudio(section, 2, runToken);
      if (secondPlayback === "manual-needed") return;
      if (!secondPlayback) return;
      await advanceAfterListeningSection(sectionIndex, runToken);
    } catch (error) {
      console.error("[HubCourseTestRunner] listening autoplay sequence failed", error);
      toast("Could not continue the listening sequence.");
    } finally {
      setStartingListening(false);
    }
  }

  async function advanceAfterListeningSection(sectionIndex, runToken) {
    const isLastSection = sectionIndex >= listeningSections.length - 1;
    setListeningManualPlay(null);

    if (isLastSection) {
      setListeningPhase("ready-finish");
      await persistRunnerState({
        listeningSectionIndex: sectionIndex,
        listeningPhase: "ready-finish",
      });
      return;
    }

    const nextSectionIndex = sectionIndex + 1;
    if (!(await runListeningCountdown(15, "between-sections", runToken))) return;
    await persistRunnerState({
      listeningSectionIndex: nextSectionIndex,
      listeningPhase: "idle",
    });
    await runListeningSection(nextSectionIndex);
  }

  useEffect(() => {
    if (!attempt?.id || !hydrationDoneRef.current || attempt?.isTeacherPreview) return;
    if (listeningComplete) return;
    if (autosaveIntervalRef.current) {
      window.clearInterval(autosaveIntervalRef.current);
    }
    autosaveIntervalRef.current = window.setInterval(() => {
      persistRunnerState();
    }, 30000);

    return () => {
      if (autosaveIntervalRef.current) {
        window.clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [attempt?.id, listeningComplete]);

  useEffect(() => {
    if (!attempt?.id || !hydrationDoneRef.current || attempt?.isTeacherPreview) return;
    if (listeningComplete) return;
    if (!previousSectionIdRef.current) {
      previousSectionIdRef.current = currentSectionId;
      return;
    }
    if (currentSectionId && currentSectionId !== previousSectionIdRef.current) {
      const previousState = {
        ...latestStateRef.current,
        currentSectionId: previousSectionIdRef.current,
      };
      previousSectionIdRef.current = currentSectionId;
      persistRunnerState({ currentSectionId }, previousState);
      return;
    }
    previousSectionIdRef.current = currentSectionId;
  }, [attempt?.id, currentSectionId, listeningComplete]);

  useEffect(() => {
    if (!attempt?.id || !hydrationDoneRef.current) return;
    if (mainPaperSubmitted) return;
    if (!timeUp) return;

    handleSubmitMainPaper();
  }, [attempt?.id, timeUp, mainPaperSubmitted]);

  async function handleStartMainPaper() {
    if (!session || !template || !user) return;
    setStarting(true);
    try {
      if (teacherPreview) {
        const previewAttempt = buildTeacherPreviewAttempt();
        setAttempt(previewAttempt);
        setSectionStatuses(previewAttempt.runnerState.sectionStatuses);
        setSectionAnswers(previewAttempt.runnerState.sectionAnswers);
        setSectionNotes(previewAttempt.runnerState.sectionNotes);
        setCurrentSectionId(previewAttempt.runnerState.currentSectionId);
        latestStateRef.current = {
          sectionStatuses: previewAttempt.runnerState.sectionStatuses,
          sectionAnswers: previewAttempt.runnerState.sectionAnswers,
          sectionNotes: previewAttempt.runnerState.sectionNotes,
          currentSectionId: previewAttempt.runnerState.currentSectionId,
        };
        hydrationDoneRef.current = true;
        hydratedAttemptIdRef.current = previewAttempt.id;
        toast("Teacher preview started.");
        return;
      }

      const attemptId = await startCourseTestAttempt({
        sessionId: session.id,
        templateId: template.id,
        templateTitle: session.templateTitle || template.title,
        level: template.level,
        testKind: template.testKind,
        teacherUid: session.teacherUid,
        studentUid: user.uid,
        studentEmail: user.email || "",
        studentName: user.displayName || user.name || user.email || "",
      });

      const runnerState = {
        mainPaperStartedAt: new Date().toISOString(),
        currentSectionId: mainSections[0]?.id || "",
        sectionStatuses: deriveStateMap(mainSections, {}),
        sectionAnswers: deriveAnswerMap(mainSections, {}),
        sectionNotes: {},
        mainPaperStatus: "in-progress",
      };

      await saveCourseTestAttemptDraft(attemptId, { runnerState });
      const freshAttempt = await getMyCourseTestAttemptForSession(session.id, user.uid);
      setAttempt(freshAttempt);
      toast("Main paper started.");
    } catch (error) {
      console.error("[HubCourseTestRunner] start failed", error);
      toast("Could not start that test.");
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmitMainPaper() {
    if (!attempt?.id || submittingMainPaper || mainPaperSubmitted) return;

    setSubmittingMainPaper(true);
    try {
      const stateSource = latestStateRef.current;
      const nextRunnerState = {
        ...(attempt.runnerState || {}),
        sectionStatuses: stateSource.sectionStatuses,
        sectionAnswers: stateSource.sectionAnswers,
        sectionNotes: stateSource.sectionNotes,
        currentSectionId: stateSource.currentSectionId,
        mainPaperSubmittedAt: new Date().toISOString(),
        listeningSectionIndex: 0,
        listeningPhase: "idle",
      };
      const { autoScore, autoTotal } = calculateAutoScore(mainSections, stateSource.sectionAnswers);

      if (attempt.isTeacherPreview) {
        setAttempt((prev) =>
          prev
            ? {
                ...prev,
                runnerState: nextRunnerState,
                autoScore,
                autoTotal,
                percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
              }
            : prev
        );
        setSubmitConfirmOpen(false);
        return;
      }

      await saveCourseTestAttemptDraft(attempt.id, {
        runnerState: nextRunnerState,
        autoScore,
        autoTotal,
      });

      setAttempt((prev) =>
        prev
          ? {
              ...prev,
              runnerState: nextRunnerState,
              autoScore,
              autoTotal,
              percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
            }
          : prev
      );
      setSubmitConfirmOpen(false);
    } catch (error) {
      console.error("[HubCourseTestRunner] submit failed", error);
      toast("Could not submit the main paper.");
    } finally {
      setSubmittingMainPaper(false);
    }
  }

  async function handleFinishListening() {
    if (!attempt?.id) return;

    setFinishingListening(true);
    try {
      const stateSource = latestStateRef.current;
      const nextRunnerState = {
        ...(attempt.runnerState || {}),
        sectionStatuses: stateSource.sectionStatuses,
        sectionAnswers: stateSource.sectionAnswers,
        sectionNotes: stateSource.sectionNotes,
        currentSectionId: stateSource.currentSectionId,
        mainPaperSubmittedAt: attempt.runnerState?.mainPaperSubmittedAt || new Date().toISOString(),
        listeningSectionIndex,
        listeningPhase: "completed",
        listeningSubmittedAt: new Date().toISOString(),
      };
      const { autoScore, autoTotal } = calculateAutoScore(allSections, stateSource.sectionAnswers);

      if (attempt.isTeacherPreview) {
        setAttempt((prev) =>
          prev
            ? {
                ...prev,
                runnerState: nextRunnerState,
                autoScore,
                autoTotal,
                percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
                completed: true,
                submittedAt: new Date().toISOString(),
              }
            : prev
        );
        setListeningPhase("completed");
        return;
      }

      await submitCourseTestAttempt(attempt.id, {
        runnerState: nextRunnerState,
        autoScore,
        autoTotal,
      });

      setAttempt((prev) =>
        prev
          ? {
              ...prev,
              runnerState: nextRunnerState,
              autoScore,
              autoTotal,
              percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
              completed: true,
              submittedAt: new Date().toISOString(),
            }
          : prev
      );
      setListeningPhase("completed");
      const listeningStartedKey = getListeningStartedStorageKey(attempt.id);
      if (typeof window !== "undefined" && listeningStartedKey) {
        window.sessionStorage.removeItem(listeningStartedKey);
      }
    } catch (error) {
      console.error("[HubCourseTestRunner] final submit failed", error);
      toast("Could not submit the full test.");
    } finally {
      setFinishingListening(false);
    }
  }

  async function handleSkipListeningActivity() {
    if (!activeListeningSection) return;

    listeningRunTokenRef.current += 1;
    clearListeningCountdown();
    setListeningManualPlay(null);
    setStartingListening(false);

    if (listeningAudioRef.current) {
      try {
        listeningAudioRef.current.pause();
        listeningAudioRef.current.currentTime = 0;
      } catch {}
      listeningAudioRef.current = null;
    }

    if (listeningSectionIndex >= listeningSections.length - 1) {
      setListeningPhase("ready-finish");
      await persistRunnerState({
        listeningSectionIndex,
        listeningPhase: "ready-finish",
      });
      return;
    }

    const nextSectionIndex = listeningSectionIndex + 1;
    setListeningSectionIndex(nextSectionIndex);
    setListeningPhase("idle");
    await persistRunnerState({
      listeningSectionIndex: nextSectionIndex,
      listeningPhase: "idle",
    });
    await runListeningSection(nextSectionIndex);
  }

  async function handleStatusChange(sectionId, status) {
    const next = { ...sectionStatuses, [sectionId]: status };
    setSectionStatuses(next);
    setSaving(true);
    try {
      const nextRunnerState = {
        ...(attempt?.runnerState || {}),
        sectionStatuses: next,
        sectionAnswers,
        sectionNotes,
        currentSectionId,
      };
      const { autoScore, autoTotal } = calculateAutoScore(mainSections, sectionAnswers);
      await saveCourseTestAttemptDraft(attempt.id, {
        runnerState: nextRunnerState,
        autoScore,
        autoTotal,
      });
      setAttempt((prev) =>
        prev
          ? {
              ...prev,
              runnerState: nextRunnerState,
              autoScore,
              autoTotal,
              percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
            }
          : prev
      );
    } catch (error) {
      console.error("[HubCourseTestRunner] status save failed", error);
      toast("Could not save that section status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCurrentSectionNote() {
    await persistRunnerState();
    toast("Progress saved.");
  }

  function setItemAnswer(sectionId, itemId, value) {
    setSectionAnswers((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [itemId]: value,
      },
    }));
  }

  function setInlineGapAnswer(sectionId, item, gapId, value) {
    if (!isInlineTextInputItem(item)) {
      setItemAnswer(sectionId, item.id, value);
      return;
    }

    setSectionAnswers((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [item.id]: {
          ...((prev?.[sectionId]?.[item.id] && typeof prev[sectionId][item.id] === "object")
            ? prev[sectionId][item.id]
            : {}),
          [gapId]: value,
        },
      },
    }));
  }

  function handlePronunciationDrop(sectionId, itemId, value) {
    setItemAnswer(sectionId, itemId, value);
    setDraggedItemId("");
  }

  const scoreSummary = useMemo(
    () => calculateAutoScore(mainSections, sectionAnswers),
    [mainSections, sectionAnswers]
  );
  const teacherItemScores = attempt?.teacherReview?.itemScores || {};
  const sectionBreakdown = useMemo(
    () => calculateSkillBreakdown(allSections, sectionAnswers, teacherItemScores),
    [allSections, sectionAnswers, teacherItemScores]
  );
  const provisionalScore = useMemo(
    () => sectionBreakdown.reduce((sum, entry) => sum + entry.score, 0),
    [sectionBreakdown]
  );
  const provisionalTotal = useMemo(
    () => sectionBreakdown.reduce((sum, entry) => sum + entry.total, 0),
    [sectionBreakdown]
  );
  const reviewStatus = attempt?.reviewStatus || (attempt?.completed ? "pending" : "not-submitted");
  const controlMode = session?.controlMode === "self-controlled" ? "self-controlled" : "teacher-controlled";
  const mainPaperState = session?.mainPaperState || (controlMode === "self-controlled" ? "open" : "locked");
  const listeningState = session?.listeningState || (controlMode === "self-controlled" ? "open" : "locked");
  const mainPaperAvailable = teacherPreview || controlMode === "self-controlled" || mainPaperState === "open";
  const listeningAvailable = teacherPreview || controlMode === "self-controlled" || listeningState === "open";

  useEffect(() => {
    if (!attempt?.id || !hydrationDoneRef.current) return;
    if (!mainPaperSubmitted || listeningComplete) return;
    if (!activeListeningSection) return;
    if (!listeningAvailable) return;
    if (startingListening) return;
    if (listeningPhase !== "idle") return;

    runListeningSection(listeningSectionIndex);
  }, [
    attempt?.id,
    mainPaperSubmitted,
    listeningComplete,
    activeListeningSection,
    listeningAvailable,
    listeningPhase,
    listeningSectionIndex,
    startingListening,
  ]);

  if (!user) {
    return (
      <div className="menu-wrapper hub-course-test-wrapper">
        <div className="hub-course-test-shell">
          <button className="review-btn" onClick={() => navigate(getSitePath(backPath))}>
            {teacherPreview ? "← Back to teacher tools" : "← Back to your class"}
          </button>
          <section className="hub-course-test-panel">
            <h1 className="hub-course-test-title">Course test</h1>
            <p className="hub-course-test-copy">Sign in to access this test session.</p>
          </section>
        </div>
        <HubCourseTestRunnerStyles />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="menu-wrapper hub-course-test-wrapper">
        <div className="hub-course-test-shell">
          <button className="review-btn" onClick={() => navigate(getSitePath(backPath))}>
            {teacherPreview ? "← Back to teacher tools" : "← Back to your class"}
          </button>
          <section className="hub-course-test-panel">
            <p className="hub-course-test-copy">Loading test session…</p>
          </section>
        </div>
        <HubCourseTestRunnerStyles />
      </div>
    );
  }

  if (!session || !template) {
    return (
      <div className="menu-wrapper hub-course-test-wrapper">
        <div className="hub-course-test-shell">
          <button className="review-btn" onClick={() => navigate(getSitePath(backPath))}>
            {teacherPreview ? "← Back to teacher tools" : "← Back to your class"}
          </button>
          <section className="hub-course-test-panel">
            <h1 className="hub-course-test-title">Course test not available</h1>
            <p className="hub-course-test-copy">
              This session could not be found, or its template has not been loaded yet.
            </p>
          </section>
        </div>
        <HubCourseTestRunnerStyles />
      </div>
    );
  }

  return (
    <div className="menu-wrapper hub-course-test-wrapper">
      <div className="hub-course-test-shell">
        <div className="hub-course-test-topbar">
          <button className="review-btn" onClick={() => navigate(getSitePath(backPath))}>
            {teacherPreview ? "← Back to teacher tools" : "← Back to your class"}
          </button>
          <div className="hub-course-test-save">
            {teacherPreview ? <span>Teacher preview</span> : saving ? <span>Saving…</span> : <span>Auto-saved</span>}
          </div>
        </div>

        <header className="hub-course-test-hero">
          <div>
            <span className="hub-course-test-kicker">Course test session</span>
            <h1 className="hub-course-test-title">{session.templateTitle || template.title}</h1>
            <p className="hub-course-test-copy">
              {(template.testKind === "end-of-course" ? "End-of-course test" : "Progress test")} ·{" "}
              {(template.level || "b1").toUpperCase()} · Teacher: {session.teacherName || session.teacherEmail || "Your teacher"}
            </p>
            {teacherPreview ? (
              <p className="hub-course-test-copy">Preview mode. No student submission will be recorded.</p>
            ) : null}
          </div>
          {!mainPaperSubmitted ? (
            <div className={`hub-course-test-timer ${timeUp ? "is-over" : ""}`}>
              <span>Main paper</span>
              <strong>{formatDuration(timeRemainingMs)}</strong>
            </div>
          ) : null}
        </header>

        {!attempt ? (
          <section className="hub-course-test-panel">
            <div className="hub-course-test-panel-head">
              <div>
                <h2>{mainPaperAvailable ? "Ready to begin" : "Waiting for teacher"}</h2>
                <p>
                  {teacherPreview
                    ? "Run through this session exactly as a student would, with full access to the whole paper and listening stages."
                    : mainPaperAvailable
                    ? `${mainPaperDurationMinutes} minutes. Complete the main paper, then listening will follow separately.`
                    : "Your teacher has not opened the main paper yet. You’ll be able to start as soon as they open this stage."}
                </p>
              </div>
            </div>

            <div className="hub-course-test-actions">
              {mainPaperAvailable ? (
                <button className="btn" type="button" onClick={handleStartMainPaper} disabled={starting}>
                  {starting ? "Starting..." : teacherPreview ? "Start preview" : "Start main paper"}
                </button>
              ) : (
                <button className="ghost-btn" type="button" disabled>
                  Waiting for teacher to open main paper
                </button>
              )}
            </div>
          </section>
        ) : listeningComplete ? (
          <section className="hub-course-test-panel">
            <div className="hub-course-test-report">
                <div className="hub-course-test-report-hero">
                  <span className="hub-course-test-kicker">Result</span>
                  <h2>{teacherPreview ? "Preview complete" : "Test submitted"}</h2>
                  <p>
                    {teacherPreview
                      ? "You’ve completed the full teacher walkthrough. No student attempt was submitted."
                      : reviewStatus === "reviewed"
                    ? "Your teacher has reviewed this test. Here is your final report."
                    : "Your test has been submitted successfully. Your teacher will review it and confirm the final result."}
                  </p>
                </div>

              <div className="hub-course-test-report-score">
                <span className="hub-course-test-report-status">
                  {teacherPreview ? "Teacher preview" : reviewStatus === "reviewed" ? "Reviewed" : "Awaiting review"}
                </span>
                <strong>
                  {teacherPreview
                    ? `${provisionalTotal ? Math.round((provisionalScore / provisionalTotal) * 100) : 0}%`
                    : reviewStatus === "reviewed"
                    ? `${attempt?.finalPercent ?? 0}%`
                    : `${provisionalTotal ? Math.round((provisionalScore / provisionalTotal) * 100) : 0}%`}
                </strong>
                <p>
                  {teacherPreview
                    ? `${provisionalScore}/${provisionalTotal} points in preview`
                    : reviewStatus === "reviewed"
                    ? `${attempt?.teacherScore ?? 0}/${attempt?.teacherTotal ?? 0} points`
                    : `${provisionalScore}/${provisionalTotal} auto-marked points so far`}
                </p>
              </div>

              {sectionBreakdown.length ? (
                <div className="hub-course-test-report-breakdown">
                  {sectionBreakdown.map((entry) => (
                    <div key={entry.skill} className="hub-course-test-report-row">
                      <div className="hub-course-test-report-row-head">
                        <span>{entry.label}</span>
                        <strong>{entry.score}/{entry.total}</strong>
                      </div>
                      <div className="hub-course-test-report-track">
                        <div
                          className="hub-course-test-report-fill"
                          style={{
                            width: `${entry.total ? Math.max(4, Math.round((entry.score / entry.total) * 100)) : 0}%`,
                          }}
                        />
                      </div>
                      <small>
                        {entry.total ? `${Math.round((entry.score / entry.total) * 100)}%` : "—"}
                      </small>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : mainPaperSubmitted ? (
          <section className="hub-course-test-panel">
            {!listeningAvailable ? (
              <div className="hub-course-test-report">
                <div className="hub-course-test-report-hero">
                  <span className="hub-course-test-kicker">Main paper submitted</span>
                  <h2>{teacherPreview ? "Listening ready" : "Waiting for listening"}</h2>
                  <p>
                    {teacherPreview
                      ? "You can continue straight into listening from this teacher preview."
                      : "Your main paper has been submitted. Listening will begin once your teacher opens the listening stage."}
                  </p>
                </div>
              </div>
            ) : activeListeningSection ? (
              <>
                <div className="hub-course-test-listening-hero">
                  <span className="hub-course-test-listening-kicker">
                    Listening exercise {listeningSectionIndex + 1} of {listeningSections.length}
                  </span>
                  <h2>{activeListeningSection.title}</h2>
                  <p className="hub-course-test-listening-instruction">
                    {activeListeningSection.sharedPrompt?.title || activeListeningSection.notes}
                  </p>
                  <p className="hub-course-test-listening-status">
                    {listeningPhase === "idle"
                      ? "Get ready. Reading time will begin automatically."
                      : listeningPhase === "preread"
                        ? `Read the task. Recording 1 starts in ${listeningCountdown}s.`
                        : listeningPhase === "pause"
                          ? `Play 2 starts in ${listeningCountdown}s.`
                          : listeningPhase === "between-sections"
                            ? `Next exercise starts in ${listeningCountdown}s.`
                            : listeningPhase === "playing-first"
                              ? "Play 1"
                              : listeningPhase === "playing-second"
                                ? "Play 2"
                                : listeningPhase === "awaiting-first-play"
                                  ? "Press to play recording 1."
                                  : listeningPhase === "awaiting-second-play"
                                    ? "Press to play recording 2."
                                    : listeningPhase === "resume-blocked"
                                      ? "This listening exercise was already started before the page refreshed. Ask your teacher before continuing."
                                    : listeningPhase === "ready-finish"
                                      ? "Listening complete. Submit when you're ready."
                                      : "Listening in progress."}
                  </p>
                </div>

                {Array.isArray(activeListeningSection.sharedPrompt?.exampleLines) &&
                activeListeningSection.sharedPrompt.exampleLines.length > 0 ? (
                  <div className="hub-course-test-example-block">
                    {activeListeningSection.sharedPrompt.exampleLines.map((line, index) => (
                      <p key={`${activeListeningSection.id}:example:${index}`} className="hub-course-test-example-line">
                        {line}
                      </p>
                    ))}
                  </div>
                ) : null}

                <audio
                  ref={listeningElementRef}
                  preload="auto"
                  src={activeListeningSection.audioSrc}
                  className="hub-course-test-hidden-audio"
                />

                <div className="hub-course-test-items is-plain hub-course-test-active-input-scope">
                  {activeListeningSection.items.map((item, index) => {
                    const answer = sectionAnswers?.[activeListeningSection.id]?.[item.id] ?? "";
                    const inlineTextInput = item.type === "text-input"
                      ? renderInlineTextInput(
                          item,
                          answer,
                          (gapId, value) => setInlineGapAnswer(activeListeningSection.id, item, gapId, value),
                          false
                        )
                      : null;

                    return (
                      <article key={item.id} className="hub-course-test-item-card is-plain">
                        <div className="hub-course-test-item-head">
                          <span className="hub-course-test-item-index">{index + 1}</span>
                          <p className={inlineTextInput ? "hub-course-test-inline-prompt" : ""}>
                            {inlineTextInput || (item.highlight ? renderHighlightedWord(item.prompt, item.highlight) : item.prompt)}
                          </p>
                        </div>

                        {item.type === "choice" ? (
                          renderChoiceControls(
                            item,
                            answer,
                            (value) => setItemAnswer(activeListeningSection.id, item.id, value),
                            false
                          )
                        ) : item.type === "matching-select" ? (
                          <MatchingSelectControl
                            section={activeListeningSection}
                            item={item}
                            answer={answer}
                            onSelect={(value) => setItemAnswer(activeListeningSection.id, item.id, value)}
                          />
                        ) : inlineTextInput ? null : (
                          <input
                            className="input"
                            value={answer}
                            onChange={(e) => setItemAnswer(activeListeningSection.id, item.id, e.target.value)}
                            onKeyDown={handleExamTextInputKeyDown}
                            placeholder="Type your answer"
                            spellCheck={false}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                          />
                        )}
                      </article>
                    );
                  })}
                </div>

                <div className="hub-course-test-listening-actions">
                  {listeningPhase !== "ready-finish" ? (
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={handleSkipListeningActivity}
                    >
                      {listeningSectionIndex >= listeningSections.length - 1 ? "Finish activity" : "Next activity"}
                    </button>
                  ) : null}

                  {listeningPhase === "awaiting-first-play" || listeningPhase === "awaiting-second-play" ? (
                    <button
                      className="btn"
                      type="button"
                      onClick={handleManualListeningPlay}
                      disabled={startingListening}
                    >
                      {startingListening
                        ? "Starting playback..."
                        : `Play recording ${listeningManualPlay?.playNumber || ""}`}
                    </button>
                  ) : null}

                  {listeningPhase === "ready-finish" ? (
                    <button
                      className="btn"
                      type="button"
                      onClick={handleFinishListening}
                      disabled={finishingListening}
                    >
                      {finishingListening ? "Submitting..." : "Submit listening and finish test"}
                    </button>
                  ) : null}
                </div>
              </>
            ) : null}
          </section>
        ) : (
          <div className="hub-course-test-layout is-minimal">
            <main className="hub-course-test-main">
              {currentSection ? (
                <section className="hub-course-test-panel">
                  <div ref={sectionTopRef} />
                  <div className="hub-course-test-panel-head">
                    <div>
                      <h2>{currentSection.title}</h2>
                      <p>{currentSection.notes}</p>
                    </div>
                    <span className="hub-course-test-pill">
                      Section {currentSectionIndex + 1} of {mainSections.length}
                    </span>
                  </div>

                  {currentSection.sharedPrompt && currentSection.taskType !== "sort-by-sound" ? (
                    <div className="hub-course-test-shared-prompt">
                      {getSharedPromptHeading(currentSection.sharedPrompt) ? (
                        <p className="hub-course-test-shared-title">{getSharedPromptHeading(currentSection.sharedPrompt)}</p>
                      ) : null}

                      {Array.isArray(currentSection.sharedPrompt.exampleLines) &&
                      currentSection.sharedPrompt.exampleLines.length ? (
                        <div className="hub-course-test-example-block">
                          {currentSection.sharedPrompt.exampleLines.map((line, index) => (
                            <p key={`${currentSection.id}:example:${index}`} className="hub-course-test-example-line">
                              {line}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {currentSection.sharedPrompt.type === "word-bank" ? (
                        <div className="hub-course-test-word-bank">
                          {currentSection.sharedPrompt.values.map((value) => (
                            <span
                              key={typeof value === "string" ? value : value.text}
                              className="hub-course-test-word-chip"
                            >
                              {renderOptionLabel(value)}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {currentSection.sharedPrompt.type === "reading-passage" ? (
                        <div className="hub-course-test-passage">
                          {currentSection.sharedPrompt.passages.map((passage) => (
                            <article key={passage.heading} className="hub-course-test-passage-card">
                              <h3>{passage.heading}</h3>
                              <p>{renderHighlightedPassage(passage.text, passage.highlightWords)}</p>
                            </article>
                          ))}
                          {Array.isArray(currentSection.sharedPrompt.footerLines) && currentSection.sharedPrompt.footerLines.length ? (
                            <div className="hub-course-test-shared-prompt">
                              {currentSection.sharedPrompt.footerLines.map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {currentSection.sharedPrompt.type === "reading-passage-ref" ? (
                        <p className="hub-course-test-shared-title">
                          {currentSection.sharedPrompt.title}
                        </p>
                      ) : null}

                    </div>
                  ) : null}

                  {Array.isArray(currentSection.items) && currentSection.items.length ? (
                    currentSection.taskType === "sort-by-sound" ? (
                      <PronunciationDragBoard
                        section={currentSection}
                        answers={sectionAnswers?.[currentSection.id] || {}}
                        draggedItemId={draggedItemId}
                        onDragStart={setDraggedItemId}
                        onDropItem={handlePronunciationDrop}
                        timeUp={timeUp}
                      />
                    ) : (
                    <div className="hub-course-test-items is-plain hub-course-test-active-input-scope">
                      {currentSection.items.map((item, index) => {
                        const answer = sectionAnswers?.[currentSection.id]?.[item.id] ?? "";
                        const inlineTextInput = item.type === "text-input"
                          ? renderInlineTextInput(
                              item,
                              answer,
                              (gapId, value) => setInlineGapAnswer(currentSection.id, item, gapId, value),
                              timeUp
                            )
                          : null;

                        return (
                          <article
                            key={item.id}
                            className={`hub-course-test-item-card is-plain ${currentSection.taskType === "word-formation" ? "is-word-formation" : ""} ${item.type === "stress-choice" ? "is-stress-choice" : ""}`}
                          >
                            <div className="hub-course-test-item-head">
                              <span className="hub-course-test-item-index">{index + 1}</span>
                              {item.type === "stress-choice" ? (
                                <p>{item.prompt}</p>
                              ) : (
                                <p className={inlineTextInput ? "hub-course-test-inline-prompt" : ""}>
                                  {inlineTextInput || (item.highlight ? renderHighlightedWord(item.prompt, item.highlight) : item.prompt)}
                                </p>
                              )}
                            </div>

                            {item.type === "choice" ? (
                              renderChoiceControls(
                                item,
                                answer,
                                (value) => setItemAnswer(currentSection.id, item.id, value),
                                timeUp
                              )
                        ) : item.type === "matching-select" ? (
                          <MatchingSelectControl
                            section={currentSection}
                            item={item}
                            answer={answer}
                            onSelect={(value) => setItemAnswer(currentSection.id, item.id, value)}
                            disabled={timeUp}
                          />
                        ) : item.type === "stress-choice" ? (
                          <div className="hub-course-test-stress-buttons">
                            {item.syllables.map((syllable, syllableIndex) => (
                              <button
                                key={`${item.id}:${syllableIndex}`}
                                type="button"
                                className={`hub-course-test-stress-btn ${String(answer) === String(syllableIndex) ? "is-selected" : ""}`}
                                onClick={() => setItemAnswer(currentSection.id, item.id, String(syllableIndex))}
                                disabled={timeUp}
                              >
                                {syllable}
                              </button>
                            ))}
                          </div>
                        ) : inlineTextInput ? null : (
                          <input
                            className="input"
                            value={answer}
                            onChange={(e) => setItemAnswer(currentSection.id, item.id, e.target.value)}
                            onKeyDown={handleExamTextInputKeyDown}
                            placeholder="Type your answer"
                            spellCheck={false}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            disabled={timeUp}
                          />
                        )}
                      </article>
                    );
                  })}
                    </div>
                    )
                  ) : null}

                  {currentSectionIndex === mainSections.length - 1 ? (
                    <div className="hub-course-test-submit-row">
                      <button
                        className="btn"
                        type="button"
                        onClick={() => setSubmitConfirmOpen(true)}
                      >
                        Submit exam
                      </button>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </main>
          </div>
        )}

        {attempt && !mainPaperSubmitted ? (
          <>
            <div className="hub-course-test-floating-nav" role="navigation" aria-label="Section navigation">
              <button
                type="button"
                className="hub-course-test-fab is-secondary"
                onClick={() => previousSection && setCurrentSectionId(previousSection.id)}
                disabled={!previousSection}
              >
                <span className="hub-course-test-fab-label">← Previous</span>
              </button>
              <button
                type="button"
                className="hub-course-test-fab"
                onClick={() => setSectionMenuOpen(true)}
                aria-label="Open section menu"
              >
                <span className="hub-course-test-fab-icon">☰</span>
                <span className="hub-course-test-fab-label">Sections</span>
              </button>
              <button
                type="button"
                className="hub-course-test-fab is-secondary"
                onClick={() => nextSection && setCurrentSectionId(nextSection.id)}
                disabled={!nextSection}
              >
                <span className="hub-course-test-fab-label">Next →</span>
              </button>
            </div>
            {sectionMenuOpen ? (
              <div className="hub-course-test-modal" onClick={() => setSectionMenuOpen(false)}>
                <div className="hub-course-test-modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="hub-course-test-modal-head">
                    <div>
                      <h3>Main paper sections</h3>
                      <p>{answeredSections} of {mainSections.length} sections started</p>
                    </div>
                    <button className="ghost-btn" type="button" onClick={() => setSectionMenuOpen(false)}>
                      Close
                    </button>
                  </div>

                  <div className="hub-course-test-modal-list">
                    {mainSections.map((section, index) => {
                      const started = Object.values(sectionAnswers?.[section.id] || {}).some((value) => hasAnyAnswer(value));
                      return (
                        <button
                          key={section.id}
                          type="button"
                          className={`hub-course-test-nav-btn ${section.id === currentSectionId ? "active" : ""}`}
                          onClick={() => {
                            setCurrentSectionId(section.id);
                            setSectionMenuOpen(false);
                          }}
                        >
                          <span className="hub-course-test-nav-index">{index + 1}</span>
                          <span className="hub-course-test-nav-copy">
                            <strong>{section.title}</strong>
                            <small>{section.itemCount} items · {started ? "started" : "not started"}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="hub-course-test-modal-listening">
                    <h4>Listening stage</h4>
                    {listeningSections.map((section) => (
                      <div key={section.id} className="hub-course-test-listening-card">
                        <strong>{section.title}</strong>
                        <p>
                          {section.itemCount} items · {section.timing?.playCount || 2} plays · pre-read{" "}
                          {section.timing?.preReadSeconds || 30}s
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {submitConfirmOpen ? (
              <div className="hub-course-test-modal" onClick={() => setSubmitConfirmOpen(false)}>
                <div className="hub-course-test-modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="hub-course-test-modal-head">
                    <div>
                      <h3>Submit main paper?</h3>
                      <p>
                        You won’t be able to keep working on grammar, vocabulary, pronunciation, or reading after
                        submitting.
                      </p>
                    </div>
                    <button className="ghost-btn" type="button" onClick={() => setSubmitConfirmOpen(false)}>
                      Close
                    </button>
                  </div>

                  <div className="hub-course-test-confirm-copy">
                    <p>
                      If you submit now, the main paper will be locked and you’ll move to a waiting screen for the
                      listening stage.
                    </p>
                  </div>

                  <div className="hub-course-test-confirm-actions">
                    <button className="ghost-btn" type="button" onClick={() => setSubmitConfirmOpen(false)}>
                      Review again
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={handleSubmitMainPaper}
                      disabled={submittingMainPaper}
                    >
                      {submittingMainPaper ? "Submitting..." : teacherPreview ? "Confirm and continue" : "Confirm submit"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <HubCourseTestRunnerStyles />
    </div>
  );
}

function HubCourseTestRunnerStyles() {
  return (
    <style>{`
      .hub-course-test-wrapper {
        width: min(1160px, 100%);
      }

      .hub-course-test-shell {
        display: grid;
        gap: 1rem;
      }

      .hub-course-test-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
      }

      .hub-course-test-save {
        color: #9cb2d3;
        min-height: 1.2rem;
        font-size: 0.92rem;
      }

      .hub-course-test-hero,
      .hub-course-test-panel {
        border-radius: 20px;
        border: 1px solid rgba(70, 102, 170, 0.42);
        background: linear-gradient(180deg, rgba(11, 21, 48, 0.98), rgba(14, 28, 63, 0.96));
        box-shadow: 0 24px 60px rgba(2, 8, 24, 0.34);
      }

      .hub-course-test-hero {
        padding: 1.35rem 1.45rem;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
      }

      .hub-course-test-panel {
        padding: 1.1rem;
      }

      .hub-course-test-report {
        display: grid;
        gap: 1.15rem;
      }

      .hub-course-test-report-hero h2 {
        margin: 0.45rem 0 0.35rem;
        color: #eef4ff;
        font-size: clamp(1.8rem, 4vw, 2.3rem);
      }

      .hub-course-test-report-hero p {
        margin: 0;
        color: #a9b7d1;
        line-height: 1.55;
        max-width: 60ch;
      }

      .hub-course-test-report-score {
        display: grid;
        gap: 0.2rem;
        padding: 1rem 1.05rem;
        border-radius: 18px;
        border: 1px solid rgba(120, 182, 255, 0.22);
        background: linear-gradient(180deg, rgba(120, 182, 255, 0.1), rgba(120, 182, 255, 0.04));
      }

      .hub-course-test-report-status {
        color: #9fd0ff;
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .hub-course-test-report-score strong {
        color: #eef4ff;
        font-size: clamp(2.2rem, 7vw, 3.6rem);
        line-height: 1;
      }

      .hub-course-test-report-score p {
        margin: 0.15rem 0 0;
        color: #cfe0fb;
        font-size: 1rem;
      }

      .hub-course-test-report-breakdown {
        display: grid;
        gap: 0.8rem;
      }

      .hub-course-test-report-row {
        padding: 0.85rem 0.9rem;
        border-radius: 16px;
        border: 1px solid rgba(63, 94, 155, 0.34);
        background: rgba(8, 16, 38, 0.42);
        display: grid;
        gap: 0.45rem;
      }

      .hub-course-test-report-row-head {
        display: flex;
        justify-content: space-between;
        gap: 0.8rem;
        align-items: baseline;
      }

      .hub-course-test-report-row-head span {
        color: #dfeaff;
        font-weight: 700;
      }

      .hub-course-test-report-row-head strong {
        color: #eef4ff;
        font-size: 1rem;
      }

      .hub-course-test-report-track {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: rgba(120, 182, 255, 0.1);
        overflow: hidden;
      }

      .hub-course-test-report-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #63c7ff, #85f0c0);
      }

      .hub-course-test-report-row small {
        color: #9cb2d3;
        font-size: 0.88rem;
      }

      .hub-course-test-kicker,
      .hub-course-test-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.28rem 0.62rem;
        border-radius: 999px;
        border: 1px solid rgba(120, 182, 255, 0.32);
        background: rgba(120, 182, 255, 0.1);
        color: #9fd0ff;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .hub-course-test-title {
        margin: 0.6rem 0 0.35rem;
        color: #eef4ff;
        font-size: clamp(1.75rem, 4vw, 2.35rem);
      }

      .hub-course-test-copy,
      .hub-course-test-panel-head p,
      .hub-course-test-footnote p,
      .hub-course-test-listening-card p {
        margin: 0;
        color: #a9b7d1;
        line-height: 1.5;
      }

      .hub-course-test-timer {
        min-width: 150px;
        border-radius: 16px;
        padding: 0.85rem 1rem;
        border: 1px solid rgba(88, 137, 255, 0.28);
        background: rgba(16, 30, 68, 0.72);
        display: grid;
        gap: 0.2rem;
        text-align: right;
      }

      .hub-course-test-timer span {
        color: #9cb2d3;
        font-size: 0.84rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .hub-course-test-timer strong {
        color: #eef4ff;
        font-size: 1.55rem;
      }

      .hub-course-test-timer.is-over {
        border-color: rgba(214, 92, 92, 0.28);
        background: rgba(72, 20, 20, 0.5);
      }

      .hub-course-test-layout {
        display: grid;
        grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.5fr);
        gap: 1rem;
      }

      .hub-course-test-layout.is-minimal {
        grid-template-columns: minmax(0, 1fr);
      }

      .hub-course-test-main,
      .hub-course-test-nav,
      .hub-course-test-listening-list,
      .hub-course-test-summary-grid,
      .hub-course-test-detail-grid {
        display: grid;
        gap: 0.85rem;
      }

      .hub-course-test-panel-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .hub-course-test-panel-head.compact {
        margin-bottom: 0.75rem;
      }

      .hub-course-test-panel-head h2 {
        margin: 0 0 0.25rem;
        color: #eef4ff;
      }

      .hub-course-test-scorebar {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.75rem 0.9rem;
        border-radius: 14px;
        border: 1px solid rgba(120, 182, 255, 0.22);
        background: rgba(120, 182, 255, 0.08);
        color: #cfe6ff;
      }

      .hub-course-test-items {
        display: grid;
        gap: 0.85rem;
        margin-bottom: 1rem;
      }

      .hub-course-test-items.is-plain {
        gap: 1rem;
      }

      .hub-course-test-shared-prompt {
        margin-bottom: 1rem;
        padding: 0.9rem;
        border-radius: 14px;
        border: 1px solid rgba(63, 94, 155, 0.38);
        background: rgba(8, 16, 38, 0.48);
      }

      .hub-course-test-shared-title {
        margin: 0 0 0.65rem;
        color: #dfeaff;
        line-height: 1.5;
      }

      .hub-course-test-example-block {
        display: grid;
        gap: 0.22rem;
        margin-bottom: 0.8rem;
        padding: 0.75rem 0.85rem;
        border-radius: 12px;
        border: 1px solid rgba(120, 182, 255, 0.18);
        background: rgba(120, 182, 255, 0.06);
      }

      .hub-course-test-example-line {
        margin: 0;
        color: #dfeaff;
        line-height: 1.55;
      }

      .hub-course-test-word-bank {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .hub-course-test-passage {
        display: grid;
        gap: 0.85rem;
      }

      .hub-course-test-passage-card {
        border-radius: 14px;
        border: 1px solid rgba(63, 94, 155, 0.34);
        background: rgba(5, 12, 31, 0.52);
        padding: 0.9rem;
      }

      .hub-course-test-passage-card h3 {
        margin: 0 0 0.45rem;
        color: #eef4ff;
      }

      .hub-course-test-passage-card p {
        margin: 0;
        color: #dfeaff;
        line-height: 1.7;
        white-space: pre-wrap;
      }

      .hub-course-test-word-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.38rem 0.65rem;
        border-radius: 999px;
        background: rgba(120, 182, 255, 0.1);
        border: 1px solid rgba(120, 182, 255, 0.24);
        color: #d7ebff;
      }

      .hub-course-test-item-card {
        border-radius: 14px;
        border: 1px solid rgba(63, 94, 155, 0.38);
        background: rgba(8, 16, 38, 0.48);
        padding: 0.9rem;
        display: grid;
        gap: 0.7rem;
      }

      .hub-course-test-item-card.is-plain {
        border: 0;
        border-radius: 0;
        background: transparent;
        padding: 0 0 1rem;
        border-bottom: 1px solid rgba(63, 94, 155, 0.22);
      }

      .hub-course-test-item-card.is-word-formation {
        grid-template-columns: minmax(0, 1fr) 10rem;
        align-items: center;
        gap: 0.9rem;
      }

      .hub-course-test-item-card.is-stress-choice {
        gap: 0.85rem;
      }

      .hub-course-test-item-head {
        display: flex;
        gap: 0.7rem;
        align-items: flex-start;
      }

      .hub-course-test-item-head p {
        margin: 0;
        color: #eef4ff;
        line-height: 1.5;
        min-width: 0;
        flex: 1 1 auto;
      }

      .hub-course-test-inline-prompt {
        line-height: 1.9;
        min-width: 0;
      }

      .hub-course-test-item-index {
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(120, 182, 255, 0.12);
        border: 1px solid rgba(120, 182, 255, 0.28);
        color: #9fd0ff;
        font-weight: 700;
        flex: 0 0 auto;
      }

      .hub-course-test-choice-list {
        display: grid;
        gap: 0.5rem;
      }

      .hub-course-test-matching-select {
        position: relative;
        margin-left: 2.5rem;
        width: min(24rem, 100%);
      }

      .hub-course-test-matching-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        width: 100%;
        min-height: 2.9rem;
        border-radius: 14px;
        border: 1px solid rgba(88, 120, 185, 0.34);
        background: rgba(12, 22, 52, 0.7);
        color: #dfeaff;
        padding: 0.72rem 0.9rem;
        text-align: left;
        cursor: pointer;
      }

      .hub-course-test-matching-trigger.is-selected {
        border-color: rgba(129, 211, 255, 0.58);
        background: rgba(18, 31, 70, 0.9);
      }

      .hub-course-test-matching-trigger:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .hub-course-test-matching-trigger-text {
        line-height: 1.35;
      }

      .hub-course-test-matching-trigger-icon {
        color: #9fd0ff;
        font-size: 0.85rem;
        flex: 0 0 auto;
      }

      .hub-course-test-matching-menu {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 0.35rem);
        z-index: 15;
        display: grid;
        gap: 0.35rem;
        padding: 0.45rem;
        border-radius: 16px;
        border: 1px solid rgba(88, 120, 185, 0.34);
        background: rgba(8, 16, 38, 0.97);
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.34);
      }

      .hub-course-test-matching-option {
        display: block;
        width: 100%;
        text-align: left;
        border: 1px solid rgba(88, 120, 185, 0.24);
        border-radius: 12px;
        background: rgba(18, 31, 70, 0.76);
        color: #dfeaff;
        padding: 0.65rem 0.8rem;
        cursor: pointer;
        line-height: 1.4;
      }

      .hub-course-test-matching-option:hover,
      .hub-course-test-matching-option.is-selected {
        border-color: rgba(129, 211, 255, 0.58);
        background: rgba(29, 51, 104, 0.92);
      }

      .hub-course-test-stress-buttons.is-choice-words {
        flex-wrap: wrap;
      }

      .hub-course-test-choice-word-btn {
        min-width: 0;
      }

      .hub-course-test-inline-gap {
        display: inline-block;
        width: 10rem;
        min-height: 2.7rem;
        margin: 0 0.35rem;
        vertical-align: middle;
        text-align: center;
      }

      .hub-course-test-inline-gap.is-short {
        width: 5.4rem;
      }

      .hub-course-test-inline-gap.is-medium {
        width: 8.2rem;
      }

      .hub-course-test-inline-gap.is-xlong {
        width: min(28rem, 100%);
      }

      .hub-course-test-word-formation-prompt {
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .hub-course-test-word-formation-input {
        width: 100%;
        max-width: 10rem;
      }

      .hub-course-test-choice-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        text-align: left;
        border: 1px solid rgba(88, 120, 185, 0.34);
        border-radius: 14px;
        background: rgba(12, 22, 52, 0.7);
        color: #dfeaff;
        padding: 0.72rem 0.85rem;
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
      }

      .hub-course-test-choice-card:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: rgba(125, 211, 255, 0.5);
        background: rgba(18, 31, 70, 0.88);
      }

      .hub-course-test-choice-card:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .hub-course-test-choice-card.is-selected {
        border-color: rgba(129, 211, 255, 0.72);
        background: linear-gradient(180deg, rgba(39, 84, 153, 0.45), rgba(18, 40, 84, 0.9));
        box-shadow: 0 10px 26px rgba(25, 65, 136, 0.2);
      }

      .hub-course-test-choice-letter {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        border: 1px solid rgba(132, 169, 235, 0.45);
        background: rgba(255, 255, 255, 0.04);
        color: #9fd0ff;
        font-weight: 800;
        flex: 0 0 auto;
      }

      .hub-course-test-choice-card.is-selected .hub-course-test-choice-letter {
        border-color: rgba(144, 226, 255, 0.72);
        background: rgba(125, 211, 255, 0.16);
        color: #f6fbff;
      }

      .hub-course-test-choice-text {
        display: block;
        line-height: 1.45;
        color: #dfeaff;
      }

      .hub-course-test-stress-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-left: 2.5rem;
      }

      .hub-course-test-stress-btn {
        border: 1px solid rgba(94, 125, 189, 0.36);
        background: rgba(15, 27, 60, 0.82);
        color: #e8f0ff;
        border-radius: 999px;
        padding: 0.52rem 0.88rem;
        font: inherit;
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      }

      .hub-course-test-stress-btn:hover {
        transform: translateY(-1px);
        border-color: rgba(120, 182, 255, 0.52);
      }

      .hub-course-test-stress-btn.is-selected {
        background: linear-gradient(135deg, rgba(66, 153, 225, 0.28), rgba(87, 217, 180, 0.22));
        border-color: rgba(129, 211, 255, 0.62);
        color: #f6fbff;
      }

      .hub-course-test-sound-highlight {
        font-weight: 800;
        color: #7dd3ff;
        text-shadow: 0 0 14px rgba(125, 211, 255, 0.28);
      }

      .hub-course-test-item-feedback {
        font-size: 0.92rem;
      }

      .hub-course-test-item-feedback.is-correct {
        color: #93e8b7;
      }

      .hub-course-test-item-feedback.is-wrong {
        color: #ffb1b1;
      }

      .hub-course-test-drag-board {
        display: grid;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .hub-course-test-drag-bank,
      .hub-course-test-drag-column {
        border-radius: 16px;
        border: 1px solid rgba(63, 94, 155, 0.4);
        background: rgba(8, 16, 38, 0.5);
        padding: 0.95rem;
      }

      .hub-course-test-drag-bank h3,
      .hub-course-test-drag-column h3 {
        margin: 0 0 0.75rem;
        color: #eef4ff;
        font-size: 1rem;
      }

      .hub-course-test-drag-column-example {
        margin: -0.35rem 0 0.75rem;
        color: #eef4ff;
        font-style: italic;
        font-size: 1.15rem;
      }

      .hub-course-test-drag-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .hub-course-test-dropzone {
        min-height: 88px;
        border-radius: 14px;
        border: 1px dashed rgba(120, 182, 255, 0.28);
        background: rgba(120, 182, 255, 0.06);
        padding: 0.7rem;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        gap: 0.55rem;
        transition: border-color 0.15s ease, background 0.15s ease;
      }

      .hub-course-test-dropzone.is-column {
        display: grid;
        grid-template-columns: 1fr;
        align-content: start;
      }

      .hub-course-test-dropzone.is-active {
        border-color: rgba(120, 182, 255, 0.55);
        background: rgba(120, 182, 255, 0.12);
      }

      .hub-course-test-dropzone.is-empty::after {
        content: "Drop words here";
        color: #7f96bb;
        font-size: 0.9rem;
      }

      .hub-course-test-drag-chip {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0.5rem 0.8rem;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(123, 208, 255, 0.18), rgba(97, 145, 255, 0.12));
        border: 1px solid rgba(123, 208, 255, 0.34);
        color: #eef4ff;
        font-weight: 700;
        cursor: grab;
        user-select: none;
      }

      .hub-course-test-drag-chip-text {
        display: inline;
        white-space: nowrap;
      }

      .hub-course-test-drag-chip:active {
        cursor: grabbing;
      }

      .hub-course-test-drag-help {
        margin: 0;
        color: #9cb2d3;
        line-height: 1.45;
      }

      .hub-course-test-section-nav {
        display: flex;
        justify-content: space-between;
        gap: 0.7rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }

      .hub-course-test-floating-nav {
        position: fixed;
        left: 22px;
        right: 22px;
        bottom: 26px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.8rem;
        z-index: 60;
        pointer-events: none;
      }

      .hub-course-test-fab {
        min-width: 132px;
        height: 56px;
        padding: 0 1rem;
        border-radius: 999px;
        border: 1px solid rgba(120, 182, 255, 0.35);
        background: rgba(12, 23, 54, 0.94);
        color: #eef4ff;
        font-size: 1rem;
        font-weight: 700;
        box-shadow: 0 18px 32px rgba(2, 8, 24, 0.32);
        z-index: 60;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
        pointer-events: auto;
      }

      .hub-course-test-fab.is-secondary {
        min-width: 146px;
        background: rgba(10, 19, 46, 0.92);
      }

      .hub-course-test-fab:disabled {
        opacity: 0.42;
        cursor: not-allowed;
        box-shadow: none;
      }

      .hub-course-test-fab-icon {
        font-size: 1.25rem;
        line-height: 1;
      }

      .hub-course-test-fab-label {
        line-height: 1;
      }

      .hub-course-test-modal {
        position: fixed;
        inset: 0;
        background: rgba(2, 8, 24, 0.64);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 50;
      }

      .hub-course-test-modal-card {
        width: min(720px, 100%);
        max-height: min(82vh, 880px);
        overflow: auto;
        border-radius: 20px;
        border: 1px solid rgba(70, 102, 170, 0.42);
        background: linear-gradient(180deg, rgba(11, 21, 48, 0.98), rgba(14, 28, 63, 0.98));
        box-shadow: 0 24px 60px rgba(2, 8, 24, 0.34);
        padding: 1rem;
        display: grid;
        gap: 1rem;
      }

      .hub-course-test-modal-head {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: flex-start;
      }

      .hub-course-test-modal-head h3,
      .hub-course-test-modal-listening h4 {
        margin: 0 0 0.25rem;
        color: #eef4ff;
      }

      .hub-course-test-modal-head p {
        margin: 0;
        color: #a9b7d1;
      }

      .hub-course-test-modal-list,
      .hub-course-test-modal-listening {
        display: grid;
        gap: 0.85rem;
      }

      .hub-course-test-nav-btn,
      .hub-course-test-listening-card,
      .hub-course-test-summary-card,
      .hub-course-test-detail-card {
        border-radius: 14px;
        border: 1px solid rgba(63, 94, 155, 0.46);
        background: rgba(8, 16, 38, 0.58);
        padding: 0.9rem;
      }

      .hub-course-test-nav-btn {
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
        width: 100%;
        color: #eef4ff;
        text-align: left;
        cursor: pointer;
      }

      .hub-course-test-nav-btn.active {
        border-color: rgba(120, 182, 255, 0.5);
        box-shadow: inset 0 0 0 1px rgba(120, 182, 255, 0.18);
      }

      .hub-course-test-nav-index {
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(120, 182, 255, 0.12);
        border: 1px solid rgba(120, 182, 255, 0.28);
        color: #9fd0ff;
        font-weight: 700;
        flex: 0 0 auto;
      }

      .hub-course-test-nav-copy {
        display: grid;
        gap: 0.18rem;
      }

      .hub-course-test-nav-copy strong,
      .hub-course-test-listening-card strong,
      .hub-course-test-summary-card strong,
      .hub-course-test-detail-card strong {
        color: #eef4ff;
      }

      .hub-course-test-nav-copy small,
      .hub-course-test-summary-card p,
      .hub-course-test-detail-card span {
        color: #9cb2d3;
      }

      .hub-course-test-summary-grid,
      .hub-course-test-detail-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .hub-course-test-summary-card span,
      .hub-course-test-detail-card span,
      .hub-course-test-note-block span,
      .hub-course-test-status-label {
        display: block;
        margin-bottom: 0.3rem;
        color: #8ea5c8;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .hub-course-test-status-row {
        display: grid;
        gap: 0.7rem;
        margin: 1rem 0;
      }

      .hub-course-test-status-actions,
      .hub-course-test-actions {
        display: flex;
        gap: 0.7rem;
        flex-wrap: wrap;
      }

      .hub-course-test-status-actions .ghost-btn.is-selected {
        border-color: rgba(120, 182, 255, 0.45);
        box-shadow: inset 0 0 0 1px rgba(120, 182, 255, 0.18);
        color: #eef4ff;
      }

      .hub-course-test-note-block {
        display: grid;
        gap: 0.45rem;
      }

      .hub-course-test-footnote {
        border-top: 1px solid rgba(63, 94, 155, 0.28);
        padding-top: 0.9rem;
        margin-top: 1rem;
      }

      .hub-course-test-submit-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 1rem;
      }

      .hub-course-test-listening-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.7rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }

      .hub-course-test-hidden-audio {
        display: none;
      }

      .hub-course-test-listening-hero {
        display: grid;
        gap: 0.45rem;
        margin-bottom: 1rem;
      }

      .hub-course-test-listening-kicker {
        color: #8ea5c8;
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .hub-course-test-listening-hero h2 {
        margin: 0;
        color: #eef4ff;
      }

      .hub-course-test-listening-instruction,
      .hub-course-test-listening-status {
        margin: 0;
        line-height: 1.55;
      }

      .hub-course-test-listening-instruction {
        color: #dfeaff;
      }

      .hub-course-test-listening-status {
        color: #9fd0ff;
        font-weight: 700;
      }

      .hub-course-test-confirm-copy {
        color: #dfeaff;
        line-height: 1.6;
      }

      .hub-course-test-confirm-copy p {
        margin: 0;
      }

      .hub-course-test-confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.7rem;
        flex-wrap: wrap;
      }

      @media (max-width: 920px) {
        .hub-course-test-hero,
        .hub-course-test-layout,
        .hub-course-test-summary-grid,
        .hub-course-test-detail-grid {
          grid-template-columns: 1fr;
          display: grid;
        }

        .hub-course-test-hero {
          align-items: stretch;
        }

        .hub-course-test-timer {
          text-align: left;
        }

        .hub-course-test-drag-grid {
          grid-template-columns: 1fr 1fr;
        }

        .hub-course-test-inline-gap {
          width: min(100%, 7.6rem);
          margin: 0.2rem 0.3rem;
        }

        .hub-course-test-inline-gap.is-short {
          width: min(100%, 4.8rem);
        }

        .hub-course-test-inline-gap.is-medium {
          width: min(100%, 6.4rem);
        }

        .hub-course-test-inline-gap.is-xlong {
          width: min(100%, 20rem);
        }

        .hub-course-test-item-card.is-word-formation {
          grid-template-columns: 1fr;
        }

        .hub-course-test-stress-buttons {
          margin-left: 0;
        }

        .hub-course-test-matching-select {
          margin-left: 0;
          width: 100%;
        }

        .hub-course-test-submit-row,
        .hub-course-test-listening-actions,
        .hub-course-test-confirm-actions {
          justify-content: stretch;
        }

        .hub-course-test-submit-row > *,
        .hub-course-test-listening-actions > *,
        .hub-course-test-confirm-actions > * {
          flex: 1 1 0;
        }

        .hub-course-test-floating-nav {
          left: 14px;
          right: 14px;
          bottom: 14px;
          gap: 0.55rem;
        }

        .hub-course-test-fab,
        .hub-course-test-fab.is-secondary {
          min-width: 0;
          flex: 1 1 0;
          height: 52px;
          padding: 0 0.8rem;
        }
      }

      @media (max-width: 640px) {
        .hub-course-test-drag-grid {
          grid-template-columns: 1fr;
        }

        .hub-course-test-floating-nav {
          gap: 0.45rem;
        }

        .hub-course-test-fab-label {
          font-size: 0.92rem;
        }
      }
    `}</style>
  );
}

function PronunciationDragBoard({
  section,
  answers,
  draggedItemId,
  onDragStart,
  onDropItem,
  timeUp,
}) {
  const [activeZone, setActiveZone] = useState("");
  const { unplaced, columns } = useMemo(
    () => buildPronunciationColumns(section, answers),
    [section, answers]
  );
  const columnLabels = Array.isArray(section?.sharedPrompt?.columnLabels)
    ? section.sharedPrompt.columnLabels
    : [];
  const columnLabelMap = new Map(columnLabels.map((entry) => [entry.key, entry]));
  const exampleLines = Array.isArray(section?.sharedPrompt?.exampleLines) ? section.sharedPrompt.exampleLines : [];

  const handleDrop = (value) => {
    if (!draggedItemId || timeUp) return;
    onDropItem(section.id, draggedItemId, value);
    setActiveZone("");
  };

  return (
    <div className="hub-course-test-drag-board">
      {exampleLines.length ? (
        <div className="hub-course-test-example-block">
          {exampleLines.map((line, index) => (
            <p key={`${section.id}:drag-example:${index}`} className="hub-course-test-example-line">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      <p className="hub-course-test-drag-help">
        Drag each word into the correct sound column.
      </p>

      <div className="hub-course-test-drag-bank">
        <h3>Word bank</h3>
        <div
          className={`hub-course-test-dropzone ${activeZone === "__bank__" ? "is-active" : ""} ${unplaced.length ? "" : "is-empty"}`}
          onDragOver={(e) => {
            if (timeUp) return;
            e.preventDefault();
            setActiveZone("__bank__");
          }}
          onDragLeave={() => setActiveZone((prev) => (prev === "__bank__" ? "" : prev))}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop("");
          }}
        >
          {unplaced.map((item) => (
            <button
              key={item.id}
              type="button"
              className="hub-course-test-drag-chip"
              draggable={!timeUp}
              onDragStart={() => onDragStart(item.id)}
              onDragEnd={() => {
                onDragStart("");
                setActiveZone("");
              }}
            >
              <span className="hub-course-test-drag-chip-text">
                {renderHighlightedWord(item.prompt, item.highlight)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hub-course-test-drag-grid">
        {columns.map((column) => (
          <div key={column.key} className="hub-course-test-drag-column">
            <h3>
              {columnLabelMap.has(column.key)
                ? renderHighlightedWord(columnLabelMap.get(column.key).label, columnLabelMap.get(column.key).highlight)
                : column.key}
            </h3>
            {columnLabelMap.get(column.key)?.example ? (
              <p className="hub-course-test-drag-column-example">
                {columnLabelMap.get(column.key).example}
              </p>
            ) : null}
            <div
              className={`hub-course-test-dropzone is-column ${activeZone === column.key ? "is-active" : ""} ${column.items.length ? "" : "is-empty"}`}
              onDragOver={(e) => {
                if (timeUp) return;
                e.preventDefault();
                setActiveZone(column.key);
              }}
              onDragLeave={() => setActiveZone((prev) => (prev === column.key ? "" : prev))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(column.key);
              }}
            >
              {column.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="hub-course-test-drag-chip"
                  draggable={!timeUp}
                  onDragStart={() => onDragStart(item.id)}
                  onDragEnd={() => {
                    onDragStart("");
                    setActiveZone("");
                  }}
                >
                  <span className="hub-course-test-drag-chip-text">
                    {renderHighlightedWord(item.prompt, item.highlight)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
