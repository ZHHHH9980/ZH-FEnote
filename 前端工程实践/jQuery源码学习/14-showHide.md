# showHide

jQuery支持直接隐藏一个或多个由jQuery包装的dom节点。

### 语法

`$(els).show() / $(els).hide()`



### 基本思路

`show/hide`只是两个接口，本质上都是通过`showHide`方法实现显示隐藏的。里面还用到了之前提及的缓存系统。非常小巧有趣。

一般我们控制显示隐藏都是通过`display`这个属性，添加这个属性的方式有两种。

- 通过内联标签的方式<div style="display:none">
- 或者通过css层叠样式表设置。

这两种方式**对应**的获取方式

- element\['style'\].display
- window.getComputedStyle(elem).getPropertyValue('display')



### 困难点

`dsiplay`的种类非常多，调用`show`仅仅将隐藏元素的`display`设置成block..等是非常粗暴的，而且可能会带来一些问题。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200819082224420.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

（display部分属性）

因此，最好能够记录下元素`hide`之前的`display`样式，这样`show`的时候，直接将原先的`display`样式还原即可。



### 简易实现

为了更方便理解，我们先从hide开始考虑

```js
$.fn.extend({
    showHide: function (elems, show) {
        let elem,
            i = 0,
            len = elems.length;
        
        for(; i < len; i++) {
            elem = elems[i];
            
            // hide
            if(!show) {
                if (elem.style.display !== 'none') {
                    // 通过自定义属性记录先前的display样式
                    elem.displayVal = elem.style.display;
                    
                    elem.style.display === 'none';
                }
            }
        }
    }
})
```

思路很简单，遍历每一个节点，没隐藏的就隐藏，隐藏前先通过自定义属性存储之前的`displayVal`

接下来考虑show

```js
$.fn.extend({
    showHide: function (elems, show) {
        let elem,
            i = 0,
            len = elems.length,
            value;
        
        for(; i < len; i++) {
            elem = elems[i];
            
            // hide
            if(!show) {
                if (elem.style.display !== 'none') {
                    // 通过自定义属性记录先前的display样式
                    elem.displayVal = elem.style.display;
                    
                    elem.style.display === 'none';
                }
            // show
            } else {
                // 内联样式设置display:none
                if (elem.style.display === 'none') {
                    elem.style.display = elem.displayVal;
                }
                // css样式表设置display:none
                if (window.getComputedStyle(elem).getPropertyValue('display') === 'none') {
                    elem.style.display = elem.displayVal;
                }
            }
        }
    }
})
```



### 完善show

show仅仅考虑样式设置两种情况，但是没有考虑是否有缓存的情况。

```js
// show
else {
    let displayVal = elem.displayVal;
    // 有缓存用缓存，没有缓存清空value（相当于设置标志位）
    if (elem.style.display === 'none') {
        elem.style.display = displayVal ? displayVal: '';
    }
    
    // 没有缓存，且通过css样式表设置
    if (!displayVal && window.getComputedStyle(elem).getPropertyValue('display') === 'none') {
        elem.style.display = 'block';
    }
}
```

整合后的代码

```js
$.fn.extend({
    showHide: function (elems, show) {
        let elem,
            i,
            len = elems.length;

        for (i = 0; i < len; i++) {
            elem = elems[i];

            // hide
            if(!show) {

                if (elem.style.display !== 'none') {
                    // 通过自定义属性记录先前的display样式
                    elem.displayVal = elem.style.display;

                    elem.style.display = 'none';
                }
            } else { // show
                let displayVal = elem.displayVal;
                // 有缓存用缓存，没有缓存清空value（相当于设置标志位）
                if (elem.style.display === 'none') {
                    elem.style.display = displayVal ? displayVal: '';
                }

                // 没有缓存，且通过css样式表设置
                if (!displayVal && window.getComputedStyle(elem).getPropertyValue('display') === 'none') {
                    elem.style.display = 'block';
                }
            }
        }
        return elems;
    }   
})
```



## 其他

其实功能基本上已经实现了，但跟源码还是有点区别，一大区别就是源码使用了之前事件处理用的缓存系统来记录`display`。第二个区别**使用了数组保存了每个元素要设置的样式，最后统一修改**。

这里着重记录一下第二个区别。

> ```
> // Set the display of the elements in a second loop to avoid constant reflow
> ```

直接引用jQuery的注释，在第二个循环中设置`display`**避免持续回流**!

这个太重要了，值得好好学习。

```js
showHide: function (elems, show) {
    let elem,
        i,
        j,
        len = elems.length,
        displayVal,
        values = []; // 在这里存储每个元素要修改的样式

    for (i = 0; i < len; i++) {
        elem = elems[i];

        // hide
        if(!show) {

            if (elem.style.display !== 'none') {

                // elem.displayVal = elem.style.display;
                dataPriv.set(elem, 'display', elem.style.display);

                values[i] = 'none';
            }
        } else { // show
            // 读取缓存
            displayVal = dataPriv.get(elem, 'display');

            // 有缓存用缓存，没有缓存清空value（相当于设置标志位）
            if (elem.style.display === 'none') {
                values[i] = displayVal ? displayVal: '';
            }

            // 没有缓存，且通过css样式表设置
            if (!values[i] && window.getComputedStyle(elem).getPropertyValue('display') === 'none') {
                values[i] = 'block';
            }
        }
    }
    
    // 一次性写完
    for(j = 0; j < len; j++) {
        if(!elems[j]) {
            continue;
        }

        elems[j].style.display = values[j];
    }

    return elems;
}
```

