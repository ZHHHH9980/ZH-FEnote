

# JS盒子模型属性

​	=>在JS中通过相关的属性可以获取（设置）元素的样式信息，这些属性就是盒子模型（基本上是有关于样式的）



​	client

  - top
  - left
  - width
  - height



​	offset

  - top
  - left
  - width
  - height
  - parent



​	scroll

  - top
  - left
  - width
  - height



//=>clientTop/Left/Width/Height

//1.clientWidth & clientHeight; 获取当前区域可视区宽高（内容的宽高+上下/左右的padding)

// 和内容是否溢出无关（和是否设置overflow:hidden也无关），就是我们自己设置的内容宽高+padding



//=> 获取当前页面一屏幕（可视区域）的宽度和高度

```javascript
document.documentElement.clientWidth || document.body.clientWidth
document.documentElemtent.clientHeight || document.body.clientHeight
​						  										(处理兼容性)
```



//2.clientTop & clientLeft: 获取（上/左）边框（border）的宽度



//3.offsetWidth & offsetHeight:在client的基础上加border（和内容是否溢出也没有关系）



//4.scrollWidth & scrollHeight: 真实内容宽高（不一定是自己设置的值，因为可能存在内容溢出，有内容溢出的情况下需要把溢出的情况也算上）+ 左/上padding,而且是一个约等于的值。（内容没有溢出的情况下scrollHeight = clientHeight)

// 在不同浏览器中，或者是否设置overflow：hidden都会对最后的结果产生影响，所以这个值仅作参考，属于约等于的值。

//=> 获取当前页面真实宽高（包含溢出部分）

```javascript
// document.documentElement.scrollWidth || document.body.scrollWidth
// docuement.documentELement.scrollHeight || document.body.scrollHeight
```





如何通过JS控制弹窗在屏幕的正中间？

两个容器的clientWidth相减除以二，然后设置margin即可。

![image-20200617094917910](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200617094917910.png)



```css
#outer {
    margin: 50px auto;
    padding: 20px;
    width: 260px;
    height: 260px;
    /* box-sizing: content-box -> 不包含paddind/border
*设置box-sizing: border-box;指代的是整个盒子的宽高 （内容+padding+border)
*/
    border: 10px solid red;
}
```





//=>通过JS盒子模型属性获取值的特点

1.获取的都是数字，不带单位

2.获取的都是整数，不会出现小数（一般都会四舍五入，尤其是获取的偏移量）

3.获取的结果都是复合样式值（好几个元素样式组合在一起），如果只想获取单一样式的值（例如：只想获取padding），我们的盒子模型属性就操作不了



### 获取元素具体某个样式值

1.[element].style.xxx 操作获取

//=> 只能获取所有写在元素行内的样式，不写在行内上，就无法通过该方法获取到。（真实项目中，我们很少会把样式写在行内上）



2.获取当前元素所有经过浏览器计算的样式

//=> 只要当前元素可以在页面中呈现（浏览器渲染），那么它的样式都是被计算过的。

//=> 不管样式写在哪

//=> 不管是否写了（浏览器会设置一下默认样式）

/*

*标准浏览器(IE9+)

- window.getComputedStyle([element, [伪类，一般写null]]) 获取所有到当前元素所有被浏览器计算过的元素

返回结果是一个**对象**，这个对象是**只读的**



IE6~8

​	[element].currentStyle 获取经过计算的样式

```javascript
/*
* getCss: 获取当前元素某一个样式属性值
*
* @param
*	curEle[Object]: 当前操作的元素
*	attr[String]: 当前要获取的样式属性名
*
* @return 
*	获取样式的属性值
*/
let getCss = function (element, attr) {
    if ('getComputedStyle' in window) {
        let val = window.getComputedStyle(element, null)[attr];
        // 把获取的结果去除单位，仅去除-12px、12px这样的形式，类似'none\rbg(0,0,0)'不去除,因此不能直接使用parseFloat
        let reg = /^-?\d+(\.\d+)?(px|em|rem|pt)?$/i;
        reg.test(val) ? val = parseFloat(val) : null;
        return val;
    }
    throw new Error('当前浏览器版本过低');
};
let getCss = getClass(ele, attr);
```



JS中给元素设置样式只有两种

1.设置元素的样式类名（前提：样式类名以及对应样式已经处理完成）

2.通过行内样式设置 xxx.style.xxx = xxx

```javascript
let setCss = function (curEle, attr, value) {
    //1.细节处理：opacity不兼容IE6~8,在IE6~8下设置透明度filter:alpha(value*100)
    if (attr === 'opacity') {
        curEle.style.opacity = value;
        curEle.style.filter = 'alpha('+ value*100 +')';
    }

    //2.对于width/height/fontSize以及margin/padding/top/left..这些样式，没有加单位需要将单位加上
    //=> 如果用户已经传入单位，就不要再加
    if (!isNaN(value)) {
        let reg = /(width|height|fontSize|(margin|padding)?(top|left|right|bottom)?)/i;
        // 上面的正则两个??代表如果margin不存在或者padding不存在，直接top/left/right都行

        reg.test(attr) ? value += 'px': null;
    }
    curEle.style[attr] = value;
};
setCss(el, 'width', 300);
```





setGroupCss

// 实现批量设置CSS样式

```javascript
let setGroupCss = function (curEle, options = {}) {
   // 遍历options这个对象，有多少键值对就循环多少次，逐一调用setCss
    for (key in options) {
        if (!options.hasOwnProperty(key)) break; // 遍历到公有属性就代表私有属性遍历完毕
        setCss(curEle, key, options[key]);
    }
};
setGroupCss(outer, {
    width: 400,
    height: 400,
    padding: 20
});
```



// for in 

// => 循环用于遍历一个对象的键值对，有多少组键值对，就遍历多少次

// => 支持`break``continue`等关键词



```javascript
let obj = {name: 'xxx', age: 27, gender: woman};
for (key in obj) {
    console.log(key); // 属性名
    console.log(obj[key]); // 属性值
}
---------------------------------------------------------------------
let obj = { name: 'xxx', age: 27, gender: 'woman',0: 1};
for (key in obj) {
    console.log(key); // 属性名
    console.log(obj[key]); // 属性值
}
```

![image-20200617162831515](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200617162831515.png)

数字属性名会**优先**遍历



//=> 只遍历当前变量**可枚举的属性**

```javascript
//可枚举的属性：
//1.对象的私有属性
//2.浏览器内置属性一般都不可枚举
//3.自己在类的原型上设置的属性也是可枚举的，for-in循环的时候也会被遍历出来（一般情况下，我们不希望遍历到原型上的共有属性）

for (key in obj) {
    if (obj.hasOwnProperty(key)) { // 验证是否是私有属性，只有是私有的属性，我们才进行操作
		
    }
}
```





css:get/set/setgroupCss 集合方法

```javascript
let css = function (...arg) {
    // arg:传递的实参集合
    if (arg.length === 2 && arg[1] !== null) {
        return typeof arg[1] === 'string' ? getCss(arg[0], arg[1]) : setCssGroup(arg[0], arg[1]) 
    } else {
        return setCss(...arg);
        // or setCss.apply(null, arg); 调用apply也可以将数组传入
    }
}

-------------//分析
// css(curEle, 'width') => get
// css(curEle, 'height', 300) => set
/*
css(curEle, {
	width: 300,
    height: 300
}) => setGroup
*/
```



优化版本：

// 因为最终都是只执行一个函数

```javascript
let css = function (...arg) {
    let len = arg.length;
    let second = arg[1];
    let fn = getCss;
    length === 3 ? fn = setCss : null;
    typeof second === 'object' ? fn = setCss : null;
    return fn(...arg);
}
```



最后：封装成公共方法库

```javascript
let utils = (function () {
    let setCss = function (curELe, attr, value) {//...}
    let getCss = function () {//...}
    let setCssGroup = function () {//...}
      
    let css = function(...arg) {}
    return {
        css
    }
})();
        
//调用
utils.css(el, {
    width: 300,
    height: 200
});
// 在jquery类库的方法中也有一个方法叫css，这就是模拟
```



# 盒子偏移量

offsetParent: 当前盒子的父级参照物

offsetTop / offsetLeft: 获取当前盒子距离其父级参照物的偏移量（上偏移/左偏移）从当前盒子的外边框~父级参照物的内边框的距离（不包括边框）



[（相关内容已更新-坑爹的Offset）](./坑爹的Offset.md)



:star::star::star::star::star:

在JS中，**只有scrollTop/scrollLeft**是可读写属性，其余都是只读的。





