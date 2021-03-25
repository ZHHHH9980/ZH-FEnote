# ajax状态和http状态码



## ajax状态（ready-state）

0 UNSENT	刚开始创建XHR

1 OPENED	已经执行了open

2 HEADERS_RECEIVED	已经发送AJAX请求，响应头信息已经被客户端接收（响应头中包含了：服务器时间，HTTP状态码）

3 LOADING	响应主体内容正在返回

4 DONE	响应主体内容已经被客户端接收



## HTTP网络状态码(status)

根据状态码可以清楚反映出当前交互的结果以及原因。

200 OK 成功（只能反映服务器**成功返回**信息）



301 Move Permanently 永久转移（永久重定向 ）

​		=> 域名更改，访问原始域名重定向到其他域名

302 临时转移

​		=> 一般用于服务器负载均衡：当一台服务器达到最大并发数的时候，会把后续的用户临时转移到其他服务器机组处理

​		=> 有些项目的图片会放到专门的“图片服务器”，减轻主服务器的压力

304 Not Modified 设置缓存

​		=> 对于不经常更新的资源文件，例如：css/js/html等，服务器会设置304缓存，第一次加载过这些资源就缓存到客户端，下次获取的时候是从缓存中获取；如果资源更新了，服务器端会通过最后修改时间来强制让客户端从服务器端重新获取数据。

> ctrl + F5 强制刷新页面，304缓存就会失效



307 临时重定向 

​		=> 网站基于HTTPS协议运作的， 如果访问的是HTTP协议，会重定向到HTTPS协议上



400 Bad Request

1. 语义有误
2. 请求参数有误

401 Unauthorized 无权限访问

404 Not Fount 找不到资源

413 Request Entity Too Large 和服务器交互的资源超过服务器最大的限制



500 Internal Server Error 未知的服务器错误

503 Service Unavailable 服务器超负荷