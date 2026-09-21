export function hasListeningAnswer(value) {
  return typeof value === "string" && value.length > 0;
}

export function answerText(task, value) {
  const choice = task.choices.find((item) => item.key === value);
  return choice ? `${choice.key.toUpperCase()}. ${choice.text}` : "No answer saved";
}

export function scoreAnswers(task, records = {}, useInitial = false) {
  return task.prompts.filter((prompt) => {
    const record = records[prompt.key];
    const value = useInitial
      ? record?.initialAnswered === false ? undefined : record?.initialValue ?? record?.value
      : record?.value;
    return value === prompt.answer;
  }).length;
}
