// src/components/GapFillList.jsx
import React from 'react';
import GapFillItem from './GapFillItem';

export default function GapFillList({ items, onAnswer, runKey }) {
  if (!items) return null;
  if (items.length === 0) return <p>No items to display. Click “Generate” above.</p>;

  return (
    <div>
      {items.map(item => (
        <GapFillItem
          key={`${runKey}-${item.id}`}   // remounts items each run
          item={item}
          onAnswer={onAnswer}
        />
      ))}
    </div>
  );
}
