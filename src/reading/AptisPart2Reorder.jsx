import React, { useMemo, useState, useEffect } from "react";
import { saveReadingCompletion, fetchReadingCompletions } from '../firebase';
import { toast } from "../utils/toast"; // your ToastHost helper

/**
 * Aptis Part 2 – Sentence Reordering (drag sentences into slots)
 * ---------------------------------------------------------------
 * • Two texts shown side‑by‑side.  
 * • Each text has N sentences; slot 0 is prefilled/locked ("first sentence is done for you").  
 * • Candidates drag remaining sentences from the pool (right) into the empty slots (left).  
 * • "Check" marks correct order; "Reset" clears attempts but keeps the first locked; "Shuffle" reshuffles pool.
 * • Keyboard support: use Move Up/Down buttons inside filled slots (for accessibility).
 * • No external libs; styles are scoped under `.aptis-reorder` to avoid global conflicts.
 *
 * Drop this component anywhere in your app (e.g., inside your `.game-wrapper`).
 *
 * Props (optional):
 *   - tasks: AptisReorderTask[] to override DEMO_TASKS
 */

// ---------- Types ----------
/** @typedef {{ id: string, text: string, order: number, fixed?: boolean }} Sentence */
/** @typedef {{ id: string, title: string, prompt?: string, sentences: Sentence[] }} TextSpec */
/** @typedef {{ id: string, title: string, intro?: string, texts: TextSpec[] }} AptisReorderTask */

// ---------- Demo dataset (inspired by your screenshots, paraphrased) ----------
const DEMO_TASKS /** @type {AptisReorderTask[]} */ = [
  {
    id: "cycling-lanes",
    title: "New cycling lanes in the city",
    texts: [
      {
        id: "t1",
        title: "Cycling lanes report",
        sentences: [
          {
            id: "intro1",
            text: "This report describes recent improvements to cycling infrastructure.",
            order: 0,
            fixed: true
          },
          { id: "a", text: "The lanes are separated from car traffic by low barriers to improve safety for cyclists.", order: 1 },
          { id: "b", text: "They can now travel directly from the suburbs into the city centre.", order: 2 },
          { id: "c", text: "Early surveys show a 40% increase in daily bike journeys.", order: 3 },
          { id: "d", text: "For this reason, we recommend extending the scheme to additional districts.", order: 4 },
          { id: "e", text: "Further monitoring will help us decide where such expansion is most urgent.", order: 5 }
        ]
      }
    ]
  },
  {
    id: "ebooks",
    title: "Borrowing e-books from the university library",
    texts: [
      {
        id: "t1",
        title: "Library instructions",
        sentences: [
          {
            id: "intro2",
            text: "Please follow these steps to access the new digital collection.",
            order: 0,
            fixed: true
          },
          { id: "a", text: "Log in with your student ID and password.", order: 1 },
          { id: "b", text: "Then, search the catalogue for the title you require.", order: 2 },
          { id: "c", text: "Click “Borrow e-book” and select your loan period.", order: 3 },
          { id: "d", text: "The system will confirm your loan and provide a download link.", order: 4 },
          { id: "e", text: "Remember to return the book digitally before the due date to avoid restrictions.", order: 5 }
        ]
      }
    ]
  },
  {
    id: "helen-graves",
    title: "Dr. Helen Graves",
    texts: [
      {
        id: "t1",
        title: "Biography",
        sentences: [
          {
            id: "intro3",
            text: "Helen Graves was born in 1974 in the northern city of Leeds.",
            order: 0,
            fixed: true
          },
          { id: "a", text: "She studied physics and mathematics at Oxford University.", order: 1 },
          { id: "b", text: "After completing her PhD, she worked on renewable energy projects in Germany.", order: 2 },
          { id: "c", text: "Her breakthrough paper on solar storage was published in 2005.", order: 3 },
          { id: "d", text: "Ten years later she received an award for outstanding contributions to science.", order: 4 },
          { id: "e", text: "Today, she combines research with advising governments on climate policy.", order: 5 }
        ]
      }
    ]
  },
  {
    id: "film-festival",
    title: "Submitting a film to the International Festival",
    texts: [
      {
        id: "t1",
        title: "Submission process",
        sentences: [
          {
            id: "intro4",
            text: "Please read these guidelines before sending your film to the committee.",
            order: 0,
            fixed: true
          },
          { id: "a", text: "Before beginning the process, ensure it is under 120 minutes and has English subtitles.", order: 1 },
          { id: "b", text: "Fill in the online application form with all required details.", order: 2 },
          { id: "c", text: "Once this is completed, upload a digital copy in one of the accepted formats.", order: 3 },
          { id: "d", text: "Pay the submission fee through the secure portal.", order: 4 },
          { id: "e", text: "Once this is received, you will receive an email confirmation and your application will be reviewed.", order: 5 }
        ]
      }
    ]
  },
  {
    id: "remote-work",
    title: "Productivity and remote work",
    texts: [
      {
        id: "t1",
        title: "Remote work report",
        sentences: [
          {
            id: "intro5",
            text: "This report presents findings from a recent survey of remote workers.",
            order: 0,
            fixed: true
          },
          { id: "a", text: "Respondents reported saving an average of 70 minutes a day on commuting.", order: 1 },
          { id: "b", text: "Many said they used the time for additional work or exercise.", order: 2 },
          { id: "c", text: "However, 35% noted that communication with colleagues had become more difficult.", order: 3 },
          { id: "d", text: "Similarly, managers highlighted challenges in monitoring progress fairly.", order: 4 },
          { id: "e", text: "Overall, the study concludes that hybrid arrangements may be the most effective.", order: 5 }
        ]
      }
    ]
  },
  {
    id: "plastic-reduction",
    title: "Plastic reduction initiative",
    texts: [
      {
        id: "t1",
        title: "Plastic reduction report",
        sentences: [
          {
            id: "intro6",
            text: "This report outlines measures taken to reduce plastic waste in our town.",
            order: 0,
            fixed: true
          },
          { id: "a", text: "Single-use bags have been banned in all major supermarkets.", order: 1 },
          { id: "b", text: "What is more, local cafés now provide discounts for customers bringing reusable cups.", order: 2 },
          { id: "c", text: "As a result, plastic consumption has dropped by 25% in the last year.", order: 3 },
          { id: "d", text: "Nevertheless, many smaller shops still rely heavily on plastic packaging.", order: 4 },
          { id: "e", text: "For this reason, we recommend launching an education campaign to raise awareness.", order: 5 }
        ]
      }
    ]
  }
];

  

// ---------- Helpers ----------
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Creates a scrambled pool excluding fixed items; returns {boardSlots, pool} */
function buildBoard(sentences) {
    const size = sentences.length;
    const boardSlots = Array(size).fill(null);
    const pool = [];
  
    sentences.forEach((s) => {
      if (s.fixed) {
        // Always place fixed sentences in their slot
        boardSlots[s.order] = s;
      } else {
        // All others go to the pool (not prefilled)
        pool.push(s);
      }
    });
  
    return { boardSlots, pool: shuffleArray(pool) };
  }

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// ---------- Reorder list with slots + pool (per text) ----------
function TextReorder({ spec, onChangeCheck }) {
  const [state, setState] = useState(() => buildBoard(spec.sentences));
  const [feedback, setFeedback] = useState(null); // array<boolean | null>

  const correctOrder = useMemo(
    () => spec.sentences.slice().sort((a,b) => a.order - b.order).map(s => s.id),
    [spec]
  );

  function reset(shuffle = true) {
    setState(prev => {
      const rebuilt = buildBoard(spec.sentences);
      return { ...rebuilt, pool: shuffle ? rebuilt.pool : rebuilt.pool };
    });
    setFeedback(null);
  }

  function onDropToSlot(slotIndex, item) {
    setState(prev => {
      const next = deepClone(prev);
      // If slot is locked (has fixed sentence), ignore
      const existing = next.boardSlots[slotIndex];
      if (existing && existing.fixed) return prev;

      // Remove item from pool if present
      const poolIdx = next.pool.findIndex(x => x.id === item.id);
      if (poolIdx !== -1) next.pool.splice(poolIdx, 1);

      // Evict current slot occupant back to pool
      if (existing) next.pool.push(existing);

      // Place the new item
      next.boardSlots[slotIndex] = item;
      return next;
    });
    setFeedback(null);
  }

  function onRemoveFromSlot(slotIndex) {
    setState(prev => {
      const next = deepClone(prev);
      const s = next.boardSlots[slotIndex];
      if (!s || s.fixed) return prev;
      next.pool.push(s);
      next.boardSlots[slotIndex] = null;
      return next;
    });
    setFeedback(null);
  }

  function handleCheck() {
    const fb = state.boardSlots.map((s, i) => {
      if (!s) return null; // empty slot
      const shouldId = correctOrder[i];
      return s.id === shouldId;
    });
    setFeedback(fb);
    if (onChangeCheck) onChangeCheck(fb);
  }

  function handleShowAnswer() {
    const perfect = spec.sentences.slice().sort((a,b) => a.order - b.order);
    setState({ boardSlots: perfect, pool: [] });
    setFeedback(perfect.map(() => true));
  }

  // Drag handlers
  function onDragStart(e, payload) {
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
  }
  function onDragOver(e) { e.preventDefault(); }
  function onDrop(e, slotIndex) {
    e.preventDefault();
    try {
      const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (payload?.type === "pool-item") onDropToSlot(slotIndex, payload.item);
      if (payload?.type === "slot-item") {
        // Move between slots
        const from = payload.slotIndex;
        setState(prev => {
          const next = deepClone(prev);
          const src = next.boardSlots[from];
          const dst = next.boardSlots[slotIndex];
          if (src?.fixed) return prev;
          if (dst?.fixed) return prev;
          next.boardSlots[from] = dst; // may be null
          next.boardSlots[slotIndex] = src;
          return next;
        });
        setFeedback(null);
      }
    } catch {}
  }

  function onDropToPool(fromSlotIndex, item) {
    setState(prev => {
      const next = deepClone(prev);
      if (fromSlotIndex == null) return prev;
      const s = next.boardSlots[fromSlotIndex];
      if (!s || s.fixed) return prev;
      // clear the slot and put the item back in the pool
      next.boardSlots[fromSlotIndex] = null;
      next.pool.push(s);
      return next;
    });
    setFeedback(null);
  }

  // Keyboard swap (for accessibility)
  function swapSlots(i, j) {
    setState(prev => {
      const next = deepClone(prev);
      const a = next.boardSlots[i];
      const b = next.boardSlots[j];
      if (a?.fixed || b?.fixed) return prev;
      next.boardSlots[i] = b; next.boardSlots[j] = a;
      return next;
    });
    setFeedback(null);
  }

  return (
    <div className="text-card">
      <div className="text-head">
        <h3>{spec.title}</h3>
        <div className="controls">
          <button className="btn" onClick={() => reset(true)}>Shuffle</button>
          <button className="btn" onClick={() => reset(false)}>Reset</button>
          <button className="btn primary" onClick={handleCheck}>Check</button>
          <button className="btn ghost" onClick={handleShowAnswer}>Show answer</button>
        </div>
      </div>

      <div className="panes">
        {/* Left: slots */}
        <ol className="slots">
          {state.boardSlots.map((s, i) => {
            const isFixed = s?.fixed;
            const fb = feedback ? feedback[i] : null; // true | false | null
            const cls = ["slot", isFixed ? "fixed" : "", fb===true ? "correct" : fb===false ? "wrong" : ""].join(" ");
            return (
              <li key={i}
                  className={cls}
                  onDragOver={onDragOver}
                  onDrop={(e)=>onDrop(e,i)}>
                <div className="slot-index">{i+1}</div>
                {s ? (
                  <div className="slot-content"
                       draggable={!isFixed}
                       onDragStart={(e)=>onDragStart(e,{type:"slot-item", slotIndex:i})}>
                    <span>{s.text}</span>
                  </div>
                ) : (
                  <div className="slot-placeholder">Drop sentence here</div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Right: pool */}
        <ul
  className="pool"
  onDragOver={onDragOver}
  onDrop={(e) => {
    e.preventDefault();
    try {
      const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      // only accept items dragged from slots
      if (payload?.type === "slot-item") {
        onDropToPool(payload.slotIndex, state.boardSlots[payload.slotIndex]);
      }
    } catch {}
  }}
>
  {state.pool.map((item) => (
    <li
      key={item.id}
      className="pool-item"
      draggable
      onDragStart={(e)=>onDragStart(e,{type:"pool-item", item})}
    >
      {item.text}
    </li>
  ))}
  {state.pool.length === 0 && <li className="pool-empty">All sentences placed</li>}
</ul>
      </div>
    </div>
  );
}

function ChipDropdown({ items, value, onChange, label = "Task" }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
  
    React.useEffect(() => {
      function onDocClick(e) {
        if (!ref.current) return;
        if (!ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, []);
  
    const current = items[value];
  
    return (
      <div className="chip-select" ref={ref}>
        <button
          type="button"
          className={`count-chip ${open ? 'selected' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${label}: ${value + 1}. ${current?.title || ''}`}
        >
          {value + 1}
          <span className="chip-caret" aria-hidden>▾</span>
        </button>
  
        {open && (
          <ul className="chip-menu" role="listbox">
            {items.map((it, i) => {
  const isActive = i === value;
  const isLocked = !!it.locked; // comes from decoratedItems
  return (
    <li key={it.id}>
      <button
        type="button"
        role="option"
        aria-selected={isActive}
        aria-disabled={isLocked}
        className={`chip-option ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
        onClick={() => {
          if (isLocked) return;      // block selection if locked
          onChange(i);
          setOpen(false);
        }}
        title={it.title}
      >
        <strong className="num">{i + 1}.</strong>
        <span className="ttl">{it.title}</span>
      </button>
    </li>
  );
})}
          </ul>
        )}
      </div>
    );
  }

// ---------- Main container showing two texts side‑by‑side ----------
export default function AptisPart2Reorder({ tasks = DEMO_TASKS, user, onRequireSignIn }) {
  // Flatten: each text becomes its own selectable task
  const flattened = useMemo(() => {
    const out = [];
    tasks.forEach((t) => {
      t.texts.forEach((tx) => {
        out.push({
          id: `${t.id}__${tx.id}`,
          // Compose a friendly title: Task title — Text title
          title: tx.title || t.title,
          subtitle: t.title !== tx.title ? t.title : "",
          intro: t.intro || "",
          text: tx,
        });
      });
    });
    return out;
  }, [tasks]);

  const [taskIndex, setTaskIndex] = useState(0);
  const current = flattened[taskIndex] || flattened[0];

  // ✅ NEW: track which tasks are completed for this user
  const [completed, setCompleted] = useState(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) { setCompleted(new Set()); return; }
      const done = await fetchReadingCompletions(); // ← use the top-level import
      if (alive) setCompleted(done);
    })();
    return () => { alive = false; };
  }, [user]);

 // ✅ guard selection – tasks 3+ require sign-in (index >= 2)
function handleSelectTask(nextIndex) {
  if (!user && nextIndex >= 2) {
    onRequireSignIn?.(); // open your sign-in modal
    return;
  }
  setTaskIndex(nextIndex);
}

// (optional) decorate picker labels with ✓ / 🔒
const decoratedItems = useMemo(
  () =>
    flattened.map((f, i) => {
      const locked = !user && i >= 2;
      return {
        ...f,
        locked,
        title:
          `${i + 1}. ${f.title}` +
          (completed.has(f.id) ? " ✓" : "") +
          (locked ? " 🔒" : "")
      };
    }),
  [flattened, completed, user]
);

return (
  <div className="aptis-reorder game-wrapper">
    <StyleScope />

    <header className="header">
      <div>
        <h2 className="title">Reading – Sentence Order (Aptis Part 2)</h2>
        {/* If the intro sentence is now inside the slots as fixed, remove this next line */}
        {/* {current?.intro && <p className="intro">{current.intro}</p>} */}
        {current?.subtitle && (
          <p className="intro" style={{ opacity: 0.8 }}>
            <em>From: {current.subtitle}</em>
          </p>
        )}
      </div>

      <div className="picker">
        <ChipDropdown
          items={decoratedItems}          // ⬅️ use decorated labels
          value={taskIndex}
          onChange={handleSelectTask}     // ⬅️ call the guard, not setTaskIndex
          label="Task"
        />
      </div>
    </header>

    {/* Single task view (just one text) */}
    <div className="single">
    <TextReorder
  key={current?.id}
  spec={current.text}
  onChangeCheck={async (fb) => {
    // fb = array of booleans/null per slot (null = empty)
    if (!user) return;
    if (fb.length && fb.every(v => v === true)) {
      await saveReadingCompletion(current.id);     // persist
      setCompleted(prev => new Set(prev).add(current.id)); // update UI
      toast("Task marked as completed ✓");
    }
  }}
/>
    </div>
  </div>
);
}

// ---------- Scoped styles ----------
function StyleScope(){
  return (
    <style>{`
      .aptis-reorder { --bg:#0e1a2f; --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; --accent:#7db3ff; --ok:#2fb67c; --bad:#e46c6c; }
      .aptis-reorder { color: var(--ink); }
      .aptis-reorder .header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
      .aptis-reorder .title { margin:0; font-size:1.4rem; }
      .aptis-reorder .intro { margin:0.25rem 0 0; color: var(--muted); }
      .aptis-reorder .picker select { margin-left:0.5rem; }

      .aptis-reorder .grid { display:grid; grid-template-columns:1fr; gap:1rem; }
      @media (min-width: 960px){ .aptis-reorder .grid { grid-template-columns: 1fr 1fr; } }

      .aptis-reorder .text-card { background: var(--panel); border:1px solid #203258; border-radius:16px; padding:1rem; box-shadow: 0 6px 18px rgba(0,0,0,0.25);} 
      .aptis-reorder .text-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:0.75rem; }
      .aptis-reorder .text-head h3 { margin:0; font-size:1.1rem; }

      .aptis-reorder .controls { display:flex; gap:0.5rem; flex-wrap:wrap; }
      .aptis-reorder .btn { background:#24365d; border:1px solid #335086; color:var(--ink); padding:0.45rem 0.7rem; border-radius:10px; cursor:pointer; }
      .aptis-reorder .btn:hover { filter:brightness(1.05); }
      .aptis-reorder .btn.primary { background:#294b84; border-color:#3a6ebd; }
      .aptis-reorder .btn.ghost { background:transparent; border-color:#37598e; }

      .aptis-reorder .panes { display:grid; grid-template-columns: 1fr 1fr; gap:1rem; }

      .aptis-reorder .slots { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.5rem; }
      .aptis-reorder .slot { display:flex; gap:0.6rem; background:#0f1b31; border:1px dashed #3b517c; border-radius:12px; padding:0.5rem; min-height:52px; align-items:center; }
      .aptis-reorder .slot.fixed { border-style:solid; border-color:#4a6aa5; background:#10223f; }
      .aptis-reorder .slot.correct { box-shadow: inset 0 0 0 2px var(--ok); }
      .aptis-reorder .slot.wrong { box-shadow: inset 0 0 0 2px var(--bad); }
      .aptis-reorder .slot-index { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#1b2b4d; color:#cfe1ff; font-weight:600; }
      .aptis-reorder .slot-content { flex:1; display:flex; align-items:center; justify-content:space-between; gap:0.5rem; }
      .aptis-reorder .slot-actions .icon { background:#20345a; border:1px solid #37598e; color:#cfe1ff; border-radius:8px; width:28px; height:28px; cursor:pointer; margin-left:0.25rem; }
      .aptis-reorder .slot-placeholder { flex:1; color:#7f92b7; font-style:italic; }

      .aptis-reorder .pool { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.5rem; }
      .aptis-reorder .pool-item { background:#132647; border:1px solid #2c4b83; border-radius:10px; padding:0.5rem; cursor:grab; }
      .aptis-reorder .pool-item:active { cursor:grabbing; }
      .aptis-reorder .pool-empty { color:var(--muted); font-style:italic; text-align:center; padding:0.5rem; }
      .aptis-reorder .grid { display: none; }
      .aptis-reorder .single { display: block; }
      .aptis-reorder .chip-select { position: relative; display: inline-block; }
.aptis-reorder .chip-select .count-chip { min-width: 2.4rem; justify-content: center; display: inline-flex; align-items: center; gap: .35rem; }
.aptis-reorder .chip-caret { font-size: .85em; opacity: .9; }

.aptis-reorder .chip-menu {
  position: absolute; right: 0; margin-top: .4rem;
  background: #132647; border: 1px solid #2c4b83; border-radius: 12px;
  padding: .35rem; list-style: none; min-width: 16rem; max-height: 50vh; overflow: auto;
  box-shadow: 0 10px 24px rgba(0,0,0,.35); z-index: 50;
}
.aptis-reorder .chip-option {
  width: 100%; text-align: left; background: transparent; border: 0; color: #e6f0ff;
  padding: .45rem .6rem; border-radius: 10px; display: flex; gap: .5rem; align-items: baseline;
  cursor: pointer;
}
.aptis-reorder .chip-option:hover { background: #0f1b31; }
.aptis-reorder .chip-option.active { background: #294b84; }
.aptis-reorder .chip-option .num { color: #cfe1ff; width: 2.2rem; display: inline-block; }
.aptis-reorder .chip-option .ttl { color: #e6f0ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aptis-reorder .pool {
  /* existing styles */
  min-height: 52px; /* gives a target even if empty */
}
  .aptis-reorder .chip-option.locked { opacity: .5; cursor: not-allowed; }

    `}</style>
  );
}
