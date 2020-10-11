# HTTP报文结构

HTTP是一个**“纯文本”**的协议,所以头数据都是 ASCII 码的文本，可以很容易地用肉眼阅读，不用借助程序解析也能够看懂。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927084502131.png#pic_center)



HTTP 协议的请求报文和响应报文的结构基本相同，由三大部分组成：

1. 起始行（start line）：描述请求或响应的基本信息；
2. 头部字段集合（header）：使用key-value形式更详细地说明报文；
3. 消息正文（entity）：实际传输的数据，它不一定是纯文本，可以是图片、视频等二进制数据。

前两部分常合称为**“请求头”**,消息正文又称为**“实体”**，但与“**header**”对应，很多时候就直接称为“**body**”。



HTTP 协议规定报文必须有 header，但可以没有 body，而且在 header 之后必须要有一个“空行”，也就是“CRLF”，十六进制的“0D0A”。

所以，一个完整的 HTTP 报文就像是下图的这个样子，注意在 header 和 body 之间有一个“空行”。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927090040760.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



具体表现

![image-20200927090439597](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200927090439597.png)

在很多时候，特别是浏览器发送 GET 请求的时候都是这样，HTTP 报文经常是只有 header 而没 body。



## 起始行



### 请求行

请求行由三部分构成

1. 请求方法：如get/post，表示对资源的操作；
2. 请求目标：通常是一个URI，标记请求方法要操作的资源；
3. 版本号：表示报文使用的HTTP协议版本；

这三个部分通常使用空格（space）来分隔，最后要用 CRLF 换行表示结束。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927091014104.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



### 状态行

响应头中的起始行称为状态行，意思是**服务器响应的状态**。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927091304376.png#pic_center)

比起请求行来说，状态行要简单一些，同样也是由三部分构成：

1. 版本号：表示报文使用的 HTTP 协议版本；
2. 状态码：一个三位数，用代码的形式表示处理的结果，比如 200 是成功，500 是服务器错误；
3. 原因：作为数字状态码补充，是更详细的解释文字，帮助人理解原因。



## 头部字段

请求行或状态行再加上头部字段集合就构成了 HTTP 报文里完整的请求头或响应头。

### 请求头

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927092102563.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



### 响应头

![image-20200927092138029](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20200927092138029.png)



请求头和响应头的基本结构是一样的，唯一区别就是请求行和状态行（起始行）。

头部字段是以key-value的形式，以：分隔。最后用 CRLF 换行表示字段结束。



## 常用头字段

HTTP 协议规定了非常多的头部字段，实现各种各样的功能，但基本上可以分为四大类：

1. 通用字段：在请求头和响应头里都可以出现；
2. 请求字段：仅能出现在请求头里，进一步说明请求信息或者额外的附加条件；
3. 响应字段：仅能出现在响应头里，补充说明响应报文的信息；
4. 实体字段：它实际上属于通用字段，但专门描述 body 的额外信息。



### Host字段

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927092905895.png#pic_center)

`Host`字段属于请求字段，只能出现在请求头里，是唯一一个HTTP1.1规范里**要求必须出现**的字段。

`Host`字段告诉服务器这个请求该由哪个主机来处理，当一台计算机托管了多个虚拟主机的时候，服务器端就需要`Host`字段来选择。



### **User-Agent**

`User-Agent`是请求字段，只出现在请求头里。它使用一个字符串来描述发起 HTTP 请求的客户端，服务器可以依据它来返回最合适此浏览器显示的页面。



### Date

`Date`字段是一个通用字段，但通常出现在响应头里，表示 HTTP 报文创建的时间，客户端可以使用这个时间再搭配其他字段决定缓存策略。



### Server

`Server`字段是响应字段，只能出现在响应头里。



### **Content-Length**

实体字段里要说的一个是**Content-Length**，它表示报文里 body 的长度，也就是请求头或响应头空行后面数据的长度。

如果没有这个字段，那么 body 就是不定长的，需要使用 chunked 方式分段传输。



## 思考题

1. 如果拼 HTTP 报文的时候，在头字段后多加了一个 CRLF，导致出现了一个空行，会发生什么？

   ```
   CRLF之后的字段都会被当作body
   ```

2. 讲头字段时说“:”后的空格可以有多个，那为什么绝大多数情况下都只使用一个空格呢？

   ```
   头部多一个空格就会多一个传输的字节，去掉无用的信息，保证传输的头部字节数尽量小
   ```

   

## 小结

1. HTTP报文结构由起始行，头部字段集合，消息正文组成。又称为"header+body"
2. HTTP报文可以没有body，但必须得有header
3. 响应头和请求头的区别在于起始行
   1. 响应头中的起始行称为**状态行**，由` 版本 状态码 原因 `组成
   2. 请求头中的起始行称为**请求行**，由`请求方法 URI 版本`组成
4. 头部字段主要有四类，其中`Host`字段是HTTP1.1规范里唯一要求必须出现在请求头中的字段