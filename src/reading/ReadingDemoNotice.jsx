import AptisDemoBadge from "../components/access/AptisDemoBadge.jsx";

const DEFAULT_COPY =
  "You are using the reading demo. Full access unlocks the complete reading task library.";

export default function ReadingDemoNotice({ user, aptisAccess, onSignIn, children = DEFAULT_COPY }) {
  if (!aptisAccess?.isDemoMode) return null;

  return (
    <div className="reading-demo-wrap">
      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />
      <div className="reading-demo-note" role="note">
        {children}
      </div>
    </div>
  );
}
