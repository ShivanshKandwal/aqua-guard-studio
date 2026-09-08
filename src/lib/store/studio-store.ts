import { create } from "zustand";
import { CGWB_DISTRICTS, type CGWBDistrict } from "../data/cgwb-districts";
import type { SimulationParameters, ModelPredictionOutput } from "../ml/types";
import { getModelById } from "../ml/model-registry";
import { evaluateDynamicPolicies, type DistrictPolicyEvaluation } from "../policy/policy-engine";
import { cgwbApiAdapter } from "../data/cgwb-api-adapter";

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

  // Server Sync Status
  isServerSynced: boolean;
  isEvaluating: boolean;
  activeServerLabel: string;
  serverPrediction: ModelPredictionOutput | null;
  syncWithBackend: () => Promise<void>;

  getCurrentDistrict: () => CGWBDistrict;
  getPrediction: () => ModelPredictionOutput;
  getDistrictPrediction: (districtId: string) => ModelPredictionOutput;
  getPolicyEvaluation: () => DistrictPolicyEvaluation;
}

const DEFAULT_PARAMS: SimulationParameters = {
  rainfallAnomalyPct: 0,
  extractionDeltaPct: 0,
  rwhAdoptionPct: 20,
  industrialRecyclingPct: 15,
  dripIrrigationShiftPct: 10,
  targetYearHorizon: 5,
};

export const useStudioStore = create<StudioStore>((set, get) => ({
  districts: CGWB_DISTRICTS,
  selectedDistrictId: CGWB_DISTRICTS[0].id,
  setSelectedDistrictId: (id) => set({ selectedDistrictId: id, serverPrediction: null }),

  activeModelId: "xgboost-v1",
  setActiveModelId: (id) => set({ activeModelId: id, serverPrediction: null }),

  params: { ...DEFAULT_PARAMS },

  isServerSynced: false,
  isEvaluating: false,
  activeServerLabel: "FastAPI ML (Detecting...)",
  serverPrediction: null,

  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
      serverPrediction: null,
    })),

  resetParams: () => set({ params: { ...DEFAULT_PARAMS }, serverPrediction: null }),

  applyPreset: (preset) => {
    switch (preset) {
      case "drought":
        set({
          params: {
            rainfallAnomalyPct: -35,
            extractionDeltaPct: 20,
            rwhAdoptionPct: 10,
            industrialRecyclingPct: 5,
            dripIrrigationShiftPct: 5,
            targetYearHorizon: 5,
          },
          serverPrediction: null,
        });
        break;
      case "conservation":
        set({
          params: {
            rainfallAnomalyPct: 0,
            extractionDeltaPct: -25,
            rwhAdoptionPct: 60,
            industrialRecyclingPct: 50,
            dripIrrigationShiftPct: 40,
            targetYearHorizon: 10,
          },
          serverPrediction: null,
        });
        break;
      case "monsoon-surplus":
        set({
          params: {
            rainfallAnomalyPct: 40,
            extractionDeltaPct: -10,
            rwhAdoptionPct: 45,
            industrialRecyclingPct: 20,
            dripIrrigationShiftPct: 15,
            targetYearHorizon: 5,
          },
          serverPrediction: null,
        });
        break;
      case "business-as-usual":
      default:
        set({ params: { ...DEFAULT_PARAMS }, serverPrediction: null });
        break;
    }
  },

  syncWithBackend: async () => {
    set({ isEvaluating: true });
    const { getCurrentDistrict, activeModelId, params } = get();
    const district = getCurrentDistrict();

    const remotePred = await cgwbApiAdapter.fetchRemotePrediction(district, params, activeModelId);
    if (remotePred) {
      set({
        serverPrediction: remotePred,
        isServerSynced: true,
        activeServerLabel: cgwbApiAdapter.getActiveEndpointLabel(),
        isEvaluating: false,
      });
    } else {
      set({ isServerSynced: false, isEvaluating: false });
    }
  },

  getCurrentDistrict: () => {
    const { districts, selectedDistrictId } = get();
    return districts.find((d) => d.id === selectedDistrictId) || districts[0];
  },

  getPrediction: () => {
    const { serverPrediction, getCurrentDistrict, activeModelId, params } = get();
    if (serverPrediction) {
      return serverPrediction;
    }
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
    const { getCurrentDistrict, params } = get();
    return evaluateDynamicPolicies(getCurrentDistrict(), params);
  },
}));