import React, { useEffect, useRef, useState } from "react";
import { useStudioStore } from "../../lib/store/studio-store";
import { getRiskColor, type CGWBDistrict } from "../../lib/data/cgwb-districts";
import { Layers, Activity, Sparkles, MapPin } from "lucide-react";

interface InteractiveNcrMapProps {
  policyImpactMode?: boolean;
  policyReboundM?: number;
  policyRecoveryMld?: number;
  districtImpacts?: Record<
    string,
    {
      baselineExtractionPct: number;
      simulatedExtractionPct: number;
      extractionReductionPct: number;
      reboundM: number;
      newRiskLevel: string;
      isTarget: boolean;
    }
  >;
}

import ncrGeoJsonFallback from "../../data/ncr-districts.json";

export const InteractiveNcrMap: React.FC<InteractiveNcrMapProps> = ({
  policyImpactMode = false,
  policyReboundM = 0,
  policyRecoveryMld = 0,
  districtImpacts,
}) => {
  const { districts, selectedDistrictId, setSelectedDistrictId, getDistrictPrediction, params, activeModelId } = useStudioStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geoJsonLayerRef = useRef<any>(null);
  // Default to bundled GeoJSON immediately so there's zero network delay or file:// protocol failure
  const [geoJsonData, setGeoJsonData] = useState<any>(ncrGeoJsonFallback);
  const [isLoading, setIsLoading] = useState(false);

  // Map district name in GeoJSON to our district ID
  const districtNameMapping: Record<string, string> = {
    "Gurgaon": "gurugram",
    "Gurugram": "gurugram",
    "Gautam Buddha Nagar": "noida",
    "Gautam Buddh Nagar": "noida",
    "New Delhi": "new-delhi",
    "Central": "central-delhi",
    "Central Delhi": "central-delhi",
    "North": "north-delhi",
    "North Delhi": "north-delhi",
    "South": "south-delhi",
    "South Delhi": "south-delhi",
    "South West": "south-west-delhi",
    "South West Delhi": "south-west-delhi",
    "West": "west-delhi",
    "West Delhi": "west-delhi",
    "North West": "north-west-delhi",
    "North West Delhi": "north-west-delhi",
    "East": "east-delhi",
    "East Delhi": "east-delhi",
    "North East": "north-east-delhi",
    "North East Delhi": "north-east-delhi",
    "Shahdara": "shahdara",
    "South East": "south-east-delhi",
    "South East Delhi": "south-east-delhi",
    "Faridabad": "faridabad",
    "Ghaziabad": "ghaziabad",
  };

  // 1. Fetch GeoJSON (with bundled fallback already present)
  useEffect(() => {
    if (!geoJsonData) {
      const geojsonUrl = import.meta.env.BASE_URL
        ? `${import.meta.env.BASE_URL}data/ncr-districts.geojson`
        : "./data/ncr-districts.geojson";

      fetch(geojsonUrl)
        .then((res) => res.json())
        .then((data) => {
          setGeoJsonData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Using bundled fallback GeoJSON:", err);
          setGeoJsonData(ncrGeoJsonFallback);
          setIsLoading(false);
        });
    }
  }, [geoJsonData]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      if (isCancelled || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [28.61, 77.21],
        zoom: 9.2,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // 100% Free OpenStreetMap Clean Base Layer (Zero Watermarks)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      // Add district centroid text labels with high-contrast badge pills
      districts.forEach((d) => {
        L.marker(d.center, {
          icon: L.divIcon({
            className: "custom-district-label",
            html: `<div style="display:inline-block;padding:2px 7px;background:rgba(2,6,23,0.85);color:#ffffff;font-size:10px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;border:1px solid rgba(56,189,248,0.4);border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.6);white-space:nowrap;pointer-events:none;transform:translate(-50%,-50%);">${d.name}</div>`,
          }),
          interactive: false,
        }).addTo(map);
      });
    })();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [districts]);

  // 3. Render and Update GeoJSON Polygon Layer when data, parameters, selection, or policy impact mode change
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData) return;

    import("leaflet").then((LModule) => {
      const L = LModule.default;

      // Remove existing geojson layer if present
      if (geoJsonLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
      }

      const getPolygonStyle = (feature: any) => {
        const districtKey = feature.properties?.district || feature.properties?.name;
        const districtId = districtNameMapping[districtKey];
        const isSelected = districtId === selectedDistrictId;

        if (!districtId) {
          return {
            color: "#334155",
            weight: 1,
            fillColor: "#1e293b",
            fillOpacity: 0.3,
          };
        }

        const prediction = getDistrictPrediction(districtId);
        let risk = prediction.riskLevel;

        // If policy impact mode is enabled, evaluate specific district impact
        if (policyImpactMode) {
          if (districtImpacts && districtImpacts[districtId]) {
            risk = districtImpacts[districtId].newRiskLevel as any;
          } else if (policyReboundM > 0) {
            const simulatedExtraction = Math.max(45, prediction.predictedExtractionPct - (policyRecoveryMld * 0.75));
            risk = simulatedExtraction > 100 ? "Critical" : simulatedExtraction > 70 ? "Semi-Critical" : "Safe";
          }
        }

        const color = getRiskColor(risk);

        return {
          color: isSelected ? "#38bdf8" : policyImpactMode ? "#10b981" : "#0f172a",
          weight: isSelected ? 3 : policyImpactMode ? 1.8 : 1.2,
          fillColor: color,
          fillOpacity: isSelected ? 0.82 : policyImpactMode ? 0.70 : 0.52,
        };
      };

      const geoJsonLayer = L.geoJSON(geoJsonData, {
        style: getPolygonStyle,
        onEachFeature: (feature: any, layer: any) => {
          const districtKey = feature.properties?.district || feature.properties?.name;
          const districtId = districtNameMapping[districtKey];
          const district = districts.find((d) => d.id === districtId);

          if (district) {
            const prediction = getDistrictPrediction(district.id);
            let risk = prediction.riskLevel;
            let finalDepth = prediction.predictedWaterLevelM;
            let extractReduction = 0;
            let reboundVal = policyReboundM;

            if (policyImpactMode) {
              if (districtImpacts && districtImpacts[districtId]) {
                const dImp = districtImpacts[districtId];
                risk = dImp.newRiskLevel as any;
                extractReduction = dImp.extractionReductionPct;
                reboundVal = dImp.reboundM;
                finalDepth = Number(Math.max(2.0, prediction.predictedWaterLevelM - reboundVal).toFixed(2));
              } else if (policyReboundM > 0) {
                const simulatedExtraction = Math.max(45, prediction.predictedExtractionPct - (policyRecoveryMld * 0.75));
                risk = simulatedExtraction > 100 ? "Critical" : simulatedExtraction > 70 ? "Semi-Critical" : "Safe";
                finalDepth = Number(Math.max(2.0, prediction.predictedWaterLevelM - policyReboundM).toFixed(2));
              }
            }

            const riskCol = getRiskColor(risk);

            layer.bindTooltip(
              `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:215px;color:#f8fafc;">
                <div style="font-weight:700;font-size:13px;color:#38bdf8;border-bottom:1px solid #334155;padding-bottom:5px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                  <span style="color:#ffffff;font-size:13px;font-weight:700;">${district.name}</span>
                  <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${riskCol}28;color:${riskCol};border:1px solid ${riskCol}55;">${risk}</span>
                </div>
                ${policyImpactMode ? `
                <div style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);padding:5px 7px;border-radius:6px;margin-bottom:6px;font-size:10px;color:#6ee7b7;font-weight:600;">
                  ⚡ Policy Effect: +${reboundVal}m Rebound ${extractReduction > 0 ? `(-${extractReduction}% Draft)` : ''}
                </div>` : ''}
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px;">
                  <span style="color:#94a3b8;">${policyImpactMode ? "Post-Policy Depth:" : "Current Depth:"}</span>
                  <strong style="color:#ffffff;font-size:12px;">${finalDepth} mbgl</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px;">
                  <span style="color:#94a3b8;">Baseline Depth:</span>
                  <span style="color:#94a3b8;">${district.baselineWaterLevelM} mbgl</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;">
                  <span style="color:#94a3b8;">Aquifer Strata:</span>
                  <span style="color:#e2e8f0;font-weight:600;">${district.aquiferType}</span>
                </div>
              </div>`,
              { sticky: true, opacity: 0.98 }
            );

            layer.on({
              mouseover: () => {
                layer.setStyle({
                  weight: 2.8,
                  fillOpacity: 0.85,
                  color: "#38bdf8",
                });
              },
              mouseout: () => {
                geoJsonLayer.resetStyle(layer);
              },
              click: () => {
                setSelectedDistrictId(district.id);
                mapInstanceRef.current?.flyTo(district.center, 10, { duration: 1.0 });
              },
            });
          }
        },
      }).addTo(mapInstanceRef.current);

      geoJsonLayerRef.current = geoJsonLayer;
    });
  }, [geoJsonData, selectedDistrictId, params, activeModelId, districts, policyImpactMode, policyReboundM, policyRecoveryMld, districtImpacts]);

  return (
    <div className="relative h-full min-h-[440px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Header Badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/95 px-3 py-1.5 backdrop-blur-md shadow-lg pointer-events-none">
        <Layers className="h-4 w-4 text-cyan-400" />
        <span className="text-xs font-semibold text-slate-200">Delhi NCR District Boundaries</span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
      </div>

      {/* Map Legend Overlay - Highest Z-Index (over Leaflet map tiles and SVG panes) */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-2xl border border-slate-700/90 bg-[#060c1d]/95 p-4 text-xs backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] pointer-events-auto min-w-[200px]">
        <div className="flex items-center gap-2 font-bold text-white mb-2.5 pb-2 border-b border-slate-800">
          <Activity className="h-4 w-4 text-cyan-400" /> CGWB Extraction Stage
        </div>
        <div className="space-y-2 font-medium">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-emerald-950 shadow-sm"></span>
            <span className="text-slate-100 text-[11px] font-semibold">Safe (&le; 70%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-amber-400 ring-2 ring-amber-950 shadow-sm"></span>
            <span className="text-slate-100 text-[11px] font-semibold">Semi-Critical (70–90%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-orange-500 ring-2 ring-orange-950 shadow-sm"></span>
            <span className="text-slate-100 text-[11px] font-semibold">Critical (90–100%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-950 shadow-sm"></span>
            <span className="text-slate-100 text-[11px] font-semibold">Over-Exploited (&gt; 100%)</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm text-xs text-slate-400">
          Loading district boundary polygons...
        </div>
      )}

      {/* Leaflet Map DOM Target */}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};
