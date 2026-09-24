import { FLEXIBLE_WORKING_HOURS_QUESTION } from "./flexibleWorkingHours.js";
import { CAREER_CHANGE_QUESTION, FITNESS_TRACKERS_QUESTION } from "./fitnessTrackersAndCareerChange.js";
import { SHOPPING_HABITS_QUESTION } from "./shoppingHabits.js";
import { A1_FIRST_FIVE_QUESTIONS } from "./a1FirstFive.js";
import { A2_QUESTIONS_SIX_TO_TEN } from "./a2QuestionsSixToTen.js";
import { B1_QUESTIONS_ELEVEN_TO_THIRTEEN } from "./b1QuestionsElevenToThirteen.js";

export const LISTENING_MOCK = {
  id: "listening-mock-1",
  title: "Aptis General Listening Mock 1",
  version: "1",
  durationSeconds: 40 * 60,
  questions: [
    ...A1_FIRST_FIVE_QUESTIONS,
    ...A2_QUESTIONS_SIX_TO_TEN,
    ...B1_QUESTIONS_ELEVEN_TO_THIRTEEN,
    SHOPPING_HABITS_QUESTION,
    FLEXIBLE_WORKING_HOURS_QUESTION,
    FITNESS_TRACKERS_QUESTION,
    CAREER_CHANGE_QUESTION,
  ],
};
