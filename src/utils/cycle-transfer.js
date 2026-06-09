import dayjs from 'dayjs';
import config from '@/config';
import request from '@/utils/request';

const STATUS_LEVELS = {
  over: 0,
  alert: 1,
  warning: 2,
  fine: 3,
  neutral: 4,
};

function normalizeText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function normalizeHeader(text) {
  return normalizeText(text).toLowerCase().replace(/[:：]/g, '').replace(/\s+/g, '');
}

function normalizeName(name) {
  return normalizeText(name);
}

function sortByRuleId(a, b) {
  const aId = Number(a.ruleId);
  const bId = Number(b.ruleId);
  const aIsNumber = !Number.isNaN(aId);
  const bIsNumber = !Number.isNaN(bId);

  if (aIsNumber && bIsNumber) {
    return aId - bId;
  }
  if (aIsNumber) {
    return -1;
  }
  if (bIsNumber) {
    return 1;
  }
  return String(a.ruleId).localeCompare(String(b.ruleId), 'zh-CN');
}

export function sortCycleTransferList(list) {
  return [...list].sort((a, b) => {
    const severity = STATUS_LEVELS[a.statusLevel] - STATUS_LEVELS[b.statusLevel];
    if (severity !== 0) {
      return severity;
    }
    return sortByRuleId(a, b);
  });
}

function resolveRelativeUrl(path) {
  const a = document.createElement('a');
  a.href = path;
  return a.href;
}

function getNezhaV0BaseUrl() {
  const { nezhaPath } = config.nazhua;
  if (nezhaPath.startsWith('http')) {
    return nezhaPath;
  }
  const a = document.createElement('a');
  if (nezhaPath === '/nezha/' && (import.meta.env.VITE_BASE_PATH && import.meta.env.VITE_BASE_PATH !== '/')) {
    [a.href] = window.location.href.split(import.meta.env.VITE_BASE_PATH);
  } else {
    a.href = nezhaPath;
  }
  return a.href;
}

export function getV0ServiceUrl() {
  const customPath = config.nazhua.v0ServicePath;
  if (customPath) {
    if (customPath.startsWith('http')) {
      return customPath;
    }
    if (customPath.startsWith('/')) {
      return resolveRelativeUrl(customPath);
    }
    return new URL(customPath, getNezhaV0BaseUrl()).toString();
  }

  const baseUrl = new URL(getNezhaV0BaseUrl(), window.location.href);
  const pathname = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`;
  baseUrl.pathname = `${pathname}service`;
  return baseUrl.toString();
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  let decimals = 2;
  if (value >= 100) {
    decimals = 0;
  } else if (value >= 10) {
    decimals = 1;
  }

  const formattedValue = value.toFixed(decimals)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0+$/, '$1');
  return `${formattedValue}${units[unitIndex]}`;
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  const date = dayjs(value);
  if (!date.isValid()) {
    return normalizeText(value);
  }
  return date.format('YYYY.MM.DD HH:mm:ss');
}

function getRemainingPercent(used, max) {
  if (!Number.isFinite(max) || max <= 0) {
    return null;
  }
  const percent = Number((100 - (used / max) * 100).toFixed(2));
  return Math.max(percent, 0);
}

export function getCycleTransferStatusLevel(remainingPercent) {
  if (!Number.isFinite(remainingPercent)) {
    return 'neutral';
  }
  if (remainingPercent === 0) {
    return 'over';
  }
  if (remainingPercent > 50) {
    return 'fine';
  }
  if (remainingPercent > 20) {
    return 'warning';
  }
  if (remainingPercent > 0) {
    return 'alert';
  }
  return 'over';
}

export function getCycleTransferStatusLabel(statusLevel) {
  switch (statusLevel) {
    case 'fine':
      return '充足';
    case 'warning':
      return '注意';
    case 'alert':
      return '告警';
    case 'over':
      return '超限';
    default:
      return '未设置上限';
  }
}

function buildCycleTransferItem(ruleId, stats, serverKey, usedValue) {
  const maxValue = Number(stats?.max ?? stats?.Max ?? 0);
  const minValue = Number(stats?.min ?? stats?.Min ?? 0);
  const remainingPercent = getRemainingPercent(usedValue, maxValue);
  return {
    ruleId,
    ruleName: stats?.name || stats?.Name || `规则 #${ruleId}`,
    serverKey: String(serverKey),
    periodStart: formatDateTime(stats?.from || stats?.From),
    periodEnd: formatDateTime(stats?.to || stats?.To),
    maxDisplay: formatBytes(maxValue),
    minDisplay: formatBytes(minValue),
    currentUsageDisplay: formatBytes(usedValue),
    remainingDisplay: maxValue > 0 ? formatBytes(Math.max(maxValue - usedValue, 0)) : '-',
    remainingPercent,
    nextCheckDisplay: formatDateTime(
      stats?.next_update?.[serverKey]
      || stats?.NextUpdate?.[serverKey],
    ),
    statusLevel: getCycleTransferStatusLevel(remainingPercent),
    source: 'v1',
  };
}

function normalizeV1CycleTransferMap(cycleTransferStats) {
  const byServerId = {};

  Object.entries(cycleTransferStats || {}).forEach(([ruleId, stats]) => {
    const transferMap = stats?.transfer || stats?.Transfer || {};
    Object.entries(transferMap).forEach(([serverId, usedRawValue]) => {
      const usedValue = Number(usedRawValue);
      if (!Number.isFinite(usedValue)) {
        return;
      }

      const serverKey = String(serverId);
      if (!byServerId[serverKey]) {
        byServerId[serverKey] = [];
      }
      byServerId[serverKey].push(buildCycleTransferItem(ruleId, stats, serverKey, usedValue));
    });
  });

  Object.keys(byServerId).forEach((serverId) => {
    byServerId[serverId] = sortCycleTransferList(byServerId[serverId]);
  });

  return byServerId;
}

function findCycleTransferTable(doc) {
  const tables = [...doc.querySelectorAll('table')];
  return tables.find((table) => {
    const headerRows = [...table.querySelectorAll('thead tr')];
    const lastHeaderRow = headerRows[headerRows.length - 1];
    if (!lastHeaderRow) {
      return false;
    }
    const headers = [...lastHeaderRow.querySelectorAll('th')].map((item) => normalizeHeader(item.textContent));
    return headers.length === 10 && headers[0] === 'id' && headers[5] === 'max' && headers[6] === 'min';
  });
}

function parseRemainingCell(text) {
  const normalized = normalizeText(text);
  const matched = normalized.match(/^(.*?)\s*\/\s*([0-9]+(?:\.[0-9]+)?)\s*%$/);
  if (matched) {
    return {
      remainingDisplay: normalizeText(matched[1]),
      remainingPercent: Number(matched[2]),
    };
  }

  const percentMatched = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
  if (!percentMatched) {
    return {
      remainingDisplay: normalized || '-',
      remainingPercent: null,
    };
  }

  const remainingDisplay = normalizeText(normalized.replace(percentMatched[0], '').replace(/\/$/, ''));
  return {
    remainingDisplay: remainingDisplay || '-',
    remainingPercent: Number(percentMatched[1]),
  };
}

export function parseV0CycleTransferHtmlToNameMap(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const table = findCycleTransferTable(doc);
  if (!table) {
    return {};
  }

  const rows = [...table.querySelectorAll('tbody tr')];
  const byServerName = {};

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll('td')].map((item) => normalizeText(item.textContent));
    if (cells.length < 10) {
      return;
    }

    const serverName = normalizeName(cells[2]);
    if (!serverName) {
      return;
    }

    const {
      remainingDisplay,
      remainingPercent,
    } = parseRemainingCell(cells[9]);

    if (!byServerName[serverName]) {
      byServerName[serverName] = [];
    }

    byServerName[serverName].push({
      ruleId: cells[0],
      ruleName: cells[1] || `规则 #${cells[0]}`,
      serverKey: serverName,
      periodStart: cells[3],
      periodEnd: cells[4],
      maxDisplay: cells[5] || '-',
      minDisplay: cells[6] || '-',
      currentUsageDisplay: cells[8] || '-',
      remainingDisplay,
      remainingPercent,
      nextCheckDisplay: cells[7] || '-',
      statusLevel: getCycleTransferStatusLevel(remainingPercent),
      source: 'v0',
    });
  });

  Object.keys(byServerName).forEach((serverName) => {
    byServerName[serverName] = sortCycleTransferList(byServerName[serverName]);
  });

  return byServerName;
}

export function parseV0CycleTransferHtml(html, serverName) {
  const nameMap = parseV0CycleTransferHtmlToNameMap(html);
  return nameMap[normalizeName(serverName)] || [];
}

function buildV0CycleTransferMap(serverList, byServerName) {
  const byServerId = {};

  (serverList || []).forEach((serverInfo) => {
    const serverId = String(serverInfo?.ID || '');
    const serverName = normalizeName(serverInfo?.Name);
    if (!serverId || !serverName || !byServerName[serverName]) {
      return;
    }
    byServerId[serverId] = [...byServerName[serverName]];
  });

  return byServerId;
}

function decorateCycleTransferSummary(summaryItem) {
  if (!summaryItem) {
    return null;
  }
  return {
    ...summaryItem,
    statusLabel: getCycleTransferStatusLabel(summaryItem.statusLevel),
    remainingPercentText: Number.isFinite(summaryItem.remainingPercent)
      ? `${summaryItem.remainingPercent.toFixed(2)}%`
      : '未设置上限',
  };
}

export function getCycleTransferSummary(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  return decorateCycleTransferSummary(list[0]);
}

export function getCycleTransferSummaryByServer(cycleTransferMap, serverInfo) {
  if (!serverInfo?.ID) {
    return null;
  }
  const serverId = String(serverInfo.ID);
  return getCycleTransferSummary(cycleTransferMap?.[serverId]);
}

async function loadV1CycleTransferMap() {
  const res = await request({
    url: config.nazhua.v1ApiServicePath,
    type: 'GET',
  });
  if (!res || res.status !== 200 || !res.data?.success) {
    return {};
  }

  const cycleTransferStats = res.data?.data?.cycle_transfer_stats || {};
  return normalizeV1CycleTransferMap(cycleTransferStats);
}

async function loadV0CycleTransferMap(serverList) {
  const res = await fetch(getV0ServiceUrl());
  if (!res.ok) {
    return {};
  }
  const html = await res.text();
  const byServerName = parseV0CycleTransferHtmlToNameMap(html);
  return buildV0CycleTransferMap(serverList, byServerName);
}

export async function loadCycleTransferMap(serverList = []) {
  if (config.nazhua.nezhaVersion === 'v1') {
    return loadV1CycleTransferMap();
  }
  return loadV0CycleTransferMap(serverList);
}

export async function loadCycleTransferByServer(serverInfo) {
  if (!serverInfo?.ID) {
    return [];
  }
  const cycleTransferMap = await loadCycleTransferMap([serverInfo]);
  return cycleTransferMap?.[String(serverInfo.ID)] || [];
}
