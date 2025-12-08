// src/components/common/TeacherExtrasButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import teacherIcon from "/images/ui/teacher-hat.png"; 
// ^ adjust path to match where you place the PNG

export default function TeacherExtrasButton({
  user,
  to,
  label = "Teacher activities"
}) {
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return null; // students never see it
  }

  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="btn teacher-extras-btn"
      onClick={() => navigate(to)}
    >
      <img
        src={teacherIcon}
        alt=""
        aria-hidden="true"
        className="teacher-icon"
      />
      <span>{label}</span>
    </button>
  );
}
