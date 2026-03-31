export default function CoursePackControls({
  page,
  numPages,
  pageInput,
  setPageInput,
  goToPage,
  prevPage,
  nextPage,
  sections,
  zoom,
  setZoom,
  resetZoom,
  openOverlay,
  currentSection,
  isBookmarked,
  onToggleBookmark,
  onResume,
  hasSavedProgress,
  savedPage,
  savedZoom,
  ui,
}) {
  return (
    <>
      <div className="cp-status-row">
        <div className="cp-status-copy">
          <strong>{currentSection?.label || "Course pack"}</strong>
          <span>
            Page {page}
            {numPages ? ` / ${numPages}` : ""}
          </span>
        </div>
        <div className="cp-status-actions">
          {hasSavedProgress && savedPage !== page ? (
            <button type="button" onClick={onResume} style={{ ...ui.btn, ...ui.btnSoft }}>
              Resume page {savedPage}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggleBookmark}
            style={{ ...ui.btn, ...(isBookmarked ? ui.btnPrimary : ui.btnSoft) }}
          >
            {isBookmarked ? "Saved page" : "Save page"}
          </button>
        </div>
      </div>

      <div style={ui.bar}>
        <button
          type="button"
          onClick={prevPage}
          disabled={page <= 1}
          style={{ ...ui.btn, ...(page <= 1 ? ui.disabled : null) }}
        >
          Prev
        </button>

        <span style={ui.pill}>{page} / {numPages || "…"}</span>

        <button
          type="button"
          onClick={nextPage}
          disabled={!!numPages && page >= numPages}
          style={{ ...ui.btn, ...(!!numPages && page >= numPages ? ui.disabled : null), ...ui.btnPrimary }}
        >
          Next
        </button>

        <div style={ui.divider} />

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToPage(Number(pageInput || "1"));
            }}
            inputMode="numeric"
            placeholder="Pg"
            style={{
              ...ui.input,
              width: 48,
              minWidth: 48,
              padding: "6px 8px",
              textAlign: "center",
            }}
          />
          <button
            type="button"
            onClick={() => goToPage(Number(pageInput || "1"))}
            style={{ ...ui.btn, ...ui.btnSoft }}
          >
            Go
          </button>
        </div>

        <select
          value=""
          onChange={(e) => {
            const pageNum = Number(e.target.value);
            if (!Number.isNaN(pageNum)) goToPage(pageNum);
            e.target.value = "";
          }}
          style={ui.select}
        >
          <option value="" disabled>Sections…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.page}>
              {s.label} (p. {s.page})
            </option>
          ))}
        </select>

        <div style={ui.divider} />

        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))}
          style={{ ...ui.btn, ...ui.btnIcon }}
          aria-label="Zoom out"
        >
          –
        </button>

        <span
          style={{
            fontSize: 13,
            opacity: 0.9,
            minWidth: 0,
            textAlign: "center",
            lineHeight: 1,
            padding: "0 1px",
          }}
        >
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(1)))}
          style={{ ...ui.btn, ...ui.btnIcon }}
          aria-label="Zoom in"
        >
          +
        </button>

        <button type="button" onClick={resetZoom} style={{ ...ui.btn, ...ui.btnSoft }}>
          Reset
        </button>

        <button type="button" onClick={openOverlay} style={{ ...ui.btn, ...ui.btnPrimary }}>
          Full screen
        </button>
      </div>
    </>
  );
}
