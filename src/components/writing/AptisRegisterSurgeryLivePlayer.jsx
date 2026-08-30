import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Radio, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import {
  submitRegisterSurgeryLiveRewrites,
  submitRegisterSurgeryLiveSpot,
} from "../../api/liveGames.js";
import { auth, rtdb } from "../../firebase.js";
import { toast } from "../../utils/toast.js";
import Seo from "../common/Seo.jsx";
import {
  REGISTER_SURGERY_COMPARISONS,
  REGISTER_SURGERY_EMAILS,
  REGISTER_SURGERY_LIVE_GAME_TYPE,
} from "./data/aptisWritingRegisterSurgery.js";
import {
  getRegisterSurgerySpotDistribution,
  RegisterSurgeryLiveEmail,
  RegisterSurgeryLiveRewriteForm,
  RegisterSurgeryLiveRewriteReview,
  RegisterSurgeryLiveSource,
} from "./AptisRegisterSurgeryLiveShared.jsx";
import "./aptisRegisterSurgeryLive.css";

const PHASE_LABELS = {
  lobby: "Waiting",
  informal_spot: "1/5 · Spot",
  informal_spot_review: "1/5 · Review",
  informal_rewrite: "2/5 · Rewrite",
  informal_rewrite_review: "2/5 · Review",
  formal_spot: "3/5 · Spot",
  formal_spot_review: "3/5 · Review",
  formal_rewrite: "4/5 · Rewrite",
  formal_rewrite_review: "4/5 · Review",
  compare: "5/5 · Compare",
  finished: "Complete",
};

export default function AptisRegisterSurgeryLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [spotDrafts, setSpotDrafts] = useState({ informal: [], formal: [] });
  const [rewriteDrafts, setRewriteDrafts] = useState({ informal: {}, formal: {} });

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const players = useMemo(
    () => Object.entries(game?.players || {}).map(([id, entry]) => ({ id, ...entry })),
    [game?.players]
  );
  const phase = game?.state?.phase || "lobby";

  useEffect(() => {
    if (!player) return;
    setSpotDrafts((current) => ({
      informal: player.registerSurgery?.spot?.informal?.selectedIds || current.informal,
      formal: player.registerSurgery?.spot?.formal?.selectedIds || current.formal,
    }));
    setRewriteDrafts((current) => ({
      informal: player.registerSurgery?.rewrites?.informal?.answers || current.informal,
      formal: player.registerSurgery?.rewrites?.formal?.answers || current.formal,
    }));
  }, [player]);

  function toggleSpot(kind, phraseId) {
    if (player?.registerSurgery?.spot?.[kind]) return;
    setSpotDrafts((current) => {
      const selected = new Set(current[kind]);
      if (selected.has(phraseId)) selected.delete(phraseId);
      else selected.add(phraseId);
      return { ...current, [kind]: [...selected] };
    });
  }

  function updateRewrite(kind, itemId, value) {
    if (player?.registerSurgery?.rewrites?.[kind]) return;
    setRewriteDrafts((current) => ({
      ...current,
      [kind]: { ...current[kind], [itemId]: value },
    }));
  }

  async function submitSpot(kind) {
    if (saving || player?.registerSurgery?.spot?.[kind]) return;
    if (!spotDrafts[kind].length) return toast("Select at least one expression before submitting.");
    setSaving(true);
    try {
      await submitRegisterSurgeryLiveSpot({ gameId, kind, selectedIds: spotDrafts[kind] });
    } catch (error) {
      console.error("[AptisRegisterSurgeryLivePlayer] selection save failed", error);
      toast(error.message || "Your selections could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function submitRewrites(kind) {
    if (saving || player?.registerSurgery?.rewrites?.[kind]) return;
    const complete = REGISTER_SURGERY_EMAILS[kind].rewrites.every((item) => rewriteDrafts[kind][item.id]?.trim());
    if (!complete) return toast("Write an alternative for every expression before submitting.");
    setSaving(true);
    try {
      await submitRegisterSurgeryLiveRewrites({ gameId, kind, rewrites: rewriteDrafts[kind] });
    } catch (error) {
      console.error("[AptisRegisterSurgeryLivePlayer] rewrite save failed", error);
      toast(error.message || "Your rewrites could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="register-live-page"><p>Joining Register Surgery…</p></main>;
  if (!game || game.type !== REGISTER_SURGERY_LIVE_GAME_TYPE) {
    return <main className="register-live-page"><h1>Live Register Surgery</h1><p>Session not found.</p></main>;
  }
  if (!player) {
    return <main className="register-live-page"><h1>Live Register Surgery</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;
  }

  const activeKind = phase.startsWith("informal") ? "informal" : phase.startsWith("formal") ? "formal" : null;
  const isSpotPhase = phase.endsWith("_spot");
  const isSpotReview = phase.endsWith("_spot_review");
  const isRewritePhase = phase.endsWith("_rewrite");
  const isRewriteReview = phase.endsWith("_rewrite_review");
  const spotSubmission = activeKind ? player.registerSurgery?.spot?.[activeKind] : null;
  const rewriteSubmission = activeKind ? player.registerSurgery?.rewrites?.[activeKind] : null;
  const spotSubmitters = activeKind
    ? players.filter((entry) => entry.registerSurgery?.spot?.[activeKind])
    : [];
  const comparisonIndex = Number(game?.state?.reviewIndex ?? -1);

  return (
    <main className="register-live-page register-live-player">
      <Seo title="Live Register Surgery | Seif Aptis Trainer" description="Student Aptis Writing Part 4 live register activity." />
      <header className="register-live-header">
        <div><p>Aptis Writing Part 4 · Live classroom</p><h1>Register Surgery</h1></div>
        <span>{PHASE_LABELS[phase] || phase}</span>
      </header>

      {phase === "lobby" ? (
        <section className="register-live-wait"><Users size={45} /><h2>You’re in the room</h2><p>Your teacher will open the informal email when everyone is ready.</p></section>
      ) : null}

      {(isSpotPhase || isRewritePhase) && activeKind ? <RegisterSurgeryLiveSource compact /> : null}

      {isSpotPhase && activeKind ? (
        <section className="register-live-stage">
          {spotSubmission ? <SubmittedNotice text="Your selections are locked. Wait for your teacher to reveal the class result." /> : <RoundNotice text="Select every expression that does not suit the reader." />}
          <RegisterSurgeryLiveEmail
            disabled={Boolean(spotSubmission)}
            kind={activeKind}
            onToggle={(phraseId) => toggleSpot(activeKind, phraseId)}
            selectedIds={spotSubmission?.selectedIds || spotDrafts[activeKind]}
          />
          {!spotSubmission ? <button className="register-live-primary register-live-next" disabled={saving || !spotDrafts[activeKind].length} onClick={() => submitSpot(activeKind)} type="button"><Send size={18} /> {saving ? "Submitting…" : "Submit selections"}</button> : null}
        </section>
      ) : null}

      {isSpotReview && activeKind ? (
        <section className="register-live-stage">
          <div className="register-live-stage-heading"><div><p>Class review</p><h2>Selections from the whole class</h2></div><span>{spotSubmitters.length} submissions</span></div>
          <RegisterSurgeryLiveEmail
            disabled
            distribution={getRegisterSurgerySpotDistribution(spotSubmitters, activeKind)}
            kind={activeKind}
            responseCount={spotSubmitters.length}
            reveal
            selectedIds={spotSubmission?.selectedIds || []}
          />
          <div className="register-live-wait is-compact"><p>Discuss the result. Your teacher will open the rewrite round.</p></div>
        </section>
      ) : null}

      {isRewritePhase && activeKind ? (
        <section className="register-live-stage">
          {rewriteSubmission ? <SubmittedNotice text="Your rewrites are locked. Wait for your teacher to open the anonymous review." /> : <RoundNotice text="Rewrite every highlighted expression for the intended reader." />}
          <RegisterSurgeryLiveRewriteForm
            disabled={Boolean(rewriteSubmission)}
            kind={activeKind}
            onChange={(itemId, value) => updateRewrite(activeKind, itemId, value)}
            values={rewriteSubmission?.answers || rewriteDrafts[activeKind]}
          />
          {!rewriteSubmission ? <button className="register-live-primary register-live-next" disabled={saving} onClick={() => submitRewrites(activeKind)} type="button"><Send size={18} /> {saving ? "Submitting…" : "Submit all rewrites"}</button> : null}
        </section>
      ) : null}

      {isRewriteReview && activeKind ? (
        <section className="register-live-stage">
          <RegisterSurgeryLiveRewriteReview gameId={gameId} kind={activeKind} players={players} />
          <div className="register-live-wait is-compact"><p>Review the alternatives together. Your teacher will open the next stage.</p></div>
        </section>
      ) : null}

      {phase === "compare" ? (
        <section className="register-live-stage">
          <div className="register-live-stage-heading"><div><p>Final comparison</p><h2>What changes with the reader?</h2></div><span>{Math.max(0, comparisonIndex + 1)}/{REGISTER_SURGERY_COMPARISONS.length} revealed</span></div>
          <StudentComparison revealIndex={comparisonIndex} />
          <div className="register-live-wait is-compact"><p>Your teacher will reveal each comparison in turn.</p></div>
        </section>
      ) : null}

      {phase === "finished" ? (
        <section className="register-live-stage register-live-player-finished">
          <CheckCircle2 size={48} />
          <p>Activity complete</p>
          <h2>Register changes with the reader</h2>
          <span>Formal does not mean “use the most complicated English possible”. The language should simply suit the relationship and purpose.</span>
          <StudentComparison revealIndex={REGISTER_SURGERY_COMPARISONS.length - 1} />
        </section>
      ) : null}
    </main>
  );
}

function RoundNotice({ text }) {
  return <div className="register-live-round-notice"><Radio size={20} /><div><strong>Your turn</strong><span>{text}</span></div></div>;
}

function SubmittedNotice({ text }) {
  return <div className="register-live-round-notice is-done"><CheckCircle2 size={21} /><div><strong>Response submitted</strong><span>{text}</span></div></div>;
}

function StudentComparison({ revealIndex }) {
  return (
    <div className="register-live-comparison-grid">
      {REGISTER_SURGERY_COMPARISONS.map((item, index) => (
        <article className={index <= revealIndex ? "is-revealed" : ""} key={item.area}>
          <header><span>{index + 1}</span><strong>{item.area}</strong></header>
          {index <= revealIndex ? <div><p><small>Informal</small>{item.informal}</p><span aria-hidden="true">→</span><p><small>Formal</small>{item.formal}</p></div> : <p>Waiting for teacher reveal…</p>}
        </article>
      ))}
    </div>
  );
}
