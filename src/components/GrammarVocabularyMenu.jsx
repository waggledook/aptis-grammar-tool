import React, { useEffect } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  ClipboardCheck,
  Languages,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AptisDemoBadge from "./access/AptisDemoBadge.jsx";
import Seo from "./common/Seo.jsx";

const QUICK_LINKS = [
  {
    title: "Grammar Trainer",
    copy: "Practise gap-fills by level and grammar point.",
    path: "/grammar/aptis",
    icon: Brain,
    access: "Demo available",
  },
  {
    title: "Vocabulary Trainer",
    copy: "Build mixed Aptis-style vocabulary sets.",
    path: "/vocabulary/exercises",
    icon: Languages,
    access: "Demo available",
  },
  {
    title: "Mock Exams",
    copy: "Take a complete timed grammar and vocabulary mock.",
    path: "/grammar/aptis-mock",
    icon: ClipboardCheck,
    access: "Full access",
  },
];

const SKILL_LINKS = [
  {
    eyebrow: "Grammar",
    title: "Grammar strategy & practice",
    copy: "Learn the exam method, choose your level and target specific grammar points, then revisit mistakes and saved questions.",
    footer: "Strategy guide · A2–C1 practice · personal review",
    action: "Explore grammar",
    path: "/grammar",
    icon: BookOpenCheck,
  },
  {
    eyebrow: "Vocabulary",
    title: "Vocabulary strategy & practice",
    copy: "Learn the exam method, build vocabulary by skill and complete mixed exam-style exercises.",
    footer: "Strategy guide · topics · synonyms · collocations",
    action: "Explore vocabulary",
    path: "/vocabulary",
    icon: ListChecks,
  },
];

export default function GrammarVocabularyMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const isDemoMode = !!aptisAccess?.isDemoMode;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <main className="grammar-vocabulary-menu game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title="Aptis Grammar and Vocabulary | Seif Aptis Trainer"
        description="Choose quick Aptis grammar and vocabulary training, browse practice activities, or take a complete timed mock exam."
      />

      <header className="grammar-vocabulary-header">
        <p className="grammar-vocabulary-kicker">Aptis practice</p>
        <h1>Grammar &amp; Vocabulary</h1>
        <p>Choose Grammar or Vocabulary, or take a complete timed mock exam.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="grammar-vocabulary-section" aria-labelledby="quick-access-heading">
        <div className="grammar-vocabulary-section-heading">
          <div>
            <span>Start practising</span>
            <h2 id="quick-access-heading">Quick access</h2>
          </div>
          <p>Open either skill menu or go straight to a complete mock exam.</p>
        </div>

        <div className="grammar-vocabulary-quick-grid">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                className="grammar-vocabulary-quick-card"
                onClick={() => navigate(item.path)}
              >
                <span className="grammar-vocabulary-quick-icon" aria-hidden="true">
                  <Icon size={24} />
                </span>
                <span className="grammar-vocabulary-quick-copy">
                  <strong>{item.title}</strong>
                  <small>{item.copy}</small>
                </span>
                {isDemoMode ? (
                  <span className={`grammar-vocabulary-access ${item.access === "Full access" ? "locked" : "demo"}`}>
                    {item.access}
                  </span>
                ) : (
                  <ArrowRight className="grammar-vocabulary-quick-arrow" size={19} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grammar-vocabulary-section grammar-vocabulary-explore" aria-labelledby="explore-heading">
        <div className="grammar-vocabulary-section-heading">
          <div>
            <span>Browse everything</span>
            <h2 id="explore-heading">Explore by skill</h2>
          </div>
          <p>Use the full practice areas when you want to choose a topic or activity.</p>
        </div>

        <div className="grammar-vocabulary-skill-grid">
          {SKILL_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                className="menu-card grammar-vocabulary-skill-card"
                type="button"
                onClick={() => navigate(item.path)}
              >
                <div className="grammar-vocabulary-card-label">
                  <Icon size={28} aria-hidden="true" />
                  <span>{item.eyebrow}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <strong className="grammar-vocabulary-card-footer">{item.footer}</strong>
                <span className="grammar-vocabulary-card-action">
                  {item.action} <ArrowRight size={17} aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <button className="topbar-btn grammar-vocabulary-back" type="button" onClick={() => navigate("/")}>
        ← Back to main menu
      </button>

      <style>{`
        .grammar-vocabulary-menu { width:min(100%, 1120px); }
        .grammar-vocabulary-header { margin-bottom:1.2rem; text-align:left; }
        .grammar-vocabulary-kicker { margin:0 0 .25rem !important; color:#ffbd38 !important; font-size:.76rem !important; font-weight:850; letter-spacing:.09em; text-transform:uppercase; }
        .grammar-vocabulary-header h1 { margin:0 0 .55rem; color:#eef4ff; font-size:clamp(1.8rem, 4vw, 2.5rem); line-height:1.08; }
        .grammar-vocabulary-header > p:last-child { max-width:760px; margin:0; color:rgba(238,244,255,.82); font-size:1.05rem; line-height:1.5; }
        .grammar-vocabulary-section { margin-top:1.45rem; }
        .grammar-vocabulary-section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; margin-bottom:.8rem; }
        .grammar-vocabulary-section-heading span { display:block; margin-bottom:.16rem; color:#ffbd38; font-size:.72rem; font-weight:850; letter-spacing:.08em; text-transform:uppercase; }
        .grammar-vocabulary-section-heading h2 { margin:0; color:#eef4ff; font-size:1.28rem; }
        .grammar-vocabulary-section-heading > p { max-width:470px; margin:0; color:rgba(238,244,255,.68); font-size:.88rem; line-height:1.4; text-align:right; }
        .grammar-vocabulary-quick-grid { display:grid; grid-template-columns:1fr; gap:.75rem; }
        .grammar-vocabulary-quick-card { display:grid; grid-template-columns:auto minmax(0, 1fr) auto; align-items:center; gap:.8rem; min-width:0; padding:.9rem 1rem; border:1px solid #35508e; border-radius:16px; background:#172541; color:#eef4ff; text-align:left; cursor:pointer; box-shadow:0 7px 18px rgba(0,0,0,.13); transition:transform .16s ease, border-color .16s ease, box-shadow .16s ease; }
        .grammar-vocabulary-quick-card:hover { transform:translateY(-2px); border-color:#5b7bd0; box-shadow:0 11px 24px rgba(0,0,0,.19); }
        .grammar-vocabulary-quick-card:focus-visible { outline:3px solid color-mix(in srgb, #ffbd38 70%, white); outline-offset:3px; }
        .grammar-vocabulary-quick-icon { display:grid; place-items:center; width:44px; height:44px; border:1px solid rgba(255,189,56,.38); border-radius:13px; background:rgba(255,189,56,.1); color:#ffcf70; }
        .grammar-vocabulary-quick-copy { min-width:0; }
        .grammar-vocabulary-quick-copy strong, .grammar-vocabulary-quick-copy small { display:block; }
        .grammar-vocabulary-quick-copy strong { margin-bottom:.18rem; color:#eef4ff; font-size:.98rem; }
        .grammar-vocabulary-quick-copy small { color:rgba(238,244,255,.7); font-size:.78rem; line-height:1.35; }
        .grammar-vocabulary-quick-arrow { color:#ffbd38; }
        .grammar-vocabulary-access { padding:.22rem .48rem; border:1px solid rgba(238,244,255,.28); border-radius:999px; color:rgba(238,244,255,.72); font-size:.64rem; font-weight:850; white-space:nowrap; }
        .grammar-vocabulary-access.demo { border-color:rgba(255,189,56,.44); color:#ffcf70; }
        .grammar-vocabulary-access.locked { border-color:rgba(148,163,184,.42); color:#cbd5e1; }
        .grammar-vocabulary-explore { margin-top:2rem; }
        .grammar-vocabulary-skill-grid { display:grid; grid-template-columns:1fr; gap:1rem; }
        .grammar-vocabulary-menu .grammar-vocabulary-skill-card { position:relative; display:flex; flex-direction:column; align-items:flex-start; min-height:238px; text-align:left; }
        .grammar-vocabulary-card-label { display:flex; align-items:center; gap:.4rem; margin-bottom:.3rem; color:#eef4ff; font-size:1rem; }
        .grammar-vocabulary-card-label svg { color:#eef4ff; }
        .grammar-vocabulary-menu .grammar-vocabulary-skill-card h3 { margin:.15rem 0 .55rem; color:#eef4ff; font-size:1.3rem; }
        .grammar-vocabulary-menu .grammar-vocabulary-skill-card p { margin:0; color:rgba(238,244,255,.82); line-height:1.48; }
        .grammar-vocabulary-card-footer { display:block; margin-top:auto; padding-top:1rem; color:#ffbd38; font-size:.84rem; }
        .grammar-vocabulary-card-action { display:flex; align-items:center; gap:.35rem; margin-top:.55rem; color:#eef4ff; font-size:.82rem; font-weight:800; }
        .grammar-vocabulary-back { margin-top:1.3rem; }

        :root[data-theme="light"] .grammar-vocabulary-header h1,
        :root[data-theme="light"] .grammar-vocabulary-section-heading h2 { color:var(--color-text); }
        :root[data-theme="light"] .grammar-vocabulary-header > p:last-child,
        :root[data-theme="light"] .grammar-vocabulary-section-heading > p { color:var(--color-text-soft); }
        :root[data-theme="light"] .grammar-vocabulary-kicker,
        :root[data-theme="light"] .grammar-vocabulary-section-heading span { color:#9a6200 !important; }
        :root[data-theme="light"] .grammar-vocabulary-quick-card { border-color:var(--color-border); background:var(--color-surface-raised); color:var(--color-text); box-shadow:0 8px 20px rgba(24,42,74,.08); }
        :root[data-theme="light"] .grammar-vocabulary-quick-card:hover { border-color:#8aa0cf; box-shadow:0 12px 25px rgba(24,42,74,.13); }
        :root[data-theme="light"] .grammar-vocabulary-quick-icon { border-color:rgba(154,98,0,.28); background:rgba(255,189,56,.13); color:#9a6200; }
        :root[data-theme="light"] .grammar-vocabulary-quick-copy strong { color:var(--color-text); }
        :root[data-theme="light"] .grammar-vocabulary-quick-copy small { color:var(--color-text-soft); }
        :root[data-theme="light"] .grammar-vocabulary-access { color:var(--color-text-soft); }
        :root[data-theme="light"] .grammar-vocabulary-access.demo { border-color:#b47a15; color:#8a5900; }
        :root[data-theme="light"] .grammar-vocabulary-card-label,
        :root[data-theme="light"] .grammar-vocabulary-card-label svg,
        :root[data-theme="light"] .grammar-vocabulary-menu .grammar-vocabulary-skill-card h3,
        :root[data-theme="light"] .grammar-vocabulary-card-action { color:var(--color-text); }
        :root[data-theme="light"] .grammar-vocabulary-menu .grammar-vocabulary-skill-card p { color:var(--color-text-soft); }
        :root[data-theme="light"] .grammar-vocabulary-menu .grammar-vocabulary-card-footer { color:#9a6200 !important; }
        :root[data-theme="light"] .grammar-vocabulary-menu .grammar-vocabulary-card-action { color:var(--color-text) !important; }

        @media (min-width:760px) {
          .grammar-vocabulary-quick-grid { grid-template-columns:repeat(3, minmax(0, 1fr)); }
          .grammar-vocabulary-quick-card { grid-template-columns:auto minmax(0, 1fr); align-items:start; min-height:154px; }
          .grammar-vocabulary-quick-icon { grid-row:1 / span 2; }
          .grammar-vocabulary-quick-arrow, .grammar-vocabulary-access { grid-column:2; align-self:end; justify-self:start; }
          .grammar-vocabulary-skill-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width:620px) {
          .grammar-vocabulary-section-heading { display:block; }
          .grammar-vocabulary-section-heading > p { margin-top:.35rem; text-align:left; }
          .grammar-vocabulary-access { font-size:.6rem; }
        }
      `}</style>
    </main>
  );
}
