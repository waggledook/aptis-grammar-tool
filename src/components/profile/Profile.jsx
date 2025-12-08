import React, { useEffect, useState } from "react";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";
import { PART1_QUESTIONS } from "../speaking/banks/part1";
import { PART2_TASKS } from "../speaking/banks/part2";
import { PART3_TASKS } from "../speaking/banks/part3";
import { PART4_TASKS } from "../speaking/banks/part4";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getTotalVocabSets } from "../vocabulary/data/vocabTopics";


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
}) {
  const [loading, setLoading] = useState(true);

  const [readingCount, setReadingCount] = useState(0);
  const [speakingCounts, setSpeakingCounts] = useState({
    part1: 0,
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
  const [showWritingAll, setShowWritingAll] = useState(false);

  const [speakingNotes, setSpeakingNotes] = useState([]);
  const [showSpeakingNotes, setShowSpeakingNotes] = useState(false);

  const [vocabTopicCounts, setVocabTopicCounts] = useState(null); // 👈 NEW
  const [vocabMistakes, setVocabMistakes] = useState([]); // 👈 NEW

  // Progress sections at the top
  const [showReadingPanel, setShowReadingPanel] = useState(false);
  const [showVocabPanel, setShowVocabPanel] = useState(false);
  const [showSpeakingPanel, setShowSpeakingPanel] = useState(false);
  const [showGrammarPanel, setShowGrammarPanel] = useState(false);


  const TOTAL_VOCAB_SETS = getTotalVocabSets();

  // we'll still keep photoURL logic in case you want to bring badges back later,
  // but we just won't render the avatar / studio for now.
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");

  const SPEAKING_TOTALS = {
    part1: PART1_QUESTIONS.length,
    part2: PART2_TASKS.length,
    part3: PART3_TASKS.length,
    part4: PART4_TASKS.length,
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
  
    const uid = targetUid || auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
  
    (async () => {
      try {
        const [
          rCount,
          sCounts,
          m,
          f,
          w,
          gDash,
          gEdits,
          wP2,
          wP3,
          wP4,
          p4Reg,
          specNotes,
          vocabCounts, // 👈 NEW
          vocabMistakesArr, // 👈 NEW
        ] = await Promise.all([
          fb.fetchReadingProgressCount(uid),
          fb.fetchSpeakingCounts(uid),
          fb.fetchRecentMistakes(8, uid),
          fb.fetchRecentFavourites(8, uid),
          fb.fetchWritingP1Sessions(10, uid),
          fb.fetchGrammarDashboard(uid),
          fb.fetchWritingP1GuideEdits(100, uid),
          fb.fetchWritingP2Submissions?.(20, uid) ?? Promise.resolve([]),
          fb.fetchWritingP3Submissions?.(20, uid) ?? Promise.resolve([]),
          fb.fetchWritingP4Submissions?.(20, uid) ?? Promise.resolve([]),
          fb.fetchWritingP4RegisterAttempts?.(100, uid) ?? Promise.resolve([]),
          fb.fetchSpeakingSpeculationNotes?.(50, uid) ?? Promise.resolve([]),
          fb.fetchVocabTopicCounts?.(uid) ?? Promise.resolve({}), // 👈 NEW
          fb.fetchRecentVocabMistakes?.(8, uid) ?? Promise.resolve([]), // 👈 ADD THIS
        ]);        
  
        if (!alive) return;
        setReadingCount(rCount);
        setSpeakingCounts(sCounts);
        setMistakes(m);
        setFavourites(f);
        setWritingP1(w);
        setGrammarDash(gDash);
        setGuideEdits(gEdits);
        setWritingP2(wP2);
        setWritingP3(wP3);
        setWritingP4(wP4);
        setP4Register(p4Reg);
        setSpeakingNotes(specNotes);
        setVocabTopicCounts(vocabCounts || {}); // 👈 NEW
        setVocabMistakes(vocabMistakesArr || []); // 👈 NEW
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
  }, [targetUid]);  


  const totalWritingItems =
  writingP1.length +
  guideEdits.length +
  writingP2.length +
  writingP3.length +
  writingP4.length +
  p4Register.length;

  // 👇 Add this derived value for vocab progress
const totalCompletedVocab = vocabTopicCounts
? Object.values(vocabTopicCounts).reduce(
    (sum, stats) => sum + (stats.completed || 0),
    0
  )
: 0;


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
      {readingCount} task{readingCount === 1 ? "" : "s"} completed
    </span>
    <span className={`chev ${showReadingPanel ? "open" : ""}`} aria-hidden>
      ▾
    </span>
  </button>

  {showReadingPanel && (
    <div className="panel-body">
      <p>
        You’ve completed{" "}
        <strong>{readingCount}</strong> reading task
        {readingCount === 1 ? "" : "s"} so far.
      </p>
    </div>
  )}
</section>

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
      {totalCompletedVocab}/{TOTAL_VOCAB_SETS || 0} sets completed
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
          label="Overall"
          right={`${totalCompletedVocab}/${TOTAL_VOCAB_SETS || 0}`}
        />
      </div>

      {!vocabTopicCounts || Object.keys(vocabTopicCounts).length === 0 ? (
        <p className="muted small" style={{ marginTop: ".6rem" }}>
          No vocab sets completed yet.
        </p>
      ) : (
        <ul className="vocab-list" style={{ marginTop: ".6rem" }}>
          {Object.entries(vocabTopicCounts).map(([topicKey, stats]) => (
            <li key={topicKey} className="vocab-row">
              <span className="vocab-topic-label">
                {topicKey.charAt(0).toUpperCase() + topicKey.slice(1)}
              </span>
              <span className="vocab-topic-count">
                {stats.completed} set{stats.completed === 1 ? "" : "s"} completed
                {typeof stats.total === "number" && stats.total > 0 && (
                  <span className="vocab-topic-sub">
                    {" "}
                    (out of {stats.total} practised)
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "0.75rem" }}>
        <h4
          style={{
            margin: "0 0 .4rem 0",
            fontSize: "0.95rem",
            color: "#cfe1ff",
          }}
        >
          Mistakes
        </h4>

        {(!vocabMistakes || vocabMistakes.length === 0) ? (
          <p className="muted small">
            No active vocab mistakes – great job!
          </p>
        ) : (
          <>
            <p className="muted small">
              You have <strong>{vocabMistakes.length}</strong> vocab item
              {vocabMistakes.length === 1 ? "" : "s"} to review.
            </p>

            {onGoVocabMistakes && (
              <button
                type="button"
                className="btn"
                style={{ marginTop: ".4rem" }}
                onClick={onGoVocabMistakes}
              >
                Review vocab mistakes
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )}
</section>

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
      .panel-body {
  margin-top: 0.75rem;
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
