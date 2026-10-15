import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { rtdb } from "../../../firebase.js";

export default function useCollocationRoundTimer(deadline, active) {
  const [serverOffset, setServerOffset] = useState(0);
  const [now, setNow] = useState(Date.now);

  useEffect(() => onValue(ref(rtdb, ".info/serverTimeOffset"), (snapshot) => {
    setServerOffset(Number(snapshot.val()) || 0);
  }), []);

  useEffect(() => {
    if (!active || !deadline) return undefined;
    setNow(Date.now());
    const timerId = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timerId);
  }, [active, deadline]);

  return active && deadline
    ? Math.max(0, Math.ceil((deadline - now - serverOffset) / 1000))
    : null;
}
