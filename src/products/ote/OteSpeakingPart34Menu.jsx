import React from "react";
import { ArrowLeft, ClipboardList, Mic, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

export default function OteSpeakingPart34Menu({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const overviewPath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/overview" : "/ote/speaking/parts-3-4/overview"
  );
  const practicePath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/practice" : "/ote/speaking/parts-3-4/practice"
  );
  const guidedPath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/guided-talk" : "/ote/speaking/parts-3-4/guided-talk"
  );

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Parts 3 & 4 Training | Seif English"
        description="Training activities for the OTE Speaking Part 3 long talk and Part 4 follow-up questions."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Parts 3 & 4</p>
        <h1>Long Talk Training</h1>
        <p>
          Build the skills for the final OTE Speaking tasks: understand the format, manage the
          one-minute talk, answer follow-up questions without preparation time, and practise under
          exam-style timing.
        </p>
      </header>

      <div className="ote-training-activity-grid" aria-label="Parts 3 and 4 activities">
        <button className="ote-training-activity-card" type="button" onClick={() => navigate(overviewPath)}>
          <ClipboardList size={28} aria-hidden="true" />
          <span>Activity 1</span>
          <h2>How Parts 3 & 4 Work</h2>
          <p>Learn the format, compare the long talk with the follow-up questions, then check your understanding.</p>
        </button>

        <button className="ote-training-activity-card" type="button" onClick={() => navigate(guidedPath)}>
          <Mic size={28} aria-hidden="true" />
          <span>Activity 2</span>
          <h2>Guided Talk Builder</h2>
          <p>Plan two photo choices, build transitions, and compare your answer with a model response.</p>
        </button>

        <button className="ote-training-activity-card" type="button" onClick={() => navigate(practicePath)}>
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>Timed Talk Sets</h2>
          <p>Practise a picture-based talk, then answer six related follow-up questions with recordings.</p>
        </button>
      </div>
    </main>
  );
}
