import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  LoaderCircle,
  Search,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchAptisGrammarVocabularyMockAttempts,
  listTeacherStudentsWithRosterMeta,
  logActivity,
} from "../../firebase.js";
import {
  buildAptisGrammarVocabularyClassMistakes,
  prioritizeAptisGrammarVocabularyMistakes,
} from "../../utils/aptisGrammarVocabularyMistakes.js";
import {
  APTIS_MOCK_MISTAKE_REVIEW_COMPLETED,
  APTIS_MOCK_MISTAKE_REVIEW_STARTED,
  buildAptisMockMistakeReviewCompletion,
  createAptisMockMistakeReviewTracking,
} from "../../utils/aptisMockMistakeReviewActivity.js";
import AptisMockPortalHeader from "../common/AptisMockPortalHeader.jsx";
import Seo from "../common/Seo.jsx";
import {
  AptisMockStyles,
  MistakeReviewSession,
} from "../hub/HubAptisGrammarVocabularyMock.jsx";
import "./TeacherAptisGrammarVocabularyReview.css";

function getStudentLabel(student) {
  return String(
    student?.displayName || student?.name || student?.username || student?.email || "Student"
  ).trim();
}

function shuffled(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function clampCount(value, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(maximum, Math.max(0, parsed));
}

export default function TeacherAptisGrammarVocabularyReview({ user }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [mistakes, setMistakes] = useState(null);
  const [mistakesLoading, setMistakesLoading] = useState(false);
  const [mistakesError, setMistakesError] = useState("");
  const [reviewMode, setReviewMode] = useState("custom");
  const [grammarCount, setGrammarCount] = useState(10);
  const [vocabularyCount, setVocabularyCount] = useState(10);
  const [prioritizeFrequent, setPrioritizeFrequent] = useState(true);
  const [reviewItems, setReviewItems] = useState([]);
  const [stage, setStage] = useState("setup");
  const reviewTrackingRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setStudentsLoading(true);
    setStudentsError("");

    listTeacherStudentsWithRosterMeta(user?.uid)
      .then((rows) => {
        if (alive) setStudents(rows);
      })
      .catch((error) => {
        console.error("[Teacher mock review] Could not load students", error);
        if (alive) setStudentsError(error?.message || "Your students could not be loaded.");
      })
      .finally(() => {
        if (alive) setStudentsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user?.uid]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) => [
      getStudentLabel(student),
      student.email,
      student.username,
      student.className,
    ].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [search, students]);

  const selectedIdSet = useMemo(() => new Set(selectedStudentIds), [selectedStudentIds]);
  const selectedStudents = useMemo(
    () => students.filter((student) => selectedIdSet.has(student.id)),
    [selectedIdSet, students]
  );
  const grammarMistakes = useMemo(
    () => (mistakes || []).filter((item) => item.kind === "grammar"),
    [mistakes]
  );
  const vocabularyMistakes = useMemo(
    () => (mistakes || []).filter((item) => item.kind === "vocabulary"),
    [mistakes]
  );
  const allVisibleSelected = filteredStudents.length > 0
    && filteredStudents.every((student) => selectedIdSet.has(student.id));

  function resetLoadedMistakes() {
    setMistakes(null);
    setMistakesError("");
  }

  function toggleStudent(studentId) {
    if (mistakesLoading) return;
    setSelectedStudentIds((current) => current.includes(studentId)
      ? current.filter((id) => id !== studentId)
      : [...current, studentId]);
    resetLoadedMistakes();
  }

  function toggleAllVisible() {
    if (mistakesLoading) return;
    const visibleIds = filteredStudents.map((student) => student.id);
    setSelectedStudentIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...current, ...visibleIds]));
    });
    resetLoadedMistakes();
  }

  async function loadMistakes() {
    if (!selectedStudents.length || mistakesLoading) return;
    setMistakesLoading(true);
    setMistakesError("");

    const results = await Promise.allSettled(selectedStudents.map(async (student) => ({
      student,
      attempts: await fetchAptisGrammarVocabularyMockAttempts(
        null,
        student.id
      ),
    })));
    const groups = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    const failedCount = results.length - groups.length;
    const mergedMistakes = buildAptisGrammarVocabularyClassMistakes(groups);
    const grammarTotal = mergedMistakes.filter((item) => item.kind === "grammar").length;
    const vocabularyTotal = mergedMistakes.filter((item) => item.kind === "vocabulary").length;

    setMistakes(mergedMistakes);
    setGrammarCount(Math.min(10, grammarTotal));
    setVocabularyCount(Math.min(10, vocabularyTotal));
    if (failedCount) {
      setMistakesError(
        `${failedCount} ${failedCount === 1 ? "student's attempts could" : "students' attempts could"} not be loaded. The available results are shown below.`
      );
    }
    setMistakesLoading(false);
  }

  function startReviewActivity(items = reviewItems) {
    const tracking = createAptisMockMistakeReviewTracking(items, {
      reviewScope: "teacher_class",
      selectedStudentCount: selectedStudents.length,
      selectionMode: reviewMode,
      prioritizeFrequent,
    });
    reviewTrackingRef.current = tracking;
    void logActivity(APTIS_MOCK_MISTAKE_REVIEW_STARTED, tracking.details);
  }

  function completeReviewActivity(summary) {
    const tracking = reviewTrackingRef.current;
    if (!tracking || tracking.completed) return;
    tracking.completed = true;
    void logActivity(
      APTIS_MOCK_MISTAKE_REVIEW_COMPLETED,
      buildAptisMockMistakeReviewCompletion(tracking, summary)
    );
  }

  function startReview() {
    let nextItems;

    if (reviewMode === "all") {
      nextItems = [...grammarMistakes, ...vocabularyMistakes];
    } else {
      const grammarPool = prioritizeFrequent
        ? prioritizeAptisGrammarVocabularyMistakes(grammarMistakes)
        : shuffled(grammarMistakes);
      const vocabularyPool = prioritizeFrequent
        ? prioritizeAptisGrammarVocabularyMistakes(vocabularyMistakes)
        : shuffled(vocabularyMistakes);

      nextItems = [
        ...grammarPool.slice(0, clampCount(grammarCount, grammarMistakes.length)),
        ...vocabularyPool.slice(0, clampCount(vocabularyCount, vocabularyMistakes.length)),
      ];
    }

    if (prioritizeFrequent) {
      nextItems = prioritizeAptisGrammarVocabularyMistakes(nextItems);
    }
    if (!nextItems.length) return;
    setReviewItems(nextItems);
    startReviewActivity(nextItems);
    setStage("review");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (stage === "review") {
    return (
      <div
        className="aptis-mock teacher-mock-review-player notranslate"
        role="dialog"
        aria-label="Class mistake review"
        aria-modal="true"
        translate="no"
      >
        <Seo
          title="Teacher Grammar and Vocabulary Review | Seif Aptis Trainer"
          description="Run a shared immediate-feedback review from selected students' Aptis mock mistakes."
        />
        <AptisMockPortalHeader
          user={user}
          onHome={() => navigate("/teacher-resources")}
          onProfile={() => navigate("/profile")}
        />
        <MistakeReviewSession
          items={reviewItems}
          title="Class mistake review"
          exitLabel="Back to setup"
          completeTitle="Class review complete"
          onComplete={completeReviewActivity}
          onRestart={() => startReviewActivity(reviewItems)}
          onExit={() => {
            reviewTrackingRef.current = null;
            setStage("setup");
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
        />
        <AptisMockStyles />
      </div>
    );
  }

  const customReviewTotal = clampCount(grammarCount, grammarMistakes.length)
    + clampCount(vocabularyCount, vocabularyMistakes.length);

  return (
    <main className="teacher-mock-review-page game-wrapper">
      <Seo
        title="Teacher Grammar and Vocabulary Review | Seif Aptis Trainer"
        description="Select allocated students and review their combined Aptis grammar and vocabulary mock mistakes."
      />

      <Link className="teacher-mock-review-back" to="/teacher-resources">
        <ArrowLeft size={18} aria-hidden="true" />
        Teacher resources
      </Link>

      <header className="teacher-mock-review-hero">
        <span aria-hidden="true"><BookOpenCheck size={34} /></span>
        <div>
          <p>Teacher mode</p>
          <h1>Review mock mistakes with your class</h1>
          <span>
            Select allocated students, combine their Grammar and Vocabulary mock errors, and run one immediate-feedback review.
          </span>
        </div>
      </header>

      <section className="teacher-mock-review-panel" aria-labelledby="student-selection-heading">
        <div className="teacher-mock-review-panel-heading">
          <div>
            <span>Step 1</span>
            <h2 id="student-selection-heading">Choose students</h2>
          </div>
          <strong>{selectedStudentIds.length} selected</strong>
        </div>

        {studentsLoading ? (
          <div className="teacher-mock-review-state">
            <LoaderCircle className="is-spinning" size={24} />
            Loading your students…
          </div>
        ) : studentsError ? (
          <p className="teacher-mock-review-alert is-error">{studentsError}</p>
        ) : !students.length ? (
          <div className="teacher-mock-review-empty">
            <Users size={30} aria-hidden="true" />
            <h3>No allocated students yet</h3>
            <p>Add students from My Students before building a class review.</p>
            <Link to="/my-students">Open My Students</Link>
          </div>
        ) : (
          <>
            <div className="teacher-mock-review-roster-tools">
              <label>
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  placeholder="Search by name, email or class"
                  disabled={mistakesLoading}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <button type="button" disabled={mistakesLoading} onClick={toggleAllVisible}>
                {allVisibleSelected ? "Clear visible" : "Select all visible"}
              </button>
            </div>

            <div className="teacher-mock-review-roster">
              {filteredStudents.map((student) => (
                <label
                  className={selectedIdSet.has(student.id) ? "is-selected" : ""}
                  key={student.id}
                >
                  <input
                    type="checkbox"
                    checked={selectedIdSet.has(student.id)}
                    disabled={mistakesLoading}
                    onChange={() => toggleStudent(student.id)}
                  />
                  <span>
                    <strong>{getStudentLabel(student)}</strong>
                    <small>{student.className || student.email || "Allocated student"}</small>
                  </span>
                  {selectedIdSet.has(student.id) ? <CheckCircle2 size={20} aria-hidden="true" /> : null}
                </label>
              ))}
              {!filteredStudents.length ? <p>No students match that search.</p> : null}
            </div>

            <button
              className="teacher-mock-review-primary"
              type="button"
              disabled={!selectedStudentIds.length || mistakesLoading}
              onClick={loadMistakes}
            >
              {mistakesLoading ? <LoaderCircle className="is-spinning" size={19} /> : <BookOpenCheck size={19} />}
              {mistakesLoading ? "Collecting mistakes…" : "Collect selected students’ mistakes"}
            </button>
          </>
        )}
      </section>

      {mistakesError ? <p className="teacher-mock-review-alert is-error">{mistakesError}</p> : null}

      {mistakes ? (
        <section className="teacher-mock-review-panel" aria-labelledby="review-settings-heading">
          <div className="teacher-mock-review-panel-heading">
            <div>
              <span>Step 2</span>
              <h2 id="review-settings-heading">Choose the review length</h2>
            </div>
            <strong>{mistakes.length} unique errors</strong>
          </div>

          {!mistakes.length ? (
            <div className="teacher-mock-review-empty is-success">
              <CheckCircle2 size={30} aria-hidden="true" />
              <h3>No mistakes found</h3>
              <p>The selected students have no answered-incorrectly items in their saved mocks.</p>
            </div>
          ) : (
            <>
              <div className="teacher-mock-review-totals">
                <article>
                  <span>Grammar</span>
                  <strong>{grammarMistakes.length}</strong>
                  <small>unique mistakes</small>
                </article>
                <article>
                  <span>Vocabulary</span>
                  <strong>{vocabularyMistakes.length}</strong>
                  <small>unique mistakes</small>
                </article>
                <article>
                  <span>Students</span>
                  <strong>{selectedStudents.length}</strong>
                  <small>included</small>
                </article>
              </div>

              <div className="teacher-mock-review-modes">
                <label className={reviewMode === "custom" ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name="review-mode"
                    value="custom"
                    checked={reviewMode === "custom"}
                    onChange={() => setReviewMode("custom")}
                  />
                  <span>
                    <strong>Choose a mix</strong>
                    <small>Set separate grammar and vocabulary totals.</small>
                  </span>
                </label>
                <label className={reviewMode === "all" ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name="review-mode"
                    value="all"
                    checked={reviewMode === "all"}
                    onChange={() => setReviewMode("all")}
                  />
                  <span>
                    <strong>Ongoing review · all errors</strong>
                    <small>Work through the complete deduplicated list.</small>
                  </span>
                </label>
              </div>

              {reviewMode === "custom" ? (
                <div className="teacher-mock-review-counts">
                  <label>
                    <span>Grammar items</span>
                    <input
                      type="number"
                      min="0"
                      max={grammarMistakes.length}
                      value={grammarCount}
                      onChange={(event) => setGrammarCount(clampCount(event.target.value, grammarMistakes.length))}
                    />
                    <small>of {grammarMistakes.length} available</small>
                  </label>
                  <label>
                    <span>Vocabulary items</span>
                    <input
                      type="number"
                      min="0"
                      max={vocabularyMistakes.length}
                      value={vocabularyCount}
                      onChange={(event) => setVocabularyCount(clampCount(event.target.value, vocabularyMistakes.length))}
                    />
                    <small>of {vocabularyMistakes.length} available</small>
                  </label>
                </div>
              ) : null}

              <label
                className={`teacher-mock-review-priority${prioritizeFrequent ? " is-selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={prioritizeFrequent}
                  onChange={(event) => setPrioritizeFrequent(event.target.checked)}
                />
                <span>
                  <strong>Prioritise commonly missed items</strong>
                  <small>
                    Choose and show questions missed by the most selected students first.
                  </small>
                </span>
              </label>

              <button
                className="teacher-mock-review-primary is-launch"
                type="button"
                disabled={reviewMode === "custom" && customReviewTotal === 0}
                onClick={startReview}
              >
                Start {reviewMode === "all" ? `all ${mistakes.length}` : customReviewTotal} review items
              </button>
            </>
          )}
        </section>
      ) : null}
    </main>
  );
}
