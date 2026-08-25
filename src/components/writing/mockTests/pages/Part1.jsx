// src/pages/Part1.jsx
import React, { useContext } from 'react';
import styles from './Part1.module.css';
import { AnswersContext } from '../context/answersContext.js';
import { useWritingMock } from '../context/MockContext';

export default function Part1() {
  const { answers, updateAnswer } = useContext(AnswersContext);
  const mock = useWritingMock();
  const questions = mock.part1.questions;

  // pull the Part 1 array out of context
  const localAnswers = answers[1];

  const handleChange = (i, e) => {
    // write back into context at key “1”
    updateAnswer(1, i, e.target.value);
  };

  return (
    <div className={styles.partContainer}>
      <h2 className={styles.heading}>Writing</h2>
      <h3 className={styles.heading}>Question 1 of 4</h3>
      <p className={styles.prompt}>{mock.part1.prompt}</p>
      <p className={styles.prompt}>
        <strong>Example</strong> How are you? I’m fine, thanks.
      </p>

      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock}>
          <label className={styles.label}>{q}</label>
          <input
            type="text"
            className={styles.answerInput}
            placeholder="Type your answer here"
            value={localAnswers[i] || ''}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(e) => handleChange(i, e)}
          />
        </div>
      ))}

      {/* Navigation handled by bottom bar, so no Next button here */}
    </div>
  );
}
