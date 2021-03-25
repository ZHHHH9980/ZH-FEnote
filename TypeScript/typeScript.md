## basic types

```ts
let num: number = 10;
// unite types
// 联合类型，中间用 "|" 分隔
let numOrString: number | string = 'a';
```



## Array & Tuple

```ts
// array
let arrOfNum: number[] = [1, 2, 3];
// error
arrOfNum.push('1')

// tuple
// 元组只能放入对应的类型，且不能缺少
let user:[string, number] = ['username', 18];
```



## class





## interface

- 对对象的形状(shape)进行描述
- 对类(class)进行抽象
- Duck Typing

```ts
// 定义Person类的shape
// 注意使用;分隔
interface Person {
  name: string;
  age: number;
}

// Person类必须实现对应的接口
let How: Person = {
  name: "how",
  age: 18,
};
```

### 其他属性描述

```ts
interface Person {
  // 只读属性
  readonly id: number;
  name: string;
  // 可选属性
  age?: number;
}
```

### 约束class类

interface的特点是抽象一些重复的逻辑，将其整合到一起，不论是对象，类，甚至是interface都能够被其所约束；

```ts
interface Radio {
  id: number;
  switchRadio(): void;
}

class Car implements Radio {
  id: 1;
  switchRadio() {
    return 1;
  }
}
// 没有严谨地实现接口，会有提示信息
class CellPhone implements Radio {
  switchRadio() {}
}
```



## 函数和类型推断

```ts
// function add(): type 这里决定了返回值的类型
function add(x: number, y: number, z?:number):number {
    if (z) {
        return x + y + z;
    }
    return x + y;
}
```

### 函数赋值

```ts
function add(x: number, y: number, z?:number):number {
    //...
}
// 可选参数可以不进行复制
const add2: (x: number, y: number) => number = add;

================================================
function add(x: number, y: number, z:number):number {
    //...
}
// error	
const add2: (x: number, y: number) => number = add;
```





## enum



## Generics

>  泛型

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201126090645436.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

考虑这样一个需求：

```tsx
function echo(arg: number): number {
    return arg
}

const result: number = echo(1)
```

我们需要传入的参数和返回的值类型**相同**,但是又不能确定究竟传入的是什么类型；

如果使用any

```tsx
function echo(arg: any): any {
    return arg
}

const result: string = echo(1)
```

那么可以在result写入**任何类型也不会报错**，这样就没法**满足入参和返回值类型相同**的需求；



这时候就需要引入泛型`generics`:

```tsx
function echo<T>(arg: T): T {
    return arg
}

const result = echo(1);
```

这时候就能确保传入参数和返回值类型统一，且**类型是根据传入的参数确定的；**



复杂一些的应用：

（T和U只不过是占位符）

```tsx
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]]
}

const result = swap(['string', 123])
```



### 约束泛型

假设有这样的需求场景:

```tsx
function echoWithArr<T>(arg: T[]): T[] {
    console.log(arg.length);
    return arg
}
```

我们有时候需要传入的可能不只是array类型，string，类数组都具有length属性；

这时候就需要用到`约束泛型`：

```tsx
interface IWithLength {
  length: number;
}
function echoWithLength<T extends IWithLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}
echoWithLength("string");
echoWithLength([1, 2, 3]);
```

传入的obj只要具有`length`属性即可；



### 类

```tsx
class Queue {
  private data = [];
  public push(el) {
    return this.data.push(el);
  }
  public pop() {
    return this.data.shift();
  }
}

let q = new Queue();
q.push("str");
console.log(q.pop().toFixed());
```

假设我们维护这样一个队列，我们将`string`类型数据传入，但是ts无法预先捕捉到，因为它无法判断我们究竟传入了哪些数据类型；

解决方案一：

```ts
class Queue {
  private data = [];
  public push(el:number) {
    return this.data.push(el);
  }
  public pop():number {
    return this.data.shift();
  }
}

let q = new Queue();
q.push("str");
console.log(q.pop().toFixed());
```

这样确实能够提前捕捉到问题，但是如果代码量大，复用就非常麻烦；

解决方案二：

使用泛型约束类

```ts
class Queue<T> {
  private data = [];
  public push(el: T) {
    return this.data.push(el);
  }
  public pop():T {
    return this.data.shift();
  }
}

let q = new Queue<number>();
//	Argument of type 'string' is not assignable to parameter of type 'number'.ts(2345)
q.push("str");
console.log(q.pop().toFixed())
```

传入string类型也会被提前捕捉到错误

```ts
class Queue<T> {
  private data = [];
  public push(el: T) {
    return this.data.push(el);
  }
  public pop():T {
    return this.data.shift();
  }
}

let q = new Queue<string>();
q.push("str");
// Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?
console.log(q.pop().toFixed())
```



## 类型别名

type-aliases

```ts
// 抽象出一种函数类型并且命名
type sumFn = (a: number, b: number) => number;

const sum: sumFn = (a, b) => a + b;
```



## 类型断言

type-assertion

假设我们需要获取`number | string`类型的长度，但ts没办法预先知道到底传入的是什么类型；

```ts
const getLength(a: number | string) :string {
 // Property 'toFixed' does not exist on type 'string'.ts(2339)
  return a.toFixed().length;
}
```

这时候就需要用到类型断言

```ts
const getLength = (a: number | string): number => {
  const str = a as String;
  if (str.length) {
    return str.length;
  } else {
    const number = a as Number;
    return number.toFixed().length;
  }
};
console.log(getLength(111)) // 3
```

更简洁的写法：

```ts
const getLength = (a: number | string): number => {
  if ((<string>a).length) {
    return (<string>a).length;
  } else {
    return (<number>a).toFixed().length;
  }
};
```

特别需要注意的是`type-assertion`只能够断言存在的类型；例子中只能够断言`number | string`;

