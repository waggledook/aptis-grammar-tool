import React from "react";

const APP_LABELS = {seifhub: "Seif Hub", aptisTrainer: "Aptis Trainer", ote: "OTE"};

function describeAccess(access) {
  if (!access.active) return "Access off";
  const dates = [access.startDate && `From ${access.startDate}`];
  dates.push(access.indefinite || !access.endDate ? "No expiry" : `Until ${access.endDate}`);
  return (
    <div style={{display: "flex", flexDirection: "column", gap: "0.2rem"}}>
      {dates.filter(Boolean).map((date) => <span key={date} style={{whiteSpace: "nowrap"}}>{date}</span>)}
    </div>
  );
}

export default function SchoolCancellationReview({review, school, saving, error, onDecide}) {
  return (
    <section aria-label="Review school cancellation" style={{padding: "1rem 1.1rem", borderBottom: "1px solid #374151"}}>
      <h3 style={{margin: "0 0 0.6rem"}}>School cancellation conflicts with manual access</h3>
      {review ? (
        <>
          <p style={{color: "#cbd5e1", lineHeight: 1.6}}>
            The school marked this student as cancelled on {review.cancellationDate}.
            {school?.courseEndDate ? ` School course end: ${school.courseEndDate}.` : ""}
            {" Manual access remains in effect, including its saved expiry, while you review this change."}
          </p>
          <div style={{overflowX: "auto"}}>
            <table style={{width: "100%", borderCollapse: "collapse", textAlign: "left"}}>
              <thead>
                <tr>
                  {["App", "Manual override · kept for now", "If cancellation is applied"].map((label) => (
                    <th key={label} style={{padding: "0.65rem", borderBottom: "1px solid #475569", fontSize: "0.8rem"}}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(review.entries).map(([key, entry]) => (
                  <tr key={key}>
                    <th scope="row" style={{padding: "0.65rem", borderBottom: "1px solid #334155"}}>{APP_LABELS[key] || key}</th>
                    <td style={{padding: "0.65rem", borderBottom: "1px solid #334155", color: "#bbf7d0"}}>{describeAccess(entry.manualAccess)}</td>
                    <td style={{padding: "0.65rem", borderBottom: "1px solid #334155", color: "#fed7aa"}}>{describeAccess(entry.proposedAccess)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6}}>
            Applying the cancellation returns these apps to automatic school management.
            Keeping the override preserves your decision for repeated updates of this cancellation.
          </p>
          <div style={{display: "flex", flexWrap: "wrap", gap: "0.65rem"}}>
            <button type="button" className="review-btn" disabled={saving} onClick={() => onDecide("keep")}>
              {saving ? "Saving…" : "Keep manual override"}
            </button>
            <button type="button" className="ghost-btn" style={{marginLeft: 0}} disabled={saving} onClick={() => onDecide("apply")}>
              Apply school cancellation
            </button>
          </div>
        </>
      ) : <p>This cancellation is no longer awaiting review.</p>}
      {error ? <p role="alert" style={{color: "#fca5a5"}}>{error}</p> : null}
    </section>
  );
}
