import { CGWB_DISTRICTS, type CGWBDistrict } from "./cgwb-districts";
import type { SimulationParameters, ModelPredictionOutput } from "../ml/types";

export interface CGWBApiResponse<T> {
  source: "CGWB_DIRECT_MOCK" | "PYTHON_FASTAPI_LIVE" | "INDIA_WRIS_LIVE";
  timestamp: string;
  data: T;
  status: "ONLINE" | "FALLBACK_LOCAL" | "SYNCED";
}

class CGWBApiAdapter {
  private isServerOnline: boolean = true;

  public getApiBaseUrl(): string {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return ""; // Local Vite dev server proxy
      }
    }
    return "https://aquaguard-backend-3cu8.onrender.com";
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const baseUrl = this.getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/predict`, { method: "OPTIONS" });
      this.isServerOnline = res.ok || res.status === 405;
      return true;
    } catch (e) {
      this.isServerOnline = false;
      return false;
    }
  }

  public async fetchRemotePrediction(
    district: CGWBDistrict,
    params: SimulationParameters,
    modelId: string
  ): Promise<ModelPredictionOutput | null> {
    try {
      const payload = {
        district_id: district.id,
        model_id: modelId,
        rainfall_anomaly_pct: params.rainfallAnomalyPct,
        extraction_delta_pct: params.extractionDeltaPct,
        rwh_adoption_pct: params.rwhAdoptionPct,
        industrial_recycling_pct: params.industrialRecyclingPct,
        drip_irrigation_shift_pct: params.dripIrrigationShiftPct,
        horizon_years: params.targetYearHorizon,
      };

      const baseUrl = this.getApiBaseUrl();
      console.log("[AquaGuard] Sending ML prediction request to:", `${baseUrl}/api/predict`, payload);

      const response = await fetch(`${baseUrl}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resJson = await response.json();

      // Transform FastAPI response to ModelPredictionOutput
      return {
        modelId: resJson.model_id,
        districtId: resJson.district_id,
        predictedWaterLevelM: resJson.predicted_water_level_m,
        waterLevelDeltaM: resJson.water_level_delta_m,
        predictedExtractionPct: resJson.predicted_extraction_pct,
        stressIndex: resJson.stress_index,
        riskLevel: resJson.risk_level,
        projections: resJson.projections,
        sectorBreakdown: [
          {
            sector: "Domestic & Municipal",
            draftHam: Math.round(district.annualGroundwaterDraftHam * 0.45),
            percentage: 45,
            color: "#06b6d4",
          },
          {
            sector: "Irrigation & Agriculture",
            draftHam: Math.round(district.annualGroundwaterDraftHam * 0.35),
            percentage: 35,
            color: "#10b981",
          },
          {
            sector: "Industrial & Commercial",
            draftHam: Math.round(district.annualGroundwaterDraftHam * 0.20),
            percentage: 20,
            color: "#a855f7",
          },
        ],
        economicImpact: {
          annualExtraEnergyCostCrores: Number(((Math.max(0, resJson.water_level_delta_m) * 1.8 * (district.population / 500000))).toFixed(2)),
          borewellsAtRiskCount: Math.round((district.population / 2000) * (resJson.predicted_extraction_pct > 100 ? 0.45 : 0.12)),
          expectedWaterTruckingCostCrores: Number(((resJson.predicted_extraction_pct > 100 ? (resJson.predicted_extraction_pct - 100) * 0.85 : 0.5)).toFixed(1)),
        },
        featureAttribution: {
          rainfallImpactPct: 34,
          extractionImpactPct: 44,
          rwhImpactPct: 14,
          aquiferStorageImpactPct: 8,
        },
        metrics: resJson.metrics || {
          rmse: 0.98,
          r2: 0.94,
          mae: 0.72,
          trainingEpochsOrTrees: 350,
          inferenceTimeMs: 1.2,
        },
      };
    } catch (err) {
      console.warn("FastAPI ML backend offline or unreachable. Using client ML fallback:", err);
      return null;
    }
  }

  public async fetchAssistantChat(
    prompt: string,
    district: CGWBDistrict,
    params: SimulationParameters,
    prediction: ModelPredictionOutput
  ): Promise<{ text: string; suggested_actions: string[]; timestamp: string } | null> {
    try {
      const payload = {
        prompt,
        district_id: district.id,
        model_id: prediction.modelId,
        rainfall_anomaly_pct: params.rainfallAnomalyPct,
        extraction_delta_pct: params.extractionDeltaPct,
        rwh_adoption_pct: params.rwhAdoptionPct,
        industrial_recycling_pct: params.industrialRecyclingPct,
        drip_irrigation_shift_pct: params.dripIrrigationShiftPct,
        horizon_years: params.targetYearHorizon,
        predicted_water_level_m: prediction.predictedWaterLevelM,
        predicted_extraction_pct: prediction.predictedExtractionPct,
        risk_level: prediction.riskLevel,
      };

      const baseUrl = this.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("Assistant backend API offline, falling back to local NLP generator:", err);
      return null;
    }
  }
}

export const cgwbApiAdapter = new CGWBApiAdapter();

