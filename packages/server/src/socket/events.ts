// Typy Socket.io eventů — sdíleno mezi serverem a klientem
export interface ServerToClientEvents {
  'token:moved': (data: { tokenId: string; pixelX: number; pixelY: number; gridCoord: string }) => void
  'token:added': (data: { sceneId: string; tokenId: string }) => void
  'grid:changed': (data: { sceneId: string; gridConfig: string }) => void
  'scene:updated': (data: { sceneId: string }) => void
}

export interface ClientToServerEvents {
  'join:scene': (sceneId: string) => void
  'leave:scene': (sceneId: string) => void
  'token:move': (data: { tokenId: string; pixelX: number; pixelY: number; gridCoord: string }) => void
}
