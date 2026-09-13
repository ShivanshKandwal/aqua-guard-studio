import { create } from "zustand";
import { CGWB_DISTRICTS, type CGWBDistrict } from "../data/cgwb-districts";
import type { SimulationParameters, ModelPredictionOutput } from "../ml/types";
import { getModelById } from "../ml/model-registry";
import { evaluateDynamicPolicies, type DistrictPolicyEvaluation } from "../policy/policy-engine";
import { cgwbApiAdapter } from "../data/cgwb-api-adapter";

export type UserRole = "user" | "policy_maker" | "developer";

/**
 * Determine recommended model ID based on forecast horizon duration:
 * - <= 4 years: Linear Regression (simple slope baseline, immediate draft)
 * - 5 to 9 years: XGBoost Ensemble (non-linear thresholds & shocks)
 * - >= 10 years: LSTM Recurrent Net (decadal hysteresis & hydrological lag)
 */
export function getModelForHorizon(years: number): string {
  if (years <= 4) return "linreg-v1";
  if (years <= 9) return "xgboost-v1";
  return "lstm-v1";
}

interface StudioStore {
  // User Mode Abstraction (1-user, 2-policy_maker, 3-developer)
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // District Selection
  districts: CGWBDistrict[];
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;

  // Active Model & Auto Routing
  activeModelId: string;
  setActiveModelId: (id: string) => void;
  autoModelSwitchEnabled: boolean;
  setAutoModelSwitchEnabled: (enabled: boolean) => void;

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

// Read persisted role if available
const getInitialRole = (): UserRole => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("aquasentinel_user_role");
    if (saved === "user" || saved === "policy_maker" || saved === "developer") {
      return saved;
    }
  }
  return "developer"; // Default allows full access, easily toggled from navbar
};

export const useStudioStore = create<StudioStore>((set, get) => ({
  userRole: getInitialRole(),
  setUserRole: (role) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aquasentinel_user_role", role);
    }
    set({ userRole: role });
  },

  districts: CGWB_DISTRICTS,
  selectedDistrictId: CGWB_DISTRICTS[0].id,
  setSelectedDistrictId: (id) => set({ selectedDistrictId: id, serverPrediction: null }),

  activeModelId: "xgboost-v1",
  setActiveModelId: (id) => set({ activeModelId: id, serverPrediction: null }),
  autoModelSwitchEnabled: true,
  setAutoModelSwitchEnabled: (enabled) => set({ autoModelSwitchEnabled: enabled }),

  params: { ...DEFAULT_PARAMS },

  isServerSynced: false,
  isEvaluating: false,
  activeServerLabel: "FastAPI ML (Detecting...)",
  serverPrediction: null,

  setParam: (key, value) =>
    set((state) => {
      const nextParams = { ...state.params, [key]: value };
      let nextModelId = state.activeModelId;

      // Automatically switch model when horizon changes and auto-switch is enabled
      if (key === "targetYearHorizon" && state.autoModelSwitchEnabled) {
        nextModelId = getModelForHorizon(Number(value));
      }

      return {
        params: nextParams,
        activeModelId: nextModelId,
        serverPrediction: null,
      };
    }),

  resetParams: () =>
    set((state) => ({
      params: { ...DEFAULT_PARAMS },
      activeModelId: state.autoModelSwitchEnabled
        ? getModelForHorizon(DEFAULT_PARAMS.targetYearHorizon)
        : state.activeModelId,
      serverPrediction: null,
    })),

  applyPreset: (preset) => {
    const state = get();
    let newParams: SimulationParameters;

    switch (preset) {
      case "drought":
        newParams = {
          rainfallAnomalyPct: -35,
          extractionDeltaPct: 20,
          rwhAdoptionPct: 10,
          industrialRecyclingPct: 5,
          dripIrrigationShiftPct: 5,
          targetYearHorizon: 5,
        };
        break;
      case "conservation":
        newParams = {
          rainfallAnomalyPct: 0,
          extractionDeltaPct: -25,
          rwhAdoptionPct: 60,
          industrialRecyclingPct: 50,
          dripIrrigationShiftPct: 40,
          targetYearHorizon: 10,
        };
        break;
      case "monsoon-surplus":
        newParams = {
          rainfallAnomalyPct: 40,
          extractionDeltaPct: -10,
          rwhAdoptionPct: 45,
          industrialRecyclingPct: 20,
          dripIrrigationShiftPct: 15,
          targetYearHorizon: 5,
        };
        break;
      case "business-as-usual":
      default:
        newParams = { ...DEFAULT_PARAMS };
        break;
    }

    const nextModelId = state.autoModelSwitchEnabled
      ? getModelForHorizon(newParams.targetYearHorizon)
      : state.activeModelId;

    set({
      params: newParams,
      activeModelId: nextModelId,
      serverPrediction: null,
    });
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