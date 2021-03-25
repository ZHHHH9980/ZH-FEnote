# Webpack加载资源



## 支持图片

- url-loader
- file-loader



### url-loader

> `url-loader` works like [`file-loader`](https://webpack.js.org/loaders/file-loader/), but can return **a DataURL if the file is smaller than a byte limit**.

### file-loader

> The file-loader resolves import/require() on a file into a url and emits the file into the output directory.

将通过`import/require()`引入的文件解析成url，发送到文件的输出目录中。



### 引用实例

```js
let logo = require(./images/webpack.png);
let img = new Image();
img.src = logo;
```

直接编译的话是会报错的，需要安装和配置loader



//=>webpack.config.js

（错误的用法）

```js
module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)$/,
                use: ['file-loader', 'url-loader']
            }
        ]
    },
```

因为url-loader实际上封装了file-loader，两者不能同时使用！



#### url-loader

```js
{
    test: /\.(png|svg|jpg|gif)$/,
    use: [
        // ...
         {
            loader: 'url-loader', //是指定使用的loader和loader的配置参数
             options: {
                 limit:500,  //是把小于500B的文件打成Base64的格式，写入JS
                 name: 'images/[name]_[hash:7].[ext]',
             }
         }
    ]
}
```





## 实用插件plugins



### CleanWebpackPlugin

//=>webpack.config.js

```js
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

plugins: [
    new CleanWebpackPlugin[
        path.resolve(__dirname, 'dist')
    ]
]
```

引入这个插件可以每次编译的时候清空目标目录下的文件。





## 分离CSS

因为CSS的下载可以和JS并行，当一个HTML文件很大的时候可以把**CSS单独分离出来加载**。如果不分离的话，css就会在JS中一起打包加载。



###