export const OPTION_JURY_GAME_TYPE = "ote-advanced-reading-part4-option-jury";

export const optionJuryTasks = {
  "forecasts-change-future": {
    id: "forecasts-change-future",
    title: "When forecasts change the future",
    paragraphs: [
      "Forecasts are usually treated as windows onto the future. A weather service predicts rain, an economist estimates unemployment, or a navigation app warns of congestion. We then judge the prediction by comparing it with what eventually happened. This seems straightforward, but only when the forecast has no influence on the event itself. A prediction about tomorrow’s temperature will not make the air warmer. A prediction about human behaviour, by contrast, may become part of the situation it describes.",
      "Traffic forecasts provide a simple example. Suppose an app predicts severe congestion on one route and advises thousands of drivers to use another. If enough people follow the advice, the expected traffic jam may never appear. Anyone comparing the forecast with the empty road could conclude that the model was wrong. Yet the road may be empty precisely because the warning was believed. The forecast has not simply described a possible future; it has helped replace it with another one. If every driver receives identical advice, congestion may merely move elsewhere. The result depends not only on the original prediction, but on how users react to it.",
      "The same difficulty appears in public warnings. An authority predicts that a river may flood and residents move valuable possessions, close businesses or leave the area. If barriers hold and damage remains limited, critics may call the warning excessive. A successful warning can therefore resemble a failed forecast: the action it produces removes some of the evidence that the danger was real. This does not mean every false alarm should be praised. Predictions still need a sound basis, and repeated dramatic warnings can reduce public trust. We need to distinguish between an event that was never likely and one that failed to occur because people took effective precautions.",
      "Other predictions shape events less directly. University rankings influence applications, donations and staff recruitment. Crime maps can affect where police are sent, which may lead to more offences being recorded in areas already labelled as risky. Credit scores determine who receives affordable loans and who must accept worse conditions. In each case, the measurement distributes attention or opportunity. It may then help produce the pattern that later appears to confirm it. This does not make rankings, maps or scores useless, but they cannot be treated as passive descriptions. Publishing them changes the environment in which their accuracy will later be assessed.",
      "Predictions can also become self-fulfilling. If enough customers hear that a bank is weak, they may withdraw their savings, creating the crisis they feared. A manager who is told that an employee is unlikely to succeed may offer that person fewer demanding tasks and less useful feedback. Poor performance then seems to prove the original assessment. The prediction did not invent every weakness, but it changed the environment in which the weakness was tested. The more authority a forecast carries, the greater this effect may be.",
      "This is one reason social forecasting differs from prediction in a controlled experiment. The objects being studied can hear the result, interpret it and change their conduct. A model built from past behaviour may become less accurate once it is widely used, because people adapt to the system or try to benefit from it. This is not necessarily evidence that modelling is pointless. It means that the public use of a prediction becomes one of the forces the next model must attempt to understand.",
      "Forecasts should therefore be judged by more than whether the announced event occurred. We should ask what evidence supported them, how uncertainty was communicated, what behaviour they encouraged and who carried the costs of that behaviour. Accuracy remains essential: a forecast that is consistently careless is not rescued by good intentions. But in social life, prediction and intervention are often inseparable. The most responsible question is not only whether a forecast described the future correctly, but what kind of future it helped to create.",
    ],
    questions: [
      {
        id: "q1",
        evidenceParagraphIndex: 0,
        prompt: "What distinction does the writer make in the first paragraph?",
        options: [
          "Forecasts are most useful when they influence people’s decisions.",
          "Some forecasts become part of the situation they describe.",
          "Human behaviour is generally harder to predict than natural events.",
        ],
        answer: 1,
        optionVerdicts: ["flawed", "strong", "flawed"],
        optionLabels: ["Related, but changes the meaning", "Correct", "Too broad"],
        optionFeedback: [
          "The paragraph says forecasts can influence decisions and behaviour. It does not say this makes them most useful. The option turns a complication into a positive judgement.",
          "The writer’s central distinction is between forecasts that merely describe an event and forecasts that enter the situation and influence what happens.",
          "Weather and human behaviour are contrasted, but the writer does not claim that human behaviour is always harder to predict. The point concerns influence, not general reliability.",
        ],
        explanation: "The writer’s central distinction is between forecasts that merely describe an event and forecasts that enter the situation and influence what happens.",
      },
      {
        id: "q2",
        evidenceParagraphIndex: 1,
        prompt: "Why does the writer use the traffic-app example?",
        options: [
          "To show that forecasts may prevent the outcome they predict.",
          "To show identical advice can transfer congestion somewhere else.",
          "To explain why drivers distrust routes predicted to be busy.",
        ],
        answer: 0,
        optionVerdicts: ["strong", "flawed", "no_match"],
        optionLabels: ["Correct", "True detail, but not the answer", "Unsupported"],
        optionFeedback: [
          "The predicted traffic jam may disappear because drivers respond to the forecast. The apparently inaccurate prediction may therefore have helped prevent its own outcome.",
          "The paragraph does mention congestion moving elsewhere when everyone receives the same advice. However, this is a secondary qualification, not the central reason for introducing the example.",
          "Drivers respond to the warning, but the writer does not say that they distrust the predicted route or the app.",
        ],
        explanation: "The predicted traffic jam may disappear because drivers respond to the forecast. The apparently inaccurate prediction may therefore have helped prevent its own outcome.",
      },
      {
        id: "q3",
        evidenceParagraphIndex: 2,
        prompt: "What does “a successful warning can therefore resemble a failed forecast” mean?",
        options: [
          "Preventive action may remove evidence that the danger was likely.",
          "A warning may appear successful despite having little supporting evidence.",
          "Public trust may decline even when a warning proves accurate.",
        ],
        answer: 0,
        optionVerdicts: ["strong", "no_match", "flawed"],
        optionLabels: ["Correct", "Reverses the writer’s point", "Related, but changes the meaning"],
        optionFeedback: [
          "The warning leads people to take precautions. Those precautions reduce the damage and remove some of the visible evidence that the danger existed.",
          "The writer explicitly says that warnings still require a sound basis. A lack of damage does not automatically prove that a weak prediction was successful.",
          "The paragraph says repeated dramatic warnings may reduce trust. That is a separate warning about false alarms, not the meaning of the quoted sentence.",
        ],
        explanation: "The warning leads people to take precautions. Those precautions reduce the damage and remove some of the visible evidence that the danger existed.",
      },
      {
        id: "q4",
        evidenceParagraphIndex: 5,
        prompt: "Why does the writer compare social forecasting with a controlled experiment?",
        options: [
          "To show that social predictions must account for people’s responses.",
          "To argue that experiments produce more dependable predictions than models.",
          "To explain why past behaviour is unsuitable for future forecasting.",
        ],
        answer: 0,
        optionVerdicts: ["strong", "flawed", "no_match"],
        optionLabels: ["Correct", "Related, but changes the meaning", "Too absolute"],
        optionFeedback: [
          "Unlike passive objects in an experiment, people can hear a prediction and alter their behaviour because of it. Their response must then become part of future forecasting.",
          "The writer does not claim that controlled experiments are generally more dependable than predictive models. The difference concerns whether the subject can react to the result.",
          "Past behaviour may become a less reliable guide once people adapt, but the writer does not say it becomes completely unsuitable.",
        ],
        explanation: "Unlike passive objects in an experiment, people can hear a prediction and alter their behaviour because of it. Their response must then become part of future forecasting.",
      },
      {
        id: "q5",
        evidenceParagraphIndex: 6,
        wholeTextQuestion: true,
        prompt: "What is the writer’s overall view of forecasts?",
        options: [
          "They should be judged by both their accuracy and consequences.",
          "They are most valuable when they cause people to change behaviour.",
          "They should remain private whenever publication could affect the outcome.",
        ],
        answer: 0,
        optionVerdicts: ["strong", "flawed", "no_match"],
        optionLabels: ["Correct", "Too absolute", "Unsupported"],
        optionFeedback: [
          "The writer retains accuracy as an essential standard but adds the behaviour produced by the forecast, the communication of uncertainty, and the costs and consequences of people’s responses.",
          "Forecasts that change behaviour are not necessarily better. They may prevent harm, create harm or produce unfair consequences.",
          "The text warns that publication can influence outcomes, but it does not argue that forecasts should generally remain private.",
        ],
        explanation: "The writer retains accuracy as an essential standard but adds the behaviour produced by the forecast, the communication of uncertainty, and the costs and consequences of people’s responses.",
      },
    ],
  },
};

export const DEFAULT_OPTION_JURY_TASK_ID = "forecasts-change-future";
export const OPTION_LETTERS = ["A", "B", "C"];
export const OPTION_JURY_TIMINGS = {
  skim: 240,
  investigation: 90,
  finalVote: 30,
};
export const VERDICT_OPTIONS = [
  { id: "strong", label: "Strong match" },
  { id: "flawed", label: "Possible, but flawed" },
  { id: "no_match", label: "Does not match" },
];

export function getOptionLetter(index) {
  return OPTION_LETTERS[index] || "";
}

export function getOptionIndex(letter) {
  return OPTION_LETTERS.indexOf(letter);
}

export function getAssignedOptionForQuestion(teamLetter, questionIndex) {
  const teamIndex = getOptionIndex(teamLetter);
  if (teamIndex < 0) return "";
  return OPTION_LETTERS[(teamIndex + questionIndex) % OPTION_LETTERS.length];
}
