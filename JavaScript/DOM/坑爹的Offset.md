# Offset
jQuery@3.5.1 中有一个API,`$(el).offset()`可以用于获取元素相对于整个网页的左、上边偏移量。
图片截取自MDN
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200817090531330.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)
我们看看jQuery内部是如何实现的。（省去了一些兼容处理，只关注核心API）

```js
offset: function (options) {
            var rect, win,
                elem = this[0];

            if (!elem) {
                return;
            }

            // Get document-relative position by adding viewport scroll to viewport-relative gBCR
            rect = elem.getBoundingClientRect();
            win = elem.ownerDocument.defaultView;
            return {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            };
        }
```
这有两个不太常见的属性
MDN：
>Node.**ownerDocument** 只读属性会返回当前节点的顶层的 document 对象。

> Document.defaultView 在浏览器中，该属性返回当前 document 对象所关联的 **window** 对象，如果没有，会返回 null。

`rect = elem.ownerDocument.defaultView;`  某种情况下可以看作就是`window`对象。

[Element.getBoundingClientRect()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200817091554346.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)
原理大概就是这样，当时觉得有点奇怪，不是有一个`node.offsetTop`吗，为什么非要读取两个属性值？

## demo
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        * {
            padding: 0;
            margin: 0;
        }
        .parent {
            width: 300px;
            height: 300px;
            background-color: red;
            margin-top: 30px;	/*key value*/
            padding: 10px;		/*key value*/
        }
        .son {
            width: 150px;
            height: 150px;
            background-color: greenyellow;
        }
        html {
            height: 2000px;
        }
    </style>
</head>
<body>
<div class="parent">
    <div class="son"></div>
</div>
<script>
    let son = document.querySelector('.son');
    console.log(`getBoundingClient: ${son.getBoundingClientRect().top}`);
    console.log(`offsetTop: ${son.offsetTop}`);
    console.log(`scrollY: ${window.scrollY}`);
</script>
</body>
</html>
```
这么一看，好像没有什么问题。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200817092341602.png#pic_center)

## offsetTop
> mdn:
> The HTMLElement.offsetTop read-only property returns the distance of the current element relative to the top of the **offsetParent node**.

### offsetParent
> HTMLElement.offsetParent 是一个只读属性，返回一个指向最近的（指包含层级上的最近）**包含该元素的定位元素**或者最近的 table,td,th,body元素。当元素的 style.display 设置为 "none" 时，offsetParent 返回 null。offsetParent 很有用，因为 offsetTop 和 offsetLeft 都是相对于其内边距边界的。

简而言之，`offsetLeft`会找最近的定位元素或者body元素当作偏移量参考。

我们打印一下`son`的`offsetParent`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200817092916766.png#pic_center)
给`parent`加一个`position: relative`定位
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200817093224654.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)
原来如此...看来`offsetLeft/offsetTop`使用得小心。

## 扩展
除了jQuery的解决方法，还有没有其他解决方法？
利用刚才的`offsetParent`就可以！

注意`document.window.offsetParent`返回`null`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200817093537569.png#pic_center)
利用这个特性搭配`offsetLeft`也可以算出左边距。
```js
let parent = son.offsetParent,
    offsetL = son.offsetLeft;

while(parent) {
    offsetL += parent.offsetLeft;
    parent = parent.offsetParent;
}
```

但是写到这还没完，`offsetLeft`获取的是外边框到`offsetParent`的距离，如果`offsetParent`具有外边框那不是算少了？
我们给`parent`增加外边框
```css
.parent {
     width: 300px;
     height: 300px;
     border: 20px solid #333;
     background-color: red;
     margin-top: 30px;
     padding: 10px;
     position: relative;
 }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020081709485545.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)
`clientLeft`可以获取元素的左边框大小。
利用这个属性完善我们的代码

```js
let parent = son.offsetParent,
    offsetL = son.offsetLeft;

while(parent) {
    offsetL += parent.offsetLeft + parent.clientLeft;
    parent = parent.offsetParent;
}
```

收工。