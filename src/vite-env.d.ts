/// <reference types="vite/client" />

declare module '*.png'
declare module 'peerjs' {
  namespace Peer {
    interface MediaConnection {
      close(): void;
      peer: string;
      answer(stream?: MediaStream): void;
      on(event: string, callback: (...args: any[]) => void): void;
    }
  }
  class Peer {
    constructor(id?: string, options?: any);
    on(event: string, callback: (...args: any[]) => void): void;
    disconnect(): void;
    reconnect(): void;
    disconnected: boolean;
  }
  export default Peer;
}
declare module 'emoji-mart'
declare module 'react-joystick-component'
declare module 'swiper/react'
declare module 'swiper'
