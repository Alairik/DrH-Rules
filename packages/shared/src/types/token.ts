import type { GridCoord } from './grid'

export type TokenType = 'player' | 'npc' | 'enemy' | 'object'

export interface Token {
  id: string
  sceneId: string
  characterId: string | null
  name: string
  type: TokenType
  imageUrl: string | null
  position: GridCoord
  // pixel pozice pro plynulý drag před snapem
  pixelX: number
  pixelY: number
  hp: number | null
  hpMax: number | null
  conditions: string[]
  visible: boolean         // viditelný hráčům?
  size: number             // počet hexů/čtverců které token zabírá (1 = normal)
}
