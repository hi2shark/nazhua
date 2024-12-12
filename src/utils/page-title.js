import config from '@/config';

export default (...args) => {
  document.title = [...args, config.nazhua.title].filter((i) => i).join(' - ');
};
