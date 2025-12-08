// src/components/common/RequireTeacher.jsx
import React from "react";

export default function RequireTeacher({ user, children }) {
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return (
      <div className="game-wrapper speaking-guide">
        <div className="panel">
          <h2 className="title">Teacher resources</h2>
          <p className="panel-text">
            Sorry, you&apos;re not authorised to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
