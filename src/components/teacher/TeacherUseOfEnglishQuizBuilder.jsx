import React, { useEffect, useMemo, useState } from "react";
import {
  createGrammarSet,
  fetchKeywordTransformations,
  fetchOpenClozeItems,
  fetchWordFormationItems,
} from "../../firebase";
import { toast } from "../../utils/toast";

const STORAGE_KEY = "teacherUseOfEnglishQuizBuilderDraft";
const LEVELS = ["b1", "b2", "c1", "c2"];
const SOURCE_OPTIONS = [
  { value: "keyword", label: "Keyword", badgeClass: "keyword" },
  { value: "word-formation", label: "Word formation", badgeClass: "word-formation" },
  { value: "open-cloze", label: "Open cloze", badgeClass: "open-cloze" },
];
const INITIAL_QUICK_COUNTS = { keyword: 4, "word-formation": 4, "open-cloze": 4 };
const LEVEL_BADGE_CLASS = {
  b1: "b1",
  b2: "b2",
  c1: "c1",
  c2: "c2",
};

function readDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeTags(tags) {
  return String(tags || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getLevel(tags) {
  const lower = normalizeTags(tags).map((item) => item.toLowerCase());
  return LEVELS.find((level) => lower.includes(level)) || "mixed";
}

function stableKeywordId(item, index) {
  return item.itemId || item.id || `kw_${index}`;
}

function normalizeKeywordItem(item, index) {
  return {
    id: stableKeywordId(item, index),
    source: "keyword",
    sourceLabel: "Keyword",
    level: getLevel(item.tags),
    tags: normalizeTags(item.tags),
    title: item.gapFill || item.fullSentence || "",
    support: item.keyWord ? `Key word: ${item.keyWord}` : "",
    answer: item.answer || "",
    raw: item,
  };
}

function normalizeWordFormationItem(item, index) {
  return {
    id: item.itemId || item.id || `wf_${index}`,
    source: "word-formation",
    sourceLabel: "Word formation",
    level: getLevel(item.tags),
    tags: normalizeTags(item.tags),
    title: item.gappedSentence || "",
    support: item.base ? `Base word: ${item.base}` : "",
    answer: Array.isArray(item.answer) ? item.answer.join(" / ") : item.answer || "",
    raw: item,
  };
}

function normalizeOpenClozeItem(item, index) {
  return {
    id: item.itemId || item.id || `oc_${index}`,
    source: "open-cloze",
    sourceLabel: "Open cloze",
    level: getLevel(item.tags),
    tags: normalizeTags(item.tags),
    title: item.gappedSentence || "",
    support: "",
    answer: Array.isArray(item.answer) ? item.answer.join(" / ") : item.answer || "",
    raw: item,
  };
}

function shuffle(array) {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildSearchHaystack(item) {
  return [
    item.sourceLabel,
    item.level,
    item.title,
    item.support,
    item.answer,
    item.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function groupCounts(items) {
  return items.reduce(
    (acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    },
    { keyword: 0, "word-formation": 0, "open-cloze": 0 }
  );
}

function clampQuickCount(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return Math.max(0, Number(digits) || 0);
}

function sourceShortLabel(source) {
  if (source === "keyword") return "KW";
  if (source === "word-formation") return "WF";
  return "OC";
}

function serializeQuizItem(item) {
  const rawAnswer = item?.raw?.answer;
  const acceptedAnswers = Array.isArray(rawAnswer)
    ? rawAnswer.map((entry) => String(entry || "").trim()).filter(Boolean)
    : String(rawAnswer || item.answer || "")
        .split("/")
        .map((entry) => entry.trim())
        .filter(Boolean);

  return {
    id: item.id,
    source: item.source,
    sourceLabel: item.sourceLabel,
    level: item.level,
    tags: Array.isArray(item.tags) ? item.tags : [],
    title: item.title || "",
    support: item.support || "",
    answer: item.answer || "",
    acceptedAnswers,
    keyWord: item?.raw?.keyWord || "",
    base: item?.raw?.base || "",
    fullSentence: item?.raw?.fullSentence || "",
    gapFill: item?.raw?.gapFill || "",
    gappedSentence: item?.raw?.gappedSentence || "",
  };
}

export default function TeacherUseOfEnglishQuizBuilder({ user }) {
  const draft = readDraft();
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState(draft?.search || "");
  const [selectedSources, setSelectedSources] = useState(
    draft?.selectedSources || SOURCE_OPTIONS.map((item) => item.value)
  );
  const [selectedLevels, setSelectedLevels] = useState(draft?.selectedLevels || []);
  const [selectedTags, setSelectedTags] = useState(draft?.selectedTags || []);
  const [tagSearch, setTagSearch] = useState(draft?.tagSearch || "");
  const [title, setTitle] = useState(draft?.title || "Custom Use of English Quiz");
  const [selectedItems, setSelectedItems] = useState(draft?.selectedItems || []);
  const [quickCounts, setQuickCounts] = useState(
    draft?.quickCounts || INITIAL_QUICK_COUNTS
  );
  const [browseLimit, setBrowseLimit] = useState(80);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [lastSavedSetId, setLastSavedSetId] = useState(draft?.lastSavedSetId || "");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [keyword, wordFormation, openCloze] = await Promise.all([
          fetchKeywordTransformations(),
          fetchWordFormationItems(),
          fetchOpenClozeItems(),
        ]);

        if (cancelled) return;

        setAllItems([
          ...(Array.isArray(keyword) ? keyword : []).map(normalizeKeywordItem),
          ...(Array.isArray(wordFormation) ? wordFormation : []).map(normalizeWordFormationItem),
          ...(Array.isArray(openCloze) ? openCloze : []).map(normalizeOpenClozeItem),
        ]);
      } catch (error) {
        console.error("[TeacherUseOfEnglishQuizBuilder] load failed", error);
        toast("Could not load the Use of English pools.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        search,
        selectedSources,
        selectedLevels,
        selectedTags,
        tagSearch,
        title,
        selectedItems,
        quickCounts,
        lastSavedSetId,
      })
    );
  }, [lastSavedSetId, quickCounts, search, selectedItems, selectedLevels, selectedSources, selectedTags, tagSearch, title]);

  useEffect(() => {
    setBrowseLimit(80);
  }, [search, selectedLevels, selectedSources, selectedTags]);

  const availableTags = useMemo(() => {
    const counts = new Map();
    allItems.forEach((item) => {
      item.tags.forEach((tag) => {
        const key = tag.trim();
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([tag, count]) => ({ tag, count }));
  }, [allItems]);

  const visibleTagOptions = useMemo(() => {
    const needle = tagSearch.trim().toLowerCase();
    const pool = needle
      ? availableTags.filter(({ tag }) => tag.toLowerCase().includes(needle))
      : availableTags;
    return pool.slice(0, 28);
  }, [availableTags, tagSearch]);

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = allItems.filter((item) => {
      if (!selectedSources.includes(item.source)) return false;
      if (selectedLevels.length && !selectedLevels.includes(item.level)) return false;
      if (selectedTags.length) {
        const lowerTags = item.tags.map((tag) => tag.toLowerCase());
        const hasAllSelectedTags = selectedTags.every((tag) => lowerTags.includes(tag.toLowerCase()));
        if (!hasAllSelectedTags) return false;
      }
      if (!needle) return true;
      return buildSearchHaystack(item).includes(needle);
    });

    const grouped = SOURCE_OPTIONS.flatMap((option) =>
      shuffle(filtered.filter((item) => item.source === option.value))
    );

    return grouped;
  }, [allItems, search, selectedLevels, selectedSources, selectedTags]);

  const visibleItems = useMemo(() => filteredItems.slice(0, browseLimit), [browseLimit, filteredItems]);
  const selectedIds = useMemo(() => new Set(selectedItems.map((item) => item.id)), [selectedItems]);
  const countsBySource = useMemo(() => groupCounts(filteredItems), [filteredItems]);
  const selectedCounts = useMemo(() => groupCounts(selectedItems), [selectedItems]);
  const hasMoreToShow = visibleItems.length < filteredItems.length;

  function toggleSource(source) {
    setSelectedSources((current) =>
      current.includes(source) ? current.filter((item) => item !== source) : [...current, source]
    );
  }

  function toggleLevel(level) {
    setSelectedLevels((current) =>
      current.includes(level) ? current.filter((item) => item !== level) : [...current, level]
    );
  }

  function toggleTag(tag) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  }

  function addItem(item) {
    setSelectedItems((current) => (current.some((entry) => entry.id === item.id) ? current : [...current, item]));
  }

  function removeItem(id) {
    setSelectedItems((current) => current.filter((item) => item.id !== id));
  }

  function clearSelection() {
    setSelectedItems([]);
  }

  function moveItem(id, direction) {
    setSelectedItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function buildQuickSelection(mode) {
    const generated = [];

    Object.entries(quickCounts).forEach(([source, count]) => {
      const sourceItems = filteredItems.filter((item) => item.source === source);
      shuffle(sourceItems)
        .slice(0, Number(count) || 0)
        .forEach((item) => {
          if (!generated.some((entry) => entry.id === item.id)) {
            generated.push(item);
          }
        });
    });

    if (mode === "append") {
      setSelectedItems((current) => {
        const next = [...current];
        generated.forEach((item) => {
          if (!next.some((entry) => entry.id === item.id)) next.push(item);
        });
        return next;
      });
      toast(`Added ${generated.length} generated items.`);
      return;
    }

    setSelectedItems(generated);
    toast(`Built a quick quiz with ${generated.length} items.`);
  }

  function resetFilters() {
    setSearch("");
    setTagSearch("");
    setSelectedLevels([]);
    setSelectedTags([]);
    setSelectedSources(SOURCE_OPTIONS.map((item) => item.value));
  }

  async function handleSave(visibility) {
    if (!title.trim()) {
      toast("Please add a title before saving.");
      return;
    }
    if (!selectedItems.length) {
      toast("Please select at least one item before saving.");
      return;
    }

    setSaving(true);
    setSaveStatus("");
    try {
      const payload = {
        title: title.trim(),
        description: null,
        itemIds: selectedItems.map((item) => item.id),
        levels: [...new Set(selectedItems.map((item) => item.level).filter(Boolean))],
        tags: [...new Set(selectedItems.flatMap((item) => item.tags || []).filter(Boolean))],
        visibility,
        setType: "use_of_english_custom",
        quizItems: selectedItems.map(serializeQuizItem),
      };

      const id = await createGrammarSet(payload);
      setLastSavedSetId(id);
      setSaveStatus(
        visibility === "published"
          ? `Quiz published. Share link: ${window.location.origin}/use-of-english/custom/${id}`
          : `Quiz saved as draft.`
      );
      toast(visibility === "published" ? "Quiz published." : "Quiz saved as draft.");
    } catch (error) {
      console.error("[TeacherUseOfEnglishQuizBuilder] save failed", error);
      toast("Could not save this quiz.");
    } finally {
      setSaving(false);
    }
  }

  const lastSavedShareUrl = lastSavedSetId
    ? `${window.location.origin}/use-of-english/custom/${lastSavedSetId}`
    : "";

  return (
    <div className="uoe-builder">
      <div className="uoe-builder-top">
        <div>
          <h3 className="uoe-title">Custom Use of English Quiz Builder</h3>
          <p className="uoe-copy">
            Build a quiz from the full keyword, word formation, and open cloze pools.
            Use filters to browse precisely, or generate a quick mixed test from a recipe.
          </p>
        </div>
        <div className="uoe-actions">
          <button type="button" className="uoe-btn" onClick={() => buildQuickSelection("replace")}>
            Quick generate
          </button>
          <button type="button" className="uoe-btn" onClick={() => buildQuickSelection("append")}>
            Append generated
          </button>
          <button
            type="button"
            className="uoe-btn uoe-btn-secondary"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            Save draft
          </button>
          <button
            type="button"
            className="uoe-btn uoe-btn-primary"
            onClick={() => handleSave("published")}
            disabled={saving}
          >
            Publish quiz
          </button>
        </div>
      </div>

      {saveStatus ? (
        <div className="uoe-save-banner">
          <p className="uoe-copy">{saveStatus}</p>
          {lastSavedShareUrl ? (
            <div className="uoe-share-row">
              <input className="uoe-input uoe-share-input" value={lastSavedShareUrl} readOnly onFocus={(event) => event.target.select()} />
              <button
                type="button"
                className="uoe-btn"
                onClick={() => {
                  navigator.clipboard.writeText(lastSavedShareUrl);
                  toast("Quiz link copied.");
                }}
              >
                Copy link
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="uoe-panel">
        <div className="uoe-section-head">
          <h4 className="uoe-section-title">1. Build the quiz setup</h4>
          <p className="uoe-copy small">
            Set the title, choose sources and levels, then use the quick recipe if you want a fast starting point.
          </p>
        </div>

        <div className="uoe-setup-grid">
          <label className="uoe-label">
            Quiz title
            <input
              className="uoe-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <div className="uoe-filter-block">
            <div className="uoe-subhead">Sources</div>
            <div className="uoe-chip-row">
              {SOURCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`uoe-chip uoe-choice-pill ${selectedSources.includes(option.value) ? "is-active" : ""}`}
                  onClick={() => toggleSource(option.value)}
                >
                  <span className={`uoe-pill-dot ${option.badgeClass}`} aria-hidden />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="uoe-filter-block">
            <div className="uoe-subhead">Levels</div>
            <div className="uoe-chip-row">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`uoe-chip uoe-choice-pill ${selectedLevels.includes(level) ? "is-active" : ""}`}
                  onClick={() => toggleLevel(level)}
                >
                  <span className={`uoe-pill-dot ${LEVEL_BADGE_CLASS[level]}`} aria-hidden />
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="uoe-filter-block">
            <div className="uoe-subhead">Quick test recipe</div>
            <div className="uoe-quick-inline">
              {SOURCE_OPTIONS.map((option) => (
                <label key={option.value} className="uoe-mini-label">
                  <span>{sourceShortLabel(option.value)}</span>
                  <input
                    className="uoe-input"
                    inputMode="numeric"
                    value={quickCounts[option.value]}
                    onChange={(event) =>
                      setQuickCounts((current) => ({
                        ...current,
                        [option.value]: clampQuickCount(event.target.value),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="uoe-builder-actions-row">
            <button type="button" className="uoe-btn" onClick={() => buildQuickSelection("replace")}>
              Quick generate
            </button>
            <button type="button" className="uoe-btn" onClick={() => buildQuickSelection("append")}>
              Append generated
            </button>
            <button
              type="button"
              className="uoe-btn uoe-btn-secondary"
              onClick={() => handleSave("draft")}
              disabled={saving}
            >
              Save draft
            </button>
            <button
              type="button"
              className="uoe-btn uoe-btn-primary"
              onClick={() => handleSave("published")}
              disabled={saving}
            >
              Publish quiz
            </button>
          </div>
        </div>
      </section>

      <section className="uoe-panel">
        <div className="uoe-section-head">
          <h4 className="uoe-section-title">2. Browse & add items</h4>
          <p className="uoe-copy small">
            Narrow the bank with search and tags, then add individual items into the quiz.
          </p>
        </div>

        <div className="uoe-browse-filters">
          <label className="uoe-label">
            Search
            <input
              className="uoe-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search text, answer, tag, key word, base word..."
            />
          </label>

          <div className="uoe-filter-block">
            <div className="uoe-subhead">Tags</div>
            <input
              className="uoe-input"
              value={tagSearch}
              onChange={(event) => setTagSearch(event.target.value)}
              placeholder="Filter tag suggestions..."
            />
            <div className="uoe-chip-row uoe-chip-scroll">
              {visibleTagOptions.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  className={`uoe-chip ${selectedTags.includes(tag) ? "is-active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <span className="uoe-chip-count">{count}</span>
                </button>
              ))}
              {!visibleTagOptions.length ? <span className="uoe-empty-inline">No matching tags</span> : null}
            </div>
            {selectedTags.length ? (
              <div className="uoe-selected-tags">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="uoe-selected-tag"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="uoe-summary-block">
            <div className="uoe-subhead">Current pool</div>
            <p className="uoe-copy small">
              {filteredItems.length} items match the current filters.
            </p>
            <div className="uoe-summary-pills">
              {SOURCE_OPTIONS.map((option) => (
                <span key={option.value} className="uoe-pill muted">
                  {sourceShortLabel(option.value)} {countsBySource[option.value]}
                </span>
              ))}
            </div>
          </div>

          <div className="uoe-side-actions">
            <button type="button" className="uoe-btn" onClick={resetFilters}>
              Reset filters
            </button>
            <button type="button" className="uoe-btn" onClick={clearSelection} disabled={!selectedItems.length}>
              Clear selection
            </button>
          </div>
        </div>

        {loading ? <p className="uoe-copy">Loading full pools…</p> : null}

        <div className="uoe-browse-list">
          {visibleItems.map((item) => (
            <article key={item.id} className="uoe-item-card">
              <div className="uoe-item-meta">
                <span className="uoe-pill">{item.sourceLabel}</span>
                <span className={`uoe-pill muted uoe-level-pill ${LEVEL_BADGE_CLASS[item.level] || ""}`}>
                  <span className={`uoe-pill-dot ${LEVEL_BADGE_CLASS[item.level] || ""}`} aria-hidden />
                  {item.level.toUpperCase()}
                </span>
              </div>
              <p className="uoe-item-title">{item.title}</p>
              {item.support ? <p className="uoe-item-support">{item.support}</p> : null}
              <p className="uoe-item-answer">Answer: {item.answer}</p>
              <div className="uoe-item-footer">
                <span className="uoe-tags">{item.tags.join(", ")}</span>
                <button
                  type="button"
                  className="uoe-btn small"
                  onClick={() => addItem(item)}
                  disabled={selectedIds.has(item.id)}
                >
                  {selectedIds.has(item.id) ? "Added" : "Add"}
                </button>
              </div>
            </article>
          ))}

          {!loading && !filteredItems.length ? (
            <p className="uoe-copy">No items match the current filters yet.</p>
          ) : null}
        </div>

        {hasMoreToShow ? (
          <button
            type="button"
            className="uoe-btn uoe-more-btn"
            onClick={() => setBrowseLimit((current) => current + 80)}
          >
            Show more items
          </button>
        ) : null}
      </section>

      <section className="uoe-panel">
        <div className="uoe-section-head">
          <h4 className="uoe-section-title">3. Selected quiz items</h4>
          <p className="uoe-copy small">
            Reorder the quiz, remove items you do not want, and keep an eye on the source balance.
          </p>
        </div>

        <div className="uoe-panel-head">
          <span className="uoe-pill muted">{selectedItems.length} selected</span>
          <div className="uoe-summary-pills">
            {SOURCE_OPTIONS.map((option) => (
              <span key={option.value} className="uoe-pill muted">
                {sourceShortLabel(option.value)} {selectedCounts[option.value]}
              </span>
            ))}
          </div>
        </div>

        <div className="uoe-selected-list">
          {selectedItems.map((item, index) => (
            <article key={`${item.id}-${index}`} className="uoe-item-card is-selected">
              <div className="uoe-item-meta">
                <span className="uoe-pill">{index + 1}</span>
                <span className="uoe-pill muted">{item.sourceLabel}</span>
                <span className={`uoe-pill muted uoe-level-pill ${LEVEL_BADGE_CLASS[item.level] || ""}`}>
                  <span className={`uoe-pill-dot ${LEVEL_BADGE_CLASS[item.level] || ""}`} aria-hidden />
                  {item.level.toUpperCase()}
                </span>
              </div>
              <p className="uoe-item-title">{item.title}</p>
              {item.support ? <p className="uoe-item-support">{item.support}</p> : null}
              <p className="uoe-item-answer">Answer: {item.answer}</p>
              <div className="uoe-item-footer uoe-item-footer-wide">
                <span className="uoe-tags">{item.tags.join(", ")}</span>
                <div className="uoe-item-actions">
                  <button
                    type="button"
                    className="uoe-btn small"
                    onClick={() => moveItem(item.id, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="uoe-btn small"
                    onClick={() => moveItem(item.id, 1)}
                    disabled={index === selectedItems.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="uoe-btn small"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!selectedItems.length ? <p className="uoe-copy">No items selected yet.</p> : null}
        </div>
      </section>

      <style>{`
        .uoe-builder {
          display: grid;
          gap: 1rem;
          max-width: 940px;
          margin: 0 auto;
        }
        .uoe-builder-top {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .uoe-setup-grid,
        .uoe-browse-filters {
          display: grid;
          gap: 1rem;
        }
        .uoe-setup-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .uoe-browse-filters {
          grid-template-columns: 1.2fr 1.2fr .8fr auto;
          align-items: start;
        }
        .uoe-panel {
          background: linear-gradient(180deg, rgba(26, 43, 84, 0.98), rgba(20, 35, 69, 0.98));
          border: 1px solid rgba(62, 98, 176, 0.72);
          border-radius: 1rem;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.05),
            0 12px 30px rgba(5, 11, 27, 0.18);
          padding: 1rem 1rem 1.05rem;
          display: grid;
          gap: .85rem;
          min-height: 0;
        }
        .uoe-section-head {
          display: grid;
          gap: .2rem;
        }
        .uoe-section-title {
          margin: 0;
          color: #eef4ff;
          font-size: 1.12rem;
        }
        .uoe-title {
          margin: 0 0 .35rem;
        }
        .uoe-save-banner {
          background: linear-gradient(180deg, rgba(26, 43, 84, 0.98), rgba(20, 35, 69, 0.98));
          border: 1px solid rgba(246,189,96,0.24);
          border-radius: 1rem;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.05),
            0 12px 30px rgba(5, 11, 27, 0.18);
          padding: .9rem 1rem;
          display: grid;
          gap: .75rem;
        }
        .uoe-share-row {
          display: flex;
          gap: .65rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .uoe-share-input {
          flex: 1 1 320px;
        }
        .uoe-copy {
          margin: 0;
          color: #a9b7d1;
          line-height: 1.45;
        }
        .uoe-copy.small {
          font-size: .9rem;
        }
        .uoe-subhead {
          font-weight: 700;
          color: #e6f0ff;
        }
        .uoe-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: .75rem;
          flex-wrap: wrap;
        }
        .uoe-builder-actions-row {
          display: flex;
          gap: .65rem;
          flex-wrap: wrap;
          align-items: center;
          grid-column: 1 / -1;
        }
        .uoe-actions,
        .uoe-chip-row,
        .uoe-item-meta,
        .uoe-item-footer,
        .uoe-summary-pills,
        .uoe-item-actions,
        .uoe-side-actions,
        .uoe-selected-tags {
          display: flex;
          gap: .5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .uoe-btn,
        .uoe-chip,
        .uoe-selected-tag {
          background: linear-gradient(180deg, rgba(60, 75, 117, 0.9), rgba(50, 65, 104, 0.9));
          border: 1px solid rgba(121, 148, 215, 0.3);
          color: #edf4ff;
          border-radius: .85rem;
          padding: .65rem .85rem;
          cursor: pointer;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.06),
            0 4px 10px rgba(0,0,0,.08);
          transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease, background .15s ease;
        }
        .uoe-btn:hover,
        .uoe-chip:hover,
        .uoe-selected-tag:hover {
          transform: translateY(-1px);
          border-color: rgba(151, 176, 236, 0.48);
        }
        .uoe-btn-secondary {
          background: linear-gradient(180deg, rgba(31, 83, 131, 0.98), rgba(22, 63, 104, 0.98));
          border-color: rgba(103, 218, 255, 0.68);
          color: #8cefff;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.05),
            0 0 0 1px rgba(103, 218, 255, 0.12);
        }
        .uoe-btn-primary {
          background: linear-gradient(180deg, #f7d879 0%, #e7c15a 100%);
          border-color: rgba(231, 193, 90, 0.65);
          color: #2c1a00;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            0 8px 18px rgba(0,0,0,0.18);
        }
        .uoe-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .uoe-btn.small {
          padding: .4rem .65rem;
          min-width: 40px;
        }
        .uoe-more-btn {
          justify-self: start;
        }
        .uoe-chip.is-active,
        .uoe-selected-tag {
          background: linear-gradient(180deg, rgba(98, 74, 36, 0.95), rgba(77, 57, 24, 0.95));
          border-color: rgba(246,189,96,0.32);
        }
        .uoe-choice-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.46rem 0.82rem;
          border-radius: 999px;
          border: 1px solid rgba(109, 137, 208, 0.8);
          background: linear-gradient(180deg, rgba(34, 51, 94, 0.95), rgba(28, 45, 84, 0.95));
          color: #eef4ff;
          font-weight: 700;
          box-shadow:
            inset 0 0 0 2px rgba(255,255,255,0.04),
            0 2px 10px rgba(0,0,0,0.08);
        }
        .uoe-choice-pill.is-active {
          background: linear-gradient(180deg, rgba(78, 63, 31, 0.98), rgba(65, 50, 22, 0.98));
          border-color: rgba(246,189,96,0.7);
          color: #fff4c7;
        }
        .uoe-pill-dot {
          width: .62rem;
          height: .62rem;
          border-radius: 999px;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
          background: #9fb4ec;
          flex: 0 0 auto;
        }
        .uoe-pill-dot.keyword,
        .uoe-pill-dot.b1 {
          background: #8fb7ff;
        }
        .uoe-pill-dot.word-formation,
        .uoe-pill-dot.b2 {
          background: #f2cb67;
        }
        .uoe-pill-dot.open-cloze,
        .uoe-pill-dot.c1 {
          background: #efb0b7;
        }
        .uoe-pill-dot.c2 {
          background: #8ee0c7;
        }
        .uoe-chip-count {
          opacity: .75;
          margin-left: .35rem;
          font-size: .82em;
        }
        .uoe-label,
        .uoe-mini-label {
          display: grid;
          gap: .35rem;
          color: #e6f0ff;
          font-weight: 600;
        }
        .uoe-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(132, 158, 222, 0.2);
          background: rgba(3, 8, 20, 0.55);
          color: #eef4ff;
          padding: .65rem .75rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .uoe-filter-block,
        .uoe-summary-block {
          display: grid;
          gap: .5rem;
        }
        .uoe-quick-grid {
          display: grid;
          gap: .65rem;
        }
        .uoe-quick-inline {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: .75rem;
          align-items: end;
        }
        .uoe-mini-label span {
          font-size: .82rem;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: #a9b7d1;
        }
        .uoe-browse-list,
        .uoe-selected-list {
          display: grid;
          gap: .75rem;
          overflow: auto;
          padding-right: .25rem;
        }
        .uoe-browse-list {
          max-height: 780px;
        }
        .uoe-selected-list {
          max-height: 620px;
        }
        .uoe-item-card {
          border: 1px solid rgba(78, 108, 181, 0.6);
          border-radius: 1rem;
          background: linear-gradient(180deg, rgba(48, 66, 122, 0.98), rgba(41, 59, 113, 0.98));
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.05),
            0 10px 22px rgba(0,0,0,0.12);
          padding: 1rem;
          display: grid;
          gap: .55rem;
        }
        .uoe-item-card.is-selected {
          border-color: rgba(246,189,96,0.45);
          background: linear-gradient(180deg, rgba(57, 71, 120, 0.98), rgba(47, 63, 112, 0.98));
        }
        .uoe-pill {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          padding: .3rem .68rem;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(32, 46, 84, 0.98), rgba(28, 41, 74, 0.98));
          border: 1px solid rgba(121, 148, 215, 0.24);
          color: #edf3ff;
          font-size: .78rem;
          font-weight: 700;
          letter-spacing: .02em;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.02);
        }
        .uoe-pill.muted {
          color: #b8c6df;
        }
        .uoe-level-pill {
          border-color: rgba(255,255,255,0.14);
        }
        .uoe-item-title,
        .uoe-item-support,
        .uoe-item-answer,
        .uoe-tags,
        .uoe-empty-inline {
          margin: 0;
        }
        .uoe-item-title {
          color: #f4f7ff;
          line-height: 1.45;
          font-size: 1.02rem;
        }
        .uoe-item-support,
        .uoe-item-answer,
        .uoe-tags,
        .uoe-empty-inline {
          color: #b6c4dc;
          font-size: .92rem;
        }
        .uoe-item-answer {
          color: #d8e5ff;
        }
        .uoe-chip-scroll {
          max-height: 170px;
          overflow: auto;
          padding-right: .15rem;
          align-content: flex-start;
        }
        .uoe-item-footer-wide {
          justify-content: space-between;
        }
        @media (max-width: 1100px) {
          .uoe-setup-grid,
          .uoe-browse-filters {
            grid-template-columns: 1fr;
          }
          .uoe-quick-inline {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
