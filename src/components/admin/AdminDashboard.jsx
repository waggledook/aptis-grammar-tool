// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null); // studentId currently updating
  const [isNarrow, setIsNarrow] = useState(false); // mobile breakpoint

  // NEW: sorting + filtering
  const [sortBy, setSortBy] = useState("email"); // "email" | "role" | "teacher"
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"
  const [teacherFilter, setTeacherFilter] = useState("all"); // "all" | "no-teacher" | "has-teacher" | teacherId

  const navigate = useNavigate();

  // Responsive breakpoint watcher
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsNarrow(window.innerWidth < 720);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadUsers() {
      const colRef = collection(db, "users");
      const snap = await getDocs(colRef);

      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setUsers(arr);
      setLoading(false);
    }

    loadUsers();
  }, []);

  async function updateRole(uid, role) {
    await updateDoc(doc(db, "users", uid), { role });

    setUsers((prev) =>
      prev.map((u) => (u.id === uid ? { ...u, role } : u))
    );
  }

  // assign / clear a teacher for a student
  async function assignTeacher(studentId, teacherId) {
    try {
      setAssigning(studentId);

      const payload =
        teacherId === "" ? { teacherId: null } : { teacherId };

      await updateDoc(doc(db, "users", studentId), payload);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === studentId ? { ...u, teacherId: teacherId || null } : u
        )
      );
    } finally {
      setAssigning(null);
    }
  }

  if (!user || user.role !== "admin") {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  // Teachers = users who can appear in the dropdown
  const teachers = users.filter(
    (u) => u.role === "teacher" || u.role === "admin" // admins can also be teachers
  );

  const labelForTeacher = (t) =>
    t.displayName || t.name || t.username || t.email || t.id;

  const renderTeacherControl = (u) => {
    const isStudent = u.role === "student";
    const currentTeacher =
      teachers.find((t) => t.id === u.teacherId) || null;

    if (isStudent) {
      return (
        <select
          value={u.teacherId || ""}
          onChange={(e) => assignTeacher(u.id, e.target.value)}
          disabled={assigning === u.id}
          style={{
            fontSize: "0.8rem",
            padding: "0.2rem 0.4rem",
            borderRadius: "0.375rem",
            border: "1px solid #374151",
            backgroundColor: "#020617",
            color: "#e5e7eb",
            minWidth: "8.5rem",
            maxWidth: "13rem",
          }}
        >
          <option value="">
            {teachers.length ? "— No teacher —" : "No teachers yet"}
          </option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {labelForTeacher(t)}
            </option>
          ))}
        </select>
      );
    }

    if (currentTeacher) {
      return (
        <span className="tiny muted">
          Teacher: {labelForTeacher(currentTeacher)}
        </span>
      );
    }

    return <span className="tiny muted">—</span>;
  };

  const renderRoleButtons = (u) => (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.35rem",
        flexWrap: "wrap",
      }}
    >
      {u.role !== "teacher" && (
        <button
          className="review-btn"
          onClick={() => updateRole(u.id, "teacher")}
          style={{
            fontSize: "0.8rem",
            padding: "0.25rem 0.6rem",
          }}
        >
          Make Teacher
        </button>
      )}

      {u.role !== "student" && (
        <button
          className="ghost-btn"
          onClick={() => updateRole(u.id, "student")}
          style={{
            marginLeft: 0,
            fontSize: "0.8rem",
            padding: "0.25rem 0.6rem",
          }}
        >
          Make Student
        </button>
      )}

      {u.role !== "admin" && (
        <button
          className="generate-btn"
          onClick={() => updateRole(u.id, "admin")}
          style={{
            marginLeft: 0,
            fontSize: "0.8rem",
            padding: "0.25rem 0.6rem",
          }}
        >
          Make Admin
        </button>
      )}
    </div>
  );

  // NEW: helper for sorting
  const primaryLabel = (u) =>
    (u.email || u.username || u.id || "").toLowerCase();

  const teacherLabelForStudent = (u) => {
    if (!u.teacherId) return "";
    const t = teachers.find((t) => t.id === u.teacherId);
    return t ? labelForTeacher(t).toLowerCase() : "";
  };

  // NEW: filter by teacher / assignment
  let filtered = users;
  if (teacherFilter === "no-teacher") {
    filtered = users.filter((u) => u.role === "student" && !u.teacherId);
  } else if (teacherFilter === "has-teacher") {
    filtered = users.filter((u) => u.role === "student" && !!u.teacherId);
  } else if (teacherFilter !== "all") {
    // specific teacher id
    filtered = users.filter(
      (u) => u.role === "student" && u.teacherId === teacherFilter
    );
  }

  // NEW: sort the filtered list
  const displayedUsers = [...filtered].sort((a, b) => {
    let aKey = "";
    let bKey = "";

    if (sortBy === "email") {
      aKey = primaryLabel(a);
      bKey = primaryLabel(b);
    } else if (sortBy === "role") {
      aKey = (a.role || "").toLowerCase();
      bKey = (b.role || "").toLowerCase();
    } else if (sortBy === "teacher") {
      aKey = teacherLabelForStudent(a);
      bKey = teacherLabelForStudent(b);
    }

    if (aKey < bKey) return sortDir === "asc" ? -1 : 1;
    if (aKey > bKey) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // NEW: quick profile navigation
  const goToProfile = (uid) => {
    navigate(`/teacher/student/${uid}`);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <button className="review-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
  
        <button
          className="ghost-btn"
          style={{ fontSize: "0.85rem", padding: "0.25rem 0.6rem" }}
          onClick={() => navigate("/admin/activity")}
        >
          View activity log
        </button>
      </div>
  
      <h1 style={{ marginTop: "0.75rem" }}>Admin Dashboard</h1>
      <p className="muted small">Signed in as: {user.email}</p>

      {loading && <p>Loading users…</p>}

      {!loading && (
        <>
          {/* NEW: toolbar for sorting + filtering */}
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
              <span className="tiny muted">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.2rem 0.4rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #374151",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                }}
              >
                <option value="email">Email / Username</option>
                <option value="role">Role</option>
                <option value="teacher">Teacher</option>
              </select>

              <button
                type="button"
                className="ghost-btn"
                style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
                onClick={() =>
                  setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <span className="tiny muted">Filter</span>
              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.2rem 0.4rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #374151",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                  minWidth: "11rem",
                }}
              >
                <option value="all">All users</option>
                <option value="no-teacher">Students with no teacher</option>
                <option value="has-teacher">Students with any teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    Students of {labelForTeacher(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MOBILE: card layout */}
          {isNarrow && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "1rem",
              }}
            >
              {displayedUsers.map((u) => (
                <div
                  key={u.id}
                  className="panel"
                  style={{
                    padding: "0.6rem 0.75rem",
                    borderRadius: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.15rem",
                      }}
                    >
                      <span style={{ fontSize: "0.9rem" }}>
                        {u.email || (
                          <span
                            style={{
                              opacity: 0.7,
                              fontSize: "0.85rem",
                            }}
                          >
                            (no email) {u.id}
                          </span>
                        )}
                      </span>
                      {u.username && (
                        <span
                          style={{
                            fontSize: "0.78rem",
                            opacity: 0.75,
                          }}
                        >
                          @{u.username}
                        </span>
                      )}
                    </div>
                    <span className="badge subtle small">{u.role}</span>
                  </div>

                  <div
                    style={{
                      marginTop: "0.4rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    {renderTeacherControl(u)}

                    <button
                      className="ghost-btn"
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.25rem 0.6rem",
                        alignSelf: "flex-start",
                      }}
                      onClick={() => goToProfile(u.id)}
                    >
                      View profile
                    </button>

                    {renderRoleButtons(u)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DESKTOP: table layout */}
          {!isNarrow && (
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
                      Email / Username
                    </th>
                    <th align="left" style={{ padding: "0.4rem 0.25rem" }}>
                      Role &amp; Teacher
                    </th>
                    <th align="right" style={{ padding: "0.4rem 0.25rem" }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {displayedUsers.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        borderTop: "1px solid #1f2937",
                        verticalAlign: "middle",
                      }}
                    >
                      {/* Email / username */}
                      <td style={{ padding: "0.35rem 0.25rem" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.15rem",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => goToProfile(u.id)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              margin: 0,
                              color: "inherit",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            {u.email || (
                              <span
                                style={{
                                  opacity: 0.7,
                                  fontSize: "0.85rem",
                                }}
                              >
                                (no email) {u.id}
                              </span>
                            )}
                          </button>
                          {u.username && (
                            <span
                              style={{
                                fontSize: "0.78rem",
                                opacity: 0.75,
                              }}
                            >
                              @{u.username}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role + teacher, stacked */}
                      <td style={{ padding: "0.35rem 0.25rem" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                            alignItems: "flex-start",
                          }}
                        >
                          <span className="badge subtle small">
                            {u.role}
                          </span>
                          {renderTeacherControl(u)}
                        </div>
                      </td>

                      {/* Role actions */}
                      <td
                        style={{
                          textAlign: "right",
                          padding: "0.35rem 0.25rem",
                        }}
                      >
                        {renderRoleButtons(u)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
