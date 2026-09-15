import React from "react";
import { WorkshopPreparation } from "./RelationshipsPreparation";
import { educationLearningPreparationConfig } from "./educationLearningPreparationData";

export default function EducationLearningPreparation(props) {
  return <WorkshopPreparation {...props} config={educationLearningPreparationConfig} />;
}
