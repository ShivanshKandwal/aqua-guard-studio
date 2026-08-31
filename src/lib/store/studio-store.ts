import { create } from "zustand";
import { CGWB_DISTRICTS, type CGWBDistrict } from "../data/cgwb-districts";
import type { SimulationParameters, ModelPredictionOutput } from "../ml/types";
import { getModelById } from "../ml/model-registry";
import { evaluateDynamicPolicies, type DistrictPolicyEvaluation } from "../policy/policy-engine";

interface StudioStore {
  // District Selection
  districts: CGWBDistrict[];
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;

  // Active Model
  activeModelId: string;
  setActiveModelId: (id: string) => void;

  // Simulation Parameters
  params: SimulationParameters;
  setParam: <K extends keyof SimulationParameters>(key: K, value: SimulationParameters[K]) => void;
  resetParams: () => void;
  applyPreset: (preset: "drought" | "conservation" | "business-as-usual" | "monsoon-surplus") => void;

  // Computed Reactive Properties
  getCurrentDistrict: () => CGWBDistrict;
  getPrediction: () => ModelPredictionOutput;
  getDistrictPrediction: (districtId: string) => ModelPredictionOutput;
  getPolicyEvaluation: () => DistrictPolicyEvaluation;
}

const DEFAULT_PARAMS: SimulationParameters = {
  rainfallAnomalyPct: 0,
  extractionDeltaPct: 0,
  rwhAdoptionPct: 35,
  industrialRecyclingPct: 40,
  dripIrrigationShiftPct: 25,
  targetYearHorizon: 10,
};

export const useStudioStore = create<StudioStore>((set, get) => ({
  districts: CGWB_DISTRICTS,
  selectedDistrictId: "south-west-delhi",
  setSelectedDistrictId: (id) => set({ selectedDistrictId: id }),

  activeModelId: "xgboost-v1",
  setActiveModelId: (id) => set({ activeModelId: id }),

  params: { ...DEFAULT_PARAMS },
  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
    })),
  resetParams: () => set({ params: { ...DEFAULT_PARAMS } }),

  applyPreset: (preset) => {
    switch (preset) {
      case "drought":
        set({
          params: {
            rainfallAnomalyPct: -35,
            extractionDeltaPct: 25,
            rwhAdoptionPct: 15,
            industrialRecyclingPct: 20,
            dripIrrigationShiftPct: 10,
            targetYearHorizon: 10,
          },
        });
        break;
      case "conservation":
        set({
          params: {
            rainfallAnomalyPct: 5,
            extractionDeltaPct: -30,
            rwhAdoptionPct: 85,
            industrialRecyclingPct: 80,
            dripIrrigationShiftPct: 75,
            targetYearHorizon: 10,
          },
        });
        break;
      case "monsoon-surplus":
        set({
          params: {
            rainfallAnomalyPct: 40,
            extractionDeltaPct: -10,
            rwhAdoptionPct: 60,
            industrialRecyclingPct: 50,
            dripIrrigationShiftPct: 40,
            targetYearHorizon: 10,
          },
        });
        break;
      case "business-as-usual":
      default:
        set({ params: { ...DEFAULT_PARAMS } });
        break;
    }
  },

  getCurrentDistrict: () => {
    const { districts, selectedDistrictId } = get();
    return districts.find((d) => d.id === selectedDistrictId) || districts[0];
  },

  getPrediction: () => {
    const { getCurrentDistrict, activeModelId, params } = get();
    const district = getCurrentDistrict();
    const model = getModelById(activeModelId);
    return model.predict(district, params);
  },

  getDistrictPrediction: (districtId: string) => {
    const { districts, activeModelId, params } = get();
    const district = districts.find((d) => d.id === districtId) || districts[0];
    const model = getModelById(activeModelId);
    return model.predict(district, params);
  },

  getPolicyEvaluation: () => {
    const { getCurrentDistrict, getPrediction, params } = get();
    const district = getCurrentDistrict();
    const prediction = getPrediction();
    return evaluateDynamicPolicies(district, params, prediction.predictedExtractionPct, prediction.riskLevel);
  },
}));
