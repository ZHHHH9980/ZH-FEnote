# 自定义属性

一般有两种用法

- 获取保存到Html标签上的自定义属性
- 在js中直接调用$().data保存



当然了，jQuery静态方法上也有`data`方法，用法就是$.(elem, data, value)，这个后面再讨论。



第一种的话经常在图片懒加载等场景经常用。

```html
<div class="a" data-img="./image/xx.png">
    <div class="b">aa</div>
</div>

<script src="dist/jquery.js"></script>
<script>
    console.log($('.a').data('img'));
    // => './image/xx.png'
</script>    
```



还有一种就是通过JS保存。

```js
$('.a').data('id', '1');
console.log($('.a').data('id'));
//=>1
```



## 自定义属性的缓存

其实不难发现，$().data也是使用了缓存机制。

```js
var dataUser = new Data();
```



$.fn.data

```js
jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;
        
        // Gets all values
		// $().data()
		if ( key === undefined ) {//... return}
            
        // Sets multiple values
		// $().data({})
		if ( typeof key === "object" )  {//... return}
            
         return access( this, function( value ){...}, null, value, arguments.length > 1, null, true );   
```

jQuery一如既往地考虑非常多，这里先不考虑，直奔access完成最基本的功能。



调用access

```js
return access( this, function( value ) {
    var data;

    // The calling jQuery object (element matches) is not empty
    // (and therefore has an element appears at this[ 0 ]) and the
    // `value` parameter was not undefined. An empty jQuery object
    // will result in `undefined` for elem = this[ 0 ] which will
    // throw an exception if an attempt to read a data cache is made.
    // 上面说的是 一个空的jQuery对象 $()[0] 会得到undefined
    // 得有元素对象而且没传入value
    // $().data('key') 
    if ( elem && value === undefined ) {

        // Attempt to get data from the cache
        // The key will always be camelCased in Data
        // 从缓存中获取key相关的数据
        data = dataUser.get( elem, key );
        if ( data !== undefined ) {
            return data;
        }

        // Attempt to "discover" the data in
        // HTML5 custom data-* attrs
        // 尝试从HTML5的自定义标签里获取值
        // 就是从这里<div data-src=""> 拿到的数据值
        data = dataAttr( elem, key );
        if ( data !== undefined ) {
            return data;
        }

        // We tried really hard, but the data doesn't exist.
        // 哈哈，没有东西
        return;
    }

    // Set the data...
    this.each( function() {

        // We always store the camelCased key
        // $().data('id', 1) 在这里设置id值
        dataUser.set( this, key, value );
    } );
}, null, value, arguments.length > 1, null, true );
```



access

```js
// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
// 一个多功能的方法 设置/获取集合中的值 
// 传入的值如果是函数可以选择是否被执行
//======================================data 传入的参数
// $() => jQuery对象集合
// fn 传入的回调函数
// key = null
// value 就是 $().data(key, value)
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
    // 检测key是不是对象，如果是就需要多次设置key
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
    // 设置单个的value    
	} else if ( value !== undefined ) {
		chainable = true;
        
        // 如果value不是函数 raw => true
		if ( !isFunction( value ) ) {
			raw = true;
		}
        
        // $.fn.data指定了bulk为true
		if ( bulk ) {

			// Bulk operations run against the entire set
            // 传入的value不是函数就走这个分支，$.fn.data实际上也设置了raw = true
			if ( raw ) {
                // 核心语句，就在这里执行了回调
				fn.call( elems, value );
                
                // 执行完$.fn.data传入的回调就清空
				fn = null;

			// ...except when executing function values
            // 这里搭理传入values为函数，跟$().data没多大关系    
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}
        
        // 挨个执行函数
		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
        // 在这返回jQuery对象
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};
```



`access`方法实际上处理两种情况，一种是传入了key为函数的情况，一种是Null，因为功能不需要太复杂，就先写一个简易的access，完成两个功能1.执行回调 2.返回jQuery对象，实现链式调用。



### 搭建data框架

这里先不搭理access，毕竟没有那么多应用场景，写专注实现data的功能。

目前实现两个功能，一个是设置data,一个是通过key获取data，别的功能需要添加的时候再考虑。

```js
zQuery.fn.extend({
    data: function (key, value) {
        var elem = this[ 0 ],
            data;

        // get value from html5 custom data attr or cache
        // $(el).data(key) 
        if (elem && value === undefined) {
                   
        }

        // set data
        // $(el).data(key, value)
        this.each( function () {
            dataUser.set( this, key, value );
        })
    }
});
```



### set data

我们先完成set data模块，set data实际上就是操作缓存中的set方法。

注意这里的this指向dataUser.

```js
set: function( owner, data, value ) {
    var prop,
        cache = this.cache( owner );

    // Handle: [ owner, key, value ] args
    // Always use camelCase key (gh-2257)
    if ( typeof data === "string" ) {
        cache[ camelCase( data ) ] = value;

        // Handle: [ owner, { properties } ] args
    } else {

        // Copy the properties one-by-one to the cache object
        for ( prop in data ) {
            cache[ camelCase( prop ) ] = data[ prop ];
        }
    }
    return cache;
}
```

**Data.cache**在事件缓存机制中已经出现过，这里不做过多讨论，实际上就是在dom对象上绑定一个expando属性，在这里放入缓存相关信息。	

set方法其实很简单，就是获取缓存，然后处理key值为字符串和对象的情况。

`camelCase`参考[jQuery中的正则](./jQSC-jQuery的正则课堂.md) #1，本质就是驼峰命名的处理。





### 完善data

我们在这里完善一下data方法，不使用access。

```js
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
            if ( data !== undefined ) {
                return data;
            }

        }

        // set data
        // $(el).data(key, value)
        this.each(function () {
            dataUser.set(this, key, value);
        })
    }
});
```





jQuery在获取html5标签的属性值还封装了一个dataAttr方法

```js
var rmultiDash = /[A-Z]/g;
function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}
```

这里做的事情实际上就是将传入的字符串拼上'data-'，然后通过`getAttribute`获取value，获取到的value还要保存到缓存中，下次就不需要再使用`getAttribute`。**（这里突出了缓存的好处）**至于getData这种边界处理暂时不管。



## 实现简易版$().data

```js
var dataAttr = function (elem, key, data) {
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
            if ( data !== undefined ) {
                return data;
            }
        }

        // set data
        // $(el).data(key, value)
        this.each(function () {
            dataUser.set(this, key, value);
        })
    }
});

// Data.prototype
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
}
```

当然了，能够添加就应该能删除

```js
jQuery.fn.extend( {
    data: ,//...
    removeData: function( key ) {
    	// 调用each一定要记得return 保证返回jQuery对象实现连缀调用
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );
```



### $.data()探索

核心还是在调用Data.prototype.access

```js
jQuery.extend( {
	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	}
})
```



### Data.prototype.access

```js
access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	}
```

我们可以看到$.data核心还是在操作缓存增删改，本质上跟$.fn.data没有太大区别。

因为这个API用的不多，所以就不放进zQuery了。



## zQuery升级！

新增自定义属性，支持获取html5标签上的`data-`自定义属性。

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
        off: function (types, selector, fn) {

            return this.each(function () {
                zQuery.event.remove(this, types, selector, fn);
            })
        },
        trigger: function (type, data) {
            this.each(function () {
                zQuery.event.trigger(this, type, data);
            })
        }
    })

    function on(elem, types, selector, fn) {
        // (types, fn)
        if (!fn) {
            fn = selector;
            selector = null;
        }

        // (types, selector, fn)


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
            return key === undefined ? this.cache(owner) : owner[this.expando] && owner[this.expando][key];
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

                        if (zQuery.isEmptyObj(handlers)) {
                            delete events[type];
                        }
                    }
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

            handlerQueue = zQuery.event.handlers.call(this, event, handlers);

            i = 0;

            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped) {

                for (j = 0; j < matched.handlers.length; j++) {
                    // 执行handler,改变this
                    handleObj = matched.handlers[j];
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
                if ( data !== undefined ) {
                    return data;
                }
            }

            // set data
            // $(el).data(key, value)
            this.each(function () {
                dataUser.set(this, key, value);
            })
        }
    });
    window.$ = zQuery;
})(window);
```

