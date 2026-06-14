import AptisDemoBadge from "../access/AptisDemoBadge.jsx";

const DEFAULT_COPY =
  "You are using the listening demo. Full access unlocks the complete listening task library and mistake review.";

export default function ListeningDemoNotice({ user, aptisAccess, onSignIn, children = DEFAULT_COPY }) {
  if (!aptisAccess?.isDemoMode) return null;

  return (
    <div className="listening-demo-wrap">
      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />
      <div className="listening-demo-note" role="note">
        {children}
      </div>
    </div>
  );
}
