import config from '@/config';
import MessageSubscribe from '@/utils/subscribe';
import WSService from './service';

const msg = new MessageSubscribe();
const wsService = new WSService({
  wsUrl: config?.nazhua?.wsPath,
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
      msg.emit('servers', data);
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
