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