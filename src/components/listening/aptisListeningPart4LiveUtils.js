export function hasMultipleChoice(value) {
  return ["A", "B", "C"].includes(value);
}

export function multipleChoiceLabel(question, value) {
  const option = question?.options?.find((item) => item.value === value);
  return option ? `${option.value}. ${option.text}` : "No answer saved";
}

export function scoreMultipleChoiceAnswers(task, records = {}, useInitial = false) {
  return task.questions.filter((question) => {
    const record = records[question.key];
    const value = useInitial
      ? record?.initialAnswered === false ? undefined : record?.initialValue ?? record?.value
      : record?.value;
    return value === question.answer;
  }).length;
}
