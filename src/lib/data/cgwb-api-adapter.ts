import { CGWB_DISTRICTS, type CGWBDistrict } from "./cgwb-districts";

export interface CGWBApiResponse<T> {
  source: "CGWB_DIRECT_MOCK" | "INDIA_WRIS_LIVE";
  timestamp: string;
  data: T;
  status: "OK" | "SYNCED" | "DEGRADED";
}

/**
 * Extensible API Adapter Layer.
 * Provides instant fallback/bypass with official CGWB 2024 dynamic resource assessment data,
 * and allows plugging in a live API URL/Key when available.
 */
class CGWBApiAdapter {
  private liveEndpoint: string | null = null;
  private apiKey: string | null = null;

  public configureLiveEndpoint(endpoint: string, key?: string) {
    this.liveEndpoint = endpoint;
    this.apiKey = key || null;
  }

  public async fetchDistrictAssessment(districtId?: string): Promise<CGWBApiResponse<CGWBDistrict[]>> {
    // If live endpoint is configured, we can fetch from external Indian Govt API
    if (this.liveEndpoint) {
      try {
        const res = await fetch(`${this.liveEndpoint}/groundwater/ncr`, {
          headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
        });
        if (res.ok) {
          const liveData = await res.json();
          return {
            source: "INDIA_WRIS_LIVE",
            timestamp: new Date().toISOString(),
            data: liveData,
            status: "SYNCED",
          };
        }
      } catch (err) {
        console.warn("Live API fetch failed, falling back to local CGWB dataset bypass:", err);
      }
    }

    // Default fast local bypass
    const filtered = districtId
      ? CGWB_DISTRICTS.filter((d) => d.id === districtId)
      : CGWB_DISTRICTS;

    return {
      source: "CGWB_DIRECT_MOCK",
      timestamp: new Date().toISOString(),
      data: filtered,
      status: "OK",
    };
  }
}

export const cgwbApiAdapter = new CGWBApiAdapter();
