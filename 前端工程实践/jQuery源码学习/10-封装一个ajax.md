# zQuery-ajax

jQuery的ajax库进行了各种封装处理，体积庞大，支持的功能非常多，我们这里套一个jQuery的壳子封装一个自己的简易ajax库。



## jQuery中的AJAX常用功能

```js
$.ajax(url, options)
/*
*		url: 接口地址
*		method: 请求方式 get/post...
*			get请求基于?传参
*			post请求基于请求主体
*
*		data的格式可以是字符串也可以是对象,如果是对象类型，
*	会转成 xxx=xxx&xxx=xxx (www-form-urlencoded),
*	如果是字符串就直接拼接到url后面
*
* 		data-type: 预设置获取结果的数据格式：JSON/HTML..
*		jQ内部把获取的字符串转成JSON格式的对象=> 并不会影响
*服务器返回的结果，只是把返回的结果进行了二次处理。
*
*		async: 设置同步异步（true:同步）
*		cache: 设置get请求是否建立缓存。当我们设置false
*并且当且请求是get请求，会在请求的url地址末尾追加随机数
*（时间戳）
*		success: 回调，当ajax请求成功执行,jQ执行回调函数的
*	时候会把从响应主体中获取的结果当作参数传递给回调函数
*		error:	请求失败后的回调函数	
*
*/
$.ajax({
	url: url,
    method: 'post',
    data:{
        name:'zz',
        age: 18
    },
    async: true,
    cache: true,
    success: () => {
        
    },
    error: () => {
        
    }
})
```

不仅支持传入回调，还支持链式写法。

```js
$.ajax().done(() => {
    
}).fail(() => {
    
})
```



### 搭建框架

我们这里模拟jQuery无new创建实例，将ajax单独包装起来。

为了能够支持链式写法，我们使用**promise**进行异步管理。

```js
/*
* ajax
* */
zQuery.extend({
    ajaxDefaultSettings: {
        method: 'GET',
        data: null,
        dataType: 'JSON',
        async: true,
        cache: true
    },

    ajax: function (options) {
        return new zQuery.ajax.prototype.init(options);
    },


});
zQuery.ajax.prototype = {
    constructor: zQuery.ajax,
    init: function (options) {
        let {
            url,
            method = 'get',
            data = null,
            dataType = 'JSON',
            async,
            cache
        } = $.extend(zQuery.ajaxDefaultSettings, options);

        // 配置挂载mount
        $.zorEach(['url', 'method', 'data', 'dataType', 'async', 'cache'], (item) => {
            this[item] = eval(item);
        });

        return this.send();

    },
    /*
            * 
            * send request
            * */
    send: function () {
        let {
            method, url, async, data
        } = this,
            xhr = XMLHttpRequest();

        let promise = new Promise((resolve, rejected) => {
            // success
            
            // fail
        })

        return promise;
    },
    done: function (callback) {

    },
    fail: function (callback) {

    }
};

zQuery.ajax.prototype.init.prototype = zQuery.ajax.prototype;
```



### 处理不同的响应状态

```js
zQuery.ajax.prototype = {
	send: function() {
        let {
            method, url, async, data, success, error
        } = this,
            xhr = XMLHttpRequest();

        let promise = new Promise((resolve, rejected) => {
            // success
            if (xhr.readyState === 4) {

            }
            
            // fail
            // 如果不是以2/3开头的状态码就认定为失败
            if(!/^(2|3)\d{2}$/.test(xhr.status)) {
                // error 是传入的回调 fail是promise的链式调用
                error && error();
                fail && fail();
            }
        })

        return promise;
    }
}
```



### 处理cache

```js
zQuery.ajax.prototype = {
	handleCache: function() {
        let {url, method, cache} = this,
            timeStamp = `_=${+(new Date())}`;
        
        // 不需要缓存就在后面+时间戳，保证每次url都不重复
        if (/^get$/i.test(method) && cache === false) {
            // xx.xx?x=1 -> xx.xx?x=1& 
            // xx.xx -> xx.xx?
            url += url.indexOf('?') > -1 ? '&' : '?';
            url += timeStamp;
            this.url = url;
        }
    }
}
```





### 处理dataType

返回的格式可以是'JSON‘,'XML'等等，需要对用户传入的参数做不同处理。

```js
zQuery.ajax.prototype = {
	handleDataType: function (xhr) {
        let dataType = this.dataType.toUpperCase(),
            result = xhr.responseText;
        
        if (dataType === 'JSON') {
            result = JSON.parse(result);
        } else if (dataType === 'XML') {
            result = xhr.responseXML;
        }
        // default: 'TEXT'
        return result;
    } 
}
```



### 处理data

对于`get`系列请求方式，需要使用`www-form-urlencode`传参。

```js
zQuery.ajax.prototype = {
	handleData: function () {
        let {method, url, data} = this,
        	getReg = /^(get|head|options|delete|trace)$/i,
            formatedData;
        
        // null
        if (!data) {
            return;
        }
        
        formatedData += url.indexOf('?') > -1 ? '&' : '?';
        
        if (typeof data === 'object' && getReg.test(method)) {
            data.zorEach(data, (key, value) => {
                formatedData += `${key}=${value}`; 
            })
            this.url = formatedData;
            this.data = null;
        }
    } 
}
```



## 组装

按照不同的部件，应该先装`data`，再装`cache`（url尾部加时间戳）。data完成以后就可以发送请求了。而`dataType`是对结果的处理。

```js
zQuery.ajax.prototype = {
    constructor: zQuery.ajax,
    init: function (options) {
        let {
            url,
            method = 'get',
            data = null,
            dataType = 'JSON',
            async,
            cache,
            success,
            error
        } = $.extend(zQuery.ajaxDefaultSettings, options);

        // 配置挂载mount
        $.zorEach(['url', 'method', 'data', 'dataType', 'async', 'cache', 'success', 'error'], (item) => {
            this[item] = eval(item);
        });

        return this.send();

    },
    /*
    *
    * send request
    * */
    send: function () {
        this.handleData();
        this.handleCache();

        let {
            url, method, async, data, success, error
        } = this,
            xhr = new XMLHttpRequest();

        let promise = new Promise((resolve, rejected) => {
            xhr.open(method, url, async);
            xhr.onreadystatechange = () => {
                // success
                if (xhr.readyState === 4) {
                    
                    console.log('success');
                    let ret = this.handleDataType(xhr);
                    success && success(ret);
                    resolve(ret);
                }

                // fail
                // 如果不是以2/3开头的状态码就认定为失败
                if(!/^(2|3)\d{2}$/.test(xhr.status)) {
              
                    error && error();
                    rejected();
                }
            };
            xhr.send(data);
        });

        return promise;
    },

    handleCache: function() {
        let {url, method, cache} = this,
            timeStamp = `_=${+(new Date())}`;

        // 不需要缓存就在后面+时间戳，保证每次url都不重复
        if (/^get$/i.test(method) && cache === false) {
            // xx.xx?x=1 -> xx.xx?x=1&
            // xx.xx -> xx.xx?
            url += url.indexOf('?') > -1 ? '&' : '?';
            url += timeStamp;
            this.url = url;
        }
    },

    handleData: function () {
        let {method, url, data} = this,
            getReg = /^(get|head|options|delete|trace)$/i,
            formatedData = url;

        // null
        if (!data) {
            return;
        }

        formatedData += url.indexOf('?') > -1 ? '&' : '?';

        if (typeof data === 'object' && getReg.test(method)) {
            zQuery.zorEach(data, (key, value) => {
                formatedData += `${key}=${value}`;
            });
            this.url = formatedData;
            this.data = null;
        }
    },

    handleDataType: function (xhr) {
        let dataType = this.dataType.toUpperCase(),
            result = xhr.responseText;

        if (dataType === 'JSON') {
            result = JSON.parse(result);
        } else if (dataType === 'XML') {
            result = xhr.responseXML;
        }
        // default: 'TEXT'
        return result;
    },

    done: function (callback) {

    },
    fail: function (callback) {

    }
};
```

测试一下

```js
$.ajax({
        url: './cart.json',
        method: 'get',
        dataType: 'json',
        success: (data) => {
            console.log(data);
        },
        error: () => {
            console.log(1);
        }
    });
```



![在这里插入图片描述](https://img-blog.csdnimg.cn/20200815135524774.png#pic_center)



### 改bug

之前的写法还是有很多问题，问题主要出在`onreadystatechange`这个方法上，这个方法主要是检测`ajax`状态的变化。

ajax的五个状态

| 状态码 | ajax原型属性     | 表示信息                                                     |
| ------ | :--------------- | ------------------------------------------------------------ |
| 0      | UNSENT           | 刚开始创建XHR,还没发送请求                                   |
| 1      | OPENED           | 已经执行了open函数，发送了请求                               |
| 2      | HEADERS_RECEIVED | 已经发送ajax请求，响应头信息已经被客户端接收（响应头中包含了：服务器时间，HTTP状态码） |
| 3      | LOADING          | 响应主体内容正在返回                                         |
| 4      | DONE             | 响应主体内容已经被客户端接收                                 |

状态从OPENED开始，`onreadystatechange`总共能监听到3次变化，如果像之前那么写，`fail`会执行三次，这显然有问题。

```js
let promise = new Promise((resolve, rejected) => {
    xhr.open(method, url, async);
    xhr.onreadystatechange = () => {
        
        if (xhr.readyState === 4) {
            // success
            if (/^2\d{2}$/.test(xhr.status)) {
                let ret = this.handleDataType(xhr);
                success && success(ret);
                resolve(ret);

                console.log('success');
            }
            
             // fail
        	// 如果不是以2/3开头的状态码就认定为失败
            if (!/^([23])\d{2}$/.test(xhr.status)) {
                error && error();
                rejected();

                console.log('fail to get data by ajax');
            }
        }
    };
    xhr.send(data);
});
```



还有一个BUG就是链式调用的问题。

```js
send: function () {

    this.zQuery_promise = new Promise((resolve, reject) => {

    });

    return this;
}
```

这里应该返回ajax实例，把promise挂载到实例上才能实现链式调用。



## 完善

所有的BUG都修复了，现在完善链式调用。

```js
zQuery.ajax.prototype = {
    done: function (callback) {
        this.zQuery_promise.then((data) => {
            callback(data);
            console.log('done');
        })
        return this;
    },
    fail: function (callback) {
        this.zQuery_promise.catch(() => {
            callback();
            console.log('fail');
        })
    }
}
```

当然了，实际上还有很多问题，比如说`abort`等方法都不支持，还是有非常非常多东西需要完善的。



## zQuery升级

新增ajax库。

```js
$.ajax({
    url: './cart.json',
    method: 'get',
    data: {},
    dataType: 'json', // 仅支持json xml text
    cache: false,
    success: () => {
        console.log('success is ok');
    },
    error: () => {
        console.log('error is ok');
    }
}).done(() => {
    console.log('done is ok');
}).fail(() => {
    console.log('fail is ok');
});
```



zQuery

```js
/* zQuery! */
(function (window) {
    let zQuery = function (selector, context) {
        return new zQuery.fn.init(selector, context);
    },
        logo = 'zQuerymemeda',

        class2type = {},

        hasOwn = class2type.hasOwnProperty,

        isFlatObj = function (obj) {
            if (typeof obj === 'object') {
                for (let i in obj) {
                    if (typeof obj[i] === 'object') {
                        return false;
                    }
                }
            }
            return true;
        },
        isEmptyObj = function (obj) {
            for (let item in obj) {
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
    zQuery.logo = logo;

    zQuery.fn = zQuery.prototype = {
        constructor: zQuery,

        eq: function (i) {
            let len = this.length;
            i = i < 0 ? +i + len : i;

            return this.pushStack(i >= 0 && i < len ? [this[i]] : []);
        },

        first: function () {
            return this.eq(0);
        },

        index: function (elem) {

            let count = 0,
                prevSibling;

            // 没传参数
            if (!elem) {
                prevSibling = this.first()[0].previousElementSibling;
                while (prevSibling !== null) {
                    count++;
                    prevSibling = prevSibling.previousElementSibling;
                }
                return count;
            }

            // 传入的字符串用jQuery包装一下
            if (typeof elem === 'string') {
                return Array.prototype.indexOf.call(zQuery(elem));
            }

            // 剩下就是jQuery对象/dom元素集合
            return (
                Array.prototype.indexOf.call(this,
                                             elem && elem.zQuery ? elem[0] : elem
                                            ));
        },

        /*
             *   将传入的元素放入jQuery对象
             *   将原来的元素作为prevObject保存
            */
        pushStack: function (elems) {
            let ret;
            console.log(this.constructor());
            ret = zQuery.merge(this.constructor(), elems);

            ret.prevObject = elems;

            return ret;
        },

        find: function (elem) {
            let context = this[0] || document;

            if (!elem) {
                return this;
            }

            if (typeof elem === 'string') {
                return zQuery(elem, context);
            }
        }
    };

    // 1. $.fn.extend({}) 扩展jQuery本身
    // 2. $.fn.extend(true, {}, {}) 深拷贝
    // 3. $.fn.extend({}, {}) 浅拷贝
    zQuery.extend = zQuery.fn.extend = function () {
        let length = arguments.length,
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


    zQuery.extend({
        each: function (obj, callback, args) {
            let length, i = 0,
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
        },

        // 将each跟forEach结合 让forEach能遍历对象
        zorEach: function (obj, callback, needOwn = true) {
            let length, i = 0,
                ret;

            // 如果是数组或者类数组
            if (isArrayLike(obj)) {
                length = obj.length;
                for (; i < length; i++) {
                    // 调用callback 传入obj的每一项属性值item 以及索引index
                    if (callback.call(obj[i], obj[i], i) === false) {
                        // if return false 就终止循环
                        break;
                    }
                }
            } else {
                // 对象就for in 循环
                for (i in obj) {

                    if (needOwn && !hasOwn.call(obj, i)) return;

                    // zorEach({}, (key, value)
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }

            return obj;
        },

        merge: function (first, second) {
            let length = second.length,
                i = first.length,
                j;

            for (j = 0; j < length; j++) {
                first[i++] = second[j];
            }

            first.length = i;

            return first;

        }
    });


    let init = zQuery.fn.init = function (selector, context) {
        let nodeList,
            i = 0;

        context = context || document;

        // $() 相当于调用原型方法
        if (!selector) {
            this.length = 0;
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

            // .class #id tag
            nodeList = context.querySelectorAll(selector);

            while (nodeList[i]) {
                this[i] = nodeList[i];
                i++;
            }

            this['length'] = i;

            // 贴个标签，表示是zQuery包装的
            this['zQuery'] = zQuery.logo;

            return this;
        }


    },
        isArrayLike = function (obj) {
            let length = obj.length;

            if (!obj || !('length' in obj)) {
                return false;
            }

            return Array.isArray(obj) || !!(typeof obj === 'object' && obj[length - 1]);

        },
        dataAttr = function (elem, key, data) {
            let name;

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
            let handleObj;

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
        let origFn;

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
            let value = owner[this.expando];

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
            let cache = this.cache(owner),
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
            let i,
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

    let dataPriv = new Data();

    let dataUser = new Data();
    /* 缓存模块结束 */

    // let init = {
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
            let handleObj,
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

            let i,
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
            let ret,
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
            let handle = dataPriv.get(elem) && dataPriv.get(elem).handle,
                event = {};

            console.log(handle);

            event.type = type;
            data = [event].concat(data);

            if (handle) {
                handle.apply(elem, data);
            }
        },

        handlers: function (event, handlers) {
            let i,
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
            let elem = this[0],
                data;


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

    /*
        * ajax
        * */
    zQuery.extend({
        ajaxDefaultSettings: {
            method: 'GET',
            data: null,
            dataType: 'JSON',
            async: true,
            cache: true
        },

        ajax: function (options) {
            return new zQuery.ajax.prototype.init(options);
        },

        getJSON: function (options) {
            return zQuery.ajax($.extend(options, {
                dataType: 'json'
            }));
        }
    });
    zQuery.ajax.prototype = {
        constructor: zQuery.ajax,
        init: function (options) {
            let {
                url,
                method = 'get',
                data = null,
                dataType = 'JSON',
                async,
                cache,
                success,
                error
            } = $.extend(zQuery.ajaxDefaultSettings, options);

            // 配置挂载mount
            $.zorEach(['url', 'method', 'data', 'dataType', 'async', 'cache', 'success', 'error'], (item) => {
                this[item] = eval(item);
            });

            return this.send();

        },
        /*
            *
            * send request
            * */
        send: function () {
            this.handleData();
            this.handleCache();

            let {
                url, method, async, data, success, error
            } = this,
                xhr = new XMLHttpRequest();

            this.zQuery_promise  = new Promise((resolve, rejected) => {

                xhr.open(method, url, async);
                xhr.onreadystatechange = () => {

                    if (xhr.readyState === 4) {
                        // success
                        if (/^2\d{2}$/.test(xhr.status)) {
                            let ret = this.handleDataType(xhr);
                            success && success(ret);
                            resolve(ret);

                            console.log('success');
                        }

                        // fail
                        // 如果不是以2/3开头的状态码就认定为失败
                        if (!/^([23])\d{2}$/.test(xhr.status)) {
                            error && error();
                            rejected();

                            console.log('fail to get data by ajax');
                        }
                    }
                };
                xhr.send(data);
            });

            return this;
        },

        handleCache: function () {
            let {url, method, cache} = this,
                timeStamp = `_=${+(new Date())}`;

            // 不需要缓存就在后面+时间戳，保证每次url都不重复
            if (/^get$/i.test(method) && cache === false) {
                // xx.xx?x=1 -> xx.xx?x=1&
                // xx.xx -> xx.xx?
                url += url.indexOf('?') > -1 ? '&' : '?';
                url += timeStamp;
                this.url = url;
            }
        },

        handleData: function () {
            let {method, url, data} = this,
                getReg = /^(get|head|options|delete|trace)$/i,
                formatedData = url;

            // null
            if (!data) {
                this.data = null;
                return;
            }

            formatedData += url.indexOf('?') > -1 ? '&' : '?';

            if (typeof data === 'object' && getReg.test(method)) {
                zQuery.zorEach(data, (key, value) => {
                    formatedData += `${key}=${value}`;
                });
                this.url = formatedData;
                this.data = null;
            }
        },

        handleDataType: function (xhr) {
            let dataType = this.dataType.toUpperCase(),
                result = xhr.responseText;

            if (dataType === 'JSON') {
                result = JSON.parse(result);
            } else if (dataType === 'XML') {
                result = xhr.responseXML;
            }
            // default: 'TEXT'
            return result;
        },

        done: function (callback) {
            this.zQuery_promise.then((resolve) => {
                callback(resolve);
            });
            return this;
        },
        fail: function (callback) {
            this.zQuery_promise.catch(() => {
                callback();
            })
        }
    };

    zQuery.ajax.prototype.init.prototype = zQuery.ajax.prototype;

    window.$ = zQuery;
})(window);
```

