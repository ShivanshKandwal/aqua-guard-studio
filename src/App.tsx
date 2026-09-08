import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { StudioPage } from "./pages/StudioPage";
import { AssistantPage } from "./pages/AssistantPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { PolicyEvaluatorPage } from "./pages/PolicyEvaluatorPage";
import { ModelsPage } from "./pages/ModelsPage";

export const App: React.FC = () => {
  return (
    <HashRouter>
      <PageShell>
        <Routes>
          <Route path="/" element={<StudioPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/policy-evaluator" element={<PolicyEvaluatorPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageShell>
    </HashRouter>
  );
};
