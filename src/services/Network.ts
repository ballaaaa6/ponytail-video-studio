import { IPlayer } from '../../types/IOfficeState'
import { IRoomData } from '../../types/Rooms'
import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { setSessionId, setPlayerNameMap, setLoggedIn } from '../stores/UserStore'
import { setLobbyJoined, setRoomJoined } from '../stores/RoomStore'
import { pushChatMessage, pushPlayerJoinedMessage } from '../stores/ChatStore'
import { NpcId, NPCS_CONFIG, HOTSPOTS } from '../constants/positions'
import { callWorkersAI } from './aiService'

interface NPC {
  id: NpcId
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

  private npcs: Record<NpcId, NPC> = {
    chief: {
      id: 'chief',
      name: NPCS_CONFIG.chief.name,
      sessionId: NPCS_CONFIG.chief.sessionId,
      x: NPCS_CONFIG.chief.initialX,
      y: NPCS_CONFIG.chief.initialY,
      anim: NPCS_CONFIG.chief.anim,
      state: 'idle',
    },
    creative: {
      id: 'creative',
      name: NPCS_CONFIG.creative.name,
      sessionId: NPCS_CONFIG.creative.sessionId,
      x: NPCS_CONFIG.creative.initialX,
      y: NPCS_CONFIG.creative.initialY,
      anim: NPCS_CONFIG.creative.anim,
      state: 'idle',
    },
    rpa: {
      id: 'rpa',
      name: NPCS_CONFIG.rpa.name,
      sessionId: NPCS_CONFIG.rpa.sessionId,
      x: NPCS_CONFIG.rpa.initialX,
      y: NPCS_CONFIG.rpa.initialY,
      anim: NPCS_CONFIG.rpa.anim,
      state: 'idle',
    },
    editor: {
      id: 'editor',
      name: NPCS_CONFIG.editor.name,
      sessionId: NPCS_CONFIG.editor.sessionId,
      x: NPCS_CONFIG.editor.initialX,
      y: NPCS_CONFIG.editor.initialY,
      anim: NPCS_CONFIG.editor.anim,
      state: 'idle',
    },
    analyst: {
      id: 'analyst',
      name: NPCS_CONFIG.analyst.name,
      sessionId: NPCS_CONFIG.analyst.sessionId,
      x: NPCS_CONFIG.analyst.initialX,
      y: NPCS_CONFIG.analyst.initialY,
      anim: NPCS_CONFIG.analyst.anim,
      state: 'idle',
    },
  }

  private npcHistories: Record<NpcId, Array<{ role: 'user' | 'assistant'; content: string }>> = {
    chief: [],
    creative: [],
    rpa: [],
    editor: [],
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
    const npcIds: NpcId[] = ['chief', 'creative', 'rpa', 'editor', 'analyst']

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
    let targetedNpc: NpcId | null = null

    // Determine targeted NPC
    if (text.includes('chief') || text.includes('adam') || text.includes('manager') || text.includes('ผู้จัดการ') || text.includes('เสนา')) {
      targetedNpc = 'chief'
    } else if (text.includes('creative') || text.includes('lucy') || text.includes('ครีเอทีฟ') || text.includes('เขียนบท')) {
      targetedNpc = 'creative'
    } else if (text.includes('rpa') || text.includes('ash') || text.includes('ปฏิบัติการ') || text.includes('ออพ')) {
      targetedNpc = 'rpa'
    } else if (text.includes('editor') || text.includes('nancy') || text.includes('ตัดต่อ')) {
      targetedNpc = 'editor'
    } else if (text.includes('analyst') || text.includes('วิเคราะห์')) {
      targetedNpc = 'analyst'
    }

    if (targetedNpc) {
      const spriteName = NPCS_CONFIG[targetedNpc].sprite

      if (text.includes('vending') || text.includes('drink') || text.includes('water') || text.includes('น้ำ') || text.includes('ตู้น้ำ')) {
        isCommand = true
        this.moveNPC(targetedNpc, 378, 209, `${spriteName}_run_up`, `${spriteName}_idle_up`, 'idle')
        this.npcSay(targetedNpc, ['chief', 'rpa'].includes(targetedNpc)
          ? 'รับทราบครับบอส เดี๋ยวผมเดินไปตู้หยอดเหรียญหาน้ำดื่มสักครู่นะครับ'
          : 'รับทราบค่ะบอส! เดี๋ยวเดินไปตู้หยอดเหรียญหาน้ำดื่มสักครู่นะคะ')
      } else if (text.includes('whiteboard') || text.includes('board') || text.includes('กระดาน')) {
        isCommand = true
        this.moveNPC(targetedNpc, 512, 544, `${spriteName}_run_down`, `${spriteName}_sit_down`, 'idle')
        this.npcSay(targetedNpc, ['chief', 'rpa'].includes(targetedNpc)
          ? 'กำลังเดินไปที่กระดานไวท์บอร์ดเพื่อเช็คงานเขียนบรีฟแล้วครับ'
          : 'กำลังเดินไปที่กระดานไวท์บอร์ดเพื่อบรีฟงานแล้วค่ะ')
      } else if (text.includes('desk') || text.includes('work') || text.includes('chair') || text.includes('โต๊ะ') || text.includes('ทำงาน')) {
        isCommand = true
        const desk = NPCS_CONFIG[targetedNpc].desk
        this.moveNPC(targetedNpc, desk.x, desk.y, `${spriteName}_run_up`, desk.sitAnim, 'working')
        this.npcSay(targetedNpc, ['chief', 'rpa'].includes(targetedNpc)
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
        // General questions without naming an agent: let chief (Manager) reply!
        this.pushToHistory('chief', 'user', content)
        this.callWorkersAI('chief', content)
      }
    }
  }

  private pushToHistory(npcId: NpcId, role: 'user' | 'assistant', content: string) {
    const history = this.npcHistories[npcId]
    history.push({ role, content })
    if (history.length > 20) {
      history.shift()
    }
  }

  private async callWorkersAI(npcId: NpcId, message: string) {
    const npc = this.npcs[npcId]

    try {
      const payload = {
        message: message,
        selectedAgent: {
          name: npc.name,
        },
        agents: Object.values(this.npcs).map((n) => ({
          name: n.name,
          role: n.id === 'chief' ? 'Manager' : n.id === 'creative' ? 'Creative' : n.id === 'rpa' ? 'RPA Worker' : n.id === 'editor' ? 'Video Editor' : 'Analytics Agent',
          statusLabel: n.state,
        })),
      }

      const responseData = await callWorkersAI(payload)
      let parsedData: any = null

      if (typeof responseData === 'string') {
        try {
          parsedData = JSON.parse(responseData)
        } catch (e) {
          parsedData = { text: responseData }
        }
      } else if (responseData && typeof responseData === 'object') {
        parsedData = responseData
        if (typeof responseData.text === 'string' && responseData.text.trim().startsWith('{')) {
          try {
            const nested = JSON.parse(responseData.text)
            if (nested && typeof nested === 'object') {
              parsedData = { ...responseData, ...nested }
            }
          } catch (e) {
            // Ignore, text was not JSON
          }
        }
      }

      const text = parsedData?.text || ''
      const action = parsedData?.action || null
      const target = parsedData?.target || null

      if (text) {
        this.npcSay(npcId, text)
      }

      if (action === 'move' && target) {
        const spriteName = NPCS_CONFIG[npcId].sprite
        if (target === 'vending') {
          this.moveNPC(npcId, 378, 209, `${spriteName}_run_up`, `${spriteName}_idle_up`, 'idle')
        } else if (target === 'whiteboard') {
          this.moveNPC(npcId, 512, 544, `${spriteName}_run_down`, `${spriteName}_sit_down`, 'idle')
        } else if (target === 'desk') {
          const desk = NPCS_CONFIG[npcId].desk
          this.moveNPC(npcId, desk.x, desk.y, `${spriteName}_run_up`, desk.sitAnim, 'working')
        }
      }
    } catch (error) {
      console.error('Failed to communicate with Workers AI:', error)
      this.npcSay(npcId, ['chief', 'rpa'].includes(npcId)
        ? 'รับทราบครับบอส ตอนนี้ระบบประมวลผลมีปัญหา รบกวนลองอีกรอบนะครับ'
        : 'รับทราบค่ะบอส ตอนนี้ระบบประมวลผลมีปัญหา รบกวนลองอีกรอบนะคะ')
    }
  }

  private moveNPC(
    npcId: NpcId,
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

  private npcSay(npcId: NpcId, message: string) {
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
        'creative',
        'บอสคุยกับพวกเรา 5 คน (Manager, Creative, RPA Worker, Video Editor, Analytics Agent) และสั่งงานหรือให้เราเดินงานในออฟฟิศได้เลยนะคะ'
      )
    }, 3200)

    // 2. Initial movement: NPCs walk to their desks to start working
    let delay = 5000
    const npcIds: NpcId[] = ['chief', 'creative', 'rpa', 'editor', 'analyst']
    npcIds.forEach((id) => {
      const config = NPCS_CONFIG[id]
      setTimeout(() => {
        this.moveNPC(
          id,
          config.desk.x,
          config.desk.y,
          `${config.sprite}_run_up`,
          config.desk.sitAnim,
          'working'
        )
      }, delay)
      delay += 800
    })

    // 3. Autonomous stroll loop: If NPCs are idle, let them walk around randomly!
    setInterval(() => {
      this.simulateAutonomousNPCs()
    }, 20000)
  }

  private simulateAutonomousNPCs() {
    const npcKeys: NpcId[] = ['chief', 'creative', 'rpa', 'editor', 'analyst']

    npcKeys.forEach((key) => {
      const npc = this.npcs[key]
      const spriteName = NPCS_CONFIG[key].sprite

      // Only walk around randomly if they are currently IDLE (break time)
      if (npc.state === 'idle') {
        const decision = Math.random()

        // 40% chance to go back to work at their desk
        if (decision < 0.40) {
          const config = NPCS_CONFIG[key]
          this.moveNPC(key, config.desk.x, config.desk.y, `${spriteName}_run_up`, config.desk.sitAnim, 'working')
          this.npcSay(key, ['chief', 'rpa'].includes(key)
            ? 'พักผ่อนเสร็จแล้ว ขอตัวกลับไปนั่งลุยงานต่อที่โต๊ะทำงานนะครับ'
            : 'พักผ่อนเสร็จแล้ว ขอตัวกลับไปนั่งลุยงานต่อที่โต๊ะทำงานนะคะ')
        }
        // 30% chance to stroll to a random hotspot
        else if (decision < 0.70) {
          const randomHotspot = HOTSPOTS[Math.floor(Math.random() * HOTSPOTS.length)]
          const directionAnim = randomHotspot.x > npc.x ? `${spriteName}_run_right` : `${spriteName}_run_left`

          this.moveNPC(key, randomHotspot.x, randomHotspot.y, directionAnim, `${spriteName}_idle_down`, 'idle')
          this.npcSay(key, ['chief', 'rpa'].includes(key)
            ? `ขอเดินไปสูดอากาศแถวๆ ${randomHotspot.name} แป๊บหนึ่งนะครับ`
            : `ขอเดินไปสูดอากาศแถวๆ ${randomHotspot.name} แป๊บหนึ่งนะคะ`)
        }
      }
      // If they are currently WORKING, there is a small 10% chance they take a break autonomously!
      else if (npc.state === 'working') {
        if (Math.random() < 0.10) {
          const randomHotspot = HOTSPOTS[Math.floor(Math.random() * HOTSPOTS.length)]
          const directionAnim = randomHotspot.x > npc.x ? `${spriteName}_run_right` : `${spriteName}_run_left`

          this.moveNPC(key, randomHotspot.x, randomHotspot.y, directionAnim, `${spriteName}_idle_down`, 'idle')
          this.npcSay(key, ['chief', 'rpa'].includes(key)
            ? `ขออนุญาตเบรกสมอง แวะไปเดินเล่นแถว ${randomHotspot.name} สักประเดี๋ยวนะครับ`
            : `ขออนุญาตเบรกสมอง แวะไปเดินเล่นแถว ${randomHotspot.name} สักประเดี๋ยวนะคะ`)
        }
      }
    })
  }
}
