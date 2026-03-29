import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import {
  getSpanglishGuestPlayerId,
  getSpanglishGuestPlayerToken,
  joinPublicSpanglishGameByPin,
} from "../../api/liveGames";
import { toast } from "../../utils/toast";

export default function HubSpanglishLiveJoin() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pinFromQuery = params.get("pin") || "";

  const [pin, setPin] = useState(pinFromQuery);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pinFromQuery) {
      setPin(pinFromQuery);
    }
  }, [pinFromQuery]);

  useEffect(() => {
    const savedName = typeof window !== "undefined" ? window.localStorage.getItem("spanglish_fixit_guest_name") : "";
    if (savedName) setName(savedName);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const playerId = getSpanglishGuestPlayerId();
      const playerToken = getSpanglishGuestPlayerToken();
      const { gameId } = await joinPublicSpanglishGameByPin({ pin, name, playerId, playerToken });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("spanglish_fixit_guest_name", name.trim());
      }
      navigate(`${getSitePath(`/games/spanglish-fix-it/play/${gameId}`)}?player=${encodeURIComponent(playerId)}`);
    } catch (error) {
      console.error("[HubSpanglishLiveJoin] join failed", error);
      toast(error.message || "Could not join the live game.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="menu-wrapper hub-spanglish-live-shell">
      <Seo title="Join Spanglish Fix-It Live | Seif Hub" description="Join an open Spanglish Fix-It live game." />
      <div className="hub-spanglish-live-head">
        <div>
          <p className="hub-live-kicker">Join live game</p>
          <h1>Spanglish Fix-It Live</h1>
          <p className="hub-live-copy">Enter your name and the game PIN. No sign-in needed.</p>
        </div>
        <button className="review-btn" onClick={() => navigate(getSitePath("/games"))}>
          Back to games
        </button>
      </div>

      <form className="hub-live-panel hub-live-form" onSubmit={handleSubmit}>
        <label>
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} placeholder="Marta" />
        </label>
        <label>
          Game PIN
          <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" maxLength={6} placeholder="742190" />
        </label>
        <button className="whats-new-btn" type="submit" disabled={loading}>
          {loading ? "Joining…" : "Join game"}
        </button>
      </form>

      <style>{`
        .hub-spanglish-live-shell { padding-top:0; margin-top:0; }
        .hub-spanglish-live-head { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; margin-bottom:1rem; }
        .hub-live-kicker { margin:0 0 .25rem; font-size:.82rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#8eb6ff; }
        .hub-spanglish-live-head h1 { margin:0; color:#eef4ff; font-size:clamp(1.7rem,1.35rem + 1vw,2.35rem); }
        .hub-live-copy { color:rgba(230,240,255,.82); line-height:1.45; }
        .hub-live-panel { background:rgba(20,33,59,.86); border:1px solid rgba(77,110,184,.38); border-radius:22px; padding:1.1rem 1.2rem; box-shadow:0 12px 26px rgba(0,0,0,.16); max-width:620px; }
        .hub-live-form { display:grid; gap:1rem; }
        .hub-live-form label { display:grid; gap:.45rem; color:#e8f0ff; font-weight:700; }
        .hub-live-form input { padding:.85rem 1rem; border-radius:14px; border:2px solid #35508e; background:#020617; color:#eef4ff; font-size:1rem; }
        @media (max-width:720px) {
          .hub-spanglish-live-head { flex-direction:column; }
          .hub-spanglish-live-head .review-btn { width:100%; }
        }
      `}</style>
    </div>
  );
}
