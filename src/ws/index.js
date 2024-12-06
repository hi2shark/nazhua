import config from '@/config';
import MessageSubscribe from '@/utils/subscribe';
import {
  handelV1toV0,
} from '@/utils/load-nezha-v1-config';
import WSService from './service';

function getWsApiPath() {
  if (config.nazhua.nezhaVersion === 'v1') {
    return config.nazhua.v1WsPath;
  }
  return config.nazhua.wsPath;
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
    if (data?.now) {
      if (config.nazhua.nezhaVersion === 'v1') {
        msg.emit('servers', {
          now: data.now,
          servers: data?.servers?.map?.((server) => {
            const item = handelV1toV0(server);
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
  // console.log('wsService active');
  if (wsService.connected === 1) {
    if (actived) {
      actived();
    }
    return;
  }
  wsService.active();
  msg.once('connect', () => {
    if (actived) {
      actived();
    }
  });
};
