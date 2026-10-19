import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Plus, Shuffle, Users, X } from "lucide-react";

import Seo from "../../common/Seo.jsx";
import { createCollocationTeamLiveGame } from "../../../api/liveGames.js";
import { getSitePath } from "../../../siteConfig.js";
import { toast } from "../../../utils/toast.js";
import bank from "./data/collocationPrecisionItems.js";
import { getCorrectWords } from "./collocationTeamLive.js";
import { createCollocationLiveItems, filterCollocationLiveItems, readCollocationLiveFilters, selectCollocationLiveItems } from "./collocationLiveSetup.js";
import "./CollocationTeamLive.css";
import "./CollocationTeamLiveSetup.css";

const PAGE_SIZE = 12;
const levels = [...new Set(bank.map((item) => item.level))].sort();
const topics = [...new Set(bank.flatMap((item) => [item.topic, ...(item.secondaryTopics || [])]))].sort();
const patterns = [...new Set(bank.map((item) => item.pattern))].sort();
const human = (value) => String(value).replace(/-/g, " ");

export default function CollocationTeamLiveSetup({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(() => readCollocationLiveFilters(location.search, bank));
  const [selectedIds, setSelectedIds] = useState(() => selectCollocationLiveItems(filterCollocationLiveItems(bank, readCollocationLiveFilters(location.search, bank)), [], 10));
  const [roundInput, setRoundInput] = useState(() => String(selectedIds.length));
  const [desiredRoundCount, setDesiredRoundCount] = useState(10);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const pool = useMemo(() => filterCollocationLiveItems(bank, filters), [filters]);
  const byId = useMemo(() => new Map(pool.map((item) => [item.itemId, item])), [pool]);
  const selectedItems = selectedIds.map((id) => byId.get(id)).filter(Boolean);
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pool.filter((item) => !query || [item.prompt, item.level, human(item.topic), item.pattern, ...item.options.map((option) => option.collocation || option.word)].join(" ").toLowerCase().includes(query));
  }, [pool, search]);
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleItems = matches.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  function updateSelection(ids, rememberCount = true) {
    setSelectedIds(ids);
    setRoundInput(String(ids.length));
    if (rememberCount && ids.length >= 2) setDesiredRoundCount(ids.length);
    setError("");
  }

  function changeFilters(change) {
    const nextFilters = { ...filters, ...change };
    const nextPool = filterCollocationLiveItems(bank, nextFilters);
    setFilters(nextFilters);
    updateSelection(selectCollocationLiveItems(nextPool, selectedIds, desiredRoundCount), false);
    setPage(0);
  }

  function changeRoundCount(value, commit = false) {
    setRoundInput(value);
    const count = Number(value);
    if (commit || (Number.isInteger(count) && count >= 2 && count <= pool.length)) {
      const next = selectCollocationLiveItems(pool, selectedIds, count);
      setSelectedIds(next);
      if (next.length >= 2) setDesiredRoundCount(next.length);
      if (commit) setRoundInput(String(next.length));
    }
  }

  function toggleSet(itemId) {
    updateSelection(selectedIds.includes(itemId) ? selectedIds.filter((id) => id !== itemId) : [...selectedIds, itemId]);
  }

  async function createLobby() {
    if (creating || selectedItems.length < 2) return;
    setCreating(true);
    setError("");
    try {
      const liveItems = createCollocationLiveItems(pool, selectedIds);
      const defaultTitle = ["Collocation Team Challenge", filters.levels.length === 1 ? filters.levels[0].toUpperCase() : null, filters.topic !== "all" ? human(filters.topic) : null].filter(Boolean).join(" · ");
      const { gameId } = await createCollocationTeamLiveGame({ items: liveItems, title: title.trim() || defaultTitle });
      navigate(getSitePath(`/live/collocations/host/${gameId}`));
    } catch (cause) {
      console.error("[CollocationTeamLiveSetup] create lobby failed", cause);
      setError(cause.message || "Could not create the lobby. Your selection is still here—please try again.");
      toast("Could not create the team room.");
    } finally {
      setCreating(false);
    }
  }

  if (user?.role !== "teacher" && user?.role !== "admin") {
    return <main className="ctl-page"><section className="ctl-panel"><h1>Teacher access required</h1><p>Sign in with a teacher or administrator account to set up a live game.</p></section></main>;
  }

  return (
    <main className="ctl-page ctl-setup">
      <Seo title="Set up a live collocation game | Seif Aptis Trainer" description="Choose levels, rounds and individual collocation sets for a live team lesson." />
      <Link className="ctl-setup-back" to={`${getSitePath("/teacher-resources")}#aptis`}><ArrowLeft size={17} /> Teacher resources</Link>
      <header className="ctl-hero">
        <div><p className="ctl-kicker">Teacher workspace · Live vocabulary</p><h1>Build your team challenge</h1><p>Start with a quick selection, then make it your own.</p></div>
        <span className="ctl-phase"><Users size={18} /> 45 seconds per round</span>
      </header>

      <section className="ctl-panel ctl-setup-settings" aria-labelledby="setup-settings-title">
        <h2 id="setup-settings-title">Choose your settings</h2>
        <fieldset className="ctl-setup-levels" disabled={creating}><legend>Level</legend>{levels.map((level) => <label key={level}><input type="checkbox" checked={filters.levels.includes(level)} onChange={() => changeFilters({ levels: filters.levels.includes(level) ? filters.levels.filter((entry) => entry !== level) : [...filters.levels, level] })} />{level.toUpperCase()}</label>)}</fieldset>
        <div className="ctl-setup-fields">
          <label>Number of rounds<input type="number" min="2" max={Math.max(2, pool.length)} step="1" value={roundInput} disabled={creating || pool.length < 2} onChange={(event) => changeRoundCount(event.target.value)} onBlur={(event) => changeRoundCount(event.target.value, true)} /><small>Each selected set is one round.</small></label>
          <label>Topic<select value={filters.topic} disabled={creating} onChange={(event) => changeFilters({ topic: event.target.value })}><option value="all">All topics</option>{topics.map((topic) => <option key={topic} value={topic}>{human(topic)}</option>)}</select></label>
          <label>Pattern<select value={filters.pattern} disabled={creating} onChange={(event) => changeFilters({ pattern: event.target.value })}><option value="all">All patterns</option>{patterns.map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}</select></label>
        </div>
        <p className="ctl-muted ctl-setup-hint">Changing these filters keeps matching sets and replaces any that no longer fit. You can fine-tune the selection below.</p>
      </section>

      <div className="ctl-setup-layout">
        <section className="ctl-panel ctl-setup-browser" aria-labelledby="set-bank-title">
          <div className="ctl-panel-heading"><div><p className="ctl-label">Optional · Hand-pick your sets</p><h2 id="set-bank-title">Browse the set bank</h2></div><span className="ctl-muted">{pool.length} available</span></div>
          <label className="ctl-setup-search">Search sets<input type="search" placeholder="Try heavy, occupational, travel…" value={search} disabled={creating} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /></label>
          <p className="ctl-muted ctl-setup-hint">Search only changes this list, not your selected rounds.</p>
          {!visibleItems.length && <p role="status" className="ctl-waiting">{pool.length ? "No sets match that search. Try a different word." : "No sets match these filters. Select a level or broaden the topic and pattern."}</p>}
          <div className="ctl-setup-bank-grid">{visibleItems.map((item) => {
            const selected = selectedIds.includes(item.itemId);
            const label = `${item.prompt} (${item.level.toUpperCase()})`;
            return <article className={`ctl-setup-set ${selected ? "is-selected" : ""}`} key={item.itemId}>
              <div className="ctl-setup-set-meta"><span>{item.level.toUpperCase()}</span><span>{human(item.topic)}</span></div>
              <h3>{item.prompt}</h3><p className="ctl-muted">{item.pattern} · {getCorrectWords(item).length} targets</p>
              <details><summary>Preview collocations</summary><ul>{item.options.filter((option) => option.isCorrect).map((option) => <li key={option.word}>{option.collocation || `${item.prompt} ${option.word}`}</li>)}</ul></details>
              <button className={`ctl-button ${selected ? "ctl-button-secondary" : ""}`} type="button" aria-pressed={selected} aria-label={`${selected ? "Remove" : "Add"} ${label}`} disabled={creating} onClick={() => toggleSet(item.itemId)}>{selected ? <Check size={16} /> : <Plus size={16} />}{selected ? "Added · Remove" : "Add set"}</button>
            </article>;
          })}</div>
          {pageCount > 1 && <nav className="ctl-setup-pagination" aria-label="Set bank pages"><button className="ctl-button ctl-button-secondary" aria-label="Previous sets" disabled={currentPage === 0 || creating} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} /> Previous</button><span>Page {currentPage + 1} of {pageCount}</span><button className="ctl-button ctl-button-secondary" aria-label="Next sets" disabled={currentPage === pageCount - 1 || creating} onClick={() => setPage(currentPage + 1)}>Next <ChevronRight size={17} /></button></nav>}
        </section>

        <aside className="ctl-panel ctl-setup-selection" aria-labelledby="your-rounds-title">
          <p className="ctl-label">Your session</p><h2 id="your-rounds-title">{selectedItems.length} selected rounds</h2>
          <p className="ctl-muted">Teams see these sets in the order shown, followed by a personalised review of their missed collocations.</p>
          <div className="ctl-actions"><button className="ctl-button ctl-button-secondary" disabled={creating || pool.length < 2} onClick={() => updateSelection(selectCollocationLiveItems(pool, [], Number(roundInput) || desiredRoundCount))}><Shuffle size={16} /> Pick random sets</button><button className="ctl-button ctl-button-secondary" disabled={creating || !selectedIds.length} onClick={() => updateSelection([])}>Clear</button></div>
          <ol className="ctl-setup-round-list">{selectedItems.map((item) => <li key={item.itemId}><div><strong>{item.prompt}</strong><small>{item.level.toUpperCase()} · {human(item.topic)} · {item.pattern}</small></div><button className="ctl-setup-remove" disabled={creating} aria-label={`Remove ${item.prompt} (${item.level.toUpperCase()}) from session`} onClick={() => toggleSet(item.itemId)}><X size={17} /></button></li>)}</ol>
          {!selectedItems.length && <p className="ctl-waiting">Add sets from the bank, or pick a random selection.</p>}
          <label className="ctl-setup-title">Session name <span className="ctl-muted">(optional)</span><input type="text" maxLength="120" placeholder="Collocation Team Challenge" value={title} disabled={creating} onChange={(event) => setTitle(event.target.value)} /></label>
          {selectedItems.length < 2 && <p className="ctl-muted">Choose at least 2 sets to create a room.</p>}
          {error && <p role="alert">{error}</p>}
          <button className="ctl-button ctl-button-primary ctl-setup-create" disabled={creating || selectedItems.length < 2} onClick={createLobby}>{creating ? "Creating team room…" : `Create lobby · ${selectedItems.length} rounds`}</button>
          <p className="ctl-muted ctl-setup-hint">You’ll organise the teams in the lobby. No round starts until you’re ready.</p>
        </aside>
      </div>
    </main>
  );
}
