// src/components/legal/PrivacyPolicy.jsx
import React from "react";
import { getCookieConsent, openCookieBanner } from "../CookieBanner";

function updateCookiePreference(value) {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem("cookie-consent", value);
  } else {
    window.localStorage.removeItem("cookie-consent");
  }

  window.location.reload();
}

export default function PrivacyPolicy() {
  const consent = typeof window !== "undefined" ? getCookieConsent() : "";

  return (
    <div
      className="page"
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "1.5rem 1rem 3rem",
      }}
    >
      <h1 style={{ marginBottom: "0.75rem" }}>Seif Aptis Trainer and SeifHub — Privacy Policy</h1>
      <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "1.5rem" }}>
        Last updated: April 18, 2026
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>1. Scope and controller</h2>
        <p>
          This privacy policy applies to both <strong>Seif Aptis Trainer</strong>
          and <strong> SeifHub</strong>.
        </p>
        <p>
          Seif Aptis Trainer is designed mainly for Aptis-focused exam practice
          and related learner tools. SeifHub is designed mainly for currently
          enrolled Seif English Academy students and includes classroom,
          assignment, progress, and teacher-managed features.
        </p>
        <p>
          Both services are operated through the same underlying account system,
          authentication, database, access controls, and many shared features.
        </p>
        <p>
          The services are developed and maintained by{" "}
          <strong>BeeSkills English (Nicholas David Rudolph Beeson)</strong>,
          operating in Spain.
        </p>
        <p>
          Seif English Academy authorises the use of the Seif Aptis Trainer and
          SeifHub names and branding for educational purposes, but BeeSkills
          English is responsible for the operation of the platforms and the
          handling of personal data described in this policy.
        </p>
        <p>
          For privacy-related questions, you can contact us at:{" "}
          <a href="mailto:contact@beeskillsenglish.com">
            contact@beeskillsenglish.com
          </a>
          .
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>2. What personal data we collect</h2>
        <h3>2.1. Account information</h3>
        <p>
          When you sign in, we collect your email address, an optional display
          name, and a unique user ID created by Firebase Authentication. This
          data is used to identify your account, manage access, and save your
          training progress.
        </p>
        <p>
          If your account is linked to a teacher, class, school, or site-access
          arrangement, we may also store information needed to manage that
          educational relationship and to control which parts of the service you
          can access.
        </p>

        <h3>2.2. Learning activity, assignments, and progress</h3>
        <p>
          When you use Seif Aptis Trainer or SeifHub, we store information
          related to your learning activity, such as:
        </p>
        <ul>
          <li>Grammar attempts and scores</li>
          <li>Vocabulary progress, flashcards, favourites, and mistakes</li>
          <li>Dictation sessions and related results</li>
          <li>Reading and speaking practice progress</li>
          <li>Writing submissions and speaking notes you choose to save</li>
          <li>Practice history, such as dates and completed tasks</li>
          <li>Assigned activities, completion status, and teacher review data</li>
          <li>Course-test sessions, attempts, scores, and review outcomes</li>
          <li>Teacher-student linking and class organisation information</li>
        </ul>
        <p>
          This allows you to review your performance, track progress, and
          continue practising where you left off, and where relevant, allows
          teachers to set and review work.
        </p>
        <p>
          Where teacher or admin features are used, the relevant teacher and
          authorised administrators can view the information needed to assign
          work, monitor progress, review results, manage access, and prepare
          printable reports.
        </p>

        <h3>2.3. Voice recordings (Speaking practice)</h3>
        <p>
          When using speaking tools, recordings are processed in your browser.
          Audio is not permanently stored unless the feature explicitly says so.
          Where stored, recordings are linked only to your account and are used
          solely for practice and review.
        </p>

        <h3>2.4. Email reports (optional)</h3>
        <p>
          If you request a report by email, we use your email address and the
          report content only to send the requested message. We do not subscribe
          you to any mailing list or use this address for marketing.
        </p>

        <h3>2.5. Technical and usage data</h3>
        <p>
          We may store technical and usage information needed to keep the
          platforms working, secure accounts, debug problems, and understand how
          key features are used. This may include timestamps, progress-state
          records, device/browser-level analytics data where consent is given,
          and activity logs connected to your account.
        </p>

        <h3>2.6. Analytics (Google Analytics)</h3>
        <p>
          We use Google Analytics 4 only if you accept analytics cookies in the
          cookie banner. If you consent, Google Analytics collects information
          such as pages visited, session length, device and browser type, and
          approximate location (e.g. country or region). This helps us
          understand how the services are used and improve them.
        </p>
        <p>
          If you reject analytics cookies, Google Analytics is not activated and
          no analytics data is collected.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>3. Cookies and local storage</h2>
        <h3>3.1. Essential cookies and storage</h3>
        <p>
          Seif Aptis Trainer and SeifHub use essential cookies and local storage
          mechanisms to:
        </p>
        <ul>
          <li>Keep you signed in</li>
          <li>Save and restore your training progress</li>
          <li>Record favourites and mistakes</li>
          <li>Ensure navigation and exercises work correctly</li>
        </ul>
        <p>
          These are necessary for the service you have requested and are
          permitted under GDPR.
        </p>

        <h3>3.2. Analytics cookies (optional)</h3>
        <p>
          Analytics cookies are only used if you click “Accept analytics
          cookies” in the banner. If you click “Reject”, analytics remain
          disabled. Your choice is stored in localStorage and applied on future
          visits.
        </p>
        <p>
          You can change this choice later at any time using the cookie controls
          below.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.9rem" }}>
          <button type="button" onClick={() => updateCookiePreference("accepted")}>
            Allow analytics cookies
          </button>
          <button type="button" onClick={() => updateCookiePreference("rejected")}>
            Turn analytics cookies off
          </button>
          <button type="button" onClick={openCookieBanner}>
            Open cookie banner
          </button>
        </div>
        <p style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.75rem" }}>
          Current setting:{" "}
          <strong>
            {consent === "accepted"
              ? "analytics allowed"
              : consent === "rejected"
                ? "analytics rejected"
                : "not chosen yet"}
          </strong>
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>4. Legal basis for processing</h2>
        <p>
          Under the GDPR, we process your data based on the following legal
          bases:
        </p>
        <ul>
          <li>
            <strong>Performance of a contract</strong>: providing the training
            and educational services you choose to use.
          </li>
          <li>
            <strong>Legitimate interests</strong>: maintaining and improving the
            platforms, securing accounts, administering access, and supporting
            teaching and learning workflows.
          </li>
          <li>
            <strong>Consent</strong>: only for analytics cookies and Google
            Analytics.
          </li>
        </ul>
        <p>
          In some school or teacher-managed situations, parts of the processing
          may also be necessary to deliver assigned educational activities and
          manage participation in the relevant course or programme.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>5. How your data is stored and protected</h2>
        <p>
          We use Firebase Authentication and Firebase Firestore, hosted on
          Google Cloud infrastructure, to store your data securely. All
          connections are encrypted (HTTPS/TLS).
        </p>
        <p>
          Access to personal data is restricted according to role:
        </p>
        <ul>
          <li>Students can access their own account and learning data</li>
          <li>Linked teachers can access data for students assigned to them</li>
          <li>BeeSkills English administrators can access data needed to administer and support the service</li>
        </ul>
        <p>
          This access is used only for running the service, supporting users,
          reviewing assigned work, managing classes, troubleshooting, and
          responding to legal or data-rights requests.
        </p>
        <p>
          We do not sell, rent, or share your personal data with third parties
          for marketing purposes. Data is shared only with service providers
          needed to run the service, such as Google Firebase, Google Analytics
          if enabled, and any email delivery provider used for requested
          reports.
        </p>
        <p>
          Some of these providers may process data outside Spain or the EEA. In
          those cases, we rely on the safeguards made available by the provider,
          such as contractual commitments and transfer mechanisms required under
          data-protection law.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>6. Data retention</h2>
        <p>
          Account data for Seif Aptis Trainer and SeifHub is kept for as long as
          your account remains active and retention is necessary for the service
          or the relevant educational relationship.
        </p>
        <p>
          If your account is deleted or you make a valid deletion request, we
          will delete or anonymise personal data where appropriate, subject to
          any limited information we need to keep for security, audit, legal, or
          educational administration reasons.
        </p>
        <p>
          Teacher-assigned work, course-test records, and related results may
          remain visible to the relevant teacher or administrator for
          educational follow-up unless deletion is requested and applicable, or
          retention is no longer necessary.
        </p>
        <p>
          Any server-side email logs related to report delivery are deleted
          within 30 days.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>7. Your rights</h2>
        <p>
          Under the GDPR, you have the right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Request deletion of your data (“right to be forgotten”)</li>
          <li>Withdraw consent for analytics at any time</li>
          <li>Request a copy of your data in a portable format</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:contact@beeskillsenglish.com">
            contact@beeskillsenglish.com
          </a>
          .
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>8. Children’s privacy</h2>
        <p>
          Seif Aptis Trainer and SeifHub are intended mainly for learners aged
          14 and over. If an account is created for someone under 14, this
          should only happen with the involvement and authorisation of a parent,
          guardian, school, or teacher acting appropriately for that learner.
        </p>
        <p>
          We try to minimise the data used for student accounts. If you believe
          a child has used the service without appropriate authorisation, please
          contact us and we will review and, where appropriate, delete the data.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>9. Product-specific notes</h2>
        <p>
          <strong>Seif Aptis Trainer</strong> may be available more broadly to
          learners using self-study tools, Aptis practice activities, and some
          teacher-linked features.
        </p>
        <p>
          <strong>SeifHub</strong> is generally intended for current Seif
          English Academy students or other users who have been granted
          appropriate access. SeifHub may involve more teacher-managed and
          classroom-linked processing, including assignments, notifications,
          review flows, and access controls.
        </p>
        <p>
          Because the two services share accounts and core infrastructure, data
          connected to your user account may be used across both services where
          needed to operate the educational features you have access to.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this privacy policy from time to time. If we make
          significant changes, we will update the “Last updated” date above and
          may notify you within the app.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          If you have any questions about this policy or how your data is used,
          please contact:
        </p>
        <p>
          📧{" "}
          <a href="mailto:contact@beeskillsenglish.com">
            contact@beeskillsenglish.com
          </a>
        </p>
      </section>
    </div>
  );
}
