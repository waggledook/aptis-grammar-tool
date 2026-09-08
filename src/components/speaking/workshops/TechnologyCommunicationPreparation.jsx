import React from "react";
import { WorkshopPreparation } from "./RelationshipsPreparation";
import { technologyCommunicationPreparationConfig } from "./technologyCommunicationPreparationData";

export default function TechnologyCommunicationPreparation(props) {
  return <WorkshopPreparation {...props} config={technologyCommunicationPreparationConfig} />;
}
