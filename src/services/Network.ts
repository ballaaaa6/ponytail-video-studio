import { IPlayer } from '../../types/IOfficeState'
import { IRoomData } from '../../types/Rooms'
import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { setSessionId, setPlayerNameMap, setLoggedIn } from '../stores/UserStore'
import { setLobbyJoined, setRoomJoined } from '../stores/RoomStore'
import { pushChatMessage, pushPlayerJoinedMessage } from '../stores/ChatStore'

interface NPC {
  id: 'chief' | 'videoLead' | 'ops' | 'analyst'
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

  private npcs: Record<'chief' | 'videoLead' | 'ops' | 'analyst', NPC> = {
    chief: {
      id: 'chief',
      name: 'Chief of Staff (เสนาธิการ)',
      sessionId: 'chief-session-id',
      x: 600,
      y: 440,
      anim: 'adam_idle_down',
      state: 'idle',
    },
    ops: {
      id: 'ops',
      name: 'Ash (Ops Lead)',
      sessionId: 'ops-session-id',
      x: 650,
      y: 480,
      anim: 'ash_idle_down',
      state: 'idle',
    },
    videoLead: {
      id: 'videoLead',
      name: 'Lucy (Video Lead)',
      sessionId: 'videoLead-session-id',
      x: 705,
      y: 440,
      anim: 'lucy_idle_down',
      state: 'idle',
    },
    analyst: {
      id: 'analyst',
      name: 'Nancy (Analyst)',
      sessionId: 'analyst-session-id',
      x: 580,
      y: 480,
      anim: 'nancy_idle_down',
      state: 'idle',
    },
  }

  // Adjacent Workstations at y: 416
  private deskPositions = {
    chief: { x: 480, y: 416, sitAnim: 'adam_sit_up', idleAnim: 'adam_idle_up' },
    ops: { x: 512, y: 416, sitAnim: 'ash_sit_up', idleAnim: 'ash_idle_up' },
    videoLead: { x: 544, y: 416, sitAnim: 'lucy_sit_up', idleAnim: 'lucy_idle_up' },
    analyst: { x: 576, y: 416, sitAnim: 'nancy_sit_up', idleAnim: 'nancy_idle_up' },
  }

  // Walk-around hotspots
  private hotspots = [
    { x: 378, y: 209, name: 'ตู้หยอดเหรียญ' },
    { x: 512, y: 544, name: 'กระดานไวท์บอร์ด' },
    { x: 640, y: 128, name: 'ห้องนั่งเล่นพักผ่อน' },
    { x: 320, y: 640, name: 'โซนเก้าอี้ประชุม' },
  ]

  private npcHistories: Record<'chief' | 'videoLead' | 'ops' | 'analyst', Array<{ role: 'user' | 'assistant'; content: string }>> = {
    chief: [],
    videoLead: [],
    ops: [],
    analyst: [],
  }

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
    const npcIds: Array<'chief' | 'videoLead' | 'ops' | 'analyst'> = ['chief', 'videoLead', 'ops', 'analyst']

    npcIds.forEach((id) => {
      const npc = this.npcs[id]
      const player: IPlayer = {
        name: npc.name,
        x: npc.x,
        y: npc.y,
        anim: npc.anim,
        readyToConnect: false,
        videoConnected: false,
      }
      this.trigger(this.playerJoinedCallbacks, player, npc.sessionId)
      store.dispatch(setPlayerNameMap({ id: npc.sessionId, name: player.name }))
      store.dispatch(pushPlayerJoinedMessage(player.name))
    })

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

    // Process potential commands to employees
    this.handleChatCommands(content)
  }

  private handleChatCommands(content: string) {
    const text = content.toLowerCase()
    let isCommand = false
    let targetedNpc: 'chief' | 'videoLead' | 'ops' | 'analyst' | null = null

    // Determine targeted NPC
    if (text.includes('chief') || text.includes('adam') || text.includes('หัวหน้าห้อง') || text.includes('เสนา')) {
      targetedNpc = 'chief'
    } else if (text.includes('lucy') || text.includes('video') || text.includes('วิดีโอ')) {
      targetedNpc = 'videoLead'
    } else if (text.includes('ash') || text.includes('ops') || text.includes('ออพ')) {
      targetedNpc = 'ops'
    } else if (text.includes('nancy') || text.includes('analyst') || text.includes('วิเคราะห์')) {
      targetedNpc = 'analyst'
    }

    if (targetedNpc) {
      const spriteName = targetedNpc === 'chief' ? 'adam' : targetedNpc === 'videoLead' ? 'lucy' : targetedNpc === 'ops' ? 'ash' : 'nancy'

      if (text.includes('vending') || text.includes('drink') || text.includes('water') || text.includes('น้ำ') || text.includes('ตู้น้ำ')) {
        isCommand = true
        this.moveNPC(targetedNpc, 378, 209, `${spriteName}_run_up`, `${spriteName}_idle_up`, 'idle')
        this.npcSay(targetedNpc, targetedNpc === 'chief' || targetedNpc === 'ops'
          ? 'รับทราบครับบอส เดี๋ยวผมเดินไปตู้หยอดเหรียญหาน้ำดื่มสักครู่นะครับ'
          : 'รับทราบค่ะบอส! เดี๋ยวเดินไปตู้หยอดเหรียญหาน้ำดื่มสักครู่นะคะ')
      } else if (text.includes('whiteboard') || text.includes('board') || text.includes('กระดาน')) {
        isCommand = true
        this.moveNPC(targetedNpc, 512, 544, `${spriteName}_run_down`, `${spriteName}_sit_down`, 'idle')
        this.npcSay(targetedNpc, targetedNpc === 'chief' || targetedNpc === 'ops'
          ? 'กำลังเดินไปที่กระดานไวท์บอร์ดเพื่อเช็คงานเขียนบรีฟแล้วครับ'
          : 'กำลังเดินไปที่กระดานไวท์บอร์ดเพื่อบรีฟงานแล้วค่ะ')
      } else if (text.includes('desk') || text.includes('work') || text.includes('chair') || text.includes('โต๊ะ') || text.includes('ทำงาน')) {
        isCommand = true
        const desk = this.deskPositions[targetedNpc]
        this.moveNPC(targetedNpc, desk.x, desk.y, `${spriteName}_run_up`, desk.sitAnim, 'working')
        this.npcSay(targetedNpc, targetedNpc === 'chief' || targetedNpc === 'ops'
          ? 'รับทราบครับบอส กลับมานั่งสแตนบายทำงานที่โต๊ะเรียบร้อยแล้วครับ'
          : 'รับทราบค่ะบอส! กลับมานั่งสแตนบายทำงานที่โต๊ะเรียบร้อยแล้วค่ะ')
      }
    }

    // If it's not a movement command, trigger real LLM call via Cloudflare Workers AI!
    if (!isCommand) {
      if (targetedNpc) {
        this.pushToHistory(targetedNpc, 'user', content)
        this.callWorkersAI(targetedNpc, content)
      } else {
        // General questions without naming an agent: let chief (Chief of Staff) reply!
        this.pushToHistory('chief', 'user', content)
        this.callWorkersAI('chief', content)
      }
    }
  }

  private pushToHistory(npcId: 'chief' | 'videoLead' | 'ops' | 'analyst', role: 'user' | 'assistant', content: string) {
    const history = this.npcHistories[npcId]
    history.push({ role, content })
    if (history.length > 20) {
      history.shift()
    }
  }

  private async callWorkersAI(npcId: 'chief' | 'videoLead' | 'ops' | 'analyst', message: string) {
    const npc = this.npcs[npcId]

    try {
      const response = await fetch('https://voice-office-ai.ballaaaa6.workers.dev/api/office-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          selectedAgent: {
            name: npc.name,
          },
          agents: [
            { name: this.npcs.chief.name, role: 'Chief of Staff', statusLabel: this.npcs.chief.state },
            { name: this.npcs.videoLead.name, role: 'Video Lead', statusLabel: this.npcs.videoLead.state },
            { name: this.npcs.ops.name, role: 'Ops Lead', statusLabel: this.npcs.ops.state },
            { name: this.npcs.analyst.name, role: 'Analyst', statusLabel: this.npcs.analyst.state },
          ],
        }),
      })

      const data = await response.json()
      if (data && data.text) {
        this.npcSay(npcId, data.text)
      }
    } catch (error) {
      console.error('Failed to communicate with Workers AI:', error)
      this.npcSay(npcId, npcId === 'chief' || npcId === 'ops'
        ? 'รับทราบครับบอส ตอนนี้ระบบประมวลผลมีปัญหา รบกวนลองอีกรอบนะครับ'
        : 'รับทราบค่ะบอส ตอนนี้ระบบประมวลผลมีปัญหา รบกวนลองอีกรอบนะคะ')
    }
  }

  private moveNPC(
    npcId: 'chief' | 'videoLead' | 'ops' | 'analyst',
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

  private npcSay(npcId: 'chief' | 'videoLead' | 'ops' | 'analyst', message: string) {
    const npc = this.npcs[npcId]
    this.pushToHistory(npcId, 'assistant', message)

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
      this.npcSay('chief', 'สวัสดีครับบอส! ยินดีต้อนรับสู่ออฟฟิศพิกเซลอาร์ต Ponytail Video Studio ครับ!')
    }, 1800)

    setTimeout(() => {
      this.npcSay(
        'videoLead',
        'บอสคุยกับพวกเรา 4 คน (Chief of Staff, Video Lead, Ops Lead, Analyst) และสั่งงานหรือให้เราเดินงานในออฟฟิศได้เลยนะคะ'
      )
    }, 3200)

    // 2. Initial movement: NPCs walk to their desks to start working
    setTimeout(() => {
      this.moveNPC(
        'chief',
        this.deskPositions.chief.x,
        this.deskPositions.chief.y,
        'adam_run_up',
        this.deskPositions.chief.sitAnim,
        'working'
      )
    }, 5000)

    setTimeout(() => {
      this.moveNPC(
        'ops',
        this.deskPositions.ops.x,
        this.deskPositions.ops.y,
        'ash_run_up',
        this.deskPositions.ops.sitAnim,
        'working'
      )
    }, 5800)

    setTimeout(() => {
      this.moveNPC(
        'videoLead',
        this.deskPositions.videoLead.x,
        this.deskPositions.videoLead.y,
        'lucy_run_up',
        this.deskPositions.videoLead.sitAnim,
        'working'
      )
    }, 6600)

    setTimeout(() => {
      this.moveNPC(
        'analyst',
        this.deskPositions.analyst.x,
        this.deskPositions.analyst.y,
        'nancy_run_up',
        this.deskPositions.analyst.sitAnim,
        'working'
      )
    }, 7400)

    // 3. Autonomous stroll loop: If NPCs are idle, let them walk around randomly!
    setInterval(() => {
      this.simulateAutonomousNPCs()
    }, 20000)
  }

  private simulateAutonomousNPCs() {
    const npcKeys: Array<'chief' | 'videoLead' | 'ops' | 'analyst'> = ['chief', 'videoLead', 'ops', 'analyst']

    npcKeys.forEach((key) => {
      const npc = this.npcs[key]
      const spriteName = key === 'chief' ? 'adam' : key === 'videoLead' ? 'lucy' : key === 'ops' ? 'ash' : 'nancy'

      // Only walk around randomly if they are currently IDLE (break time)
      if (npc.state === 'idle') {
        const decision = Math.random()

        // 40% chance to go back to work at their desk
        if (decision < 0.40) {
          const desk = this.deskPositions[key]
          this.moveNPC(key, desk.x, desk.y, `${spriteName}_run_up`, desk.sitAnim, 'working')
          this.npcSay(key, key === 'chief' || key === 'ops'
            ? 'พักผ่อนเสร็จแล้ว ขอตัวกลับไปนั่งลุยงานต่อที่โต๊ะทำงานนะครับ'
            : 'พักผ่อนเสร็จแล้ว ขอตัวกลับไปนั่งลุยงานต่อที่โต๊ะทำงานนะคะ')
        }
        // 30% chance to stroll to a random hotspot
        else if (decision < 0.70) {
          const randomHotspot = this.hotspots[Math.floor(Math.random() * this.hotspots.length)]
          const directionAnim = randomHotspot.x > npc.x ? `${spriteName}_run_right` : `${spriteName}_run_left`

          this.moveNPC(key, randomHotspot.x, randomHotspot.y, directionAnim, `${spriteName}_idle_down`, 'idle')
          this.npcSay(key, key === 'chief' || key === 'ops'
            ? `ขอเดินไปสูดอากาศแถวๆ ${randomHotspot.name} แป๊บหนึ่งนะครับ`
            : `ขอเดินไปสูดอากาศแถวๆ ${randomHotspot.name} แป๊บหนึ่งนะคะ`)
        }
      }
      // If they are currently WORKING, there is a small 10% chance they take a break autonomously!
      else if (npc.state === 'working') {
        if (Math.random() < 0.10) {
          const randomHotspot = this.hotspots[Math.floor(Math.random() * this.hotspots.length)]
          const directionAnim = randomHotspot.x > npc.x ? `${spriteName}_run_right` : `${spriteName}_run_left`

          this.moveNPC(key, randomHotspot.x, randomHotspot.y, directionAnim, `${spriteName}_idle_down`, 'idle')
          this.npcSay(key, key === 'chief' || key === 'ops'
            ? `ขออนุญาตเบรกสมอง แวะไปเดินเล่นแถว ${randomHotspot.name} สักประเดี๋ยวนะครับ`
            : `ขออนุญาตเบรกสมอง แวะไปเดินเล่นแถว ${randomHotspot.name} สักประเดี๋ยวนะคะ`)
        }
      }
    })
  }
}
