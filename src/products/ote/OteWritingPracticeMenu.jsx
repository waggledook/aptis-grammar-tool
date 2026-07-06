import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { getOteWritingPracticeGroup } from "./mockTests/data/oteWritingPracticeData.js";
import OteAssignableCard from "./OteAssignableCard.jsx";
import { useOteTrainingProgress } from "./utils/trainingProgress.js";
import "./styles/ote.css";

export default function OteWritingPracticeMenu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { section = "email" } = useParams();
  const group = getOteWritingPracticeGroup(section);
  const groupIsAdvanced = group.id.startsWith("advanced-");
  const userIsAdvanced = user?.oteVersion === "advanced";
  const groupMatchesVariant = !user || groupIsAdvanced === userIsAdvanced;
  const menuGroups = getMenuGroups(group.sets);
  const trainingPath = getSitePath(
    group.hasTrainingMenu === false
      ? nativeRoutes ? "/writing" : "/ote/writing"
      : nativeRoutes ? `/writing/training/${group.id}` : `/ote/writing/training/${group.id}`
  );
  const basePath = nativeRoutes ? `/writing/training/${group.id}/practice` : `/ote/writing/training/${group.id}/practice`;
  const variant = groupIsAdvanced ? "advanced" : "general";
  const completedProgress = useOteTrainingProgress();

  function buildAssignmentItem(set) {
    const routePath = getSitePath(`${basePath}/${set.id}`);
    const parentProgressId = `writing.${group.id}.practice`;
    return {
      id: `ote.${variant}.writing.${group.id}.practice.${set.id}`,
      variant,
      category: "Writing",
      label: `${group.label}: ${set.title}`,
      routePath,
      progressId: `${parentProgressId}.${set.id}`,
      parentProgressId,
    };
  }

  if (!groupMatchesVariant) {
    return (
      <main className="ote-training-page">
        <Seo title="Writing practice unavailable | Seif English" description="This writing practice set is not available in the selected OTE variant." />
        <button className="ote-training-back" type="button" onClick={() => navigate(getSitePath(nativeRoutes ? "/writing" : "/ote/writing"))}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to writing
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Practice sets</p>
          <h1>Practice not available</h1>
          <p>
            {groupIsAdvanced
              ? "This advanced writing practice is only available in the Advanced OTE workspace."
              : "This general writing practice is only available in the General OTE workspace."}
          </p>
        </header>
      </main>
    );
  }

  return (
    <main className="ote-training-page">
      <Seo
        title={`OTE ${group.label} Timed Practice | Seif English`}
        description={`Timed OTE writing practice tasks for ${group.label.toLowerCase()} writing.`}
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(trainingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        {group.hasTrainingMenu === false ? "Back to writing" : `Back to ${group.label.toLowerCase()} training`}
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Practice sets</p>
        <h1>{group.label} Timed Practice</h1>
        <p>Choose one task, then complete one timed writing response in a focused practice screen.</p>
      </header>

      {menuGroups.length > 1 ? (
        <div className="ote-writing-register-grid">
          {menuGroups.map(({ id, label, sets }) => (
            <section key={id} className={`ote-writing-register-section is-${id}`}>
              <div className="ote-writing-register-head">
                <span>{label}</span>
                <strong>{sets.length} task{sets.length === 1 ? "" : "s"}</strong>
              </div>
              <div className="ote-practice-set-grid">
                {sets.map((set, index) => (
                  <PracticeSetCard
                    key={set.id}
                    user={user}
                    item={buildAssignmentItem(set)}
                    isComplete={completedProgress.has(`writing.${group.id}.practice.${set.id}`)}
                    set={set}
                    index={index}
                    onClick={() => navigate(getSitePath(`${basePath}/${set.id}`))}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="ote-practice-set-grid">
          {group.sets.map((set, index) => (
            <PracticeSetCard
              key={set.id}
              user={user}
              item={buildAssignmentItem(set)}
              isComplete={completedProgress.has(`writing.${group.id}.practice.${set.id}`)}
              set={set}
              index={index}
              onClick={() => navigate(getSitePath(`${basePath}/${set.id}`))}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function getMenuGroups(sets = []) {
  const labels = {
    informal: "Informal emails",
    formal: "Formal emails",
    article: "Article tasks",
    review: "Review tasks",
  };
  const groupKey = sets.some((set) => set.register)
    ? "register"
    : sets.some((set) => set.type === "article" || set.type === "review")
      ? "type"
      : "";

  if (!groupKey) return [];

  const grouped = sets.reduce((acc, set) => {
    const key = set[groupKey];
    if (!key) return acc;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        label: labels[key] || set.registerLabel || set.typeLabel || key,
        sets: [],
      };
    }
    acc[key].sets.push(set);
    return acc;
  }, {});
  return ["informal", "formal", "article", "review"]
    .map((key) => grouped[key])
    .filter(Boolean);
}

function PracticeSetCard({ user, item, isComplete, set, index, onClick }) {
  return (
    <OteAssignableCard
      user={user}
      item={item}
      className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`}
      onClick={onClick}
    >
      {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
      <span>{set.registerLabel ? `${set.registerLabel} ${index + 1}` : `${set.typeLabel || "Set"} ${index + 1}`}</span>
      <h2>{set.title}</h2>
      {set.theme ? <strong className="ote-practice-set-theme">{set.theme}</strong> : null}
      <p>
        {Math.round(set.timeSeconds / 60)} minutes. Write {set.minWords}-{set.maxWords} words.
      </p>
    </OteAssignableCard>
  );
}
