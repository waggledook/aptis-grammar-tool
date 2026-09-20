import React from "react";
import { WorkshopPreparation } from "./RelationshipsPreparation";
import { sportEntertainmentPreparationConfig } from "./sportEntertainmentPreparationData";

export default function SportEntertainmentPreparation(props) {
  return <WorkshopPreparation {...props} config={sportEntertainmentPreparationConfig} />;
}
