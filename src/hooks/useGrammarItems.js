// src/hooks/useGrammarItems.js
import { useState, useEffect } from 'react';
import { fetchItems } from '../api/grammar';

export default function useGrammarItems({ levels = [], tags = [], count = 5 }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchItems({ levels, tags, count })
      .then(data => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error(err);
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [levels.join(','), tags.join(','), count]);

  return { items, loading, error };
}
