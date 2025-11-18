// src/components/teacher/TeacherTools.jsx
import React from "react";
import TeacherGrammarTool from "./TeacherGrammarTool";
import TeacherGrammarSetResults from "./TeacherGrammarSetResults";

export default function TeacherTools({ user }) {
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2 className="sec-title">Teacher Tools</h2>
        <p className="muted">Sorry, you are not authorised to access this section.</p>
      </div>
    );
  }

  return (
    <>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <h1 className="sec-title">Teacher Tools</h1>
        <p className="muted small" style={{ marginBottom: "1rem" }}>
          Welcome, <strong>{user.email}</strong> ({user.role}). You can build and
          manage custom content here.
        </p>
      </div>

      {/* 🔹 Grammar Set Builder */}
      <TeacherGrammarTool user={user} />

      {/* 🔹 My sets + student results */}
      <TeacherGrammarSetResults user={user} />
    </>
  );
}
