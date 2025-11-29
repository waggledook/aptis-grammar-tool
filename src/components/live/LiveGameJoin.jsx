// src/components/live/LiveGameJoin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinLiveGameByPin } from "../../api/liveGames";
import { toast } from "../../utils/toast";

export default function LiveGameJoin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = pin.trim();
    if (!trimmed) {
      toast("Please enter the game PIN.");
      return;
    }
    setLoading(true);
    try {
      const { gameId } = await joinLiveGameByPin(trimmed);
      toast("Joined game successfully!");
      navigate(`/live/play/${gameId}`);
    } catch (err) {
      console.error("[LiveGameJoin] join failed", err);
      toast(err.message || "Could not join game.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>Join Live Game</h1>
      <p>Ask your teacher for the 6-digit PIN and enter it below.</p>

      <form onSubmit={handleSubmit} className="card" style={{ marginTop: "1rem" }}>
        <label className="field">
          <span>Game PIN</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="e.g. 742190"
          />
        </label>

        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? "Joining..." : "Join game"}
        </button>
      </form>
    </div>
  );
}
