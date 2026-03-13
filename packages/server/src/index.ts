import Fastify from 'fastify'
import cors from '@fastify/cors'
import { createServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/router.js'
import { initDb, db } from './db/index.js'
import { tokens } from './db/schema.js'
import { eq } from 'drizzle-orm'
import type { ServerToClientEvents, ClientToServerEvents } from './socket/events.js'

const PORT = Number(process.env.PORT ?? 3001)

initDb()

const app = Fastify({ logger: { level: 'info' } })

await app.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST'],
})

// tRPC přes fetch handler
app.all('/trpc/*', async (req, reply) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: ['GET', 'HEAD'].includes(req.method) ? null : JSON.stringify(req.body),
  })

  const response = await fetchRequestHandler({
    endpoint: '/trpc',
    req: request,
    router: appRouter,
    createContext: () => ({}),
  })

  reply.status(response.status)
  response.headers.forEach((value, key) => { reply.header(key, value) })
  reply.send(await response.text())
})

const httpServer = createServer(app.server)

const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:4173'] },
})

io.on('connection', (socket) => {
  app.log.info(`Socket connected: ${socket.id}`)

  socket.on('join:scene', (sceneId) => {
    socket.join(`scene:${sceneId}`)
  })

  socket.on('leave:scene', (sceneId) => {
    socket.leave(`scene:${sceneId}`)
  })

  socket.on('token:move', async (data) => {
    db.update(tokens)
      .set({ pixelX: data.pixelX, pixelY: data.pixelY, gridCoord: data.gridCoord })
      .where(eq(tokens.id, data.tokenId))
      .run()
    // Broadcast ostatním v té samé scéně
    socket.broadcast.to(`scene:${data.tokenId}`).emit('token:moved', data)
  })

  socket.on('disconnect', () => {
    app.log.info(`Socket disconnected: ${socket.id}`)
  })
})

await app.ready()

httpServer.listen(PORT, () => {
  console.log(`Dragon Guard VTT server running on http://localhost:${PORT}`)
})
