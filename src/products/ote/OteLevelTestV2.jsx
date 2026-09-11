import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Headphones, Mail, Mic, PenLine, RotateCcw, Sparkles } from "lucide-react";
import Seo from "../../components/common/Seo.jsx";
import {
  createOteV2ResumeDraft,
  loadOteV2ResumeDraft,
  logOteLevelTestSelected,
  saveOteV2ResumeDraft,
} from "../../firebase.js";
import OteLevelTest from "./OteLevelTest.jsx";
import "./styles/ote.css";

const STORAGE_KEY = "ote-level-test-v2-draft";
const RESUME_SESSION_KEY = "ote-level-test-v2-resume-session";

const FUNNELS = [
  {
    id: "exam-candidate",
    title: "Ya tengo mi examen reservado",
    description: "Comprueba tu punto de partida, practica por tu cuenta y recibe una recomendación antes del examen.",
    label: "Preparación para el examen",
  },
  {
    id: "course-lead",
    title: "Quiero saber mi nivel",
    description: "Recibe orientación sobre tu nivel y sobre el curso de preparación que mejor encaja contigo.",
    label: "Orientación académica",
  },
];

const SKILLS = [
  { id: "grammar-vocabulary", title: "Grammar & Vocabulary", description: "La base común del test: 20 preguntas adaptativas.", Icon: BookOpen, required: true, available: true },
  { id: "speaking", title: "Speaking", description: "Tres respuestas breves grabadas y analizadas.", Icon: Mic, available: true },
  { id: "writing", title: "Writing", description: "Una tarea breve con evaluación y correcciones.", Icon: PenLine, available: true },
  { id: "reading", title: "Reading", description: "Se añadirá como módulo seleccionable en la siguiente fase.", Icon: BookOpen, available: false },
  { id: "listening", title: "Listening", description: "Se añadirá como módulo seleccionable en la siguiente fase.", Icon: Headphones, available: false },
];

function readDraft() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export default function OteLevelTestV2() {
  const storedDraft = useMemo(readDraft, []);
  const [stage, setStage] = useState("setup");
  const [funnelType, setFunnelType] = useState(storedDraft?.funnelType || "");
  const [email, setEmail] = useState(storedDraft?.email || "");
  const [selectedSkills, setSelectedSkills] = useState(storedDraft?.selectedSkills || ["grammar-vocabulary"]);
  const [emailError, setEmailError] = useState("");
  const [resumeCredentials, setResumeCredentials] = useState(null);
  const [resumeDraft, setResumeDraft] = useState(storedDraft || null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [resumeMessage, setResumeMessage] = useState("");
  const saveTimerRef = useRef(null);
  const resumeLoadedRef = useRef(false);

  useEffect(() => {
    const current = readDraft() || {};
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, funnelType, email, selectedSkills, savedAt: new Date().toISOString() }));
  }, [email, funnelType, selectedSkills]);

  useEffect(() => {
    if (resumeLoadedRef.current) return;
    resumeLoadedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get("resume") || "";
    let storedValue = "";
    try { storedValue = window.sessionStorage.getItem(RESUME_SESSION_KEY) || ""; } catch { /* session storage is optional */ }
    const resumeValue = urlValue || storedValue;
    const separator = resumeValue.indexOf(".");
    if (separator < 1) return;
    const credentials = { attemptId: resumeValue.slice(0, separator), token: resumeValue.slice(separator + 1) };
    setSaveStatus("loading");
    loadOteV2ResumeDraft(credentials).then((result) => {
      setResumeCredentials(credentials);
      setResumeDraft(result.draft);
      setFunnelType(result.draft.funnelType);
      setSelectedSkills(result.draft.selectedSkills);
      setEmail(result.email);
      setStage("test");
      setSaveStatus("saved");
      setResumeMessage("Test recuperado. Puedes continuar desde donde lo dejaste.");
      try { window.sessionStorage.setItem(RESUME_SESSION_KEY, resumeValue); } catch { /* session storage is optional */ }
      if (urlValue) {
        params.delete("resume");
        const cleanQuery = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`);
      }
    }).catch((error) => {
      console.error("[OTE V2] resume load failed", error);
      setSaveStatus("error");
      setResumeMessage("El enlace no es válido o ha caducado. Puedes empezar un test nuevo.");
    });
  }, []);

  useEffect(() => () => window.clearTimeout(saveTimerRef.current), []);

  function toggleSkill(skillId) {
    setSelectedSkills((current) => current.includes(skillId)
      ? current.filter((id) => id !== skillId)
      : [...current, skillId]);
  }

  async function startTest() {
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Introduce un email válido o deja el campo vacío.");
      return;
    }
    setEmailError("");
    setSaveStatus(trimmedEmail ? "saving" : "local");
    logOteLevelTestSelected({
      edition: "general-v2",
      source: funnelType,
      selectedSkills,
      hasEmail: Boolean(trimmedEmail),
    });
    if (trimmedEmail && !resumeCredentials) {
      try {
        const initialDraft = {
          funnelType,
          selectedSkills,
          phase: resumeDraft?.phase || "batch1",
          routeKey: resumeDraft?.routeKey || "",
          answers: resumeDraft?.answers || {},
        };
        const created = await createOteV2ResumeDraft({ email: trimmedEmail, draft: initialDraft });
        const credentials = { attemptId: created.attemptId, token: created.writeToken };
        setResumeCredentials(credentials);
        setSaveStatus("saved");
        setResumeMessage(`Te hemos enviado un enlace para continuar el test a ${trimmedEmail}.`);
      } catch (error) {
        console.error("[OTE V2] resume draft creation failed", error);
        setSaveStatus("error");
        setEmailError(error?.message || "No hemos podido enviar el enlace de continuación.");
        return;
      }
    }
    setStage("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleDraftChange = useCallback((quizDraft) => {
    const draft = { funnelType, selectedSkills, ...quizDraft };
    setResumeDraft(draft);
    try {
      const current = readDraft() || {};
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, funnelType, email, selectedSkills, ...quizDraft, savedAt: new Date().toISOString() }));
    } catch { /* local fallback is optional */ }
    if (!resumeCredentials) {
      setSaveStatus("local");
      return;
    }
    setSaveStatus("saving");
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveOteV2ResumeDraft({ ...resumeCredentials, draft }).then(() => {
        setSaveStatus("saved");
      }).catch((error) => {
        console.error("[OTE V2] autosave failed", error);
        setSaveStatus("error");
      });
    }, 700);
  }, [email, funnelType, resumeCredentials, selectedSkills]);

  if (stage === "test") {
    return (
      <>
        <div className="ote-v2-toolbar">
          <span><Sparkles size={17} aria-hidden="true" /> Test de nivel V2</span>
          <span className={`ote-v2-save-status is-${saveStatus}`} aria-live="polite">
            {saveStatus === "saving" ? "Guardando…" : saveStatus === "saved" ? "Guardado" : saveStatus === "error" ? "No se pudo guardar" : "Guardado en este navegador"}
          </span>
          <button type="button" onClick={() => setStage("setup")}><RotateCcw size={16} aria-hidden="true" /> Cambiar selección</button>
        </div>
        {resumeMessage ? <p className="ote-v2-resume-message">{resumeMessage}</p> : null}
        <OteLevelTest
          funnelType={funnelType}
          initialLeadEmail={email.trim()}
          selectedProductionSkills={selectedSkills.filter((skill) => skill === "speaking" || skill === "writing")}
          initialDraft={resumeDraft}
          onDraftChange={handleDraftChange}
          copy={{
            testEdition: "general-v2",
            seoTitle: "Test de nivel Oxford Test of English V2 | OTE Seif",
            seoDescription: "Test modular de Grammar & Vocabulary, Speaking y Writing para Oxford Test of English.",
            kicker: "Test de nivel Oxford Test of English · V2",
            heading: "Grammar & Vocabulary",
            intro: "Completa primero la base común. Después continuarás con las destrezas adicionales que hayas seleccionado.",
            reportTitle: "Informe del test de nivel Oxford Test of English V2",
            downloadFilename: "informe-nivel-oxford-test-of-english-v2.txt",
          }}
        />
      </>
    );
  }

  return (
    <main className="ote-level-test ote-level-test-v2">
      <Seo title="Test de nivel OTE V2 | Seif English" description="Configura un test de nivel OTE por destrezas." />
      <section className="ote-level-hero">
        <div><span className="ote-kicker">Versión 2 · entorno separado</span><h1>Configura tu test de nivel</h1><p>Grammar & Vocabulary es la base. Añade ahora Speaking, Writing o ambos; Reading y Listening llegarán después.</p></div>
        <div className="ote-level-meter"><strong>V2</strong><span>prueba</span></div>
      </section>

      <section className="ote-v2-section">
        <div className="ote-course-section-head"><span>Paso 1</span><h2>¿Qué necesitas?</h2></div>
        <div className="ote-level-choice-grid">
          {FUNNELS.map((funnel) => (
            <button className={`ote-level-choice-card ${funnelType === funnel.id ? "is-selected" : ""}`} key={funnel.id} type="button" onClick={() => setFunnelType(funnel.id)}>
              <span className="ote-level-choice-kicker">{funnel.label}</span><h2>{funnel.title}</h2><p>{funnel.description}</p>
              {funnelType === funnel.id ? <span className="ote-level-choice-cta"><CheckCircle2 size={18} /> Seleccionado</span> : null}
            </button>
          ))}
        </div>
      </section>

      <section className="ote-v2-section">
        <div className="ote-course-section-head"><span>Paso 2</span><h2>Elige las destrezas</h2></div>
        <div className="ote-v2-skill-grid">
          {SKILLS.map(({ id, title, description, Icon: SkillIcon, required, available }) => {
            const selected = selectedSkills.includes(id);
            return (
              <button className={`ote-v2-skill ${selected ? "is-selected" : ""}`} disabled={required || !available} key={id} onClick={() => toggleSkill(id)} type="button">
                {React.createElement(SkillIcon, { size: 24, "aria-hidden": true })}<span>{required ? "Base obligatoria" : available ? "Opcional" : "Próximamente"}</span><strong>{title}</strong><small>{description}</small>
                {selected ? <CheckCircle2 size={19} aria-label="Seleccionado" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="ote-v2-section ote-v2-email-card">
        <Mail size={24} aria-hidden="true" />
        <div><label htmlFor="ote-v2-email">Guarda el test con tu email (opcional)</label><p>Te enviaremos un enlace privado para continuar desde este u otro dispositivo. No necesitas crear una cuenta ni una contraseña.</p></div>
        <input id="ote-v2-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(""); }} placeholder="tu@email.com" />
        {emailError ? <p className="ote-production-warning">{emailError}</p> : null}
      </section>

      <div className="ote-level-cta-row ote-v2-start">
        <button className="ote-level-primary" disabled={!funnelType || saveStatus === "saving"} onClick={startTest} type="button">{saveStatus === "saving" ? "Preparando enlace…" : "Empezar test"} <ArrowRight size={18} /></button>
      </div>
    </main>
  );
}
