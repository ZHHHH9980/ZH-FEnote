# reduce

#### 不带初始值

```javascript
[1,2,3,4].reduce((acc, cur) => {
  return acc + cur
})
// 1 + 2 + 3 + 4
// 10
复制代码
```

#### 带初始值

```javascript
[1,2,3,4].reduce((acc, cur) => {
  return acc + cur
}, 10)
// 10 + 1 + 2 + 3 + 4
// 20
复制代码
```

⚠️ **初始值 `initialValue` 可以是任意类型。如果没有提供 `initialValue`，`reduce` 会从索引 1 的地方开始执行 `callback` 方法，跳过第一个索引。如果提供 `initialValue`，从索引 0 开始。**



## 应用

#### 按属性给数组分类

什么叫按照属性给数组分类，其实就是给定一个依据，把符合条件的归并到一起。再拿账单举例，就是按各个消费类型归为一类。

```javascript
const bills = [
  { type: 'shop', momey: 223 },
  { type: 'study', momey: 341 },
  { type: 'shop', momey: 821 },
  { type: 'transfer', momey: 821 },
  { type: 'study', momey: 821 }
];
bills.reduce((acc, cur) => {
  // 如果不存在这个键，则设置它赋值 [] 空数组
  if (!acc[cur.type]) {
    acc[cur.type] = [];
  }
  acc[cur.type].push(cur)
  return acc
}, {})
```

结果：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210117111705347.png)


#### 求最大值或最小值

一个对象数组内，我想拿到某一项里某个属性最大或者最小的那一项。

```javascript
const testArr = [
  { age: 20 },
  { age: 21 },
  { age: 22 }
]
testArr.reduce((acc, cur) => {
  if (!acc) {
    acc = cur
    return acc
  }
  if (acc.age < cur.age) {
    acc = cur
    return acc
  }
  return acc
}, 0)
// {age: 22}
```

第一次没有对比直接 `acc` 赋值 `cur` ，后面进入对比判断，如果 `acc` 的 `age` 属性小于 `cur` 的 `age` 属性，重制 `acc` 。相等的话默认返回 `acc` 。

> 个人感觉这个挺厉害，而且不太好想；

## 参考

[以前我没得选，现在我只想用 Array.prototype.reduce](https://juejin.cn/post/6916087983808626701#heading-15)

