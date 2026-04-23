import React from "react";
import SpeakingPart2 from "./SpeakingPart2";
import { MORE_PART2_TASKS } from "./banks/part2More";

export default function SpeakingPart2Secret({ user, onRequireSignIn }) {
  return (
    <SpeakingPart2
      tasks={MORE_PART2_TASKS}
      user={user}
      onRequireSignIn={onRequireSignIn}
      showAssignButton={false}
      trackProgress={false}
      lockAfterIndex={null}
      heading="Speaking – Part 2 (Extra Practice)"
      intro={
        <>
          Extra Part 2 photo tasks using the same timed speaking flow. These tasks are standalone and are not linked to the main Part 2 progress tracker.
        </>
      }
    />
  );
}
