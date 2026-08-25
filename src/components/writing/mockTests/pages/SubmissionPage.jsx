import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadSubmission } from '../services/submissions';
import { FEEDBACK_REQUESTS } from '../services/aptisFeedback';
import {
  downloadSubmissionDocx,
  getNormalizedSubmission
} from '../utils/submissionDocument';
import {
  buildFeedbackReport,
  FEEDBACK_PARTS,
  hasGeneratedFeedback
} from '../utils/feedbackFormat';
import { getWritingMock } from '../data/mocks';
import { WRITING_MOCK_ROOT } from '../routes';
import styles from './SubmissionPage.module.css';

export default function SubmissionPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef();
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({});
  const [feedbackErrors, setFeedbackErrors] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState({});

  useEffect(() => {
    if (!id) return;
    loadSubmission(id)
      .then((data) => setLoaded(data))
      .catch((err) => setError(err.message || 'Could not load that submission.'));
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied!'))
      .catch(() => alert('Copy failed'));
  };

  const handlePrint = () => {
    window.print();
  };

  const generateFeedback = async (partKey, mock, submission) => {
    setFeedbackErrors((current) => ({ ...current, [partKey]: '' }));
    setFeedbackLoading((current) => ({ ...current, [partKey]: true }));

    try {
      const result = await FEEDBACK_REQUESTS[partKey]({ mock, submission });
      setFeedback((current) => ({ ...current, [partKey]: result }));
    } catch (err) {
      setFeedbackErrors((current) => ({
        ...current,
        [partKey]: getFeedbackErrorMessage(err)
      }));
    } finally {
      setFeedbackLoading((current) => ({ ...current, [partKey]: false }));
    }
  };

  if (error) {
    return <div className={styles.page}>{error}</div>;
  }

  if (!loaded) {
    return <div className={styles.page}>Loading submission…</div>;
  }

  const submission = getNormalizedSubmission(loaded.answers || loaded);
  const mock = getWritingMock(loaded.mockId || loaded.answers?.__mockId);
  const part4Prompt1 = mock.part4.prompts[0];
  const part4Prompt2 = mock.part4.prompts[1];

  return (
    <div className={styles.page}>
      <div className={styles.toolbar} aria-label="Submission export tools">
        <button type="button" onClick={() => navigate(WRITING_MOCK_ROOT)}>← Mock tests</button>
        <button type="button" onClick={copyLink}>Copy link</button>
        <button type="button" onClick={handlePrint}>Print / Save as PDF</button>
        <button
          type="button"
          onClick={() => downloadSubmissionDocx({ submissionId: id, submission, mock, feedback })}
        >
          Export .docx
        </button>
      </div>

      <div className={styles.toolbar}>
        <span className={styles.helperText}>
          Use browser print for a selectable PDF, or export a Word document for editing. Generated feedback is included.
        </span>
      </div>

      <FeedbackWorkspace
        feedback={feedback}
        feedbackErrors={feedbackErrors}
        feedbackLoading={feedbackLoading}
        mock={mock}
        submission={submission}
        user={user}
        onGenerate={generateFeedback}
      />

      <div ref={containerRef} className={styles.content}>
        <header className={styles.documentHeader}>
          <h1>Aptis General Practice Test - Writing</h1>
          <p className={styles.submissionMeta}>{mock.menuTitle}</p>
          <p className={styles.submissionMeta}>Submission ID: {id}</p>
        </header>

        {/* Instructions */}
        <section className={styles.section}>
          <h2>Writing</h2>
          <p>The test has four parts and takes up to 50 minutes.</p>
          <p><strong>Recommended times:</strong></p>
          <ul>
            <li>Part One: 3 minutes</li>
            <li>Part Two: 7 minutes</li>
            <li>Part Three: 10 minutes</li>
            <li>Part Four: 30 minutes</li>
          </ul>
        </section>

        {/* Part 1 */}
        <section className={styles.section}>
          <h3>Part One: Short answers</h3>
          <p>
            {mock.part1.prompt}
          </p>
          {mock.part1.questions.map((q, i) => (
            <div key={i} className={styles.qaBlock}>
              <p className={styles.question}>{q}</p>
              <div className={styles.answer}>
                {submission.part1[i]?.trim() ? (
                  <span>{submission.part1[i]}</span>
                ) : (
                  <em>(no answer)</em>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Part 2 */}
        <section className={styles.section}>
          <h3>Part Two: Form completion</h3>
          <p>
            {mock.part2.prompt}
          </p>
          <p className={styles.promptText}>
            {mock.part2.question}
          </p>
          <div className={styles.qaBlock}>
            <div className={styles.answer}>
              {submission.part2.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: submission.part2 }} />
              ) : (
                <em>(no answer)</em>
              )}
            </div>
          </div>
        </section>

        {/* Part 3 */}
        <section className={styles.section}>
          <h3>Part Three: Chat room</h3>
          <p>
            {mock.part3.prompt}
          </p>
          {mock.part3.questions.map((question, i) => (
            <div key={i} className={styles.qaBlock}>
              <p className={styles.question}>
                <strong>{question.speaker}:</strong> {question.text}
              </p>
              <div className={styles.answer}>
                {submission.part3[i]?.trim() ? (
                  <div dangerouslySetInnerHTML={{ __html: submission.part3[i] }} />
                ) : (
                  <em>(no answer)</em>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Part 4 */}
        <section className={styles.section}>
          <h3>Part Four: Emails</h3>
          <p>
            {mock.part4.intro}
          </p>
          <blockquote className={styles.emailBlock}>
            {mock.part4.sourceEmail.map((line, index) => (
              <React.Fragment key={line}>
                {line}
                {index < mock.part4.sourceEmail.length - 1 && (
                  <>
                    <br />
                    <br />
                  </>
                )}
              </React.Fragment>
            ))}
          </blockquote>

          <p><strong>1)</strong> {part4Prompt1.heading} {part4Prompt1.instructions}</p>
          <div className={styles.qaBlock}>
            <div className={styles.answer}>
              {submission.part4[0]?.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: submission.part4[0] }} />
              ) : (
                <em>(no answer)</em>
              )}
            </div>
          </div>

          <p><strong>2)</strong> {part4Prompt2.heading} {part4Prompt2.instructions}</p>
          <div className={styles.qaBlock}>
            <div className={styles.answer}>
              {submission.part4[1]?.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: submission.part4[1] }} />
              ) : (
                <em>(no answer)</em>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function getFeedbackErrorMessage(err) {
  const message = err?.message || '';
  if (err?.code === 'functions/unauthenticated' || message.includes('unauthenticated')) {
    return 'Sign in before generating feedback.';
  }
  if (message.includes('must contain text')) {
    return 'This part needs an answer before feedback can be generated.';
  }
  if (message.includes('answered items')) {
    return 'Part One needs all five answers before feedback can be generated.';
  }
  return message || 'Could not generate feedback. Please try again.';
}

function FeedbackWorkspace({
  feedback,
  feedbackErrors,
  feedbackLoading,
  mock,
  submission,
  user,
  onGenerate
}) {
  const hasFeedback = hasGeneratedFeedback(feedback);

  return (
    <section
      className={`${styles.feedbackWorkspace} ${hasFeedback ? styles.hasFeedback : ''}`}
      aria-label="Automated writing feedback"
    >
      <div className={styles.feedbackIntro}>
        <h2>Automated feedback</h2>
        <p>
          Generate Aptis-style feedback for each part. This uses the same weekly feedback credits as the main Aptis app.
        </p>
        {!user && (
          <p className={styles.feedbackNotice}>
            You can view the submission, but you need to sign in to generate AI feedback.
          </p>
        )}
      </div>

      {FEEDBACK_PARTS.map(([partKey, label]) => (
        <article
          key={partKey}
          className={`${styles.feedbackCard} ${feedback[partKey] ? styles.feedbackCardWithResult : styles.feedbackCardEmpty}`}
        >
          <div className={styles.feedbackCardHeader}>
            <h3>{label}</h3>
            <button
              type="button"
              disabled={feedbackLoading[partKey]}
              onClick={() => onGenerate(partKey, mock, submission)}
            >
              {feedbackLoading[partKey] ? 'Generating...' : feedback[partKey] ? 'Regenerate' : 'Generate feedback'}
            </button>
          </div>

          {feedbackErrors[partKey] && (
            <p className={styles.feedbackError}>{feedbackErrors[partKey]}</p>
          )}

          {feedback[partKey] ? (
            <FeedbackResult report={buildFeedbackReport(partKey, feedback[partKey])} />
          ) : (
            <p className={styles.feedbackEmpty}>No feedback generated yet.</p>
          )}
        </article>
      ))}
    </section>
  );
}

function FeedbackResult({ report }) {
  if (!report) return null;

  return (
    <div className={styles.feedbackResult}>
      {report.level ? <p className={styles.feedbackLevel}>{report.level}</p> : null}
      {report.summary ? <p className={styles.feedbackSummary}>{report.summary}</p> : null}
      <FeedbackNotes notes={report.notes} />
      <FeedbackList title="Main strengths" items={report.strengths} />
      <FeedbackList title="Priority advice" items={report.priorities} />

      {report.sections?.map((section) => (
        <section key={section.title} className={styles.feedbackSection}>
          <h4>{section.title}</h4>
          {section.question ? (
            <p className={styles.feedbackQuestion}>
              <strong>Question:</strong> {section.question}
            </p>
          ) : null}
          {section.studentAnswer ? (
            <div className={styles.feedbackStudentAnswer}>
              <strong>Student response</strong>
              <p>{section.studentAnswer}</p>
            </div>
          ) : null}
          {section.note ? <p>{section.note}</p> : null}
          <FeedbackNotes notes={section.notes} />
          <FeedbackList title="Missing or weak content" items={section.bullets} />
          <MistakesList mistakes={section.mistakes} />
          <SuggestionList suggestions={section.suggestions} />
          {section.improvedVersion ? (
            <div className={styles.feedbackImproved}>
              <strong>Improved version</strong>
              <p>{section.improvedVersion}</p>
            </div>
          ) : null}
          {section.teacherNote ? <blockquote>{section.teacherNote}</blockquote> : null}
        </section>
      ))}

      {report.teacherNote ? <blockquote>{report.teacherNote}</blockquote> : null}
    </div>
  );
}

function FeedbackNotes({ notes = [] }) {
  const visible = notes.filter((item) => item?.text);
  if (!visible.length) return null;

  return (
    <div className={styles.feedbackNotes}>
      {visible.map((item) => (
        <p key={`${item.label}-${item.text}`}>
          <strong>{item.label}:</strong> {item.text}
        </p>
      ))}
    </div>
  );
}

function FeedbackList({ title, items = [] }) {
  if (!items?.length) return null;
  return (
    <div className={styles.feedbackBullets}>
      <strong>{title}</strong>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function SuggestionList({ suggestions = [] }) {
  if (!suggestions?.length) return null;
  return (
    <div className={styles.feedbackSuggestions}>
      <strong>Suggestions</strong>
      <ul>
        {suggestions.map((suggestion) => (
          <li key={`${suggestion.category}-${suggestion.original}-${suggestion.correction}`}>
            {suggestion.category ? <small>{suggestion.category}</small> : null}
            <p>
              <span>{suggestion.original}</span>
              <span aria-hidden="true"> → </span>
              <strong>{suggestion.correction}</strong>
            </p>
            {suggestion.explanation ? <em>{suggestion.explanation}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MistakesList({ mistakes = [] }) {
  if (!mistakes?.length) return null;
  return (
    <div className={styles.feedbackMistakes}>
      <strong>Mistakes to fix</strong>
      <ul>
        {mistakes.map((mistake) => (
          <li key={`${mistake.category}-${mistake.original}-${mistake.correction}`}>
            {mistake.category ? <small>{mistake.category}</small> : null}
            <p>
              <span>{mistake.original}</span>
              <span aria-hidden="true"> → </span>
              <strong>{mistake.correction}</strong>
            </p>
            {mistake.explanation ? <em>{mistake.explanation}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
