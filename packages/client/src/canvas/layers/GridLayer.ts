import { Container, Graphics } from 'pixi.js'
import type { GridConfig } from '@dgvtt/shared'
import { hexToPixel, hexCorners } from '../grid/hexMath'
import { squareToPixel } from '../grid/squareMath'

export class GridLayer extends Container {
  private gfx: Graphics
  private config: GridConfig
  private viewWidth: number
  private viewHeight: number

  constructor(config: GridConfig, viewWidth: number, viewHeight: number) {
    super()
    this.config = config
    this.viewWidth = viewWidth
    this.viewHeight = viewHeight
    this.gfx = new Graphics()
    this.addChild(this.gfx)
    this.draw()
  }

  update(config: GridConfig, viewWidth?: number, viewHeight?: number) {
    this.config = config
    if (viewWidth !== undefined) this.viewWidth = viewWidth
    if (viewHeight !== undefined) this.viewHeight = viewHeight
    this.draw()
  }

  private draw() {
    this.gfx.clear()
    this.visible = this.config.visible

    if (!this.config.visible) return

    if (this.config.type === 'hex') {
      this.drawHex()
    } else {
      this.drawSquare()
    }
  }

  private drawHex() {
    const { cellSize, color, alpha, hexOrientation } = this.config
    const gfx = this.gfx

    // Vypočítat rozsah q, r který pokryje celý viewport
    const cols = Math.ceil(this.viewWidth / (cellSize * Math.sqrt(3))) + 2
    const rows = Math.ceil(this.viewHeight / (cellSize * 1.5)) + 2

    for (let r = -1; r < rows; r++) {
      for (let q = -1; q < cols; q++) {
        const center = hexToPixel(q, r, cellSize, hexOrientation)

        if (
          center.x < -cellSize * 2 || center.x > this.viewWidth + cellSize * 2 ||
          center.y < -cellSize * 2 || center.y > this.viewHeight + cellSize * 2
        ) continue

        const corners = hexCorners(center.x, center.y, cellSize, hexOrientation)

        gfx.moveTo(corners[0]!.x, corners[0]!.y)
        for (let i = 1; i < 6; i++) {
          gfx.lineTo(corners[i]!.x, corners[i]!.y)
        }
        gfx.closePath()
      }
    }

    gfx.stroke({ width: 1, color, alpha })
  }

  private drawSquare() {
    const { cellSize, color, alpha } = this.config
    const gfx = this.gfx

    const cols = Math.ceil(this.viewWidth / cellSize) + 1
    const rows = Math.ceil(this.viewHeight / cellSize) + 1

    // Vertikální čáry
    for (let col = 0; col <= cols; col++) {
      const x = col * cellSize
      gfx.moveTo(x, 0)
      gfx.lineTo(x, this.viewHeight)
    }

    // Horizontální čáry
    for (let row = 0; row <= rows; row++) {
      const y = row * cellSize
      gfx.moveTo(0, y)
      gfx.lineTo(this.viewWidth, y)
    }

    gfx.stroke({ width: 1, color, alpha })
  }
}
