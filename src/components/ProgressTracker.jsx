// src/components/ProgressTracker.jsx
import React from 'react';

export default function ProgressTracker({ answered, total }) {
  return (
    <div className="progress-tracker">
      <p>Progress: {answered} / {total}</p>
    </div>
  );
}
