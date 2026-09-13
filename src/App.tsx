import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { StudioPage } from "./pages/StudioPage";
import { AssistantPage } from "./pages/AssistantPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { PolicyEvaluatorPage } from "./pages/PolicyEvaluatorPage";
import { ModelsPage } from "./pages/ModelsPage";
import { useStudioStore, type UserRole } from "./lib/store/studio-store";

// Route Guard Component
const ProtectedRoute: React.FC<{
  allowedRoles: UserRole[];
  currentRole: UserRole;
  children: React.ReactNode;
}> = ({ allowedRoles, currentRole, children }) => {
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const syncWithBackend = useStudioStore((state) => state.syncWithBackend);
  const isServerSynced = useStudioStore((state) => state.isServerSynced);
  const userRole = useStudioStore((state) => state.userRole);

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
          {/* Universal Pages (1-Normal User, 2-Policy Maker, 3-Developer) */}
          <Route path="/" element={<StudioPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/policies" element={<PoliciesPage />} />

          {/* Policy Evaluator (Accessible to Policy Makers & Developers) */}
          <Route
            path="/policy-evaluator"
            element={
              <ProtectedRoute allowedRoles={["policy_maker", "developer"]} currentRole={userRole}>
                <PolicyEvaluatorPage />
              </ProtectedRoute>
            }
          />

          {/* Model Benchmarks Lab (Accessible to Developers) */}
          <Route
            path="/models"
            element={
              <ProtectedRoute allowedRoles={["developer"]} currentRole={userRole}>
                <ModelsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageShell>
    </HashRouter>
  );
};