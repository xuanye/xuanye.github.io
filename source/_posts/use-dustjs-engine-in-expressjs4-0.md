title: 在Expressjs4.0中使用dustjs模板引擎
date: 2014-10-19 21:03:35
categories: 博客 #文章文类
tags: [Nodejs,ExpressJs,Dustjs]
---

## 引言
&nbsp;&nbsp;&nbsp;&nbsp;[dustjs][1]是一款js模板,最早由个人开发维护，后来由linkin接手，发展的更加迅速，说实话js模板这块有很多选择，都非常优秀，和paypal的选择一样，最终我使用dustjs作为我的首选模板语言。dustjs中文的文档非常少，所以在国内的使用不是很多，这里几篇博文有对dustjs语法基本的介绍[Dust.js语法简介（一）][2],[Dust.js语法简介（二）][3],[Dust.js语法简介（三）][4]

&nbsp;&nbsp;&nbsp;&nbsp;express4.0 默认的模板引擎是jade，jade 刚刚开始用的时候感觉像python，有严格的语法格式，方便程序员养成良好的编码习惯，但是在实际使用下就会发现这种强制，在模板端编写逻辑语言的时候，特别在嵌套判断的时候会有一些无法逾越的问题，同时它的性能问题也一直别人诟病。当然你也可以ejs或者其他模板，这不是我要阐述的重点。

## 实现
如果是现成的express项目或者使用express-genarate生成基本结构之后，在`package.json` 文件的 `dependencies` 添加三个依赖。
```
    "dustjs-helpers": "~1.3.0",
    "dustjs-linkedin": "~2.4.2",
    "adaro": "^0.1.5"
```
其中 `dustjs-linkedin`是dustjs模板本身，`dustjs-helpers`是一些模板的扩展方法，在[dustjs官方的文档][5]中有说明，非常有用，你可以添加自己的helper方法。而[adaro][6]是paypal公司提供的dustjs渲染类库，可以使用它方便的在多个模板引擎中切换，paypal的基于express的web框架krakenjs使用的就是adaro作为模板管理的工具。

然后在app的入口代码处添加模板的使用情况

```
var dustjs = require('adaro');
var app = express();
// 注册
app.engine("dust",dustjs.dust({ cache: false }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');
```

然后在views目录下使用 添加.dust 后缀的视图文件。
如果你编写了自己的helper 那么需要手动在入口文件处 require一下。

  [1]: http://linkedin.github.io/dustjs/
  [2]: http://blog.sprabbit.com/blog/2013/08/16/introduction-dustjs-1/
  [3]: http://blog.sprabbit.com/blog/2013/08/17/introduction-dustjs-2/
  [4]: http://blog.sprabbit.com/blog/2013/08/19/introduction-dustjs-3/
  [5]: https://github.com/linkedin/dustjs/wiki/Dust-Tutorial
  [6]: https://github.com/krakenjs/adaro
