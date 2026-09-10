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
  const isServerSynced = useStudioStore((state) => state.isServerSynced);

  useEffect(() => {
    // Initial sync with backend upon app load
    syncWithBackend();

    // When server is starting up (e.g. Python initializing PyTorch/XGBoost on app boot),
    // retry every 2.5 seconds until connected
    let intervalId: any = null;
    if (!isServerSynced) {
      intervalId = setInterval(() => {
        syncWithBackend();
      }, 2500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [syncWithBackend, isServerSynced]);

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