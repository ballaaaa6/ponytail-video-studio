export type NpcId = 'chief' | 'creative' | 'rpa' | 'editor' | 'analyst';

export interface DeskPosition {
  x: number;
  y: number;
  sitAnim: string;
  idleAnim: string;
}

export interface NPCConfig {
  id: NpcId;
  name: string;
  sessionId: string;
  sprite: string;
  initialX: number;
  initialY: number;
  anim: string;
  desk: DeskPosition;
}

export const NPCS_CONFIG: Record<NpcId, NPCConfig> = {
  chief: {
    id: 'chief',
    name: 'Manager (ผู้จัดการระบบ)',
    sessionId: 'chief-session-id',
    sprite: 'adam',
    initialX: 600,
    initialY: 440,
    anim: 'adam_idle_down',
    desk: {
      x: 448,
      y: 416,
      sitAnim: 'adam_sit_up',
      idleAnim: 'adam_idle_up',
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative (ครีเอทีฟเขียนบท)',
    sessionId: 'creative-session-id',
    sprite: 'lucy',
    initialX: 705,
    initialY: 440,
    anim: 'lucy_idle_down',
    desk: {
      x: 480,
      y: 416,
      sitAnim: 'lucy_sit_up',
      idleAnim: 'lucy_idle_up',
    },
  },
  rpa: {
    id: 'rpa',
    name: 'RPA Worker (ฝ่ายปฏิบัติการ)',
    sessionId: 'rpa-session-id',
    sprite: 'ash',
    initialX: 650,
    initialY: 480,
    anim: 'ash_idle_down',
    desk: {
      x: 512,
      y: 416,
      sitAnim: 'ash_sit_up',
      idleAnim: 'ash_idle_up',
    },
  },
  editor: {
    id: 'editor',
    name: 'Video Editor (ช่างตัดต่อ)',
    sessionId: 'editor-session-id',
    sprite: 'nancy',
    initialX: 680,
    initialY: 480,
    anim: 'nancy_idle_down',
    desk: {
      x: 544,
      y: 416,
      sitAnim: 'nancy_sit_up',
      idleAnim: 'nancy_idle_up',
    },
  },
  analyst: {
    id: 'analyst',
    name: 'Analytics Agent (นักวิเคราะห์)',
    sessionId: 'analyst-session-id',
    sprite: 'nancy',
    initialX: 580,
    initialY: 480,
    anim: 'nancy_idle_down',
    desk: {
      x: 576,
      y: 416,
      sitAnim: 'nancy_sit_up',
      idleAnim: 'nancy_idle_up',
    },
  },
};

export const HOTSPOTS = [
  { x: 378, y: 209, name: 'ตู้หยอดเหรียญ' },
  { x: 512, y: 544, name: 'กระดานไวท์บอร์ด' },
  { x: 640, y: 128, name: 'ห้องนั่งเล่นพักผ่อน' },
  { x: 320, y: 640, name: 'โซนเก้าอี้ประชุม' },
];
