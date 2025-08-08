// src/components/ToastHost.jsx
import React, { useEffect, useState } from 'react';
import { subscribeToast } from '../utils/toast';

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribeToast((t) => {
      setItems(list => [...list, t]);
      const timer = setTimeout(() => {
        setItems(list => list.filter(x => x.id !== t.id));
      }, t.duration);
      // Cleanup per-toast timer when unmounted/duplicated subscribe
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <div className="toast-container">
      {items.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  );
}
