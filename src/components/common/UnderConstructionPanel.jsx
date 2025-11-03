import React from "react";

export default function UnderConstructionPanel({
  title = "Under Construction",
  message = "This section is still being built. New activities will be added soon!",
  image = "/images/ui/under-construction.png",
}) {
  return (
    <div className="under-construction-panel fade-in">
      <img
        src={image}
        alt="Under construction"
        className="uc-illustration"
        draggable="false"
      />
      <div className="uc-text">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>

      <style>{`
        .under-construction-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: left;
          margin: 1.5rem auto 2rem;
          color: #cfd9f3;
          max-width: 680px;
          background: transparent;
          flex-wrap: wrap;
        }

        .uc-illustration {
          width: 120px;
          height: auto;
          opacity: 0.9;
          pointer-events: none;
          user-select: none;
          transition: transform 0.25s ease;
        }

        .under-construction-panel:hover .uc-illustration {
          transform: scale(1.03);
        }

        .uc-text {
          flex: 1;
          min-width: 220px;
        }

        .uc-text h3 {
          color: #ffcf40;
          margin: 0 0 0.3rem;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .uc-text p {
          margin: 0;
          font-size: 0.9rem;
          color: #a9b7d1;
          line-height: 1.4;
        }

        @media (max-width: 600px) {
          .under-construction-panel {
            flex-direction: column;
            text-align: center;
          }
          .uc-illustration {
            width: 140px;
            margin-bottom: 0.5rem;
          }
          .uc-text {
            min-width: unset;
          }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fade-in 0.4s ease;
        }
      `}</style>
    </div>
  );
}
