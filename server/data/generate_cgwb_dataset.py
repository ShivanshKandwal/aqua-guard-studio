import pandas as pd
import numpy as np
import os

districts_meta = [
    {"id": "new-delhi", "name": "New Delhi", "state": "Delhi", "aquifer": "Alluvial-Quartzite", "base_depth": 18.4, "base_extract": 94, "base_rain": 774, "extractable_ham": 1420, "draft_ham": 1335, "recharge_ham": 480},
    {"id": "central-delhi", "name": "Central Delhi", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 22.1, "base_extract": 108, "base_rain": 770, "extractable_ham": 980, "draft_ham": 1058, "recharge_ham": 310},
    {"id": "north-delhi", "name": "North Delhi", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 15.2, "base_extract": 88, "base_rain": 790, "extractable_ham": 2100, "draft_ham": 1848, "recharge_ham": 820},
    {"id": "south-delhi", "name": "South Delhi", "state": "Delhi", "aquifer": "Quartzite", "base_depth": 34.6, "base_extract": 142, "base_rain": 760, "extractable_ham": 3100, "draft_ham": 4402, "recharge_ham": 780},
    {"id": "south-west-delhi", "name": "South West Delhi", "state": "Delhi", "aquifer": "Alluvial-Quartzite", "base_depth": 41.2, "base_extract": 156, "base_rain": 720, "extractable_ham": 4800, "draft_ham": 7488, "recharge_ham": 1100},
    {"id": "west-delhi", "name": "West Delhi", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 28.7, "base_extract": 118, "base_rain": 750, "extractable_ham": 2400, "draft_ham": 2832, "recharge_ham": 650},
    {"id": "north-west-delhi", "name": "North West Delhi", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 26.4, "base_extract": 122, "base_rain": 780, "extractable_ham": 5200, "draft_ham": 6344, "recharge_ham": 1600},
    {"id": "east-delhi", "name": "East Delhi", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 9.8, "base_extract": 74, "base_rain": 800, "extractable_ham": 2200, "draft_ham": 1628, "recharge_ham": 950},
    {"id": "north-east-delhi", "name": "North East Delhi", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 11.5, "base_extract": 82, "base_rain": 795, "extractable_ham": 1850, "draft_ham": 1517, "recharge_ham": 780},
    {"id": "shahdara", "name": "Shahdara", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 13.2, "base_extract": 91, "base_rain": 790, "extractable_ham": 1600, "draft_ham": 1456, "recharge_ham": 610},
    {"id": "south-east-delhi", "name": "South East Delhi", "state": "Delhi", "aquifer": "Alluvial", "base_depth": 24.8, "base_extract": 112, "base_rain": 765, "extractable_ham": 1900, "draft_ham": 2128, "recharge_ham": 550},
    {"id": "gurugram", "name": "Gurugram", "state": "Haryana", "aquifer": "Quartzite", "base_depth": 45.6, "base_extract": 168, "base_rain": 620, "extractable_ham": 8500, "draft_ham": 14280, "recharge_ham": 2200},
    {"id": "faridabad", "name": "Faridabad", "state": "Haryana", "aquifer": "Alluvial-Quartzite", "base_depth": 32.1, "base_extract": 135, "base_rain": 650, "extractable_ham": 7200, "draft_ham": 9720, "recharge_ham": 1800},
    {"id": "noida", "name": "Gautam Buddh Nagar (Noida)", "state": "Uttar Pradesh", "aquifer": "Alluvial", "base_depth": 22.4, "base_extract": 116, "base_rain": 720, "extractable_ham": 11200, "draft_ham": 12992, "recharge_ham": 3400},
    {"id": "ghaziabad", "name": "Ghaziabad", "state": "Uttar Pradesh", "aquifer": "Alluvial", "base_depth": 19.8, "base_extract": 128, "base_rain": 730, "extractable_ham": 9400, "draft_ham": 12032, "recharge_ham": 2900}
]

imd_anomalies = {
    2015: -18.2, 2016: -12.4, 2017: 4.5, 2018: -8.1, 2019: -22.5,
    2020: 14.8, 2021: 28.6, 2022: -5.4, 2023: 32.1, 2024: 6.2
}

records = []
for d in districts_meta:
    curr_depth = d["base_depth"] - 4.5
    curr_extraction = d["base_extract"] - 14.0
    
    for year in range(2015, 2025):
        rain_anomaly = imd_anomalies[year] + float(np.random.normal(0, 3.0))
        annual_rain = round(d["base_rain"] * (1 + rain_anomaly / 100), 1)
        
        hard_rock_mod = 1.35 if d["aquifer"] == "Quartzite" else 1.1 if d["aquifer"] == "Alluvial-Quartzite" else 0.85
        rwh_rate = min(40.0, max(5.0, (year - 2014) * 3.5 + float(np.random.normal(0, 1.5))))
        recycling_rate = min(50.0, max(10.0, (year - 2014) * 4.0 + float(np.random.normal(0, 2.0))))
        
        extract_growth = 1.5 + (0.8 * hard_rock_mod)
        curr_extraction = max(40.0, curr_extraction + extract_growth - (rwh_rate * 0.15))
        
        depth_drift = ((curr_extraction - 100) * 0.045 * hard_rock_mod if curr_extraction > 100 else -0.15) - (rain_anomaly * 0.04)
        curr_depth = max(2.5, curr_depth + depth_drift + float(np.random.normal(0, 0.2)))
        
        actual_draft_ham = round(d["extractable_ham"] * (curr_extraction / 100))
        actual_recharge_ham = round(d["recharge_ham"] * (1 + (rain_anomaly / 100) * 0.8) + (rwh_rate * 8))
        
        records.append({
            "district_id": d["id"],
            "district_name": d["name"],
            "state": d["state"],
            "aquifer_type": d["aquifer"],
            "year": year,
            "annual_rainfall_mm": annual_rain,
            "rainfall_anomaly_pct": round(rain_anomaly, 2),
            "rwh_adoption_pct": round(rwh_rate, 1),
            "industrial_recycling_pct": round(recycling_rate, 1),
            "drip_irrigation_shift_pct": round(min(35.0, (year - 2014) * 3.0), 1),
            "annual_extractable_resource_ham": d["extractable_ham"],
            "annual_groundwater_draft_ham": actual_draft_ham,
            "recharge_potential_ham": actual_recharge_ham,
            "extraction_stage_pct": round(curr_extraction, 1),
            "water_level_depth_mbgl": round(curr_depth, 2)
        })

df = pd.DataFrame(records)
os.makedirs("server/data", exist_ok=True)
df.to_csv("server/data/delhi_ncr_cgwb_2015_2024.csv", index=False)
print("SUCCESS: Generated server/data/delhi_ncr_cgwb_2015_2024.csv with rows:", len(df))
