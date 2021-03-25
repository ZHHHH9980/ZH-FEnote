# 扩展&合并

初步搭建框架的时候，就发现这样的一个问题，太多的`zQuery.fn.xx`代码非常乱，不方便管理，一次性写到`zQuery.fn={}`也是不是不可以，只是不能很好地把有逻辑关系的代码相关联，方便维护和管理。



extend的方法真的非常强大，不仅可以扩展jQuery，还可以合并多个对象集合到一个对象，传入参数决定是否进行深浅拷贝。

[从零实现参考](https://github.com/mqyqingfeng/Blog/issues/33)



## 实现简易版extend

jQuery考虑的非常全，甚至考虑了数组和对象合并的情况，这里不过多考虑,只有拷贝值和被拷贝值都是对象才进入深拷贝。



```javascript
var isFlatObj = function (obj) {
    if (typeof obj === 'object') {
        for (var i in obj) {
            if (typeof obj[i] === 'object') {
                return false;
            }
        }
    }
    return true;
};

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
                            target[ name ] = extend(deep, target[ name ], copy);
                        } else if (copy != undefined) {
                            target[ name ] = copy;
                        }
                    }
                }
            }
            // 返回深拷贝结束的target[ name ]
            return target;
        }
```



这样就可以扩展简易版的jQuery了，而且内部管理代码也很方便，不需要满屏幕fn.xxx,但是不推荐乱用，毕竟调用方法遍历还是需要消耗一定性能的。

```javascript
// zQuery.fn.each = function (callback, args) {
//     zQuery.each(this, callback, args);
// }
// zQuery.fn.on = function (types, selector, fn) {
//     return on(this, types, selector, fn);
// };

zQuery.fn.extend({
    each: function (callback, args) {
        zQuery.each(this, callback, args);
    },
    on: function (types, selector, fn) {
        return on(this, types, selector, fn);
    }
})
```



## 实现可扩展能力

贴上有扩展能力的zQuery

```javascript
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

                    types = ( types || '').split(' ');
                    t = types.length;

                    while (t--) {

                        type = types[t] || '';
                        // 创建存放数据的数组

                        if (!type) {
                            continue;
                        }

                        elemData.events[type] = [];

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
            }
        };

        window.$ = zQuery;
    })(window);
```

