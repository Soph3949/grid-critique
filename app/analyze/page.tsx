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
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center" style={{ background: '#FAF7F2' }}>
        <div
          className="p-6 rounded-3xl shadow-sm max-w-md w-full"
          style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#E8A4B8' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#3D2C2C' }}>No Images Loaded</h1>
          <p className="text-sm mb-6" style={{ color: '#8C7B72' }}>Upload both a reference drawing and your artwork to enable precision proportion analysis.</p>
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

  const filteredCells = analysisResult?.cellAnalyses.filter((cell) => {
    if (filterMode === 'issues') return cell.score < 85;
    if (filterMode === 'good') return cell.score >= 85;
    return true;
  }) || [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ background: '#FAF7F2', color: '#3D2C2C' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
          style={{ borderBottom: '1px solid #EDE0D4' }}
        >
          <div>
            <div className="inline-flex items-center space-x-2 text-sm font-semibold tracking-wider uppercase mb-1" style={{ color: '#9DB8A0' }}>
              <Sparkles className="w-4 h-4" />
              <span>Canvas Proportion Analysis</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: '#3D2C2C' }}>Grid Proportion Evaluation</h1>
            <p className="mt-1 text-sm" style={{ color: '#8C7B72' }}>Dynamic cell-by-cell structural comparison between drawing and reference.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/align')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition"
              style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4', color: '#5C4F4F' }}
            >
              <Sliders className="w-4 h-4" />
              <span>Adjust Alignment</span>
            </button>
            <button
              onClick={() => router.push('/color-analysis')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
              style={{
                background: 'linear-gradient(135deg, #E8A4B8 0%, #D4967A 100%)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(232, 164, 184, 0.3)',
              }}
            >
              <span>Color & Symbolism Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isAnalyzing ? (
          <div
            className="flex flex-col items-center justify-center p-20 rounded-3xl"
            style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
          >
            <RefreshCw className="w-10 h-10 animate-spin mb-4" style={{ color: '#E8A4B8' }} />
            <p className="text-lg font-medium" style={{ color: '#3D2C2C' }}>Evaluating pixel vectors & contour alignment...</p>
            <p className="text-sm mt-1" style={{ color: '#8C7B72' }}>Comparing grid squares across 800x600 resolution canvas.</p>
          </div>
        ) : analysisResult ? (
          <>
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Overall Score */}
              <div
                className="md:col-span-2 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-60"
                  style={{ background: '#FCEEF3' }}
                />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8C7B72' }}>Calculated Score</span>
                  <div className="flex items-baseline space-x-3 mt-2">
                    <span
                      className="text-6xl font-black text-transparent bg-clip-text"
                      style={{ backgroundImage: 'linear-gradient(to right, #C47A90, #D4967A)' }}
                    >
                      {analysisResult.overallScore}
                    </span>
                    <span className="text-2xl font-bold" style={{ color: '#B0A099' }}>/ 100</span>
                  </div>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #EDE0D4' }}>
                  <p className="text-xs" style={{ color: '#8C7B72' }}>
                    {analysisResult.overallScore >= 85
                      ? 'Exceptional structural fidelity. Contours closely align with reference guides.'
                      : analysisResult.overallScore >= 70
                      ? 'Good spatial proportion with minor local offset in secondary grid cells.'
                      : 'Notable proportion shifts detected. Review red grid cells below for corrections.'}
                  </p>
                </div>
              </div>

              {/* Metric Meters */}
              <div
                className="md:col-span-3 rounded-3xl p-6 grid grid-cols-2 gap-4 shadow-sm"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span style={{ color: '#8C7B72' }}>Structural Alignment</span>
                    <span style={{ color: '#7A9D82' }}>{analysisResult.structuralAlignmentScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#EDE0D4' }}>
                    <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${analysisResult.structuralAlignmentScore}%`, background: '#9DB8A0' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span style={{ color: '#8C7B72' }}>Line & Edge Fidelity</span>
                    <span style={{ color: '#C47A90' }}>{analysisResult.lineFidelityScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#EDE0D4' }}>
                    <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${analysisResult.lineFidelityScore}%`, background: '#E8A4B8' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span style={{ color: '#8C7B72' }}>Spatial Proportion</span>
                    <span style={{ color: '#7A9D82' }}>{analysisResult.spatialProportionScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#EDE0D4' }}>
                    <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${analysisResult.spatialProportionScore}%`, background: '#9DB8A0' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span style={{ color: '#8C7B72' }}>Value Gradient Match</span>
                    <span style={{ color: '#C4967A' }}>{analysisResult.valueGradientScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#EDE0D4' }}>
                    <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${analysisResult.valueGradientScore}%`, background: '#F4A87C' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Grid & Heatmap Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Visual Canvas & Heatmap Overlay (7 cols) */}
              <div
                className="lg:col-span-7 rounded-3xl p-6 shadow-sm flex flex-col space-y-4"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-semibold" style={{ color: '#3D2C2C' }}>
                    <Layers className="w-4 h-4" style={{ color: '#9DB8A0' }} />
                    <span>Visual Overlay & Difference Heatmap</span>
                  </div>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition`}
                    style={
                      showHeatmap
                        ? { background: 'rgba(157, 184, 160, 0.15)', border: '1px solid rgba(157, 184, 160, 0.5)', color: '#7A9D82' }
                        : { background: '#FAF7F2', border: '1px solid #EDE0D4', color: '#8C7B72' }
                    }
                  >
                    {showHeatmap ? 'Heatmap: Active' : 'Heatmap: Hidden'}
                  </button>
                </div>

                <div
                  className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ background: '#F5EFE8', border: '1px solid #EDE0D4' }}
                >
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
                          className={`relative border transition-all duration-150 group flex items-start justify-start p-1`}
                          style={
                            isSelected
                              ? { borderColor: '#E8A4B8', background: 'rgba(232, 164, 184, 0.25)', zIndex: 10, outline: '2px solid #E8A4B8' }
                              : { borderColor: 'rgba(0,0,0,0.08)' }
                          }
                        >
                          <span
                            className={`text-[9px] font-mono font-bold px-1 rounded`}
                            style={
                              isSelected
                                ? { background: '#E8A4B8', color: '#fff' }
                                : { background: 'rgba(255,253,249,0.75)', color: '#8C7B72' }
                            }
                          >
                            {cell.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2" style={{ color: '#8C7B72' }}>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#9DB8A0' }} />
                      <span>Accurate (85%+)</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#F4A87C' }} />
                      <span>Minor Shift (60-84%)</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#E8A4B8' }} />
                      <span>Needs Correction (&lt;60%)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Cell Feedback Inspector (5 cols) */}
              <div
                className="lg:col-span-5 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6"
                style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid #EDE0D4' }}>
                    <div className="flex items-center space-x-2">
                      <Grid className="w-5 h-5" style={{ color: '#E8A4B8' }} />
                      <h3 className="text-lg font-bold" style={{ color: '#3D2C2C' }}>Square Feedback Inspector</h3>
                    </div>
                    {selectedCell && (
                      <span
                        className="px-3 py-1 rounded-full font-mono text-xs font-bold"
                        style={{ background: 'rgba(232, 164, 184, 0.15)', color: '#C47A90', border: '1px solid rgba(232, 164, 184, 0.4)' }}
                      >
                        Square {selectedCell.id}
                      </span>
                    )}
                  </div>

                  {selectedCell ? (
                    <div className="space-y-5">
                      {/* Cell Score Header */}
                      <div
                        className="flex items-center justify-between p-4 rounded-2xl"
                        style={{ background: '#FAF7F2', border: '1px solid #EDE0D4' }}
                      >
                        <div>
                          <span className="text-xs block uppercase tracking-wider" style={{ color: '#8C7B72' }}>Square Accuracy</span>
                          <span className="text-2xl font-black" style={{ color: '#3D2C2C' }}>{selectedCell.score} / 100</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold`}
                          style={
                            selectedCell.score >= 85
                              ? { background: 'rgba(157, 184, 160, 0.2)', color: '#7A9D82', border: '1px solid rgba(157, 184, 160, 0.4)' }
                              : selectedCell.score >= 60
                              ? { background: 'rgba(244, 168, 124, 0.2)', color: '#C4967A', border: '1px solid rgba(244, 168, 124, 0.4)' }
                              : { background: 'rgba(232, 164, 184, 0.2)', color: '#C47A90', border: '1px solid rgba(232, 164, 184, 0.4)' }
                          }
                        >
                          {selectedCell.score >= 85 ? 'Aligned' : selectedCell.score >= 60 ? 'Moderate Shift' : 'High Deviation'}
                        </span>
                      </div>

                      {/* Issue Box */}
                      <div
                        className="p-4 rounded-2xl space-y-1"
                        style={{ background: '#FFF5F7', border: '1px solid rgba(232, 164, 184, 0.3)' }}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider flex items-center space-x-1" style={{ color: '#C47A90' }}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Detected Issue</span>
                        </span>
                        <p className="text-sm font-medium" style={{ color: '#3D2C2C' }}>{selectedCell.issue}</p>
                      </div>

                      {/* Suggestion Box */}
                      <div
                        className="p-4 rounded-2xl space-y-1"
                        style={{ background: '#F0F7F1', border: '1px solid rgba(157, 184, 160, 0.4)' }}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider flex items-center space-x-1" style={{ color: '#7A9D82' }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Actionable Correction</span>
                        </span>
                        <p className="text-sm font-medium" style={{ color: '#3D2C2C' }}>{selectedCell.suggestion}</p>
                      </div>

                      {/* Line & Offset Metrics */}
                      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="p-3 rounded-xl" style={{ background: '#FAF7F2', border: '1px solid #EDE0D4' }}>
                          <span className="block mb-1" style={{ color: '#8C7B72' }}>Offset Deviation</span>
                          <span className="font-mono font-semibold" style={{ color: '#3D2C2C' }}>
                            X: {selectedCell.offsetX}px | Y: {selectedCell.offsetY}px
                          </span>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: '#FAF7F2', border: '1px solid #EDE0D4' }}>
                          <span className="block mb-1" style={{ color: '#8C7B72' }}>Line Density (Art vs Ref)</span>
                          <span className="font-mono font-semibold" style={{ color: '#3D2C2C' }}>
                            {selectedCell.artDensity}% vs {selectedCell.refDensity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: '#8C7B72' }}>Select any square on the grid to inspect detailed proportion metrics.</p>
                  )}
                </div>

                {/* Grid Square Quick Select Filter */}
                <div className="pt-4" style={{ borderTop: '1px solid #EDE0D4' }}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold" style={{ color: '#8C7B72' }}>Quick Filter Squares</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setFilterMode('all')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium`}
                        style={
                          filterMode === 'all'
                            ? { background: '#E8A4B8', color: '#fff' }
                            : { color: '#8C7B72' }
                        }
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterMode('issues')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium`}
                        style={
                          filterMode === 'issues'
                            ? { background: '#E8A4B8', color: '#fff' }
                            : { color: '#8C7B72' }
                        }
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
                        className={`py-1.5 rounded text-[10px] font-mono font-bold transition`}
                        style={
                          selectedCell?.id === cell.id
                            ? { background: '#E8A4B8', color: '#fff', outline: '1px solid #fff' }
                            : cell.score < 60
                            ? { background: 'rgba(232, 164, 184, 0.2)', color: '#C47A90', border: '1px solid rgba(232, 164, 184, 0.4)' }
                            : cell.score < 80
                            ? { background: 'rgba(244, 168, 124, 0.2)', color: '#C4967A', border: '1px solid rgba(244, 168, 124, 0.4)' }
                            : { background: '#FAF7F2', color: '#8C7B72', border: '1px solid #EDE0D4' }
                        }
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
