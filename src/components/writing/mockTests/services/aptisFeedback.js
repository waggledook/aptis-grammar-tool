import {
  requestAptisWritingPart1Feedback,
  requestAptisWritingPart23Feedback,
  requestAptisWritingPart4Feedback
} from '../../../../firebase.js';
import { countWords, stripHtmlToText } from '../utils/answerContent';

function plainText(value = '') {
  return stripHtmlToText(value).replace(/\s+/g, ' ').trim();
}

function getPart23WordCountStatus(part, wordCount) {
  if (part === 'part2') {
    if (wordCount < 20) return 'too_short';
    if (wordCount <= 30) return 'target_range';
    if (wordCount <= 45) return 'acceptable_over_range';
    return 'excessive';
  }

  if (wordCount < 30) return 'too_short';
  if (wordCount <= 40) return 'target_range';
  if (wordCount <= 60) return 'acceptable_over_range';
  return 'excessive';
}

function answerPayload(text, part) {
  const wordCount = countWords(text);
  return {
    text,
    wordCount,
    wordCountStatus: getPart23WordCountStatus(part, wordCount)
  };
}

export async function requestPart1Feedback({ mock, submission }) {
  const items = mock.part1.questions.map((question, index) => {
    const answer = plainText(submission.part1[index] || '');
    return {
      question,
      answer,
      studentAnswer: answer,
      wordCount: countWords(answer)
    };
  });

  return requestAptisWritingPart1Feedback(items);
}

export async function requestPart2Feedback({ mock, submission }) {
  const text = plainText(submission.part2);
  return requestAptisWritingPart23Feedback({
    part: 'part2',
    taskId: mock.id,
    title: `${mock.title} - Part 2`,
    prompt: `${mock.part2.prompt} ${mock.part2.question}`,
    answers: [answerPayload(text, 'part2')]
  });
}

export async function requestPart3Feedback({ mock, submission }) {
  return requestAptisWritingPart23Feedback({
    part: 'part3',
    taskId: mock.id,
    title: `${mock.title} - Part 3`,
    prompt: mock.part3.prompt,
    chats: mock.part3.questions.map((question, index) => ({
      name: question.speaker,
      speaker: question.speaker,
      text: question.text,
      question: question.text,
      answerIndex: index
    })),
    answers: mock.part3.questions.map((_, index) =>
      answerPayload(plainText(submission.part3[index] || ''), 'part3')
    )
  });
}

export async function requestPart4Feedback({ mock, submission }) {
  const part4Prompt1 = mock.part4.prompts[0];
  const part4Prompt2 = mock.part4.prompts[1];
  const friendText = plainText(submission.part4[0] || '');
  const formalText = plainText(submission.part4[1] || '');

  return requestAptisWritingPart4Feedback({
    taskId: mock.id,
    title: `${mock.title} - Part 4`,
    sourceTitle: mock.title,
    source: [mock.part4.intro, ...mock.part4.sourceEmail].join('\n\n'),
    friendPrompt: `${part4Prompt1.heading} ${part4Prompt1.instructions}`,
    formalPrompt: `${part4Prompt2.heading} ${part4Prompt2.instructions}`,
    friendEmail: {
      text: friendText,
      wordCount: countWords(friendText)
    },
    formalEmail: {
      text: formalText,
      wordCount: countWords(formalText)
    }
  });
}

export const FEEDBACK_REQUESTS = {
  part1: requestPart1Feedback,
  part2: requestPart2Feedback,
  part3: requestPart3Feedback,
  part4: requestPart4Feedback
};
