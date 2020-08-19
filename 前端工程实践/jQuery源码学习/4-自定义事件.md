# 发布订阅模式

以前写jQuery的时候经常使用$().on,$().trigger这两兄弟实现发布订阅。

原生JS也支持用户自定义事件

```javascript
// jQuery
$(el).trigger('custom-event', {key: 'data'});

// Native
if (window.CustomEvent) {
    var event = new CustomEvent('custom-event', {detail: {key: 'data'}});
} else {
    var event = document.createEvent('CustomEvent');
    enent.initCustomEvent('custom-event', true, true, {key: 'data'});
}

e.dispatchEvent(event);
```

但是我们可以发现原生JS写非常麻烦，不光要生成自定义事件，而且传参得在生成事件的时候传入，而且接收参数只能通过event事件对象的属性接收，很蹩脚。



jQuery的写法，这里带来一个问题，trigger-on也是支持原生事件比如click，底层实现还是`addEventListener`这个API，而自定义事件是如何实现的？

```javascript
$(el).on('move-end', fn);
$(el).trigger('move-end', ['data1', 'data2'])
```



## 探索jQuery自定义事件

之前讨论过，jQuery在event.add这个方法上使用了`addEventListener`

```javascript
if ( !( eventHandle = elemData.handle ) ) {
    // 在这里添加了handle这个属性
    eventHandle = elemData.handle = function( e ) {

        // Discard the second event of a jQuery.event.trigger() and
        // when an event is called after a page has unloaded

        return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
            jQuery.event.dispatch.apply( elem, arguments ) : undefined;
    };
}

if ( !( handlers = events[ type ] ) ) {
    handlers = events[ type ] = [];
    handlers.delegateCount = 0;

    if ( elem.addEventListener ) {
        console.log( eventHandle );
        elem.addEventListener( type, eventHandle );
    }
}
```

这里打印一下eventHandle，看一下自定义事件会不会通过`addEventListener`监听。

打印结果。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200805085711128.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)



既然监听了，那么触发的时候就应该会调用这个函数，触发jQuery.event.dispatch

```javascript
return jQuery.event.dispatch.apply( elem, arguments );
```



dispatch核心语句

```javascript
ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );
console.log(handleObj);
```

打印一下handleObj(special的打印为undefined，这里暂时不搭理)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200805091231370.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

这不就是之前存到dom对象上的events嘛，原来传入的回调就是在这里调用的。

写到这里思路就非常清晰了。

这里引用[艾伦的博客](https://www.cnblogs.com/aaronjs/p/3444874.html)的一张图。

![image](https://images0.cnblogs.com/blog/329084/201311/26084505-ee141e573a864f148af28f3cf62b6196.png)

event.add负责绑定事件

```javascript
eventHandle = elemData.handle = function( e ) {
        return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
            jQuery.event.dispatch.apply( elem, arguments ) : undefined;
    };
```

在这里接收事件对象，把参数集合都传入event.dispatch,通过dispatch对事件对象做修正，然后执行绑定的回调函数。

这里有个问题$(el).trigger(type, [params])这个底层是用什么实现的？又是如何把参数传入？

```javascript
elem.addEventListener( type, eventHandle );
```





## trigger实现探索

先找到trigger的接口，无非是遍历jQuery对象调用event.trigger

```javascript
jQuery.fn.extend( {
	trigger: function( type, data ) {
		return this.each( function() {
            // this:dom元素节点
			jQuery.event.trigger( type, data, this );
		} );
	}
} );
```



直接接着接口深入,event.trigger是通过extend扩展的。

这里还是只关注核心代码。

```javascript
// this:dom元素节点
// jQuery.event.trigger( type, data, this );

jQuery.extend( jQuery.event, {
	trigger: function( event, data, elem, onlyHandlers ) {
        var type = hasOwn.call( event, "type" ) ? event.type : event,
            data;
        
        // Caller can pass in a jQuery.Event object, Object, or just an event type string
        // 这里我们传入的是'click' 'myEvent'字符串指定的事件
        // 会实例化jQuery.Event
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );
    }
```

这里先打印一下event是什么

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200805104410768.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

其实就是jQuery包装的事件对象。

```javascript
// 这里的data: $(el).trigger('click', data);
// 实际上就是将data跟jQuery包装好的对象合并成一个数组
data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );
// console.log(data);
// [jQuery.event, data]
```



jQuery还模拟了事件冒泡，这里不做讨论，先实现基本的trigger能力。

```javascript
// jQuery handler
// 这里的cur就是$(el) 中的dom元素节点
    handle = (
        dataPriv.get( cur, "events" ) || Object.create( null )
    )[ event.type ] &&
        dataPriv.get( cur, "handle" );

    if ( handle ) {
        handle.apply( cur, data );
    }

```

这段代码的目的就是找到之前dom对象上生成的expando下的handle

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200805110042595.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

找到以后就执行，使用apply参数得是一个数组，这也是为什么刚才要进行合并。

```javascript
handle.apply( cur, data );
```



## 整合

学到这里就基本上能明白整个事件的结构，虽然很多细节没有涉及，比如创建jQuery事件对象。

但是到这能够很明显地看出整个机制是怎么运行的。

addEventListener(type, eventHandle) 浏览器的原生事件由`addEventListener`监听并且**触发**。实际上trigger也是触发这个eventHandle，但是eventHandle是在event.add里创建的，而且这么多事件，如何区分？

从这里就能看出缓存系统的好处！event.add的主要作用之一就是开辟缓存系统，真正执行回调的还是dispatch!

一张图理一下思路。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200805114319379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

`trigger on`本身核心的东西其实并不多，但是有太多的兼容和包装处理，甚至模拟了事件冒泡，所以看起来真的非常非常费劲。



## 实现trigger

弄明白核心原理，接下来就着手实现一个简易的trigger，能够实现的功能包括传递参数和触发自定义事件。这里暂时不对事件对象进行包装。

```javascript
//接口 
zQuery.fn.extend({
     trigger: function (type, data) {
         this.each(function () {
             zQuery.event.trigger(this, type, data);
         })
     }
 })
```

原生事件都会传入一个事件对象作为第一个参数，这里为了参数对齐，也模拟传一个简单的对象。

```javascript
trigger: function (elem, type, data) {
    var handle = dataPriv.get( elem ) && dataPriv.get( elem ).handle,
        event = {};
    
    // 模拟事件对象，jQuery实际上在这里做了包装
    event.type = type;
    data = [ event ].concat( data );

    if (handle) {
        handle.apply(elem, data);
    }
}
```

做个简单的测试

```html
<body>
    <div class="a"></div>
	<div class="a"></div>
    <script>
        $('.a').on('click', function (e, data1, data2) {
            console.log(e ,data1, data2)
        });

        $('.a').trigger('click',['1', '2'])
    </script>
</body>

```

前面是trigger触发的，后面是我手点击的。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020080515022472.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

其实在这也能更好理解jQuery的处理，自定义事件就通过缓存获取handle，原生事件就通过`addEventListener`。，这么做的好处之一就是非常非常非常方便，自定义事件和原生事件都可以通过`on trigger`解决，而且自定义事件传参也非常方便！

这里已经能看出缓存系统的好处了，但是好处绝对不止这些，事件不光能添加，还得能删去，下篇再来探索。



贴上升级的zQuery作为结尾-新增trigger-on自定义事件。

```javascript
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
            };

        zQuery.each = function (obj, callback, args) {
            var length, i = 0;

            // 如果是数组或者类数组
            if ( isArrayLike( obj ) ) {
                length = obj.length;
                for ( ; i < length; i++ ) {
                    // 调用callback 传入obj的每一项属性值item 以及索引index
                    if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                        // if return false 就终止循环
                        break;
                    }
                }
            } else {
                // 对象就for in 循环
                for ( i in obj ) {
                    if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                        break;
                    }
                }
            }

            return obj;
        }

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
                if ( (options = arguments[i]) !== null) {

                    // 遍历传入对象的每一个属性
                    // 这里以options的属性为主导，添加/覆盖target上的属性
                    for (name in options) {
                        // 被拷贝的属性值
                        copy = options[ name ];

                        if (target === copy) {
                            continue;
                        }

                        // 拷贝和被拷贝值都得是对象才进入深拷贝
                        if (deep && copy && (!isFlatObj(copy) && !isFlatObj(target[ name ]) )) {
                            target[ name ] = zQuery.extend(deep, target[ name ], copy);
                        } else if (copy != undefined) {
                            target[ name ] = copy;
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
                if (selector[0] === ('.' || '#') ) {
                    nodeList = context.querySelectorAll(selector);
                }

                while ( nodeList[i] ) {
                    this[i] = nodeList[i];
                    i++;
                }

                this['length'] = i;
                return this;
            }


        },
            isArrayLike =  function (obj) {
            var length = obj.length;

            if (!obj || !('length' in obj)) {
                return false;
            }

            return Array.isArray(obj) || !!(typeof obj === 'object' && obj[length - 1]);

        };

        init.prototype = zQuery.fn;

        zQuery.fn.extend({
            each: function (callback, args) {
                zQuery.each(this, callback, args);
            },
            on: function (types, selector, fn) {
                return on(this, types, selector, fn);
            },
            trigger: function (type, data) {
                this.each(function () {
                    zQuery.event.trigger(this, type, data);
                })
            }
        })

        function on (elem, types, selector, fn) {
            // (types, fn)
            if (!fn) {
                fn = selector;
            }

            // (types, selector, fn)


            // add(elem, type, handle, selector)
            // 支持多个对象绑定事件
            return elem.each( function () {
                zQuery.event.add( this, types, fn, selector)
            })
        }


        zQuery.guid = 1;
        zQuery.expando =  "zQuery" + ( '' +  Math.random() ).replace( /\D/g, "" );

        function Data() {
            this.expando = zQuery.expando + Data.uid++;
        }

        Data.uid = 1;

        Data.prototype = {
            cache: function ( owner ) {
                var value = owner[ this.expando ];

                if (!value) {
                    value = {};

                    if (owner.nodeType) {
                        owner[ this.expando ] = value;
                    }
                }

                return value;
            },
            get: function ( owner, key) {
                return key === undefined ? this.cache( owner ) : owner[ this.expando ] && owner[ this.expando ][ key ];
            }
        };

        var dataPriv = new Data();

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
            add: function (elem, types, handle) {
                var handleObj,
                    elemData = dataPriv.get(elem),
                    type,
                    t;

                if (!handle) {
                    return;
                }

                if (!handle.guid) {
                    handle.guid = jQuery.guid++;
                }

                // 创建events
                if (!elemData.events) {
                    elemData.events = {};
                }

                // 创建handle
                if (!(eventHandle = elemData.handle)) {
                    eventHandle = elemData.handle = function (e) {

                        return zQuery.event.dispatch.apply( elem, arguments );
                    };
                }    
                types = ( types || '').split(' ');
                t = types.length;

                while (t--) {

                    type = types[t] || '';
                    // 创建存放数据的数组

                    if (!type) {
                        continue;
                    }

                    elemData.events[type] = elemData.events[type] || [];

                    if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandle);
                    }


                    // 创建数组中要存放的事件相关信息
                    handleObj = {
                        type: type,
                        handler: handle,
                        guid: handle.guid
                    };

                    // 数据压入数组
                    elemData.events[type].push(handleObj);
                }
            },

            dispatch: function ( nativeEvent ) {
                var ret,
                    i,
                    matched,
                    // 这里先不做修正
                    handlers = (
                        dataPriv.get( this, "events" ) || Object.create(null)
                    )[nativeEvent.type]  || [];

                i = 0;

                while( (matched = handlers[i++]) ) {

                    // 执行handler,改变this
                    ret = matched.handler.apply( nativeEvent.type, arguments);
                }

                return ret;
            },

            trigger: function (elem, type, data) {
                var handle = dataPriv.get( elem ) && dataPriv.get( elem ).handle,
                    event = {};

                event.type = type;
                data = [ event ].concat( data );

                if (handle) {
                    handle.apply(elem, data);
                }
            }
        };

        window.$ = zQuery;
    })(window);
```

