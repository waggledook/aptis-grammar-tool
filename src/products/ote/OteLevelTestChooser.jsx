import React from "react";
import { ArrowRight, CheckCircle2, Gauge, GraduationCap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteLevelTestSelected } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

export default function OteLevelTestChooser({ nativeRoutes = false }) {
  const generalPath = getSitePath(nativeRoutes ? "/level-test/general" : "/ote/level-test/general");
  const advancedPath = getSitePath(nativeRoutes ? "/level-test/advanced" : "/ote/level-test/advanced");

  return (
    <main className="ote-level-test">
      <Seo
        title="Test de nivel Oxford Test of English | OTE Seif"
        description="Elige el test de nivel adecuado para Oxford Test of English: general o avanzado."
      />

      <section className="ote-level-hero">
        <div>
          <span className="ote-kicker">Test de nivel Oxford Test of English</span>
          <h1>Elige el test que mejor encaja contigo</h1>
          <p>
            Elige una ruta según tu objetivo. No necesitas una cuenta para empezar.
          </p>
        </div>
        <div className="ote-level-meter" aria-label="Dos rutas disponibles">
          <strong>2</strong>
          <span>rutas</span>
        </div>
      </section>

      <section className="ote-level-choice-grid" aria-label="Opciones de test de nivel">
        <Link
          className="ote-level-choice-card"
          to={generalPath}
          onClick={() => logOteLevelTestSelected({ edition: "general", targetPath: generalPath })}
        >
          <div className="ote-level-choice-head">
            <span className="ote-level-choice-icon">
              <Gauge size={24} aria-hidden="true" />
            </span>
            <span className="ote-level-choice-kicker">
              Ruta general
              <span className="ote-level-choice-pill">Si tienes dudas</span>
            </span>
          </div>
          <h2>No sé exactamente mi nivel</h2>
          <p>Para estudiantes que quieren orientación inicial o están entre A2 y B2.</p>
          <ul>
            <li>Resultado orientativo A2-C1</li>
            <li>Speaking y writing opcionales</li>
          </ul>
          <span className="ote-level-choice-cta">
            Empezar test general
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>

        <Link
          className="ote-level-choice-card"
          to={advancedPath}
          onClick={() => logOteLevelTestSelected({ edition: "advanced", targetPath: advancedPath })}
        >
          <div className="ote-level-choice-head">
            <span className="ote-level-choice-icon">
              <GraduationCap size={24} aria-hidden="true" />
            </span>
            <span className="ote-level-choice-kicker">Ruta avanzada</span>
          </div>
          <h2>Necesito C1 o ya tengo un nivel alto</h2>
          <p>Para estudiantes que preparan OTE Advanced o ya se sienten cómodos con B2.</p>
          <ul>
            <li>Resultado orientativo B1-C2</li>
            <li>Speaking y writing avanzados</li>
          </ul>
          <span className="ote-level-choice-cta">
            Empezar test avanzado
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>
      </section>

      <section className="ote-level-route-card ote-level-choice-recommendation">
        <div className="ote-level-recommendation-icon">
          <Target size={26} aria-hidden="true" />
        </div>
        <div>
          <span>Recomendación rápida</span>
          <strong>Si no lo tienes claro, empieza por el test general.</strong>
          <div className="ote-level-choice-note">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>Si tu resultado es alto, te mandaremos directamente a la ruta avanzada.</span>
          </div>
        </div>
        <Link
          className="ote-level-choice-mini-cta"
          to={generalPath}
          onClick={() => logOteLevelTestSelected({ edition: "general", targetPath: generalPath, source: "recommendation" })}
        >
          Empezar por aquí
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
