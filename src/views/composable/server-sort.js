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

const sortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

function isEmptySortValue(value) {
  return value === undefined || value === null || value === '';
}

function getNumberValue(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getServerSortValue(server, sortby, currentTime) {
  if (!sortby) {
    return null;
  }

  const hasDot = sortby.includes('.');
  if (!hasDot) {
    return server?.[sortby];
  }

  const [sortby1, sortby2] = sortby.split('.');
  if (sortby1 !== '$') {
    switch (sortby2) {
      case 'BootTime':
      {
        const bootTime = getNumberValue(server?.Host?.BootTime);
        return bootTime === null ? null : currentTime - (bootTime * 1000);
      }
      default:
        return server?.[sortby1]?.[sortby2];
    }
  }

  switch (sortby2) {
    case 'TotalTransfer':
    {
      const netInTransfer = getNumberValue(server?.State?.NetInTransfer);
      const netOutTransfer = getNumberValue(server?.State?.NetOutTransfer);
      if (netInTransfer === null || netOutTransfer === null) {
        return null;
      }
      return netInTransfer + netOutTransfer;
    }
    case 'TotalConnCount':
    {
      const tcpConnCount = getNumberValue(server?.State?.TcpConnCount);
      const udpConnCount = getNumberValue(server?.State?.UdpConnCount);
      if (tcpConnCount === null || udpConnCount === null) {
        return null;
      }
      return tcpConnCount + udpConnCount;
    }
    case 'CPU':
    {
      const cpu = server?.Host?.CPU;
      if (Array.isArray(cpu) || typeof cpu === 'string') {
        return cpu.length;
      }
      return getNumberValue(cpu);
    }
    default:
      return null;
  }
}

function compareServerSortValue(aValue, bValue, order) {
  const aValueIsEmpty = isEmptySortValue(aValue);
  const bValueIsEmpty = isEmptySortValue(bValue);
  if (aValueIsEmpty && bValueIsEmpty) {
    return 0;
  }
  if (aValueIsEmpty) {
    return 1;
  }
  if (bValueIsEmpty) {
    return -1;
  }

  const direction = order === 'desc' ? -1 : 1;
  const aNumberValue = getNumberValue(aValue);
  const bNumberValue = getNumberValue(bValue);

  if (aNumberValue !== null && bNumberValue !== null) {
    return (aNumberValue - bNumberValue) * direction;
  }

  return sortCollator.compare(String(aValue), String(bValue)) * direction;
}

/**
 * 服务器排序处理
 */
export function serverSortHandler(a, b, sortby, order) {
  const currentTime = Date.now();
  const aValue = getServerSortValue(a, sortby, currentTime);
  const bValue = getServerSortValue(b, sortby, currentTime);
  return compareServerSortValue(aValue, bValue, order);
}
