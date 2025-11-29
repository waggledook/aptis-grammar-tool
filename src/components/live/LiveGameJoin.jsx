// src/components/live/LiveGameJoin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { joinLiveGameByPin } from "../../api/liveGames";
import { toast } from "../../utils/toast";

export default function LiveGameJoin() {
    const navigate = useNavigate();
    const location = useLocation();
  
    // Grab ?pin=... from the URL (if present)
    const searchParams = new URLSearchParams(location.search);
    const pinFromQuery = searchParams.get("pin") || "";
  
    const [pin, setPin] = useState(pinFromQuery);
    const [loading, setLoading] = useState(false);
  
    // So we don't auto-join multiple times
    const [autoTried, setAutoTried] = useState(false);
  
    async function joinWithPin(rawPin) {
        const trimmed = (rawPin || "").trim();
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
    
      async function handleSubmit(e) {
        e.preventDefault();
        await joinWithPin(pin);
      }    

        // If the page was opened with ?pin=..., try auto-joining once
  useEffect(() => {
    if (!pinFromQuery) return;
    if (autoTried) return;
    if (loading) return;

    setAutoTried(true);

    // Fire and forget; errors are handled inside joinWithPin
    (async () => {
      await joinWithPin(pinFromQuery);
    })();
  }, [pinFromQuery, autoTried, loading]);


  return (
    <div className="page narrow">
      {/* ---- Local styles ---- */}
      <style>{`
        .join-title {
          font-size: 2.4rem;
          font-weight: 800;
          background: linear-gradient(180deg, #fde047, #facc15, #eab308);
          -webkit-background-clip: text;
          color: transparent;
          margin-bottom: 0.3rem;
        }

        .join-sub {
          color: #cbd5e1;
          font-size: 1rem;
          margin-bottom: 1.2rem;
        }

        .join-card {
          padding: 1.8rem 2rem;
          background: rgba(15, 23, 42, 0.85);
          border-radius: 1rem;
          border: 1px solid rgba(148,163,184,0.2);
          box-shadow: 0 4px 16px rgba(0,0,0,0.35);
        }

        .join-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 0.6rem;
          background: #0f172a;
          border: 1px solid #1e293b;
          color: #f1f5f9;
          font-size: 1rem;
          letter-spacing: 0.05em;
        }

        .join-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
          background: #0f172a;
        }

        .join-label {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1.2rem;
          font-size: 0.95rem;
          color: #e2e8f0;
        }

        .join-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 0.6rem;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #f8fafc;
          border: none;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.15s;
        }
        .join-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(37,99,235,0.35);
        }
        .join-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .join-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>

      <h1 className="join-title">Join Live Game</h1>
      <p className="join-sub">Ask your teacher for the 6-digit PIN and enter it below.</p>

      <form onSubmit={handleSubmit} className="join-card">
        <label className="join-label">
          Game PIN
          <input
            type="text"
            className="join-input"
            inputMode="numeric"
            autoFocus
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="742190"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </label>

        <button type="submit" className="join-btn" disabled={loading}>
          {loading ? "Joining…" : "Join game"}
        </button>
      </form>
    </div>
  );
}
