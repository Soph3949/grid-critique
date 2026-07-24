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
  const { referenceImage, artworkImage } = useImageStore();

  // Konva Image states
  const [refKonvaImage, setRefKonvaImage] = useState<HTMLImageElement | null>(null);
  const [artKonvaImage, setArtKonvaImage] = useState<HTMLImageElement | null>(null);

  // Artwork transformation states
  const [artworkScale, setArtworkScale] = useState(INITIAL_ARTWORK_STATE.scale);
  const [artworkX, setArtworkX] = useState(INITIAL_ARTWORK_STATE.x);
  const [artworkY, setArtworkY] = useState(INITIAL_ARTWORK_STATE.y);
  const [artworkRotation, setArtworkRotation] = useState(INITIAL_ARTWORK_STATE.rotation);
  const [artworkOpacity, setArtworkOpacity] = useState(INITIAL_ARTWORK_STATE.opacity);

  // Grid states
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(8); // Default 8x8
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
    router.push('/analyze');
  };

  const handleSquareClick = (squareId: string) => {
    setSelectedSquareId(squareId === selectedSquareId ? null : squareId); // Toggle selection
  };

  if (!referenceImage || !artworkImage || !refKonvaImage || !artKonvaImage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">No Images Uploaded</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Please upload both a reference image and an artwork image to proceed.</p>
        <button
          onClick={() => router.push('/upload')}
          className="px-8 py-3 rounded-md text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Align Images</h1>
      <div className="relative w-[800px] h-[600px] bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md mb-8 overflow-hidden">
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
        <p className="absolute top-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">Reference: {referenceImage.name}</p>
        <p className="absolute top-2 right-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">Artwork: {artworkImage.name}</p>
      </div>

      {/* Toolbar Area */}
      <div className="w-full max-w-6xl p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex flex-wrap items-center space-x-4 space-y-2 lg:space-y-0">
          {/* Artwork Scale Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-scale-slider" className="text-gray-700 dark:text-gray-300">Scale:</label>
            <input
              id="artwork-scale-slider"
              type="range"
              min="0.1"
              max="2"
              step="0.01"
              value={artworkScale}
              onChange={(e) => setArtworkScale(Number(e.target.value))}
              className="w-32 md:w-48"
            />
            <span className="text-gray-700 dark:text-gray-300">{(artworkScale * 100).toFixed(0)}%</span>
          </div>

          {/* Artwork X Position Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-x-slider" className="text-gray-700 dark:text-gray-300">X:</label>
            <input
              id="artwork-x-slider"
              type="range"
              min="-400" // Half of canvasWidth
              max="400"  // Half of canvasWidth
              step="1"
              value={artworkX}
              onChange={(e) => setArtworkX(Number(e.target.value))}
              className="w-32 md:w-48"
            />
            <span className="text-gray-700 dark:text-gray-300">{artworkX.toFixed(0)}px</span>
          </div>

          {/* Artwork Y Position Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-y-slider" className="text-gray-700 dark:text-gray-300">Y:</label>
            <input
              id="artwork-y-slider"
              type="range"
              min="-300" // Half of canvasHeight
              max="300"  // Half of canvasHeight
              step="1"
              value={artworkY}
              onChange={(e) => setArtworkY(Number(e.target.value))}
              className="w-32 md:w-48"
            />
            <span className="text-gray-700 dark:text-gray-300">{artworkY.toFixed(0)}px</span>
          </div>

          {/* Artwork Opacity Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-opacity-slider" className="text-gray-700 dark:text-gray-300">Opacity:</label>
            <input
              id="artwork-opacity-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={artworkOpacity}
              onChange={(e) => setArtworkOpacity(Number(e.target.value))}
              className="w-32 md:w-48"
            />
            <span className="text-gray-700 dark:text-gray-300">{(artworkOpacity * 100).toFixed(0)}%</span>
          </div>

          {/* Artwork Rotation Control */}
          <div className="flex items-center space-x-2">
            <label htmlFor="artwork-rotation-slider" className="text-gray-700 dark:text-gray-300">Rotation:</label>
            <input
              id="artwork-rotation-slider"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={artworkRotation}
              onChange={(e) => setArtworkRotation(Number(e.target.value))}
              className="w-32 md:w-48"
            />
            <span className="text-gray-700 dark:text-gray-300">{artworkRotation.toFixed(0)}°</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center space-x-4 space-y-2 lg:space-y-0">
          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>

          {/* Grid Size Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="grid-size-selector" className="text-gray-700 dark:text-gray-300">Grid Size:</label>
            <select
              id="grid-size-selector"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <option value={4}>4x4</option>
              <option value={8}>8x8</option>
              <option value={10}>10x10</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setArtworkScale(INITIAL_ARTWORK_STATE.scale);
                setArtworkX(INITIAL_ARTWORK_STATE.x);
                setArtworkY(INITIAL_ARTWORK_STATE.y);
                setArtworkRotation(INITIAL_ARTWORK_STATE.rotation);
                setArtworkOpacity(INITIAL_ARTWORK_STATE.opacity);
              }}
              className="px-6 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Alignment
            </button>
            <button
              onClick={() => router.push('/analyze')}
              className="px-6 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
