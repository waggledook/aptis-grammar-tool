// src/reading/AptisPart4.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

import { saveReadingCompletion, fetchReadingCompletions, logReadingPart4Attempted, logReadingPart4Completed, } from "../firebase";
import { toast } from "../utils/toast";

/**
 * Aptis Reading – Part 4 (Heading matching)
 * Layout updated to match official exam feel:
 * - ONE text panel (no left/right boxes)
 * - Each paragraph has its own heading dropdown ABOVE it
 * - Still keeps "teaching" features: Check, Show answers, Why? explanations,
 *   evidence highlighting + smooth scroll.
 *
 * Ready for multiple tasks via task picker dropdown.
 */

// ---------- Demo task (Yawning) ----------
const DEMO_TASKS = [
  {
    id: "yawning",
    title: "Yawning",
    intro:
      "Match each paragraph (1–7) to the correct heading (A–H). There is one heading you do not need.",
    headings: [
      { key: "A", text: "The brain's cooling system" },
      { key: "B", text: "A signal we share with animals" }, // NOTE: extra (unused) heading in this task
      { key: "C", text: "When yawning spreads through a room" },
      { key: "D", text: "From mystery to medical tool" },
      { key: "E", text: "A popular explanation overturned" },
      { key: "F", text: "More than a reflex" },
      { key: "G", text: "Empathy's role—and its limits" },
      { key: "H", text: "A social coordination mechanism" },
    ],
    paragraphs: [
      {
        id: 1,
        text:
          "Few bodily actions are as universal yet as poorly understood as yawning. It occurs in every human culture, begins before birth, and is observed across a remarkable range of species—from snakes and fish to primates and dogs. Despite its familiarity, scientists have long struggled to explain why we do it. For decades, the prevailing assumption was that yawning served to increase oxygen intake, a theory so intuitive that it found its way into textbooks and popular wisdom. Yet when researchers finally put this idea to the test, they discovered something unexpected: neither low oxygen nor high carbon dioxide levels reliably trigger yawning. The mystery, it seemed, required a different explanation.",
        answer: "E",
        evidenceParts: [
          "prevailing assumption was that yawning served to increase oxygen intake",
          "neither low oxygen nor high carbon dioxide levels reliably trigger yawning",
        ],
        explanation:
          "The paragraph challenges the common assumption about why we yawn (often linked to tiredness/“needing air”): experiments show oxygen and CO₂ levels don’t reliably trigger yawning.",
      },
      {
        id: 2,
        text:
          "The theory that has gained the most traction in recent years centres on temperature regulation. According to this view, yawning functions as a cooling mechanism for the brain. The action—a deep inhalation of cool air followed by stretching of the jaw—increases blood flow to the skull and allows heat to dissipate through the sinuses. Evidence supporting this idea has accumulated from multiple directions. Studies have shown, for instance, that people yawn more frequently in warm environments and less when the air is cool or when a cold pack is applied to the forehead. The brain, it appears, has its own built-in thermostat.",
        answer: "A",
        evidenceParts: [
          "cooling mechanism for the brain",
          "allows heat to dissipate",
          "built-in thermostat",
        ],
        explanation:
          "The main idea is that yawning helps regulate temperature by cooling the brain.",
      },
      {
        id: 3,
        text:
          "If yawning cools the brain, this might also explain why it is so often linked to tiredness and waking. Both falling asleep and waking involve shifts in brain temperature, and yawning at these moments could help regulate the transition. Similarly, stress and anxiety—both of which raise brain temperature—are known to trigger yawning in situations ranging from competitive sporting events to musical performances. The thermoregulatory theory thus accounts for a wide range of observations that older explanations could not. Yet even as this hypothesis gains acceptance, another dimension of yawning continues to puzzle researchers: its extraordinary contagiousness.",
        answer: "F",
        evidenceParts: [
          "linked to tiredness and waking",
          "stress and anxiety",
          "accounts for a wide range of observations",
        ],
        explanation:
          "This paragraph shows yawning has multiple triggers and functions (sleep/wake changes, stress/anxiety, temperature shifts), so it’s more than a simple reflex.",
      },
      {
        id: 4,
        text:
          "For most people, seeing someone yawn—or even reading about yawning—triggers an irresistible urge to do the same. This phenomenon, known as contagious yawning, appears to be linked to social cognition and empathy. Studies have found that children begin to show contagious yawning around the age of four or five, at the same time they develop theory of mind—the ability to attribute mental states to others. Individuals with conditions affecting social functioning, such as autism spectrum disorder or schizophrenia, show reduced susceptibility to contagious yawning. Even among dogs, yawning contagion occurs more frequently in response to familiar humans than strangers.",
        answer: "C",
        evidenceParts: [
          "seeing someone yawn",
          "triggers an irresistible urge",
          "known as contagious yawning",
        ],
        explanation:
          "This paragraph describes contagious yawning: yawns spread from one person (or animal) to another.",
      },
      {
        id: 5,
        text:
          "The connection to empathy, however, is not straightforward. While some research has found that people who score higher on empathy tests are more likely to catch yawns, other studies have failed to replicate this link. Age also plays a role: older adults, despite typically scoring higher on empathy measures, become less susceptible to contagious yawning. The relationship between social bonding and yawning contagion may be more complex than initially supposed, suggesting that multiple factors—including attention, familiarity, and individual differences—interact in ways researchers are only beginning to untangle.",
        answer: "G",
        evidenceParts: [
          "connection to empathy",
          "not straightforward",
          "failed to replicate",
        ],
        explanation:
          "It focuses on empathy but stresses mixed evidence and limits: not all studies find the same link, and age changes susceptibility.",
      },
      {
        id: 6,
        text:
          "If contagious yawning serves a social function, what might that be? One proposal is that it facilitates group synchronisation. By subtly coordinating behaviour across members of a group, yawning could help align states of alertness or rest, promoting cohesion without requiring conscious communication. This would be particularly valuable for social species that need to coordinate activities such as sleeping, waking, or moving together. Observations of wolves and lions, which yawn more frequently before group activities, lend some support to this idea, though definitive evidence remains elusive.",
        answer: "H",
        evidenceParts: [
          "facilitates group synchronisation",
          "coordinating behaviour",
          "promoting cohesion",
        ],
        explanation:
          "The paragraph proposes a social role: yawning may help synchronise a group’s alertness/rest and coordinate activities.",
      },
      {
        id: 7,
        text:
          "Understanding yawning is not merely an academic exercise. The phenomenon has attracted interest from clinicians who see potential diagnostic applications. Because contagious yawning is reduced in certain neurological and psychiatric conditions, it may serve as a marker for social cognition deficits. Changes in spontaneous yawning frequency have also been observed in migraine sufferers and patients with brain temperature irregularities. While research is still in early stages, the humble yawn may eventually offer insights into conditions ranging from autism to multiple sclerosis. What was once dismissed as a simple reflex may turn out to be a window into the brain's most complex functions.",
        answer: "D",
        evidenceParts: [
          "clinicians",
          "diagnostic applications",
          "serve as a marker",
        ],
        explanation:
          "This paragraph shifts to medical relevance: yawning patterns could potentially be useful as diagnostic markers.",
      },
    ],
  },

  {
    id: "music-consumer-behaviour",
    title: "Music and Consumer Behaviour",
    intro:
      "Match each paragraph (1–7) to the correct heading (A–H). There is one heading you do not need.",
    headings: [
      { key: "A", text: "Memory through mental participation" },
      { key: "B", text: "Behaviour beyond awareness" },
      { key: "C", text: "Matching sound to identity" },
      { key: "D", text: "When loudness reduces effectiveness" }, // extra (unused) heading in this task
      { key: "E", text: "Depth versus turnover" },
      { key: "F", text: "Efficiency over time spent" },
      { key: "G", text: "A mindset open to influence" },
      { key: "H", text: "When perception distorts time" },
    ],
    paragraphs: [
      {
        id: 1,
        text:
          "In modern retail environments, music is so common that its presence is rarely questioned by the average shopper. Yet its function extends well beyond mere decoration or background noise. Over several decades, behavioural scientists have demonstrated that auditory environments can systematically influence decision-making, often without individuals recognising that their behaviour has been altered. Retailers, therefore, are not simply providing a pleasant atmosphere; they are actively shaping the psychological conditions under which purchasing decisions are made. What appears to be a neutral sensory backdrop may, in fact, serve as a subtle mechanism for regulating how people move and choose.",
        answer: "B",
        evidenceParts: [
          "can systematically influence decision-making",
          "without individuals recognising that their behaviour has been altered",
          "actively shaping the psychological conditions",
        ],
        explanation:
          "The paragraph’s main point is that music changes behaviour and decisions, often without shoppers being aware of the influence.",
      },
      {
        id: 2,
        text:
          "One of the more surprising findings in this field concerns the effect of volume. Conventional wisdom might suggest that excessively loud music would discourage customers from staying and lead to lower sales. While it is true that higher volume tends to reduce the actual amount of time customers remain in-store, this does not necessarily translate into reduced commercial outcomes. Instead, shoppers often compensate for their shortened visit by acting with greater decisiveness, maintaining their overall spending levels despite their increased pace. From the retailer’s perspective, this acceleration of transactions can be highly advantageous, particularly during busy periods when they need to serve as many people as possible.",
        answer: "F",
        evidenceParts: [
          "reduce the actual amount of time customers remain in-store",
          "compensate for their shortened visit by acting with greater decisiveness",
          "acceleration of transactions can be highly advantageous",
        ],
        explanation:
          "It’s about efficiency: loud music speeds customers up, so they spend in less time—useful when shops want faster turnover.",
      },
      {
        id: 3,
        text:
          'If loudness influences the duration of a visit, musical tempo appears to affect its qualitative character. Slower music has consistently been shown to encourage a more unhurried mode of behaviour, increasing the likelihood that individuals will notice products they might otherwise overlook. This extended "attentional window" creates more opportunities for unplanned purchasing, as consumers become more receptive to items on display. The effect is not simply a matter of physical movement, but of a shift in mindset: a slower tempo appears to foster a state of mind that is more conducive to exploration and browsing rather than simply completing a specific task.',
        answer: "G",
        evidenceParts: [
          "encourage a more unhurried mode of behaviour",
          "more receptive to items on display",
          "a shift in mindset",
        ],
        explanation:
          "The focus is on a psychological state: slower tempo promotes a browsing/exploring mindset, making shoppers more open to suggestion and impulse buys.",
      },
      {
        id: 4,
        text:
          "The commercial consequences of these shifts can be substantial, although they introduce difficult strategic dilemmas for businesses. While environments that encourage customers to stay longer may increase the total revenue generated per individual, they simultaneously reduce the rate at which new customers can be accommodated. This tension highlights a fundamental question: whether it is preferable to maximise the value of each single interaction or the total volume of interactions overall. The optimal solution depends not only on consumer psychology, but also on practical constraints such as crowd density and the specific business model.",
        answer: "E",
        evidenceParts: [
          "increase the total revenue generated per individual",
          "reduce the rate at which new customers can be accommodated",
          "maximise the value of each single interaction or the total volume",
        ],
        explanation:
          "This paragraph is about the trade-off between making each customer spend more (depth) versus serving more customers overall (turnover).",
      },
      {
        id: 5,
        text:
          "Music also shapes the subjective experience of time in ways that differ from objective reality. A listener’s perception of how much time has elapsed is influenced less by the clock than by their emotional response to what they hear. When individuals are exposed to music they find unappealing or annoying, time often seems to pass more slowly, whereas preferred music may make a long interval feel much shorter. This distortion is not the same for everyone; it reflects the interaction between the musical selection and the listener's own identity and tastes. As a result, the exact same environment may be experienced very differently by different audiences.",
        answer: "H",
        evidenceParts: [
          "subjective experience of time",
          "time often seems to pass more slowly",
          "preferred music may make a long interval feel much shorter",
        ],
        explanation:
          "The key idea is distorted time perception: the same amount of time can feel longer or shorter depending on how the listener feels about the music.",
      },
      {
        id: 6,
        text:
          'Beyond its capacity to influence behaviour within physical stores, music plays a central role in constructing a brand\'s symbolic identity. In commercial messaging and advertising, carefully selected sound can reinforce the intended meaning of a product, aligning sensory cues with the brand\'s desired characteristics. The effectiveness of this strategy depends less on the popularity of a song than on its "congruence"—how well it fits the product. Music that resonates with the symbolic identity of a product strengthens its perceived quality and helps consumers understand the brand message more clearly.',
        answer: "C",
        evidenceParts: [
          "constructing a brand's symbolic identity",
          "congruence—how well it fits the product",
          "resonates with the symbolic identity of a product",
        ],
        explanation:
          "It’s about choosing music that matches the brand/product identity (congruence), not simply using a popular song.",
      },
      {
        id: 7,
        text:
          'Perhaps most strikingly, music can enhance memory even in the absence of conscious effort. When listeners encounter instrumental versions of familiar songs, they frequently engage in "cognitive completion," where they mentally supply the missing lyrics themselves. This internal participation deepens the mental connection to the advertisement, making the information much easier to recall later. In this way, music does not simply accompany commercial content; it becomes integrated into the way that content is stored in the mind, ensuring the brand remains memorable long after the music has stopped.',
        answer: "A",
        evidenceParts: [
          "enhance memory",
          "cognitive completion",
          "mentally supply the missing lyrics",
        ],
        explanation:
          "The paragraph explains how people mentally ‘complete’ familiar songs, which boosts memory for the advert/brand through internal participation.",
      },
    ],
  },
];

// ---------- Small reusable task picker (same pattern used elsewhere) ----------
function ChipDropdown({ items, value, onChange, label = "Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const active = items[value];

  return (
    <div className="chip-select" ref={ref}>
      <button
        type="button"
        className={`count-chip ${open ? "selected" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lbl">{label}</span>
        <span className="val">{active?.title ?? "—"}</span>
        <span className="chev" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <ul className="chip-menu" role="listbox">
          {items.map((it, i) => {
            const isActive = i === value;
            const isLocked = !!it.locked;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={isLocked}
                  className={`chip-option ${isActive ? "active" : ""} ${
                    isLocked ? "locked" : ""
                  }`}
                  onClick={() => {
                    if (isLocked) return;
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

// ---------- Helpers ----------
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightEvidence(text, evidenceParts) {
  const parts = Array.isArray(evidenceParts) ? evidenceParts.filter(Boolean) : [];
  if (!parts.length) return <span>{text}</span>;

  const regex = new RegExp(
    "(" + parts.map((p) => escapeRegex(String(p).trim())).join("|") + ")",
    "gi"
  );

  const segments = String(text).split(regex);
  return (
    <span>
      {segments.map((seg, i) => {
        const isHit = parts.some(
          (p) => seg.toLowerCase() === String(p).trim().toLowerCase()
        );
        return isHit ? (
          <mark key={i} className="evidence">
            {seg}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg}</React.Fragment>
        );
      })}
    </span>
  );
}

// ---------- Component ----------
export default function AptisPart4({
  tasks = DEMO_TASKS,
  user,
  onRequireSignIn,
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [paraId]: headingKey }
  const [feedback, setFeedback] = useState({}); // { [paraId]: true|false|null }
  const [completed, setCompleted] = useState(new Set());
  const [whyOpen, setWhyOpen] = useState(null); // paragraph id
  const [showHeadings, setShowHeadings] = useState(false);

  const paraRefs = useRef({});

  const current = tasks[taskIndex] || tasks[0];

  // Completed tasks (signed-in only)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return setCompleted(new Set());
      const done = await fetchReadingCompletions();
      if (alive) setCompleted(done);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // Scroll to paragraph when opening “Why?”
  useEffect(() => {
    if (!whyOpen) return;
    const node = paraRefs.current[whyOpen]?.current;
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [whyOpen, current?.id]);

  const decoratedItems = useMemo(() => {
    return tasks.map((t) => {
      const done = completed.has(t.id);
      const locked = false; // hook for gating later if you need it
      return {
        ...t,
        locked,
        title: `${t.title}${done ? " ✓" : ""}${locked ? " 🔒" : ""}`,
      };
    });
  }, [tasks, completed]);

  function handleSelectTask(nextIndex) {
    if (!user && decoratedItems[nextIndex]?.locked) {
      onRequireSignIn?.();
      return;
    }
    setTaskIndex(nextIndex);
    setAnswers({});
    setFeedback({});
    setWhyOpen(null);
    setShowHeadings(false);
  }

  function handleChange(paraId, headingKey) {
    setAnswers((p) => ({ ...p, [paraId]: headingKey }));
    setFeedback((p) => ({ ...p, [paraId]: null }));
    if (whyOpen === paraId) setWhyOpen(null);
  }

  async function handleCheck() {
    const fb = {};
    current.paragraphs.forEach((p) => {
      const given = answers[p.id];
      fb[p.id] = given ? given === p.answer : null;
    });
    setFeedback(fb);
  
    const total = current.paragraphs.length;
    const score = current.paragraphs.reduce((acc, p) => acc + (fb[p.id] === true ? 1 : 0), 0);
    const allCorrect = score === total;
  
    // ✅ Log an attempt whenever the user clicks "Check"
    if (user) {
      await logReadingPart4Attempted({
        taskId: current.id,
        score,
        total,
        source: "AptisPart4",
      });
    }
  
    // ✅ Only mark as completed if perfect score, and only once
    if (allCorrect && user && !completed.has(current.id)) {
      await saveReadingCompletion(current.id);
      setCompleted((prev) => new Set(prev).add(current.id));
      toast("Task marked as completed ✓");
  
      await logReadingPart4Completed({ taskId: current.id, source: "AptisPart4" });
    }
  }

  function handleShowAnswers() {
    const fb = {};
    const ans = {};
    current.paragraphs.forEach((p) => {
      fb[p.id] = true;
      ans[p.id] = p.answer;
    });
    setAnswers(ans);
    setFeedback(fb);
    setWhyOpen(null);
  }

  function handleReset() {
    setAnswers({});
    setFeedback({});
    setWhyOpen(null);
  }

  const headingOptions = current.headings;

  return (
    <div className="aptis-p4-headings game-wrapper">
      <StyleScope />

      <header className="p4-top">
        <div className="p4-titleblock">
          <h2 className="p4-title">Reading – Part 4 (Heading Matching)</h2>
          <p className="p4-intro">{current?.intro}</p>
        </div>

        <div className="p4-tools">
          <ChipDropdown
            items={decoratedItems}
            value={taskIndex}
            onChange={handleSelectTask}
            label="Task"
          />
        </div>
      </header>

      <section className="panel p4-panel">
        <div className="p4-panelbar">
          <button
            type="button"
            className="linkbtn"
            onClick={() => setShowHeadings((v) => !v)}
          >
            {showHeadings ? "Hide headings" : "Show headings"}
          </button>

          <div className="controls">
            <button className="btn" onClick={handleReset}>
              Reset
            </button>
            <button className="btn primary" onClick={handleCheck}>
              Check
            </button>
            <button className="btn ghost" onClick={handleShowAnswers}>
              Show answers
            </button>
          </div>
        </div>

        {showHeadings && (
          <div className="headings-inline">
            <h3 className="minihead">Headings (A–H)</h3>
            <ul>
              {headingOptions.map((h) => (
                <li key={h.key}>
                  <strong>{h.key}.</strong> {h.text}
                </li>
              ))}
            </ul>
            <p className="hint">
              Tip: One heading is extra. Choose the heading that matches the
              paragraph’s main idea (not just a single word).
            </p>
          </div>
        )}

        <div className="p4-paras">
          {current.paragraphs.map((p) => {
            if (!paraRefs.current[p.id])
              paraRefs.current[p.id] = React.createRef();

            const fb = feedback[p.id];
            const status = fb === true ? "ok" : fb === false ? "bad" : "";
            const isWhyOpen = whyOpen === p.id;
            const canExplain = fb !== undefined;

            const chosen = answers[p.id] || "";

            return (
              <div
                key={p.id}
                ref={paraRefs.current[p.id]}
                className={`p4-block ${isWhyOpen ? "active" : ""}`}
              >
                <div className="p4-qrow">
                  <div className="p4-num">{p.id}.</div>

                  <select
                    className={`p4-select ${status}`}
                    value={chosen}
                    onChange={(e) => handleChange(p.id, e.target.value)}
                    aria-label={`Choose heading for paragraph ${p.id}`}
                  >
                    <option value="">—</option>
                    {headingOptions.map((h) => (
                      <option key={h.key} value={h.key}>
                        {h.text}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="why-btn"
                    disabled={!canExplain}
                    onClick={() =>
                      setWhyOpen((cur) => (cur === p.id ? null : p.id))
                    }
                    title={canExplain ? "Show explanation" : "Check first"}
                  >
                    Why?
                  </button>
                </div>

                <div className="p4-text">
                  <p>
                    {isWhyOpen
                      ? highlightEvidence(
                          p.text,
                          p.evidenceParts || p.evidence
                        )
                      : p.text}
                  </p>
                </div>

                {isWhyOpen && (
                  <div className="why-box">
                    <div className="why-answer">
                      <strong>
                        Answer: {p.answer}.{" "}
                        {headingOptions.find((h) => h.key === p.answer)?.text}
                      </strong>
                    </div>
                    <div className="why-evidence">
                      <span className="label">Evidence:</span>{" "}
                      <em>
                        {Array.isArray(p.evidenceParts)
                          ? p.evidenceParts.join(" … ")
                          : p.evidence}
                      </em>
                    </div>
                    <div className="why-explain">
                      <span className="label">Explanation:</span> {p.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ---------- Styles ----------
function StyleScope() {
  return (
    <style>{`
      .aptis-p4-headings{
        --panel:#13213b;
        --ink:#e6f0ff;
        --muted:#a9b7d1;
        --border:#2c4b83;
        --ok:#2fb67c;
        --bad:#e46c6c;
        --accent:#6ea8ff;
        --evidence-bg:rgba(255,214,102,.2);
        --evidence-border:rgba(255,214,102,.6);
        color:var(--ink);
      }

      .aptis-p4-headings .p4-top{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:1rem;
        margin-bottom:1rem;
      }
      .aptis-p4-headings .p4-title{ margin:0; font-size:1.4rem; }
      .aptis-p4-headings .p4-intro{ margin:.35rem 0 0; color:var(--muted); max-width:70ch; }

      .aptis-p4-headings .panel{
        background:var(--panel);
        border:1px solid var(--border);
        border-radius:16px;
        padding:1rem;
      }

      .aptis-p4-headings .p4-panelbar{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:1rem;
        flex-wrap:wrap;
        margin-bottom:.75rem;
      }

      .aptis-p4-headings .linkbtn{
        background:transparent;
        border:none;
        color:var(--accent);
        cursor:pointer;
        font-weight:800;
        padding:0;
      }

      .aptis-p4-headings .controls{
        display:flex;
        gap:.5rem;
        flex-wrap:wrap;
      }
      .aptis-p4-headings .btn{
        background:#24365d;
        border:1px solid #335086;
        color:var(--ink);
        padding:.45rem .75rem;
        border-radius:10px;
        cursor:pointer;
      }
      .aptis-p4-headings .btn.primary{ background:#294b84; border-color:#3a6ebd; }
      .aptis-p4-headings .btn.ghost{ background:transparent; border-color:#37598e; }

      .aptis-p4-headings .headings-inline{
        background:#0f1b31;
        border:1px solid #37598e;
        border-radius:14px;
        padding:.85rem .9rem;
        margin-bottom:1rem;
      }
      .aptis-p4-headings .minihead{
        margin:0 0 .5rem;
        color:var(--accent);
        font-size:1.05rem;
      }
      .aptis-p4-headings .headings-inline ul{ margin:.25rem 0 0; padding-left:1.1rem; }
      .aptis-p4-headings .headings-inline li{ margin:.35rem 0; }
      .aptis-p4-headings .hint{ margin:.7rem 0 0; color:var(--muted); font-size:.92rem; }

      .aptis-p4-headings .p4-paras{
        display:flex;
        flex-direction:column;
        gap:1.1rem;
      }

      .aptis-p4-headings .p4-block{
        background:#0f1b31;
        border:1px solid transparent;
        border-radius:14px;
        padding:.85rem .9rem;
      }
      .aptis-p4-headings .p4-block.active{
        border-color:#37598e;
        box-shadow:0 0 0 2px rgba(110,168,255,.18), 0 10px 28px rgba(0,0,0,.55);
      }

      .aptis-p4-headings .p4-qrow{
        display:flex;
        align-items:center;
        gap:.6rem;
        margin-bottom:.55rem;
        flex-wrap:wrap;
      }
      .aptis-p4-headings .p4-num{
        font-weight:900;
        min-width:2rem;
        color:var(--muted);
      }

      .aptis-p4-headings .p4-select{
        flex:1 1 320px;
        max-width:540px;
        background:#24365d;
        color:var(--ink);
        border-radius:10px;
        border:1px solid #37598e;
        padding:.45rem .55rem;
      }
      .aptis-p4-headings .p4-select.ok{
        border-color: rgba(47,182,124,.7);
        box-shadow:0 0 0 2px rgba(47,182,124,.18);
      }
      .aptis-p4-headings .p4-select.bad{
        border-color: rgba(228,108,108,.7);
        box-shadow:0 0 0 2px rgba(228,108,108,.18);
      }

      .aptis-p4-headings .why-btn{
        background:#24365d;
        border:1px solid #37598e;
        color:var(--accent);
        font-weight:800;
        border-radius:10px;
        padding:.42rem .6rem;
        cursor:pointer;
      }
      .aptis-p4-headings .why-btn:disabled{ opacity:.45; cursor:not-allowed; }

      .aptis-p4-headings .p4-text p{
        margin:0;
        line-height:1.55;
        color:var(--ink);
      }

      .aptis-p4-headings mark.evidence{
        background:var(--evidence-bg);
        border-bottom:2px solid var(--evidence-border);
        color:var(--ink);
        padding:0 .1rem;
        border-radius:2px;
      }

      .aptis-p4-headings .why-box{
        background:#0c1628;
        border:1px solid #37598e;
        border-radius:12px;
        padding:.65rem .75rem;
        margin-top:.7rem;
        font-size:.92rem;
        line-height:1.45;
      }
      .aptis-p4-headings .why-answer{ font-weight:800; margin-bottom:.4rem; }
      .aptis-p4-headings .why-evidence{ margin-bottom:.4rem; }
      .aptis-p4-headings .why-explain{ color:var(--muted); }
      .aptis-p4-headings .label{ color:var(--accent); font-weight:900; }

      /* --- Task picker (ChipDropdown) --- */
      .aptis-p4-headings .chip-select{ position:relative; display:inline-block; }
      .aptis-p4-headings .count-chip{
        display:inline-flex;
        align-items:center;
        gap:.45rem;
        background:#24365d;
        border:1px solid #335086;
        color:var(--ink);
        padding:.45rem .65rem;
        border-radius:12px;
        cursor:pointer;
        white-space:nowrap;
      }
      .aptis-p4-headings .count-chip.selected{ border-color:#3a6ebd; box-shadow:0 0 0 2px rgba(110,168,255,.15); }
      .aptis-p4-headings .count-chip .lbl{ color:var(--muted); font-weight:900; font-size:.85rem; }
      .aptis-p4-headings .count-chip .val{ font-weight:900; }
      .aptis-p4-headings .chip-menu{
        position:absolute;
        right:0;
        top:calc(100% + .4rem);
        background:#0f1b31;
        border:1px solid #335086;
        border-radius:14px;
        padding:.4rem;
        min-width: 260px;
        z-index: 10;
        box-shadow: 0 12px 30px rgba(0,0,0,.55);
      }
      .aptis-p4-headings .chip-option{
        width:100%;
        display:flex;
        gap:.5rem;
        align-items:center;
        padding:.5rem .6rem;
        border-radius:12px;
        background:transparent;
        border:1px solid transparent;
        color:var(--ink);
        cursor:pointer;
        text-align:left;
      }
      .aptis-p4-headings .chip-option:hover{ background:rgba(110,168,255,.08); border-color:rgba(110,168,255,.25); }
      .aptis-p4-headings .chip-option.active{ background:rgba(47,182,124,.12); border-color:rgba(47,182,124,.35); }
      .aptis-p4-headings .chip-option.locked{ opacity:.45; cursor:not-allowed; }
      .aptis-p4-headings .chip-option .num{ color:var(--muted); width:2.2rem; }
    `}</style>
  );
}