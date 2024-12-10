/**
 * V1版数据加载
 */
import store from '@/store';
import { Mapping } from '@/utils/object-mapping';

/**
 * 字段映射
 */
export const SERVER_FIELD_MAPS = {
  ID: 'id',
  CreatedAt: undefined,
  UpdatedAt: undefined,
  DeletedAt: undefined,
  Name: 'name',
  Tag: '_$function|queryGroup|id',
  DisplayIndex: 'display_index',
  HideForGuest: undefined,
  EnableDDNS: undefined,
  Host: '_$mapping|HOST_FIELD_MAPS',
  State: '_$mapping|STATE_FIELD_MAPS',
  LastActive: 'last_active',
};
export const HOST_FIELD_MAPS = {
  Platform: 'host.platform',
  PlatformVersion: 'host.platform_version',
  CPU: 'host.cpu',
  MemTotal: 'host.mem_total',
  DiskTotal: 'host.disk_total',
  SwapTotal: 'host.swap_total',
  Arch: 'host.arch',
  Virtualization: 'host.virtualization',
  BootTime: 'host.boot_time',
  CountryCode: 'country_code',
  Version: 'host.version',
  GPU: 'host.gpu',
};
export const STATE_FIELD_MAPS = {
  CPU: 'state.cpu',
  MemUsed: 'state.mem_used',
  SwapUsed: 'state.swap_used',
  DiskUsed: 'state.disk_used',
  NetInTransfer: 'state.net_in_transfer',
  NetOutTransfer: 'state.net_out_transfer',
  NetInSpeed: 'state.net_in_speed',
  NetOutSpeed: 'state.net_out_speed',
  Uptime: 'state.uptime',
  Load1: 'state.load_1',
  Load5: 'state.load_5',
  Load15: 'state.load_15',
  TcpConnCount: 'state.tcp_conn_count',
  UdpConnCount: 'state.udp_conn_count',
  ProcessCount: 'state.process_count',
  Temperatures: 'state.temperatures',
  GPU: 'state.gpu',
};

/**
 * 魔法方法
 */
const magics = {
  HOST_FIELD_MAPS,
  STATE_FIELD_MAPS,
  queryGroup: (id) => {
    const groupItem = store.state.serverGroup?.find?.((i) => {
      if (i.servers) {
        return i.servers.includes(id);
      }
      return false;
    });
    return groupItem?.name;
  },
};

/**
 * 处理V1版数据
 * @param {Object} v1Data V1版数据
 * @return {Object} V0版数据
 */
export default function (v1Data) {
  const v0Data = {};
  Object.keys(SERVER_FIELD_MAPS).forEach((key) => {
    if (SERVER_FIELD_MAPS[key] === undefined) {
      return;
    }
    if (SERVER_FIELD_MAPS[key].includes('_$')) {
      const $magic = SERVER_FIELD_MAPS[key].split('|');
      switch ($magic[0]) {
        case '_$function':
          if ($magic.length >= 3 && magics[$magic[1]]) {
            v0Data[key] = magics[$magic[1]](
              Mapping.mapping(v1Data, $magic[2]),
            );
          } else {
            v0Data[key] = undefined;
          }
          break;
        case '_$mapping':
          v0Data[key] = Mapping.each(magics[$magic[1]], v1Data);
          break;
        default:
          break;
      }
      return;
    }
    v0Data[key] = Mapping.mapping(v1Data, SERVER_FIELD_MAPS[key]);
  });
  if (v1Data.public_note) {
    try {
      v0Data.PublicNote = JSON.parse(v1Data.public_note);
    } catch (e) {
      v1Data.PublicNote = null;
    }
  } else {
    v1Data.PublicNote = null;
  }
  return v0Data;
}
