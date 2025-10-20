import { useEffect, useMemo, useRef, useState } from "react";

// --- helpers -------------------------------------------------------------

function stripBidiControls(s = "") {
  return s.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
}

function setCaretToEnd(el) {
  const r = document.createRange();
  r.selectNodeContents(el);
  r.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}

// Ensure the editable has ONE paragraph as its only child.
// If empty, create <p dir="ltr"><br/></p>.
// If there are stray text nodes/divs, wrap/normalize into that <p>.
function ensureParagraph(host) {
  if (!host) return null;

  // nothing there? seed a fresh paragraph
  if (!host.firstChild) {
    const p = document.createElement("p");
    p.setAttribute("dir", "ltr");
    p.appendChild(document.createElement("br"));
    host.appendChild(p);
    return p;
  }

  // already a paragraph?
  if (host.childNodes.length === 1 && host.firstChild.nodeName === "P") {
    const p = host.firstChild;
    p.setAttribute("dir", "ltr");
    if (!p.firstChild) p.appendChild(document.createElement("br"));
    return p;
  }

  // otherwise wrap everything in a single paragraph
  const p = document.createElement("p");
  p.setAttribute("dir", "ltr");

  // move all existing nodes into the new <p>
  while (host.firstChild) {
    p.appendChild(host.firstChild);
  }

  // if it ended up empty, keep a <br/> for caret visibility
  if (!p.firstChild) p.appendChild(document.createElement("br"));
  host.appendChild(p);
  return p;
}

// Sanitize bidi controls in text nodes only (preserves selection)
function sanitizeTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const before = node.nodeValue || "";
    const after = stripBidiControls(before);
    if (after !== before) node.nodeValue = after;
  }
}

// --- component -----------------------------------------------------------

export default function RichTextExamEditor({
  valueHTML = "",
  placeholder = "Type your answer here...",
  onChange,
  minRows = 6,
  disabled = false,
  ariaLabel = "Writing editor",
}) {
  const ref = useRef(null);
  const [plainText, setPlainText] = useState("");

  const [, force] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onSel = () => force(n => n + 1); // re-render so toolbar "active" states refresh
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
  
    // if no initial HTML, seed a visible caret line
    if (!valueHTML || !valueHTML.trim()) {
      el.innerHTML = "<p dir='ltr'><br/></p>";
    } else {
      el.innerHTML = valueHTML;
    }
  
    sanitizeTextNodes(el);
    setCaretToEnd(el);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd) => {
    if (disabled) return;
    document.execCommand(cmd, false, null);
    // re-run our input logic after formatting
    ref.current?.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const handleInput = (e) => {
    const host = e.currentTarget;
  
    // only sanitize, don’t rewrap on every keystroke
    sanitizeTextNodes(host);
  
    // if the user deleted everything, seed an empty paragraph so caret is visible
    if (!host.textContent.trim()) {
      host.innerHTML = "<p dir='ltr'><br/></p>";
      setCaretToEnd(host);
    }
  
    // derive values
    const html = host.innerHTML;
    const text = (host.innerText || "").replace(/\s+/g, " ").trim();
  
    setPlainText(text);
    onChange?.({
      html,
      text,
      words: text ? text.split(/\b[\s\u00A0]+/u).filter(Boolean).length : 0,
    });
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const text = stripBidiControls(
      (e.clipboardData || window.clipboardData).getData("text") || ""
    );

    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    sel.deleteFromDocument();
    sel.getRangeAt(0).insertNode(document.createTextNode(text));
    sel.collapseToEnd();

    // normalize after paste
    const host = ref.current;
    const p = ensureParagraph(host);
    sanitizeTextNodes(p);

    host.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const words = useMemo(
    () => (plainText ? plainText.split(/\b[\s\u00A0]+/u).filter(Boolean).length : 0),
    [plainText]
  );

  return (
    <div className="exam-editor w-full">
      {/* toolbar */}
<div className="rte-toolbar">
  {[
    { label: "B", cmd: "bold", aria: "Bold" },
    { label: "I", cmd: "italic", aria: "Italic" },
    { label: "U", cmd: "underline", aria: "Underline" },
    { label: "S", cmd: "strikeThrough", aria: "Strikethrough" },
  ].map((b) => {
    const active =
      typeof document !== "undefined" &&
      document.queryCommandState &&
      document.queryCommandState(b.cmd);

    return (
      <button
        key={b.cmd}
        type="button"
        className={`rte-btn ${active ? "active" : ""}`}
        aria-label={b.aria}
        aria-pressed={!!active}
        // keep focus in the editor; don’t move caret
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => exec(b.cmd)}
        disabled={disabled}
        title={b.aria}
      >
        {b.label}
      </button>
    );
  })}
</div>

      {/* editable area */}
      <div
        ref={ref}
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline="true"
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        dir="ltr"
        spellCheck={true}
        lang="en"
        className="rte-editable w-full rounded-lg border p-3 outline-none bg-[#0f1b31] text-[#e6f0ff]"
        style={{
          minHeight: `${minRows * 24}px`,
          textAlign: "left",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          caretColor: "#e6f0ff",
        }}
        data-placeholder={placeholder}
      />

      <div className="mt-1 text-right text-sm opacity-70">Words {words}</div>

      <style>{`
        /* show placeholder only when really empty */
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          opacity: .5;
        }
        /* paragraphs inside the editor shouldn’t add spacing */
        .rte-editable p { margin: 0; }
      `}</style>
    </div>
  );
}
