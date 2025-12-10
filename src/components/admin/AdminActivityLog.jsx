// src/components/admin/AdminActivityLog.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    async function load() {
      const q = query(
        collection(db, "activityLog"),
        orderBy("createdAt", "desc"),
        limit(200)
      );
      const snap = await getDocs(q);

      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setLogs(arr);
      setLoading(false);
    }

    load();
  }, [user]);

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

      <h1 style={{ marginTop: "0.75rem" }}>Activity log</h1>
      <p className="muted small">
        Last {logs.length} events (e.g. grammar sessions, vocab sets, etc.).
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
            <option value="speaking_task_completed">Speaking task completed</option>
            <option value="vocab_flashcards_session">Vocab flashcards</option>
            <option value="vocab_match_session">Vocab match</option>
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

{/* Details */}
<td style={{ padding: "0.35rem 0.25rem" }}>
{log.type === "grammar_session" ||
 log.type === "vocab_set_completed" ||
 log.type === "vocab_flashcards_session" ||
 log.type === "vocab_match_session" ||
 log.type === "speaking_task_completed" ||
 log.type === "speaking_note_submitted" ? (
    <span
      className="tiny"
      style={{ fontSize: "0.8rem", opacity: 0.9 }}
    >
      {formatDetails(log)}
    </span>
  ) : (
    <pre
      style={{
        margin: 0,
        fontSize: "0.75rem",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        opacity: 0.85,
      }}
    >
      {formatDetails(log)}
    </pre>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
