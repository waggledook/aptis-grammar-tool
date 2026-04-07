import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { sendHubAccessRequest } from "../../firebase";
import { toast } from "../../utils/toast";

export default function HubLanding({ user, hasAccess, onSignIn }) {
  const navigate = useNavigate();
  const [sendingRequest, setSendingRequest] = useState(false);
  const spotlight = useMemo(() => {
    if (!user || !hasAccess) return null;

    const options = [
      {
        label: "Try this next",
        title: "Use Of English",
        copy: "Jump back into keyword transformations, word formation, or open cloze with instant corrective feedback.",
        button: "Open Use of English",
        action: () => navigate(getSitePath("/use-of-english")),
      },
      {
        label: "Try this next",
        title: "Mini Grammar Tests",
        copy: "Do a short focused grammar test and build your level-by-level mini test record.",
        button: "Open mini tests",
        action: () => navigate(getSitePath("/grammar/mini-tests")),
      },
      {
        label: "Worth exploring",
        title: "Games",
        copy: "Switch gears with faster challenge-style practice to notice mistakes and react quickly.",
        button: "Open games",
        action: () => navigate(getSitePath("/games")),
      },
      {
        label: "Worth exploring",
        title: "Listening Activities",
        copy: "Work on listening accuracy through dictation and other guided listening tasks.",
        button: "Open listening",
        action: () => navigate(getSitePath("/listening")),
      },
      {
        label: "Worth exploring",
        title: "Vocabulary Activities",
        copy: "Review useful words and expressions in context and build topic vocabulary.",
        button: "Open vocabulary",
        action: () => navigate(getSitePath("/vocabulary")),
      },
      {
        label: "Keep going",
        title: "Student Profile",
        copy: "Check your recent activity, see what you’ve completed, and decide what to tackle next.",
        button: "Open profile",
        action: () => navigate(getSitePath("/profile")),
      },
    ];

    return options[Math.floor(Math.random() * options.length)];
  }, [user, hasAccess, navigate]);

  const statusLabel = !user
    ? "Member access"
    : hasAccess
      ? spotlight?.label || "Welcome back"
      : "Access pending";
  const statusTitle = hasAccess ? spotlight?.title || "Welcome back" : null;
  const statusCopy = !user
    ? "Sign in with your academy account to enter the private hub and open your activities."
    : hasAccess
      ? spotlight?.copy || "Your account has access to the academy hub. Choose an activity area to continue."
      : "Your account is signed in, but it is not currently enabled for the hub. If you think this should already be active, you can request access below.";

  async function handleRequestAccess() {
    if (sendingRequest) return;
    setSendingRequest(true);

    try {
      await sendHubAccessRequest();
      toast(
        user?.email
          ? `Request sent. We’ve emailed a copy to ${user.email}.`
          : "Request sent. We’ll review your Seif Hub access shortly."
      );
    } catch (err) {
      console.error("Hub access request failed:", err);
      toast("Sorry — failed to send the request. Please try again.");
    } finally {
      setSendingRequest(false);
    }
  }

  return (
    <div className="menu-wrapper hub-menu-wrapper">
      <Seo
        title="Seif Hub | BeeSkills English"
        description="Private learning hub for BeeSkills English academy students. Sign in to access your activities, practice pages and course resources."
      />

      <header
        className="main-header"
        style={{ textAlign: "center", marginBottom: "0rem" }}
      >
        <img
          src="/images/seif-english-hub-logo.png"
          alt="Seif English Hub Logo"
          className="menu-logo hub-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">
        Private student hub for Seif English students.
      </p>

      <div className="whats-new-banner hub-status-banner">
        <div className="whats-new-copy">
          <span className="whats-new-label">{statusLabel}</span>
          {statusTitle ? <h3>{statusTitle}</h3> : null}
          <p>{statusCopy}</p>
        </div>

        {!user && (
          <button className="whats-new-btn" onClick={onSignIn}>
            Sign in
          </button>
        )}

        {user && hasAccess && (
          <button className="whats-new-btn" onClick={() => spotlight?.action?.()}>
            {spotlight?.button || "Open hub"}
          </button>
        )}

        {user && !hasAccess && (
          <button className="whats-new-btn" onClick={handleRequestAccess} disabled={sendingRequest}>
            {sendingRequest ? "Sending..." : "Request access"}
          </button>
        )}
      </div>

      {!!user && (
        <>
          <div className="menu-grid">
            <button
              className="menu-card"
              onClick={() => (hasAccess ? navigate(getSitePath("/your-class")) : onSignIn?.())}
            >
              <h3>Your Class</h3>
              <p>See teacher-assigned tests and the class activity that’s been set up for you in the hub.</p>
            </button>

            <button
              className="menu-card"
              onClick={() => (hasAccess ? navigate(getSitePath("/grammar")) : onSignIn?.())}
            >
              <h3>Grammar Activities</h3>
              <p>Practise grammar through guided activities, mini tests, and focused study tasks.</p>
            </button>

            <button
              className="menu-card"
              onClick={() => (hasAccess ? navigate(getSitePath("/listening")) : onSignIn?.())}
            >
              <h3>Listening Activities</h3>
              <p>Build listening accuracy through dictation practice and other guided listening work.</p>
            </button>

            <button
              className="menu-card"
              onClick={() => (hasAccess ? navigate(getSitePath("/vocabulary")) : onSignIn?.())}
            >
              <h3>Vocabulary Activities</h3>
              <p>Expand topic vocabulary and review useful words and expressions in context.</p>
            </button>

            <button
              className="menu-card"
              onClick={() => (hasAccess ? navigate(getSitePath("/profile")) : onSignIn?.())}
            >
              <h3>Student Profile</h3>
              <p>Check your progress, review your activity, and keep track of your learning.</p>
            </button>

            <button
              className="menu-card"
              onClick={() => (hasAccess ? navigate(getSitePath("/use-of-english")) : onSignIn?.())}
            >
              <h3>Use Of English</h3>
              <p>Practise key word transformations and word formation with instant corrective feedback.</p>
            </button>

            <button
              className="menu-card"
              onClick={() => (hasAccess ? navigate(getSitePath("/games")) : onSignIn?.())}
            >
              <h3>Games</h3>
              <p>Practise through quick challenge-style activities that help you notice mistakes and react fast.</p>
            </button>

            {(user?.role === "teacher" || user?.role === "admin") && (
              <button
                className="menu-card"
                onClick={() => navigate(getSitePath("/teacher-tools"))}
              >
                <h3>Teacher Tools</h3>
                <p>
                  Build Aptis grammar sets, create custom Use of English quizzes,
                  and review student performance from one shared teacher workspace.
                </p>
              </button>
            )}

            {(user?.role === "teacher" || user?.role === "admin") && (
              <button
                className="menu-card"
                onClick={() => navigate(getSitePath("/my-students"))}
              >
                <h3>My Students</h3>
                <p>
                  View your class list, open submissions, track assigned work,
                  and check student progress from one place.
                </p>
              </button>
            )}

            {user?.role === "admin" && (
              <button
                className="menu-card"
                onClick={() => navigate(getSitePath("/admin"))}
              >
                <h3>Admin Tools</h3>
                <p>Manage access, user roles, and activity data across the shared student platform.</p>
              </button>
            )}
          </div>

          <div className="promo-banner hub-promo-banner">
            <p>
              Current academy students only.
              <span>
                {" "}If your account should already be active for the hub, contact BeeSkills
                English and we can enable access.
              </span>
            </p>
          </div>
        </>
      )}

      <style>{`
        .hub-menu-wrapper {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-menu-wrapper .main-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
          line-height: 0;
          text-align: center;
        }

        .hub-menu-wrapper .menu-logo {
          display: block;
          width: clamp(220px, 26vw, 380px);
          height: auto;
          filter:
            drop-shadow(0 0 10px rgba(255,255,255,0.5))
            drop-shadow(0 0 18px rgba(255,165,0,0.35));
          animation: hubLogoFade 1.2s ease both;
          transition: filter .3s ease;
          margin: 0;
        }

        .hub-menu-wrapper .menu-logo:hover {
          filter:
            drop-shadow(0 0 12px rgba(255,255,255,0.8))
            drop-shadow(0 0 25px rgba(255,165,0,0.5));
        }

        @keyframes hubLogoFade {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .hub-menu-wrapper .menu-sub {
          opacity: .85;
          margin-top: .2rem;
          margin-bottom: .6rem;
          text-align: center;
        }

        .hub-menu-wrapper .whats-new-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin: 0 0 1rem;
          padding: .9rem 1rem;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            rgba(255, 191, 73, 0.10),
            rgba(255, 191, 73, 0.04)
          );
          border: 1px solid rgba(255, 191, 73, 0.35);
        }

        .hub-menu-wrapper .whats-new-copy {
          min-width: 0;
        }

        .hub-menu-wrapper .whats-new-label {
          display: inline-block;
          margin-bottom: .35rem;
          padding: .2rem .55rem;
          border-radius: 999px;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .02em;
          color: #ffcf70;
          background: rgba(255, 191, 73, 0.12);
          border: 1px solid rgba(255, 191, 73, 0.28);
        }

        .hub-menu-wrapper .whats-new-copy p {
          margin: 0;
          color: #e6f0ff;
          line-height: 1.4;
        }

        .hub-menu-wrapper .whats-new-copy h3 {
          margin: 0 0 .3rem;
          color: #eef4ff;
          font-size: 1.05rem;
          line-height: 1.2;
        }

        .hub-menu-wrapper .whats-new-btn {
          flex-shrink: 0;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #13213b;
          border: none;
          border-radius: 12px;
          padding: .7rem 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .08s ease;
        }

        .hub-menu-wrapper .whats-new-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0,0,0,.18);
        }

        .hub-menu-wrapper .menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .hub-menu-wrapper .menu-card {
          text-align: left;
          background: #1a2847;
          border: 2px solid #35508e;
          border-radius: 22px;
          padding: 1.45rem 1.5rem;
          color: #eef4ff;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .hub-menu-wrapper .menu-card:hover {
          transform: translateY(-2px);
          border-color: #4a6bc0;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
        }

        .hub-menu-wrapper .menu-card h3 {
          margin-bottom: .55rem;
          color: #eef4ff;
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .hub-menu-wrapper .menu-card p {
          margin: 0;
          color: rgba(238, 244, 255, 0.88);
          font-size: 1rem;
          line-height: 1.45;
        }

        @media (max-width: 720px) {
          .hub-menu-wrapper .whats-new-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-menu-wrapper .whats-new-btn {
            width: 100%;
          }

          .hub-menu-wrapper .menu-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
