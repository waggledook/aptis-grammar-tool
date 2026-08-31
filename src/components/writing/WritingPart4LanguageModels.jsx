import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Highlighter, Mail, MessageCircle } from "lucide-react";
import Seo from "../common/Seo.jsx";
import { PART4_LANGUAGE_GUIDES } from "./data/aptisPart4LanguageModels.js";
import "./writingPart4LanguageModels.css";

function modelText(model) {
  return model.flatMap((paragraph) => paragraph.map((segment) => typeof segment === "string" ? segment : segment.text)).join(" ");
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export default function WritingPart4LanguageModels({ onBack }) {
  const [tone, setTone] = useState("informal");
  const guide = PART4_LANGUAGE_GUIDES[tone];
  const [activeAnnotation, setActiveAnnotation] = useState(guide.annotations[0].id);
  const activeNote = guide.annotations.find((annotation) => annotation.id === activeAnnotation) || guide.annotations[0];
  const count = useMemo(() => wordCount(modelText(guide.model)), [guide.model]);

  useEffect(() => {
    setActiveAnnotation(PART4_LANGUAGE_GUIDES[tone].annotations[0].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tone]);

  return <main className="p4-language-page game-wrapper">
    <Seo title="Aptis Writing Part 4 Phrase Bank and Models | Seif Aptis Trainer" description="Useful informal and formal Aptis Writing Part 4 phrases with annotated model emails." />
    <button className="p4-language-back" onClick={onBack} type="button"><ArrowLeft size={18} /> Back to Part 4</button>

    <header className="p4-language-hero">
      <div><Mail size={31} /></div>
      <section><p>Aptis Writing Part 4 · Student reference</p><h1>Phrase Bank &amp; Annotated Models</h1><span>Choose language for the reader, then see how strong phrases work inside complete emails.</span></section>
    </header>

    <div className="p4-language-tabs" role="tablist" aria-label="Email type">
      {Object.entries(PART4_LANGUAGE_GUIDES).map(([key, item]) => <button aria-selected={tone === key} className={tone === key ? "is-active" : ""} key={key} onClick={() => setTone(key)} role="tab" type="button">{key === "informal" ? <MessageCircle size={20} /> : <Mail size={20} />}<span><strong>{item.label}</strong><small>{item.target}</small></span></button>)}
    </div>

    <section className="p4-language-overview">
      <div><p>Write to</p><strong>{guide.audience}</strong></div>
      <div><p>Target</p><strong>{guide.target}</strong></div>
      <div className="p4-language-structure"><p>Useful structure</p><ol>{guide.structure.map((step, index) => <li key={step}><span>{step}</span>{index < guide.structure.length - 1 ? <ArrowRight size={15} /> : null}</li>)}</ol></div>
    </section>

    <section className="p4-language-section">
      <header><p>Build your email</p><h2>Useful phrase bank</h2><span>Choose phrases that express your real meaning. You do not need to use every stage or memorise a complete answer.</span></header>
      <div className="p4-language-phrase-grid">{guide.categories.map((category, index) => <details key={`${tone}-${category.title}`} open={index === 0}><summary><span>{category.title}</span><small>{category.phrases.length} phrases</small></summary><ul>{category.phrases.map((phrase) => <li key={phrase}>{phrase}</li>)}</ul></details>)}</div>
      {guide.signoffNote ? <aside className="p4-language-signoff-note"><strong>Choosing a sign-off</strong><span>{guide.signoffNote}</span></aside> : null}
    </section>

    <section className="p4-language-section p4-language-model-section">
      <header><p>See the language in context</p><h2>Annotated {guide.label.toLowerCase()} model</h2><span>Tap a highlighted passage to read why it works.</span></header>
      <div className="p4-language-model-layout">
        <article className={`p4-language-model is-${tone}`}>
          <header><span>{guide.audience}</span><small>{count} words</small></header>
          <div>{guide.model.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph.map((segment, segmentIndex) => {
            if (typeof segment === "string") return <React.Fragment key={segmentIndex}>{segment}</React.Fragment>;
            const annotation = guide.annotations.find((item) => item.id === segment.id);
            const annotationNumber = guide.annotations.findIndex((item) => item.id === segment.id) + 1;
            const selectAnnotation = () => setActiveAnnotation(segment.id);
            return <span aria-label={`Annotation ${annotationNumber}: ${annotation?.label || "model language"}`} aria-pressed={activeAnnotation === segment.id} className={`p4-language-highlight is-${annotation?.type || "purpose"} ${activeAnnotation === segment.id ? "is-active" : ""}`} key={segment.id} onClick={selectAnnotation} onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectAnnotation();
              }
            }} role="button" tabIndex={0}>{segment.text}<sup aria-hidden="true">{annotationNumber}</sup></span>;
          })}</p>)}</div>
        </article>
        <aside className="p4-language-annotation" aria-live="polite"><Highlighter size={23} /><div><small>Annotation {guide.annotations.findIndex((item) => item.id === activeNote.id) + 1}</small><h3>{activeNote.label}</h3><p>{activeNote.note}</p></div></aside>
      </div>
      <div className="p4-language-annotation-list">{guide.annotations.map((annotation, index) => <button className={activeAnnotation === annotation.id ? "is-active" : ""} key={annotation.id} onClick={() => setActiveAnnotation(annotation.id)} type="button"><span>{index + 1}</span>{annotation.label}</button>)}</div>
    </section>
  </main>;
}
