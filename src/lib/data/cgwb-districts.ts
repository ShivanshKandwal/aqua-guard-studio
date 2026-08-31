/**
 * CGWB (Central Ground Water Board) Assessment Baseline for Delhi NCR Districts.
 * Stage of Extraction:
 *   <= 70%  : Safe (Green)
 *   70-90%  : Semi-Critical (Yellow)
 *   90-100% : Critical (Orange)
 *   > 100%  : Over-Exploited (Red)
 */

export type AquiferCategory = "Alluvial" | "Quartzite" | "Alluvial-Quartzite";
export type RiskLevel = "Safe" | "Semi-Critical" | "Critical" | "Over-Exploited";

export interface CGWBDistrict {
  id: string;
  name: string;
  state: "Delhi" | "Haryana" | "Uttar Pradesh";
  center: [number, number]; // [lat, lng]
  population: number;
  areaKm2: number;
  baselineWaterLevelM: number;     // Depth to water table (meters below ground level - mbgl)
  baselineExtractionPct: number;   // Stage of extraction %
  baselineRainfallMm: number;      // Annual normal rainfall (mm)
  aquiferType: AquiferCategory;
  annualExtractableResourceHam: number; // Hectare Meters
  annualGroundwaterDraftHam: number;     // Total draft
  rechargePotentialHam: number;
  preMonsoonLevelM: number;
  postMonsoonLevelM: number;
}

export const CGWB_DISTRICTS: CGWBDistrict[] = [
  {
    id: "new-delhi",
    name: "New Delhi",
    state: "Delhi",
    center: [28.6139, 77.2090],
    population: 250000,
    areaKm2: 42.7,
    baselineWaterLevelM: 18.4,
    baselineExtractionPct: 94,
    baselineRainfallMm: 774,
    aquiferType: "Alluvial-Quartzite",
    annualExtractableResourceHam: 1420,
    annualGroundwaterDraftHam: 1335,
    rechargePotentialHam: 480,
    preMonsoonLevelM: 19.8,
    postMonsoonLevelM: 17.5
  },
  {
    id: "central-delhi",
    name: "Central Delhi",
    state: "Delhi",
    center: [28.6519, 77.2315],
    population: 582320,
    areaKm2: 25.0,
    baselineWaterLevelM: 22.1,
    baselineExtractionPct: 108,
    baselineRainfallMm: 770,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 980,
    annualGroundwaterDraftHam: 1058,
    rechargePotentialHam: 310,
    preMonsoonLevelM: 23.5,
    postMonsoonLevelM: 21.2
  },
  {
    id: "north-delhi",
    name: "North Delhi",
    state: "Delhi",
    center: [28.7186, 77.2131],
    population: 900000,
    areaKm2: 60.0,
    baselineWaterLevelM: 15.2,
    baselineExtractionPct: 88,
    baselineRainfallMm: 790,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 2100,
    annualGroundwaterDraftHam: 1848,
    rechargePotentialHam: 820,
    preMonsoonLevelM: 16.4,
    postMonsoonLevelM: 14.1
  },
  {
    id: "south-delhi",
    name: "South Delhi",
    state: "Delhi",
    center: [28.5245, 77.1855],
    population: 2731929,
    areaKm2: 250.0,
    baselineWaterLevelM: 34.6,
    baselineExtractionPct: 142,
    baselineRainfallMm: 760,
    aquiferType: "Quartzite",
    annualExtractableResourceHam: 3100,
    annualGroundwaterDraftHam: 4402,
    rechargePotentialHam: 780,
    preMonsoonLevelM: 36.8,
    postMonsoonLevelM: 33.2
  },
  {
    id: "south-west-delhi",
    name: "South West Delhi",
    state: "Delhi",
    center: [28.5921, 77.0460],
    population: 2292958,
    areaKm2: 421.0,
    baselineWaterLevelM: 41.2,
    baselineExtractionPct: 156,
    baselineRainfallMm: 720,
    aquiferType: "Alluvial-Quartzite",
    annualExtractableResourceHam: 4800,
    annualGroundwaterDraftHam: 7488,
    rechargePotentialHam: 1100,
    preMonsoonLevelM: 43.5,
    postMonsoonLevelM: 39.8
  },
  {
    id: "west-delhi",
    name: "West Delhi",
    state: "Delhi",
    center: [28.6663, 77.0666],
    population: 2543243,
    areaKm2: 129.0,
    baselineWaterLevelM: 28.7,
    baselineExtractionPct: 118,
    baselineRainfallMm: 750,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 2400,
    annualGroundwaterDraftHam: 2832,
    rechargePotentialHam: 650,
    preMonsoonLevelM: 30.2,
    postMonsoonLevelM: 27.6
  },
  {
    id: "north-west-delhi",
    name: "North West Delhi",
    state: "Delhi",
    center: [28.7186, 77.0700],
    population: 3656539,
    areaKm2: 440.0,
    baselineWaterLevelM: 26.4,
    baselineExtractionPct: 122,
    baselineRainfallMm: 780,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 5200,
    annualGroundwaterDraftHam: 6344,
    rechargePotentialHam: 1600,
    preMonsoonLevelM: 28.1,
    postMonsoonLevelM: 25.2
  },
  {
    id: "east-delhi",
    name: "East Delhi",
    state: "Delhi",
    center: [28.6280, 77.2954],
    population: 1709346,
    areaKm2: 64.0,
    baselineWaterLevelM: 9.8,
    baselineExtractionPct: 74,
    baselineRainfallMm: 800,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 2200,
    annualGroundwaterDraftHam: 1628,
    rechargePotentialHam: 950,
    preMonsoonLevelM: 10.9,
    postMonsoonLevelM: 8.9
  },
  {
    id: "north-east-delhi",
    name: "North East Delhi",
    state: "Delhi",
    center: [28.6869, 77.2917],
    population: 2241624,
    areaKm2: 60.0,
    baselineWaterLevelM: 11.5,
    baselineExtractionPct: 82,
    baselineRainfallMm: 795,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 1850,
    annualGroundwaterDraftHam: 1517,
    rechargePotentialHam: 780,
    preMonsoonLevelM: 12.6,
    postMonsoonLevelM: 10.7
  },
  {
    id: "shahdara",
    name: "Shahdara",
    state: "Delhi",
    center: [28.6829, 77.2895],
    population: 900000,
    areaKm2: 60.0,
    baselineWaterLevelM: 13.2,
    baselineExtractionPct: 91,
    baselineRainfallMm: 790,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 1600,
    annualGroundwaterDraftHam: 1456,
    rechargePotentialHam: 610,
    preMonsoonLevelM: 14.4,
    postMonsoonLevelM: 12.3
  },
  {
    id: "south-east-delhi",
    name: "South East Delhi",
    state: "Delhi",
    center: [28.5495, 77.2500],
    population: 1100000,
    areaKm2: 110.0,
    baselineWaterLevelM: 24.8,
    baselineExtractionPct: 112,
    baselineRainfallMm: 765,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 1900,
    annualGroundwaterDraftHam: 2128,
    rechargePotentialHam: 550,
    preMonsoonLevelM: 26.2,
    postMonsoonLevelM: 23.8
  },
  {
    id: "gurugram",
    name: "Gurugram",
    state: "Haryana",
    center: [28.4595, 77.0266],
    population: 1500000,
    areaKm2: 1258.0,
    baselineWaterLevelM: 45.6,
    baselineExtractionPct: 168,
    baselineRainfallMm: 620,
    aquiferType: "Quartzite",
    annualExtractableResourceHam: 8500,
    annualGroundwaterDraftHam: 14280,
    rechargePotentialHam: 2200,
    preMonsoonLevelM: 48.4,
    postMonsoonLevelM: 43.6
  },
  {
    id: "faridabad",
    name: "Faridabad",
    state: "Haryana",
    center: [28.4089, 77.3178],
    population: 1400000,
    areaKm2: 793.0,
    baselineWaterLevelM: 32.1,
    baselineExtractionPct: 135,
    baselineRainfallMm: 650,
    aquiferType: "Alluvial-Quartzite",
    annualExtractableResourceHam: 7200,
    annualGroundwaterDraftHam: 9720,
    rechargePotentialHam: 1800,
    preMonsoonLevelM: 34.5,
    postMonsoonLevelM: 30.2
  },
  {
    id: "noida",
    name: "Gautam Buddh Nagar (Noida)",
    state: "Uttar Pradesh",
    center: [28.5355, 77.3910],
    population: 1650000,
    areaKm2: 1442.0,
    baselineWaterLevelM: 22.4,
    baselineExtractionPct: 116,
    baselineRainfallMm: 720,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 11200,
    annualGroundwaterDraftHam: 12992,
    rechargePotentialHam: 3400,
    preMonsoonLevelM: 24.1,
    postMonsoonLevelM: 21.0
  },
  {
    id: "ghaziabad",
    name: "Ghaziabad",
    state: "Uttar Pradesh",
    center: [28.6692, 77.4538],
    population: 1730000,
    areaKm2: 1179.0,
    baselineWaterLevelM: 19.8,
    baselineExtractionPct: 128,
    baselineRainfallMm: 730,
    aquiferType: "Alluvial",
    annualExtractableResourceHam: 9400,
    annualGroundwaterDraftHam: 12032,
    rechargePotentialHam: 2900,
    preMonsoonLevelM: 21.5,
    postMonsoonLevelM: 18.5
  }
];

export function getRiskLevel(extractionPct: number): RiskLevel {
  if (extractionPct <= 70) return "Safe";
  if (extractionPct <= 90) return "Semi-Critical";
  if (extractionPct <= 100) return "Critical";
  return "Over-Exploited";
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "Safe": return "#10b981"; // Emerald
    case "Semi-Critical": return "#eab308"; // Yellow
    case "Critical": return "#f97316"; // Orange
    case "Over-Exploited": return "#ef4444"; // Red
  }
}
