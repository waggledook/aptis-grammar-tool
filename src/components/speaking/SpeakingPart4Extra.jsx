import React from "react";
import SpeakingPart4 from "./SpeakingPart4";
import { EXTRA_PART4_TASKS } from "./banks/part4Extra";
import { getSitePath } from "../../siteConfig.js";

export default function SpeakingPart4Extra({ user, onRequireSignIn }) {
  return (
    <SpeakingPart4
      tasks={EXTRA_PART4_TASKS}
      user={user}
      onRequireSignIn={onRequireSignIn}
      routeBasePath={getSitePath("/speaking/part4-extra")}
      showAssignButton={true}
      trackProgress={false}
      lockAfterIndex={null}
      heading="Speaking – Part 4 (Extra Practice)"
      intro={
        <>
          Extra Part 4 long-turn tasks using the same timed speaking flow. These tasks are standalone and are not linked to the main Part 4 progress tracker.
        </>
      }
    />
  );
}
