# lodash使用技巧



## 1. 循环遍历

```js
// 1. Basic for loop.
for(var i = 0; i < 5; i++) {
    // ....
}

// 2. Using Array's join and split methods
Array.apply(null, Array(5)).forEach(function(){
    // ...
});

// Lodash
lodash.times(5, function(){
    // ...
});
```

​	使用传统的for循环会声明多余的变量，`lodash.times`看起来可读性更高；



## 2.合并对象

```js
// Adding extend function to Object.prototype
Object.prototype.extend = function(obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
};

var objA = {"name": "colin", "car": "suzuki"};
var objB = {"name": "james", "age": 17};

objA.extend(objB);
objA; // {"name": "james", "age": 17, "car": "suzuki"};

// Lodash
_.assign(objA, objB);
```

