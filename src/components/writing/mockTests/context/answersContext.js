import { createContext } from "react";
import { EMPTY_ANSWERS } from "../utils/answerContent.js";

export const AnswersContext = createContext({
  answers: EMPTY_ANSWERS,
  updateAnswer: () => {},
  setAnswers: () => {},
});
