import React from "react";
import SpeakingPart3 from "./SpeakingPart3";
import { PART3_CUSTOM_TASKS } from "./banks/part3Custom";

export default function SpeakingPart3Custom({ user, onRequireSignIn }) {
  return (
    <SpeakingPart3
      tasks={PART3_CUSTOM_TASKS}
      user={user}
      onRequireSignIn={onRequireSignIn}
      showAssignButton={false}
      trackProgress={false}
      lockAfterIndex={null}
      heading="Speaking – Part 3 (Extra Practice)"
      intro={
        <>
          Extra Part 3 photo tasks using the same timed speaking flow. These tasks are standalone and are not linked to the main Part 3 progress tracker.
        </>
      }
    />
  );
}
