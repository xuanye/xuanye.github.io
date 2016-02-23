title: 如何将hexo部署到gitcafe上
date: 2013-12-10 22:18:30
categories: 博客 #文章文类
tags: [hexo,gitcafe]  
---

## 关于hexo
 [hexo](http://zespia.tw/hexo/zh-CN/ "hexo") 是基于[nodejs](http://nodejs.org/)的一个博客撰写程序，使用markdown格式撰写博客，并通过hexo生成静态文件，可以发布到任何支持静态文件的空间（比如github等），但是本文不是介绍如何使用hexo或者nodejs的，如果你两者一无所知，我建议你谷歌一下相关内容，再行阅读本文。[这里](http://zipperary.com/categories/hexo/) 有一些比较好的介绍hexo如何使用的文章.

## 关于gitcafe
本文将展示如何将hexo 部署到[gitcafe](https://gitcafe.com/)上，gitcafe 是国内的源代码托管服务商,类似国外的[github](https://www.github.com/)。不过服务器因为在国内，所以访问速度还是比较理想，就是不知道是否能够做大做强，毕竟github摆在眼前。

## 进行部署
首先访问 https://gitcafe.com/ ,注册一个新的账号，过程非常简单，就不描述了，只是别忘了去邮箱确认哦，然后进入到个人主页新建一个项目，项目名称必须和用户名一致。如下图所示：![新建一个和用户名一样的项目](http://ww1.sinaimg.cn/large/697065c1gw1ebfnyfkwwmj20a604bmx8.jpg)

接着需要配置下ssh,点击账号设置 ![账号设置](http://ww4.sinaimg.cn/large/697065c1gw1ebfo0m2jfej207e08iaa9.jpg)，来到ssh管理中添加公钥，如果你不知道如何使用ssh，请参考[这里](https://gitcafe.com/GitCafe/Help/wiki/%E5%A6%82%E4%BD%95%E5%AE%89%E8%A3%85%E5%92%8C%E8%AE%BE%E7%BD%AE-Git#wiki "添加SSH")

如果你是windows git的绿色版的话 ，把git目录下的bin目录和cmd目录添加到`path`变量中，同时设置下 `HOME` 变量，可以是当前用户 `C:\Users\xuanye` 目录

然后修改hexo的配置文件`_config.yaml` ,将`deploy` 配置节修改如下
```
deploy:
  type: github
  repository: git@gitcafe.com:xuanye/xuanye.git
  branch: gitcafe-pages
```
**注意：xuanye修改为你自己的账号，branch必须使用gitcafe-pages 分支**

然后调用 `hexo g` 重新生成，并调用 `hexo deploy` 部署即可 （在重新部署前 先删除 `.deploy` 目录）

部署成功后，可以通过 http://[username].gitcafe.com/ 进行访问了。

现在gitcafe还支持绑定自定义域名，在 `项目首页>项目管理>自定义域名` 添加你的域名,然后到你的DNS服务商那里添加一条A记录 将域名指向GitCafe服务器的IP `117.79.146.98` 
![添加域名](http://ww1.sinaimg.cn/large/697065c1gw1ebfpyjrqvsj20ia04h74f.jpg) ，等段时间生效后。