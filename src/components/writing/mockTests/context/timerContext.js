import { createContext } from "react";
import { EXAM_DURATION_SECONDS } from "../utils/timer.js";

export const TimerContext = createContext({
  timeLeft: EXAM_DURATION_SECONDS,
  timerRunning: false,
  startTimer: () => {},
});
