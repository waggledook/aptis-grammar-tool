import React from "react";

export default function UnderConstructionBadge({
  label = "NEW",
  iconHeight = 24,       // controls visual size
}) {
  return (
    <span className="uc-inline">
      <img
        src="/images/ui/under-construction.png"
        alt="Under construction"
        className="uc-icon"
        style={{ height: iconHeight }}
      />
      <span className="uc-label">{label}</span>

      <style>{`
        .uc-inline {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .uc-icon {
          display: block;
          height: ${iconHeight}px;
          width: auto;              /* ✅ keep aspect ratio */
        }

        .uc-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
          color: #ffcf40;           /* your gold colour */
        }
      `}</style>
    </span>
  );
}
