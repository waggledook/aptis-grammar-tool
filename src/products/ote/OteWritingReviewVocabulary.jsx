import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Film,
  GraduationCap,
  Lightbulb,
  MapPinned,
  RotateCcw,
  Smartphone,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { REVIEW_VOCAB_TOPICS } from "./data/oteReviewVocabularyData.js";
import "./styles/ote.css";

const STORAGE_KEY = "ote-review-vocabulary-v1";

const ICONS = {
  film: Film,
  utensils: Utensils,
  map: MapPinned,
  smartphone: Smartphone,
  graduation: GraduationCap,
};

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function blankTopicState() {
  return {
    matched: {},
    gapAnswers: {},
    gapCorrect: {},
    rewrite: "",
    modelShown: false,
  };
}

function initialState() {
  const blank = Object.fromEntries(REVIEW_VOCAB_TOPICS.map((topic) => [topic.id, blankTopicState()]));
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return blank;
    return Object.fromEntries(
      REVIEW_VOCAB_TOPICS.map((topic) => [
        topic.id,
        { ...blankTopicState(), ...(saved[topic.id] || {}) },
      ])
    );
  } catch {
    return blank;
  }
}

function topicStats(topic, state) {
  const matchScore = Object.keys(state.matched || {}).length;
  const gapScore = Object.keys(state.gapCorrect || {}).length;
  const rewriteComplete = Boolean(state.rewrite?.trim() && state.modelShown);
  return {
    matchScore,
    gapScore,
    score: matchScore + gapScore,
    activities: Number(matchScore === 12) + Number(gapScore === 8) + Number(rewriteComplete),
    complete: matchScore === 12 && gapScore === 8 && rewriteComplete,
  };
}

export default function OteWritingReviewVocabulary({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [activeTopicId, setActiveTopicId] = useState(REVIEW_VOCAB_TOPICS[0].id);
  const [activeActivity, setActiveActivity] = useState(0);
  const [state, setState] = useState(initialState);
  const completionLogged = useRef(false);
  const orders = useMemo(
    () => Object.fromEntries(REVIEW_VOCAB_TOPICS.map((topic) => [topic.id, [shuffle(topic.matches.slice(0, 6)), shuffle(topic.matches.slice(6))]])),
    []
  );
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/article-review" : "/ote/writing/training/article-review");
  const guidePath = getSitePath(nativeRoutes ? "/writing/training/article-review/guide" : "/ote/writing/training/article-review/guide");
  const practicePath = getSitePath(nativeRoutes ? "/writing/training/article-review/practice" : "/ote/writing/training/article-review/practice");
  const activeTopic = REVIEW_VOCAB_TOPICS.find((topic) => topic.id === activeTopicId) || REVIEW_VOCAB_TOPICS[0];
  const activeState = state[activeTopic.id];
  const allStats = useMemo(
    () => Object.fromEntries(REVIEW_VOCAB_TOPICS.map((topic) => [topic.id, topicStats(topic, state[topic.id])])),
    [state]
  );
  const completedTopics = REVIEW_VOCAB_TOPICS.filter((topic) => allStats[topic.id].complete).length;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (completedTopics < REVIEW_VOCAB_TOPICS.length || completionLogged.current) return;
    completionLogged.current = true;
    logOteTrainingCompleted({
      progressId: "writing.article-review.style-upgrade",
      section: "writing",
      part: "part-2",
      mode: "review_vocabulary",
      taskId: "review-vocabulary",
      taskTitle: "Review vocabulary by topic",
      score: REVIEW_VOCAB_TOPICS.reduce((sum, topic) => sum + allStats[topic.id].score, 0),
      total: 100,
    }).catch((error) => console.warn("[OTE review vocabulary] completion save failed", error));
  }, [allStats, completedTopics]);

  function updateTopic(topicId, updater) {
    setState((current) => ({
      ...current,
      [topicId]: updater(current[topicId]),
    }));
  }

  function resetTopic(topicId) {
    updateTopic(topicId, () => blankTopicState());
    setActiveActivity(0);
  }

  function resetAll() {
    const fresh = Object.fromEntries(REVIEW_VOCAB_TOPICS.map((topic) => [topic.id, blankTopicState()]));
    setState(fresh);
    setActiveTopicId(REVIEW_VOCAB_TOPICS[0].id);
    setActiveActivity(0);
    completionLogged.current = false;
  }

  function chooseTopic(topicId) {
    setActiveTopicId(topicId);
    setActiveActivity(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (completedTopics === REVIEW_VOCAB_TOPICS.length) {
    return (
      <main className="ote-training-page ote-review-vocab-page">
        <Seo title="Review Vocabulary Complete | Seif English" description="Review vocabulary practice for OTE Writing Part 2." />
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} /> Back to article / review training
        </button>
        <section className="ote-review-complete">
          <div className="ote-review-complete-mark"><CheckCircle2 size={42} /></div>
          <p className="ote-kicker">Writing Part 2 · Lesson complete</p>
          <h1>Review Vocabulary Complete</h1>
          <p>You have practised 60 useful review expressions across five common topics.</p>
          <div className="ote-review-score-grid">
            {REVIEW_VOCAB_TOPICS.map((topic) => {
              const Icon = ICONS[topic.icon];
              return <article key={topic.id}><Icon size={22} /><span>{topic.shortTitle}</span><strong>{allStats[topic.id].score}/20</strong></article>;
            })}
          </div>
          <aside className="ote-review-reminder">
            <Lightbulb size={24} />
            <div><strong>Choose a specific aspect to evaluate.</strong><p>Instead of “The film was good”, write “The plot was gripping, although some of the characters were one-dimensional.”</p></div>
          </aside>
          <div className="ote-review-final-actions">
            <button type="button" className="is-secondary" onClick={resetAll}><RotateCcw size={18} /> Practise again</button>
            <button type="button" className="is-secondary" onClick={() => navigate(guidePath)}><BookOpen size={18} /> Go to review structure</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed review practice <ArrowRight size={18} /></button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="ote-training-page ote-review-vocab-page">
      <Seo
        title="OTE Review Vocabulary by Topic | Seif English"
        description="Build precise vocabulary for OTE reviews of films, restaurants, travel, technology, courses and experiences."
      />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} /> Back to article / review training
      </button>

      <header className="ote-training-hero ote-review-vocab-hero">
        <div>
          <p className="ote-kicker">Writing Part 2 · Review language</p>
          <h1>Review Vocabulary by Topic</h1>
          <p>Choose a topic and complete three quick activities. Build precise descriptions instead of relying on words like <em>good</em>, <em>bad</em>, <em>nice</em> and <em>interesting</em>.</p>
        </div>
        <div className="ote-review-overall-progress" aria-label={`${completedTopics} of 5 topics complete`}>
          <strong>{completedTopics}<span>/5</span></strong>
          <small>topics complete</small>
        </div>
      </header>

      <nav className="ote-review-topic-picker" aria-label="Review topics">
        {REVIEW_VOCAB_TOPICS.map((topic) => {
          const Icon = ICONS[topic.icon];
          const stats = allStats[topic.id];
          return (
            <button type="button" key={topic.id} className={`${activeTopic.id === topic.id ? "is-active" : ""} ${stats.complete ? "is-complete" : ""}`} onClick={() => chooseTopic(topic.id)}>
              <span className="ote-review-topic-icon"><Icon size={20} /></span>
              <span><strong>{topic.shortTitle}</strong><small>{stats.activities}/3 activities</small></span>
              {stats.complete ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
            </button>
          );
        })}
      </nav>

      <section className="ote-review-workspace">
        <header className="ote-review-topic-head">
          <div><p className="ote-kicker">Current topic</p><h2>{activeTopic.title}</h2></div>
          <div className="ote-review-topic-score"><strong>{allStats[activeTopic.id].score}/20</strong><span>scored points</span></div>
        </header>

        <div className="ote-review-activity-tabs" role="tablist" aria-label="Topic activities">
          {["Match vocabulary", "Complete sentences", "Upgrade the review"].map((label, index) => {
            const complete = index === 0 ? allStats[activeTopic.id].matchScore === 12 : index === 1 ? allStats[activeTopic.id].gapScore === 8 : Boolean(activeState.rewrite.trim() && activeState.modelShown);
            return <button type="button" role="tab" aria-selected={activeActivity === index} className={activeActivity === index ? "is-active" : ""} onClick={() => setActiveActivity(index)} key={label}><span>{complete ? <Check size={16} /> : index + 1}</span>{label}</button>;
          })}
        </div>

        {activeActivity === 0 ? (
          <MatchingActivity key={activeTopic.id} topic={activeTopic} state={activeState} orders={orders[activeTopic.id]} update={(updater) => updateTopic(activeTopic.id, updater)} onNext={() => setActiveActivity(1)} />
        ) : activeActivity === 1 ? (
          <GapActivity key={activeTopic.id} topic={activeTopic} state={activeState} update={(updater) => updateTopic(activeTopic.id, updater)} onNext={() => setActiveActivity(2)} />
        ) : (
          <RewriteActivity key={activeTopic.id} topic={activeTopic} state={activeState} update={(updater) => updateTopic(activeTopic.id, updater)} onNextTopic={() => {
            const index = REVIEW_VOCAB_TOPICS.findIndex((topic) => topic.id === activeTopic.id);
            const next = REVIEW_VOCAB_TOPICS[(index + 1) % REVIEW_VOCAB_TOPICS.length];
            chooseTopic(next.id);
          }} />
        )}

        <footer className="ote-review-workspace-footer">
          <span>{allStats[activeTopic.id].activities}/3 activities complete</span>
          <button type="button" onClick={() => resetTopic(activeTopic.id)}><RotateCcw size={16} /> Reset this topic</button>
        </footer>
      </section>
    </main>
  );
}

function MatchingActivity({ topic, state, orders, update, onNext }) {
  const [round, setRound] = useState(0);
  const [selectedWord, setSelectedWord] = useState("");
  const [selectedDefinition, setSelectedDefinition] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [wrongPair, setWrongPair] = useState({ word: "", definition: "" });
  const items = orders[round];
  const words = useMemo(() => shuffle(items.map(([word]) => word)), [items]);
  const definitions = useMemo(() => shuffle(items.map(([, definition]) => definition)), [items]);
  const roundComplete = items.every(([word]) => state.matched[word]);
  const allComplete = Object.keys(state.matched).length === 12;

  function tryMatch(word, definition) {
    const correctDefinition = topic.matches.find(([itemWord]) => itemWord === word)?.[1];
    if (correctDefinition === definition) {
      update((current) => ({ ...current, matched: { ...current.matched, [word]: definition } }));
      setFeedback({ correct: true, text: `Correct — ${word}` });
      setWrongPair({ word: "", definition: "" });
    } else {
      setFeedback({ correct: false, text: "Not quite. Both choices are still available — try a different pairing." });
      setWrongPair({ word, definition });
      window.setTimeout(() => setWrongPair({ word: "", definition: "" }), 480);
    }
    setSelectedWord("");
    setSelectedDefinition("");
  }

  function chooseWord(word) {
    if (state.matched[word]) return;
    setFeedback(null);
    if (selectedDefinition) {
      tryMatch(word, selectedDefinition);
      return;
    }
    setSelectedWord(word);
    setSelectedDefinition("");
  }

  function chooseDefinition(definition) {
    const alreadyMatched = Object.values(state.matched).includes(definition);
    if (alreadyMatched) return;
    setFeedback(null);
    if (selectedWord) {
      tryMatch(selectedWord, definition);
      return;
    }
    setSelectedDefinition(definition);
    setSelectedWord("");
  }

  return (
    <div className="ote-review-activity-panel" role="tabpanel">
      <div className="ote-review-activity-intro"><div><p className="ote-kicker">Activity 1 · Round {round + 1} of 2</p><h3>Match each expression to its meaning</h3><p>Choose from either column, then select its match on the other side. Your pair is checked immediately.</p></div><strong>{items.filter(([word]) => state.matched[word]).length}/6</strong></div>
      <div className="ote-review-match-grid">
        <div><h4>Expression</h4>{words.map((word) => <button type="button" disabled={Boolean(state.matched[word])} className={`${selectedWord === word ? "is-selected" : ""} ${state.matched[word] ? "is-matched" : ""} ${wrongPair.word === word ? "is-wrong-pair" : ""}`} onClick={() => chooseWord(word)} key={word}>{state.matched[word] && <Check size={16} />}{word}</button>)}</div>
        <div><h4>Meaning</h4>{definitions.map((definition) => {
          const matchedWord = Object.keys(state.matched).find((word) => state.matched[word] === definition);
          return <button type="button" disabled={Boolean(matchedWord)} className={`${selectedDefinition === definition ? "is-selected" : ""} ${matchedWord ? "is-matched" : ""} ${wrongPair.definition === definition ? "is-wrong-pair" : ""}`} onClick={() => chooseDefinition(definition)} key={definition}>{matchedWord && <Check size={16} />}{definition}</button>;
        })}</div>
      </div>
      <div className="ote-review-check-row">
        <div className={`ote-review-inline-feedback ${feedback ? (feedback.correct ? "is-correct" : "is-wrong") : ""}`} aria-live="polite">{feedback ? (feedback.correct ? <CheckCircle2 size={18} /> : <X size={18} />) : null}<span>{feedback?.text || (selectedWord || selectedDefinition ? "Now choose its match from the other column." : "Choose any expression or meaning to begin.")}</span></div>
        {roundComplete ? (round === 0 ? <button type="button" onClick={() => { setRound(1); setFeedback(null); }}>Start round 2 <ArrowRight size={17} /></button> : <button type="button" onClick={onNext}>Continue <ArrowRight size={17} /></button>) : null}
      </div>
      {allComplete ? <aside className="ote-review-tip"><Sparkles size={20} /><p><strong>All 12 matched.</strong> {topic.feedback}</p></aside> : null}
    </div>
  );
}

function GapActivity({ topic, state, update, onNext }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const item = topic.gaps[index];
  const wordBank = topic.gaps.map((gap) => gap[2]);
  const selected = state.gapAnswers[index] || "";
  const correct = Boolean(state.gapCorrect[index]);
  const complete = Object.keys(state.gapCorrect).length === 8;

  function choose(word) {
    if (correct) return;
    update((current) => ({ ...current, gapAnswers: { ...current.gapAnswers, [index]: word } }));
    setFeedback("");
  }

  function check() {
    if (!selected) return;
    if (selected.toLowerCase() === item[2].toLowerCase()) {
      update((current) => ({ ...current, gapCorrect: { ...current.gapCorrect, [index]: true } }));
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
  }

  function goTo(next) {
    setIndex(next);
    setFeedback("");
  }

  return (
    <div className="ote-review-activity-panel" role="tabpanel">
      <div className="ote-review-activity-intro"><div><p className="ote-kicker">Activity 2 · Sentence {index + 1} of 8</p><h3>Complete the review sentence</h3><p>Use the meaning hint to choose the most precise expression.</p></div><strong>{Object.keys(state.gapCorrect).length}/8</strong></div>
      <div className="ote-review-gap-navigator">
        <div className="ote-review-gap-progress-label"><span>Sentence navigator</span><strong>{index + 1} of 8</strong></div>
        <div className="ote-review-gap-progress">{topic.gaps.map((_, itemIndex) => <button type="button" aria-label={`Sentence ${itemIndex + 1}`} aria-current={itemIndex === index ? "step" : undefined} className={`${itemIndex === index ? "is-active" : ""} ${state.gapCorrect[itemIndex] ? "is-complete" : ""}`} onClick={() => goTo(itemIndex)} key={itemIndex}>{state.gapCorrect[itemIndex] ? <Check size={14} /> : itemIndex + 1}</button>)}</div>
      </div>
      <article className={`ote-review-gap-card ${correct ? "is-correct" : feedback === "wrong" ? "is-wrong" : ""}`}>
        <p className="ote-review-gap-sentence">{item[0].split("___").map((part, partIndex) => <React.Fragment key={`${part}-${partIndex}`}>{part}{partIndex === 0 ? <span>{selected || "choose a word"}</span> : null}</React.Fragment>)}</p>
        <p className="ote-review-meaning"><Lightbulb size={17} /><strong>Meaning:</strong> {item[1]}</p>
      </article>
      <div className="ote-review-word-bank" aria-label="Word bank">{wordBank.map((word) => {
        const usedElsewhere = Object.entries(state.gapAnswers).some(([answerIndex, answer]) => Number(answerIndex) !== index && answer === word && state.gapCorrect[answerIndex]);
        return <button type="button" disabled={usedElsewhere || correct} className={selected === word ? "is-selected" : ""} onClick={() => choose(word)} key={word}>{word}</button>;
      })}</div>
      <div className="ote-review-check-row">
        <div className={`ote-review-inline-feedback ${feedback ? `is-${feedback}` : ""}`} aria-live="polite">{feedback === "correct" ? <><CheckCircle2 size={18} /><span>Correct. The context and meaning point to <strong>{item[2]}</strong>.</span></> : feedback === "wrong" ? <><X size={18} /><span>Not quite. Use the hint and try another expression.</span></> : <span>Choose an expression, then check your answer.</span>}</div>
        {correct && index < 7 ? <button type="button" onClick={() => goTo(index + 1)}>Next sentence <ArrowRight size={17} /></button> : complete ? <button type="button" onClick={onNext}>Continue <ArrowRight size={17} /></button> : <button type="button" disabled={!selected || correct} onClick={check}>Check answer</button>}
      </div>
    </div>
  );
}

function RewriteActivity({ topic, state, update, onNextTopic }) {
  const words = state.rewrite.trim() ? state.rewrite.trim().split(/\s+/).length : 0;
  const complete = Boolean(state.rewrite.trim() && state.modelShown);
  return (
    <div className="ote-review-activity-panel" role="tabpanel">
      <div className="ote-review-activity-intro"><div><p className="ote-kicker">Activity 3 · Free writing</p><h3>Upgrade the review</h3><p>Replace vague words with precise vocabulary from this topic. Your version will not be marked right or wrong.</p></div>{complete ? <CheckCircle2 className="ote-review-done-icon" size={30} /> : <Sparkles size={30} />}</div>
      <div className="ote-review-upgrade-layout">
        <article className="ote-review-original"><span>Original</span><p>{topic.original}</p></article>
        <div className="ote-review-rewrite-box">
          <label htmlFor={`rewrite-${topic.id}`}>Your upgraded review</label>
          <textarea id={`rewrite-${topic.id}`} rows="4" value={state.rewrite} placeholder="Write one or two precise sentences…" onChange={(event) => update((current) => ({ ...current, rewrite: event.target.value, modelShown: false }))} />
          <div><span>{words} {words === 1 ? "word" : "words"}</span><button type="button" disabled={!state.rewrite.trim()} onClick={() => update((current) => ({ ...current, modelShown: true }))}>Show possible answer</button></div>
        </div>
      </div>
      {state.modelShown ? <div className="ote-review-models"><article><span>Possible answer</span><p>{topic.model}</p></article><article><span>Another good option</span><p>{topic.alternative}</p></article></div> : null}
      {complete ? <div className="ote-review-check-row"><div className="ote-review-inline-feedback is-correct"><CheckCircle2 size={18} /><span>Activity complete. Compare the specific aspects and contrast language in the examples.</span></div><button type="button" onClick={onNextTopic}>Choose next topic <ArrowRight size={17} /></button></div> : null}
    </div>
  );
}
