title: 使用DotNetty编写跨平台网络通信程序
date: 2017-05-29 12:37:24
categories: 原创
tags: [DotNet,DotNetty]
---

长久以来,.Net开发人员都非常羡慕Java有Netty这样，高效，稳定又易用的网络通信基础框架。终于微软的Azure团队，使用C#实现的Netty的版本发布。不但使用了C#和.Net平台的技术特点，并且保留了Netty原来绝大部分的编程接口。让我们在使用时，完全可以依照Netty官方的教程来学习和使用DotNetty应用程序。
DotNetty同时也是开源的，它的源代码托管在Github上:[https://github.com/azure/dotnetty](https://github.com/azure/dotnetty)

<!-- more -->
## 0x01 项目预览

从github上下载最新的代码到本地，使用VS2017或者VSCode打开下载好的代码，可以看到如图所示的代码那结构，其中源码部分有9个项目组成，其中
> DotNetty.Common 是公共的类库项目，包装线程池，并行任务和常用帮助类的封装
> DotNetty.Transport 是DotNetty核心的实现
> DotNetty.Buffers 是对内存缓冲区管理的封装
> DotNetty.Codes 是对编解码是封装，包括一些基础基类的实现，我们在项目中自定义的协议，都要继承该项目的特定基类和实现  
> DotNetty.Handlers 封装了常用的管道处理器，比如Tls编解码，超时机制，心跳检查，日志等，如果项目中没有用到可以不引用，不过一般都会用到  
> 其他还有对Redis的编解码，Mqtt的编解码，Protobuf2/3的编解码项目中可根据实际情况引用
> 很遗憾Http协议和Websocket协议还没有实现。


## 0x02 快速开始-示例-回声程序的实现

从上一步下载的代码中，看到有一个sample目录，有很多例子，都大同小异， 先来看这个最简单的Echo服务的实现吧.  
Echo服务，分为服务端和客户端，服务端使用DotNetty框架启动一个Socket服务，并等待客户端链接，当客户端链接并接收客户端消息，并将接收到的消息原样返回给客户端。而客户端同样使用DotNetty框架启动一个Socket客户端服务，并链接到服务端，并发送一条Hello的字符串信息，并等待服务端返回。如此往复。


### 2.1 Echo Server
来一起看一下代码吧，我把注释都写到代码中：

```csharp
static async Task RunServerAsync()
{

	//设置输出日志到Console
    ExampleHelper.SetConsoleLogger();

	// 主工作线程组，设置为1个线程
 	var bossGroup = new MultithreadEventLoopGroup(1);
	// 工作线程组，默认为内核数*2的线程数
    var workerGroup = new MultithreadEventLoopGroup();
    X509Certificate2 tlsCertificate = null;
    if (ServerSettings.IsSsl) //如果使用加密通道
            {
                tlsCertificate = new X509Certificate2(Path.Combine(ExampleHelper.ProcessDirectory, "dotnetty.com.pfx"), "password");
            }
            try
            {
				
				//声明一个服务端Bootstrap，每个Netty服务端程序，都由ServerBootstrap控制，
				//通过链式的方式组装需要的参数

                var bootstrap = new ServerBootstrap();
                bootstrap
                    .Group(bossGroup, workerGroup) // 设置主和工作线程组
                    .Channel<TcpServerSocketChannel>() // 设置通道模式为TcpSocket
                    .Option(ChannelOption.SoBacklog, 100) // 设置网络IO参数等，这里可以设置很多参数，当然你对网络调优和参数设置非常了解的话，你可以设置，或者就用默认参数吧
                    .Handler(new LoggingHandler("SRV-LSTN")) //在主线程组上设置一个打印日志的处理器
                    .ChildHandler(new ActionChannelInitializer<ISocketChannel>(channel =>
                    { //工作线程连接器 是设置了一个管道，服务端主线程所有接收到的信息都会通过这个管道一层层往下传输
//同时所有出栈的消息 也要这个管道的所有处理器进行一步步处理
                        IChannelPipeline pipeline = channel.Pipeline;
                        if (tlsCertificate != null) //Tls的加解密
                        {
                            pipeline.AddLast("tls", TlsHandler.Server(tlsCertificate));
                        }
						//日志拦截器
                        pipeline.AddLast(new LoggingHandler("SRV-CONN"));
//出栈消息，通过这个handler 在消息顶部加上消息的长度
                        pipeline.AddLast("framing-enc", new LengthFieldPrepender(2));
//入栈消息通过该Handler,解析消息的包长信息，并将正确的消息体发送给下一个处理Handler，该类比较常用，后面单独说明
                        pipeline.AddLast("framing-dec", new LengthFieldBasedFrameDecoder(ushort.MaxValue, 0, 2, 0, 2));
//业务handler ，这里是实际处理Echo业务的Handler
                        pipeline.AddLast("echo", new EchoServerHandler());
                    }));
			
		// bootstrap绑定到指定端口的行为 就是服务端启动服务，同样的Serverbootstrap可以bind到多个端口
                IChannel boundChannel = await bootstrap.BindAsync(ServerSettings.Port);

                Console.ReadLine();
//关闭服务
                await boundChannel.CloseAsync();
            }
            finally
            {
//释放工作组线程
                await Task.WhenAll(
                    bossGroup.ShutdownGracefullyAsync(TimeSpan.FromMilliseconds(100), TimeSpan.FromSeconds(1)),
                    workerGroup.ShutdownGracefullyAsync(TimeSpan.FromMilliseconds(100), TimeSpan.FromSeconds(1)));
            }
        }
```


来看下实际的业务代码，比较简单，也就是打印日志，并返回收到的字符串


```
 public class EchoServerHandler : ChannelHandlerAdapter //管道处理基类，较常用
    {
//	重写基类的方法，当消息到达时触发，这里收到消息后，在控制台输出收到的内容，并原样返回了客户端
        public override void ChannelRead(IChannelHandlerContext context, object message)
        {

            var buffer = message as IByteBuffer;
            if (buffer != null)
            {
                Console.WriteLine("Received from client: " + buffer.ToString(Encoding.UTF8));
            }
            context.WriteAsync(message);//写入输出流
        }

// 输出到客户端，也可以在上面的方法中直接调用WriteAndFlushAsync方法直接输出
        public override void ChannelReadComplete(IChannelHandlerContext context) => context.Flush();

//捕获 异常，并输出到控制台后断开链接，提示：客户端意外断开链接，也会触发
        public override void ExceptionCaught(IChannelHandlerContext context, Exception exception)
        {
            Console.WriteLine("Exception: " + exception);
            context.CloseAsync();
        }
    }
```



### 2.2 Echo Client

客户端的代码和服务端的代码相差很少，体现了Netty统一的编程模型。有几个不同点：

1. 客户端的Bootstrap不是ServerBootstrap了，
2. 客户端不需要主线程组，只有工作线程组，消息处理管道也建立在里主线程工作组的拦截通道上。
3. 最后不是bind而是connect

```
static async Task RunClientAsync()
        {
            ExampleHelper.SetConsoleLogger();

            var group = new MultithreadEventLoopGroup();

            X509Certificate2 cert = null;
            string targetHost = null;
            if (ClientSettings.IsSsl)
            {
                cert = new X509Certificate2(Path.Combine(ExampleHelper.ProcessDirectory, "dotnetty.com.pfx"), "password");
                targetHost = cert.GetNameInfo(X509NameType.DnsName, false);
            }
            try
            {
                var bootstrap = new Bootstrap();
                bootstrap
                    .Group(group)
                    .Channel<TcpSocketChannel>()
                    .Option(ChannelOption.TcpNodelay, true)
                    .Handler(new ActionChannelInitializer<ISocketChannel>(channel =>
                    {
                        IChannelPipeline pipeline = channel.Pipeline;

                        if (cert != null)
                        {
                            pipeline.AddLast("tls", new TlsHandler(stream => new SslStream(stream, true, (sender, certificate, chain, errors) => true), new ClientTlsSettings(targetHost)));
                        }
                        pipeline.AddLast(new LoggingHandler());
                        pipeline.AddLast("framing-enc", new LengthFieldPrepender(2));
                        pipeline.AddLast("framing-dec", new LengthFieldBasedFrameDecoder(ushort.MaxValue, 0, 2, 0, 2));

                        pipeline.AddLast("echo", new EchoClientHandler());
                    }));

                IChannel clientChannel = await bootstrap.ConnectAsync(new IPEndPoint(ClientSettings.Host, ClientSettings.Port));

                Console.ReadLine();

                await clientChannel.CloseAsync();
            }
            finally
            {
                await group.ShutdownGracefullyAsync(TimeSpan.FromMilliseconds(100), TimeSpan.FromSeconds(1));
            }
        }
```

业务代码

```
// 代码和服务端也相差不多，并且继承了同样的基类。
 public class EchoClientHandler : ChannelHandlerAdapter
    {
        readonly IByteBuffer initialMessage;

        public EchoClientHandler()
        {
            this.initialMessage = Unpooled.Buffer(ClientSettings.Size);
            byte[] messageBytes = Encoding.UTF8.GetBytes("Hello world");
            this.initialMessage.WriteBytes(messageBytes);
        }

	//重写基类方法，当链接上服务器后，马上发送Hello World消息到服务端
        public override void ChannelActive(IChannelHandlerContext context) => context.WriteAndFlushAsync(this.initialMessage);

        public override void ChannelRead(IChannelHandlerContext context, object message)
        {
            var byteBuffer = message as IByteBuffer;
            if (byteBuffer != null)
            {
                Console.WriteLine("Received from server: " + byteBuffer.ToString(Encoding.UTF8));
            }
            context.WriteAsync(message);
        }

        public override void ChannelReadComplete(IChannelHandlerContext context) => context.Flush();

        public override void ExceptionCaught(IChannelHandlerContext context, Exception exception)
        {
            Console.WriteLine("Exception: " + exception);
            context.CloseAsync();
        }
    }
```




## 0x03 常用Handler和基类

从Echo服务的例子中，我们可以看到Netty程序不管时服务端还是客户端都通过一个Bootstrap/ServerBootstrap来启动Socket程序，并通过设置处理Handler管道来处理出入的消息，管道中常见的拦截器有加解密，日志记录，编解码，消息头处理，业务处理等，实际业务中根据情况可以自行添加自己的业务逻辑，同时很多处理器代码在服务端和客户端是公用的，Netty本身已经提供了一些常用处理器和业务处理器的基类来简化实际开发，我们一起看一下

### 3.1 TlsHandler
Netty支持Tls加密传输，TlsHandler类可以在开发人员无须关心加密传输时字节码的变化，只关心自己的业务代码即可。在管道处理的第一个配置该类即可

### 3.2 LengthFieldPrepender 
这个handler 会在实际发送前在将数据的长度放置在数据前，本例中使用2个字节来存储数据的长度。

### 3.3 LengthFieldBasedFrameDecoder 
这个handler比较常用，会在解码前用于解析数据，用于读取数据包的头信息，特别是包长，并等待数据达到包长后再交由下一个handler处理。
参数说明 以下是Amp协议的参数值，并注释了意义

> InitialBytesToStrip = 0, //读取时需要跳过的字节数  
> LengthAdjustment = -5, //包实际长度的纠正，如果包长包括包头和包体，则要减去Length之前的部分  
> LengthFieldLength = 4, //长度字段的字节数 整型为4个字节   
> LengthFieldOffset = 1, //长度属性的起始（偏移）位   
> MaxFrameLength = int.MaxValue, // 最大包长  


### 3.4 ChannelHandlerAdapter和SimpleChannelInboundHandler<T>

业务处理的常用Handler基类，一般客户端和服务端的业务处理handler 都要继承这个这两个类，其中SimpleChannelInboundHandler<T>是ChannelHandlerAdapter的子类，对其简单的进行封装，并进行了类型检查。


### 3.5 IdleStateHandler 链接状态检查handler
这个handler一般用于检查链接的状态，比如写超时，读超时。在实际项目中一般在客户端添加它，并用于发送心跳包。

以下是DotBPE在客户端管道中 第一个添加IdleStateHandler 并设置触发时间


```
 var bootstrap = new Bootstrap();
            bootstrap
                .Channel<TcpSocketChannel>()
                .Option(ChannelOption.TcpNodelay, true)
                .Option(ChannelOption.ConnectTimeout, TimeSpan.FromSeconds(3))
                .Group(new MultithreadEventLoopGroup())
                .Handler(new ActionChannelInitializer<ISocketChannel>(c =>
                {
                    var pipeline = c.Pipeline;
                    pipeline.AddLast(new LoggingHandler("CLT-CONN"));
                    MessageMeta meta = _msgCodecs.GetMessageMeta();


                    // IdleStateHandler
                    pipeline.AddLast("timeout", new IdleStateHandler(0, 0, meta.HeartbeatInterval / 1000));
                    //消息前处理
                    pipeline.AddLast(
                        new LengthFieldBasedFrameDecoder(
                            meta.MaxFrameLength,
                            meta.LengthFieldOffset,
                            meta.LengthFieldLength,
                            meta.LengthAdjustment,
                            meta.InitialBytesToStrip
                        )
                    );

                    pipeline.AddLast(new ChannelDecodeHandler<TMessage>(_msgCodecs));
                    pipeline.AddLast(new ClientChannelHandlerAdapter<TMessage>(this));

                }));
            return bootstrap;
```

然后在业务处理handler中处理UserEventTriggered事件

```
//ChannelHandlerAdapter 重写UserEventTriggered
public override void UserEventTriggered(IChannelHandlerContext context, object evt){
  if(evt is IdleStateEvent){
     var eventState = evt as IdleStateEvent;
     if(eventState !=null){
	    this._bootstrap.SendHeartbeatAsync(context,eventState);
     }
  }
}
```


更多细节可以参考 《[Netty 4.x 用户指南](https://www.gitbook.com/book/waylau/netty-4-user-guide/details)》




