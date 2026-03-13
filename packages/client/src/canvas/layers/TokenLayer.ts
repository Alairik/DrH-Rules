import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { Token, GridConfig } from '@dgvtt/shared'
import { hexToPixel, pixelToHex } from '../grid/hexMath'
import { squareToPixel, pixelToSquare } from '../grid/squareMath'

const TOKEN_RADIUS = 20

class TokenSprite extends Container {
  private circle: Graphics
  private nameLabel: Text
  tokenData: Token

  constructor(token: Token) {
    super()
    this.tokenData = token

    this.circle = new Graphics()
    this.drawCircle(token.type)
    this.addChild(this.circle)

    const style = new TextStyle({
      fontSize: 11,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: { color: 0x000000, blur: 2, distance: 1 },
    })
    this.nameLabel = new Text({ text: token.name.slice(0, 3).toUpperCase(), style })
    this.nameLabel.anchor.set(0.5)
    this.addChild(this.nameLabel)

    this.eventMode = 'static'
    this.cursor = 'pointer'
  }

  private drawCircle(type: Token['type']) {
    const color = typeColor(type)
    this.circle.clear()
    this.circle.circle(0, 0, TOKEN_RADIUS)
    this.circle.fill({ color, alpha: 0.85 })
    this.circle.circle(0, 0, TOKEN_RADIUS)
    this.circle.stroke({ color: 0xffffff, alpha: 0.6, width: 1.5 })
  }

  update(token: Token) {
    this.tokenData = token
  }
}

function typeColor(type: Token['type']): number {
  switch (type) {
    case 'player':  return 0x3b82f6
    case 'npc':     return 0x22c55e
    case 'enemy':   return 0xef4444
    case 'object':  return 0xa855f7
  }
}

export class TokenLayer extends Container {
  private sprites = new Map<string, TokenSprite>()
  private grid: GridConfig
  private dragging: { sprite: TokenSprite; offsetX: number; offsetY: number } | null = null

  onTokenMoved?: (token: Token, pixelX: number, pixelY: number, gridCoord: string) => void

  constructor(grid: GridConfig) {
    super()
    this.grid = grid
    this.eventMode = 'static'
  }

  updateGrid(grid: GridConfig) {
    this.grid = grid
    for (const sprite of this.sprites.values()) {
      const snapped = this.snapToGrid(sprite.x, sprite.y)
      sprite.position.set(snapped.x, snapped.y)
    }
  }

  addToken(token: Token) {
    if (this.sprites.has(token.id)) {
      this.updateToken(token)
      return
    }

    const sprite = new TokenSprite(token)
    const pos = this.snapToGrid(token.pixelX, token.pixelY)
    sprite.position.set(pos.x, pos.y)

    this.setupDrag(sprite)
    this.sprites.set(token.id, sprite)
    this.addChild(sprite)
  }

  updateToken(token: Token) {
    const sprite = this.sprites.get(token.id)
    if (!sprite) return
    sprite.update(token)
    const pos = this.snapToGrid(token.pixelX, token.pixelY)
    sprite.position.set(pos.x, pos.y)
  }

  removeToken(id: string) {
    const sprite = this.sprites.get(id)
    if (!sprite) return
    this.removeChild(sprite)
    sprite.destroy()
    this.sprites.delete(id)
  }

  private setupDrag(sprite: TokenSprite) {
    sprite.on('pointerdown', (e) => {
      e.stopPropagation()
      this.dragging = {
        sprite,
        offsetX: e.data.global.x - sprite.x,
        offsetY: e.data.global.y - sprite.y,
      }
      sprite.zIndex = 100
    })

    this.on('pointermove', (e) => {
      if (!this.dragging || this.dragging.sprite !== sprite) return
      sprite.x = e.data.global.x - this.dragging.offsetX
      sprite.y = e.data.global.y - this.dragging.offsetY
    })

    sprite.on('pointerup', () => {
      if (!this.dragging) return
      const snapped = this.snapToGrid(sprite.x, sprite.y)
      sprite.position.set(snapped.x, snapped.y)
      sprite.zIndex = 1

      const gridCoord = this.pixelToGridCoord(snapped.x, snapped.y)
      this.onTokenMoved?.(sprite.tokenData, snapped.x, snapped.y, JSON.stringify(gridCoord))
      this.dragging = null
    })

    sprite.on('pointerupoutside', () => {
      if (!this.dragging) return
      const snapped = this.snapToGrid(sprite.x, sprite.y)
      sprite.position.set(snapped.x, snapped.y)
      sprite.zIndex = 1
      this.dragging = null
    })
  }

  snapToGrid(x: number, y: number): { x: number; y: number } {
    const { type, cellSize, hexOrientation } = this.grid

    if (type === 'hex') {
      const coord = pixelToHex(x, y, cellSize, hexOrientation)
      return hexToPixel(coord.q, coord.r, cellSize, hexOrientation)
    }

    const coord = pixelToSquare(x, y, cellSize)
    return squareToPixel(coord.col, coord.row, cellSize)
  }

  private pixelToGridCoord(x: number, y: number) {
    const { type, cellSize, hexOrientation } = this.grid
    if (type === 'hex') {
      const coord = pixelToHex(x, y, cellSize, hexOrientation)
      return { type: 'hex', coord }
    }
    const coord = pixelToSquare(x, y, cellSize)
    return { type: 'square', coord }
  }
}
