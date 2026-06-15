import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";
import { getSitePath } from "../../siteConfig.js";
import { PART1_QUESTIONS } from "../speaking/banks/part1";
import { PART2_TASKS } from "../speaking/banks/part2";
import { PART3_TASKS } from "../speaking/banks/part3";
import { PART4_TASKS } from "../speaking/banks/part4";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getTotalVocabSets, TOPIC_DATA } from "../vocabulary/data/vocabTopics";
import { vocabExerciseTasks } from "../vocabulary/data/vocabExerciseBank.js";
import synonymSeedItems from "../vocabulary/data/synonymSeedItems.js";
import collocationPrecisionItems from "../vocabulary/collocations/data/collocationPrecisionItems.js";
import { HUB_GRAMMAR_ACTIVITIES } from "../../data/hubGrammarActivities.js";
import { getOteWritingMock } from "../../products/ote/mockTests/data/oteWritingMockData.js";
import {
  downloadOteWritingSubmissionDocx,
  downloadOteWritingSubmissionText,
} from "../../products/ote/mockTests/utils/oteWritingSubmissionExport.js";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

const HUB_GRAMMAR_LEVELS = ["a2", "b1", "b2", "c1", "c2"];
const EMPTY_VOCAB_PRACTICE_SUMMARY = {
  exercise: { attempted: 0, perfect: 0, attempts: 0, favourites: 0, favouriteItems: 0, mistakeQuestions: 0 },
  synonyms: { attempted: 0, correct: 0, attempts: 0, favourites: 0, mistakes: 0 },
  collocations: { attempted: 0, correct: 0, attempts: 0, favourites: 0, mistakes: 0 },
};
const TOTAL_VOCAB_EXERCISE_TASKS = vocabExerciseTasks.length;
const TOTAL_SYNONYM_ITEMS = synonymSeedItems.length;
const TOTAL_COLLOCATION_ITEMS = collocationPrecisionItems.length;
const HUB_GRAMMAR_LEVEL_COLORS = {
  a2: "#7ef0c2",
  b1: "#8fb6ff",
  b2: "#f6d26b",
  c1: "#f2b0b7",
  c2: "#c7a4ff",
};

function buildHubGrammarDashboard(submissions = []) {
  const byLevel = Object.fromEntries(
    HUB_GRAMMAR_LEVELS.map((level) => [level, { completed: 0, total: 0 }])
  );

  const completedIds = new Set(
    submissions
      .map((submission) => submission?.activityId)
      .filter(Boolean)
  );

  HUB_GRAMMAR_ACTIVITIES.forEach((activity) => {
    const levels = Array.isArray(activity.levels) ? activity.levels : [];
    levels.forEach((level) => {
      if (!byLevel[level]) return;
      byLevel[level].total += 1;
      if (completedIds.has(activity.id)) {
        byLevel[level].completed += 1;
      }
    });
  });

  return {
    completed: completedIds.size,
    total: HUB_GRAMMAR_ACTIVITIES.length,
    byLevel,
  };
}

function renderSavedGrammarSentence(parts, gaps = []) {
  if (!Array.isArray(parts) || !parts.length) return null;

  const gapMap = new Map(gaps.map((gap) => [gap.gapId, gap]));

  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <React.Fragment key={`part-${index}`}>{part}</React.Fragment>;
    }

    const gap = gapMap.get(part.gapId);
    return (
      <span key={`gap-${part.gapId}`} style={{ fontWeight: 700, color: "#eef4ff" }}>
        {gap?.answer || "_____"}
      </span>
    );
  });
}


export default function Profile({
  user,
  onBack,
  onGoMistakes,
  onGoFavourites,
  onGoVocabMistakes,   // 👈 NEW
  // NEW:
  targetUid,              // optional: which user to load data for
  titleOverride,          // optional: override "My Profile"
  viewerLabelOverride,    // optional: override "Signed in as …"
  siteMode = "aptis",
  allowAccountSecurity = true,
}) {
  const navigate = useNavigate();
  const isSeifHubProfile = siteMode === "seifhub";
  const [loading, setLoading] = useState(true);

  const [readingCounts, setReadingCounts] = useState({
    part1: 0,
    part2: 0,
    part3: 0,
    part4: 0,
  });
  
  const [speakingCounts, setSpeakingCounts] = useState({
    part1: 0,
    part2: 0,
    part3: 0,
    part4: 0,
  });
  
  const [listeningCounts, setListeningCounts] = useState({
    part2: 0,
    part3: 0,
    part4: 0,
  });

  // we'll still fetch these behind the scenes (cheap), but we won't render the raw IDs anymore
  const [mistakes, setMistakes] = useState([]);
  const [favourites, setFavourites] = useState([]);

  const [grammarDash, setGrammarDash] = useState({
    answered: 0,
    correct: 0,
    total: 0,
  });

  // Writing data (kept)
  const [writingP1, setWritingP1] = useState([]);
  const [showWritingP1, setShowWritingP1] = useState(false);

  const [guideEdits, setGuideEdits] = useState([]);
  const [showGuideEdits, setShowGuideEdits] = useState(false);

  const [writingP4, setWritingP4] = useState([]);
  const [showWritingP4, setShowWritingP4] = useState(false);

  const [writingP2, setWritingP2] = useState([]);
  const [showWritingP2, setShowWritingP2] = useState(false);

  const [writingP3, setWritingP3] = useState([]);
  const [showWritingP3, setShowWritingP3] = useState(false);

  const [p4Register, setP4Register] = useState([]);
  const [showP4Register, setShowP4Register] = useState(false);
  const [oteWriting, setOteWriting] = useState([]);
  const [showOteWriting, setShowOteWriting] = useState(false);
  const [showWritingAll, setShowWritingAll] = useState(false);

  const [speakingNotes, setSpeakingNotes] = useState([]);
  const [showSpeakingNotes, setShowSpeakingNotes] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState([]);
  const [showSpeakingFeedback, setShowSpeakingFeedback] = useState(false);

  const [vocabTopicCounts, setVocabTopicCounts] = useState(null); // 👈 NEW
  const [vocabMistakes, setVocabMistakes] = useState([]); // 👈 NEW
  const [vocabPracticeSummary, setVocabPracticeSummary] = useState(EMPTY_VOCAB_PRACTICE_SUMMARY);

  // Progress sections at the top
  const [showReadingPanel, setShowReadingPanel] = useState(false);
  const [showVocabPanel, setShowVocabPanel] = useState(false);
  const [showSpeakingPanel, setShowSpeakingPanel] = useState(false);
  const [showGrammarPanel, setShowGrammarPanel] = useState(false);
  const [showListeningPanel, setShowListeningPanel] = useState(false);
  const [showHubGrammarPanel, setShowHubGrammarPanel] = useState(false);
  const [showUseOfEnglishPanel, setShowUseOfEnglishPanel] = useState(false);

  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [hubGrammarSubmissions, setHubGrammarSubmissions] = useState([]);
  const [hubGrammarDash, setHubGrammarDash] = useState(() =>
    buildHubGrammarDashboard([])
  );
  const [hubKeywordDash, setHubKeywordDash] = useState({
    answered: 0,
    correct: 0,
    total: 0,
    byLevel: { b1: { answered: 0, total: 0 }, b2: { answered: 0, total: 0 }, c1: { answered: 0, total: 0 }, c2: { answered: 0, total: 0 } },
  });
  const [hubWordFormationDash, setHubWordFormationDash] = useState({
    answered: 0,
    correct: 0,
    total: 0,
    byLevel: { b1: { answered: 0, total: 0 }, b2: { answered: 0, total: 0 }, c1: { answered: 0, total: 0 }, c2: { answered: 0, total: 0 } },
  });
  const [hubOpenClozeDash, setHubOpenClozeDash] = useState({
    answered: 0,
    correct: 0,
    total: 0,
    byLevel: { b1: { answered: 0, total: 0 }, b2: { answered: 0, total: 0 }, c1: { answered: 0, total: 0 }, c2: { answered: 0, total: 0 } },
  });


  const TOTAL_VOCAB_SETS = getTotalVocabSets();

  // we'll still keep photoURL logic in case you want to bring badges back later,
  // but we just won't render the avatar / studio for now.
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");


const [currentPw, setCurrentPw] = useState("");
const [newPw, setNewPw] = useState("");
const [confirmPw, setConfirmPw] = useState("");
const [pwBusy, setPwBusy] = useState(false);
const [pwError, setPwError] = useState("");

const handleChangePassword = async (e) => {
  e.preventDefault();
  setPwError("");

  const u = auth.currentUser;

  if (!u) {
    setPwError("You need to be signed in.");
    return;
  }

  const hasPasswordProvider = (u.providerData || []).some(
    (p) => p.providerId === "password"
  );

  if (!hasPasswordProvider) {
    setPwError("This account doesn’t use a password sign-in method.");
    return;
  }

  if (!currentPw || !newPw || !confirmPw) {
    setPwError("Please fill in all fields.");
    return;
  }
  if (newPw.length < 6) {
    setPwError("New password must be at least 6 characters.");
    return;
  }
  if (newPw !== confirmPw) {
    setPwError("New passwords don’t match.");
    return;
  }
  if (!u.email) {
    setPwError("No email found for this account.");
    return;
  }

  setPwBusy(true);
  try {
    const cred = EmailAuthProvider.credential(u.email, currentPw);
    await reauthenticateWithCredential(u, cred);
    await updatePassword(u, newPw);

    toast("Password updated ✓");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  } catch (err) {
    const msg =
      err?.code === "auth/wrong-password"
        ? "Current password is incorrect."
        : err?.code === "auth/too-many-requests"
        ? "Too many attempts. Please wait a moment and try again."
        : err?.code === "auth/requires-recent-login"
        ? "For security, please sign out and sign back in, then try again."
        : err?.message || "Couldn’t update password.";

    setPwError(msg);
  } finally {
    setPwBusy(false);
  }
};


  const SPEAKING_TOTALS = {
    part1: PART1_QUESTIONS.length,
    part2: PART2_TASKS.length,
    part3: PART3_TASKS.length,
    part4: PART4_TASKS.length,
  };

  const LISTENING_TOTALS = {
    part1: 15,
    part2: 2,
    part3: 3,
    part4: 2,
  };

  const READING_TOTALS = {
    part1: 6,
    part2: 6, // update if you have more reorder tasks live
    part3: 1, // you said there is currently one example
    part4: 2, // update if you have more live
  };



  // keep photoURL synced if user changes badge in future
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setPhotoURL(u?.photoURL || "");
    });
    return unsub;
  }, []);

  // load all profile data
  useEffect(() => {
    let alive = true;

    setLoading(true);

    const uid = targetUid || user?.uid || auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
  
    (async () => {
      try {
        const [
          rCounts,
          sCounts,
          lCounts,
          m,
          f,
          w,
          gDash,
          gEdits,
          wP2,
          wP3,
          wP4,
          p4Reg,
          oteWritingSubs,
          specNotes,
          speakingFeedbackItems,
          vocabCounts,
          vocabMistakesArr,
          vocabPractice,
          hubGrammarSubs,
          keywordDash,
          wordFormationDash,
          openClozeDash,
        ] = await Promise.all([
          fb.fetchReadingCounts?.(uid) ?? Promise.resolve({ part1: 0, part2: 0, part3: 0, part4: 0 }),
          fb.fetchSpeakingCounts(uid),
          fb.fetchListeningCounts?.(uid) ?? Promise.resolve({ part1: 0, part2: 0, part3: 0, part4: 0 }),
          fb.fetchRecentMistakes(8, uid),
          fb.fetchRecentFavourites(8, uid),
          fb.fetchWritingP1Sessions(10, uid),
          fb.fetchGrammarDashboard(uid),
          fb.fetchWritingP1GuideEdits(100, uid),
          fb.fetchWritingP2Submissions?.(20, uid) ?? Promise.resolve([]),
          fb.fetchWritingP3Submissions?.(20, uid) ?? Promise.resolve([]),
          fb.fetchWritingP4Submissions?.(20, uid) ?? Promise.resolve([]),
          fb.fetchWritingP4RegisterAttempts?.(100, uid) ?? Promise.resolve([]),
          fb.fetchOteWritingSubmissions?.(20, uid) ?? Promise.resolve([]),
          fb.fetchSpeakingSpeculationNotes?.(50, uid) ?? Promise.resolve([]),
          fb.fetchSpeakingAiFeedback?.(20, uid) ?? Promise.resolve([]),
          fb.fetchVocabTopicCounts?.(uid) ?? Promise.resolve({}),
          fb.fetchRecentVocabMistakes?.(8, uid) ?? Promise.resolve([]),
          fb.fetchVocabPracticeSummary?.(uid) ?? Promise.resolve(EMPTY_VOCAB_PRACTICE_SUMMARY),
          fb.fetchHubGrammarSubmissions?.(200, uid) ?? Promise.resolve([]),
          fb.fetchHubKeywordDashboard?.(uid) ?? Promise.resolve({ answered: 0, correct: 0, total: 0, byLevel: {} }),
          fb.fetchHubWordFormationDashboard?.(uid) ?? Promise.resolve({ answered: 0, correct: 0, total: 0, byLevel: {} }),
          fb.fetchHubOpenClozeDashboard?.(uid) ?? Promise.resolve({ answered: 0, correct: 0, total: 0, byLevel: {} }),
        ]);  
  
        if (!alive) return;
        setReadingCounts(rCounts || { part1: 0, part2: 0, part3: 0, part4: 0 });
        setSpeakingCounts(sCounts);
        setListeningCounts(lCounts || { part1: 0, part2: 0, part3: 0, part4: 0 });
        setMistakes(m);
        setFavourites(f);
        setWritingP1(w);
        setGrammarDash(gDash);
        setGuideEdits(gEdits);
        setWritingP2(wP2);
        setWritingP3(wP3);
        setWritingP4(wP4);
        setP4Register(p4Reg);
        setOteWriting(oteWritingSubs || []);
        setSpeakingNotes(specNotes);
        setSpeakingFeedback(speakingFeedbackItems || []);
        setVocabTopicCounts(vocabCounts || {}); // 👈 NEW
        setVocabMistakes(vocabMistakesArr || []); // 👈 NEW
        setVocabPracticeSummary(vocabPractice || EMPTY_VOCAB_PRACTICE_SUMMARY);
        setHubGrammarSubmissions(hubGrammarSubs || []);
        setHubGrammarDash(buildHubGrammarDashboard(hubGrammarSubs || []));
        setHubKeywordDash(keywordDash || { answered: 0, correct: 0, total: 0, byLevel: {} });
        setHubWordFormationDash(wordFormationDash || { answered: 0, correct: 0, total: 0, byLevel: {} });
        setHubOpenClozeDash(openClozeDash || { answered: 0, correct: 0, total: 0, byLevel: {} });
      } catch (e) {
        console.error("[Profile] load failed", e);
        toast("Couldn’t load some profile data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
  
    return () => {
      alive = false;
    };
  }, [targetUid, user?.uid]);  


  const totalWritingItems =
  writingP1.length +
  guideEdits.length +
  writingP2.length +
  writingP3.length +
  writingP4.length +
  p4Register.length +
  oteWriting.length;


  // 👇 Add this derived value for vocab progress
const totalCompletedVocab = vocabTopicCounts
? Object.values(vocabTopicCounts).reduce(
    (sum, stats) => sum + (stats.completed || 0),
    0
  )
: 0;

const vocabExerciseAttempted = vocabPracticeSummary?.exercise?.attempted || 0;
const vocabExercisePerfect = vocabPracticeSummary?.exercise?.perfect || 0;
const vocabExerciseFavourites =
  (vocabPracticeSummary?.exercise?.favourites || 0) +
  (vocabPracticeSummary?.exercise?.favouriteItems || 0);
const vocabExerciseMistakeQuestions = vocabPracticeSummary?.exercise?.mistakeQuestions || 0;
const vocabSynonymAttempted = vocabPracticeSummary?.synonyms?.attempted || 0;
const vocabSynonymCorrect = vocabPracticeSummary?.synonyms?.correct || 0;
const vocabSynonymFavourites = vocabPracticeSummary?.synonyms?.favourites || 0;
const vocabSynonymMistakes = vocabPracticeSummary?.synonyms?.mistakes || 0;
const vocabCollocationAttempted = vocabPracticeSummary?.collocations?.attempted || 0;
const vocabCollocationCorrect = vocabPracticeSummary?.collocations?.correct || 0;
const vocabCollocationFavourites = vocabPracticeSummary?.collocations?.favourites || 0;
const vocabCollocationMistakes = vocabPracticeSummary?.collocations?.mistakes || 0;

const totalReadingCompleted =
  (readingCounts.part1 || 0) +
  (readingCounts.part2 || 0) +
  (readingCounts.part3 || 0) +
  (readingCounts.part4 || 0);

const totalReadingTasks =
  (READING_TOTALS.part1 || 0) +
  (READING_TOTALS.part2 || 0) +
  (READING_TOTALS.part3 || 0) +
  (READING_TOTALS.part4 || 0);

  const totalListeningCompleted =
  (listeningCounts.part1 || 0) +
  (listeningCounts.part2 || 0) +
  (listeningCounts.part3 || 0) +
  (listeningCounts.part4 || 0);

const totalListeningTasks =
  (LISTENING_TOTALS.part1 || 0) +
  (LISTENING_TOTALS.part2 || 0) +
  (LISTENING_TOTALS.part3 || 0) +
  (LISTENING_TOTALS.part4 || 0);

  return (
    <div className="profile-page game-wrapper">
      <StyleScope />
      <header className="header">
  <h2 className="title">{titleOverride || "My Profile"}</h2>
  <p className="intro">
    {viewerLabelOverride ?? (
      <>
        Signed in as <strong>{user?.email || "Guest"}</strong>
      </>
    )}
  </p>
  <div style={{ marginLeft: "auto" }}>
    <button className="topbar-btn" onClick={onBack}>
      ← Back
    </button>
  </div>
</header>

      {/* NOTE: avatar / Create/Change badge UI + ProfileBadgeStudio REMOVED */}

      {loading ? (
  <p className="muted">Loading…</p>
) : (
  <>

      {allowAccountSecurity && (
      <section className="account-strip">
  <div className="account-strip-head">
    <div>
      <div className="account-strip-title">Account &amp; Security</div>
      <div className="account-strip-sub">Change password</div>
    </div>

    <button
      type="button"
      className="account-strip-toggle"
      onClick={() => setShowAccountPanel((s) => !s)}
      aria-expanded={showAccountPanel}
    >
      {showAccountPanel ? "Hide" : "Show"}
    </button>
  </div>

  {showAccountPanel && (
    <form onSubmit={handleChangePassword} className="account-strip-form">
      {pwError && <div className="account-strip-error">{pwError}</div>}

      <input
        className="input"
        type="password"
        placeholder="Current password"
        value={currentPw}
        onChange={(e) => setCurrentPw(e.target.value)}
        autoComplete="current-password"
        required
      />
      <input
        className="input"
        type="password"
        placeholder="New password"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
        autoComplete="new-password"
        required
      />
      <input
        className="input"
        type="password"
        placeholder="Confirm new password"
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
        autoComplete="new-password"
        required
      />

      <div className="account-strip-actions">
        <button className="btn" type="submit" disabled={pwBusy}>
          {pwBusy ? "Updating…" : "Update password"}
        </button>

        <div className="account-strip-hint">
          If you signed in a long time ago, you may need to sign out and sign back in first.
        </div>
      </div>
    </form>
  )}
</section>
      )}

          {!isSeifHubProfile && (
          <>
          {/* --- READING PROGRESS --- */}
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showReadingPanel}
    onClick={() => setShowReadingPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Reading Progress
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {totalReadingCompleted}/{totalReadingTasks} tasks completed
    </span>

    <span className={`chev ${showReadingPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showReadingPanel && (
    <div className="panel-body">
      <div className="pbar-group">
        <ProgressBar
          value={readingCounts.part1 || 0}
          max={READING_TOTALS.part1 || 1}
          label="Part 1"
          right={`${readingCounts.part1 || 0}/${READING_TOTALS.part1 || 0}`}
        />
        <ProgressBar
          value={readingCounts.part2 || 0}
          max={READING_TOTALS.part2 || 1}
          label="Part 2"
          right={`${readingCounts.part2 || 0}/${READING_TOTALS.part2 || 0}`}
        />
        <ProgressBar
          value={readingCounts.part3 || 0}
          max={READING_TOTALS.part3 || 1}
          label="Part 3"
          right={`${readingCounts.part3 || 0}/${READING_TOTALS.part3 || 0}`}
        />
        <ProgressBar
          value={readingCounts.part4 || 0}
          max={READING_TOTALS.part4 || 1}
          label="Part 4"
          right={`${readingCounts.part4 || 0}/${READING_TOTALS.part4 || 0}`}
        />
      </div>
    </div>
  )}
</section>

{/* --- LISTENING PROGRESS --- */}
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showListeningPanel}
    onClick={() => setShowListeningPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Listening Progress
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {totalListeningCompleted}/{totalListeningTasks} tasks completed
    </span>

    <span className={`chev ${showListeningPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showListeningPanel && (
    <div className="panel-body">
      <div className="pbar-group">
      <ProgressBar
  value={listeningCounts.part1 || 0}
  max={LISTENING_TOTALS.part1 || 1}
  label="Part 1"
  right={`${listeningCounts.part1 || 0}/${LISTENING_TOTALS.part1 || 0}`}
/>

<ProgressBar
  value={listeningCounts.part2 || 0}
  max={LISTENING_TOTALS.part2 || 1}
  label="Part 2"
  right={`${listeningCounts.part2 || 0}/${LISTENING_TOTALS.part2 || 0}`}
/>
        <ProgressBar
          value={listeningCounts.part3 || 0}
          max={LISTENING_TOTALS.part3 || 1}
          label="Part 3"
          right={`${listeningCounts.part3 || 0}/${LISTENING_TOTALS.part3 || 0}`}
        />
        <ProgressBar
          value={listeningCounts.part4 || 0}
          max={LISTENING_TOTALS.part4 || 1}
          label="Part 4"
          right={`${listeningCounts.part4 || 0}/${LISTENING_TOTALS.part4 || 0}`}
        />
      </div>
    </div>
  )}
</section>
          </>
          )}

{/* --- VOCABULARY PROGRESS --- */}
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showVocabPanel}
    onClick={() => setShowVocabPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Vocabulary Progress
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {totalCompletedVocab} topic sets · {vocabExerciseAttempted} exercise tasks
    </span>

    <span className={`chev ${showVocabPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showVocabPanel && (
    <div className="panel-body">
      <div className="pbar-group">
        <ProgressBar
          value={totalCompletedVocab}
          max={TOTAL_VOCAB_SETS || 1}
          label="Topic sets"
          right={`${totalCompletedVocab}/${TOTAL_VOCAB_SETS || 0}`}
        />
      </div>

      <div className="vocab-tool-list">
        <details className="vocab-tool-item" open>
          <summary>
            <span className="vocab-tool-summary-title">Topic Practice</span>
            <span className="vocab-tool-summary-meta">{totalCompletedVocab}/{TOTAL_VOCAB_SETS || 0} sets</span>
          </summary>
          <div className="vocab-tool-body">
            <p className="muted small">Completed themed vocabulary review sets.</p>
            <div className="vocab-tool-progress">
              <ProgressBar
                value={totalCompletedVocab}
                max={TOTAL_VOCAB_SETS || 1}
                label="Seen"
                right={`${totalCompletedVocab}/${TOTAL_VOCAB_SETS || 0}`}
              />
              <ProgressBar
                value={totalCompletedVocab}
                max={TOTAL_VOCAB_SETS || 1}
                label="Completed"
                right={`${totalCompletedVocab}/${TOTAL_VOCAB_SETS || 0}`}
              />
            </div>
            {(!vocabMistakes || vocabMistakes.length === 0) ? (
              <p className="vocab-tool-good">No active topic mistakes.</p>
            ) : (
              <p className="vocab-tool-alert">
                {vocabMistakes.length} topic mistake{vocabMistakes.length === 1 ? "" : "s"} to review.
              </p>
            )}
            <div className="vocab-tool-actions">
              <button type="button" className="btn vocab-tool-btn" onClick={() => navigate("/vocabulary/topics")}>
                Open tool
              </button>
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={onGoVocabMistakes}
                disabled={!onGoVocabMistakes || !vocabMistakes?.length}
              >
                Review mistakes
              </button>
              <button type="button" className="btn vocab-tool-btn" disabled>
                Review favourites
              </button>
            </div>
            {!vocabTopicCounts || Object.keys(vocabTopicCounts).length === 0 ? (
              <p className="muted small" style={{ marginTop: ".35rem" }}>
                No topic sets completed yet.
              </p>
            ) : (
              <ul className="vocab-list vocab-topic-breakdown">
                {Object.entries(vocabTopicCounts).map(([topicKey, stats]) => (
                  <li key={topicKey} className="vocab-row">
                    <span className="vocab-topic-label">
                      {TOPIC_DATA?.[topicKey]?.topicTitle || topicKey.charAt(0).toUpperCase() + topicKey.slice(1)}
                    </span>
                    <span className="vocab-topic-count">
                      {stats.completed} set{stats.completed === 1 ? "" : "s"} completed
                      {typeof stats.total === "number" && stats.total > 0 && (
                        <span className="vocab-topic-sub">
                          {" "}
                          (out of {stats.total} total)
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>

        <details className="vocab-tool-item featured" open>
          <summary>
            <span className="vocab-tool-summary-title">Vocabulary Exercise Trainer</span>
            <span className="vocab-tool-summary-meta">{vocabExerciseAttempted} tried</span>
          </summary>
          <div className="vocab-tool-body">
            <p className="muted small">
              Aptis-style synonym, definition, collocation and gap-fill tasks.
            </p>
            <div className="vocab-tool-progress">
              <ProgressBar
                value={vocabExerciseAttempted}
                max={TOTAL_VOCAB_EXERCISE_TASKS || 1}
                label="Seen"
                right={`${vocabExerciseAttempted}/${TOTAL_VOCAB_EXERCISE_TASKS || 0}`}
              />
              <ProgressBar
                value={vocabExercisePerfect}
                max={TOTAL_VOCAB_EXERCISE_TASKS || 1}
                label="Perfect"
                right={`${vocabExercisePerfect}/${TOTAL_VOCAB_EXERCISE_TASKS || 0}`}
              />
            </div>
            <div className="vocab-tool-stats">
              <span>{vocabExercisePerfect} perfect</span>
              <span>{vocabExerciseFavourites} saved</span>
              <span>{vocabExerciseMistakeQuestions} mistakes</span>
            </div>
            <div className="vocab-tool-actions">
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={() => navigate("/vocabulary/exercises")}
              >
                Open tool
              </button>
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={() => navigate("/vocabulary/exercises")}
                disabled={!vocabExerciseMistakeQuestions}
              >
                Review mistakes
              </button>
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={() => navigate("/vocabulary/exercises")}
                disabled={!vocabExerciseFavourites}
              >
                Review favourites
              </button>
            </div>
          </div>
        </details>

        <details className="vocab-tool-item">
          <summary>
            <span className="vocab-tool-summary-title">Synonym Trainer</span>
            <span className="vocab-tool-summary-meta">{vocabSynonymAttempted} tried</span>
          </summary>
          <div className="vocab-tool-body">
            <p className="muted small">Closest-meaning practice and exam-style synonym review.</p>
            <div className="vocab-tool-progress">
              <ProgressBar
                value={vocabSynonymAttempted}
                max={TOTAL_SYNONYM_ITEMS || 1}
                label="Seen"
                right={`${vocabSynonymAttempted}/${TOTAL_SYNONYM_ITEMS || 0}`}
              />
              <ProgressBar
                value={vocabSynonymCorrect}
                max={TOTAL_SYNONYM_ITEMS || 1}
                label="Correct"
                right={`${vocabSynonymCorrect}/${TOTAL_SYNONYM_ITEMS || 0}`}
              />
            </div>
            <div className="vocab-tool-stats">
              <span>{vocabSynonymCorrect} correct</span>
              <span>{vocabSynonymFavourites} saved</span>
              <span>{vocabSynonymMistakes} mistakes</span>
            </div>
            <div className="vocab-tool-actions">
              <button type="button" className="btn vocab-tool-btn" onClick={() => navigate("/vocabulary/synonyms")}>
                Open tool
              </button>
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={() => navigate("/vocabulary/synonyms")}
                disabled={!vocabSynonymMistakes}
              >
                Review mistakes
              </button>
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={() => navigate("/vocabulary/synonyms")}
                disabled={!vocabSynonymFavourites}
              >
                Review favourites
              </button>
            </div>
          </div>
        </details>

        <details className="vocab-tool-item">
          <summary>
            <span className="vocab-tool-summary-title">Collocation Trainer</span>
            <span className="vocab-tool-summary-meta">{vocabCollocationAttempted} tried</span>
          </summary>
          <div className="vocab-tool-body">
            <p className="muted small">Natural word combinations and precision collocation sets.</p>
            <div className="vocab-tool-progress">
              <ProgressBar
                value={vocabCollocationAttempted}
                max={TOTAL_COLLOCATION_ITEMS || 1}
                label="Seen"
                right={`${vocabCollocationAttempted}/${TOTAL_COLLOCATION_ITEMS || 0}`}
              />
              <ProgressBar
                value={vocabCollocationCorrect}
                max={TOTAL_COLLOCATION_ITEMS || 1}
                label="Correct"
                right={`${vocabCollocationCorrect}/${TOTAL_COLLOCATION_ITEMS || 0}`}
              />
            </div>
            <div className="vocab-tool-stats">
              <span>{vocabCollocationCorrect} correct</span>
              <span>{vocabCollocationFavourites} saved</span>
              <span>{vocabCollocationMistakes} mistakes</span>
            </div>
            <div className="vocab-tool-actions">
              <button type="button" className="btn vocab-tool-btn" onClick={() => navigate("/vocabulary/collocations")}>
                Open tool
              </button>
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={() => navigate("/vocabulary/collocations/trainer")}
                disabled={!vocabCollocationMistakes}
              >
                Review mistakes
              </button>
              <button
                type="button"
                className="btn vocab-tool-btn"
                onClick={() => navigate("/vocabulary/collocations/trainer")}
                disabled={!vocabCollocationFavourites}
              >
                Review favourites
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  )}
</section>

{!isSeifHubProfile && (
<>
{/* --- SPEAKING PROGRESS --- */}
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showSpeakingPanel}
    onClick={() => setShowSpeakingPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Speaking Progress
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      Part 1–4 practice overview
    </span>

    <span className={`chev ${showSpeakingPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showSpeakingPanel && (
    <div className="panel-body">
      <div className="pbar-group">
        <ProgressBar
          value={speakingCounts.part1 || 0}
          max={SPEAKING_TOTALS.part1 || 0}
          label="Part 1"
          right={`${speakingCounts.part1 || 0}/${SPEAKING_TOTALS.part1 || 0}`}
        />
        <ProgressBar
          value={speakingCounts.part2 || 0}
          max={SPEAKING_TOTALS.part2 || 0}
          label="Part 2"
          right={`${speakingCounts.part2 || 0}/${SPEAKING_TOTALS.part2 || 0}`}
        />
        <ProgressBar
          value={speakingCounts.part3 || 0}
          max={SPEAKING_TOTALS.part3 || 0}
          label="Part 3"
          right={`${speakingCounts.part3 || 0}/${SPEAKING_TOTALS.part3 || 0}`}
        />
        <ProgressBar
          value={speakingCounts.part4 || 0}
          max={SPEAKING_TOTALS.part4 || 0}
          label="Part 4"
          right={`${speakingCounts.part4 || 0}/${SPEAKING_TOTALS.part4 || 0}`}
        />
      </div>

      <div className="subpanel collapsible-inner" style={{ marginTop: "0.9rem" }}>
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showSpeakingFeedback}
          onClick={() => setShowSpeakingFeedback((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">Speaking Feedback</h4>
            <span className="muted small">
              {speakingFeedback.length} saved item
              {speakingFeedback.length === 1 ? "" : "s"}
            </span>
          </div>
          <span className={`chev ${showSpeakingFeedback ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showSpeakingFeedback && (
          <>
            {!speakingFeedback.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No saved speaking feedback yet.
              </p>
            ) : (
              <ul className="wlist" style={{ marginTop: ".5rem" }}>
                {speakingFeedback.map((item, idx) => {
                  const when = item.createdAt?.toDate?.()
                    ? item.createdAt.toDate().toLocaleString()
                    : item.createdAt || "—";
                  const partLabel =
                    item.part === "part1"
                      ? "Speaking Part 1"
                      : item.part === "part2"
                      ? "Speaking Part 2"
                      : item.part || "Speaking";
                  const title = item.taskTitle || partLabel;
                  const transcripts = item.transcripts || [];

                  return (
                    <li key={item.id || idx} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>{title}</strong>
                          <div className="muted small">{when}</div>
                          <div className="muted small">
                            {partLabel} · transcript-based feedback · audio not stored
                          </div>
                        </div>
                        <div className="actions">
                          <button
                            className="btn"
                            type="button"
                            onClick={() => {
                              const text = [
                                `${title} (${when})`,
                                "",
                                ...(transcripts || []).map((entry, index) =>
                                  [
                                    `Q${index + 1}: ${entry.question || item.questions?.[index]?.question || ""}`,
                                    entry.transcript || "(no clear transcript)",
                                  ].join("\n")
                                ),
                              ].join("\n\n");
                              navigator.clipboard.writeText(text).then(() => toast("Copied speaking feedback ✓"));
                            }}
                          >
                            Copy transcripts
                          </button>
                        </div>
                      </div>

                      {transcripts.length ? (
                        <details className="profile-ai-feedback-full">
                          <summary>View transcripts</summary>
                          <div className="profile-ai-feedback-body">
                            {transcripts.map((entry, index) => (
                              <article className="profile-ai-feedback-card" key={entry.questionId || index}>
                                <strong>Q{index + 1}: {entry.question || item.questions?.[index]?.question || "Question"}</strong>
                                <p>{entry.transcript || "No clear transcript."}</p>
                              </article>
                            ))}
                          </div>
                        </details>
                      ) : null}

                      <ProfileAiFeedback
                        feedback={item.feedback}
                        descriptor="Generated automatically from transcripts. Audio is not stored."
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )}
</section>

{/* --- GRAMMAR PROGRESS --- */}
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showGrammarPanel}
    onClick={() => setShowGrammarPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Grammar Progress
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {grammarDash.answered}/{grammarDash.total || 0} items attempted
    </span>

    <span className={`chev ${showGrammarPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showGrammarPanel && (
    <div className="panel-body">
      <ProgressBar
        label="Answered"
        value={grammarDash.answered}
        max={grammarDash.total || 1}
        right={`${grammarDash.answered}/${grammarDash.total || 0}`}
      />
      <div style={{ height: 8 }} />
      <ProgressBar
        label="Correct"
        value={grammarDash.correct}
        max={grammarDash.total || 1}
        right={`${grammarDash.correct}/${grammarDash.total || 0}`}
      />

      {(onGoMistakes || onGoFavourites) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: ".5rem",
            marginTop: "0.75rem",
          }}
        >
          {onGoMistakes && (
            <button
              className="btn"
              type="button"
              onClick={() => onGoMistakes && onGoMistakes()}
            >
              Review Mistakes
            </button>
          )}

          {onGoFavourites && (
            <button
              className="btn"
              type="button"
              onClick={() => onGoFavourites && onGoFavourites()}
            >
              Review Favourites
            </button>
          )}
        </div>
      )}
    </div>
  )}
</section>
 </>
)}

{isSeifHubProfile && (
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showGrammarPanel}
    onClick={() => setShowGrammarPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Grammar Progress
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {grammarDash.answered}/{grammarDash.total || 0} items attempted
    </span>

    <span className={`chev ${showGrammarPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showGrammarPanel && (
    <div className="panel-body">
      <ProgressBar
        label="Answered"
        value={grammarDash.answered}
        max={grammarDash.total || 1}
        right={`${grammarDash.answered}/${grammarDash.total || 0}`}
      />
      <div style={{ height: 8 }} />
      <ProgressBar
        label="Correct"
        value={grammarDash.correct}
        max={grammarDash.total || 1}
        right={`${grammarDash.correct}/${grammarDash.total || 0}`}
      />

      {(onGoMistakes || onGoFavourites) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: ".5rem",
            marginTop: "0.75rem",
          }}
        >
          {onGoMistakes && (
            <button
              className="btn"
              type="button"
              onClick={() => onGoMistakes && onGoMistakes()}
            >
              Review Mistakes
            </button>
          )}

          {onGoFavourites && (
            <button
              className="btn"
              type="button"
              onClick={() => onGoFavourites && onGoFavourites()}
            >
              Review Favourites
            </button>
          )}
        </div>
      )}
    </div>
  )}
</section>
)}

{isSeifHubProfile && (
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showUseOfEnglishPanel}
    onClick={() => setShowUseOfEnglishPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Use Of English Progress
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {(hubKeywordDash.answered || 0) + (hubOpenClozeDash.answered || 0) + (hubWordFormationDash.answered || 0)} items attempted
    </span>

    <span className={`chev ${showUseOfEnglishPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showUseOfEnglishPanel && (
    <div className="panel-body">
      <HubUseOfEnglishProfileCard
        title="Keyword Transformations"
        dash={hubKeywordDash}
        onReviewMistakes={() => navigate(getSitePath("/use-of-english/keyword?mode=mistakes"))}
        onReviewFavourites={() => navigate(getSitePath("/use-of-english/keyword?mode=favourites"))}
      />

      <div style={{ height: 12 }} />

      <HubUseOfEnglishProfileCard
        title="Open Cloze"
        dash={hubOpenClozeDash}
        onReviewMistakes={() => navigate(getSitePath("/use-of-english/open-cloze?mode=mistakes"))}
        onReviewFavourites={() => navigate(getSitePath("/use-of-english/open-cloze?mode=favourites"))}
      />

      <div style={{ height: 12 }} />

      <HubUseOfEnglishProfileCard
        title="Word Formation"
        dash={hubWordFormationDash}
        onReviewMistakes={() => navigate(getSitePath("/use-of-english/word-formation?mode=mistakes"))}
        onReviewFavourites={() => navigate(getSitePath("/use-of-english/word-formation?mode=favourites"))}
      />
    </div>
  )}
</section>
)}

{isSeifHubProfile && (
<section className="panel collapsible" style={{ marginTop: "0.75rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showHubGrammarPanel}
    onClick={() => setShowHubGrammarPanel((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      Mini Grammar Tests
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {hubGrammarDash.completed || 0}/{hubGrammarDash.total || 0} tests completed
    </span>

    <span className={`chev ${showHubGrammarPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showHubGrammarPanel && (
    <div className="panel-body">
      <div className="hub-grammar-profile-card" style={{ marginBottom: "1rem" }}>
        <div className="hub-grammar-profile-top">
          <div>
            <strong>Mini Grammar Tests Progress</strong>
            <div className="muted small">
              {hubGrammarDash.completed || 0} of {hubGrammarDash.total || 0} tests completed
            </div>
          </div>
        </div>

        <div className="pbar-group" style={{ marginTop: ".8rem" }}>
          <ProgressBar
            label="Overall"
            value={hubGrammarDash.completed || 0}
            max={hubGrammarDash.total || 1}
            right={`${hubGrammarDash.completed || 0}/${hubGrammarDash.total || 0}`}
          />

          {HUB_GRAMMAR_LEVELS
            .filter((level) => (hubGrammarDash.byLevel?.[level]?.total || 0) > 0)
            .map((level) => (
              <ProgressBar
                key={`hub-grammar-${level}`}
                label={
                  <span className="hub-mini-level-label">
                    <span
                      className="hub-mini-level-dot"
                      style={{ background: HUB_GRAMMAR_LEVEL_COLORS[level] || "#8aa0ff" }}
                    />
                    {level.toUpperCase()}
                  </span>
                }
                value={hubGrammarDash.byLevel?.[level]?.completed || 0}
                max={hubGrammarDash.byLevel?.[level]?.total || 1}
                right={`${hubGrammarDash.byLevel?.[level]?.completed || 0}/${hubGrammarDash.byLevel?.[level]?.total || 0}`}
              />
            ))}
        </div>
      </div>

      {!hubGrammarSubmissions.length ? (
        <p className="muted small">No mini grammar test submissions yet.</p>
      ) : (
        <ul className="wlist">
          {hubGrammarSubmissions.map((submission, idx) => {
            const when = submission.createdAt?.toDate?.()
              ? submission.createdAt.toDate().toLocaleString()
              : submission.createdAt || "—";

            return (
              <li key={submission.id || idx} className="wcard">
                <div className="whead">
                  <div>
                    <strong>{submission.activityTitle || "Mini grammar test"}</strong>
                    <div className="muted small">{when}</div>
                    <div className="muted small">
                      Score: {submission.score ?? 0}% ({submission.correct ?? 0}/{submission.total ?? 0})
                    </div>
                  </div>
                </div>

                <div className="qa" style={{ listStyle: "none", paddingLeft: 0 }}>
                  {(submission.items || []).map((item) => (
                    <div key={item.id} style={{ marginBottom: ".85rem" }}>
                      {item.type === "multiple-choice" ? (
                        <>
                          <div className="q">{item.question || item.prompt}</div>
                          <div className="a">
                            <strong>Your answer:</strong> {item.selectedOption || <em>(no answer)</em>}
                            {!item.isCorrect && (
                              <div className="muted small" style={{ marginTop: ".2rem" }}>
                                Correct: {item.correctOption || "—"}
                              </div>
                            )}
                          </div>
                        </>
                      ) : item.type === "error-correction" ? (
                        <>
                          <div className="q">{item.sentence || item.prompt}</div>
                          <div className="a">
                            <strong>Your choice:</strong> {item.selectedLabel || <em>(no answer)</em>}
                            {!item.isCorrect && (
                              <div className="muted small" style={{ marginTop: ".2rem" }}>
                                Correct: {item.expectedLabel || "—"}
                                {item.correction ? ` — ${item.correction}` : ""}
                              </div>
                            )}
                            {item.answer === "wrong" && (
                              <div className="muted small" style={{ marginTop: ".2rem" }}>
                                Your correction: {item.correctionAnswer || <em>(blank)</em>}
                              </div>
                            )}
                          </div>
                        </>
                      ) : item.type === "comma-placement" ? (
                        <>
                          <div className="q">{item.sentence || item.prompt}</div>
                          <div className="a">
                            <strong>Your version:</strong> {item.selectedSentence || item.sentence || <em>(no answer)</em>}
                            {!item.isCorrect && (
                              <div className="muted small" style={{ marginTop: ".2rem" }}>
                                Correct: {item.corrected || "—"}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="q">
                            {item.parts ? renderSavedGrammarSentence(item.parts, item.gaps || []) : item.prompt}
                          </div>
                          {(item.gaps || []).map((gap) => (
                            <div key={`${item.id}:${gap.gapId}`} className="a">
                              <strong>Your answer:</strong> {gap.answer || <em>(no answer)</em>}
                              {!gap.isCorrect && (
                                <div className="muted small" style={{ marginTop: ".2rem" }}>
                                  Accepted: {(gap.acceptedAnswers || []).join(" / ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  )}
</section>
)}

{!isSeifHubProfile && (
<>
{/* --- WRITING HISTORY / GUIDE GROUPED --- */}
<section className="panel collapsible" style={{ marginTop: "1rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showWritingAll}
    onClick={() => setShowWritingAll((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      My Writing
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
  {totalWritingItems} saved item{totalWritingItems === 1 ? "" : "s"}
</span>

    <span className={`chev ${showWritingAll ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showWritingAll && (
    <div className="writing-sections">
      <div className="subpanel collapsible-inner">
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showOteWriting}
          onClick={() => setShowOteWriting((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">OTE Writing</h4>
            <span className="muted small">
              {oteWriting.length} {oteWriting.length === 1 ? "submission" : "submissions"}
            </span>
          </div>
          <span className={`chev ${showOteWriting ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showOteWriting && (
          <>
            {!oteWriting.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No OTE writing submissions yet.
              </p>
            ) : (
              <ul className="wlist" style={{ marginTop: ".5rem" }}>
                {oteWriting.map((s, idx) => {
                  const when = s.createdAt?.toDate?.()
                    ? s.createdAt.toDate().toLocaleString()
                    : s.createdAt || "—";
                  const isPractice = s.type === "ote-writing-practice";
                  const mock = isPractice ? null : getOteWritingMock(s.mockId || "writing-1");
                  const task2 = mock?.task2?.options?.[s.task2Choice || "essay"];
                  const title = s.mockTitle || mock?.title || (isPractice ? "OTE Writing Practice" : "OTE Writing Mock");
                  const practiceTitle = s.tasks?.practice?.title || title;
                  const practiceAnswer = s.answers?.task || "";
                  const practiceWords = s.counts?.task ?? 0;
                  return (
                    <li key={s.id || idx} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>{title}</strong>
                          <div className="muted small">{when}</div>
                          {isPractice ? (
                            <div className="muted small">
                              Timed practice: {s.practiceTaskLabel || s.practiceTaskType || "Writing"} · {practiceWords} words
                            </div>
                          ) : (
                            <div className="muted small">
                              Task 1: {s.counts?.task1 ?? 0} words · Task 2: {task2?.title || "Part 2"}, {s.counts?.[s.task2Choice || "essay"] ?? 0} words
                            </div>
                          )}
                        </div>
                        <div className="actions">
                          <button
                            className="btn"
                            type="button"
                            onClick={() => {
                              const text = isPractice
                                ? [
                                    title,
                                    `${practiceTitle} (${practiceWords} words)`,
                                    practiceAnswer || "(no answer)",
                                  ].join("\n")
                                : [
                                    title,
                                    `Task 1 (${s.counts?.task1 ?? 0} words)`,
                                    s.answers?.task1 || "(no answer)",
                                    "",
                                    `Task 2: ${task2?.title || "Part 2"} (${s.counts?.[s.task2Choice || "essay"] ?? 0} words)`,
                                    s.answers?.[s.task2Choice || "essay"] || "(no answer)",
                                  ].join("\n");
                              navigator.clipboard.writeText(text).then(() => toast("Copied submission ✓"));
                            }}
                          >
                            Copy
                          </button>
                          {!isPractice ? (
                            <>
                              <button
                                className="btn"
                                type="button"
                                onClick={() => downloadOteWritingSubmissionText({ submissionId: s.id, submission: s, mock })}
                              >
                                TXT
                              </button>
                              <button
                                className="btn"
                                type="button"
                                onClick={() => downloadOteWritingSubmissionDocx({ submissionId: s.id, submission: s, mock })}
                              >
                                DOCX
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {isPractice ? (
                        <div className="submitted-p4">
                          <div className="p4-col">
                            <div className="p4-title">{practiceTitle}</div>
                            <div className="submitted-html">{practiceAnswer || "(no answer)"}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="submitted-p4">
                          <div className="p4-col">
                            <div className="p4-title">Task 1 email</div>
                            <div className="submitted-html">{s.answers?.task1 || "(no answer)"}</div>
                          </div>
                          <div className="p4-col">
                            <div className="p4-title">Task 2 {task2?.title || "Part 2"}</div>
                            <div className="submitted-html">{s.answers?.[s.task2Choice || "essay"] || "(no answer)"}</div>
                          </div>
                        </div>
                      )}
                      <ProfileAiFeedback feedback={s.aiFeedback} />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      {/* ---------- Subsection: Part 1 practice sessions ---------- */}
      <div className="subpanel collapsible-inner">
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showWritingP1}
          onClick={() => setShowWritingP1((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">Part 1 – Practice Answers</h4>
            <span className="muted small">
              {writingP1.length}{" "}
              {writingP1.length === 1 ? "session" : "sessions"}
            </span>
          </div>
          <span className={`chev ${showWritingP1 ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showWritingP1 && (
          <>
            {!writingP1.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No saved sessions yet.
              </p>
            ) : (
              <>
                <div className="actions" style={{ marginTop: ".5rem" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const text = writingP1
                        .map((s, idx) => {
                          const when = s.createdAt?.toDate
                            ? s.createdAt.toDate().toLocaleString()
                            : "—";
                          const lines = s.items
                            .map(
                              (it, i) =>
                                `${i + 1}. ${it.question} — ${
                                  it.answer || "(no answer)"
                                }`
                            )
                            .join("\n");
                          return `Session ${idx + 1} (${when})\n${lines}`;
                        })
                        .join("\n\n");
                      navigator.clipboard
                        .writeText(text)
                        .then(() => toast("Copied all sessions ✓"));
                    }}
                  >
                    Copy all
                  </button>
                </div>

                <ul className="wlist" style={{ marginTop: ".5rem" }}>
                  {writingP1.map((s) => (
                    <li key={s.id} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>Session</strong>
                          <div className="muted small">
                            {s.createdAt?.toDate
                              ? s.createdAt.toDate().toLocaleString()
                              : "—"}
                          </div>
                        </div>
                        <div className="actions">
                          <button
                            className="btn"
                            onClick={() => {
                              const text = s.items
                                .map(
                                  (it, i) =>
                                    `${i + 1}. ${it.question} — ${
                                      it.answer || "(no answer)"
                                    }`
                                )
                                .join("\n");
                              navigator.clipboard
                                .writeText(text)
                                .then(() => toast("Copied session ✓"));
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <ol className="qa">
                        {s.items.map((it, i) => (
                          <li key={it.id || i}>
                            <div className="q">
                              {i + 1}. {it.question}
                            </div>
                            <div className="a">
                              {it.answer || <em>(no answer)</em>}
                            </div>
                          </li>
                        ))}
                      </ol>
                      <ProfileAiFeedback feedback={s.aiFeedback} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      {/* ---------- Subsection: Part 1 Guided FixOpen ---------- */}
      <div className="subpanel collapsible-inner">
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showGuideEdits}
          onClick={() => setShowGuideEdits((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">Part 1 – Guide / FixOpen</h4>
            <span className="muted small">
              {guideEdits.length}{" "}
              {guideEdits.length === 1 ? "item" : "items"}
            </span>
          </div>
          <span className={`chev ${showGuideEdits ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showGuideEdits && (
          <>
            {!guideEdits.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No saved guide answers yet.
              </p>
            ) : (
              <>
                <div className="actions" style={{ marginTop: ".5rem" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const text = guideEdits
                        .map((r, i) => {
                          const when = r.createdAt?.toDate?.()
                            ? r.createdAt
                                .toDate()
                                .toLocaleString()
                            : r.updatedAt?.toDate?.()
                            ? r.updatedAt
                                .toDate()
                                .toLocaleString()
                            : "—";

                          return [
                            `Item ${i + 1} (${when})`,
                            `Q: ${r.prompt || "—"}`,
                            `Your answer: ${r.attempt || "(no answer)"}`,
                            r.original ? `Original: ${r.original}` : null,
                          ]
                            .filter(Boolean)
                            .join("\n");
                        })
                        .join("\n\n");

                      navigator.clipboard
                        .writeText(text)
                        .then(() => toast("Copied guide items ✓"));
                    }}
                  >
                    Copy all
                  </button>
                </div>

                <ul className="wlist" style={{ marginTop: ".5rem" }}>
                  {guideEdits.map((r, idx) => (
                    <li key={r.id || idx} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>Item</strong>
                          <div className="muted small">
                            {(r.createdAt?.toDate?.() &&
                              r.createdAt
                                .toDate()
                                .toLocaleString()) ||
                              (r.updatedAt?.toDate?.() &&
                                r.updatedAt
                                  .toDate()
                                  .toLocaleString()) ||
                              "—"}
                          </div>
                        </div>

                        <div className="actions">
                          <button
                            className="btn"
                            onClick={() => {
                              const text = [
                                `Q: ${r.prompt || "—"}`,
                                `Your answer: ${
                                  r.attempt || "(no answer)"
                                }`,
                                r.suggestion
                                  ? `Suggestion: ${r.suggestion}`
                                  : null,
                                r.original
                                  ? `Original: ${r.original}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join("\n");

                              navigator.clipboard
                                .writeText(text)
                                .then(() => toast("Copied item ✓"));
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div
                        className="qa"
                        style={{
                          listStyle: "none",
                          paddingLeft: 0,
                        }}
                      >
                        <div className="q">
                          <strong>Q:</strong> {r.prompt || "—"}
                        </div>
                        <div className="a">
                          <strong>Your answer:</strong>{" "}
                          {r.attempt || <em>(no answer)</em>}
                        </div>
                        {r.original && (
                          <div className="a muted">
                            <strong>Original:</strong> {r.original}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

            {/* ---------- Subsection: Part 2 short forms ---------- */}
            <div className="subpanel collapsible-inner">
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showWritingP2}
          onClick={() => setShowWritingP2((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">Part 2 – Short Forms</h4>
            <span className="muted small">
              {writingP2.length}{" "}
              {writingP2.length === 1 ? "submission" : "submissions"}
            </span>
          </div>
          <span
            className={`chev ${showWritingP2 ? "open" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {showWritingP2 && (
          <>
            {!writingP2.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No saved submissions yet.
              </p>
            ) : (
              <ul className="wlist" style={{ marginTop: ".5rem" }}>
                {writingP2.map((s, idx) => {
                  const when = s.createdAt?.toDate?.()
                    ? s.createdAt.toDate().toLocaleString()
                    : s.createdAt || "—";
                  return (
                    <li key={s.id || idx} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>Submission</strong>
                          <div className="muted small">{when}</div>
                          {s.taskId && (
                            <div className="muted small">
                              Task: {s.taskId}
                            </div>
                          )}
                          <div className="muted small">
                            {s.counts?.answer ?? 0} words
                          </div>
                        </div>
                      </div>

                      <div
                        className="submitted-html"
                        dangerouslySetInnerHTML={{
                          __html: normalizeHtmlForDisplay(
                            s.answerHTML,
                            s.answerText
                          ),
                        }}
                      />
                      <ProfileAiFeedback feedback={s.aiFeedback} />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

            {/* ---------- Subsection: Part 3 chat responses ---------- */}
            <div className="subpanel collapsible-inner">
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showWritingP3}
          onClick={() => setShowWritingP3((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">Part 3 – Chat Responses</h4>
            <span className="muted small">
              {writingP3.length}{" "}
              {writingP3.length === 1 ? "submission" : "submissions"}
            </span>
          </div>
          <span
            className={`chev ${showWritingP3 ? "open" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {showWritingP3 && (
          <>
            {!writingP3.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No saved submissions yet.
              </p>
            ) : (
              <ul className="wlist" style={{ marginTop: ".5rem" }}>
                {writingP3.map((s, idx) => {
                  const when = s.createdAt?.toDate?.()
                    ? s.createdAt.toDate().toLocaleString()
                    : s.createdAt || "—";
                  const counts = s.counts || [];
                  const answersText = s.answersText || [];
                  const answersHTML = s.answersHTML || [];
                  return (
                    <li key={s.id || idx} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>Submission</strong>
                          <div className="muted small">{when}</div>
                          {s.taskId && (
                            <div className="muted small">
                              Task: {s.taskId}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="submitted-p4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="p4-col">
                            <div className="p4-title">
                              Answer {i + 1} —{" "}
                              {counts[i] ?? 0} words
                            </div>
                            <div
                              className="submitted-html"
                              dangerouslySetInnerHTML={{
                                __html: normalizeHtmlForDisplay(
                                  answersHTML[i],
                                  answersText[i]
                                ),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <ProfileAiFeedback feedback={s.aiFeedback} />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>


      {/* ---------- Subsection: Part 4 Register/Tone ---------- */}
      <div className="subpanel collapsible-inner">
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showP4Register}
          onClick={() => setShowP4Register((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">Part 4 – Register &amp; Tone Guide</h4>
            <span className="muted small">
              {p4Register.length}{" "}
              {p4Register.length === 1 ? "item" : "items"}
            </span>
          </div>
          <span
            className={`chev ${showP4Register ? "open" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {showP4Register && (
          <>
            {!p4Register.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No saved attempts yet.
              </p>
            ) : (
              <>
                <div className="actions" style={{ marginTop: ".5rem" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const text = p4Register
                        .map((r, i) => {
                          const when = r.createdAt?.toDate?.()
                            ? r.createdAt
                                .toDate()
                                .toLocaleString()
                            : "—";
                          return [
                            `Item ${i + 1} (${when})`,
                            `Prompt: ${r.prompt || "—"}`,
                            `Original: ${r.original || "—"}`,
                            `Your answer: ${
                              r.attempt || "(no answer)"
                            }`,
                            r.model
                              ? `Suggestion: ${r.model}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join("\n");
                        })
                        .join("\n\n");

                      navigator.clipboard
                        .writeText(text)
                        .then(() =>
                          toast("Copied register items ✓")
                        );
                    }}
                  >
                    Copy all
                  </button>
                </div>

                <ul className="wlist" style={{ marginTop: ".5rem" }}>
                  {p4Register.map((r, idx) => (
                    <li key={r.id || idx} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>Item</strong>
                          <div className="muted small">
                            {(r.createdAt?.toDate?.() &&
                              r.createdAt
                                .toDate()
                                .toLocaleString()) ||
                              "—"}
                          </div>
                        </div>

                        <div className="actions">
                          <button
                            className="btn"
                            onClick={() => {
                              const text = [
                                `Prompt: ${r.prompt || "—"}`,
                                `Original: ${r.original || "—"}`,
                                `Your answer: ${
                                  r.attempt || "(no answer)"
                                }`,
                                r.model
                                  ? `Suggestion: ${r.model}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join("\n");

                              navigator.clipboard
                                .writeText(text)
                                .then(() => toast("Copied item ✓"));
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div
                        className="qa"
                        style={{
                          listStyle: "none",
                          paddingLeft: 0,
                        }}
                      >
                        <div className="q">
                          <strong>Prompt:</strong>{" "}
                          {r.prompt || "—"}
                        </div>
                        <div className="a">
                          <strong>Original:</strong>{" "}
                          {r.original || "—"}
                        </div>
                        <div className="a">
                          <strong>Your answer:</strong>{" "}
                          {r.attempt || <em>(no answer)</em>}
                        </div>
                        {r.model && (
                          <div className="a muted">
                            <strong>Suggestion:</strong>{" "}
                            {r.model}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      {/* ---------- Subsection: Part 4 Emails/Submissions ---------- */}
      <div className="subpanel collapsible-inner">
        <button
          type="button"
          className="collapse-head inner"
          aria-expanded={showWritingP4}
          onClick={() => setShowWritingP4((s) => !s)}
        >
          <div className="inner-head-left">
            <h4 className="inner-title">Part 4 – Email Tasks</h4>
            <span className="muted small">
              {writingP4.length}{" "}
              {writingP4.length === 1
                ? "submission"
                : "submissions"}
            </span>
          </div>
          <span
            className={`chev ${showWritingP4 ? "open" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {showWritingP4 && (
          <>
            {!writingP4.length ? (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                No saved submissions yet.
              </p>
            ) : (
              <ul
                className="wlist"
                style={{
                  marginTop: ".5rem",
                }}
              >
                {writingP4.map((s, idx) => {
                  const when = s.createdAt?.toDate?.()
                    ? s.createdAt.toDate().toLocaleString()
                    : s.createdAt || "—";
                  return (
                    <li key={s.id || idx} className="wcard">
                      <div className="whead">
                        <div>
                          <strong>Submission</strong>
                          <div className="muted small">
                            {when}
                          </div>
                          {s.taskId && (
                            <div className="muted small">
                              Task: {s.taskId}
                            </div>
                          )}
                        </div>
                        <div className="actions">
                          <button
                            className="btn"
                            onClick={() => copySubmission(s)}
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="submitted-p4">
                        <div className="p4-col">
                          <div className="p4-title">
                            Informal (~50 w) —{" "}
                            {s.counts?.friend ?? 0} words
                          </div>
                          <div
                            className="submitted-html"
                            dangerouslySetInnerHTML={{
                              __html: normalizeHtmlForDisplay(
                                s.friendHTML,
                                s.friendText
                              ),
                            }}
                          />
                        </div>

                        <div className="p4-col">
                          <div className="p4-title">
                            Formal (120–150 w) —{" "}
                            {s.counts?.formal ?? 0} words
                          </div>
                          <div
                            className="submitted-html"
                            dangerouslySetInnerHTML={{
                              __html: normalizeHtmlForDisplay(
                                s.formalHTML,
                                s.formalText
                              ),
                            }}
                          />
                        </div>
                      </div>
                      <ProfileAiFeedback feedback={s.aiFeedback} />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )}
</section>
 </>
)}

{!isSeifHubProfile && (
<>
{/* --- SPEAKING NOTES --- */}
      <section className="panel collapsible" style={{ marginTop: "1rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showSpeakingNotes}
    onClick={() => setShowSpeakingNotes((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>
      My Speaking Notes
    </h3>

    <span className="muted small" style={{ flexShrink: 0 }}>
      {speakingNotes.length} saved item
      {speakingNotes.length === 1 ? "" : "s"}
    </span>

    <span
      className={`chev ${showSpeakingNotes ? "open" : ""}`}
      aria-hidden
    >
      ▾
    </span>
  </button>

  {showSpeakingNotes && (
    <>
      {!speakingNotes.length ? (
        <p className="muted" style={{ marginTop: ".5rem" }}>
          No saved speaking notes yet.
        </p>
      ) : (
        <>
          <div className="actions" style={{ marginTop: ".5rem" }}>
            <button
              className="btn"
              onClick={() => {
                const text = speakingNotes
                  .map((n, idx) => {
                    const when = n.createdAt?.toDate?.()
                      ? n.createdAt.toDate().toLocaleString()
                      : "—";

                    // 🔧 NEW: normalise context/pictureId
                    const ctx = n.context || n.pictureId;

                    const label =
                      ctx === "dad"
                        ? "Living-room picture"
                        : ctx === "wedding"
                        ? "Wedding boat picture"
                        : ctx || "Photo note";

                    return [
                      `Note ${idx + 1} (${when}) – ${label}`,
                      "",
                      n.text || "(empty)",
                    ].join("\n");
                  })
                  .join("\n\n");

                navigator.clipboard
                  .writeText(text)
                  .then(() => toast("Copied all speaking notes ✓"));
              }}
            >
              Copy all
            </button>
          </div>

          <ul className="wlist" style={{ marginTop: ".5rem" }}>
            {speakingNotes.map((n, idx) => {
              const when = n.createdAt?.toDate?.()
                ? n.createdAt.toDate().toLocaleString()
                : "—";

              // 🔧 NEW: same normalisation here
              const ctx = n.context || n.pictureId;

              const label =
                ctx === "dad"
                  ? "Living-room picture"
                  : ctx === "wedding"
                  ? "Wedding boat picture"
                  : ctx || "Photo note";

              return (
                <li key={n.id || idx} className="wcard">
                  <div className="whead">
                    <div>
                      <strong>{label}</strong>
                      <div className="muted small">{when}</div>
                    </div>
                    <div className="actions">
                      <button
                        className="btn"
                        onClick={() => {
                          const text = [
                            `${label} (${when})`,
                            "",
                            n.text || "(empty)",
                          ].join("\n");

                          navigator.clipboard
                            .writeText(text)
                            .then(() => toast("Copied note ✓"));
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div
                    className="qa"
                    style={{
                      listStyle: "none",
                      paddingLeft: 0,
                    }}
                  >
                    <div className="a">
                      {n.text || <em>(no content)</em>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  )}
</section>
 </>
)}

      </>
    )}
  </div>
);
}

/* ---------------- styles, helpers, etc. (mostly unchanged) ---------------- */

function StyleScope() {
  return (
    <style>{`
      .profile-page { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .title{margin:0;font-size:1.6rem}
      .intro{color:var(--muted)}
      .muted{color:var(--muted)}
      .small{font-size:.9em}

      .cards{
        display:grid;
        grid-template-columns:1fr;
        gap:1rem;
        margin-bottom:1rem
      }
      @media(min-width:900px){
        .cards{
          grid-template-columns:repeat(3,1fr); /* now 3 cards instead of 4 */
        }
      }

      .card{
        background:#13213b;
        border:1px solid #2c4b83;
        border-radius:12px;
        padding:1rem;
        color:var(--ink)
      }
      .panel{
        background:#13213b;
        border:1px solid #2c4b83;
        border-radius:12px;
        padding:1rem;
        color:var(--ink)
      }

      .wlist{list-style:none;padding:0;margin:0;display:grid;gap:1rem}
      .wcard{
        background:#0f1b31;
        border:1px solid #2c416f;
        border-radius:12px;
        padding:.75rem
      }
      .whead{
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:.5rem
      }
      .qa{
        margin:.25rem 0 0;
        padding-left:1.1rem;
        display:grid;
        gap:.35rem
      }
      .q{color:#cfe1ff}
      .a{color:#e6f0ff}

      .btn{
        background:#24365d;
        border:1px solid #335086;
        color:#e6f0ff;
        padding:.35rem .6rem;
        border-radius:10px;
        cursor:pointer
      }

      .pbar-group{ display:grid; gap:.6rem; }
      .hub-grammar-profile-card{
        background:#0f1b31;
        border:1px solid #2c416f;
        border-radius:12px;
        padding:.85rem;
      }
      .hub-grammar-profile-top{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:.75rem;
      }
      .hub-mini-level-label{
        display:inline-flex;
        align-items:center;
        gap:.45rem;
      }
      .hub-mini-level-dot{
        width:.65rem;
        height:.65rem;
        border-radius:999px;
        box-shadow:0 0 0 2px rgba(255,255,255,.08);
        flex-shrink:0;
      }

      .pb .row{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:.25rem
      }
      .pb .lbl{color:#cfe1ff}
      .pb .val{color:#cfe1ff;opacity:.9}
      .pb .track{
        height:.6rem;
        border-radius:999px;
        background:#0f1b31;
        border:1px solid #2c416f;
        overflow:hidden
      }
      .pb .fill{
        height:100%;
        width:0%;
        background:#4a79d8
      }

      /* Collapsible panel */
      .collapsible .collapse-head{
        display:flex;
        align-items:center;
        gap:.75rem;
        justify-content:space-between;
        width:100%;
        background:transparent;
        border:0;
        color:var(--ink);
        cursor:pointer;
        padding:0;
      }
      .collapsible .chev{
        margin-left:.25rem;
        transition: transform .2s ease;
        font-size:1.1em;
        line-height:1;
      }
      .collapsible .chev.open{
        transform: rotate(180deg);
      }

      /* Part 4 preview layout */
      .submitted-p4{
        display:grid;
        grid-template-columns:1fr;
        gap:.8rem;
        margin-top:.5rem;
      }
      @media(min-width:900px){
        .submitted-p4{
          grid-template-columns: 1fr 1fr;
        }
      }
      .p4-col .p4-title{
        font-weight:700;
        margin-bottom:.35rem;
        color:#cfe1ff;
      }

      /* Keep HTML spacing and LTR rendering */
      .submitted-html{
        white-space:pre-wrap;
        direction:ltr;
        unicode-bidi:plaintext;
        background:#0a1528;
        border:1px solid #223a68;
        border-radius:10px;
        padding:.65rem;
        line-height:1.6;
        color:#e6f0ff;
      }
      .submitted-html p,
      .submitted-html div { margin: 0 0 1rem; }
      .submitted-html p:last-child,
      .submitted-html div:last-child { margin-bottom: 0; }

      .profile-ai-feedback{
        margin-top:.75rem;
        border-left:4px solid #5579ae;
        padding-left:.85rem;
      }
      .profile-ai-feedback-full{
        margin-top:.6rem;
      }
      .profile-ai-feedback-full summary{
        display:inline-flex;
        align-items:center;
        border:1px solid #335086;
        border-radius:10px;
        background:#24365d;
        color:#e6f0ff;
        padding:.35rem .6rem;
        cursor:pointer;
        font-weight:700;
      }
      .profile-ai-feedback-body{
        display:grid;
        gap:.75rem;
        margin-top:.75rem;
      }
      .profile-ai-feedback-card{
        border:1px solid #223a68;
        border-radius:10px;
        background:#081326;
        padding:.7rem;
      }
      .profile-ai-feedback-card p{
        margin:.35rem 0;
      }
      .profile-ai-feedback ul{
        margin:.35rem 0 0;
        padding-left:1.15rem;
      }
      .profile-ai-feedback li{
        margin:.25rem 0;
      }
      .profile-ai-feedback pre,
      .profile-ai-feedback-json{
        overflow:auto;
        white-space:pre-wrap;
        border:1px solid #223a68;
        border-radius:10px;
        background:#061021;
        padding:.65rem;
        color:#e6f0ff;
        font-family:inherit;
        line-height:1.55;
      }

      /* --- Writing dropdown spacing polish --- */
.writing-sections {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.subpanel {
  background: #0f1b31;
  border: 1px solid #2c416f;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.subpanel:hover {
  background: #122344;
  border-color: #3c5a91;
}

/* Inner headings and spacing */
.collapse-head.inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  background: transparent;
  border: 0;
  color: var(--ink);
  cursor: pointer;
  padding: 0;
  text-align: left;
  margin-bottom: 0.2rem;
}
.inner-head-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.inner-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #cfe1ff;
}

/* Subtle spacing between subsections */
.subpanel + .subpanel {
  margin-top: 0.4rem;
  padding-top: 0.8rem;
  border-top: 1px solid #263a5a;
}

/* Slightly smaller muted text for counts */
.muted.small {
  font-size: 0.85em;
  opacity: 0.85;
}

/* Chevron alignment improvement */
.collapse-head.inner .chev {
  font-size: 1.1rem;
  margin-left: 0.5rem;
  opacity: 0.7;
}
.collapse-head.inner .chev.open {
  transform: rotate(180deg);
  opacity: 1;
}
/* Give the back button a little breathing room below */
.header .topbar-btn {
  margin-bottom: 0.75rem; /* adds subtle vertical space */
}
        .vocab-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .vocab-row {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: #cfd9f3;
      }

      .vocab-topic-label {
        font-weight: 600;
      }

      .vocab-topic-count {
        text-align: right;
        white-space: nowrap;
      }

      .vocab-topic-sub {
        font-size: 0.8rem;
        color: #9fb0e0;
      }
      .vocab-tool-list {
        display: grid;
        gap: .75rem;
        margin-top: .85rem;
      }

      .vocab-tool-item {
        border-radius: 12px;
        border: 1px solid var(--color-border);
        background: color-mix(in srgb, var(--color-surface-raised) 78%, transparent);
        overflow: hidden;
      }

      .vocab-tool-item.featured {
        border-color: color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
        background:
          linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 12%, var(--color-surface-raised)), var(--color-surface-raised));
      }

      .vocab-tool-item summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        padding: .78rem .9rem;
        cursor: pointer;
        list-style: none;
      }

      .vocab-tool-item summary::-webkit-details-marker {
        display: none;
      }

      .vocab-tool-item summary::after {
        content: "▾";
        color: var(--color-text-soft);
        font-weight: 900;
        transition: transform .15s ease;
      }

      .vocab-tool-item[open] summary::after {
        transform: rotate(180deg);
      }

      .vocab-tool-summary-title {
        margin: 0;
        color: #cfe1ff;
        font-size: .98rem;
        font-weight: 900;
        line-height: 1.2;
      }

      .vocab-tool-summary-meta {
        flex: 0 0 auto;
        padding: .18rem .48rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--color-accent) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--color-accent) 34%, var(--color-border));
        color: var(--color-accent);
        font-size: .75rem;
        font-weight: 900;
        white-space: nowrap;
      }

      .vocab-tool-body {
        display: grid;
        gap: .65rem;
        padding: 0 .9rem .85rem;
      }

      .vocab-tool-progress {
        display: grid;
        gap: .5rem;
        max-width: 640px;
      }

      .vocab-tool-stats {
        display: flex;
        flex-wrap: wrap;
        gap: .35rem;
      }

      .vocab-tool-stats span,
      .vocab-tool-good,
      .vocab-tool-alert {
        width: fit-content;
        margin: 0;
        padding: .18rem .48rem;
        border-radius: 999px;
        font-size: .76rem;
        font-weight: 800;
      }

      .vocab-tool-stats span {
        background: color-mix(in srgb, var(--color-link) 12%, transparent);
        color: var(--color-text-soft);
        border: 1px solid color-mix(in srgb, var(--color-link) 22%, var(--color-border));
      }

      .vocab-tool-good {
        background: color-mix(in srgb, #22c55e 12%, transparent);
        border: 1px solid color-mix(in srgb, #22c55e 30%, var(--color-border));
        color: #9ef0bb;
      }

      .vocab-tool-alert {
        background: color-mix(in srgb, #ef4444 12%, transparent);
        border: 1px solid color-mix(in srgb, #ef4444 34%, var(--color-border));
        color: #ffb4b4;
      }

      .vocab-tool-actions {
        display: flex;
        flex-wrap: wrap;
        gap: .45rem;
        margin-top: .1rem;
      }

      .vocab-tool-btn {
        min-height: 2.25rem;
        padding: .45rem .78rem;
        font-size: .9rem;
        line-height: 1.1;
      }

      .vocab-tool-btn:disabled {
        cursor: not-allowed;
        opacity: .48;
        filter: grayscale(.25);
      }

      .vocab-topic-breakdown {
        margin-top: .85rem;
      }

      @media (max-width: 540px) {
        .vocab-row {
          align-items: flex-start;
          flex-direction: column;
        }

        .vocab-tool-item summary {
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .vocab-topic-count {
          text-align: left;
          white-space: normal;
        }
      }
      .panel-body {
  margin-top: 0.75rem;
}


/* Inputs (Profile previously had none explicitly) */
.input{
  width:100%;
  background:#0a1528;
  border:1px solid #223a68;
  border-radius:10px;
  padding:.55rem .6rem;
  color:#e6f0ff;
  outline:none;
}
.input:focus{
  border-color:#4a79d8;
}
.account-strip{
  margin: 0 0 14px 0;
  padding: 14px 14px 12px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.03);
  border-radius: 14px;
}

.account-strip-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
}

.account-strip-title{
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: .2px;
  opacity: .95;
}

.account-strip-sub{
  margin-top: 2px;
  font-size: .85rem;
  opacity: .75;
}

.account-strip-toggle{
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.85);
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.account-strip-form{
  margin-top: 12px;
  display:grid;
  gap: 10px;
  max-width: 520px; /* keeps it from feeling huge */
}

.account-strip-actions{
  display:grid;
  gap: 8px;
  margin-top: 2px;
}

.account-strip-hint{
  font-size: .82rem;
  opacity: .70;
  line-height: 1.25;
}

.account-strip-error{
  font-size: .85rem;
  color: #ffb4b4;
}

:root[data-theme="light"] .profile-page {
  --panel: var(--color-surface-2);
  --ink: var(--color-text);
  --muted: var(--color-text-soft);
  color: var(--color-text);
}

:root[data-theme="light"] .profile-page :is(.title, .sec-title, .inner-title, h3, h4, strong) {
  color: var(--color-text) !important;
}

:root[data-theme="light"] .profile-page :is(.intro, .muted, .small, .account-strip-sub, .account-strip-hint, .vocab-topic-sub) {
  color: var(--color-text-soft) !important;
  opacity: 1;
}

:root[data-theme="light"] .profile-page :is(.card, .panel, .account-strip) {
  background: var(--color-surface-2) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
  box-shadow: 0 8px 22px var(--color-shadow-soft);
}

:root[data-theme="light"] .profile-page :is(.wcard, .subpanel, .hub-grammar-profile-card) {
  background: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
  box-shadow: 0 4px 14px var(--color-shadow-soft);
}

:root[data-theme="light"] .profile-page .subpanel:hover {
  background: var(--color-surface-2) !important;
  border-color: var(--color-border-strong) !important;
}

:root[data-theme="light"] .profile-page :is(.collapse-head, .collapse-head.inner) {
  color: var(--color-text) !important;
}

:root[data-theme="light"] .profile-page :is(.q, .a, .pb .lbl, .pb .val, .p4-col .p4-title, .vocab-row, .vocab-topic-label, .vocab-topic-count) {
  color: var(--color-text) !important;
}

:root[data-theme="light"] .profile-page :is(.submitted-html, .input) {
  background: var(--color-surface-3) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
}

:root[data-theme="light"] .profile-page .submitted-html :is(p, div, span, strong, em, li) {
  color: var(--color-text) !important;
}

:root[data-theme="light"] .profile-page .input:focus {
  border-color: var(--color-border-strong) !important;
  box-shadow: 0 0 0 3px var(--focus-ring);
}

:root[data-theme="light"] .profile-page .pb .track {
  background: var(--color-surface-3) !important;
  border-color: var(--color-border) !important;
}

:root[data-theme="light"] .profile-page .pb .fill:not(.is-tinted) {
  background: var(--color-border-strong) !important;
}

:root[data-theme="light"] .profile-page :is(.btn, .account-strip-toggle) {
  background: var(--color-surface-3) !important;
  border-color: var(--color-border) !important;
  color: var(--color-link) !important;
  box-shadow: none;
}

:root[data-theme="light"] .profile-page :is(.btn, .account-strip-toggle):hover:not(:disabled) {
  background: var(--color-surface-2) !important;
  border-color: var(--color-border-strong) !important;
  color: var(--color-text) !important;
}

:root[data-theme="light"] .profile-page .account-strip-error {
  color: var(--color-danger) !important;
}

:root[data-theme="light"] .profile-page .hub-mini-level-dot {
  box-shadow: 0 0 0 2px rgba(30, 41, 59, 0.08);
}

:root[data-theme="light"] .profile-page .subpanel + .subpanel {
  border-top-color: var(--color-border) !important;
}

:root[data-theme="light"] .profile-page .chev {
  color: var(--color-link);
}


    `}</style>
  );
}

function ProgressBar({ label, value, max, right }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div className="pb">
      <div className="row">
        <span className="lbl">{label}</span>
        <span className="val">{right}</span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ProgressBarTinted({ label, value, max, right, color }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div className="pb">
      <div className="row">
        <span className="lbl">{label}</span>
        <span className="val">{right}</span>
      </div>
      <div className="track">
        <div className="fill is-tinted" style={{ width: `${pct}%`, background: color || undefined }} />
      </div>
    </div>
  );
}

function HubUseOfEnglishProfileCard({ title, dash, onReviewMistakes, onReviewFavourites }) {
  const levelColors = {
    b1: "#7fb4ff",
    b2: "#f0c35b",
    c1: "#e69aa0",
    c2: "#c7a6ff",
  };
  const byLevel = dash?.byLevel || {};

  return (
    <div className="subpanel" style={{ padding: "0.9rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
        <strong>{title}</strong>
        <span className="muted small">
          {dash?.answered || 0}/{dash?.total || 0} answered
        </span>
      </div>

      <div style={{ height: 10 }} />

      <ProgressBar
        label="Answered"
        value={dash?.answered || 0}
        max={dash?.total || 1}
        right={`${dash?.answered || 0}/${dash?.total || 0}`}
      />
      <div style={{ height: 8 }} />
      <ProgressBar
        label="Correct"
        value={dash?.correct || 0}
        max={dash?.total || 1}
        right={`${dash?.correct || 0}/${dash?.total || 0}`}
      />

      <div style={{ height: 12 }} />
      <div className="muted small" style={{ marginBottom: ".35rem" }}>By level</div>
      {["b1", "b2", "c1", "c2"]
        .filter((level) => (byLevel[level]?.total || 0) > 0)
        .map((level) => (
          <div key={level} style={{ marginBottom: 8 }}>
            <ProgressBarTinted
              label={level.toUpperCase()}
              value={byLevel[level]?.answered || 0}
              max={byLevel[level]?.total || 1}
              right={`${byLevel[level]?.answered || 0}/${byLevel[level]?.total || 0}`}
              color={levelColors[level]}
            />
          </div>
        ))}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".5rem",
          marginTop: "0.75rem",
        }}
      >
        <button className="btn" type="button" onClick={onReviewMistakes}>
          Review Mistakes
        </button>
        <button className="btn" type="button" onClick={onReviewFavourites}>
          Review Favourites
        </button>
      </div>
    </div>
  );
}

/* ---------- helpers below unchanged ---------- */

function stripHtml(html = "") {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.innerText.replace(/\s+/g, " ").trim();
}

function escHtml(txt = "") {
  const safe = (txt + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return safe.replace(/\n/g, "<br/>");
}

function looksLikeHtml(s = "") {
  return /<([a-z][\w:-]*)\b[^>]*>/i.test(s);
}

function textToHtml(txt = "") {
  const clean = (txt + "").replace(/^\u200E+/, "");
  const safe = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paras = safe.split(/\n{2,}/).map((p) => p.replace(/\n/g, "<br/>"));
  return `<p>${paras.join("</p><p>")}</p>`;
}

function normalizeHtmlForDisplay(html, text) {
  if (html && looksLikeHtml(html)) {
    return html.replace(/^\u200E+/, "");
  }
  return textToHtml(text || "");
}

async function copyHtmlWithFallback({ html = "", text = "" }) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new window.ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    toast("Copied ✓");
  } catch (e) {
    console.warn("[Profile] copy failed", e);
    toast("Copy failed — select and copy manually.");
  }
}

function CopyBtn({ html, text, className = "" }) {
  return (
    <button
      type="button"
      className={`btn ${className}`}
      onClick={() =>
        copyHtmlWithFallback({
          html: html || "",
          text: text || "",
        })
      }
      title="Copy with formatting"
    >
      Copy
    </button>
  );
}

function buildSubmissionText(s) {
  const when = s.createdAt?.toDate?.()
    ? s.createdAt.toDate().toLocaleString()
    : s.createdAt || "—";

  const friendPlain =
    plainFromEmail({
      html: s.friendHTML,
      text: s.friendText,
    }) || "(empty)";
  const formalPlain =
    plainFromEmail({
      html: s.formalHTML,
      text: s.formalText,
    }) || "(empty)";

  return [
    `Aptis Writing – Part 4`,
    `Task: ${s.taskId || "—"}`,
    `${when}`,
    ``,
    `— Informal (~50 words) —`,
    friendPlain,
    ``,
    `— Formal (120–150 words) —`,
    formalPlain,
    ``,
    `Word counts: friend ${s.counts?.friend ?? "—"}, formal ${
      s.counts?.formal ?? "—"
    }`,
  ].join("\n");
}

function buildSubmissionHtml(s) {
  const when = s.createdAt?.toDate?.()
    ? s.createdAt.toDate().toLocaleString()
    : s.createdAt || "—";

  const friend = robustEmailForClipboard({
    html: s.friendHTML,
    text: s.friendText,
  });
  const formal = robustEmailForClipboard({
    html: s.formalHTML,
    text: s.formalText,
  });

  return `
    <div>
      <h3 style="margin:0 0 .4rem 0;">Aptis Writing – Part 4</h3>
      <p style="margin:.25rem 0;"><strong>Task:</strong> ${
        s.taskId || "—"
      }</p>
      <p style="margin:.25rem 0;"><em>${when}</em></p>

      <h4 style="margin:.8rem 0 .35rem 0;">— Informal (~50 words) —</h4>
      ${friend}

      <h4 style="margin:.8rem 0 .35rem 0;">— Formal (120–150 words) —</h4>
      ${formal}

      <p style="margin:.8rem 0 0 0;"><em>Word counts: friend ${
        s.counts?.friend ?? "—"
      }, formal ${s.counts?.formal ?? "—"}</em></p>
    </div>
  `;
}

async function copySubmission(s) {
  try {
    const html = buildSubmissionHtml(s);
    const text = buildSubmissionText(s);

    if (navigator.clipboard && window.ClipboardItem) {
      const item = new window.ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    toast("Copied submission ✓");
  } catch (e) {
    console.warn("[Profile] copy failed", e);
    toast("Copy failed — select and copy manually.");
  }
}

function normalizeEmailHtmlForClipboard(html = "") {
  let s = (html || "").replace(/^\u200E+/, "");

  s = s
    .replace(/<div\b[^>]*>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>");

  s = s
    .replace(/<p>\s*(?:<br\s*\/?>\s*)*<\/p>/gi, "<p>&nbsp;</p>")
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, "</p><p>");

  if (!/<p\b|<ul\b|<ol\b|<table\b/i.test(s)) {
    const lines = s.split(/<br\s*\/?>/i).map((x) => x.trim() || "&nbsp;");
    s = "<p>" + lines.join("</p><p>") + "</p>";
  }

  s = s.replace(/(<br\s*\/?>\s*)+<\/p>$/i, "</p><p>&nbsp;</p>");

  return s;
}

function ProfileAiFeedback({ feedback, descriptor = "Generated automatically to help you improve your writing." }) {
  if (!feedback) return null;

  const level = feedback.estimatedWritingLevel?.label || feedback.estimatedLevel?.label || "";
  const summary = feedback.overall?.summary || "";
  const strengths = feedback.overall?.mainStrengths || [];
  const priorities = feedback.overall?.mainPriorities || feedback.priorityAdvice || [];
  const teacherComment = feedback.teacherComment || feedback.teacherNote || "";

  return (
    <div className="submitted-html profile-ai-feedback">
      <div className="p4-title">Feedback</div>
      <div className="muted small">{descriptor}</div>
      {level ? <div className="muted small">Estimated level: {level}</div> : null}
      {summary ? <p>{summary}</p> : null}
      {strengths.length ? (
        <p>
          <strong>Strengths:</strong> {strengths.slice(0, 2).join(" ")}
        </p>
      ) : null}
      {priorities.length ? (
        <p>
          <strong>Priorities:</strong> {priorities.slice(0, 2).join(" ")}
        </p>
      ) : null}
      {!summary && teacherComment ? <p>{teacherComment}</p> : null}
      <details className="profile-ai-feedback-full">
        <summary>View full feedback</summary>
        <ProfileAiFeedbackFull feedback={feedback} />
      </details>
    </div>
  );
}

function ProfileAiFeedbackFull({ feedback }) {
  if (feedback.taskType === "aptis_writing_part4") {
    return (
      <div className="profile-ai-feedback-body">
        <ProfileAiFeedbackList title="Strengths" items={feedback.overall?.mainStrengths} />
        <ProfileAiFeedbackList title="Priorities" items={feedback.overall?.mainPriorities} />
        <ProfileEmailFeedback title="Informal email" data={feedback.informalEmail} />
        <ProfileEmailFeedback title="Formal email" data={feedback.formalEmail} />
      </div>
    );
  }

  if (feedback.taskType === "ote_writing_feedback") {
    return (
      <div className="profile-ai-feedback-body">
        <ProfileAiFeedbackList title="Strengths" items={feedback.overall?.mainStrengths} />
        <ProfileAiFeedbackList title="Priorities" items={feedback.overall?.mainPriorities} />
        {(feedback.tasks || []).map((task, index) => (
          <ProfileTaskFeedback key={task.taskId || index} title={`Task ${index + 1}`} task={task} />
        ))}
      </div>
    );
  }

  if (Array.isArray(feedback.answers)) {
    return (
      <div className="profile-ai-feedback-body">
        {feedback.overall?.wordCountComment ? (
          <p><strong>Word count:</strong> {feedback.overall.wordCountComment}</p>
        ) : null}
        {(feedback.answers || []).map((answer, index) => (
          <ProfileAnswerFeedback key={answer.id || answer.index || index} answer={answer} index={index} />
        ))}
        <ProfileAiFeedbackList title="Priority advice" items={feedback.priorityAdvice} />
        {feedback.teacherComment ? <p><strong>Teacher comment:</strong> {feedback.teacherComment}</p> : null}
      </div>
    );
  }

  return (
    <pre className="profile-ai-feedback-json">
      {JSON.stringify(feedback, null, 2)}
    </pre>
  );
}

function ProfileAiFeedbackList({ title, items = [] }) {
  if (!items.length) return null;
  return (
    <div>
      <strong>{title}</strong>
      <ul>
        {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </div>
  );
}

function ProfileAnswerFeedback({ answer, index }) {
  const taskFulfilment = getFeedbackCriterionText(answer.taskFulfilment);
  const content = getFeedbackCriterionText(answer.content);
  const grammar = getFeedbackCriterionText(answer.grammar);
  const vocabulary = getFeedbackCriterionText(answer.vocabulary);
  const cohesion = getFeedbackCriterionText(answer.cohesion);
  const fluency = getFeedbackCriterionText(answer.fluency);

  return (
    <article className="profile-ai-feedback-card">
      <strong>{answer.question ? `${index + 1}. ${answer.question}` : `Answer ${answer.index || index + 1}`}</strong>
      {answer.transcript ? <p><em>Transcript:</em> {answer.transcript}</p> : null}
      {answer.answer ? <p><em>Student:</em> {answer.answer}</p> : null}
      {answer.wordCount !== undefined ? <p><em>Words:</em> {answer.wordCount}</p> : null}
      {answer.communication?.comment ? <p><em>Communication:</em> {answer.communication.comment}</p> : null}
      {answer.length?.comment ? <p><em>Length:</em> {answer.length.comment}</p> : null}
      {taskFulfilment ? <p><em>Task:</em> {taskFulfilment}</p> : null}
      {content ? <p><em>Content:</em> {content}</p> : null}
      {grammar ? <p><em>Grammar:</em> {grammar}</p> : null}
      {vocabulary ? <p><em>Vocabulary:</em> {vocabulary}</p> : null}
      {answer.punctuationSpelling ? <p><em>Punctuation/spelling:</em> {answer.punctuationSpelling}</p> : null}
      {cohesion ? <p><em>Cohesion:</em> {cohesion}</p> : null}
      {fluency ? <p><em>Fluency:</em> {fluency}</p> : null}
      {answer.learningFeedback ? <p><em>Learning:</em> {answer.learningFeedback}</p> : null}
      {answer.suggestedAnswer ? <p><em>Try:</em> {answer.suggestedAnswer}</p> : null}
      <ProfileMistakes mistakes={answer.languageErrors} />
      <ProfileExamples title="Grammar examples" examples={answer.grammar?.examples} />
      <ProfileExamples title="Vocabulary examples" examples={answer.vocabulary?.examples} />
      {answer.improvedAnswer ? <p><em>Improved answer:</em> {answer.improvedAnswer}</p> : null}
      {answer.teacherNote ? <p><em>Teacher note:</em> {answer.teacherNote}</p> : null}
      {answer.improvedVersion ? <pre>{answer.improvedVersion}</pre> : null}
    </article>
  );
}

function getFeedbackCriterionText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const status = value.status ? `${String(value.status).replace(/_/g, " ")}: ` : "";
    return `${status}${value.feedback || value.comment || ""}`.trim();
  }
  return String(value);
}

function ProfileEmailFeedback({ title, data }) {
  if (!data) return null;
  return (
    <ProfileTaskFeedback
      title={title}
      task={{
        ...data,
        taskFulfilment: data.taskFulfilment,
        formatAndRegister: data.register,
        organization: data.cohesion,
        lexis: data.vocabulary,
        mistakes: data.languageErrors,
      }}
    />
  );
}

function ProfileTaskFeedback({ title, task }) {
  return (
    <article className="profile-ai-feedback-card">
      <strong>{title}</strong>
      {task.wordCount !== undefined ? <p><em>Words:</em> {task.wordCount}</p> : null}
      {task.wordCountFeedback ? <p><em>Word count:</em> {task.wordCountFeedback}</p> : null}
      {task.taskFulfilment?.feedback ? <p><em>Content:</em> {task.taskFulfilment.feedback}</p> : null}
      <ProfileRequiredPoints points={task.taskFulfilment?.requiredPoints} />
      {task.formatAndRegister?.feedback ? <p><em>Register:</em> {task.formatAndRegister.feedback}</p> : null}
      <ProfileExamples title="Register examples" examples={task.formatAndRegister?.examples} />
      {task.organization?.feedback ? <p><em>Organization:</em> {task.organization.feedback}</p> : null}
      {task.grammar?.feedback ? <p><em>Grammar:</em> {task.grammar.feedback}</p> : null}
      <ProfileExamples title="Grammar examples" examples={task.grammar?.examples} />
      {task.lexis?.feedback ? <p><em>Vocabulary:</em> {task.lexis.feedback}</p> : null}
      <ProfileExamples title="Vocabulary examples" examples={task.lexis?.examples} />
      <ProfileMistakes mistakes={task.mistakes} />
      {task.improvedVersion ? (
        <>
          <p><em>Improved version:</em></p>
          <pre>{task.improvedVersion}</pre>
        </>
      ) : null}
      {task.teacherNote ? <p><em>Teacher note:</em> {task.teacherNote}</p> : null}
    </article>
  );
}

function ProfileExamples({ title, examples = [] }) {
  if (!examples.length) return null;
  return (
    <div>
      <em>{title}:</em>
      <ul>
        {examples.map((example, index) => {
          const replacement = example.correction || example.suggestion || "";
          return (
            <li key={`${example.original}-${replacement}-${index}`}>
              <span>{example.original}</span>
              {replacement ? <> → <strong>{replacement}</strong></> : null}
              {example.explanation ? `: ${example.explanation}` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProfileRequiredPoints({ points = [] }) {
  if (!points.length) return null;
  return (
    <div>
      <em>Required points:</em>
      <ul>
        {points.map((point, index) => (
          <li key={`${point.point}-${index}`}>
            {point.point} ({point.status}): {point.feedback}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileMistakes({ mistakes = [] }) {
  if (!mistakes.length) return null;
  return (
    <div>
      <em>Mistakes to fix:</em>
      <ul>
        {mistakes.map((mistake, index) => (
          <li key={`${mistake.original}-${index}`}>
            <span>{mistake.original}</span> → <strong>{mistake.correction}</strong>
            {mistake.explanation ? `: ${mistake.explanation}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function plainFromEmail({ html = "", text = "" }) {
  if (html && /<([a-z][\w:-]*)\b[^>]*>/i.test(html)) {
    let s = html;
    s = s
      .replace(/<\/p\s*>/gi, "\n\n")
      .replace(/<\/div\s*>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/h[1-6]\s*>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r\n/g, "\n");

    s = s.replace(/\n{3,}/g, "\n\n").trimEnd();
    return s;
  }

  return (text || "").replace(/\r\n/g, "\n");
}

function htmlFromPlainEmail(text = "") {
  const lines = (text || "").replace(/\r\n/g, "\n").split("\n");
  const paras = [];
  let buf = [];

  const flush = () => {
    const joined = buf.join(" ").trim();
    paras.push(joined.length ? escHtml(joined) : "&nbsp;");
    buf = [];
  };

  for (const ln of lines) {
    if (ln.trim() === "") flush();
    else buf.push(ln.trim());
  }
  flush();

  return "<p>" + paras.join("</p><p>") + "</p>";
}

function robustEmailForClipboard({ html = "", text = "" }) {
  const plain = plainFromEmail({ html, text });
  return htmlFromPlainEmail(plain);
}
