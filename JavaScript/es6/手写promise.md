# promise-手写

## excutor

实例化Promise传入一个函数，会被立即执行。

```js
let p1 = new Promise((resolve, reject) => {
    console.log(1);
});
console.log(2);
//=> 1 2
```



## 手写代码

```js
class Promise {
    constructor(executor) {
        executor();
    }
}
```



## then&resolve&reject

传入的executor执行，会接受两个回调参数，一个是resolve,一个是reject,用于改变状态并执行then中传入的两个函数。

```js
let p1 = new Promise((resolve, reject) => {
    Math.random() > 0.5 ? resolve('result'): reject('reason');
});

p1.then(result => {
	console.log(result);
}, reason => {
    console.log(reason);
})

// 'result' or 'reason'
```

执行resolve/reject会返回两个对应的状态，'fullfilled'/'reject',等待状态为'pending'。

```js
class Promise {
    constructor(executor) {
        this.status = 'pending';
        // 初始化then中传入的两个异步回调函数
        this.fullfilledCallback = null;
        this.rejectCallback = null;
        executor();
    }
    then(fullfilledCallback, rejectedCallback) {
        
    }
}
```

一旦状态改变，就执行相应的callback，我们用一个函数将它们包裹起来，传给executor，供其调用resolve/reject。注意，**promise的状态一旦改变就不再发生变化。**

```js
class Promise {
    constructor(executor) {
        this.status = 'pending';
        // 初始化then中传入的两个异步回调函数
        this.fullfilledCallback = null;
        this.rejectedCallback = null;
        
        let resolve = result => {
            // 状态一旦发生变化就不再改变
            if (this.status === 'pending') {
                this.status = 'fullfilled';
                this.fullfilledCallback(result);
            }
        }
        let reject = reason => {
			if (this.status === 'pending') {
                this.status = 'rejected';
                this.rejectedCallback(reason);
            }
        }
        
        // 包装好以后传入
        executor(resolve, reject);
    }
    
    then(fullfilledCallback, rejectedCallback) {
        this.fullfilledCallback = fullfilledCallback;
        this.rejectedCallback = rejectedCallback;
    }
}
```

我们结合刚才的测试用例

```js
let p1 = new Promise((resolve, reject) => {
    Math.random() > 0.5 ? resolve('result'): reject('reason');
});

p1.then(result => {
	console.log(result);
}, reason => {
    console.log(reason);
})

// => TypeError: this.rejectedCallback is not a function
```

会报引用错误，调用rejectedCallback的时候还不是一个函数。主要是因为resolve/reject执行以后才执行then，那时候then中的方法还没传入。

只要想办法让**resolve/reject在then执行之后再执行即可**,这里可以选择使用一个**定时器**，将resolve/reject要执行的代码放入宏任务队列，等当前任务中的同步代码执行完毕再执行resolve/reject。

```js
class Promise {
    constructor(executor) {
        this.status = 'pending';
        // 初始化then中传入的两个异步回调函数
        this.fullfilledCallback = null;
        this.rejectedCallback = null;
        
        let resolve = result => {
            if (this.status === 'pending') {
                let timer = setTimeout(() => {
                    this.status = 'fullfilled';
                    this.fullfilledCallback(result);
                    clearTimeout(timer);
                })
            }
        }

        let reject = reason => {
            if (this.status === 'pending') {
                let timer = setTimeout(() => {
                    this.status = 'rejected';
                    this.rejectedCallback(reason);
                    clearTimeout(timer);
                })
            }
        }

        
        // 包装好以后传入
        executor(resolve, reject);
    }
    
    then(fullfilledCallback, rejectedCallback) {
        this.fullfilledCallback = fullfilledCallback;
        this.rejectedCallback = rejectedCallback;
    }
}

let p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        Math.random() > 0.5 ? resolve('result'): reject('reason');
    }, 1000)
});

p1.then(result => {
	console.log(result);
}, reason => {
    console.log(reason);
})
// 'result'
```

测试用例加了一个定时器模拟异步任务，同样也能实现promise，因为执行resolve/reject才会再设置一个定时器，**而then中的回调早已放入。**



## thenable

then支持链式调用，也支持使用变量存储再调用then，**每次调用then都会返回一个新的promise对象。**

```js
let p1 = new Promise((resolve, reject) => {
    Math.random() > 0.5 ? resolve('result') : reject('reason');
});

let p2 = p1.then(result => {
    console.log(result);
})

let p3 = p2.then(result => {
    console.log(p2 === p3); //=> false
    console.log(result);
})
```

我们的代码不能仅仅是在then方法中返回一个promise对象那么简单，还需要考虑异常处理。

```js
let p1 = new Promise((resolve, reject) => {
    Math.random() > 0.5 ? resolve('result') : reject('reason');
});

let p2 = p1.then(result => {
    console.log('p2 result:' + result);
}, reason => {
    console.log('p2 reason:' + reason);
});

let p3 = p2.then(result => {
    console.log('p3 result:' + result);
}, reason => {
    console.log('p3 reason:' + reason);
})
```

分析如图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/202009121808553.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

有一条特别加粗的绿色线，也就是说只要rejectedCallback正常执行，**没有出现异常，会执行p3中传入的fullfilledCallback**，这点跟直觉是不相符的。

从另一个角度来讲，p2中两个回调的执行会影响下一个then中的方法执行。因此我们需要“劫持”这两个回调，根据它的状态来决定下一步的代码运行。

- 异常捕获使用的是try...catch

```js
 class Promise {
     //...
     
         then(fullfilledCallback, rejectedCallback) {
            /*this.fullfilledCallback = fullfilledCallback;
            this.rejectedCallback = rejectedCallback;*/

            return new Promise((resolve, reject) => {

                this.fullfilledCallback = result => {
                    try {
                        fullfilledCallback(result);
                        //=> 管控下一个promise的状态
                        resolve();
                    } catch (e) {
                        //=> 捕获到了异常，下一个then执行rejectedCallback
                        reject(e);
                    }
                }

                this.rejectedCallback = reason => {
                    try {
                        rejectedCallback(reason);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                };
            });
        }
    }
}
```

测试用例:

```js
let p1 = new Promise((resolve, reject) => {
    Math.random() > 0.5 ? resolve('result') : reject('reason');
});

let p2 = p1.then(result => {
    console.log('p2 result:' + result);
}, reason => {
    throw new Error('p2 error');
    console.log('p2 reason:' + reason);
});

let p3 = p2.then(result => {
    console.log('p3 result:' + result);
}, reason => {
    console.log('p3 reason:' + reason);
})
// TypeError: this.fullfilledCallback is not a function
```

这里报错的原因跟异步无关，主要是因为p3执行fullfilledCallback的时候，**再一次调用了resolve**，而resolve中是放入了下一个then中的fullfilledCallback，p3后没有在调用then了，就抛出了错误。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200912184306211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

解决方式也很简单，无非就是判断callback是否存在，注意，这里setTimeout跟之前有些不一样，这次把**判断放入定时器内部，是为了异步获取callback。**

```js
class Promise {
    constructor(executor) {
        this.status = 'pending';
        this.value = null;

        // 初始化then中传入的两个异步回调函数
        this.fullfilledCallback = null;
        this.rejectedCallback = null;

        let resolve = result => {
            let timer = setTimeout(() => {
                if (this.status === 'pending' && this.fullfilledCallback) {
                    this.status = 'fullfilled';
                    this.fullfilledCallback(result);
                    clearTimeout(timer);
                }
            })
        }

        let reject = reason => {
            let timer = setTimeout(() => {
                if (this.status === 'pending' && this.rejectedCallback) {
                    this.status = 'rejected';
                    this.rejectedCallback(reason);
                    clearTimeout(timer);
                }
            })
        }

        // 包装好以后传入
        executor(resolve, reject);
    }
}
```

测试用例：

```js
let p1 = new Promise((resolve, reject) => {
    reject();
});

let p2 = p1.then(result => {
    console.log('p2 result:' + result);
}, reason => {
    throw new Error('p2 error');
    console.log('p2 reason:' + reason);
});

let p3 = p2.then(result => {
    console.log('p3 result:' + result);
}, reason => {
    console.log('p3 reason:' + reason);
})
// p3 reason:Error: p2 error
```

