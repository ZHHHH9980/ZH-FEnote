# $.proxy

> ```
> Bind a function to a context, optionally partially applying any arguments.
> ```

将一个函数捆绑到一个上下文中，可选地传入任何参数。



## 用法

```js
var obj = {
  name: "John",
  test: function() {
    alert( this.name );
  }
};

$("#test").click( jQuery.proxy( obj, "test" ) );

// 以下代码跟上面那句是等价的:
// $("#test").click( jQuery.proxy( obj.test, obj ) );

// 可以与单独执行下面这句做个比较。
// $("#test").click( obj.test );
```

其实无非就是围绕一个上下文进行绑定，这个API与`Function.prototype.bind`有异曲同工之妙。也可以帮助复习手写Bind。



先处理`jQuery.proxy( obj.test, obj, [arguments] )`这种比较常见的情况。

```js
zQuery.proxy = function (fn, context) {
    let proxy,
        args;

    if (toString.call(fn) !== '[object Function]') {
        return undefined;
    }

    args = [].slice.call(arguments, 2);
    proxy = function () {
        return fn.apply(context, args);
    };

    return proxy;
};
```

但是注意，我们不能只考虑绑定时传入的参数，函数执行也可以传入参数。

修改后的proxy。

```js
args = [].slice.call(arguments, 2);
proxy = function () {
    return fn.apply(context, args.concat([].slice.call(arguments)));
};
```



接下来处理`$("#test").click( jQuery.proxy( obj, "test" ) );`这种情况

```js
zQuery.proxy = function (fn, context) {
    let proxy,
        args,
        temp;

    if (typeof context === 'string') {
        temp = fn[context];
        context = fn;
        fn = temp;
    }

    if (toString.call(fn) !== '[object Function]') {
        return undefined;
    }

    args = [].slice.call(arguments, 2);
    proxy = function () {
        return fn.apply(context, args.concat([].slice.call(arguments)));
    };

    return proxy;
};
```



再考虑context没传入的情况，直接将`jQuery`对象传入。

```js
proxy = function () {
    return fn.apply(context || this, args.concat([].slice.call(arguments)));
};
```



## 完整版

```js
zQuery.proxy = function (fn, context) {
    let proxy,
        args,
        temp;

    if (typeof context === 'string') {
        temp = fn[context];
        context = fn;
        fn = temp;
    }

    if (toString.call(fn) !== '[object Function]') {
        return undefined;
    }

    args = [].slice.call(arguments, 2);
    proxy = function () {
        return fn.apply(context, args.concat([].slice.call(arguments)));
    };

    return proxy;
};
```

