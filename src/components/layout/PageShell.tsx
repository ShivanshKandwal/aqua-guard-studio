import React from "react";
import { Navbar } from "./Navbar";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#030d22] text-slate-100 selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* 3D Fluid Shader Gradient Background (Hydrological WaterPlane - Lighter Blue & Faster Flow) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-70"
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
            color1="#38bdf8"    /* Vibrant Sky Blue */
            color2="#0284c7"    /* Rich Azure */
            color3="#bae6fd"    /* Crisp Lighter Aquamarine */
            bgColor1="#041836"  /* Lighter Deep Naval Navy */
            bgColor2="#0b2c5d"  /* Lighter Aquatic Blue */
            brightness={1.35}   /* Increased illumination */
            uDensity={1.25}
            uFrequency={5.5}
            uSpeed={0.32}       /* Faster liquid flow rate (was 0.12) */
            grain="off"
          />
        </ShaderGradientCanvas>
      </div>

      {/* Dark Ambient Overlay to maintain crystal clear text contrast */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#020b1c]/40 via-[#030e22]/50 to-[#020817]/70 z-0 pointer-events-none backdrop-blur-[1px]" />

      <Navbar />
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 py-8 sm:px-8 lg:px-10 z-10">
        {children}
      </main>
      <footer className="border-t border-slate-800/80 bg-[#061229]/90 py-8 text-center text-sm text-slate-400 z-10">
        <p className="font-semibold tracking-wide">
          AquaSentinel • Central Ground Water Board (CGWB) & India-WRIS Hydrological Benchmark Platform
        </p>
      </footer>
    </div>
  );
};