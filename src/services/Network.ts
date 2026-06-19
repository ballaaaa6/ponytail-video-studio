import { IPlayer } from '../../types/IOfficeState'
import { IRoomData } from '../../types/Rooms'
import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { setSessionId, setPlayerNameMap, setLoggedIn } from '../stores/UserStore'
import { setLobbyJoined, setRoomJoined } from '../stores/RoomStore'
import { pushChatMessage, pushPlayerJoinedMessage } from '../stores/ChatStore'

export default class Network {
  webRTC = {
    checkPreviousPermission: () => {},
    getUserMedia: () => {},
    connectToNewUser: (id: string) => {},
    deleteVideoStream: (id: string) => {},
    deleteOnCalledVideoStream: (id: string) => {},
  }
  mySessionId = 'my-player-id'

  private playerJoinedCallbacks: Array<{ callback: Function; context: any }> = []
  private playerLeftCallbacks: Array<{ callback: Function; context: any }> = []
  private myPlayerReadyCallbacks: Array<{ callback: Function; context: any }> = []
  private myPlayerVideoConnectedCallbacks: Array<{ callback: Function; context: any }> = []
  private playerUpdatedCallbacks: Array<{ callback: Function; context: any }> = []
  private itemUserAddedCallbacks: Array<{ callback: Function; context: any }> = []
  private itemUserRemovedCallbacks: Array<{ callback: Function; context: any }> = []
  private chatMessageAddedCallbacks: Array<{ callback: Function; context: any }> = []

  constructor() {
    // Dispatch lobby joined so the lobby dialog displays immediately
    setTimeout(() => {
      store.dispatch(setLobbyJoined(true))
    }, 100)

    phaserEvents.on(Event.MY_PLAYER_NAME_CHANGE, this.updatePlayerName, this)
    phaserEvents.on(Event.MY_PLAYER_TEXTURE_CHANGE, this.updatePlayer, this)
  }

  onPlayerJoined(callback: Function, context: any) {
    this.playerJoinedCallbacks.push({ callback, context })
  }

  onPlayerLeft(callback: Function, context: any) {
    this.playerLeftCallbacks.push({ callback, context })
  }

  onMyPlayerReady(callback: Function, context: any) {
    this.myPlayerReadyCallbacks.push({ callback, context })
  }

  onMyPlayerVideoConnected(callback: Function, context: any) {
    this.myPlayerVideoConnectedCallbacks.push({ callback, context })
  }

  onPlayerUpdated(callback: Function, context: any) {
    this.playerUpdatedCallbacks.push({ callback, context })
  }

  onItemUserAdded(callback: Function, context: any) {
    this.itemUserAddedCallbacks.push({ callback, context })
  }

  onItemUserRemoved(callback: Function, context: any) {
    this.itemUserRemovedCallbacks.push({ callback, context })
  }

  onChatMessageAdded(callback: Function, context: any) {
    this.chatMessageAddedCallbacks.push({ callback, context })
  }

  private trigger(callbacks: Array<{ callback: Function; context: any }>, ...args: any[]) {
    callbacks.forEach(({ callback, context }) => callback.apply(context, args))
  }

  async joinLobbyRoom() {
    store.dispatch(setLobbyJoined(true))
  }

  async joinOrCreatePublic() {
    this.initialize()
  }

  async joinCustomById(roomId: string, password: string | null) {
    this.initialize()
  }

  async createCustom(roomData: IRoomData) {
    this.initialize()
  }

  initialize() {
    store.dispatch(setSessionId(this.mySessionId))
    store.dispatch(setLoggedIn(true))
    store.dispatch(setRoomJoined(true))
    this.trigger(this.myPlayerReadyCallbacks)

    // Spawn NPCs after the player joins the scene
    setTimeout(() => {
      this.spawnNPCs()
    }, 1200)
  }

  private npcPositions = {
    lucy: { x: 705, y: 440, anim: 'lucy_idle_down' },
    ash: { x: 650, y: 480, anim: 'ash_idle_down' },
  }

  private spawnNPCs() {
    // Lucy joins (Project Manager)
    const lucyPlayer: IPlayer = {
      name: 'Lucy (Project Manager)',
      x: this.npcPositions.lucy.x,
      y: this.npcPositions.lucy.y,
      anim: this.npcPositions.lucy.anim,
      readyToConnect: false,
      videoConnected: false,
    }
    this.trigger(this.playerJoinedCallbacks, lucyPlayer, 'lucy-session-id')
    store.dispatch(setPlayerNameMap({ id: 'lucy-session-id', name: lucyPlayer.name }))
    store.dispatch(pushPlayerJoinedMessage(lucyPlayer.name))

    // Ash joins (Software Engineer)
    const ashPlayer: IPlayer = {
      name: 'Ash (Software Engineer)',
      x: this.npcPositions.ash.x,
      y: this.npcPositions.ash.y,
      anim: this.npcPositions.ash.anim,
      readyToConnect: false,
      videoConnected: false,
    }
    this.trigger(this.playerJoinedCallbacks, ashPlayer, 'ash-session-id')
    store.dispatch(setPlayerNameMap({ id: 'ash-session-id', name: ashPlayer.name }))
    store.dispatch(pushPlayerJoinedMessage(ashPlayer.name))

    // Start welcoming behaviors
    this.startNPCBehaviors()
  }

  updatePlayer(x: number, y: number, anim: string) {
    // Stub: Normally updates server. Offline mode does not need to send self-updates.
  }

  updatePlayerName(name: string) {
    store.dispatch(setPlayerNameMap({ id: this.mySessionId, name }))
  }

  readyToConnect() {
    this.trigger(this.myPlayerVideoConnectedCallbacks)
  }

  videoConnected() {}

  playerStreamDisconnect(id: string) {}

  connectToComputer(id: string) {}
  disconnectFromComputer(id: string) {}
  connectToWhiteboard(id: string) {}
  disconnectFromWhiteboard(id: string) {}
  onStopScreenShare(id: string) {}

  addChatMessage(content: string) {
    // Broadcast user chat message
    this.trigger(this.chatMessageAddedCallbacks, this.mySessionId, content)
    store.dispatch(
      pushChatMessage({
        author: 'Me',
        createdAt: new Date().getTime(),
        content: content,
      })
    )

    // Process potential commands to Lucy or Ash
    this.handleChatCommands(content)
  }

  private handleChatCommands(content: string) {
    const text = content.toLowerCase()
    
    // Command Lucy
    if (text.includes('lucy')) {
      if (text.includes('vending') || text.includes('drink') || text.includes('water')) {
        this.moveNPC('lucy', 378, 209, 'lucy_run_up', 'lucy_idle_up')
        this.npcSay('lucy', 'Heading to the vending machine to grab a drink!')
      } else if (text.includes('whiteboard') || text.includes('board')) {
        this.moveNPC('lucy', 512, 544, 'lucy_run_down', 'lucy_sit_down')
        this.npcSay('lucy', 'Heading to the whiteboard to sketch out our new feature!')
      } else if (text.includes('desk') || text.includes('work') || text.includes('chair') || text.includes('stop')) {
        this.moveNPC('lucy', 544, 416, 'lucy_run_up', 'lucy_sit_up')
        this.npcSay('lucy', 'Going back to my desk to work.')
      } else {
        setTimeout(() => {
          this.npcSay('lucy', 'Yes, boss? Tell me: "Lucy go to vending" or "Lucy go to whiteboard".')
        }, 1200)
      }
    } 
    // Command Ash
    else if (text.includes('ash')) {
      if (text.includes('vending') || text.includes('drink') || text.includes('water') || text.includes('cola')) {
        this.moveNPC('ash', 378, 209, 'ash_run_up', 'ash_idle_up')
        this.npcSay('ash', 'Grabbing a quick soda from the vending machine!')
      } else if (text.includes('whiteboard') || text.includes('board')) {
        this.moveNPC('ash', 512, 544, 'ash_run_down', 'ash_sit_down')
        this.npcSay('ash', 'Going to check out the roadmap on the whiteboard.')
      } else if (text.includes('desk') || text.includes('work') || text.includes('chair') || text.includes('code') || text.includes('stop')) {
        this.moveNPC('ash', 512, 416, 'ash_run_up', 'ash_sit_up')
        this.npcSay('ash', 'Back to coding!')
      } else {
        setTimeout(() => {
          this.npcSay('ash', 'Hey boss! Commands I understand: "Ash go to vending", "Ash go to whiteboard", "Ash go back to desk".')
        }, 1200)
      }
    }
  }

  private moveNPC(npcId: 'lucy' | 'ash', x: number, y: number, runAnim: string, idleAnim: string) {
    const sessionId = npcId === 'lucy' ? 'lucy-session-id' : 'ash-session-id'

    // Update animation and coordinates
    this.trigger(this.playerUpdatedCallbacks, 'anim', runAnim, sessionId)
    this.trigger(this.playerUpdatedCallbacks, 'x', x, sessionId)
    this.trigger(this.playerUpdatedCallbacks, 'y', y, sessionId)

    // Calculate move duration to snap them to idle animation when they arrive
    const currentPos = this.npcPositions[npcId]
    const dx = x - currentPos.x
    const dy = y - currentPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const duration = distance * 6 // roughly 6ms per pixel

    setTimeout(() => {
      this.trigger(this.playerUpdatedCallbacks, 'anim', idleAnim, sessionId)
      this.npcPositions[npcId].x = x
      this.npcPositions[npcId].y = y
      this.npcPositions[npcId].anim = idleAnim
    }, duration)
  }

  private npcSay(npcId: 'lucy' | 'ash', message: string) {
    const sessionId = npcId === 'lucy' ? 'lucy-session-id' : 'ash-session-id'
    const name = npcId === 'lucy' ? 'Lucy (Project Manager)' : 'Ash (Software Engineer)'

    setTimeout(() => {
      this.trigger(this.chatMessageAddedCallbacks, sessionId, message)
      store.dispatch(
        pushChatMessage({
          author: name,
          createdAt: new Date().getTime(),
          content: message,
        })
      )
    }, 400)
  }

  private startNPCBehaviors() {
    setTimeout(() => {
      this.npcSay('ash', 'Hello boss! Welcome back to our 2D office. The styling looks fantastic!')
    }, 1800)

    setTimeout(() => {
      this.npcSay(
        'lucy',
        'Hi everyone! You can command Ash or me in this chat. For example, type "Lucy go to vending" or "Ash go to whiteboard".'
      )
    }, 3200)
  }
}
