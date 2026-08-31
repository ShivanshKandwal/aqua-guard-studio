import pandas as pd
import numpy as np
import os
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

print("=== AQUAGUARD ML TRAINING PIPELINE ===")

# 1. Load CGWB Dataset
df = pd.read_csv("server/data/delhi_ncr_cgwb_2015_2024.csv")
print(f"Loaded {len(df)} records across 15 NCR districts.")

# Feature Engineering
aquifer_map = {"Alluvial": 0, "Alluvial-Quartzite": 1, "Quartzite": 2}
df["aquifer_encoded"] = df["aquifer_type"].map(aquifer_map)

features = [
    "rainfall_anomaly_pct",
    "extraction_stage_pct",
    "rwh_adoption_pct",
    "industrial_recycling_pct",
    "drip_irrigation_shift_pct",
    "annual_rainfall_mm",
    "aquifer_encoded"
]
target = "water_level_depth_mbgl"

X = df[features].values
y = df[target].values

# Split Train (2015-2022) / Test (2023-2024)
train_mask = df["year"] <= 2022
test_mask = df["year"] > 2022

X_train, y_train = X[train_mask], y[train_mask]
X_test, y_test = X[test_mask], y[test_mask]

# Feature Normalization
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

os.makedirs("server/models", exist_ok=True)
joblib.dump(scaler, "server/models/feature_scaler.joblib")

# ----------------------------------------------------
# 1. MULTIVARIATE LINEAR REGRESSION
# ----------------------------------------------------
print("\n[1/3] Training Multivariate Linear Regression...")
linreg = LinearRegression()
linreg.fit(X_train_scaled, y_train)
y_pred_lr = linreg.predict(X_test_scaled)

rmse_lr = np.sqrt(mean_squared_error(y_test, y_pred_lr))
r2_lr = r2_score(y_test, y_pred_lr)
mae_lr = mean_absolute_error(y_test, y_pred_lr)

joblib.dump(linreg, "server/models/linear_regression.joblib")
print(f"Linear Regression => RMSE: {rmse_lr:.3f}m | R2: {r2_lr:.3f} | MAE: {mae_lr:.3f}m")

# ----------------------------------------------------
# 2. XGBOOST REGRESSOR
# ----------------------------------------------------
print("\n[2/3] Training XGBoost Gradient Boosted Trees...")
xgb_model = xgb.XGBRegressor(
    n_estimators=250,
    max_depth=4,
    learning_rate=0.04,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=42
)
xgb_model.fit(X_train_scaled, y_train)
y_pred_xgb = xgb_model.predict(X_test_scaled)

rmse_xgb = np.sqrt(mean_squared_error(y_test, y_pred_xgb))
r2_xgb = r2_score(y_test, y_pred_xgb)
mae_xgb = mean_absolute_error(y_test, y_pred_xgb)

xgb_model.save_model("server/models/xgboost_model.json")
print(f"XGBoost Model     => RMSE: {rmse_xgb:.3f}m | R2: {r2_xgb:.3f} | MAE: {mae_xgb:.3f}m")

# ----------------------------------------------------
# 3. PYTORCH LSTM TIME-SERIES REGRESSOR
# ----------------------------------------------------
print("\n[3/3] Training PyTorch LSTM Sequence Regressor...")
class GroundwaterLSTM(nn.Module):
    def __init__(self, input_dim=7, hidden_dim=32, num_layers=2):
        super(GroundwaterLSTM, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=num_layers, batch_first=True, dropout=0.1)
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 1)
        )
    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :]).squeeze(-1)

lstm_net = GroundwaterLSTM(input_dim=len(features), hidden_dim=32, num_layers=2)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(lstm_net.parameters(), lr=0.01, weight_decay=1e-4)

# Create sequences for PyTorch
X_train_t = torch.tensor(X_train_scaled[:, None, :], dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.float32)
X_test_t = torch.tensor(X_test_scaled[:, None, :], dtype=torch.float32)
y_test_t = torch.tensor(y_test, dtype=torch.float32)

dataset = TensorDataset(X_train_t, y_train_t)
loader = DataLoader(dataset, batch_size=16, shuffle=True)

lstm_net.train()
for epoch in range(120):
    for batch_x, batch_y in loader:
        optimizer.zero_grad()
        preds = lstm_net(batch_x)
        loss = criterion(preds, batch_y)
        loss.backward()
        optimizer.step()

lstm_net.eval()
with torch.no_grad():
    y_pred_lstm = lstm_net(X_test_t).numpy()

rmse_lstm = np.sqrt(mean_squared_error(y_test, y_pred_lstm))
r2_lstm = r2_score(y_test, y_pred_lstm)
mae_lstm = mean_absolute_error(y_test, y_pred_lstm)

torch.save(lstm_net.state_dict(), "server/models/lstm_groundwater.pt")
print(f"PyTorch LSTM      => RMSE: {rmse_lstm:.3f}m | R2: {r2_lstm:.3f} | MAE: {mae_lstm:.3f}m")

print("\n=== ALL MODELS SUCCESSFULLY TRAINED & SERIALIZED ===")
