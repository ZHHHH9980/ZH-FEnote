# setTimeout、Promise、Async/Await 的区别

事件循环中分为宏任务队列和微任务队列。
其中settimeout的回调函数放到宏任务队列里，等到执行栈清空以后执行；
promise.then里的回调函数会放到**相应宏任务的微任务队列**里，等宏任务里面的同步代码执行完再执行；

async函数表示函数里面可能会有异步方法，await后面跟一个表达式，async方法执行时，遇到**await会立即执行表达式**，然后把**表达式后面的代码放到微任务队列里，让出执行栈**让同步代码先执行。



### 综合运用

```js
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}
console.log('script start');
setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```

- 代码执行到第9行 打印`script start`

- 第10行 将setTimeout放入宏任务队列

- 13行执行async1,打印`async1 start`

- **遇到await立即执行表达式,打印`async2`,将后面的代码放入为微任务队列，让出执行栈**。
- 打印`promise1`（new Promise是同步）
- 16行将promise状态改为resolved,17行判断状态为resolved，将回调**推入微任务队列**。
- 20行打印`script end`



同步代码执行完毕，开始检查微任务列表。如图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200824103404146.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

- 打印`async1 end` `promise2` `setTimeout`



## async await

上面说得并不完全。

async函数表示函数里面可能会有异步方法，await后面跟一个表达式.

async方法执行时：

1. 遇到**await会立即执行表达式**，
2. **==（表达式如果有promise的话，等待Promise执行，直到返回状态）==**
3. 然后把**表达式后面的代码放到微任务队列里，让出执行栈让同步代码先执行**。

再看一个mdn的:chestnut:

```js
function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 2000);
  });
}

async function asyncCall() {
  console.log('calling');
  // 等待promise执行返回状态，才继续执行！
  const result = await resolveAfter2Seconds();
  console.log(result);
  // expected output: "resolved"
}

asyncCall();
console.log('同步代码先执行');
```

打印 calling 同步代码先执行 resolved



## 参考

https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/33