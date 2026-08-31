import type { CGWBDistrict, RiskLevel } from "../data/cgwb-districts";

export interface SimulationParameters {
  rainfallAnomalyPct: number;    // -50% to +50%
  extractionDeltaPct: number;     // -40% to +60%
  rwhAdoptionPct: number;         // 0% to 100% (Rainwater Harvesting)
  industrialRecyclingPct: number; // 0% to 100%
  dripIrrigationShiftPct: number; // 0% to 100%
  targetYearHorizon: number;      // e.g. 10 years (2025-2035)
}

export interface YearProjectionPoint {
  year: number;
  waterLevelM: number;
  extractionPct: number;
  upperBoundM: number;
  lowerBoundM: number;
  annualRechargeHam: number;
  annualDraftHam: number;
  netDeficitHam: number;
  pumpingCostPerKwhInr: number;
  energySurgePct: number;
  borewellFailureRiskPct: number;
  salinityTdsPpm: number;
}

export interface SectorDraftBreakdown {
  sector: "Irrigation & Agriculture" | "Domestic & Municipal" | "Industrial & Commercial";
  draftHam: number;
  percentage: number;
  color: string;
}

export interface ModelPredictionOutput {
  modelId: string;
  districtId: string;
  predictedWaterLevelM: number;     // Current/immediate projected depth
  waterLevelDeltaM: number;         // Delta from baseline
  predictedExtractionPct: number;
  stressIndex: number;              // 0 - 100 scale
  riskLevel: RiskLevel;
  projections: YearProjectionPoint[];
  sectorBreakdown: SectorDraftBreakdown[];
  economicImpact: {
    annualExtraEnergyCostCrores: number;
    borewellsAtRiskCount: number;
    expectedWaterTruckingCostCrores: number;
  };
  featureAttribution: {
    rainfallImpactPct: number;
    extractionImpactPct: number;
    rwhImpactPct: number;
    aquiferStorageImpactPct: number;
  };
  metrics: {
    rmse: number;
    r2: number;
    mae: number;
    trainingEpochsOrTrees: number;
    inferenceTimeMs: number;
  };
}

export interface GroundwaterPredictor {
  id: string;
  name: string;
  family: "Linear Regression" | "Gradient Boosted Trees (XGBoost)" | "Deep Sequential (LSTM)";
  description: string;
  predict(district: CGWBDistrict, params: SimulationParameters): ModelPredictionOutput;
}
