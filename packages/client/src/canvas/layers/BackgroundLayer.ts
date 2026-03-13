import { Container, Sprite, Texture, Graphics } from 'pixi.js'

export class BackgroundLayer extends Container {
  private sprite: Sprite | null = null
  private fallback: Graphics | null = null

  setImage(url: string, sceneWidth: number, sceneHeight: number) {
    this.sprite?.destroy()
    this.fallback?.destroy()

    const texture = Texture.from(url)
    this.sprite = new Sprite(texture)
    this.sprite.width = sceneWidth
    this.sprite.height = sceneHeight
    this.addChild(this.sprite)
  }

  setFallback(width: number, height: number) {
    this.sprite?.destroy()
    this.fallback?.destroy()

    const g = new Graphics()
    g.rect(0, 0, width, height)
    g.fill({ color: 0x1a1a2e })

    // Jemný vzor pro prázdnou mapu
    const step = 100
    for (let x = 0; x < width; x += step) {
      g.moveTo(x, 0).lineTo(x, height)
    }
    for (let y = 0; y < height; y += step) {
      g.moveTo(0, y).lineTo(width, y)
    }
    g.stroke({ color: 0x2d2d4e, alpha: 0.4, width: 1 })

    this.fallback = g
    this.addChild(g)
  }
}
