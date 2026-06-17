import React from "react";
import { ArrowLeft, ClipboardList, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

export default function OteSpeakingPart1Menu({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const overviewPath = getSitePath(
    nativeRoutes ? "/speaking/part-1-interview/overview" : "/ote/speaking/part-1-interview/overview"
  );
  const practicePath = getSitePath(
    nativeRoutes ? "/speaking/part-1-interview/practice" : "/ote/speaking/part-1-interview/practice"
  );

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Part 1 Interview Training | Seif English"
        description="Training activities for OTE Speaking Part 1 short interview questions."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 1</p>
        <h1>Interview Training</h1>
        <p>
          Build confidence for the opening interview: understand the question order, practise the
          fast timing, and record short answers across everyday topics.
        </p>
      </header>

      <div className="ote-training-activity-grid" aria-label="Part 1 interview activities">
        <button className="ote-training-activity-card" type="button" onClick={() => navigate(overviewPath)}>
          <ClipboardList size={28} aria-hidden="true" />
          <span>Activity 1</span>
          <h2>How Part 1 Works</h2>
          <p>Learn the format, timing, question order, and scoring rules, then check your understanding.</p>
        </button>

        <button className="ote-training-activity-card" type="button" onClick={() => navigate(practicePath)}>
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>Timed Interview Sets</h2>
          <p>Practise two fixed warm-up questions and six topic questions with recordings.</p>
        </button>
      </div>
    </main>
  );
}
