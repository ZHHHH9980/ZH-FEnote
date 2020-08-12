# 正则

正则其实不是特别难，最大的问题是经常忘，不过还好有jQuery这样的框架，会经常给你上上课，哈哈。



## #1

- camelCase

```js
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
```

这里用了replace，传入字符串和回调都用上了。

先分析第一个

```js
var rmsPrefix = /^-ms-/;
string.replace( rmsPrefix, "ms-" )
// '-ms-' => 'ms-'
```



接下来是回调

```js
var rdashAlpha = /-([a-z])/g;
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

return string.replace(rdashAlpha, fcamelCase) 
// 正则匹配的就是'xx-xx' 中的 '-x'，而且是全局匹配
// 再来看回调的两个参数 _all 是整个正则匹配的字符串
// letter 是第一个分组匹配到的内容
// 每次匹配 replace会把 _all匹配的字符串替换成return 中的字符串
// 'xx-ax-bx' => [_all: '-a'  letter: 'a', string: 'xxAx-bx']
// 'xxAx-bx' => [_all: '-b', letter: 'b', string: 'xxAxBx']
```

实际上就是将 data-src 转成dataSrc的驼峰命名。