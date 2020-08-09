# webpack



## 为什么需要构建工具？

简要来讲有以下几点

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808105835570.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

以下取自webpack官方文档

## why webpack

> To understand why you should use webpack, let's recap how we used JavaScript on the web before bundlers were a thing.
>
> There are two ways to run JavaScript in a browser. First, include a script for each functionality; this solution is hard to scale because loading too many scripts can cause a network bottleneck. The second option is to use a big `.js` file containing all your project code, but this leads to problems in scope, size, readability and maintainability.

理解为什么你需要使用webpack之前得先明白在打包工具诞生前Javascript是如何在浏览器上运行的。

在浏览器上有两个方案运行Javascript。

1.为每个功能添加脚本，但是这种方案很难扩展因为太多脚本会导致网络瓶颈。

2.用一个大的js文件包含所有的工程代码，但是这会导致作用域冲突，文件大小，可读性，可维护性等问题。



解决方案1：IIFE(immediately invoked funciton expressions)

利用闭包的特性解决作用域中相同变量名冲突的问题。



## Birth of JavaScript Modules happened thanks to Node.js

> webpack runs on Node.js, a JavaScript runtime that can be used in computers and servers outside a browser environment.
>
> When Node.js was released a new era started, and it came with new challenges. Now that JavaScript is not running in a browser, how are Node applications supposed to load new chunks of code? There are no html files and script tags that can be added to it.
>
> CommonJS came out and introduced `require`, which allows you to load and use a module in the current file. This solved scope issues out of the box by importing each module as it was needed.

因为Node.js，Js模块诞生了。

webpack运行在Node.js上，它是一个能够独立于浏览器之外运行的JS引擎。

Node.js发布时，一个新的时代开始了，它带来了新的挑战。既然JS不在浏览器中运行，那么Node应用应该如何加载代码块(chunk)?没有可添加到其中的html文件和脚本标签。

Common.js的出现引进了`require`，允许在当前文件中你加载和使用一个模块。它通过引入需要的模块的方式解决了作用域的问题。



## npm + Node.js + modules -- mass distribution

> JavaScript is taking over the world as a language, as a platform and as a way to rapidly develop and create fast applications.
>
> But there is no browser support for CommonJS. There are no [live bindings](https://medium.com/webpack/the-state-of-javascript-modules-4636d1774358). There are problems with circular references. Synchronous module resolution and loading is slow. While CommonJS was a great solution for Node.js projects, browsers didn't support modules, so bundlers and tools like Browserify, RequireJS and SystemJS were created, allowing us to write CommonJS modules that run in a browser.

JS正以一种语言，一个平台，一种快速开发和创建应用的方式席卷全球。

但是没有浏览器支持CommonJS。它没有实时绑定，还存在循环引用的问题（就是模块间互相引用）。同步模块的解析和加载速度非常慢。尽管CommonJS是Node.js的工程非常好的解决方式，但是浏览器并不支持模块，所以像Browserify, RequireJS and SystemJS这样的打包工具诞生了，它允许我们写的commonJS在浏览器中运行



## ESM - ECMAScript Modules

> The good news for web projects is that modules are becoming an official feature in the ECMAScript standard. However, browser support is incomplete and bundling is still faster and currently recommended over these early module implementations.

对于web工程的好消息是现在模块开始正在称为官方ECMAScript标准，然而并不是所有的浏览器都支持，而且打包非常快(webpack自夸吗)，目前建议在这些早期模块实现中使用？（这真看不懂）



## Automatic Dependency Collection

> Old school Task Runners and even Google Closure Compiler requires you to manually declare all dependencies upfront. While bundlers like webpack automatically builds and infer your [dependency graph](https://webpack.js.org/concepts/dependency-graph/) based on what is imported and exported. This along with other [plugins](https://webpack.js.org/concepts/plugins/) and [loaders](https://webpack.js.org/concepts/loaders/) make for a great developer experience.

自动化的依赖收集

老的task runner都需要你手动声明所有依赖。而像webpack这样的打包器会基于dependency graph自动构建和推断哪些需要引入和导出。这些伴随着其他插件和Loaders给开发者更好的体验。



## Wouldn't it be nice…

> ...to have something that will not only let us write modules but also support any module format (at least until we get to ESM) and handle resources and assets at the same time?
>
> This is why webpack exists. It's a tool that lets you bundle your JavaScript applications (supporting both ESM and CommonJS), and it can be extended to support many different assets such as images, fonts and stylesheets.
>
> webpack cares about performance and load times; it's always improving or adding new features, such as async chunk loading and prefetching, to deliver the best possible experience for your project and your users.

那将很爽...

要是有个东西不仅支持模块和任何模块的语法而且能同时打包所有资源。

这就是webpack存在的意义（吹牛开始了）。这是一个能让你打包JS应用（支持ESM标准和commonJs),而且能够扩展支持图片、文字、样式表等资源。

webpack非常注重表现和加载时间。他经常增加新特性，例如异步代码块加载和预加载，尽可能给你的工程和用户带来更好的体验。（牛）



## 初始webpack

![image-20200808092025700](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200808092025700.png)





## 运行webpack

```javascript
node_modules\.bin\webpack
```

这样运行太麻烦了，每次都要写node_modules\\.bin\webpack

有没有什么更简便的方案？

使用npm script!

点开`package.json`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808105249360.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

之后就可以通过 `npm run build`运行webpack了！



### tips

从webpack4.0开始，已经不需要`config`就可以运行webpack了

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808105603453.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

会直接在dist文件夹下生成main.js