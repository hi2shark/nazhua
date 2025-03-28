/**
 * 主机匹配信息工具
 */

/**
 * 匹配CPU信息
 * @param {string} text CPU信息文本
 *  示例文本：
 *  Intel(R) Xeon(R) Platinum 2 Virtual Core
 *  Intel Core Processor (Broadwell, IBRS) 1 Virtual Core
 *  Intel(R) Xeon(R) Gold 6133 CPU @ 2.50GHz 1 Virtual Core
 *  Intel(R) Xeon(R) CPU E5-2697 v3 @ 2.60GHz 1 Virtual Core
 *  Intel(R) Xeon(R) Platinum 1 Virtual Core
 *  AMD EPYC 7B13 64-Core Processor 1 Virtual Core
 *  AMD EPYC 7B13 64-Core Processor 1 Virtual Core
 *  AMD EPYC 9654 96-Core Processor 1 Virtual Core
 *  AMD Ryzen 9 7950X 16-Core Processor 1 Virtual Core
 *  AMD Ryzen 9 9900X 12-Core Processor 1 Virtual Core
 *
 * @returns {object} 匹配结果
 *  - {string} company CPU厂商
 *  - {string} model CPU型号
 *  - {string} modelNum CPU型号编号
 *  - {string} core CPU核心信息
 *  - {string} cores CPU核心数
 */
export function getCPUInfo(text = '') {
  const cpuInfo = {
    company: '',
    model: '',
    modelNum: '',
    core: '',
    cores: '',
  };
  const companyReg = /Intel|AMD|ARM|Qualcomm|Apple|Samsung|IBM|NVIDIA/;
  // eslint-disable-next-line max-len, vue/max-len
  const modelReg = /Xeon|Threadripper|Athlon|Pentium|Celeron|Opteron|Phenom|Turion|Sempron|FX|A-Series|R-Series|EPYC|Ryzen/;
  const coresReg = /(\d+) (Virtual|Physics|Physical) Core/;
  const companyMatch = text.match(companyReg);
  const modelMatch = text.match(modelReg);
  const coresMatch = text.match(coresReg);
  if (companyMatch) {
    [cpuInfo.company] = companyMatch;
  }
  if (modelMatch) {
    [cpuInfo.model] = modelMatch;
  }
  if (text.includes('Ryzen')) {
    // 匹配各种Ryzen型号：
    // - 标准型号: 5900X, 5950X, 7900X, 7950X, 9900X, 9950X
    // - 普通型号: 3600, 5600, 7600
    // - G系列APU: 5700G, 3400G
    // - XT系列: 3600XT, 5600XT
    // - 移动版: 4800U, 5800H, 6800HS
    const modelNumReg = /Ryzen\s*(?:\d|(?:TR))\s*(?:\d{4}(?:[A-Z]{1,2})?)/;
    const modelNumMatch = text.match(modelNumReg);
    if (modelNumMatch) {
      cpuInfo.modelNum = modelNumMatch[0].replace(/Ryzen\s*(?:\d|(?:TR))\s*/, '');
    } else {
      // 备用正则表达式，尝试匹配其他可能的格式
      const altModelNumReg = /Ryzen.*?(\d{3,4}(?:[A-Z]{0,2}))/;
      const altModelNumMatch = text.match(altModelNumReg);
      if (altModelNumMatch) {
        [, cpuInfo.modelNum] = altModelNumMatch;
      }
    }
  }
  if (text.includes('EPYC')) {
    // 匹配各种EPYC型号：
    // - 第一代: 7001系列 (7351, 7551, 7601)
    // - 第二代: 7002系列 (7252, 7542, 7742)
    // - 第三代: 7003系列 (7313, 7543, 7763)
    // - 第四代: 9004系列 (9124, 9354, 9654)
    // - 特殊系列: 7Fxx, 7Hxx, 7Bxx (7F72, 7H12, 7B13)
    const modelNumReg = /EPYC\s+(\d[A-Z0-9]{2,4})/i;
    const modelNumMatch = text.match(modelNumReg);
    if (modelNumMatch) {
      [, cpuInfo.modelNum] = modelNumMatch;
    } else {
      // 备用匹配，处理可能的其他格式
      const altModelNumReg = /EPYC.*?(\d{4,5}[A-Z]?)/i;
      const altModelNumMatch = text.match(altModelNumReg);
      if (altModelNumMatch) {
        [, cpuInfo.modelNum] = altModelNumMatch;
      }
    }
  }
  // 匹配特定的CPU型号编号
  if (text.includes('Xeon')) {
    // 匹配所有Xeon处理器系列
    // - E系列: E3, E5, E7等
    // - 金属系列: Platinum, Gold, Silver, Bronze
    // - 数字系列: W-1290, D-1653N等
    // - 扩展名系列: L, X, M, D等(如X7560, L5640)
    if (text.includes(' E')) {
      const modelNumReg = /(E\d-\d{4}(?:\s?v\d)?)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    } else if (text.includes('Platinum')) {
      const modelNumReg = /(?:Platinum\s+)(\d{4}(?:\w)?)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    } else if (text.includes('Gold')) {
      const modelNumReg = /(?:Gold\s+)(\d{4}(?:\w)?)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    } else if (text.includes('Silver')) {
      const modelNumReg = /(?:Silver\s+)(\d{4}(?:\w)?)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    } else if (text.includes('Bronze')) {
      const modelNumReg = /(?:Bronze\s+)(\d{4}(?:\w)?)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    } else {
      // 通用Xeon型号匹配
      const genericXeonReg = /Xeon(?:\(R\))?\s+(?:\w+-)?((?:W|D)?-?\d{4,5}(?:\w)?)/;
      const genericMatch = text.match(genericXeonReg);
      if (genericMatch) {
        [, cpuInfo.modelNum] = genericMatch;
      }
    }
  }

  if (text.includes('Core')) {
    if (text.includes('Core(TM)')) {
      // 匹配如 Core(TM) i7-10700K 等格式
      const modelNumReg = /Core\(TM\)\s+(\w\d+-\w+)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    } else {
      // 匹配如 Core i9-12900K, Core i5-13600K 等格式
      const coreReg = /Core\s+(i[3579]-\d{4,5}(?:\w+)?)/i;
      const coreMatch = text.match(coreReg);
      if (coreMatch) {
        [, cpuInfo.modelNum] = coreMatch;
      }
    }
  }

  if (text.includes('Celeron')) {
    const modelNumReg = /Celeron(?:\(R\))?\s+(\w+\d+(?:\w+)?)/;
    const modelNumMatch = text.match(modelNumReg);
    if (modelNumMatch) {
      [, cpuInfo.modelNum] = modelNumMatch;
    }
  }

  if (text.includes('Pentium')) {
    const modelNumReg = /Pentium(?:\(R\))?\s+(\w+\d+(?:\w+)?)/;
    const modelNumMatch = text.match(modelNumReg);
    if (modelNumMatch) {
      [, cpuInfo.modelNum] = modelNumMatch;
    }
  }

  if (text.includes('Intel(R) N')) {
    const modelNumReg = /Intel\(R\)\s+(N\d+(?:\w+)?)/;
    const modelNumMatch = text.match(modelNumReg);
    if (modelNumMatch) {
      [, cpuInfo.modelNum] = modelNumMatch;
    }
  }

  // 匹配Apple M系列芯片
  if (text.includes('Apple') && text.match(/M\d/)) {
    // 匹配各种Apple Silicon M系列芯片：
    // - 基本型号: M1, M2, M3等
    // - 变种型号: M1 Pro, M2 Max, M3 Ultra等
    const appleChipReg = /Apple\s+(?:Silicon\s+)?M(\d+(?:\s+(?:Pro|Max|Ultra|Extreme))?)/i;
    const appleChipMatch = text.match(appleChipReg);
    if (appleChipMatch) {
      [, cpuInfo.modelNum] = appleChipMatch;
    }
  }

  if (coresMatch) {
    [cpuInfo.core, cpuInfo.cores] = coresMatch;
  }
  return cpuInfo;
}

/**
 * 计算十进制存储大小
 *
 * @returns {object} 内存信息
 *  - {string} t TB值
 *  - {string} g GB值
 *  - {string} m MB值
 *  - {string} k KB值
 */
export function calcDecimal(memTotal) {
  const k = memTotal / 1000;
  const m = memTotal / 1000 ** 2;
  const g = memTotal / 1000 ** 3;
  const t = memTotal / 1000 ** 4;
  return {
    k,
    m,
    g,
    t,
  };
}

/**
 * 计算字节大小
 * @param {number} bytes 字节数
 * @returns {object} 字节大小
 *  - {number} kb KB值
 *  - {number} mb MB值
 *  - {number} gb GB值
 *  - {number} tb TB值
 */
export function calcBinary(bytes) {
  const k = bytes / 1024;
  const m = k / 1024;
  const g = m / 1024;
  const t = g / 1024;
  let p = null;
  if (t > 1000) {
    p = t / 1024;
  }
  return {
    k,
    m,
    g,
    t,
    p,
  };
}

/**
 * 计算流量规格
 */
export function calcTransfer(bytes) {
  const stats = calcBinary(bytes);
  const result = {
    value: '',
    unit: '',
    stats,
  };
  if (stats.t > 1) {
    result.value = (stats.t).toFixed(2) * 1;
    result.unit = 'T';
  } else if (stats.g > 1) {
    result.value = (stats.g).toFixed(2) * 1;
    result.unit = 'G';
  } else if (stats.m > 1) {
    result.value = (stats.m).toFixed(1) * 1;
    result.unit = 'M';
  } else if (stats.p > 0) {
    result.value = (stats.p).toFixed(1) * 1;
    result.unit = 'P';
  } else {
    result.value = (stats.k).toFixed(1) * 1;
    result.unit = 'K';
  }
  return result;
}

export function getPlatformLogoIconClassName(platform) {
  const platformStr = (platform || '').toLowerCase();
  if (platformStr.includes('windows') || platformStr.includes('microsoft')) {
    return 'ri-microsoft-fill';
  }
  switch (platformStr) {
    case 'darwin':
    case 'macos':
      return 'fl-apple';
    default:
  }
  if (platform) {
    return `fl-${platform}`;
  }
  return 'ri-server-line';
}

/**
 * 获取系统发行版本
 */
export function getSystemOSLabel(platform, short = false) {
  const platformStr = (platform || '').toLowerCase();
  // 匹配一些超长系统发行版本
  if (short && platformStr.includes('windows')) {
    return 'Windows';
  }
  switch (platformStr) {
    case 'windows':
      return 'Windows';
    case 'linux':
      return 'Linux';
    case 'darwin':
      return 'MacOS';
    case 'debian':
      return 'Debian';
    case 'ubuntu':
      return 'Ubuntu';
    case 'centos':
      return 'CentOS';
    case 'fedora':
      return 'Fedora';
    case 'redhat':
      return 'RedHat';
    case 'suse':
      return 'SUSE';
    case 'gentoo':
      return 'Gentoo';
    case 'arch':
      return 'Arch';
    case 'alpine':
      return 'Alpine';
    case 'raspbian':
      return 'Raspbian';
    case 'openwrt':
      return 'OpenWRT';
    case 'freebsd':
      return 'FreeBSD';
    case 'netbsd':
      return 'NetBSD';
    case 'openbsd':
      return 'OpenBSD';
    case 'dragonfly':
      return 'DragonFly';
    case 'solaris':
      return 'Solaris';
    case 'aix':
      return 'AIX';
    case 'hpux':
      return 'HP-UX';
    case 'irix':
      return 'IRIX';
    case 'osf':
      return 'OSF';
    case 'tru64':
      return 'Tru64';
    case 'unixware':
      return 'UnixWare';
    case 'sco':
      return 'SCO';
    default:
      return platform;
  }
}
