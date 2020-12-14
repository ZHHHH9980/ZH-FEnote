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

那么可以在result写入**任何类型也不会报错**，这样就没法满足类型检验的需求；



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

