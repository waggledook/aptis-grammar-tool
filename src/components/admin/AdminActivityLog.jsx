// src/components/admin/AdminActivityLog.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, limit, query, startAfter } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 200;

const typeLabels = {
    grammar_session: "Grammar session",
    vocab_set_completed: "Vocab set completed",
    grammar_set_completed: "Grammar set completed",
    live_game_played: "Live game played",
    writing_submitted: "Writing submitted",
    speaking_note_submitted: "Speaking note",
    reading_completed: "Reading activity",
    speaking_task_completed: "Speaking task",
    vocab_flashcards_session: "Vocab flashcards",   // 👈 new
    vocab_match_session: "Vocab match",
    reading_guide_viewed: "Reading guide viewed",
  reading_guide_clue_reveal: "Reading guide clue revealed",
  reading_guide_reorder_check: "Reading guide check",
  reading_guide_show_answers: "Reading guide answers shown",
  reading_guide_reorder_completed: "Reading guide reorder completed",
  reading_reorder_completed: "Reading reorder completed",
  reading_part4_attempted: "Reading Part 4 attempt",
  reading_part4_completed: "Reading Part 4 completed",
  reading_part3_attempted: "Reading Part 3 attempt",
  reading_part3_completed: "Reading Part 3 completed",
  listening_part1_attempted: "Listening Part 1 attempt",
  listening_part1_completed: "Listening Part 1 completed",
  listening_part2_attempted: "Listening Part 2 attempt",
  listening_part2_completed: "Listening Part 2 completed",
  listening_part3_attempted: "Listening Part 3 attempt",
  listening_part3_completed: "Listening Part 3 completed", 
  listening_part4_attempted: "Listening Part 4 attempt",
  listening_part4_completed: "Listening Part 4 completed",
  hub_grammar_submitted: "Hub grammar submitted",
  hub_dictation_completed: "Hub dictation completed",
  hub_flashcards_started: "Hub flashcards started",
  hub_spanglish_started: "Hub Spanglish started",
  hub_spanglish_review_started: "Hub Spanglish review started",
  hub_spanglish_completed: "Hub Spanglish completed",
  hub_spanglish_live_hosted: "Hub Spanglish live hosted",
  hub_spanglish_live_started: "Hub Spanglish live started",
  hub_spanglish_live_finished: "Hub Spanglish live finished",
  hub_spanglish_live_report_viewed: "Hub Spanglish live report viewed",
  hub_dependent_preps_started: "Hub dependent preps started",
  hub_dependent_preps_review_started: "Hub dependent preps review started",
  hub_dependent_preps_completed: "Hub dependent preps completed",
  hub_keyword_started: "Hub keyword started",
  hub_keyword_review_loaded: "Hub keyword review loaded",
  hub_keyword_completed: "Hub keyword completed",
  hub_open_cloze_started: "Hub open cloze started",
  hub_open_cloze_review_loaded: "Hub open cloze review loaded",
  hub_open_cloze_completed: "Hub open cloze completed",
  hub_word_formation_started: "Hub word formation started",
  hub_word_formation_review_loaded: "Hub word formation review loaded",
  hub_word_formation_completed: "Hub word formation completed",
  collocation_dash_started: "Collocation Dash started",
  collocation_dash_completed: "Collocation Dash completed",
  writing_p1_guide_activity_started: "Writing P1 guide activity started",
  writing_p4_register_guide_activity_started: "Writing P4 register guide activity started",
  };
  
  function formatDetails(log) {
    const d = log.details || {};
  
    switch (log.type) {
      case "grammar_session": {
        const modeLabel = d.mode === "test" ? "Test mode" : "Practice";
        const count = d.totalItems ?? "?";
        return `${modeLabel} · ${count} item${count === 1 ? "" : "s"}`;
      }
  
      case "vocab_set_completed": {
        const topic = d.topic || "Unknown topic";
        const setId = d.setId || "";
        const mode = d.mode || "review";
        const count = d.totalItems ?? "?";
  
        const base = `${topic}${setId ? " · " + setId : ""} · ${mode} · ${count} item${
          count === 1 ? "" : "s"
        }`;
  
        const hasStats =
          typeof d.correctFirstTry === "number" ||
          typeof d.mistakesCount === "number";
  
        if (!hasStats) return base;
  
        const correct =
          typeof d.correctFirstTry === "number" ? d.correctFirstTry : "?";
        const mistakes =
          typeof d.mistakesCount === "number" ? d.mistakesCount : "?";
  
        return `${base} (${correct} first-try, ${mistakes} mistake${
          mistakes === 1 ? "" : "s"
        })`;
      }

      case "speaking_task_completed": {
        const d = log.details || {};
        const part = d.part || "?";
  
        const partLabel =
          part === "part1" ? "Part 1 – short answers"
          : part === "part2" ? "Part 2 – photo description"
          : part === "part3" ? "Part 3 – comparing photos"
          : part === "part4" ? "Part 4 – 2-minute talk"
          : part;
  
        const qCount =
          typeof d.questionCount === "number"
            ? d.questionCount
            : Array.isArray(d.questionIds)
            ? d.questionIds.length
            : null;
  
        const qLabel = qCount
          ? `${qCount} question${qCount === 1 ? "" : "s"}`
          : "questions";
  
        if (part === "part1") {
          // randomised trio, no fixed task id
          return `${partLabel} · ${qLabel}`;
        }
  
        const taskId = d.taskId || "task";
        return `${partLabel} · ${taskId} · ${qLabel}`;
      }

      case "speaking_note_submitted": {
        const d = log.details || {};
        const guide =
          d.guideId === "photoGuide_speculation"
            ? "Photo guide – speculation"
            : d.guideId === "part3_similarities"
            ? "Part 3 similarities guide"
            : d.guideId || "Speaking guide";
  
        const photo = d.photoKey || "";
        const chars =
          typeof d.chars === "number" ? `${d.chars} chars` : null;
        const lines =
          typeof d.lines === "number" ? `${d.lines} line${d.lines === 1 ? "" : "s"}` : null;
  
        const bits = [guide];
        if (photo) bits.push(photo);
        if (chars) bits.push(chars);
        if (lines) bits.push(lines);
  
        return bits.join(" · ");
      }  
  

      case "vocab_flashcards_session": {
        const topic = d.topic || "Unknown topic";
        const count = d.totalCards ?? "?";
        const status = d.isAuthenticated ? "signed-in" : "guest";
  
        return `${topic} · flashcards · ${count} card${
          count === 1 ? "" : "s"
        } (${status})`;
      }  

      case "vocab_match_session": {
        const d = log.details || {};
        const topic = d.topic || "Unknown topic";
        const setId = d.setId || "";
        const pairs = d.totalPairs ?? "?";
  
        return `${topic}${setId ? " · " + setId : ""} · match · ${pairs} pair${
          pairs === 1 ? "" : "s"
        }`;
      }

      case "reading_guide_viewed": {
        return `${d.guideId || "reading_guide"}`;
      }
      
      case "reading_guide_clue_reveal": {
        return `${d.taskId || "task"} · clue revealed`;
      }
      
      case "reading_guide_reorder_check": {
        const task = d.taskId || "task";
        const result = d.correct ? "✓ correct" : "✗ not yet";
        return `${task} · ${result}`;
      }
      
      case "reading_guide_show_answers": {
        return `${d.taskId || "task"} · answers shown`;
      }
      
      case "reading_guide_reorder_completed": {
        return `${d.taskId || "task"} · completed ✓`;
      }
      
      case "reading_reorder_completed": {
        return `${d.taskId || "task"} · completed ✓`;
      }

      case "reading_part4_attempted":
  return `${d.taskId || "task"} · ${d.score ?? "?"}/${d.total ?? "?"}`;
    

      case "reading_part4_completed": {
        return `${d.taskId || "task"} · completed ✓`;
      }

      case "reading_part3_attempted":
  return `${d.taskId || "task"} · ${d.score ?? "?"}/${d.total ?? "?"}`;

case "reading_part3_completed": {
  return `${d.taskId || "task"} · completed ✓`;
}
case "listening_part1_attempted":
  return `${d.taskId || "task"} · ${d.score ?? "?"}/${d.total ?? "?"}${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;

case "listening_part1_completed":
  return `${d.taskId || "task"} · completed ✓${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;

case "listening_part2_attempted":
  return `${d.taskId || "task"} · ${d.score ?? "?"}/${d.total ?? "?"}${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;

case "listening_part2_completed":
  return `${d.taskId || "task"} · completed ✓${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;

case "listening_part3_attempted":
  return `${d.taskId || "task"} · ${d.score ?? "?"}/${d.total ?? "?"}${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;

case "listening_part3_completed":
  return `${d.taskId || "task"} · completed ✓${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;

case "listening_part4_attempted":
  return `${d.taskId || "task"} · ${d.score ?? "?"}/${d.total ?? "?"}${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;
  
case "listening_part4_completed":
  return `${d.taskId || "task"} · completed ✓${typeof d.playsUsed === "number" ? ` · listens: ${d.playsUsed}/2` : ""}`;

case "hub_grammar_submitted":
  return `${d.activityTitle || d.activityId || "Grammar activity"} · ${d.score ?? "?"}% · ${d.correct ?? "?"}/${d.total ?? "?"}`;

case "hub_dictation_completed":
  return `${d.mode || "game"} · ${d.setLabel || d.setId || "All sentences"} · score ${d.score ?? "?"} · ${d.completed ?? "?"}/${d.totalPlayed ?? "?"}`;

case "hub_flashcards_started":
  return `${d.mode || "deck"} · ${d.deckTitle || d.deckId || "Flashcards"} · ${d.total ?? "?"} card${d.total === 1 ? "" : "s"}`;

case "hub_spanglish_started":
  return `${d.mode || "normal"} · ${d.totalItems ?? "?"} item${d.totalItems === 1 ? "" : "s"}`;

case "hub_spanglish_review_started":
  return `${d.mode || "review"} · ${d.total ?? "?"} item${d.total === 1 ? "" : "s"}`;

case "hub_spanglish_completed":
  return `${d.score ?? "?"} pts · ${d.wrongAnswers ?? "?"} saved for review · ${d.totalItems ?? "?"} item${d.totalItems === 1 ? "" : "s"}`;

case "hub_spanglish_live_hosted":
  return `PIN ${d.pin ?? "?"} · ${d.roundCount ?? "?"} round${d.roundCount === 1 ? "" : "s"}`;

case "hub_spanglish_live_started":
  return `PIN ${d.pin ?? "?"} · ${d.playerCount ?? "?"} player${d.playerCount === 1 ? "" : "s"} · ${d.roundCount ?? "?"} round${d.roundCount === 1 ? "" : "s"}`;

case "hub_spanglish_live_finished":
  return `PIN ${d.pin ?? "?"} · ${d.playerCount ?? "?"} player${d.playerCount === 1 ? "" : "s"} · ${d.completedRounds ?? d.roundCount ?? "?"}/${d.roundCount ?? "?"} round${d.roundCount === 1 ? "" : "s"}`;

case "hub_spanglish_live_report_viewed":
  return `PIN ${d.pin ?? "?"} · ${d.playerCount ?? "?"} player${d.playerCount === 1 ? "" : "s"}`;

case "hub_dependent_preps_started":
  return `${d.level || d.levelId || "level"} · ${d.roundSeconds ?? "?"}s round · pool ${d.totalItems ?? "?"}`;

case "hub_dependent_preps_review_started":
  return `${d.level || d.levelId || "level"} · ${d.total ?? "?"} item${d.total === 1 ? "" : "s"}`;

case "hub_dependent_preps_completed":
  return `${d.level || d.levelId || "level"} · ${d.score ?? "?"} pts · ${d.correct ?? "?"}/${d.attempted ?? "?"}`;

case "hub_keyword_started":
  return `${d.mode || "normal"} · pool ${d.poolSize ?? "?"} · set ${d.total ?? "?"}`;

case "hub_keyword_review_loaded":
  return `${d.mode || "review"} · ${d.total ?? "?"} item${d.total === 1 ? "" : "s"}`;

case "hub_keyword_completed":
  return `${d.mode || "normal"} · ${d.correct ?? "?"}/${d.total ?? "?"} correct`;

case "hub_open_cloze_started":
  return `${d.mode || "normal"} · pool ${d.poolSize ?? "?"} · set ${d.total ?? "?"}`;

case "hub_open_cloze_review_loaded":
  return `${d.mode || "review"} · ${d.total ?? "?"} item${d.total === 1 ? "" : "s"}`;

case "hub_open_cloze_completed":
  return `${d.mode || "normal"} · ${d.correct ?? "?"}/${d.total ?? "?"} correct`;

case "hub_word_formation_started":
  return `${d.mode || "normal"} · pool ${d.poolSize ?? "?"} · set ${d.total ?? "?"}`;

case "hub_word_formation_review_loaded":
  return `${d.mode || "review"} · ${d.total ?? "?"} item${d.total === 1 ? "" : "s"}`;

case "hub_word_formation_completed":
  return `${d.mode || "normal"} · ${d.correct ?? "?"}/${d.total ?? "?"} correct`;

case "collocation_dash_started":
  return `${d.roundsPlanned ?? "?"} round${d.roundsPlanned === 1 ? "" : "s"} · ${d.roundSeconds ?? "?"}s`;

case "collocation_dash_completed":
  return `${d.score ?? "?"} pts · round ${d.roundsReached ?? "?"} · ${d.reviewCount ?? "?"} review`;
      
      case "writing_submitted": {
        const part = d.part || "?";
      
        const partLabel =
          part === "part1" ? "Part 1 – short answers"
          : part === "part2" ? "Part 2 – form (20–30 words)"
          : part === "part3" ? "Part 3 – chat (3 answers)"
          : part === "part4" ? "Part 4 – emails (friend + formal)"
          : part;
      
        // Part-specific details you’re logging
        if (part === "part1") {
          const n = d.totalItems ?? "?";
          return `${partLabel} · ${n} item${n === 1 ? "" : "s"}`;
        }
      
        if (part === "part2") {
          const taskId = d.taskId || "task";
          const wc = d.wordCount ?? "?";
          return `${partLabel} · ${taskId} · ${wc} words`;
        }
      
        if (part === "part3") {
          const taskId = d.taskId || "task";
          const total = d.totalWords ?? (Array.isArray(d.wordCounts) ? d.wordCounts.reduce((a,b)=>a+b,0) : null);
          return `${partLabel} · ${taskId} · ${total ?? "?"} words`;
        }
      
        if (part === "part4") {
          const taskId = d.taskId || "task";
          const friend = d.counts?.friend ?? "?";
          const formal = d.counts?.formal ?? "?";
          const total = d.totalWords ?? ((friend || 0) + (formal || 0));
          return `${partLabel} · ${taskId} · ${total} words (${friend}+${formal})`;
        }
      
        return partLabel;
      }

      case "writing_p1_guide_activity_started": {
        const guide = d.guideId === "writing_p1_guide" ? "P1 guide" : (d.guideId || "guide");
      
        const activityLabel =
          d.activity === "trim_it" ? "Trim It"
          : d.activity === "improve_answer" ? "Improve the answer"
          : d.activity || "activity";
      
        return `${guide} · started · ${activityLabel}`;
      }

      case "writing_guide_viewed": {
        const part =
          d.part === "part1" ? "Part 1 – short answers"
          : d.part === "part2" ? "Part 2 – form"
          : d.part === "part3" ? "Part 3 – chat"
          : d.part === "part4" ? "Part 4 – emails"
          : d.part || "writing";
      
        return `${part} guide`;
      }

      case "writing_p4_register_guide_activity_started": {
        const activityLabel =
          d.activity === "formal_informal_quiz" ? "Formal vs Informal (quiz)"
          : d.activity === "tone_transformation" ? "Tone transformation"
          : d.activity || "activity";
      
        return `P4 register guide · started · ${activityLabel}`;
      }      

  
      default:
        // fallback: raw JSON string
        return JSON.stringify(d || {}, null, 2);
    }

    
  }  

  

export default function AdminActivityLog({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterEmail, setFilterEmail] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [cursorDoc, setCursorDoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    async function load() {
      setLoading(true);
      setHasMore(true);
      setCursorDoc(null);
    
      const q = query(
        collection(db, "activityLog"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
    
      const snap = await getDocs(q);
    
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    
      setLogs(arr);
    
      const last = snap.docs[snap.docs.length - 1] || null;
      setCursorDoc(last);
    
      // If we got fewer than PAGE_SIZE, there’s no more to load
      setHasMore(snap.docs.length === PAGE_SIZE);
    
      setLoading(false);
    }

    load();
  }, [user]);

  async function loadMore() {
    if (loadingMore || !hasMore || !cursorDoc) return;
  
    setLoadingMore(true);
  
    const q = query(
      collection(db, "activityLog"),
      orderBy("createdAt", "desc"),
      startAfter(cursorDoc),
      limit(PAGE_SIZE)
    );
  
    const snap = await getDocs(q);
  
    const arr = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  
    setLogs((prev) => [...prev, ...arr]);
  
    const last = snap.docs[snap.docs.length - 1] || null;
    setCursorDoc(last);
  
    setHasMore(snap.docs.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  if (!user || user.role !== "admin") {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  const filteredLogs = logs.filter((log) => {
    if (filterType !== "all" && log.type !== filterType) return false;
    if (
      filterEmail &&
      !(log.userEmail || "").toLowerCase().includes(filterEmail.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const goToProfile = (uid) => {
    navigate(`/teacher/student/${uid}`);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <button className="review-btn" onClick={() => navigate("/admin")}>
        ← Back to Admin
      </button>

      <button className="review-btn" onClick={() => navigate("/admin/activity-charts")}>
  📊 Charts
</button>

      <h1 style={{ marginTop: "0.75rem" }}>Activity log</h1>
      <p className="muted small">
  Showing {logs.length} events (loaded in batches of {PAGE_SIZE}).
</p>

      {/* Simple filters */}
      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.75rem",
          background: "#020617",
          border: "1px solid #1f2937",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span className="tiny muted">Type</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              fontSize: "0.8rem",
              padding: "0.2rem 0.4rem",
              borderRadius: "0.375rem",
              border: "1px solid #374151",
              backgroundColor: "#020617",
              color: "#e5e7eb",
            }}
          >
            <option value="all">All types</option>
            <option value="grammar_session">Grammar session</option>
            <option value="vocab_set_completed">Vocab set completed</option>
            <option value="grammar_set_completed">Grammar set completed</option>
            <option value="live_game_played">Live game played</option>
            <option value="writing_submitted">Writing submitted</option>
            <option value="speaking_note_submitted">Speaking note</option>
            <option value="reading_completed">Reading completed</option>
            <option value="reading_part3_attempted">Reading Part 3 attempt</option>
            <option value="reading_part3_completed">Reading Part 3 completed</option>
            <option value="reading_part4_attempted">Reading Part 4 attempt</option>
            <option value="reading_part4_completed">Reading Part 4 completed</option>
            <option value="listening_part1_attempted">Listening Part 1 attempt</option>
            <option value="listening_part1_completed">Listening Part 1 completed</option>
            <option value="listening_part2_attempted">Listening Part 2 attempt</option>
            <option value="listening_part2_completed">Listening Part 2 completed</option>
            <option value="listening_part3_attempted">Listening Part 3 attempt</option>
            <option value="listening_part3_completed">Listening Part 3 completed</option>  
            <option value="listening_part4_attempted">Listening Part 4 attempt</option>
            <option value="listening_part4_completed">Listening Part 4 completed</option> 
            <option value="hub_grammar_submitted">Hub grammar submitted</option>
            <option value="hub_dictation_completed">Hub dictation completed</option>
            <option value="hub_flashcards_started">Hub flashcards started</option>
            <option value="hub_spanglish_started">Hub Spanglish started</option>
            <option value="hub_spanglish_review_started">Hub Spanglish review started</option>
            <option value="hub_spanglish_completed">Hub Spanglish completed</option>
            <option value="hub_spanglish_live_hosted">Hub Spanglish live hosted</option>
            <option value="hub_spanglish_live_started">Hub Spanglish live started</option>
            <option value="hub_spanglish_live_finished">Hub Spanglish live finished</option>
            <option value="hub_spanglish_live_report_viewed">Hub Spanglish live report viewed</option>
            <option value="hub_dependent_preps_started">Hub dependent preps started</option>
            <option value="hub_dependent_preps_review_started">Hub dependent preps review started</option>
            <option value="hub_dependent_preps_completed">Hub dependent preps completed</option>
            <option value="hub_open_cloze_started">Hub open cloze started</option>
            <option value="hub_open_cloze_review_loaded">Hub open cloze review loaded</option>
            <option value="hub_open_cloze_completed">Hub open cloze completed</option>
            <option value="speaking_task_completed">Speaking task completed</option>
            <option value="vocab_flashcards_session">Vocab flashcards</option>
            <option value="vocab_match_session">Vocab match</option>
            <option value="writing_p1_guide_activity_started">Writing P1 guide started</option>
            <option value="writing_p4_register_guide_activity_started">Writing P4 register guide activity started</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span className="tiny muted">User email</span>
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="filter by email"
            style={{
              fontSize: "0.8rem",
              padding: "0.2rem 0.4rem",
              borderRadius: "0.375rem",
              border: "1px solid #374151",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              minWidth: "10rem",
            }}
          />
        </div>
      </div>

      {loading && <p>Loading activity…</p>}

      {!loading && (
  <>
    <div style={{ marginTop: "1rem", overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.9rem",
          minWidth: 650,
        }}
      >
            <thead>
              <tr>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  When
                </th>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  User
                </th>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  Type
                </th>
                <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderTop: "1px solid #1f2937",
                    verticalAlign: "top",
                  }}
                >
                  <td style={{ padding: "0.35rem 0.25rem", whiteSpace: "nowrap" }}>
                    {log.createdAt?.toDate
                      ? log.createdAt.toDate().toLocaleString()
                      : "—"}
                  </td>
                  <td style={{ padding: "0.35rem 0.25rem" }}>
                    <button
                      type="button"
                      onClick={() => goToProfile(log.userId)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        color: "inherit",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      {log.userEmail || log.userId}
                    </button>
                  </td>
                  {/* Type */}
<td style={{ padding: "0.35rem 0.25rem" }}>
  <span className="badge subtle small">
    {typeLabels[log.type] || log.type}
  </span>
</td>

<td style={{ padding: "0.35rem 0.25rem" }}>
  {(() => {
    const text = formatDetails(log) || "";
    const isMultiline = typeof text === "string" && text.includes("\n");

    return isMultiline ? (
      <pre
        style={{
          margin: 0,
          fontSize: "0.75rem",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          opacity: 0.85,
        }}
      >
        {text}
      </pre>
    ) : (
      <span className="tiny" style={{ fontSize: "0.8rem", opacity: 0.9 }}>
        {text}
      </span>
    );
  })()}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
{/* ✅ PASTE THE LOAD MORE BLOCK HERE */}
<div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
<button
  className="review-btn"
  onClick={loadMore}
  disabled={!hasMore || loadingMore}
  style={{ opacity: !hasMore ? 0.6 : 1 }}
>
  {loadingMore ? "Loading…" : hasMore ? `Load ${PAGE_SIZE} more` : "No more results"}
</button>

<span className="muted small">
  {hasMore ? "More results available." : "You’ve reached the end."}
</span>
</div>
</>
)}

    </div>
  );
}
