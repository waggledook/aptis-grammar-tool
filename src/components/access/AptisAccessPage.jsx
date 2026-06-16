import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { sendHubAccessRequest } from "../../firebase";
import { toast } from "../../utils/toast";
import { APTIS_COURSE_URL } from "./aptisAccessLinks.js";

export default function AptisAccessPage({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const hasFullAccess = !!aptisAccess?.hasFullAccess;

  async function handleRequestAccess() {
    if (!user) {
      onSignIn?.();
      return;
    }

    if (sending) return;
    setSending(true);

    try {
      await sendHubAccessRequest({
        site: "aptis-trainer",
        note: "Student requested Aptis Trainer access from the Spanish access page.",
      });
      toast(
        user?.email
          ? `Solicitud enviada. Hemos mandado una copia a ${user.email}.`
          : "Solicitud enviada. Revisaremos tu acceso a Aptis Trainer."
      );
    } catch (err) {
      console.error("Aptis access request failed:", err);
      toast("No se ha podido enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="aptis-access-page">
      <Seo
        title="Acceso a Aptis Trainer | Seif English Academy"
        description="Pide acceso a Aptis Trainer si ya estás apuntado a un curso de Seif English, o consulta los cursos de preparación Aptis."
      />

      <section className="aptis-access-hero">
        <h1>Acceso a la plataforma</h1>
        <p>
          Aptis Trainer está incluido para estudiantes con acceso activo. Si ya estás
          en un curso de Seif English, puedes pedir que activemos tu cuenta.
        </p>
      </section>

      <div className="aptis-access-grid">
        <article className="aptis-access-panel">
          <span className="aptis-access-panel-label">Ya soy estudiante</span>
          <h2>¿Ya estás apuntado/a a un curso con Seif English?</h2>
          <p>
            Pide acceso y revisaremos tu cuenta. Si tu matrícula o curso incluye
            Aptis Trainer, activaremos el acceso lo antes posible.
          </p>

          {hasFullAccess ? (
            <button className="aptis-access-primary" type="button" onClick={() => navigate("/grammar/aptis")}>
              Ir a practicar
            </button>
          ) : (
            <button className="aptis-access-primary" type="button" onClick={handleRequestAccess} disabled={sending}>
              {!user ? "Iniciar sesión para pedir acceso" : sending ? "Enviando..." : "Pedir acceso"}
            </button>
          )}

          {!user && (
            <p className="aptis-access-small">
              Necesitamos que inicies sesión para asociar la solicitud a tu cuenta.
            </p>
          )}
        </article>

        <article className="aptis-access-panel">
          <span className="aptis-access-panel-label">Quiero información</span>
          <h2>¿Aún no estás apuntado/a?</h2>
          <p>
            Consulta la información sobre los cursos de preparación Aptis de Seif
            English Academy y contacta con la escuela para conocer las opciones
            disponibles.
          </p>

          <a className="aptis-access-secondary" href={APTIS_COURSE_URL} target="_blank" rel="noopener noreferrer">
            Ver cursos de Aptis
            <span aria-hidden="true">→</span>
          </a>
        </article>
      </div>
    </main>
  );
}
