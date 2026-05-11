import React from "react";
import AptisPart2Reorder from "./AptisPart2Reorder.jsx";
import { READING_PART2_TEACHER_TASKS } from "./part2Tasks.js";
import { getSitePath } from "../siteConfig.js";

export default function ReadingPart2Teacher({ user, onRequireSignIn }) {
  return (
    <AptisPart2Reorder
      tasks={READING_PART2_TEACHER_TASKS}
      user={user}
      onRequireSignIn={onRequireSignIn}
      routeBasePath={getSitePath("/reading/part2-teacher")}
      showAssignButton={true}
      trackProgress={true}
      progressPart="part2-teacher"
      lockAfterIndex={null}
      heading="Reading – Part 2 Teacher Tasks"
      intro="Extra sentence-order tasks built from the teacher resource set."
    />
  );
}
