import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Headphones, Mail, PenLine, Sparkles, Volume2 } from "lucide-react";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const COURSE_RECOMMENDATIONS = {
  "a2-foundations": {
    cefr: "A2",
    title: "Curso A2 / Base elemental",
    shortTitle: "Ruta A2",
    promise: "Consolida la gramática esencial, el vocabulario cotidiano y la seguridad para formar frases antes de pasar a tareas de examen.",
    recommendedPackage: "foundation",
    bestFor: [
      "Entiendes inglés básico, pero dudas al formar respuestas completas.",
      "Necesitas controlar mejor los tiempos, las preguntas y frases frecuentes.",
      "Quieres una ruta práctica para llegar a una preparación B1.",
    ],
  },
  "b1-preparation": {
    cefr: "B1",
    title: "Curso de preparación B1",
    shortTitle: "Ruta B1",
    promise: "Trabaja los errores que frenan a muchos estudiantes intermedios y desarrolla más confianza en speaking y writing.",
    recommendedPackage: "four-skills",
    bestFor: [
      "Puedes comunicarte, pero algunos errores gramaticales hacen tus respuestas menos claras.",
      "Necesitas conectar mejor las frases y usar vocabulario más fiable.",
      "Quieres prepararte para tareas tipo Oxford Test of English con estructura.",
    ],
  },
  "b2-masterclass": {
    cefr: "B2",
    title: "Curso B2 / preparación Oxford Test of English",
    shortTitle: "Ruta B2",
    promise: "Convierte un nivel intermedio alto en una preparación más constante para speaking, writing, reading y listening.",
    recommendedPackage: "four-skills",
    bestFor: [
      "Puedes tratar temas complejos, pero necesitas más precisión.",
      "Quieres mejorar rango, conectores y control de errores.",
      "Buscas un buen resultado en Oxford Test of English.",
    ],
  },
  "c1-academic-track": {
    cefr: "C1",
    title: "Ruta C1 / diagnóstico avanzado",
    shortTitle: "Ruta C1",
    promise: "Perfecciona el control avanzado del idioma, la calidad de los argumentos, el rango léxico y la producción de alto nivel.",
    recommendedPackage: "advanced-four-skills",
    bestFor: [
      "Ya tienes buen rendimiento en pruebas de gramática y vocabulario.",
      "Necesitas precisión académica o profesional.",
      "Quieres una evaluación más completa antes de elegir un plan de estudio.",
    ],
  },
  "c2-mastery": {
    cefr: "C2",
    title: "Ruta de maestría / diagnóstico premium",
    shortTitle: "Ruta C2",
    promise: "Afina naturalidad, precisión idiomática y control de matiz para candidatos que ya están por encima del objetivo C1.",
    recommendedPackage: "advanced-four-skills",
    bestFor: [
      "Tu control de gramática y vocabulario avanzado ya es muy alto.",
      "Necesitas una recomendación más personalizada que una ruta B2/C1 estándar.",
      "Quieres pulir producción escrita y oral con objetivos de excelencia.",
    ],
  },
};

const LEVEL_ROUTES = [
  {
    id: "general",
    label: "Oxford Test of English",
    levels: "A2 - B1 - B2",
    examPrice: 130,
    courseExamPrice: 309,
    description: "La ruta adecuada si tu objetivo está entre A2 y B2 o si todavía no tienes claro tu nivel exacto.",
    note: "También podemos orientar la versión for Schools si encaja mejor.",
  },
  {
    id: "advanced",
    label: "Oxford Test of English Advanced",
    levels: "B2 - C1",
    examPrice: 140,
    courseExamPrice: 319,
    description: "La ruta adecuada si necesitas C1, ya estás cómodo/a con B2 o vienes de una recomendación avanzada.",
    note: "Ideal para perfiles que necesitan producción oral y escrita de nivel alto.",
  },
];

const TRAINER_ADD_ON_PRICE = 10;
const COURSE_MODULE_PRICE = 50;
const EXAM_MODULE_PRICE = 55;

const PURCHASE_PATHS = [
  {
    id: "course-exam",
    title: "Curso + examen",
    summary: "Preparación guiada y compra del examen cuando estés listo/a.",
  },
  {
    id: "course",
    title: "Solo curso",
    summary: "Preparación sin comprar todavía una fecha de examen.",
  },
  {
    id: "exam",
    title: "Solo examen",
    summary: "Compra del examen si ya tienes claro que quieres presentarte.",
  },
];

const COURSE_SCOPES = [
  {
    id: "four-skills",
    title: "Curso completo",
    summary: "Preparación integrada de las cuatro skills principales.",
    priceLabel: "Consultar precio",
    includes: ["Speaking", "Writing", "Reading", "Listening"],
  },
  {
    id: "individual",
    title: "Skills individuales",
    summary: "Elige solo las áreas que quieres preparar.",
    priceLabel: "Consultar precio",
    includes: ["Speaking", "Writing", "Reading", "Listening"],
  },
];

const SKILL_PACKAGES = [
  { id: "speaking", title: "Speaking", icon: Volume2, summary: "Práctica oral, fluidez, estructura de respuestas y feedback." },
  { id: "writing", title: "Writing", icon: PenLine, summary: "Emails, essays, register, organización y corrección personalizada." },
  { id: "reading", title: "Reading", icon: BookOpen, summary: "Estrategias de lectura, timing, comprensión global y preguntas de detalle." },
  { id: "listening", title: "Listening", icon: Headphones, summary: "Comprensión oral, toma de notas, distractores y gestión del tiempo." },
];

export default function OteCourseLanding({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const { courseId = "b1-preparation" } = useParams();
  const [searchParams] = useSearchParams();
  const course = COURSE_RECOMMENDATIONS[courseId] || COURSE_RECOMMENDATIONS["b1-preparation"];
  const recommendedLevelRoute = ["c1-academic-track", "c2-mastery"].includes(courseId) ? "advanced" : "general";
  const [levelRoute, setLevelRoute] = useState(searchParams.get("route") || recommendedLevelRoute);
  const [purchasePath, setPurchasePath] = useState(searchParams.get("buy") || "");
  const [courseScope, setCourseScope] = useState(course.recommendedPackage === "foundation" ? "individual" : "four-skills");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [trainerAccess, setTrainerAccess] = useState(false);
  const levelTestPath = getSitePath(nativeRoutes ? "/level-test" : "/ote/level-test");
  const homePath = getSitePath(nativeRoutes ? "/" : "/ote");
  const selectedRoute = LEVEL_ROUTES.find((item) => item.id === levelRoute) || LEVEL_ROUTES[0];
  const includesExam = purchasePath === "course-exam" || purchasePath === "exam";
  const includesCourse = purchasePath === "course-exam" || purchasePath === "course";
  const needsScopeChoice = includesCourse || includesExam;
  const trainerIncludedWithCourse = includesCourse;
  const trainerAddOnSelected = includesExam && !trainerIncludedWithCourse && trainerAccess;
  const trainerPrice = trainerAddOnSelected ? TRAINER_ADD_ON_PRICE : 0;
  const courseOnlyPrice = selectedRoute.courseExamPrice - selectedRoute.examPrice;
  const courseBasePrice = courseScope === "individual" ? selectedSkills.length * COURSE_MODULE_PRICE : courseOnlyPrice;
  const examBasePrice = courseScope === "individual" ? selectedSkills.length * EXAM_MODULE_PRICE : selectedRoute.examPrice;
  const totalPrice = courseScope === "four-skills" && purchasePath === "course-exam"
    ? selectedRoute.courseExamPrice
    : (includesCourse ? courseBasePrice : 0) + (includesExam ? examBasePrice : 0) + trainerPrice;
  const needsSkillSelection = needsScopeChoice && courseScope === "individual";
  const canContinue = !!purchasePath && (!needsSkillSelection || selectedSkills.length > 0);
  const selectedSkillLabels = useMemo(
    () => SKILL_PACKAGES.filter((skill) => selectedSkills.includes(skill.id)).map((skill) => skill.title),
    [selectedSkills],
  );
  const scopeLabel = courseScope === "four-skills"
    ? includesExam && !includesCourse ? "Examen completo" : "Curso completo"
    : includesExam && !includesCourse ? "Módulos individuales" : "Skills individuales";
  const contactSubject = [
    `OTE ${selectedRoute.label}`,
    purchasePath ? PURCHASE_PATHS.find((item) => item.id === purchasePath)?.title : "orientación",
    needsScopeChoice ? scopeLabel : "",
  ].filter(Boolean).join(" - ");
  const contactHref = `mailto:nicholas@beeskillsenglish.com?subject=${encodeURIComponent(contactSubject)}`;

  function toggleSkill(skillId) {
    setSelectedSkills((current) => {
      if (current.includes(skillId)) {
        return current.filter((id) => id !== skillId);
      }
      return [...current, skillId];
    });
  }

  function choosePurchasePath(nextPath) {
    setPurchasePath(nextPath);
    setTrainerAccess(false);
  }

  return (
    <main className="ote-course-landing">
      <Seo title={`${course.title} | OTE Seif`} description={course.promise} />

      <section className="ote-course-hero">
        <span className="ote-kicker">Oxford Test of English | {course.cefr}</span>
        <h1>Tu siguiente paso para Oxford Test of English</h1>
        <p>{course.promise}</p>
        <div className="ote-course-recommendation">
          <Sparkles size={20} aria-hidden="true" />
          <div>
            <strong>Recomendación del test: {course.title}</strong>
            <span>Te guiamos paso a paso para elegir curso, examen o una combinación de ambos.</span>
          </div>
        </div>
        <div className="ote-course-actions">
          <a className="ote-level-primary" href={contactHref}>
            Solicitar orientación
            <Mail size={18} aria-hidden="true" />
          </a>
          <button className="ote-level-secondary" type="button" onClick={() => navigate(levelTestPath)}>
            Repetir test de nivel
          </button>
        </div>
      </section>

      <section className="ote-course-section ote-adventure-panel">
        <div className="ote-course-section-head">
          <span>Elige tu ruta</span>
          <h2>Construye tu opción</h2>
        </div>

        <div className="ote-adventure-step">
          <div className="ote-adventure-step-head">
            <span>1</span>
            <div>
              <h3>¿Necesitas la ruta general o avanzada?</h3>
              <p>La recomendación inicial viene del test, pero puedes cambiarla.</p>
            </div>
          </div>
          <div className="ote-adventure-choice-grid">
            {LEVEL_ROUTES.map((item) => (
              <button
                className={`ote-adventure-choice ${levelRoute === item.id ? "is-selected" : ""}`}
                key={item.id}
                type="button"
                onClick={() => setLevelRoute(item.id)}
              >
                <span>{item.id === recommendedLevelRoute ? "Recomendado" : "Ruta disponible"}</span>
                <strong>{item.label}</strong>
                <b>{item.levels}</b>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="ote-adventure-step">
          <div className="ote-adventure-step-head">
            <span>2</span>
            <div>
              <h3>¿Quieres curso, examen o las dos cosas?</h3>
              <p>El curso completo incluye acceso al trainer de Speaking & Writing. Si compras solo el examen, puedes añadirlo por {TRAINER_ADD_ON_PRICE}€.</p>
            </div>
          </div>
          <div className="ote-adventure-choice-grid">
            {PURCHASE_PATHS.map((item) => (
              <button
                className={`ote-adventure-choice ${purchasePath === item.id ? "is-selected" : ""}`}
                key={item.id}
                type="button"
                onClick={() => choosePurchasePath(item.id)}
              >
                <strong>{item.title}</strong>
                <small>{item.summary}</small>
              </button>
            ))}
          </div>
        </div>

        {needsScopeChoice ? (
          <div className="ote-adventure-step">
            <div className="ote-adventure-step-head">
              <span>3</span>
              <div>
                <h3>{includesCourse ? "¿Curso completo o skills concretas?" : "¿Examen completo o módulos concretos?"}</h3>
                <p>
                  {includesCourse
                    ? "Puedes preparar todas las skills o centrarte en lo que más necesitas."
                    : "Puedes comprar el examen completo o solo los módulos que necesitas repetir."}
                </p>
              </div>
            </div>
            <div className="ote-adventure-choice-grid">
              {COURSE_SCOPES.map((item) => (
                <button
                  className={`ote-adventure-choice ${courseScope === item.id ? "is-selected" : ""}`}
                  key={item.id}
                  type="button"
                  onClick={() => setCourseScope(item.id)}
                >
                  <strong>
                    {item.id === "four-skills"
                      ? includesCourse ? "Curso completo" : "Examen completo"
                      : includesCourse ? "Skills individuales" : "Módulos individuales"}
                  </strong>
                  <small>
                    {item.id === "four-skills"
                      ? includesCourse
                        ? "Preparación integrada de speaking, writing, reading y listening. 16 horas de clase en 4 semanas."
                        : `${selectedRoute.label}: ${selectedRoute.levels}.`
                      : includesCourse
                        ? "Elige solo las skills que quieres preparar."
                        : "Elige los módulos de examen que quieres comprar."}
                  </small>
                  <em>
                    {item.id === "four-skills" && purchasePath === "course-exam"
                      ? `${selectedRoute.courseExamPrice}€ curso + tasas`
                      : item.id === "four-skills" && includesExam
                        ? `${selectedRoute.examPrice}€ tasas examen`
                        : item.id === "four-skills" && includesCourse
                          ? `${courseOnlyPrice}€ curso`
                          : item.id === "individual" && includesExam && includesCourse
                            ? `${COURSE_MODULE_PRICE + EXAM_MODULE_PRICE}€ por skill + módulo`
                            : item.id === "individual" && includesExam
                              ? `${EXAM_MODULE_PRICE}€ por módulo`
                              : item.id === "individual" && includesCourse
                                ? `${COURSE_MODULE_PRICE}€ por skill`
                                : item.priceLabel}
                  </em>
                </button>
              ))}
            </div>
            {courseScope === "individual" ? (
              <div className="ote-adventure-skill-grid" aria-label="Elige skills individuales">
                {SKILL_PACKAGES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedSkills.includes(item.id);
                  return (
                    <button
                      className={`ote-adventure-skill ${isSelected ? "is-selected" : ""}`}
                      key={item.id}
                      type="button"
                      onClick={() => toggleSkill(item.id)}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <strong>{item.title}</strong>
                      <small>{item.summary}</small>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {includesCourse ? (
              <div className="ote-trainer-included-note">
                <Sparkles size={18} aria-hidden="true" />
                <div>
                  <strong>Speaking & Writing Trainer incluido</strong>
                  <span>Todos los cursos incluyen automáticamente el acceso digital de práctica para speaking y writing.</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {includesExam && !trainerIncludedWithCourse ? (
          <div className="ote-adventure-step">
            <div className="ote-adventure-step-head">
              <span>4</span>
              <div>
                <h3>Añadir Speaking & Writing Trainer</h3>
                <p>Opcional para compras de examen o cursos por skills individuales. Por ahora se centra en speaking y writing.</p>
              </div>
            </div>
            <button
              className={`ote-trainer-toggle ${trainerAccess ? "is-selected" : ""}`}
              type="button"
              aria-pressed={trainerAccess}
              onClick={() => setTrainerAccess((current) => !current)}
            >
              <span>{trainerAccess ? "Incluido" : "No incluido"}</span>
              <strong>Speaking & Writing Trainer</strong>
              <b>+{TRAINER_ADD_ON_PRICE}€</b>
            </button>
          </div>
        ) : null}

        <div className="ote-adventure-summary">
          <div>
            <span>Tu selección</span>
            <h3>{selectedRoute.label}</h3>
            <p>{selectedRoute.levels}. {selectedRoute.note}</p>
          </div>
          <dl>
            <div>
              <dt>Compra</dt>
              <dd>{purchasePath ? PURCHASE_PATHS.find((item) => item.id === purchasePath)?.title : "Elige una opción"}</dd>
            </div>
            {includesCourse ? (
            <div>
              <dt>Curso</dt>
                  <dd>
                    {courseScope === "four-skills"
                  ? includesExam
                    ? `Todas las skills + Speaking & Writing Trainer (${selectedRoute.courseExamPrice}€, tasas incluidas)`
                    : `Todas las skills + Speaking & Writing Trainer (${courseBasePrice}€, sin tasas de examen)`
                  : selectedSkillLabels.length
                    ? `${selectedSkillLabels.join(", ")} + Speaking & Writing Trainer (${courseBasePrice}€)`
                    : "Elige al menos una skill"}
                  </dd>
            </div>
            ) : null}
            {includesExam ? (
              <div>
                <dt>Examen</dt>
                <dd>
                  {courseScope === "four-skills" && includesCourse
                    ? `Tasas incluidas (${selectedRoute.examPrice}€)`
                    : courseScope === "four-skills"
                      ? `${selectedRoute.examPrice}€ tasas examen`
                      : selectedSkills.length
                        ? `${examBasePrice}€ (${selectedSkills.length} módulos)`
                        : "Elige al menos un módulo"}
                  {trainerAddOnSelected ? ` + ${TRAINER_ADD_ON_PRICE}€ trainer` : ""}
                </dd>
              </div>
            ) : null}
          </dl>
          <strong className="ote-adventure-price">
            {purchasePath ? needsSkillSelection && selectedSkills.length === 0 ? "Elige skills" : `${totalPrice}€` : "Elige una opción"}
          </strong>
          <a className={`ote-level-primary ${canContinue ? "" : "is-disabled"}`} href={canContinue ? contactHref : undefined} aria-disabled={!canContinue}>
            Continuar
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="ote-course-fit">
        <h2>Esta ruta encaja contigo si...</h2>
        <div className="ote-course-fit-list">
          {course.bestFor.map((item) => (
            <article key={item}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <button className="ote-level-secondary" type="button" onClick={() => navigate(homePath)}>
        Volver a OTE
      </button>
    </main>
  );
}
