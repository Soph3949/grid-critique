'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/store/useImageStore';
import {
  extractColorAndSymbolism,
  ColorSymbolismResult,
  ColorSwatch,
  findClosestArtPigment,
  rgbToHsl,
  rgbToHex,
} from '@/utils/analysisUtils';
import { Palette, Sparkles, RefreshCw, AlertCircle, Eye, Compass, Feather, Layers, MousePointer, Info } from 'lucide-react';

export default function ColorAnalysisPage() {
  const router = useRouter();
  const { artworkImage } = useImageStore();

  const [artworkImageUrl, setArtworkImageUrl] = useState<string | null>(null);
  const [colorResult, setColorResult] = useState<ColorSymbolismResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Interactive Spot Color Sampler states
  const [sampledColor, setSampledColor] = useState<{
    hex: string;
    artisticName: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    x: number;
    y: number;
    spotCritique: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cleanupArt: (() => void) | undefined;

    if (artworkImage) {
      const artUrl = URL.createObjectURL(artworkImage);
      setArtworkImageUrl(artUrl);
      cleanupArt = () => URL.revokeObjectURL(artUrl);

      const artImg = new window.Image();
      artImg.onload = async () => {
        setIsLoading(true);
        try {
          const result = await extractColorAndSymbolism(artImg);
          setColorResult(result);

          // Draw image to spot-sampling canvas
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = artImg.width;
              canvas.height = artImg.height;
              ctx.drawImage(artImg, 0, 0);

              // Auto-sample center pixel as default spot
              sampleCanvasPixel(ctx, Math.floor(artImg.width / 2), Math.floor(artImg.height / 2));
            }
          }
        } catch (err) {
          console.error('Color extraction failed:', err);
        } finally {
          setIsLoading(false);
        }
      };

      artImg.src = artUrl;
    } else {
      setIsLoading(false);
    }

    return () => {
      if (cleanupArt) cleanupArt();
    };
  }, [artworkImage]);

  const sampleCanvasPixel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const artisticName = findClosestArtPigment(r, g, b);

    // Formulate local spot criticism based on luminance, hue, and saturation
    let spotCritique = `Passage features ${artisticName} (${hex}). `;
    if (hsl.l < 30) {
      spotCritique += `This low-key value tone functions as a tenebrous shadow anchor, establishing spatial depth and volume.`;
    } else if (hsl.l > 75) {
      spotCritique += `This high-key luminous highlight captures focal emphasis and creates spatial luminosity.`;
    } else if (hsl.s > 50) {
      spotCritique += `High chromatic saturation drawing immediate visual weight to this region.`;
    } else {
      spotCritique += `Muted mid-tone acting as an atmospheric transitional zone between value extremes.`;
    }

    setSampledColor({
      hex,
      artisticName,
      rgb: { r, g, b },
      hsl,
      x,
      y,
      spotCritique,
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      sampleCanvasPixel(ctx, x, y);
    }
  };

  if (!artworkImage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-950 text-white px-4 text-center">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Artwork Uploaded</h1>
          <p className="text-slate-400 text-sm mb-6">Upload your artwork to extract chromatic palettes, atmospheric mood, and symbolic representation.</p>
          <button
            onClick={() => router.push('/upload')}
            className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold transition duration-200"
          >
            Go to Upload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-purple-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <Palette className="w-4 h-4" />
              <span>Fine Art Criticism</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Color & Symbolism Analysis</h1>
            <p className="text-slate-400 mt-1 text-sm">Formal evaluation of color harmony, atmospheric resonance, and iconographic symbolism.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/analyze')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
            >
              <span>Back to Proportion Analysis</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
            <RefreshCw className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-200">Extracting pigment spectrum & analyzing chiaroscuro...</p>
            <p className="text-slate-500 text-sm mt-1">Synthesizing fine art critique and symbolic iconography.</p>
          </div>
        ) : colorResult ? (
          <>
            {/* Top Swatch Carousel & Palette Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Extracted Fine Art Pigments</h2>
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-purple-950/60 border border-purple-800/40 text-purple-300 rounded-full">
                  {colorResult.harmonyScheme}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {colorResult.swatches.map((swatch, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl hover:border-purple-500/50 transition group"
                  >
                    <div
                      className="w-full h-24 rounded-xl border border-white/10 shadow-inner transition group-hover:scale-105"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{swatch.role}</span>
                        <span className="text-xs font-mono font-semibold text-purple-400">{swatch.percentage}%</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1 group-hover:text-purple-300 transition truncate">{swatch.artisticName}</h3>
                      <p className="text-[11px] font-mono text-slate-500 uppercase mt-0.5">{swatch.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Dashboard: Metrics & Atmospheric Mood (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Atmospheric Resonance & Mood (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center space-x-2 text-purple-400 border-b border-slate-800 pb-4">
                  <Compass className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Atmospheric Resonance & Mood</h3>
                </div>

                <div className="space-y-3">
                  <h4 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-blue-300">
                    {colorResult.moodAnalysis.headline}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed font-normal">
                    {colorResult.moodAnalysis.description}
                  </p>
                </div>

                {/* Mood Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {colorResult.moodAnalysis.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-semibold tracking-wide"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Technical Technique Pills */}
                <div className="pt-4 border-t border-slate-800/80">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Formal Art Techniques Identified</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {colorResult.symbolismAnalysis.artisticTechniques.map((tech, i) => (
                      <div key={i} className="flex items-center space-x-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                        <Feather className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Chromatic Metrics & Structure (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex items-center space-x-2 text-blue-400 border-b border-slate-800 pb-4">
                  <Layers className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Chromatic Metrics & Harmony</h3>
                </div>

                {/* Temperature Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Color Temperature Balance</span>
                    <span className="text-amber-400">{colorResult.temperature.warmPercentage}% Warm / {colorResult.temperature.coolPercentage}% Cool</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-amber-500 h-full" style={{ width: `${colorResult.temperature.warmPercentage}%` }} />
                    <div className="bg-slate-600 h-full" style={{ width: `${colorResult.temperature.neutralPercentage}%` }} />
                    <div className="bg-blue-500 h-full" style={{ width: `${colorResult.temperature.coolPercentage}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400 block pt-1">{colorResult.temperature.classification}</span>
                </div>

                {/* Value Structure Meter */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Value Contrast (Chiaroscuro)</span>
                    <span className="text-purple-400">{colorResult.valueStructure.lowKeyPercentage}% Low-Key / {colorResult.valueStructure.highKeyPercentage}% High-Key</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-slate-950 border-r border-slate-700 h-full" style={{ width: `${colorResult.valueStructure.lowKeyPercentage}%` }} />
                    <div className="bg-slate-500 h-full" style={{ width: `${colorResult.valueStructure.midTonePercentage}%` }} />
                    <div className="bg-slate-100 h-full" style={{ width: `${colorResult.valueStructure.highKeyPercentage}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400 block pt-1">{colorResult.valueStructure.contrastStyle}</span>
                </div>

                {/* Saturation Profile */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">Chromatic Saturation</span>
                    <span className="text-lg font-bold text-white">{colorResult.saturationProfile.averageSaturation}% Avg Saturation</span>
                  </div>
                  <span className="text-xs px-3 py-1 bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-full font-medium">
                    {colorResult.saturationProfile.classification}
                  </span>
                </div>
              </div>
            </div>

            {/* Lower Section: Representation & Symbolism Essay + Interactive Spot Sampler */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Representation & Symbolic Iconography Essay (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-4">
                  <Feather className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Representation & Symbolic Iconography</h3>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4">
                  {colorResult.symbolismAnalysis.essay.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Allegorical Themes List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Allegorical Themes & Symbolic Meaning</span>
                  <div className="space-y-2">
                    {colorResult.symbolismAnalysis.allegoricalThemes.map((theme, idx) => (
                      <div key={idx} className="p-3 bg-purple-950/30 border border-purple-800/30 rounded-xl text-xs text-purple-200 flex items-start space-x-2">
                        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Interactive Spot Color Inspector Canvas (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <MousePointer className="w-5 h-5" />
                      <h3 className="text-lg font-bold text-white">Interactive Pigment Sampler</h3>
                    </div>
                    <span className="text-xs text-slate-400">Click artwork to sample</span>
                  </div>

                  {/* Artwork Spot Canvas */}
                  <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 cursor-crosshair flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Sampled Color Card */}
                {sampledColor ? (
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl border border-white/20 shadow-md shrink-0"
                        style={{ backgroundColor: sampledColor.hex }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{sampledColor.artisticName}</h4>
                        <p className="text-xs font-mono text-slate-400 uppercase">{sampledColor.hex} | HSL({sampledColor.hsl.h}°, {sampledColor.hsl.s}%, {sampledColor.hsl.l}%)</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      {sampledColor.spotCritique}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
