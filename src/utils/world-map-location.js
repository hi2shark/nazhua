import config from '@/config';
import CODE_MAPS, {
  countryCodeMapping,
  aliasMapping,
} from '@/data/code-maps';

export const ALIAS_CODE = {
  ...aliasMapping,
  ...countryCodeMapping,
};

export const alias2code = (code) => ALIAS_CODE[code];

export const locationCode2Info = (code) => {
  const maps = {
    ...CODE_MAPS,
    ...(config.nazhua.customCodeMap || {}),
  };
  let info = maps[code];
  const aliasCode = aliasMapping[code];
  if (!info && aliasCode) {
    info = maps[aliasCode];
  }
  return info;
};

export const count2size = (count) => {
  if (count < 3) {
    return 4;
  }
  if (count < 5) {
    return 6;
  }
  return 8;
};
