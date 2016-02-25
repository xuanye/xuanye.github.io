title: Understanding Error-First Callbacks
date: 2016-02-25 10:38:44
categories: 翻译
tags: [Nodejs,最佳实践]
---
如果说Google的V8引擎是Node.js的心脏，那么回调（callbacks）则是Node的脉络，回调能够激活跨模块和应用程序之间平衡的、非堵塞的异步控制流程。不过在大规模使用回调（callbacks）时 你需要一个通用并可靠的规则。`error-first` 回调，也称为 `errorback` 或 `errback` 或 `node-style callback`，它们都是用来解决这个问题。并且这已经成为Node.js标准的方式。本文将定义这种模式，它的最佳实践和究竟它是怎么工作的。

## 为什么要标准化
Node大量使用回调让我们仿佛回到了比Javascript更早的变成风格时代。Nodejs使用的回调编程是一种老学院派风格的方式：[延续传统风格（Continuation-Passing Style (CPS)）][1] 。这种方式,  一个"持续函数"(称为 回调)是被作为参数传入，然后再被其他代码调用运行，这就允许不同函数跨整个应用滞后或提前地进行异步处理控制。

　  Node.js依赖异步代码保存快速性能，这样也就依赖回调模式，回调使用得太多会陷入嵌套回调，回调里嵌套回调，变得非常复杂，程序代码难于阅读，整个应用的流程迷失在嵌套回调中，error-first模式导入解决这个难题。


## 定义一个error-first的回调
确实有两个规则用来定义一个error-first的回调：

 1. **第一个参数必须是error对象**。如果发生了错误，第一个错误通过第一个参数返回
 2. **第二个参数用来传递成功响应的数据**。 如果没有发生错误，那么error参数会被设置为null来传递，而成功的响应数据通过第二个参数返回。

是的，它就是这么简单，对吧? 明显的，这里也有一些重要的最佳实践，不过在此之前我们先来看一下这个真实的历例子，关于`fs.readFile()` :
``` javascript
fs.readFile('/foo.txt', function(err, data) {
  // TODO: Error Handling Still Needed!
  console.log(data);
});
```
`fs.readFile()` 需要两个参数，一个是需要读取的文件路径，另外一个是读取完成之后的回调函数 ，如果一切正常，文件内容通过data参数返回，如果发生了错误（文件不存在，或者没有权限什么的） 第一个 err 参数就会传递一个error 对象，包括实际的错误信息。

这取决于你怎么处理错误，你可以直接抛出，让程序奔溃，或者拦截住让下一个函数来处理

``` javascript
fs.readFile('/foo.txt', function(err, data) {
  // If an error occurred, handle it (throw, propagate, etc)
  if(err) {
    console.log('Unknown Error');
    return;
  }
  // Otherwise, log the file contents
  console.log(data);
});
```
## 分类你的错误
当一个函数传递错误给回调函数，它就不管这些错误是如何处理，readFile函数不知道读取文件会出现怎样的错误，但是它可以预期，否则就会有灾难后果，但是取代自己处理错误，readFile()会传播错误回到你的原始提交处理者。

　　当你遵循这种一致的模式时，错误能够如你所愿被一层层传播，每个回调能选择忽略或处理，或基于错误信息再传播。

```javascript
if(err) {
  // Handle "Not Found" by responding with a custom error page
  if(err.fileNotFound) {
    return this.sendErrorMessage('File Does not Exist');
  }
  // Ignore "No Permission" errors, this controller knows that we don't care
  // Propagate all other errors (Express will catch them)
  if(!err.noPermission) {
    return next(err);
  }
}
```

## 控制你的流程
　当有这种坚固的回调协议在心中，你就再也不会局限于一次只能使用一个回调，回调能够在队列或并行被调用或串行化方式，如果你要读取10种不同的文件，或进行100个不同的API调用，再也没有理由说不可以一次性进行了。

　　 async库是一种高级回调应用包，因为有error-first回调模式，它就很容易被使用：
```javascript
// Example taken from caolan/async README
async.parallel({
    one: function(callback){
        setTimeout(function(){
            callback(null, 1);
        }, 200);
    },
    two: function(callback){
        setTimeout(function(){
            callback(null, 2);
        }, 100);
    }
},
function(err, results) {
    // results is equal to: {one: 1, two: 2}
});
```



  [1]: http://en.wikipedia.org/wiki/Continuation-passing_style
