// src/components/FilterPanel.jsx
import React from 'react';

export default function FilterPanel({
  levels,            // array of selected levels
  onLevelsChange,    // setter for levels
  tag,               // string: currently selected tag
  onTagChange,       // setter for tag
  allTags,           // array of strings
  tagsLocked = false,
  lockedTagsMessage = "Full tag filtering is available with full access."
}) {
  const allLevels = ['A2','B1','B2','C1'];

  const toggleLevel = lvl => {
    onLevelsChange(
      levels.includes(lvl)
        ? levels.filter(l => l !== lvl)
        : [...levels, lvl]
    );
  };

  return (
    <div className="filter-panel">
      {/* Levels as chips */}
<fieldset className="levels-fieldset">
  <legend>Levels:</legend>
  <div className="level-row">
    {allLevels.map(lvl => {
      const selected = levels.includes(lvl);
      return (
        <label
          key={lvl}
          className={`level-chip cefr-${lvl} ${selected ? 'selected' : ''}`}
        >
          <input
            type="checkbox"
            value={lvl}
            checked={selected}
            onChange={() => toggleLevel(lvl)}
          />
          <span className="dot" aria-hidden />
          <span className="txt">{lvl}</span>
        </label>
      );
    })}
  </div>
</fieldset>

      {/* Tags as a dropdown */}
      <label className="tag-filter-field">
        <span>Tag:</span>
        <span className="select-wrap">
          <select
            className="select"
            value={tagsLocked ? "" : tag}
            onChange={e => onTagChange(tagsLocked ? "" : e.target.value)}
          >
            <option value="">All tags</option>
            {allTags.map(t => (
              <option key={t} value={t} disabled={tagsLocked}>{t}</option>
            ))}
          </select>
        </span>
        {tagsLocked && (
          <span className="tag-access-note">{lockedTagsMessage}</span>
        )}
      </label>
    </div>
  );
}
