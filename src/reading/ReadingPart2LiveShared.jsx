import React from "react";
import { ArrowDown, ArrowUp, CornerDownLeft, GripVertical } from "lucide-react";

function getPart2Candidates(task, candidateIds = []) {
  const byId = new Map(task.text.sentences.map((sentence) => [sentence.id, sentence]));
  const ids = Array.isArray(candidateIds) ? candidateIds : Object.values(candidateIds || {});
  const storedOrder = ids.map((id) => byId.get(id)).filter(Boolean);
  const answerable = task.text.sentences.filter((sentence) => !sentence.fixed);
  const candidates = storedOrder.length === answerable.length ? storedOrder : answerable;
  const correctOrder = [...answerable].sort((a, b) => a.order - b.order);
  const accidentallyCorrect = candidates.every((sentence, index) => sentence.id === correctOrder[index]?.id);

  // A random shuffle has a 1-in-120 chance of returning the correct order.
  // Rotate it in that case so a live task is never presented already solved.
  return accidentallyCorrect ? [...candidates.slice(1), candidates[0]] : candidates;
}

export function ReadingPart2LiveTask({
  task,
  candidateIds,
  positions = {},
  onPositionsChange,
  disabled = false,
  revealPosition = null,
}) {
  const fixed = task.text.sentences.find((sentence) => sentence.fixed);
  const candidates = getPart2Candidates(task, candidateIds);
  const candidateById = new Map(candidates.map((sentence) => [sentence.id, sentence]));
  const usedIds = new Set(Object.values(positions).filter(Boolean));
  if (revealPosition != null) {
    const revealedSentence = task.text.sentences.find((sentence) => sentence.order === revealPosition);
    if (revealedSentence) usedIds.add(revealedSentence.id);
  }
  const pool = candidates.filter((sentence) => !usedIds.has(sentence.id));

  function commit(next) {
    if (!disabled) onPositionsChange?.(next);
  }

  function placeSentence(order, sentenceId) {
    if (!candidateById.has(sentenceId)) return;
    const next = { ...positions };
    const previousOrder = [1, 2, 3, 4, 5].find((index) => next[index] === sentenceId);
    const displaced = next[order];
    next[order] = sentenceId;
    if (previousOrder && previousOrder !== order) {
      if (displaced) next[previousOrder] = displaced;
      else delete next[previousOrder];
    }
    commit(next);
  }

  function moveSentence(fromOrder, toOrder) {
    if (toOrder < 1 || toOrder > 5 || !positions[fromOrder]) return;
    const next = { ...positions };
    const moving = next[fromOrder];
    next[fromOrder] = next[toOrder];
    next[toOrder] = moving;
    if (!next[fromOrder]) delete next[fromOrder];
    commit(next);
  }

  function returnToPool(order) {
    const next = { ...positions };
    delete next[order];
    commit(next);
  }

  function dragStart(event, payload) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(payload));
  }

  function dropOnSlot(event, order) {
    event.preventDefault();
    if (disabled) return;
    try {
      const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (payload?.type === "pool") placeSentence(order, payload.sentenceId);
      if (payload?.type === "slot") moveSentence(payload.order, order);
    } catch {
      // Ignore unrelated drag data.
    }
  }

  function dropOnPool(event) {
    event.preventDefault();
    if (disabled) return;
    try {
      const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (payload?.type === "slot") returnToPool(payload.order);
    } catch {
      // Ignore unrelated drag data.
    }
  }

  const firstEmptyOrder = [1, 2, 3, 4, 5].find((order) => !positions[order]);

  return (
    <article className={`rp2-live-task ${disabled ? "is-disabled" : ""}`}>
      <section className="rp2-live-order" aria-label="Sentence order">
        <div className="rp2-live-order-row is-fixed"><span>1</span><div><small>Fixed</small><p>{fixed.text}</p></div></div>
        {[1, 2, 3, 4, 5].map((order) => {
          const correctSentence = task.text.sentences.find((sentence) => sentence.order === order);
          const revealed = revealPosition === order;
          const selectedId = revealed ? correctSentence.id : positions[order];
          const selectedSentence = candidateById.get(selectedId);
          return (
            <div
              className={`rp2-live-order-row ${revealed ? "is-revealed" : ""} ${selectedSentence ? "is-filled" : ""}`}
              key={order}
              onDragOver={(event) => { if (!disabled) event.preventDefault(); }}
              onDrop={(event) => dropOnSlot(event, order)}
            >
              <span>{order + 1}</span>
              {selectedSentence ? (
                <div
                  className="rp2-live-slot-content"
                  draggable={!disabled && !revealed}
                  onDragStart={(event) => dragStart(event, { type: "slot", order })}
                >
                  <small>{revealed ? "Correct sentence" : "Drag to change position"}</small>
                  <p>{selectedSentence.text}</p>
                  {!disabled && !revealed ? (
                    <div className="rp2-live-slot-actions">
                      <button aria-label={`Move sentence in position ${order + 1} up`} disabled={order === 1} onClick={() => moveSentence(order, order - 1)} type="button"><ArrowUp size={15} /></button>
                      <button aria-label={`Move sentence in position ${order + 1} down`} disabled={order === 5} onClick={() => moveSentence(order, order + 1)} type="button"><ArrowDown size={15} /></button>
                      <button onClick={() => returnToPool(order)} type="button"><CornerDownLeft size={15} /> Return</button>
                    </div>
                  ) : null}
                  {revealed ? <em><strong>Why this follows:</strong> {correctSentence.explanation}</em> : null}
                </div>
              ) : (
                <div className="rp2-live-placeholder"><strong>Position {order + 1}</strong><span>Drop a sentence here</span></div>
              )}
            </div>
          );
        })}
      </section>

      <aside
        className="rp2-live-bank"
        onDragOver={(event) => { if (!disabled) event.preventDefault(); }}
        onDrop={dropOnPool}
      >
        <header><span>Sentence bank</span><strong>{disabled ? "Scrambled order" : "Drag into the numbered spaces"}</strong></header>
        {pool.map((sentence) => (
          <article
            draggable={!disabled}
            key={sentence.id}
            onDragStart={(event) => dragStart(event, { type: "pool", sentenceId: sentence.id })}
          >
            <GripVertical aria-hidden="true" size={19} />
            <p>{sentence.text}</p>
            {!disabled ? <button disabled={!firstEmptyOrder} onClick={() => placeSentence(firstEmptyOrder, sentence.id)} type="button">Place next</button> : null}
          </article>
        ))}
        {!pool.length ? <p className="rp2-live-bank-empty">{disabled ? "All sentences placed." : "All sentences placed. Drag one back here to remove it."}</p> : null}
      </aside>
    </article>
  );
}

export function ReadingPart2FullReview({ task, players = [], playerPositions }) {
  const studentView = playerPositions !== undefined;
  const positions = playerPositions || {};
  const fixed = task.text.sentences.find((sentence) => sentence.fixed);

  return (
    <section className="rp2-full-review">
      <header>
        <div><span>Complete task review</span><h2>{task.subtitle || task.title}</h2></div>
        <strong>{studentView ? "Your order" : `${players.length} students`}</strong>
      </header>
      <ol>
        <li className="is-fixed"><span>1</span><div><small>Fixed opening</small><p>{fixed.text}</p></div></li>
        {[1, 2, 3, 4, 5].map((order) => {
          const correctSentence = task.text.sentences.find((sentence) => sentence.order === order);
          const selectedSentence = task.text.sentences.find((sentence) => sentence.id === positions[order]);
          const correct = selectedSentence?.id === correctSentence.id;
          const answers = players.map((player) => (
            player.readingPart2Submissions?.[task.id]?.positions?.[order]
            || (player.readingPart2Submission?.taskId === task.id ? player.readingPart2Submission.positions?.[order] : null)
          )).filter(Boolean);
          const correctCount = answers.filter((id) => id === correctSentence.id).length;
          const percent = answers.length ? Math.round((correctCount / answers.length) * 100) : 0;
          const stateClass = studentView ? correct ? "is-correct" : selectedSentence ? "is-wrong" : "is-empty" : "is-correct";
          return (
            <li className={stateClass} key={order}>
              <span>{order + 1}</span>
              <div>
                <div className="rp2-full-review-label">
                  <small>{studentView ? correct ? "Correctly placed" : selectedSentence ? "Incorrectly placed" : "Not placed" : "Correct position"}</small>
                  {!studentView ? <strong>{percent}% correct · {correctCount}/{answers.length}</strong> : null}
                </div>
                {studentView && selectedSentence ? <p className="rp2-full-review-student">{selectedSentence.text}</p> : null}
                {(!studentView || !correct) ? <p className="rp2-full-review-answer"><strong>{studentView ? "Correct answer:" : "Answer:"}</strong> {correctSentence.text}</p> : null}
                <em><strong>Why this follows:</strong> {correctSentence.explanation}</em>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ReadingPart2Distribution({ task, candidateIds, players, position }) {
  const candidates = getPart2Candidates(task, candidateIds);
  const correctSentence = task.text.sentences.find((sentence) => sentence.order === position);
  const submissions = players.map((player) => (
    player.readingPart2Submissions?.[task.id]?.positions?.[position]
    || (player.readingPart2Submission?.taskId === task.id ? player.readingPart2Submission.positions?.[position] : null)
  )).filter(Boolean);
  const max = Math.max(1, submissions.length);

  return (
    <section className="rp2-live-distribution">
      <header><div><span>Position {position + 1}</span><h2>Class choices</h2></div><strong>{submissions.length} submitted</strong></header>
      <div>{candidates.map((sentence) => {
        const count = submissions.filter((id) => id === sentence.id).length;
        const correct = sentence.id === correctSentence.id;
        return (
          <article className={correct ? "is-correct" : ""} key={sentence.id}>
            <p>{sentence.text}</p><i><b style={{ width: `${Math.round((count / max) * 100)}%` }} /></i><strong>{count}</strong>
          </article>
        );
      })}</div>
      <p><strong>Why this follows:</strong> {correctSentence.explanation}</p>
    </section>
  );
}
