# Nazhua
基于哪吒监控(nezha.wiki)v0版本构建的前端主题，目前暂不支持v1版本，关于v1支持需要等待后续版本。
主题有点重，因为内置了`SarasaTermSC-SemiBold`字体。

## 劝退指南 用前必读
1. 本主题是基于哪吒监控v0版本构建的，不支持v1版本。*未来根据情况可能会支持v1版本*  
2. 本主题是一个纯前端项目，需要解决跨域问题，通常需要一个nginx或者caddy反代请求解决跨域问题。  
3. 我不会提供任何技术支持，如果你有问题，可以提issue，但是我不保证会回答，可能询问GPT会更快。  

## 数据来源
1. 公开的全量配置，其中包括“公开备注”（PublicNote），来着探针主页上暴露的服务器节点列表配置信息。此处是根据正则匹配的方式，获取到的节点列表。在主题项目中，默认将访问`/nezha/`的指向此处。  
2. 实时数据，来着公开的ws服务接口，`/ws`。  
3. 监控数据，来着公开的api接口，`/api/v1/monitor/${id}`。  

## 部署
Nazhua主题是一个纯前端项目，可以部署在纯静态服务器上，但需要解决`/api/v1/monitor/${id}`监控数据、`/ws`WS服务和`/`主页的跨域访问。  
通常来说，你需要一个nginx或者caddy反代请求解决跨域问题。  

### Nginx配置示例
```nginx
server {
  listen 80;
  server_name nazhua.example.com;

  location /ws {
    proxy_pass http://nezha-dashboard.example.com/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
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
    root /home/wwwroot/html;
  }
}
```


## 自定义配置
可以通过修改`config.js`文件来自定义配置  
例如：
```javascript
window.$$nazhuaConfig = {
  title: '哪吒监控', // 网站标题
  freeAmount: '', // 免费服务的费用名称
  infinityCycle: '', // 无限周期名称
  hideListItemBill: false, // 隐藏列表项的账单信息
  buyBtnText: '', // 购买按钮文案
  hideWorldMap: false, // 隐藏地图
  hideHomeWorldMap: false, // 隐藏首页地图
  hideDetailWorldMap: false, // 隐藏详情地图
  hideFilter: false, // 隐藏筛选
  hideTag: false, // 隐藏标签
  customCodeMap: {}, // 自定义的地图点信息
  apiMonitorPath: '/api/v1/monitor/{id}',
  wsPath: '/ws',
  nezhaPath: '/nezha/',
  nezhaV0ConfigType: 'servers',
  routeMode: 'h5', // 路由模式 h5 | hash
};
```
可以通过修改`style.css`文件来自定义样式  
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
可以通过[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)快速生成config.js配置文件


## 二次开发提示
`.env.development.local`配置变量
```bash
WS_HOST=http://127.0.0.1:9288 # 本地nezha ws反代
API_HOST=http://nezha-dashboard.example.com # 本地nezha api反代
NEZHA_HOST=http://nezha-dashboard.example.com # 本地nezha主页反代
NEZHA_HOST_REPACE_PATH=1 # 是否替换主页路径`/nezha/`
```
