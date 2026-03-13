import type { GridConfig } from './grid'

export interface Wall {
  id: string
  points: number[]   // [x1,y1, x2,y2, ...] flatlist
  secret: boolean
  blocksLight: boolean
  blocksMovement: boolean
}

export interface Door {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  open: boolean
  secret: boolean
}

export interface LightSource {
  id: string
  x: number
  y: number
  radius: number
  color: number
  intensity: number
  flickering: boolean
}

export interface Scene {
  id: string
  name: string
  backgroundImage: string | null
  width: number
  height: number
  grid: GridConfig
  walls: Wall[]
  doors: Door[]
  lights: LightSource[]
  ambientLight: number    // 0–1, 0 = tma, 1 = plné světlo
  fogExplored: boolean    // zapnout fog of war
}
