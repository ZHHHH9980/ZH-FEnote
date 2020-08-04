# jQuery.each

深入学习参考https://github.com/mqyqingfeng/Blog/issues/40



## 换一个角度学习

这里单独开一篇记录是一直很好奇Query.fn.on中的一段代码,明明调用的elem是jQ对象，为什么内部函数this打印出来**却是dom元素节点**？？？

```javascript
// elem=> jqObj
return elem.each( function() {
    // this => domObj
    jQuery.event.add( this, types, fn, data, selector );
} );
```



```javascript
each: function( obj, callback ) {
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
      // 对象就for in 遍历
      for ( i in obj ) {
         if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
            break;
         }
      }
   }

   return obj;
}
```

原来猫腻就在第九行

```javascript
callback.call( obj[ i ], i, obj[ i ] ) 
// this指向了Obj[ i ] obj就是jQ对象 obj[ i ]就是dom元素节点
// => obj[ i ].callback()
// callback的this当然指向dom节点拉
```

