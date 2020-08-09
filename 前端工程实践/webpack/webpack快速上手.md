# webpack实践



## 配置webpack

```j
cnpm install webpack webpack-cli -D
```

#### tips

如果webpack-cli安装有问题，可能需要全局安装

```j
cnpm install webpack-cli -g -D
```





//=>webpack.config.js

==多入口文件处理==(如果是单入口，chunk的名字就是main)

```javascript
'use strict';

const path = require('path');

module.exports = {
    entry: {
        index: './src/index.js',
        main: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js' // <=
    },
    mode: 'development'
};
```



## 运行webpack

每次都需要去node_modules/.bin下找webpack执行文件，太麻烦。

可以通过配置npm scripts来让调用webpack更便捷。

//=> package.json

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808151435154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

之后就可以通过

```
npm run build 
```

运行webpack



### webpack-dev-server :star2:

每次修改源文件都需要npm run build，非常麻烦。我们希望每次源代码改变自动打包，刷新浏览器。

安装webpack-dev-server webpack开发服务器

```c
cnpm webpack-dev-server -D
```



//=> package.json

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808151916725.png)



然后需要在

//=>webpack.config.js配置

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808153734622.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)



### 配置的作用？

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808153914676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

这么配置的话的意思就是配置产出文件的根目录。

**不配置的话还用不了服务器监听**..



> 通过devServer产出的文件都会写入内存，而不是写入磁盘，这样访问速度更快。



### 更改端口号

//=> webpack.config.js

```js
devServer:{
    contentBase: path.resolve(__dirname, 'dist'),
    post: 8080
}
```



### 使用npm run dev直接打开浏览器

//=> package.json

```json
"scripts": {
    "dev": "webpack-dev-server --open"
  },
```



## 加载资源



### 加载css

**![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808160614168.png)**

我们直接在index.js加载css是会报错的，因为无法编译。

这时候就需要使用**loader**。

安装`css style loader`

```j
cnpm i css-loader style-loader -D
```



loader配置规则(rules)

- test: 匹配处理文件扩展名的正则表达式
- use: loader名称，就是要使用模块的名称
- include/exclude: 手动执行必须处理的/屏蔽不需要的文件夹
- options: 为loaders提供额外的设置选项



//=>webpack.config.js

```js
module: {
    rules: [
        {
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        }
    ]
}
```

注意顺序，**从右往左**处理css文件,loader是一个函数。



### loader是一个函数？

```javascript
// content: css文件字符串
function cssloader(content) {
    // 处理导入的资源 import 图片
    return content;
}
function styleloader(content) {
    let style = document.createElement('style');
    style.innerHTML = content;
    document.head.appendChild(style);
}
```



#### tips

**![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808160614168.png)

这样写是不行的..

```js
import './index.css';
```

要用相对路径，webpack还是非常严谨的。



### 引入html plugin

[htmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/)

#### 安装

```js
npm install --save-dev html-webpack-plugin
```



#### 基础用法

> The plugin will generate an HTML5 file for you that includes all your webpack bundles in the body using script tags. Just add the plugin to your webpack configuration as follows:

```js
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: 'index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
  plugins: [new HtmlWebpackPlugin()]
};
```



This will generate a file `dist/index.html` containing the following:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>webpack App</title>
  </head>
  <body>
    <script src="index_bundle.js"></script> //<=
  </body>
</html>
```



//=>npm run build

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809084552279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

注意顺序跟webpack.config.js配置的入口文件顺序是一样的。



### Generating Multiple HTML Files

生成多个HTML Files

**webpack.config.js**

```js
{
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin(), // Generates default index.html
    new HtmlWebpackPlugin({  // Also generate a test.html
      filename: 'test.html',
      template: 'src/assets/test.html' //<=模板文件
    })
  ]
}
```