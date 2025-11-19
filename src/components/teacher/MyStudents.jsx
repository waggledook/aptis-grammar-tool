// src/components/teacher/MyStudents.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function MyStudents({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptStats, setAttemptStats] = useState({}); // studentUid -> {count, avgPercent}
  const navigate = useNavigate();

  // Guard
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return <p>⛔ Only teachers and admins can view this page.</p>;
  }

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) Load students assigned to this teacher
      const usersCol = collection(db, "users");
      const qStudents = query(usersCol, where("teacherId", "==", user.uid));
      const snapStudents = await getDocs(qStudents);

      const studentsArr = snapStudents.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setStudents(studentsArr);

      // 2) Load grammar set attempts for sets OWNED by this teacher
      //    so we can compute per-student stats.
      const attemptsCol = collection(db, "grammarSetAttempts");
      const qAttempts = query(attemptsCol, where("ownerUid", "==", user.uid));
      const snapAttempts = await getDocs(qAttempts);

      const stats = {};
      snapAttempts.forEach((doc) => {
        const data = doc.data() || {};
        const sid = data.studentUid;
        if (!sid) return;

        if (!stats[sid]) {
          stats[sid] = { count: 0, totalPercent: 0 };
        }
        stats[sid].count += 1;
        stats[sid].totalPercent += data.percent ?? 0;
      });

      // Convert totalPercent → avgPercent
      Object.keys(stats).forEach((sid) => {
        const { count, totalPercent } = stats[sid];
        stats[sid].avgPercent =
          count > 0 ? Math.round(totalPercent / count) : 0;
      });

      setAttemptStats(stats);
      setLoading(false);
    }

    load().catch((err) => {
      console.error("Error loading students:", err);
      setLoading(false);
    });
  }, [user.uid]);

  const labelForStudent = (s) =>
    s.displayName || s.name || s.username || s.email || s.id;

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <button className="review-btn" onClick={() => navigate("/")}>
        ← Back
      </button>

      <h1 style={{ marginTop: "0.75rem" }}>My students</h1>
      <p className="muted small">
        Showing learners who have been linked to you as their teacher.
      </p>

      {loading && <p>Loading students…</p>}

      {!loading && students.length === 0 && (
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          No students are linked to you yet. An admin can assign students to
          you from the Admin Dashboard.
        </p>
      )}

      {!loading && students.length > 0 && (
        <table
          style={{
            width: "100%",
            marginTop: "1rem",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                Student
              </th>
              <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                Email
              </th>
              <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                Grammar sets
              </th>
              <th align="right" style={{ padding: "0.4rem 0.25rem" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => {
              const stat = attemptStats[s.id] || { count: 0, avgPercent: null };

              return (
                <tr
                  key={s.id}
                  style={{
                    borderTop: "1px solid #1f2937",
                    verticalAlign: "middle",
                  }}
                >
                  {/* Name / username */}
                  <td style={{ padding: "0.35rem 0.25rem" }}>
                    <div>{labelForStudent(s)}</div>
                    {s.username && (
                      <div
                        style={{
                          fontSize: "0.78rem",
                          opacity: 0.75,
                          marginTop: "0.1rem",
                        }}
                      >
                        @{s.username}
                      </div>
                    )}
                  </td>

                  {/* Email */}
                  <td style={{ padding: "0.35rem 0.25rem" }}>
                    <span className="tiny">{s.email || "—"}</span>
                  </td>

                  {/* Grammar set stats */}
                  <td style={{ padding: "0.35rem 0.25rem" }}>
                    {stat.count === 0 ? (
                      <span className="tiny muted">No attempts yet</span>
                    ) : (
                      <span className="tiny">
                        {stat.count} attempt
                        {stat.count === 1 ? "" : "s"}
                        {stat.avgPercent != null && (
                          <> • avg {stat.avgPercent}%</>
                        )}
                      </span>
                    )}
                  </td>

                  {/* Actions – future-proof */}
                  <td
                    style={{
                      textAlign: "right",
                      padding: "0.35rem 0.25rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      type="button"
                      className="ghost-btn"
                      style={{ fontSize: "0.8rem" }}
                      onClick={() =>
                        navigate(`/teacher/student/${s.id}`)
                        }
                    >
                      View details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
