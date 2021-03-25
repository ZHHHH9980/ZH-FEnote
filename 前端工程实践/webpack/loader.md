# webpack 核心概念

## Entry

- Entry 指定打包入口

先理解依赖图的含义

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200810070036660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

通过**模块的方式**互相引用和依赖，遍历完整个依赖树就开始打包。

### Entry 用法

![image-20200810070056910](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200810070056910.png)

## Output

- output 用于指定 webpack 如何将编译后的文件输出到磁盘

```javascript
const path = require("path");
module.exports = {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
};
```

### output 对于多入口配置

output 对于多入口的处理。

![image-20200808110942130](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200808110942130.png)

### 🌰

```javascript
"use strict";

const path = require("path");

module.exports = {
  entry: {
    index: "./src/index.js",
    main: "./src/main.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js", //<===
  },
  mode: "production",
};
```

`npm run build`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808111909263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

## Loader

- 原生 webpack 仅支持 JS 和 JSON 两种文件类型，但是可以通过**Loader**支持其他文件类型并且把它们转化成有效的**模块**添加到依赖图中。

> loader 的本质就是一个模块的打包方案；

### 常用 Loader

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808112223433.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

(怪不得之前在项目里写 sass 还需要 cnpm sass-loader)，挺无语的，老师全都一句话带过，今天才明白...

### Loader 用法

![](https://img-blog.csdnimg.cn/20200808112553442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

### 图片加载 loader

1. file-loader 提供图片文件格式的打包方案
2. url-loader 封装了 file-loader 可以让小于指定大小的图片压缩成 base64 的格式

### 样式 loader

style-loader,css-loader

```js
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./dist"),
  },
};
```

一般会将这两个一起搭配使用，css-loader 负责打包 css 文件，style-loader 将其挂载到\<head>标签上；
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210201112822326.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

## plugins

我们以`HtmlWebpackPlugin`为例，打包之后自动生成 index.html，并且引入 bundle.js

```webpack
{
//...
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./dist"),
  },
  plugins: [new HtmlWebpackPlugin()],
};
```
