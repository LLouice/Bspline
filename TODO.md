## 主题

## 坐标toast or 坐标status

## 是否显示虚线

## 网格

## 缩放

## status bar

## 控制点符号

## 显示曲线结点

## 鼠标变化



### 闪烁 ？=> 双缓冲   => 合并两个canvas drawImage | getImageData putImageData
 > 拖动，计算两者速度不匹配，不能实现拖动绘制

## 保存

# 结果是异步的??
> callback 异步执行Aysnc

Asynchronous execution is pushed out of the `synchronous` flow. That is, the `asynchronous code` will never execute while the synchronous code stack is executing. This is the meaning of JavaScript being single-threaded.

In short, the callback functions are created synchronously but executed asynchronously. You just **can't rely on** the execution of an asynchronous function until you know it has executed, and how to do that?

It is simple, really. The logic that **depends on** the asynchronous function execution should be started/called from **inside this asynchronous function**. For example, moving the alerts and console.logs too inside the callback function would output the expected result, because the result is available at that point.