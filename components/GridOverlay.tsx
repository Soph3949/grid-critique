'use client';

import React, { useState } from 'react';
import { Layer, Line, Text, Rect } from 'react-konva';

interface GridOverlayProps {
  width: number;
  height: number;
  gridSize: number; // e.g., 8 for 8x8 grid
  onSquareClick?: (squareId: string) => void;
  selectedSquareId?: string | null;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  width,
  height,
  gridSize,
  onSquareClick,
  selectedSquareId,
}) => {
  const squareSize = width / gridSize;

  const cols = Array.from({ length: gridSize }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...
  const rows = Array.from({ length: gridSize }, (_, i) => (i + 1).toString()); // 1, 2, 3...

  // Calculate label offsets for centering
  const labelOffset = 15; // Offset from edge

  return (
    <Layer>
      {/* Grid Lines */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => (
        <React.Fragment key={`grid-line-${i}`}>
          {/* Vertical lines */}
          <Line
            points={[i * squareSize, 0, i * squareSize, height]}
            stroke="#ccc"
            strokeWidth={1}
          />
          {/* Horizontal lines */}
          <Line
            points={[0, i * squareSize, width, i * squareSize]}
            stroke="#ccc"
            strokeWidth={1}
          />
        </React.Fragment>
      ))}

      {/* Column Labels (A, B, C...) */}
      {cols.map((col, i) => (
        <Text
          key={`col-label-${col}`}
          x={i * squareSize + squareSize / 2 - 5} // Center text, adjust 5 for approximate text width
          y={labelOffset}
          text={col}
          fontSize={14}
          fill="#fff"
          shadowColor="#000"
          shadowBlur={5}
          shadowOffset={{ x: 1, y: 1 }}
        />
      ))}

      {/* Row Labels (1, 2, 3...) */}
      {rows.map((row, i) => (
        <Text
          key={`row-label-${row}`}
          x={labelOffset}
          y={i * squareSize + squareSize / 2 - 8} // Center text, adjust 8 for approximate text height
          text={row}
          fontSize={14}
          fill="#fff"
          shadowColor="#000"
          shadowBlur={5}
          shadowOffset={{ x: 1, y: 1 }}
        />
      ))}

      {/* Clickable Rectangles for squares and highlighting */}
      {cols.map((col, colIdx) =>
        rows.map((row, rowIdx) => {
          const squareId = `${col}${row}`;
          const x = colIdx * squareSize;
          const y = rowIdx * squareSize;

          return (
            <Rect
              key={squareId}
              x={x}
              y={y}
              width={squareSize}
              height={squareSize}
              fillEnabled={false} // No default fill
              stroke={selectedSquareId === squareId ? "blue" : undefined}
              strokeWidth={selectedSquareId === squareId ? 3 : 0}
              onClick={() => onSquareClick && onSquareClick(squareId)}
              onTap={() => onSquareClick && onSquareClick(squareId)}
            />
          );
        })
      )}
    </Layer>
  );
};

export default GridOverlay;
