import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAptisStrategyGuideProgress } from "../../firebase.js";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import "./aptisGrammarMenu.css";

const GRAMMAR_GUIDE_ID = "grammar_strategy_guide";

export default function AptisGrammarMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [guideComplete, setGuideComplete] = useState(false);
  const isDemoMode = Boolean(aptisAccess?.isDemoMode);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setGuideComplete(false);
      return undefined;
    }

    fetchAptisStrategyGuideProgress(GRAMMAR_GUIDE_ID)
      .then((progress) => {
        if (active) setGuideComplete(Boolean(progress?.completed));
      })
      .catch((error) => {
        console.warn("[Aptis Grammar] strategy progress load failed", error);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <main className="aptis-grammar-hub game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title="Aptis Grammar | Strategy and Practice | Seif Aptis Trainer"
        description="Learn an effective Aptis Grammar strategy, practise targeted gap-fill questions, or take a complete Grammar and Vocabulary mock exam."
      />

      <button className="aptis-grammar-back" type="button" onClick={() => navigate("/grammar-vocabulary")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Grammar &amp; Vocabulary
      </button>

      <header className="aptis-grammar-header">
        <div className="aptis-grammar-title-line">
          <ListChecks size={30} aria-hidden="true" />
          <span>Grammar</span>
        </div>
        <h1>Grammar strategy &amp; practice</h1>
        <p>Learn a reliable method for the 25 grammar questions, then build your accuracy with focused practice.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="aptis-grammar-section">
        <div className="aptis-grammar-section-heading">
          <h2>Learn the method</h2>
          <p>Understand the task, practise the decision-making process and check your strategy.</p>
        </div>

        <button
          className={`menu-card aptis-grammar-card ${guideComplete ? "is-complete" : ""}`}
          type="button"
          onClick={() => navigate("/grammar/strategy-guide")}
        >
          {guideComplete ? <CheckCircle2 className="aptis-grammar-complete-icon" size={23} aria-label="Completed" /> : null}
          <div className="aptis-grammar-card-label">
            <GraduationCap size={26} aria-hidden="true" />
            <span>Strategy guide</span>
          </div>
          <h3>Grammar Strategy Guide</h3>
          <p>Learn how to read for clues, compare all three options, check your answer and manage the shared time.</p>
          {guideComplete ? <strong className="aptis-grammar-progress">Completed</strong> : null}
          <span className="aptis-grammar-card-action">Open guide <ChevronRight size={17} aria-hidden="true" /></span>
        </button>
      </section>

      <section className="aptis-grammar-section">
        <div className="aptis-grammar-section-heading">
          <h2>Practise</h2>
          <p>Build accuracy with targeted questions, or apply your skills under complete exam conditions.</p>
        </div>

        <div className="aptis-grammar-card-grid">
          <button className="menu-card aptis-grammar-card" type="button" onClick={() => navigate("/grammar/aptis")}>
            <div className="aptis-grammar-card-label">
              <ListChecks size={26} aria-hidden="true" />
              <span>Focused practice</span>
            </div>
            <h3>Grammar Trainer</h3>
            <p>Choose a level and grammar point, generate a practice set and review mistakes or saved questions.</p>
            <span className="aptis-grammar-card-action">Open trainer <ChevronRight size={17} aria-hidden="true" /></span>
          </button>

          <button className="menu-card aptis-grammar-card" type="button" onClick={() => navigate("/grammar/aptis-mock")}>
            <div className="aptis-grammar-card-label">
              <ClipboardCheck size={26} aria-hidden="true" />
              <span>Exam practice</span>
            </div>
            <h3>Grammar &amp; Vocabulary Mock Exam</h3>
            <p>Complete all 50 questions with the official shared 25-minute time limit and exam-style navigation.</p>
            <div className="aptis-grammar-card-footer">
              {isDemoMode ? <span className="aptis-grammar-access-pill">Full access</span> : null}
              <span className="aptis-grammar-card-action">Open mock <ChevronRight size={17} aria-hidden="true" /></span>
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}
