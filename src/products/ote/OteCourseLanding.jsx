import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Mail, Sparkles } from "lucide-react";
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

const PURCHASE_PATHS = [
  {
    id: "course-exam",
    title: "Curso + examen",
    summary: "Preparación guiada y compra del examen cuando estés listo/a.",
  },
  {
    id: "exam",
    title: "Solo examen",
    summary: "Compra del examen si ya tienes claro que quieres presentarte.",
  },
];

const PRODUCT_OPTIONS = {
  "course-exam": [
    {
      id: "full",
      title: "Curso completo + examen completo",
      summary: "Preparación de speaking, writing, reading y listening con las tasas del examen completo.",
      quantityLabel: "4 skills",
      priceType: "courseExamPrice",
      slug: "course-exam/full",
    },
    {
      id: "1-skill",
      title: "1 skill + 1 módulo de examen",
      summary: "Compra una skill de preparación y el módulo de examen correspondiente. La skill se elige en la página de producto.",
      quantityLabel: "1 skill",
      price: 105,
      slug: "course-exam/1-skill",
    },
    {
      id: "2-skills",
      title: "2 skills + 2 módulos de examen",
      summary: "Compra dos skills de preparación y sus módulos de examen. Las skills se eligen en la página de producto.",
      quantityLabel: "2 skills",
      price: 210,
      slug: "course-exam/2-skills",
    },
  ],
  exam: [
    {
      id: "full",
      title: "Examen completo",
      summary: "Compra el Oxford Test of English completo para la ruta seleccionada.",
      quantityLabel: "4 módulos",
      priceType: "examPrice",
      slug: "exam-only/full",
    },
    {
      id: "1-module",
      title: "1 módulo de examen",
      summary: "Compra un módulo del examen. El módulo exacto se elige en la página de producto.",
      quantityLabel: "1 módulo",
      price: 55,
      slug: "exam-only/1-module",
    },
    {
      id: "2-modules",
      title: "2 módulos de examen",
      summary: "Compra dos módulos del examen. Los módulos exactos se eligen en la página de producto.",
      quantityLabel: "2 módulos",
      price: 110,
      slug: "exam-only/2-modules",
    },
  ],
};

function getProductPrice(option, route) {
  if (!option) return 0;
  if (option.priceType === "courseExamPrice") return route.courseExamPrice;
  if (option.priceType === "examPrice") return route.examPrice;
  return option.price;
}

function getProductSlug(routeId, option) {
  return option ? `${routeId}/${option.slug}` : "";
}

export default function OteCourseLanding({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const { courseId = "b1-preparation" } = useParams();
  const [searchParams] = useSearchParams();
  const course = COURSE_RECOMMENDATIONS[courseId] || COURSE_RECOMMENDATIONS["b1-preparation"];
  const recommendedLevelRoute = ["c1-academic-track", "c2-mastery"].includes(courseId) ? "advanced" : "general";
  const requestedPurchasePath = searchParams.get("buy") || "";
  const initialPurchasePath = PURCHASE_PATHS.some((item) => item.id === requestedPurchasePath) ? requestedPurchasePath : "";
  const requestedProduct = searchParams.get("product") || "";
  const initialProductOption = PRODUCT_OPTIONS[initialPurchasePath]?.some((item) => item.id === requestedProduct) ? requestedProduct : "";
  const [levelRoute, setLevelRoute] = useState(searchParams.get("route") || recommendedLevelRoute);
  const [purchasePath, setPurchasePath] = useState(initialPurchasePath);
  const [productOption, setProductOption] = useState(initialProductOption);
  const levelTestPath = getSitePath(nativeRoutes ? "/level-test" : "/ote/level-test");
  const homePath = getSitePath(nativeRoutes ? "/" : "/ote");
  const selectedRoute = LEVEL_ROUTES.find((item) => item.id === levelRoute) || LEVEL_ROUTES[0];
  const includesCourse = purchasePath === "course-exam";
  const currentProductOptions = PRODUCT_OPTIONS[purchasePath] || [];
  const selectedProduct = currentProductOptions.find((item) => item.id === productOption) || null;
  const totalPrice = getProductPrice(selectedProduct, selectedRoute);
  const productSlug = getProductSlug(levelRoute, selectedProduct);
  const canContinue = !!selectedProduct;
  const contactSubject = [
    `OTE ${selectedRoute.label}`,
    purchasePath ? PURCHASE_PATHS.find((item) => item.id === purchasePath)?.title : "orientación",
    selectedProduct?.title || "",
    productSlug,
  ].filter(Boolean).join(" - ");
  const contactHref = `mailto:nicholas@beeskillsenglish.com?subject=${encodeURIComponent(contactSubject)}`;

  function choosePurchasePath(nextPath) {
    setPurchasePath(nextPath);
    setProductOption("");
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
            <span>Te guiamos paso a paso para elegir curso con examen o solo examen.</span>
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
              <h3>¿Quieres curso y examen, o solo examen?</h3>
              <p>Actualmente ofrecemos la preparación junto con el examen, o la compra del examen si ya tienes claro que quieres presentarte.</p>
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

        {purchasePath ? (
          <div className="ote-adventure-step">
            <div className="ote-adventure-step-head">
              <span>3</span>
              <div>
                <h3>{includesCourse ? "Elige el tamaño del producto" : "Elige cuántos módulos necesitas"}</h3>
                <p>
                  {includesCourse
                    ? "Aquí solo eliges la cantidad. En la página de producto podrás elegir speaking, writing, reading o listening."
                    : "Aquí solo eliges la cantidad. En la página de producto podrás indicar qué módulo o módulos necesitas."}
                </p>
              </div>
            </div>
            <div className="ote-adventure-choice-grid">
              {currentProductOptions.map((item) => (
                <button
                  className={`ote-adventure-choice ${productOption === item.id ? "is-selected" : ""}`}
                  key={item.id}
                  type="button"
                  onClick={() => setProductOption(item.id)}
                >
                  <span>{item.quantityLabel}</span>
                  <strong>{item.title}</strong>
                  <small>{item.summary}</small>
                  <em>{getProductPrice(item, selectedRoute)}€</em>
                </button>
              ))}
            </div>
            {includesCourse ? (
              <div className="ote-trainer-included-note">
                <Sparkles size={18} aria-hidden="true" />
                <div>
                  <strong>Speaking & Writing Trainer incluido</strong>
                  <span>Los productos con curso incluyen automáticamente el acceso digital de práctica para speaking y writing.</span>
                </div>
              </div>
            ) : null}
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
            {selectedProduct ? (
              <div>
                <dt>Producto</dt>
                <dd>{selectedProduct.title}</dd>
              </div>
            ) : null}
            {selectedProduct ? (
              <div>
                <dt>Producto web</dt>
                <dd>{productSlug}</dd>
              </div>
            ) : null}
          </dl>
          <strong className="ote-adventure-price">
            {selectedProduct ? `${totalPrice}€` : purchasePath ? "Elige producto" : "Elige una opción"}
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
