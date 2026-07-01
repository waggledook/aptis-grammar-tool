import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const OTE_COURSE_LANDINGS = {
  "a2-foundations": {
    cefr: "A2",
    title: "Curso A2 / Base elemental",
    promise: "Consolida la gramática esencial, el vocabulario cotidiano y la seguridad para formar frases antes de pasar a tareas de examen.",
    bestFor: [
      "Entiendes inglés básico, pero dudas al formar respuestas completas.",
      "Necesitas controlar mejor los tiempos, las preguntas y frases frecuentes.",
      "Quieres una ruta práctica para llegar a una preparación B1.",
    ],
  },
  "b1-preparation": {
    cefr: "B1",
    title: "Curso de preparación B1",
    promise: "Trabaja los errores que frenan a muchos estudiantes intermedios y desarrolla más confianza en speaking y writing.",
    bestFor: [
      "Puedes comunicarte, pero algunos errores gramaticales hacen tus respuestas menos claras.",
      "Necesitas conectar mejor las frases y usar vocabulario más fiable.",
      "Quieres prepararte para tareas tipo Oxford Test of English con estructura.",
    ],
  },
  "b2-masterclass": {
    cefr: "B2",
    title: "Curso B2 / preparación Oxford Test of English",
    promise: "Convierte un nivel intermedio alto en una preparación más constante para speaking, writing y Use of English.",
    bestFor: [
      "Puedes tratar temas complejos, pero necesitas más precisión.",
      "Quieres mejorar rango, conectores y control de errores.",
      "Buscas un buen resultado en Oxford Test of English.",
    ],
  },
  "c1-academic-track": {
    cefr: "C1",
    title: "Ruta C1 / diagnóstico avanzado",
    promise: "Perfecciona el control avanzado del idioma, la calidad de los argumentos, el rango léxico y la producción de alto nivel.",
    bestFor: [
      "Ya tienes buen rendimiento en pruebas de gramática y vocabulario.",
      "Necesitas precisión académica o profesional.",
      "Quieres una evaluación más completa antes de elegir un plan de estudio.",
    ],
  },
  "c2-mastery": {
    cefr: "C2",
    title: "Ruta de maestría / diagnóstico premium",
    promise: "Afina naturalidad, precisión idiomática y control de matiz para candidatos que ya están por encima del objetivo C1.",
    bestFor: [
      "Tu control de gramática y vocabulario avanzado ya es muy alto.",
      "Necesitas una recomendación más personalizada que una ruta B2/C1 estándar.",
      "Quieres pulir producción escrita y oral con objetivos de excelencia.",
    ],
  },
};

export default function OteCourseLanding({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const { courseId = "b1-preparation" } = useParams();
  const course = OTE_COURSE_LANDINGS[courseId] || OTE_COURSE_LANDINGS["b1-preparation"];
  const levelTestPath = getSitePath(nativeRoutes ? "/level-test" : "/ote/level-test");
  const homePath = getSitePath(nativeRoutes ? "/" : "/ote");

  return (
    <main className="ote-course-landing">
      <Seo title={`${course.title} | OTE Seif`} description={course.promise} />

      <section className="ote-course-hero">
        <span className="ote-kicker">Ruta recomendada | {course.cefr}</span>
        <h1>{course.title}</h1>
        <p>{course.promise}</p>
        <div className="ote-course-actions">
          <button className="ote-level-primary" type="button">
            Solicitar información
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button className="ote-level-secondary" type="button" onClick={() => navigate(levelTestPath)}>
            Repetir test de nivel
          </button>
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
