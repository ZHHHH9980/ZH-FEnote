刚开始学JS的时候根本不会特别注意数据类型转换，仅仅只是记得几个常用的。
有些时候有些转换会让人感到困惑
比如：

```javascript
1 - '1' // => 0
1 + '1'  // => 11
1 + '2px' // => '12px'
1 - '2px' // => NaN
if (1) {...}  else {} // => 执行if 
if (0) {...} else {}// => 执行else
```

----------------



# JS中数据类型转换汇总

<br><br>

【转为基本类型】
- 其他类型=> Number
- 其他类型=> String
- 其他类型=>	Boolean

【特殊情况】
  - 数字运算和字符串拼接
  - ''==''进行比较的情况
	

<br><br><br>

JS中数据类型分为

【基本数据类型】

- 数字 number
- 字符串 string
- 布尔值 boolean
- 空 null
- 未定义 undefined
- 标志 symbol
- 长整型 bigInt

后面的`symbol`和`bigInt`可以暂时忽略 记住常用的前五个即可

【引用数据类型】

- 对象 object
  - 普通对象	 ({})
  - 数组对象 （Array)
  - 正则对象 （RegExp)
  - 日期对象（Date)
  - 数学对象（Math）
- 函数 function

<br><br><br>
-----------------------

## 1.把其他数据类型转换为Number类型
``应用场景``
1.基于parseInt/parseFloat/Number等方法转换为数字类型
```javascript
parseInt('3') => 3
parseInt('30px') => 30
Number('3') => 3
Number('3px') => NaN
```
`parseInt`与`Number`的区别在于`parseInt`检测到非数字就会停止截取且返回到检测的数据，`Number`一旦检测到非有效数字就返回`NaN`
<br>

  因为`Number`是浏览器用于转换为数字类型的默认方法，因此我们需要了解它的转换规律
  :star:  :star:  :star:  :star:  :star:
  ```javascript
【把字符串转为数字】
只要遇到一个非有效数字字符，结果就是NaN。

特殊情况:
'' -> 0 空字符串 
' ' -> 0 空格
'\n' -> 0 换行符
'\t' -> 0 制表符


【把布尔值转换为数字】
true -> 1
false -> 0

【把null/undefined转换为数字】
null -> 0
undefined -> NaN // 易错

【把引用类型值转换为数字】 // 易错
首先转换为 字符串(toString),再转换为数字(Number)

[] -> '' -> 0
[13] -> '13' -> 13
{} -> '[object Object]' -> NaN
  ```
<br><br>
2.isNaN()
`isNaN`检测的时候: 当检测的值不是数字类型，浏览器会默认调用**Number()**，然后再检测是否为非有效数字<br>
```javascript
isNaN(3) => true
isNaN('3') => false
等价于
	Number('3') => 3
	isNaN(3) => false
----------------------------------------
isNaN('3px') => true
等价于
	Number('3px') => NaN
	isNaN(NaN) => true
```
<br><br>
3.数学运算 -  * % 
当运算中出现不为Number类型的值的时候，会默认使用Number()方法转为数字再进行运算

```javascript
'3' - 1 = 2
	Number('3') => 3
	3 - 1 = 2

'3px' - 1 = NaN
	Number('3px') => NaN
	NaN - 1 = NaN
```

特殊的存在： +
```javascript
1 + 1 => 2
1 + '1' => '11'
1 + 1 + 1 + 1 + '1' => '41'
```
+号在运算符两边为数字的情况下就会进行正常的数字运算，一旦遇到字符串类型就会转成**字符串拼接**，后面会再提到。
<br>
## 2.把其他类型值转换为字符串
``应用场景``

1.window下自带的api：alert/confirm/prompt/document.write 等方法输出内容的时候，会把输出的值转换为字符串
```javascript
alert(1) => '1'
```

2.基于’+‘号进行字符串拼接

3.把引用类型值转换为数字的时候，也就是上面提到的`Number`方法，首先转为**字符串**，再转为数字
```javascript
[] -> '' -> 0
[13] -> '13' -> 13
[1,3] -> '1,3' -> NaN
```
4.给对象设置属性，如果属性名不是字符串，首先转换为字符串，然后再当作属性存储到对象中
```javascript
var obj = {};
obj[[]] = 1;
obj[0] = 1;
// 存储形式：obj = {'0':1, '':1};
浏览器打印出来'0'会转成数字，不做过多讨论
```

5.调用`String`下的方法 toString/toFixed/join/String等方法的时候，也是为了转换为字符串
```javascript
var n = Math.PI // 3.1415929
n.toFixed(2) // => '3.14'

var arr = [1, 2];
arr.join('+') // => '1+2'
```
与`Number`类似，`toString`也是浏览器默认转换的方法。
`toSting`转换规律

```javascript
// => 调用方法: toString(浏览器默认转换方法)

【除了普通对象，都是理想的转换情况】
1 -> '1'
NaN -> 'NaN'
[] -> ''
[13] -> '13'

【对象】
{name: 'xxx'} // => '[object object]'
{} // -> '[object object]'
任何普通对象结果都是'[object object]'
```

## 3.把其他值转换为布尔值
``应用场景``
- 基于!/!!/Boolean等方法转换
- **条件判断中的条件**最后都会转换为布尔类型
- ...

```ruby
if (n) {
    // => 把n的值转换为布尔值验证真或假
}

if ('3px' + 3) {
    // => 先计算表达式的结果为'3px3‘,再转成布尔值true
}
```

2.转换的规律
:star::star::star::star::star:
只有"**0/NaN/''/null/undefined**"转换为布尔值的`false`,其余都是`true`

容易犯错的地方
```ruby
Boolean(' ') // => true
Boolean([]) // => true
Boolean({}) // => true
```

思考题：
```javascript
[] == ![] // ??

[] => '' => 0
![] => false => 0
[] == ![] // => true
```

------------------------------
<br>

## 特殊情况：'+'数字运算和字符串拼接
```javascript
// => 当表达式中出现字符串，就是字符串拼接，否则就是数字运算
1 + true => 2
'1' + true => '1true'

⭐
[3] + 3 // => '33' 
//虽然没有字符串参与运算，但是引用类型首先 会先转成字符串，因此当作字符串拼接。

// 两个易混淆的情况
[] + 10 // => '10'
({}) + 10 // => '[object object]10'
```



## 特殊情况：'=='在进行比较的时候
原则：如果左右两边的数据类型不一样，则先转换为相同的类型，再进行比较。

- 对象==对象：不一定相等，因为对象操作的是**引用地址**，地址不相同，则不相等。

```ruby
{name: 'xxx'} === {name: 'xxx'} // => false
[] == [] // => false

var obj1 = {};
var obj2 = obj1;
obj1 == obj2 // => true (地址相同)
```
------------------------------------------------------------
对象==数字：把对象转换为数字，然后再比较

对象==布尔：把对象转换为数字，把布尔也转换为数字

对象==字符串：把对象转换为数字，把字符串也转换为数字

字符串==数字：把字符串都转换为数字

字符串==布尔：都转换为数字

布尔==数字：把布尔转换为数字

**总结：类型相同直接比较，类型不同先转换数字再比较**



-------------------------------------------

特殊情况：
```javascript
null == undefined: true
null === undefined: false
null & undefined和其他值都不相等
```

```javascript
NaN == NaN : false
NaN 不等于任何值包括NaN
```



## **总结:**
JS中数据类型转换只有三种情况

1. 转换为布尔值
2. 转换为数字
3. 转换为字符串



"+"字符串拼接的特殊情况

1. "+"两边出现字符串就是字符串拼接 
2. 引用数据类型先转字符串再进行拼接



不同类型使用”==“的情况

1. 对象==对象 比较的是**内存空间地址**

2. 其余都转成**数字**比较

3. null == undefined : true
null === undefined: false

4. NaN == NaN :false // => NaN不等于任何值，包括自身