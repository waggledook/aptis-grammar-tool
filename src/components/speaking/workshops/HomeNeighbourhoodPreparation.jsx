import React from "react";
import { WorkshopPreparation } from "./RelationshipsPreparation";
import { homeNeighbourhoodPreparationConfig } from "./homeNeighbourhoodPreparationData";

export default function HomeNeighbourhoodPreparation(props) {
  return <WorkshopPreparation {...props} config={homeNeighbourhoodPreparationConfig} />;
}
