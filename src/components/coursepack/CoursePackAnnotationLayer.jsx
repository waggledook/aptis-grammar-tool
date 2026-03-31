import { useMemo, useRef, useState } from "react";

function clampUnit(value) {
  return Math.max(0, Math.min(1, value));
}

function pxToFraction(value, total) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return clampUnit(value / total);
}

function createSelectionBox(start, end) {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const right = Math.max(start.x, end.x);
  const bottom = Math.max(start.y, end.y);
  return {
    x: clampUnit(left),
    y: clampUnit(top),
    w: clampUnit(right - left),
    h: clampUnit(bottom - top),
  };
}

export default function CoursePackAnnotationLayer({
  annotations,
  mode,
  selectedId,
  onSelect,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
}) {
  const overlayRef = useRef(null);
  const [draftHighlight, setDraftHighlight] = useState(null);
  const [draftPenPoints, setDraftPenPoints] = useState(null);
  const [dragTextState, setDragTextState] = useState(null);

  const sortedAnnotations = useMemo(
    () =>
      [...annotations].sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === "highlight" ? -1 : 1;
      }),
    [annotations]
  );

  const toSvgPath = (points) => {
    if (!Array.isArray(points) || !points.length) return "";
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x * 100} ${point.y * 100}`)
      .join(" ");
  };

  const readPoint = (event) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: clampUnit((event.clientX - rect.left) / rect.width),
      y: clampUnit((event.clientY - rect.top) / rect.height),
    };
  };

  const handleMouseDown = (event) => {
    if (event.button !== 0) return;
    const point = readPoint(event);
    if (!point) return;
    if (mode === "highlight") {
      event.preventDefault();
      onSelect(null);
      setDraftHighlight({ start: point, end: point });
      return;
    }
    if (mode === "pen") {
      event.preventDefault();
      onSelect(null);
      setDraftPenPoints([point]);
    }
  };

  const handleMouseMove = (event) => {
    const point = readPoint(event);
    if (!point) return;
    if (dragTextState) {
      event.preventDefault();
      const nextX = clampUnit(point.x - dragTextState.offsetX);
      const nextY = clampUnit(point.y - dragTextState.offsetY);
      onUpdateAnnotation(dragTextState.id, {
        x: Math.min(nextX, 1 - (dragTextState.w || 0)),
        y: Math.min(nextY, 1 - (dragTextState.h || 0)),
      });
      return;
    }
    if (draftHighlight) {
      event.preventDefault();
      setDraftHighlight((current) => (current ? { ...current, end: point } : current));
      return;
    }
    if (draftPenPoints) {
      event.preventDefault();
      setDraftPenPoints((current) => (current ? [...current, point] : current));
    }
  };

  const finishPointerAction = () => {
    if (dragTextState) {
      setDragTextState(null);
    }
    if (draftHighlight) {
      const next = createSelectionBox(draftHighlight.start, draftHighlight.end);
      setDraftHighlight(null);
      if (next.w >= 0.01 && next.h >= 0.008) {
        onAddAnnotation({
          type: "highlight",
          ...next,
        });
      }
    }
    if (draftPenPoints) {
      const nextPoints = draftPenPoints;
      setDraftPenPoints(null);
      if (nextPoints.length >= 2) {
        onAddAnnotation({
          type: "pen",
          points: nextPoints,
        });
      }
    }
  };

  const handleClick = (event) => {
    if (mode !== "text") return;
    if (event.target !== overlayRef.current) return;
    const point = readPoint(event);
    if (!point) return;
    onAddAnnotation({
      type: "text",
      x: point.x,
      y: point.y,
      w: 0.12,
      h: 0.035,
      text: "",
    });
  };

  const highlightColor = (annotation) => annotation.color || "rgba(255, 227, 92, 0.34)";
  const penColor = (annotation) => annotation.color || "rgba(26, 26, 26, 0.82)";
  const textColor = (annotation) => annotation.color || "#161616";
  const textSize = (annotation) => annotation.fontSize || 16;

  const handleTextInput = (annotation, event) => {
    const element = event.currentTarget;
    element.style.height = "auto";
    element.style.height = `${Math.max(24, element.scrollHeight)}px`;
    const rect = overlayRef.current?.getBoundingClientRect();
    const nextWidth = rect
      ? clampUnit(Math.max(110, Math.min(rect.width * 0.65, element.scrollWidth + 16)) / rect.width)
      : annotation.w;
    onUpdateAnnotation(annotation.id, {
      text: element.value,
      w: nextWidth,
      h: rect ? pxToFraction(element.offsetHeight, rect.height) : annotation.h,
    });
  };

  const syncTextBoxSize = (annotation, element) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    onUpdateAnnotation(annotation.id, {
      w: pxToFraction(element.offsetWidth, rect.width),
      h: pxToFraction(element.offsetHeight, rect.height),
    });
  };

  const handleTextMouseDown = (annotation, event) => {
    if (mode !== "select") {
      event.stopPropagation();
      return;
    }
    const point = readPoint(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(annotation.id);
    setDragTextState({
      id: annotation.id,
      offsetX: point.x - annotation.x,
      offsetY: point.y - annotation.y,
      w: annotation.w || 0.12,
      h: annotation.h || 0.028,
    });
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={finishPointerAction}
      onMouseLeave={finishPointerAction}
      onClick={handleClick}
      style={{
        position: "absolute",
        inset: 0,
        cursor:
          mode === "highlight" || mode === "pen"
            ? "crosshair"
            : mode === "text"
              ? "text"
              : "default",
        userSelect: "none",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        {sortedAnnotations
          .filter((annotation) => annotation.type === "pen")
          .map((annotation) => (
            <path
              key={annotation.id}
              d={toSvgPath(annotation.points)}
              fill="none"
              stroke={selectedId === annotation.id ? "rgba(23, 94, 255, 0.95)" : penColor(annotation)}
              strokeWidth={selectedId === annotation.id ? 0.7 : 0.52}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        {draftPenPoints?.length ? (
          <path
            d={toSvgPath(draftPenPoints)}
            fill="none"
            stroke="rgba(26, 26, 26, 0.72)"
            strokeWidth={0.52}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>

      {sortedAnnotations.map((annotation) => {
        if (annotation.type === "pen") {
          const points = annotation.points || [];
          const xs = points.map((point) => point.x);
          const ys = points.map((point) => point.y);
          const minX = xs.length ? Math.min(...xs) : 0;
          const maxX = xs.length ? Math.max(...xs) : 0;
          const minY = ys.length ? Math.min(...ys) : 0;
          const maxY = ys.length ? Math.max(...ys) : 0;
          const padding = 0.01;

          return (
            <button
              key={annotation.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(annotation.id);
              }}
              style={{
                position: "absolute",
                left: `${Math.max(0, minX - padding) * 100}%`,
                top: `${Math.max(0, minY - padding) * 100}%`,
                width: `${Math.min(1, maxX - minX + padding * 2) * 100}%`,
                height: `${Math.min(1, maxY - minY + padding * 2) * 100}%`,
                background: "transparent",
                border: selectedId === annotation.id ? "1px dashed rgba(23, 94, 255, 0.6)" : "1px dashed transparent",
                padding: 0,
                cursor: "pointer",
              }}
              aria-label="Pen annotation"
            />
          );
        }

        if (annotation.type === "highlight") {
          return (
            <button
              key={annotation.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(annotation.id);
              }}
              style={{
                position: "absolute",
                left: `${annotation.x * 100}%`,
                top: `${annotation.y * 100}%`,
                width: `${(annotation.w || 0) * 100}%`,
                height: `${(annotation.h || 0) * 100}%`,
                background: highlightColor(annotation),
                border: selectedId === annotation.id ? "2px solid rgba(231, 179, 0, 0.95)" : "1px solid rgba(231, 179, 0, 0.42)",
                borderRadius: 4,
                padding: 0,
                cursor: "pointer",
              }}
              aria-label="Highlight annotation"
            />
          );
        }

        return (
          <textarea
            key={annotation.id}
            value={annotation.text || ""}
            rows={1}
            autoFocus={selectedId === annotation.id && mode === "text"}
            placeholder=""
            onClick={(event) => event.stopPropagation()}
            onFocus={() => onSelect(annotation.id)}
            readOnly={mode === "select"}
            onMouseDown={(event) => handleTextMouseDown(annotation, event)}
            onChange={(event) => handleTextInput(annotation, event)}
            onMouseUp={(event) => syncTextBoxSize(annotation, event.currentTarget)}
            onBlur={(event) => syncTextBoxSize(annotation, event.currentTarget)}
            style={{
              position: "absolute",
              left: `${annotation.x * 100}%`,
              top: `${annotation.y * 100}%`,
              transform: "translateY(-0.82em)",
              width: `${((annotation.w || 0.12) * 100).toFixed(2)}%`,
              minWidth: 110,
              minHeight: 24,
              height: `${((annotation.h || 0.028) * 100).toFixed(2)}%`,
              padding: "0 3px",
              border: selectedId === annotation.id ? "1px dashed rgba(20,20,20,0.65)" : "1px dashed transparent",
              background: "transparent",
              color: textColor(annotation),
              fontSize: `${textSize(annotation)}px`,
              lineHeight: 1.15,
              whiteSpace: "pre-wrap",
              resize: "none",
              overflow: "hidden",
              outline: "none",
              fontFamily: "inherit",
              cursor: mode === "select" ? "move" : "text",
            }}
          />
        );
      })}

      {draftHighlight ? (
        <div
          style={{
            position: "absolute",
            left: `${createSelectionBox(draftHighlight.start, draftHighlight.end).x * 100}%`,
            top: `${createSelectionBox(draftHighlight.start, draftHighlight.end).y * 100}%`,
            width: `${createSelectionBox(draftHighlight.start, draftHighlight.end).w * 100}%`,
            height: `${createSelectionBox(draftHighlight.start, draftHighlight.end).h * 100}%`,
            background: "rgba(255, 227, 92, 0.24)",
            border: "1px solid rgba(231, 179, 0, 0.55)",
            borderRadius: 4,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {selectedId ? (
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onDeleteAnnotation(selectedId);
          }}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.18)",
            background: "rgba(255,255,255,0.92)",
            color: "#222",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Delete selected
        </button>
      ) : null}
    </div>
  );
}
