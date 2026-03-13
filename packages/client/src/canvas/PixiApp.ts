import { Application, Container } from 'pixi.js'
import { BackgroundLayer } from './layers/BackgroundLayer'
import { GridLayer } from './layers/GridLayer'
import { TokenLayer } from './layers/TokenLayer'
import type { GridConfig, Token } from '@dgvtt/shared'
import { DEFAULT_GRID_CONFIG } from '@dgvtt/shared'

export interface PixiAppOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

export class PixiApp {
  private app: Application
  private stage!: Container
  private background!: BackgroundLayer
  private gridLayer!: GridLayer
  private tokenLayer!: TokenLayer

  private gridConfig: GridConfig = DEFAULT_GRID_CONFIG
  private initialized = false

  // Kamera (pan/zoom)
  private camera = { x: 0, y: 0, scale: 1 }
  private isPanning = false
  private panStart = { x: 0, y: 0 }

  onTokenMoved?: (token: Token, pixelX: number, pixelY: number, gridCoord: string) => void

  constructor() {
    this.app = new Application()
  }

  async init(options: PixiAppOptions) {
    await this.app.init({
      canvas: options.canvas,
      width: options.width,
      height: options.height,
      backgroundColor: 0x0d0d1a,
      antialias: true,
      resolution: window.devicePixelRatio ?? 1,
      autoDensity: true,
    })

    // Kořenový kontejner pro scénu (pohybuje se při pan/zoom)
    this.stage = new Container()
    this.app.stage.addChild(this.stage)

    this.background = new BackgroundLayer()
    this.gridLayer = new GridLayer(this.gridConfig, options.width, options.height)
    this.tokenLayer = new TokenLayer(this.gridConfig)

    this.tokenLayer.onTokenMoved = (token, px, py, coord) => {
      this.onTokenMoved?.(token, px, py, coord)
    }

    this.stage.addChild(this.background)
    this.stage.addChild(this.gridLayer)
    this.stage.addChild(this.tokenLayer)

    this.setupCamera(options.canvas)

    this.initialized = true
  }

  // ─── Grid ─────────────────────────────────────────────────────────────────

  setGridConfig(config: GridConfig) {
    this.gridConfig = config
    this.gridLayer.update(config, this.app.screen.width, this.app.screen.height)
    this.tokenLayer.updateGrid(config)
  }

  getGridConfig(): GridConfig {
    return this.gridConfig
  }

  // ─── Scéna / pozadí ───────────────────────────────────────────────────────

  loadScene(backgroundUrl: string | null, width: number, height: number) {
    if (backgroundUrl) {
      this.background.setImage(backgroundUrl, width, height)
    } else {
      this.background.setFallback(width, height)
    }
    this.gridLayer.update(this.gridConfig, width, height)
  }

  // ─── Tokeny ───────────────────────────────────────────────────────────────

  addToken(token: Token) {
    this.tokenLayer.addToken(token)
  }

  updateToken(token: Token) {
    this.tokenLayer.updateToken(token)
  }

  removeToken(id: string) {
    this.tokenLayer.removeToken(id)
  }

  // ─── Kamera — pan (prostřední tlačítko / Space+drag) ──────────────────────

  private setupCamera(canvas: HTMLCanvasElement) {
    // Zoom kolečkem
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.min(4, Math.max(0.2, this.camera.scale * delta))

      // Zoom na pozici kurzoru
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      this.camera.x = mx - (mx - this.camera.x) * (newScale / this.camera.scale)
      this.camera.y = my - (my - this.camera.y) * (newScale / this.camera.scale)
      this.camera.scale = newScale

      this.applyCamera()
    }, { passive: false })

    // Pan — prostřední tlačítko nebo Space
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1) {
        this.isPanning = true
        this.panStart = { x: e.clientX - this.camera.x, y: e.clientY - this.camera.y }
        canvas.style.cursor = 'grabbing'
      }
    })

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return
      this.camera.x = e.clientX - this.panStart.x
      this.camera.y = e.clientY - this.panStart.y
      this.applyCamera()
    })

    window.addEventListener('mouseup', (e) => {
      if (e.button === 1) {
        this.isPanning = false
        canvas.style.cursor = 'default'
      }
    })
  }

  private applyCamera() {
    this.stage.x = this.camera.x
    this.stage.y = this.camera.y
    this.stage.scale.set(this.camera.scale)
  }

  destroy() {
    this.app.destroy(false)
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement
  }
}
