import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../firebase";
import { Document, Page, pdfjs } from "react-pdf";

// CDN worker for stability
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CoursePackViewer() {
  const [url, setUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const wrapRef = useRef(null);
  const scrollRef = useRef(null);

  // Overlay refs
  const overlayWrapRef = useRef(null);
  const overlayScrollRef = useRef(null);

  const [wrapWidth, setWrapWidth] = useState(null);
  const [overlayWidth, setOverlayWidth] = useState(null);

  // ✅ Jump-to-page state MUST be up here with other hooks
  const [pageInput, setPageInput] = useState("1");

  const isZoomedOut = zoom < 1;

  const SECTIONS = [
    { label: "Introduction", page: 2 },
    { label: "Core: Grammar", page: 6 },
    { label: "Core: Vocab", page: 16 },
    { label: "Reading: Part 1", page: 21 },
  ];

  // Safer DPR
  const dpr =
    typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;

  // Keep input in sync with current page
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const clampPage = (n) => {
    const max = numPages || 999999;
    return Math.max(1, Math.min(max, n));
  };

  const goToPage = (n) => {
    const target = clampPage(n);
    setPage(target);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ left: 0, top: 0, behavior: "auto" });
      overlayScrollRef.current?.scrollTo({ left: 0, top: 0, behavior: "auto" });
    });
  };

  // Load PDF URL from Firebase
  useEffect(() => {
    (async () => {
      try {
        const fileRef = ref(storage, "packs/seif-pack-v1/seif_aptis_trainer.pdf");
        const downloadUrl = await getDownloadURL(fileRef);
        setUrl(downloadUrl);
      } catch (e) {
        console.error("Firebase Error:", e);
        setError("Unable to load the course pack.");
      }
    })();
  }, []);

  // Measure in-page width
  useEffect(() => {
    const updateWidth = () => {
      if (!wrapRef.current) return;
      const currentWidth = wrapRef.current.clientWidth;
      const newWidth = Math.floor(currentWidth - 20); // padding 10px L/R
      if (newWidth > 0) setWrapWidth(newWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    window.addEventListener("orientationchange", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("orientationchange", updateWidth);
    };
  }, [url]);

  // Measure overlay width (only while open)
  useEffect(() => {
    if (!isOverlayOpen) return;

    const updateOverlayWidth = () => {
      if (!overlayWrapRef.current) return;
      const currentWidth = overlayWrapRef.current.clientWidth;
      const newWidth = Math.floor(currentWidth - 24); // padding 12px L/R
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

  // Close overlay on Escape
  useEffect(() => {
    if (!isOverlayOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOverlayOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOverlayOpen]);

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

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));

    // --- compact control styles (drop-in) ---
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

  // ✅ Now it's safe to return early
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  if (!url) return <div style={{ padding: 20, color: "white" }}>Loading...</div>;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        margin: "0 auto",
        color: "white",
      }}
    >
      <div ref={wrapRef} style={{ padding: "10px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 15 }}>Seif Aptis Trainer Pack</h2>

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

  {/* Jump */}
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
    {SECTIONS.map((s) => (
      <option key={s.label} value={s.page}>
        {s.label} (p. {s.page})
      </option>
    ))}
  </select>

  <div style={ui.divider} />

  {/* Zoom */}
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

        {/* Card Frame */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "12px",
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
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
            <div style={{ width: "fit-content" }}>
              <Document
                file={url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div style={{ padding: 20 }}>Loading PDF...</div>}
              >
                {wrapWidth && (
                  <Page
                    key={`page_${page}_${zoom}_${wrapWidth}`}
                    pageNumber={page}
                    width={wrapWidth}
                    scale={zoom}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    devicePixelRatio={dpr}
                  />
                )}
              </Document>
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN OVERLAY */}
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
      {/* Top bar */}
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
          Seif Aptis Trainer Pack — Page {page}
          {numPages ? ` / ${numPages}` : ""}
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
            disabled={!!numPages && page >= numPages}
            style={{
              ...ui.btn,
              ...ui.btnPrimary,
              ...(!!numPages && page >= numPages ? ui.disabled : null),
            }}
          >
            Next
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

            {/* Viewer */}
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
                <div style={{ width: "fit-content" }}>
                  <Document file={url} loading={<div style={{ padding: 20 }}>Loading PDF...</div>}>
                    {overlayWidth && (
                      <Page
                        key={`overlay_${page}_${zoom}_${overlayWidth}`}
                        pageNumber={page}
                        width={overlayWidth}
                        scale={zoom}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        devicePixelRatio={dpr}
                      />
                    )}
                  </Document>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
