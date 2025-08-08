// src/components/ReviewFavourites.jsx
import React, { useEffect, useState } from "react";
import { auth }                             from "../firebase";
import { fetchFavourites }                  from "../firebase";
import { fetchItemsByIds }                  from "../api/grammar";
import GapFillList                          from "./GapFillList";

export default function ReviewFavourites() {
  const [items, setItems]  = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        // 1) grab the array of favourited IDs
        const favIds = await fetchFavourites();
        console.log("Fetched favourite IDs:", favIds);
        if (favIds.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
        // 2) fetch full item objects in that order
        const batch = await fetchItemsByIds(favIds);
        setItems(batch);
      } catch (e) {
        console.error("ReviewFavourites error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  if (loading) return <p>Loading favourites…</p>;
  if (!items.length) return <p>No favourites yet.</p>;

  return (
    <div>
      <h2>Your Favourites</h2>
      <GapFillList items={items} onAnswer={() => {}} />
    </div>
  );
}
