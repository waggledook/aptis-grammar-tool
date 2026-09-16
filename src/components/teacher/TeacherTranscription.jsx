import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Clipboard, FileAudio, Sparkles, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { requestStaffAudioTranscription, requestStaffTranscriptFeedback } from "../../firebase.js";
import { blobToBase64 } from "../../products/ote/utils/speakingFeedback.js";
import SpeakingFeedbackPanel from "../speaking/SpeakingFeedbackPanel.jsx";
import { TRANSCRIPTION_APPS, TRANSCRIPTION_TASK_GROUPS } from "./teacherTranscriptionCatalog.js";
import Seo from "../common/Seo.jsx";
import "./TeacherTranscription.css";

const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const AUDIO_EXTENSIONS = /\.(mp3|mp4|mpeg|mpga|m4a|wav|webm)$/i;
const AUDIO_MIME_BY_EXTENSION = {
  mp3: "audio/mpeg",
  mp4: "audio/mp4",
  mpeg: "audio/mpeg",
  mpga: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  webm: "audio/webm",
};
function readableError(error) {
  return String(error?.message || "Something went wrong. Please try again.")
    .replace(/^Firebase:\s*/i, "")
    .replace(/\s*\(functions\/[^)]*\)\.?$/, "")
    .trim();
}

export default function TeacherTranscription() {
  const inputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());
  const [recordings, setRecordings] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [app, setApp] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskId, setTaskId] = useState("");
  const [taskPrompt, setTaskPrompt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [busy, setBusy] = useState("");
  const [transcribeProgress, setTranscribeProgress] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const groups = TRANSCRIPTION_TASK_GROUPS.filter((group) => group.app === app);
  const selectedGroup = groups.find((group) => group.id === taskType);
  const selectedTask = selectedGroup?.tasks.find((task) => task.id === taskId);
  const taskQuestions = selectedTask?.questions || (selectedTask ? [selectedTask.prompt] : []);
  const allTranscribed = recordings.length > 0 && recordings.every((recording) => recording.transcript);
  const questionIndexes = recordings.map((recording) => recording.questionIndex);
  const mappingValid = taskType === "general" || (Boolean(selectedTask) &&
    recordings.length <= taskQuestions.length &&
    questionIndexes.every((index) => Number.isInteger(index) && index >= 0 && index < taskQuestions.length) &&
    new Set(questionIndexes).size === questionIndexes.length &&
    (!taskType.endsWith("_interview") || questionIndexes.some((index) => index >= 2)));
  const totalTranscriptLength = recordings.reduce((total, recording) => total + recording.transcript.length, 0);
  const feedbackReady = allTranscribed && mappingValid && totalTranscriptLength <= 24000 &&
    recordings.every((recording) => recording.transcript.length <= 12000);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  function clearFeedback() {
    setFeedback("");
    setFeedbackResult(null);
  }

  function getQuestionIndex(fileName, fallback, count) {
    const match = fileName.match(/(?:question|q)[-_ ]?(\d+)(?=\D|$)/i);
    const fromName = match ? Number(match[1]) - 1 : fallback;
    return fromName >= 0 && fromName < count ? fromName : Math.min(fallback, count - 1);
  }

  function addFiles(fileList) {
    if (busy) return;
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (recordings.length + files.length > 8) {
      setError("You can add up to eight recordings at a time.");
      return;
    }
    if (files.some((file) => !AUDIO_EXTENSIONS.test(file.name))) {
      setError("Choose an MP3, MP4, M4A, WAV or WebM audio file.");
      return;
    }
    if (files.some((file) => file.size > MAX_AUDIO_BYTES)) {
      setError("Each recording must be 6 MB or smaller.");
      return;
    }
    if (files.some((file) => !file.size)) {
      setError("One of the files is empty.");
      return;
    }
    const added = files.map((file, index) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        url,
        questionIndex: taskQuestions.length ? getQuestionIndex(file.name, recordings.length + index, taskQuestions.length) : recordings.length + index,
        transcript: "",
        error: "",
      };
    });
    setRecordings((current) => [...current, ...added]);
    clearFeedback();
    setError("");
    setCopied(false);
  }

  function removeRecording(id) {
    const row = recordings.find((recording) => recording.id === id);
    if (row) {
      URL.revokeObjectURL(row.url);
      objectUrlsRef.current.delete(row.url);
    }
    setRecordings((current) => current.filter((recording) => recording.id !== id));
    clearFeedback();
  }

  async function transcribe() {
    if (!recordings.length || busy) return;
    setBusy("transcribing");
    setError("");
    clearFeedback();
    try {
      const pending = recordings.filter((recording) => !recording.transcript);
      for (const [index, recording] of pending.entries()) {
        setTranscribeProgress(`Transcribing ${index + 1} of ${pending.length}…`);
        try {
          const result = await requestStaffAudioTranscription({
            name: recording.file.name,
            mime: AUDIO_MIME_BY_EXTENSION[recording.file.name.match(AUDIO_EXTENSIONS)[1].toLowerCase()],
            base64: await blobToBase64(recording.file),
          });
          setRecordings((current) => current.map((row) => row.id === recording.id
            ? { ...row, transcript: result.transcript || "", error: "" } : row));
        } catch (caught) {
          setRecordings((current) => current.map((row) => row.id === recording.id
            ? { ...row, error: readableError(caught) } : row));
        }
      }
    } finally {
      setBusy("");
      setTranscribeProgress("");
    }
  }

  async function generateFeedback() {
    if (!taskType || !feedbackReady || busy) return;
    setBusy("feedback");
    setError("");
    clearFeedback();
    try {
      const result = await requestStaffTranscriptFeedback({
        taskType,
        taskPrompt,
        entries: recordings.map((recording) => ({ transcript: recording.transcript, questionIndex: recording.questionIndex })),
        task: selectedTask?.context || null,
        questions: taskQuestions,
        question: selectedTask?.prompt || "",
      });
      if (typeof result.feedback === "string") setFeedback(result.feedback);
      else setFeedbackResult(result);
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setBusy("");
    }
  }

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(recordings.map((recording, index) =>
        recordings.length === 1 ? recording.transcript : `${index + 1}. ${recording.file.name}\n${recording.transcript}`
      ).join("\n\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Select the transcript text and copy it manually.");
    }
  }

  return (
    <main className="teacher-transcription-page game-wrapper">
      <Seo title="Audio transcription | Teacher resources" description="Transcribe a speaking recording and request optional AI feedback." />
      <Link className="teacher-transcription-back" to="/teacher-resources"><ArrowLeft size={17} /> Teacher resources</Link>
      <header className="teacher-transcription-header">
        <div className="teacher-transcription-mark"><FileAudio size={30} aria-hidden="true" /></div>
        <div>
          <p className="teacher-transcription-eyebrow">Teacher workspace</p>
          <h1>Audio transcription</h1>
          <p>Drop in one recording or a complete speaking set, then request one feedback report for the selected task.</p>
        </div>
      </header>

      <div className="teacher-transcription-layout">
        <section className="teacher-transcription-card" aria-labelledby="upload-heading">
          <div className="teacher-transcription-step">01 · Recording</div>
          <h2 id="upload-heading">Choose recordings</h2>
          <div
            className={`teacher-transcription-drop ${dragging ? "is-dragging" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <Upload size={26} aria-hidden="true" />
            <strong>Drop one or several recordings here</strong>
            <span>MP3, MP4, M4A, WAV or WebM · up to 6 MB each · 8 files maximum</span>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={Boolean(busy)}>Browse files</button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm,audio/*"
              onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }}
              hidden
            />
          </div>
          {recordings.length > 0 && <ol className="teacher-transcription-files">
            {recordings.map((recording, index) => <li key={recording.id} className="teacher-transcription-file">
              <div className="teacher-transcription-file-head">
                <div><strong>{index + 1}. {recording.file.name}</strong><span>{(recording.file.size / 1024 / 1024).toFixed(2)} MB</span></div>
                <button className="teacher-transcription-secondary" type="button" disabled={Boolean(busy)} onClick={() => removeRecording(recording.id)}>Remove</button>
              </div>
              <audio controls src={recording.url} aria-label={`Recording ${index + 1}`} />
              {selectedTask && taskQuestions.length > 1 && <>
                <label htmlFor={`recording-question-${recording.id}`}>Match to question</label>
                <select
                  id={`recording-question-${recording.id}`}
                  value={recording.questionIndex >= 0 && recording.questionIndex < taskQuestions.length ? recording.questionIndex : ""}
                  disabled={Boolean(busy)}
                  onChange={(event) => {
                    setRecordings((current) => current.map((row) => row.id === recording.id
                      ? { ...row, questionIndex: Number(event.target.value) } : row));
                    clearFeedback();
                  }}
                >
                  <option value="" disabled>Choose question</option>
                  {taskQuestions.map((question, questionNumber) => <option key={questionNumber} value={questionNumber}>
                    Q{questionNumber + 1}{questionNumber < (selectedTask.practiceQuestionCount || 0) ? " · practice" : ""}: {question}
                  </option>)}
                </select>
              </>}
              {recording.transcript && <p className="teacher-transcription-row-transcript">{recording.transcript}</p>}
              {recording.error && <p className="teacher-transcription-row-error" role="alert">{recording.error}</p>}
            </li>)}
          </ol>}
          <button className="teacher-transcription-primary" type="button" disabled={!recordings.length || allTranscribed || Boolean(busy)} onClick={transcribe}>
            {busy === "transcribing" ? transcribeProgress : "Transcribe recordings"}
          </button>
          <p className="teacher-transcription-note">The audio is sent to the existing transcription service. It is not saved to your profile.</p>
        </section>

        <section className="teacher-transcription-card" aria-labelledby="context-heading">
          <div className="teacher-transcription-step">02 · Optional context</div>
          <h2 id="context-heading">Find the speaking task</h2>
          <label htmlFor="transcription-app">App or exam</label>
          <select id="transcription-app" value={app} disabled={Boolean(busy)} onChange={(event) => {
            setApp(event.target.value); setTaskType(""); setTaskId(""); clearFeedback();
          }}>
            {TRANSCRIPTION_APPS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          {app && <>
            <label htmlFor="transcription-task-type">Task type</label>
            <select id="transcription-task-type" value={taskType} disabled={Boolean(busy)} onChange={(event) => {
              setTaskType(event.target.value); setTaskId(""); clearFeedback();
            }}>
              <option value="">Choose a task type</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
            </select>
          </>}
          {selectedGroup && selectedGroup.tasks.length > 0 && <>
            <label htmlFor="transcription-specific-task">Specific task</label>
            <select id="transcription-specific-task" value={taskId} disabled={Boolean(busy)} onChange={(event) => {
              const nextTask = selectedGroup.tasks.find((task) => task.id === event.target.value);
              const count = nextTask?.questions?.length || (nextTask ? 1 : 0);
              setTaskId(event.target.value);
              if (count) setRecordings((current) => current.map((recording, index) => ({
                ...recording,
                questionIndex: getQuestionIndex(recording.file.name, index, count),
              })));
              clearFeedback();
            }}>
              <option value="">Choose a task</option>
              {selectedGroup.tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
          </>}
          {selectedTask && <div className="teacher-transcription-task-preview">
            <strong>Selected prompt</strong>
            <p>{selectedTask.prompt || `${taskQuestions.length} questions in this set. Match each recording to its question in the list on the left.`}</p>
            {selectedTask.context?.audience && <p><strong>Audience:</strong> {selectedTask.context.audience}</p>}
          </div>}
          {taskType === "general" && <>
            <label htmlFor="transcription-task-prompt">Question or task instructions <span>(optional)</span></label>
            <textarea
              id="transcription-task-prompt"
              value={taskPrompt}
              maxLength={1800}
              rows={5}
              placeholder="Paste the question, prompt, or bullet points here for more specific feedback."
              onChange={(event) => { setTaskPrompt(event.target.value); setFeedback(""); }}
              disabled={Boolean(busy)}
            />
          </>}
          {selectedGroup && <p className="teacher-transcription-note">One feedback report for the selected set uses {selectedGroup.credits} AI feedback credits. It follows the existing {app === "other" ? "general" : "exam"} speaking feedback rubric. Audio-level pronunciation is not assessed from transcripts.</p>}
          {selectedTask?.practiceQuestionCount && <p className="teacher-transcription-note">Questions 1–{selectedTask.practiceQuestionCount} are practice questions. They can be transcribed, but the exam feedback assesses the later answers.</p>}
        </section>
      </div>

      {error && <p className="teacher-transcription-error" role="alert">{error}</p>}

      {allTranscribed && <section className="teacher-transcription-card teacher-transcription-result" aria-labelledby="transcript-heading">
        <div className="teacher-transcription-result-heading">
          <div><div className="teacher-transcription-step">03 · Result</div><h2 id="transcript-heading">{recordings.length === 1 ? "Transcript" : `${recordings.length} transcripts ready`}</h2></div>
          <button type="button" className="teacher-transcription-secondary" onClick={copyTranscript}>
            {copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "Copied" : "Copy all text"}
          </button>
        </div>
        <p className="teacher-transcription-note">Each transcript appears beside its recording above. Check the question assignments before requesting one report for the set.</p>
        {selectedGroup && !mappingValid && <p className="teacher-transcription-row-error">Match every recording to a different question in the selected task. Interview feedback needs at least one assessed answer.</p>}
        {selectedGroup && <button className="teacher-transcription-primary" type="button" disabled={Boolean(busy) || !feedbackReady} onClick={generateFeedback}>
          <Sparkles size={18} /> {busy === "feedback" ? "Generating feedback…" : feedback || feedbackResult ? "Generate feedback again" : "Get AI feedback"}
        </button>}
        {selectedGroup && !feedbackReady && totalTranscriptLength > 24000 && <p className="teacher-transcription-note">These transcripts are too long for one feedback request. You can still copy them.</p>}
      </section>}

      {feedback && <section className="teacher-transcription-card teacher-transcription-result" aria-labelledby="feedback-heading">
        <div className="teacher-transcription-step">04 · Optional feedback</div>
        <h2 id="feedback-heading">AI feedback</h2>
        <p className="teacher-transcription-text">{feedback}</p>
      </section>}
      {feedbackResult && <div className="teacher-transcription-structured-result">
        <SpeakingFeedbackPanel feedbackResult={feedbackResult} questions={feedbackResult.transcripts?.map((item) => item.question) || []} title={`${selectedGroup?.label || "Speaking"} feedback`} />
      </div>}
    </main>
  );
}
