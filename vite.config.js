import path from 'path';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import babel from 'vite-plugin-babel';
import eslintPlugin from 'vite-plugin-eslint';
import svgLoader from 'vite-svg-loader';
import packageJson from './package';

let proxy;
if (process.env.NODE_ENV === 'development') {
  dotenv.config({
    path: '.env.development.local',
  });

  proxy = {
    '/api': {
      target: process.env.API_HOST,
      changeOrigin: true,
    },
    '/ws': {
      target: process.env.PROXY_WS_HOST || process.env.WS_HOST,
      changeOrigin: true,
      ws: true,
      rewrite: (e) => {
        if (process.env.PROXY_WS_HOST) {
          return `/proxy?wsPath=${process.env.WS_HOST}`;
        }
        return e;
      },
    },
    '/api/v1/ws/server': {
      target: process.env.PROXY_WS_HOST || process.env.WS_HOST,
      changeOrigin: true,
      ws: true,
      rewrite: (e) => {
        if (process.env.PROXY_WS_HOST) {
          return `/proxy?wsPath=${process.env.WS_HOST}`;
        }
        return e;
      },
    },
  };

  if (process.env.VITE_BASE_PATH === '/' || !process.env.VITE_BASE_PATH) {
    proxy['/nezha/'] = {
      target: process.env.NEZHA_HOST,
      changeOrigin: true,
      rewrite: (e) => e.replace(/^\/nezha/, ''),
    };
  }
}

// 读取版本号
process.env.VITE_APP_VERSION = process.env.VERSION || packageJson.version;

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      overlay: false,
    },
    proxy,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  plugins: [
    vue(),
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: [
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-nullish-coalescing-operator',
        ],
      },
    }),
    eslintPlugin({
      include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue'],
    }),
    svgLoader(),
  ],
  build: {
    assetsInlineLimit: 8192, // 8KB 以下的资源会被内联
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('.svg')) {
            return 'svg';
          }
          return 'default';
        },
      },
    },
  },
  resolve: {
    alias: (() => {
      const maps = {
        '@': path.resolve(__dirname, './src/'),
        '~@': path.resolve(__dirname, './src/'),
      };
      return maps;
    })(),
  },
});
