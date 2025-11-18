// src/components/grammar/GrammarSetRunner.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGrammarSet, submitGrammarSetAttempt } from "../../firebase";
import { fetchItemsByIds } from "../../api/grammar";
import GapFillList from "../GapFillList";
import { toast } from "../../utils/toast";
import { QRCodeSVG } from "qrcode.react";   // 👈 NEW

export default function GrammarSetRunner({ user }) {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [setMeta, setSetMeta]   = useState(null);
  const [items, setItems]       = useState([]);
  const [answers, setAnswers]   = useState({});   // itemId -> details
  const [submitted, setSubmitted] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [showQR, setShowQR] = useState(false);

  // called by GapFillItem via GapFillList
  const handleItemAnswer = (details) => {
    if (!details || !details.itemId) return;

    setAnswers((prev) => {
      // don’t overwrite if something weird calls twice
      if (prev[details.itemId]) return prev;
      return { ...prev, [details.itemId]: details };
    });
  };

  // Load the set + its items
  useEffect(() => {
    async function load() {
      try {
        const meta = await getGrammarSet(setId);
        if (!meta || meta.visibility !== "published") {
          setSetMeta(null);
          return;
        }
        setSetMeta(meta);

        const qs = await fetchItemsByIds(meta.itemIds || []);
        setItems(qs);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setId]);

    // When all items are answered once, submit attempt
    useEffect(() => {
        if (!setMeta || !items.length) return;
        if (!user) return;
    
        const answeredIds = Object.keys(answers);
        if (!answeredIds.length) return;
    
        // only submit once, when all items have been answered
        if (answeredIds.length !== items.length || submitted) return;
    
        setSubmitted(true); // prevent double-submit
    
        const detailsArr = answeredIds.map((id) => answers[id]);
        const correct = detailsArr.filter((d) => d && d.isCorrect).length;
        const total = items.length;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    
        (async () => {
          try {
            await submitGrammarSetAttempt({
              setId,
              setTitle: setMeta.title || "",
              ownerUid: setMeta.ownerId || null,
              studentUid: user.uid,
              studentEmail: user.email || null,
              score: correct,
              total,
              answers: detailsArr,
            });
    
            setResultMsg(
              `Results saved: ${correct}/${total} correct (${percent}%).`
            );
          } catch (err) {
            console.error("Error saving grammar set attempt:", err);
            setResultMsg(
              "You completed this set, but there was a problem saving your results."
            );
          }
        })();
      }, [answers, items, setMeta, setId, submitted, user]);    

  // ── Early returns (AFTER all hooks) ────────────────────────────────
  if (!user) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Please sign in to access this grammar set.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Loading grammar set…</p>
      </div>
    );
  }

  if (!setMeta) {
    return (
      <div className="panel" style={{ marginTop: "1rem" }}>
        <p>Sorry, this set is not available.</p>
        <button className="btn" type="button" onClick={() => navigate("/")}>
          Go back home
        </button>
      </div>
    );
  }

    // 🔍 Derived flags and state for display
    const isTestMode = !!setMeta.testMode;
    const reviewAfterTest = !!setMeta.reviewAfterTest;
  
    const answeredIds = Object.keys(answers);
    const total = items.length;
    const detailsArr = answeredIds.map((id) => answers[id]);
    const correct = detailsArr.filter((d) => d && d.isCorrect).length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  
    // Whether the attempt has been submitted and finished
    const isFinished = submitted;
  
  
  const shareUrl = `${window.location.origin}/grammar-sets/${setId}`;

  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h1 className="sec-title" style={{ marginBottom: ".25rem" }}>
        {setMeta.title}
      </h1>
      {setMeta.description && (
        <p className="muted" style={{ marginBottom: ".75rem" }}>
          {setMeta.description}
        </p>
      )}

      {/* 🔗 Share box */}
<div
  style={{
    marginTop: "1.25rem",
    marginBottom: "1.5rem",
    padding: "1.25rem 1.25rem",
    background: "#0b1220",
    borderRadius: "1rem",
    border: "1px solid #1e293b",
  }}
>
  <p
    style={{
      fontSize: "1rem",
      fontWeight: 600,
      margin: 0,
      marginBottom: ".4rem",
      color: "#e2e8f0",
    }}
  >
    🔗 Share this set
  </p>

  <p
    style={{
      fontSize: ".83rem",
      opacity: 0.7,
      marginTop: 0,
      marginBottom: ".75rem",
    }}
  >
    Send this link to your students — it works for anyone with an account.
  </p>

  <div
  style={{
    display: "flex",
    gap: ".6rem",
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
  <input
    type="text"
    value={shareUrl}
    readOnly
    style={{
      flex: "1 1 280px",
      padding: "0.55rem .75rem",
      borderRadius: "0.6rem",
      border: "1px solid #334155",
      background: "#020617",
      color: "#e5e7eb",
      fontSize: "0.9rem",
    }}
    onFocus={(e) => e.target.select()}
  />

  {/* Copy link button */}
  <button
    type="button"
    className="review-btn"
    onClick={() => {
      navigator.clipboard.writeText(shareUrl);
      toast("✔ Link copied!", { duration: 1500 });
    }}
  >
    📋 Copy link
  </button>

  {/* QR toggle button */}
  <button
    type="button"
    className="review-btn"
    onClick={() => setShowQR((s) => !s)}
  >
    📱 {showQR ? "Hide QR" : "Show QR"}
  </button>
</div>
{showQR && (
  <div
    style={{
      marginTop: ".9rem",
      padding: ".75rem 1rem",
      borderRadius: ".9rem",
      border: "1px solid #1e293b",
      background: "#020617",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      flexWrap: "wrap",
    }}
  >
    <QRCodeSVG
      value={shareUrl}
      size={120}
      bgColor="transparent"
      fgColor="#e5e7eb"
    />
    <p
      className="tiny muted"
      style={{ maxWidth: "260px", margin: 0, lineHeight: 1.4 }}
    >
      Scan this QR code on your phones to open the set directly.
    </p>
  </div>
)}

</div>

{isTestMode && (
  <div
    style={{
      margin: "0 0 1.1rem 0",
      padding: "0.85rem 1rem",
      borderRadius: "0.65rem",
      border: "1px solid #9c6f1e",
      background: "linear-gradient(180deg, #f7d879 0%, #e7c15a 100%)",
      color: "#2c1a00",
      fontSize: ".95rem",
      lineHeight: 1.45,
      fontWeight: 500,
      boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
    }}
  >
    ⚠ <strong>TEST MODE ACTIVE</strong>  
    <br />
    You will <strong>not</strong> see which answers are correct while completing the set.
    {reviewAfterTest
      ? " A full breakdown will appear when you finish."
      : " No answer review will be shown afterwards — this simulates a real exam."}
  </div>
)}

      {resultMsg && (
        <p className="small muted" style={{ marginTop: ".5rem" }}>
          {resultMsg}
        </p>
      )}

      {/* Re-use existing grammar UI */}
      <GapFillList
        items={items}
        onAnswer={handleItemAnswer}
        testMode={isTestMode}
        runKey={setId}
      />

{isFinished && (
        <div
          className="review-card"
          style={{
            marginTop: ".75rem",
            padding: "1rem 1.25rem",
            borderRadius: "1rem",
            background: "#0b1220",
            border: "1px solid #1e293b",
          }}
        >
          <p
            className="small"
            style={{
              marginBottom: "1rem",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            🎯 You scored{" "}
            <strong>
              {correct}/{total}
            </strong>{" "}
            ({percent}%)
          </p>

          {/* Detailed review: only in practice OR test+review mode */}
          {(!isTestMode || reviewAfterTest) && (
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {items.map((item, index) => {
                const d = answers[item.id];
                const sentence = (item.sentence || item.text || "").replace(
                  "___",
                  "_____"
                );
                const student = d?.selectedOption ?? "(no answer)";
                const correctOpt = d?.correctOption ?? "(unknown)";
                const isCorrect = !!d?.isCorrect;

                return (
                  <li key={item.id} style={{ lineHeight: 1.3 }}>
                    <span
                      style={{
                        display: "block",
                        opacity: 0.9,
                        marginBottom: "0.25rem",
                      }}
                    >
                      <strong>{index + 1}.</strong> {sentence}
                    </span>

                    <span
                      style={{
                        display: "block",
                        color: isCorrect ? "#4ade80" : "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {isCorrect ? "✔" : "✖"} {student}
                    </span>

                    {!isCorrect && (
                      <span
                        className="muted tiny"
                        style={{
                          display: "block",
                          marginTop: "0.15rem",
                          opacity: 0.75,
                        }}
                      >
                        Correct: {correctOpt}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          {isTestMode && !reviewAfterTest && (
            <p className="muted tiny" style={{ marginTop: "1rem" }}>
              This set was run in <strong>test mode</strong>, so detailed
              corrections are not shown.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
