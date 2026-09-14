import React from "react";
import SpeakingPart2 from "./SpeakingPart2";
import { MORE_PART2_TASKS } from "./banks/part2More";
import { getSitePath } from "../../siteConfig.js";
import SpeakingTeacherResource from "./SpeakingTeacherPractice.jsx";

export default function SpeakingPart2Secret({ user, onRequireSignIn }) {
  const routeBasePath = getSitePath("/speaking/part2-secret");

  return (
    <SpeakingTeacherResource
      partNumber={2}
      tasks={MORE_PART2_TASKS}
      user={user}
      routeBasePath={routeBasePath}
      activityId="speaking-part-2"
      renderExamPractice={(onChangeMode) => (
        <SpeakingPart2
          tasks={MORE_PART2_TASKS}
          user={user}
          onRequireSignIn={onRequireSignIn}
          routeBasePath={routeBasePath}
          showAssignButton={true}
          trackProgress={false}
          lockAfterIndex={null}
          activityId="speaking-part-2"
          heading="Speaking – Part 2 (Extra Practice)"
          intro={<>Extra Part 2 photo tasks using the complete timed speaking flow.</>}
          headerActions={<button type="button" className="review-btn" onClick={onChangeMode}>Change mode</button>}
        />
      )}
    />
  );
}
