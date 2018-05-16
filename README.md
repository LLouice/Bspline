# Bspline
B-spline generator based on Electron and python

## 打包
使用 **Eelctron-Pacager** 进行打包

```bash
electron-packager . B-spline --overwrite --asar=true --ignore="bak" --ignore="pybspline"
```
由于 `main.js` 中有：
```js
require('child_process').execFile(script, [port])

```
而参见 [Electron 应用打包](http://electronjs.org/docs/tutorial/application-packaging) 中的

>**某些 API 需要额外解压档案包**
大部分 `fs` API 可以无需解压即从 `asar` 档案中读取文件或者文件的信息，但是在处理一些依赖真实文件路径的底层系统方法时，Electron 会将所需文件解压到临时目录下，然后将临时目录下的真实文件路径传给底层系统方法使其正常工作。 对于这类API，会增加一些开销。
以下是一些需要额外解压的 API：
    <code>**child_process.execFile**</code>
    `child_process.execFileSync`
    `fs.open`
    `fs.openSync`
    `process.dlopen` - 用在 require 原生模块时

所以不将pybsplinedist归档进`app.asar`,否则只解压`api.exe`到Temp文件夹,而相应的Python环境则没解压，造成找不到Python环境的错误。

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

