title: 创建你自己的IdentityServer4存储类库
date: 2022-01-20 10:01:07
categories: 翻译
tags: 
  - dotnet
  - IdentityServer4
  - 最佳实践
---

> 该文章翻译自 https://www.scottbrady91.com/identity-server/creating-your-own-identityserver4-storage-library


多年来，我经历了许多关于默认的IdentityServer4存储库的意见；然而，不管你对实体框架、聚类索引和varchar长度的看法如何，如果你对默认的存储库有顾虑，那么我的建议总是一样的：**如果你内部有数据库专业技术，就使用它并创建自己的存储层。**

创建你自己的IdentityServer4持久性存储是非常简单的。只有少数几个接口需要实现，每个接口只有几个读写方法。它们不是完整的存储层，也没有规定数据库的类型或结构。

因此，让我们看一看，看看实现我们自己的IdentityServer4存储库有什么好处。



## 1. IdentityServer4 Entity Framework Library

IdentityServer4  Entity Framework library 被设计成兼容众多不同的数据库。它依赖于Entity Framework关系库， 它可以支持并测试了SQL Server、MySQL、SQLite和PostgreSQL。

因此，它没有为任何一个数据库供应商进行优化，并可能因此而受到影响。尽管如此，`Rock Solid Knowledge`仍有客户在生产中使用这个库，其中一个客户拥有超过2000万用户。所以，除非你偏执地执着于自己造轮子，那么这个库很可能会为你提供良好的服务，尽管你的DBA们坚持这样做。

## 2. IdentityServer4的存储接口

从 `IdentityServer4` v2.3版本开始，IdentityServer4的存储接口和实体现在可以在`IdentityServer4.Storage`库中找到。之前它们在IdentityServer4核心库。

让我们来看看IdentityServer4的存储接口，如何处理客户端(Clients)、资源(Resources)、作用域(Scopes)和临时数据(temporary data)。



## 3. Client Store (`IClientStore`)

最难处理的存储可能是`IClientStore`。这是由于`Client`实体的字段比较多，并且内部有许多集合。然而，一旦你确定了一个模式，客户端存储本身就非常简单，只有一个方法需要实现。`FindClientByIdAsync`.



```csharp
public interface IClientStore {
    Task<Client> FindClientByIdAsync(string clientId);
}
```

`FindClientByIdAsync`方法应该返回完整的`Client`实体和所有相关的集合。

一个`Client`也有一个允许的作用域列表。这取决于你是想让它独立,还是与我们很快就会看到的身份和API作用域相联系。

## 4. CORS (`ICorsPolicyService`)

当你实现你自己的`IClientStore`时，你也需要实现你自己的`ICorsPolicyService`。这个接口需要能够使用你选择的客户端存储，并加载所有的`AllowedCorsOrigins`，以促进CORS起源检查。



```csharp
public interface ICorsPolicyService {
    Task<bool> IsOriginAllowedAsync(string origin);
}
```

## 5. Resource Store (`IResourceStore`)

为了存储身份资源和API资源，我们有资源存储。这个接口比其他的存储有更多的方法。



```csharp
public interface IResourceStore {
    Task<IEnumerable<IdentityResource>> FindIdentityResourcesByScopeAsync(IEnumerable<string> scopeNames);
    Task<IEnumerable<ApiResource>> FindApiResourcesByScopeAsync(IEnumerable<string> scopeNames);
    Task<ApiResource> FindApiResourceAsync(string name);
    Task<Resources> GetAllResourcesAsync();
}
```

该接口处理从授权和令牌请求中收到的作用域的转换，将其转换为`IdentityServer4`中各自的资源模型。所以，别忘了，这意味着身份资源的资源名称，但是API资源上的各个API作用域。毕竟，一个API资源为API本身建模，而API又可以有很多作用域，每个作用域代表该API上的一个可委托权限。

## 6. 持久化授权 Persisted Grants

对于持久化授权，我们有两个选择：实现`IPersistedGrantStore`并一次性处理授权码（authorization codes）、刷新令牌（ refresh tokens）、引用令牌（reference tokens）和承诺（consent）的存储，或者使用`IAuthorizationCodeStore`、`IRefreshTokenStore`、`IReferenceTokenStore`和`IUserConsentStore`单独实现这些。

### 6.1 接口 IPersistedGrantStore 

`IAuthorizationCodeStore`、`IRefreshTokenStore`、`IReferenceTokenStore`和`IUserConsentStore`的默认实现都使用了`IPersistedGrantStore`。这种一刀切的存储接受序列化的数据，以后可以通过键来检索。这个键要么是客户端应用程序已知的东西（如授权码），要么是对进入的客户端应用程序来说总是可以评估为相同的东西（如consent）。

持久的授权可以由`IdentityServer4`给出一个过期时间，由你来清理过期的授权，以免你的数据库因为压力而开始不堪重负。

由于密钥可能是一些敏感的东西，如刷新令牌（refresh token）值，那么它应该以散列格式存储。



```csharp
public class PersistedGrant {
    public string Key { get; set; }
    public string Type { get; set; }
    public string SubjectId { get; set; }
    public string ClientId { get; set; }
    public DateTime CreationTime { get; set; }
    public DateTime? Expiration { get; set; }
    public string Data { get; set; }
}
public interface IPersistedGrantStore {
    Task StoreAsync(PersistedGrant grant);
    Task<PersistedGrant> GetAsync(string key);
    Task<IEnumerable<PersistedGrant>> GetAllAsync(string subjectId);
    Task RemoveAsync(string key);
    Task RemoveAllAsync(string subjectId, string clientId);
    Task RemoveAllAsync(string subjectId, string clientId, string type);
}
```



### 6.2 序列化 Serialization

默认情况下，持久化的授权会使用`IPersistentGrantSerializer`接口被序列化为JSON。如果这不符合你的要求，这也是可以被重写的.

### 6.3 单独存储

否则，如果你发现自己要处理数以百万计的引用令牌，而你目前的存储正在成为一个瓶颈，你可以一次实现这些存储，以不同的方式存储每一个，也许有些使用`IPersistedGrantStore`，有些没有。



```csharp
public interface IAuthorizationCodeStore {
	Task<string> StoreAuthorizationCodeAsync(AuthorizationCode code);
	Task<AuthorizationCode> GetAuthorizationCodeAsync(string code);
	Task RemoveAuthorizationCodeAsync(string code);
}
public interface IRefreshTokenStore {
	Task<string> StoreRefreshTokenAsync(RefreshToken refreshToken);
	Task UpdateRefreshTokenAsync(string handle, RefreshToken refreshToken);
	Task<RefreshToken> GetRefreshTokenAsync(string refreshTokenHandle);
	Task RemoveRefreshTokenAsync(string refreshTokenHandle);
	Task RemoveRefreshTokensAsync(string subjectId, string clientId);
}
public interface IReferenceTokenStore {
	Task<string> StoreReferenceTokenAsync(Token token);
	Task<Token> GetReferenceTokenAsync(string handle);
	Task RemoveReferenceTokenAsync(string handle);
	Task RemoveReferenceTokensAsync(string subjectId, string clientId);
}
public interface IUserConsentStore {
	Task StoreUserConsentAsync(Consent consent);
	Task<Consent> GetUserConsentAsync(string subjectId, string clientId);
	Task RemoveUserConsentAsync(string subjectId, string clientId);
}
```

如果你走的是使用单个存储的路线，那么你还需要实现`IPersistedGrantService`接口，以了解它们，因为默认实现只使用`IPersistedGrantStore`。然而，这个服务只被`DefaultIdentityServerInteractionService`的`GetAllUserConsentsAsync`方法使用，即使如此，也只在QuickStart UI的授予页面中使用。

## 7. 设备流（IDeviceFlowStore）

设备流请求的存储也相对简单，但与其他临时数据存储不同的是，它必须可以通过两个不同的参数进行搜索：一个设备代码，一个用户代码。



```csharp
public interface IDeviceFlowStore {
	Task StoreDeviceAuthorizationAsync(string deviceCode, string userCode, DeviceCode data);
	Task<DeviceCode> FindByUserCodeAsync(string userCode);
	Task<DeviceCode> FindByDeviceCodeAsync(string deviceCode);
	Task UpdateByUserCodeAsync(string userCode, DeviceCode data);
	Task RemoveByDeviceCodeAsync(string deviceCode);
}
```

这个接口可以再次利用`IPersistentGrantSerializer`的优势来简化存储。



##　8. 注册你自己的实现

为了注册我们自己的存储实现类，在`IIdentityServerBuilder`上已有一些扩展方法，注册成我们之前定义的类即可．其他一些实现类我们必须自己注册它们。默认情况下，这些类是以`transient lifetime`注册的。

```csharp
services.AddIdentityServer()
    // existing registrations
    .AddClientStore<MyCustomClientStore>()
    .AddCorsPolicyService<MyCustomCorsPolicyService>()
    .AddResourceStore<MyCustomResourcesStore>()
    .AddPersistedGrantStore<MyCustomPersistedGrantStore>()
    .AddDeviceFlowStore<MyCustomDeviceFlowStore>(); 

// For manual temp data stores
services.AddTransient<IAuthorizationCodeStore, MyCustomAuthorizationCodeStore>();
services.AddTransient<IRefreshTokenStore, MyCustomRefreshTokenStore>();
services.AddTransient<IReferenceTokenStore, MyCustomReferenceTokenStore>();
services.AddTransient<IUserConsentStore, MyCustomUserConsentStore>();
```

## 9. 奖励：秘钥和消息存储

不太常见，但可以替换的接口还有`ISigningCredentialStore`、`IValidationKeysStore`、`IMessageStore`和`IConsentMessageStore`的。

`ISigningCredentialStore`和`IValidationKeys`分别处理用于签署令牌的私钥和验证令牌的公钥的加载。默认情况下，密钥从x509证书或证书存储中加载，然后存储在内存中。

`IMessageStore`和`IConsentMessage`存储处理IdentityServer协议端点和你的用户界面之间的数据持久性。这些的使用是由IdentityServer交互服务处理的，允许按ID加载错误，并将承诺(consent)响应信息返回给IdentityServer。就个人而言，我从来没有看到过这两个的自定义实现。