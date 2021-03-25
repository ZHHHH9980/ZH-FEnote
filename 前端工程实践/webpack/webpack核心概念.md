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

我们以`HtmlWebpackPlugin`为例，**打包之后**自动生成 index.html，并且引入 bundle.js，这样就不需要在打包后的文件夹中手动添加 index.html 了；

```js
{
//...
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./dist"),
  },
  plugins: [new HtmlWebpackPlugin()],
};
```

为了清除上一次打包的文件，可以引入`webpackCleanPlugin`;
总之，plugins 是为了为打包提供便利；

### sourceMap

运行打包后的代码，如果有报错的地方会难以定位，因为运行的是打包之后的代码，使用`sourceMap`可以帮助快速定位源代码所在位置；

```js
module.exports = {
  mode: "development",
  devtool: "source-map",
};
```

[各个配置项详细参考](http://cheng.logdown.com/posts/2016/03/25/679045)
[sourceMap 原理](https://juejin.cn/post/6844903689610592269)

#### 最佳实践

> For development, use cheap-module-eval-source-map. For production, use cheap-module-source-map.

### webpackDevServer

使用 webpackDevServer 会自动监听文件变化，启动服务器，提升开发效率；
[Using webpack-dev-server](https://webpack.js.org/guides/development/#using-webpack-dev-server)

### webpack-dev-middleware

通过 Using webpack-dev-middleware 和 express 可以搭建自己的服务器；这个例子也可以体现出 webpack 除了在命令行，还可以在 node 环境下运行；



## HMR(HotModuleReplacement)

`模块热替换`有点类似于ajax，监听代码的改变，只更新页面的某个部分（比如修改部分样式），而并不刷新整个页面，提高开发效率。

webpack环境

```js
{
 "webpack": "^4.28.3",                                                                        "webpack-cli": "^3.1.2",
 "webpack-dev-server": "^3.1.14"
}
```

webpack.config.js

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b538feef1d9c434c8c056b7ee4bad89d~tplv-k3u1fbpfcp-watermark.image)

还需要引入webpack自带的热替换插件；

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7cc5435e42d34929b03f52ad4e71d0e9~tplv-k3u1fbpfcp-watermark.image)



### 监听热更新

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29a0aaeb7e154ce8a1b32a9782d97d59~tplv-k3u1fbpfcp-watermark.image)

> 引入css文件不需要写以上代码也能实现热更新的原因是：**css-loader已经底层已经实现**



## babel

需要安装babel-loader，具体参考官方文档。

```js
{
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
              // 使用env预设，开启对es6转换
            presets: [
              ["@babel/preset-env"],
              // polyfill仅对使用的es6语法进行转换
              {
                useBuiltIns: "usage",
              },
            ],
          },
        },
      }
```

在需要转换的js文件中引入`polyfill`。

```js
import "@babel/polyfill";
```



### @babel/plugin-transform-runtime

如果写UI组件库，上面的方式并不适用，因为polyfill在全局作用域下注入变量，会污染全局作用域。

```js
{
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              ["@babel/plugin-transform-runtime"],
              {
                absoluteRuntime: false,
                corejs: 3,
                helpers: true,
                proposals: true,
                regenerator: true,
                version: "7.0.0-beta.0",
              },
            ],
            /*             
            presets: [
              ["@babel/preset-env"],
              {
                useBuiltIns: "usage",
              },
            ], */
          },
        },
      },
```

#### corejs

> Specifying a number will rewrite the helpers that need polyfillable APIs to reference helpers from that (major) version of `core-js` instead Please note that `corejs: 2` only supports global variables (e.g. `Promise`) and static properties (e.g. `Array.from`), while `corejs: 3` also supports instance properties (e.g. `[].includes`).
>
> By default, `@babel/plugin-transform-runtime` doesn't polyfill proposals. If you are using `corejs: 3`, you can opt into this by enabling using the `proposals: true` option.

### 小结

写业务代码使用`polyfill`，写UI组件库使用`@babel/plugin-transform-runtime`。