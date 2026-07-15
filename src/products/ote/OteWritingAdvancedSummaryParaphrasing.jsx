import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, RotateCcw, Target, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const textbook = "Social proof is the tendency to treat other people’s behaviour as evidence of the correct choice, especially when a situation is unfamiliar or uncertain. Observing a group can reduce the effort needed to make a decision, and the effect is often stronger when many people agree or when those people seem similar to us. This shortcut can be useful, for example when identifying a safe route through a crowded building. However, it can also produce conformity without judgement. Online platforms make social proof visible through ratings, review totals and labels such as “most popular”. A product with thousands of positive reviews may appear more trustworthy than one with only a few. Yet these signals can be biased by fake accounts, early comments or the tendency of satisfied or dissatisfied customers to post. Social proof can therefore guide decisions, but it should not be treated as proof that a choice is correct.";

const lecture = "‘Imagine that you are choosing between two unfamiliar restaurants. One is busy and the other is almost empty. Many people select the crowded one because they assume its customers know something they do not. But the crowd may be there because of a temporary discount or a tour group. In one experiment, participants rated an unknown song more positively after being told that many others had downloaded it. This influence was strongest when they knew little about the music, and choices made by people of a similar age affected them more than choices made by a different group. Online recommendations can intensify this process: early popularity attracts attention, which creates further popularity. However, manipulated ratings or an accidental early advantage can push an ordinary product ahead of better alternatives. Popularity is most informative when the group is relevant, the signal is genuine and people also have independent evidence.’";

const mainIdeaOptions = [
  { id: "uncertainty", text: "Social proof is especially influential when people are uncertain or identify with the group.", correct: true },
  { id: "restaurants", text: "Crowded restaurants normally provide better food.", correct: false },
  { id: "popularity", text: "Online systems can turn early popularity into further popularity.", correct: true },
  { id: "music-age", text: "Music preferences are mainly determined by age.", correct: false },
  { id: "misleading", text: "Popularity can be misleading when signals are manipulated, accidental or irrelevant.", correct: true },
  { id: "reviews", text: "Positive reviews are normally written by satisfied customers.", correct: false },
];

const aishaSegments = [
  { id: "decoy-1", text: "People often rely on " },
  { id: "social-proof", text: "social proof", target: true, category: "keep" },
  { id: "decoy-2", text: " when they are " },
  { id: "uncertain", text: "uncertain", target: true, category: "keep" },
  { id: "decoy-3", text: ", particularly if " },
  { id: "many-agree", text: "many people agree", target: true, category: "change" },
  { id: "decoy-4", text: " or " },
  { id: "seem-similar", text: "seem similar", target: true, category: "change" },
  { id: "decoy-5", text: " to them. " },
  { id: "digital-platforms", text: "Digital platforms", target: true, category: "keep" },
  { id: "decoy-6", text: " display " },
  { id: "ratings", text: "ratings", target: true, category: "keep" },
  { id: "decoy-7", text: ", " },
  { id: "review-totals", text: "review totals", target: true, category: "change" },
  { id: "decoy-8", text: " and " },
  { id: "popular-labels", text: "“most popular” labels", target: true, category: "change" },
  { id: "decoy-9", text: ", making other users’ behaviour easy to see. An option may gain more attention through " },
  { id: "early-popularity", text: "early popularity", target: true, category: "change" },
  { id: "decoy-10", text: ", while " },
  { id: "fake-accounts", text: "fake accounts", target: true, category: "keep" },
  { id: "decoy-11", text: ", " },
  { id: "manipulated-ratings", text: "manipulated ratings", target: true, category: "keep" },
  { id: "decoy-12", text: " or " },
  { id: "accidental-advantage", text: "an accidental early advantage", target: true, category: "change" },
  { id: "decoy-13", text: " can allow " },
  { id: "ordinary-product", text: "an ordinary product", target: true, category: "change" },
  { id: "decoy-14", text: " to beat " },
  { id: "better-alternatives", text: "better alternatives", target: true, category: "change" },
  { id: "decoy-15", text: ". Popularity is more useful when " },
  { id: "group-relevant", text: "the group is relevant", target: true, category: "change" },
  { id: "decoy-16", text: ", " },
  { id: "signal-genuine", text: "the signal is genuine", target: true, category: "change" },
  { id: "decoy-17", text: " and there is " },
  { id: "independent-evidence", text: "independent evidence", target: true, category: "keep" },
  { id: "decoy-18", text: "." },
];

const paraphrasePrompts = [
  { id: "many-agree", phrase: "many people agree", answers: ["many others choose the same option", "there is widespread agreement", "a large number make the same choice"] },
  { id: "seem-similar", phrase: "seem similar", answers: ["appear relatable", "share similar characteristics", "are people they identify with"] },
  { id: "review-totals", phrase: "review totals", answers: ["the number of reviews", "review counts"] },
  { id: "popular-labels", phrase: "“most popular” labels", answers: ["popularity indicators", "labels showing popular choices", "top-choice tags"] },
  { id: "early-popularity", phrase: "early popularity", answers: ["initial success", "an early lead", "early interest"] },
  { id: "accidental-advantage", phrase: "an accidental early advantage", answers: ["a chance head start", "an advantage gained through luck", "initial success caused by chance"] },
];

const finalOptions = [
  { id: "phrases", text: "Short source phrases have been reworded.", correct: true },
  { id: "grammar", text: "Some grammatical structures have been changed.", correct: true },
  { id: "terms", text: "Necessary terms have been retained.", correct: true },
  { id: "every-word", text: "Every repeated word has been replaced.", correct: false },
  { id: "meaning", text: "The original meaning has been preserved.", correct: true },
];

function selectionsAreCorrect(selected, options) {
  const expected = options.filter((option) => option.correct).map((option) => option.id).sort();
  return selected.slice().sort().join("|") === expected.join("|");
}

function SingleChoice({ answer, correctAnswer, feedback, onSelect, options, prompt }) {
  return (
    <article className={`ote-training-quiz-item ${answer ? (answer === correctAnswer ? "is-correct" : "is-wrong") : ""}`}>
      <h3>{prompt}</h3>
      <div className="ote-training-options">
        {options.map((option) => {
          const selected = answer === option.id;
          return (
            <button aria-pressed={selected} className={`ote-training-option ${selected ? "is-selected" : ""} ${answer && option.id === correctAnswer ? "is-answer" : ""} ${answer && selected && option.id !== correctAnswer ? "is-incorrect" : ""}`} key={option.id} onClick={() => onSelect(option.id)} type="button">
              <span>{option.id}. {option.text}</span>
              {answer && option.id === correctAnswer ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              {answer && selected && option.id !== correctAnswer ? <XCircle size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {answer ? <div className="ote-training-feedback"><strong>{answer === correctAnswer ? "Correct." : "Not quite."}</strong><p>{feedback}</p></div> : null}
    </article>
  );
}

function MultiSelect({ checked, onCheck, onToggle, options, prompt, selected }) {
  const correct = selectionsAreCorrect(selected, options);
  return (
    <article className={`ote-training-quiz-item ${checked ? (correct ? "is-correct" : "is-wrong") : ""}`}>
      <h3>{prompt}</h3>
      <div className="ote-training-options">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <button aria-pressed={isSelected} className={`ote-training-option ${isSelected ? "is-selected" : ""} ${checked && option.correct ? "is-answer" : ""} ${checked && isSelected && !option.correct ? "is-incorrect" : ""}`} disabled={checked} key={option.id} onClick={() => onToggle(option.id)} type="button">
              <span>{option.text}</span>
              {checked && option.correct ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              {checked && isSelected && !option.correct ? <XCircle size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {!checked ? <button className="ote-training-primary-link ote-summary-check-button" disabled={!selected.length} onClick={onCheck} type="button">Check selected answers</button> : null}
      {checked ? <div className="ote-training-feedback"><strong>{correct ? "Correct." : "Review the highlighted answers."}</strong></div> : null}
    </article>
  );
}

export default function OteWritingAdvancedSummaryParaphrasing({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const completionLogged = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-summary" : "/ote/writing/training/advanced-summary");
  const [overarchingAnswer, setOverarchingAnswer] = useState("");
  const [mainAnswers, setMainAnswers] = useState([]);
  const [mainChecked, setMainChecked] = useState(false);
  const [problemAnswer, setProblemAnswer] = useState("");
  const [languageSelections, setLanguageSelections] = useState([]);
  const [languageChecked, setLanguageChecked] = useState(false);
  const [rewrites, setRewrites] = useState({});
  const [submittedRewrites, setSubmittedRewrites] = useState({});
  const [finalAnswers, setFinalAnswers] = useState([]);
  const [finalChecked, setFinalChecked] = useState(false);

  const languageScore = useMemo(() => {
    const targetIds = aishaSegments.filter((segment) => segment.target).map((segment) => segment.id);
    return languageSelections.filter((id) => targetIds.includes(id)).length;
  }, [languageSelections]);
  const finalCorrect = selectionsAreCorrect(finalAnswers, finalOptions);

  useEffect(() => {
    if (!finalChecked || completionLogged.current) return;
    completionLogged.current = true;
    logOteTrainingCompleted({
      progressId: "writing.advanced-summary.paraphrasing",
      section: "writing",
      part: "part-2",
      mode: "paraphrasing_lesson",
      taskId: "effective-paraphrasing",
      taskTitle: "Effective Paraphrasing",
      score: Number(overarchingAnswer === "B") + Number(selectionsAreCorrect(mainAnswers, mainIdeaOptions)) + Number(problemAnswer === "B") + Number(finalCorrect),
      total: 4,
    }).catch(() => {});
  }, [finalChecked, finalCorrect, mainAnswers, overarchingAnswer, problemAnswer]);

  function toggleSelection(setter, id) {
    setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function resetLesson() {
    setOverarchingAnswer("");
    setMainAnswers([]);
    setMainChecked(false);
    setProblemAnswer("");
    setLanguageSelections([]);
    setLanguageChecked(false);
    setRewrites({});
    setSubmittedRewrites({});
    setFinalAnswers([]);
    setFinalChecked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="ote-training-page ote-summary-paraphrasing-page">
      <Seo title="Effective Paraphrasing | OTE Advanced Summary Training" description="Practise retaining essential terms while paraphrasing source ideas independently in OTE Advanced summaries." />
      <button className="ote-training-back" onClick={() => navigate(menuPath)} type="button"><ArrowLeft size={18} aria-hidden="true" /> Back to advanced summary training</button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Training Lesson 2 · Writing Part 2</p>
        <h1>Effective Paraphrasing</h1>
        <p>Recognise excessive dependence on source wording and paraphrase naturally without replacing essential terminology.</p>
      </header>

      <section className="ote-training-section ote-summary-lesson-task">
        <div className="ote-summary-lesson-heading"><div><p className="ote-kicker">Stage 1 · Read the task</p><h2>Part 2 Summary</h2></div><span>12–15 minutes · Lesson</span></div>
        <p>You have 20 minutes to write a summary. Write <strong>80–100 words</strong>.</p>
        <p>You have been learning about an aspect of psychology for a college course. You have read a textbook extract and attended a lecture and now your tutor has asked you to write a summary of the main ideas for your classmates to read.</p>
        <p>Write <strong>one paragraph</strong>, combining information from the textbook extract and the lecture transcript to summarize the main ideas. Your summary should provide the reader with enough information to understand the main ideas from both texts.</p>
        <p>Write full sentences, using <strong>your own words</strong> where possible. Do <strong>NOT</strong> write more than 100 words.</p>
        <aside className="ote-summary-pause-note"><Eye size={22} aria-hidden="true" /><strong>Read both texts carefully.</strong><span>Do not write a summary yet.</span></aside>
        <div className="ote-summary-lesson-source-grid">
          <article><h3>Textbook extract</h3><p>{textbook}</p></article>
          <article><h3>Lecture transcript</h3><p>{lecture}</p></article>
        </div>
        <div className="ote-summary-glossary-list" aria-label="Glossary"><h3>Glossary</h3><dl>
          <div><dt>conformity</dt><dd>behaviour that follows what other people do or expect</dd></div>
          <div><dt>biased</dt><dd>unfairly influenced in a particular direction</dd></div>
          <div><dt>manipulated</dt><dd>deliberately changed or controlled to create a particular result</dd></div>
          <div><dt>independent evidence</dt><dd>information obtained separately from the behaviour or opinions of a group</dd></div>
        </dl></div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Stage 2 · Quick information check</p>
        <SingleChoice answer={overarchingAnswer} correctAnswer="B" feedback="The overarching idea connects the general explanation of social proof with the limitations of crowds, ratings and popularity signals." onSelect={setOverarchingAnswer} options={[
          { id: "A", text: "Online ratings are generally more reliable than personal judgement." },
          { id: "B", text: "People often use others’ behaviour to guide decisions when they are uncertain, but these signals can be misleading." },
          { id: "C", text: "People are more likely to choose crowded restaurants than empty ones." },
        ]} prompt="1. What is the overarching idea shared by both texts?" />
        <MultiSelect checked={mainChecked} onCheck={() => setMainChecked(true)} onToggle={(id) => toggleSelection(setMainAnswers, id)} options={mainIdeaOptions} prompt="2. Which three points are the main ideas? Select three." selected={mainAnswers} />
        {mainChecked ? <p className="ote-summary-question-explanation">These ideas form the framework of the summary. The restaurant, music and product examples are supporting details.</p> : null}
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Stage 3 · Read the student’s summary</p>
        <article className="ote-paraphrase-student-summary"><header><h2>Aisha’s summary</h2><span>82 words</span></header><p>{aishaSegments.map((segment) => segment.text).join("")}</p></article>
        <SingleChoice answer={problemAnswer} correctAnswer="B" feedback="Aisha has selected the main ideas, used both sources and stayed within the word limit. However, several short phrases have been copied directly or remain very close to the original wording." onSelect={setProblemAnswer} options={[
          { id: "A", text: "It does not contain the main ideas." },
          { id: "B", text: "It relies too heavily on words and phrases from the source texts." },
          { id: "C", text: "It adds too many personal opinions." },
        ]} prompt="What is the main problem with Aisha’s answer?" />
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Stage 4 · Find the repeated language</p>
        <h2>Which wording is too close to the sources?</h2>
        <p>Click the words and short phrases that are identical, or very close, to wording in the two source texts. Do not worry about common grammar words.</p>
        <div className={`ote-paraphrase-language-hunt ${languageChecked ? "is-checked" : ""}`}>
          {aishaSegments.map((segment) => {
            const selected = languageSelections.includes(segment.id);
            const answerClass = languageChecked && segment.target ? `is-${segment.category}` : "";
            const wrongClass = languageChecked && selected && !segment.target ? "is-wrong" : "";
            return <button aria-pressed={selected} className={`${selected ? "is-selected" : ""} ${answerClass} ${wrongClass}`} disabled={languageChecked} key={segment.id} onClick={() => toggleSelection(setLanguageSelections, segment.id)} type="button">{segment.text}</button>;
          })}
        </div>
        {!languageChecked ? <button className="ote-training-primary-link ote-summary-check-button" disabled={!languageSelections.length} onClick={() => setLanguageChecked(true)} type="button">Check highlighted language</button> : (
          <>
            <div className="ote-paraphrase-language-legend"><span className="is-keep">Reasonable to keep</span><span className="is-change">Worth expressing more independently</span>{languageSelections.some((id) => id.startsWith("decoy-")) ? <span className="is-wrong">Not source-dependent</span> : null}</div>
            <p className="ote-summary-question-explanation">You found {languageScore} of {aishaSegments.filter((segment) => segment.target).length} source-dependent words or phrases. The full answer key is now highlighted.</p>
            <aside className="ote-summary-key-message"><Target size={22} aria-hidden="true" /><div><strong>Keep meaning, not every word</strong><p>Repeating a word does not automatically make a summary weak. Technical terms and precise labels can often be retained. The main problem occurs when several distinctive phrases and sentence patterns are taken from the sources. Paraphrase the wider message rather than forcing a synonym for every word.</p></div></aside>
          </>
        )}
      </section>

      <section className="ote-training-section">
        <p className="ote-kicker">Stage 5 · Rephrase the student’s wording</p>
        <div className="ote-paraphrase-rewrite-heading">
          <div>
            <h2>Write short, natural alternatives</h2>
            <p>You may change the grammar as well as the vocabulary. There is no single correct paraphrase.</p>
          </div>
          <span>{Object.keys(submittedRewrites).length}/{paraphrasePrompts.length} submitted</span>
        </div>
        <div className="ote-paraphrase-rewrite-grid">
          {paraphrasePrompts.map((item, index) => {
            const submitted = Boolean(submittedRewrites[item.id]);
            const value = rewrites[item.id] || "";
            return (
              <article className={submitted ? "is-submitted" : ""} key={item.id}>
                <label htmlFor={`paraphrase-${item.id}`}><span>{index + 1}</span>{item.phrase}</label>
                <input
                  disabled={submitted}
                  id={`paraphrase-${item.id}`}
                  onChange={(event) => setRewrites((current) => ({ ...current, [item.id]: event.target.value }))}
                  placeholder="Write an alternative..."
                  type="text"
                  value={value}
                />
                <button
                  className="ote-paraphrase-submit"
                  disabled={!value.trim() || submitted}
                  onClick={() => setSubmittedRewrites((current) => ({ ...current, [item.id]: true }))}
                  type="button"
                >
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {submitted ? "Paraphrase submitted" : "Submit paraphrase"}
                </button>
                {submitted ? (
                  <div className="ote-paraphrase-suggestions">
                    <strong>Suggested alternatives</strong>
                    <ul>{item.answers.map((answer) => <li key={answer}>{answer}</li>)}</ul>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {Object.keys(submittedRewrites).length ? <p className="ote-summary-question-explanation">A good alternative should preserve the original meaning, sound natural and fit the sentence in which it will be used.</p> : null}
      </section>

      <section className="ote-training-section ote-training-quiz">
        <p className="ote-kicker">Stage 6 · Compare with a revised version</p>
        <article className="ote-paraphrase-student-summary is-revised"><header><h2>Revised summary</h2><span>81 words</span></header><p>People often rely on social proof when they are unsure what to choose, especially when a large or relatable group behaves similarly. Digital platforms display ratings and popularity indicators, making others’ decisions easy to observe. Initial success can attract further attention, but fake accounts, manipulated ratings or a chance head start may allow weaker products to outperform superior options. Popularity is therefore useful only when it comes from an appropriate group, has not been artificially influenced and is supported by independent evidence.</p></article>
        <MultiSelect checked={finalChecked} onCheck={() => setFinalChecked(true)} onToggle={(id) => toggleSelection(setFinalAnswers, id)} options={finalOptions} prompt="Which changes make this version more independent? Select all that apply." selected={finalAnswers} />
        {finalChecked ? <>
          <aside className="ote-summary-takeaway"><Target size={25} aria-hidden="true" /><div><strong>Lesson takeaway</strong><p>Keep precise technical terms when necessary, but express the surrounding ideas through your own vocabulary and sentence structures.</p></div></aside>
          <div className="ote-training-complete"><strong>Lesson complete.</strong><span>You have practised recognising source dependence and building natural paraphrases.</span><button onClick={resetLesson} type="button"><RotateCcw size={17} aria-hidden="true" /> Try again</button></div>
        </> : null}
      </section>
    </main>
  );
}
