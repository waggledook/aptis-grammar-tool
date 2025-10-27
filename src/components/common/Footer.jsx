// src/components/common/Footer.jsx
import React from "react";

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
        {" "}· All rights reserved
      </p>

      <style>{`
  .app-footer {
    margin-top: 2rem;
    padding: 1.2rem 1rem;
    text-align: center;
    color: #a9b7d1;
    font-size: 0.85rem;
    border-top: 1px solid #2c416f;
    background: transparent; /* ← no box background */
  }
  .app-footer p {
    margin: 0;
  }
  .app-footer a {
    color: #6ea8ff;
    text-decoration: none;
  }
  .app-footer a:hover {
    text-decoration: underline;
  }
`}</style>
    </footer>
  );
}
