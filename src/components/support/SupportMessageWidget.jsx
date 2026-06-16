import React, { useMemo, useState } from "react";
import { HelpCircle, MessageCircle, Send, X } from "lucide-react";
import { sendSupportMessage } from "../../firebase";
import { toast } from "../../utils/toast";

const LANGUAGE_STORAGE_KEY = "supportMessageLanguage";

const COPY = {
  en: {
    button: "Ask a question",
    title: "Ask a question",
    subtitle: "Send a message to the Seif team. We will reply by email when possible.",
    category: "Topic",
    message: "Message",
    placeholder: "Write your question or request here...",
    includePage: "Include the current page",
    send: "Send message",
    sending: "Sending...",
    success: "Message sent. We will get back to you as soon as possible.",
    empty: "Write a short message before sending.",
    error: "Sorry, we could not send that message. Please try again.",
  },
  es: {
    button: "Enviar consulta",
    title: "Enviar consulta",
    subtitle: "Manda un mensaje al equipo de Seif. Te responderemos por email cuando sea posible.",
    category: "Tema",
    message: "Mensaje",
    placeholder: "Escribe aquí tu pregunta o solicitud...",
    includePage: "Incluir la página actual",
    send: "Enviar mensaje",
    sending: "Enviando...",
    success: "Mensaje enviado. Te responderemos lo antes posible.",
    empty: "Escribe un mensaje breve antes de enviarlo.",
    error: "No se ha podido enviar el mensaje. Inténtalo de nuevo.",
  },
};

const CATEGORIES = [
  {
    key: "exam_question",
    labels: {
      en: "Aptis exam question",
      es: "Pregunta sobre Aptis",
    },
  },
  {
    key: "technical_problem",
    labels: {
      en: "Technical problem",
      es: "Problema técnico",
    },
  },
  {
    key: "platform_access",
    labels: {
      en: "Platform access",
      es: "Acceso a la plataforma",
    },
  },
  {
    key: "course_question",
    labels: {
      en: "My course",
      es: "Mi curso",
    },
  },
  {
    key: "request",
    labels: {
      en: "Request",
      es: "Solicitud",
    },
  },
  {
    key: "other",
    labels: {
      en: "Other",
      es: "Otra consulta",
    },
  },
];

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  return window.navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}

export default function SupportMessageWidget({ user, site = "aptis", hidden = false }) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(getInitialLanguage);
  const [category, setCategory] = useState("exam_question");
  const [message, setMessage] = useState("");
  const [includePage, setIncludePage] = useState(true);
  const [sending, setSending] = useState(false);

  const copy = COPY[language];
  const selectedCategory = useMemo(
    () => CATEGORIES.find((item) => item.key === category) || CATEGORIES[0],
    [category]
  );

  if (!user || hidden) return null;

  function chooseLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      toast(copy.empty);
      return;
    }

    setSending(true);
    try {
      await sendSupportMessage({
        language,
        category,
        categoryLabel: selectedCategory.labels[language],
        message: trimmed,
        includePage,
        route: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
        url: typeof window !== "undefined" ? window.location.href : "",
        site,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      });
      setMessage("");
      setOpen(false);
      toast(copy.success, { duration: 2600 });
    } catch (error) {
      console.error("Support message failed:", error);
      toast(copy.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`support-widget ${open ? "is-open" : ""}`}>
      {open ? (
        <section className="support-panel" aria-label={copy.title}>
          <div className="support-panel-head">
            <div>
              <h2>{copy.title}</h2>
              <p>{copy.subtitle}</p>
            </div>
            <button className="support-icon-btn" type="button" onClick={() => setOpen(false)} aria-label="Close">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="support-language-toggle" role="group" aria-label="Message language">
            <button
              type="button"
              className={language === "en" ? "is-selected" : ""}
              onClick={() => chooseLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <button
              type="button"
              className={language === "es" ? "is-selected" : ""}
              onClick={() => chooseLanguage("es")}
              aria-pressed={language === "es"}
            >
              ES
            </button>
          </div>

          <form className="support-form" onSubmit={handleSubmit}>
            <label>
              <span>{copy.category}</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.labels[language]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{copy.message}</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={copy.placeholder}
                rows={5}
                maxLength={1200}
              />
            </label>

            <label className="support-checkbox">
              <input
                type="checkbox"
                checked={includePage}
                onChange={(event) => setIncludePage(event.target.checked)}
              />
              <span>{copy.includePage}</span>
            </label>

            <button className="support-submit" type="submit" disabled={sending}>
              <Send size={16} aria-hidden="true" />
              {sending ? copy.sending : copy.send}
            </button>
          </form>
        </section>
      ) : (
        <button className="support-launcher" type="button" onClick={() => setOpen(true)}>
          <MessageCircle size={18} aria-hidden="true" />
          <span>{copy.button}</span>
          <HelpCircle className="support-launcher-help" size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
