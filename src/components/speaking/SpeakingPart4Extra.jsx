import React from "react";
import SpeakingPart4 from "./SpeakingPart4";
import { EXTRA_PART4_TASKS } from "./banks/part4Extra";
import { getSitePath } from "../../siteConfig.js";
import SpeakingTeacherResource from "./SpeakingTeacherPractice.jsx";

export default function SpeakingPart4Extra({ user, onRequireSignIn }) {
  const routeBasePath = getSitePath("/speaking/part4-extra");

  return (
    <SpeakingTeacherResource
      partNumber={4}
      tasks={EXTRA_PART4_TASKS}
      user={user}
      routeBasePath={routeBasePath}
      activityId="speaking-part-4"
      renderExamPractice={(onChangeMode) => (
        <SpeakingPart4
          tasks={EXTRA_PART4_TASKS}
          user={user}
          onRequireSignIn={onRequireSignIn}
          routeBasePath={routeBasePath}
          showAssignButton={true}
          trackProgress={false}
          lockAfterIndex={null}
          activityId="speaking-part-4"
          heading="Speaking – Part 4 (Extra Practice)"
          intro={<>Extra Part 4 long-turn topics using the complete preparation and response timings.</>}
          headerActions={<button type="button" className="review-btn" onClick={onChangeMode}>Change mode</button>}
        />
      )}
    />
  );
}
