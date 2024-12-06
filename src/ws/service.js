class WSService {
  constructor(options) {
    // 确保单例模式
    if (WSService.instance) {
      return WSService.instance;
    }
    WSService.instance = this;

    const {
      wsUrl,
      onConnect,
      onClose,
      onError,
      onMessage,
      onMessageError,
    } = options || {};

    this.debug = options?.debug || false;

    this.$wsUrl = wsUrl?.replace?.('http', 'ws');
    this.$on = {
      close: onClose || (() => {}),
      error: onError || (() => {}),
      connect: onConnect || (() => {}),
      message: onMessage || (() => {}),
      messageError: onMessageError || (() => {}),
    };
    // 0: 未连接，1: 连接中，2: 已连接，-1: 已关闭
    this.connected = 0;
    this.ws = undefined;
    this.evt = (event) => {
      if (this.debug) {
        console.log('Message from server ', event.data);
      }
      try {
        const data = JSON.parse(event.data);
        this.$on.message(data, event);
      } catch (error) {
        console.error('socket message error', error);
        if (this.debug) {
          console.log('message', event.data);
        }
        this.$on.messageError(error, event);
      }
    };
  }

  get isConnected() {
    return this.connected === 2;
  }

  active() {
    if (this.connected !== 0) {
      console.warn('WebSocket connection already exists or is connecting');
      return;
    }
    
    // 标记为正在连接中
    this.connected = 1;
    
    // 创建 WebSocket 连接
    this.ws = new WebSocket(this.$wsUrl);
    this.ws.addEventListener('open', (event) => {
      if (this.debug) {
        console.log('socket connected', event);
      }
      this.connected = 2;
      this.$on.connect(event);
    });
    this.ws.addEventListener('close', (event) => {
      if (this.debug) {
        console.log('socket closed', event);
      }
      this.connected = -1;
      WSService.instance = null; // 清除实例引用
      this.$on.close(event);
    });
    this.ws.addEventListener('message', this.evt);
    this.ws.addEventListener('error', (event) => {
      console.error('ai-live-websocket error', event);
      this.$on.error(event);
    });
  }

  send(data) {
    this?.ws?.send?.(JSON.stringify(data));
  }

  close() {
    this.ws?.close?.();
  }
}

export default WSService;
