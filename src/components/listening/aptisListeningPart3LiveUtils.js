export const OPINION_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "both", label: "Both" },
];

export function hasOpinion(value) {
  return OPINION_OPTIONS.some((option) => option.value === value);
}

export function opinionLabel(value) {
  return OPINION_OPTIONS.find((option) => option.value === value)?.label || "No answer saved";
}

export function scoreOpinionAnswers(task, records = {}, useInitial = false) {
  return task.statements.filter((statement) => {
    const record = records[statement.key];
    const value = useInitial
      ? record?.initialAnswered === false ? undefined : record?.initialValue ?? record?.value
      : record?.value;
    return value === statement.answer;
  }).length;
}
