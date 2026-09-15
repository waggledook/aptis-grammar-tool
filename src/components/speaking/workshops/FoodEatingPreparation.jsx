import React from "react";
import { WorkshopPreparation } from "./RelationshipsPreparation";
import { foodEatingPreparationConfig } from "./foodEatingPreparationData";

export default function FoodEatingPreparation(props) {
  return <WorkshopPreparation {...props} config={foodEatingPreparationConfig} />;
}
