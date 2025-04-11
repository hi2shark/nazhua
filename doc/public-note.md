# 公开备注

## 点阵地图显示节点  
Nazhua采用的点阵地图是一个失真的地图，地图边际与城市位置都不是真实的经纬度坐标，因此无法通过经纬度来定位城市。  
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

## customData字段说明
`customData`中还可以添加子对象`slogan`、`orderLink`、`flag`、`buyBtnText`、`buyBtnIcon`字符串；  
 - `slogan`用于显示节点的标语；  
 - `orderLink`用于显示购买链接；  
 - `flag`用于显示自定义国家/地区旗帜；  
 - `buyBtnText`用于显示购买按钮的文案；  
 - `buyBtnIcon`用于显示购买按钮的图标；  

`flag`字段在`0.6.4`后支持  
`buyBtnText`和`buyBtnIcon`字段在`0.5.3`后支持  

```json
{
  "customData": {
    "location": "HKG",
    "slogan": "这是一个香港节点",
    "orderLink": "https://buy.example.com",
    "buyBtnText": "官网",
    "buyBtnIcon": "ri-gift-2-line",
    "flag": "cn"
  }
}
```
Tips: 由于配置数据获取的方式特殊，无法正常解析符号`&`，建议在[https://www.bejson.com/enc/urlencode/](https://www.bejson.com/enc/urlencode/)进行编码后，将encodeURIComponent编码内容添加到orderLink中。当然，你也可以通过浏览器的console（控制台），执行`encodeURIComponent('链接内容')`，获取编码后的内容。  

## 对于原版公开备注的支持
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


### 公开备注的完整示例
```json
{
  "billingDataMod": {
    "startDate": "2024-10-01",
    "endDate": "2024-11-01",
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
  },
  "customData": {
    "location": "HKG",
    "slogan": "这是一个香港节点",
    "orderLink": "https://buy.example.com",
    "buyBtnText": "官网",
    "buyBtnIcon": "ri-gift-2-line",
    "flag": "cn"
  }
}
```