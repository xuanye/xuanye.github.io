title: [翻译] Serilog Tutorial
date: 2018-02-26 13:19:11
categories:
	- 翻译
tags:
	- dotnet
	- serilog
---


在过去的几年中，结构化日志已经大受欢迎。而Serilog是 .NET 中最著名的结构化日志类库 ,我们提供了这份的精简指南来帮助你快速了解并运用它。

## 内容

+ 设定目标
+ 事件和级别
+ 触发和手机结构化数据
+ 为过滤和关联添加事件标记
+ 大海捞针 [Finding needles in the haystack]
+ 下一步是什么？
+ 获得帮助  



## 1. 设定目标 

你可能之前已经在项目中使用了Serilog，或者你有一个新的项目希望使用Serilog，又或者你只是对结构化日志记录感兴趣: 那就非常好！ 你来对地方了。


然而，更进一步来说，你的目标可能是：

1. 希望在用户之前发现代码中的BUG和错误
2. 为了更快的找到生产环境中的问题
3. 深入的了解系统运行表现

Serilog使用json格式来记录应用程序中的事件，方便我们可以快速的查询日志，关键是可以方便地过滤和查询日志，而不用编写正则表达式。

在本教程中，我们将介绍最关键的几个部分，帮助我们可以在生成环境中提供令人惊叹的诊断能力。[注：原文这句挺拗口]

<!-- more -->

## 2. 认识 Serilog

那就让我们开始吧！为了更好的理解，你可以先创建一个新的.Net console 项目，可以是netcore或者传统的NETFramework版本。

Serilog 通过NuGet分发，项目包括一个Seirlog核心项目*Seirlog*和很多接收器*sinks*(超过100个)，这些接收是通过插件的方式来实现将日志写入到各种终端，文件,邮件,数据库或日志服务器


我们将通过使用*Serilog*和*Serilog.Sinks.Console*这两个组件开始，在稍后讨论其他选项：

```shell
dotnet add package Serilog
dotnet add package Serilog.Sinks.Console
```

这是世界上最简单的*Serilog*配置：

```csharp
using Serilog;

class Program  
{
    public static void Main(string[] args)
    {
        using (var log = new LoggerConfiguration()
            .WriteTo.Console()
            .CreateLogger())
        {
            log.Information("Hello, Serilog!");
            log.Warning("Goodbye, Serilog.");
        }
    }
}

```

让我们稍微分解一下:

+ `LoggerConfiguration` 类提供一个流式接口用于构建一个日志记录管道 
+ ` WriteTo.Console（)` 将控制台接收器添加到上述管道中
+ `CreateLogger（）` 组装并返回一个实现`ILogger`接口的`Logger`对象
+ 上述Logger对象同样实现了IDisposable，所以我们可以在`using`中调用它
+ 最后`log.Information（）`和`log.Warning（）` 触发记录日志


这个日志记录管道是一个可释放的[disposable],这可能会让你有点意外，但是请记住，记录器通常是要写入文件，数据库等等： 很多*sinks* 必须被完全地关闭掉。尽管这样，也仅仅在应用程序退出前，根logger才需要被释放。而在应用程序中使用logger是不需要关心这些细节的。 

你运行了这个程序嘛？这是你看到的效果吧？
![](http://ww1.sinaimg.cn/large/697065c1gy1fottdd5d6nj20sf0dht8r.jpg)

 Apart from just passing it around everywhere, there are two possibilities. [ 除了在各地传递外，还有两种可能性。] If you're using an IoC container, you might have components receive an ILogger through dependency injection. [ 如果您使用的是IoC容器，则可能会让组件通过依赖注入来接收ILogger。] Packages like AutofacSerilogIntegration can help with that. [ 像AutofacSerilogIntegration这样的软件包可以提供帮助。]

现在最直接的问题是：我们在应用程序的其他类里面如何获得这个`log`对象,除了到处传递之外，还有两个办法。

1. 如果你使用IoC容器，你可以组件注入一个ILogger对象来接收，像`AutofacSerilogIntegration`的包括帮助你实现这种方式。
2. 或者，您可以将Logger对象存储在众所周知的位置; Serilog 已经内容内置了一个静态的Log对象，就像这样：

```csharp

Log.Logger = new LoggerConfiguration()  
    .WriteTo.Console()
    .CreateLogger();

Log.Information("Hello again, Serilog!");

Log.CloseAndFlush();  

```

`Log`类提供所有与`ILogger`接口相同的方法,这里我们显示调用`Log.CloseAndFlush（）`来关闭它，而不是使用`using`代码块

你可以使用依赖注入的方式，也可以是静态属性的方式 - 这取决你的个人喜好问题。为了简单起见，我们在本教程中使用了静态Log的方式。

> 也许，你不是在编写一个控制台应用程序。我们将使用Console应用作为广为人知的示例，但是你一旦完成了本教程，您应该查看目标平台的文档（例如，[ASP.NET Core](https://nblumhardt.com/2017/08/use-serilog/ "Leaner, meaner ASP.NET Core 2 logging")）。

3. Event and Level [时间和级别]

和一些老的日志类库相比（如log4net），在使用Serilog时，你需要做的就是最大改变就是思考日志*事件*[log *events*]，而不是日志*消息*[log *message*]，一条事件[event]由以下几个内容组成:

+ 事件发生时的**时间戳**[**timestamp**]
+ 描述何时应该捕获事件的**级别**[**level**]
+ 记录事件的消息[**message**]内容]
+ 描述事件的命名**属性**[**properties**]
+ 还可能有一个**Exception**对象

您可以将日志事件格式化为控制台的可读文本，正如我们在第一个示例中看到的那样：

	11:33:01 [INF] Hello, Serilog!  

 或者，您可以将相同的事件格式化为JSON并将其发送到远程日志服务器：

 ```json
 {"@t":"2017-11-20T11:33:01.22138","@m":"Hello, Serilog!"}
 ```

 在背后，应用程序中的日志语句会创建`LogEvent`对象，而连接到管道的接收器[*sinks*]会知道如何记录它们。


 ### Logging levels

 Serilog速度很快，但始终构建和记录详细的日志事件会浪费CPU，磁盘和网络资源。为了管理这个，Serilog事件被赋予了多种级别：`Debug`, `Information`, `Warning` 和 `Error`等。对应的有一个`Log.*()`方法来对应各个级别。

 在开发过程中，可能会打开调试级别的事件：

 ```csharp
 Log.Logger = new LoggerConfiguration()  
    .MinimumLevel.Debug() // <- Set the minimum level
    .WriteTo.Console()
    .CreateLogger();

// In a tight loop...
Log.Debug("Processing item {ItemNumber} of {ItemCount}", itemNumber, itemCount);  

 ```

在生成环境中，通常关闭调试的日志，并将最小的日志级别设置成`Information`,以便只记录重要的事件，在[这篇文档](https://github.com/serilog/serilog/wiki/Writing-Log-Events#log-event-levels)中可以获得有关Serilog Logger Lever的更多信息

Tip: Serilog has special handling for Exception objects; methods like Log.Error() take the exception as the first parameter, e.g. [ 提示：Serilog对Exception对象有特殊的处理;]  Log.Error(ex, "Task {TaskName} was canceled", task). [ Log.Error（例如，“任务{任务名称}被取消”，任务）。] Don't include exceptions in the log message itself. [ 不要在日志消息本身中包含异常。]
**提示**:Serilog对Exception对象有特殊的处理; 像方法`Log.Error()` 将 *exception* 作为第一个参数，例如`Log.Error(ex, "Task {TaskName} was canceled", task)`，不要将异常的包括在message消息中

4. 触发和收集结构化数据

让我们回到最后一个代码片段：

```csharp
var itemNumber = 10;  
var itemCount = 999;  
Log.Debug("Processing item {ItemNumber} of {ItemCount}", itemNumber, itemCount);  
```

您是否注意到日志消息中的`{ItemNumber}`这样的占位符？ 这不是一个C#的内插字符串[*Interpolated string* C# 6.0的新特性],`Log.*()`方法接收一个[消息模板](https://messagetemplates.org),另外一种.NET格式化字符串，除了支持传统的`{0}`的方式，还支持`{Name}`的方式。

这看起来有点奇怪，除非您意识到通过这样做，Serilog可以将这些消息的一部分作为类的属性与人性化的文本一起捕获：

```json
{
    "@t": "2017-11-20T11:33:01.22138",
    "@l": "Debug",
    "@m": "Processing item 10 of 999",
    "ItemNumber": 10,
    "ItemCount": 999
}
```
 我们为什么要这样做？因为通过这种有趣的字段插入方式，并作为属性记录到事件日志中，我们可以立即使用优雅的简单的过滤器来查找事件，就像`ItemNumber > 900 `,而无需通过正则表达式从消息中提取了。

 进一步，我们可以使用 `@` 结构捕获运算符 来获取不仅仅是平坦的属性值，而是完整的对象：

```csharp
var user = new { Name = "Nick", Id = "nblumhardt" };  
Log.Information("Logged on user {@User}", user);  
```
 在这里，`user`对象被捕获，并生成的JSON中，以便我们可以使用查询来查找事件,如:`User.Id = 'nblumhardt'`

```json
{
    "@t": "2017-11-20T11:33:01.22138",
    "@m": "Logged on user {\"Name\": \"Nick\", \"Id\": \"nblumhardt\"}",
    "User": {"Name": "Nick", "Id": "nblumhardt"}
}
```

生产环境的监控和调试已经非常困难和耗时，而且经常是压力山大的任务：而通过将相关的数据放在手边，Serilog除去了运维操作相关活动的最大难题之一。

**Tip**: 从Visual Studio Marketplace安装令人惊叹的[Serilog Analyzer](https://marketplace.visualstudio.com/items?itemName=Suchiman.SerilogAnalyzer)，可以帮助你检查你的消息模板类型（ 注：这个插件还能帮你通过配置代码生成appsetting.json的内容，但是只支持生成一级配置:( ）


这实际上有多大的差异取决于你如何收集Serilog的事件。一般来说，日志事件进入文本文件并用`grep`进行搜索。Serilog也可以记录文本文件，但不能在记事本中执行`ItemNumber> 900`，因此您需要评估更强大的工具来执行此操作。


### 写 JSON 格式的日志文件

如果您的需求很简单，您可以将JSON写入日志文件，并使用支持JSON的工具直接查询文件。] [ Serilog的文件接收器[*sink*]和紧凑的JSON格式化类库[compact JSON formatter]使第一部分变得简单。 让我们重新建一个控制台应用程序，并安装下列软件包：

```shell
dotnet add package Serilog
dotnet add package Serilog.Sinks.File  
dotnet add package Serilog.Formatting.Compact  
```

在`Main`函数中插入:

```csharp
Log.Logger = new LoggerConfiguration()  
    .MinimumLevel.Debug()
    .WriteTo.File(new CompactJsonFormatter(), "log.clef")
    .CreateLogger();

var itemCount = 99;  
for (var itemNumber = 0; itemNumber < itemCount; ++itemNumber)  
    Log.Debug("Processing item {ItemNumber} of {ItemCount}", itemNumber, itemCount);

Log.CloseAndFlush();  
```

运行这个程序将产生使用Serilog的紧凑格式[compact]，在文件log.clef中生成以[换行符分隔的`JSON`流](https://en.wikipedia.org/wiki/JSON_streaming  "newline-delimited JSON stream"),如果没有使用`CompactJsonFormatter`，则会创建一个简单饿扁平日志文件。

如果你在文本编辑器中打开文件，你会看到JSON事件，就像我们上面使用的例子。

[CLEF-tool](https://github.com/datalust/clef-tool) 是查询CLEF格式的日志文件的方便的命令行应用程序：(注:貌似只支持windows)

![](http://ww1.sinaimg.cn/large/697065c1gy1fotvarg5n7j20xe0dzdgb.jpg)

注意第二行的过滤器`ItemNumber> 95`：毫不费力地在大型日志流中定位事件,就是结构化日志记录的好处吧。

### 将日志写入日志服务器

将日志事件从多个应用程序发送到中央服务器或日志聚合服务非常方便,而不是试图在生产环境中多个日志进行浑水摸鱼[shuffle log files]

日志服务器通常通过HTTP/S或UDP在网络上接收事件，并为开发人员和操作员工程师提供用户界面，以便在出现问题时搜索和分析日志流。

[Serilog接收器](https://github.com/serilog/serilog/wiki/Provided-Sinks)[sinks]支持大量的日志服务器，其中许多具有结构化数据支持。

注：这段是广告就不翻译了，读者可以根据实际需求选择自己的日志服务器。

5.  为过滤和关联标记事件

我们刚刚看到消息模板如何实现我们传统上认为可以有效搜索和分析的日志“消息”。

结构化日志记录的另一方面是通过某种因果关系或空间关联来识别相关事件集合。事件触发:[Events raised: ]


+ 在处理单个HTTP请求期间
+ 从特定的机器，应用程序，服务或组件
+ 关于单个客户，订单或交易
+ 起因于事件的因果链

Serilog通过*enrichment*来处理所有这些情况（以及其他情况）。*Enrichment*只是为事件添加附加属性，而不是源自消息模板的属性

### 添加[Enriching]特定的属性

最简单的enrichment方法将固定属性值添加到源自日志记录管道的所有事件，可以通过`Enrich.WithProperty()`方法快速实现

```
Log.Logger = new LoggerConfiguration()  
    .Enrich.WithProperty("Application", "Demo")
    .WriteTo.Seq("http://localhost:5341") //Seq 日志服务器
    .CreateLogger();
```

 在`LogEvents`上，通过*enrichment*添加的属性看起来与源自消息模板的属性相同
 
 ```json
 {
    "@t": "2017-11-20T11:33:01.22138",
    "@l": "Debug",
    "@m": "Processing item 10 of 999",
    "ItemNumber": 10,
    "ItemCount": 999,
    "Application": "Demo"
}
```

### 丰富特殊的属性

通过创建和使用上下文记录器，可以将属性添加到一个或几个相关事件中，而不是增加具有相同值的所有事件

```csharp
var orderLog = Log.ForContext("OrderId", order.Id);  
orderLog.Information("Looking up product codes");  
// ...
orderLog.Information("Product lookup took {Elapsed} ms", elapsed.TotalMilliseconds);  
```

在这里，通过`orderLog`发出的两个事件都会附加一个`OrderId`属性。
`Enrichmen`是附加的:如果应用程序属性设置在管道级别，则上面的第二个事件将携带`Elapsed`（来自消息），`OrderId`（来自上下文记录器）和`Application`（来自记录管道）。

### 丰富消息源类型信息

记录器特定的*enrichment*一个特例是关于如何使用创建它们的类标记事件

在名为`HomeController`的类中，使用以下命令创建类型特定的记录器：

```csharp
private readonly ILogger _log = Log.ForContext<HomeController>();  
```

通过`_log`发出的事件将携带一个值为`MyApp.Controllers.HomeController`的`SourceContext`属性。

### 充分利用上下文

为了丰富工作单元中所有事件[为所有事件添加特定属性],`Serilog`提供了`LogContext`,首先需要使用`Enrich.FromLogContext()`在`LoggerConfiguration`级别启用：

```csharp
Log.Logger = new LoggerConfiguraition()  
     .Enrich.FromLogContext()
     // ...
```

LogContext可以被认为是一堆`(key,value)`键值对;

```csharp
using (LogContext.PushProperty("MessageId", message.Id))  
{
    Log.Debug("Dispatching message of type {MessageType}", message.GetType());
    await handler.HandleAsync(message);
}
```

关于LogContext有趣的是没有什么需要对象需要传递。在示例代码中，`HandleAsync()`以及由它调用的任何其他方法的实现可以直接使用`Log`和`ILogger` - MessageId属性将自动T并添加`LogEvent`中。

**Tip**: ``LogContext``是一个堆栈;推送到堆栈上的属性必须通过释放从PushProperty()返回的对象， -- 上述通过手动使用`using`块的方式

### 已经存在的Enricher

所有*enrichment* API都是使用`Enricher`的实现Serilog的`ILogEventEnricher`接口的对象来实现的。 

NuGet中为线程细节，机器信息和用户详细信息等内容提供了一些有趣的预先构建的Enricher实现。

[Serilog.Enrichers.Thread](https://github.com/serilog/serilog-enrichers-thread) 通过 Enrich.WithThreadId() 来添加线程ID相关的扩展:

```
Log.Logger = new LoggerConfiguration()  
    .Enrich.WithThreadId()
    // ...
```

这将为事件附加一个`ThreadId`属性，以便交错事件可以再次分开。

我们将在下一节中看到一个简单的例子，说明如何编写和插入自己的应用程序专用的`Enricher`程序。

## 6. 大海捞针 Finding needles in the haystack

如果我们已经知道如何使用Serilog调用消息模板和enrichment结构化日志的两个支柱，那么第三个支柱就是隐式事件类型的概念。

结构化日志适合有效处理大量日志数据。关于大型日志流的一个有趣的观察是，真实产生的事件比编写日志语句代码块时要多的多（注:这算什么发现）

```csharp
Log.Debug("Processing item {ItemNumber} of {ItemCount}", itemNumber, itemCount);  
```

这意味着,尽管生成了许多独特的消息字符串,如`"Processing item 31 of 4159"`,但由此日志记录语句生成的每个事件共享相同的消息模板，即`"Processing item {ItemNumber} of {ItemCount}"`

Serilog及其许多sinks 利用这一事实从根本上改进了查询和过滤日志事件的体验。如果消息模板与事件一起保存，则下面的过滤器可以立即从嘈杂的日志记录语句中排除成千上万的事件，从而更容易看到否则会被淹没的有趣事件：

```
@MessageTemplate <> 'Processing item {ItemNumber} of {ItemCount}'
```

反转也适用 - 放大事件类型可以从单个日志记录语句中查找所有事件

如何利用此功能取决于您存储和搜索日志的位置。接下来我们会看看细节。

**Tip**:字符串链接，C#内插字符串，以及其他技术手段来预格式化传递给Serilog的消息内容，会取消此功能。详细请看 [ How (not) to parameterize Serilog events ](https://nblumhardt.com/2014/09/how-not-to-parameterize-serilog-events/)

### 隐式事件类型

存储，然后过滤罗嗦的消息模板并不总是理想的。 相反，通常从消息模板创建一个数字哈希值，并将其与事件一起存储：
![](http://ww1.sinaimg.cn/large/697065c1gy1fotxujxoo9j21690h0q3j.jpg)


### 事件类型 enrichment

日志文件和本地不支持消息模板的日志服务器仍然可以通过在Serilog管道中明确地`enricher`事件来接收事件类型。

为此，自定义`enricher`程序将`EventType`属性附加到每个事件

```csharp
// Install-Package Murmurhash

class EventTypeEnricher : ILogEventEnricher  
{
   public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
   {
      var murmur = MurmurHash.Create32();
      var bytes = Encoding.UTF8.GetBytes(logEvent.MessageTemplate.Text);
      var hash = murmur.ComputeHash(bytes);
      var numericHash = BitConverter.ToUInt32(hash, 0);
      var eventType = propertyFactory.CreateProperty("EventType", numericHash);
      logEvent.AddPropertyIfAbsent(eventType);
   }
}
```

当插入管道时，这会使`{EventType}`属性可用于`sinks`

```csharp
Log.Logger = new LoggerConfiguration()  
   .Enrich.With<EventTypeEnricher>()
   .WriteTo.Console(outputTemplate:
       "{Timestamp:HH:mm:ss} [{EventType:x8} {Level:u3}] {Message:lj}{NewLine}{Exception}")
   .CreateLogger();
```

`WriteTo.Console()`的参数是一个Serilog输出模板，描述了如何将日志事件的属性格式化为文本。 大多数基于文本的sinks（包括`Serilog.Sinks.File`）都可以接受输出模板来指导格式化。

[ 输出如下所示：]

![](http://ww1.sinaimg.cn/large/697065c1gy1foty29nelmj21eo0b3dg5.jpg)

## 7. 下一步做什么

Serilog是一个强大的库，拥有广泛的插件和工具生态系统。我们只涉及绝对的基础知识 - 取决于您希望如何使用Serilog以及您使用的框架和平台，还有很多可以发现的地方。

这里有一些文章和扩展，供你参考：

+ **Debugging and diagnostics** - if you're having trouble getting Serilog or a sink to work, check out this page on [the Serilog wiki](https://github.com/serilog/serilog/wiki/Debugging-and-Diagnostics)
+ **`appsettings.json` configuration** - in this article we've only shown the C# configuration API; [Serilog.Settings.Configuration](https://github.com/serilog/serilog-settings-configuration) adds support for logger configuration in .NET Core JSON settings
+ **XML `<appSettings>` configuration** - [Serilog.Settings.AppSettings](https://github.com/serilog/serilog-settings-appsettings) adds support for reading logger configuration from .NET Framework configuration files
+ **ASP.NET Core integration** - the [Serilog.AspNetCore](https://github.com/serilog/serilog-aspnetcore) package seamlessly integrates Serilog into ASP.NET Core 2.0 apps to take advantage of the structured log events emitted by the framework
+ **ASP.NET integration** - check out [SerilogWeb.Classic](https://github.com/serilog-web/classic) for a quick-and-painless way to record unhandled exceptions and request timings from ASP.NET projects
+ **Smart logging middleware for ASP.NET Core** - improve the quality of request logging in ASP.NET Core with the [middleware from this article](https://blog.getseq.net/smart-logging-middleware-for-asp-net-core/)
+ **Timed operations** - [SerilogTimings](https://github.com/nblumhardt/serilog-timings) is a small wrapper for Serilog that makes it easy to log operation timings
+ **Autofac-Serilog integration** - use [AutofacSerilogIntegration](https://github.com/nblumhardt/autofac-serilog-integration) to inject Serilog ILoggers through Autofac with type information automatically added
+ **Code analysis for Serilog** - mentioned earlier, [Serilog Analyzer](https://github.com/suchiman/SerilogAnalyzer) checks message template syntax in Visual Studio as-you-type, and detects many potential Serilog usage issues
+ **Dynamic filtering** - [Serilog.Filters.Expressions](https://github.com/serilog/serilog-filters-expressions) makes it possible to filter events using a simple domain-specific language
+ **Async wrapper** - the latency of logging to files or the console can be reduced further using the [Serilog.Sinks.Async](https://github.com/serilog/serilog-sinks-async) package
+ **Sink READMEs** - most sinks, including [Serilog.Sinks.File](https://github.com/serilog/serilog-sinks-file), [Serilog.Sinks.Console](https://github.com/serilog/serilog-sinks-console), [Serilog.Sinks.Seq](https://github.com/serilog/serilog-sinks-seq) and others, have good README documents in their GitHub repositories with detailed instructions for using the sink
+ **Structured Logging Concepts in .NET series** - this [blog series on structured logging](https://nblumhardt.com/2016/06/structured-logging-concepts-in-net-series-1/) has more detail on much of what we've covered in this tutorial
+ **F# support** - if your application is written in F#, [Destructurama.FSharp](https://github.com/destructurama/fsharp) will let you log F# types seamlessly through Serilog
+ **JSON.NET support** - [Destructurama.JsonNet](https://github.com/destructurama/json-net) extends Serilog to allow JSON.NET dynamic objects to be logged as structured data
+ **Exception enricher** - [Serilog.Exceptions](https://github.com/RehanSaeed/Serilog.Exceptions) collects additional exception-type-specific information and attaches it to log events
+ **Async stack trace unmangling** - [Serilog.Enrichers.Demystify](https://github.com/nblumhardt/serilog-enrichers-demystify) plugs in Ben Adams' Demystifier to improve the readability of exception stack traces

## 8. 获得帮助
Serilog有三大优秀的社区支持渠道：

+ [Stack Overflow](https://stackoverflow.com/questions/tagged/serilog) - 如果您有Seri​​log使用问题，Stack Overflow上的Serilog标签是一个很好的开始; 它被积极监控，并且您将通过留下一个容易找到的答案来帮助其他人解决同一个问题
+ [Gitter Chat](https://gitter.im/serilog/serilog) - 如果您的问题不符合Stack Overflow格式，或者您只是想完善检查方法，那么Gitter聊天室是与Serilog社区中的其他人联系的快捷方式
+ [GitHub Issues](https://github.com/serilog/serilog/issues) - 最后，如果你发现了一个bug或者想要对Serilog进行改进，GitHub就是这个地方;  [Serilog organization](https://github.com/serilog) 包括了serilog所有的核心库和问题跟踪。


Happy logging!