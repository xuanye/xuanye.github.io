title: [开源]基于DotNet Core的RPC框架(一)-DotBPE.RPC快速开始
date: 2017-05-15 15:01:07
categories: 原创
tags: [dotnet,rpc,dotbpe]
---

## 0x00 简介
DotBPE.RPC是一款基于dotnet core编写的RPC框架，而它的爸爸DotBPE，目标是实现一个开箱即用的微服务框架，但是它还差点意思，还仅仅在构思和尝试的阶段。但不管怎么说RPC是微服务的基础，先来讲讲RPC的实现吧。DotBPE.RPC底层通信默认实现基于[DotNetty](https://github.com/Azure/DotNetty)，这是由微软Azure团队开发的C#的Netty实现，非常酷。当然你也可以替换成其他Socket通信组件。DotBPE.RPC使用的默认协议名称叫Amp,编解码使用谷歌的Protobuf3,不过这些默认实现都是可以替换的。

源码地址：[https://github.com/xuanye/dotbpe.git](https://github.com/xuanye/dotbpe.git) 

<!--more-->
## 0x01 关于Amp协议和Google Protobuf

### Amp(A Message Protocol)
Amp(A Message Protocol)  ,中文名叫 `一个消息协议` ,是DotBPE.RPC默认实现的消息协议，在实际开发中，其实是不需要了解消息是如何编解码和传输的，但是了解协议有助于进一步了解框架。协议基本结构如下图所示:


```
      0        1 2 3 4   5 6 7 8     9     10 11     12 13   <length>-14
+------------+----------+---------+------+-------+---------+------------+
| <ver/argc> | <length> |  <seq>  |<type>|<serId>| <msgid> |   <data>   |
+------------+----------+---------+------+-------+---------+------------+

```
Amp协议默认消息头长为14个字节，不包含扩展包头  
第0位：ver/argc // 为版本号，暂时来说，默认为0  
第1-4位: length //为包总长度（含包头长度）   
第5-8位: sequence // 为消息序列号，通过该序列号对应 请求<--->响应
第9位: type // 消息类型，现值有5种，如下:
> Request = 1, Response = 2, Notify = 3,NotFound = 4, ERROR = 5  
第10-11位: serviceId//消息ID ushort类型  
第12-13位: msgId//消息ID ushort类型    
在Amp协议中，serviceId标识一类请求，类似应用中的模块，而msgId标识模块中的具体方法

其后紧跟实际的数据

### Google Protobuf

Google Protocol Buffer( 简称 Protobuf) 是 Google 公司内部的混合语言数据标准，目前已经正在使用的有超过 48,162 种报文格式定义和超过 12,183 个 .proto 文件。他们用于 RPC 系统和持续数据存储系统。

Protocol Buffers 是一种轻便高效的结构化数据存储格式，可以用于结构化数据串行化，或者说序列化。它很适合做数据存储或 RPC 数据交换格式。可用于通讯协议、数据存储等领域的语言无关、平台无关、可扩展的序列化结构数据格式。目前提供了 多种语言的API，包括C++、 C# 、GO、 JAVA、 PYTHON

我在之前的博客[使用CSharp编写Google Protobuf插件](http://xuanye.github.io/2017/04/23/write-google-protobuf-plugin-with-csharp/)中有过介绍如果通过编写插件的方式，来通过定义proto文件，并生成我们需要的代码。  

在DotBPE.RPC 中，我使用protobuf来作为服务的描述文件，并通过自定义的插件方式来生成服务端和客户端代理类。

## 0x02 快速开始

### 0. 前提
> 因为DotBPE是基于dotnet core开发的，你本地必须已经有了dotnet core开发环境  
> 使用github托管代码，所以你必须已经安装了git客户端  
> 需要通过protoc生成模板代码，所以你必须已经安装了google protobuf命令行工具


### 1. 下载示例程序

为了能够解释我们的快速开始程序，你需要一份本地能够运行的示例代码。从github上下载我已经写好的示例代码，可以让你快速的搭建程序，免去一些繁琐，但是又必须的步骤。

```
>$ # Clone the repository to get the example code:    
>$ git clone https://github.com/xuanye/dotbpe-sample.git  
>$ cd dotbpe-sample  
```

使用VS2017，或者VSCode打开下载好的代码，目录结构如下所示：
![代码结构](http://ww1.sinaimg.cn/large/697065c1gy1ffm9r259j1j20bw0dmq3f.jpg)

如果你使用VS2017 可以自动帮你还原，如果使用VSCode的话 ，需要运行`dotnet restore` 下载依赖，成功后使用`dotnet build` 编译一下看看结果：看着很完美
![编译结果](http://ww1.sinaimg.cn/large/697065c1gy1ffm9ves29zj20qw08jweu.jpg)

### 2. 运行程序

#### 运行Server

```
>$ cd HelloDotBPE.Server   
>$ dotnet run
```

#### 运行Client

```
>$ cd HelloDotBPE.Client   
>$ dotnet run
```

恭喜！已经使用DotBPE.RPC运行一个Server/Client的应用程序。

### 3. 来一起看一下代码吧

#### 3.1 服务描述文件proto

首先是DotBPE.RPC框架中对proto的扩展文件，所有的项目都需要这个文件，关于如何扩展proto，我的这篇[博客](http://xuanye.github.io/2017/04/23/write-google-protobuf-plugin-with-csharp/)有比较详细的介绍,这里就不重复说了

```protobuf
//dotbpe_option.proto 文件

syntax = "proto3";
package dotbpe;


option csharp_namespace = "DotBPE.ProtoBuf";

import "google/protobuf/descriptor.proto";

//扩展服务
extend google.protobuf.ServiceOptions {
  int32 service_id = 51001;
  bool disable_generic_service_client = 51003; //禁止生成客户端代码
  bool disable_generic_service_server = 51004; //禁止生成服务端代码
}
extend google.protobuf.MethodOptions {
  int32 message_id = 51002;
}

extend google.protobuf.FileOptions {
  bool disable_generic_services_client = 51003; //禁止生成客户端代码
  bool disable_generic_services_server = 51004; //禁止生成服务端代码
  bool generic_markdown_doc = 51005; //是否生成文档 本示例中无用
  bool generic_objectfactory = 51006; //是否生成objectfactory 本示例中无用
}

```

下面的服务描述文件 `greeter.proto` 才是真正的示例的服务描述文件：比较简单，定义一个Greeter Rpc服务，并定义一个Hello的方法

```protobuf
//greeter.proto
syntax = "proto3";
package dotbpe;

option csharp_namespace = "HelloDotBPE.Common";

// 引入扩展
import public "dotbpe_option.proto";

// 定义一个服务
service Greeter {
  option (service_id)= 100 ;//消息ID，全局必须唯一
  // Sends a greeting
  rpc Hello (HelloRequest) returns (HelloResponse) {
    option (message_id)= 1 ;//设定消息ID，同一服务内唯一
  }

}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}
// The response message containing the greetings
message HelloResponse {
  string message = 1;
}

```

通过protoc工具生成模板代码，示例中的代码生成到了 HelloDotBPE.Common\_g 目录下，本地可以运行shell命令的同学可以直接到
dotbpe-sample\script\generate 目录运行`sh generate_hello.sh` （windows下一般安装cgywin），不能运行的同学也可以在HelloDotBPE目录下，直接运行命令行

```
protoc -I=../protos --csharp_out=./HelloDotBPE.Common/_g/ --dotbpe_out=./HelloDotBPE.Common/_g/   ../protos/dotbpe_option.proto ../protos/greeter.proto  --plugin=protoc-gen-dotbpe=../../tool/protoc_plugin/Protobuf.Gen.exe
```

当然我还是建议大家安装以下cgywin运行环境，可以运行unix上的一些常用命令。同时在部署到正式环境的时候可以公用开发环境的一些脚本。

#### 3.2 服务端代码

服务实现：

```csharp
// 服务实现代码
public class GreeterImpl : GreeterBase 
{ 
   public override Task<HelloResponse> HelloAsync(HelloRequest request)
   {
		// 直接返回Hello Name
       return Task.FromResult(new HelloResponse() { Message = "Hello " + request.Name });
   }
}
```

服务端启动类

```csharp
 public class Startup : IStartup
    {
       
        public void Configure(IAppBuilder app, IHostingEnvironment env)
        {
           
        }

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddDotBPE(); // 添加DotBPE.RPC的核心依赖
            services.AddServiceActors<AmpMessage>(actors => {
                actors.Add<GreeterImpl>(); // 注册服务实现
            });

            return services.BuildServiceProvider();
        }
    }
```

启动服务端

```
   class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;

            //在控制台输出调试日志
            DotBPE.Rpc.Environment.SetLogger(new DotBPE.Rpc.Logging.ConsoleLogger());

            var host = new RpcHostBuilder()
                .UseServer("0.0.0.0:6201") //绑定本地端口6201
                .UseStartup<Startup>()
                .Build();

            host.StartAsync().Wait();

            Console.WriteLine("Press any key to quit!");
            Console.ReadKey();

            host.ShutdownAsync().Wait();

        }
    }
```

#### 3.3 客户端代码

```csharp
 class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;

            var client = AmpClient.Create("127.0.0.1:6201"); //建立链接通道
            var greeter = new GreeterClient(client); //客户端代理类
           
            while (true)
            {
                Console.WriteLine("input your name and press enter:");
                string name = Console.ReadLine();
                if ("bye".Equals(name))
                {
                    break;
                }
                try
                {
                    var request = new HelloRequest() { Name = name };
                    var result = greeter.HelloAsync(request).Result;                  
                    Console.WriteLine($"---------------receive form server:{result.Message}-----------");
                                    
                }
                catch (Exception ex)
                {
                    Console.WriteLine("发生错误：" + ex.Message);
                }
            }
            Console.WriteLine($"---------------close connection-----------");
            client.CloseAsync();
        }
    }
```

### 0x03 下一步
下一篇 我将详细讲述DotBPE.RPC中的主要类和调用关系，并介绍如何使用DotNetty实现RPC通信。
事实上我正在编写一个更加复杂的示例[https://github.com/xuanye/PiggyMetrics.git](https://github.com/xuanye/PiggyMetrics.git)，
这原是spring cloud的一个示例程序，我使用DotBPE进行改造，用示例描述DotBPE在真实场景中的应用。包括服务注册和发现，服务间调用，公开HttpApi，监控检查等功能，并通过实践进一步完善DotBPE。初步的功能已经实现，不过还没来的及写文档。该系列的后面将详细描述该系统的实现。