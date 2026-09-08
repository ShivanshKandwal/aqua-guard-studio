import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { StudioPage } from "./pages/StudioPage";
import { AssistantPage } from "./pages/AssistantPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { PolicyEvaluatorPage } from "./pages/PolicyEvaluatorPage";
import { ModelsPage } from "./pages/ModelsPage";
import { useStudioStore } from "./lib/store/studio-store";

export const App: React.FC = () => {
  const syncWithBackend = useStudioStore((state) => state.syncWithBackend);

  useEffect(() => {
    // Initial sync with backend upon app load
    syncWithBackend();
  }, [syncWithBackend]);

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