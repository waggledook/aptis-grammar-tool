import React, { useMemo, useState, useEffect } from "react";
import {
  logReadingGuideViewed,
  logReadingGuideClueReveal,
  logReadingGuideReorderCheck,
  logReadingGuideShowAnswers,
  logReadingGuideReorderCompleted,
} from "../firebase";
/**
 * ReadingGuide – Guided flow (clue reveal ➜ then reorder)
 * • Both guided tasks on a single page (no dropdown).
 * • Part A: Sentences shown OUT OF ORDER; click “Show clues” to highlight cohesion.
 * • Part B: Drag to order with intro fixed; Check / Show answers.
 */

// --------------------------- DATA (Guided tasks) ---------------------------
/** @typedef {{ id:string, text:string, order:number, clues:{ idx:number[], note:string } }} GuideSentence */
/** @typedef {{ id:string, title:string, intro:string, sentences:GuideSentence[] }} GuideTask */



const TASKS /** @type {GuideTask[]} */ = [
  // Task 12 – Instructions (Online banking security)
  {
    id: "online-banking-security",
    title: "Instructions: Online banking security",
    intro: "Please follow these steps to keep your online banking account secure.",
    sentences: [
      {
        id: "t12a",
        text: "Create a strong password that contains both letters and numbers.",
        order: 1,
        clues: {
          idx: [], // no highlight needed for A in your mockup
          note: "This sentence describes the first stage in the process."
        }
      },
      {
        id: "t12b",
        text: "After doing so, enable two-factor authentication on the login page.",
        order: 2,
        clues: {
          idx: [0,1,2,3], // ‘After doing so’
          note: "‘After doing so’ refers to having completed a previous action."
        }
      },
      {
        id: "t12c",
        text: "Once this is active, the system will send a code to your phone whenever you sign in.",
        order: 3,
        clues: {
          idx: [0,1], // ‘Once this’
          note: "‘Once this’ shows that this step comes after another action; ‘this’ refers to a previously completed step in the process."
        }
      },
      {
        id: "t12d",
        text: "If you ever lose this device, contact customer support immediately.",
        order: 4,
        clues: {
          idx: [0,5,6], // ‘If’ … ‘this device’
          note: "‘This device’ suggests that a device has already been mentioned. What could it be?"
        }
      },
      {
        id: "t12e",
        text: "Finally, remember that you should never share your login details with anyone.",
        order: 5,
        clues: {
          idx: [0], // ‘Finally’
          note: "‘Finally’ clearly indicates that this sentence comes at the end."
        }
      }
    ]
  },
  // Task 13 – Report (Public transport survey)
  {
    id: "transport-survey",
    title: "Report (Public transport survey)",
    intro:
      "This report summarises the results of a recent passenger survey about bus services in the city.",
    sentences: [
      {
        id: "t13a",
        text: "Most respondents said the buses usually arrived on time.",
        order: 1,
        clues: {
          // “Most respondents”
          idx: [0, 1],
          note:
            "“Most respondents” refers directly to the survey in the intro. The sentence begins the summary of the results."
        }
      },
      {
        id: "t13b",
        text:
          "Nevertheless, some passengers complained about overcrowding during peak hours.",
        order: 2,
        clues: {
          // “Nevertheless,”
          idx: [0],
          note:
            "“Nevertheless” contrasts with the previous idea. In this sentence, we have a negative point, so it must contrast with a positive idea previously."
        }
      },
      {
        id: "t13c",
        text:
          "Several went on to mention that the routes were confusing for new users.",
        order: 3,
        clues: {
          // “Several went on”
          idx: [0, 1, 2],
          note:
            "What does “several” refer to? Probably those users who participated in the survey. “went on to inf” is a phrasal verb meaning to continue (with a new topic)."
        }
      },
      {
        id: "t13d",
        text:
          "As a result of these comments, the transport authority plans to redesign the timetable.",
        order: 4,
        clues: {
          // “As a result of these comments”
          idx: [0, 1, 2, 3, 4, 5],
          note:
            "“As a result” expresses a consequence/result of the previous information. “These comments” refers back to earlier results from the survey. Do you think this sentence is a consequence of positive or negative feedback? Why?"
        }
      },
      {
        id: "t13e",
        text:
          "It will also introduce clearer signs at bus stops in order to reduce confusion.",
        order: 5,
        clues: {
          // “It” + “also” + “in order to reduce confusion”
          idx: [0, 2, 9, 10, 11, 12, 13],
          note:
            "“It” is a pronoun, referring back to a previous noun in another sentence (transport authority). “also” implies additional action—this means the report describes another measure taken previously. “reduce confusion”: this is a solution to a problem previously mentioned in the text."
        }
      }
    ]
  }  
];

// --------------------------- Utils ---------------------------
function tokenize(text){
  const tokens = [];
  let buf = "";
  const flush = () => { if (buf) { tokens.push(buf); buf = ""; } };
  for (const ch of text){
    if (/\w/.test(ch) || ch === "'") buf += ch; else { flush(); tokens.push(ch); }
  }
  flush();
  return tokens.filter(t => !(t.trim() === ""));
}
function shuffle(arr){ const a = arr.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function deepClone(x){ return JSON.parse(JSON.stringify(x)); }

// --------------------------- Components ---------------------------
function ClueReveal({ sentence, revealed, onReveal }) {
  const tokens = useMemo(() => tokenize(sentence.text), [sentence.text]);
  const gold = sentence.clues?.idx || [];

  // helper: is this token pure punctuation?
  const isPunctuation = (tok) => /^[,.;:!?]$/.test(tok);

  return (
    <div className="clue-reveal">
      {/* Sentence with bold highlights */}
      <p className="srnt">
        {tokens.map((t, i) => {
          const isGold = revealed && gold.includes(i);
          const needsSpaceBefore =
            i > 0 && !isPunctuation(t); // space before non-punctuation tokens (except first)

          return (
            <React.Fragment key={i}>
              {needsSpaceBefore && " "}
              <span
                className={isGold ? "tok gold" : "tok"}
                style={isGold ? { fontWeight: "bold" } : {}}
              >
                {t}
              </span>
            </React.Fragment>
          );
        })}
      </p>

      {/* Show button / Explanation */}
      {!revealed ? (
        <button className="btn" onClick={onReveal}>
          Show clues
        </button>
      ) : (
        <div className="explain">
          <p>{sentence.clues?.note}</p>
        </div>
      )}
    </div>
  );
}


function ApplyReorder({ intro, sentences, taskId }){
  // intro becomes fixed slot 0; sentences are 1..N
  const introItem = { id:"__intro__", text:intro, order:0, fixed:true };
  const canonical = [introItem, ...sentences].sort((a,b)=>a.order-b.order);
  const [state, setState] = useState(()=>({ slots: canonical.map(s=>s.fixed?s:null), pool: shuffle(sentences) }));
  const [fb, setFb] = useState(null); // boolean[] per slot

  function onDragStart(e, payload){ e.dataTransfer.setData("text/plain", JSON.stringify(payload)); }
  function onDragOver(e){ e.preventDefault(); }
  function onDropSlot(e, i){
    e.preventDefault();
    const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
    setState(prev=>{
      const next = deepClone(prev);
      if (canonical[i]?.fixed) return prev;
      if (payload.type === "pool"){ const idx = next.pool.findIndex(p=>p.id===payload.item.id); if(idx!==-1){ const [item]=next.pool.splice(idx,1); const cur=next.slots[i]; if(cur) next.pool.push(cur); next.slots[i]=item; } }
      if (payload.type === "slot"){ const from = payload.i; if (canonical[from]?.fixed) return prev; const tmp=next.slots[from]; next.slots[from]=next.slots[i]; next.slots[i]=tmp; }
      return next;
    });
    setFb(null);
  }
  function onDropPool(e){
    e.preventDefault();
    try{
      const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (payload.type !== "slot") return;
      setState(prev=>{ const next=deepClone(prev); const s=next.slots[payload.i]; if(!s || canonical[payload.i]?.fixed) return prev; next.slots[payload.i]=null; next.pool.push(s); return next; });
      setFb(null);
    }catch{}
  }
  async function check() {
    const nextFb = state.slots.map((s, i) => !!s && s.id === canonical[i]?.id);
    setFb(nextFb);
  
    const allCorrect = nextFb.length && nextFb.every(Boolean);
    await logReadingGuideReorderCheck({ taskId, correct: allCorrect });
  
    if (allCorrect) {
      await logReadingGuideReorderCompleted({ taskId });
    }
  }
  
  function show() {
    setState({ slots: canonical, pool: [] });
    setFb(canonical.map(() => true));
    logReadingGuideShowAnswers({ taskId });
  }
  
  return (
    <div className="apply">
      <div className="grid">
        <ol className="slots">
          {state.slots.map((s,i)=>{
            const fixed = canonical[i]?.fixed; const ok = fb?.[i];
            return (
              <li key={i} className={["slot", fixed?"fixed":"", ok===true?"ok": ok===false?"bad":""].join(" ")} onDragOver={onDragOver} onDrop={(e)=>onDropSlot(e,i)}>
                <div className="slot-index">{i+1}</div>
                {s ? (
                  <div className="slot-content" draggable={!fixed} onDragStart={(e)=>onDragStart(e,{type:"slot", i})}>
                    <span>{s.text}</span>
                  </div>
                ) : (
                  <div className="slot-placeholder">Drop sentence here</div>
                )}
              </li>
            );
          })}
        </ol>
        <ul className="pool" onDragOver={onDragOver} onDrop={onDropPool}>
          {state.pool.map(item=> (
            <li key={item.id} className="pool-item" draggable onDragStart={(e)=>onDragStart(e,{type:"pool", item})}>{item.text}</li>
          ))}
          {state.pool.length===0 && <li className="pool-empty">All sentences placed</li>}
        </ul>
      </div>
      <div className="actions">
        <button className="btn" onClick={check}>Check</button>
        <button className="btn ghost" onClick={show}>Show answers</button>
      </div>
    </div>
  );
}

function GuidedTaskSection({ task }) {
  // per-task state
  const [revealed, setRevealed] = useState(() => new Set());
  const [clueLogged, setClueLogged] = useState(false);
  const reveal = (id) => {
    setRevealed(prev => new Set(prev).add(id));
    if (!clueLogged) {
      setClueLogged(true);
      logReadingGuideClueReveal({ taskId: task.id });
    }
  };
  const scrambled = useMemo(() => shuffle(task.sentences), [task.sentences]);

  return (
    <section className="task-block">
      <h3>{task.title}</h3>
      <p className="muted"><em>Intro (fixed): {task.intro}</em></p>

      {/* Part A – Explore clues */}
      <div className="explore">
        <h4 className="subt">Explore: Find the cohesive clues</h4>
        <div className="cards">
          {scrambled.map(s => (
            <div key={s.id} className="card">
              <ClueReveal
                sentence={s}
                revealed={revealed.has(s.id)}
                onReveal={() => reveal(s.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Part B – Reorder */}
      <h4 className="subt" style={{ marginTop: '1rem' }}>Apply: Put the sentences in order</h4>
      <ApplyReorder intro={task.intro} sentences={task.sentences} taskId={task.id} />
    </section>
  );
}

export default function ReadingGuide(){
  // Always start this page at the top
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    logReadingGuideViewed({ guideId: "reading_guide_reorder" });
  }, []);
  return (
    <div className="reading-guide game-wrapper">
      <GuideStyle />
      <div className="reading-guide-inner">
        {/* 🌟 General description */}
        <header className="intro-box">
          <h2>Reading – Guided Reorder</h2>
          <p>
            In reading part 2, you have to put six sentences into the <strong>correct order</strong>, in two separate tasks.
            There are different types of texts, such as <strong>instructions</strong>, <strong>reports</strong>,
            <strong> biographies</strong>, or <strong>process descriptions</strong>.
            Follow the steps below to complete the activities:
          </p>
          <ol className="steps">
            <li>
              <strong>Look for clues:</strong> Do you think the sentence belongs at the start, middle, or end of the text?
              Are there any words or phrases that show connections with other sentences?
            </li>
            <li>
              <strong>Reorder:</strong> Drag the sentences into the correct position.
              The first sentence is done for you.
            </li>
          </ol>
        </header>

        {/* 📝 Render ALL guided tasks */}
        {TASKS.map(task => (
          <GuidedTaskSection key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}



// --------------------------- Styles ---------------------------
function GuideStyle(){
  return (
    <style>{`
      .reading-guide {
        --ink:#e6f0ff;
        --muted:#a9b7d1;
        --panel:#13213b;
        --ok:#2fb67c;
        --bad:#e46c6c;

        color: var(--ink);

        /* 🔒 keep the guide inside the viewport */
        width: 100%;
        max-width: 100vw;
        margin: 0 auto;
        overflow-x: hidden;
      }

      /* All children respect the container width */
      .reading-guide * {
        box-sizing: border-box;
        max-width: 100%;
      }

      .reading-guide-inner {
        width: 100%;
        max-width: 720px;
        margin: 0 auto;
        padding: 0.9rem 1rem 1.5rem;
      }

      @media (max-width: 600px) {
        .reading-guide-inner {
          padding: 0.75rem 0.75rem 1.25rem;
        }
      }

      .reading-guide .title { margin:0 0 .25rem; font-size:1.4rem; }
      .reading-guide .muted { color: var(--muted); }

      /* make each task a card */
      .task-block {
        background: var(--panel);
        border:1px solid #203258;
        border-radius:16px;
        padding:1rem;
        margin:1rem 0;
      }
        
      .task-head { margin-bottom:.5rem; }
      .task-title { margin:0 0 .25rem; font-size:1.15rem; }

      /* Stack clue cards in a single column on all screens */
.explore .cards {
  display: grid;
  grid-template-columns: 1fr;   /* ← always one column */
  gap: .6rem;
}
      .card { background:#0f1b31; border:1px solid #3b517c; border-radius:12px; padding:.6rem; }
      .clue-reveal .srnt { margin:0 0 .35rem; }
      .tok { padding:0 .15rem; }
      .tok.gold { background: #2a3d66; border-bottom:2px solid #7db3ff; border-radius:4px; }
      .row { display:flex; gap:.5rem; align-items:center; }
      .btn { background:#24365d; border:1px solid #335086; color:var(--ink); padding:.35rem .6rem; border-radius:10px; cursor:pointer; }
      .btn.ghost { background:transparent; border-color:#37598e; }
      .chip { display:inline-block; padding:.15rem .45rem; border-radius:999px; font-size:.8rem; }
      .chip.ok { background:#153a2b; border:1px solid #2fb67c; }
      .note { font-size:.9rem; color:#cfe1ff; }

      .apply .subt { margin:.75rem 0 .5rem; }
      .apply .grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
      @media (max-width: 960px){ .apply .grid { grid-template-columns: 1fr; } }
      .slots { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.5rem; }
      .slot { display:flex; flex-direction:column; gap:.35rem; background:#0f1b31; border:1px dashed #3b517c; border-radius:12px; padding:.5rem; min-height:72px; }
      .slot.fixed { border-style:solid; border-color:#4a6aa5; background:#10223f; }
      .slot.ok { box-shadow: inset 0 0 0 2px var(--ok); }
      .slot.bad { box-shadow: inset 0 0 0 2px var(--bad); }
      .slot-index { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#1b2b4d; color:#cfe1ff; font-weight:600; }
      .slot-content { display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
      .slot-placeholder { color:#7f92b7; font-style:italic; }

      .pool { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.5rem; }
      .pool-item { background:#132647; border:1px solid #2c4b83; border-radius:10px; padding:.5rem; cursor:grab; }
      .pool-item:active { cursor:grabbing; }
      .pool-empty { color:#a9b7d1; font-style:italic; text-align:center; padding:.5rem; }

      .actions { margin-top:.5rem; display:flex; gap:.5rem; }
      .intro-box {
  background: #0f1b31;
  border: 1px solid #2c4b83;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

.intro-box .steps {
  margin: .5rem 0 0;
  padding-left: 1.25rem;
}

.intro-box .steps li { margin: .25rem 0; }
.muted { color: #a9b7d1; }

.tok.gold {
  background: none;          /* remove background */
  border-bottom: 2px solid #7db3ff;
  font-weight: bold;         /* bold like your mockup */
}
.explain {
  margin-top: .35rem;
  color: #cfe1ff;
  font-size: .95rem;
}



    `}</style>
  );
}
