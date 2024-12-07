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
  loadSetting as loadNezhaV1Setting,
  loadProfile as loadNezhaV1Profile,
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
  profile: {},
  setting: {},
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
    SET_PROFILE(state, profile) {
      state.profile = profile;
    },
    SET_SETTING(state, setting) {
      state.setting = setting;
    },
  },
  actions: {
    /**
     * 加载服务器列表
     */
    async initServerInfo({ commit }, params) {
      firstSetServers = true;
      // 如果是v1版本的话，加载v1版本的数据
      if (config.nazhua.nezhaVersion === 'v1') {
        const {
          route,
        } = params || {};
        loadNezhaV1ServerGroup().then((res) => {
          if (res) {
            commit('SET_SERVER_GROUP', res);
          }
        });
        loadNezhaV1Setting().then((res) => {
          if (res) {
            commit('SET_SETTING', res);
            // 如果自定义配置没有设置title，使用站点名称
            if (!window.$$nazhuaConfig.title) {
              config.nazhua.title = res.site_name;
              if (route?.name === 'Home' || !route) {
                document.title = config.nazhua.title;
              }
            }
          }
        });
        loadNezhaV1Profile().then((res) => {
          if (res) {
            commit('SET_PROFILE', res);
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

            // 在v0没抓页面配置的情况下，从服务器列表中分离出标签列表
            if (config.nazhua.nezhaVersion !== 'v1') {
              const group = loadNezhaV0ServerGroup(servers);
              if (group) {
                commit('SET_SERVER_GROUP', group);
              }
            }
          } else {
            commit('UPDATE_SERVERS', servers);
          }
        }
      });
    },
  },
});

export default store;
