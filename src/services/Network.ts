import { IPlayer } from '../../types/IOfficeState'
import { IRoomData } from '../../types/Rooms'
import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { setSessionId, setPlayerNameMap, setLoggedIn } from '../stores/UserStore'
import { setLobbyJoined, setRoomJoined } from '../stores/RoomStore'
import { pushChatMessage, pushPlayerJoinedMessage } from '../stores/ChatStore'

interface NPC {
  id: 'lucy' | 'ash'
  name: string
  sessionId: string
  x: number
  y: number
  anim: string
  state: 'working' | 'idle' | 'moving'
  targetX?: number
  targetY?: number
}

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

  private npcs: Record<'lucy' | 'ash', NPC> = {
    lucy: {
      id: 'lucy',
      name: 'Lucy (Project Manager)',
      sessionId: 'lucy-session-id',
      x: 705,
      y: 440,
      anim: 'lucy_idle_down',
      state: 'idle',
    },
    ash: {
      id: 'ash',
      name: 'Ash (Software Engineer)',
      sessionId: 'ash-session-id',
      x: 650,
      y: 480,
      anim: 'ash_idle_down',
      state: 'idle',
    },
  }

  // Workstations
  private deskPositions = {
    lucy: { x: 544, y: 416, sitAnim: 'lucy_sit_up', idleAnim: 'lucy_idle_up' },
    ash: { x: 512, y: 416, sitAnim: 'ash_sit_up', idleAnim: 'ash_idle_up' },
  }

  // Walk-around hotspots
  private hotspots = [
    { x: 378, y: 209, name: 'ตู้หยอดเหรียญ' },
    { x: 512, y: 544, name: 'กระดานไวท์บอร์ด' },
    { x: 640, y: 128, name: 'ห้องนั่งเล่นพักผ่อน' },
    { x: 320, y: 640, name: 'โซนเก้าอี้ประชุม' },
  ]

  constructor() {
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

    setTimeout(() => {
      this.spawnNPCs()
    }, 1200)
  }

  private spawnNPCs() {
    // Lucy joins
    const lucyPlayer: IPlayer = {
      name: this.npcs.lucy.name,
      x: this.npcs.lucy.x,
      y: this.npcs.lucy.y,
      anim: this.npcs.lucy.anim,
      readyToConnect: false,
      videoConnected: false,
    }
    this.trigger(this.playerJoinedCallbacks, lucyPlayer, this.npcs.lucy.sessionId)
    store.dispatch(setPlayerNameMap({ id: this.npcs.lucy.sessionId, name: lucyPlayer.name }))
    store.dispatch(pushPlayerJoinedMessage(lucyPlayer.name))

    // Ash joins
    const ashPlayer: IPlayer = {
      name: this.npcs.ash.name,
      x: this.npcs.ash.x,
      y: this.npcs.ash.y,
      anim: this.npcs.ash.anim,
      readyToConnect: false,
      videoConnected: false,
    }
    this.trigger(this.playerJoinedCallbacks, ashPlayer, this.npcs.ash.sessionId)
    store.dispatch(setPlayerNameMap({ id: this.npcs.ash.sessionId, name: ashPlayer.name }))
    store.dispatch(pushPlayerJoinedMessage(ashPlayer.name))

    // Start welcoming and behaviors
    this.startNPCBehaviors()
  }

  updatePlayer(x: number, y: number, anim: string) {
    // Stub
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
    let isCommand = false

    // Direct movement commands for Lucy
    if (text.includes('lucy')) {
      if (text.includes('vending') || text.includes('drink') || text.includes('water')) {
        isCommand = true
        this.moveNPC('lucy', 378, 209, 'lucy_run_up', 'lucy_idle_up', 'idle')
        this.npcSay('lucy', 'รับทราบค่ะบอส! เดี๋ยวเดินไปตู้หยอดเหรียญหาน้ำดื่มสักครู่นะคะ')
      } else if (text.includes('whiteboard') || text.includes('board')) {
        isCommand = true
        this.moveNPC('lucy', 512, 544, 'lucy_run_down', 'lucy_sit_down', 'idle')
        this.npcSay('lucy', 'กำลังเดินไปที่กระดานไวท์บอร์ดเพื่อบรีฟงานแล้วค่ะ')
      } else if (text.includes('desk') || text.includes('work') || text.includes('chair') || text.includes('โต๊ะ') || text.includes('ทำงาน')) {
        isCommand = true
        this.moveNPC('lucy', this.deskPositions.lucy.x, this.deskPositions.lucy.y, 'lucy_run_up', this.deskPositions.lucy.sitAnim, 'working')
        this.npcSay('lucy', 'รับทราบค่ะบอส! กลับมานั่งสแตนบายทำงานที่โต๊ะเรียบร้อยแล้วค่ะ')
      }
    } 
    
    // Direct movement commands for Ash
    if (text.includes('ash')) {
      if (text.includes('vending') || text.includes('drink') || text.includes('water') || text.includes('cola')) {
        isCommand = true
        this.moveNPC('ash', 378, 209, 'ash_run_up', 'ash_idle_up', 'idle')
        this.npcSay('ash', 'ได้เลยครับบอส เดี๋ยวแวะไปตู้หยอดเหรียญคว้ากระป๋องโคล่าแป๊บนึงครับ!')
      } else if (text.includes('whiteboard') || text.includes('board')) {
        isCommand = true
        this.moveNPC('ash', 512, 544, 'ash_run_down', 'ash_sit_down', 'idle')
        this.npcSay('ash', 'โอเคครับ เดินไปเช็คงานเขียนโค้ดที่ไวท์บอร์ดสักครู่ครับ')
      } else if (text.includes('desk') || text.includes('work') || text.includes('chair') || text.includes('โต๊ะ') || text.includes('ทำงาน')) {
        isCommand = true
        this.moveNPC('ash', this.deskPositions.ash.x, this.deskPositions.ash.y, 'ash_run_up', this.deskPositions.ash.sitAnim, 'working')
        this.npcSay('ash', 'รับทราบครับบอส กลับมาลุยงานนั่งทำงานเขียนโค้ดที่โต๊ะต่อแล้วครับ!')
      }
    }

    // If it's not a movement command, trigger real LLM call via Cloudflare Workers AI!
    if (!isCommand) {
      if (text.includes('lucy')) {
        this.callWorkersAI('Lucy (Project Manager)', content)
      } else if (text.includes('ash')) {
        this.callWorkersAI('Ash (Software Engineer)', content)
      } else {
        // General questions without naming an agent: let Lucy (the PM) reply!
        this.callWorkersAI('Lucy (Project Manager)', content)
      }
    }
  }

  private async callWorkersAI(agentName: 'Lucy (Project Manager)' | 'Ash (Software Engineer)', message: string) {
    const npcId = agentName.includes('Lucy') ? 'lucy' : 'ash'
    const agentSessionId = npcId === 'lucy' ? 'lucy-session-id' : 'ash-session-id'

    try {
      const response = await fetch('https://voice-office-ai.ballaaaa6.workers.dev/api/office-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          selectedAgent: {
            name: agentName,
          },
          agents: [
            { name: this.npcs.lucy.name, role: 'Project Manager', statusLabel: this.npcs.lucy.state },
            { name: this.npcs.ash.name, role: 'Software Engineer', statusLabel: this.npcs.ash.state },
          ],
        }),
      })

      const data = await response.json()
      if (data && data.text) {
        this.npcSay(npcId, data.text)
      }
    } catch (error) {
      console.error('Failed to communicate with Workers AI:', error)
      this.npcSay(npcId, 'รับทราบค่ะบอส ตอนนี้ระบบคิดเงิน AI มีปัญหานิดหน่อย รบกวนลองอีกครั้งนะคะ!')
    }
  }

  private moveNPC(
    npcId: 'lucy' | 'ash',
    x: number,
    y: number,
    runAnim: string,
    idleAnim: string,
    nextState: 'working' | 'idle'
  ) {
    const npc = this.npcs[npcId]
    npc.state = 'moving'

    // Update animations and physics target coordinates
    this.trigger(this.playerUpdatedCallbacks, 'anim', runAnim, npc.sessionId)
    this.trigger(this.playerUpdatedCallbacks, 'x', x, npc.sessionId)
    this.trigger(this.playerUpdatedCallbacks, 'y', y, npc.sessionId)

    const dx = x - npc.x
    const dy = y - npc.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const duration = distance * 6 // roughly 6ms per pixel walking speed

    setTimeout(() => {
      this.trigger(this.playerUpdatedCallbacks, 'anim', idleAnim, npc.sessionId)
      npc.x = x
      npc.y = y
      npc.anim = idleAnim
      npc.state = nextState
    }, duration)
  }

  private npcSay(npcId: 'lucy' | 'ash', message: string) {
    const npc = this.npcs[npcId]

    setTimeout(() => {
      this.trigger(this.chatMessageAddedCallbacks, npc.sessionId, message)
      store.dispatch(
        pushChatMessage({
          author: npc.name,
          createdAt: new Date().getTime(),
          content: message,
        })
      )
    }, 400)
  }

  private startNPCBehaviors() {
    // 1. Initial greeting
    setTimeout(() => {
      this.npcSay('ash', 'สวัสดีครับบอส! ยินดีต้อนรับสู่ออฟฟิศ 2D แบบพิกเซลอาร์ตนะครับ')
    }, 1800)

    setTimeout(() => {
      this.npcSay(
        'lucy',
        'สวัสดีค่ะบอส! บอสสั่งการพวกเราในแชทนี้ได้เลยนะคะ พิมพ์ "Lucy" หรือ "Ash" แล้วพิมพ์ข้อความถามไถ่ คุยตอบ หรือสั่งเดินงานได้เลยค่ะ!'
      )
    }, 3200)

    // 2. Initial movement: NPCs walk to their desks to start working
    setTimeout(() => {
      this.moveNPC(
        'lucy',
        this.deskPositions.lucy.x,
        this.deskPositions.lucy.y,
        'lucy_run_up',
        this.deskPositions.lucy.sitAnim,
        'working'
      )
    }, 5000)

    setTimeout(() => {
      this.moveNPC(
        'ash',
        this.deskPositions.ash.x,
        this.deskPositions.ash.y,
        'ash_run_up',
        this.deskPositions.ash.sitAnim,
        'working'
      )
    }, 6000)

    // 3. Autonomous stroll loop: If NPCs are idle, let them walk around randomly!
    setInterval(() => {
      this.simulateAutonomousNPCs()
    }, 20000) // check every 20 seconds
  }

  private simulateAutonomousNPCs() {
    const npcKeys: Array<'lucy' | 'ash'> = ['lucy', 'ash']
    
    npcKeys.forEach((key) => {
      const npc = this.npcs[key]
      
      // Only walk around randomly if they are currently IDLE (break time)
      if (npc.state === 'idle') {
        const decision = Math.random()
        
        // 40% chance to go back to work at their desk
        if (decision < 0.40) {
          const desk = this.deskPositions[key]
          this.moveNPC(key, desk.x, desk.y, `${key}_run_up`, desk.sitAnim, 'working')
          this.npcSay(key, 'พักผ่อนเสร็จแล้ว ขอตัวกลับไปนั่งลุยงานต่อที่โต๊ะทำงานนะคะ/ครับ')
        } 
        // 30% chance to stroll to a random hotspot
        else if (decision < 0.70) {
          const randomHotspot = this.hotspots[Math.floor(Math.random() * this.hotspots.length)]
          const directionAnim = randomHotspot.x > npc.x ? `${key}_run_right` : `${key}_run_left`
          
          this.moveNPC(key, randomHotspot.x, randomHotspot.y, directionAnim, `${key}_idle_down`, 'idle')
          this.npcSay(key, `ขอเดินไปสูดอากาศแถวๆ ${randomHotspot.name} แป๊บหนึ่งนะคะ/ครับ`)
        }
        // 30% chance to just stand still and rest
      } 
      // If they are currently WORKING, there is a small 10% chance they take a break autonomously!
      else if (npc.state === 'working') {
        if (Math.random() < 0.10) {
          const randomHotspot = this.hotspots[Math.floor(Math.random() * this.hotspots.length)]
          const directionAnim = randomHotspot.x > npc.x ? `${key}_run_right` : `${key}_run_left`
          
          this.moveNPC(key, randomHotspot.x, randomHotspot.y, directionAnim, `${key}_idle_down`, 'idle')
          this.npcSay(key, `ขออนุญาตเบรกสมอง แวะไปเดินเล่นแถว ${randomHotspot.name} สักประเดี๋ยวนะคะ/ครับ`)
        }
      }
    })
  }
}
