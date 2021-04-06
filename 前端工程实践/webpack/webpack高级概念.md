# webpack



## TreeShaking

 TreeShaking只支持ES Module。

应用场景：

```js
// math.js
export const add = (a, b) => a + b;
export const minus = (a, b) => a - b;
```

在index.js中引入。

```js
// index.js
import { add } from "./math";
console.log("add(1,2)", add(1, 2));
```

仅引入add，但是看打包后的代码：

```js
// bundle.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "minus", function() { return minus; });
const minus = (a, b) => a - b;
```

minus也同样被打包了。



### treeShaking配置

```js
// webpack.config.js
module.exports = { 
// ...
optimization:{
    useExports: true
  },
} 
```

如果sideEffects设置为false，将对所有引入模块进行` treeShaking`

```js
// package.json
{
 "sideEffects": [
    "*.css"
  ],
}
```





## Development & Production mode distinction

两种模式区分打包方式：

```js
// webpack.dev.js
module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  // ...
}
```



```js
// webpack.prod.js
module.exports = {
  mode: "production",
  devtool: "cheap-module-source-map",
  // ...
}
```

package.json配置

```js
// package.json
"scripts": {  
    "build": "webpack --config webpack.prod.js",
    "dev": "webpack-dev-server --config webpack.dev.js --open",
  },
```



### webpack-merge

用于合并重复的`webpack`配置。

```js
// webpack.prod.js

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");

const devConfig = {
  mode: "production",
  devtool: "cheap-module-source-map",
  plugins: [new CleanWebpackPlugin()],
};
module.exports = merge(commonConfig, devConfig);
```



## code-splitting

需求场景如下：

```js
// main.js
import lodash from 'lodash';

console.log(lodash.join(['a','b','c']))
// N行代码
// 修改里面的业务逻辑
console.log(lodash.join(['a','b','c']))
```

每次修改里面的业务逻辑，都需要**重新打包**引入的lodash，而lodash并未发生变化。



解决方案一：

```js
// lodash.js
import lodash from 'lodash';
window.lodash = lodash;
```

修改入口配置：

```js
// webpack.config.js
module.exports = {
    entry: {
        main: "./main.js",
        lodash: "./lodash.js"
    }
}
```

这样就不需要在业务代码里引入lodash，提高了开发效率。

```js
// main.js

console.log(lodash.join(['a','b','c']))
// N行代码
// 修改里面的业务逻辑
console.log(lodash.join(['a','b','c']))
```



### 智能code-splitting

`code-splitting`的概念并不是webpack独有的，但是webpack能够智能化`code-splitting`。

```js
module.exports = {
    //... 
    optimization: {
        splitChunks: {
          chunks: "all",
        },
  },
}
```



### 异步载入组件

这种方式即使不配置`webpack.config.js`，也可以实现code-splitting，只在有需要的时候才加载模块。

```js
function getComponent() {
    return import('lodash').then(({default: lodash}) => {
        var element = document.createElement('div');
        element.innerHTML = lodash.join(['dell','Lee'], '-');
        return element;
    })
}

getComponent().then(element => {
    document.body.appendChild(element);
})
```



## SplitChunksPlugin 配置参数

### @babel/plugin-syntax-dynamic-import

`babel`动态引入插件，支持`magic comment`，主要功能还是支持异步引入模块；

```js
function getComponent() {
  // magic comment
  return import(/* webpackChunkName:"lodash" */ "lodash").then(
    ({ default: lodash }) => {
      var ele = document.createElement("div");
      ele.innerHTML = lodash.join(["How", "zhong"], "-");
      return ele;
    }
  );
}
```



### splitChunks配置参数

```js
// webpack.config.js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      automaticNameMaxLength: 30,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```



`splitChunks.chunks`

> This indicates which chunks will be selected for optimization. When a string is provided, valid values are `all`, `async`, and `initial`. Providing `all` can be particularly powerful, because it means that chunks can be shared even between async and non-async chunks.

`all`可以打包同步和异步模块，并且在模块之间共享；

`async`只打包异步模块；

需要配合`cacheGroups`使用：

```js
cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
```

其中的`vendors`以及`default`代表一个族群，一旦符合这个条件，就会进行代码分割；



`splitChunks.minChunks:[Number]`

模块至少被引入[Number]次才会进行打包；

❗：如果项目包含**按需加载**的module，那么该项无效，**因为无法确认异按需加载次数。**



`splitChunks.maxAsyncRequests:[Number]`

最高异步请求次数，如果引入类库超过这个次数就不会再进行代码分割。



``splitChunks.cacheGroups.reuseExistingChunk`

复用已经打包过的模块；



## lazyLoading

改造之前的异步加载模块实现**按需加载模块**：

```js
// 原代码
function getComponent() {
  // magic comment
  return import(/* webpackChunkName:"lodash" */ "lodash").then(
    ({ default: lodash }) => {
      var ele = document.createElement("div");
      ele.innerHTML = lodash.join(["How", "zhong"], "-");
      return ele;
    }
  );
}

getComponent();
```



```js
async function getComponent() {
    const {default: lodash} = await import(/* webpackChunkName:"lodash" */ "lodash")
    const ele = document.createElement("div");
    ele.innerHTML = lodash.join(["How", "zhong"], "-");
    return ele;
}

// 监听到页面点击事件之后再加载模块
document.addEventListener('click', () => {
    getComponent().then(ele => {
        document.body.appendChild(ele);
    })
})
```



## Prefetch Preload 

异步的逻辑代码可以单独抽离出一个chunk，进行按需加载，减少首屏代码加载负担。

```js
// src/index.js
document.addEventListener('click', () => {
    import('./click.js').then(func => {
        func();
    })
})
```

```js
// src/click.js
const handleClick = () => {
    const ele = document.createElement("div");
    ele.innerHTML = "How zhong";
    document.body.appendChild(ele);
}

export default handleClick;
```

这样只有在点击的时候才会去发起请求加载click这个chunk，但是也伴随着一个问题，如果这个chunk过大，加载时间过长，就会导致页面卡顿，影响用户体验；



`Prefetch`和`Preload`，顾名思义，预先获取和预先加载，二者区别：

`Prefetch`：等到主要逻辑代码加载完才发起请求

`Preload`：同主要逻辑代码一起加载

语法跟之前命名chunk类似：

```js
// src/index.js
document.addEventListener('click', () => {
    import(/* webpackPrefetch: true */'./click.js').then(func => {
        func();
    })
})
```



## webpack&浏览器缓存

```js
// webpack.common.js
module.exports = {
    //...
    output: {
    filename: "main.js",
    path: path.resolve(__dirname, "../dist"),
  },
}
```

如果在`production` mode下输出main.js，下次将该文件传送到服务器上，用户刷新并不会再次请求，而是走浏览器缓存。

解决方案：`contenthash`

```js
// webpack.dev.js
const proConfig = {
  //...
  output: {
    filename: "[name].[contentHash].js",
    path: path.resolve(__dirname, "../dist"),
  },
};
module.exports = merge(commonConfig, proConfig);
```

:star:如果文件内容不变，那么打包生成的hash也将不变；



## shimming

> 作用：
>
> 1. 全局注入，自动引入lodash等依赖
> 2. 修改全局变量，如this等

[shimming](https://webpack.js.org/guides/shimming/)

