import React, { useContext } from 'react';
import { AnswersContext } from '../context/answersContext.js';
import { useWritingMock } from '../context/MockContext';
import RichTextAnswerEditor from '../components/RichTextAnswerEditor';
import styles from './Part2.module.css';

export default function Part2() {
  const { answers, updateAnswer } = useContext(AnswersContext);
  const mock = useWritingMock();

  return (
    <div className={styles.partContainer}>
      <h2 className={styles.heading}>Writing</h2>
      <h3 className={styles.heading}>Question 2 of 4</h3>
      <p className={styles.prompt}>{mock.part2.prompt}</p>

      <div className={styles.questionBlock}>
        <p className={styles.text}>{mock.part2.question}</p>
        <RichTextAnswerEditor
          value={answers[2] || ''}
          maxWords={45}
          onChange={(html) => updateAnswer(2, 0, html)}
        />
      </div>
    </div>
  );
}
