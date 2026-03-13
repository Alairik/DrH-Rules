export type GridType = 'hex' | 'square'

export type HexOrientation = 'pointy' | 'flat'

export interface GridConfig {
  type: GridType
  cellSize: number               // px — vzdálenost střed→roh (hex) nebo délka strany (square)
  visible: boolean
  color: number                  // PIXI hex color, např. 0xffffff
  alpha: number                  // průhlednost čar
  hexOrientation: HexOrientation // platí jen pro hex
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  type: 'hex',
  cellSize: 50,
  visible: true,
  color: 0xffffff,
  alpha: 0.25,
  hexOrientation: 'pointy',
}

// Axial souřadnice hexagonu (q = sloupec, r = řádek)
export interface HexCoord {
  q: number
  r: number
}

// Cube souřadnice — pro výpočty vzdáleností
export interface CubeCoord {
  q: number
  r: number
  s: number
}

// Souřadnice čtvercového gridu
export interface SquareCoord {
  col: number
  row: number
}

// Souřadnice na mapě (px)
export interface PixelPoint {
  x: number
  y: number
}

// Pozice tokenu — union podle typu gridu
export type GridCoord =
  | { type: 'hex'; coord: HexCoord }
  | { type: 'square'; coord: SquareCoord }
