// src/components/common/Footer.jsx
import React from "react";
import { openCookieBanner } from "../CookieBanner";

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>
        © {new Date().getFullYear()}{" "}
        <a
          href="https://idiomasseif.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Seif English Academy
        </a>
        {" "}· All rights reserved ·{" "}
        <a href="/privacy">Privacy Policy</a>
        {" "}·{" "}
        <button type="button" className="footer-link-btn" onClick={openCookieBanner}>
          Cookie Settings
        </button>
      </p>

      <style>{`
        .app-footer {
          margin-top: 2rem;
          padding: 1.2rem 1rem;
          text-align: center;
          color: #a9b7d1;
          font-size: 0.85rem;
          border-top: 1px solid #2c416f;
          background: transparent;
        }
        .app-footer p {
          margin: 0;
        }
        .app-footer a {
          color: #6ea8ff;
          text-decoration: none;
        }
        .footer-link-btn {
          color: #6ea8ff;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
        }
        .app-footer a:hover {
          text-decoration: underline;
        }
        .footer-link-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </footer>
  );
}
