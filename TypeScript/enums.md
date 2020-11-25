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