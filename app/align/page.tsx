'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/store/useImageStore';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import GridOverlay from '@/components/GridOverlay';
import Konva from 'konva';

const INITIAL_ARTWORK_STATE = {
  scale: 1,
  x: 0,
  y: 0,
  rotation: 0,
  opacity: 1,
};

export default function AlignPage() {
  const router = useRouter();
  const { referenceImage, artworkImage, alignmentTransform, gridSize: storeGridSize, setAlignmentTransform, setGridSize: setStoreGridSize } = useImageStore();

  // Konva Image states
  const [refKonvaImage, setRefKonvaImage] = useState<HTMLImageElement | null>(null);
  const [artKonvaImage, setArtKonvaImage] = useState<HTMLImageElement | null>(null);

  // Artwork transformation states
  const [artworkScale, setArtworkScale] = useState(alignmentTransform.scale || INITIAL_ARTWORK_STATE.scale);
  const [artworkX, setArtworkX] = useState(alignmentTransform.x || INITIAL_ARTWORK_STATE.x);
  const [artworkY, setArtworkY] = useState(alignmentTransform.y || INITIAL_ARTWORK_STATE.y);
  const [artworkRotation, setArtworkRotation] = useState(alignmentTransform.rotation || INITIAL_ARTWORK_STATE.rotation);
  const [artworkOpacity, setArtworkOpacity] = useState(alignmentTransform.opacity || INITIAL_ARTWORK_STATE.opacity);

  // Grid states
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(storeGridSize || 8);
  const [selectedSquareId, setSelectedSquareId] = useState<string | null>(null);

  // Canvas dimensions
  const canvasWidth = 800; // Fixed width for now
  const canvasHeight = 600; // Fixed height for now

  useEffect(() => {
    const loadImage = (file: File, setImage: (image: HTMLImageElement) => void) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImage(img);
      };
      return () => {
        URL.revokeObjectURL(img.src);
      };
    };

    let cleanupRef: (() => void) | undefined;
    let cleanupArt: (() => void) | undefined;

    if (referenceImage) {
      cleanupRef = loadImage(referenceImage, setRefKonvaImage);
    }
    if (artworkImage) {
      cleanupArt = loadImage(artworkImage, setArtKonvaImage);
    }

    return () => {
      if (cleanupRef) cleanupRef();
      if (cleanupArt) cleanupArt();
    };
  }, [referenceImage, artworkImage]);

  const handleContinueToAnalyze = () => {
    setAlignmentTransform({
      scale: artworkScale,
      x: artworkX,
      y: artworkY,
      rotation: artworkRotation,
      opacity: artworkOpacity,
    });
    setStoreGridSize(gridSize);
    router.push('/analyze');
  };

  const handleSquareClick = (squareId: string) => {
    setSelectedSquareId(squareId === selectedSquareId ? null : squareId); // Toggle selection
  };

  if (!referenceImage || !artworkImage || !refKonvaImage || !artKonvaImage) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-center"
        style={{ background: '#FAF7F2' }}
      >
        <h1 className="text-4xl font-extrabold mb-4" style={{ color: '#3D2C2C' }}>No Images Uploaded</h1>
        <p className="text-lg mb-8" style={{ color: '#8C7B72' }}>Please upload both a reference image and an artwork image to proceed.</p>
        <button
          onClick={() => router.push('/upload')}
          className="px-8 py-3 rounded-2xl text-lg font-semibold transition-all duration-200 focus:outline-none"
          style={{
            background: 'linear-gradient(135deg, #E8A4B8 0%, #D4967A 100%)',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(232, 164, 184, 0.35)',
          }}
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: '#FAF7F2' }}
    >
      <h1 className="text-4xl font-extrabold mb-8" style={{ color: '#3D2C2C' }}>Align Images</h1>
      <div
        className="relative w-[800px] h-[600px] rounded-2xl shadow-sm mb-8 overflow-hidden"
        style={{ background: '#EDE0D4', border: '1.5px solid #D9C8BC' }}
      >
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {refKonvaImage && (
              <Image
                image={refKonvaImage}
                width={refKonvaImage.width}
                height={refKonvaImage.height}
                x={(canvasWidth - (refKonvaImage.width * Math.min(canvasWidth / refKonvaImage.width, canvasHeight / refKonvaImage.height))) / 2}
                y={(canvasHeight - (refKonvaImage.height * Math.min(canvasWidth / refKonvaImage.width, canvasHeight / refKonvaImage.height))) / 2}
                scaleX={Math.min(canvasWidth / refKonvaImage.width, canvasHeight / refKonvaImage.height)}
                scaleY={Math.min(canvasWidth / refKonvaImage.width, canvasHeight / refKonvaImage.height)}
                alt="Reference"
              />
            )}
          </Layer>
          <Layer>
            {artKonvaImage && (
              <Image
                image={artKonvaImage}
                x={artworkX} y={artworkY}
                scaleX={artworkScale} scaleY={artworkScale}
                rotation={artworkRotation}
                opacity={artworkOpacity}
                draggable
                onDragEnd={(e) => {
                  setArtworkX(e.target.x());
                  setArtworkY(e.target.y());
                }}
                alt="Artwork"
              />
            )}
          </Layer>
          {showGrid && (
            <GridOverlay
              width={canvasWidth}
              height={canvasHeight}
              gridSize={gridSize}
              onSquareClick={handleSquareClick}
              selectedSquareId={selectedSquareId}
            />
          )}
        </Stage>
        <p className="absolute top-2 left-2 text-xs px-2 py-1 rounded-lg" style={{ color: '#fff', background: 'rgba(61, 44, 44, 0.55)' }}>Reference: {referenceImage.name}</p>
        <p className="absolute top-2 right-2 text-xs px-2 py-1 rounded-lg" style={{ color: '#fff', background: 'rgba(61, 44, 44, 0.55)' }}>Artwork: {artworkImage.name}</p>
      </div>

      {/* Toolbar Area */}
      <div
        className="w-full max-w-6xl p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-4"
        style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Artwork Scale Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-scale-slider" className="text-sm font-medium" style={{ color: '#5C4F4F' }}>Scale:</label>
            <input
              id="artwork-scale-slider"
              type="range"
              min="0.1"
              max="2"
              step="0.01"
              value={artworkScale}
              onChange={(e) => setArtworkScale(Number(e.target.value))}
              className="w-32 md:w-40 accent-rose-300"
            />
            <span className="text-sm font-mono" style={{ color: '#8C7B72' }}>{(artworkScale * 100).toFixed(0)}%</span>
          </div>

          {/* Artwork X Position Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-x-slider" className="text-sm font-medium" style={{ color: '#5C4F4F' }}>X:</label>
            <input
              id="artwork-x-slider"
              type="range"
              min="-400"
              max="400"
              step="1"
              value={artworkX}
              onChange={(e) => setArtworkX(Number(e.target.value))}
              className="w-32 md:w-40"
            />
            <span className="text-sm font-mono" style={{ color: '#8C7B72' }}>{artworkX.toFixed(0)}px</span>
          </div>

          {/* Artwork Y Position Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-y-slider" className="text-sm font-medium" style={{ color: '#5C4F4F' }}>Y:</label>
            <input
              id="artwork-y-slider"
              type="range"
              min="-300"
              max="300"
              step="1"
              value={artworkY}
              onChange={(e) => setArtworkY(Number(e.target.value))}
              className="w-32 md:w-40"
            />
            <span className="text-sm font-mono" style={{ color: '#8C7B72' }}>{artworkY.toFixed(0)}px</span>
          </div>

          {/* Artwork Opacity Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-opacity-slider" className="text-sm font-medium" style={{ color: '#5C4F4F' }}>Opacity:</label>
            <input
              id="artwork-opacity-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={artworkOpacity}
              onChange={(e) => setArtworkOpacity(Number(e.target.value))}
              className="w-32 md:w-40"
            />
            <span className="text-sm font-mono" style={{ color: '#8C7B72' }}>{(artworkOpacity * 100).toFixed(0)}%</span>
          </div>

          {/* Artwork Rotation Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-rotation-slider" className="text-sm font-medium" style={{ color: '#5C4F4F' }}>Rotation:</label>
            <input
              id="artwork-rotation-slider"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={artworkRotation}
              onChange={(e) => setArtworkRotation(Number(e.target.value))}
              className="w-32 md:w-40"
            />
            <span className="text-sm font-mono" style={{ color: '#8C7B72' }}>{artworkRotation.toFixed(0)}°</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showGrid ? 'rgba(157, 184, 160, 0.15)' : '#FAF7F2',
              border: showGrid ? '1.5px solid rgba(157, 184, 160, 0.5)' : '1.5px solid #EDE0D4',
              color: showGrid ? '#7A9D82' : '#8C7B72',
            }}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>

          {/* Grid Size Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="grid-size-selector" className="text-sm font-medium" style={{ color: '#5C4F4F' }}>Grid:</label>
            <select
              id="grid-size-selector"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="px-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: '#FAF7F2', border: '1.5px solid #EDE0D4', color: '#3D2C2C' }}
            >
              <option value={4}>4x4</option>
              <option value={8}>8x8</option>
              <option value={10}>10x10</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setArtworkScale(INITIAL_ARTWORK_STATE.scale);
                setArtworkX(INITIAL_ARTWORK_STATE.x);
                setArtworkY(INITIAL_ARTWORK_STATE.y);
                setArtworkRotation(INITIAL_ARTWORK_STATE.rotation);
                setArtworkOpacity(INITIAL_ARTWORK_STATE.opacity);
              }}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: '#FAF7F2', border: '1.5px solid #EDE0D4', color: '#5C4F4F' }}
            >
              Reset Alignment
            </button>
            <button
              onClick={handleContinueToAnalyze}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #E8A4B8 0%, #D4967A 100%)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(232, 164, 184, 0.3)',
              }}
            >
              Continue to Analyze →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
