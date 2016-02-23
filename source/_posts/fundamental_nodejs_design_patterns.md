title: Node.js 基础设计模式
date: 2016-2-13 14:23
categories: 博客 #文章文类
tags: [Nodejs,设计模式]
---

&nbsp;当讨论设计模式的时候你可能会想到 **单例**（singletons）, **观察者**（observers） 或者 **工厂**（factories） **factories**（工厂），这篇文章不是专门去讨论他们，同时也会讨论一些其他常用的设计模式，比如**依赖注入**（dependency injection）和**中间件**（middlewares）

## 什么是设计模式？

设计模式是一种对于常见问题的通用可复用的解决方案。

## 单例 Singletons
单例模式限制一个类的实例数量只能是一个，因为使用`require`方式，在Node.js中创建单例是相当简单的。

```javascript
//area.js
var PI = Math.PI;

function circle (radius) {
  return radius * radius * PI;
}

module.exports.circle = circle;
```
不管我们在程序中调用它多少次，它始终只会存在一个实例
```javascript
var areaCalc = require('./area');

console.log(areaCalc.circle(5));
```
因为 `requrie` 的行为，单例可能是在 `NPM` 所有模块中最通用的 Node.js 设计模式了

## 观察者 Observers
一个对象包含一个依赖者/观察者的列表，当状态发生变化的时候自动通知它们。去实现观察者模式，就要使用`EventEmitter`.
```javascript
// MyFancyObservable.js
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function MyFancyObservable() {
  EventEmitter.call(this);
}

util.inherits(MyFancyObservable, EventEmitter);
```
这就是我们刚刚创建的一个观察者对象，为了让它有点用，让我给它加几个方法。

```javascript
MyFancyObservable.prototype.hello = function (name) {
  this.emit('hello', name);
};
```
很好，现在我们的对象可以触发事件了 -- 让我们试试看！

```javascript
var MyFancyObservable = require('MyFancyObservable');
var observable = new MyFancyObservable();

observable.on('hello', function (name) {
  console.log(name);
});

observable.hello('john');
```

## 工厂 Factories
工厂模式是一种创建型的模式，用于脱离构造函数而是提供一种通用接口来创建对象。这种模式在创建复杂过程时非常有用

```javascript
function MyClass (options) {
  this.options = options;
}

function create(options) {
  // modify the options here if you want
  return new MyClass(options);
}

module.exports.create = create;
```
工厂也让测试变得容易多了，你可以通过它来注入模块的依赖。

## 依赖注入 Dependency Injection
依赖注入是一种当一个或多个依赖（服务）被注入或者引用传递到另外一个依赖对象中的软件设计模式。

In this example, we are going to create a UserModel which gets a database dependency.
在这个例子中，我们要创建一个获取数据库依赖的`UserModel`对象
```javascript
function userModel (options) {
  var db;

  if (!options.db) {
    throw new Error('Options.db is required');
  }

  db = options.db;

  return {
    create: function (done) {
      db.query('INSERT ...', done);
    }
  }
}

module.exports = userModel;
Now we can create an instance from it using:

var db = require('./db');

var userModel = require('User')({
  db: db
});
```
它有什么用？它让这次变得非常简单 -- 当你在编写你的单元测试的时候，你可以很容易的包装一个数据库实例到你的模型中。

## 中间件或管道 Middlewares / pipelines
中间件是一种强大又简便的模式:一个单元/函数输出的结果是下一个的输入.如果你用过`Express`或者`Koa`,那么你应该已经对这个模式比较熟悉了

我们来看一下`Koa`是怎么实现它的:
```javascript
app.use = function(fn){
  this.middleware.push(fn);
  return this;
};
```
非常基础，当你添加一个中间件的时候它仅仅把它添加到一个中间件数组中，到目前为止都还好，那么当请求这台服务器时又会发生什么呢?
```javascript
var i = middleware.length;
while (i--) {
  next = middleware[i].call(this, next);
}
```
没有彩蛋-- 你的中间价被一个接着一个的调用.

## 流 Streams
你可以把流（Streams）想象成特殊的管道（pipelines），它们非常适合处理大数据，特别当它们是字节形式，而非对象时
```javascript
process.stdin.on('readable', function () {
    var buf = process.stdin.read(3);
    console.dir(buf);
    process.stdin.read(0);
});
```

```
$ (echo abc; sleep 1; echo def; sleep 1; echo ghi) | node consume2.js
<Buffer 61 62 63>
<Buffer 0a 64 65>
<Buffer 66 0a 67>
<Buffer 68 69 0a>
```
To get a better understanding of streams check out substack's Stream Handbook.

延伸阅读

[Node.js 最佳实践][1]：回调惯例、异步代码模式、错误处理以及工作流技巧。
[Node.js 最佳实践 - Part 2][2]：代码提交预检、JavaScript 代码风格检测器及配置。

via 原文： https://blog.risingstack.com/fundamental-node-js-design-patterns/?utm_source=nodeweekly&utm_medium=email


  [1]: https://blog.risingstack.com/node-js-best-practices
  [2]: https://blog.risingstack.com/node-js-best-practices-part-2
