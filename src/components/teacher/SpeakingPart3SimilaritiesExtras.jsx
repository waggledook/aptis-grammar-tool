// src/components/teacher/SpeakingPart3SimilaritiesExtras.jsx
import React from "react";
import Seo from "../common/Seo.jsx";

export default function SpeakingPart3SimilaritiesExtras() {
  return (
    <div className="game-wrapper speaking-guide">
      <Seo
        title="Speaking Part 3 – Teacher Activities | Seif Aptis Trainer"
        description="Extra picture pairs and prompts for practising similarities and differences in Aptis Speaking Part 3."
      />

      <header className="header">
        <div>
          <h2 className="title">Teacher activities – Similarities &amp; differences</h2>
          <p className="intro">
            Use these extra picture pairs to get students comparing similarities
            and differences in pairs or small groups. This page isn&apos;t
            visible in the student menu – you share it only when you want to.
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
              Students describe <strong>one similarity</strong> and{" "}
              <strong>two differences</strong> between the pictures.
            </li>
            <li>
              Prompt them to use phrases like{" "}
              <em>both pictures…, whereas…, unlike the first photo…</em>.
            </li>
            <li>
              Quick follow-up:{" "}
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
              Focus on <strong>how people spend their time</strong> in each photo.
            </li>
            <li>
              Useful language:{" "}
              <em>They both…, in the first picture…, while in the second one…</em>.
            </li>
            <li>
              In pairs: one student finds similarities, the other differences,
              then they swap and report back.
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
              Students describe what is happening and how the people might feel.
            </li>
            <li>
              Encourage connectors:{" "}
              <em>
                both pictures show…, the photos are similar because…, unlike
                the first picture…
              </em>
              .
            </li>
            <li>
              Short discussion:{" "}
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
