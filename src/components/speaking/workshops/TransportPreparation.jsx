import React from "react";
import { WorkshopPreparation } from "./RelationshipsPreparation";
import { transportPreparationConfig } from "./transportPreparationData";

export default function TransportPreparation(props) {
  return <WorkshopPreparation {...props} config={transportPreparationConfig} />;
}
