import React, { useContext } from 'react';
import { AnswersContext } from '../context/answersContext.js';
import { useWritingMock } from '../context/MockContext';
import RichTextAnswerEditor from '../components/RichTextAnswerEditor';
import styles from './Part4.module.css';

export default function Part4() {
  const { answers, updateAnswer } = useContext(AnswersContext);
  const mock = useWritingMock();
  const { part4 } = mock;

  return (
    <div className={styles.partContainer}>
      <h2 className={styles.heading}>Writing</h2>
      <h3 className={styles.heading}>Question 4 of 4</h3>

      <div className={styles.emailIntro}>
        <p className={styles.prompt}>{part4.intro}</p>
        <div className={styles.emailBlock}>
          {part4.sourceEmail.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      {part4.prompts.map((p, i) => {
        return (
          <section key={i} className={styles.questionSection}>
            <h3 className={styles.subHeading}>{p.heading}</h3>
            <p className={styles.subPrompt}>{p.instructions}</p>
            <RichTextAnswerEditor
              value={answers[4][i] || ''}
              maxWords={p.maxWords}
              minHeight={120}
              onChange={(html) => updateAnswer(4, i, html)}
            />
          </section>
        );
      })}
    </div>
  );
}
