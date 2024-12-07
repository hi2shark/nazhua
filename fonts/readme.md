# Nazhua内置字体

## Sarasa Term SC
字体出处：[Sarasa-Gothic](https://github.com/be5invis/Sarasa-Gothic)  
具体引用：`Sarasa Term SC SemiBold`  
由TTF转换为WOFF2格式，以便在网页中使用。  
使用方法：
```css
@font-face {
  font-family: "Sarasa Term SC";
  src: url("./fonts/SarasaTermSC/SarasaTermSC-SemiBold.woff2") format("woff2"),
    url("./fonts/SarasaTermSC/SarasaTermSC-SemiBold.woff") format("woff");
  font-display: swap;
}

.sarasa-term-sc {
  font-family: "Sarasa Term SC";
}
```
