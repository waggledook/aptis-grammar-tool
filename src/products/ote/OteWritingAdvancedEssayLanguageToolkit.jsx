import React, { useEffect } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Printer, Sparkles, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const contents = [
  ["introducing", "Introducing the issue"],
  ["main-point", "Introducing a main point"],
  ["developing", "Explaining and developing"],
  ["examples", "Giving examples"],
  ["cause-result", "Cause and result"],
  ["qualification", "Contrast and qualification"],
  ["opposing", "Opposing arguments"],
  ["judgement", "Final judgement"],
  ["cohesion", "Creating cohesion"],
  ["complex-patterns", "Complex sentence patterns"],
];

const sections = [
  {
    id: "introducing",
    number: "01",
    title: "Introducing the Issue",
    lead: "Use the introduction to frame the precise debate.",
    groups: [
      {
        label: "Framing the debate",
        phrases: [
          "There is ongoing debate over whether…",
          "The growing use of … has raised questions about…",
          "While some people argue that …, others believe that…",
          "Opinions remain divided over whether…",
          "Whether … is beneficial remains a matter of debate.",
          "Recent changes in … have led to concerns about…",
        ],
      },
      {
        label: "Optional position",
        note: "A position may be included, but it is not compulsory.",
        phrases: [
          "Although both views have some merit, …",
          "On balance, it could be argued that…",
          "The strongest case appears to be for…",
          "A more effective approach may be to…",
        ],
      },
    ],
    avoid: "In this essay, I am going to discuss…",
    tip: "Begin with the issue itself rather than announcing the essay.",
  },
  {
    id: "main-point",
    number: "02",
    title: "Introducing a Main Point",
    lead: "Use these expressions to establish the purpose of a paragraph.",
    groups: [
      {
        label: "Paragraph focus",
        phrases: [
          "One important consideration is…",
          "A central argument in favour of … is…",
          "One significant objection to … is…",
          "A further issue concerns…",
          "From the perspective of consumers/businesses/families, …",
          "The effect on … is particularly important.",
          "Perhaps the strongest argument is that…",
        ],
      },
    ],
    comparison: {
      good: "From the perspective of families, advertising can create unnecessary pressure.",
      bad: "The second idea I am going to discuss is the impact on families.",
    },
    tip: "The task prompts should become part of your argument, not headings in an essay plan.",
  },
  {
    id: "developing",
    number: "03",
    title: "Explaining and Developing",
    lead: "A main point needs explanation, not just a topic sentence.",
    groups: [
      {
        label: "Development language",
        phrases: [
          "One reason for this is that…",
          "This is significant because…",
          "In practice, this means that…",
          "This may result in…",
          "As a consequence, …",
          "This can make it more difficult for … to…",
          "The main benefit is not simply …; it is also…",
          "What makes this particularly important is…",
        ],
      },
    ],
    pattern: "Claim → explanation → consequence or example",
    example:
      "Children may find targeted advertising difficult to evaluate critically. This is because younger audiences do not always recognise when persuasive techniques are being used. As a result, they may place pressure on their parents to purchase products they neither need nor fully understand.",
  },
  {
    id: "examples",
    number: "04",
    title: "Giving Examples",
    lead: "Examples should illustrate an argument rather than replace it.",
    groups: [
      {
        label: "Example frames",
        phrases: [
          "For example, …",
          "For instance, …",
          "A clear example of this is…",
          "This can be seen when…",
          "Consider, for example, …",
          "A typical case might involve…",
        ],
      },
    ],
    tip: "An essay example does not need invented statistics. A realistic situation is enough.",
  },
  {
    id: "cause-result",
    number: "05",
    title: "Showing Cause and Result",
    lead: "Make the relationship between an action and its consequence explicit.",
    groups: [
      {
        label: "Cause-and-result language",
        phrases: [
          "Because of this, …",
          "As a result, …",
          "Consequently, …",
          "This may lead to…",
          "This can result in…",
          "One likely consequence is…",
          "This, in turn, may…",
          "By doing this, … can…",
        ],
      },
    ],
    tip: "Try not to repeat ‘because’ and ‘so’ throughout the essay.",
  },
  {
    id: "qualification",
    number: "06",
    title: "Adding Contrast and Qualification",
    lead: "Advanced writing rarely presents complex issues as completely black or white.",
    groups: [
      {
        label: "Contrast and concession",
        phrases: [
          "However, …",
          "By contrast, …",
          "Nevertheless, …",
          "Although …, …",
          "While it is true that …, …",
          "Admittedly, …",
          "To some extent, …",
          "This does not necessarily mean that…",
          "The extent to which this occurs depends on…",
          "While this concern is valid, it overlooks…",
        ],
      },
      {
        label: "Useful qualifiers",
        phrases: ["may", "can", "could", "tends to", "is likely to", "in many cases", "to some extent", "under certain circumstances"],
      },
    ],
    comparison: {
      bad: "Advertising causes family conflict.",
      good: "Advertising can contribute to family conflict, particularly when children are repeatedly encouraged to request expensive products.",
    },
    tip: "The qualified claim is more precise and easier to support.",
  },
  {
    id: "opposing",
    number: "07",
    title: "Presenting an Opposing Argument",
    lead: "Acknowledge a credible alternative before deciding how to respond.",
    groups: [
      {
        label: "Introducing the opposing view",
        phrases: [
          "Supporters of this view argue that…",
          "Opponents may argue that…",
          "A common objection is that…",
          "It could be argued that…",
          "Some may reasonably claim that…",
          "The alternative view is that…",
        ],
      },
      {
        label: "Responding to it",
        phrases: [
          "While this concern is understandable, …",
          "Nevertheless, this argument overlooks…",
          "This may be true in some cases; however, …",
          "Even if this is accepted, …",
          "The problem with this argument is that…",
          "This is less convincing when…",
        ],
      },
    ],
    tip: "A counterargument does not need an entire paragraph in a one-sided essay. It can be acknowledged and answered briefly.",
  },
  {
    id: "judgement",
    number: "08",
    title: "Expressing a Final Judgement",
    lead: "Use the conclusion to answer the question after considering the arguments.",
    groups: [
      {
        label: "Conclusion frames",
        phrases: [
          "Overall, …",
          "On balance, …",
          "Taking these considerations into account, …",
          "For these reasons, …",
          "Ultimately, …",
          "Although …, the stronger argument is that…",
          "While both positions have merit, …",
          "The most reasonable conclusion is that…",
        ],
      },
      {
        label: "Qualified conclusions",
        phrases: [
          "A complete ban may be unnecessary, but stricter regulation is justified.",
          "The policy is likely to be beneficial, provided that…",
          "The advantages appear to outweigh the potential disadvantages.",
          "Responsibility should not rest entirely with…",
          "The most effective approach would combine … with…",
        ],
      },
    ],
    avoid: "In conclusion, this essay has discussed…",
    tip: "Summarise the judgement, not the contents page.",
  },
  {
    id: "cohesion",
    number: "09",
    title: "Creating Cohesion Without Too Many Linkers",
    lead: "Cohesion does not mean beginning every sentence with ‘Moreover’, ‘Furthermore’ or ‘However’.",
    groups: [
      {
        label: "Refer back to previous ideas",
        phrases: [
          "this practice",
          "this approach",
          "such a policy",
          "these measures",
          "this concern",
          "these consequences",
          "the resulting pressure",
          "those affected",
          "the former approach",
          "the alternative view",
        ],
      },
    ],
    example:
      "Some companies collect personal data to target advertisements more accurately. This practice may make marketing more effective, but it also raises questions about privacy.",
  },
  {
    id: "complex-patterns",
    number: "10",
    title: "Useful Complex Sentence Patterns",
    lead: "Use complex structures when they clarify the relationship between ideas.",
    sentencePatterns: [
      ["Concession", "Although advertising supports many businesses, children may not be able to evaluate it critically."],
      ["Condition", "If stricter rules were introduced, companies would need to reconsider how they promote children’s products."],
      ["Cause through method", "By limiting advertisements during children’s programmes, regulators could reduce younger viewers’ exposure."],
      ["Contrast between alternatives", "Rather than prohibiting all advertising, governments could restrict the promotion of unsuitable products."],
      ["Dependent evaluation", "The extent to which advertising affects children depends partly on their age and understanding."],
    ],
  },
];

const controlledAlternatives = [
  ["Everyone knows that…", "It is widely argued that…"],
  ["This is obviously…", "This is likely to…"],
  ["lots of things", "several factors/measures/effects"],
  ["really good or bad", "beneficial/harmful/problematic"],
  ["a massive problem", "a significant concern"],
  ["I personally think", "It could be argued that…"],
  ["This will completely solve…", "This may help address…"],
  ["fancy words used unnaturally", "precise vocabulary used accurately"],
];

const finalReminders = [
  "formal but natural",
  "clear rather than unnecessarily complicated",
  "qualified rather than vague",
  "developed rather than repetitive",
  "cohesive without being full of linkers",
  "precise without trying to sound impressive",
];

function PhraseGroup({ group }) {
  return (
    <div className="ote-language-toolkit-group">
      <h3>{group.label}</h3>
      {group.note ? <p>{group.note}</p> : null}
      <div className="ote-language-toolkit-phrases">
        {group.phrases.map((phrase) => <span key={phrase}>{phrase}</span>)}
      </div>
    </div>
  );
}

function Comparison({ comparison }) {
  if (!comparison) return null;
  return (
    <div className="ote-language-toolkit-comparison">
      <div className="is-avoid"><XCircle size={18} aria-hidden="true" /><span>{comparison.bad}</span></div>
      <div className="is-use"><CheckCircle2 size={18} aria-hidden="true" /><span>{comparison.good}</span></div>
    </div>
  );
}

function ToolkitSection({ section }) {
  return (
    <section className="ote-language-toolkit-section" id={section.id}>
      <header>
        <span>{section.number}</span>
        <div><h2>{section.title}</h2><p>{section.lead}</p></div>
      </header>
      <div className="ote-language-toolkit-body">
        {(section.groups || []).map((group) => <PhraseGroup key={group.label} group={group} />)}
        {section.pattern ? <div className="ote-language-toolkit-pattern"><strong>Development pattern</strong><span>{section.pattern}</span></div> : null}
        <Comparison comparison={section.comparison} />
        {section.sentencePatterns ? (
          <div className="ote-language-toolkit-sentence-patterns">
            {section.sentencePatterns.map(([label, example]) => <article key={label}><strong>{label}</strong><p>{example}</p></article>)}
          </div>
        ) : null}
        {section.example ? <blockquote>{section.example}</blockquote> : null}
        {section.avoid ? <div className="ote-language-toolkit-avoid"><strong>Avoid</strong><span>{section.avoid}</span></div> : null}
        {section.tip ? <p className="ote-language-toolkit-tip"><Sparkles size={17} aria-hidden="true" />{section.tip}</p> : null}
      </div>
    </section>
  );
}

export default function OteWritingAdvancedEssayLanguageToolkit({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-essay" : "/ote/writing/training/advanced-essay");

  useEffect(() => {
    const clearPrintMode = () => document.body.classList.remove("ote-language-toolkit-print-mode");
    window.addEventListener("afterprint", clearPrintMode);
    return () => {
      window.removeEventListener("afterprint", clearPrintMode);
      clearPrintMode();
    };
  }, []);

  function printToolkit() {
    document.body.classList.add("ote-language-toolkit-print-mode");
    window.print();
  }

  return (
    <main className="ote-training-page ote-language-toolkit-page">
      <Seo
        title="OTE Advanced Essay Language Toolkit | Seif English"
        description="A practical reference bank of expressions and sentence patterns for organising and developing an OTE Advanced essay."
      />

      <div className="ote-language-toolkit-toolbar no-print">
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" /> Back to advanced essay training
        </button>
        <button type="button" className="ote-language-toolkit-print" onClick={printToolkit}>
          <Printer size={18} aria-hidden="true" /> Print / save as PDF
        </button>
      </div>

      <header className="ote-training-hero ote-language-toolkit-hero">
        <div className="ote-language-toolkit-hero-icon"><BookOpen size={34} aria-hidden="true" /></div>
        <div>
          <p className="ote-kicker">Advanced essay · Reference</p>
          <h1>Advanced Essay Language Toolkit</h1>
          <p>
            Use these expressions to organise and develop your argument. Adapt them to the topic
            rather than copying complete sentences mechanically.
          </p>
        </div>
      </header>

      <nav className="ote-language-toolkit-contents no-print" aria-label="Toolkit contents">
        <strong>Jump to a section</strong>
        <div>{contents.map(([id, label], index) => <a key={id} href={`#${id}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}</div>
      </nav>

      {sections.map((section) => <ToolkitSection key={section.id} section={section} />)}

      <section className="ote-language-toolkit-section" id="controlled-language">
        <header><span>✓</span><div><h2>Keep the Language Natural</h2><p>Replace conversational or inflated wording with controlled alternatives.</p></div></header>
        <div className="ote-language-toolkit-body">
          <div className="ote-language-toolkit-table" role="table" aria-label="Controlled language alternatives">
            <div role="row"><strong role="columnheader">Avoid or use carefully</strong><strong role="columnheader">More controlled alternative</strong></div>
            {controlledAlternatives.map(([avoid, alternative]) => <div role="row" key={avoid}><span role="cell">{avoid}</span><span role="cell">{alternative}</span></div>)}
          </div>
        </div>
      </section>

      <section className="ote-language-toolkit-final">
        <p className="ote-kicker">Final reminder</p>
        <h2>Strong Advanced Writing Is…</h2>
        <div>{finalReminders.map((item) => <span key={item}><CheckCircle2 size={17} aria-hidden="true" />{item}</span>)}</div>
        <blockquote>
          The language should help the reader follow the argument. It should never become the argument itself.
        </blockquote>
      </section>
    </main>
  );
}
