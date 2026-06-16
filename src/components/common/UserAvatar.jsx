import React from "react";

function getAvatarLabel(profile = {}) {
  return (
    profile.displayName ||
    profile.name ||
    profile.username ||
    profile.email ||
    profile.userEmail ||
    profile.studentLabel ||
    profile.teacherName ||
    profile.teacherEmail ||
    "User"
  );
}

export default function UserAvatar({
  user,
  label,
  photoURL,
  size = "md",
  className = "",
  title,
}) {
  const profile = user || {};
  const resolvedLabel = label || getAvatarLabel(profile);
  const resolvedPhotoURL = photoURL || profile.photoURL || "";
  const initial = ((resolvedLabel || "U")[0] || "U").toUpperCase();
  const classes = ["user-avatar", `user-avatar--${size}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes} title={title || resolvedLabel} aria-label={resolvedLabel}>
      {resolvedPhotoURL ? <img src={resolvedPhotoURL} alt="" /> : <span>{initial}</span>}
    </span>
  );
}
