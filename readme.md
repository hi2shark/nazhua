# Nazhua
**使用前，请务必阅读Readme的内容，对你有帮助**  
基于哪吒监控(nezha.wiki)v0版本构建的前端主题，目前兼容与v0相同数据结构的v1版本。  
~~主题有点**重**，因为内置了一个带中文的`SarasaTermSC-SemiBold`字体。~~  
~~根据不同场景，可以选择是否打包带入或者是否加载这个字体。~~   
考虑到多数国内直连用户无法访问jsdelivr，所以默认使用cdnjs的loli.net引用版本。  
同时默认关闭SarasaTermSC字体，如果需要使用，请使用Docker镜像全量包。  

## 赞助
> 按服务商字母排序，不分先后。
<table>
  <tr>
    <td align="center">
      <a href="https://www.vmiss.com" target="_blank" title="VMISS，加拿大企业，打造全球优质优化线路。提供香港、日本、韩国、美国、英国的云服务器">
        <img src="./.github/images/vmiss-logo.jpg" width="200px;" alt="VMISS"/>
      </a>
      <br />
      <span style="font-weight: bold;">VMISS</span>
    </td>
    <td align="center">
      <a href="https://yxvm.com" target="_blank" title="YXVM，提供香港、新加坡、日本的云服务器与物理服务器">
        <img src="./.github/images/yxvm-logo.jpg" width="200px;" alt="YXVM"/>
      </a>
      <br />
      <span style="font-weight: bold;">YXVM</span>
    </td>
  </tr>
</table>

## 劝退指南 用前必读
1. 本主题是基于哪吒监控v0版本构建的，~~不确定能否完美v1版本~~。*v0.4.3的版本已适配*  
2. 本主题是一个纯前端项目，需要解决跨域问题，通常需要一个nginx或者caddy反代请求解决跨域问题。  
3. 我不会提供任何技术支持，如果你有问题，可以提issue，但是我不保证会回答，可能询问GPT会更快。  

## 功能更新说明
### v0.5.3更新
新增：支持单独给服务器设置购买按钮的文案和图标，需要在公开备注的customData中添加`buyBtnText`和`buyBtnIcon`字段。  
> 使用方法：`buyBtnText`用于设置购买按钮的文案，`buyBtnIcon`用于设置购买按钮的图标，图标支持Remixicon的图标名称，例如：`ri-gift-2-line`。  
> 示例：点击复制图标名称，然后填写到`buyBtnIcon`字段中，补齐`ri-`前缀即可。  
> ![remixicon使用方法](./.github/images/remixicon-select.jpg)
> 在线图标网站：[www.remixicon.com](https://www.remixicon.com/) 目前支持版本为4.6.0

## V0/V1的使用区别  
### Docker版本的nazhua
使用V1必须在`config.js`中指定`nezhaVersion`的版本为`v1`，**大小写敏感*  
默认的数据是基于V0  
### Release版本的nazhua  
V1下载最新版本[Releases](https://github.com/hi2shark/nazhua/releases)的`dist.zip`；  
V0下载最新版本[Releases](https://github.com/hi2shark/nazhua/releases)的`v0-dist.zip`;  
`v{版本}-all.zip`是包含字体的全量包。  
`v{版本}-cdn-{CDN供应方}.zip`是公共资源使用CDN引用的版本。    

## 关于点阵地图  
点阵地图是一个失真的地图，地图边际与城市位置都不是真实的经纬度坐标，因此无法通过经纬度来定位城市。  
需要在是[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)中，拾取点阵地图上的坐标，然后在`config.js`中配置`customCodeMap`来自定义地图点信息。  
如何指定节点的地理位置？  
在哪吒监控后台，给节点的公开备注对象中，添加一个`customData`对象，并指定`location`的代码；  
关于都有哪些内置的地理位置代码，需要在[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)中查看。  
示例
```json
{
  "customData": {
    "location": "HKG"
  }
}
```
对于几个我常见的国别位置，添加了默认映射位置，会自动显示在地图上。  
Tips: 中国大陆地区默认在首都：北京（该映射在0.4.6后补充）  
Tips: 美国默认在最常买的位置：洛杉矶  

## 关于节点slogan和购买链接
同时，这个`customData`中还可以添加一项`slogan`和`orderLink`字符串，分别用于显示节点的标语和购买链接。
```json
{
  "customData": {
    "location": "HKG",
    "slogan": "这是一个香港节点",
    "orderLink": "https://buy.example.com"
  }
}
```
Tips:   
由于配置数据获取的方式特殊，无法正常解析符号`&`，建议在[https://www.bejson.com/enc/urlencode/](https://www.bejson.com/enc/urlencode/)进行编码后，将encodeURIComponent编码内容添加到orderLink中。  
当然，你也可以通过浏览器的console（控制台），执行`encodeURIComponent('链接内容')`，获取编码后的内容。  

## 对于公开备注的支持
在哪吒的主题ServerStatus迭代中，nap0o增加了一个公开备注的功能，可以给节点添加额外的展示信息  
具体字段定义参考 [https://github.com/nezhahq/nezha/pull/425](https://github.com/nezhahq/nezha/pull/425)  
Nazhua对这个支持大概在90%左右，参与数据处理了的字段如下：  
```json
{
   "billingDataMod": {
       "startDate": "2024-10-01T00:00:00+08:00",
       "endDate": "2024-11-01T00:00:00+08:00",
       "autoRenewal": "1",
       "cycle": "月",
       "amount": "$3.99"
   },
   "planDataMod": {
       "bandwidth": "30Mbps",
       "trafficVol": "1TB/月",
       "trafficType": "1",
       "IPv4": "1",
       "IPv6": "1",
       "networkRoute": "CN2,GIA",
       "extra": "传家宝,AS9929"
   }
}
```
~~其中IPv4、IPv6暂未参与到处理中，后续可能会支持。~~  
 - 都有显示标签：双栈IP;  
 - 单IPv4显示标签：仅IPv4;  
 - 单IPv6显示标签：仅IPv6;  

## 数据来源
1-0. 公开的全量配置，其中包括“公开备注”（PublicNote），来自探针主页上暴露的服务器节点列表配置信息。此处是根据正则匹配的方式，获取到的节点列表。在主题项目中，默认将访问`/nezha/`的指向此处。  
2-0. 实时数据，v0来自公开的ws服务接口，`/ws`。  
2-1. 实时数据/全量数据，v1来自公开的ws服务接口，`/api/v1/ws/server`。  
3-0. 监控数据，v0来自公开的api接口，`/api/v1/monitor/${id}`。  
3-1. 监控数据，v1来自公开的api接口，`/api/v1/service/${id}`。  
4-0. 分组数据，v0来自服务器节点列表的`Tag`字段匹配。  
4-1. 分组数据，v1来自公开的api接口，`/api/v1/server-group`。  

## 部署
Nazhua主题是一个纯前端项目，可以部署在纯静态服务器上；  
v0需要解决`/api/v1/monitor/${id}`监控数据、`/ws`WS服务和`/`主页的跨域访问。  
v1需要解决`/api/xxx`等数据接口、`/api/v1/ws/server`WS服务的跨域访问。  
通常来说，你需要一个nginx或者caddy反代请求解决跨域问题。  

### Docker Compose + Cloudflare Tunnels部署
**请关注备注中的提示内容**
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
建议通过docker-compose部署服务，然后通过cloudflare的tunnels向外提供服务，可以不用自己配置https证书。  
**再次提示，哪吒V1的必须设置config.js中的nezhaVersion为v1**  
**如果不想加载完整的内置库，可以使用cdn引用镜像**  
例如：`ghcr.io/hi2shark/nazhua:latest`替换为`ghcr.io/hi2shark/nazhua:cdn`  

>如果你想隐藏原面板，只暴露nazhua出来，你可以用Zero Trust的Tunnels；  
>三个容器：Tunnels、nezha-dashboard、nazhua  
>nazhua用docker内的地址访问nezha-dashboard，然后Tunnels绑定nazhua给公开访问的域名  
>Tunnels绑定nezha-dashboard到私密域名，需要邮箱|IP等匹配的才能访问  

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

## 自定义配置
可以通过修改根目录下的`config.js`文件来自定义配置  
例如：(*参考内容在文档上不一定是最新，具体参考public/config.js或者[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)*)
```javascript
window.$$nazhuaConfig = {
  locale: 'en', // 国际化支持 en | zh-CN
  title: '哪吒监控', // 网站标题
  footerSlogan: '不要年付！不要年付！不要年付！<span style="color: #f00;">欢迎访问Nazhua探针</span>', // 底部标语
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
  hideNavbarServerCount: false, // 隐藏服务器数量
  hideNavbarServerStat: false, // 隐藏服务器统计
  hideListItemStatusDonut: false, // 隐藏列表项的饼图
  hideListItemStat: false, // 隐藏列表项的统计信息
  hideListItemBill: false, // 隐藏列表项的账单信息
  hideFilter: false, // 隐藏筛选
  hideTag: false, // 隐藏标签
  hideDotBG: true, // 隐藏框框里面的点点背景
  monitorRefreshTime: 10, // 监控刷新时间间隔，单位s（秒）, 0为不刷新，为保证不频繁请求源站，最低生效值为10s
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


## 二次开发提示
`.env.development.local`配置变量
```bash
#### Sarasa Term SC字体的配置
# VITE_DISABLE_SARASA_TERM_SC=1
# VITE_SARASA_TERM_SC_USE_CDN=1

#### 引用库的CDN配置
# VITE_USE_CDN=1
# VITE_CDN_LIB_TYPE=jsdelivr # jsdelivr | cdnjs | loli

#### 哪吒的默认版本控制
# VITE_NEZHA_VERSION=v1 # v0 | v0

#### 本地开发设置
# PROXY_WS_HOST= # 本地开发时，可以代理WS服务的地址，启用后，自动转发至 {PROXY_WS_HOST}/proxy?wsPath={WS_HOST}
# API_HOST= # 本地开发时，代理的API服务地址
# WS_HOST= # 本地开发时，代理的WS服务地址
##### 仅限v0版本
# NEZHA_HOST= # 本地开发时，代理的哪吒主页地址
```
