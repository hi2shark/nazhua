/**
 * 服务器排序选项
 */
export const serverSortOptions = () => [{
  label: '排序值',
  value: 'DisplayIndex',
}, {
  label: '主机名称',
  value: 'Name',
}, {
  label: '国家地区',
  value: 'Host.CountryCode',
}, {
  label: '系统平台',
  value: 'Host.Platform',
}, {
  label: '在线时长',
  value: 'Host.BootTime',
}, {
  label: '入网速度',
  value: 'State.NetInSpeed',
}, {
  label: '出网速度',
  value: 'State.NetOutSpeed',
}, {
  label: '入网流量',
  value: 'State.NetInTransfer',
}, {
  label: '出网流量',
  value: 'State.NetOutTransfer',
}, {
  label: '合计流量',
  value: '$.TotalTransfer',
}, {
  label: 'TCP连接',
  value: 'State.TcpConnCount',
}, {
  label: 'UDP连接',
  value: 'State.UdpConnCount',
}, {
  label: '总连接数',
  value: '$.TotalConnCount',
}, {
  label: '1分钟负载',
  value: 'State.Load1',
}, {
  label: 'CPU占用',
  value: 'State.CPU',
}, {
  label: '核心数量',
  value: '$.CPU',
}, {
  label: '内存占用',
  value: 'State.MemUsed',
}, {
  label: '内存大小',
  value: 'Host.MemTotal',
}, {
  label: '交换占用',
  value: 'State.SwapUsed',
}, {
  label: '交换大小',
  value: 'Host.SwapTotal',
}, {
  label: '硬盘占用',
  value: 'State.DiskUsed',
}, {
  label: '硬盘大小',
  value: 'Host.DiskTotal',
}];

/**
 * 服务器排序处理
 */
export function serverSortHandler(a, b, sortby, order) {
  let aValue;
  let bValue;
  const hasDot = sortby.includes('.');
  if (!hasDot) {
    aValue = a[sortby];
    bValue = b[sortby];
  } else {
    const [sortby1, sortby2] = sortby.split('.');
    if (sortby1 !== '$') {
      switch (sortby2) {
        case 'BootTime':
        {
          const currentTime = Date.now();
          aValue = currentTime - a.Host.BootTime * 1000;
          bValue = currentTime - b.Host.BootTime * 1000;
          break;
        }
        default:
        {
          aValue = a[sortby1][sortby2];
          bValue = b[sortby1][sortby2];
          break;
        }
      }
    } else {
      switch (sortby2) {
        case 'TotalTransfer':
        {
          aValue = a.State.NetInTransfer + a.State.NetOutTransfer;
          bValue = b.State.NetInTransfer + b.State.NetOutTransfer;
          break;
        }
        case 'TotalConnCount':
        {
          aValue = a.State.TcpConnCount + a.State.UdpConnCount;
          bValue = b.State.TcpConnCount + b.State.UdpConnCount;
          break;
        }
        case 'CPU':
        {
          aValue = a.Host.CPU.length;
          bValue = b.Host.CPU.length;
          break;
        }
        default:
      }
    }
  }
  if (order === 'desc') {
    return bValue - aValue;
  }
  return aValue - bValue;
}
