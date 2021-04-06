# webpack底层原理

## 如何编写一个Loader

编写一个替换字符串loader:

```js
// replaceLoader.js
// source是编译后源代码字符串
module.exports = function(source) {
    return source.replace('hello', 'bye');
}
```

引入loader:

```js
module.exports = {
    // ...
    module: {
        rules: [{
            test: /.\js/,
            use: [path.resolve(__dirname, './loaders/replaceLoader.js')]
        }]
    }
}
```

> loader中的module.exports一定要使用`function`，而不是箭头函数，因为this会被webpack改写；