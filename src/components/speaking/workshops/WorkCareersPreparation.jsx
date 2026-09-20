import React from "react";
import { WorkshopPreparation } from "./RelationshipsPreparation";
import { workCareersPreparationConfig } from "./workCareersPreparationData";

export default function WorkCareersPreparation(props) {
  return <WorkshopPreparation {...props} config={workCareersPreparationConfig} />;
}
