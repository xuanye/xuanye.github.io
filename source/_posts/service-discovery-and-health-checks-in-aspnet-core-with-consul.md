title: (译) Service Discovery And Health Checks In ASP.NET Core With Consul
date: 2019-01-05 09:23
categories: 翻译
tags: 
	- dotnet
	- consul
	- microservice
---

 在这篇文章中，我们将快速了解一下`服务发现`是什么，使用[Consul][1]在ASP.NET Core MVC框架中，并结合[DnsClient.NET][2]实现基于Dns的客户端服务发现


> 这篇文章的所有源代码都可以在GitHub上Demo项目获得.


## Service Discovery

 在现代微服务架构中，服务可以在容器中运行，并且可以动态启动，停止和扩展。 这导致了一个非常动态的托管环境，可能有数百个实际端点，无法手动配置或找到正确的端点。

   话虽这么说，我相信服务发现不仅适用于生活在容器中的粒状微服务。它可以被任何必须访问其他资源的应用程序使用。资源可以是数据库，其他Web服务，也可以是托管在其他地方的网站的一部分。服务发现有助于摆脱特定于环境的配置文件！ 
   
   服务发现可用于解决此问题，但通常，有许多不同的方法来实现它
   
- 客户端服务发现
    一种解决方案是拥有一个中央服务注册表，其中所有服务实例都在这里注册。客户端必须实现逻辑以查询他们需要的服务，最终验证端点是否仍然存活并且可能将请求分发到多个端点。
- 服务器端/负载平衡
 所有流量都通过负载均衡器，负载均衡器知道所有实际的，动态变化的端点，并相应地重定向所有请求

 Consul是一个服务注册表，可用于实现客户端服务发现。

除了使用这种方法的许多强大功能和优点之外，它的缺点是每个客户端应用程序都需要实现一些逻辑来使用此中央注册表。这个逻辑可能非常具体，因为Consul和任何其他技术都有自定义API和逻辑工作方式。

负载平衡也可能无法自动完成。客户端可以查询服务的所有可用/已注册端点，然后决定选择哪个端点。
好的是Consul不仅带有REST API来查询服务注册表，它还提供DNS端点，返回标准SRV和TXT记录。

DNS端点确实关心服务运行状况，因为它不会返回不健康的服务实例。它还通过以交替顺序返回记录来进行负载平衡！ 此外，它可能使服务具有更高的优先级，更接近客户端。

 现在，让我们开始......

<!--more-->

## Consul 安装
 [Consul][3]是由HashiCorp开发的软件，它不仅提供服务发现（如上所述），还提供“健康检查”，并提供分布式“密钥值存储”。
 
 Consul旨在一个集群中运行，至少有三个实例处理集群环境中每个节点上的集群和“代理”的协调。应用程序始终只与本地代理通信，这使得通信速度非常快，并将网络延迟降至最低。

 但是，对于本地开发，您可以在--dev模式下运行Consul，而不是设置完整集群。 但是请记住这一点，为了生产使用，需要做一些工作才能正确设置Consul。
 
 ### 下载和运行Consul

   [官方文档][4]有很多例子，并且很好地解释了如何设置Consul。我不会详细介绍，我们只是将它作为本地开发代理运行。

   要开始使用，请[下载Consul][5]
   
   使用`consul agent --dev`命令和参数来运行启动Consul，这将在本地服务模式下启动Consul而无需配置文件，并且只能在localhost上访问。
   访问http://localhost:8500 ,这应该可以打开Consul UI
   
  ![Consul UI][6]

## 注册第一个服务
 Consul提供了添加或修改服务注册表的不同方法。一种选择是将JSON配置文件放入Consul的config目录中。下面的例子将注册一个Redis服务：
```
{ 
    "service":{
        "name": "redis",
        "tags":[],
        "port": 6379
    }
}
```
 另一个更有趣的选择是通过REST API。幸运的是，已有许多语言的客户端库可用于此REST API，我们将使用[https://github.com/PlayFab/consuldotnet][7]，.Net Core也可以使用

要通过代码注册新服务，请创建一个新的ConsulClient实例并注册新的服务注册

```
var client = new ConsulClient(); // uses default host:port which is localhost:8500

var agentReg = new AgentServiceRegistration()
{
    Address = "127.0.0.1",
    ID = "uniqueid",
    Name = "serviceName",
    Port = 5200
};

await client.Agent.ServiceRegister(agentReg);
```

重要的是要注意，即使服务不再运行，该注册理论上也将永远存在于Consul集群中。

```
await client.Agent.ServiceDeregister("uniqueid");
```
如果服务崩溃，则可能无法始终手动取消注册服务。这就是Consul的另一个特色：健康检查。

## 健康检查 Health Checks

Consul中的监控检查可用于监视群集中的所有服务的状态，还可以从Consul注册表中自动删除不健康的服务端点注册。可以将Consul配置为根据需要定期为每个注册服务运行尽可能多的运行状况检查。
 
 最基本的健康检查让Consul尝试通过TCP连接到服务：
 
```
var tcpCheck = new AgentServiceCheck()
{
    DeregisterCriticalServiceAfter = TimeSpan.FromMinutes(1),
    Interval = TimeSpan.FromSeconds(30),
    TCP = $"127.0.0.1:{port}"
};
```
Consul还可以检查HTTP端点。在这种情况下，只要端点返回HTTP状态代码200，服务就是健康的。
一个非常简单的健康检查控制器可以像这样实现：

```
[Route("[Controller]")]
public class HealthCheckController : Controller
{
    [HttpGet("")]
    [HttpHead("")]
    public IActionResult Ping()
    {
        return Ok();
    }
}
```
在这次注册中，我们现在必须通过指定AgentServiceCheck的`Http`属性而不是`Tcp`属性来将Consul指向该节点：

```
var httpCheck = new AgentServiceCheck()
{
    DeregisterCriticalServiceAfter = TimeSpan.FromMinutes(1),
    Interval = TimeSpan.FromSeconds(30),
    HTTP = $"http://127.0.0.1:{port}/HealthCheck"
};
```

 更新之前注册代码，添加让Consul每30秒运行一次健康检查的部分。请注意，我还将检查配置为自动取消注册服务实例，以防它被标记为运行状况超过一分钟。
 
```
var registration = new AgentServiceRegistration()
{
    Checks = new[] { tcpCheck, httpCheck },
    Address = "127.0.0.1",
    ID = id,
    Name = name,
    Port = port
};

await client.Agent.ServiceRegister(registration);
```

这些基本示例应该足以开始。但是，运行健康检查可以执行更复杂的操作，Consul支持运行小脚本来验证响应。

## Endpoint Name, ID and Port

您可能已经注意到，要注册服务，我们必须知道服务运行的实际端点(`Endpoint`)，我们必须给它一个`Name`和一个`ID`。

 `ID`应该是足够唯一的字符串来标识服务实例，而`Name`应该是同一服务的所有实例的通用名称。
 
  其他客户端将使用Name来查询服务注册表，该ID仅用于引用确切的实例，例如取消注册服务实例时。
  但是我们如何定义名称和端口以及IP地址？
  
  如果我们自己使用Kestrel托管ASP.NET Core应用程序很简单，因为我们还在哪个端口和地址上配置Kestrel。当使用IIS（或任何其他反向代理）托管服务时，这种方法会分崩离析，因为在反向代理模式下，Kestrel使用了动态配置，并且实际的托管信息无法在应用程序代码中使用。（译者注:IIS对外的端口和内部Kestrel的端口并不一致）
  
  要了解如何使用Kestrel托管它，让我们创建一个空的ASP.NET Core web api项目。
  
  运行`dotnet new webapi`或在Visual Studio中使用WebAPI模板。
  
  这将创建一个Program.cs和Startup.cs。 修改`Program.cs`以创建主机。我们将使用`host.Start`而不是`host.Run`，它不会阻塞线程。之后，我们将注册该服务并在服务停止时取消注册：
```
var host = new WebHostBuilder()
    .UseKestrel()
    .UseUrls("http://localhost:5200")
    .UseContentRoot(Directory.GetCurrentDirectory())
    .UseStartup<Startup>()
    .Build();

host.Start();

var client = new ConsulClient();

var name = Assembly.GetEntryAssembly().GetName().Name;
var port = 5200;
var id = $"{name}:{port}";

var tcpCheck = new AgentServiceCheck()
{
    DeregisterCriticalServiceAfter = TimeSpan.FromMinutes(1),
    Interval = TimeSpan.FromSeconds(30),
    TCP = $"127.0.0.1:{port}"
};

var httpCheck = new AgentServiceCheck()
{
    DeregisterCriticalServiceAfter = TimeSpan.FromMinutes(1),
    Interval = TimeSpan.FromSeconds(30),
    HTTP = $"http://127.0.0.1:{port}/HealthCheck"
};

var registration = new AgentServiceRegistration()
{
    Checks = new[] { tcpCheck, httpCheck },
    Address = "127.0.0.1",
    ID = id,
    Name = name,
    Port = port
};

client.Agent.ServiceRegister(registration).GetAwaiter().GetResult();

Console.WriteLine("DataService started...");
Console.WriteLine("Press ESC to exit");

while (Console.ReadKey().Key != ConsoleKey.Escape)
{
}

client.Agent.ServiceDeregister(id).GetAwaiter().GetResult();
```
![此处输入图片的描述][8]

并且（如果您已添加运行状况检查控制器），它将成功运行两个运行状况检查：

![此处输入图片的描述][9]

我使用程序集名称作为服务名称，我正在硬编码端口和IP地址。显然，这需要是可配置的，阻止控制台线程的解决方案也不是很好。

## 更复杂的方式

 了解基础知识以及注册过程的工作原理，让我们稍微改进一下实现。
 
**目标**：

- 可以通过appsettings.json配置服务名称
- 主机和端口不应该是硬编码的
- 使用Microsoft.Extensions.Configuration和Options来正确配置我们需要的所有内容
- 将注册设置为Startup管道的一部分

### Configuration

我定义了一个新的POCOs的配置文件在`appsetting.json`文件中，如下所示:

```
{
...
  "ServiceDiscovery": {
    "ServiceName": "DataService",
    "Consul": {
      "HttpEndpoint": "http://127.0.0.1:8500",
      "DnsEndpoint": {
        "Address": "127.0.0.1",
        "Port": 8600
      }
    }
  }
}
```
C#:

```
public class ServiceDisvoveryOptions
{
    public string ServiceName { get; set; }

    public ConsulOptions Consul { get; set; }
}

public class ConsulOptions
{
    public string HttpEndpoint { get; set; }

    public DnsEndpoint DnsEndpoint { get; set; }
}

public class DnsEndpoint
{
    public string Address { get; set; }

    public int Port { get; set; }

    public IPEndPoint ToIPEndPoint()
    {
        return new IPEndPoint(IPAddress.Parse(Address), Port);
    }
}
```
然后在Startup.ConfigureServices方法中进行配置：

```
services.AddOptions();
services.Configure<ServiceDisvoveryOptions>(Configuration.GetSection("ServiceDiscovery"));
```

使用此配置来设置consul客户端：

```
services.AddSingleton<IConsulClient>(p => new ConsulClient(cfg =>
{
    var serviceConfiguration = p.GetRequiredService<IOptions<ServiceDisvoveryOptions>>().Value;

    if (!string.IsNullOrEmpty(serviceConfiguration.Consul.HttpEndpoint))
    {
        // if not configured, the client will use the default value "127.0.0.1:8500"
        cfg.Address = new Uri(serviceConfiguration.Consul.HttpEndpoint);
    }
}));
```
`ConsulClient`不一定需要配置，如果没有指定，它将使用默认地址（localhost：8500）。

### 动态服务注册
只要使用`Kestrel`在某个端口上托管服务，就可以使用`app.Properties["server.Features"]`来确定托管服务的位置。如上所述，如果使用IIS集成或任何其他反向代理，此解决方案将不再起作用，并且必须使用服务可访问的实际端点来在Consul中注册服务，并且在启动期间无法获取该信息。

如果要将IIS集成与服务发现一起使用，请不要使用以下代码。而是通过配置配置端点，或手动注册服务。

无论如何，对于Kestrel，我们可以执行以下操作：获取URIs kestrel托管服务（这不适用于像`UseUrls("*:5000")`这样的通配符，然后循环地址以在Consul中注册所有地址：

```
ublic void Configure(
        IApplicationBuilder app,
        IApplicationLifetime appLife,
        ILoggerFactory loggerFactory,
        IOptions<ServiceDisvoveryOptions> serviceOptions,
        IConsulClient consul)
    {
        ...

        var features = app.Properties["server.Features"] as FeatureCollection;
        var addresses = features.Get<IServerAddressesFeature>()
            .Addresses
            .Select(p => new Uri(p));

        foreach (var address in addresses)
        {
            var serviceId = $"{serviceOptions.Value.ServiceName}_{address.Host}:{address.Port}";

            var httpCheck = new AgentServiceCheck()
            {
                DeregisterCriticalServiceAfter = TimeSpan.FromMinutes(1),
                Interval = TimeSpan.FromSeconds(30),
                HTTP = new Uri(address, "HealthCheck").OriginalString
            };

            var registration = new AgentServiceRegistration()
            {
                Checks = new[] { httpCheck },
                Address = address.Host,
                ID = serviceId,
                Name = serviceOptions.Value.ServiceName,
                Port = address.Port
            };

            consul.Agent.ServiceRegister(registration).GetAwaiter().GetResult();

            appLife.ApplicationStopping.Register(() =>
            {
                consul.Agent.ServiceDeregister(serviceId).GetAwaiter().GetResult();
            });
        }

        ...
```
 `serviceId`必须足够独特，以便稍后再次找到该服务的特定实例，以取消注册它。我正在使用主机和端口以及实际的服务名称的连接方式，这应该足够好了。
 
 这样我们就达到了所有的目标，虽然在启动的时候写了很多的代码，不过我们可以重构一下使用扩展方法来改善。

## 查询服务注册信息
新服务正在运行并在Consul中注册，现在应该很容易通过Consul API或DNS找到它。

### 使用Consul客户端查询
使用Consul客户端，我们可以使用两种Consul服务

- 使用Catalog端点，它提供有关服务的原始信息，这个将返回未过滤的结果
```
var consulResult = await _consul.Catalog.Service(_options.Value.ServiceName);
```
- 使用Health端点，它将返回已经过滤过的结果
```
var healthResult = await _consul.Health.Service(_options.Value.ServiceName, tag: null, passingOnly: true);
```

这里需要注意的重要一点是，这些端点返回的服务列表（如果多个实例正在运行）将始终采用相同的顺序。您必须实现逻辑，以便不会一直调用相同的服务端点，并在所有端点之间传播流量。

同样，这就是我们可以使用DNS的方式。除了建立负载平衡之外，优点还在于，我们不必再进行另一次昂贵的http调用，并且并且把最终结果缓存一小段时间。使用DNS，我们只需几行代码就可以实现这一切。

### 使用DNS查询
 让我们用`dig`命令检查DNS端点，以了解响应的样子：
 
 要求SRV记录的域名语法是`<servicename>.consul.service`，这意味着我们可以使用`dig @127.0.0.1 -p 8600 dataservice.service.consul SRV`查询我们的`dataService`：
 
```
 ; <<>> DiG 9.11.0-P2 <<>> @127.0.0.1 -p 8600 dataservice.service.consul SRV
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 25053
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; QUESTION SECTION:
;dataservice.service.consul.    IN      SRV

;; ANSWER SECTION:
dataservice.service.consul. 0   IN      SRV     1 1 5200 machinename.node.eu-west.consul.

;; ADDITIONAL SECTION:
machinename.node.eu-west.consul. 0 IN      CNAME   localhost.

;; Query time: 0 msec
;; SERVER: 127.0.0.1#8600(127.0.0.1)
;; WHEN: Tue Apr 25 21:08:19 DST 2017
;; MSG SIZE  rcvd: 109
```

我们获取`SRV`记录中的端口，相应的`CNAME`记录包含我们用于注册服务的主机名或地址.

 Consul DNS端点还允许我们查询标签并限制查询仅查看一个特定的数据中心。 要查询标记，我们必须在标记和服务名称前加上`_: _<tag>._<serviceName>.service.consul`,要指定数据中心查询，将根域更改为`<servicename>.service.<datacenter>.consul`.
 
#### DNS负载均衡
  DNS端点通过以交替顺序返回结果来执行负载均衡。如果我在另一个端口上启动另一个服务实例，我们得到：
  
```
;; QUESTION SECTION:
;dataservice.service.consul.    IN      SRV

;; ANSWER SECTION:
dataservice.service.consul. 0   IN      SRV     1 1 5200 machinename.node.eu-west.consul.
dataservice.service.consul. 0   IN      SRV     1 1 5300 machinename.node.eu-west.consul.

;; ADDITIONAL SECTION:
machinename.node.eu-west.consul. 0 IN      CNAME   localhost.
machinename.node.eu-west.consul. 0 IN      CNAME   localhost.
```
如果您运行查询几次，您将看到答案以不同的顺序返回。

#### 使用DnsClient
 要通过C#代码查询DNS，我将使用我的[`DnsClient`][10]库。我将`ResolveService`扩展方法添加到库中，以使这些`SRV`查找非常简单。
安装`DnsClient` NuGet包后，我只需在DI中注册一`个DnsLookup`客户端：

```
services.AddSingleton<IDnsQuery>(p =>
{
    return new LookupClient(IPAddress.Parse("127.0.0.1"), 8600);
});
```

```
private readonly IDnsQuery _dns;
private readonly IOptions<ServiceDisvoveryOptions> _options;

public SomeController(IDnsQuery dns, IOptions<ServiceDisvoveryOptions> options)
{
    _dns = dns ?? throw new ArgumentNullException(nameof(dns));
    _options = options ?? throw new ArgumentNullException(nameof(options));
}

[HttpGet("")]
[HttpHead("")]
public async Task<IActionResult> DoSomething()
{
    var result = await _dns.ResolveServiceAsync("service.consul", _options.Value.ServiceName);
    ...
}
```
`DnsClient.NET`的`ResolveServiceAsync`执行DNS `SRV`查找，匹配`CNAME`记录并为包含主机名和端口（以及使用的地址）的每个条目返回一个对象。
现在，我们可以使用简单的`HttpClient`调用（或生成的客户端）来调用服务：

```
var address = result.First().AddressList.FirstOrDefault();
var port = result.First().Port;

using (var client = new HttpClient())
{
    var serviceResult = await client.GetStringAsync($"http://{address}:{port}/Values");
}
```
## 结论
 Consul是一个伟大，灵活和稳定的工具。我喜欢它的API和使用模式并不是固定的，你可以有很多选择来使用服务注册和其他功能。与此同时，它的性能表现也是非常优异。
 在今天来说，因为有了众多的工具，在.NET中使用Consul也是非常简单方便。如果你的程序有不同部分需要通讯，那我确定它可以帮助你。
 
> 我在GitHub上整理了一个包含[完整演示项目][11]，把你的想法在评论中告诉我

原文地址:http://michaco.net/blog/ServiceDiscoveryAndHealthChecksInAspNetCoreWithConsul

  [1]: https://consul.io/
  [2]: http://dnsclient.michaco.net/
  [3]: https://consul.io/
  [4]: https://www.consul.io/intro/getting-started/install.html
  [5]: https://www.consul.io/downloads.html
  [6]: http://ww1.sinaimg.cn/mw690/697065c1gy1fyvgzhr3a7j20py0migly.jpg
  [7]: https://github.com/PlayFab/consuldotnet
  [8]: http://blog.michaco.net/media/aspNetCoreAndConsul/FirstServiceReg.png
  [9]: http://blog.michaco.net/media/aspNetCoreAndConsul/FirstServiceCheck.png
  [10]: http://dnsclient.michaco.net/
  [11]: https://github.com/MichaCo/AspNetCore.Services/tree/master/ConsulExample
