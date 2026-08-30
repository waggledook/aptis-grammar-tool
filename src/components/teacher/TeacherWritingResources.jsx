import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Play, Radio, Scissors, Search, Users } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createAptisWritingLiveGame,
  createPart4ErrorDetectiveLiveGame,
  createRegisterSurgeryLiveGame,
} from "../../api/liveGames.js";
import { toast } from "../../utils/toast.js";
import Seo from "../common/Seo.jsx";
import {
  APTIS_WRITING_TEACHER_TOPICS,
  getAptisWritingTeacherTask,
} from "../writing/data/aptisWritingTeacherTasks.js";
import "./TeacherWritingResources.css";

const PART_DETAILS = {
  2: { label: "Part 2", format: "One 20–30 word response", path: "/teacher/writing/part2" },
  3: { label: "Part 3", format: "Three 30–40 word responses", path: "/teacher/writing/part3" },
  4: { label: "Part 4", format: "Informal and formal emails", path: "/teacher/writing/part4" },
};

export default function TeacherWritingResources() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPart = Number(searchParams.get("part"));
  const selectedPart = [2, 3, 4].includes(requestedPart) ? requestedPart : 2;
  const liveLaunchMode = searchParams.get("mode") === "live";
  const registerLiveLaunchMode = selectedPart === 4 && searchParams.get("mode") === "register-surgery-live";
  const errorDetectiveLiveLaunchMode = selectedPart === 4 && searchParams.get("mode") === "error-detective-live";
  const [creatingKey, setCreatingKey] = useState("");
  const details = PART_DETAILS[selectedPart];
  const selectedTasks = useMemo(
    () => APTIS_WRITING_TEACHER_TOPICS.map((topic) => getAptisWritingTeacherTask(selectedPart, topic.id)),
    [selectedPart]
  );

  function choosePart(part) {
    const next = new URLSearchParams(searchParams);
    next.set("part", String(part));
    setSearchParams(next);
  }

  async function launchLive(task) {
    const key = `${selectedPart}:${task.id}`;
    if (creatingKey) return;
    setCreatingKey(key);
    try {
      const { gameId } = await createAptisWritingLiveGame({
        part: selectedPart,
        taskId: task.id,
        title: `Aptis Writing Part ${selectedPart} · ${task.title}`,
      });
      navigate(`/live/aptis-writing/host/${gameId}`);
    } catch (error) {
      console.error("[TeacherWritingResources] live room creation failed", error);
      toast(error.message || "Could not create the live writing room.");
    } finally {
      setCreatingKey("");
    }
  }

  async function launchRegisterSurgeryLive() {
    if (creatingKey) return;
    setCreatingKey("register-surgery");
    try {
      const { gameId } = await createRegisterSurgeryLiveGame();
      navigate(`/live/register-surgery/host/${gameId}`);
    } catch (error) {
      console.error("[TeacherWritingResources] Register Surgery room creation failed", error);
      toast(error.message || "Could not create the Register Surgery room.");
    } finally {
      setCreatingKey("");
    }
  }

  async function launchErrorDetectiveLive() {
    if (creatingKey) return;
    setCreatingKey("error-detective");
    try {
      const { gameId } = await createPart4ErrorDetectiveLiveGame();
      navigate(`/live/error-detective/host/${gameId}`);
    } catch (error) {
      console.error("[TeacherWritingResources] Error Detective room creation failed", error);
      toast(error.message || "Could not create the Error Detective room.");
    } finally {
      setCreatingKey("");
    }
  }

  return (
    <main className="teacher-writing-resources game-wrapper">
      <Seo
        title="Aptis Writing Classroom Resources | Seif English"
        description="Extra Aptis Writing tasks for assignment, direct-link practice and live classroom sessions."
      />

      <Link className="teacher-writing-back" to="/teacher-resources">
        <ArrowLeft size={18} /> Back to teacher resources
      </Link>

      <header className="teacher-writing-hero">
        <div className="teacher-writing-hero-icon"><BookOpen size={30} /></div>
        <div>
          <p>Aptis Trainer · Teacher resources</p>
          <h1>Writing classroom topics</h1>
          <span>
            Four connected scenarios for Parts 2, 3 and 4. Open the normal writing task to assign or share it,
            or start a live room for a teacher-paced class session.
          </span>
        </div>
      </header>

      <div className="teacher-writing-part-tabs" role="tablist" aria-label="Writing part">
        {Object.entries(PART_DETAILS).map(([part, item]) => (
          <button
            aria-selected={selectedPart === Number(part)}
            className={selectedPart === Number(part) ? "is-selected" : ""}
            key={part}
            onClick={() => choosePart(Number(part))}
            role="tab"
            type="button"
          >
            <strong>{item.label}</strong>
            <span>{item.format}</span>
          </button>
        ))}
      </div>

      {liveLaunchMode ? (
        <div className="teacher-writing-live-notice">
          <Radio size={21} aria-hidden="true" />
          <div><strong>Live launch mode</strong><span>Choose a topic below, then select Run live to create the PIN room.</span></div>
        </div>
      ) : null}

      {registerLiveLaunchMode ? (
        <div className="teacher-writing-live-notice">
          <Radio size={21} aria-hidden="true" />
          <div><strong>Register Surgery live mode</strong><span>Create a PIN room, then lead the class through four response rounds and the final comparison.</span></div>
        </div>
      ) : null}

      {errorDetectiveLiveLaunchMode ? (
        <div className="teacher-writing-live-notice">
          <Radio size={21} aria-hidden="true" />
          <div><strong>Error Detective live mode</strong><span>Create a PIN room, then run two four-sentence work and review phases.</span></div>
        </div>
      ) : null}

      {selectedPart === 4 ? (
        <section className="teacher-writing-skill-section">
          <div className="teacher-writing-skill-icon"><Scissors size={25} /></div>
          <div>
            <p>Classroom skills activity</p>
            <h2>Part 4 Register Surgery</h2>
            <span>Students identify unsuitable phrases inside complete informal and formal emails, rewrite them and compare register choices.</span>
          </div>
          <div className="teacher-writing-skill-actions">
            <button disabled={Boolean(creatingKey)} onClick={launchRegisterSurgeryLive} type="button">
              {creatingKey === "register-surgery" ? <Radio className="is-pulsing" size={17} /> : <Play size={17} />}
              {creatingKey === "register-surgery" ? "Creating room…" : "Run live"}
            </button>
            <Link to="/writing/part4-register-surgery">Open activity <ArrowRight size={17} /></Link>
          </div>
        </section>
      ) : null}

      {selectedPart === 4 ? (
        <section className="teacher-writing-skill-section">
          <div className="teacher-writing-skill-icon"><Search size={25} /></div>
          <div>
            <p>Classroom skills activity</p>
            <h2>Part 4 Error Detective</h2>
            <span>Students identify recurring errors from real Part 4 submissions in two four-sentence sets, then review the corrections together.</span>
          </div>
          <div className="teacher-writing-skill-actions">
            <button disabled={Boolean(creatingKey)} onClick={launchErrorDetectiveLive} type="button">
              {creatingKey === "error-detective" ? <Radio className="is-pulsing" size={17} /> : <Play size={17} />}
              {creatingKey === "error-detective" ? "Creating room…" : "Run live"}
            </button>
            <Link to="/writing/part4-error-detective">Open activity <ArrowRight size={17} /></Link>
          </div>
        </section>
      ) : null}

      <section className="teacher-writing-topic-section">
        <header>
          <div>
            <p>Currently showing</p>
            <h2>{details.label} extra topics</h2>
          </div>
          <span>Both routes use the same task content and student accounts.</span>
        </header>

        <div className="teacher-writing-topic-grid">
          {selectedTasks.map((task) => {
            const creating = creatingKey === `${selectedPart}:${task.id}`;
            return (
              <article className="teacher-writing-topic-card" key={task.id}>
                <div className="teacher-writing-topic-number" aria-hidden="true">
                  {APTIS_WRITING_TEACHER_TOPICS.findIndex((topic) => topic.id === task.id) + 1}
                </div>
                <div className="teacher-writing-topic-copy">
                  <span>{details.label} · {details.format}</span>
                  <h3>{task.title}</h3>
                  <p>{selectedPart === 4 ? task.formalPrompt : selectedPart === 3 ? task.context : task.prompt}</p>
                </div>
                <div className="teacher-writing-topic-actions">
                  <button disabled={Boolean(creatingKey)} onClick={() => launchLive(task)} type="button">
                    {creating ? <Radio className="is-pulsing" size={17} /> : <Play size={17} />}
                    {creating ? "Creating room…" : "Run live"}
                  </button>
                  <Link to={`${details.path}?task=${encodeURIComponent(task.id)}`}>
                    <Users size={17} /> Open / assign
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
