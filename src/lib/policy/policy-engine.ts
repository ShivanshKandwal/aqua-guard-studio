import type { CGWBDistrict, RiskLevel } from "../data/cgwb-districts";
import type { SimulationParameters } from "../ml/types";

export type PolicyPriority = "IMMEDIATE_EMERGENCY" | "HIGH_REGULATORY" | "MEDIUM_INCENTIVE" | "SUSTAINABILITY_MAINTENANCE";

export interface PolicyMetricBreakdown {
  waterSavedMld: number;
  capexCrores: number;
  opexAnnualLakhs: number;
  paybackPeriodYears: number;
  aquiferRechargeHam: number;
  co2ReductionTonnesYr: number;
  complianceDeadlineMonths: number;
}

export interface PolicyDirective {
  id: string;
  title: string;
  category:
    | "Extraction Control"
    | "Artificial Recharge"
    | "Industrial & Urban Recycling"
    | "Agricultural Efficiency"
    | "Nature-Based Solutions & Wetlands"
    | "Smart Groundwater Governance & Tariffs";
  priority: PolicyPriority;
  description: string;
  statutoryBasis: string;       // Acts / CGWA Guidelines
  actionItems: string[];
  metrics: PolicyMetricBreakdown;
  leadAgency: string;
  stakeholders: string[];
  triggerReason: string;
  riskIfIgnored: string;
}

export interface CustomPolicyEvaluation {
  id: string;
  sourceTitle: string;
  extractedSynopsis: string;
  readinessScore: number;       // 0-100
  feasibilityRating: "High" | "Moderate" | "Challenging";
  estimatedNetWaterRecoveryMld: number;
  estimatedBudgetCrores: number;
  targetHorizonYears: number;
  impactTrajectory: {
    year: number;
    cumulativeWaterSavedMld: number;
    complianceRatePct: number;
    aquiferLevelReboundM: number;
  }[];
  regulatoryAlignment: {
    cgwaNormsMatchPct: number;
    djbGridInterlock: boolean;
    environmentalClearanceNeeded: boolean;
  };
  strengths: string[];
  vulnerabilities: string[];
  strategicRecommendations: string[];
}

export interface DistrictPolicyEvaluation {
  districtId: string;
  riskLevel: RiskLevel;
  totalWaterSavingsMld: number;
  totalCapexCrores: number;
  totalCo2ReductionTonnes: number;
  directives: PolicyDirective[];
}

// Helper to convert Hectare-Meters/yr to MLD (1 HAM = 10,000 m³ = 10 Million Liters; 1 HAM/yr = 10/365 MLD ≈ 0.0274 MLD)
function hamPerYearToMld(ham: number): number {
  return Number(((ham * 10) / 365).toFixed(2));
}

export function evaluateDynamicPolicies(
  district: CGWBDistrict,
  params: SimulationParameters,
  predictedExtractionPct: number,
  riskLevel: RiskLevel
): DistrictPolicyEvaluation {
  const directives: PolicyDirective[] = [];

  // 1. Mandatory Smart Borewell Telemetry & Commercial Ceiling
  if (predictedExtractionPct > 100) {
    // 12-16% draft curtailment
    const savedHam = district.annualGroundwaterDraftHam * 0.14;
    const savingsMld = hamPerYearToMld(savedHam);

    directives.push({
      id: "pol-borewell-ban",
      title: "Commercial Extraction Moratorium & Pulse Metering",
      category: "Extraction Control",
      priority: "IMMEDIATE_EMERGENCY",
      description: `District extraction is currently at ${predictedExtractionPct.toFixed(1)}% (Over-Exploited). Complete freeze on non-potable groundwater withdrawal licenses and installation of mandatory IoT telemetry meters.`,
      statutoryBasis: "Central Ground Water Authority (CGWA) Guidelines 2020 & EPA Section 5",
      actionItems: [
        "Seal all illegal unregistered commercial borewells within 30 days via district taskforce.",
        "Mandate IoT electromagnetic pulse flowmeters transmitting hourly withdrawal logs to State Ground Water Authority.",
        "Impose progressive extraction cess (₹250/m³) for draft beyond sanctioned quota.",
        "Establish GPS geotagging & geofencing for all registered private water tankers.",
      ],
      metrics: {
        waterSavedMld: savingsMld,
        capexCrores: 6.8,
        opexAnnualLakhs: 45,
        paybackPeriodYears: 1.2,
        aquiferRechargeHam: 0,
        co2ReductionTonnesYr: 420,
        complianceDeadlineMonths: 3,
      },
      leadAgency: "CGWB & State Groundwater Authority",
      stakeholders: ["District Magistrate", "Commercial Associations", "DJB Telemetry Cell"],
      triggerReason: "Stage of extraction exceeds statutory 100% threshold.",
      riskIfIgnored: "Irreversible aquifer depressurization and brackish mineral upwelling.",
    });
  }

  // 2. Accelerated Rooftop Rainwater Harvesting & Deep Shaft Recharging
  const rwhShortfall = 100 - params.rwhAdoptionPct;
  if (rwhShortfall > 15 || riskLevel !== "Safe") {
    const rechargedHam = district.rechargePotentialHam * (params.rwhAdoptionPct / 100);
    const savingsMld = hamPerYearToMld(rechargedHam);

    directives.push({
      id: "pol-rwh-mandate",
      title: "Mandatory Structural Rooftop RWH & Injection Wells",
      category: "Artificial Recharge",
      priority: predictedExtractionPct > 90 ? "HIGH_REGULATORY" : "MEDIUM_INCENTIVE",
      description: `Mandatory structural RWH compliance across residential plots ≥100 sq.m, housing societies, and public institutions with high-velocity filtration chambers.`,
      statutoryBasis: "Delhi Building Bye-Laws 2016 (Clause 9.2) & Unified Building Bye-Laws",
      actionItems: [
        "Link property tax completion certificates to physical geo-verified inspection of dual-chamber recharge wells.",
        "Provide 25% annual rebate on municipal sewer tax for verified functional recharge systems.",
        "Deploy stormwater injection pits along arterial expressway medians and flyover columns.",
        "Mandate geo-filtering sumps to prevent toxic street-runoff oil/grease aquifer contamination.",
      ],
      metrics: {
        waterSavedMld: savingsMld,
        capexCrores: 14.5,
        opexAnnualLakhs: 85,
        paybackPeriodYears: 2.8,
        aquiferRechargeHam: Math.round(rechargedHam),
        co2ReductionTonnesYr: 850,
        complianceDeadlineMonths: 6,
      },
      leadAgency: "Delhi Jal Board (DJB) & Municipal Corporations (MCD)",
      stakeholders: ["RWAs", "Real Estate Developers", "Urban Local Bodies"],
      triggerReason: "Underutilized monsoon precipitation causing urban flash floods instead of aquifer recharge.",
      riskIfIgnored: "Over 70% of peak monsoon rainfall drains out as urban flood runoff without sub-surface recharge.",
    });
  }

  // 3. Treated Sewage Effluent (STP) Dual-Piping & Cooling Tower Substitution
  if (params.industrialRecyclingPct < 70 || district.areaKm2 > 90) {
    // 15-25 Liters per capita per day of treated water substitute
    const dailySavedLiters = district.population * 22 * (params.industrialRecyclingPct / 100);
    const savingsMld = Number((dailySavedLiters / 1_000_000).toFixed(2));

    directives.push({
      id: "pol-industrial-dual-piping",
      title: "Tertiary Treated STP Water Dual-Piping & Industrial ZLD",
      category: "Industrial & Urban Recycling",
      priority: "HIGH_REGULATORY",
      description: "Substitution of high-grade groundwater draft with tertiary treated sewage effluent (TTSE) for industrial HVAC cooling, construction, and horticultural irrigation.",
      statutoryBasis: "National Water Policy 2012 & DPCC Wastewater Directives",
      actionItems: [
        "Mandate dual plumbing lines in all commercial towers, IT parks, and logistics hubs (>5000 sq.m).",
        "Subsidize distribution pipelines connecting Coronation Pillar, Okhla, and Keshopur STPs to industrial belts.",
        "Prohibit potable groundwater usage for municipal gardens and flyover green belts.",
        "Impose mandatory ZLD (Zero Liquid Discharge) systems with online BOD/COD sensors for chemical and textile units.",
      ],
      metrics: {
        waterSavedMld: savingsMld,
        capexCrores: 42.0,
        opexAnnualLakhs: 320,
        paybackPeriodYears: 3.5,
        aquiferRechargeHam: Math.round(district.annualExtractableResourceHam * 0.08),
        co2ReductionTonnesYr: 2100,
        complianceDeadlineMonths: 12,
      },
      leadAgency: "Delhi Pollution Control Committee (DPCC) & DJB",
      stakeholders: ["Industrial Area Development Authorities", "CPWD", "Horticulture Department"],
      triggerReason: "Valuable potable freshwater being wasted on industrial heat dissipation and bulk landscaping.",
      riskIfIgnored: "Industrial production shutdowns during peak summer water stress seasons.",
    });
  }

  // 4. Agricultural Drip Subsidies & Crop Diversification
  if (district.areaKm2 > 180 || params.dripIrrigationShiftPct < 60) {
    const savedHam = district.annualExtractableResourceHam * 0.10 * (params.dripIrrigationShiftPct / 100 || 0.4);
    const savingsMld = hamPerYearToMld(savedHam);

    directives.push({
      id: "pol-micro-irrigation",
      title: "Precision Micro-Irrigation & Crop Diversification Subsidies",
      category: "Agricultural Efficiency",
      priority: "MEDIUM_INCENTIVE",
      description: "Aggressive transition away from water-guzzling summer paddy cultivation to low-water millets, pulses, and solar-powered precision drip fertigation.",
      statutoryBasis: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) & Mera Pani Meri Virasat Scheme",
      actionItems: [
        "Provide 85% capital subsidy on smart automated drip irrigation and micro-sprinklers.",
        "Disburse direct financial incentive of ₹7,000/acre for farmers shifting from paddy to bajra/pulses.",
        "Implement dedicated agricultural solar feeder separation to restrict unmetered nocturnal tube-well pumping.",
        "Promote Laser Land Leveling to reduce field water evaporation losses by 25%.",
      ],
      metrics: {
        waterSavedMld: savingsMld,
        capexCrores: 22.4,
        opexAnnualLakhs: 110,
        paybackPeriodYears: 2.1,
        aquiferRechargeHam: Math.round(savedHam),
        co2ReductionTonnesYr: 3400,
        complianceDeadlineMonths: 8,
      },
      leadAgency: "State Department of Agriculture & Farmers Welfare",
      stakeholders: ["Farmer Producer Organizations (FPOs)", "Gram Panchayats", "DISCOMs"],
      triggerReason: "Flood irrigation in high-evaporation seasons accounts for up to 60% of rural draft.",
      riskIfIgnored: "Rapid desiccation of shallow agricultural tube-wells and agricultural debt traps.",
    });
  }

  // 5. Dynamic Surcharge & Blockchain Water Quality Credits
  if (predictedExtractionPct > 85) {
    const savedHam = district.annualGroundwaterDraftHam * 0.05;
    const savingsMld = hamPerYearToMld(savedHam);

    directives.push({
      id: "pol-dynamic-tariffs",
      title: "Aquifer-Indexed Dynamic Water Tariffs & Credit Trading",
      category: "Smart Groundwater Governance & Tariffs",
      priority: "HIGH_REGULATORY",
      description: "Dynamic algorithmic volumetric water pricing calibrated directly against monthly piezo-metric water table depths, incentivizing voluntary industrial recharge.",
      statutoryBasis: "State Water Regulatory Commission Directives",
      actionItems: [
        "Introduce seasonal aquifer-linked surcharges: tariffs automatically increase during pre-monsoon water table depressions.",
        "Establish 'Groundwater Recharge Credit' system allowing entities with surplus recharge to sell credits to water-deficit facilities.",
        "Provide zero-interest loans for industries achieving Net-Positive Aquifer Water Footprints.",
      ],
      metrics: {
        waterSavedMld: savingsMld,
        capexCrores: 5.2,
        opexAnnualLakhs: 40,
        paybackPeriodYears: 0.9,
        aquiferRechargeHam: 180,
        co2ReductionTonnesYr: 310,
        complianceDeadlineMonths: 6,
      },
      leadAgency: "State Water Regulatory Authority & Ministry of Jal Shakti",
      stakeholders: ["CII", "FICCI", "Commercial Users", "Fintech Partners"],
      triggerReason: "Flat unindexed water pricing fails to reflect real-time economic cost of groundwater scarcity.",
      riskIfIgnored: "Tragedy of the commons and unabated overuse by bulk commercial entities.",
    });
  }

  // Summary Totals
  const totalWaterSavingsMld = Number(
    directives.reduce((acc, d) => acc + d.metrics.waterSavedMld, 0).toFixed(1)
  );
  const totalCapexCrores = Number(
    directives.reduce((acc, d) => acc + d.metrics.capexCrores, 0).toFixed(1)
  );
  const totalCo2ReductionTonnes = Number(
    directives.reduce((acc, d) => acc + d.metrics.co2ReductionTonnesYr, 0).toFixed(0)
  );

  return {
    districtId: district.id,
    riskLevel,
    totalWaterSavingsMld,
    totalCapexCrores,
    totalCo2ReductionTonnes,
    directives,
  };
}

export function analyzeCustomPolicyDocument(
  documentTitle: string,
  textSnippet: string,
  district: CGWBDistrict
): CustomPolicyEvaluation {
  const content = textSnippet.toLowerCase();

  let recoveryMld = 12.5;
  let budgetEstimate = 25.0;
  let readiness = 75;

  if (content.includes("recharge") || content.includes("rainwater") || content.includes("rwh")) {
    recoveryMld += 8.4;
    budgetEstimate += 15.0;
    readiness += 10;
  }
  if (content.includes("recycle") || content.includes("stp") || content.includes("effluent")) {
    recoveryMld += 14.2;
    budgetEstimate += 35.0;
    readiness += 8;
  }
  if (content.includes("meter") || content.includes("telemetry") || content.includes("moratorium") || content.includes("ban")) {
    recoveryMld += 6.8;
    budgetEstimate += 8.0;
    readiness += 12;
  }
  if (content.includes("agriculture") || content.includes("drip") || content.includes("crop")) {
    recoveryMld += 9.5;
    budgetEstimate += 18.0;
  }
  if (content.includes("wetland") || content.includes("floodplain") || content.includes("pond")) {
    recoveryMld += 7.0;
    budgetEstimate += 12.0;
  }

  const targetHorizonYears = 8;
  const impactTrajectory = [];
  const baseYear = 2025;

  for (let i = 1; i <= targetHorizonYears; i++) {
    const complianceRatePct = Math.min(95, Math.round(20 + i * 11));
    const cumulativeWaterSavedMld = Number(((recoveryMld * (complianceRatePct / 100))).toFixed(1));
    const aquiferLevelReboundM = Number(((cumulativeWaterSavedMld * 0.04 * i)).toFixed(2));

    impactTrajectory.push({
      year: baseYear + i,
      cumulativeWaterSavedMld,
      complianceRatePct,
      aquiferLevelReboundM,
    });
  }

  const feasibility: "High" | "Moderate" | "Challenging" =
    readiness > 80 ? "High" : readiness > 60 ? "Moderate" : "Challenging";

  return {
    id: `eval-${Date.now()}`,
    sourceTitle: documentTitle || "Groundwater Action Draft Policy",
    extractedSynopsis: textSnippet.slice(0, 320) + (textSnippet.length > 320 ? "..." : ""),
    readinessScore: Math.min(98, readiness),
    feasibilityRating: feasibility,
    estimatedNetWaterRecoveryMld: Number(recoveryMld.toFixed(1)),
    estimatedBudgetCrores: Number(budgetEstimate.toFixed(1)),
    targetHorizonYears,
    impactTrajectory,
    regulatoryAlignment: {
      cgwaNormsMatchPct: Math.min(96, readiness + 5),
      djbGridInterlock: content.includes("grid") || content.includes("dual") || content.includes("djb"),
      environmentalClearanceNeeded: budgetEstimate > 30,
    },
    strengths: [
      "Quantifiable reduction in unmonitored municipal and industrial aquifer extraction.",
      `Directly aligns with Central Ground Water Authority statutory standards for ${district.name}.`,
      "High scalability across similar hydrogeological zones in Delhi NCR.",
    ],
    vulnerabilities: [
      "Requires inter-departmental coordination between DJB, DPCC, and Municipal Authorities.",
      "High initial upfront capital requirement for telemetric metering and dual piping infrastructure.",
      "Requires stringent RWA / commercial compliance enforcement to prevent leakage.",
    ],
    strategicRecommendations: [
      "Phase rollout starting with top 20% bulk commercial and industrial extraction hotspots.",
      "Establish escrow funding mechanism combining municipal grants with CSR environmental endowments.",
      "Deploy automated IoT piezometric telemetry loggers to verify actual water table rebound.",
    ],
  };
}
