import React, { useEffect, useMemo, useRef, useState } from "react";
import Seo from "../common/Seo.jsx";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";

const PART2_LISTENING_TASKS = [
    {
        id: "learning-languages",
        title: "Learning Languages",
        intro:
          "Listen to four people talking about learning languages. For questions 1–4, choose from the list what each speaker says. Use each letter only once. There are two extra options which you do not need. You can listen to the recording twice.",
        audioSrc: "/audio/listening/part2/learning-languages.mp3",
      
        choices: [
          { key: "a", text: "prefers learning with other people." },
          { key: "b", text: "started learning for work." },
          { key: "c", text: "enjoys practising through entertainment." },
          { key: "d", text: "finds grammar the most useful part." },
          { key: "e", text: "regrets not learning earlier." },
          { key: "f", text: "finds speaking the hardest skill." },
        ],
      
        prompts: [
          {
            key: "A",
            text: "Speaker A",
            answer: "b",
            scriptLineIndex: 0,
            evidenceParts: [
              "my firm expanded into international markets",
              "my professional growth depended on",
              "part of my job now",
            ],
            explanation:
              "Speaker A says the reason for learning was professional: the company expanded internationally and language skills became necessary for work.",
          },
          {
            key: "B",
            text: "Speaker B",
            answer: "c",
            scriptLineIndex: 1,
            evidenceParts: [
              "watching series",
              "listening to podcasts",
              "reading song lyrics online",
            ],
            explanation:
              "Speaker B prefers learning through enjoyable content such as series, podcasts, and song lyrics.",
          },
          {
            key: "C",
            text: "Speaker C",
            answer: "f",
            scriptLineIndex: 2,
            evidenceParts: [
              "the moment I'm in a real-time conversation, I just freeze up",
            ],
            explanation:
              "Speaker C says speaking in real-time conversations is the hardest part.",
          },
          {
            key: "D",
            text: "Speaker D",
            answer: "e",
            scriptLineIndex: 3,
            evidenceParts: [
              "I really kick myself for not putting in the effort",
              "I just didn't see the value back then",
              "I can't help feeling like I've missed the boat",
            ],
            explanation:
              "Speaker D clearly regrets not making the effort to learn earlier.",
          },
        ],
      
        script: [
          {
            speaker: "Speaker A",
            text:
              "I never planned to learn another language, to be honest. At school, I did the minimum and forgot most of it afterwards. The real catalyst was when my firm expanded into international markets. Suddenly, my professional growth depended on handling negotiations and emails in a second language. I’m still not especially confident when I speak, but it’s definitely become part of my job now.",
          },
          {
            speaker: "Speaker B",
            text:
              "For me, the best way to improve is immersion that doesn't feel like a chore. I’ve never been someone who can sit down with a grammar textbook and find it useful; I find those rules quite dry. What really sticks is watching series or listening to podcasts or reading song lyrics online. I learn so much more when I'm actually engaged with the content rather than just studying lists.",
          },
          {
            speaker: "Speaker C",
            text:
              "People assume reading is the hurdle, but I find it quite manageable because I can take my time. Writing is the same—I have control. But the moment I'm in a real-time conversation, I just freeze up even though I know the words. I’ve tried learning with others in a group, which was fun, but it didn't stop the nerves when it comes to dealing with people face to face.",
          },
          {
            speaker: "Speaker D",
            text:
              "I really kick myself for not putting in the effort when I had every opportunity, but I just didn't see the value back then. Now that I’m travelling and meeting people from all over, I realize what I'm missing out on. I actually really enjoy making my way through grammar books and exercises these days, but I can't help feeling like I've missed the boat — I’m not sure I’ll ever get properly fluent.",
          },
        ],
      },

      {
        id: "eating-out",
        title: "Eating Out",
        intro:
          "Listen to four people talking about eating out. For questions 1–4, choose from the list what each speaker says. Use each letter only once. There are two extra options which you do not need. You can listen to the recording twice.",
        audioSrc: "/audio/listening/part2/eating-out.mp3",
      
        choices: [
          { key: "a", text: "prefers eating out on special occasions only." },
          { key: "b", text: "finds restaurant prices too high these days." },
          { key: "c", text: "enjoys trying new cuisines when eating out." },
          { key: "d", text: "thinks eating out is a good way to socialise." },
          { key: "e", text: "would rather cook at home most of the time." },
          { key: "f", text: "regrets spending too much on eating out." },
        ],
      
        prompts: [
          {
            key: "A",
            text: "Speaker A",
            answer: "b",
            scriptLineIndex: 0,
            evidenceParts: [
              "living month to month",
              "even basic dishes seem over the top now",
            ],
            explanation:
              "Speaker A says restaurant meals now feel too expensive, even for basic dishes, so the best match is that restaurant prices are too high these days.",
          },
          {
            key: "B",
            text: "Speaker B",
            answer: "a",
            scriptLineIndex: 1,
            evidenceParts: [
              "reserved strictly for those landmark events",
              "a big promotion or a family reunion",
              "a genuine treat rather than just another Tuesday night",
            ],
            explanation:
              "Speaker B says restaurant visits should be saved for important occasions, so this clearly matches eating out on special occasions only.",
          },
          {
            key: "C",
            text: "Speaker C",
            answer: "c",
            scriptLineIndex: 2,
            evidenceParts: [
              "I want to encounter something I’ve never come across before",
              "some unique ingredients",
              "a style of cooking that’s completely unfamiliar",
            ],
            explanation:
              "Speaker C is motivated by novelty and unfamiliar food, so the best match is enjoying new cuisines when eating out.",
          },
          {
            key: "D",
            text: "Speaker D",
            answer: "d",
            scriptLineIndex: 3,
            evidenceParts: [
              "you’re forced to actually look at one another",
              "those distractions just sort of vanish",
              "you leave feeling like you’ve had a proper catch-up",
            ],
            explanation:
              "Speaker D focuses on conversation and connection rather than the food itself, so this matches the idea that eating out is a good way to socialise.",
          },
        ],
      
        script: [
          {
            speaker: "Speaker A",
            text:
              "Lately, I've cut back on restaurant trips quite a lot. For sure – moving out of the city and having kids has totally taken its toll on our nightlife, but more to the point, what used to be a fun habit with mates after work just feels like overindulgence when you’re living month to month—even basic dishes seem over the top now. I still enjoy the vibe when I do go, but I've been opting for quick home meals or deliveries instead. Let’s face it, it’s probably a good deal healthier too, if I’m honest.",
          },
          {
            speaker: "Speaker B",
            text:
              "I’ve never really been the type to head out for a meal just because I can’t be bothered to cook. Most weeknights, I’m perfectly happy just throwing something simple together in my own kitchen after I get home from work; it’s just more practical and fits my routine. I prefer to keep restaurant visits as something to look forward to, reserved strictly for those landmark events like a big promotion or a family reunion. It makes the whole experience feel like a genuine treat rather than just another Tuesday night. Otherwise, it loses that bit of magic, doesn’t it?",
          },
          {
            speaker: "Speaker C",
            text:
              "I’m not one for those predictable spots where you already know exactly what to expect from the menu. If I’m heading out, I want to encounter something I’ve never come across before—maybe some unique ingredients or a style of cooking that’s completely unfamiliar. I sometimes try to recreate those sensations in my own kitchen, but in my experience, you just can’t really get that restaurant taste in your own kitchen, can you? I dunno if it’s secret ingredients, or just the whole eating out experience, you know what I mean?",
          },
          {
            speaker: "Speaker D",
            text:
              "To be honest, the actual food is almost secondary for me. It’s more about the fact that when you’re tucked away in a booth somewhere, you’re forced to actually look at one another. At home, there’s always a laptop open or the TV humming in the background, but in a restaurant, those distractions just sort of vanish. I try to make space for that once or twice a month with the people closest to me. Even if I sometimes feel like I’m overspending when money’s tight, you leave feeling like you’ve had a proper catch-up, and you really can’t put a price on that.",
          },
        ],
      },
];

const LETTERS = ["a", "b", "c", "d", "e", "f"];

export default function ListeningPart2({ user, onRequireSignIn }) {
  const items = PART2_LISTENING_TASKS;

  const [taskIndex, setTaskIndex] = useState(0);
  const current = items[taskIndex] || items[0];

  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [checkedOnce, setCheckedOnce] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [whyOpen, setWhyOpen] = useState(null);

  const scriptLineRefs = useRef({});
  const audioRef = useRef(null);

  const [playsUsed, setPlaysUsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const decoratedItems = useMemo(
    () =>
      items.map((t, i) => {
        const locked = !user && i >= 1;
        return {
          ...t,
          locked,
          title: `${i + 1}. ${t.title}${locked ? " 🔒" : ""}`,
        };
      }),
    [items, user]
  );

  useEffect(() => {
    setAnswers({});
    setFeedback({});
    setCheckedOnce(false);
    setShowScript(false);
    setWhyOpen(null);
    stopAudio(true);
    setPlaysUsed(0);
  }, [current?.id]);

  useEffect(() => {
    if (!whyOpen) return;
    const stmt = current?.prompts?.find((s) => s.key === whyOpen);
    if (!stmt) return;
  
    setShowScript(true);
  
    const node = scriptLineRefs.current?.[stmt.scriptLineIndex];
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [whyOpen, current]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    el.addEventListener("ended", onEnded);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);

    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, [current?.id]);

  function handleSelectTask(nextIndex) {
    if (!user && nextIndex >= 1) {
      onRequireSignIn?.();
      return;
    }
    setTaskIndex(nextIndex);
  }

  function handleChange(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (whyOpen === key) setWhyOpen(null);
    setFeedback((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  function handleReset() {
    setAnswers({});
    setFeedback({});
    setWhyOpen(null);
    toast("Answers cleared.");
  }

  function handleShowAnswers() {
    const ans = {};
    const fbMap = {};
    current.prompts.forEach((s) => {
        ans[s.key] = s.answer;
        fbMap[s.key] = true;
      });
    setAnswers(ans);
    setFeedback(fbMap);
    setCheckedOnce(true);
    setShowScript(true);
    setWhyOpen(null);
  }

  async function handleCheck() {
    setWhyOpen(null);

    const fbMap = {};
    let correct = 0;

    current.prompts.forEach((s) => {
      const chosen = (answers[s.key] || "").trim();
      const ok = chosen && chosen === s.answer;
      fbMap[s.key] = !!ok;
      if (ok) correct += 1;
    });

    setFeedback(fbMap);
    setCheckedOnce(true);

    const total = current.prompts.length;

    if (correct === total) {
      toast("Perfect ✓");
      try {
        if (user && fb.logListeningPart2Completed) {
          await fb.logListeningPart2Completed({
            taskId: current.id,
            playsUsed,
            source: "ListeningPart2",
          });
        }
      } catch (e) {
        console.warn("[listening p2] completion log failed:", e);
      }
    } else {
      toast(`${correct}/${total} correct`);
    }

    try {
      if (user && fb.logListeningPart2Attempted) {
        await fb.logListeningPart2Attempted({
          taskId: current.id,
          score: correct,
          total,
          playsUsed,
          source: "ListeningPart2",
        });
      }
    } catch (e) {
      console.warn("[listening p2] attempt log failed:", e);
    }
  }

  function stopAudio(silent = false) {
    const el = audioRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
      setIsPlaying(false);
      if (!silent) toast("Stopped.");
    } catch {}
  }

  async function handlePlayStop() {
    const el = audioRef.current;
    if (!el) return;

    if (isPlaying) {
      stopAudio(true);
      return;
    }

    if (playsUsed >= 2) {
      toast("You’ve used both listens.");
      return;
    }

    setPlaysUsed((p) => p + 1);

    try {
      await el.play();
    } catch (e) {
      console.warn("[listening p2] play blocked:", e);
      toast("Click again to allow audio.");
    }
  }

  const listensLeft = Math.max(0, 2 - playsUsed);
  const playDisabled = playsUsed >= 2 && !isPlaying;

  const activeStmt = whyOpen
  ? current.prompts.find((x) => x.key === whyOpen)
  : null;
  const activeParts = activeStmt?.evidenceParts || [];

  return (
    <div className="aptis-listening2 game-wrapper">
      <StyleScope />

      <Seo
        title="Listening Part 2 | Seif Aptis Trainer"
        description="Speaker matching: decide which speaker matches each statement."
      />

      <header className="top">
        <div className="titleblock">
          <h2 className="title">Listening – Part 2 (Matching Speakers)</h2>

          <div className="tools tools-inline">
            <ChipDropdown
              items={decoratedItems}
              value={taskIndex}
              onChange={handleSelectTask}
              label="Task"
            />
          </div>

          {!user && (
            <p className="lock-note">Sign in to unlock the remaining listening tasks.</p>
          )}

          <p className="intro">{current?.intro}</p>
        </div>
      </header>

      <section className="panel">
        <div className="panelbar">
          <div className="audioBox">
            <audio ref={audioRef} src={current.audioSrc} preload="auto" />

            <button
              type="button"
              className={`btn ${isPlaying ? "danger" : "primary"}`}
              onClick={handlePlayStop}
              disabled={playDisabled}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>

            <div className="listenMeta">
              <span className={`pill ${playsUsed >= 2 ? "pill-dim" : ""}`}>
                Listens left: <strong>{listensLeft}</strong>/2
              </span>
              {playsUsed > 0 && (
                <span className="smallnote">(You’ve used {playsUsed} of 2)</span>
              )}
            </div>
          </div>

          <div className="controls">
            <button className="btn" onClick={handleReset}>Reset</button>
            <button className="btn primary" onClick={handleCheck}>Check</button>
            <button className="btn ghost" onClick={handleShowAnswers}>Show answers</button>
          </div>
        </div>

        <h3 className="minihead">Choose the correct statement for each speaker.</h3>

        <div className="rows">
        {current.prompts.map((s, idx) => {
            const chosen = answers[s.key] || "";
            const fbItem = feedback[s.key];
            const status = fbItem === true ? "ok" : fbItem === false ? "bad" : "";

            return (
              <React.Fragment key={s.key}>
                <div className="row">
                  <div className="stmt">
                    <span className="num">{idx + 1}.</span> {s.text}
                  </div>

                  <div className="answerCol">
                    <select
                      className={`select ${status}`}
                      value={chosen}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      aria-label={`Choose speaker for statement ${idx + 1}`}
                    >
                      <option value="">—</option>
{current.choices.map((choice) => (
  <option key={choice.key} value={choice.key}>
    {choice.text}
  </option>
))}
                    </select>

                    <button
                      type="button"
                      className="why-btn"
                      disabled={!checkedOnce}
                      onClick={() => setWhyOpen((cur) => (cur === s.key ? null : s.key))}
                    >
                      Why?
                    </button>
                  </div>
                </div>

                {whyOpen === s.key && (
                  <div className="why-box">
                    <div className="why-row">
                      <span className="why-label">Answer:</span>
                      <strong>
  {current.choices.find((o) => o.key === s.answer)?.text}
</strong>
                    </div>
                    <div className="why-row">
                      <span className="why-label">Evidence:</span>
                      <span className="why-evidence">
                        {Array.isArray(s.evidenceParts) ? s.evidenceParts.join(" … ") : ""}
                      </span>
                    </div>
                    <div className="why-row">
                      <span className="why-label">Explanation:</span>
                      <span>{s.explanation}</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="scriptWrap">
          <button
            type="button"
            className="linkbtn"
            disabled={!checkedOnce}
            onClick={() => setShowScript((v) => !v)}
          >
            {showScript ? "Hide script" : "Show script"}
          </button>

          {showScript && checkedOnce && (
            <div className="scriptPanel">
              <h4 className="scriptTitle">Script</h4>
              <div className="scriptLines">
                {current.script.map((line, i) => {
                  const isTarget = activeStmt?.scriptLineIndex === i;
                  return (
                    <div
                      className={`scriptLine ${isTarget ? "active-script-line" : ""}`}
                      key={i}
                      ref={(node) => {
                        scriptLineRefs.current[i] = node;
                      }}
                    >
                      <span className="speaker">{line.speaker}:</span>{" "}
                      <span className="text">
                        {whyOpen ? highlightEvidence(line.text, activeParts) : line.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function highlightEvidence(text, parts = []) {
  if (!parts || parts.length === 0) return text;

  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = parts.map((p) => String(p || "").trim()).filter(Boolean);
  if (cleaned.length === 0) return text;

  const regex = new RegExp("(" + cleaned.map((p) => escapeRegex(p)).join("|") + ")", "gi");

  return String(text).split(regex).map((seg, i) => {
    const isHit = cleaned.some((p) => seg.toLowerCase() === p.toLowerCase());
    return isHit ? (
      <mark key={i} className="evidence">{seg}</mark>
    ) : (
      <React.Fragment key={i}>{seg}</React.Fragment>
    );
  });
}

function ChipDropdown({ items, value, onChange, label = "Task" }) {
  return (
    <div className="chipwrap">
      <span className="chiplabel">{label}</span>
      <select
        className="chipselect"
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        aria-label={label}
      >
        {items.map((it, i) => (
          <option key={it.id || i} value={i} disabled={!!it.locked}>
            {it.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function StyleScope() {
  return (
    <style>{`
      .aptis-listening2 { max-width: 1100px; margin: 0 auto; }

      .top { margin-bottom: 1rem; }
      .title { margin: 0 0 .25rem; font-size: 1.65rem; }
      .intro { margin: 0; color: #a9b7d1; max-width: 70ch; }

      .titleblock { max-width: 900px; }
      .tools-inline { margin: .6rem 0 .75rem; max-width: 420px; }
      .lock-note { margin: 0 0 .5rem; color: #9fc2ff; font-size: .92rem; }

      @media (max-width: 720px) {
        .tools-inline { max-width: none; width: 100%; }
        .chipselect { width: 100%; }
      }

      .panel {
        background: #0f1b33;
        border: 1px solid #2c4b83;
        border-radius: 14px;
        padding: 1rem;
      }

      .panelbar {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .audioBox { display:flex; align-items:center; gap:.75rem; flex-wrap: wrap; }
      .listenMeta { display:flex; align-items:baseline; gap:.5rem; flex-wrap: wrap; }
      .smallnote { color: #a9b7d1; font-size: .9rem; }

      .minihead { margin: .25rem 0 1rem; font-size: 1.05rem; color: #e6f0ff; }
      .rows { display:flex; flex-direction:column; gap: .85rem; }

      .row {
        display:grid;
        grid-template-columns: 1fr 320px;
        gap: .75rem;
        align-items:center;
      }
      @media (max-width: 720px){
        .row { grid-template-columns: 1fr; }
      }

      .answerCol { display:flex; gap: .6rem; align-items:center; }
      .stmt { color:#e6f0ff; line-height: 1.35; }
      .num { display:inline-block; min-width: 1.4rem; color:#cfe0ff; font-weight: 700; }

      .select {
        width: 100%;
        flex: 1;
        background:#101f3f;
        border: 1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 10px;
        padding: .6rem .7rem;
        outline: none;
      }
      .select.ok { border-color: rgba(70, 200, 120, .85); box-shadow: 0 0 0 2px rgba(70,200,120,.15); }
      .select.bad { border-color: rgba(235, 80, 80, .85); box-shadow: 0 0 0 2px rgba(235,80,80,.15); }

      .why-btn {
        background:#13213b;
        border:1px solid #2c4b83;
        color:#9fc2ff;
        font-weight:800;
        border-radius: 10px;
        padding: .55rem .75rem;
        cursor:pointer;
        white-space: nowrap;
      }
      .why-btn:hover { border-color:#4a79d8; }
      .why-btn:disabled { opacity:.55; cursor:not-allowed; }

      .why-box {
        margin-top: .55rem;
        margin-bottom: .25rem;
        background:#0f1b31;
        border:1px solid rgba(210,225,255,.18);
        border-radius: 12px;
        padding: .75rem .85rem;
      }
      .why-row { display:flex; gap:.5rem; flex-wrap: wrap; line-height: 1.45; }
      .why-label { color:#9fc2ff; font-weight: 900; }
      .why-evidence { font-style: italic; color:#cfd9f3; }

      .controls { display:flex; gap:.6rem; flex-wrap: wrap; }

      .btn {
        background:#13213b;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 10px;
        padding: .55rem .8rem;
        cursor:pointer;
        font-weight: 700;
      }
      .btn:hover { border-color:#4a79d8; }
      .btn:disabled { opacity:.55; cursor:not-allowed; }

      .btn.primary {
        background: linear-gradient(180deg, rgba(88,150,255,.35), rgba(88,150,255,.15));
        border-color: rgba(88,150,255,.85);
      }
      .btn.danger {
        background: linear-gradient(180deg, rgba(235,80,80,.25), rgba(235,80,80,.12));
        border-color: rgba(235,80,80,.8);
      }
      .btn.ghost {
        background: transparent;
        border-color: rgba(210, 225, 255, .35);
      }

      .linkbtn {
        background: transparent;
        border: none;
        color: #9fc2ff;
        padding: 0;
        cursor: pointer;
        font-weight: 800;
      }
      .linkbtn:disabled { opacity:.55; cursor:not-allowed; }

      .pill {
        display:inline-flex;
        align-items:center;
        gap:.35rem;
        padding: .25rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.18);
        background: rgba(255,255,255,.06);
        color: #e6f0ff;
        font-size: .9rem;
      }
      .pill-dim { opacity: .75; }

      .scriptWrap { margin-top: 1rem; }
      .scriptPanel {
        margin-top: .75rem;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(210,225,255,.18);
        border-radius: 12px;
        padding: .9rem;
      }
      .scriptTitle { margin: 0 0 .5rem; }
      .scriptLines { display:flex; flex-direction:column; gap:.65rem; }
      .scriptLine { color: #e6f0ff; line-height: 1.45; }
      .scriptLine.active-script-line {
        border-left: 4px solid rgba(110,168,255,.6);
        padding-left: .6rem;
      }
      .speaker { font-weight: 900; color: #cfe0ff; }

      mark.evidence {
        background: rgba(255,214,102,.18);
        border-bottom: 2px solid rgba(255,214,102,.55);
        color: #e6f0ff;
        padding: 0 .1rem;
        border-radius: 2px;
      }

      .chipwrap { display:flex; flex-direction:column; gap:.35rem; }
      .chiplabel { color:#a9b7d1; font-weight: 800; font-size:.85rem; }
      .chipselect {
        background:#101f3f;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 999px;
        padding: .5rem .8rem;
        outline:none;
      }
    `}</style>
  );
}