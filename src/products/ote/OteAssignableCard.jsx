import React from "react";
import OteAssignButton from "./OteAssignButton.jsx";

export default function OteAssignableCard({
  user,
  item,
  className,
  disabled = false,
  onClick,
  children,
}) {
  return (
    <div className="ote-assignable-card">
      <button
        className={className}
        type="button"
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
      <OteAssignButton user={user} item={item} className="ote-assign-btn ote-assign-card-btn" />
    </div>
  );
}
