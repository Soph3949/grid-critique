'use client';

import Link from 'next/link';
import { Sparkles, Grid, Palette, ArrowRight, CheckCircle2, Layers, Sliders } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md shadow-xl">
          <Sparkles className="w-4 h-4" />
          <span>Precision Art Critique & Palette Analytics</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Proportions</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Color Symbolism</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-lg sm:text-xl font-normal leading-relaxed mb-10">
          Transform your artistic workflow with canvas-based grid proportion evaluation and formal art criticism of chromatic mood, chiaroscuro, and iconographic representation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/upload"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-2xl shadow-purple-900/40 hover:scale-105 transition duration-200 flex items-center justify-center space-x-2"
          >
            <span>Start Artwork Critique</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/color-analysis"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-lg hover:border-slate-700 transition duration-200 flex items-center justify-center space-x-2"
          >
            <Palette className="w-5 h-5 text-purple-400" />
            <span>Explore Color & Symbolism</span>
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Feature 1: Proportion Grid Analysis */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-8 shadow-2xl hover:border-blue-500/40 transition group relative overflow-hidden backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition">
              <Grid className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Live Proportion Canvas Engine</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Never get stuck on hardcoded scores. Our real-time canvas engine measures cell-by-cell structural similarity, line contour deviation, and pixel alignment offsets across customizable grids.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Dynamic structural score & category breakdown metrics</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Interactive grid square inspector with specific corrective advice</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Toggleable visual error heatmap overlay</span>
              </li>
            </ul>
          </div>

          {/* Feature 2: Color & Symbolism Analysis */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-8 shadow-2xl hover:border-purple-500/40 transition group relative overflow-hidden backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition">
              <Palette className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Color & Symbolism Critique</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Extract dominant fine art pigments and analyze atmospheric resonance, temperature balance, chiaroscuro contrast, and iconographic symbolism using professional art vocabulary.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Dominant pigment extraction with classical art names (*Burnt Umber, Cerulean Blue*)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Art history critique of atmospheric mood & symbolic representation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Interactive spot color sampler on artwork canvas</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}