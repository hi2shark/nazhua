# Nazhua
**[This is an AI-translated version of the original Chinese document. There might be some inaccuracies in translation.]**

**Before using, please make sure to read the content of this Readme, it will be helpful to you**  
A frontend theme built based on Nezha Monitoring (nezha.wiki) v0 version, currently compatible with v1 version which has the same data structure as v0.  
~~The theme is a bit **heavy** because it includes a `SarasaTermSC-SemiBold` font with Chinese characters.~~  
~~Depending on different scenarios, you can choose whether to package and include or load this font.~~   
Considering that most users in China with direct connections cannot access jsdelivr, the default is to use the loli.net reference version of cdnjs.  
At the same time, the SarasaTermSC font is disabled by default. If you need to use it, please use the Docker image full package.  

## Sponsors
> Sorted alphabetically by service provider, no particular order.
<table>
  <tr>
    <td align="center">
      <a href="https://www.vmiss.com" target="_blank" title="VMISS, a Canadian enterprise, creating globally optimized quality routes. Providing cloud servers in Hong Kong, Japan, Korea, USA, and UK">
        <img src="./.github/images/vmiss-logo.jpg" width="200px;" alt="VMISS"/>
      </a>
      <br />
      <span style="font-weight: bold;">VMISS</span>
    </td>
    <td align="center">
      <a href="https://yxvm.com" target="_blank" title="YXVM, providing cloud servers and physical servers in Hong Kong, Singapore, and Japan">
        <img src="./.github/images/yxvm-logo.jpg" width="200px;" alt="YXVM"/>
      </a>
      <br />
      <span style="font-weight: bold;">YXVM</span>
    </td>
  </tr>
</table>

## Disclaimer - Must Read Before Use
1. This theme is built based on Nezha Monitoring v0 version, ~~not sure if it's perfectly compatible with v1 version~~. *v0.4.3 version has been adapted*  
2. This theme is a pure frontend project, which needs to solve cross-domain issues, usually requiring nginx or caddy reverse proxy to solve cross-domain request problems.  
3. I will not provide any technical support. If you have questions, you can submit an issue, but I don't guarantee I'll answer. Asking GPT might be faster.  

## Feature Updates
### v0.5.3 Update
New: Support for setting purchase button text and icon individually for servers, requires adding `buyBtnText` and `buyBtnIcon` fields in the customData of public notes.  
> Usage: `buyBtnText` is used to set the purchase button text, `buyBtnIcon` is used to set the purchase button icon, supporting Remixicon icon names, e.g.: `ri-gift-2-line`.  
> Example: Click to copy the icon name, then fill it in the `buyBtnIcon` field, adding the `ri-` prefix.  
> ![remixicon usage method](./.github/images/remixicon-select.jpg)
> Online icon website: [www.remixicon.com](https://www.remixicon.com/) Currently supporting version 4.6.0

## Differences Between V0/V1 Usage  
### Docker version of nazhua
For V1, you must specify the `nezhaVersion` as `v1` in `config.js`, **case sensitive*  
The default data is based on V0  
### Release version of nazhua  
For V1, download the latest version [Releases](https://github.com/hi2shark/nazhua/releases) of `dist.zip`;  
For V0, download the latest version [Releases](https://github.com/hi2shark/nazhua/releases) of `v0-dist.zip`;  
`v{version}-all.zip` is the full package including fonts.  
`v{version}-cdn-{CDN provider}.zip` is the version using CDN references for public resources.    

## About the Dot Matrix Map  
The dot matrix map is a distorted map where the map borders and city positions are not real latitude and longitude coordinates, so cities cannot be located through latitude and longitude.  
You need to pick coordinates on the dot matrix map in the [Nazhua Configuration Generator](https://hi2shark.github.io/nazhua-generator/), and then configure `customCodeMap` in `config.js` to customize map point information.  
How to specify a node's geographic location?  
In the Nezha monitoring backend, add a `customData` object to the node's public notes, and specify the `location` code;  
For information about which built-in geographic location codes are available, check the [Nazhua Configuration Generator](https://hi2shark.github.io/nazhua-generator/).  
Example
```json
{
  "customData": {
    "location": "HKG"
  }
}
```
For several common country locations I've encountered, default mapping positions have been added, which will automatically display on the map.  
Tips: Mainland China defaults to the capital: Beijing (this mapping was added after 0.4.6)  
Tips: The United States defaults to the most commonly purchased location: Los Angeles  

## About Node Slogan and Purchase Links
At the same time, you can also add `slogan` and `orderLink` strings to this `customData`, used to display the node's slogan and purchase link respectively.
```json
{
  "customData": {
    "location": "HKG",
    "slogan": "This is a Hong Kong node",
    "orderLink": "https://buy.example.com"
  }
}
```
Tips:   
Due to the special way configuration data is obtained, the symbol `&` cannot be parsed normally. It is recommended to encode it at [https://www.bejson.com/enc/urlencode/](https://www.bejson.com/enc/urlencode/), and add the encodeURIComponent encoded content to orderLink.  
Of course, you can also execute `encodeURIComponent('link content')` in your browser's console to get the encoded content.  

## Support for Public Notes
In the ServerStatus theme iteration of Nezha, nap0o added a public notes feature that allows adding additional display information to nodes  
For specific field definitions, refer to [https://github.com/nezhahq/nezha/pull/425](https://github.com/nezhahq/nezha/pull/425)  
Nazhua supports about 90% of this, with the following fields being processed:  
```json
{
   "billingDataMod": {
       "startDate": "2024-10-01T00:00:00+08:00",
       "endDate": "2024-11-01T00:00:00+08:00",
       "autoRenewal": "1",
       "cycle": "Month",
       "amount": "$3.99"
   },
   "planDataMod": {
       "bandwidth": "30Mbps",
       "trafficVol": "1TB/Month",
       "trafficType": "1",
       "IPv4": "1",
       "IPv6": "1",
       "networkRoute": "CN2,GIA",
       "extra": "Heirloom,AS9929"
   }
}
```
~~IPv4 and IPv6 have not yet been included in processing, may be supported in the future.~~  
 - Both display label: Dual-stack IP;  
 - IPv4 only display label: IPv4 only;  
 - IPv6 only display label: IPv6 only;  

## Data Sources
1-0. Public full configuration, including "Public Notes" (PublicNote), comes from the server node list configuration information exposed on the probe homepage. This is obtained through regular expression matching of the node list. In the theme project, the default is to direct `/nezha/` to this location.  
2-0. Real-time data, v0 comes from the public ws service interface, `/ws`.  
2-1. Real-time data/full data, v1 comes from the public ws service interface, `/api/v1/ws/server`.  
3-0. Monitoring data, v0 comes from the public api interface, `/api/v1/monitor/${id}`.  
3-1. Monitoring data, v1 comes from the public api interface, `/api/v1/service/${id}`.  
4-0. Group data, v0 comes from matching the `Tag` field in the server node list.  
4-1. Group data, v1 comes from the public api interface, `/api/v1/server-group`.  

## Deployment
The Nazhua theme is a pure frontend project that can be deployed on a pure static server;  
v0 needs to solve cross-domain access for monitoring data `/api/v1/monitor/${id}`, WS service `/ws`, and homepage `/`.  
v1 needs to solve cross-domain access for data interfaces `/api/xxx`, WS service `/api/v1/ws/server`.  
Typically, you need nginx or caddy to reverse proxy requests to solve cross-domain issues.  

### Docker Compose + Cloudflare Tunnels Deployment
**Please pay attention to the notes in the comments**
```yaml
services:
  nazhua:
    image: ghcr.io/hi2shark/nazhua:latest
    container_name: nazhua
    ports:
      - 80:80
    # volumes:
      # - ./favicon.ico:/home/wwwroot/html/favicon.ico:ro # Custom favicon icon
      # - ./config.js:/home/wwwroot/html/config.js:ro # Custom configuration file
      # - ./style.css:/home/wwwroot/html/style.css:ro # Custom style file
    environment:
      - DOMAIN=_ # Domain to listen on, default is _ (listen to all)
      - NEZHA=http://nezha-dashboard.example.com/ # Nezha homepage address that can be reverse proxied
    restart: unless-stopped
```
It is recommended to deploy the service through docker-compose, and then provide the service externally through cloudflare tunnels, so you don't have to configure https certificates yourself.  
**Again, for Nezha V1, you must set nezhaVersion to v1 in config.js**  
**If you don't want to load the complete built-in library, you can use the cdn reference image**  
For example: replace `ghcr.io/hi2shark/nazhua:latest` with `ghcr.io/hi2shark/nazhua:cdn`  

>If you want to hide the original panel and only expose nazhua, you can use Zero Trust Tunnels;  
>Three containers: Tunnels, nezha-dashboard, nazhua  
>Nazhua accesses nezha-dashboard using the docker internal address, then Tunnels binds nazhua to the publicly accessible domain  
>Tunnels binds nezha-dashboard to a private domain, requiring email/IP matching for access  

### Nginx Configuration Example
```nginx
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  server_name nazhua.example.com;
  client_max_body_size 1024m;

  # Nezha V0 WebSocket service
  location /ws {
    proxy_pass ${NEZHA}ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Nezha V1 WebSocket service
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

## Custom Configuration
You can customize the configuration by modifying the `config.js` file in the root directory  
For example: (*The reference content in the documentation may not be the latest, please refer to public/config.js or [Nazhua Configuration Generator](https://hi2shark.github.io/nazhua-generator/)*)
```javascript
window.$$nazhuaConfig = {
  locale: 'en', // Internationalization support en | zh-CN
  title: 'Nezha Monitoring', // Website title
  footerSlogan: 'Don\'t pay annually! Don\'t pay annually! Don\'t pay annually! <span style="color: #f00;">Welcome to Nazhua Probe</span>', // Footer slogan
  freeAmount: 'Free', // Name for free service fee
  infinityCycle: 'Long-term valid', // Name for infinite cycle
  buyBtnText: 'Purchase', // Purchase button text
  buyBtnIcon: '', // Purchase button icon, from remixicon
  customBackgroundImage: '', // Custom background image address
  lightBackground: true, // Enable light background image, will forcibly disable dot background
  showFireworks: true, // Whether to display fireworks, recommended to enable light background
  showLantern: true, // Whether to display lanterns
  enableInnerSearch: true, // Enable internal search
  listServerItemTypeToggle: true, // Server list item type toggle
  listServerItemType: 'row', // Server list item type card/row (row list mode automatically switches to card on mobile)
  listServerStatusType: 'progress', // Server status type--list
  listServerRealTimeShowLoad: true, // List shows server real-time load
  detailServerStatusType: 'progress', // Server status type--detail page
  simpleColorMode: true, // Server status pure color display
  serverStatusLinear: true, // Server status gradient linear display - mutually exclusive with pureColorMode
  disableSarasaTermSC: true, // Disable Sarasa Term SC font
  hideWorldMap: false, // Hide map
  hideHomeWorldMap: false, // Hide home page map
  hideDetailWorldMap: false, // Hide detail map
  hideNavbarServerCount: false, // Hide server count
  hideNavbarServerStat: false, // Hide server statistics
  hideListItemStatusDonut: false, // Hide list item pie chart
  hideListItemStat: false, // Hide list item statistics
  hideListItemBill: false, // Hide list item billing information
  hideFilter: false, // Hide filter
  hideTag: false, // Hide tag
  hideDotBG: true, // Hide dot background in the frame
  monitorRefreshTime: 10, // Monitor refresh time interval in seconds, 0 means no refresh, minimum effective value is 10s to ensure not requesting the source site too frequently
  filterGPUKeywords: ['Virtual Display'], // If GPU name contains these keywords, filter it out
  customCodeMap: {}, // Custom map point information
  nezhaVersion: 'v1', // Nezha version
  apiMonitorPath: '/api/v1/monitor/{id}',
  wsPath: '/ws',
  nezhaPath: '/nezha/',
  nezhaV0ConfigType: 'servers', // Nezha v0 data reading type
  v1ApiMonitorPath: '/api/v1/service/{id}',
  v1WsPath: '/api/v1/ws/server',
  v1ApiGroupPath: '/api/v1/server-group',
  v1ApiSettingPath: '/api/v1/setting',
  v1ApiProfilePath: '/api/v1/profile',
  v1DashboardUrl: '/dashboard', // v1 version console address
  v1HideNezhaDashboardBtn: true, // v1 version navigation bar console entry/login button, effective when nezhaVersion is v1
  routeMode: 'h5', // Route mode
  customFavicon: '', // Custom favicon, fill in the complete URL address
};
```
You can quickly generate a config.js configuration file through the [Nazhua Configuration Generator](https://hi2shark.github.io/nazhua-generator/)

Customize styles by modifying the `style.css` file in the root directory  
For example:
```css
:root {
  /* Modify colors */
  /* Color of marker points on the map */
  --world-map-point-color: #fff;
  /* Color of price displayed in list items */
  --list-item-price-color: #ff6;
  /* Main color of purchase links */
  --list-item-buy-link-color: #f00;
}
```
Custom background image example:
```css
:root {
  /* If the image is too bright, the foreground color (also background color) in front of the image needs to be darker */
  --layout-main-bg-color: rgba(0, 0, 0, 0.75);
}
/* Custom background image */
.layout-group .layout-bg {
  /* Add important to force background image replacement, this replacement design is not very elegant, will be improved later */
  background: url(./bg.jpg) no-repeat 50% 50% !important;
  background-size: cover;
}
```
`./bg.jpg` is the image address, which can be replaced with an external link image; you can also put the background image in the project, usually through docker volumes mapping, depending on your actual situation.  


## Secondary Development Tips
`.env.development.local` configuration variables
```bash
#### Sarasa Term SC font configuration
# VITE_DISABLE_SARASA_TERM_SC=1
# VITE_SARASA_TERM_SC_USE_CDN=1

#### CDN configuration for reference libraries
# VITE_USE_CDN=1
# VITE_CDN_LIB_TYPE=jsdelivr # jsdelivr | cdnjs | loli

#### Nezha default version control
# VITE_NEZHA_VERSION=v1 # v0 | v0

#### Local development settings
# PROXY_WS_HOST= # When developing locally, the address that can proxy WS services, when enabled, automatically forwards to {PROXY_WS_HOST}/proxy?wsPath={WS_HOST}
# API_HOST= # The API service address proxied during local development
# WS_HOST= # The WS service address proxied during local development
##### For v0 version only
# NEZHA_HOST= # The Nezha homepage address proxied during local development
```
