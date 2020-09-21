# Animate

> zQuery最后一个部分，也是最难的一部分，整个jQuery动画涉及到太多复杂的兼容处理，甚至还加入了Deffered延迟对象。

zQuery参考了jQuery的基本思路，用尽可能少的代码实现类似的功能。



## Animate动画管控思路

实现动画无非就是`setTimeout`,`setInterval`，`requestAnimationFrame`但是使用这些API是非常消耗性能的，如果为每个对象都开启一个定时器消耗非常大。

jQuery**仅使用一个定时器对动画进行管理**，在全局作用域下用timers这个数组装载动画执行的对象，每隔一段时间就监控timers，让timers里的对象执行动画的一部分。



## queue

一个页面可能涉及到多个动画，jQuery使用了模拟队列的方式进行管控。队列可以在全局声明，但是同一个对象可能进行多个运动绑定，所以jQuery在这里也用了缓存系统。



### 入队

介绍入队前得先解决animate接口

$(elems).animate({opacity: 1, width: 300})

调用animate接口可能是让**多个dom对象**都进行运动，而且**改变的属性**可能有多个。

多个dom对象-> $.each 遍历



**外部接口**

作用就是遍历多个dom对象，返回zQuery对象便于链式写法。

```js
zQuery.fn.extend({
    animate: function (options, duration, easing, callback) {
        $.each(this, function (_, elem) {
            zQuery.animate(elem, options, duration, easing, callback);
        });

        return this;
    }
});
```



**内部animate**

每次入队的函数都产生对相应属性的一个动画管控对象FX。

```js
zQuery.extend({
    animate: function (elem, options, duration, easing, callback) {
        let operate = modifyOptions(duration, easing, callback);
    
        $.each(options, function (name, value) {
            $(this).queue(function () {
                let elem = this;
                
                // 遍历每个属性，生成一个fx对象进行管控
                let fx = new Fx(elem, operate, name),
                    start = parseInt($(elem).css(name)),
                    end = value;
                
                // 根据动画起始位置
                fx.custom(start, end);
            })
        });
    }
});
```



### 出队

为了让动画保证有序地执行，我们在上个动画结束的时候就通知下一个动画出队。

我们知道，调用animate的时候可以传入一个`callback`用于动画结束执行的回调函数。

在内部animate方法调用的时候，我们对参数进行了修正。我们可以在这里对`callback`进行修改，让其在调用的时候让下一个任务出队。

```js
function modifyOptions(duration, easing, callback) {
    let obj = {
        duration: duration,
        easing: easing
    };

    obj.callback = function () {
        callback && callback();
        $(this).dequeue();
    }
}
```



## queue简易实现

原理同animate类似，都是外部接口负责处理多个dom元素。

```js
zQuery.fn.extend({
    queue: function (fn) {
        // 在这里加一个'fx'动画标识
        let type = 'fx';

        return fn === undefined ?
            this :
        this.each(function () {
            let elem = this;
            zQuery.queue(elem, type, fn);
        });
    },
    dequeue: function (type) {
        return this.each(function () {
            zQuery.dequeue(this, type);
        })
    }
});
```



内部主要是根据标识创建/获取队列相关的缓存。

```js
// queue
zQuery.extend({
    queue: function (elem, type, fn) {
        var queue;

        if (elem) {
            type = (type || "fx") + "queue";

            queue = dataPriv.get(elem, type);
            
            // 没传入fn就仅作为队列查询
            if (fn) {
                if (!queue) {
                    // 没有缓存的情况下就设置缓存
                    dataPriv.set(elem, type, [fn]);
                } else {
                    // 有就直接压入队列
                    queue.push(fn);
                }
            }
        }

        return queue;
    },
    dequeue: function (elem, type) {
        // 取出队列
        var queue = zQuery.queue(elem, type),
            fn = queue.shift();

        if (fn) {
            fn.call(elem);
        }
    }
});
```



## Fx

Fx主要用于对每个动画属性的管理。暂时只初始化三个属性。

```js
function FX(elem, options, name){  
    this.elem = elem;  
    this.options = options;  
    this.name = name;  
}
```



### custom

> custom方法的任务主要是把当前fx对象放入全局的timer,并且启动定时器来观察动画执行情况。





## 参考

[jquery1.43源码分析之动画部分](https://www.iteye.com/topic/786984)