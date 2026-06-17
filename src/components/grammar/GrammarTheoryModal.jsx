import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function GrammarTheoryModal({ theory, onClose }) {
  useEffect(() => {
    if (!theory) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, theory]);

  if (!theory) return null;

  return (
    <div className="grammar-theory-backdrop" role="presentation" onClick={onClose}>
      <section
        className="grammar-theory-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grammar-theory-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="grammar-theory-close"
          onClick={onClose}
          aria-label="Close grammar theory"
          title="Close"
        >
          <X size={20} />
        </button>

        <div className="grammar-theory-hero">
          <span className="grammar-theory-kicker">Grammar notes</span>
          <h2 id="grammar-theory-title">{theory.title}</h2>
          <p>{theory.subtitle}</p>
        </div>

        <div className="grammar-theory-content">
          <section className="grammar-theory-lead">
            <p>{theory.intro}</p>
            <div className="grammar-theory-example-strip">
              {theory.examples.map((example) => (
                <span key={example}>{example}</span>
              ))}
            </div>
            {theory.focus && <p className="grammar-theory-focus">{theory.focus}</p>}
          </section>

          <div className="grammar-theory-sections">
            {theory.sections.map((section) => (
              <article className="grammar-theory-section" key={section.title}>
                <h3>{section.title}</h3>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {section.examples?.length ? (
                  <div className="grammar-theory-examples">
                    {section.examples.map((example) => (
                      <div className="grammar-theory-example" key={`${section.title}-${example.label}-${example.text}`}>
                        <span>{example.label}</span>
                        <strong>{example.text}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                {section.table ? (
                  <table className="grammar-theory-table">
                    <thead>
                      <tr>
                        {section.table.headers.map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join(":")}>
                          {row.map((cell) => (
                            <td key={cell}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}

                {section.chips?.length ? (
                  <div className="grammar-theory-chips">
                    {section.chips.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                ) : null}

                {section.compare?.length ? (
                  <div className="grammar-theory-compare">
                    {section.compare.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}

                {section.avoid ? (
                  <p className="grammar-theory-avoid">
                    <span>Not usually:</span> {section.avoid}
                  </p>
                ) : null}

                {section.note ? <p className="grammar-theory-note">{section.note}</p> : null}
              </article>
            ))}
          </div>

          <section className="grammar-theory-checklist">
            <h3>Quick checklist</h3>
            <ul>
              {theory.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
