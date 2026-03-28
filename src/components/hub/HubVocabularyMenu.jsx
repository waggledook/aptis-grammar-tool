import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";

export default function HubVocabularyMenu() {
  const navigate = useNavigate();

  return (
    <div className="menu-wrapper hub-menu-wrapper">
      <Seo
        title="Vocabulary Activities | Seif Hub"
        description="Choose a vocabulary activity inside the Seif English Hub."
      />

      <header className="main-header" style={{ textAlign: "center", marginBottom: "0rem" }}>
        <img
          src="/images/seif-english-hub-logo.png"
          alt="Seif English Hub Logo"
          className="menu-logo hub-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">Choose a vocabulary activity to begin.</p>

      <div className="whats-new-banner hub-status-banner">
        <div className="whats-new-copy">
          <span className="whats-new-label">Vocabulary area</span>
          <p>
            Build vocabulary through topic-based practice and keep your work inside the
            Seif Hub learning space.
          </p>
        </div>

        <button className="whats-new-btn" onClick={() => navigate(getSitePath("/"))}>
          Back to hub
        </button>
      </div>

      <div className="menu-grid">
        <button className="menu-card" onClick={() => navigate(getSitePath("/vocabulary/topics"))}>
          <h3>Topic Trainer</h3>
          <p>
            Practise useful vocabulary by topic and review words in context through
            guided study sets.
          </p>
        </button>
      </div>

      <style>{`
        .hub-menu-wrapper {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-menu-wrapper .main-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
          line-height: 0;
          text-align: center;
        }

        .hub-menu-wrapper .menu-logo {
          display: block;
          width: clamp(220px, 26vw, 380px);
          height: auto;
          filter:
            drop-shadow(0 0 10px rgba(255,255,255,0.5))
            drop-shadow(0 0 18px rgba(255,165,0,0.35));
          animation: hubLogoFade 1.2s ease both;
          transition: filter .3s ease;
          margin: 0;
        }

        .hub-menu-wrapper .menu-logo:hover {
          filter:
            drop-shadow(0 0 12px rgba(255,255,255,0.8))
            drop-shadow(0 0 25px rgba(255,165,0,0.5));
        }

        @keyframes hubLogoFade {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .hub-menu-wrapper .menu-sub {
          opacity: .85;
          margin-top: .2rem;
          margin-bottom: .6rem;
          text-align: center;
        }

        .hub-menu-wrapper .whats-new-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin: 0 0 1rem;
          padding: .9rem 1rem;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            rgba(255, 191, 73, 0.10),
            rgba(255, 191, 73, 0.04)
          );
          border: 1px solid rgba(255, 191, 73, 0.35);
        }

        .hub-menu-wrapper .whats-new-copy {
          min-width: 0;
        }

        .hub-menu-wrapper .whats-new-label {
          display: inline-block;
          margin-bottom: .35rem;
          padding: .2rem .55rem;
          border-radius: 999px;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .02em;
          color: #ffcf70;
          background: rgba(255, 191, 73, 0.12);
          border: 1px solid rgba(255, 191, 73, 0.28);
        }

        .hub-menu-wrapper .whats-new-copy p {
          margin: 0;
          color: #e6f0ff;
          line-height: 1.4;
        }

        .hub-menu-wrapper .whats-new-btn {
          flex-shrink: 0;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #13213b;
          border: none;
          border-radius: 12px;
          padding: .7rem 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .08s ease;
        }

        .hub-menu-wrapper .whats-new-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0,0,0,.18);
        }

        .hub-menu-wrapper .menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .hub-menu-wrapper .menu-card {
          text-align: left;
          background: #1a2847;
          border: 2px solid #35508e;
          border-radius: 22px;
          padding: 1.45rem 1.5rem;
          color: #eef4ff;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .hub-menu-wrapper .menu-card:hover {
          transform: translateY(-2px);
          border-color: #4a6bc0;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
        }

        .hub-menu-wrapper .menu-card h3 {
          margin-bottom: .55rem;
          color: #eef4ff;
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .hub-menu-wrapper .menu-card p {
          margin: 0;
          color: rgba(238, 244, 255, 0.88);
          font-size: 1rem;
          line-height: 1.45;
        }

        @media (max-width: 720px) {
          .hub-menu-wrapper .whats-new-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-menu-wrapper .whats-new-btn {
            width: 100%;
          }

          .hub-menu-wrapper .menu-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
