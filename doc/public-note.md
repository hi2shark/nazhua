# 📝 公开备注配置指南

[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/#/?tab=publicNote)已添加公开备注编辑器，方便大家配置公开备注

## 🗺️ 点阵地图节点显示

### 地图说明
Nazhua采用的点阵地图是一个并非精准的变形地图，不能使用真实经纬度坐标进行换算定位，因此需要通过自定义坐标来指定位置。  

### 配置方法
使用[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/)获取内置的点阵地图坐标或者自定义坐标（可以在`config.js`中配置`customCodeMap`添加自定义地图点）  
在节点的公开备注对象中设置位置代码：  
```json
{
  "customData": {
    "location": "HKG"  // 位置代码
  }
}
```

### 默认位置映射
部分常见地区已有默认映射：
- 中国大陆默认显示在北京（v0.4.6后添加）
- 美国默认显示在洛杉矶

## 🔧 customData 字段详解

### 可用字段
| 字段 | 用途 | 版本支持 |
|------|------|---------|
| `location` | 指定节点地理位置代码 | 全版本 |
| `slogan` | 显示节点标语 | 全版本 |
| `orderLink` | 购买链接地址 | 全版本 |
| `flag` | 自定义国家/地区旗帜 | v0.6.4+ |
| `buyBtnText` | 购买按钮文案 | v0.5.3+ |
| `buyBtnIcon` | 购买按钮图标 | v0.5.3+ |

### 示例配置
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

### 💡 链接编码提示
由于配置数据无法正常解析符号`&`，请使用URL编码：
- 在线工具：[https://www.bejson.com/enc/urlencode/](https://www.bejson.com/enc/urlencode/)
- 浏览器控制台：执行`encodeURIComponent('链接内容')`获取编码后内容

## 📊 原版公开备注支持
在哪吒的主题ServerStatus迭代中，nap0o增加了一个公开备注的功能，可以给节点添加额外的展示信息  
具体字段定义参考 [https://github.com/nezhahq/nezha/pull/425](https://github.com/nezhahq/nezha/pull/425)  
Nazhua支持原版ServerStatus主题的公开备注字段，支持的字段如下：

### 账单信息 (billingDataMod)
```json
{
  "billingDataMod": {
    "startDate": "2024-10-01T00:00:00+08:00",
    "endDate": "2024-11-01T00:00:00+08:00",
    "autoRenewal": "1",
    "cycle": "月",
    "amount": "$3.99"
  }
}
```

### 配置信息 (planDataMod)
```json
{
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

## 🔍 完整公开备注示例

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
[Nazhua配置生成器](https://hi2shark.github.io/nazhua-generator/#/?tab=publicNote)已添加公开备注编辑器，方便大家配置公开备注
