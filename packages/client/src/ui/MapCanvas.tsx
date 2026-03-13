import { useEffect, useRef } from 'react'
import { PixiApp } from '../canvas/PixiApp'
import type { GridConfig } from '@dgvtt/shared'

interface Props {
  grid: GridConfig
  onAppReady: (app: PixiApp) => void
}

export function MapCanvas({ grid, onAppReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<PixiApp | null>(null)

  // Inicializace PIXI — pouze jednou
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const pixiApp = new PixiApp()

    pixiApp.init({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
    }).then(() => {
      pixiApp.loadScene(null, 3000, 3000)
      appRef.current = pixiApp
      onAppReady(pixiApp)
    })

    const onResize = () => {
      // PIXI resize při změně okna
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      pixiApp.destroy()
      appRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync gridu do PIXI bez remount
  useEffect(() => {
    appRef.current?.setGridConfig(grid)
  }, [grid])

  return (
    <canvas
      ref={canvasRef}
      className="block w-screen h-screen"
    />
  )
}
