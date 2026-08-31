import React, { useEffect, useRef, useState } from "react";
import { useStudioStore } from "../../lib/store/studio-store";
import { getRiskColor, type CGWBDistrict } from "../../lib/data/cgwb-districts";
import { Layers, Activity, Sparkles, MapPin } from "lucide-react";

export const InteractiveNcrMap: React.FC = () => {
  const { districts, selectedDistrictId, setSelectedDistrictId, getDistrictPrediction, params, activeModelId } = useStudioStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geoJsonLayerRef = useRef<any>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // 1. Fetch GeoJSON
  useEffect(() => {
    fetch("/data/ncr-districts.geojson")
      .then((res) => res.json())
      .then((data) => {
        setGeoJsonData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load NCR GeoJSON:", err);
        setIsLoading(false);
      });
  }, []);

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

      // Clean CartoDB Dark Matter / Positron tile (No API key watermarks)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd",
        opacity: 0.85,
      }).addTo(map);

      // Add district centroid text labels
      districts.forEach((d) => {
        L.marker(d.center, {
          icon: L.divIcon({
            className: "custom-district-label",
            html: `<div style="font-size:10px;font-weight:700;color:#f8fafc;text-shadow:0 0 4px #020617,0 0 4px #020617,0 0 6px #020617;white-space:nowrap;pointer-events:none;transform:translate(-50%,-50%);">${d.name}</div>`,
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

  // 3. Render and Update GeoJSON Polygon Layer when data, parameters, or selection change
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
        const color = getRiskColor(prediction.riskLevel);

        return {
          color: isSelected ? "#38bdf8" : "#0f172a",
          weight: isSelected ? 3 : 1.2,
          fillColor: color,
          fillOpacity: isSelected ? 0.75 : 0.52,
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
            const riskCol = getRiskColor(prediction.riskLevel);

            layer.bindTooltip(
              `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:190px;color:#f8fafc;">
                <div style="font-weight:700;font-size:13px;color:#38bdf8;border-bottom:1px solid #334155;padding-bottom:5px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                  <span style="color:#ffffff;font-size:13px;font-weight:700;">${district.name}</span>
                  <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${riskCol}28;color:${riskCol};border:1px solid ${riskCol}55;">${prediction.riskLevel}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px;">
                  <span style="color:#94a3b8;">Simulated Depth:</span>
                  <strong style="color:#ffffff;font-size:12px;">${prediction.predictedWaterLevelM} mbgl</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px;">
                  <span style="color:#94a3b8;">Extraction Stage:</span>
                  <strong style="color:${riskCol};font-size:12px;">${prediction.predictedExtractionPct}%</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;">
                  <span style="color:#94a3b8;">Aquifer Type:</span>
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
  }, [geoJsonData, selectedDistrictId, params, activeModelId, districts]);

  return (
    <div className="relative h-full min-h-[440px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Header Badge */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-1.5 backdrop-blur-md shadow-lg">
        <Layers className="h-4 w-4 text-cyan-400" />
        <span className="text-xs font-semibold text-slate-200">Delhi NCR District Boundaries</span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 right-4 z-[400] rounded-xl border border-slate-800 bg-slate-950/90 p-3 backdrop-blur-md text-[11px] shadow-xl">
        <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-cyan-400" /> CGWB Extraction Stage
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-400">Safe (&le; 70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500"></span>
            <span className="text-slate-400">Semi-Critical (70-90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-500"></span>
            <span className="text-slate-400">Critical (90-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500"></span>
            <span className="text-slate-400">Over-Exploited (&gt; 100%)</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm text-xs text-slate-400">
          Loading district boundary polygons...
        </div>
      )}

      {/* Leaflet Map DOM Target */}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};
