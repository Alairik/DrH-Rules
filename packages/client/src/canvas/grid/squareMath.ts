import type { SquareCoord, PixelPoint } from '@dgvtt/shared'

export function squareToPixel(
  col: number,
  row: number,
  cellSize: number,
  origin: PixelPoint = { x: 0, y: 0 },
): PixelPoint {
  return {
    x: origin.x + col * cellSize + cellSize / 2,
    y: origin.y + row * cellSize + cellSize / 2,
  }
}

export function pixelToSquare(
  x: number,
  y: number,
  cellSize: number,
  origin: PixelPoint = { x: 0, y: 0 },
): SquareCoord {
  return {
    col: Math.floor((x - origin.x) / cellSize),
    row: Math.floor((y - origin.y) / cellSize),
  }
}

export function squareDistance(a: SquareCoord, b: SquareCoord): number {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row))
}
