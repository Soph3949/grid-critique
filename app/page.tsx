'use client';

import Link from 'next/link';
import { Sparkles, Grid, Palette, ArrowRight, CheckCircle2, Layers, Sliders } from 'lucide-react';

export default function Home() {
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#FAF7F2', color: '#3D2C2C' }}
    >
      {/* Soft background blobs */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle, #F4C5D2 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-50"
        style={{ background: 'radial-gradient(circle, #C5DEC8 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, #F7D8C0 0%, transparent 70%)' }}
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md shadow-sm"
          style={{
            background: 'rgba(255,253,249,0.85)',
            border: '1px solid #EDE0D4',
            color: '#C47A90',
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Precision Art Critique & Palette Analytics</span>
        </div>

        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight"
          style={{ color: '#3D2C2C' }}
        >
          Master Your{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(to right, #C47A90, #D4967A)' }}
          >
            Proportions
          </span>{' '}
          &{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(to right, #7A9D82, #6D8FA8)' }}
          >
            Color Symbolism
          </span>
        </h1>

        <p
          className="max-w-2xl mx-auto text-lg sm:text-xl font-normal leading-relaxed mb-10"
          style={{ color: '#8C7B72' }}
        >
          Transform your artistic workflow with canvas-based grid proportion evaluation and formal art criticism of chromatic mood, chiaroscuro, and iconographic representation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/upload"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition duration-200 flex items-center justify-center space-x-2"
            style={{
              background: 'linear-gradient(135deg, #E8A4B8 0%, #D4967A 100%)',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(232, 164, 184, 0.35)',
            }}
          >
            <span>Start Artwork Critique</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/color-analysis"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition duration-200 flex items-center justify-center space-x-2"
            style={{
              background: '#FFFDF9',
              border: '1.5px solid #EDE0D4',
              color: '#3D2C2C',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Palette className="w-5 h-5" style={{ color: '#9DB8A0' }} />
            <span>Explore Color & Symbolism</span>
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10"
        style={{ borderTop: '1px solid #EDE0D4' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Feature 1: Proportion Grid Analysis */}
          <div
            className="rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
            style={{
              background: '#FFFDF9',
              border: '1.5px solid #EDE0D4',
            }}
          >
            {/* Soft glow accent */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-50"
              style={{ background: '#E8F4EC' }}
            />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition"
              style={{
                background: 'rgba(157, 184, 160, 0.15)',
                border: '1.5px solid rgba(157, 184, 160, 0.4)',
              }}
            >
              <Grid className="w-7 h-7" style={{ color: '#7A9D82' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#3D2C2C' }}>
              Live Proportion Canvas Engine
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#8C7B72' }}>
              Never get stuck on hardcoded scores. Our real-time canvas engine measures cell-by-cell structural similarity, line contour deviation, and pixel alignment offsets across customizable grids.
            </p>
            <ul className="space-y-2.5 text-xs" style={{ color: '#5C4F4F' }}>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#9DB8A0' }} />
                <span>Dynamic structural score & category breakdown metrics</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#9DB8A0' }} />
                <span>Interactive grid square inspector with specific corrective advice</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#9DB8A0' }} />
                <span>Toggleable visual error heatmap overlay</span>
              </li>
            </ul>
          </div>

          {/* Feature 2: Color & Symbolism Analysis */}
          <div
            className="rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
            style={{
              background: '#FFFDF9',
              border: '1.5px solid #EDE0D4',
            }}
          >
            {/* Soft glow accent */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-50"
              style={{ background: '#FCEEF3' }}
            />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition"
              style={{
                background: 'rgba(232, 164, 184, 0.15)',
                border: '1.5px solid rgba(232, 164, 184, 0.4)',
              }}
            >
              <Palette className="w-7 h-7" style={{ color: '#C47A90' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#3D2C2C' }}>
              Color & Symbolism Critique
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#8C7B72' }}>
              Extract dominant fine art pigments and analyze atmospheric resonance, temperature balance, chiaroscuro contrast, and iconographic symbolism using professional art vocabulary.
            </p>
            <ul className="space-y-2.5 text-xs" style={{ color: '#5C4F4F' }}>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#E8A4B8' }} />
                <span>Dominant pigment extraction with classical art names (<em>Burnt Umber, Cerulean Blue</em>)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#E8A4B8' }} />
                <span>Art history critique of atmospheric mood & symbolic representation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#E8A4B8' }} />
                <span>Interactive spot color sampler on artwork canvas</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}