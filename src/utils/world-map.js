import config from '@/config';
import CODE_MAPS, {
  countryCodeMapping,
  aliasMapping,
  regionGeoPresets,
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

export const locationCode2GeoInfo = (code) => {
  const maps = {
    ...CODE_MAPS,
    ...(config.nazhua.customCodeMap || {}),
  };
  const normalizedCode = typeof code === 'string' ? code.toUpperCase() : code;
  const aliasCode = aliasMapping[normalizedCode];

  return maps[code]
    || maps[normalizedCode]
    || maps[aliasCode]
    || regionGeoPresets[normalizedCode];
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

export function findIntersectingGroups(coordinates) {
  const groups = {};

  coordinates.forEach((coordinate, index) => {
    const intersects = [];
    const n = -2;
    coordinates.forEach((otherCoordinate, otherIndex) => {
      if (index !== otherIndex) {
        if (
          coordinate.topLeft.top - otherCoordinate.bottomRight.top < n
          && coordinate.topLeft.left - otherCoordinate.bottomRight.left < n
          && coordinate.bottomRight.top - otherCoordinate.topLeft.top > -n
          && coordinate.bottomRight.left - otherCoordinate.topLeft.left > -n
        ) {
          intersects.push(otherCoordinate);
        }
      }
    });
    if (intersects.length > 0) {
      groups[coordinate.key] = intersects;
    }
  });

  return groups;
}
