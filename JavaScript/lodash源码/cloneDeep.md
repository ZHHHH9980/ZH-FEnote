# cloneDeep

适用大多场景的深拷贝：

```js
function deepCopy(target, cache = new Set()) {
  // 注意环引用
  if ((typeof target !== "object" && target !== null) || cache.has(target)) {
    return target;
  }
  if (Array.isArray(target)) {
    return target.map((t) => {
      cache.add(t);
      return t;
    });
  } else {
    // 注意symbol key
    return [
      ...Object.keys(target),
      ...Object.getOwnPropertySymbols(target),
    ].reduce(
      (res, key) => {
        cache.add(target[key]);
        res[key] = deepCopy(target[key], cache);
        return res;
      },
      target.constructor !== Object
        ? Object.create(target.constructor.prototype)
        : {}
    ); // 继承
  }
}
```



### reduce

```js
const array = [1, 2, 3, 4];
array.reduce((res, key) => {
    res[key] = key;
    return res;
}, {});
//=> {1: 1, 2: 2, 3: 3, 4: 4}
```

如果reduce第二个参数没有传，就会使用array中的第一个值作为**累加器**；

reduce一定要返回**累加之后的累加器**,作为下次的初始值；



```js
 // 注意symbol key
return [
    ...Object.keys(target),
    ...Object.getOwnPropertySymbols(target),
].reduce(
    (res, key) => {
        cache.add(target[key]);
        res[key] = deepCopy(target[key], cache);
        return res;
    },
    target.constructor !== Object
    ? Object.create(target.constructor.prototype)
    : {}
); // 继承
```

这段代码的语义是，取出Object中的keys，包括symbol;

传入一个空对象，使用`reduce`不断从



## clone



### cloneRegExp

`RegExp.prototype.exec()`

> ```
> regexObj.exec(str)
> ```

`str`

要匹配正则表达式的字符串,传入的值都会被转成字符串；

```js
/\w*$/.exec( /a/gim); // gim
["gim", index: 3, input: "/a/gim", groups: undefined]
```

剩下没有匹配的字符串会被返回，放入数组[0]的位置；



## 参考

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

https://cloud.tencent.com/developer/article/1540790