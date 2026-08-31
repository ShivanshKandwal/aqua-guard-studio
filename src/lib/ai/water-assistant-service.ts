import type { CGWBDistrict } from "../data/cgwb-districts";
import type { SimulationParameters, ModelPredictionOutput } from "../ml/types";
import type { DistrictPolicyEvaluation } from "../policy/policy-engine";

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export function generateAssistantResponse(
  prompt: string,
  currentDistrict: CGWBDistrict,
  params: SimulationParameters,
  prediction: ModelPredictionOutput,
  policies: DistrictPolicyEvaluation
): AssistantMessage {
  const query = prompt.toLowerCase();
  let text = "";
  const actions: string[] = [];

  if (query.includes("status") || query.includes("how is") || query.includes("condition") || query.includes("water table")) {
    text = `**District Status Report: ${currentDistrict.name}**
- **Aquifer Profile:** ${currentDistrict.aquiferType} geology.
- **Current Simulated Depth to Water Table:** **${prediction.predictedWaterLevelM} mbgl** (meters below ground level), which is a ${prediction.waterLevelDeltaM >= 0 ? `drop of +${prediction.waterLevelDeltaM}m` : `recovery of ${prediction.waterLevelDeltaM}m`} from the baseline (${currentDistrict.baselineWaterLevelM} mbgl).
- **Stage of Groundwater Extraction:** **${prediction.predictedExtractionPct}%** (${prediction.riskLevel}).
- **Annual Normal Rainfall:** ${currentDistrict.baselineRainfallMm} mm (Simulated anomaly: ${params.rainfallAnomalyPct > 0 ? `+${params.rainfallAnomalyPct}%` : `${params.rainfallAnomalyPct}%`}).`;

    actions.push("What interventions will recover the water table?", "How does this compare to Gurugram?", "Explain the aquifer geology");
  } else if (query.includes("policy") || query.includes("action") || query.includes("mandate") || query.includes("save") || query.includes("intervention")) {
    text = `**Recommended Policy Directives for ${currentDistrict.name} (${prediction.riskLevel}):**
Based on your current simulation parameters (Extraction: ${params.extractionDeltaPct}%, RWH: ${params.rwhAdoptionPct}%, Recycling: ${params.industrialRecyclingPct}%), we calculate **${policies.totalWaterSavingsMld} MLD** in potential daily water recovery.

**Key Priority Actions:**
${policies.directives.map((d, i) => `${i + 1}. **${d.title}** (${d.priority.replace("_", " ")}): ${d.description} - *Est. Savings: ${d.estimatedWaterSavingMld} MLD (Lead: ${d.leadAgency})*`).join("\n\n")}`;

    actions.push("What is the estimated budget needed?", "Simulate 80% Rainwater Harvesting", "View Model Projections");
  } else if (query.includes("geology") || query.includes("aquifer") || query.includes("quartzite") || query.includes("alluvial")) {
    text = `**Aquifer Characteristics of ${currentDistrict.name}:**
${currentDistrict.name} sits predominantly on **${currentDistrict.aquiferType}** strata.
- **Alluvial Aquifers:** Highly porous sand/silt formations with higher specific yield (~12-16%) and faster natural recharge rate along floodplains.
- **Quartzite Ridge Formations:** Dense hard rock with low primary porosity (specific yield ~2-4%). Groundwater storage is confined to weathered fractures and joints, meaning over-pumping causes severe localized water table depression.`;

    actions.push("Check extraction moratorium rules", "Simulate drought scenario", "How accurate is the XGBoost model?");
  } else if (query.includes("model") || query.includes("accuracy") || query.includes("xgboost") || query.includes("lstm") || query.includes("prediction")) {
    text = `**Model Evaluation Metrics:**
You are currently using **${prediction.modelId}**.
- **Model Type:** ${prediction.modelId === "xgboost-v1" ? "Gradient Boosted Decision Trees" : prediction.modelId === "lstm-v1" ? "Long Short-Term Memory Neural Network" : "Multivariate Linear Regression"}
- **RMSE:** ${prediction.metrics.rmse} meters
- **R² Score:** ${prediction.metrics.r2}
- **Mean Absolute Error (MAE):** ${prediction.metrics.mae} meters
- **Feature Attribution:** Extraction draft contributes **${prediction.featureAttribution.extractionImpactPct}%**, Rainfall variation **${prediction.featureAttribution.rainfallImpactPct}%**, and Rainwater Harvesting **${prediction.featureAttribution.rwhImpactPct}%** to the projection curve.`;

    actions.push("Switch to LSTM model", "Compare all models side-by-side", "What is the 10-year projection?");
  } else {
    text = `Based on the latest CGWB baseline and your active simulation parameters for **${currentDistrict.name}**:
- **Simulated Extraction Stage:** ${prediction.predictedExtractionPct}% (**${prediction.riskLevel}**)
- **Water Table Depth:** ${prediction.predictedWaterLevelM} mbgl
- **Potential Water Savings with active directives:** ${policies.totalWaterSavingsMld} MLD

You can ask me to analyze specific drought scenarios, review regulatory mandates, or explain the hydrogeological trends in any NCR district.`;

    actions.push("Show policy directives", "Simulate 50% extraction reduction", "Why is South West Delhi critical?");
  }

  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    suggestedActions: actions,
  };
}
