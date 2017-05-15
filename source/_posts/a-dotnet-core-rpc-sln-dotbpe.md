title: [开源]基于DotNet Core的RPC框架-DotBPE.RPC
date: 2017-05-15 15:01:07
categories: 原创
tags: [dotnet,rpc,dotbpe]
---

## 0x00 简介
DotBPE.RPC是一款基于dotnet core编写的RPC框架，而它的爸爸DotBPE，目标是实现一个开箱即用的微服务框架，但是它还差点意思，还仅仅在构思和尝试的阶段。但不管怎么说RPC是微服务的基础，先来讲讲RPC的实现吧。DotBPE.RPC底层通信默认实现基于[DotNetty](https://github.com/Azure/DotNetty)，这是由微软Azure团队开发的C#的Netty实现，非常酷。当然你也可以替换成其他Socket通信组件。DotBPE.RPC使用的默认协议名称叫Amp,编解码使用谷歌的Protobuf3,不过这些默认实现都是可以替换的。

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


### 1. 安装

可以通过nuget来安装DotBPE相关

> PM> Install-Package DotBPE -Pre

