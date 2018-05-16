# Bspline
B-spline generator based on Electron and python


## 项目依赖安装
+ bootstrap
+ bootstrap-switch
+ jquery
+ zeromq
+ zerorpc

### zerorpc
```bash
npm install git+https://github.com/fyears/zerorpc-node.git
```

+ [zerorpc](http://www.zerorpc.io/)
+ [zerorpc-node github](https://github.com/0rpc/zerorpc-node)
+ [zerorpc-python github](https://github.com/0rpc/zerorpc-python)

### zeromq Rebuilding for Electron

before `npm start`

```bash
npm rebuild zeromq --runtime=electron --target=1.8.4
```
+ [zeromq for node.js](https://www.npmjs.com/package/zeromq)


### devDependencies
+ electron : ^1.8.4
+ electron-reload : ^2.2.1

---

## 打包
使用 **Eelctron-Packager** 进行打包

```bash
electron-packager . B-spline --overwrite --asar=true --ignore="bak" --ignore="pybspline"
```
由于 `main.js` 中有：
```js
require('child_process').execFile(script, [port])

```
而参见 [Electron 应用打包](http://electronjs.org/docs/tutorial/application-packaging) 中的

>**某些 API 需要额外解压档案包**<br>
大部分 `fs` API 可以无需解压即从 `asar` 档案中读取文件或者文件的信息，但是在处理一些依赖真实文件路径的底层系统方法时，Electron 会将所需文件解压到临时目录下，然后将临时目录下的真实文件路径传给底层系统方法使其正常工作。对于这类API，会增加一些开销。<br>
以下是一些需要额外解压的 API : <br>
<code>**child_process.execFile**</code><br>
`child_process.execFileSync`<br>
`fs.open`<br>
`fs.openSync`
`process.dlopen` - 用在 require 原生模块时

所以不将pybsplinedist归档进`app.asar`,否则只解压`api.exe`到 Temp 文件夹,而相应的 Python 环境则没解压，造成找不到 Python 环境的错误。

#### Packaged 环境变化
dev
```bash
__dirname: I:\Projects\Electron\Bspline
__filename: I:\Projects\Electron\Bspline\main.js
     
```
packaged 
```bash
__dirname: I:\Projects\Electron\Bspline\B-spline-win32-x64\resources\app.asar
__filename: I:\Projects\Electron\Bspline\B-spline-win32-x64\resources\app.asar\main.js

[注] asar=false : app.asar =>　app
```

