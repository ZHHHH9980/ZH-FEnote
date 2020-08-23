# promise

> Promise 是异步编程的一种解决方案： 从语法上讲，promise是一个对象，从它可以获取异步操作的消息；从本意上讲，它是承诺，承诺它过一段时间会给你一个结果。 promise有三种状态：**pending(等待态)，fulfiled(成功态)，rejected(失败态)**；状态一旦改变，就不会再变。创造promise实例后，它会立即执行。
>
> > promise知识点多而杂，光看概念难以理解，个人选择了大量的做一些面试题，以此巩固对知识的掌握。



## 易错题整理

- resolve的作用

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);
```

答案：

```js
1 2 4 "timerStart" "timerEnd" "success"
```

**知识点**

- resolve 用于将then中的回调函数加入微任务队列中，并且将参数保存，设置Promise的状态为fullfilled

**小结**

setTimeout这个宏任务将在当前这一轮宏任务结束以后执行，所以先执行第一轮所有的同步任务，再执行setTimeout。

执行setTimeout,遇到resolve,将then中的任务添加入微任务队列，等到退出setTimeout这个宏任务执行上下文之前再执行微任务，因此最后打印"success"





## 参考

[Promise不会？？看这里！！！史上最通俗易懂的Promise！！！](https://juejin.im/post/6844903607968481287)

[【建议星星】要就来45道Promise面试题一次爽到底(1.1w字用心整理)](https://juejin.im/post/6844904077537574919#heading-2)