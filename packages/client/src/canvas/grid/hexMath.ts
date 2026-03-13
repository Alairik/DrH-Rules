import type { HexCoord, CubeCoord, PixelPoint, HexOrientation } from '@dgvtt/shared'

// ─── Hex → Pixel ─────────────────────────────────────────────────────────────

export function hexToPixel(
  q: number,
  r: number,
  size: number,
  orientation: HexOrientation,
  origin: PixelPoint = { x: 0, y: 0 },
): PixelPoint {
  if (orientation === 'pointy') {
    return {
      x: origin.x + size * (Math.SQRT3 * q + Math.SQRT3 / 2 * r),
      y: origin.y + size * (3 / 2 * r),
    }
  }
  // flat-top
  return {
    x: origin.x + size * (3 / 2 * q),
    y: origin.y + size * (Math.SQRT3 / 2 * q + Math.SQRT3 * r),
  }
}

// ─── Pixel → Hex (fractional) ────────────────────────────────────────────────

function pixelToHexFrac(
  x: number,
  y: number,
  size: number,
  orientation: HexOrientation,
  origin: PixelPoint = { x: 0, y: 0 },
): { q: number; r: number } {
  const px = x - origin.x
  const py = y - origin.y

  if (orientation === 'pointy') {
    return {
      q: (Math.SQRT3 / 3 * px - 1 / 3 * py) / size,
      r: (2 / 3 * py) / size,
    }
  }
  return {
    q: (2 / 3 * px) / size,
    r: (-1 / 3 * px + Math.SQRT3 / 3 * py) / size,
  }
}

// ─── Cube rounding ───────────────────────────────────────────────────────────

function cubeRound(q: number, r: number, s: number): CubeCoord {
  let rq = Math.round(q)
  let rr = Math.round(r)
  let rs = Math.round(s)

  const dq = Math.abs(rq - q)
  const dr = Math.abs(rr - r)
  const ds = Math.abs(rs - s)

  if (dq > dr && dq > ds) rq = -rr - rs
  else if (dr > ds)        rr = -rq - rs
  else                     rs = -rq - rr

  return { q: rq, r: rr, s: rs }
}

// ─── Pixel → nearest HexCoord ────────────────────────────────────────────────

export function pixelToHex(
  x: number,
  y: number,
  size: number,
  orientation: HexOrientation,
  origin: PixelPoint = { x: 0, y: 0 },
): HexCoord {
  const { q, r } = pixelToHexFrac(x, y, size, orientation, origin)
  const s = -q - r
  const rounded = cubeRound(q, r, s)
  return { q: rounded.q, r: rounded.r }
}

// ─── Rohové body hexagonu (pro kreslení) ─────────────────────────────────────

export function hexCorners(
  cx: number,
  cy: number,
  size: number,
  orientation: HexOrientation,
): PixelPoint[] {
  const startAngle = orientation === 'pointy' ? 30 : 0
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - startAngle)
    return {
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    }
  })
}

// ─── Vzdálenost mezi dvěma hexy ──────────────────────────────────────────────

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

// Oprava: Math.SQRT3 není nativní konstanta, definujeme ji
declare global {
  interface Math {
    SQRT3: number
  }
}
Math.SQRT3 = Math.sqrt(3)
