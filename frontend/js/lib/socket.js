export class SocketConnection {
  constructor() {
    this.socket = new WebSocket("ws://localhost:8765");
  }

  onOpen(callback) {
    this.socket.onopen = callback;
  }

  onMessage(callback) {
    this.socket.onmessage = callback;
  }

  onClose(callback) {
    this.socket.onclose = callback;
  }

  onError(callback) {
    this.socket.onerror = callback;
  }

  send(data) {
    this.socket.send(data);
  }
}
