title: 使用CSharp编写Google Protobuf插件
date: 2017-04-23 18:01:07
categories: 原创
tags: [Google Protobuf,dotnet]
---

什么是 Google Protocol Buffer？

Google Protocol Buffer( 简称 Protobuf) 是 Google 公司内部的混合语言数据标准，目前已经正在使用的有超过 48,162 种报文格式定义和超过 12,183 个 .proto 文件。他们用于 RPC 系统和持续数据存储系统。

Protocol Buffers 是一种轻便高效的结构化数据存储格式，可以用于结构化数据串行化，或者说序列化。它很适合做数据存储或 RPC 数据交换格式。可用于通讯协议、数据存储等领域的语言无关、平台无关、可扩展的序列化结构数据格式。目前提供了 多种语言的API，包括C++、 C# 、GO、 JAVA、 PYTHON

如果你并不了解Protobuf能做什么，建议结合google搜索关键字，看一下入门级别的文章，或者看一下官方文档中的[Developer Guide](https://developers.google.com/protocol-buffers/docs/overview)，或者中文的[开发指南](http://www.jianshu.com/p/3ab14a2cb477) .官方的文档中有各种语言相关的示例，可以结合代码看一下实际的用法。

很多人说为什么不用json（或者xml), 答案很简单，Protobuf更小，更简洁，而且序列化和反序列化更快！



谷歌最新开源的[gRpc](http://www.grpc.io)框架就是默认使用Protobuf作为数据传输格式和服务描述文件。对于gRpc 就不做详细介绍了，有兴趣的可以看一下官网。

言归正传，在实际使用Protobuf过程中，我发现Protobuf不但可以编写描述消息（Message）的内容，同时可以表述其他方法（类似Rpc中的方法），主要是gRpc中看到的。同时在Protobuf 代码生成工具的包中，有一个这样的目录，一致以来都没搞明白是做什么用的，如下图：

![](http://ww1.sinaimg.cn/large/697065c1gy1fevjc4j16qj20cs0aadgf.jpg)

在目录中存在大量已经定义好的proto文件，其实这些文件是Protobuf的描述文件，类似元数据。用本身的语法描述本身，同时通过这些文件生成对应的语言的元数据类等代码，比如在C#版本的Google.Protobuf中就能看到上述描述文件生成的类，如下图所示

![](http://ww1.sinaimg.cn/large/697065c1gy1fevjf70qswj20fe0e0q40.jpg)

而这些描述文件中最重要的文件 就是`descriptor.proto` 这个文件，这个文件是整个proto语法的描述类，描述了实际Protobuf各层次语法的结构，来一起看一下这个文件的一些代码, 上面这个代码描述了proto文件定义的语法定义，如前面两个字段意思是可选的name，可选的package字段，中间是描述可多个message_type（Message），service（Rpc Service) ,enum_type（枚举）等定义，然后一层层分解下去。 基本上就可以了解Protobuf语法的全貌和扩展点了

<!-- more -->

```protobuf

message FileDescriptorProto {
  optional string name = 1;       // file name, relative to root of source tree
  optional string package = 2;    // e.g. "foo", "foo.bar", etc.

  // Names of files imported by this file.
  repeated string dependency = 3;
  // Indexes of the public imported files in the dependency list above.
  repeated int32 public_dependency = 10;
  // Indexes of the weak imported files in the dependency list.
  // For Google-internal migration only. Do not use.
  repeated int32 weak_dependency = 11;

  // All top-level definitions in this file.
  repeated DescriptorProto message_type = 4;
  repeated EnumDescriptorProto enum_type = 5;
  repeated ServiceDescriptorProto service = 6;
  repeated FieldDescriptorProto extension = 7;

  optional FileOptions options = 8;

  // This field contains optional information about the original source code.
  // You may safely remove this entire field without harming runtime
  // functionality of the descriptors -- the information is needed only by
  // development tools.
  optional SourceCodeInfo source_code_info = 9;

  // The syntax of the proto file.
  // The supported values are "proto2" and "proto3".
  optional string syntax = 12;
}

```



同时在compiler目录下 还有一个plugin的目录，其中的plugin.proto文件很耐人寻味，先来看下这个文件中的内容

```protobuf

syntax = "proto3";
package google.protobuf.compiler;
option java_package = "com.google.protobuf.compiler";
option java_outer_classname = "PluginProtos";

option csharp_namespace = "Google.Protobuf.Compiler";

option go_package = "plugin_go";

import "google/protobuf/descriptor.proto";


message CodeGeneratorRequest {
  repeated string file_to_generate = 1;
  string parameter = 2;
  repeated FileDescriptorProto proto_file = 15;
}


message CodeGeneratorResponse {  
  string error = 1; 
  message File {    
    string name = 1;
    string insertion_point = 2;
    string content = 15;
  }
  repeated File file = 15;
}

```

删除了非必要的注释后，我们可以看到这个文件里面其实只定义了两个类型，一个是代码生成请求，一个是代码生成响应，而在`CodeGeneratorRequest`中又有之前我们在`descriptor.proto`中看到的`FileDescriptorProto` 这个类的信息，用大腿都可以想到这里应该就是代码生成插件获取元数据的入口了，那么怎么做呢？



从gRpc 的代码生成示例中 我们可以看到 其实Protobuf是支持自定义生成代码插件的，如下所示：

```shell
%PROTOC% -I../../protos --csharp_out Greeter  ../../protos/helloworld.proto --grpc_out Greeter --plugin=protoc-gen-grpc=%PLUGIN%
```



按理我们可以实现自己的插件来生成我们需要的任意格式，包括各种代码，甚至是文档。但是这个资料却非常少，几乎没有多少相关的文章，后来终于找到一片关于plugin的文章[http://www.expobrain.net/2015/09/13/create-a-plugin-for-google-protocol-buffer/](http://www.expobrain.net/2015/09/13/create-a-plugin-for-google-protocol-buffer/) ，大家有兴趣的可以看看，不过文章的重点是这句：

> The core part is the interface code to read a request from the `stdin`, traverse the AST and write the response on the `stdout`.

原来插件的接口代码其实是从标准输入中读取流，然后再把你要生成的内容输出到标准输出中。这些终于知道怎么用了。。



撩起袖子开始干，通过protoc命令行生成plugin.proto的代码

```
protoc-I../../protos --csharp_out test  ../../protos/plugin.proto
```



新建一个控制台项目，把代码copy 到项目中，并在Program.cs代码中添加测试的代码

```c#
using Google.Protobuf;
using Google.Protobuf.Compiler;
using System;

namespace DotBPE.ProtobufPlugin
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            var response = new CodeGeneratorResponse();
            try
            {
                CodeGeneratorRequest request;
                using (var inStream = Console.OpenStandardInput())
                {
                    request = CodeGeneratorRequest.Parser.ParseFrom(inStream);
                }
                ParseCode(request, response);
            }
            catch (Exception e)
            {
                response.Error += e.ToString();
            }

            using (var output = Console.OpenStandardOutput())
            {
                response.WriteTo(output);
                output.Flush();

            }
        }
        private static void ParseCode(CodeGeneratorRequest request, CodeGeneratorResponse response)
        {
           DotbpeGen.Generate(request,response);
        }
    }
}
```



哈哈 开始编译，然而编译不通过！，坑爹啊！ 原来C#版本中 Google.Protobuf已经生成好的类 都是internal访问权限，不能从外部引用。。。但是Google.Protobuf是开源的。。而且我需要用的类 我也可以通过protoc命令自己生成到同一个项目中，或者设置成public访问权限。。方便起见，我直接copy了Google.Protobuf的源码到我们的项目中，这次再次编译 ，代码就完美运行了，接下来的工作 不过是填充`DotbpeGen.Generate` 的代码了，这不过是体力活。

至于CodeGeneratorRequest和CodeGeneratorResponse 到底有什么方法，其实看proto文件就能知道。以下是我自己在项目中使用的生成代码类 供大家参考

```c#
using Google.Protobuf.Compiler;
using Google.Protobuf.Reflection;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace DotBPE.ProtobufPlugin
{
    public class DotbpeGen
    {
        public static void Generate(CodeGeneratorRequest request, CodeGeneratorResponse response)
        {
            foreach (var protofile in request.ProtoFile)
            {
                try{
                    GenerateByProtoFile(protofile, response);
                }
                catch(Exception ex){
                    using (Stream stream = File.Create("./error.txt"))
                    {
                        byte[] err = Encoding.UTF8.GetBytes(ex.Message+ex.StackTrace);
                        stream.Write(err,0,err.Length);
                    }
                    response.Error += ex.Message;
                }
            }
        }

        private static void GenerateSourceInfo(FileDescriptorProto protofile, CodeGeneratorResponse response)
        {
            bool genericDoc;
            protofile.Options.CustomOptions.TryGetBool(DotBPEOptions.GENERIC_MARKDOWN_DOC,out genericDoc);
            if (!genericDoc)
            {
                return;
            }
            StringBuilder sb = new StringBuilder();
            foreach (var location in protofile.SourceCodeInfo.Location)
            {
                string path = String.Join(",", location.Path);
                string span = String.Join(",", location.Span);
                string leadingDetachedComments = String.Join("\r", location.LeadingDetachedComments);
                string trailingComments = String.Join("\r", location.TrailingComments);
                sb.AppendLine("{\"Path\",\""+path+"\",\"Span\",\""+span+"\",\"LeadingComments\",\""+ location.LeadingComments + "\",\"LeadingDetachedComments\",\""+ leadingDetachedComments + "\",\"TrailingComments\",\""+ trailingComments + "\"}");
                
            }
            var nfile = new CodeGeneratorResponse.Types.File
            {
                Name = GetFileName(protofile.Name) + "SI.txt",
                Content = sb.ToString()
            };
            response.File.Add(nfile);
        }
        private static void GenerateByProtoFile(FileDescriptorProto protofile, CodeGeneratorResponse response)
        {
            GenerateSourceInfo(protofile, response);
            GenerateServer(protofile, response);
            GenerateClient(protofile, response);

        }
        private static void GenerateServer(FileDescriptorProto protofile, CodeGeneratorResponse response)
        {
            bool genericServer;
            protofile.Options.CustomOptions.TryGetBool(DotBPEOptions.DISABLE_GENERIC_SERVICES_SERVER, out genericServer);
            if (genericServer)
            {
                return;
            }
            if (protofile.Service == null || protofile.Service.Count <= 0) return;
            //生成文件头
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("// Generated by the protocol buffer compiler.  DO NOT EDIT!");
            sb.AppendLine($"// source: {protofile.Name}");
            //还可以生成注释

            sb.AppendLine("#region Designer generated code");
            sb.AppendLine("");
            sb.AppendLine("using System; ");
            sb.AppendLine("using System.Threading.Tasks; ");
            sb.AppendLine("using DotBPE.Rpc; ");
            sb.AppendLine("using DotBPE.Protocol.Amp; ");
            sb.AppendLine("using Google.Protobuf; ");
            sb.AppendLine("");

            string ns = GetFileNamespace(protofile);
            sb.AppendLine("namespace " + ns + " {");
            //生成代码
            foreach (ServiceDescriptorProto t in protofile.Service)
            {
                t.Options.CustomOptions.TryGetBool(DotBPEOptions.DISABLE_GENERIC_SERVICES_SERVER, out genericServer);
                if (genericServer)
                {
                    continue;
                }

                sb.AppendLine("");
                sb.AppendLine("//start for class Abstract"+t.Name);
                GenerateServiceForServer(t, sb);
                sb.AppendLine("//end for class Abstract"+t.Name);
            }
            sb.AppendLine("}\n");
            sb.AppendLine("#endregion\n");

            var nfile = new CodeGeneratorResponse.Types.File
            {
                Name = GetFileName(protofile.Name) + "Server.cs",
                Content = sb.ToString()
            };
            response.File.Add(nfile);
        }
        private static void GenerateClient(FileDescriptorProto protofile, CodeGeneratorResponse response)
        {
            bool genericClient;
            protofile.Options.CustomOptions.TryGetBool(DotBPEOptions.DISABLE_GENERIC_SERVICES_CLIENT, out genericClient);
            if (genericClient)
            {
                return;
            }
            if (protofile.Service == null || protofile.Service.Count <= 0) return;
            //生成文件头
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("// Generated by the protocol buffer compiler.  DO NOT EDIT!");
            sb.AppendLine($"// source: {protofile.Name}");
            //还可以生成注释

            sb.AppendLine("#region Designer generated code");
            sb.AppendLine("");
            sb.AppendLine("using System; ");
            sb.AppendLine("using System.Threading.Tasks; ");
            sb.AppendLine("using DotBPE.Rpc; ");
            sb.AppendLine("using DotBPE.Protocol.Amp; ");
            sb.AppendLine("using DotBPE.Rpc.Exceptions; ");
            sb.AppendLine("using Google.Protobuf; ");
            sb.AppendLine("");

            string ns = GetFileNamespace(protofile);
            sb.AppendLine("namespace " + ns + " {");
            //生成代码

            foreach (ServiceDescriptorProto t in protofile.Service)
            {
                t.Options.CustomOptions.TryGetBool(DotBPEOptions.DISABLE_GENERIC_SERVICES_CLIENT, out genericClient);
                if (genericClient)
                {
                    continue;
                }
                sb.AppendLine("");
                sb.AppendLine("//start for class "+t.Name+"Client");
                GenerateServiceForClient(t, sb);
                sb.AppendLine("//end for class "+t.Name+"Client");
            }
            sb.AppendLine("}");
            sb.AppendLine("#endregion");

            //生成文件
            var nfile = new CodeGeneratorResponse.Types.File
            {
                Name = GetFileName(protofile.Name) + "Client.cs",
                Content = sb.ToString()
            };
            response.File.Add(nfile);
        }

        private static void GenerateServiceForClient(ServiceDescriptorProto service, StringBuilder sb)
        {
            int serviceId;
            bool hasServiceId = service.Options.CustomOptions.TryGetInt32(DotBPEOptions.SERVICE_ID, out serviceId);
            if (!hasServiceId || serviceId <= 0)
            {
                throw new Exception("Service=" + service.Name + " ServiceId NOT_FOUND");
            }
            if (serviceId >= ushort.MaxValue)
            {
                throw new Exception("Service=" + service.Name + "ServiceId too large");
            }

            sb.AppendFormat("public sealed class {0}Client : AmpInvokeClient \n",service.Name);
            sb.AppendLine("{");
            //构造函数
            sb.AppendLine($"public {service.Name}Client(IRpcClient<AmpMessage> client) : base(client)");
            sb.AppendLine("{");
            sb.AppendLine("}");

            //循环方法
            foreach (var method in service.Method)
            {
                int msgId ;
                bool hasMsgId= method.Options.CustomOptions.TryGetInt32(DotBPEOptions.MESSAGE_ID,out msgId);
                if (!hasMsgId || msgId <= 0)
                {
                    throw new Exception("Service" + service.Name + "." + method.Name + " ' MessageId NOT_FINDOUT ");
                }
                if (msgId >= ushort.MaxValue)
                {
                    throw new Exception("Service" + service.Name + "." + method.Name + " is too large");
                }
                //异步方法
                string outType = GetTypeName(method.OutputType);
                string inType = GetTypeName(method.InputType);

                sb.AppendLine($"public async Task<{outType}> {method.Name}Asnyc({inType} request,int timeOut=3000)");
                sb.AppendLine("{");
                sb.AppendLine($"AmpMessage message = AmpMessage.CreateRequestMessage({serviceId}, {msgId});");
                sb.AppendLine("message.Data = request.ToByteArray();");
                sb.AppendLine("var response = await base.CallInvoker.AsyncCall(message,timeOut);");
                sb.AppendLine("if (response != null && response.Data !=null)");
                sb.AppendLine("{");
                sb.AppendLine($"return {outType}.Parser.ParseFrom(response.Data);");
                sb.AppendLine("}");
                sb.AppendLine("throw new RpcException(\"请求出错，请检查!\");");
                sb.AppendLine("}");
                sb.AppendLine();
                sb.AppendLine("//同步方法");
                sb.AppendLine($"public {outType} {method.Name}({inType} request)");
                sb.AppendLine("{");
                sb.AppendLine($"AmpMessage message = AmpMessage.CreateRequestMessage({serviceId}, {msgId});");
                sb.AppendLine("message.Data = request.ToByteArray();");
                sb.AppendLine("var response =  base.CallInvoker.BlockingCall(message);");
                sb.AppendLine("if (response != null && response.Data !=null)");
                sb.AppendLine("{");
                sb.AppendLine($"return {outType}.Parser.ParseFrom(response.Data);");
                sb.AppendLine("}");
                sb.AppendLine("throw new RpcException(\"请求出错，请检查!\");");
                sb.AppendLine("}");
            }
            //循环方法end

            sb.AppendLine("}");
            //类结束

        }
        private static void GenerateServiceForServer(ServiceDescriptorProto service, StringBuilder sb)
        {
            int serviceId;
            bool hasServiceId = service.Options.CustomOptions.TryGetInt32(DotBPEOptions.SERVICE_ID, out serviceId);
            if(!hasServiceId || serviceId<=0){
                throw new Exception("Service="+service.Name+" ServiceId NOT_FOUND");
            }
            if(serviceId>=ushort.MaxValue){
                throw new Exception("Service="+service.Name+ "ServiceId too large" );
            }

            sb.AppendFormat("public abstract class {0}Base : IServiceActor<AmpMessage> \n", service.Name);
            sb.AppendLine("{");
            sb.AppendLine("public string Id => \""+serviceId+"$0\";");



            StringBuilder sbIfState = new StringBuilder();

            //循环方法
            foreach (var method in service.Method)
            {
                int msgId ;
                bool hasMsgId= method.Options.CustomOptions.TryGetInt32(DotBPEOptions.MESSAGE_ID,out msgId);
                if(!hasMsgId || msgId<=0){
                    throw new Exception("Service"+service.Name+"."+method.Name+" ' MessageId NOT_FINDOUT ");
                }
                if(msgId>=ushort.MaxValue){
                    throw new Exception("Service" + service.Name+"."+method.Name+" is too large");
                }
                //异步方法
                string outType = GetTypeName(method.OutputType);
                string inType = GetTypeName(method.InputType);


                sb.AppendLine("//调用委托");
                sb.AppendLine(
                    $"private async Task Receive{method.Name}Async(IRpcContext<AmpMessage> context, AmpMessage req)");
                sb.AppendLine("{");
                sb.AppendLine($"var request = {inType}.Parser.ParseFrom(req.Data);");
                sb.AppendLine($"var data = await {method.Name}Async(request);");
                sb.AppendLine("var response = AmpMessage.CreateResponseMessage(req.ServiceId, req.MessageId);");
                sb.AppendLine("response.Sequence = req.Sequence;");
                sb.AppendLine("response.Data = data.ToByteArray();");
                sb.AppendLine("await context.SendAsync(response);");
                sb.AppendLine("}");

                sb.AppendLine();


                sb.AppendLine("//抽象方法");
                sb.AppendLine($"public abstract Task<{outType}> {method.Name}Async({inType} request);");

                //拼装if调用语句
                sbIfState.AppendFormat("//方法{0}.{1}\n",service.Name,method.Name);
                sbIfState.AppendLine("if(req.MessageId == "+msgId+"){return this.Receive"+method.Name+"Async(context, req);}");
            }
            //循环方法end
            //生成主调用代码
            sb.AppendLine("public Task ReceiveAsync(IRpcContext<AmpMessage> context, AmpMessage req)");
            sb.AppendLine("{");
            sb.Append(sbIfState);
            sb.AppendLine("return Task.CompletedTask;");
            sb.AppendLine("}");


            sb.AppendLine("}");
            //类结束

        }
        private static string GetFileNamespace(FileDescriptorProto protofile)
        {
            string ns = protofile.Options.CsharpNamespace;
            if (string.IsNullOrEmpty(ns))
            {
                throw new Exception("" + protofile.Name + ".proto did not set csharp_namespace");
            }
            return ConvertCamelCase(ns);
        }

        private static string GetFileName(string fileProto)
        {
            string nomalName = fileProto.Split('.')[0];
            return ConvertCamelCase(nomalName);
        }

        private static string ConvertCamelCase(string nomalName)
        {
            return String.Join("", nomalName.Split('_').Select(_ => _.Substring(0, 1).ToUpper() + _.Substring(1)));
        }

        private static string GetTypeName(string typeFullName)
        {
            return ConvertCamelCase(typeFullName.Split('.').Last());
        }
    }
}

```



然后我们编写一个proto文件测试以下



```protobuf
//benchmark.proto


syntax = "proto3";
package dotbpe;

option csharp_namespace = "DotBPE.IntegrationTesting";


import public "dotbpe_option.proto";

option optimize_for = SPEED;

//Benchmark测试服务
service BenchmarkTest{
    option (service_id)= 50000 ;//设定服务ID
    //测试发送Echo消息
    rpc Echo (BenchmarkMessage) returns (BenchmarkMessage){
        option (message_id)= 1 ;//设定消息ID
    };//Echo尾部的注释
    // 测试发送退出消息
    rpc Quit (Void) returns (Void){
        option (message_id)= 10000 ;//设定消息ID
    };//Quit尾部的注释
}

//我是void消息
message Void {

}
//我是BenchmarkMessage消息
message BenchmarkMessage {
  //字段前的注释
  string field1 = 1; //字段后的注释
  //字段前的注释 多行
  //字段前的字数多行
  int32 field2 = 2; //字段后的注释

  /**
  * 字段前注释特殊格式
  * 字段前注释特殊格式多行
  */
  int32 field3 = 3;
  string field4 = 4;
  repeated fixed64 field5 = 5;
  string field9 = 9;
  string field18 = 18;
  bool field80 = 80;
  bool field81 = 81;

  int32 field280 = 280 ;
  int32 field6 = 6;
  int64 field22 = 22 ;

  bool field59 = 59 ;
  string field7 = 7;
  int32 field16 = 16 ;
  int32 field130 = 130 ;
  bool field12 = 12 ;
  bool field17 = 17;
  bool field13 = 13;
  bool field14 = 14;
  int32 field104 = 104 ;
  int32 field100 = 100 ;
  int32 field101 = 101 ;
  string field102 = 102;
  string field103 = 103;
  int32 field29 = 29 ;
  bool field30 = 30 ;
  int32 field60 = 60 ;
  int32 field271 = 271 ;
  int32 field272 = 272;
  int32 field150 = 150;
  int32 field23 = 23;
  bool field24 = 24;
  int32 field25 = 25 ;
  bool field78 = 78 ;
  int32 field67 = 67;
  int32 field68 = 68 ;
  int32 field128 = 128 ;
  string field129 = 129 ;
  int32 field131 = 131 ;
}

```

```protobuf
// dotbpe_option.proto

// [START declaration]
syntax = "proto3";
package dotbpe;
// [END declaration]

// [START csharp_declaration]
option csharp_namespace = "DotBPE.ProtoBuf";
// [END csharp_declaration]

import "google/protobuf/descriptor.proto";

//扩展服务
extend google.protobuf.ServiceOptions {
  int32 service_id = 51001;
  bool disable_generic_service_client = 51003; //是否生成客户端代码
  bool disable_generic_service_server = 51004; //是否生成服务端代码
}
extend google.protobuf.MethodOptions {
  int32 message_id = 51002;
}

extend google.protobuf.FileOptions {
  bool disable_generic_services_client = 51003; //是否生成客户端代码
  bool disable_generic_services_server = 51004; //是否生成服务端代码
  bool generic_markdown_doc = 51005; //是否生成文档
}
```

上面的dotbpe_option.proto 我们proto文件进行了自定义的扩展，添加一些自己需要的额外信息，其实所有扩展都是对`descriptor.proto`中消息的扩展。

然后我们通过命令来生成一下，这里有个特殊的约定，一定要注意当我们设置

protoc-gen-**dotbpe**=../../tool/ampplugin/dotbpe_amp.exe 插件的名称protoc-gen-**dotbpe**时，那么输出的目录一定要写成--**dotbpe**_out ，两个名字一点要匹配哦

```shell
set -ex

cd $(dirname $0)/../../test/IntegrationTesting/

PROTOC=protoc
PLUGIN=protoc-gen-dotbpe=../../tool/ampplugin/dotbpe_amp.exe
IntegrationTesting_DIR=./DotBPE.IntegrationTesting/


$PROTOC  -I=./protos --csharp_out=$IntegrationTesting_DIR --dotbpe_out=$IntegrationTesting_DIR \
    ./protos/benchmark.proto  --plugin=$PLUGIN

```



差不多就结束了，相关的代码可以在[https://github.com/xuanye/dotbpe/tree/develop/src/tool](https://github.com/xuanye/dotbpe/tree/develop/src/tool) 查看到，这是我最近在写的一个C#的rpc框架，现在完成了基本的功能，还需要进一步完善，有机会再介绍把。



**descriptor.proto信息挖掘**

我们注意到在descriptor.proto文件中包含有这样的一个message: SourceCodeInfo, 这个消息体里有如下字段

```protobuf
 optional string leading_comments = 3;
 optional string trailing_comments = 4;
 repeated string leading_detached_comments = 6;
```

这是非常有意思的定义，意思是可以在运行时获取到proto文件中的注释。这可以帮助我们生成 文档或者代码注释，但是读取逻辑比较复杂，其内部有一个通过Path和Span来定位元素的逻辑。因为在实际的情况中，一般都是要获取Service和Message上的注释，那么就来专门讨论一下如何获取这两个类型的注释吧。



下面是 `SourceCodeInfo.Location` 中我们需要用到Path示例

```
 * [4, m] - Message的注释
 * [4, m, 2, f] - Message 中 字段（field）的注释
 * [6, s] - Service的注释
 * [6, s, 2, r] - Service中Rpc方法的注释
```

where:

- `m` -  proto文件中Message的索引（就是第几个定义的Message）, 从0开始
- `f` - Message中Field字段的索引（就是第几个字段）, 从0开始
- `s` -  proto文件中Service的索引, 从0开始
- `r` -  Service中Rpc方法的索引, 从0开始

like this:

```protobuf
// [4, 0] 就是这里的注释 
message MyMessage {
  // [4, 0, 2, 0] 在这里
  int32 field1 = 1; // [4, 0, 2, 0] 也在这里
}// [4, 0] 就是这里的注释 

// [6, 0] 在这里!
service MyService {
  // [6, 0, 2, 0] 在这里!
  rpc (MyMessage) returns (MyMessage);
}
```



想要了解全部内容可以去看下`descriptor.proto`中的注释内容 吧