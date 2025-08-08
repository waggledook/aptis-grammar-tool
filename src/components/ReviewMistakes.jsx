// src/components/ReviewMistakes.jsx
import React, { useEffect, useState } from 'react';
import { fetchMistakes } from '../firebase';
import { fetchItemsByIds } from '../api/grammar';
import GapFillList from './GapFillList';

export default function ReviewMistakes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1) get the last 15 mistake item‐IDs
      const ids = await fetchMistakes();
      if (ids.length) {
        // 2) look up their full data (in order)
        const batch = await fetchItemsByIds(ids);
        setItems(batch);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Loading recent mistakes…</p>;
  if (!items.length) return <p>You haven’t made any mistakes yet—great job!</p>;

  return (
    <div>
      <h2>Your 15 Most Recent Mistakes</h2>
      <GapFillList items={items} onAnswer={() => {}} />
    </div>
  );
}
