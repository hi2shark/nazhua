class WSService {
  constructor(options) {
    const {
      wsUrl,
      onConnect,
      onClose,
      onError,
      onMessage,
      onMessageError,
    } = options || {};

    this.debug = options?.debug || false;

    if (!wsUrl.startsWith('ws')) {
      throw new Error('WebSocket URL must start with ws:// or wss://');
    }
    this.$wsUrl = wsUrl;
    this.$on = {
      close: onClose || (() => {}),
      error: onError || (() => {}),
      connect: onConnect || (() => {}),
      message: onMessage || (() => {}),
      messageError: onMessageError || (() => {}),
    };

    // 单例模式 遇到重复的ws服务，不再允许建立新的ws消息处理，如果遇到问题，等待用户自行刷新页面（破罐子破摔解决方法）
    if (WSService.instance) {
      // 抛出错误，防止重复创建 WebSocket 连接
      this.$on.error(new Error('WebSocket connection already exists'));
      return;
    }

    WSService.instance = this;
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
    // 如果已经连接中或已连接，则不再连接
    if (this.connected > 0) {
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
      console.log('socket error', event);
      WSService.instance = null; // 清除实例引用
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
