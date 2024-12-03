import {
  createStore,
} from 'vuex';
import dayjs from 'dayjs';
import loadNezhaConfig from '@/utils/load-nezha-config';

import {
  msg,
} from '@/ws';

const defaultState = () => ({
  init: false,
  serverList: [],
  serverCount: {
    total: 0,
    online: 0,
    offline: 0,
  },
});

function isOnline(LastActive) {
  const lastActiveTime = dayjs(LastActive)?.valueOf?.() || 0;
  if (Date.now() - lastActiveTime > 10 * 1000) {
    return -1;
  }
  return 1;
}

function handleServerCount(servers) {
  const counts = {
    total: servers.length,
    online: servers.filter((i) => i.online === 1).length,
    offline: servers.filter((i) => i.online === -1).length,
  };
  return counts;
}

const store = createStore({
  state: defaultState(),
  mutations: {
    SET_SERVERS(state, servers) {
      const newServers = [...servers];
      newServers.sort((a, b) => b.DisplayIndex - a.DisplayIndex);
      state.serverList = newServers;
      state.serverCount = handleServerCount(newServers);
      state.init = true;
    },
    UPDATE_SERVERS(state, servers) {
      // 遍历新的servers 处理新的内容
      const oldServersMap = {};
      state.serverList.forEach((server) => {
        oldServersMap[server.ID] = server;
      });
      let newServers = servers.map((server) => {
        const oldItem = oldServersMap[server.ID];
        const serverItem = {
          ...server,
        };
        if (oldItem?.PublicNote) {
          serverItem.PublicNote = oldItem.PublicNote;
        } else {
          serverItem.PublicNote = {};
        }
        return serverItem;
      });
      newServers = newServers.filter((server) => server);
      newServers.sort((a, b) => b.DisplayIndex - a.DisplayIndex);
      state.serverList = newServers;
      state.serverCount = handleServerCount(newServers);
      state.init = true;
    },
  },
  actions: {
    /**
     * 加载服务器列表
     */
    async loadServers({ commit }) {
      const serverConfig = await loadNezhaConfig();
      if (!serverConfig) {
        console.error('load server config failed');
        return;
      }
      const servers = serverConfig.map((i) => {
        const item = {
          ...i,
          online: isOnline(i.LastActive),
        };
        return item;
      });
      commit('SET_SERVERS', servers);
    },
    /**
     * 开始监听ws消息
     */
    watchWsMsg({
      commit,
    }) {
      msg.on('servers', (res) => {
        if (res) {
          const servers = res.map((i) => {
            const item = {
              ...i,
              online: isOnline(i.LastActive),
            };
            return item;
          });
          commit('UPDATE_SERVERS', servers);
        }
      });
    },
  },
});

export default store;
