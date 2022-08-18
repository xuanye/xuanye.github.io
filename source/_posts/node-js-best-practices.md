title: Nodejs最佳实践
date: 2016-02-24 14:10:19
categories: 翻译
tags: [Nodejs,Best Practices]
---

我们总是被问及关于`Node.js`的最佳实践和技巧 -- 所以这篇文章就是要将这些讲清楚，总结我们在[RisingStack][1]怎么样编写Node.js应用程序。

这些最佳实践有些事属于代码风格，有些则是怎么处理开发流程


## 0x01 代码风格 Coding style

### 回调约定 Callback convention

所有模块应该暴露一个错误的回调函数接口，就像下面这段代码：

```javascript
module.exports = function (dragonName, callback) {
  // 这里做一些事情
  var dragon = createDragon(dragonName);

  // 提示, 这里的第一个参数其实是一个错误信息的参数
  // 这里的值刚好是null
  // 但是如果是有错误产生，那么这里应该向回调函数传递一个Error的对象
  return callback(null, dragon);
}
```
### 总是在回调函数中检查错误
为了更好的理解为什么必须这么做，先给大家看一个反例，然后再看看怎么修复它

```javascript
// this example is **BROKEN**, we will fix it soon :)
var fs = require('fs');

function readJSON(filePath, callback) {
  fs.readFile(filePath, function(err, data) {
    callback(JSON.parse(data));
  });
}

readJSON('./package.json', function (err, pkg) { ... }
```
这个`readJSON`方法的第一个问题 就是在执行的过程发生异常，而代码并没有检查它(注：这样你就不能获得你期望的程序运行结果)。 你应该始终检查是否存在异常

来看看改进后的版本:
```javascript
// this example is **STILL BROKEN**, we are fixing it!
function readJSON(filePath, callback) {
  fs.readFile(filePath, function(err, data) {
    // here we check, if an error happened
    if (err) {
      // 啊呀, 把err传递到回调函数中
      // 记住: 把错误放在第一个参数那里
      callback(err);
    }

    // no error, pass a null and the JSON
    callback(null, JSON.parse(data));
  });
}
```
### 回调函数中的 `Return`

上面代码中另外一个问题就是当一个错误发生了，代码并不会再if条件语句处终止，而是继续执行，这会带来很多意想不到的事情，作为一个经验法则，始终在回调函数处使用return。

```javascript
// this example is **STILL BROKEN**, we are fixing it!
function readJSON(filePath, callback) {
  fs.readFile(filePath, function(err, data) {
    if (err) {
      return callback(err);
    }

    return callback(null, JSON.parse(data));
  });
}
```
### 只在同步代码中使用 `try-catch` 语句

差不多了，另外一件事件我们不打不要关注下`JSON.parse`方法， 如果试图转换一个不符合的JSON格式，`JSON.parse` 可能触发一个异常。

因为`JSON.parse`是同步执行的，我们可以用`try-catch`语句将它包装起来。同志们，这里要注意啊！只有同步执行的代码块里才能这么做，如果在回调函数中这就不管用了。
```javascript
// this example **WORKS**! :)
function readJSON(filePath, callback) {
  fs.readFile(filePath, function(err, data) {
    var parsedJson;

    // Handle error
    if (err) {
       return callback(err);
    }

    // Parse JSON
    try {
      parsedJson = JSON.parse(data);
    } catch (exception) {
      return callback(exception);
    }

    // Everything is ok
    return callback(null, parsedJson);
  });
}
```
### 尽量避免使用 `this` 和 `new`

在Node中绑定一个特殊的上下文并不是一个好主意，因为Node设计到传递大量的回调函数，并且重度使用高等级的函数来管理控制流，使用函数式的编码方式可以省掉你的很多麻烦。当然也有一些特殊的情况，如用属性可以更高效的时候，如果可能的话还是尽量避免使用它们。

<!-- more -->
### 创建小而美的模块

讲问题分解成一个个小问题，并模块化处理它们（Do it the unix-way）：

开发者应该创建通过定义的接口串联各个模块的程序，这样问题就是本地的，并且在将来的版本中可以替换它们来支持新的功能特性
> Developers should build a program out of simple parts connected by well defined interfaces, so problems are local, and parts of the program can be replaced in future versions to support new features.

不要太另类（注：Deathstars就是国外的一个非主流乐队） -- 保持简单，一个模块就做一件事情，并吧这件事做好
Do not build Deathstars - keep it simple, a module should do one thing, but that thing well.

### 使用好的异步模式

使用 [async][2].
（注：还有很多，比如我就比较喜欢[EventProxy][3]）

## 0x02 错误拦截

错误可以分为两种：操作错误和代码错误
Errors can be divided into two main parts: operational errors and programmer errors.

### 操作错误

操作错误在编码非常好的程序中也同样会发生，因为它们不是bugs，只是操作系统或者远端服务的问题，就像：

 - 请求超时
 - 内存溢出
 - 无法链接到远端服务
 - ...

### 拦截操作错误
根据不同的操作错误的类型，你可以使用不同的方式：

- 试着解决错误，如果文件不存在，那么你需要创建一个先
- 在处理网络通讯时，你应该重试一下
- 告诉客户端，出现了一些问题，并记录一下用户的输入 T
- 重启进程吧，也许就好了

同样，在上面那些原则之外还有： **记录所有的日志**.

### 代码错误
代码错误就是bugs了，这是可以避免的，就像：

- 调用一个异步函数，但是没有使用回调
- 读取一个空对象的属性

### 拦截代码错误

因为这些错误是bugs，你不知道你的程序什么时候崩溃。实际上你应该使用守护进程，当你的程序崩溃时来重启你的程序，就像 [supervisord][4] 或者 [monit][5] （注：更推荐[pm2][6] ）

## 0x03 工作流

### 使用 `npm init` 初始化一个新的项目

这个初始化命令可以帮助你创建程序的`package.json`文件，并设置一些默认值，你可以在晚点修改它。

当你开始一个新项目时 应该这样开始：
```
mkdir my-awesome-new-project
cd my-awesome-new-project
npm init
```

### 提供 `start` 和 `test` 的命令

在你的 `package.json` 文件中你可以在`scripts`节点下设置对应命令.默认情况下，`npm init`讲自动创建两个命令，`start` 和 `test`.他们可以通过`npm start` 和  `npm test` 来运行。
同样你也可以在这里自定义自己的命令并通过 `npm run-script <SCRIPT_NAME>` 来执行这些命令

提示：NPM会设置一个变量 `$PATH`（当前目录） 设置成 `node_modules/.bin`目录来执行文件，这避免全局安装 `NPM` 模块。
Note, that NPM will set up $PATH to look in node_modules/.bin for executables. This helps avoid global installs of NPM modules.

### Environment variables

生产环境部署应该使用环境变量。最通过的方式是通过设置 `NODE_ENV` 变量来实现。
根据你的环境变量，你可以读取不同的配置文件，这里推荐模块[nconf][7]
当然，你可以在Node.js应用程序中通过 `process.env` 使用其他环境变量, `process.env`这个对象包含所有的用户变量
Of course, you can use other environment variables in your Node.js applications with process.env, which is an object that contains the user environment.

### 不要重复造轮子

总是先查找下是否已经存在解决方案。`NPM`拥有大量的包，很有可能你能在里面找到你需要的模块。

### 使用统一代码风格

使用统一的代码风格，无论你的代码量多么的庞大，都是相对容易阅读的。统一的代码风格一般包含， 缩进规则 ， 变量命名规则 等等。

这里有一份参考，[RisingStack‘s Node.js Style Guide][8]。

## 0x04 接下来

我希望这篇文章能够帮助你更好的使用Node.js，并解决一些令你头疼的问题。这里还有一篇关于操作提示和最佳实践的文章，


你可以从这里获得一些关于部署的提示： [Continuous Deployment of Node.js Applications.][9]

扩展阅读: [Node.js Best Practices - Part 2][10] - JSHint and JSCS Rules, JS over JSON, dependency injection and more.

via ： [https://blog.risingstack.com/node-js-best-practices/][11]


  [1]: http://risingstack.com/ "博客的原文地址"
  [2]: https://github.com/caolan/async%20%E2%80%9Casync%E2%80%9D
  [3]: https://github.com/JacksonTian/eventproxy
  [4]: http://supervisord.org/
  [5]: http://mmonit.com/monit/
  [6]: https://github.com/Unitech/pm2
  [7]: https://github.com/indexzero/nconf
  [8]: https://github.com/RisingStack/node-style-guide
  [9]: http://blog.risingstack.com/continuous-deployment-of-node-js-applications/
  [10]: http://blog.risingstack.com/node-js-best-practices-part-2/
  [11]: https://blog.risingstack.com/node-js-best-practices/
