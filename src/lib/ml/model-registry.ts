import { LinearRegressionModel } from "./linear-regression";
import { XGBoostModel } from "./xgboost-model";
import { LSTMModel } from "./lstm-model";
import type { GroundwaterPredictor } from "./types";

const models: Record<string, GroundwaterPredictor> = {
  "xgboost-v1": new XGBoostModel(),
  "lstm-v1": new LSTMModel(),
  "linreg-v1": new LinearRegressionModel(),
};

export const listAvailableModels = (): GroundwaterPredictor[] => Object.values(models);

export const getModelById = (id: string): GroundwaterPredictor => {
  return models[id] || models["xgboost-v1"];
};
