'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/store/useImageStore';
import { compareGridProportions, ProportionAnalysisResult, CellAnalysis } from '@/utils/analysisUtils';
import { Sparkles, Eye, Grid, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, Layers, Sliders } from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const { referenceImage, artworkImage, alignmentTransform, gridSize } = useImageStore();

  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [artworkImageUrl, setArtworkImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ProportionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<CellAnalysis | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'issues' | 'good'>('all');

  useEffect(() => {
    let cleanupRef: (() => void) | undefined;
    let cleanupArt: (() => void) | undefined;

    if (referenceImage && artworkImage) {
      const refUrl = URL.createObjectURL(referenceImage);
      const artUrl = URL.createObjectURL(artworkImage);
      setReferenceImageUrl(refUrl);
      setArtworkImageUrl(artUrl);

      cleanupRef = () => URL.revokeObjectURL(refUrl);
      cleanupArt = () => URL.revokeObjectURL(artUrl);

      // Perform real canvas comparison analysis
      const refImg = new window.Image();
      const artImg = new window.Image();

      let refLoaded = false;
      let artLoaded = false;

      const runAnalysis = async () => {
        if (refLoaded && artLoaded) {
          setIsAnalyzing(true);
          try {
            const result = await compareGridProportions(refImg, artImg, gridSize || 8, alignmentTransform);
            setAnalysisResult(result);
            if (result.cellAnalyses.length > 0) {
              // Pick the cell with lowest score by default to offer actionable critique
              const sorted = [...result.cellAnalyses].sort((a, b) => a.score - b.score);
              setSelectedCell(sorted[0] || result.cellAnalyses[0]);
            }
          } catch (err) {
            console.error('Analysis failed:', err);
          } finally {
            setIsAnalyzing(false);
          }
        }
      };

      refImg.onload = () => {
        refLoaded = true;
        runAnalysis();
      };
      artImg.onload = () => {
        artLoaded = true;
        runAnalysis();
      };

      refImg.src = refUrl;
      artImg.src = artUrl;
    } else {
      setIsAnalyzing(false);
    }

    return () => {
      if (cleanupRef) cleanupRef();
      if (cleanupArt) cleanupArt();
    };
  }, [referenceImage, artworkImage, alignmentTransform, gridSize]);

  if (!referenceImage || !artworkImage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-950 text-white px-4 text-center">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Images Loaded</h1>
          <p className="text-slate-400 text-sm mb-6">Upload both a reference drawing and your artwork to enable precision proportion analysis.</p>
          <button
            onClick={() => router.push('/upload')}
            className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition duration-200"
          >
            Go to Upload Page
          </button>
        </div>
      </div>
    );
  }

  const filteredCells = analysisResult?.cellAnalyses.filter((cell) => {
    if (filterMode === 'issues') return cell.score < 85;
    if (filterMode === 'good') return cell.score >= 85;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-blue-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Canvas Proportion Analysis</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Grid Proportion Evaluation</h1>
            <p className="text-slate-400 mt-1 text-sm">Dynamic cell-by-cell structural comparison between drawing and reference.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/align')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
            >
              <Sliders className="w-4 h-4" />
              <span>Adjust Alignment</span>
            </button>
            <button
              onClick={() => router.push('/color-analysis')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-purple-900/30 transition"
            >
              <span>Color & Symbolism Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center p-20 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-200">Evaluating pixel vectors & contour alignment...</p>
            <p className="text-slate-500 text-sm mt-1">Comparing grid squares across 800x600 resolution canvas.</p>
          </div>
        ) : analysisResult ? (
          <>
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Overall Score */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Calculated Score</span>
                  <div className="flex items-baseline space-x-3 mt-2">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                      {analysisResult.overallScore}
                    </span>
                    <span className="text-2xl font-bold text-slate-500">/ 100</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <p className="text-xs text-slate-400">
                    {analysisResult.overallScore >= 85
                      ? 'Exceptional structural fidelity. Contours closely align with reference guides.'
                      : analysisResult.overallScore >= 70
                      ? 'Good spatial proportion with minor local offset in secondary grid cells.'
                      : 'Notable proportion shifts detected. Review red grid cells below for corrections.'}
                  </p>
                </div>
              </div>

              {/* Metric Meters */}
              <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 grid grid-cols-2 gap-4 shadow-xl">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Structural Alignment</span>
                    <span className="text-blue-400">{analysisResult.structuralAlignmentScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${analysisResult.structuralAlignmentScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Line & Edge Fidelity</span>
                    <span className="text-purple-400">{analysisResult.lineFidelityScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${analysisResult.lineFidelityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Spatial Proportion</span>
                    <span className="text-emerald-400">{analysisResult.spatialProportionScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${analysisResult.spatialProportionScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Value Gradient Match</span>
                    <span className="text-amber-400">{analysisResult.valueGradientScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${analysisResult.valueGradientScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Grid & Heatmap Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Visual Canvas & Heatmap Overlay (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Visual Overlay & Difference Heatmap</span>
                  </div>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      showHeatmap
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {showHeatmap ? 'Heatmap: Active' : 'Heatmap: Hidden'}
                  </button>
                </div>

                <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {artworkImageUrl && (
                    <img
                      src={artworkImageUrl}
                      alt="Artwork"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}
                  {showHeatmap && analysisResult.heatmapDataUrl && (
                    <img
                      src={analysisResult.heatmapDataUrl}
                      alt="Heatmap"
                      className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-70 pointer-events-none"
                    />
                  )}

                  {/* Interactive Grid Cell Click Overlay */}
                  <div
                    className="absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${analysisResult.gridSize}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${analysisResult.gridSize}, minmax(0, 1fr))`,
                    }}
                  >
                    {analysisResult.cellAnalyses.map((cell) => {
                      const isSelected = selectedCell?.id === cell.id;
                      return (
                        <button
                          key={cell.id}
                          onClick={() => setSelectedCell(cell)}
                          className={`relative border transition-all duration-150 group flex items-start justify-start p-1 ${
                            isSelected
                              ? 'border-blue-400 bg-blue-500/30 ring-2 ring-blue-400 z-10'
                              : 'border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span
                            className={`text-[9px] font-mono font-bold px-1 rounded ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-950/70 text-slate-300 group-hover:text-white'
                            }`}
                          >
                            {cell.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Accurate (85%+)</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span>Minor Shift (60-84%)</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                      <span>Needs Correction (&lt;60%)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Cell Feedback Inspector (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Grid className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">Square Feedback Inspector</h3>
                    </div>
                    {selectedCell && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-mono text-xs font-bold">
                        Square {selectedCell.id}
                      </span>
                    )}
                  </div>

                  {selectedCell ? (
                    <div className="space-y-5">
                      {/* Cell Score Header */}
                      <div className="flex items-center justify-between p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                        <div>
                          <span className="text-xs text-slate-400 block uppercase tracking-wider">Square Accuracy</span>
                          <span className="text-2xl font-black text-white">{selectedCell.score} / 100</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedCell.score >= 85
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : selectedCell.score >= 60
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {selectedCell.score >= 85 ? 'Aligned' : selectedCell.score >= 60 ? 'Moderate Shift' : 'High Deviation'}
                        </span>
                      </div>

                      {/* Issue Box */}
                      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-1">
                        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Detected Issue</span>
                        </span>
                        <p className="text-sm text-slate-200 font-medium">{selectedCell.issue}</p>
                      </div>

                      {/* Suggestion Box */}
                      <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-2xl space-y-1">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Actionable Correction</span>
                        </span>
                        <p className="text-sm text-blue-200 font-medium">{selectedCell.suggestion}</p>
                      </div>

                      {/* Line & Offset Metrics */}
                      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                          <span className="text-slate-400 block mb-1">Offset Deviation</span>
                          <span className="font-mono text-slate-200 font-semibold">
                            X: {selectedCell.offsetX}px | Y: {selectedCell.offsetY}px
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                          <span className="text-slate-400 block mb-1">Line Density (Art vs Ref)</span>
                          <span className="font-mono text-slate-200 font-semibold">
                            {selectedCell.artDensity}% vs {selectedCell.refDensity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Select any square on the grid to inspect detailed proportion metrics.</p>
                  )}
                </div>

                {/* Grid Square Quick Select Filter */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 font-semibold">Quick Filter Squares</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setFilterMode('all')}
                        className={`px-2 py-0.5 rounded text-[10px] ${filterMode === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterMode('issues')}
                        className={`px-2 py-0.5 rounded text-[10px] ${filterMode === 'issues' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        Needs Fix
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto pr-1">
                    {filteredCells.map((cell) => (
                      <button
                        key={cell.id}
                        onClick={() => setSelectedCell(cell)}
                        className={`py-1.5 rounded text-[10px] font-mono font-bold transition ${
                          selectedCell?.id === cell.id
                            ? 'bg-blue-600 text-white ring-1 ring-white'
                            : cell.score < 60
                            ? 'bg-red-950/60 text-red-300 border border-red-800/50 hover:bg-red-900/60'
                            : cell.score < 80
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50 hover:bg-amber-900/60'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {cell.id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
