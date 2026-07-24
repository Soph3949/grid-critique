interface SquareDetails {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getSquareDetails(
  squareId: string,
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
): SquareDetails | null {
  if (!squareId || squareId.length < 2) {
    return null;
  }

  const colChar = squareId.charAt(0);
  const rowNum = parseInt(squareId.substring(1));

  const colIndex = colChar.charCodeAt(0) - 'A'.charCodeAt(0);
  const rowIndex = rowNum - 1;

  if (
    colIndex < 0 || colIndex >= gridSize ||
    rowIndex < 0 || rowIndex >= gridSize
  ) {
    return null; // Invalid square ID for the given grid size
  }

  const squareWidth = canvasWidth / gridSize;
  const squareHeight = canvasHeight / gridSize;

  const x = colIndex * squareWidth;
  const y = rowIndex * squareHeight;

  return {
    id: squareId,
    x,
    y,
    width: squareWidth,
    height: squareHeight,
  };
}
