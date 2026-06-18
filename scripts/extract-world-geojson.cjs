#!/usr/bin/env node
/**
 * 将 world-atlas countries-110m TopoJSON 转换为 GeoJSON，
 * 并为国家补充 ISO 3166-1 alpha-2 代码及 ECharts 友好的英文名称，
 * 供 ECharts GL geo3D / map 使用。
 * 输出：src/data/world.geo.json
 */

const fs = require('fs');
const path = require('path');
const { feature } = require('topojson-client');
const worldAtlas = require('world-atlas/countries-110m.json');
const isoCountries = require('i18n-iso-countries');
const enLocale = require('i18n-iso-countries/langs/en.json');

isoCountries.registerLocale(enLocale);

const outPath = path.join(__dirname, '../src/data/world.geo.json');
const nameMapPath = path.join(__dirname, '../src/data/country-name-map.js');
const geoJson = feature(worldAtlas, worldAtlas.objects.countries);

const nameAliasMap = {
  'United States of America': 'United States of America',
  'United States': 'United States of America',
  'Russia': 'Russia',
  'Russian Federation': 'Russia',
  'China': "People's Republic of China",
  'United Kingdom': 'United Kingdom',
  'Japan': 'Japan',
  'Singapore': 'Singapore',
  'Canada': 'Canada',
  'Australia': 'Australia',
  'India': 'India',
  'Brazil': 'Brazil',
  'Germany': 'Germany',
  'France': 'France',
  'South Korea': 'South Korea',
  'Republic of Korea': 'South Korea',
  'North Korea': 'North Korea',
  'Vietnam': 'Vietnam',
  'Laos': 'Laos',
  'Brunei': 'Brunei',
  'Macedonia': 'North Macedonia',
  'Moldova': 'Moldova',
  'Bolivia': 'Bolivia',
  'Venezuela': 'Venezuela',
  'Tanzania': 'Tanzania',
  'Czech Republic': 'Czech Republic',
  'Slovakia': 'Slovakia',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'Serbia': 'Serbia',
  'Montenegro': 'Montenegro',
  'Kosovo': 'Kosovo',
  'Taiwan': 'Taiwan',
  'Hong Kong': 'Hong Kong',
  'Macao': 'Macao',
  'Palestine': 'Palestine',
  'Syria': 'Syria',
  'Iran': 'Iran',
  'Myanmar': 'Myanmar',
  'Cape Verde': 'Cape Verde',
  'Congo': 'Congo',
  'Dem. Rep. Congo': 'Democratic Republic of the Congo',
  'Central African Rep.': 'Central African Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'Eswatini': 'Eswatini',
  'Lesotho': 'Lesotho',
  'East Timor': 'East Timor',
  'Bahamas': 'Bahamas',
  'Falkland Is.': 'Falkland Islands',
  'N. Cyprus': 'Northern Cyprus',
  'W. Sahara': 'Western Sahara',
  'Vatican': 'Vatican City',
  'Micronesia': 'Micronesia',
  'Marshall Is.': 'Marshall Islands',
  'N. Mariana Is.': 'Northern Mariana Islands',
  'U.S. Virgin Is.': 'United States Virgin Islands',
  'S. Geo. and the Is.': 'South Georgia and the South Sandwich Islands',
  'Br. Indian Ocean Ter.': 'British Indian Ocean Territory',
  'Indian Ocean Ter.': 'British Indian Ocean Territory',
  'Pitcairn Is.': 'Pitcairn Islands',
  'British Virgin Is.': 'British Virgin Islands',
  'Turks and Caicos Is.': 'Turks and Caicos Islands',
  'S. Sudan': 'South Sudan',
  'Somaliland': 'Somaliland',
  'Solomon Is.': 'Solomon Islands',
  'São Tomé and Principe': 'São Tomé and Príncipe',
  'St. Vin. and Gren.': 'Saint Vincent and the Grenadines',
  'St. Kitts and Nevis': 'Saint Kitts and Nevis',
  'Antigua and Barb.': 'Antigua and Barbuda',
  'Cook Is.': 'Cook Islands',
  'St. Pierre and Miquelon': 'Saint Pierre and Miquelon',
  'Wallis and Futuna Is.': 'Wallis and Futuna',
  'St-Martin': 'Saint Martin',
  'St-Barthélemy': 'Saint Barthélemy',
  'Fr. Polynesia': 'French Polynesia',
  'Fr. S. Antarctic Lands': 'French Southern Territories',
  'Åland': 'Åland Islands',
  'Dominican Rep.': 'Dominican Republic',
  'Faeroe Is.': 'Faroe Islands',
  'Sint Maarten': 'Sint Maarten',
  'Heard I. and McDonald Is.': 'Heard Island and McDonald Islands',
  'Ashmore and Cartier Is.': 'Ashmore and Cartier Islands',
  'Siachen Glacier': 'Siachen Glacier',
};

geoJson.features.forEach((f) => {
  const originalName = f.properties.name;
  const isoName = isoCountries.getName(originalName, 'en');
  const aliasName = nameAliasMap[originalName];
  const code = isoCountries.getAlpha2Code(aliasName || isoName || originalName, 'en')
    || isoCountries.getAlpha2Code(originalName, 'en');

  f.properties.iso_a2 = code || '';
  f.properties.name = aliasName || isoName || originalName;
});

fs.writeFileSync(outPath, JSON.stringify(geoJson), 'utf8');

const nameMap = {};
geoJson.features.forEach((f) => {
  const code = f.properties.iso_a2;
  if (code && !nameMap[code.toLowerCase()]) {
    nameMap[code.toLowerCase()] = f.properties.name;
  }
});

const nameMapOutput = `// 本文件由 scripts/extract-world-geojson.cjs 自动生成，请勿手动修改
// alpha-2 国家代码 -> ECharts 世界地图名称

export default ${JSON.stringify(nameMap, null, 2)};
`;
fs.writeFileSync(nameMapPath, nameMapOutput, 'utf8');

// eslint-disable-next-line no-console
console.log(`已生成世界地图 GeoJSON，共 ${geoJson.features.length} 个国家/地区，写入 ${path.relative(process.cwd(), outPath)}`);
// eslint-disable-next-line no-console
console.log(`已生成国家名称映射，共 ${Object.keys(nameMap).length} 个国家/地区，写入 ${path.relative(process.cwd(), nameMapPath)}`);
