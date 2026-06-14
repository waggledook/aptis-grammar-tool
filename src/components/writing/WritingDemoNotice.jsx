import AptisDemoBadge from "../access/AptisDemoBadge.jsx";

const DEFAULT_COPY =
  "You are using the writing demo. Full access unlocks the complete writing task library and ongoing AI feedback.";

export default function WritingDemoNotice({ user, aptisAccess, onSignIn, children = DEFAULT_COPY }) {
  if (!aptisAccess?.isDemoMode) return null;

  return (
    <div className="writing-demo-wrap">
      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />
      <div className="writing-demo-note" role="note">
        {children}
      </div>
    </div>
  );
}
