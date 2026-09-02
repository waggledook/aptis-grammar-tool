import React, { useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Printer,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const contents = [
  ["report-combine", "Report and combine ideas"],
  ["relationships", "Show how ideas are connected"],
  ["certainty", "Show how certain the experts are"],
  ["paraphrase", "Paraphrase clearly and concisely"],
  ["accuracy", "Avoid common language problems"],
];

const sections = [
  {
    id: "report-combine",
    number: "01",
    title: "Report and Combine Ideas",
    lead: "Use a small number of flexible phrases. The idea should be more important than the speaker label.",
    groups: [
      {
        label: "Report a shared point",
        phrases: [
          "Both experts suggest that…",
          "Both experts highlight…",
          "The research indicates that…",
          "One of the main findings is that…",
        ],
      },
      {
        label: "Add a useful detail",
        phrases: [
          "One expert also notes that…",
          "The other expert adds that…",
          "Both experts also point to…",
          "Taken together, their points suggest that…",
        ],
      },
      {
        label: "Show a different emphasis",
        phrases: [
          "While both discuss X, one expert focuses on Y.",
          "Both refer to X, although they highlight different aspects of it.",
          "One focuses on X, whereas the other highlights Y.",
        ],
      },
    ],
    pattern: "Both experts + reporting verb + that + a complete idea",
    example:
      "Both experts suggest that community volunteering can strengthen social connections. One expert also notes that it may help people develop practical skills.",
    tip: "Use ‘agree’ only when agreement is part of the meaning. ‘Both experts suggest…’ is often a safer choice.",
  },
  {
    id: "relationships",
    number: "02",
    title: "Show How Ideas Are Connected",
    lead: "Choose language that makes the cause, explanation, contrast or condition clear.",
    groups: [
      {
        label: "Cause or result",
        phrases: [
          "can lead to…",
          "may result in…",
          "can contribute to…",
          "can affect…",
          "has an effect on…",
          "is linked to…",
          "is associated with…",
        ],
      },
      {
        label: "Explain how or why",
        phrases: [
          "because…",
          "partly because…",
          "by + -ing",
          "through + noun / -ing",
          "which can…",
          "this means that…",
        ],
      },
      {
        label: "Contrast or add a condition",
        phrases: [
          "however…",
          "while…",
          "whereas…",
          "rather than…",
          "depends on…",
          "only when…",
          "is more likely when…",
          "particularly…",
        ],
      },
    ],
    sentencePatterns: [
      ["Explain how", "Natural light may support alertness by helping to regulate sleep patterns."],
      ["Add a condition", "The success of mentoring depends on how regularly participants meet."],
      ["Show a contrast", "Recorded lectures offer flexibility, whereas live seminars allow immediate discussion."],
      ["Give a reason", "Consumers may avoid repair services because the final cost is difficult to predict."],
    ],
    comparison: {
      bad: "X is associated with Y, so X definitely causes Y.",
      good: "X is associated with Y, which means there is a connection, but not necessarily a direct cause.",
    },
    tip: "Use ‘causes’ only when the expert describes a definite cause. ‘Is linked to’ and ‘is associated with’ describe a connection.",
  },
  {
    id: "certainty",
    number: "03",
    title: "Show How Certain the Experts Are",
    lead: "Do not make a claim stronger or weaker than the original. Match your words to what you hear.",
    table: {
      label: "Language for different levels of certainty",
      headings: ["Meaning in the talk", "Language you can use"],
      rows: [
        ["A clear finding", "The research shows / has found that…"],
        ["A cautious finding", "The research suggests / indicates that…"],
        ["A possible result", "X may / might / could lead to Y."],
        ["A general pattern", "X tends to… / X is often…"],
        ["A connection, not a definite cause", "X is linked to / associated with Y."],
        ["The result changes in different situations", "The effect depends on / varies according to…"],
      ],
    },
    comparison: {
      bad: "Flexible start times always improve productivity.",
      good: "Flexible start times can support productivity, particularly when employees can coordinate their schedules.",
    },
    tip: "Cautious language is not automatically better. The aim is to report the original meaning accurately.",
  },
  {
    id: "paraphrase",
    number: "04",
    title: "Paraphrase Clearly and Concisely",
    lead: "Change the wording or sentence shape without changing the meaning, certainty or emphasis.",
    table: {
      label: "Concise paraphrasing examples",
      headings: ["Longer wording", "Clear, concise paraphrase"],
      rows: [
        ["people who travel to work every day", "daily commuters"],
        ["buses, trains and trams", "public transport"],
        ["turning off lights and choosing efficient appliances", "reducing household energy use"],
        ["clear, affordable and easy to use", "accessible and affordable"],
        ["X and Y are connected", "X is linked to Y"],
        ["X helps because it makes people do Y", "X helps by encouraging Y"],
      ],
    },
    groups: [
      {
        label: "Useful summary nouns",
        phrases: [
          "effect",
          "impact",
          "benefit",
          "drawback",
          "factor",
          "finding",
          "result",
          "relationship",
          "tendency",
          "change",
        ],
      },
      {
        label: "Useful combinations",
        phrases: [
          "have an impact on…",
          "play a role in…",
          "lead to an increase in…",
          "result in a reduction in…",
          "identify a relationship between…",
          "show a tendency to…",
        ],
      },
    ],
    tip: "Keep necessary technical terms. Paraphrasing does not mean replacing every word with a more complicated synonym.",
  },
];

const accuracyRows = [
  ["The first speaker says… The second speaker says…", "Both experts suggest that…"],
  ["The study proves that…", "The study suggests / indicates that…", "when the original claim is cautious"],
  ["The research show…", "The research shows…"],
  ["The evidences are…", "The evidence is…"],
  ["X contributes on Y.", "X contributes to Y."],
  ["Although X. However, Y.", "Although X, Y. / X. However, Y."],
];

const finalReminders = [
  "Report the idea, not a list of speaker labels",
  "Make the relationship between ideas clear",
  "Match the certainty of the original claim",
  "Use short, natural spoken phrases",
  "Change the form, not the meaning",
];

function PhraseGroup({ group }) {
  return (
    <div className="ote-language-toolkit-group">
      <h3>{group.label}</h3>
      <div className="ote-language-toolkit-phrases">
        {group.phrases.map((phrase) => (
          <span key={phrase}>{phrase}</span>
        ))}
      </div>
    </div>
  );
}

function Comparison({ comparison }) {
  if (!comparison) return null;
  return (
    <div className="ote-language-toolkit-comparison">
      <div className="is-avoid">
        <XCircle size={18} aria-hidden="true" />
        <span>{comparison.bad}</span>
      </div>
      <div className="is-use">
        <CheckCircle2 size={18} aria-hidden="true" />
        <span>{comparison.good}</span>
      </div>
    </div>
  );
}

function LanguageTable({ table }) {
  return (
    <div className="ote-language-toolkit-table" role="table" aria-label={table.label}>
      <div role="row">
        {table.headings.map((heading) => (
          <strong key={heading} role="columnheader">{heading}</strong>
        ))}
      </div>
      {table.rows.map(([first, second]) => (
        <div role="row" key={first}>
          <span role="cell">{first}</span>
          <span role="cell">{second}</span>
        </div>
      ))}
    </div>
  );
}

function ToolkitSection({ section }) {
  return (
    <section className="ote-language-toolkit-section" id={section.id}>
      <header>
        <span>{section.number}</span>
        <div>
          <h2>{section.title}</h2>
          <p>{section.lead}</p>
        </div>
      </header>
      <div className="ote-language-toolkit-body">
        {(section.groups || []).map((group) => (
          <PhraseGroup key={group.label} group={group} />
        ))}
        {section.pattern ? (
          <div className="ote-language-toolkit-pattern">
            <strong>Sentence shape</strong>
            <span>{section.pattern}</span>
          </div>
        ) : null}
        {section.table ? <LanguageTable table={section.table} /> : null}
        {section.sentencePatterns ? (
          <div className="ote-language-toolkit-sentence-patterns">
            {section.sentencePatterns.map(([label, example]) => (
              <article key={label}>
                <strong>{label}</strong>
                <p>{example}</p>
              </article>
            ))}
          </div>
        ) : null}
        {section.example ? <blockquote>{section.example}</blockquote> : null}
        <Comparison comparison={section.comparison} />
        {section.tip ? (
          <p className="ote-language-toolkit-tip">
            <Sparkles size={17} aria-hidden="true" />
            {section.tip}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function OteSpeakingPart3LanguageReference({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-3-4" : "/ote/speaking/parts-3-4");

  useEffect(() => {
    logOteTrainingCompleted({
      progressId: "speaking.part3.advanced-summary-language",
      section: "speaking",
      part: "part-3",
      mode: "advanced_summary_language_reference",
      taskTitle: "Advanced Part 3 summary language reference",
    });
  }, []);

  useEffect(() => {
    const clearPrintMode = () => document.body.classList.remove("ote-language-toolkit-print-mode");
    window.addEventListener("afterprint", clearPrintMode);
    return () => {
      window.removeEventListener("afterprint", clearPrintMode);
      clearPrintMode();
    };
  }, []);

  function printReference() {
    document.body.classList.add("ote-language-toolkit-print-mode");
    window.print();
  }

  return (
    <main className="ote-training-page ote-language-toolkit-page">
      <Seo
        title="Language for OTE Advanced Speaking Part 3 Summaries | Seif English"
        description="A practical language reference for reporting, connecting and paraphrasing ideas accurately in OTE Advanced Speaking Part 3."
      />

      <div className="ote-language-toolkit-toolbar no-print">
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" /> Back to summary training
        </button>
        <button type="button" className="ote-language-toolkit-print" onClick={printReference}>
          <Printer size={18} aria-hidden="true" /> Print / save as PDF
        </button>
      </div>

      <header className="ote-training-hero ote-language-toolkit-hero">
        <div className="ote-language-toolkit-hero-icon"><BookOpen size={34} aria-hidden="true" /></div>
        <div>
          <p className="ote-kicker">Advanced Speaking Part 3 · Reference</p>
          <h1>Language for Part 3 Summaries</h1>
          <p>Useful language for reporting, connecting and paraphrasing ideas accurately.</p>
          <p>
            Good summarising is not only about choosing the right information. Your language must
            also show what the experts mean and how their ideas are connected.
          </p>
        </div>
      </header>

      <nav className="ote-language-toolkit-contents no-print" aria-label="Language reference contents">
        <strong>Jump to a section</strong>
        <div>
          {contents.map(([id, label], index) => (
            <a key={id} href={`#${id}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </div>
      </nav>

      {sections.map((section) => (
        <ToolkitSection key={section.id} section={section} />
      ))}

      <section className="ote-language-toolkit-section" id="accuracy">
        <header>
          <span>05</span>
          <div>
            <h2>Avoid Common Language Problems</h2>
            <p>Clear, accurate language is better than a long or unnecessarily formal phrase.</p>
          </div>
        </header>
        <div className="ote-language-toolkit-body">
          <div className="ote-language-toolkit-table" role="table" aria-label="Common summary language problems">
            <div role="row">
              <strong role="columnheader">Avoid or use carefully</strong>
              <strong role="columnheader">Better choice</strong>
            </div>
            {accuracyRows.map(([avoid, better, note]) => (
              <div role="row" key={avoid}>
                <span role="cell">{avoid}</span>
                <span role="cell">{better}{note ? <small> — {note}</small> : null}</span>
              </div>
            ))}
          </div>
          <p className="ote-language-toolkit-tip">
            <Sparkles size={17} aria-hidden="true" />
            You do not need dozens of reporting verbs. Use a few flexible phrases accurately and naturally.
          </p>
        </div>
      </section>

      <section className="ote-language-toolkit-final">
        <p className="ote-kicker">Quick reference</p>
        <h2>A Strong Summary Will…</h2>
        <div>
          {finalReminders.map((item) => (
            <span key={item}><CheckCircle2 size={17} aria-hidden="true" />{item}</span>
          ))}
        </div>
        <blockquote>
          Both experts suggest that later school start times can improve students’ alertness.
          However, the effect may depend on travel schedules and whether students use the extra
          time for sleep.
        </blockquote>
      </section>
    </main>
  );
}
