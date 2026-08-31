import React from "react";
import { Navbar } from "./Navbar";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* 3D Fluid Shader Gradient Background (Hydrological WaterPlane) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-45"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <ShaderGradientCanvas
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <ShaderGradient
            type="waterPlane"
            animate="on"
            color1="#38bdf8"
            color2="#7dd3fc"
            color3="#ffffff"
            bgColor1="#030712"
            bgColor2="#07182f"
            brightness={1.15}
            uDensity={1.3}
            uFrequency={5.2}
            uSpeed={0.12}
            grain="on"
          />
        </ShaderGradientCanvas>
      </div>

      {/* Dark Ambient Overlay to ensure text readability */}
      <div className="fixed inset-0 bg-[#030712]/50 z-0 pointer-events-none backdrop-blur-[1.5px]" />

      <Navbar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-7 sm:px-8 lg:px-10 z-10">
        {children}
      </main>
      <footer className="border-t border-slate-800/60 bg-[#060913]/90 py-8 text-center text-xs text-slate-500 z-10">
        <p className="font-medium tracking-wide">
          AquaGuard Studio 2.0 • Central Ground Water Board (CGWB) & India-WRIS Hydrological Benchmark Platform
        </p>
      </footer>
    </div>
  );
};

