import React from "react";
import { ArrowLeft, ArrowRight, BookOpen, MessageCircleMore } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSpeakingReferenceSheet } from "./speakingReferenceData";
import "./SpeakingReference.css";

function RichText({ children }) {
  const parts = String(children).split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>);
}

function ReferenceBlock({ block }) {
  if (block.type === "list") {
    return <div className="speaking-reference-block">
      {block.title ? <h3>{block.title}</h3> : null}
      <ul className="speaking-reference-list">
        {block.items.map((item) => <li key={item}><RichText>{item}</RichText></li>)}
      </ul>
    </div>;
  }

  if (block.type === "chips") {
    return <div className="speaking-reference-block">
      {block.title ? <h3>{block.title}</h3> : null}
      <div className={`speaking-reference-chips ${block.tone ? `is-${block.tone}` : ""}`}>
        {block.items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>;
  }

  if (block.type === "example") {
    return <aside className="speaking-reference-example">
      <small>{block.title || "Example"}</small>
      <p><RichText>{block.text}</RichText></p>
    </aside>;
  }

  if (block.type === "note") {
    return <aside className="speaking-reference-note">
      {block.title ? <strong>{block.title}</strong> : null}
      <p><RichText>{block.text}</RichText></p>
    </aside>;
  }

  if (block.type === "sequence") {
    return <div className="speaking-reference-block speaking-reference-sequence">
      {block.title ? <h3>{block.title}</h3> : null}
      <ol>{block.items.map((item, index) => <li key={item}><span>{item}</span>{index < block.items.length - 1 ? <ArrowRight size={16} /> : null}</li>)}</ol>
    </div>;
  }

  if (block.type === "pros-cons") {
    return <div className="speaking-reference-pros-cons">
      {block.items.map((item) => <article key={item.title}>
        <h3>{item.title}</h3>
        <p><b aria-label="Advantages">+</b><span>{item.pros}</span></p>
        <p><b aria-label="Disadvantages">−</b><span>{item.cons}</span></p>
      </article>)}
    </div>;
  }

  if (block.type === "moves") {
    return <div className="speaking-reference-block">
      {block.intro ? <p className="speaking-reference-block-intro">{block.intro}</p> : null}
      <div className="speaking-reference-moves">
        {block.items.map(([label, example]) => <article key={label}><strong>{label}</strong><p>{example}</p></article>)}
      </div>
    </div>;
  }

  return null;
}

export default function SpeakingReference({ topic }) {
  const navigate = useNavigate();
  const sheet = getSpeakingReferenceSheet(topic.id);

  if (!sheet) return null;

  return <div className={`speaking-reference-page accent-${topic.accent}`}>
    <div className="speaking-reference-topbar">
      <button type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}`)}><ArrowLeft size={18} /> Back to {topic.title}</button>
      <button type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/prepare`)}>Open preparation <ArrowRight size={17} /></button>
    </div>

    <header className="speaking-reference-hero">
      <div className="speaking-reference-hero-icon"><BookOpen size={31} /></div>
      <section>
        <p>{sheet.eyebrow}</p>
        <h1>{sheet.title}</h1>
        <span>{sheet.intro}</span>
      </section>
    </header>

    <section className="speaking-reference-overview">
      <header>
        <div><MessageCircleMore size={22} /><span><strong>Quick reference</strong><small>Open only the language you need.</small></span></div>
        <b>{sheet.sections.length} sections</b>
      </header>
      <nav aria-label={`${sheet.title} language sections`}>
        {sheet.sections.map((section, index) => <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}
      </nav>
    </section>

    <section className="speaking-reference-sections" aria-label={`${sheet.title} speaking language`}>
      {sheet.sections.map((section, index) => <details className={section.featured ? "is-featured" : ""} id={section.id} key={section.id} open={index === 0 || section.featured}>
        <summary>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{section.title}</strong>
          {section.partLabel ? <small>{section.partLabel}</small> : null}
        </summary>
        <div className="speaking-reference-section-content">
          {section.blocks.map((block, blockIndex) => <ReferenceBlock block={block} key={`${section.id}-${block.type}-${blockIndex}`} />)}
        </div>
      </details>)}
    </section>
  </div>;
}
