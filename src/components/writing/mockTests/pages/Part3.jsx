import React, { useContext } from 'react';
import { AnswersContext } from '../context/answersContext.js';
import { useWritingMock } from '../context/MockContext';
import RichTextAnswerEditor from '../components/RichTextAnswerEditor';
import styles from './Part3.module.css';

export default function Part3() {
  const { answers, updateAnswer } = useContext(AnswersContext);
  const mock = useWritingMock();
  const questions = mock.part3.questions;

  return (
    <div className={styles.partContainer}>
      <h2 className={styles.heading}>Writing</h2>
      <h3 className={styles.heading}>Question 3 of 4</h3>
      <p className={styles.prompt}>{mock.part3.prompt}</p>

      {questions.map((q, i) => {
        return (
          <div key={i} className={styles.questionBlock}>
            <p className={styles.label}>
              <strong>{q.speaker}:</strong>
            </p>
            <p className={styles.text}>{q.text}</p>
            <RichTextAnswerEditor
              value={answers[3][i] || ''}
              maxWords={60}
              showBookmark
              onChange={(html) => updateAnswer(3, i, html)}
            />
          </div>
        );
      })}
    </div>
  );
}
