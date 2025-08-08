// src/hooks/useTags.js
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetches all distinct tags from the grammarItems collection.
 */
export default function useTags() {
  const [tags, setTags]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const snapshot = await getDocs(collection(db, 'grammarItems'));
        if (cancelled) return;

        // Extract & flatten all tags
        const allTags = snapshot.docs
          .map(doc => doc.data().tags || [])
          .flat();

        // De‑duplicate while preserving insertion order
        const unique = Array.from(new Set(allTags));

        setTags(unique);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { tags, loading, error };
}
