# jQuery @3.5.1

最近一直在研究jQuery的`trigger on`内部是怎么实现的，没想到这么复杂，只好一点点拆开。



## 实现简易的事件绑定系统

jQuery处理事件需要用到缓存。

绑定事件的方法$().on $().delegate $().bind 实际上它们底层都是用$().on这个方法实现的。

$().on部分代码

```javascript
return elem.each( function() {
    jQuery.event.add( this, types, fn, data, selector );
} );
```

这里需要注意的是elem是jQuery对象，而this却是dom对象。[分析](./jQSC-jQuery.each.md)



$().on实际上只是对齐参数，内部还是调用`jQuery.event.add`的方法来添加事件,但是里面有一个`elemData`贯穿了整个方法。

```javascript
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
        	
			elemData = dataPriv.get( elem ); // <=
			...
```



来看看Data的结构。

```javascript
function Data() {
   // dataPriv.expando = id 产生一个单独的id
   this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

// 从这开始就看不懂了，需要结合实际操作
Data.prototype = {

   cache: function( owner ) {

      // Check if the owner object already has a cache
      var value = owner[ this.expando ];

      // If not, create one
      if ( !value ) {
         value = {};

         // We can accept data for non-element nodes in modern browsers,
         // but we should not, see #8335.
         // Always return an empty object.
         if ( acceptData( owner ) ) {

            // If it is a node unlikely to be stringify-ed or looped over
            // use plain assignment
            if ( owner.nodeType ) {
               owner[ this.expando ] = value;

            // Otherwise secure it in a non-enumerable property
            // configurable must be true to allow the property to be
            // deleted when data is removed
            } else {
               Object.defineProperty( owner, this.expando, {
                  value: value,
                  configurable: true
               } );
            }
         }
      }

      return value;
   },
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
   },
   get: function( owner, key ) {
      return key === undefined ?
         this.cache( owner ) :

         // Always use camelCase key (gh-2257)
         owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
   },
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
   },
   remove: function( owner, key ) {
      var i,
         cache = owner[ this.expando ];

      if ( cache === undefined ) {
         return;
      }

      if ( key !== undefined ) {

         // Support array or space separated string of keys
         if ( Array.isArray( key ) ) {

            // If key is an array of keys...
            // We always set camelCase keys, so remove that.
            key = key.map( camelCase );
         } else {
            key = camelCase( key );

            // If a key with the spaces exists, use it.
            // Otherwise, create an array by matching non-whitespace
            key = key in cache ?
               [ key ] :
               ( key.match( rnothtmlwhite ) || [] );
         }

         i = key.length;

         while ( i-- ) {
            delete cache[ key[ i ] ];
         }
      }

      // Remove the expando if there's no more data
      if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

         // Support: Chrome <=35 - 45
         // Webkit & Blink performance suffers when deleting properties
         // from DOM nodes, so set to undefined instead
         // https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
         if ( owner.nodeType ) {
            owner[ this.expando ] = undefined;
         } else {
            delete owner[ this.expando ];
         }
      }
   },
    // dataPriv.hasData
   hasData: function( owner ) {
      var cache = owner[ this.expando ];
      return cache !== undefined && !jQuery.isEmptyObject( cache );
   }
};

var dataPriv = new Data();
```

​				👆

在jQery@3.5.1版本，dataPriv实际上是Data的一个实例，这段代码底下有一个实例化的操作。





先关注于dataPriv.get

```javascript
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var elemData = dataPriv.get( elem ); // <=
        ...
    }
}
//============================================dataPriv.get
    get: function( owner, key ) {
        // key没有传入的时候返回的是cache( owner )的结果
        return key === undefined ?
            this.cache( owner ) :

        // Always use camelCase key (gh-2257) 暂时不管
        owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
    }
```



key没传入的时候调用了`cache`

```javascript
// 在绑定事件对象的时候 owner是dom对象
cache: function( owner ) {

      // Check if the owner object already has a cache
      // 查看dom对象是否有缓存
      var value = owner[ this.expando ];

      // If not, create one
      // 没有就生成一个空对象
      if ( !value ) {
         value = {};

         // We can accept data for non-element nodes in modern browsers,
         // but we should not, see #8335.
         // Always return an empty object.
          
          //var acceptData = function( owner ) {
          // 	Accepts only:
          // 	 - Node
          //   		 - Node.ELEMENT_NODE (nodeType === 1)
          //   		 - Node.DOCUMENT_NODE (nodeType === 9)
          // 	 - Object
          //  	 	- Any
          // return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
          // };
          //
          // owner是document/dom对象或者任何对象就进入分支
         if ( acceptData( owner ) ) {

            // If it is a node unlikely to be stringify-ed or looped over
            // use plain assignment	=> 使用直接赋值，下面的分支使用Object.defineProperty
            // 就在这里为获取到的dom对象添加一个独有的属性
            if ( owner.nodeType ) {
               owner[ this.expando ] = value;

            // Otherwise secure it in a non-enumerable property
            // configurable must be true to allow the property to be
            // deleted when data is removed
            // dom对象以外的对象进入该分支
            } else {
               Object.defineProperty( owner, this.expando, {
                  value: value,
                  configurable: true	
               } );
               // =>  owner[ this.expando ] = value;
               // 默认的描述符
               // enumerable: false
               // writable: false
               // 这段代码的表示expondo不可枚举，只能通过Object.defineProperty修改
            }
         }
      }

      return value;
   }
```

`Object.defineProperty`[详情参考](https://www.jianshu.com/p/8fe1382ba135)

`dataPriv.cache( owner )`的作用实际上就是创建/返回缓存对象。返回的对象保存在一开始`new Data()`创建的expando属性上。 相当于 domObj[ expando ] = {};



## 实现简易Cache

读到这里我们先实现一个简易的cache系统

```javascript
var zQuery = {};
zQuery.expando = "zQuery" + ( Math.random() ).replace( /\D/g, "" );

function Data() {
    this.expando = zQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {
    cache: function ( owner ) {
        var value = owner[ this.expando ];

        // value不存在就初始化
        if (!value) {
            value = {};

            if (owner.nodeType) {
                owner[ this.expando ] = value;
            }
        }

        return value;
    },
    get: function ( owner, key ) {
        return key === undefined ? this.cache( owner ) : null;
    }
};

var dataPriv = new Data();
```





我们打印出domObj就可以发现这个属性

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803104117159.png)

生成expando的代码

```javascript
expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" )
```

\D表示非0-9之间的数字



`jQuery.event.add`代码太多了，先打印出这个expando属性，看看它的构造，根据他再分析源码是在哪里添加的值。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803153925233.png)



```javascript
// jQuery.event.add( this, types, fn, data, selector );
// this就是dom对象 types是绑定的事件类型 fn是要处理的回调

add: function( elem, types, handler, data, selector ) {
    var handleObjIn, eventHandle, tmp,
        events, t, handleObj,
        special, handlers, type, namespaces, origType,
        // 这里对于第一次获取的dom对象就是返回一个空的{}
        elemData = dataPriv.get( elem );

    // Init the element's event structure and main handler, if this is the first
    // 判断elemData有没有events这个属性，没有就添加一个{}
    // Object.create( null ) 通过这个方法创建的对象，传入null，产生一个纯净的{}
    if ( !( events = elemData.events ) ) {
        events = elemData.events = Object.create( null );
    }
```

在第15行挂载了events(events不存在的情况下)



再关注一下events的数据结构，以绑定`click`方法为例子

![](https://img-blog.csdnimg.cn/20200803161235688.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)





```javascript
// Make sure that the handler has a unique ID, used to find/remove it later
// 在callback上生成一个guid
if ( !handler.guid ) {
    handler.guid = jQuery.guid++;
}

// handleObj is passed to all event handlers
// 在这里创建handleObj
handleObj = jQuery.extend( {
    type: type,
    origType: origType,
    data: data,
    handler: handler,
    guid: handler.guid,
    selector: selector,
    needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
    namespace: namespaces.join( "." )
}, handleObjIn );

// Init the event handler queue if we're the first
// 初始化事件队列[]
if ( !( handlers = events[ type ] ) ) {
    
    handlers = events[ type ] = [];
    handlers.delegateCount = 0;

    // Only use addEventListener if the special events handler returns false
    if ( !special.setup ||
        special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

        if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle );
        }
    }
}

// Add to the element's handler list, delegates in front
if ( selector ) {
    handlers.splice( handlers.delegateCount++, 0, handleObj );
} else {
    // 没传入上下文的时候就将之前生成好的handleObj压入数组handlers
    handlers.push( handleObj );
}
```



还缺一个handle属性

![image-20200803164504012](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200803164504012.png)

这里先不管函数内部的操作，专注于event.add的逻辑

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
```



还有一个细节

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803171440339.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

真正要处理的回调上也有一个guid



## 实现简易jQuery.event.add

其实无论源码多复杂，核心不过形成一个**数据结构挂载到expando上**。

根据逻辑实现一个简易版的`jQuery.event.add`

```javascript
var event = {
    add: function ( elem, types, handler ) {
        var events,			// expando.events
            eventHandle,	//expando.handle
            handlers,		// expando.events中的事件队列[]
            handleObj,
        	elemData = dataPriv.get(elem); // 获取缓存对象
        
        // 获取guid
        if ( !handler.guid ) {
            handler.guid = jQuery.guid++;
        }
        
        // 挂载events
        if ( !( events = elemData.events ) ) {
            events = elemData.events = Object.create(null);
        }
        
        // 挂载handle
        if ( !( eventHandle = elemData.handle ) ) {
             eventHandle = elemData.handle = function( e ) {
                 
             return jQuery.event.dispatch.apply( elem, arguments );
        }
        
        // 创建事件队列
        if ( !( handlers = events[ type ] ) ) {
            handlers = events[ type ] = [];
            
            if (elem.addEventListener) {
                elem.addEventListener(type, eventHandle);
            }
        }
            
        // 创建events的内容
        handleObj = jQuery.extend( {
            type: type, // 填充类型
            handler: handler,	// 填充回调函数
            guid: handler.guid	// 填充id
        }, handleObjIn );
            
        // 回调函数上也需要添加guid    
        if ( !handleObj.handler.guid ) {
            handleObj.handler.guid = handler.guid;
        }
        
        // 这里把handleObj压入数组
        handlers.push(handleObj);    
    }
}
```



再理一下整个数据结构

```javascript
var init = {
        elem: {
            jQuery351046541611:{
                events: {
                    // 'click'
                    handlers: [
                        handleObj: {
                            type: type, // 填充类型
                        	// fn
                            handler: f(),
                    		// handler.guid fn上也保存了id
                            guid: handler.guid
                        }
                    ]
                },
            	handle: f( e )
            }
    }
}
```



## 实现简易事件绑定和缓存系统

到这里我们把简易版的事件绑定和缓存系统结合在一起。

```javascript
var zQuery = {};
    zQuery.uid = 1;
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
            return key === undefined ? this.cache( owner ) : null;
        }
    };

    var dataPriv = new Data();
	
	// 要建立的数据结构
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
        add: function (elem, type, handle) {
            var handleObj,
                elemData = dataPriv.get(elem);


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
                    console.log(e);
                    // return jQuery.event.dispatch.apply( elem, arguments );
                }

                // 创建存放数据的数组
                if (type) {
                    elemData.events[type] = [];

                    if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandle);
                    }
                }

                // 创建数组中要存放的事件相关信息
                handleObj = {
                    type: type,
                    handler: handle,
                    guid: handle.guid
                }

                // 数据压入数组
                elemData.events[type].push(handleObj);
            }
        }
    }

    zQuery.event.add(document, 'click', function(){});
    console.dir(document);
```

实现了一个简易的`event.add`!

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803181433385.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)



## 遗留问题

我们通过`addEventListener`绑定的事件并不是我们当时用`$().on`传入的事件,而是jQuery添加的。

我们可以在第二行打印e来验证一下。

```javascript
eventHandle = elemData.handle = function (e) {
    console.log(e);
    // return jQuery.event.dispatch.apply( elem, arguments );
};

if (elem.addEventListener) {
    elem.addEventListener(type, elemData.handle);
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200804071316118.png)

这就奇怪了，那我们自己传入的回调函数又该怎么被执行？





## 探索dispatch

这里`jQuery.event.add`创建elemData.handle绑定的函数调用了`event.dispatch`方法

```javascript
if (!(eventHandle = elemData.handle)) {
    eventHandle = elemData.handle = function (e) {
        // return jQuery.event.dispatch.apply( elem, arguments );
    }
```

通过`apply`传入的`arguments`一般来讲就是事件对象。

从dispatch第一行的参数名也可以猜出来。

```javascript
dispatch: function( nativeEvent ) 
```



对于一些修正和边界判断先放一边，关注主要的代码，如果后面遇到再返回去理解。

```javascript
dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

        // 从缓存中提取数据
			handlers = (
					dataPriv.get( this, "events" ) || Object.create( null )
				)[ event.type ] || [],

        // event: jQuery通过原生事件对象修改的jQuery事件对象
        // handlers就是之前存在expando上的events

        // Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}
// 到这里可以明显的发现，jQuery在这里对nativeEvent做了处理，把它包装成event，
// 根据注释，把只读的nativeEvent换成了jQuery.Evnet放到了args
//=====================================================================    
    
		// Determine handlers
		// 这里做的处理就是把expando的handlers提取出来，跟elem在一个对象装进队列
        // console.log(this); this: dom对象
        handlerQueue = jQuery.event.handlers.call( this, event, handlers );
    	// handlerQueue:[
		// 	0: {
		// 		elem:,
		//		handlers: [{..}]
		// 		}
		// ]
    
        // Run delegates first; they may want to stop propagation beneath us
		i = 0;
    
    	// 从这里开始遍历事件队列
		while ( ( matched = handlerQueue[ i++ ] )) {
			event.currentTarget = matched.elem;

			j = 0;

			// handlers: [{..}]
			while ( ( handleObj = matched.handlers[ j++ ] ) ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

                    
                    event.handleObj = handleObj;
					event.data = handleObj.data;

					// special or handler
					// 在这里调用了handler, 传入了参数集合
                    // 注意这个args[0]是已经fix过的jQuery.Event
					ret = ( handleObj.handler ).apply( matched.elem, args );

				}
			}
		}

        return event.result;
	}
```

读完以后`$().on('click', fn)在dispatch主个方法主要做了两件事

1. 修正原生的event,包装成jQuery.Event
2. 调用传入的fn

当然了，这里省去了很多细节，包括事件委托，但是一下自暴露太多容易让逻辑混乱，先专注实现一个功能。



## 实现简易的dispatch

（不包含事件委托处理）

```javascript
// event.add
//if (!(eventHandle = elemData.handle)) {
//   eventHandle = elemData.handle = function (e) {
//         return jQuery.event.dispatch.apply( elem, arguments );
//    }

var zQuery = {};
zQuery.event = {
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
       		ret = handlers.handler.apply( nativeEvent.type, arguments);
        }
        
        return ret;
    }
}
```

这里还需要对缓存系统做一些修改，让我们能够通过第二个参数获取数据。



## 改进cache

```javascript
function Data() {
    this.expando = zQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {
 //   改进前  
 //   get: function ( owner, key ) {
 //       return key === undefined ? this.cache( owner ) : null;
 //   },
    get: function ( owner, key ) {
        return key === undefined ? 
            this.cache( owner ) : 
        
        // jQuery对key做了前缀的处理，这里就不考虑了，直接获取
        owner[ this.expando ] && owner[ this.expando ][ key ];
    }
};

var dataPriv = new Data();
```



