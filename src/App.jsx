// src/App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  auth,
  doSignOut,
  fetchSeenGrammarItemIds,
  db,
  ensureUserProfile,
  fetchHubGrammarSubmissions,
  fetchWritingP1Sessions,
  fetchWritingP2Submissions,
  fetchWritingP3Submissions,
  fetchWritingP4Submissions,
  listAssignedActivitiesForStudent,
  listGrammarSetAttemptsForStudent,
} from "./firebase";
import { onAuthStateChanged }      from 'firebase/auth'
import AuthForm                    from './components/AuthForm'
import FilterPanel                 from './components/FilterPanel'
import GapFillList                 from './components/GapFillList'
import ProgressTracker             from './components/ProgressTracker'
import useTags                     from './hooks/useTags'
import { fetchItems }              from './api/grammar'
import ReviewMistakes   from './components/ReviewMistakes'
import ReviewFavourites from './components/ReviewFavourites'
import ReadingGuide from './reading/ReadingGuide';
import MainMenu from './components/MainMenu';
import Profile from "./components/profile/Profile";
import WritingMenu from './components/writing/WritingMenu';
import WritingPart1 from './components/writing/WritingPart1';
import WritingPart1Guide from "./components/writing/WritingPart1Guide.jsx";
import WritingPart2 from "./components/writing/WritingPart2.jsx";
import WritingPart3 from "./components/writing/WritingPart3.jsx";
import WritingPart4Guide from "./components/writing/WritingPart4Guide";
import WritingPart4Emails from "./components/writing/WritingPart4Emails";
import WritingPart4RegisterGuide from "./components/writing/WritingPart4RegisterGuide";
import ReadingMenu from './components/ReadingMenu';
import SpeakingMenu from './components/speaking/SpeakingMenu';
import SpeakingPart1 from "./components/speaking/SpeakingPart1";
import SpeakingPart2 from './components/speaking/SpeakingPart2';
import SpeakingPart3 from './components/speaking/SpeakingPart3';
import SpeakingPart4 from "./components/speaking/SpeakingPart4";
import SpeakingPart2and3_PhotoGuide from "./components/speaking/SpeakingPart2and3_PhotoGuide.jsx";
import AptisPart1 from "./reading/AptisPart1";
import AptisPart2Reorder from './reading/AptisPart2Reorder';
import AptisPart3Matching from './reading/AptisPart3Matching';
import AptisPart4 from "./reading/AptisPart4";
import VocabularyMenu from "./components/vocabulary/VocabularyMenu";
import ToastHost from './components/ToastHost';
import Footer from "./components/common/Footer";
import VocabularyTopics from "./components/vocabulary/VocabularyTopics";
import CollocationMenu from "./components/vocabulary/collocations/CollocationMenu";
import CollocationDash from "./components/vocabulary/collocations/CollocationDash";
import VocabLab from "./components/vocabulary/VocabLab";
import TopicTrainer from "./components/vocabulary/TopicTrainer";
import Seo from "./components/common/Seo.jsx";
import './App.css'
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import GrammarSetRunner from "./components/grammar/GrammarSetRunner";
import UseOfEnglishCustomQuizRunner from "./components/grammar/UseOfEnglishCustomQuizRunner.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AdminActivityLog from "./components/admin/AdminActivityLog.jsx";
import AdminActivityCharts from "./components/admin/AdminActivityCharts";
import TeacherTools from "./components/teacher/TeacherTools"; // ← Add this
import MyStudents from "./components/teacher/MyStudents";
import TeacherStudentProfile from "./components/TeacherStudentProfile";
import CookieBanner from "./components/CookieBanner.jsx";
import PrivacyPolicy from "./components/legal/PrivacyPolicy.jsx";
import LiveGameJoin from "./components/live/LiveGameJoin";
import LiveGameHost from "./components/live/LiveGameHost";
import LiveGamePlayer from "./components/live/LiveGamePlayer";
import SpeakingPart3ComparingMenu from "./components/speaking/SpeakingPart3ComparingMenu.jsx";
import SpeakingPart3ComparingLanguage from "./components/speaking/SpeakingPart3ComparingLanguage.jsx";
import SpeakingPart3Similarities from "./components/speaking/SpeakingPart3Similarities.jsx";
import SpeakingPart3Comparatives from "./components/speaking/SpeakingPart3Comparatives.jsx";
import VocabMistakeReview from "./components/vocabulary/VocabMistakeReview";
import RequireTeacher from "./components/common/RequireTeacher.jsx";
import SpeakingPart3SimilaritiesExtras from "./components/teacher/SpeakingPart3SimilaritiesExtras.jsx";
import CoursePackViewer from "./components/coursepack/CoursePackViewer";
import PackKeyLanding from "./components/coursepack/PackKeyLanding";
import CoreGrammarKey from "./components/coursepack/CoreGrammarKey";

const TEACHER_NOTIFICATION_LIMIT = 100;
import CoreVocabularyKey from "./components/coursepack/CoreVocabularyKey";
import ReadingPart1Key from "./components/coursepack/ReadingPart1Key";
import ReadingPart2Key from "./components/coursepack/ReadingPart2Key";
import ReadingPart3Key from "./components/coursepack/ReadingPart3Key";
import ReadingPart4Key from "./components/coursepack/ReadingPart4Key";
import SpeakingPart1Key from "./components/coursepack/SpeakingPart1Key";
import SpeakingPart2Key from "./components/coursepack/SpeakingPart2Key";
import SpeakingPart3Key from "./components/coursepack/SpeakingPart3Key";
import ListeningMenu from "./components/listening/ListeningMenu.jsx";
import ListeningPart1 from "./components/listening/ListeningPart1.jsx";
import ListeningPart2 from "./components/listening/ListeningPart2.jsx";
import ListeningPart3 from "./components/listening/ListeningPart3.jsx";
import ListeningPart4 from "./components/listening/ListeningPart4.jsx";
import HubLanding from "./components/hub/HubLanding.jsx";
import HubGrammarMenu from "./components/hub/HubGrammarMenu.jsx";
import HubGrammarFlashcardsMenu from "./components/hub/HubGrammarFlashcardsMenu.jsx";
import HubFlashcardsDeckPlayer from "./components/hub/HubFlashcardsDeckPlayer.jsx";
import HubMiniGrammarTests from "./components/hub/HubMiniGrammarTests.jsx";
import HubGrammarActivityRunner from "./components/hub/HubGrammarActivityRunner.jsx";
import HubListeningMenu from "./components/hub/HubListeningMenu.jsx";
import HubDictationTrainer from "./components/hub/HubDictationTrainer.jsx";
import HubUseOfEnglishMenu from "./components/hub/HubUseOfEnglishMenu.jsx";
import HubKeywordTrainer from "./components/hub/HubKeywordTrainer.jsx";
import HubOpenClozeTrainer from "./components/hub/HubOpenClozeTrainer.jsx";
import HubWordFormationTrainer from "./components/hub/HubWordFormationTrainer.jsx";
import HubMeaningfulPrefixesLesson from "./components/hub/HubMeaningfulPrefixesLesson.jsx";
import HubVocabularyMenu from "./components/hub/HubVocabularyMenu.jsx";
import HubGamesMenu from "./components/hub/HubGamesMenu.jsx";
import HubGameLeaderboards from "./components/hub/HubGameLeaderboards.jsx";
import HubDependentPrepositionGame from "./components/hub/HubDependentPrepositionGame.jsx";
import HubSpanglishFixIt from "./components/hub/HubSpanglishFixIt.jsx";
import HubSpanglishLiveHost from "./components/hub/HubSpanglishLiveHost.jsx";
import HubSpanglishLiveJoin from "./components/hub/HubSpanglishLiveJoin.jsx";
import HubSpanglishLivePlayer from "./components/hub/HubSpanglishLivePlayer.jsx";
import HubNegatrisGame from "./components/hub/HubNegatrisGame.jsx";
import HubYourClass from "./components/hub/HubYourClass.jsx";
import HubCourseTestRunner from "./components/hub/HubCourseTestRunner.jsx";
import { canAccessSeifHub, getSiteHomePath, getSitePath, getSiteVariant } from "./siteConfig.js";

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18H5.8c-.9 0-1.3-1.1-.6-1.7l.8-.7c.7-.6 1.1-1.5 1.1-2.4v-2.1a4.9 4.9 0 1 1 9.8 0v2.1c0 .9.4 1.8 1.1 2.4l.8.7c.7.6.3 1.7-.6 1.7H15" />
      <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

function timestampToMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildLatestMap(items, keyName) {
  return (items || []).reduce((acc, item) => {
    const key = item?.[keyName];
    if (!key) return acc;
    const nextTime = timestampToMs(item.createdAt || item.updatedAt || item.submittedAt || item.startedAt);
    if (!acc[key] || nextTime > acc[key]) acc[key] = nextTime;
    return acc;
  }, {});
}

function getWritingBucket(type) {
  if (type === "writing-part-1") return "p1";
  if (type === "writing-part-2") return "p2";
  if (type === "writing-part-3") return "p3";
  if (type === "writing-part-4") return "p4";
  return "";
}








export default function App() {
  // — AUTH STATE —
const [user,     setUser]     = useState(null)
const [showAuth, setShowAuth] = useState(false)
const [view, setView] = useState('menu'); // 'menu' | 'grammar' | 'readingMenu' | 'reading' | 'readingGuide' | 'mistakes' | 'favourites' | 'speakingMenu' | 'speakingPart2' |
const navigate = useNavigate();  // 👈 add this
const location = useLocation();
const isCoursePack = location.pathname.startsWith("/course-pack");
const isAdminRoute = location.pathname.startsWith("/admin");
const isFlashcardsPlayerRoute = /^\/grammar\/flashcards\/[^/]+$/.test(location.pathname);
const currentSite = getSiteVariant();
const isSeifHubSite = currentSite.id === "seifhub";
const siteHomePath = getSiteHomePath();
const siteProfilePath = getSitePath("/profile");
const isWideLayout = isCoursePack || isAdminRoute || isFlashcardsPlayerRoute;
const [teacherUnreadCount, setTeacherUnreadCount] = useState(0);
const [teacherReadSubmissionKeys, setTeacherReadSubmissionKeys] = useState({});
const [studentAssignmentCount, setStudentAssignmentCount] = useState(0);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (u) => {
    if (!u) {
      setUser(null);
      setShowAuth(false);
      setView("menu");
      return;
    }

    // ✅ make sure /users/{uid} exists and has email/role
    await ensureUserProfile(u);

    try {
      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.exists() ? snap.data() : {};
      setUser({
        ...u,
        role: data.role || "student",
        courseAccess: data.courseAccess || {},
        siteAccess: data.siteAccess || {},
      });
    } catch (err) {
      console.error("Failed to read user role:", err);
      setUser({ ...u, role: "student", courseAccess: {}, siteAccess: {} });
    }
  });

  return unsub;
}, []);

useEffect(() => {
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    setTeacherReadSubmissionKeys({});
    return undefined;
  }

  return onSnapshot(
    doc(db, "users", user.uid, "teacherDashboards", "myStudents"),
    (snap) => {
      setTeacherReadSubmissionKeys(snap.exists() ? snap.data()?.readSubmissionKeys || {} : {});
    },
    (error) => {
      console.error("[App] Could not watch teacher dashboard", error);
    }
  );
}, [user]);

useEffect(() => {
  let alive = true;

  async function loadTeacherUnreadCount() {
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      if (alive) setTeacherUnreadCount(0);
      return;
    }

    try {
      const studentSnap = await getDocs(query(collection(db, "users"), where("teacherId", "==", user.uid)));

      if (!alive) return;

      const readSubmissionKeys = teacherReadSubmissionKeys || {};
      const studentIds = studentSnap.docs.map((entry) => entry.id);

      const [grammarSnap, courseAttemptSnap] = await Promise.all([
        getDocs(query(collection(db, "grammarSetAttempts"), where("ownerUid", "==", user.uid))),
        getDocs(query(collection(db, "courseTestAttempts"), where("teacherUid", "==", user.uid))),
      ]);

      const notificationIds = (
        await Promise.all(
          studentIds.map(async (studentId) => {
            const [part1, part2, part3, part4, miniTests] = await Promise.all([
              fetchWritingP1Sessions(3, studentId),
              fetchWritingP2Submissions(3, studentId),
              fetchWritingP3Submissions(3, studentId),
              fetchWritingP4Submissions(3, studentId),
              fetchHubGrammarSubmissions(3, studentId),
            ]);

            return [
              ...part1.map((entry) => ({ id: `${studentId}:P1:${entry.id}`, createdAt: entry.createdAt })),
              ...part2.map((entry) => ({ id: `${studentId}:P2:${entry.id}`, createdAt: entry.createdAt })),
              ...part3.map((entry) => ({ id: `${studentId}:P3:${entry.id}`, createdAt: entry.createdAt })),
              ...part4.map((entry) => ({ id: `${studentId}:P4:${entry.id}`, createdAt: entry.createdAt })),
              ...miniTests.map((entry) => ({ id: `mini-test:${studentId}:${entry.id}`, createdAt: entry.createdAt })),
            ];
          })
        )
      )
        .flat();

      const grammarNotifications = grammarSnap.docs
        .map((entry) => {
          const data = entry.data() || {};
          if (!data.studentUid) return null;
          return {
            id: `grammar-set:${entry.id}`,
            createdAt: data.updatedAt || data.submittedAt || null,
          };
        })
        .filter(Boolean);

      const courseTestNotifications = courseAttemptSnap.docs
        .map((entry) => {
          const data = entry.data() || {};
          if (!data.studentUid) return null;
          if (!data.completed && !data.submittedAt) return null;
          return {
            id: `course-test:${entry.id}`,
            createdAt: data.submittedAt || data.updatedAt || data.startedAt || null,
          };
        })
        .filter(Boolean);

      const latestNotifications = [...notificationIds, ...grammarNotifications, ...courseTestNotifications]
        .sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt))
        .slice(0, TEACHER_NOTIFICATION_LIMIT);

      if (!alive) return;
      setTeacherUnreadCount(latestNotifications.filter((entry) => !readSubmissionKeys[entry.id]).length);
    } catch (error) {
      console.error("[App] Could not load teacher unread count", error);
      if (alive) setTeacherUnreadCount(0);
    }
  }

  loadTeacherUnreadCount();

  const handleFocus = () => {
    loadTeacherUnreadCount();
  };

  window.addEventListener("focus", handleFocus);
  const intervalId = window.setInterval(() => {
    loadTeacherUnreadCount();
  }, 20000);

  return () => {
    alive = false;
    window.removeEventListener("focus", handleFocus);
    window.clearInterval(intervalId);
  };
}, [location.pathname, teacherReadSubmissionKeys, user]);

useEffect(() => {
  let alive = true;

  async function loadStudentAssignmentCount() {
    if (!user || user.role === "teacher" || user.role === "admin") {
      if (alive) setStudentAssignmentCount(0);
      return;
    }

    try {
      const [assignments, miniTests, grammarAttempts, p1, p2, p3, p4] = await Promise.all([
        listAssignedActivitiesForStudent(user.uid),
        fetchHubGrammarSubmissions(200, user.uid),
        listGrammarSetAttemptsForStudent(user.uid),
        fetchWritingP1Sessions(100, user.uid),
        fetchWritingP2Submissions(100, user.uid),
        fetchWritingP3Submissions(100, user.uid),
        fetchWritingP4Submissions(100, user.uid),
      ]);

      if (!alive) return;

      const completionSources = {
        miniTests: buildLatestMap(miniTests || [], "activityId"),
        grammarSets: (grammarAttempts || []).reduce((acc, attempt) => {
          if (!attempt?.setId) return acc;
          if (!attempt.completed && !attempt.submittedAt) return acc;
          const nextTime = timestampToMs(attempt.submittedAt || attempt.updatedAt || attempt.startedAt);
          if (!acc[attempt.setId] || nextTime > acc[attempt.setId]) acc[attempt.setId] = nextTime;
          return acc;
        }, {}),
        writing: {
          p1: Math.max(0, ...(p1 || []).map((entry) => timestampToMs(entry.createdAt))),
          p2: Math.max(0, ...(p2 || []).map((entry) => timestampToMs(entry.createdAt))),
          p3: Math.max(0, ...(p3 || []).map((entry) => timestampToMs(entry.createdAt))),
          p4: Math.max(0, ...(p4 || []).map((entry) => timestampToMs(entry.createdAt))),
        },
      };

      const pendingCount = (assignments || []).filter((assignment) => {
        const assignedAt = timestampToMs(assignment.createdAt);
        if (assignment.activityType === "mini-test") {
          return (completionSources.miniTests?.[assignment.activityId] || 0) < assignedAt;
        }
        if (assignment.activityType === "grammar-set" || assignment.activityType === "use-of-english") {
          return (completionSources.grammarSets?.[assignment.activityId] || 0) < assignedAt;
        }
        if (assignment.activityType === "writing") {
          const bucket = getWritingBucket(assignment.activityId);
          return (completionSources.writing?.[bucket] || 0) < assignedAt;
        }
        return true;
      }).length;

      if (!alive) return;
      setStudentAssignmentCount(pendingCount);
    } catch (error) {
      console.error("[App] Could not load student assignment count", error);
      if (alive) setStudentAssignmentCount(0);
    }
  }

  loadStudentAssignmentCount();

  const handleFocus = () => {
    loadStudentAssignmentCount();
  };

  window.addEventListener("focus", handleFocus);
  const intervalId = window.setInterval(() => {
    loadStudentAssignmentCount();
  }, 20000);

  return () => {
    alive = false;
    window.removeEventListener("focus", handleFocus);
    window.clearInterval(intervalId);
  };
}, [location.pathname, user]);

const hasSeifHubAccess = canAccessSeifHub(user);
const isTeacherToolsRoute = location.pathname === "/teacher-tools";
const isPublicSpanglishJoinRoute = location.pathname === "/games/spanglish-fix-it/join";
const isPublicSpanglishPlayRoute = /^\/games\/spanglish-fix-it\/play\/[^/]+$/.test(location.pathname);
const showSeifHubGate =
  isSeifHubSite &&
  !hasSeifHubAccess &&
  !(isTeacherToolsRoute && (user?.role === "teacher" || user?.role === "admin")) &&
  !isPublicSpanglishJoinRoute &&
  !isPublicSpanglishPlayRoute &&
  location.pathname !== "/privacy" &&
  !location.pathname.startsWith("/admin");


  // — EXERCISE STATE — 
  // **Moved above any return** so hooks are always called
  const [levels,  setLevels]  = useState([])
const [tag,     setTag]     = useState('')
const [items,   setItems]   = useState([])
const [loading, setLoading] = useState(false)
const [error,   setError]   = useState(null)
const [count,   setCount]   = useState(10); // how many questions to generate
const [runKey,  setRunKey]  = useState(0);

  const [readingMode, setReadingMode] = useState('menu'); // 'menu' | 'guide' | 'practice'

  const {
    tags: allTags,
    loading: tagsLoading,
    error: tagsError
  } = useTags()

  const generate = async () => {
    setLoading(true);
    setError(null);
  
    try {
      let seenIds = [];
  
      // Only try to prefer "new" questions if signed in
      if (user) {
        try {
          seenIds = await fetchSeenGrammarItemIds();
        } catch (err) {
          console.error("fetchSeenGrammarItemIds failed; falling back to random", err);
          seenIds = [];
        }
      }
  
      const batch = await fetchItems({
        levels,
        tags: tag ? [tag] : [],
        count,
        // Prefer new items for signed-in users
        preferNew: !!user,
        seenIds,
      });
  
      setItems(batch);
      setRunKey(k => k + 1); // force fresh run for child components
    } catch (err) {
      console.error("generate() failed", err);
      setError('Failed to load items.');
    } finally {
      setLoading(false);
    }
  };  
  

  const newSetSameSettings = () => {
    if (loading || tagsLoading) return;
    generate();                              // re-runs with current levels/tag/count
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const clearExercises = () => {
    setItems([]);
    setError(null);
    setRunKey(k => k + 1); // ensures any child state is reset
  };
  
  // — EARLY RETURN FOR AUTH FORM —  
  // Now we’ve already registered *all* hooks, so it’s safe:
  if (showAuth && !user) {
    return <AuthForm onSuccess={() => setShowAuth(false)} />
  }

  // 👇 Add this INSIDE App, before the `return`
  function GrammarPage() {
    const [answeredCount, setAnsweredCount] = useState(0);

    const handleGenerate = () => {
      setAnsweredCount(0);
      generate();
    };
  
    const handleReplay = () => {
      setAnsweredCount(0);
      newSetSameSettings();
    };
  
    const handleClear = () => {
      setAnsweredCount(0);
      clearExercises();
    };

    return (
      <>
        <Seo
        title="Aptis Grammar Practice | Seif Aptis Trainer"
        description="Generate Aptis-style grammar gap-fill exercises by level and topic. Practise A2–C1 grammar and review your mistakes and favourites."
      />
        <h1>Aptis Grammar Practice</h1>

        {tagsLoading && <p>Loading tags…</p>}
        {tagsError && <p className="error-text">Error loading tags.</p>}

        {!tagsLoading && !tagsError && (
          <FilterPanel
            levels={levels}
            onLevelsChange={setLevels}
            tag={tag}
            onTagChange={setTag}
            allTags={allTags}
          />
        )}

        <div
          className="count-row"
          role="group"
          aria-label="Number of questions"
        >
          {[5, 10, 15].map((n) => (
            <button
              key={n}
              type="button"
              className={`count-chip ${count === n ? "selected" : ""}`}
              onClick={() => setCount(n)}
              aria-pressed={count === n}
            >
              {n}
            </button>
          ))}
          <span className="count-label">questions</span>
        </div>

        <div className="btn-row">
          <button
  className="generate-btn"
  onClick={handleGenerate}
  disabled={loading || tagsLoading}
>
  {loading ? "Loading…" : "Generate Exercises"}
</button>

          {user && (
            <>
              <button
                className="review-btn mistakes"
                onClick={() => navigate("/profile/mistakes")}
              >
                Review Mistakes
              </button>
              <button
                className="review-btn favourites"
                onClick={() => navigate("/profile/favourites")}
              >
                Review Favourites
              </button>
            </>
          )}
        </div>

        {!user && (
  <div className="auth-nudge">
    <p className="auth-nudge-text">
      Want to track your progress and review your mistakes later?
      <br />
      <strong>Sign in or create a free account.</strong>
    </p>
    <button
  type="button"
  className="topbar-btn"
  onClick={() => setShowAuth(true)}
>
  Sign in / Sign up
</button>
  </div>
)}


        {error && <p className="error-text">{error}</p>}

        {!error && (
          <>
            <GapFillList
  key={runKey}
  runKey={runKey}                           // optional but recommended
  items={items}
  onAnswer={() => setAnsweredCount(c => c + 1)}
/>
            <ProgressTracker
              answered={answeredCount}
              total={items.length}
            />

            {items.length > 0 && (
              <div className="exercise-footer">
                <button
  type="button"
  className="review-btn"
  onClick={handleReplay}
  disabled={loading || tagsLoading}
>
  Replay
</button>
<button
  type="button"
  className="ghost-btn"
  onClick={handleClear}
  disabled={loading}
>
  Clear page
</button>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  // — RENDER MAIN APP —
return (
  // in src/App.jsx (inside your App component’s return)
  <div className={`App ${isWideLayout ? "App--full" : ""}`}>
    <ToastHost />
    <CookieBanner />
    <div className={`content-container ${isWideLayout ? "content-container--full" : ""}`}>
      {/* Auth bar */}
    <div
  style={{
    textAlign: "right",
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  }}
>
  <button
    className="topbar-btn"
    onClick={() => {
      // keep old behaviour…
      setView("menu");
      // …but also tell the router to go "home"
      navigate(siteHomePath);
    }}
  >
    Home
  </button>

  {user ? (
    <>
      {(user.role === "teacher" || user.role === "admin") && (
        <button
          onClick={() => navigate("/my-students")}
          className="topbar-btn topbar-notify-btn"
          aria-label="Open student notifications"
          title={
            teacherUnreadCount > 0
              ? `${teacherUnreadCount} unread writing notifications`
              : "Student notifications"
          }
        >
          <BellIcon />
          {teacherUnreadCount > 0 ? <span className="topbar-notify-count">{teacherUnreadCount}</span> : null}
        </button>
      )}

      {user.role !== "teacher" && user.role !== "admin" && (
        <button
          onClick={() => navigate(getSitePath("/your-class"))}
          className="topbar-btn topbar-notify-btn"
          aria-label="Open student notifications"
          title={
            studentAssignmentCount > 0
              ? `${studentAssignmentCount} assigned activities to do`
              : "Your class"
          }
        >
          <BellIcon />
          {studentAssignmentCount > 0 ? (
            <span className="topbar-notify-count">{studentAssignmentCount}</span>
          ) : null}
        </button>
      )}

      <button onClick={doSignOut} className="topbar-btn">
        Sign Out
      </button>

      {(!isSeifHubSite || hasSeifHubAccess) && (
        <button
          onClick={() => navigate(siteProfilePath)}
          className="profile-badge-btn"
          aria-label="Open profile"
          title={user.email || "My Profile"}
        >
          <span className="avatar">
            {((user.displayName || user.email || "U")[0] || "U").toUpperCase()}
          </span>
        </button>
      )}
    </>
  ) : (
    <button onClick={() => setShowAuth(true)} className="topbar-btn">
      Sign In / Sign Up
    </button>
  )}
</div>

   {/* ————— Show the right “page” ————— */}
<Routes>
  {showSeifHubGate ? (
    <>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/admin" element={<AdminDashboard user={user} />} />
      <Route path="/admin/activity" element={<AdminActivityLog user={user} />} />
      <Route path="/admin/activity-charts" element={<AdminActivityCharts user={user} />} />
      <Route
        path="/teacher-tools"
        element={
          user ? <TeacherTools user={user} /> : <p className="muted">Please log in.</p>
        }
      />
      <Route
        path="*"
        element={
          <HubLanding
            user={user}
            hasAccess={hasSeifHubAccess}
            onSignIn={() => setShowAuth(true)}
          />
        }
      />
    </>
  ) : (
    <>

  {/* ——— Grammar route ——— */}
  <Route
    path="/grammar"
    element={isSeifHubSite ? <HubGrammarMenu /> : <GrammarPage />}
  />
  <Route path="/grammar/aptis" element={<GrammarPage />} />
  <Route path="/grammar/flashcards" element={<HubGrammarFlashcardsMenu />} />
  <Route path="/grammar/flashcards/:deckId" element={<HubFlashcardsDeckPlayer />} />
  <Route path="/grammar/mini-tests" element={<HubMiniGrammarTests user={user} />} />
  <Route path="/grammar/activity/:activityId" element={<HubGrammarActivityRunner />} />

  <Route path="/use-of-english" element={<HubUseOfEnglishMenu />} />
  <Route path="/use-of-english/keyword" element={<HubKeywordTrainer />} />
  <Route path="/use-of-english/open-cloze" element={<HubOpenClozeTrainer />} />
  <Route path="/use-of-english/word-formation" element={<HubWordFormationTrainer />} />
  <Route path="/use-of-english/meaningful-prefixes" element={<HubMeaningfulPrefixesLesson />} />
  <Route path="/your-class" element={<HubYourClass user={user} />} />
  <Route path="/your-class/tests/:sessionId" element={<HubCourseTestRunner user={user} />} />
  <Route path="/games" element={<HubGamesMenu />} />
  <Route path="/games/leaderboards" element={<HubGameLeaderboards user={user} />} />
  <Route path="/games/dependent-prepositions" element={<HubDependentPrepositionGame user={user} />} />
  <Route path="/games/negatris" element={<HubNegatrisGame />} />
  <Route path="/games/spanglish-fix-it" element={<HubSpanglishFixIt user={user} />} />
  <Route path="/games/spanglish-fix-it/host/:gameId" element={<HubSpanglishLiveHost user={user} />} />
  <Route path="/games/spanglish-fix-it/join" element={<HubSpanglishLiveJoin />} />
  <Route path="/games/spanglish-fix-it/play/:gameId" element={<HubSpanglishLivePlayer />} />

{/* Reading routes */}
<Route path="/reading" element={<ReadingMenu />} />

<Route
  path="/reading/part1"
  element={
    <>
      <button
        onClick={() => navigate("/reading")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>

      <AptisPart1
        user={user}
        onRequireSignIn={() => setShowAuth(true)}
      />
    </>
  }
/>

<Route path="/reading/part2" element={
  <>
    <button
      onClick={() => navigate("/reading")}
      className="review-btn"
      style={{ marginBottom: "1rem" }}
    >
      ← Back
    </button>
    <AptisPart2Reorder user={user} onRequireSignIn={() => setShowAuth(true)} />
  </>
} />
<Route path="/reading/part2-guide" element={
  <>
    <button
      onClick={() => navigate("/reading")}
      className="review-btn"
      style={{ marginBottom: "1rem" }}
    >
      ← Back
    </button>
    <ReadingGuide />
  </>
} />
<Route path="/reading/part3" element={
  <>
    <button
      onClick={() => navigate("/reading")}
      className="review-btn"
      style={{ marginBottom: "1rem" }}
    >
      ← Back
    </button>
    <AptisPart3Matching user={user} onRequireSignIn={() => setShowAuth(true)} />
  </>
} />

<Route
  path="/reading/part4"
  element={
    <>
      <button
        onClick={() => navigate("/reading")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>

      <AptisPart4
        user={user}
        onRequireSignIn={() => setShowAuth(true)}
      />
    </>
  }
/>


{/* ——— Speaking routes ——— */}
<Route path="/speaking" element={<SpeakingMenu />} />

<Route
  path="/speaking/part1"
  element={
    <>
      <button
        onClick={() => navigate("/speaking")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <SpeakingPart1 user={user} speakSeconds={30} />
    </>
  }
/>

<Route
  path="/speaking/part2"
  element={
    <>
      <button
        onClick={() => navigate("/speaking")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <SpeakingPart2
        user={user}
        onBack={() => navigate("/speaking")}
        onRequireSignIn={() => navigate("/")} // or setShowAuth(true) if you prefer
      />
    </>
  }
/>

<Route
  path="/speaking/part3"
  element={
    <>
      <button
        onClick={() => navigate("/speaking")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <SpeakingPart3 user={user} />
    </>
  }
/>

<Route
  path="/speaking/part4"
  element={
    <>
      <button
        onClick={() => navigate("/speaking")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <SpeakingPart4 user={user} />
    </>
  }
/>

<Route
  path="/speaking/photo-guide"
  element={
    <SpeakingPart2and3_PhotoGuide
      onBack={() => navigate("/speaking")}
      onStartPart2={() => navigate("/speaking/part2")}
      onStartPart3={() => navigate("/speaking/part3")}
    />
  }
/>

<Route
  path="/speaking/part3-comparing"
  element={<SpeakingPart3ComparingMenu />}
/>

<Route
  path="/speaking/part3-comparing/language"
  element={<SpeakingPart3ComparingLanguage />}
/>

<Route
  path="/speaking/part3-comparing/similarities"
  element={<SpeakingPart3Similarities user={user} />}
/>

<Route
  path="/speaking/part3-comparing/comparatives"
  element={<SpeakingPart3Comparatives />}
/>

<Route
  path="/teacher/extras/speaking-part3-similarities"
  element={
    <RequireTeacher user={user}>
      <SpeakingPart3SimilaritiesExtras />
    </RequireTeacher>
  }
/>

{/* listening routes */}
<Route path="/listening" element={isSeifHubSite ? <HubListeningMenu /> : <ListeningMenu />} />

<Route
  path="/listening/dictation"
  element={isSeifHubSite ? <HubDictationTrainer /> : <ListeningMenu />}
/>

<Route
  path="/listening/part1"
  element={
    <ListeningPart1
      user={user}
      onRequireSignIn={() => setShowAuthModal?.(true)}
    />
  }
/>


<Route
  path="/listening/part2"
  element={
    <ListeningPart2
      user={user}
      onRequireSignIn={() => setShowAuthModal?.(true)}
    />
  }
/>

<Route
  path="/listening/part3"
  element={
    <ListeningPart3
      user={user}
      onRequireSignIn={() => setShowAuthModal(true)}
    />
  }
/>

<Route
  path="/listening/part4"
  element={
    <ListeningPart4
      user={user}
      onRequireSignIn={() => setShowAuthModal?.(true)}
    />
  }
/>

{/* vocabulary routes */}
<Route path="/vocabulary" element={isSeifHubSite ? <HubVocabularyMenu /> : <VocabularyMenu />} />
  <Route
    path="/vocabulary/topics"
    element={<VocabularyTopics isAuthenticated={!!user} />}
  />

<Route
  path="/vocabulary/lab"
  element={
    user ? (
      <VocabLab user={user} />
    ) : (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Vocab Lab</h2>
        <p className="muted">
          Please sign in to use global training and track your progress.
        </p>
        <button className="topbar-btn" onClick={() => setShowAuth(true)}>
          Sign in / Sign up
        </button>
      </div>
    )
  }
/>

<Route path="/vocabulary/collocations" element={<CollocationMenu />} />

<Route
  path="/vocabulary/collocations/dash"
  element={
    <>
      <button
        onClick={() => navigate("/vocabulary")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>

      <CollocationDash user={user} onRequireSignIn={() => setShowAuth(true)} />
    </>
  }
/>

{/* ——— Writing routes ——— */}
<Route path="/writing" element={<WritingMenu />} />

<Route
  path="/writing/part1"
  element={
    <>
      <button
        onClick={() => navigate("/writing")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <WritingPart1
        user={user}
        onBack={() => navigate("/writing")}
      />
    </>
  }
/>

<Route
  path="/writing/part1-guide"
  element={
    <>
      <button
        onClick={() => navigate("/writing")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <WritingPart1Guide
        user={user}
        onBack={() => navigate("/writing")}
        onStartPractice={() => navigate("/writing/part1")}
      />
    </>
  }
/>

<Route
  path="/writing/part2"
  element={
    <>
      <button
        onClick={() => navigate("/writing")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <WritingPart2
        user={user}
        onRequireSignIn={() => navigate("/login")}
      />
    </>
  }
/>

<Route
  path="/writing/part3"
  element={
    <>
      <button
        onClick={() => navigate("/writing")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <WritingPart3
        user={user}
        onRequireSignIn={() => navigate("/login")}
      />
    </>
  }
/>

<Route
  path="/writing/part4"
  element={
    <>
      <button
        onClick={() => navigate("/writing")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <WritingPart4Emails
        user={user}
        onBack={() => navigate("/writing")}
      />
    </>
  }
/>

<Route
  path="/writing/part4-guide"
  element={
    <>
      <button
        onClick={() => navigate("/writing")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <WritingPart4Guide
        onBack={() => navigate("/writing")}
        onOpen={(slug) => {
          if (slug === "register") return navigate("/writing/part4-register");
          if (slug === "practice") return navigate("/writing/part4");
          // fallback for any future slugs
          navigate(`/writing/p4-${slug}`);
        }}
      />
    </>
  }
/>

<Route
  path="/writing/part4-register"
  element={
    <>
      <button
        onClick={() => navigate("/writing/part4-guide")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>
      <WritingPart4RegisterGuide
        onBack={() => navigate("/writing/part4-guide")}
        onStartPractice={() => navigate("/writing/part4")}
      />
    </>
  }
/>

{/* ——— Profile routes ——— */}
<Route
  path="/profile"
  element={
    <Profile
      user={user}
      siteMode={currentSite.id}
      onBack={() => navigate("/")}
      onGoMistakes={() => navigate("/profile/mistakes")}
      onGoFavourites={() => navigate("/profile/favourites")}
      onGoVocabMistakes={() => navigate("/profile/vocab-mistakes")}   // 👈 ADD THIS
    />
  }
/>

<Route
  path="/profile/mistakes"
  element={
    <>
      <button
        onClick={() => navigate(siteProfilePath)}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back to profile
      </button>
      <ReviewMistakes />
    </>
  }
/>

<Route
  path="/profile/favourites"
  element={
    <>
      <button
        onClick={() => navigate(siteProfilePath)}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back to profile
      </button>
      <ReviewFavourites />
    </>
  }
/>

<Route
  path="/profile/vocab-mistakes"
  element={
    <>
      <button
        onClick={() => navigate(siteProfilePath)}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back to profile
      </button>
      <VocabMistakeReview
        onBack={() => navigate(siteProfilePath)}
      />
    </>
  }
/>


<Route
  path="/teacher-tools"
  element={
    user ? <TeacherTools user={user} /> : <p className="muted">Please log in.</p>
  }
/>
<Route
  path="/admin"
  element={<AdminDashboard user={user} />}
/>

<Route
  path="/admin/activity"
  element={<AdminActivityLog user={user} />}
/>

<Route path="/admin/activity-charts" element={<AdminActivityCharts user={user} />} />

<Route
  path="/my-students"
  element={<MyStudents user={user} />}
/>

<Route path="/live/join" element={<LiveGameJoin />} />
<Route path="/live/host/:gameId" element={<LiveGameHost />} />
<Route path="/live/play/:gameId" element={<LiveGamePlayer />} />

<Route
  path="/grammar-sets/:setId"
  element={<GrammarSetRunner user={user} />}
/>

<Route
  path="/use-of-english/custom/:setId"
  element={<UseOfEnglishCustomQuizRunner user={user} />}
/>

<Route
  path="/course-pack"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <CoursePackViewer />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the course pack yet.
      </p>
    )
  }
/>
<Route
  path="/pack-key"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <PackKeyLanding />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>

<Route
  path="/pack-key/core-grammar"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <CoreGrammarKey />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>

<Route
  path="/pack-key/core-vocabulary"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <CoreVocabularyKey />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>

<Route
  path="/pack-key/reading-part-1"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <ReadingPart1Key />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>

<Route
  path="/pack-key/reading-part-2"
  element={
    user?.courseAccess?.["seif-pack-v1"]
      ? <ReadingPart2Key />
      : <p className="muted" style={{ padding: "1rem" }}>
          You don’t have access to the pack key yet.
        </p>
  }
/>

<Route
  path="/pack-key/reading-part-3"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <ReadingPart3Key />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>

<Route
  path="/pack-key/reading-part-4"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <ReadingPart4Key />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>

<Route
  path="/pack-key/speaking-part-1"
  element={
    user?.courseAccess?.["seif-pack-v1"]
      ? <SpeakingPart1Key />
      : <p className="muted" style={{ padding: "1rem" }}>
          You don’t have access to the pack key yet.
        </p>
  }
/>

<Route
  path="/pack-key/speaking-part-2"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <SpeakingPart2Key />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>

<Route
  path="/pack-key/speaking-part-3"
  element={
    user?.courseAccess?.["seif-pack-v1"] ? (
      <SpeakingPart3Key />
    ) : (
      <p className="muted" style={{ padding: "1rem" }}>
        You don’t have access to the pack key yet.
      </p>
    )
  }
/>


<Route
  path="/teacher/student/:studentId"
  element={<TeacherStudentProfile user={user} />}
/>
<Route path="/privacy" element={<PrivacyPolicy />} />

<Route
  path="/*"
  element={
      <>
        {view === 'menu' && (
          isSeifHubSite ? (
            <HubLanding
              user={user}
              hasAccess={hasSeifHubAccess}
              onSignIn={() => setShowAuth(true)}
            />
          ) : (
            <MainMenu
              onSelect={(next) => setView(next)}
              user={user}
            />
          )
        )}

        {view === 'grammar' && <GrammarPage />}

        {view === 'mistakes' && (
          <>
            <button
              onClick={() => setView('grammar')}
              className="review-btn"
              style={{ marginBottom: '1rem' }}
            >
              ← Back
            </button>
            <ReviewMistakes />
          </>
        )}

        {view === 'favourites' && (
          <>
            <button
              onClick={() => setView('grammar')}
              className="review-btn"
              style={{ marginBottom: '1rem' }}
            >
              ← Back
            </button>
            <ReviewFavourites />
          </>
        )}

        {view === 'writingMenu' && (
          <WritingMenu
            onSelect={(part) => setView(`writing_${part}`)}
            onBack={() => setView('menu')}
          />
        )}

        {view === "writing_part1" && (
          <WritingPart1
            onBack={() => setView("writingMenu")}
            user={user}
          />
        )}

        {view === "writing_part1Guide" && (
          <WritingPart1Guide
            user={user}
            onBack={() => setView("writingMenu")}
            onStartPractice={() => setView("writing_part1")}
          />
        )}

        {view === "writing_part4" && (
          <WritingPart4Emails
            user={user}
            onBack={() => setView("writingMenu")}
          />
        )}

        {view === "writing_part4Guide" && (
          <WritingPart4Guide
            onBack={() => setView("writingMenu")}
            onOpen={(slug) => {
              if (slug === "register") return setView("writing_p4-register");
              if (slug === "practice") return setView("writing_part4");
              setView(`writing_p4-${slug}`);
            }}
          />
        )}

        {view === "writing_p4-register" && (
          <WritingPart4RegisterGuide
            onBack={() => setView("writing_part4Guide")}
            onStartPractice={() => setView("writing_part4")}
          />
        )}

        {view === 'readingMenu' && (
          <ReadingMenu
            onSelect={(next) => setView(next)}
            onBack={() => setView('menu')}
          />
        )}

        {view === 'readingGuide' && (
          <>
            <button
              onClick={() => setView('readingMenu')}
              className="review-btn"
              style={{ marginBottom: '1rem' }}
            >
              ← Back
            </button>
            <ReadingGuide />
          </>
        )}

        {view === 'reading' && (
          <>
            <button
              onClick={() => setView('readingMenu')}
              className="review-btn"
              style={{ marginBottom: '1rem' }}
            >
              ← Back
            </button>
            <AptisPart2Reorder
              user={user}
              onRequireSignIn={() => setShowAuth(true)}
            />
          </>
        )}

        {view === 'readingPart3' && (
          <>
            <button
              onClick={() => setView('readingMenu')}
              className="review-btn"
              style={{ marginBottom: '1rem' }}
            >
              ← Back
            </button>

            <AptisPart3Matching
              user={user}
              onRequireSignIn={() => setShowAuth(true)}
            />
          </>
        )}

        {view === 'speakingMenu' && (
          <SpeakingMenu
            onBack={() => setView('menu')}
            onSelect={(key) => {
              if (key === 'part1') setView('speakingPart1');
              if (key === 'part2') setView('speakingPart2');
              if (key === 'part3') setView('speakingPart3');
              if (key === 'part4') setView('speakingPart4');
            }}
          />
        )}

        {view === 'speakingPart1' && (
          <SpeakingPart1
            user={user}
            speakSeconds={30}
          />
        )}

        {view === 'speakingPart2' && (
          <SpeakingPart2
            onBack={() => setView('speakingMenu')}
            user={user}
            onRequireSignIn={() => setView('menu')}
          />
        )}

        {view === 'speakingPart3' && (
          <SpeakingPart3
            user={user}
          />
        )}

        {view === 'speakingPart4' && (
          <SpeakingPart4
            user={user}
          />
        )}

        {view === "vocabularyMenu" && (
          <VocabularyMenu
            onSelect={(section) => setView(section)}
            onBack={() => setView("menu")}
          />
        )}

        {view === "vocabTopics" && (
          <VocabularyTopics
            onBack={() => setView("vocabularyMenu")}
            isAuthenticated={!!user}
          />
        )}

        {view === 'profile' && (
          <Profile
            user={user}
            siteMode={currentSite.id}
            onBack={() => setView('menu')}
            onGoMistakes={() => setView('mistakes')}
            onGoFavourites={() => setView('favourites')}
          />
        )}
      </>
    }
  />
    </>
  )}
</Routes>

{/* Footer stays visible on all routes */}
<Footer />


  </div>
</div>

  )
}
