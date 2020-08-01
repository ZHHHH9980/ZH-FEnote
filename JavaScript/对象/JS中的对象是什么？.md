# JS面向对象编程



## JS中的对象是什么？

回答这个问题前得先明白什么是Object(对象)

> 因为翻译的原因，中文语境下我们很难理解“对象”的真正含义。事实上，Object（对象）在英文中，**是一切事物的总称**，这和面向对象编程的抽象思维有互通之处。



> ECMA-262把对象定义为：“无序属性的集合，其属性可以包含基本值、对象或者函数



这样就能解释JS中的对象了，JS中的对象无非就是键值对的集合，用它可以**描述一切事物及其状态**。

```javascript
// 描述一下我吧
var person = {
    name: 'zh',
    age: 21，
    sleep: function () {
		console.log('go to bed!')
    }
}
```





## JavaScript 对象的特征

1. 对象具有唯一标识性：即使完全相同的两个对象，也并非同一个对象

```javascript
{name: 'zh'} == {name: 'zh'} // 'false'
```



2.对象的属性可以表示其状态或行为，**属性值可以是任何类型**。

还是刚才的例子

```javascript
var person = {
    name: 'zh',
    status: 'tired'，
    sleep: function () {
		console.log('go to bed!')
    }
}
```



3.对象是可以动态修改的

与传统面向对象Java等语言不同,JavaScript的对象可以动态修改,甚至可以影响其状态。

```javascript
var obj = {a: 1};
obj.add = function (){obj.a++;};
obj.add();
obj.a // 2
```



### 为什么对象可以动态修改？

这个问题似乎有点莫名其妙，JS的对象机制不就是如此吗?

这就要提到另一个概念：**属性类型**

这与之前的值类型可以是任何类型并不矛盾。



### 属性类型

> ECMAScript 中有两种属性：数据属性和访问器属性，用于**描述属性的特征**

对象中，属性值用于描述对象属性。特性（这里用‘[[]]’表示）用于描述属性

1.数据属性

- [[ value ]]：就是属性的值。
- [[ writable ]]：决定属性能否被赋值。
- [[ enumerable ]]：决定 for in 能否枚举该属性。
- [[ configurable ]]：决定该属性能否被删除或者改变特征值。



我们通常用于定义属性的代码会产生数据属性，其中的 writable、enumerable、configurable 都默认为 true。我们可以使用内置函数 Object.getOwnPropertyDescripter 来查看，如以下代码所示：

```JavaScript
    var o = { a: 1 };
    o.b = 2;
    //a 和 b 皆为数据属性
    Object.getOwnPropertyDescriptor(o,"a") // {value: 1, writable: true, enumerable: true, configurable: true}
    Object.getOwnPropertyDescriptor(o,"b") // {value: 2, writable: true, enumerable: true, configurable: true}
```

正因为特性[[ configurable ]]和 [[ writable ]]它们描述了属性的状态，没错！属性的状态！因此对象可以动态修改的！

`Object.defineProperty`可以让我们修改特性的值。

```javascript
 var o = { a: 1 };
    Object.defineProperty(o, "b", {value: 2, writable: false, enumerable: false, configurable: true});

//=> modify
obj.b = 3;
console.log(obj); // {a: 1, b: 2} 
```





2.访问器（getter/setter）属性，它也有四个特征。

- getter：函数或 undefined，在取属性值时被调用。
- setter：函数或 undefined，在设置属性值时被调用。
- enumerable：决定 for in 能否枚举该属性。
- configurable：决定该属性能否被删除或者改变特征值。

访问器属性使得属性在读和写时执行代码，它允许使用者在写和读属性时，得到完全不同的值，它可以视为一种函数的语法糖。这里不做过多赘述，具体参考《JavaScript高级程序设计》。



## 总结：

从字面上来看，Javascript的对象无非就是无序键值对的集合。

特性->属性->属性值，Javascript中的特性决定了Javascript中的对象是高度动态的属性集合，属性值可以是任何值，如此高度的灵活性让Javascript可以描述一切事物及其状态。