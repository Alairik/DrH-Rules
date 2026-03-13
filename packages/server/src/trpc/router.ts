import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { db, initDb } from '../db/index.js'
import { scenes, tokens } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { GridConfig } from '@dgvtt/shared'
import { DEFAULT_GRID_CONFIG } from '@dgvtt/shared'
import { randomUUID } from 'node:crypto'

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

const GridConfigSchema = z.object({
  type: z.enum(['hex', 'square']),
  cellSize: z.number().min(20).max(200),
  visible: z.boolean(),
  color: z.number(),
  alpha: z.number().min(0).max(1),
  hexOrientation: z.enum(['pointy', 'flat']),
})

export const appRouter = router({
  scene: router({
    list: publicProcedure.query(() => {
      return db.select({ id: scenes.id, name: scenes.name }).from(scenes).all()
    }),

    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        const row = db.select().from(scenes).where(eq(scenes.id, input.id)).get()
        if (!row) return null
        return {
          ...row,
          gridConfig: JSON.parse(row.gridConfig) as GridConfig,
          walls: JSON.parse(row.walls),
          doors: JSON.parse(row.doors),
          lights: JSON.parse(row.lights),
        }
      }),

    create: publicProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(({ input }) => {
        const id = randomUUID()
        const now = Date.now()
        db.insert(scenes).values({
          id,
          name: input.name,
          gridConfig: JSON.stringify(DEFAULT_GRID_CONFIG),
          updatedAt: new Date(now),
        }).run()
        return { id }
      }),

    updateGrid: publicProcedure
      .input(z.object({ sceneId: z.string(), grid: GridConfigSchema }))
      .mutation(({ input }) => {
        db.update(scenes)
          .set({ gridConfig: JSON.stringify(input.grid), updatedAt: new Date() })
          .where(eq(scenes.id, input.sceneId))
          .run()
        return { ok: true }
      }),
  }),

  token: router({
    list: publicProcedure
      .input(z.object({ sceneId: z.string() }))
      .query(({ input }) => {
        return db.select().from(tokens).where(eq(tokens.sceneId, input.sceneId)).all()
      }),

    create: publicProcedure
      .input(z.object({
        sceneId: z.string(),
        name: z.string().min(1),
        type: z.enum(['player', 'npc', 'enemy', 'object']),
        pixelX: z.number(),
        pixelY: z.number(),
        gridCoord: z.string(),
      }))
      .mutation(({ input }) => {
        const id = randomUUID()
        db.insert(tokens).values({ id, ...input }).run()
        return { id }
      }),

    move: publicProcedure
      .input(z.object({
        id: z.string(),
        pixelX: z.number(),
        pixelY: z.number(),
        gridCoord: z.string(),
      }))
      .mutation(({ input }) => {
        db.update(tokens)
          .set({ pixelX: input.pixelX, pixelY: input.pixelY, gridCoord: input.gridCoord })
          .where(eq(tokens.id, input.id))
          .run()
        return { ok: true }
      }),
  }),
})

export type AppRouter = typeof appRouter
