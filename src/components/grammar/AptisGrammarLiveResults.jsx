import React, { useMemo, useState } from "react";
import { BarChart3, Check, ListOrdered, Trophy } from "lucide-react";
import AptisGrammarOptionExplanations from "./AptisGrammarOptionExplanations.jsx";
import AptisGrammarPodium from "./AptisGrammarPodium.jsx";
import { buildGrammarLiveReport, buildGrammarLiveStandings, formatGrammarPercent } from "./aptisGrammarLiveResults.js";

function QuestionReport({ question, participantCount }) {
  return <details className="agl-report-question">
    <summary>
      <div className="agl-report-question-heading"><span className="agl-report-number">{question.index + 1}</span><div><small>{question.item.level} · {question.item.sourceThemeTitle || "Grammar"}</small><h3>{question.item.text || question.item.sentence}</h3></div><strong className="agl-report-accuracy">{formatGrammarPercent(question.correctPercent)}<small>correct</small></strong></div>
      <div className="agl-report-stack" aria-hidden="true"><i className="is-correct" style={{ width: `${question.correctPercent}%` }} /><i className="is-incorrect" style={{ width: `${question.incorrectPercent}%` }} /><i className="is-unanswered" style={{ width: `${question.unansweredPercent}%` }} /></div>
      <div className="agl-report-legend"><span className="is-correct">Correct {formatGrammarPercent(question.correctPercent)}</span><span className="is-incorrect">Incorrect {formatGrammarPercent(question.incorrectPercent)}</span><span className="is-unanswered">No answer {formatGrammarPercent(question.unansweredPercent)}</span><b><span className="agl-report-expand">View answers</span><span className="agl-report-collapse">Hide answers</span></b></div>
    </summary>
    <div className="agl-report-question-body"><p className="agl-report-answer-title">What the class chose <span>Percentages of all {participantCount} students</span></p>
      <div className="agl-report-answers">{question.options.map((option) => <div className={`agl-report-answer ${option.correct ? "is-correct" : ""}`} key={option.index}>
        <div><span className="agl-option-letter">{String.fromCharCode(65 + option.index)}</span><strong>{option.text}</strong>{option.correct && <Check size={17} aria-label="Correct answer" />}<span>{option.count}/{participantCount} · <b>{formatGrammarPercent(option.percent)}</b></span></div>
        <div className="agl-report-answer-track" aria-hidden="true"><i style={{ width: `${option.percent}%` }} /></div>
      </div>)}<div className="agl-report-answer is-unanswered"><div><strong>No answer</strong><span>{question.unanswered}/{participantCount} · <b>{formatGrammarPercent(question.unansweredPercent)}</b></span></div><div className="agl-report-answer-track" aria-hidden="true"><i style={{ width: `${question.unansweredPercent}%` }} /></div></div></div>
      <AptisGrammarOptionExplanations item={question.item} />
    </div>
  </details>;
}

function ClassReport({ report }) {
  const [sort, setSort] = useState("question");
  const questions = useMemo(() => sort === "challenging"
    ? [...report.questions].sort((left, right) => left.correctPercent - right.correctPercent || left.index - right.index)
    : report.questions, [report.questions, sort]);

  return <section className="agl-class-report" aria-labelledby="agl-report-title">
    <header className="agl-results-heading"><div><p className="agl-results-kicker">A picture of your class</p><h2 id="agl-report-title">Anonymous class report</h2><p>Class totals and answer choices, with no student names.</p></div><span className="agl-report-anonymous"><BarChart3 size={17} /> Anonymous</span></header>
    <div className="agl-report-metrics"><div><span>Class accuracy</span><strong>{formatGrammarPercent(report.accuracy)}</strong><small>{report.correct} correct out of {report.opportunities} possible answers</small></div><div><span>Response rate</span><strong>{formatGrammarPercent(report.responseRate)}</strong><small>{report.answered} answers submitted</small></div><div><span>Students</span><strong>{report.participantCount}</strong><small>Joined this activity</small></div><div><span>Questions</span><strong>{report.questionCount}</strong><small>In your quiz</small></div></div>
    <p className="agl-report-note">Percentages use all students who joined. Unanswered questions are shown separately and count in class accuracy. Percentages are rounded.</p>
    {report.participantCount && report.questionCount ? <>
      <div className="agl-report-toolbar"><h3>Question breakdown</h3><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="question">Question order</option><option value="challenging">Most challenging first</option></select></label></div>
      <div className="agl-report-question-list">{questions.map((question) => <QuestionReport key={question.index} question={question} participantCount={report.participantCount} />)}</div>
    </> : <p className="agl-results-empty">No class responses are available for this activity.</p>}
  </section>;
}

export default function AptisGrammarLiveResults({ game }) {
  const [view, setView] = useState("podium");
  const report = useMemo(() => buildGrammarLiveReport(game), [game]);
  const standings = useMemo(() => buildGrammarLiveStandings(game.players), [game.players]);
  const views = [{ id: "podium", label: "Podium", icon: Trophy }, { id: "report", label: "Class report", icon: BarChart3 }, { id: "leaderboard", label: "Leaderboard", icon: ListOrdered }];

  return <div className="agl-results">
    <nav className="agl-results-tabs" aria-label="End of activity views">{views.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={view === id} aria-controls="agl-results-view" onClick={() => setView(id)}><Icon size={17} aria-hidden="true" />{label}</button>)}</nav>
    <div id="agl-results-view">
      {view === "podium" && <><AptisGrammarPodium players={game.players} /><div className="agl-results-next"><div><strong>What did the class learn?</strong><p>Explore the questions together with an anonymous answer breakdown.</p></div><button className="ctl-button ctl-button-primary" type="button" onClick={() => setView("report")}><BarChart3 size={17} /> Open class report</button></div></>}
      {view === "report" && <ClassReport report={report} />}
      {view === "leaderboard" && <section className="agl-results-leaderboard"><div className="agl-results-heading"><div><p className="agl-results-kicker">Everyone’s effort</p><h2>Final leaderboard</h2><p>Points include the speed of correct answers. Equal scores share a place.</p></div></div>{standings.length ? <ol>{standings.map((player) => <li key={player.uid}><span>#{player.rank}</span><strong>{player.name}</strong><b>{player.score.toLocaleString("en-GB")} <small>pts</small></b></li>)}</ol> : <p className="agl-results-empty">No students joined this activity.</p>}</section>}
    </div>
  </div>;
}
