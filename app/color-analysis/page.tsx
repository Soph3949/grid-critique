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
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center" style={{ background: '#FAF7F2' }}>
        <div
          className="p-6 rounded-3xl shadow-sm max-w-md w-full"
          style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#E8A4B8' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#3D2C2C' }}>No Artwork Uploaded</h1>
          <p className="text-sm mb-6" style={{ color: '#8C7B72' }}>Upload your artwork to extract chromatic palettes, atmospheric mood, and symbolic representation.</p>
          <button
            onClick={() => router.push('/upload')}
            className="w-full py-3 px-6 rounded-xl font-semibold transition duration-200"
            style={{ background: 'linear-gradient(135deg, #E8A4B8 0%, #D4967A 100%)', color: '#fff' }}
          >
            Go to Upload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ background: '#FAF7F2', color: '#3D2C2C' }}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
          style={{ borderBottom: '1px solid #EDE0D4' }}
        >
          <div>
            <div className="inline-flex items-center space-x-2 text-sm font-semibold tracking-wider uppercase mb-1" style={{ color: '#E8A4B8' }}>
              <Palette className="w-4 h-4" />
              <span>Fine Art Criticism</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: '#3D2C2C' }}>Color & Symbolism Analysis</h1>
            <p className="mt-1 text-sm" style={{ color: '#8C7B72' }}>Formal evaluation of color harmony, atmospheric resonance, and iconographic symbolism.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/analyze')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition"
              style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4', color: '#5C4F4F' }}
            >
              <span>Back to Proportion Analysis</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center p-20 rounded-3xl"
            style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
          >
            <RefreshCw className="w-10 h-10 animate-spin mb-4" style={{ color: '#E8A4B8' }} />
            <p className="text-lg font-medium" style={{ color: '#3D2C2C' }}>Extracting pigment spectrum & analyzing chiaroscuro...</p>
            <p className="text-sm mt-1" style={{ color: '#8C7B72' }}>Synthesizing fine art critique and symbolic iconography.</p>
          </div>
        ) : colorResult ? (
          <>
            {/* Top Swatch Carousel & Palette Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" style={{ color: '#E8A4B8' }} />
                  <h2 className="text-xl font-bold" style={{ color: '#3D2C2C' }}>Extracted Fine Art Pigments</h2>
                </div>
                <span
                  className="text-xs font-mono px-3 py-1 rounded-full"
                  style={{ background: 'rgba(232, 164, 184, 0.15)', border: '1px solid rgba(232, 164, 184, 0.4)', color: '#C47A90' }}
                >
                  {colorResult.harmonyScheme}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {colorResult.swatches.map((swatch, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
                  >
                    <div
                      className="w-full h-24 rounded-xl border shadow-inner transition group-hover:scale-105"
                      style={{ backgroundColor: swatch.hex, borderColor: 'rgba(0,0,0,0.08)' }}
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8C7B72' }}>{swatch.role}</span>
                        <span className="text-xs font-mono font-semibold" style={{ color: '#C47A90' }}>{swatch.percentage}%</span>
                      </div>
                      <h3 className="text-sm font-bold mt-1 truncate" style={{ color: '#3D2C2C' }}>{swatch.artisticName}</h3>
                      <p className="text-[11px] font-mono uppercase mt-0.5" style={{ color: '#B0A099' }}>{swatch.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Dashboard: Metrics & Atmospheric Mood (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Atmospheric Resonance & Mood (7 cols) */}
              <div
                className="lg:col-span-7 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
                  style={{ background: '#FCEEF3' }}
                />
                
                <div className="flex items-center space-x-2 pb-4" style={{ borderBottom: '1px solid #EDE0D4' }}>
                  <Compass className="w-5 h-5" style={{ color: '#E8A4B8' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#3D2C2C' }}>Atmospheric Resonance & Mood</h3>
                </div>

                <div className="space-y-3">
                  <h4
                    className="text-2xl font-extrabold text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(to right, #C47A90, #D4967A)' }}
                  >
                    {colorResult.moodAnalysis.headline}
                  </h4>
                  <p className="text-sm leading-relaxed font-normal" style={{ color: '#5C4F4F' }}>
                    {colorResult.moodAnalysis.description}
                  </p>
                </div>

                {/* Mood Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {colorResult.moodAnalysis.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide"
                      style={{ background: 'rgba(232, 164, 184, 0.15)', border: '1px solid rgba(232, 164, 184, 0.35)', color: '#C47A90' }}
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Technical Technique Pills */}
                <div className="pt-4" style={{ borderTop: '1px solid #EDE0D4' }}>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-3" style={{ color: '#8C7B72' }}>Formal Art Techniques Identified</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {colorResult.symbolismAnalysis.artisticTechniques.map((tech, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-2 p-2.5 rounded-xl border text-xs"
                        style={{ background: '#FAF7F2', border: '1px solid #EDE0D4', color: '#5C4F4F' }}
                      >
                        <Feather className="w-3.5 h-3.5 shrink-0" style={{ color: '#9DB8A0' }} />
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Chromatic Metrics & Structure (5 cols) */}
              <div
                className="lg:col-span-5 rounded-3xl p-6 shadow-sm space-y-6"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div className="flex items-center space-x-2 pb-4" style={{ borderBottom: '1px solid #EDE0D4' }}>
                  <Layers className="w-5 h-5" style={{ color: '#9DB8A0' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#3D2C2C' }}>Chromatic Metrics & Harmony</h3>
                </div>

                {/* Temperature Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: '#8C7B72' }}>Color Temperature Balance</span>
                    <span style={{ color: '#C4967A' }}>{colorResult.temperature.warmPercentage}% Warm / {colorResult.temperature.coolPercentage}% Cool</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: '#EDE0D4' }}>
                    <div className="h-full" style={{ width: `${colorResult.temperature.warmPercentage}%`, background: '#F4A87C' }} />
                    <div className="h-full" style={{ width: `${colorResult.temperature.neutralPercentage}%`, background: '#D9C8BC' }} />
                    <div className="h-full" style={{ width: `${colorResult.temperature.coolPercentage}%`, background: '#9DB8A0' }} />
                  </div>
                  <span className="text-[11px] block pt-1" style={{ color: '#8C7B72' }}>{colorResult.temperature.classification}</span>
                </div>

                {/* Value Structure Meter */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: '#8C7B72' }}>Value Contrast (Chiaroscuro)</span>
                    <span style={{ color: '#C47A90' }}>{colorResult.valueStructure.lowKeyPercentage}% Low-Key / {colorResult.valueStructure.highKeyPercentage}% High-Key</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: '#EDE0D4' }}>
                    <div className="border-r h-full" style={{ width: `${colorResult.valueStructure.lowKeyPercentage}%`, background: '#5C4F4F', borderColor: '#EDE0D4' }} />
                    <div className="h-full" style={{ width: `${colorResult.valueStructure.midTonePercentage}%`, background: '#B0A099' }} />
                    <div className="h-full" style={{ width: `${colorResult.valueStructure.highKeyPercentage}%`, background: '#FAF7F2' }} />
                  </div>
                  <span className="text-[11px] block pt-1" style={{ color: '#8C7B72' }}>{colorResult.valueStructure.contrastStyle}</span>
                </div>

                {/* Saturation Profile */}
                <div
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ background: '#FAF7F2', border: '1px solid #EDE0D4' }}
                >
                  <div>
                    <span className="text-xs block uppercase" style={{ color: '#8C7B72' }}>Chromatic Saturation</span>
                    <span className="text-lg font-bold" style={{ color: '#3D2C2C' }}>{colorResult.saturationProfile.averageSaturation}% Avg Saturation</span>
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(157, 184, 160, 0.2)', color: '#7A9D82', border: '1px solid rgba(157, 184, 160, 0.4)' }}
                  >
                    {colorResult.saturationProfile.classification}
                  </span>
                </div>
              </div>
            </div>

            {/* Lower Section: Representation & Symbolism Essay + Interactive Spot Sampler */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Representation & Symbolic Iconography Essay (7 cols) */}
              <div
                className="lg:col-span-7 rounded-3xl p-6 shadow-sm space-y-6"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div className="flex items-center space-x-2 pb-4" style={{ borderBottom: '1px solid #EDE0D4' }}>
                  <Feather className="w-5 h-5" style={{ color: '#C4B5D4' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#3D2C2C' }}>Representation & Symbolic Iconography</h3>
                </div>

                <div className="prose prose-sm max-w-none leading-relaxed space-y-4" style={{ color: '#5C4F4F' }}>
                  {colorResult.symbolismAnalysis.essay.split('\n\n').map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="p-4 rounded-2xl"
                      style={{ background: '#FAF7F2', border: '1px solid #EDE0D4' }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Allegorical Themes List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: '#8C7B72' }}>Allegorical Themes & Symbolic Meaning</span>
                  <div className="space-y-2">
                    {colorResult.symbolismAnalysis.allegoricalThemes.map((theme, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl text-xs flex items-start space-x-2"
                        style={{ background: 'rgba(196, 181, 212, 0.12)', border: '1px solid rgba(196, 181, 212, 0.35)', color: '#6B5E7A' }}
                      >
                        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#C4B5D4' }} />
                        <span>{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Interactive Spot Color Inspector Canvas (5 cols) */}
              <div
                className="lg:col-span-5 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid #EDE0D4' }}>
                    <div className="flex items-center space-x-2" style={{ color: '#9DB8A0' }}>
                      <MousePointer className="w-5 h-5" />
                      <h3 className="text-lg font-bold" style={{ color: '#3D2C2C' }}>Interactive Pigment Sampler</h3>
                    </div>
                    <span className="text-xs" style={{ color: '#8C7B72' }}>Click artwork to sample</span>
                  </div>

                  {/* Artwork Spot Canvas */}
                  <div
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center cursor-crosshair"
                    style={{ background: '#F5EFE8', border: '1px solid #EDE0D4' }}
                  >
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Sampled Color Card */}
                {sampledColor ? (
                  <div
                    className="p-4 rounded-2xl space-y-3"
                    style={{ background: '#FAF7F2', border: '1px solid #EDE0D4' }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl border shadow-md shrink-0"
                        style={{ backgroundColor: sampledColor.hex, borderColor: 'rgba(0,0,0,0.1)' }}
                      />
                      <div>
                        <h4 className="text-sm font-bold" style={{ color: '#3D2C2C' }}>{sampledColor.artisticName}</h4>
                        <p className="text-xs font-mono uppercase" style={{ color: '#8C7B72' }}>{sampledColor.hex} | HSL({sampledColor.hsl.h}°, {sampledColor.hsl.s}%, {sampledColor.hsl.l}%)</p>
                      </div>
                    </div>
                    <p
                      className="text-xs p-3 rounded-xl"
                      style={{ background: '#FFFDF9', border: '1px solid #EDE0D4', color: '#5C4F4F' }}
                    >
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
