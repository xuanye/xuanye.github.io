title: 使用Peach简化Socket网络通讯协议开发
date: 2019-02-27 11:01:07
categories: 原创
tags: 
  - dotnet
  - socket
  - peach
  - dotnetty
  - netty
---

![](http://ww1.sinaimg.cn/large/697065c1ly1g0ky6oxiznj21hc0gohdu.jpg)

Peach是基于[DotNetty][1]的Socket网络通讯帮助类库，可以帮助开发者简化使用DotNetty，关于DotNetty可参考我之前的[这篇文章][2]。
Peach内置实现了一个基于文本协议的CommandLineProtocol，下面的实例以这个协议展开，最后以[DotBPE][3]中Amp协议来介绍下如何扩展自定义协议。


# QuickStart 使用

要使用Peach编写网络程序，一般只需要三个步骤
1. 实现协议传输消息IMessage
2. 实现协议打包和解包逻辑IProtocol
3. 实现ISocketService完成服务端逻辑编写
<!-- more -->
在快速开始的实例中，我们使用内置的CommandLineProtocol，所以省去了步骤1,2让我们开始吧！

## 1 服务端

### 1.1 实现MyService
可分别重写  
1. `OnConnected` 有客户端连接上的事件  
2. `OnDisConnected` 客户端断开连接时的事件
3. `OnReceive` 收到客户端消息的事件
4. `OnException` 发生异常时的事件，如异常断开

```
public class MyService : Peach.AbsSocketService<Peach.Messaging.CommandLineMessage>
{
    private readonly ILogger<MyService> _logger;

    public MyService(ILogger<MyService> logger)
    {
        _logger = logger;
    }
    public override void OnConnected(ISocketContext<CommandLineMessage> context)
    {
        _logger.LogInformation("client connected from {0}", context.RemoteEndPoint);
        base.OnConnected(context);
    }

    public override void OnDisconnected(ISocketContext<CommandLineMessage> context)
    {
        _logger.LogInformation("client disconnected from {0}", context.RemoteEndPoint);
        base.OnDisconnected(context);
    }

    public override void OnException(ISocketContext<CommandLineMessage> context, Exception ex)
    {
        _logger.LogError(ex,"client from {0}, occ error {1}", context.RemoteEndPoint,ex.Message);
        base.OnException(context, ex);
    }

    public override void OnReceive(ISocketContext<CommandLineMessage> context, CommandLineMessage msg)
    {
        string replyMessage = string.Empty;
        string replyCmd = string.Empty;
        switch (msg.Command)
        {
            case "echo":
                replyMessage = msg.Parameters[0];
                replyCmd = "echo";
                break;
            case "init":
                replyMessage = "ok";
                replyCmd = "init_reply";

                break;
            default:
                replyMessage = "error unknow command";
                break;
        }


        Task.Run(async () =>
        {
            await context.SendAsync(new CommandLineMessage(replyCmd, replyMessage));
        });
    }

}
```
### 2. 挂载服务

服务默认挂载在5566端口  

```
static void Main(string[] args)
{
    var builder = new HostBuilder()          
    .ConfigureServices((context,services) =>
    {
        //协议
        services.AddSingleton<IProtocol<CommandLineMessage>, CommandLineProtocol>();
        //挂载服务逻辑
        services.AddSingleton<ISocketService<CommandLineMessage>, MyService>();
        //添加挂载的宿主服务
        services.AddTcpServer<CommandLineMessage>();
    })
    .ConfigureLogging(
        logger =>
        {                   
            logger.AddConsole();
        }
    );
    builder.RunConsoleAsync().Wait();
}
```

## 2. 客户端

### 2.1 使用内置的TcpClient

监听接收消息和链接的消息，如下所示：
```
TcpClient<CommandLineMessage> client = new TcpClient<CommandLineMessage>(new CommandLineProtocol());
client.OnReceived += Client_OnReceived;
client.OnConnected += Client_OnConnected;

Task.Run(async () =>
{
    //连接服务器
    var socketContext = await client.ConnectAsync(new IPEndPoint(Hey.IPUtility.GetLocalIntranetIP(), 5566));
    //发送消息
    var initCmd = new Hey.Messaging.CommandLineMessage("init");
    await socketContext.SendAsync(initCmd);
}).Wait();
```

可用的事件:
- `OnReceived` 当收到服务端消息时
- `OnError` 当通讯发生异常时
- `OnConnected` 当连接上服务器时
- `OnDisconnected` 当与服务端断开链接时
- `OnIdleState` 链接闲置时触发，一般在此事件中发送心跳包


## 3. 自定义协议
Peach支持使用自定义协议，扩展协议需要自行实现两个接口:

### 3.1. IMessage 接口

实现类具体实现通讯消息的内容载体，只需实现如何获取消息长度的属性

```
public interface IMessage
{
    int Length { get;  }
}
```

### 3.2. IProtocol 接口

实现类需要描述消息头信息和具体打包解包逻辑，头信息描述参见`ProtocolMeta`字段描述


```
/// <summary>
/// 协议接口
/// </summary>
/// <typeparam name="TMessage"></typeparam>
public interface IProtocol<TMessage>
    where TMessage :  Messaging.IMessage
{
    ProtocolMeta GetProtocolMeta();

    TMessage Parse(Buffer.IBufferReader reader);

    void Pack(Buffer.IBufferWriter writer, TMessage message);

}
```

### 3.3 Amp协议
为了更好让读者理解自定义协议的操作，这里以DotBPE中的Amp协议为例，来具体讲解一下，先来看下Amp协议的说明:

```
      0        1 2 3 4   5 6 7 8     9     10 11 12 13   1415      16171819    20    <length>-21
+------------+----------+---------+------+-------------+---------+---------+--------+------------+
| <ver/argc> | <length> |  <seq>  |<type>| <serviceId> | <msgId> |  <code> | <codec>|   <data>   |
+------------+----------+---------+------+-------------+---------+---------+--------+------------+
```
Amp协议固定包头上21个字节，说明如下：

+ ver/argc = 版本 固定填1
+ length = 为总包长
+ seq  = 请求序列号
+ type = 消息类型
    * 1 = Request 请求消息
    * 2 = Response 响应消息
    * 3 = Notify 通知消息
    * 4 = OneWayRequest 调用不关心返回值
+ serId = serviceId  服务号
+ msgId = msgId 消息ID
+ code = 当 type = 0 （请求时）固定传0 ，其他即为响应码，如果响应码不为0 则认为请求失败，具体错误码再定义
+ codecType = 编码方式 0=默认 Protobuf 1=MessagePack 2=JSON
+ data = 实际的业务数据

### 3.3.1 AmpMessage实现

为了避免干扰因素，这里的代码去除了一些，辅助行的字段和方法，AmpMessage其实是主要用于描述头信息的，并且包含body的buffer数据 `Data`字段，并实现获取消息体Length的方法（用于发送消息时，计算缓冲区）

```
 public class AmpMessage :  Peach.Messaging.IMessage
    {
       /// <summary>
        /// 第一个版本为18个字节头固定长度
        /// </summary>
        public const int VERSION_0_HEAD_LENGTH = 18;
        /// <summary>
        /// 现有版本21个字节头固定长度
        /// </summary>
        public const int VERSION_1_HEAD_LENGTH = 21;
        /// <summary>
        /// 状态码
        /// </summary>
        public int Code { get; set; }

        //0 默认为Protobuf 1 MessagePack 2 = JSON
        public CodecType CodecType { get; set; }

        /// <summary>
        /// 实际的请求数据
        /// </summary>
        public byte[] Data { get; set; }

        public int Length {
            get
            {
                var hl = Version == 0 ? VERSION_0_HEAD_LENGTH : VERSION_1_HEAD_LENGTH;
                if(Data == null)
                {
                    return hl;
                }

                return hl + this.Data.Length;
            }
        }
        
        /// <summary>
        /// 消息标识
        /// </summary>
        public string Id => $"{ServiceId}|{MessageId}|{Sequence}";
        /// <summary>
        /// 调用服务的唯一消息号 确定哪个方法
        /// </summary>
        public ushort MessageId { get; set; }
        /// <summary>
        /// 请求的序列号
        /// </summary>
        public int Sequence { get; set; }
        /// <summary>
        /// 调用服务的唯一服务号 确定哪个服务
        /// </summary>
        public int ServiceId { get; set; }

        /// <summary>
        /// 协议版本0/1
        /// </summary>
        public byte Version { get; set; }

        public InvokeMessageType InvokeMessageType { get; set; }
    }
    
    public enum InvokeMessageType : byte
    {
        Request = 1,
        Response = 2,
        Notify = 3,
        OnewayRequest=4 //请求且不等待回复
    }
```
### 3.3.2 AmpProtocol的实现

AmpProtocol中的实现主要是对ProtocolMeta描述，代码中已有详细注释，至于打包和解包，就是根据协议Write或者Read对应的数据类型即可

```
/// <summary>
    /// Amp Protocol
    /// </summary>
    public class AmpProtocol : IProtocol<AmpMessage>
    {
        private readonly ISerializer _serializer;

        public AmpProtocol(ISerializer serializer)
        {
            this._serializer = serializer;
        }

        static readonly ProtocolMeta AMP_PROTOCOL_META = new ProtocolMeta
        {
            InitialBytesToStrip = 0, //读取时需要跳过的字节数
            LengthAdjustment = -5, //包实际长度的纠正，如果包长包括包头和包体，则要减去Length之前的部分
            LengthFieldLength = 4, //长度字段的字节数 整型为4个字节
            LengthFieldOffset = 1, //长度属性的起始（偏移）位
            MaxFrameLength = int.MaxValue, //最大的数据包字节数
            HeartbeatInterval = 30 * 1000 // 30秒没消息发一个心跳包
        };

        public ProtocolMeta GetProtocolMeta()
        {
            return AMP_PROTOCOL_META;
        }

        public void Pack(IBufferWriter writer, AmpMessage message)
        {
            writer.WriteByte(message.Version);
            writer.WriteInt(message.Length);
            writer.WriteInt(message.Sequence);
            writer.WriteByte((byte)message.InvokeMessageType);

            if (message.Version == 0)
            {
                writer.WriteUShort((ushort)message.ServiceId);
            }
            else
            {
                writer.WriteInt(message.ServiceId);
            }
            writer.WriteUShort(message.MessageId);
            writer.WriteInt(message.Code);
            if(message.Version == 1)
            {
                writer.WriteByte(_serializer.CodecType);
            }

            if (message.Data != null)
            {
                writer.WriteBytes(message.Data);
            }
        }

        public AmpMessage Parse(IBufferReader reader)
        {
            if (reader.ReadableBytes == 0)
            {
                return null;
            }

            var msg = new AmpMessage {Version = reader.ReadByte()};

            int headLength;
            if (msg.Version == 0 )
            {
                headLength = AmpMessage.VERSION_0_HEAD_LENGTH;
                if (reader.ReadableBytes < AmpMessage.VERSION_0_HEAD_LENGTH - 1)
                {
                    throw new RpcCodecException($"decode error ,ReadableBytes={reader.ReadableBytes+1},HEAD_LENGTH={AmpMessage.VERSION_0_HEAD_LENGTH}");
                }
            }
            else if (msg.Version == 1 )
            {
                headLength = AmpMessage.VERSION_1_HEAD_LENGTH;
                if (reader.ReadableBytes < AmpMessage.VERSION_1_HEAD_LENGTH - 1)
                {
                    throw new RpcCodecException($"decode error ,ReadableBytes={reader.ReadableBytes+1},HEAD_LENGTH={AmpMessage.VERSION_1_HEAD_LENGTH}");
                }
            }
            else
            {
                throw new RpcCodecException($"decode error ,{msg.Version} is not support");
            }

            var length = reader.ReadInt();
            msg.Sequence = reader.ReadInt();
            var type = reader.ReadByte();
            msg.InvokeMessageType = (InvokeMessageType)Enum.ToObject(typeof(InvokeMessageType), type);


            msg.ServiceId = msg.Version == 0 ? reader.ReadUShort() : reader.ReadInt();


            msg.MessageId = reader.ReadUShort();
            msg.Code = reader.ReadInt();

            if (msg.Version == 1)
            {
                byte codeType = reader.ReadByte();
                if (codeType != this._serializer.CodecType)
                {
                    throw  new RpcCodecException($"CodecType:{codeType} is not Match {this._serializer.CodecType}");
                }
                msg.CodecType = (CodecType)Enum.ToObject(typeof(CodecType), codeType);
            }
            else
            {
                msg.CodecType = CodecType.Protobuf;
            }

            int left = length - headLength;
            if (left > 0)
            {
                if (left > reader.ReadableBytes)
                {
                    throw new RpcCodecException("message not long enough!");
                }
                msg.Data = new byte[left];
                reader.ReadBytes(msg.Data);
            }
            return msg;
        }
    }
}
```

## 4. 后记
Peach的产生主要是源于对DotBPE的重构，因为在其他项目中有关于通讯的其他需求，所以这块虽然比较简单，也可比较独立，所以单独开了一个库来实现对DotNetty的封装。另外欢迎各位dotnet core的同学一起学习交流 QQ群号：699044833

  [1]: https://github.com/Azure/DotNetty
  [2]: http://xuanye.github.io/dotnetty-quickstart/
  [3]: https://github.com/dotbpe/dotbpe