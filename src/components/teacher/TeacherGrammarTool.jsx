// src/components/teacher/TeacherGrammarTool.jsx
import React, { useMemo, useState } from "react";
import useTags from "../../hooks/useTags";
import FilterPanel from "../FilterPanel";
import { createGrammarSet } from "../../firebase";
// ✅ Use the full, up-to-date bank from /scripts
import allItems from "../../../scripts/grammar-items.json";
import { toast } from "../../utils/toast";


// Normalise tag(s) so we can handle both "tag" and "tags"
const getItemTags = (item) => {
    if (Array.isArray(item.tags) && item.tags.length) return item.tags;
    if (item.tag) return [item.tag];
    return [];
  };

const ALL_LEVELS = ["A2", "B1", "B2", "C1"]; // match main tool

export default function TeacherGrammarTool({ user }) {
  const [levels, setLevels] = useState([...ALL_LEVELS]);
  const [tag, setTag] = useState("");
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // NEW: test mode flags
  const [testMode, setTestMode] = useState(false);
  const [reviewAfterTest, setReviewAfterTest] = useState(false);

  const { tags: allTags = [], loading: tagsLoading, error: tagsError } = useTags();


  const showModeHelp = (mode) => {
    let msg = "";
  
    switch (mode) {
      case "practice":
        msg =
          "Practice: Students see instant feedback for each question (correct/incorrect and explanations) while doing the set.";
        break;
      case "testScore":
        msg =
          "Test – score only: Students do NOT see feedback while answering. When they finish, they only see their total score, not corrections.";
        break;
      case "testReview":
        msg =
          "Test + review: Students do NOT see feedback while answering. When they finish, they see their score AND a full review with correct answers.";
        break;
      default:
        msg =
          "Choose how feedback works: Practice (instant feedback), Test – score only, or Test + review.";
    }
  
    toast(msg, { duration: 6500 });
  };  
  // ---------- Helpers ----------
  const toggleSelect = (id) => {
    setSelectedIds((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]
    );
  };

  const moveItem = (id, direction) => {
    setSelectedIds((curr) => {
      const idx = curr.indexOf(id);
      if (idx === -1) return curr;

      const newIndex = idx + direction;
      if (newIndex < 0 || newIndex >= curr.length) return curr;

      const copy = [...curr];
      const [removed] = copy.splice(idx, 1);
      copy.splice(newIndex, 0, removed);
      return copy;
    });
  };

  const clearSet = () => {
    if (window.confirm("Remove all selected items from this set?")) {
      setSelectedIds([]);
    }
  };

  // ---------- Filtered browser list ----------
  const filteredItems = useMemo(() => {
    const activeLevels = levels.length ? levels : ALL_LEVELS;
    const lowerSearch = search.trim().toLowerCase();
  
    const filtered = allItems.filter((item) => {
      const itemLevel = item.level || "B1";
      const sentence = (item.sentence || item.text || "").toLowerCase();
      const tagsArr = getItemTags(item);
  
      if (!activeLevels.includes(itemLevel)) return false;
      if (tag && !tagsArr.includes(tag)) return false;
      if (lowerSearch && !sentence.includes(lowerSearch)) return false;
  
      return true;
    });
  
    // 🔀 Randomise display order so teachers don’t always see the same items first
    return [...filtered].sort(() => Math.random() - 0.5);
  }, [levels, tag, search]);
  

  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => allItems.find((i) => i.id === id))
        .filter(Boolean),
    [selectedIds]
  );

  const metaLevels = Array.from(
    new Set(selectedItems.map((i) => i.level).filter(Boolean))
  );
  const metaTags = Array.from(
    new Set(
      selectedItems
        .flatMap((i) => getItemTags(i))
        .filter(Boolean)
    )
  );
  

  // ---------- Saving ----------
  const handleSave = async (visibility) => {
    setStatusMsg("");
    if (!title.trim()) {
      setStatusMsg("Please add a title before saving.");
      return;
    }
    if (!selectedIds.length) {
      setStatusMsg("Please select at least one item for this set.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        itemIds: selectedIds,
        levels: metaLevels,
        tags: metaTags,
        visibility,     // "draft" | "published"
        testMode,       // NEW
        reviewAfterTest // NEW
      };

      const id = await createGrammarSet(payload);

      setStatusMsg(
        visibility === "published"
          ? `Set published ✔ (ID: ${id}). You can now share the link: /grammar-sets/${id}`
          : `Set saved as draft ✔ (ID: ${id}).`
      );
    } catch (err) {
      console.error(err);
      setStatusMsg("Error saving set. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2 className="sec-title">Teacher Grammar Set Builder</h2>
        <p className="muted">You are not authorised to use teacher tools.</p>
      </div>
    );
  }

  return (
    <section className="panel" style={{ marginTop: "1rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "baseline",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 className="sec-title" style={{ marginBottom: ".25rem" }}>
            Teacher Grammar Set Builder
          </h2>
          <p className="muted small">
            Preview questions in the same style as the grammar trainer, choose
            the ones you want, and save them as a custom set.
          </p>
        </div>

        <p className="small muted" style={{ marginLeft: "auto" }}>
          Logged in as <strong>{user.email}</strong> ({user.role})
        </p>
      </header>

      {/* 🔹 STACKED LAYOUT: 2) Build your set, 1) Browse items */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* TOP: CURRENT SET (full width) */}
        <div className="panel">
          <h3 className="sec-title" style={{ marginBottom: ".5rem" }}>
            1. Build your set
          </h3>

          {/* Title & description */}
          <div style={{ marginBottom: ".75rem" }}>
            <label className="small muted" htmlFor="set-title">
              Set title
            </label>
            <input
              id="set-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. B2 Conditionals – Homework 1"
              style={{
                width: "100%",
                marginTop: ".25rem",
                marginBottom: ".5rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.375rem",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: "0.9rem",
              }}
            />

            <label className="small muted" htmlFor="set-description">
              Description (optional)
            </label>
            <textarea
              id="set-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short note for students, e.g. 'Focus on past modals. Do this before Friday.'"
              style={{
                width: "100%",
                marginTop: ".25rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.375rem",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: "0.9rem",
                resize: "vertical",
              }}
            />
          </div>

          {/* Meta chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: ".25rem .5rem",
              marginBottom: ".5rem",
            }}
          >
            {metaLevels.length > 0 && (
              <span className="badge">
                Levels: {metaLevels.join(", ")}
              </span>
            )}
            {metaTags.length > 0 && (
              <span className="badge subtle">
                Tags: {metaTags.join(", ")}
              </span>
            )}
            <span className="badge subtle">
              Selected: {selectedIds.length} item
              {selectedIds.length === 1 ? "" : "s"}
            </span>
          </div>

                    {/* 🔹 Mode selector – compact, with per-mode help */}
<div
  style={{
    margin: ".35rem 0 .75rem 0",
    display: "flex",
    flexDirection: "column",
    gap: ".4rem",
  }}
>
  <span className="small muted">Mode for this set:</span>

  <div
    style={{
      display: "flex",
      gap: ".5rem",
      flexWrap: "wrap",
    }}
  >
    {/* PRACTICE */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: ".2rem",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setTestMode(false);
          setReviewAfterTest(false);
        }}
        className="option-btn"
        style={{
          fontSize: "0.8rem",
          padding: "0.28rem .85rem",
          borderRadius: "999px",
          background: !testMode ? "#0f172a" : "transparent",
          borderColor: !testMode ? "#38bdf8" : "#334155",
          color: !testMode ? "#e0f7ff" : "#cbd5e1",
          fontWeight: 600,
        }}
      >
        Practice
      </button>

      {/* Help for Practice */}
      <button
        type="button"
        onClick={() => showModeHelp("practice")}
        style={{
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "999px",
          border: "1px solid #4b5563",
          background: "transparent",
          color: "#9ca3af",
          fontSize: "0.9rem",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="What does Practice mode do?"
      >
        ?
      </button>
    </div>

    {/* TEST – SCORE ONLY */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: ".2rem",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setTestMode(true);
          setReviewAfterTest(false);
        }}
        className="option-btn"
        style={{
          fontSize: "0.8rem",
          padding: "0.28rem .85rem",
          borderRadius: "999px",
          background: testMode && !reviewAfterTest ? "#1e1b07" : "transparent",
          borderColor: testMode && !reviewAfterTest ? "#fbbf24" : "#334155",
          color: testMode && !reviewAfterTest ? "#fef9c3" : "#cbd5e1",
          fontWeight: 600,
        }}
      >
        Test – score only
      </button>

      {/* Help for Test – score only */}
      <button
        type="button"
        onClick={() => showModeHelp("testScore")}
        style={{
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "999px",
          border: "1px solid #4b5563",
          background: "transparent",
          color: "#9ca3af",
          fontSize: "0.9rem",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="What does this mode do?"
      >
        ?
      </button>
    </div>

    {/* TEST + REVIEW */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: ".2rem",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setTestMode(true);
          setReviewAfterTest(true);
        }}
        className="option-btn"
        style={{
          fontSize: "0.8rem",
          padding: "0.28rem .85rem",
          borderRadius: "999px",
          background: testMode && reviewAfterTest ? "#064e3b" : "transparent",
          borderColor: testMode && reviewAfterTest ? "#22c55e" : "#334155",
          color: testMode && reviewAfterTest ? "#d1fae5" : "#cbd5e1",
          fontWeight: 600,
        }}
      >
        Test + review
      </button>

      {/* Help for Test + review */}
      <button
        type="button"
        onClick={() => showModeHelp("testReview")}
        style={{
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "999px",
          border: "1px solid #4b5563",
          background: "transparent",
          color: "#9ca3af",
          fontSize: "0.9rem",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="What does this mode do?"
      >
        ?
      </button>
    </div>
  </div>
</div>


                              {/* Selected items list */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: ".35rem",
  }}
>
  <span className="small muted">
    Selected items (order of questions)
  </span>
  {selectedItems.length > 0 && (
    <span className="tiny muted">
      {selectedItems.length} item
      {selectedItems.length === 1 ? "" : "s"}
    </span>
  )}
</div>

          <div
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              borderRadius: "0.75rem",
              border: "1px solid #1f2937",
              padding: ".5rem .6rem",
              background: "#020617",
            }}
          >
            {!selectedItems.length ? (
              <p className="muted small" style={{ padding: ".25rem" }}>
                No items selected yet. Use the browser below to add questions to
                this set.
              </p>
            ) : (
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: ".6rem",
                  fontSize: "0.85rem",
                }}
              >
                {selectedItems.map((item, index) => {
                  const sentence = item.sentence || item.text || "";
                  const [before, after] = sentence.split("___");
                  const level = item.level || "B1";
                  const tagLabel = getItemTags(item)[0] || "—";

                  return (
                    <li key={item.id}>
                      <div
                        className="card gapfill-card"
                        style={{
                          padding: ".65rem .8rem",
                        }}
                      >
                        {/* Compact header: level + tag + item number + controls */}
                        <div
                          className="card-header"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: ".35rem",
                            gap: ".75rem",
                          }}
                        >
                          {/* Left: meta info */}
                          <div
                            style={{
                              display: "flex",
                              gap: ".4rem",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
  className={`cefr-badge cefr-${level}`}
  style={{
    position: "static",   // ⬅️ stop it from floating in the corner
    marginLeft: 0,
  }}
>
  {level}
</span>
<span className="badge tiny subtle">{tagLabel}</span>
<span className="tiny muted">Item {index + 1}</span>
                          </div>
                  
                          {/* Right: controls */}
                          <div
                            style={{
                              display: "flex",
                              gap: ".3rem",
                              alignItems: "center",
                            }}
                          >
                            <button
                              type="button"
                              className="option-btn"
                              onClick={() => moveItem(item.id, -1)}
                              disabled={index === 0}
                              title="Move up"
                              style={{
                                minWidth: "1.6rem",
                                height: "1.6rem",
                                padding: 0,
                                fontSize: "0.8rem",
                                lineHeight: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "999px",
                                background: "#020617",
                                border: "1px solid #475569",
                                color: "#e5e7eb",
                                opacity: index === 0 ? 0.35 : 1,
                                cursor: index === 0 ? "default" : "pointer",
                              }}
                            >
                              ↑
                            </button>
                  
                            <button
                              type="button"
                              className="option-btn"
                              onClick={() => moveItem(item.id, +1)}
                              disabled={index === selectedItems.length - 1}
                              title="Move down"
                              style={{
                                minWidth: "1.6rem",
                                height: "1.6rem",
                                padding: 0,
                                fontSize: "0.8rem",
                                lineHeight: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "999px",
                                background: "#020617",
                                border: "1px solid #475569",
                                color: "#e5e7eb",
                                opacity: index === selectedItems.length - 1 ? 0.35 : 1,
                                cursor:
                                  index === selectedItems.length - 1 ? "default" : "pointer",
                              }}
                            >
                              ↓
                            </button>
                  
                            <button
                              type="button"
                              className="option-btn"
                              onClick={() => toggleSelect(item.id)}
                              title="Remove from set"
                              style={{
                                minWidth: "1.6rem",
                                height: "1.6rem",
                                padding: 0,
                                fontSize: "0.8rem",
                                lineHeight: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "999px",
                                background: "#450a0a",
                                border: "1px solid #f97316",
                                color: "#fed7aa",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                  
                        {/* Sentence preview */}
                        <p
                          className="sentence-text"
                          style={{
                            marginTop: 0,
                            fontSize: "0.95rem",
                          }}
                        >
                          {before}
                          <strong className="blank">_____</strong>
                          {after}
                        </p>
                      </div>
                    </li>
                  );                  
                })}
              </ol>
            )}
          </div>
                              {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: ".5rem",
              marginTop: ".75rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Clear set – red outline style, like “Review Mistakes” */}
            <button
              type="button"
              className="review-btn mistakes"
              onClick={clearSet}
              disabled={!selectedIds.length}
              style={{
                margin: 0,
                opacity: selectedIds.length ? 1 : 0.5,
                cursor: selectedIds.length ? "pointer" : "default",
              }}
            >
              Clear set
            </button>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: ".5rem",
              }}
            >
              {/* Save as draft – teal outline style, like “Review Favourites” */}
              <button
                type="button"
                className="review-btn favourites"
                onClick={() => handleSave("draft")}
                disabled={saving}
                style={{
                  margin: 0,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "default" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save as draft"}
              </button>

              {/* Save & publish – primary dark pill, matching your main CTAs */}
              <button
                type="button"
                className="review-btn"
                onClick={() => handleSave("published")}
                disabled={saving}
                style={{
                  margin: 0,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "default" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save & publish"}
              </button>
            </div>
          </div>


          {statusMsg && (
            <p
              className="small"
              style={{ marginTop: ".5rem", color: "#bfdbfe" }}
            >
              {statusMsg}
            </p>
          )}
        </div>

        {/* BOTTOM: BROWSER (full width, cards resembling GapFillItem) */}
        <div className="panel">
          <h3 className="sec-title" style={{ marginBottom: ".5rem" }}>
            2. Browse & add items
          </h3>

          {/* Filters row */}
          <div style={{ marginBottom: ".75rem" }}>
            {tagsLoading && <p className="muted small">Loading tags…</p>}
            {tagsError && (
              <p className="error-text small">Error loading tags.</p>
            )}

            <FilterPanel
              levels={levels}
              onLevelsChange={setLevels}
              tag={tag}
              onTagChange={setTag}
              allTags={allTags}
            />

            {/* Search box */}
            <div style={{ marginTop: ".5rem" }}>
              <label className="small muted" htmlFor="teacher-grammar-search">
                Search by text
              </label>
              <input
                id="teacher-grammar-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a word or phrase to filter…"
                style={{
                  width: "100%",
                  marginTop: ".25rem",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #374151",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: "0.875rem",
                }}
              />
            </div>
          </div>

          {/* Card-style list, similar to GapFillItem */}
          <div
            style={{
              maxHeight: "480px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: ".75rem",
            }}
          >
            {filteredItems.length === 0 ? (
              <p className="muted small">No items match your filters.</p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const sentence = item.sentence || item.text || "";
                const [before, after] = sentence.split("___");
                const options = item.options || [];
                const level = item.level || "B1";

                return (
                    <div
                      key={item.id}
                      className="card gapfill-card"
                      style={{
                        opacity: isSelected ? 0.9 : 1,
                        border: isSelected ? "1px solid #4ade80" : "1px solid #1f2937",
                      }}
                    >
                      {/* Header: CEFR badge + tag only */}
<div className="card-header">
  <div
    style={{
      display: "flex",
      gap: ".4rem",
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
    <span className={`cefr-badge cefr-${level}`}>
      {level}
    </span>
    <span className="badge subtle small">
      {getItemTags(item)[0] || "—"}
    </span>
  </div>
</div>

                  
                      {/* Sentence preview, like the real tool */}
                      <p
                        className="sentence-text"
                        style={{ marginTop: ".15rem" }}
                      >
                        {before}
                        <strong className="blank">_____</strong>
                        {after}
                      </p>
                  
                      {/* Options row, non-interactive preview */}
                      {options.length > 0 && (
                        <div className="options-row">
                          {options.map((opt, i) => (
                            <span
                              key={i}
                              className="option-btn"
                              style={{
                                cursor: "default",
                                pointerEvents: "none",
                              }}
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Add / In set button row, below the sentence */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: ".5rem",
  }}
>
  <button
    type="button"
    className="option-btn"
    onClick={() => toggleSelect(item.id)}
    style={{
      fontSize: "0.75rem",
      padding: "0.25rem 0.7rem",
      background: isSelected ? "#047857" : undefined,
      borderColor: isSelected ? "#10b981" : undefined,
      opacity: isSelected ? 0.95 : 1,
    }}
  >
    {isSelected ? "In set" : "Add to set"}
  </button>
</div>

                    </div>
                  );                  
              })
            )}
          </div>

          <p
            className="small muted"
            style={{ marginTop: ".5rem", textAlign: "right" }}
          >
            Showing {filteredItems.length} item
            {filteredItems.length === 1 ? "" : "s"}. Selected:{" "}
            <strong>{selectedIds.length}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
