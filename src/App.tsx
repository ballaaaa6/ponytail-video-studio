import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TermIcon, 
  Send, 
  Video, 
  MessageSquare, 
  Activity, 
  Sparkles,
  Layers,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

// Types
interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'idle' | 'working' | 'waiting' | 'error';
  statusText: string;
  color: string;
  department: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent-producer' | 'agent-artist' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

interface VideoScene {
  id: number;
  script: string;
  visualPrompt: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  visualUrl?: string;
}

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'office' | 'terminal' | 'settings'>('office');
  const [inputText, setInputText] = useState('');
  
  // Simulated Agents
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-producer',
      name: 'Agent Somsak',
      role: 'Video Producer & Director',
      avatar: '👨‍💼',
      status: 'idle',
      statusText: 'Ready to receive video production orders',
      color: '#00f2fe',
      department: 'Management'
    },
    {
      id: 'agent-artist',
      name: 'Agent Somri',
      role: 'Prompt Artist & Image Director',
      avatar: '👩‍🎨',
      status: 'idle',
      statusText: 'Standing by to generate scene prompts',
      color: '#f35588',
      department: 'Art Dept'
    }
  ]);

  // Simulated Chat
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'system',
      senderName: 'System',
      text: 'ANTIGRAVITY OS v1.0 initialized. Connect to local-worker: ONLINE.',
      timestamp: '08:00'
    },
    {
      id: '2',
      sender: 'agent-producer',
      senderName: 'Agent Somsak',
      text: 'สวัสดีครับบอส! ผมสมศักดิ์เป็นโปรดิวเซอร์ วันนี้อยากให้ผมผลิตวิดีโอหัวข้ออะไรดีครับ? สั่งผมที่ช่องแชทด้านล่างนี้ได้เลยนะครับ',
      timestamp: '08:01'
    }
  ]);

  // Video Generation Simulation State
  const [videoTopic, setVideoTopic] = useState('');
  const [currentStep, setCurrentStep] = useState<'idle' | 'writing' | 'generating_images' | 'rendering' | 'completed'>('idle');
  const [scenes, setScenes] = useState<VideoScene[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate Agent Workflows
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: 'You (Boss)',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const command = inputText.toLowerCase();
    setInputText('');

    // Trigger simulation if commanding to make video
    if (command.includes('ทำคลิป') || command.includes('สร้างคลิป') || command.includes('video')) {
      const topic = command.replace(/(ทำคลิป|สร้างคลิป|video|เรื่อง|หัวข้อ)/g, '').trim() || 'ความลับของอวกาศ';
      startVideoPipelineSimulation(topic);
    } else {
      // General Producer Reply
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'agent-producer',
          senderName: 'Agent Somsak',
          text: `รับทราบครับบอส! แต่ตอนนี้ระบบจำลองคำสั่งทำวิดีโอเป็นหลักอยู่ บอสลองพิมสั่งผมว่า "ทำคลิปเรื่อง [หัวข้อที่ต้องการ]" ได้เลยนะครับ เดี๋ยวผมกับสมศรีจะรีบจัดแจงให้ชมครับ!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    }
  };

  const startVideoPipelineSimulation = (topic: string) => {
    setVideoTopic(topic);
    setCurrentStep('writing');
    
    // Update Agent Somsak (Producer) Status
    setAgents(prev => prev.map(a => a.id === 'agent-producer' ? { ...a, status: 'working', statusText: `กำลังเขียนบทและจัดโครงสร้างวิดีโอเรื่อง: ${topic}` } : a));

    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'agent-producer',
      senderName: 'Agent Somsak',
      text: `รับออเดอร์ทำคลิปเรื่อง "${topic}" ครับบอส! เดี๋ยวผมจะเริ่มเขียนสคริปต์แยกออกเป็น 3 ฉากหลักก่อนนะครับ`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Step 1: Writing Script (Takes 3 seconds)
    setTimeout(() => {
      const draftScenes: VideoScene[] = [
        { id: 1, script: `นี่คือฉากแรก: เริ่มต้นเรื่องราวอันน่าค้นหาของ ${topic}`, visualPrompt: `A cinematic shot representing the beginning of ${topic}, neon cyberpunk lighting, 8k resolution`, status: 'pending' },
        { id: 2, script: `ฉากที่สอง: เจาะลึกความจริงและข้อมูลสำคัญเกี่ยวกับ ${topic}`, visualPrompt: `An abstract rendering showing the core concepts of ${topic}, highly detailed, digital art style`, status: 'pending' },
        { id: 3, script: `ฉากที่สาม: บทสรุปและสิ่งที่เราควรได้เรียนรู้จากเรื่องนี้`, visualPrompt: `A beautiful and clean ending scene, motivational atmosphere, soft lighting, award winning cinematography`, status: 'pending' }
      ];
      setScenes(draftScenes);
      setCurrentStep('generating_images');
      
      // Update Somsak to Waiting, Somri (Artist) to Working
      setAgents(prev => prev.map(a => {
        if (a.id === 'agent-producer') return { ...a, status: 'waiting', statusText: 'รอสมศรีสร้างภาพและคุมโทนสีภาพประกอบแต่ละฉาก' };
        if (a.id === 'agent-artist') return { ...a, status: 'working', statusText: 'กำลังออกแบบ prompt และสร้างภาพประกอบให้เข้ากับอารมณ์คลิป' };
        return a;
      }));

      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'agent-artist',
        senderName: 'Agent Somri',
        text: `สคริปต์ของพี่สมศักดิ์ส่งมาถึงหนูแล้วค่ะ! หนูกำลังเขียน Prompt และเริ่มส่งบอทไปเจนภาพสวยๆ ออกมาทีละฉากนะคะบอส`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      // Simulate Image Generation scene-by-scene
      simulateImageGeneration(0, draftScenes);

    }, 3000);
  };

  const simulateImageGeneration = (index: number, currentScenes: VideoScene[]) => {
    if (index >= currentScenes.length) {
      // Transition to rendering phase
      setCurrentStep('rendering');
      setAgents(prev => prev.map(a => {
        if (a.id === 'agent-producer') return { ...a, status: 'working', statusText: 'กำลังตัดต่อเสียงพากย์และวิดีโอเข้าด้วยกันด้วย FFmpeg' };
        if (a.id === 'agent-artist') return { ...a, status: 'idle', statusText: 'ส่งมอบงานสร้างภาพเสร็จเรียบร้อยแล้วค่ะ' };
        return a;
      }));

      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'agent-producer',
        senderName: 'Agent Somsak',
        text: `สมศรีส่งมอบภาพประกอบครบถ้วนแล้วครับ! ขั้นตอนสุดท้าย ผมกำลังส่งคำสั่งไปให้ local-worker รันเครื่องอ่านเสียงพากย์ Voicertool และตัดต่อรวมวิดีโอด้วย FFmpeg ครับ`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      // Simulate final rendering
      setTimeout(() => {
        setCurrentStep('completed');
        setAgents(prev => prev.map(a => ({ ...a, status: 'idle', statusText: 'งานเสร็จแล้ว พร้อมรับคำสั่งรอบถัดไป' })));
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'system',
          senderName: 'System',
          text: `SUCCESS: Video render complete. Uploaded to YouTube Sandbox successfully! Output file: runs/video_${Date.now()}.mp4`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 4000);
      return;
    }

    // Set current scene to generating
    setScenes(prev => prev.map((s, idx) => idx === index ? { ...s, status: 'generating' } : s));

    setTimeout(() => {
      // Complete current scene
      setScenes(prev => prev.map((s, idx) => idx === index ? { 
        ...s, 
        status: 'completed',
        visualUrl: `https://images.unsplash.com/photo-${index === 0 ? '1451187580459-43490279c0fa' : index === 1 ? '1506744038136-46273834b3fb' : '1518531933037-91b2f5f229cc'}?w=400&auto=format&fit=crop&q=80`
      } : s));

      // Go to next scene
      simulateImageGeneration(index + 1, currentScenes);
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px', gap: '16px' }}>
      
      {/* 👑 Top Navigation Bar */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#050508' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px' }}>ANTIGRAVITY OS</h1>
            <p style={{ fontSize: '11px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px var(--success)' }}></span>
              HQ WAR ROOM - LOCAL-WORKER ONLINE
            </p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('office')} className={`glass-button ${activeTab === 'office' ? 'active' : ''}`}>
            <Layers size={16} /> HQ Office
          </button>
          <button onClick={() => setActiveTab('terminal')} className={`glass-button ${activeTab === 'terminal' ? 'active' : ''}`}>
            <TermIcon size={16} /> Console Log
          </button>
        </nav>
      </header>

      {/* 🚀 Main Workspace Area */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0 }}>
        
        {activeTab === 'office' ? (
          <>
            {/* Left Panel: The Interactive War Room Grid (The Office Floor) */}
            <main className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600 }}>HQ Office Floor</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>โต๊ะทำงานของหัวหน้าทีมพนักงาน AI ในห้องบัญชาการหลัก</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span> Idle</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></span> Working</span>
                </div>
              </div>

              {/* Grid of Agent Desks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {agents.map(agent => (
                  <div key={agent.id} className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${agent.color}` }}>
                    
                    {/* Glowing effect when working */}
                    {agent.status === 'working' && (
                      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: `radial-gradient(circle at 90% 10%, rgba(0, 242, 254, 0.1) 0%, transparent 70%)`, pointerEvents: 'none' }}></div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '32px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        {agent.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{agent.name}</h3>
                        <p style={{ fontSize: '12px', color: agent.color, fontWeight: 500 }}>{agent.role}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Dept: {agent.department}</p>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {agent.status === 'working' ? (
                        <RefreshCw size={16} className="spin-animation" style={{ color: 'var(--primary)' }} />
                      ) : agent.status === 'waiting' ? (
                        <Activity size={16} style={{ color: 'var(--warning)' }} />
                      ) : (
                        <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                      )}
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <strong>สถานะ:</strong> {agent.statusText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Video Production Blackboard / Timeline Display */}
              {currentStep !== 'idle' && (
                <div className="glass-panel" style={{ marginTop: 'auto', padding: '20px', border: '1px dashed var(--primary-glow)', background: 'rgba(0, 242, 254, 0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={18} style={{ color: 'var(--primary)' }} />
                      <h3 style={{ fontSize: '14px', fontWeight: 600 }}>กระดานดำควบคุมคิวการผลิต (Live Production Timeline)</h3>
                    </div>
                    <span style={{ fontSize: '11px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                      Step: {currentStep.toUpperCase()}
                    </span>
                  </div>

                  {/* Scene Timelines */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {scenes.map(scene => (
                      <div key={scene.id} className="glass-panel" style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>SCENE {scene.id}</span>
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontWeight: 600,
                            background: scene.status === 'completed' ? 'rgba(0, 230, 118, 0.1)' : scene.status === 'generating' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: scene.status === 'completed' ? 'var(--success)' : scene.status === 'generating' ? 'var(--primary)' : 'var(--text-secondary)'
                          }}>
                            {scene.status.toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Image Preview Area */}
                        <div style={{ height: '100px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)', marginBottom: '8px' }}>
                          {scene.status === 'completed' && scene.visualUrl ? (
                            <img src={scene.visualUrl} alt={`Scene ${scene.id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : scene.status === 'generating' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <RefreshCw size={20} className="spin-animation" style={{ color: 'var(--primary)' }} />
                              <span style={{ fontSize: '10px', color: 'var(--primary)' }}>กำลังเจนภาพประกอบ...</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>รอคิวเจนภาพ</span>
                          )}
                        </div>

                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', height: '34px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scene.script}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* Right Panel: Integrated Chat Command Center */}
            <aside className="glass-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
                  Command Chat (ช่องสั่งงาน)
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>สั่งงานพนักงาน AI ทุกคนได้ตรงนี้ หรือจำลองสลับสั่งงานได้</p>
              </div>

              {/* Messages viewport */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                {chatMessages.map(msg => (
                  <div key={msg.id} style={{ 
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', padding: '0 4px' }}>
                      {msg.senderName} • {msg.timestamp}
                    </span>
                    <div style={{ 
                      padding: '10px 14px', 
                      borderRadius: '14px', 
                      fontSize: '13px',
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' : msg.sender === 'system' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.05)',
                      color: msg.sender === 'user' ? '#050508' : 'var(--text-primary)',
                      border: msg.sender === 'system' ? '1px dashed var(--border-glass)' : '1px solid var(--border-glass)',
                      fontWeight: msg.sender === 'user' ? 500 : 400
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='ลองพิมพ์ "ทำคลิปเรื่อง ท่องเที่ยวญี่ปุ่น"' 
                  className="glass-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="glass-button active" style={{ padding: '12px' }}>
                  <Send size={16} />
                </button>
              </form>
            </aside>
          </>
        ) : (
          /* Terminal Tab View */
          <main className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#050508', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '12px', color: 'var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TermIcon size={18} />
                <span>ANTIGRAVITY OS CONSOLE (LOG MONITOR)</span>
              </div>
              <span style={{ fontSize: '12px' }}>SYSTEM STATE: RUNNING</span>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#c5c6c7' }}>
              <p style={{ color: 'var(--text-muted)' }}>[2026-06-19 08:00:01] System boot sequence started...</p>
              <p style={{ color: 'var(--success)' }}>[2026-06-19 08:00:02] Loading custom skills: Ponytail Dev loaded.</p>
              <p style={{ color: 'var(--success)' }}>[2026-06-19 08:00:02] Hooking Git status monitor: Active.</p>
              <p>[2026-06-19 08:00:03] Binding Local Worker connection via WebSocket on ws://localhost:8787</p>
              <p style={{ color: 'var(--warning)' }}>[2026-06-19 08:00:04] Waiting for local-worker process connection...</p>
              <p style={{ color: 'var(--success)' }}>[2026-06-19 08:00:05] Connected! Handshake code: local_worker_v1.0.1</p>
              
              {currentStep !== 'idle' && (
                <>
                  <p style={{ color: 'var(--primary)' }}>[2026-06-19 08:10:12] [PIPELINE] New Video creation job received: "{videoTopic}"</p>
                  <p>[2026-06-19 08:10:13] [PRODUCER] Commencing script writing. Requesting LLM tokens...</p>
                  {scenes.length > 0 && (
                    <>
                      <p style={{ color: 'var(--success)' }}>[2026-06-19 08:10:15] [PRODUCER] Draft complete. Sent to ARTIST.</p>
                      {scenes.map(s => (
                        <p key={s.id}>
                          [2026-06-19 08:10:16] [ARTIST] Scene {s.id} Prompt: "{s.visualPrompt}" - Status: {s.status}
                        </p>
                      ))}
                    </>
                  )}
                  {currentStep === 'rendering' && (
                    <p style={{ color: 'var(--warning)' }}>[2026-06-19 08:11:05] [SYSTEM] Video rendering triggered on Local Server via FFmpeg...</p>
                  )}
                  {currentStep === 'completed' && (
                    <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>[2026-06-19 08:11:20] [SYSTEM] Task execution succeeded. 100% components completed.</p>
                  )}
                </>
              )}
            </div>
          </main>
        )}

      </div>

      {/* Embedded Animations using style tag */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 2s linear infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
