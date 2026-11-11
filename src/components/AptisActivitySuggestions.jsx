import React, { useEffect, useState } from "react";
import { ArrowRight, Shuffle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chooseAptisActivitySuggestion, getAptisActivitySuggestions } from "./aptisActivitySuggestions.js";
import "./aptisActivitySuggestions.css";

function readSeenSuggestions(storageKey) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export default function AptisActivitySuggestions({ isDemoMode, userId = "guest" }) {
  const navigate = useNavigate();
  const suggestions = getAptisActivitySuggestions(isDemoMode);
  const storageKey = `aptis-activity-suggestions:${userId}:${isDemoMode ? "demo" : "full"}`;
  const [suggestionId, setSuggestionId] = useState(() => (
    chooseAptisActivitySuggestion(suggestions, readSeenSuggestions(storageKey)).id
  ));
  const suggestion = suggestions.find((item) => item.id === suggestionId) || suggestions[0];

  useEffect(() => {
    const seen = readSeenSuggestions(storageKey);
    // Start a fresh round after every available idea has been shown.
    const nextSeen = suggestions.every((item) => seen.includes(item.id)) ? [] : seen;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify([...new Set([...nextSeen, suggestion.id])]));
    } catch {
      // Suggestions still work when browser storage is unavailable.
    }
  }, [storageKey, suggestion.id, suggestions]);

  function showAnotherSuggestion() {
    setSuggestionId(chooseAptisActivitySuggestion(
      suggestions,
      readSeenSuggestions(storageKey),
      suggestion.id,
    ).id);
  }

  return (
    <section className="whats-new-banner aptis-suggestion-banner" aria-labelledby="aptis-suggestion-title">
      <div className="whats-new-copy" aria-live="polite" aria-atomic="true">
        <div className="aptis-suggestion-labels">
          <span className="whats-new-label">Why don’t you try…?</span>
          <span className="aptis-suggestion-skill">{suggestion.skill}</span>
        </div>
        <h3 id="aptis-suggestion-title">{suggestion.title}</h3>
        <p>{suggestion.copy}</p>
      </div>

      <div className="aptis-suggestion-actions">
        <button className="whats-new-btn" type="button" onClick={() => navigate(suggestion.path)}>
          Try this activity <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button className="aptis-suggestion-another" type="button" onClick={showAnotherSuggestion}>
          <Shuffle size={16} aria-hidden="true" /> Show another idea
        </button>
      </div>
    </section>
  );
}
