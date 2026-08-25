import React, { useState, useEffect } from 'react';
import {
  EMPTY_ANSWERS,
  getDraftKey,
  sanitizeRichTextHtml
} from '../utils/answerContent';
import { AnswersContext } from './answersContext.js';

/**
 * answers shape:
 * {
 *   1: [string, string, string, string, string],
 *   2: string,
 *   3: [string, string, string],
 *   4: [string, string]
 * }
 */
export function AnswersProvider({ children, mockId }) {
  const [answers, setAnswers] = useState(() => {
    const defaults = EMPTY_ANSWERS;
    try {
      const json = localStorage.getItem(getDraftKey(mockId));
      if (!json) return defaults;
      const parsed = JSON.parse(json);
      return {
        1: Array.isArray(parsed[1]) ? parsed[1].map((item) => sanitizeRichTextHtml(item)) : defaults[1],
        2: typeof parsed[2] === 'string' ? sanitizeRichTextHtml(parsed[2]) : defaults[2],
        3: Array.isArray(parsed[3]) ? parsed[3].map((item) => sanitizeRichTextHtml(item)) : defaults[3],
        4: Array.isArray(parsed[4]) ? parsed[4].map((item) => sanitizeRichTextHtml(item)) : defaults[4]
      };
    } catch (err) {
      console.warn('Could not load draft, using defaults:', err);
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(getDraftKey(mockId), JSON.stringify(answers));
    } catch (err) {
      console.warn('Could not save draft:', err);
    }
  }, [answers, mockId]);

  const updateAnswer = (part, idx, html) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      const p = Number(part);
      const safeHtml = sanitizeRichTextHtml(html);
      if (p === 1) {
        const arr = Array.isArray(copy[1]) ? [...copy[1]] : Array(5).fill('');
        arr[idx] = safeHtml;
        copy[1] = arr;
      } else if (p === 2) {
        copy[2] = safeHtml;
      } else if (p === 3) {
        const arr = Array.isArray(copy[3]) ? [...copy[3]] : Array(3).fill('');
        arr[idx] = safeHtml;
        copy[3] = arr;
      } else if (p === 4) {
        const arr = Array.isArray(copy[4]) ? [...copy[4]] : Array(2).fill('');
        arr[idx] = safeHtml;
        copy[4] = arr;
      }
      return copy;
    });
  };

  return (
    <AnswersContext.Provider value={{ answers, updateAnswer, setAnswers }}>
      {children}
    </AnswersContext.Provider>
  );
}
