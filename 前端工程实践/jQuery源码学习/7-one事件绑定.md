# jQuery事件绑定

之前完成了`on off`,现在添加一个需求`one`，通过`one`绑定的事件只能**触发一次**。

```js
$('.a').one('click', () => {
    console.log(1);
})
//=> 按多少次都触发一次
```



## one探索

one实际上还是通过on来进行事件绑定的。

`function on`

```js
//..
if (one === 1) {
    origFn = fn;
    fn = function (event) {
        // Can use an empty set, since event contains the info

        jQuery().off(event);
        return origFn.apply(this, arguments);
    };

    // Use same guid so caller can remove using origFn
    fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
}
```

从这大概就能看到大概原理，先解绑事件，然后调用方法。注意这里解绑是传入`event`，这个`event`是事件对象。



### 1.off 解绑事件

```js
off: function (types, selector, fn) {
    var handleObj, type;
    console.log(types);
    // types=> jQuery封装的事件对象

    if (types && types.preventDefault && types.handleObj) {

        // ( event )  dispatched jQuery.Event
        handleObj = types.handleObj;

        jQuery(types.delegateTarget).off(
            handleObj.namespace ?
            handleObj.origType + "." + handleObj.namespace :
            handleObj.origType,
            handleObj.selector,
            handleObj.handler
        );
        return this;
    }
//...    
```

通过事件对象解绑事件的核心还是把对象中的`handleObj`保存的相关信息提取，再调用`off`。



`event.off`再调用`event.remove`

```js
return this.each(function () {
    jQuery.event.remove(this, types, fn, selector);
});
```



### 2.装载handleObj

不难发现移除事件的核心还是装载handleObj到事件对象上。

jQuery事件对象的封装是在`dispatch`方法上。

```js
 dispatch: function (nativeEvent) {
     var i, j, ret, matched, handleObj, handlerQueue,
         args = new Array(arguments.length);
     // Make a writable jQuery.Event from the native event object
     var event = jQuery.event.fix(nativeEvent);
     console.log(event);
     console.log(event.handleObj); //=> undefined ??
```

这里真的很坑，因为事件触发是异步的，所以打印出来handleObj是存在的。

所以我一直认为handleObj是在`jQuery.event.fix`里装载的，可是找了半天都没找到...最后还是debugger才发现这会根本没装载。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200813102745188.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

为了找这个handleObj真是费了老劲，逼迫我看了几遍`jQuery.Event`，然后发现了钩子机制，回头好好研究一下，不然对不起自己。

`event.dispatch`

可以发现，handleObj在event上的装载是在执行handler之前，也就难怪事件对象上有handleObj了。

```js
while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
    event.currentTarget = matched.elem;

    j = 0;

    // handlers: [{..}, {..}]
    while ((handleObj = matched.handlers[j++]) &&
           !event.isImmediatePropagationStopped()) {
        event.handleObj = handleObj;
        event.data = handleObj.data;
        // special or handler
        // 在这里调用了handler, 传入了参数集合
        ret = ((jQuery.event.special[handleObj.origType] || {}).handle ||
               handleObj.handler).apply(matched.elem, args);
```



### 完善dispatch

之前的zQuery并没有装载handleObj 这里完善一下。

注意，我们这里还需要添加代理对象到事件对象上，$(el).one(type, selector, fn) 实际上是对**el**调用了`addEventListener`。之前在学习on的时候提到过，因此事件对象上还需要装载代理对象，如果没有代理对象，那么就指向本身即可。

```js
dispatch: function (nativeEvent) {
    var ret,
        i,
        j,
        matched,
        handlerQueue,
        handleObj,
        // 这里先不做修正
        handlers = (
            dataPriv.get(this, "events") || Object.create(null)
        )[nativeEvent.type] || [];

    event = zQuery.event.fix(nativeEvent);
    
    // 添加代理对象
    event.delegateTarget = this;
    
    handlerQueue = zQuery.event.handlers.call(this, event, handlers);

    i = 0;

    while ((matched = handlerQueue[i++]) && !event.isPropagationStopped) {

        for (j = 0; j < matched.handlers.length; j++) {
            handleObj = matched.handlers[j];
            // 在event上装载handleObj
            event.handleObj = handleObj;

            // 执行handler,改变this
            ret = handleObj.handler.apply(matched.elem, arguments);
        }
    }

    return ret;
}
```

注意我们并没有对事件对象改写，所以`event`与`nativeEvent`指向相同，并不需要修改arguments。



### 完善Off

这是之前zQuery的off，这里需要添加对事件对象的解绑支持。

```js
off: function (types, selector, fn) {

    return this.each(function () {
        zQuery.event.remove(this, types, selector, fn);
    })
}
```

完善版本

```js
off: function (types, selector, fn) {
    var handleObj;

    // 传入的是事件对象
    if (typeof types === 'object' && types.handleObj) {
        handleObj = types.handleObj;

        $(types.delegateTarget).off(
            handleObj.type,
            handleObj.selector,
            handleObj.handler
        )
    }

    return this.each(function () {
        zQuery.event.remove(this, types, selector, fn);
    })
}
```



### 完善on,添加one处理

有了上面的铺垫，就能玩one咯。

```js
if ((fn === 1 && one === undefined) || one === 1) {
    origFn = fn;
    fn = function (event) {
        $().off(event);
        origFn.apply(this, arguments);
    };

    fn.guid = origFn.guid || (origFn.guid = zQuery.guid++);
}
```

注意这里可能会有两个问题：

1.this指向的问题，如果调用`one`，这个fn的this指向谁？

2.guid的问题，为什么是让origFn的guid赋值给fn？



1.即使是事件代理的情况也不需要担心，所有的情况都在`event.dispatch`中的eventQueue处理好了，我们将被代理的对象传入了handleQueue，所以this的指向不会有误。注意：**fn是在`event.dispatch`中执行的**。

2.主要是考虑传入了同一个函数，之前的函数会被绑定一个guid，再次传入直接用就好了。为什么要这么处理就是因为这里实际上添加了一个**惰性函数**，移除事件的时候不光要移除传入的回调，还要移除这个惰性函数。



### 修改bug

写到这基本上算完成了，但是还遗留了一个Bug，这个Bug来自`event.add`，当初在`event.add`实际上调用`addEventListener`，监听了handle(handle触发dispatch)，这里需要将这个监听器一并移除，而不仅是删去我们传入回调的包装对象。



`event.remove`

```js
remove: function (elem, types, selector, fn) {

    var i,
        events,
        t,
        type,
        handlers,
        elemData = dataPriv.get(elem);


    if (!fn) {
        fn = selector;
    }

    if (!elemData || !(events = elemData.events)) {
        return;
    }

    types = (types || '').match(/[^ ]+/g) || [''];
    t = types.length;

    while (t--) {
        type = types[t];
        handlers = events[type] || [];

        j = handlers.length;

        while (j--) {

            if ((fn && fn.guid === handlers[j].guid)) {
                handlers.splice(j, 1);

                if (handlers.selector) {
                    handlers.delegateCount--;
                }

                if (zQuery.isEmptyObj(handlers)) {
                    delete events[type];
                }
            }
        }

        //  在这里移除浏览器监听的handle
        if (elem && elemData.handle && type) {
            elem.removeEventListener(type, elemData.handle);
        }
    }




    if (zQuery.isEmptyObj(events)) {
        dataPriv.remove(elem, 'handle events');
    }
}
```



## 升级版zQuery

支持`one`仅绑定一次事件，`one`的核心是使用**惰性函数**，先解绑，后调用。

```js
 // one
if ((fn === 1 && one === undefined) || one === 1) {
    origFn = fn;
    fn = function (event) {
        $().off(event);
        origFn.apply(this, arguments);
    };

    fn.guid = origFn.guid || (origFn.guid = zQuery.guid++)
}
```

事件绑定模块就暂时告一段落了，我们可以发现，无论是建立缓存映射，还是事件派发，队列组装，设计得都非常精妙，jQuery真的是非常强大的的类库，考虑的边界非常非常多，但是基本核心语句还就是那几句，只要足够耐心，剥丝抽茧，慢慢地也能摸索出来。



**zQuery**

```js
 /* zQuery! */
(function (window) {
    var zQuery = function (selector, context) {
        return new zQuery.fn.init(selector, context);
    },
        isFlatObj = function (obj) {
            if (typeof obj === 'object') {
                for (var i in obj) {
                    if (typeof obj[i] === 'object') {
                        return false;
                    }
                }
            }
            return true;
        },
        isEmptyObj = function (obj) {
            for (var item in obj) {
                return false;
            }
            return true;
        },
        matchElement = function (node, string) {
            let elClassName = (node || {}).className;

            string = string ? string.substr(1) : '';

            return elClassName === string;
        };

    zQuery.FlatObj = isFlatObj;
    zQuery.isEmptyObj = isEmptyObj;
    zQuery.matchElement = matchElement;

    zQuery.each = function (obj, callback, args) {
        var length, i = 0,
            ret;

        // 如果是数组或者类数组
        if (isArrayLike(obj)) {
            length = obj.length;
            for (; i < length; i++) {
                // 调用callback 传入obj的每一项属性值item 以及索引index
                if (callback.call(obj[i], i, obj[i]) === false) {
                    // if return false 就终止循环
                    break;
                }
            }
        } else {
            // 对象就for in 循环
            for (i in obj) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        }

        return obj;
    };

    zQuery.fn = zQuery.prototype = {
        constructor: zQuery
    };

    // 1. $.fn.extend({}) 扩展jQuery本身
    // 2. $.fn.extend(true, {}, {}) 深拷贝
    // 3. $.fn.extend({}, {}) 浅拷贝
    zQuery.extend = zQuery.fn.extend = function () {
        var length = arguments.length,
            i = 1,
            options,
            name,
            copy,
            deep = false,
            target = arguments[0];

        if (typeof target === 'boolean') {
            deep = target;

            target = arguments[i];
            i++;
        }

        if (typeof target !== 'object') {
            target = {};
        }

        // 扩展$.fn/$
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            // 遍历传入的每一个对象
            if ((options = arguments[i]) !== null) {

                // 遍历传入对象的每一个属性
                // 这里以options的属性为主导，添加/覆盖target上的属性
                for (name in options) {
                    // 被拷贝的属性值
                    copy = options[name];

                    if (target === copy) {
                        continue;
                    }

                    // 拷贝和被拷贝值都得是对象才进入深拷贝
                    if (deep && copy && (!isFlatObj(copy) && !isFlatObj(target[name]))) {
                        target[name] = zQuery.extend(deep, target[name], copy);
                    } else if (copy != undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        // 返回深拷贝结束的target[ name ]
        return target;
    }

    var init = zQuery.fn.init = function (selector, context) {
        var match = [],
            nodeList,
            i = 0;

        context = context || document;

        // $() 相当于调用原型方法
        if (!selector) {
            return this;
        }

        if (selector === document) {
            this[i] = document;
            return this;
        }

        // dom元素 仅支持单个dom元素
        if (selector.nodeType === 1) {
            this[i] = selector;
            return this;
        }

        if (typeof selector === 'string') {

            // .class #id
            if (selector[0] === ('.' || '#')) {
                nodeList = context.querySelectorAll(selector);
            }

            while (nodeList[i]) {
                this[i] = nodeList[i];
                i++;
            }

            this['length'] = i;
            return this;
        }


    },
        isArrayLike = function (obj) {
            var length = obj.length;

            if (!obj || !('length' in obj)) {
                return false;
            }

            return Array.isArray(obj) || !!(typeof obj === 'object' && obj[length - 1]);

        },
        dataAttr = function (elem, key, data) {
            var name;

            if (elem.nodeType === 1 && data === undefined) {
                if (typeof key === 'string') {
                    name = 'data-' + key;
                    data = elem.getAttribute(name);

                    // set data to cache
                    dataUser.set(elem, key, data);
                }
            } else {
                data = undefined;
            }

            return data;
        };

    init.prototype = zQuery.fn;

    zQuery.fn.extend({
        each: function (callback, args) {
            return zQuery.each(this, callback, args);
        },
        on: function (types, selector, fn) {
            return on(this, types, selector, fn);
        },
        one: function (types, selector, fn) {
            return on(this, types, selector, fn, 1);
        },
        off: function (types, selector, fn) {
            var handleObj;

            // 传入的是事件对象
            if (typeof types === 'object' && types.handleObj) {
                handleObj = types.handleObj;

                $(types.delegateTarget).off(
                    handleObj.type,
                    handleObj.selector,
                    handleObj.handler
                )
            }

            return this.each(function () {
                zQuery.event.remove(this, types, selector, fn);
            })
        },
        trigger: function (type, data) {
            this.each(function () {
                zQuery.event.trigger(this, type, data);
            })
        }
    });

    function on(elem, types, selector, fn, one) {
        var origFn;

        // (types, fn)
        if (!fn) {
            fn = selector;
            selector = null;
        }


        // one
        if ((fn === 1 && one === undefined) || one === 1) {
            origFn = fn;
            fn = function (event) {
                $().off(event);
                origFn.apply(this, arguments);
            };

            fn.guid = origFn.guid || (origFn.guid = zQuery.guid++)
        }

        // add(elem, type, handle, selector)
        // 支持多个对象绑定事件
        return elem.each(function () {
            zQuery.event.add(this, types, fn, selector);
        })
    }

    /* 缓存模块开始 */
    zQuery.guid = 1;
    zQuery.expando = "zQuery" + ('' + Math.random()).replace(/\D/g, "");

    function Data() {
        this.expando = zQuery.expando + Data.uid++;
    }

    Data.uid = 1;

    Data.prototype = {
        cache: function (owner) {
            var value = owner[this.expando];

            if (!value) {
                value = {};

                if (owner.nodeType) {
                    owner[this.expando] = value;
                }
            }

            return value;
        },
        get: function (owner, key) {
            return key === undefined ?

                this.cache(owner) :

            owner[this.expando] && owner[this.expando][key];
        },
        set: function (owner, data, value) {
            var cache = this.cache(owner),
                prop;

            if (typeof data === 'string') {
                cache[data] = value;

            } else {
                for (prop in data) {
                    cache [prop] = value;
                }
            }

            return cache;
        },
        remove: function (owner, key) {
            var i,
                cache = owner[this.expando];

            if (cache === undefined) {
                return;
            }

            if (key !== undefined) {
                // 'events' 直接使用 'events handle' 分割成数组
                key = key in cache ?
                    [key] :
                (key.match(/[^ ]+/g) || []);
                i = key.length;

                while (i--) {
                    delete cache[key[i]];
                }


                if (zQuery.isEmptyObj(cache)) {
                    if (owner.nodeType) {
                        delete owner[this.expando];
                    }
                }
            }
        }
    };

    var dataPriv = new Data();

    var dataUser = new Data();
    /* 缓存模块结束 */

    // var init = {
    //     elem: {
    //         jQuery351046541611:{
    //             events: {
    //                 // 'click'
    //                 handlers: [
    //                     handleObj: {
    //                         type: type, // 填充类型
    //                         // fn
    //                         handler: f(),
    //                         // handler.guid fn上也保存了id
    //                         guid: handler.guid
    //                     }
    //                 ]
    //             },
    //             handle: f( e )
    //         }
    //     }
    // }
    zQuery.event = {
        // 1.创建缓存对象 与 dom对象建立映射（通过添加expando属性）
        // 2.addEventListener
        // 3.将监听的事件派发
        // @params: types -> 'string' 支持绑定多个事件
        add: function (elem, types, handle, selector) {
            var handleObj,
                elemData = dataPriv.get(elem),
                handlers,
                type,
                t;

            if (!handle) {
                return;
            }

            if (!handle.guid) {
                handle.guid = zQuery.guid++;
            }

            // 创建events
            if (!elemData.events) {
                elemData.events = {};

            }

            // 创建handle
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function (e) {

                    return zQuery.event.dispatch.apply(elem, arguments);
                };
            }

            types = (types || '').split(' ');
            t = types.length;

            while (t--) {

                type = types[t] || '';
                // 创建存放数据的数组

                if (!type) {
                    continue;
                }


                if (!(handlers = elemData.events[type])) {
                    // 初始化events
                    handlers = elemData.events[type] = [];
                    handlers.delegateCount = 0;

                    if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandle);
                    }
                }


                // 创建数组中要存放的事件相关信息
                // handleObj = {
                //     type: type,
                //     handler: handle,
                //     guid: handle.guid
                // };
                handleObj = {
                    type: type,
                    handler: handle,
                    guid: handle.guid,
                    selector: selector
                };

                // 数据压入数组
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }
            }

            return this;
        },

        // zQuery.event.off(this, types, selector, fn);
        // handlers 是传入回调的包装对象
        // handlers[j].handler 就是传入的回调
        remove: function (elem, types, selector, fn) {

            var i,
                events,
                t,
                type,
                handlers,
                elemData = dataPriv.get(elem);


            if (!fn) {
                fn = selector;
            }

            if (!elemData || !(events = elemData.events)) {
                return;
            }

            types = (types || '').match(/[^ ]+/g) || [''];
            t = types.length;

            while (t--) {
                type = types[t];
                handlers = events[type] || [];

                j = handlers.length;

                while (j--) {

                    if ((fn && fn.guid === handlers[j].guid)) {
                        handlers.splice(j, 1);

                        if (handlers.selector) {
                            handlers.delegateCount--;
                        }

                        if (zQuery.isEmptyObj(handlers)) {
                            delete events[type];
                        }
                    }
                }

                //  在这里移除浏览器监听的handle
                if (elem && elemData.handle && type) {
                    elem.removeEventListener(type, elemData.handle);
                }
            }




            if (zQuery.isEmptyObj(events)) {
                dataPriv.remove(elem, 'handle events');
            }
        },

        dispatch: function (nativeEvent) {
            var ret,
                i,
                j,
                matched,
                handlerQueue,
                handleObj,
                // 这里先不做修正
                handlers = (
                    dataPriv.get(this, "events") || Object.create(null)
                )[nativeEvent.type] || [];

            event = zQuery.event.fix(nativeEvent);

            event.delegateTarget = this;

            handlerQueue = zQuery.event.handlers.call(this, event, handlers);

            i = 0;

            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped) {

                for (j = 0; j < matched.handlers.length; j++) {
                    handleObj = matched.handlers[j];
                    // 在event上装载handleObj
                    event.handleObj = handleObj;

                    // 执行handler,改变this
                    ret = handleObj.handler.apply(matched.elem, arguments);
                }
            }

            return ret;
        },

        trigger: function (elem, type, data) {
            var handle = dataPriv.get(elem) && dataPriv.get(elem).handle,
                event = {};

            console.log(handle);

            event.type = type;
            data = [event].concat(data);

            if (handle) {
                handle.apply(elem, data);
            }
        },

        handlers: function (event, handlers) {
            var i,
                cur,
                sel,
                handleQueue = [],
                handleObj,
                isMatched,
                matchHandler,
                delegateCount = handlers.delegateCount;

            cur = event.target;

            if (delegateCount && cur.nodeType) {

                // 向上遍历每个元素节点
                for (; cur !== this; cur = cur.parentNode || this) {

                    if (cur.nodeType === 1) {
                        matchHandler = [];

                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];
                            sel = handleObj.selector;
                            isMatched = zQuery.matchElement(cur, sel);

                            if (isMatched) {
                                matchHandler.push(handleObj);
                            }
                        }

                        // 每匹配完一个就先装载事件，保证顺序
                        if (matchHandler.length) {
                            handleQueue.push({elem: cur, handlers: matchHandler});
                        }
                    }
                }
            }

            // 开始处理元素本身绑定的事件
            cur = this;
            if (handlers.length > delegateCount) {
                handleQueue.push({elem: cur, handlers: handlers.slice(delegateCount)})
            }
            return handleQueue;
        },

        fix: function (nativeEvent) {
            nativeEvent.stopPropagation = function () {
                this.isPropagationStopped = true;
            };
            return nativeEvent;
        }
    };

    // $().data() 自定义属性
    zQuery.fn.extend({
        data: function (key, value) {
            var elem = this[0];


            // get value from html5 custom data attr or cache
            // $(el).data(key)
            if (elem && value === undefined) {

                // 先从缓存中获取
                data = dataUser.get(elem, key);
                if (data !== undefined) {
                    return data;
                }

                // 再从标签中获取
                data = dataAttr(elem, key);
                if (data !== undefined) {
                    return data;
                }
            }

            // set data
            // $(el).data(key, value)
            this.each(function () {
                dataUser.set(this, key, value);
            })
        },

        removeData: function (key) {
            return this.each(function () {
                dataUser.remove(this, key);
            })
        }
    });
    window.$ = zQuery;
})(window);
```

