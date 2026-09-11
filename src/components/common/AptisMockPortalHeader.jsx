import React from "react";
import { House } from "lucide-react";
import UserAvatar from "./UserAvatar.jsx";

export default function AptisMockPortalHeader({ user, onHome, onProfile }) {
  return (
    <header className="aptis-mock-portal-header">
      <img
        src="/images/seif-trainer-logo.png"
        alt="Seif English"
        className="aptis-mock-portal-logo"
        draggable="false"
      />
      <nav aria-label="Mock navigation">
        <button type="button" onClick={onHome} className="aptis-mock-home-button">
          <House size={19} aria-hidden="true" />
          Home
        </button>
        <button
          type="button"
          onClick={onProfile}
          className="aptis-mock-profile-button"
          aria-label="Open profile"
          title={user?.email || "My profile"}
        >
          <UserAvatar user={user} size="md" />
        </button>
      </nav>
    </header>
  );
}
