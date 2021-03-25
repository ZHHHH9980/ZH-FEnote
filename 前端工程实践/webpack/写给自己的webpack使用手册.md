# webpack使用指南

为什么用webpack?

- 之前组件化开发的时候不同功能引入一个js文件，这样的问题是引入文件过多会发送多次HTTP请求。

- 还有一个解决方案是把所有的js文件整合成一个，用闭包的方式互相隔离（避免变量名冲突），但是这样的文件不方便阅读和后期维护。

webpack实际上就是把多个js互相依赖引用的JS文件整合到一起（打包）。开发阶段多个js文件负责不同的功能（模块），上线阶段就整合成一个JS文件，很好地解决了上面的两个问题。



## 使用指南

webpack固然好使，唯一的"缺点"就是要自己配置各种插件和Loader，而且很多命令，很多API不断变化，还得不断查阅官方文档。当然了，不同的插件给webpack带来了更多强大的功能！



### 初始化项目

```
npm init -y
```

在项目里生成`package.json`。



### 安装webpack webpack-cli

```
cnpm install webpack webpack-cli -D
```



### 配置webpack.config.js

```js
'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './src/index.html' // 模板文件
            }
        ),
        new CleanWebpackPlugin()
        ]
};
```

开箱即用的webpack仅支持js,json，要打包html,css等文件还需要另外添加插件或者loader。



#### 单入口与多入口

//=> 单个入口写成对象即可，出口的话使用[name].js的格式

```
module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
}
```



#### **webpack-server**

webpack-server可以监听源代码变化，自动刷新页面。

```
cnpm i webpack-dev-server -D
```



//=> webpack.config.js

```js
module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist')
    }
}
```



### plugin

==引入插件一般都需要在webpack.config.js开头使用`require`==

#### **html**

```
cnpm i html-webpack-plugin -D
```



#### clean-webpack-plugin

这个插件可以在每次打包的时候情况上一次打包的文件，文件名使用HASH的时候特别有用。



### loader

#### style-loader css-loader

```
cnpm i css-loader style-loader -D
```

配置

作用顺序是从右往左，所以css-loader要写在右边。

```js
 module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
    }
```



#### file-loader url-loader

url-loader包含了file-loader，主要用于低于10KB（也可以自己设置）的图片文件转成**Base64**文本格式。

```js
module: {
    rules: [
        {
            test: /\.(png|jpe?g|gif)$/,
            use: 'file-loader'
        }
    ]
}
```



### 为什么后面都要加-D ?

### npm-scripts

- package.json

```json
{
  "name": "webpack-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": { // 在这里配置scripts 会与node_modules形成软链接
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack",
    "dev": "webpack-dev-server --open"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": { // -D 安装以后都会在这里，这样即使哪个loader缺失，webpack也会自动配置上。
    "clean-webpack-plugin": "^3.0.0",
    "file-loader": "^6.0.0",
    "html-webpack-plugin": "^4.3.0",
    "url-loader": "^4.1.0",
    "webpack": "^4.44.1",
    "webpack-cli": "^3.3.12"
  }
}
```

比如运行`webpack-server`就直接在cmd输入`npm run dev`即可，其他同理。