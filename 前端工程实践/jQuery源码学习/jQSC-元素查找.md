# 元素查找与索引



## eq

eq是非常常用的一个方法，用于查找多个jQuery对象中的其中某一个，核心是返回一个**jQuery对象**。

> eq(index|-index)
>
> 获取当前链式操作中第N个jQuery对象，返回jQuery对象，当参数大于等于0时为正向选取，比如0代表第一个，1代表第二个。当参数为负数时为反向选取，比如-1为倒数第一个，具体可以看以下示例。
>
> 类似的有[get(index)](https://jquery.cuishifeng.cn/get.html),不过[get(index)](https://jquery.cuishifeng.cn/get.html)返回的是DOM对象。



官网的:chestnut:

Consider a page with a simple list on it:

```html
<ul>  
    <li>list item 1</li>  
    <li>list item 2</li>  
    <li>list item 3</li>  
    <li>list item 4</li>  
    <li>list item 5</li>
</ul>
```

We can apply this method to the set of list items:

```js
$( "li" ).eq( 2 ).css( "background-color", "red" );
```



### eq源码

```js
eq: function (i) {
    var len = this.length,
        j = +i + (i < 0 ? len : 0);

    return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
}
```



### pushStack

```js
pushStack: function (elems) {

    // Build a new jQuery matched element set
    var ret = jQuery.merge(this.constructor(), elems);
    console.log(this.constructor === jQuery); //=> true
    
    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    // Return the newly-formed element set
    return ret;
}
```



### merge

```js
merge: function (first, second) {
    var len = +second.length,
        j = 0,
        i = first.length;

    // 扩展
    for (; j < len; j++) {
        first[i++] = second[j];
    }

    // 更新长度
    first.length = i;

    return first;
}
```

merge方法类似于数组原型上的`concat`，就是两个对象进行合并，从这也可以看出pushStack就是做两件事：

1. 将提取出来的对象跟jQuery对象合并
2. 合并的jQuery对象上放一个`prevObject`保存合并前的对象



merge真的是万金油一样的东西。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200814084402213.png#pic_center)



### index

index有三种用法

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200814092301775.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)