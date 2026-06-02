import React from "react";
import { ArrowLeft, ClipboardList, FileText, MessageSquareText, Mic, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

export default function OteSpeakingPart2Menu({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const introPath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/overview" : "/ote/speaking/part-2-voicemails/overview"
  );
  const guidedPath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/guided-message-1" : "/ote/speaking/part-2-voicemails/guided-message-1"
  );
  const guidedMessage2Path = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/guided-message-2" : "/ote/speaking/part-2-voicemails/guided-message-2"
  );
  const cheatSheetPath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/cheat-sheet" : "/ote/speaking/part-2-voicemails/cheat-sheet"
  );
  const practicePath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/practice" : "/ote/speaking/part-2-voicemails/practice"
  );

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Part 2 Voicemail Training | Seif English"
        description="Training activities for OTE Speaking Part 2 spoken voicemail messages."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 2</p>
        <h1>Voicemail Training</h1>
        <p>
          Build the skills for formal and friendly OTE voice messages: understand the format,
          spot common mistakes, practise under timed conditions, and compare your answer with a model.
        </p>
      </header>

      <div className="ote-training-activity-grid" aria-label="Part 2 voicemail activities">
        <button className="ote-training-activity-card" type="button" onClick={() => navigate(introPath)}>
          <ClipboardList size={28} aria-hidden="true" />
          <span>Activity 1</span>
          <h2>How Voicemails Work</h2>
          <p>Learn the format, compare Message 1 and Message 2, then check your understanding.</p>
        </button>

        <button className="ote-training-activity-card" type="button" onClick={() => navigate(guidedPath)}>
          <Mic size={28} aria-hidden="true" />
          <span>Activity 2</span>
          <h2>Guided Task: Message 1</h2>
          <p>Review student answers, record your own polite voicemail, and compare with a model.</p>
        </button>

        <button className="ote-training-activity-card" type="button" onClick={() => navigate(guidedMessage2Path)}>
          <MessageSquareText size={28} aria-hidden="true" />
          <span>Activity 3</span>
          <h2>Guided Task: Message 2</h2>
          <p>Reply to a friend's voice message with the right informal tone and clear structure.</p>
        </button>

        <button className="ote-training-activity-card" type="button" onClick={() => navigate(cheatSheetPath)}>
          <FileText size={28} aria-hidden="true" />
          <span>Reference</span>
          <h2>Part 2 Cheat Sheet</h2>
          <p>Review useful frameworks and download a branded PDF reference for practice.</p>
        </button>

        <button className="ote-training-activity-card" type="button" onClick={() => navigate(practicePath)}>
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>Timed Voicemail Sets</h2>
          <p>Practise both voicemail types with exam-style timing and downloadable recordings.</p>
        </button>
      </div>
    </main>
  );
}
