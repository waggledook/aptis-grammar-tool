import React, { useEffect, useMemo, useRef, useState } from "react";
import Seo from "../common/Seo.jsx";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Task bank (empty for now)
// ─────────────────────────────────────────────────────────────────────────────
const PART4_LISTENING_TASKS = [
    {
      id: "transport-planner",
      title: "Transport Planner",
      intro:
        "Listen to a transport planner talking at a public meeting about a pedestrianisation scheme and answer the questions below. You can listen to the recording twice.",
      audioSrc: "/audio/listening/part4/transport-planner.mp3",
      questions: [
        {
          key: "q1",
          text: "What is her opinion of the pedestrianisation scheme overall?",
          answer: "B",
          scriptLineIndex: 0,
          evidenceParts: [
            "much of the criticism has focused on what people imagine will happen",
            "rather than what is actually being proposed",
            "This is not a case of simply closing roads and hoping for the best",
            "The point is not to make life difficult for drivers",
          ],
          explanation:
            "Her overall view is broadly supportive. She argues that many objections are based on assumptions and fears rather than on the actual details of the proposal, so the best answer is that the scheme has been misunderstood by many of its critics.",
          options: [
            {
              value: "A",
              text: "It risks creating as many problems as it solves.",
            },
            {
              value: "B",
              text: "It has been misunderstood by many of its critics.",
            },
            {
              value: "C",
              text: "It is too ambitious for the area where it is being introduced.",
            },
          ],
        },
        {
          key: "q2",
          text: "What is her opinion of local opposition to the scheme?",
          answer: "C",
          scriptLineIndex: 2,
          evidenceParts: [
            "the discussion has become tied to frustrations that go well beyond this scheme",
            "as if this plan were somehow responsible for all of them",
            "Those are genuine concerns, of course, but they pre-date this proposal by years",
          ],
          explanation:
            "She suggests that some opposition is really an outlet for wider dissatisfaction in the town, such as complaints about rents, shops and transport. So the best answer is that local opposition reflects wider anger about unrelated local issues.",
          options: [
            {
              value: "A",
              text: "It is based mostly on inaccurate assumptions.",
            },
            {
              value: "B",
              text: "It shows that residents were not properly consulted.",
            },
            {
              value: "C",
              text: "It reflects wider anger about unrelated local issues.",
            },
          ],
        },
      ],
      script: [
        {
          speaker: "Transport planner",
          text:
            "I understand why some people are nervous about the pedestrianisation scheme, especially shop owners and residents who are used to driving straight into the centre. Any major change to how a town functions is bound to make people uneasy at first. But I think much of the criticism has focused on what people imagine will happen, rather than what is actually being proposed.",
        },
        {
          speaker: "Transport planner",
          text:
            "This is not a case of simply closing roads and hoping for the best. Deliveries will still be possible at certain times of day, disabled access has been built into the design, and parking is being expanded just outside the pedestrian zone. The point is not to make life difficult for drivers. It is to create a town centre that is safer, quieter and more attractive to spend time in.",
        },
        {
          speaker: "Transport planner",
          text:
            "What has surprised me is how quickly the discussion has become tied to frustrations that go well beyond this scheme. I’ve heard people complain about rising rents, empty shops and poor bus services, as if this plan were somehow responsible for all of them. Those are genuine concerns, of course, but they pre-date this proposal by years.",
        },
        {
          speaker: "Transport planner",
          text:
            "That said, I don’t dismiss people’s worries. Some concerns are reasonable, and we’ll have to monitor the impact carefully. But there’s a difference between questioning the details of a plan and suggesting it has been pushed through without listening. We held consultations for months, and while no plan will satisfy everyone, that doesn’t mean the process was superficial. What matters now is judging the scheme on the evidence once it is in place, rather than on worst-case scenarios.",
        },
      ],
    },
    {
      id: "music-critic",
      title: "Music Critic",
      intro:
        "Listen to a critic discussing a musician’s comeback album on the radio and answer the questions below. You can listen to the recording twice.",
      audioSrc: "/audio/listening/part4/music-critic.mp3",
      questions: [
        {
          key: "q1",
          text: "What is the critic’s opinion of comeback albums by well-known musicians?",
          answer: "A",
          scriptLineIndex: 0,
          evidenceParts: [
            "the return itself feels like an occasion worth celebrating",
            "the press fills up with warm retrospectives",
            "it's tempting for everyone, reviewers included, to read extra depth into every note and lyric",
            "simply because the artist is back in the spotlight",
          ],
          explanation:
            "His main point is that comeback albums often benefit from automatic goodwill and inflated praise simply because the artist has returned. That makes the first option the best answer.",
          options: [
            {
              value: "A",
              text: "They are often praised too highly simply for existing.",
            },
            {
              value: "B",
              text: "They usually fail because listeners expect too much from them.",
            },
            {
              value: "C",
              text: "They are artistically strongest when they repeat an artist’s earlier style.",
            },
          ],
        },
        {
          key: "q2",
          text: "What is the critic’s opinion of the album?",
          answer: "B",
          scriptLineIndex: 2,
          evidenceParts: [
            "The trouble is, the album doesn't fully commit to those bolder choices",
            "it pulls back toward the familiar textures and arrangements that built the musician's reputation decades ago",
            "it needs to do more than serve up a beautifully produced echo of past glories",
            "this record feels respectable, occasionally compelling, but a shade too careful",
          ],
          explanation:
            "Although he praises some parts of the album, his final judgement is that it retreats too often into familiar territory instead of fully committing to riskier ideas. So the best answer is that it relies too heavily on the style that made the musician famous.",
          options: [
            {
              value: "A",
              text: "It shows the musician is still prepared to take creative risks.",
            },
            {
              value: "B",
              text: "It relies too heavily on the style that made the musician famous.",
            },
            {
              value: "C",
              text: "It is likely to attract many younger listeners.",
            },
          ],
        },
      ],
      script: [
        {
          speaker: "Critic",
          text:
            "When veteran musicians announce a comeback album, the reception usually kicks off in much the same way. There's an instant swell of goodwill — the return itself feels like an occasion worth celebrating, the press fills up with warm retrospectives, and it's tempting for everyone, reviewers included, to read extra depth into every note and lyric simply because the artist is back in the spotlight. Plenty of these records go on to do very well commercially by playing it safe: polishing up the signature sound that made them famous in the first place and giving fans exactly the nostalgic hit they came for.",
        },
        {
          speaker: "Critic",
          text: "That is why I approached this new album with some caution.",
        },
        {
          speaker: "Critic",
          text:
            "What I can say straight away is that it's far from embarrassing. In fact, there are moments — particularly a couple of tracks in the middle — that are genuinely striking. They're sparse, restrained, and show an artist who still has the confidence to step away from the comfort zone rather than just recycle old tricks. The trouble is, the album doesn't fully commit to those bolder choices. Just as it starts to venture somewhere fresh, it pulls back toward the familiar textures and arrangements that built the musician's reputation decades ago.",
        },
        {
          speaker: "Critic",
          text:
            "There's nothing wrong with honouring your legacy, of course. Nobody reasonably expects a sixty-something artist to reinvent themselves the way a twenty-year-old newcomer might. And chasing a younger audience probably isn't even the point here. But if a comeback is going to carry real artistic weight — rather than just coast on goodwill and fond memories — it needs to do more than serve up a beautifully produced echo of past glories.",
        },
        {
          speaker: "Critic",
          text:
            "So in the end, this record feels respectable, occasionally compelling, but a shade too careful. It does a fine job of reminding us why this musician once mattered so much. I'm just not convinced it gives us strong enough reason to believe this new chapter is as vital or essential as some of the earliest reviews have claimed.",
        },
      ],
    },
  ];

export default function ListeningPart4({ user, onRequireSignIn }) {
  const items = PART4_LISTENING_TASKS.length ? PART4_LISTENING_TASKS : [EMPTY_TASK];

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
    const q = current?.questions?.find((item) => item.key === whyOpen);
    if (!q) return;

    setShowScript(true);

    const node = scriptLineRefs.current?.[q.scriptLineIndex];
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
    if (!PART4_LISTENING_TASKS.length) return;

    const ans = {};
    const fbMap = {};
    current.questions.forEach((q) => {
      ans[q.key] = q.answer;
      fbMap[q.key] = true;
    });

    setAnswers(ans);
    setFeedback(fbMap);
    setCheckedOnce(true);
    setShowScript(true);
    setWhyOpen(null);
  }

  async function handleCheck() {
    if (!PART4_LISTENING_TASKS.length) {
      toast("Tasks coming soon.");
      return;
    }

    setWhyOpen(null);

    const fbMap = {};
    let correct = 0;

    current.questions.forEach((q) => {
      const chosen = (answers[q.key] || "").trim();
      const ok = chosen && chosen === q.answer;
      fbMap[q.key] = !!ok;
      if (ok) correct += 1;
    });

    setFeedback(fbMap);
    setCheckedOnce(true);

    const total = current.questions.length;

    if (correct === total) {
      toast("Perfect ✓");

      try {
        if (user && fb.logListeningPart4Completed) {
          await fb.logListeningPart4Completed({
            taskId: current.id,
            playsUsed,
            source: "ListeningPart4",
          });
        }
      } catch (e) {
        console.warn("[listening p4] completion log failed:", e);
      }
    } else {
      toast(`${correct}/${total} correct`);
    }

    try {
      if (user && fb.logListeningPart4Attempted) {
        await fb.logListeningPart4Attempted({
          taskId: current.id,
          score: correct,
          total,
          playsUsed,
          source: "ListeningPart4",
        });
      }
    } catch (e) {
      console.warn("[listening p4] attempt log failed:", e);
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
    if (!el || !current.audioSrc) {
      toast("Audio will be added soon.");
      return;
    }

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
      console.warn("[listening p4] play blocked:", e);
      toast("Click again to allow audio.");
    }
  }

  const listensLeft = Math.max(0, 2 - playsUsed);
  const playDisabled = (playsUsed >= 2 && !isPlaying) || !current.audioSrc;

  const activeQuestion = whyOpen
    ? current.questions.find((x) => x.key === whyOpen)
    : null;
  const activeParts = activeQuestion?.evidenceParts || [];

  return (
    <div className="aptis-listening4 game-wrapper">
      <StyleScope />

      <Seo
        title="Listening Part 4 | Seif Aptis Trainer"
        description="Longer monologues with two multiple-choice questions."
      />

      <header className="top">
        <div className="titleblock">
          <h2 className="title">Listening – Part 4 (Longer Monologues)</h2>

          <div className="tools tools-inline">
            <ChipDropdown
              items={decoratedItems}
              value={taskIndex}
              onChange={handleSelectTask}
              label="Task"
            />
          </div>

          {!user && PART4_LISTENING_TASKS.length > 1 && (
            <p className="lock-note">Sign in to unlock the remaining listening tasks.</p>
          )}

          <p className="intro">{current?.intro}</p>
        </div>
      </header>

      <section className="panel">
        <div className="panelbar">
          <div className="audioBox">
            <audio ref={audioRef} src={current.audioSrc || undefined} preload="auto" />

            <button
              type="button"
              className={`btn ${isPlaying ? "danger" : "primary"}`}
              onClick={handlePlayStop}
              disabled={playDisabled}
              title={!current.audioSrc ? "Audio coming soon" : playsUsed >= 2 ? "No listens remaining" : "Play audio"}
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
            <button className="btn" onClick={handleReset}>
              Reset
            </button>
            <button className="btn primary" onClick={handleCheck}>
              Check
            </button>
            <button
              className="btn ghost"
              onClick={handleShowAnswers}
              disabled={!PART4_LISTENING_TASKS.length}
            >
              Show answers
            </button>
          </div>
        </div>

        <h3 className="minihead">Answer the questions below.</h3>

        <div className="questionList">
          {current.questions.map((q, idx) => {
            const chosen = answers[q.key] || "";
            const fbItem = feedback[q.key];
            const status = fbItem === true ? "ok" : fbItem === false ? "bad" : "";

            return (
              <React.Fragment key={q.key}>
                <div className="questionCard">
                  <div className="questionTop">
                    <div className="questionText">
                      <span className="qnum">{idx + 1}.</span> {q.text}
                    </div>

                    <button
                      type="button"
                      className="why-btn"
                      disabled={!checkedOnce || !PART4_LISTENING_TASKS.length}
                      onClick={() => setWhyOpen((cur) => (cur === q.key ? null : q.key))}
                      title={checkedOnce ? "Show explanation" : "Check first to unlock"}
                    >
                      Why?
                    </button>
                  </div>

                  <div className="optionGrid">
                    {q.options.map((opt) => {
                      const selected = chosen === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`optionBtn ${selected ? "selected" : ""} ${selected ? status : ""}`}
                          onClick={() => handleChange(q.key, opt.value)}
                        >
                          <span className="optionLetter">{opt.value}</span>
                          <span className="optionText">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {whyOpen === q.key && (
                  <div className="why-box">
                    <div className="why-row">
                      <span className="why-label">Answer:</span>
                      <strong>
                        {q.options.find((o) => o.value === q.answer)?.text || q.answer}
                      </strong>
                    </div>
                    <div className="why-row">
                      <span className="why-label">Evidence:</span>
                      <span className="why-evidence">
                        {Array.isArray(q.evidenceParts) ? q.evidenceParts.join(" … ") : ""}
                      </span>
                    </div>
                    <div className="why-row">
                      <span className="why-label">Explanation:</span>
                      <span>{q.explanation}</span>
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
            disabled={!checkedOnce || !current.script?.length}
            onClick={() => setShowScript((v) => !v)}
            title={checkedOnce ? "Toggle script" : "Check first to unlock"}
          >
            {showScript ? "Hide script" : "Show script"}
          </button>

          {showScript && checkedOnce && !!current.script?.length && (
            <div className="scriptPanel">
              <h4 className="scriptTitle">Script</h4>
              <div className="scriptLines">
                {current.script.map((line, i) => {
                  const isTarget = activeQuestion?.scriptLineIndex === i;
                  return (
                    <div
                      className={`scriptLine ${isTarget ? "active-script-line" : ""}`}
                      key={i}
                      ref={(node) => {
                        scriptLineRefs.current[i] = node;
                      }}
                    >
                      {line.speaker ? (
                        <>
                          <span className="speaker">{line.speaker}:</span>{" "}
                          <span className="text">
                            {whyOpen ? highlightEvidence(line.text, activeParts) : line.text}
                          </span>
                        </>
                      ) : (
                        <span className="text">
                          {whyOpen ? highlightEvidence(line.text, activeParts) : line.text}
                        </span>
                      )}
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

  const segments = String(text).split(regex);
  return segments.map((seg, i) => {
    const isHit = cleaned.some((p) => seg.toLowerCase() === p.toLowerCase());
    return isHit ? (
      <mark key={i} className="evidence">
        {seg}
      </mark>
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
      .aptis-listening4 { max-width: 1100px; margin: 0 auto; }

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

      .questionList { display:flex; flex-direction:column; gap: 1rem; }

      .questionCard {
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(210,225,255,.14);
        border-radius: 12px;
        padding: .9rem;
      }

      .questionTop {
        display:flex;
        justify-content:space-between;
        gap: 1rem;
        align-items:flex-start;
        margin-bottom: .85rem;
      }

      .questionText {
        color:#e6f0ff;
        line-height: 1.4;
        font-size: 1rem;
      }

      .qnum {
        display:inline-block;
        min-width: 1.3rem;
        color:#cfe0ff;
        font-weight: 700;
      }

      .optionGrid {
        display:flex;
        flex-direction:column;
        gap:.65rem;
      }

      .optionBtn {
        display:grid;
        grid-template-columns: 54px 1fr;
        align-items:center;
        gap: .8rem;
        width:100%;
        text-align:left;
        background:#101f3f;
        border:1px solid #2c4b83;
        color:#e6f0ff;
        border-radius: 10px;
        padding: 0;
        cursor:pointer;
        overflow:hidden;
      }

      .optionBtn:hover {
        border-color:#4a79d8;
      }

      .optionBtn.selected {
  background: rgba(88,150,255,.14);
  border-color: rgba(88,150,255,.85);
  box-shadow: 0 0 0 2px rgba(88,150,255,.18);
}

.optionBtn.selected .optionLetter {
  background: rgba(88,150,255,.22);
  color: #ffffff;
}

.optionBtn.selected .optionText {
  color: #ffffff;
}

      .optionBtn.ok {
        border-color: rgba(70, 200, 120, .85);
        box-shadow: 0 0 0 2px rgba(70,200,120,.15);
      }

      .optionBtn.bad {
        border-color: rgba(235, 80, 80, .85);
        box-shadow: 0 0 0 2px rgba(235,80,80,.15);
      }

      .optionLetter {
        display:flex;
        align-items:center;
        justify-content:center;
        min-height: 64px;
        font-size: 1.1rem;
        font-weight: 800;
        color:#e6f0ff;
        background: rgba(255,255,255,.05);
        border-right: 1px solid rgba(210,225,255,.14);
      }

      .optionText {
        padding: .8rem .95rem .8rem 0;
        line-height: 1.35;
      }

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
        margin-top: -.35rem;
        margin-bottom: .1rem;
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