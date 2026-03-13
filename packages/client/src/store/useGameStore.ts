import { create } from 'zustand'
import type { GridConfig, Token } from '@dgvtt/shared'
import { DEFAULT_GRID_CONFIG } from '@dgvtt/shared'

interface GameState {
  sceneId: string | null
  grid: GridConfig
  tokens: Token[]

  setSceneId: (id: string) => void
  setGrid: (grid: GridConfig) => void
  updateGridType: (type: GridConfig['type']) => void
  updateGridSize: (size: number) => void
  toggleGrid: () => void
  setTokens: (tokens: Token[]) => void
  upsertToken: (token: Token) => void
  removeToken: (id: string) => void
}

export const useGameStore = create<GameState>((set) => ({
  sceneId: null,
  grid: DEFAULT_GRID_CONFIG,
  tokens: [],

  setSceneId: (id) => set({ sceneId: id }),

  setGrid: (grid) => set({ grid }),

  updateGridType: (type) =>
    set((s) => ({ grid: { ...s.grid, type } })),

  updateGridSize: (cellSize) =>
    set((s) => ({ grid: { ...s.grid, cellSize } })),

  toggleGrid: () =>
    set((s) => ({ grid: { ...s.grid, visible: !s.grid.visible } })),

  setTokens: (tokens) => set({ tokens }),

  upsertToken: (token) =>
    set((s) => {
      const idx = s.tokens.findIndex((t) => t.id === token.id)
      if (idx === -1) return { tokens: [...s.tokens, token] }
      const next = [...s.tokens]
      next[idx] = token
      return { tokens: next }
    }),

  removeToken: (id) =>
    set((s) => ({ tokens: s.tokens.filter((t) => t.id !== id) })),
}))
