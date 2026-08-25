export const FEEDBACK_PARTS = [
  ['part1', 'Part One'],
  ['part2', 'Part Two'],
  ['part3', 'Part Three'],
  ['part4', 'Part Four']
];

export function formatFeedbackLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getFeedbackPayload(entry) {
  return entry?.feedback || entry || null;
}

export function hasGeneratedFeedback(feedback = {}) {
  return Object.values(feedback).some(Boolean);
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isSameText(a, b) {
  return cleanText(a).toLowerCase() === cleanText(b).toLowerCase();
}

function compactStatus(value) {
  return cleanText(value).replace(/_/g, ' ');
}

function pickText(...values) {
  return values.map(cleanText).find(Boolean) || '';
}

function toList(value) {
  return Array.isArray(value) ? value.map(cleanText).filter(Boolean) : [];
}

function isPreferenceOnlyCorrection(item) {
  const text = cleanText(`${item.category} ${item.explanation}`).toLowerCase();
  const preferenceSignals = [
    'simpler',
    'shorter',
    'more natural',
    'sounds better',
    'smoother',
    'more concise',
    'could also say',
    'possible alternative'
  ];
  const realProblemSignals = [
    'incorrect',
    'wrong',
    'unclear',
    'awkward',
    'unnatural',
    'missing',
    'spelling',
    'does not fit',
    'affects clarity',
    'affects meaning',
    'register',
    'word order'
  ];

  return (
    preferenceSignals.some((signal) => text.includes(signal)) &&
    !realProblemSignals.some((signal) => text.includes(signal))
  );
}

function compactMistakes(items = [], limit = 6) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      category: compactStatus(item?.category),
      original: cleanText(item?.original),
      correction: cleanText(item?.correction || item?.suggestion),
      explanation: cleanText(item?.explanation)
    }))
    .filter((item) => item.original && item.correction && !isSameText(item.original, item.correction))
    .filter((item) => !isPreferenceOnlyCorrection(item))
    .filter((item) => {
      const key = `${item.original}:::${item.correction}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function usefulExamples(items = [], limit = 3) {
  return compactMistakes(items, limit);
}

function answerLabel(index) {
  return `Answer ${index + 1}`;
}

function compactPart1Feedback(payload) {
  const answers = Array.isArray(payload?.answers) ? payload.answers : [];
  const optionalShorterAnswers = answers
    .map((item, index) => ({
      index,
      question: cleanText(item?.question),
      answer: cleanText(item?.answer),
      suggestedAnswer: cleanText(item?.suggestedAnswer),
      comment: pickText(item?.learningFeedback, item?.communication?.comment, item?.length?.comment),
      status: compactStatus(item?.length?.status),
      wordCount: Number(item?.wordCount || 0)
    }))
    .filter((item) =>
      item.answer &&
      item.suggestedAnswer &&
      !isSameText(item.answer, item.suggestedAnswer) &&
      (item.wordCount > 5 || item.status.includes('long'))
    )
    .slice(0, 3);

  return {
    title: 'Part One',
    summary: pickText(payload?.overall?.summary),
    notes: [
      { label: 'Communication', text: compactStatus(payload?.overall?.communication) },
      { label: 'Length control', text: compactStatus(payload?.overall?.lengthControl) }
    ].filter((item) => item.text),
    priorities: toList(payload?.overall?.priorityAdvice),
    sections: optionalShorterAnswers.length
      ? [
          {
            title: 'Optional shorter answers',
            note: 'These are not mistakes. Part 1 answers can simply be shorter when they go over 5 words.',
            suggestions: optionalShorterAnswers.map((item) => ({
              category: item.question || answerLabel(item.index),
              original: item.answer,
              correction: item.suggestedAnswer,
              explanation: item.comment
            }))
          }
        ]
      : [],
    teacherNote: pickText(payload?.teacherComment)
  };
}

function compactPart23Feedback(payload) {
  const answers = Array.isArray(payload?.answers) ? payload.answers : [];
  return {
    title: payload?.part === 'part3' ? 'Part Three' : 'Part Two',
    summary: pickText(payload?.overall?.summary),
    notes: [
      { label: 'Task fulfilment', text: compactStatus(payload?.overall?.taskFulfilment) },
      { label: 'Language control', text: compactStatus(payload?.overall?.languageControl) },
      { label: 'Word count', text: payload?.overall?.wordCountComment }
    ].filter((item) => item.text),
    priorities: toList(payload?.priorityAdvice),
    sections: answers.map((answer, index) => ({
      title: payload?.part === 'part3' ? answerLabel(index) : 'Response',
      question: cleanText(answer?.prompt),
      studentAnswer: cleanText(answer?.answer || answer?.text || answer?.studentAnswer),
      notes: [
        { label: 'Task', text: pickText(answer?.taskFulfilment) },
        { label: 'Grammar', text: pickText(answer?.grammar) },
        { label: 'Vocabulary', text: pickText(answer?.vocabulary) },
        { label: 'Spelling and punctuation', text: pickText(answer?.punctuationSpelling) },
        { label: 'Cohesion', text: pickText(answer?.cohesion) }
      ].filter((item) => item.text),
      mistakes: compactMistakes(answer?.languageErrors || answer?.mistakes, 5),
      improvedVersion: cleanText(answer?.improvedVersion)
    })),
    teacherNote: pickText(payload?.teacherComment)
  };
}

function compactPart4Feedback(payload) {
  const emailSections = [
    ['Informal email', payload?.informalEmail, 5],
    ['Formal email', payload?.formalEmail, 7]
  ].filter(([, data]) => data);

  return {
    title: 'Part Four',
    level: pickText(payload?.estimatedLevel?.label),
    summary: pickText(payload?.overall?.summary),
    strengths: toList(payload?.overall?.mainStrengths).slice(0, 4),
    priorities: toList(payload?.overall?.mainPriorities).slice(0, 5),
    notes: [
      { label: 'Register contrast', text: pickText(payload?.registerContrast?.feedback) },
      { label: 'Content specificity', text: pickText(payload?.contentSpecificity?.feedback) }
    ].filter((item) => item.text),
    sections: emailSections.map(([title, data, mistakeLimit]) => ({
      title,
      notes: [
        { label: 'Word count', text: pickText(data?.wordCountFeedback) },
        { label: 'Task', text: pickText(data?.taskFulfilment?.feedback) },
        { label: 'Register', text: pickText(data?.register?.feedback) },
        { label: 'Grammar', text: pickText(data?.grammar?.feedback) },
        { label: 'Vocabulary', text: pickText(data?.vocabulary?.feedback) },
        { label: 'Cohesion', text: pickText(data?.cohesion?.feedback) }
      ].filter((item) => item.text),
      bullets: toList(data?.taskFulfilment?.missingOrWeakContent).slice(0, 4),
      mistakes: [
        ...compactMistakes(data?.languageErrors, mistakeLimit),
        ...usefulExamples(data?.register?.examples, 2)
      ].slice(0, mistakeLimit),
      improvedVersion: cleanText(data?.improvedVersion),
      teacherNote: cleanText(data?.teacherNote)
    })),
    teacherNote: pickText(payload?.estimatedLevel?.note)
  };
}

export function buildFeedbackReport(partKey, entry) {
  const payload = getFeedbackPayload(entry);
  if (!payload) return null;
  if (partKey === 'part1') return compactPart1Feedback(payload);
  if (partKey === 'part2' || partKey === 'part3') return compactPart23Feedback(payload);
  if (partKey === 'part4') return compactPart4Feedback(payload);
  return null;
}
