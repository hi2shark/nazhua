
## 部署
> Nazhua主题是一个纯前端项目，可以部署在纯静态服务器上；  
> v0需要解决`/api/v1/monitor/${id}`监控数据、`/ws`WS服务和`/`主页的跨域访问。  
> v1需要解决`/api/xxx`等数据接口、`/api/v1/ws/server`WS服务的跨域访问。  
> 简单的处理方法就是采用nginx或caddy反代请求，以此解决跨域问题。  

### Docker Compose + Cloudflare Tunnels部署
**请关注配置文件备注中的提示内容**  
`favicon.ico`可以映射进去，也可以通过配置文件设置，默认不存在该文件  
`config.js`需要单独映射进去，可以通过[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)直接生成并下载  
`style.css`用于自定义css样式，如果不出现页面结构大规模变更的情况下，我会尽可能保证选择器不变  
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
      - NEZHA=http://nezha-dashboard.example.com/ # 可以被反代nezha主页地址
    restart: unless-stopped
```
Tips: 建议通过docker-compose部署nazhua与nezha，然后通过cloudflare的tunnels向外提供服务，也可以不用自己配置https证书。  
Tips: 如果不想加载完整的内置库，可以使用cdn引用镜像  
> 例如：`ghcr.io/hi2shark/nazhua:latest`替换为`ghcr.io/hi2shark/nazhua:cdn`  
-----
> 如果你想隐藏原面板，只暴露nazhua出来，你可以用Zero Trust的Tunnels；  
> 三个容器：Tunnels、nezha-dashboard、nazhua  
> nazhua用docker内的地址访问nezha-dashboard，然后Tunnels绑定nazhua给公开访问的域名  
> Tunnels绑定nezha-dashboard到私密域名，需要邮箱|IP等匹配的才能访问  
-----

### 单独使用NGINX的配置示例（Caddy可以通过这个配置进行AI推理生成）
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

### config.js 配置说明
`config.js`建议通过[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)生成，然后通过docker的volumes映射到容器内。  
例如：(*参考内容在文档上不一定是最新，具体参考public/config.js*)
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
  nezhaVersion: 'v1', // 哪吒版本
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
可以通过[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)快速生成config.js配置文件

通过修改根目录下的`style.css`文件来自定义样式  
例如：
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
```
自定义背景图的实例：
```css
:root {
  /* 图片太亮了，需要图片前面的前景色（也是背景色）更暗一些 */
  --layout-main-bg-color: rgba(0, 0, 0, 0.75);
}
/* 自定义背景图 */
.layout-group .layout-bg {
  /* 添加important强制背景图替换，此处的替换设计不是很优雅，后期会改进 */
  background: url(./bg.jpg) no-repeat 50% 50% !important;
  background-size: cover;
}
```
`./bg.jpg` 这个是图片地址，可以替换为外链图片；也可以把背景图片放到项目里面去，通常是docker的volumes映射，根据你自己的实际情况来。  
