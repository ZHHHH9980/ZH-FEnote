## Map

- `Map`是一组键值对的结构，任何值都能作为key/value，具有极快的查找速度。

举个例子，假设要根据同学的名字查找对应的成绩，如果用`Array`实现，需要两个`Array`：

```js
var names = ['Michael', 'Bob', 'Tracy'];
var scores = [95, 75, 85];
```

给定一个名字，要查找对应的成绩，就先要在names中找到对应的位置，再从scores取出对应的成绩，Array越长，耗时越长。

如果用Map实现，只需要一个“名字”-“成绩”的对照表，直接根据名字查找成绩，无论这个表有多大，查找速度都不会变慢。用JavaScript写一个Map如下：

```js
var m = new Map([['Michael', 95], ['Bob', 75], ['Tracy', 85]]);
m.get('Michael'); // 95
```



## Map初始化

初始化`Map`需要一个二维数组，或者直接初始化一个空`Map`。

`Map`具有的方法

- has ->检测key是否存在
- get -> 返回value/undefined
- set -> 设置键值对
- delete(key) -> 通过键值从Map中移除对应的数据
- clear -> 清空



一个key只能对应一个value，所以，多次对一个key放入value，后面的值会把前面的值冲掉





## Map和Object的区别

Map的存在就是为了解决Object键值只能是`String`或者`Symbol`类型。



## Set

`Set`和`Map`类似，也是一组key的集合，但不存储value。由于key不能重复，所以，在`Set`中，没有重复的key。



### 创建Set

要创建一个`Set`，需要提供一个`Array`作为输入，或者直接创建一个空`Set`：

```js
var s1 = new Set(); // 空Set
var s2 = new Set([1, 2, 3]); // 含1, 2, 3
```



### Set方法

- add(key)
- delete(key)



### Set应用

由于key值是不能够重复的，即使是NaN也会被认为是唯一的值，因此可以用**Set实现数组去重。**

```js
var set = new Set([1, 2, NaN, NaN, 3, 3, '3']);
[...set] // [1, 2, NaN, 3, "3"]
```



## WeakSet & WeakMap

#### 1.WeakSet与Set的区别

##### 1.WeakSet的成员只能是对象

```js
let weakSet = new WeakSet();
weakSet.add('name');  //TypeError: Invalid value used in weak set
```

##### 2.WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用

> 由于上面这个特点，WeakSet 的成员是不适合引用的，因为它会随时消失。
>  WeakSet 没有size属性，也不可遍历



#### 2.WeakMap与Map的区别

##### 1.WeakMap只接受对象作为键名（null除外）

```js
const weakMap = new WeakMap();
weakMap.set(1, 2)
// TypeError: Invalid value used as weak map key
weakMap.set(Symbol(), 2)
// TypeError: Invalid value used as weak map key
weakMap.set(null, 2)
// TypeError: Invalid value used as weak map key
复制代码
```

##### 2.WeakMap的键名所指向的对象，不计入垃圾回收机制。

> WeakMap结构有助于防止内存泄漏 
>  没有size属性，无法遍历




## 参考

https://juejin.im/post/6844903972554145800#heading-9

https://www.liaoxuefeng.com/wiki/1022910821149312/1023024181109440

https://www.cnblogs.com/dreamcc/p/10892918.html