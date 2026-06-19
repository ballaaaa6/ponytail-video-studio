// Standalone types — no Colyseus dependency (❄️ FROZEN: Multiplayer removed)

export interface IPlayer {
  name: string
  x: number
  y: number
  anim: string
  readyToConnect: boolean
  videoConnected: boolean
}

export interface IComputer {
  connectedUser: Set<string>
}

export interface IWhiteboard {
  roomId: string
  connectedUser: Set<string>
}

export interface IChatMessage {
  author: string
  createdAt: number
  content: string
}

export interface IOfficeState {
  players: Map<string, IPlayer>
  computers: Map<string, IComputer>
  whiteboards: Map<string, IWhiteboard>
  chatMessages: IChatMessage[]
}
