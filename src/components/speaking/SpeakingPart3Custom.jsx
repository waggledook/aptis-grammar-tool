import React from "react";
import SpeakingPart3 from "./SpeakingPart3";
import { PART3_CUSTOM_TASKS } from "./banks/part3Custom";
import { getSitePath } from "../../siteConfig.js";
import SpeakingTeacherResource from "./SpeakingTeacherPractice.jsx";

export default function SpeakingPart3Custom({ user, onRequireSignIn }) {
  const routeBasePath = getSitePath("/speaking/part3-custom");

  return (
    <SpeakingTeacherResource
      partNumber={3}
      tasks={PART3_CUSTOM_TASKS}
      user={user}
      routeBasePath={routeBasePath}
      activityId="speaking-part-3"
      renderExamPractice={(onChangeMode) => (
        <SpeakingPart3
          tasks={PART3_CUSTOM_TASKS}
          user={user}
          onRequireSignIn={onRequireSignIn}
          routeBasePath={routeBasePath}
          showAssignButton={true}
          trackProgress={false}
          lockAfterIndex={null}
          activityId="speaking-part-3"
          heading="Speaking – Part 3 (Extra Practice)"
          intro={<>Extra Part 3 picture-comparison tasks using the complete timed speaking flow.</>}
          headerActions={<button type="button" className="review-btn" onClick={onChangeMode}>Change mode</button>}
        />
      )}
    />
  );
}
