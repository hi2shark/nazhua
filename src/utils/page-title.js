import config from '@/config';

export default (...args) => {
  const titles = [...new Set([...args, config.nazhua.title])].filter((i) => i);
  document.title = titles.join(' - ');
};
