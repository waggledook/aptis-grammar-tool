import AptisDemoBadge from "../access/AptisDemoBadge.jsx";

const DEFAULT_COPY =
  "You are using the speaking demo. Full access unlocks the complete speaking task library and ongoing AI feedback.";

export default function SpeakingDemoNotice({ user, aptisAccess, onSignIn, children = DEFAULT_COPY }) {
  if (!aptisAccess?.isDemoMode) return null;

  return (
    <div className="speaking-demo-wrap">
      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />
      <div className="speaking-demo-note" role="note">
        {children}
      </div>
    </div>
  );
}
