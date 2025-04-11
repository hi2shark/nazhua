# 🚀 部署指南

## 部署概述
> Nazhua主题是纯前端项目，可部署在静态服务器上
> 
> **跨域解决注重点**：
> - **V0版本**：需解决 `/api/v1/monitor/${id}`、`/ws` 和 `/` 的跨域
> - **V1版本**：需解决 `/api/xxx` 和 `/api/v1/ws/server` 的跨域
> 
> 推荐使用 Nginx 或 Caddy 反向代理解决跨域问题

## 🐳 Docker Compose + Cloudflare Tunnels 部署
此方案便于后续更新，只需通过 `docker compose pull` 命令即可更新主题（镜像）。

### 配置说明
- **favicon.ico**：可通过挂载或配置文件指定（默认无）
- **config.js**：需单独挂载，建议使用[配置生成器](https://hi2shark.github.io/nazhua-generator/)生成
- **style.css**：用于自定义CSS样式，尽量保持选择器稳定

### 部署示例
```yaml
services:
  nazhua:
    image: ghcr.io/hi2shark/nazhua:latest
    container_name: nazhua
    ports:
      - 80:80
    # volumes:
      # - ./favicon.ico:/home/wwwroot/html/favicon.ico:ro # 自定义favicon图标
      # - ./config.js:/home/wwwroot/html/config.js:ro # 自定义配置文件
      # - ./style.css:/home/wwwroot/html/style.css:ro # 自定义样式文件
    environment:
      - DOMAIN=_ # 监听的域名，默认为_（监听所有）
      - NEZHA=http://nezha-dashboard.example.com/ # 可以被反向代理nezha主页地址
    restart: unless-stopped
```

### 💡 小贴士
- 推荐使用 docker-compose 部署 Nazhua 与 Nezha Dashboard，并通过 Cloudflare Tunnels 对外提供服务
- 如需减少内置库体积，可使用 CDN 版本镜像：`ghcr.io/hi2shark/nazhua:cdn`
- 隐藏原面板方案：使用 Zero Trust Tunnels 部署三个容器 (Tunnels、nezha-dashboard、nazhua)
  - nazhua 通过 docker 内部地址访问 nezha-dashboard
  - Tunnels 绑定 nazhua 到公开域名
  - Tunnels 绑定 nezha-dashboard 到需要邮箱/IP验证的私密域名

## 🌐 自定义Web服务部署

### 安装步骤
1. 在 [Releases页面](https://github.com/hi2shark/nazhua/releases) 下载最新版 `v{Nazhua版本号}-all.zip`
2. 解压后将 `dist` 目录文件上传到Web服务目录

### Nginx配置示例
```nginx
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  server_name nazhua.example.com;
  client_max_body_size 1024m;

  # 哪吒V0的WebSocket服务
  location /ws {
    proxy_pass ${NEZHA}ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # 哪吒V1的WebSocket服务
  location /api/v1/ws/server {
    proxy_pass ${NEZHA}api/v1/ws/server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /api {
    proxy_pass http://nezha-dashboard.example.com/api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /nezha/ {
    proxy_pass http://nezha-dashboard.example.com/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
    root /home/wwwroot/html;
  }
}
```
----  
**Tips:** V0环境下若想与面板使用同域名，下载 `v0-nazhua.zip` 并将文件上传至面板目录下的 `nazhua` 文件夹

----  

## ⚙️ 配置文件

### config.js 配置说明
建议使用 [Nazhua 配置生成器](https://hi2shark.github.io/nazhua-generator/) 生成配置文件。

```javascript
window.$$nazhuaConfig = {
  title: '哪吒监控', // 网站标题
  footerSlogan: '不要年付！不要年付！不要年付！<span style="color: #f00;">欢迎访问Nazhua探针</span>', // 底部标语，支持html渲染
  freeAmount: '白嫖', // 免费服务的费用名称
  infinityCycle: '长期有效', // 无限周期名称
  buyBtnText: '购买', // 购买按钮文案
  buyBtnIcon: '', // 购买按钮图标，取自remixicon
  customBackgroundImage: '', // 自定义的背景图片地址
  lightBackground: true, // 启用了浅色系背景图，会强制关闭点点背景
  showFireworks: true, // 是否显示烟花，建议开启浅色系背景
  showLantern: true, // 是否显示灯笼
  enableInnerSearch: true, // 启用内部搜索
  listServerItemTypeToggle: true, // 服务器列表项类型切换
  listServerItemType: 'row', // 服务器列表项类型 card/row row列表模式移动端自动切换至card
  listServerStatusType: 'progress', // 服务器状态类型--列表
  listServerRealTimeShowLoad: true, // 列表显示服务器实时负载
  detailServerStatusType: 'progress', // 服务器状态类型--详情页
  simpleColorMode: true, // 服务器状态纯色显示
  serverStatusLinear: true, // 服务器状态渐变线性显示 - 与pureColorMode互斥
  disableSarasaTermSC: true, // 禁用Sarasa Term SC字体
  hideWorldMap: false, // 隐藏地图
  hideHomeWorldMap: false, // 隐藏首页地图
  hideDetailWorldMap: false, // 隐藏详情地图
  homeWorldMapPosition: 'top', // 首页地图位置 top/bottom
  detailWorldMapPosition: 'top', // 详情页地图位置 top/bottom
  hideNavbarServerCount: false, // 隐藏服务器数量
  hideNavbarServerStat: false, // 隐藏服务器统计
  hideListItemStatusDonut: false, // 隐藏列表项的饼图
  hideListItemStat: false, // 隐藏列表项的统计信息
  hideListItemBill: false, // 隐藏列表项的账单信息
  hideListItemLink: true, // 隐藏列表项的购买链接
  hideFilter: false, // 隐藏筛选
  hideTag: false, // 隐藏标签
  hideDotBG: true, // 隐藏框框里面的点点背景
  monitorRefreshTime: 10, // 监控刷新时间间隔，单位s（秒）, 0为不刷新，为保证不频繁请求源站，最低生效值为10s
  monitorChartType: 'multi', // 监控图表类型 single/multi
  monitorChartTypeToggle: true, // 监控图表类型切换
  filterGPUKeywords: ['Virtual Display'], // 如果GPU名称中包含这些关键字，则过滤掉
  customCodeMap: {}, // 自定义的地图点信息
  nezhaVersion: 'v1', // 哪吒版本 不填写则尝试自动识别
  apiMonitorPath: '/api/v1/monitor/{id}',
  wsPath: '/ws',
  nezhaPath: '/nezha/',
  nezhaV0ConfigType: 'servers', // 哪吒v0数据读取类型
  v1ApiMonitorPath: '/api/v1/service/{id}',
  v1WsPath: '/api/v1/ws/server',
  v1ApiGroupPath: '/api/v1/server-group',
  v1ApiSettingPath: '/api/v1/setting',
  v1ApiProfilePath: '/api/v1/profile',
  v1DashboardUrl: '/dashboard', // v1版本控制台地址
  v1HideNezhaDashboardBtn: true, // v1版本导航栏控制台入口/登录按钮 在nezhaVersion为v1时有效
  routeMode: 'h5', // 路由模式
  customFavicon: '', // 自定义favicon, 填写完整的url地址
};
```

### 🎨 自定义样式
通过修改根目录下的 `style.css` 文件实现样式定制：

```css
:root {
  /* 修改颜色 */
  /* 地图上标记点的颜色 */
  --world-map-point-color: #fff;
  /* 列表项显示的价格颜色 */
  --list-item-price-color: #ff6;
  /* 购买链接的主要颜色 */
  --list-item-buy-link-color: #f00;
}

/* 自定义背景图示例 */
:root {
  /* 图片太亮时，增加背景遮罩透明度 */
  --layout-main-bg-color: rgba(0, 0, 0, 0.75);
}
.layout-group .layout-bg {
  /* 添加!important强制背景图替换 */
  background: url(./bg.jpg) no-repeat 50% 50% !important;
  background-size: cover;
}
```
