export default class ShareScreenManager {
  myStream?: MediaStream
  constructor(private userId: string) {}
  onOpen() {}
  onClose() {}
  startScreenShare() {}
  stopScreenShare() {}
  onUserJoined(userId: string) {}
  onUserLeft(userId: string) {}
}
