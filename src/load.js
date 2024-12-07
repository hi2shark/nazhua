// 是否禁用 Sarasa Term SC 字体
if (import.meta.env.VITE_DISABLE_SARASA_TERM_SC !== '1') {
  if (import.meta.env.VITE_SARASA_TERM_SC_USE_CDN) {
    import('./assets/fonts/SarasaTermSC/cdn-font.css');
  } else {
    import('./assets/fonts/SarasaTermSC/font.css');
  }
  import('./assets/scss/sarasa-term-sc.scss');
}

/**
 * 使用 CDN 加载 CSS 文件
 */
function useCdnCss(item) {
  const cdnType = import.meta.env.VITE_CDN_LIB_TYPE;
  let cssUrl = item.jsdelivr;
  if (['cdnjs', 'loli'].includes(cdnType)) {
    cssUrl = item.cdnjs;
    if (cdnType === 'loli') {
      cssUrl = cssUrl.replace('https://cdnjs.cloudflare.com/', 'https://cdn.loli.net/');
    }
  }
  const cdnStylesheet = document.createElement('link');
  cdnStylesheet.rel = 'stylesheet';
  cdnStylesheet.href = cssUrl;
  document.head.appendChild(cdnStylesheet);
}

// 判断是否使用 CDN
if (import.meta.env.VITE_USE_CDN) {
  Object.entries({
    remixicon: {
      jsdelivr: 'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css',
      cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.5.0/remixicon.css',
    },
    flagIcons: {
      jsdelivr: 'https://cdn.jsdelivr.net/npm/flag-icons/css/flag-icons.min.css',
      cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/css/flag-icons.min.css',
    },
    fontLogos: {
      jsdelivr: 'https://cdn.jsdelivr.net/npm/font-logos/assets/font-logos.css',
      cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs/font-logos/1.3.0/assets/font-logos.css',
    },
  }).forEach(([, item]) => {
    useCdnCss(item);
  });
} else {
  import('remixicon/fonts/remixicon.css');
  import('flag-icons/css/flag-icons.min.css');
  import('font-logos/assets/font-logos.css');
}
