// src/components/common/TeacherExtrasButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherExtrasButton({ user, to, label = "Teacher activities" }) {
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return null; // students never see it
  }

  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="btn"
      onClick={() => navigate(to)}
    >
      {label}
    </button>
  );
}
