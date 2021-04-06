# webpack 性能优化

1. 更新(node,npm,yarn) 

2. plugin尽可能精简

3. 合理使用`resolve`

   ```js
   module.exports = {
       // ... 
       resolve: {
           extensions:['.js', '.jsx']
       }
   }
   ```

   一般常用后缀才配置`resolve.extensions`。

   

   其他常用配置：

   1. mainFiles

   ```js
   module.exports = {
       // ... 
       resolve: {
           extensions:['.js', '.jsx'],
           mainFiles: ['index', 'main']
       }
   }
   ```

   这样配置之后不需要写`index.js`，`main.js`，会自动对路径进行查找；

   2. alias

      配置别名`alias`

   ```js
   module.exports = {
       // ... 
       resolve: {
           extensions:['.js', '.jsx'],
           alias: {
               zh: path.resolve(__dirname, "../src/zh")
           }
       }
   }
   ```

   

4. 缩小loader的应用范围

   ```js
   module.exports = {
       // ...
       exclude: 
   }
   ```

   