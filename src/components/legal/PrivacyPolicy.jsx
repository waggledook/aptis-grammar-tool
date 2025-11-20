// src/components/legal/PrivacyPolicy.jsx
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div
      className="page"
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "1.5rem 1rem 3rem",
      }}
    >
      <h1 style={{ marginBottom: "0.75rem" }}>Seif Aptis Trainer — Privacy Policy</h1>
      <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "1.5rem" }}>
        Last updated: February 2025
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>1. About this application</h2>
        <p>
          <strong>Seif Aptis Trainer</strong> is an online platform designed to help
          learners prepare for the Aptis General and Aptis Advanced exams.
        </p>
        <p>
          The app is developed and maintained by{" "}
          <strong>BeeSkills English (Nicholas David Rudolph Beeson)</strong>,
          operating in Spain.
        </p>
        <p>
          Seif English Academy authorises the use of the Seif Aptis Trainer name
          and branding for educational purposes, but BeeSkills English is solely
          responsible for the operation and data handling of the app.
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
          data is used to identify your account and save your training progress.
        </p>

        <h3>2.2. Exam practice and learning progress</h3>
        <p>
          When you use the app, we store information related to your learning
          activity, such as:
        </p>
        <ul>
          <li>Grammar attempts and scores</li>
          <li>Reading and speaking practice progress</li>
          <li>Saved favourites and recorded mistakes</li>
          <li>Writing submissions and speaking notes you choose to save</li>
          <li>Practice history, such as dates and completed tasks</li>
        </ul>
        <p>
          This allows you to review your performance, track progress, and
          continue practising where you left off.
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

        <h3>2.5. Analytics (Google Analytics)</h3>
        <p>
          We use Google Analytics 4 only if you accept analytics cookies in the
          cookie banner. If you consent, Google Analytics collects information
          such as pages visited, session length, device and browser type, and
          approximate location (e.g. country or region). This helps us
          understand how the platform is used and improve it.
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
          The app uses essential cookies and local storage mechanisms to:
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
            services you chose to use.
          </li>
          <li>
            <strong>Legitimate interests</strong>: maintaining and improving the
            Seif Aptis Trainer platform.
          </li>
          <li>
            <strong>Consent</strong>: only for analytics cookies and Google
            Analytics.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>5. How your data is stored and protected</h2>
        <p>
          We use Firebase Authentication and Firebase Firestore, hosted on
          Google Cloud infrastructure, to store your data securely. All
          connections are encrypted (HTTPS/TLS).
        </p>
        <p>
          Only BeeSkills English administrators can access the database, and
          only for:
        </p>
        <ul>
          <li>Fixing technical issues</li>
          <li>Restoring or managing user progress</li>
          <li>Deleting data when requested</li>
        </ul>
        <p>
          We do not sell, rent, or share your personal data with third parties
          for marketing purposes. Data is shared only with service providers
          required to run the app (e.g. Google Firebase, Google Analytics if
          enabled, and email delivery providers for requested reports).
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>6. Data retention</h2>
        <p>
          Your Seif Aptis Trainer account data is kept for as long as your
          account remains active. If you delete your account or request
          deletion, your progress, notes, recordings (where stored), and
          submissions are removed permanently.
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
          The Seif Aptis Trainer is intended for learners aged 16 and over. We
          do not knowingly collect data from children under 16. If we become
          aware that such data has been collected, it will be deleted.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>9. Changes to this policy</h2>
        <p>
          We may update this privacy policy from time to time. If we make
          significant changes, we will update the “Last updated” date above and
          may notify you within the app.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
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
