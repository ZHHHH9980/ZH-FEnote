# webpack核心概念



## Entry

- Entry指定打包入口



先理解依赖图的含义

![image-20200808110439609](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200808110439609.png)

通过**模块的方式**互相引用和依赖，遍历完整个依赖树就开始打包。



### Entry用法

![image-20200808110602841](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200808110602841.png)





## Output

- output用于指定webpack如何将编译后的文件输出到磁盘

```javascript
const path = require('path');
module.exports = {
  output: {
      path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
```



### output对于多入口配置

output对于多入口的处理。

![image-20200808110942130](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200808110942130.png)



### 🌰

```javascript
'use strict';

const path = require('path');

module.exports = {
    entry: {
        index: './src/index.js',
        main: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js' //<===
    },
    mode: 'production'
};
```

`npm run build`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808111909263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)





## Loaders

- 原生webpack仅支持JS和JSON两种文件类型，但是可以通过**Loaders**支持其他文件类型并且把它们转化成有效的**模块**添加到依赖图中。



### 常用Loaders

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808112223433.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

(怪不得之前在项目里写sass还需要cnpm sass-loader)，挺无语的，老师全都一句话带过，今天才明白...



### Loaders用法

![](https://img-blog.csdnimg.cn/20200808112553442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

本章目的主要是学习一些核心概念，后面再具体学习。



## Plugins

扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。



### 常见Plugins

![](https://img-blog.csdnimg.cn/20200808113453301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)



### Plugins用法

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808113830976.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)





## mode

mode用于指定当前构建环境

- production(默认值)
- development
- none



### 内置函数功能

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200808114200591.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)