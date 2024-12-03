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
export function getCPUInfo(text) {
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
  const coresReg = /(\d+) (Virtual|Physics) Core/;
  const companyMatch = text.match(companyReg);
  const modelMatch = text.match(modelReg);
  const coresMatch = text.match(coresReg);
  if (companyMatch) {
    [cpuInfo.company] = companyMatch;
  }
  if (modelMatch) {
    [cpuInfo.model] = modelMatch;
  }
  // 匹配特定的CPU型号编号
  if (text.includes('Xeon')) {
    if (text.includes('E-')) {
      // Xeon型号
      const modelNumReg = /(E\d-\S+)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    }
    if (text.includes('Gold')) {
      // Xeon型号
      const modelNumReg = /(Gold\s\w+)/;
      const modelNumMatch = text.match(modelNumReg);
      if (modelNumMatch) {
        [, cpuInfo.modelNum] = modelNumMatch;
      }
    }
  }
  if (text.includes('Ryzen')) {
    // 5900X 5950X 7900X 7950X 9900X 9950X
    const modelNumReg = /Ryzen.*(\d{4}X)/;
    const modelNumMatch = text.match(modelNumReg);
    if (modelNumMatch) {
      [, cpuInfo.modelNum] = modelNumMatch;
    }
  }
  if (text.includes('EPYC')) {
    // 7B13 7B13 9654...
    const modelNumReg = /EPYC (\w{4})/;
    const modelNumMatch = text.match(modelNumReg);
    if (modelNumMatch) {
      [, cpuInfo.modelNum] = modelNumMatch;
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
    symbol: '',
    stats,
  };
  if (stats.t > 1) {
    result.value = (stats.t).toFixed(2) * 1;
    result.symbol = 'T';
  } else if (stats.g > 1) {
    result.value = (stats.g).toFixed(2) * 1;
    result.symbol = 'G';
  } else if (stats.m > 1) {
    result.value = (stats.m).toFixed(1) * 1;
    result.symbol = 'M';
  } else if (stats.p > 0) {
    result.value = (stats.p).toFixed(1) * 1;
    result.symbol = 'P';
  } else {
    result.value = (stats.k).toFixed(1) * 1;
    result.symbol = 'K';
  }
  return result;
}

/**
 * 获取系统发行版本
 */
export function getSystemOSLabel(platform) {
  switch (platform) {
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
