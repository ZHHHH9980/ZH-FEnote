# HTTP请求流程



### 1. 构建请求

首先，浏览器构建**请求行**信息（如下所示），构建好后，浏览器准备发起网络请求。

```
GET /index.html HTTP1.1
```



### 2. 查找缓存

在真正发起网络请求之前，浏览器会先在浏览器缓存中查询是否有要请求的文件。其中，**浏览器缓存是一种在本地保存资源副本，以供下次请求时直接使用的技术**。

当浏览器发现请求的资源已经在浏览器缓存中存有副本，它会拦截请求，返回该资源的副本，并直接结束请求，而不会再去源服务器重新下载。这样做的好处有：

- 缓解服务器端压力，提升性能（获取资源的耗时更短了）；
- 对于网站来说，缓存是实现快速资源加载的重要组成部分。

当然，如果缓存查找失败，就会进入网络请求过程了。



### 3. 准备 IP 地址和端口

不过，先不急，在了解网络请求之前，我们需要先看看 HTTP 和 TCP 的关系。因为浏览器使用**HTTP 协议作为应用层协议**，用来封装请求的文本信息；并使用**TCP/IP 作传输层协议**将它发到网络上，所以在 HTTP 工作开始之前，浏览器需要通过 TCP 与服务器建立连接。也就是说**HTTP 的内容是通过 TCP 的传输数据阶段来实现的**，你可以结合下图更好地理解这二者的关系。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809164451275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

从图中来看，HTTP网络请求第一步就是建立TCP连接。

但是建立TCP连接需要IP地址和端口号。

我们仅有URL，这时候就需要DNS域名解析系统将域名解析成IP地址，端口号默认为80。



### 4. 等待 TCP 队列

Chrome 有个机制，同一个域名同时最多只能建立 6 个 TCP 连接，如果在同一个域名下同时有 10 个请求发生，那么其中 4 个请求会进入排队等待状态，直至进行中的请求完成。

当然，如果当前请求数量少于 6，会直接进入下一步，建立 TCP 连接。



### 5. 建立 TCP 连接

- “三次握手”建立连接
- 传输数据
- “四次挥手”断开连接



### 6. 发送 HTTP 请求

一旦建立了 TCP 连接，浏览器就可以和服务器进行通信了。而 HTTP 中的数据正是在这个通信过程中传输的。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809164451275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)



### HTTP请求信息的形式

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809165240467.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

首先浏览器会向服务器发送**请求行**，它包括了**请求方法、请求 URI（Uniform Resource Identifier）和 HTTP 版本协议**。

常用请求方法有get/post

```js
xhr.open('get', url);
xhr.open('post', url);
```



如果使用 POST 方法，那么浏览器还要准备数据给服务器，这里准备的数据是通过**请求体**来发送。



### 服务器端处理HTTP请求流程



### 1. 返回请求

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809165656208.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

```js
xhr.onreadystatechange = () => {
    if (xhr.status === 200)
}
```



服务器首先返回**响应行**，包括版本协议和状态码。

正如浏览器会随同请求发送请求头一样，服务器也会随同响应向浏览器发送**响应头**。响应头包含了服务器自身的一些信息，比如服务器生成返回数据的时间、返回的数据类型（JSON、HTML、流媒体等类型），以及服务器要在客户端保存的 Cookie 等信息。

发送完响应头后，服务器就可以继续发送**响应体**的数据，通常，响应体就包含了 HTML 的实际内容。



### 2. 断开连接

不过如果浏览器或者服务器在其头信息中加入了：

```
Connection:Keep-Alive 
```

那么 TCP 连接在发送后将仍然保持打开状态，这样浏览器就可以继续通过同一个 TCP 连接发送请求。**保持 TCP 连接可以省去下次请求时需要建立连接的时间，提升资源加载速度**。比如，一个 Web 页面中内嵌的图片就都来自同一个 Web 站点，如果初始化了一个持久连接，你就可以复用该连接，以请求其他资源，而不需要重新再建立新的 TCP 连接。





### 3. 重定向

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809170815980.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

重定向就是输入一个URL，跳转到另一个地址。





------------------------------------

### 1. 为什么很多站点第二次打开速度会很快？

如果第二次页面打开很快，主要原因是第一次加载页面过程中，缓存了一些耗时的数据。

**DNS 缓存**和**页面资源缓存**这两块数据是会被浏览器缓存的。其中，DNS 缓存比较简单，它主要就是在浏览器本地把对应的 IP 和域名关联起来。

我们重点看下浏览器资源缓存，下面是缓存处理的过程：

![image-20200809171604721](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200809171604721.png)

也可以从Chrome控制台观察到相关缓存信息。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020080917174370.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

这里的max-age=604800代表缓存有效时间是604800s。

这就意味着在缓存有效期，再次请求该资源，会直接返回缓存中的资源给浏览器。



但如果缓存过期了，浏览器则会继续发起网络请求，并且在**HTTP 请求头**中带上：

```
If-None-Match:"4f80f-13c-3a1xb12a"
```

服务器收到请求头后，会根据 If-None-Match 的值来判断请求的资源是否有更新。

- 如果没有更新，就返回 **304 状态码**，相当于服务器告诉浏览器：“这个缓存可以继续使用，这次就不重复发送数据给你了。”
- 如果资源有更新，服务器就直接返回最新资源给浏览器。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809172051111.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)



> 详细参考： [HTTP 缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching_FAQ)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809172215271.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)





### 2. 登录状态是如何保持的？

- 用户打开登录页面，输入用户名和密码，点击确认以后页面脚本会生成用户登录信息，然后发送Post请求提交。
- 服务器接收到浏览器提交的信息之后，查询后台，验证用户登录信息是否正确，如果正确的话，会生成一段表示用户身份的字符串，并把该字符串写到响应头的 Set-Cookie 字段里，如下所示，然后把响应头发送给浏览器。

```
Set-Cookie: UID=3431uad;
```

- 浏览器在接收到服务器的响应头后，开始解析响应头，如果遇到响应头里含有 Set-Cookie 字段的情况，浏览器就会把这个字段信息保存到本地。比如把`UID=3431uad`保持到本地。
- 当用户再次访问时，浏览器会发起 HTTP 请求，但在发起请求之前，浏览器会读取之前保存的 Cookie 数据，并把数据写进请求头里的 Cookie 字段里（如下所示），然后浏览器再将请求头发送给服务器。

```
Cookie: UID=3431uad;
```

- 服务器在收到 HTTP 请求头数据之后，就会查找请求头里面的“Cookie”字段信息，当查找到包含`UID=3431uad`的信息时，**服务器查询后台，并判断该用户是已登录状态，然后生成含有该用户信息的页面数据，并把生成的数据发送给浏览器。**

> 所以登陆过后一段时间内开启浏览器往往就不需要重新登录了，原理就是因为浏览器通过HTTP请求发送了cookie。



- 浏览器在接收到该含有当前用户的页面数据后，就可以正确展示用户登录的状态信息了。



## 总结

HTTP请求示意图

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200809175833468.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

