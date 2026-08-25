import React, { useState, useEffect } from 'react';
import {
  EXAM_DURATION_SECONDS,
  getRemainingSeconds,
  getStoredEndTime,
  resetExamTimer
} from '../utils/timer';
import { TimerContext } from './timerContext.js';

export function TimerProvider({ children, mockId }) {
  const [endTime, setEndTime] = useState(() => getStoredEndTime(mockId));
  const [timeLeft, setTimeLeft] = useState(() => {
    const storedEndTime = getStoredEndTime(mockId);
    return storedEndTime ? getRemainingSeconds(storedEndTime) : EXAM_DURATION_SECONDS;
  });

  const startTimer = () => {
    const nextEndTime = endTime || resetExamTimer(mockId);
    setEndTime(nextEndTime);
    setTimeLeft(getRemainingSeconds(nextEndTime));
  };

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(EXAM_DURATION_SECONDS);
      return undefined;
    }

    let intervalId;
    const tick = () => {
      const secs = getRemainingSeconds(endTime);
      setTimeLeft(secs);
      if (secs <= 0 && intervalId) clearInterval(intervalId);
    };

    tick();
    intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [endTime]);

  return (
    <TimerContext.Provider value={{ timeLeft, timerRunning: !!endTime, startTimer }}>
      {children}
    </TimerContext.Provider>
  );
}
