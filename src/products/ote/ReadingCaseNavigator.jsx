import React from "react";

export default function ReadingCaseNavigator({
  items,
  currentIndex,
  onSelect,
  isComplete = () => false,
  label = "Choose a case",
}) {
  return (
    <nav className="ote-reading-case-nav" aria-label="Case navigation">
      <div className="ote-reading-case-nav-heading">
        <strong>{label}</strong>
        <span>You can move between cases without losing your work.</span>
      </div>
      <div className="ote-reading-case-nav-list">
        {items.map((item, index) => {
          const current = index === currentIndex;
          const complete = isComplete(item, index);

          return (
            <button
              className={`${current ? "is-current" : ""} ${complete ? "is-complete" : ""}`}
              key={item.id}
              type="button"
              aria-current={current ? "step" : undefined}
              aria-label={`Case ${index + 1}: ${item.title}${complete ? ", completed" : ""}`}
              onClick={() => onSelect(index)}
            >
              <span>{index + 1}</span>
              <small>{item.title}</small>
              <i aria-hidden="true">{complete ? "✓" : ""}</i>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
