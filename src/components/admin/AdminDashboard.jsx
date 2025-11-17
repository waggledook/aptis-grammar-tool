// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (!user || user.role !== "admin") {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <button className="review-btn" onClick={() => navigate("/")}>
        ← Back
      </button>

      <h1>Admin Dashboard</h1>
      <p>Signed in as: {user.email}</p>

      {loading && <p>Loading users…</p>}

      {!loading && (
        <table style={{ width: "100%", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th align="left">Email</th>
              <th>Role</th>
              <th align="right">Actions</th>
            </tr>
          </thead>

          <tbody>
  {users.map((u) => (
    <tr key={u.id}>
      <td>
        {u.email || (
          <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
            (no email) {u.id}
          </span>
        )}
      </td>
      <td style={{ textAlign: "center" }}>{u.role}</td>

                <td style={{ textAlign: "right" }}>
                  {u.role !== "teacher" && (
                    <button
                      className="review-btn"
                      onClick={() => updateRole(u.id, "teacher")}
                    >
                      Make Teacher
                    </button>
                  )}

                  {u.role !== "student" && (
                    <button
                      className="ghost-btn"
                      onClick={() => updateRole(u.id, "student")}
                      style={{ marginLeft: 6 }}
                    >
                      Make Student
                    </button>
                  )}

                  {u.role !== "admin" && (
                    <button
                      className="generate-btn"
                      onClick={() => updateRole(u.id, "admin")}
                      style={{ marginLeft: 6 }}
                    >
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
