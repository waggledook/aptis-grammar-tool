import assert from "node:assert/strict";
import test from "node:test";
import {
  getNextSpeakingWorkshopDate,
  getSpeakingWorkshopProgrammeWeek,
} from "../src/components/speaking/workshops/workshopSchedule.js";

test("the four-week programme rolls over on Saturday", () => {
  assert.equal(getSpeakingWorkshopProgrammeWeek("2026-09-04").week, 1);
  assert.equal(getSpeakingWorkshopProgrammeWeek("2026-09-05").week, 2);
  assert.equal(getSpeakingWorkshopProgrammeWeek("2026-10-16").week, 3);
  assert.equal(getSpeakingWorkshopProgrammeWeek("2026-10-17").week, 4);
  assert.equal(getSpeakingWorkshopProgrammeWeek("2026-10-19").week, 4);
  assert.equal(getSpeakingWorkshopProgrammeWeek("2026-10-24").week, 1);
});

test("the default session date is the next Friday, including today", () => {
  assert.equal(getNextSpeakingWorkshopDate("2026-10-16"), "2026-10-16");
  assert.equal(getNextSpeakingWorkshopDate("2026-10-17"), "2026-10-23");
  assert.equal(getNextSpeakingWorkshopDate("2026-10-19"), "2026-10-23");
});
