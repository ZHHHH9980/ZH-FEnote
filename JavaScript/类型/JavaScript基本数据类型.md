### 1.JS原始数据类型有哪些？

在 JS 中，存在着 7 种原始值，分别是：

- boolean
- null
- undefined
- number
- string
- symbol
- bigint





## Symbol



### 引入Symbol的原因

假设他人给你提供了一个对象

```javascript
var obj = {
    a: function (){};
}
```

你想为这个对象添加新的方法，又怕新方法名跟现有方法冲突。

如果有一种机制，保证每个属性的名字都是独一无二的就好了，这样就从根本上防止属性名的冲突。

```javascript
// 别人的对象
var a = Symbol("a");
var obj = {};
obj[a] = function(){};

console.log(obj); // {Symbol(a): ƒ}

// 你在上面添加方法
var b = Symbol("a");
obj[b] = function (){};

console.log(obj); 
//{Symbol(a): ƒ, Symbol(a): ƒ, __proto__: Object} 
```



### 特性

1.通过`Symbol`创建的值是唯一的。

```javascript
"foo" === "foo" // true
Symbol("foo") === Symbol("foo"); // false
```



2.不能围绕原始数据类型创建一个**显式包装器对象**

```javascript
var sym = new Symbol(1); // TypeError
```



什么是显示包装器对象？

其实就是通过`new`实例化构建的原始包装器对象，如 `new Boolean`、`new String`以及`new Number`

```javascript
var num = new Number(1); // Number {1}
typeof num // "object"
```



再来看一段代码

```javascript
var a = 1;
a.toString(); // "1"
```

引申问题：为什么 1 可以调用`toString`?

```javascript
//=> 模拟调用过程发生了什么
var num = new Number(a);
num.toString();
num = null; // 调用后会销毁
```

我们是看不到这个过程的

不信？？不信来捕捉一下它

```javascript
Number.prototype.toString = function () {console.log(this);}

(1).toString() // Number {1}
```

为什么返回的是`Number {1}`而不是1?

还是刚刚讲的，为了调用`toString`，产生了一个包装对象`new Number`，同时**外部作用域对它保持着引用**，因此它就不会被销毁。



### 兼容性问题

IE浏览器不支持Symbol



## BigInt



### 什么是BigInt?

> BigInt是一种新的数据类型，用于当整数值大于Number数据类型支持的范围时。这种数据类型允许我们安全地对`大整数`执行算术操作，表示高分辨率的时间戳，使用大整数id，等等，而不需要使用库。



### 引入BigInt的原因

在JS中，所有的数字都以IEEE754 双精度64位浮点格式表示,仅有52位用于表示尾数（fraction),即最多存放52个1的位组合`11111111111111111111111111...111`

因此最大的数就是2^53-1，十进制表示9007199254740991

超过这个范围就会发生**精度丢失**。

```javascript
9007199254740992 === 9007199254740993;    // => true 
```



### 使用bigInt

在数字结尾+n即可

```javascript
9007199254740992n === 9007199254740993n; // => false
```



### 兼容性问题

IE不兼容，标准浏览器下需要高版本才兼容。