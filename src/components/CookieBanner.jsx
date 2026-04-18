// src/components/CookieBanner.jsx
import React, { useEffect, useState } from "react";
import { enableAnalytics } from "../firebase";

export const CONSENT_KEY = "cookie-consent"; // 'accepted' | 'rejected'
const COOKIE_OPEN_EVENT = "cookie-consent:open";
const COOKIE_CHANGED_EVENT = "cookie-consent:changed";

export function getCookieConsent() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CONSENT_KEY) || "";
}

export function openCookieBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COOKIE_OPEN_EVENT));
}

function setCookieConsent(value) {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(CONSENT_KEY, value);
  } else {
    window.localStorage.removeItem(CONSENT_KEY);
  }

  window.dispatchEvent(
    new CustomEvent(COOKIE_CHANGED_EVENT, {
      detail: { value: value || "" },
    })
  );
}

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = getCookieConsent();

    if (stored === "accepted") {
      // User already accepted in the past → enable analytics silently
      enableAnalytics();
      setShow(false);
    } else if (stored === "rejected") {
      // Explicitly rejected in the past → do nothing, don’t show banner
      setShow(false);
    } else {
      // No choice saved yet → show banner
      setShow(true);
    }

    const handleOpen = () => setShow(true);

    window.addEventListener(COOKIE_OPEN_EVENT, handleOpen);
    return () => {
      window.removeEventListener(COOKIE_OPEN_EVENT, handleOpen);
    };
  }, []);

  const handleAccept = () => {
    setCookieConsent("accepted");
    enableAnalytics();
    setShow(false);
  };

  const handleReject = () => {
    setCookieConsent("rejected");
    // Do NOT call enableAnalytics()
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={bannerStyle}>
      <div style={{ marginBottom: "0.5rem" }}>
        This site uses analytics cookies (Google Analytics) to understand how
        people use the app. You can accept or reject these cookies.
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" style={btnAccept} onClick={handleAccept}>
          Accept analytics cookies
        </button>
        <button type="button" style={btnReject} onClick={handleReject}>
          Reject
        </button>
      </div>
    </div>
  );
}

const bannerStyle = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  padding: "0.75rem 1rem",
  background: "rgba(10, 13, 30, 0.96)", // dark overlay-ish
  color: "#fff",
  fontSize: "0.9rem",
  zIndex: 9999,
  textAlign: "center",
};

const btnBase = {
  padding: "0.45rem 0.9rem",
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const btnAccept = {
  ...btnBase,
  background: "#f4b400", // Gold-ish; tweak to match your palette
  color: "#111",
  fontWeight: 600,
};

const btnReject = {
  ...btnBase,
  background: "#555",
  color: "#fff",
};
