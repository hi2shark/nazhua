import config from '@/config';
import MessageSubscribe from '@/utils/subscribe';
import v1TransformV0 from '@/utils/transform-v1-2-v0';

import WSService from './service';

/**
 * 获取不同版本的WebSocket路径
 */
function getWsApiPath() {
  let url = config?.nazhua?.wsPath;
  if (config?.nazhua?.nezhaVersion === 'v1') {
    url = config?.nazhua?.v1WsPath;
  }
  const a = document.createElement('a');
  a.href = url;
  return a.href.replace(/^http/, 'ws');
}

const msg = new MessageSubscribe();
const wsService = new WSService({
  wsUrl: getWsApiPath(),
  onConnect: () => {
    msg.emit('connect');
  },
  onClose: () => {
    msg.emit('close');
  },
  onError: (error) => {
    msg.emit('error', error);
  },
  onMessage: (data) => {
    // 消息体包含.now和.servers 粗暴的判定为服务器列表项信息
    if (data?.now && data?.servers) {
      if (config.nazhua.nezhaVersion === 'v1') {
        msg.emit('servers', {
          now: data.now,
          servers: data?.servers?.map?.((server) => {
            const item = v1TransformV0(server);
            return item;
          }) || [],
        });
      } else {
        msg.emit('servers', data);
      }
    } else {
      msg.emit('message', data);
    }
  },
});

function restart() {
  if (wsService.connected !== 0) {
    wsService.close();
  }
  wsService.active();
}

export {
  wsService,
  msg,
  restart,
};

export default (actived) => {
  if (wsService.connected === 2) {
    if (actived) {
      actived();
    }
    return;
  }
  msg.once('connect', () => {
    if (actived) {
      actived();
    }
  });
  // 如果已经连接中，则不再连接
  if (wsService.connected === 1) {
    return;
  }
  wsService.active();
};
