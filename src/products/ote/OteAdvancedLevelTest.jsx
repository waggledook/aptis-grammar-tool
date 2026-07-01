import React from "react";
import OteLevelTest from "./OteLevelTest.jsx";
import {
  OTE_ADVANCED_LEVEL_TEST_BATCHES,
  getOteAdvancedLevelTestProfile,
} from "./data/oteAdvancedLevelTestItems.js";
import { OTE_ADVANCED_LEVEL_PRODUCTION_TASKS } from "./data/oteLevelProductionTasks.js";

const ADVANCED_LEVEL_TEST_COPY = {
  testEdition: "advanced",
  seoTitle: "Test avanzado de nivel Oxford Test of English | OTE Seif",
  seoDescription: "Haz un test avanzado de nivel para Oxford Test of English, pensado para candidatos que necesitan C1 o ya tienen un nivel alto.",
  kicker: "Test avanzado Oxford Test of English",
  heading: "Comprueba si estás preparado para un nivel C1",
  intro: "Responde 20 preguntas breves de Use of English de nivel alto. Al terminar, verás si tu perfil encaja mejor con B2, C1 o una ruta de dominio superior.",
  firstPartTitle: "Primera parte avanzada",
  firstPartSubtitle: "10 preguntas B2/C1",
  lowerPartSubtitle: "10 preguntas para confirmar base B1/B2",
  upperPartSubtitle: "10 preguntas C1/C2",
  reportTitle: "Informe del test avanzado de nivel Oxford Test of English",
  downloadFilename: "informe-avanzado-oxford-test-of-english.txt",
  feedbackMode: "advanced_level_check",
  showAdvancedDiagnosticSuggestion: false,
};

export default function OteAdvancedLevelTest({ nativeRoutes = false }) {
  return (
    <OteLevelTest
      nativeRoutes={nativeRoutes}
      batches={OTE_ADVANCED_LEVEL_TEST_BATCHES}
      getProfile={getOteAdvancedLevelTestProfile}
      productionTasks={OTE_ADVANCED_LEVEL_PRODUCTION_TASKS}
      copy={ADVANCED_LEVEL_TEST_COPY}
    />
  );
}
