import { useMemo, useState } from "react";

function getSectionGroup(section) {
  if (section.id === "cover" || section.id === "introduction") return "Getting Started";
  if (section.label?.startsWith("Core:")) return "Core";
  if (section.label?.startsWith("Reading:")) return "Reading";
  if (section.label?.startsWith("Speaking:")) return "Speaking";
  if (section.label?.startsWith("Writing:")) return "Writing";
  return "Other";
}

export default function CoursePackSidebar({
  sections,
  currentSectionId,
  bookmarks,
  onGoToPage,
  canAnnotate,
  annotationMode,
  setAnnotationMode,
  hasSelectedAnnotation,
  onDeleteSelectedAnnotation,
  onClearPage,
  canClearPage,
  textColor,
  setTextColor,
  penColor,
  setPenColor,
  highlightColor,
  setHighlightColor,
  textSize,
  setTextSize,
}) {
  const currentGroup = useMemo(
    () => getSectionGroup(sections.find((section) => section.id === currentSectionId) || {}),
    [currentSectionId, sections]
  );

  const [openGroups, setOpenGroups] = useState(() => ({
    "Getting Started": currentGroup === "Getting Started",
    Core: currentGroup === "Core",
    Reading: currentGroup === "Reading",
    Speaking: currentGroup === "Speaking",
    Writing: currentGroup === "Writing",
    Other: currentGroup === "Other",
  }));

  const groupedSections = useMemo(() => {
    const map = new Map();
    sections.forEach((section) => {
      const group = getSectionGroup(section);
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(section);
    });
    return Array.from(map.entries());
  }, [sections]);

  return (
    <aside className="cp-sidebar">
      <div className="cp-sidebar-panel">
        <div className="cp-sidebar-heading">Edit on the pack</div>
        {canAnnotate ? (
          <>
            <div className="cp-tool-grid">
              {[
                ["select", "↖", "Pointer"],
                ["highlight", "▭", "Highlight"],
                ["text", "T", "Text"],
                ["pen", "✎", "Pen"],
              ].map(([value, icon, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`cp-tool-btn ${annotationMode === value ? "is-active" : ""}`}
                  onClick={() => setAnnotationMode(value)}
                  aria-label={label}
                  title={label}
                >
                  <span className="cp-tool-icon">{icon}</span>
                </button>
              ))}
            </div>
            <p className="cp-sidebar-empty" style={{ marginTop: 10 }}>
              Use `Text` to write directly on the page, `Highlight` for boxes, and `Pen` for circling or underlining.
            </p>
            {hasSelectedAnnotation ? (
              <button
                type="button"
                className="cp-tool-delete"
                onClick={onDeleteSelectedAnnotation}
              >
                Delete selected annotation
              </button>
            ) : null}
            <button
              type="button"
              className="cp-tool-delete"
              onClick={onClearPage}
              disabled={!canClearPage}
              style={!canClearPage ? { opacity: 0.45, cursor: "not-allowed" } : null}
            >
              Clear this page
            </button>
            {annotationMode === "text" ? (
              <>
                <div className="cp-style-block">
                  <div className="cp-style-label">Text colour</div>
                  <div className="cp-colour-row">
                    {["#161616", "#0f3d91", "#9f1d35", "#0c6b58"].map((colour) => (
                      <button
                        key={colour}
                        type="button"
                        className={`cp-colour-swatch ${textColor === colour ? "is-active" : ""}`}
                        style={{ background: colour }}
                        onClick={() => setTextColor(colour)}
                        aria-label="Text colour"
                      />
                    ))}
                  </div>
                </div>
                <div className="cp-style-block">
                  <div className="cp-style-label">Text size</div>
                  <div className="cp-size-row">
                    {[14, 16, 18, 22].map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`cp-size-btn ${textSize === size ? "is-active" : ""}`}
                        onClick={() => setTextSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {annotationMode === "pen" ? (
              <div className="cp-style-block">
                <div className="cp-style-label">Pen colour</div>
                <div className="cp-colour-row">
                  {["rgba(26, 26, 26, 0.82)", "rgba(15, 61, 145, 0.92)", "rgba(159, 29, 53, 0.92)", "rgba(12, 107, 88, 0.92)"].map((colour) => (
                    <button
                      key={colour}
                      type="button"
                      className={`cp-colour-swatch ${penColor === colour ? "is-active" : ""}`}
                      style={{ background: colour }}
                      onClick={() => setPenColor(colour)}
                      aria-label="Pen colour"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {annotationMode === "highlight" ? (
              <div className="cp-style-block">
                <div className="cp-style-label">Highlight colour</div>
                <div className="cp-colour-row">
                  {["rgba(255, 227, 92, 0.34)", "rgba(122, 214, 255, 0.28)", "rgba(255, 160, 203, 0.28)", "rgba(157, 235, 165, 0.30)"].map((colour) => (
                    <button
                      key={colour}
                      type="button"
                      className={`cp-colour-swatch ${highlightColor === colour ? "is-active" : ""}`}
                      style={{ background: colour }}
                      onClick={() => setHighlightColor(colour)}
                      aria-label="Highlight colour"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="cp-sidebar-empty">Sign in to write, highlight, and draw on the pack.</p>
        )}
      </div>

      <div className="cp-sidebar-panel">
        <div className="cp-sidebar-heading">Sections</div>
        <div className="cp-section-groups">
          {groupedSections.map(([group, groupSections]) => {
            const isOpen = !!openGroups[group];
            return (
              <div key={group} className="cp-section-group">
                <button
                  type="button"
                  className="cp-section-toggle"
                  onClick={() =>
                    setOpenGroups((current) => ({
                      ...current,
                      [group]: !current[group],
                    }))
                  }
                >
                  <span>{group}</span>
                  <span className="cp-section-toggle-icon">{isOpen ? "-" : "+"}</span>
                </button>
                {isOpen ? (
                  <div className="cp-sidebar-list">
                    {groupSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        className={`cp-sidebar-item ${currentSectionId === section.id ? "is-active" : ""}`}
                        onClick={() => onGoToPage(section.page)}
                      >
                        <span>{section.label}</span>
                        <span className="cp-sidebar-page">p. {section.page}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="cp-sidebar-panel">
        <div className="cp-sidebar-heading">Saved pages</div>
        {bookmarks.length ? (
          <div className="cp-bookmark-list">
            {bookmarks.map((page) => (
              <button
                key={page}
                type="button"
                className="cp-bookmark-item"
                onClick={() => onGoToPage(page)}
              >
                Page {page}
              </button>
            ))}
          </div>
        ) : (
          <p className="cp-sidebar-empty">Save pages here as you study.</p>
        )}
      </div>
    </aside>
  );
}
