import { useEffect, useMemo, useRef, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { Document, Page, pdfjs } from "react-pdf";
import { auth, fetchCoursePackAnnotations, saveCoursePackAnnotations, storage } from "../../firebase";
import CoursePackControls from "./CoursePackControls";
import CoursePackSidebar from "./CoursePackSidebar";
import CoursePackAnnotationLayer from "./CoursePackAnnotationLayer";
import {
  COURSE_PACK_SECTIONS,
  COURSE_PACK_TOTAL_PAGES,
  getCoursePackSectionForPage,
} from "./coursePackSections";
import useCoursePackState from "../../hooks/useCoursePackState";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const COURSE_PACK_URL_CACHE_VERSION = "2";

export default function CoursePackViewer() {
  const [sectionUrl, setSectionUrl] = useState(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [wrapWidth, setWrapWidth] = useState(null);
  const [overlayWidth, setOverlayWidth] = useState(null);
  const [pageContentMinHeight, setPageContentMinHeight] = useState(null);
  const [pageInput, setPageInput] = useState("1");
  const [annotationMode, setAnnotationMode] = useState("select");
  const [annotations, setAnnotations] = useState([]);
  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [annotationsReadyPage, setAnnotationsReadyPage] = useState(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [textColor, setTextColor] = useState("#161616");
  const [penColor, setPenColor] = useState("rgba(26, 26, 26, 0.82)");
  const [highlightColor, setHighlightColor] = useState("rgba(255, 227, 92, 0.34)");
  const [textSize, setTextSize] = useState(16);

  const wrapRef = useRef(null);
  const scrollRef = useRef(null);
  const pageCardRef = useRef(null);
  const pageContentRef = useRef(null);
  const overlayWrapRef = useRef(null);
  const overlayScrollRef = useRef(null);
  const restoredStateRef = useRef(false);
  const pendingViewportTopRef = useRef(null);

  const {
    bookmarks,
    savedPage,
    savedZoom,
    hasSavedProgress,
    setSavedPage,
    setSavedZoom,
    setSavedSectionId,
    toggleBookmark,
    recordRecentPage,
  } = useCoursePackState();

  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
  const isZoomedOut = zoom <= 1;
  const canAnnotate = !!auth.currentUser;
  const currentSection = useMemo(() => getCoursePackSectionForPage(page), [page]);
  const sectionPageNumber = useMemo(
    () => Math.max(1, page - (currentSection?.startPage || 1) + 1),
    [currentSection?.startPage, page]
  );
  const isBookmarked = bookmarks.includes(page);

  useEffect(() => {
    if (restoredStateRef.current) return;
    setPage(savedPage || 1);
    setZoom(savedZoom || 1);
    restoredStateRef.current = true;
  }, [savedPage, savedZoom]);

  useEffect(() => {
    setSavedPage(page);
    setSavedZoom(zoom);
    setSavedSectionId(currentSection?.id || null);
    recordRecentPage(page);
  }, [currentSection?.id, page, setSavedPage, setSavedSectionId, setSavedZoom, zoom]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setAnnotationsReadyPage(null);

    if (!canAnnotate) {
      setAnnotationsLoading(false);
      setAnnotationsReadyPage(page);
      return undefined;
    }

    setAnnotationsLoading(true);
    (async () => {
      try {
        const nextAnnotations = await fetchCoursePackAnnotations(page);
        if (!cancelled) {
          setAnnotations(nextAnnotations);
          setAnnotationsReadyPage(page);
        }
      } catch (e) {
        console.error("Course pack annotations load failed:", e);
        if (!cancelled) {
          setAnnotations([]);
          setAnnotationsReadyPage(page);
        }
      } finally {
        if (!cancelled) setAnnotationsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canAnnotate, page]);

  useEffect(() => {
    if (!canAnnotate) return undefined;
    if (annotationsReadyPage !== page) return undefined;

    const timeoutId = window.setTimeout(() => {
      saveCoursePackAnnotations(page, annotations).catch((e) => {
        console.error("Course pack annotations save failed:", e);
      });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [annotations, annotationsReadyPage, canAnnotate, page]);

  useEffect(() => {
    const cacheKey = currentSection
      ? `coursepack-url:${COURSE_PACK_URL_CACHE_VERSION}:${currentSection.id}`
      : null;
    setSectionUrl(null);
    setError("");

    (async () => {
      try {
        if (!currentSection) return;
        if (cacheKey && typeof window !== "undefined") {
          const cached = window.sessionStorage.getItem(cacheKey);
          if (cached) {
            setSectionUrl(cached);
            return;
          }
        }
        const fileRef = ref(storage, currentSection.storagePath);
        const downloadUrl = await getDownloadURL(fileRef);
        if (cacheKey && typeof window !== "undefined") {
          window.sessionStorage.setItem(cacheKey, downloadUrl);
        }
        setSectionUrl(downloadUrl);
      } catch (e) {
        console.error("Firebase Error:", e);
        setError("Unable to load the course pack.");
      }
    })();
  }, [currentSection]);

  useEffect(() => {
    const updateWidth = () => {
      if (!wrapRef.current) return;
      const currentWidth = wrapRef.current.clientWidth;
      const newWidth = Math.floor(currentWidth - 32);
      if (newWidth > 0) setWrapWidth(newWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    window.addEventListener("orientationchange", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("orientationchange", updateWidth);
    };
  }, [sectionUrl]);

  useEffect(() => {
    if (!isOverlayOpen) return;
    const updateOverlayWidth = () => {
      if (!overlayWrapRef.current) return;
      const currentWidth = overlayWrapRef.current.clientWidth;
      const newWidth = Math.floor(currentWidth - 36);
      if (newWidth > 0) setOverlayWidth(newWidth);
    };

    updateOverlayWidth();
    window.addEventListener("resize", updateOverlayWidth);
    window.addEventListener("orientationchange", updateOverlayWidth);
    return () => {
      window.removeEventListener("resize", updateOverlayWidth);
      window.removeEventListener("orientationchange", updateOverlayWidth);
    };
  }, [isOverlayOpen]);

  useEffect(() => {
    if (!isOverlayOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOverlayOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOverlayOpen]);

  const clampPage = (n) => {
    return Math.max(1, Math.min(COURSE_PACK_TOTAL_PAGES, n));
  };

  const goToPage = (n) => {
    const target = clampPage(n);
    if (typeof window !== "undefined" && pageCardRef.current) {
      pendingViewportTopRef.current = pageCardRef.current.getBoundingClientRect().top;
    }
    if (pageContentRef.current) {
      setPageContentMinHeight(pageContentRef.current.getBoundingClientRect().height);
    }
    setPage(target);
    requestAnimationFrame(() => {
      overlayScrollRef.current?.scrollTo({ left: 0, top: 0, behavior: "auto" });
    });
  };

  const restoreCardViewportPosition = () => {
    if (typeof window === "undefined") return;
    if (pendingViewportTopRef.current == null || !pageCardRef.current) return;
    const currentTop = pageCardRef.current.getBoundingClientRect().top;
    const delta = currentTop - pendingViewportTopRef.current;
    if (Math.abs(delta) > 1) {
      window.scrollBy({ left: 0, top: delta, behavior: "auto" });
    }
    pendingViewportTopRef.current = null;
    setPageContentMinHeight(null);
  };

  useEffect(() => {
    if (pendingViewportTopRef.current == null || typeof window === "undefined") return;
    requestAnimationFrame(() => {
      restoreCardViewportPosition();
    });
  }, [page]);

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(COURSE_PACK_TOTAL_PAGES, p + 1));

  const resetZoom = () => {
    setZoom(1);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ left: 0, top: 0, behavior: "auto" });
    });
  };

  const resetOverlayPan = () => {
    requestAnimationFrame(() => {
      overlayScrollRef.current?.scrollTo({ left: 0, top: 0, behavior: "auto" });
    });
  };

  const openOverlay = () => {
    setIsOverlayOpen(true);
    requestAnimationFrame(() => resetOverlayPan());
  };

  const closeOverlay = () => setIsOverlayOpen(false);

  const makeAnnotationId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `cp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  const addAnnotation = (annotation) => {
    const next = {
      id: makeAnnotationId(),
      color:
        annotation.type === "text"
          ? textColor
          : annotation.type === "pen"
            ? penColor
            : annotation.type === "highlight"
              ? highlightColor
              : undefined,
      fontSize: annotation.type === "text" ? textSize : undefined,
      ...annotation,
    };
    setAnnotations((current) => [...current, next]);
    setSelectedAnnotationId(next.id);
  };

  const updateAnnotation = (id, patch) => {
    setAnnotations((current) =>
      current.map((annotation) => (annotation.id === id ? { ...annotation, ...patch } : annotation))
    );
  };

  const deleteAnnotation = (id) => {
    setAnnotations((current) => current.filter((annotation) => annotation.id !== id));
    setSelectedAnnotationId((current) => (current === id ? null : current));
  };

  const clearPageAnnotations = () => {
    setAnnotations([]);
    setSelectedAnnotationId(null);
  };

  useEffect(() => {
    const selected = annotations.find((annotation) => annotation.id === selectedAnnotationId);
    if (!selected) return;
    if (selected.type === "text") {
      if (selected.color) setTextColor(selected.color);
      if (selected.fontSize) setTextSize(selected.fontSize);
    }
    if (selected.type === "pen" && selected.color) setPenColor(selected.color);
    if (selected.type === "highlight" && selected.color) setHighlightColor(selected.color);
  }, [annotations, selectedAnnotationId]);

  useEffect(() => {
    const selected = annotations.find((annotation) => annotation.id === selectedAnnotationId);
    if (selected?.type === "text") updateAnnotation(selected.id, { color: textColor, fontSize: textSize });
  }, [textColor, textSize]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const selected = annotations.find((annotation) => annotation.id === selectedAnnotationId);
    if (selected?.type === "pen") updateAnnotation(selected.id, { color: penColor });
  }, [penColor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const selected = annotations.find((annotation) => annotation.id === selectedAnnotationId);
    if (selected?.type === "highlight") updateAnnotation(selected.id, { color: highlightColor });
  }, [highlightColor]); // eslint-disable-line react-hooks/exhaustive-deps

  const ui = {
    bar: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
      flexWrap: "wrap",
    },
    btn: {
      padding: "6px 10px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.18)",
      color: "white",
      fontSize: 13,
      lineHeight: 1,
      cursor: "pointer",
      userSelect: "none",
    },
    btnSoft: {
      background: "rgba(0,0,0,0.12)",
    },
    btnIcon: {
      padding: "6px 8px",
      minWidth: 40,
      textAlign: "center",
      fontWeight: 700,
    },
    btnPrimary: {
      background: "rgba(255,255,255,0.10)",
      border: "1px solid rgba(255,255,255,0.22)",
    },
    disabled: {
      opacity: 0.45,
      cursor: "not-allowed",
    },
    pill: {
      padding: "7px 10px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.18)",
      color: "white",
      fontSize: 13,
      lineHeight: 1,
    },
    input: {
      width: 60,
      padding: "7px 8px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.18)",
      color: "white",
      textAlign: "center",
      fontSize: 13,
      lineHeight: 1,
      outline: "none",
    },
    select: {
      padding: "7px 10px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.18)",
      color: "white",
      fontSize: 13,
      lineHeight: 1,
      maxWidth: 180,
    },
    divider: {
      width: 1,
      height: 22,
      background: "rgba(255,255,255,0.18)",
      margin: "0 2px",
    },
    label: {
      minWidth: 54,
      textAlign: "center",
      opacity: 0.9,
      fontSize: 13,
    },
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100vw",
        margin: "0 auto",
        color: "white",
      }}
    >
      <style>{`
        .cp-layout {
          display: grid;
          gap: 16px;
          align-items: start;
        }
        .cp-sidebar {
          display: grid;
          gap: 12px;
          align-self: start;
        }
        .cp-sidebar-panel {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px;
        }
        .cp-sidebar-heading {
          font-size: 0.9rem;
          font-weight: 700;
          color: rgba(255,255,255,0.86);
          margin-bottom: 10px;
        }
        .cp-sidebar-list,
        .cp-bookmark-list {
          display: grid;
          gap: 8px;
        }
        .cp-sidebar-item,
        .cp-bookmark-item {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.16);
          color: white;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .cp-sidebar-item.is-active {
          background: rgba(246,183,60,0.14);
          border-color: rgba(246,183,60,0.35);
        }
        .cp-sidebar-page {
          color: rgba(255,255,255,0.66);
          white-space: nowrap;
        }
        .cp-sidebar-empty {
          margin: 0;
          color: rgba(255,255,255,0.68);
          font-size: 0.92rem;
          line-height: 1.4;
        }
        .cp-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .cp-status-copy {
          display: grid;
          gap: 4px;
        }
        .cp-status-copy strong {
          font-size: 1rem;
        }
        .cp-status-copy span {
          color: rgba(255,255,255,0.7);
          font-size: 0.92rem;
        }
        .cp-page-nav-edge {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 72px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(16, 26, 52, 0.88);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          z-index: 3;
          box-shadow: 0 12px 28px rgba(0,0,0,0.22);
        }
        .cp-page-nav-edge.is-left {
          left: 8px;
        }
        .cp-page-nav-edge.is-right {
          right: 8px;
        }
        .cp-page-nav-edge:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        .cp-tool-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .cp-tool-btn,
        .cp-tool-delete,
        .cp-section-toggle {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.16);
          color: white;
          cursor: pointer;
        }
        .cp-tool-btn.is-active {
          background: rgba(246,183,60,0.14);
          border-color: rgba(246,183,60,0.35);
        }
        .cp-tool-icon {
          display: inline-flex;
          width: 100%;
          justify-content: center;
          align-items: center;
          font-size: 1.15rem;
          line-height: 1;
        }
        .cp-tool-delete {
          margin-top: 10px;
        }
        .cp-style-block {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }
        .cp-style-label {
          font-size: 0.84rem;
          color: rgba(255,255,255,0.78);
        }
        .cp-colour-row,
        .cp-size-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cp-colour-swatch,
        .cp-size-btn {
          border: 1px solid rgba(255,255,255,0.14);
          cursor: pointer;
        }
        .cp-colour-swatch {
          width: 26px;
          height: 26px;
          border-radius: 999px;
        }
        .cp-colour-swatch.is-active,
        .cp-size-btn.is-active {
          box-shadow: 0 0 0 2px rgba(246,183,60,0.55);
        }
        .cp-size-btn {
          padding: 7px 10px;
          border-radius: 10px;
          background: rgba(0,0,0,0.16);
          color: white;
        }
        .cp-section-groups {
          display: grid;
          gap: 10px;
        }
        .cp-section-group {
          display: grid;
          gap: 8px;
        }
        .cp-section-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
        }
        .cp-section-toggle-icon {
          color: rgba(255,255,255,0.74);
          min-width: 14px;
          text-align: right;
        }
        .cp-status-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cp-resume-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(246,183,60,0.26);
          background: rgba(246,183,60,0.08);
        }
        .cp-resume-copy {
          display: grid;
          gap: 4px;
        }
        .cp-resume-copy strong {
          font-size: 0.98rem;
        }
        .cp-resume-copy span {
          color: rgba(255,255,255,0.76);
          font-size: 0.92rem;
        }
        @media (min-width: 980px) {
          .cp-layout {
            grid-template-columns: 280px minmax(0, 1fr);
          }
          .cp-sidebar {
            position: sticky;
            top: 28px;
          }
        }
      `}</style>

      <div style={{ padding: "10px", maxWidth: 1320, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 15 }}>Seif Aptis Trainer Pack</h2>

        <div className="cp-layout">
          <CoursePackSidebar
            sections={COURSE_PACK_SECTIONS}
            currentSectionId={currentSection?.id}
            bookmarks={bookmarks}
            onGoToPage={goToPage}
            canAnnotate={canAnnotate}
            annotationMode={annotationMode}
            setAnnotationMode={setAnnotationMode}
            hasSelectedAnnotation={!!selectedAnnotationId}
            onDeleteSelectedAnnotation={() => deleteAnnotation(selectedAnnotationId)}
            onClearPage={clearPageAnnotations}
            canClearPage={annotations.length > 0}
            textColor={textColor}
            setTextColor={setTextColor}
            penColor={penColor}
            setPenColor={setPenColor}
            highlightColor={highlightColor}
            setHighlightColor={setHighlightColor}
            textSize={textSize}
            setTextSize={setTextSize}
          />

          <div>
            <CoursePackControls
              page={page}
              numPages={COURSE_PACK_TOTAL_PAGES}
              pageInput={pageInput}
              setPageInput={setPageInput}
              goToPage={goToPage}
              prevPage={prevPage}
              nextPage={nextPage}
              sections={COURSE_PACK_SECTIONS}
              zoom={zoom}
              setZoom={setZoom}
              resetZoom={resetZoom}
              openOverlay={openOverlay}
              currentSection={currentSection}
              isBookmarked={isBookmarked}
              onToggleBookmark={() => toggleBookmark(page)}
              onResume={() => goToPage(savedPage)}
              hasSavedProgress={hasSavedProgress}
              savedPage={savedPage}
              savedZoom={savedZoom}
              ui={ui}
            />

            <div
              ref={(node) => {
                pageCardRef.current = node;
                wrapRef.current = node;
              }}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "12px",
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
                position: "relative",
              }}
              >
                <button
                  type="button"
                  className="cp-page-nav-edge is-left"
                  onClick={prevPage}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  title="Previous page"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="cp-page-nav-edge is-right"
                  onClick={nextPage}
                  disabled={page >= COURSE_PACK_TOTAL_PAGES}
                  aria-label="Next page"
                  title="Next page"
                >
                  ›
                </button>
                <div
                  ref={scrollRef}
                style={{
                  width: "100%",
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                  display: "flex",
                  justifyContent: isZoomedOut ? "center" : "flex-start",
                  alignItems: "flex-start",
                }}
                >
                  <div
                    ref={pageContentRef}
                    style={{
                      width: "fit-content",
                      position: "relative",
                      minHeight: pageContentMinHeight ? `${pageContentMinHeight}px` : undefined,
                    }}
                  >
                    {error ? (
                      <div style={{ padding: 20, color: "#ffb4b4" }}>{error}</div>
                    ) : !sectionUrl ? (
                      <div style={{ padding: 20, color: "white" }}>Loading section...</div>
                    ) : (
                      <Document
                        file={sectionUrl}
                        onLoadSuccess={() => {}}
                        loading={<div style={{ padding: 20 }}>Loading PDF...</div>}
                      >
                        {wrapWidth && (
                          <Page
                            key={`page_${currentSection?.id}_${sectionPageNumber}_${zoom}_${wrapWidth}`}
                            pageNumber={sectionPageNumber}
                            width={wrapWidth}
                            scale={zoom}
                            onRenderSuccess={restoreCardViewportPosition}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            devicePixelRatio={dpr}
                          />
                        )}
                      </Document>
                    )}
                    {!error && sectionUrl && wrapWidth ? (
                      <CoursePackAnnotationLayer
                        annotations={annotations}
                        mode={annotationMode}
                        selectedId={selectedAnnotationId}
                        onSelect={setSelectedAnnotationId}
                        onAddAnnotation={addAnnotation}
                        onUpdateAnnotation={updateAnnotation}
                        onDeleteAnnotation={deleteAnnotation}
                      />
                    ) : null}
                    {annotationsLoading && canAnnotate ? (
                      <div
                        style={{
                          position: "absolute",
                          right: 10,
                          bottom: 10,
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(0,0,0,0.62)",
                          color: "white",
                          fontSize: 12,
                        }}
                      >
                        Loading annotations…
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>

      {isOverlayOpen && (
        <div
          onClick={closeOverlay}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            padding: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1600px, 100%)",
              height: "min(92dvh, 100%)",
              background: "rgba(20,20,20,0.98)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.10)",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                {currentSection?.label || "Seif Aptis Trainer Pack"} — Page {page}
                {COURSE_PACK_TOTAL_PAGES ? ` / ${COURSE_PACK_TOTAL_PAGES}` : ""}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={prevPage}
                  disabled={page <= 1}
                  style={{ ...ui.btn, ...(page <= 1 ? ui.disabled : null) }}
                >
                  Prev
                </button>

                <button
                  onClick={nextPage}
                  disabled={page >= COURSE_PACK_TOTAL_PAGES}
                  style={{
                    ...ui.btn,
                    ...ui.btnPrimary,
                    ...(page >= COURSE_PACK_TOTAL_PAGES ? ui.disabled : null),
                  }}
                >
                  Next
                </button>

                <button
                  onClick={() => toggleBookmark(page)}
                  style={{ ...ui.btn, ...(isBookmarked ? ui.btnPrimary : ui.btnSoft) }}
                >
                  {isBookmarked ? "Saved" : "Save page"}
                </button>

                <div style={ui.divider} />

                <button
                  onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))}
                  style={{ ...ui.btn, ...ui.btnIcon }}
                  aria-label="Zoom out"
                >
                  –
                </button>

                <span style={ui.label}>{Math.round(zoom * 100)}%</span>

                <button
                  onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(1)))}
                  style={{ ...ui.btn, ...ui.btnIcon }}
                  aria-label="Zoom in"
                >
                  +
                </button>

                <button
                  onClick={() => {
                    setZoom(1);
                    resetOverlayPan();
                  }}
                  style={{ ...ui.btn, ...ui.btnSoft }}
                >
                  Reset
                </button>

                <div style={ui.divider} />

                <button onClick={closeOverlay} style={{ ...ui.btn, ...ui.btnSoft }}>
                  Close
                </button>
              </div>
            </div>

            <div ref={overlayWrapRef} style={{ padding: 12, flex: 1, minHeight: 0 }}>
              <div
                ref={overlayScrollRef}
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                  display: "flex",
                  justifyContent: isZoomedOut ? "center" : "flex-start",
                  alignItems: "flex-start",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 12,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ width: "fit-content", position: "relative" }}>
                  {error ? (
                    <div style={{ padding: 20, color: "#ffb4b4" }}>{error}</div>
                  ) : !sectionUrl ? (
                    <div style={{ padding: 20, color: "white" }}>Loading section...</div>
                  ) : (
                    <Document file={sectionUrl} loading={<div style={{ padding: 20 }}>Loading PDF...</div>}>
                      {overlayWidth && (
                        <Page
                          key={`overlay_${currentSection?.id}_${sectionPageNumber}_${zoom}_${overlayWidth}`}
                          pageNumber={sectionPageNumber}
                          width={overlayWidth}
                          scale={zoom}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          devicePixelRatio={dpr}
                        />
                      )}
                    </Document>
                  )}
                  {!error && sectionUrl && overlayWidth ? (
                    <CoursePackAnnotationLayer
                      annotations={annotations}
                      mode={annotationMode}
                      selectedId={selectedAnnotationId}
                      onSelect={setSelectedAnnotationId}
                      onAddAnnotation={addAnnotation}
                      onUpdateAnnotation={updateAnnotation}
                      onDeleteAnnotation={deleteAnnotation}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
