# promise

> Promise 是异步编程的一种解决方案： 从语法上讲，promise是一个对象，从它可以获取异步操作的消息；从本意上讲，它是承诺，承诺它过一段时间会给你一个结果。 promise有三种状态：**pending(等待态)，fulfiled(成功态)，rejected(失败态)**；状态一旦改变，就不会再变。创造promise实例后，它会立即执行。
>
> > promise知识点多而杂，光看概念难以理解，个人选择了大量的做一些面试题，以此巩固对知识的掌握。





## 易错题整理

==1.resolve的作用==

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

resolve 用于将then中的回调函数加入微任务队列中，并且将参数保存，设置Promise的状态为**fullfilled**



**小结**

setTimeout这个宏任务将在当前这一轮宏任务结束以后执行，所以先执行第一轮所有的同步任务，再执行setTimeout。

执行setTimeout,遇到resolve,将then中的任务添加入微任务队列，等到退出setTimeout这个宏任务执行上下文之前再执行微任务，因此最后打印"success"



==2.微任务执行时机==

```js
    Promise.resolve().then(() => {
      console.log('promise1');
      const timer2 = setTimeout(() => {
        console.log('timer2')
      }, 0)
    });
    const timer1 = setTimeout(() => {
      console.log('timer1')
      Promise.resolve().then(() => {
        console.log('promise2')
      })
    }, 0)
    console.log('start');
// start promise1 timer1 promise2 timer2
```

第一轮执行任务队列情况

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200824082432806.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

同步任务执行完毕，打印 `start promise1`，开始执行微任务。

微任务打印`promise1`,将timer2置于宏任务队列。



第二轮任务执行情况

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200824082924617.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

- 打印`timer1`

- 执行微任务 打印`promise2`

- timer1弹出调用栈

- 执行timer2 打印`timer2`



==3.then/catch都会返回一个新的promise对象==

```js
const promise1 = new Promise((resolve, reject) => { 
  console.log('promise1') 
  resolve('resolve1') 
}) 
const promise2 = promise1.then(res => { 
  console.log(res) 
}) 
console.log('1', promise1); 
console.log('2', promise2); 
/*
'promise1' 
'1' Promise{<resolved>: 'resolve1'} 
'2' Promise{<pending>}  <- 返回一个新的promise对象
*/
```



==4.连续调用多个then/catch，**promise状态一经改变都会执行**并且获取传入的值。==

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('timer')
    resolve('success')
  }, 1000)
})
const start = Date.now();
promise.then(res => {
  console.log(res, Date.now() - start)
})
promise.then(res => {
  console.log(res, Date.now() - start)
})
/*
timer
success 1002
success 1002
*/
```

catch也是一样的机制，没实践过还真不知道。

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('timer')
    reject('fail')
  }, 1000)
})
const start = Date.now();

promise.catch(res => {
  console.log(res, Date.now() - start)
})
promise.catch(res => {
  console.log(res, Date.now() - start)
})
/*
timer
fail 1001
fail 1001
*/
```



==5.promise中，返回一个非promise对象都会被包装成promise对象==

```js
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    return 3;
  })
  .then(res => {
    console.log(res);
  });
// 1 2
```

引申问题：如果返回一个错误对象，catch能捕捉到吗？

```js
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return new Error;
  })
  .catch(err => {
    return 3;
  })
  .then(res => {
    console.log(res);
  });
//1 Error
```

是不能捕捉到的，实际上会返回 Promise.resolve(new Error) 即 **非promise对象会被包装成promise对象返回**



==6.then:resolved状态下将微任务放入微任务列表==

这题出的非常好，还考察了finally

```js
function promise1 () {
  let p = new Promise((resolve) => {
    console.log('promise1');
    resolve('1')
  })
  return p;
}
function promise2 () {
  return new Promise((resolve, reject) => {
    reject('error')
  })
}
promise1()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally1'))

promise2()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally2'))

```

第一次做的时候会认为promise1().then一直执行到底。

then:resolved状态下将微任务**放入**微任务列表，类似地catch:rejected状态下将微任务**放入**微任务列表

❗这里是放入，不是执行，**执行是在当前宏任务弹出作用栈之前**。





```js
promise1()
  .then(res => console.log(res)) //=> 放入微任务队列后就不再执行了
  .catch(err => console.log(err))
  .finally(() => console.log('finally1'))

promise2()
  .then(res => console.log(res))
  .catch(err => console.log(err)) //=> 放入微任务队列后就不再执行了
  .finally(() => console.log('finally2'))

```

第一轮微任务执行

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200824092724683.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

第二轮执行两个finally

答案应该是

```js
/* promise1 1 error finally1 finally2*/
```





## 参考

[Promise不会？？看这里！！！史上最通俗易懂的Promise！！！](https://juejin.im/post/6844903607968481287)

[【建议星星】要就来45道Promise面试题一次爽到底(1.1w字用心整理)](https://juejin.im/post/6844904077537574919#heading-2)