# babel-polyfill VS babel-runtime VS babel-preset-env

## babel-polyfill

babel-polyfill 是为了模拟一个完整的ES2015+环境，旨在用于应用程序而不是库/工具。这里要注意的是babel-polyfill是一次性引入你的项目中的，并且同项目代码一起编译到生产环境。而且会污染全局变量。像Map，Array.prototype.find这些就存在于全局空间中。



## babel-runtime

babel-runtime不会污染全局空间和内置对象原型。事实上babel-runtime是一个模块，你可以把它作为依赖来达成ES2015的支持。

比如环境不支持Promise，你可以在项目中加入

```js
require(‘babel-runtime/core-js/promise’)
```

来获取Promise。

这样我们就弥补了babel-polyfill的缺点，达到了**按需加载**的效果。但是在实际项目开发过程中，我们往往会写很多新的es6 api，每次都要手动引入相应的包比较麻烦，维护起来也不方便，每个文件重复引入也造成代码的臃肿。



❗❗❗

之前babel-runtime有个缺点是无法实现实例上的方法，如:Array.from等api。

但现在只要安装`corejs3`在babelrc上配置就能够实现：

参考官网：

> Specifying a number will rewrite the helpers that need polyfillable APIs to reference helpers from that (major) version of `core-js` instead Please note that `corejs: 2` only supports global variables (e.g. `Promise`) and static properties (e.g. `Array.from`), while `corejs: 3` also supports instance properties (e.g. `[].includes`).

```js
// babelrc
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "absoluteRuntime": false,
        "corejs": 3,
        "helpers": true,
        "regenerator": true,
        "version": "7.0.0-beta.0"
      }
    ]
  ]
}
```



## babel-preset-env

babel-preset-env 能根据当前的运行环境，自动确定你需要的 plugins 和 polyfills。通过各个 es标准 feature 在不同浏览器以及 node 版本的支持情况，再去维护一个 feature 跟 plugins 之间的映射关系，最终确定需要的 plugins。

```js
// .babelrc
{
  "presets": [
    ["env", {
      "targets": {
        "chrome": 52,
        "browsers": ["last 2 versions", "safari 7"]
      },
      "modules": false,
      "useBuiltIns": "usage",
      "debug": false
    }]
  ]
```

## 总结

对比以上三种方案，我们得出以下结论

| 方案                                | 打包后大小 | 优点                 | 缺点                                   |
| ----------------------------------- | ---------- | -------------------- | -------------------------------------- |
| babel-polyfill                      | 259K       | 完整模拟ES2015+环境  | 体积过大；污染全局对象和内置的对象原型 |
| babel-runtime                       | 63K        | 按需引入，打包体积小 | 安装core-js3可以模拟实例方法           |
| babel-preset-env（开启useBuiltIns） | 194K       | 按需引入，可配置性高 |                                        |



## 参考

[babel-polyfill VS babel-runtime VS babel-preset-env](https://juejin.cn/post/6844903602822053895#heading-1)