// src/components/teacher/SpeakingPart3SimilaritiesExtras.jsx
import React from "react";
import Seo from "../common/Seo.jsx";

export default function SpeakingPart3SimilaritiesExtras() {
  return (
    <div className="game-wrapper speaking-guide">
      <Seo
        title="Speaking Part 3 – Similarities and Differences | Seif Aptis Trainer"
        description="Extra picture pairs for practising similarities and differences in Aptis Speaking Part 3."
      />

      <header className="header">
        <div>
          <h2 className="title">Speaking Part 3 – Similarities &amp; differences</h2>
          <p className="intro">
            Look carefully at each pair of pictures. Say one thing that is similar,
            then explain two important differences. Try to use clear linking phrases
            and give a little detail in every answer.
          </p>
        </div>
      </header>

      <main className="guide-body">
        <section className="panel">
          <h2>1. Fitness enthusiasm vs reluctance</h2>
          <img
            src="/images/speaking/part3-extras/exercise-scenes.png"
            alt="A happy jogger and a tired cyclist pushing a bike uphill."
            className="exercise-image wide"
            draggable="false"
          />
          <ul className="panel-text">
            <li>
              Describe <strong>one similarity</strong> and{" "}
              <strong>two differences</strong> between the pictures.
            </li>
            <li>
              Useful phrases:{" "}
              <em>both pictures…, whereas…, unlike the first photo…</em>.
            </li>
            <li>
              Follow-up question:{" "}
              <em>Which situation would you prefer, and why?</em>
            </li>
          </ul>
        </section>

        <section className="panel">
          <h2>2. Different ways to enjoy free time</h2>
          <img
            src="/images/speaking/part3-extras/music-scenes.png"
            alt="A person jogging with headphones and street musicians playing guitar and singing."
            className="exercise-image wide"
            draggable="false"
          />
          <ul className="panel-text">
            <li>
              Compare <strong>how people spend their free time</strong> in each photo.
            </li>
            <li>
              Useful language:{" "}
              <em>They both…, in the first picture…, while in the second one…</em>.
            </li>
            <li>
              Give your opinion: <em>Which way of enjoying free time do you prefer?</em>
            </li>
          </ul>
        </section>

        <section className="panel">
          <h2>3. Sleeping in public places</h2>
          <img
            src="/images/speaking/part3-extras/sleeping-scenes.png"
            alt="A man sleeping on a bus and a woman sleeping on airport seats."
            className="exercise-image wide"
            draggable="false"
          />
          <ul className="panel-text">
            <li>
              Describe what is happening and say how the people might feel.
            </li>
            <li>
              Useful connectors:{" "}
              <em>
                both pictures show…, the photos are similar because…, unlike
                the first picture…
              </em>
              .
            </li>
            <li>
              Follow-up question:{" "}
              <em>Would you feel comfortable sleeping in these places?</em>
            </li>
          </ul>
        </section>
      </main>

            <style>{`
        .speaking-guide .exercise-image {
          width: 100%;
          max-width: 480px;
          border-radius: 0.75rem;
          margin: 0.4rem auto 0.4rem;
          display: block;
        }

        .speaking-guide .exercise-image.wide {
          max-width: 640px;
        }
      `}</style>
    </div>
  );
}
