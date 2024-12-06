import {
  createStore,
} from 'vuex';
import dayjs from 'dayjs';
import config from '@/config';
import loadNezhaV0Config, {
  loadServerGroup as loadNezhaV0ServerGroup,
} from '@/utils/load-nezha-v0-config';
import {
  loadServerGroup as loadNezhaV1ServerGroup,
} from '@/utils/load-nezha-v1-config';

import {
  msg,
} from '@/ws';

const defaultState = () => ({
  init: false,
  serverGroup: [],
  serverList: [],
  serverCount: {
    total: 0,
    online: 0,
    offline: 0,
  },
});

function isOnline(LastActive, currentTime = Date.now()) {
  const lastActiveTime = dayjs(LastActive)?.valueOf?.() || 0;
  if (currentTime - lastActiveTime > 10 * 1000) {
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

let firstSetServers = true;
const store = createStore({
  state: defaultState(),
  mutations: {
    SET_SERVER_GROUP(state, serverGroup) {
      state.serverGroup = serverGroup;
    },
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
    async initServerInfo({ commit }) {
      firstSetServers = true;
      // 如果是v1版本的话，加载v1版本的数据
      if (config.nazhua.nezhaVersion === 'v1') {
        loadNezhaV1ServerGroup().then((res) => {
          if (res) {
            commit('SET_SERVER_GROUP', res);
          }
        });
        return;
      }
      // 如果是v0版本的话，加载v0版本的数据
      // 加载初始化的服务器列表，需要其中的公开备注字段
      const serverResult = await loadNezhaV0Config();
      if (!serverResult) {
        console.error('load server config failed');
        return;
      }
      const servers = serverResult.servers?.map?.((i) => {
        const item = {
          ...i,
          online: isOnline(i.LastActive, serverResult.now),
        };
        return item;
      }) || [];
      const res = loadNezhaV0ServerGroup(servers);
      if (res) {
        commit('SET_SERVER_GROUP', res);
      }
      firstSetServers = false;
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
          const servers = res.servers?.map?.((i) => {
            const item = {
              ...i,
              online: isOnline(i.LastActive, res.now),
            };
            return item;
          }) || [];
          if (firstSetServers) {
            firstSetServers = false;
            commit('SET_SERVERS', servers);
          } else {
            commit('UPDATE_SERVERS', servers);
          }
        }
      });
    },
  },
});

export default store;
