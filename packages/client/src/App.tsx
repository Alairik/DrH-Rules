import { useRef } from 'react'
import { MapCanvas } from './ui/MapCanvas'
import { Toolbar } from './ui/components/Toolbar'
import { useGameStore } from './store/useGameStore'
import type { PixiApp } from './canvas/PixiApp'
import type { GridConfig } from '@dgvtt/shared'

export function App() {
  const pixiRef = useRef<PixiApp | null>(null)
  const grid = useGameStore((s) => s.grid)
  const setGrid = useGameStore((s) => s.setGrid)

  const handleAppReady = (app: PixiApp) => {
    pixiRef.current = app
    app.setGridConfig(grid)
  }

  const handleGridChange = (newGrid: GridConfig) => {
    setGrid(newGrid)
    // PixiApp se synchronizuje přes useEffect v MapCanvas
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <MapCanvas grid={grid} onAppReady={handleAppReady} />
      <Toolbar grid={grid} onGridChange={handleGridChange} />
    </div>
  )
}
