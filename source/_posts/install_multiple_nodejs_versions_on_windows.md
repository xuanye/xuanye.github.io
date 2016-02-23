title: 在windows上安装多个Nodejs版本
date: 2013-10-09 09:29:30
categories: Nodejs #文章文类
tags: [Nodejs]  
---

&emsp;至于为什么会需要安装多个版本的nodejs，我就不解释了，等你遇到了自然就明白了，在linux和OSX上可以使用[NVM](https://github.com/creationix/nvm "nvm")（Node Version Manage）来安装多个版本的Nodejs，但是windows下却一直没有合适的工具，后来某次我检索到一个工具名字叫 [nvmw](https://github.com/hakobera/nvmw "nvmw")（Simple Node Version Manager for Windows） 
看介绍也是像模像样的，使用的方法基本和NVM差不多（毕竟他们的名字都差不多），不过在实际使用当中却发现有些问题导致不能用，懒人请直接跳到最后不要看过程鸟。  
&emsp;第一个问题nvmw获取npm的版本号是通过地址[https://raw.github.com/joyent/node/%s/deps/npm/package.json](https://raw.github.com/joyent/node/%s/deps/npm/package.json "https://raw.github.com/joyent/node/%s/deps/npm/package.json") 解析json来获取的，但是这个地址因为众所周知的原因在天朝是不能访问到的，这不是大问题，只需要把地址修改一下通过代理访问即可，于是我把上面的地址修改为[https://rawgithub.com/joyent/node/%s/deps/npm/package.json](https://rawgithub.com/joyent/node/%s/deps/npm/package.json "https://rawgithub.com/joyent/node/%s/deps/npm/package.json")，但是问题却没有完全解决，我们遇到了第二个问题。  
&emsp;第二个问题是获取上述json的代码通过httpheader中的content-length来初始化一段缓冲区，但是这个地址返回是不包含这个content-length的。。而这段代码又是共用的代码。于是我不得不修改代码解决上述的问题，并且不影响其他功能。

&emsp;终于可以快乐地使用nvmw来管理本地的Nodejs版本啦，但是仍然一个龊蛋的问题，就是通过命令行修改的环境变量在关闭窗口后就无效了。。所以在每次使用nodejs前 ，还要必须调用下nvmw use v0.10.18类似的命令，重新指定下。当然你觉得烦 可以自己手动添加下对应版本的目录到环境变量。

&emsp;好了，说了那么没用，开始说点实际了，首先你要下载 [nvmw](http://pan.baidu.com/s/1xdmf3 "修改后的nvmw") （当然是修改后的版本），nvmw主页上说安装需要git，python，但是我看了下代码貌似不需要。直接下载解压到目录后（假设为d:\nvmw）,将目录`d:\nvmw` 添加到环境变量中，这样我们可以直接在命令行下使用了。

&emsp;使用方法 直接在原官网复制的：

	Usage:
	  nvmw help                    显示帮助信息
	  nvmw install [version]       下载并安装指定版本[version]
	  nvmw uninstall [version]     卸载某版本[version]
	  nvmw use [version]           修改当前版本[version]
	  nvmw ls                      显示当前已经安装版本
	
	Example:
	  nvmw install v0.10.18        安装v0.10.18版本  
	  nvmw use v0.10.18            使用v0.10.18版本  


