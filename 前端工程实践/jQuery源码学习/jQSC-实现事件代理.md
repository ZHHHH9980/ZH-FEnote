# 实现事件代理

之前进行事件绑定都是这样`$(el).on('click', fn)`

假设有这样的业务场景

```html
<ul>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
</ul>
```

挨个给li绑定事件太浪费性能了，可以直接通过事件代理解决。

事件代理的机制实际上就是通过冒泡传播机制实现的。

![img](https://upload-images.jianshu.io/upload_images/6882087-316af47d77255f8c.png?imageMogr2/auto-orient/strip|imageView2/2/w/230/format/webp)

jQuery的事件代理
`$('ul').on('click', 'li', fn);`



## 探索JQuery事件代理

先写一段代码做测试，看事件是由谁监听的。

```javascript
// $(el).on(type, selector, fn);
$(document).on('click','.a', function (e) {
    console.log(e);
});
```



`event.add`之前在事件绑定的时候讨论过这个方法，主要是用于创建/获取缓存，使用`addEventListener`监听`eventHandle`，然后在`eventHandle`进行事件派发`event.dispatch`。



1.检测`event.add`,先看看是由谁监听的`eventHandle`

```javascript
if ( elem.addEventListener ) {
    console.log(elem); // document
    elem.addEventListener( type, eventHandle );
}
```

从这里可以知道，`click`还是由**document**触发的，想一想原生JS的事件代理的形式？



2.this指向问题，this指向document，还是被代理的对象？

```javascript
// $(el).on(type, selector, fn);
$(document).on('click','.a', function (e) {
    console.log(this); //=> <div class="a"></div>
});
```

this指向被代理的对象。



#### 原生JS事件代理

```javascript
$(document).addEventListener('click', function (e) {
    if (e.target.nodeName.toLowerCase() !== 'div') return;
    //..
})
```

原生JS事件代理也是利用了事件冒泡，将其他不需要代理的元素全部阻止，仅有div标签能冒泡到document上，除了给document绑定事件，还有一个要求就是获取div。



`event.add`将被代理对象保存到expando中

```javascript
// handleObj is passed to all event handlers
handleObj = jQuery.extend( {
    type: type,
    origType: origType,
    data: data,
    handler: handler,
    guid: handler.guid,
    selector: selector, //<==
    needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
    namespace: namespaces.join( "." )
}, handleObjIn );
```



剩下就是触发`event.dispatch`了。

`event.dispatch`有个非常关键的步骤

```javascript
handlerQueue = jQuery.event.handlers.call( this, event, handlers );
```

打印结果：![在这里插入图片描述](https://img-blog.csdnimg.cn/20200807101529899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

可以明显发现，`event.handlers` 把事件和被代理对象包装在一起放入事件队列。



继续探索`event.handlers`

```javascript
handlers: function( event, handlers ) {
		// this: dom对象
		// event 经过jQuery修正后的事件对象
		// handlers:
        //	0: {type: "click", origType: "click", data: undefined, guid: 1, handler: ƒ, …}
        // delegateCount: 1 代理计数
        // cur: 出发当前事件的elem元素节点

        var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;
    
    
```

经过一堆测试，从变量和参数基本上就能看出端倪，`cur`是触发当前事件的元素，也就是被代理的元素。`delegateCount`是它被代理的次数。

```javascript
//...
for ( i = 0; i < delegateCount; i++ ) {
    handleObj = handlers[ i ];
}
if ( matchedSelectors[ sel ] ) {
    matchedHandlers.push( handleObj );
}
if ( matchedHandlers.length ) {
    handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
}
```

这里可以发现matchedHandlers是一个数组，**用于放一个对象被代理的多个事件**，我怎么知道的？

我打印的！

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200807104031690.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)



### 阻止冒泡

`event.handlers`不仅仅是把要执行的任务放入那么简单。

`event.dispatch`中有一句注释非常关键

> run the delegates first!

为什么要先执行代理的事件？因为可能存在**阻止冒泡**的情况！

```javascript
$(document).on('click', function (e) {
    console.log(2);
});
$(document).on('click','.a', function (e) {
    console.log(1);
    e.stopPropagation(); // 在这里阻止冒泡
});
// => 1
```

打印一下事件队列

无论怎么执行on，被代理的事件永远是在队首的。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200807113812626.png)



`event.handlers`源码

```javascript
// handlerQueue = jQuery.event.handlers.call( this, event, handlers );
handlers: function( event, handlers ) {
    // this: dom对象
    // event 经过jQuery修正后的事件对象
    // handlers:
    //	[ 0: {type: "click", origType: "click", data: undefined, guid: 1, handler: ƒ, …}]
    // delegateCount: 1 当前元素代理的事件个数
    // cur: 触发当前事件的elem元素节点

    var i, handleObj, sel, matchedHandlers, matchedSelectors,
        handlerQueue = [],
        delegateCount = handlers.delegateCount,
        cur = event.target;


    // Find delegate handlers
    // 处理事件代理
    if ( delegateCount &&

        // Support: IE <=9
        // Black-hole SVG <use> instance trees (trac-13180)
        cur.nodeType &&

        // Support: Firefox <=42
        // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
        // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
        // Support: IE 11 only
        // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
        !( event.type === "click" && event.button >= 1 ) ) {

        // 向上查找，直到没有父亲节点
        // cur 是触发事件的子对象，一直向上查找
        // 找到代理的对象位置 cur = cur.parentNode || this 注意这里只是给个容错机制
        for ( ; cur !== this; cur = cur.parentNode || this ) {

            // Don't check non-elements (#13208)
            // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
            // 找到一个元素节点
            if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
                matchedHandlers = [];
                matchedSelectors = {};

                // 遍历每个代理的事件
                for ( i = 0; i < delegateCount; i++ ) {
                    handleObj = handlers[ i ];
                    // handlers:{
                    // 0:,
                    // data: undefined,
                    // guid: 1,
                    // handler: ƒ (e),
                    // namespace: "",
                    // needsContext: false,
                    // origType: "click",
                    // selector: ".a",
                    // type: "click",
                    // }

                    // Don't conflict with Object.prototype properties (#13203)
                    // 抽出里面的被代理对象
                    sel = handleObj.selector + " ";

                    // 在这里找到触发事件的被代理对象
                    if ( matchedSelectors[ sel ] === undefined ) {
                        matchedSelectors[ sel ] = handleObj.needsContext ?
                            jQuery( sel, this ).index( cur ) > -1 :
                        jQuery.find( sel, this, null, [ cur ] ).length;

                        // jQuery.find( sel, this, null, [ cur ] )
                        // 比如有三个div.a，这里找到触发事件的那个
                        // => [div.a]
                    }

                    // matchedSelectors: {".a ": 1} 存在就把handleObj压入数组,这就是我们要处理的事件
                    if ( matchedSelectors[ sel ] ) {
                        // handleObj
                        // {type: "click", origType: "click", data: undefined, guid: 1, handler: ƒ, …}
                        matchedHandlers.push( handleObj );
                    }


                }

                // 循环结束，压入执行队列
                if ( matchedHandlers.length ) {
                    handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
                }
            }
        }
    }

    // Add the remaining (directly-bound) handlers
    // 处理完事件代理的情况，再处理直接绑定的情况
    // this:dom对象
    cur = this;

    // 如果绑定的事件超过了代理事件的个数
    // 说明还有绑定自身的事件，这个时候再压入队列
    if ( delegateCount < handlers.length ) {
        // 这里就体现出delegateCount的强大之处！
        // delegateCount的值也是直接绑定事件的索引值！
        handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
    }
    // handlerQueue
    // 0: {elem: div.a, handlers: Array(1)}
    // 1: {elem: document, handlers: Array(1)}
    // length: 2
    return handlerQueue;
}
```



### 前置知识

$(el).on(fn) 每次事件绑定都会产生一个handlers放入缓存中，这个handlers存放的是绑定事件以及相关信息。

```javascript
0:{
    data: undefined
    guid: 1
    handler: ƒ (e)
    namespace: ""
    needsContext: false
    origType: "click"
    selector: ".a"
    type: "click"
    __proto__: Object
}
```

而它也会作为`events.handlers`的一个参数

```javascript
handlers: function( event, handlers )
```

event是传入的事件对象。



`event.handlers`处理顺序

1. 代理的事件优先入队
2. 直接绑定的事件再入队



### 代理的事件优先入队

遇到的问题:this指向的问题

```javascript
$(el).on(type, selector, function() {
    console.log(this); //=> selector
}
```

this指向的是selector,而传入的handlers刚好有selector，保存了这个对象选择方式的**字符串**。这就会带来一个问题，如果有多个`<div class='a'></div>`，如何辨别是哪一个？

来看看jQuery的处理

```javascript
var cur = event.target; // 先获取触发事件的对象
```



```javascript
if ( delegateCount && cur.nodeType && !( event.type === "click" && event.button >= 1 ) ) {
    // 触发事件的对象一直向上遍历查找
    // 直到遍历完所有的父节点
    for ( ; cur !== this; cur = cur.parentNode || this ) {

        // 找到一个元素节点
        if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
            matchedHandlers = [];
            matchedSelectors = {};

            // 遍历每个代理的事件
            for ( i = 0; i < delegateCount; i++ ) {
                handleObj = handlers[ i ];
                
	            // 抽出里面的被代理对象选择字符串 '.a'
                sel = handleObj.selector + " ";

                // 在这里找到触发事件的被代理对象
                if ( matchedSelectors[ sel ] === undefined ) {
                    matchedSelectors[ sel ] = handleObj.needsContext ?
                        jQuery( sel, this ).index( cur ) > -1 :
                    jQuery.find( sel, this, null, [ cur ] ).length;

                    // jQuery.find( sel, this, null, [ cur ] )
                    // 比如有三个div.a，这里找到触发事件的那个
                    // => [div.a]
                }

                // matchedSelectors: {".a ": 1} 存在就把handleObj压入数组,这就是我们要处理的事件
                if ( matchedSelectors[ sel ] ) {
                    // handleObj
                    // {type: "click", origType: "click", data: undefined, guid: 1, handler: ƒ, …}
                    matchedHandlers.push( handleObj );
                }


            }

            // 循环结束，压入执行队列
            if ( matchedHandlers.length ) {
                handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
            }
        }
    }
}
```



大概逻辑就是这样，**触发的对象**向上查询到**代理对象**，代理对象可能代理多个，所以要找到缓存中匹配的那个。

![image-20200807163010262](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200807163010262.png)



```javascript
// 在这里匹配
if ( matchedSelectors[ sel ] === undefined ) {
    matchedSelectors[ sel ] = handleObj.needsContext ?
        jQuery( sel, this ).index( cur ) > -1 :
    jQuery.find( sel, this, null, [ cur ] ).length;
    
    // jQuery.find( sel, this, null, [ cur ] )
    // 比如有三个div.a，这里找到触发事件的那个
    // => [div.a]
}

// matchedSelectors: {".a ": 1} 存在就把handleObj压入数组,这就是我们要处理的事件所在的对象
if ( matchedSelectors[ sel ] ) {
    // handleObj
    // {type: "click", origType: "click", data: undefined, guid: 1, handler: ƒ, …}
    matchedHandlers.push( handleObj );
}
```

一旦匹配成功，就把对象压入数组。

代理事件解决。



