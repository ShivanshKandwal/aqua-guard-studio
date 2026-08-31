import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { StudioPage } from "./pages/StudioPage";
import { AssistantPage } from "./pages/AssistantPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { ModelsPage } from "./pages/ModelsPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PageShell>
        <Routes>
          <Route path="/" element={<StudioPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  );
};
