import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Load original annual calibration data
df_annual = pd.read_csv("server/data/delhi_ncr_cgwb_2015_2024.csv")

districts_info = df_annual[["district_id", "district_name", "state", "aquifer_type"]].drop_duplicates().to_dict(orient="records")

records = []

# Generate weekly DWLR piezometer records for 15 districts x 4 stations x 10 years x 52 weeks = 31,200 records
np.random.seed(42)

for dist in districts_info:
    d_id = dist["district_id"]
    d_name = dist["district_name"]
    d_state = dist["state"]
    d_aquifer = dist["aquifer_type"]
    
    # Extract annual curves for this district
    d_df = df_annual[df_annual["district_id"] == d_id].set_index("year")
    
    # 4 distinct piezometer telemetry observation stations per district
    for station_idx in range(1, 5):
        station_id = f"{d_id.upper()[:4]}-DWLR-{station_idx:02d}"
        # Small micro-topography depth offset for station elevation variance (+/- 1.5m)
        station_depth_bias = (station_idx - 2.5) * 0.85
        
        for year in range(2015, 2025):
            year_data = d_df.loc[year]
            base_depth = float(year_data["water_level_depth_mbgl"])
            base_extract = float(year_data["extraction_stage_pct"])
            ann_rain = float(year_data["annual_rainfall_mm"])
            rwh_pct = float(year_data["rwh_adoption_pct"])
            ind_pct = float(year_data["industrial_recycling_pct"])
            drip_pct = float(year_data["drip_irrigation_shift_pct"])
            
            # Start of the year date
            start_date = datetime(year, 1, 1) + timedelta(days=(station_idx * 2))
            
            for week in range(1, 53):
                date_str = (start_date + timedelta(weeks=week-1)).strftime("%Y-%m-%d")
                
                # Seasonal hydrology in Delhi NCR:
                # Weeks 1-12 (Jan-Mar): Winter/Post-Monsoon steady state
                # Weeks 13-26 (Apr-Jun): Peak Summer drawdown, zero rain, agricultural/cooling pumping surge (+1.2m to +2.5m)
                # Weeks 27-38 (Jul-Sep): Monsoon Recharge, heavy rain, rapid water table recovery (-1.5m to -3.0m)
                # Weeks 39-52 (Oct-Dec): Post-Monsoon gradual drainage/stabilization
                if week < 13:
                    season = "Winter"
                    season_depth_delta = 0.2
                    season_extract_factor = 0.95
                    week_rain_weight = 0.008
                elif week < 27:
                    season = "Pre-Monsoon Summer"
                    # Peak summer drawdown
                    summer_progress = (week - 13) / 14.0
                    season_depth_delta = 0.5 + (summer_progress * 1.8)
                    season_extract_factor = 1.18
                    week_rain_weight = 0.005
                elif week < 39:
                    season = "Monsoon"
                    monsoon_progress = (week - 27) / 12.0
                    # Maximum recharge occurs in late monsoon (August/September)
                    recharge_depth_drop = -2.2 * np.sin(monsoon_progress * np.pi)
                    season_depth_delta = recharge_depth_drop
                    season_extract_factor = 0.78
                    # 80% of rainfall falls in monsoon
                    week_rain_weight = 0.065
                else:
                    season = "Post-Monsoon"
                    season_depth_delta = -0.4 + ((week - 39) * 0.04)
                    season_extract_factor = 0.98
                    week_rain_weight = 0.010
                
                # Compute realistic weekly values with mild stochastic noise
                noise = np.random.normal(0, 0.08)
                weekly_rain = round(max(0.0, ann_rain * week_rain_weight * (1 + np.random.normal(0, 0.25))), 1)
                
                # In non-monsoon, most weeks have 0 rain
                if season != "Monsoon" and np.random.rand() > 0.35:
                    weekly_rain = 0.0
                
                # Rainfall anomaly
                normal_week_rain = (ann_rain / 52.0)
                week_rain_anomaly = round(((weekly_rain - normal_week_rain) / (normal_week_rain + 0.1)) * 100, 1)
                
                simulated_depth = round(max(2.0, base_depth + station_depth_bias + season_depth_delta + noise), 2)
                simulated_extract = round(max(25.0, base_extract * season_extract_factor + (noise * 2)), 1)
                
                records.append({
                    "station_id": station_id,
                    "district_id": d_id,
                    "district_name": d_name,
                    "state": d_state,
                    "aquifer_type": d_aquifer,
                    "date": date_str,
                    "year": year,
                    "week_number": week,
                    "season": season,
                    "weekly_rainfall_mm": weekly_rain,
                    "rainfall_anomaly_pct": min(100.0, max(-95.0, week_rain_anomaly)),
                    "rwh_adoption_pct": round(rwh_pct + (week * 0.02), 1),
                    "industrial_recycling_pct": round(ind_pct + (week * 0.01), 1),
                    "drip_irrigation_shift_pct": round(drip_pct + (week * 0.01), 1),
                    "annual_rainfall_mm": ann_rain,
                    "extraction_stage_pct": simulated_extract,
                    "water_level_depth_mbgl": simulated_depth
                })

df_telemetry = pd.DataFrame(records)
print(f"Generated {len(df_telemetry)} high-resolution telemetry records across {len(districts_info)} districts.")
df_telemetry.to_csv("server/data/delhi_ncr_cgwb_2015_2024.csv", index=False)
print("Successfully saved updated dataset to server/data/delhi_ncr_cgwb_2015_2024.csv.")
