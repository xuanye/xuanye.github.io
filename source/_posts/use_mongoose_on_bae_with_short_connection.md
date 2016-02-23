title: 在BAE中使用mongoose操作mongodb
date: 2014-10-11 11:10
categories: Nodejs #文章文类
tags: [Nodejs]  
---
&nbsp;&nbsp;几乎网上所有的使用mongoose的例子都是长连接的方式，因为nodejs本身机制的关系，使用长连接一定程度上会提高性能，但是bae的免费mongodb不支持长链接，之前也有很多人做了尝试，比如[断开后捕捉错误，然后自动重连的方式][1],现在来看都不太成功，于是还是中规中矩的使用短链接的方式来做吧，这里实现了一个连接打开和关闭的托管。

**mongoosekeeper.js**
```javascript
'use strict';

var mongoose = require('mongoose');
var util = require("util");

function MongooseKeeper() {
    this.db = mongoose.createConnection();
    this.open_count = 0;
}
MongooseKeeper.prototype.config = function(conf) {
    // body...
    var options = {
        db: { native_parser: true },
        server: {
            poolSize:4
        }
    };


    var constr = "";
    if(process.env.MONGO_DB_STR){
        constr = process.env.MONGO_DB_STR ;
    }
    else{
        //'mongodb://user:pass@localhost:port/database'
        constr = util.format('mongodb://%s:%s@%s:%d/%s', conf.userid,conf.password,conf.host,conf.port,conf.database);
    }
    this.dbUri = constr;
    this.options = options;
  
}
MongooseKeeper.prototype.open =function() {

    this.open_count++;
    if(this.open_count ==1 && this.db.readyState == 0)
    {        
        this.db.open(this.dbUri,this.options,function() {
            // body...
            console.log("db opened");
        });
    }
}
MongooseKeeper.prototype.close =function() {

    this.open_count--;
    if(this.open_count == 0 )
    {
        this.db.close(function(){
            console.log("db closed");
        });
    }
  


}
MongooseKeeper.prototype.use = function(action,callback) {
    //OPEN
    var self = this;
    self.open();
    action.call(null,function() {
        //CLOSE
        console.log("正在访问的数据库请求量"+self.open_count);
        self.close();
        callback.apply(null, arguments);
        //DONE
        self =null;
    })
};

exports = module.exports = new MongooseKeeper();
```
首先在应用启动的时候，比如在app.js中，配置数据连接的等信息
```
// 引用mongoosekeeper
var mongoosekeeper =  require('./lib/mongoosekeeper');
```

```
// 调用更新配置，这里的配置可以去读某个json
mongoosekeeper.config({
    "host": "192.168.57.186",
    "database": "dbname",
    "userid":"userid",
    "password":"123456",
    "port":27017
});
```
定义Model
```
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongokeeper  = require('../lib/mongoosekeeper');

var articleModel = function () {

    var articleSchema = new Schema({
        content     : String, //  发布内容
        type        : Number, //
        pictures    : [{url:String,width:Number,height:Number}], // 配图
        thumbnails  : [{url:String,width:Number,height:Number}], // 缩略图
        tags        : [String], // 标签
        author      : String, //  发布人账号
        author_name : String, //  发布人名称
        create_date : { type: Date, default: Date.now }, //创建时间
        meta        : {
                        votes  : Number, //顶
                        favs   : Number  //收藏
                    }
    });
    //因为使用了createConnection 这里要使用mongokeeper.db.model
    //而不是mongoose.model
    return mongokeeper.db.model('article', articleSchema);
};

module.exports = new articleModel();
```
在调用model的时候，使用 `mongoosekeeper.use` 方法包装实际的调用即可
```
var express        = require('express'),
    router         = express.Router(),
 	mongoosekeeper =  require('../lib/mongoosekeeper'),
 	articleModel   =  require('../models/articleModel');

/* GET home page. */
router.get('/', function(req, res) {

	mongoosekeeper.use(queryArticle,function(err,list){
		if(err){
			throw err;
		}
		else{
			res.render('index',{data:list});
		}
			
	});	
    
});
//proxy 参数即为mongoosekeeper.use的第二个参数
function queryArticle(proxy){
	var search = {} ; //获取所有文章
    var query = articleModel.find(search).limit(25); 
    query.sort('-create_date');
    query.exec(proxy);
}

module.exports = router;

```

[完整代码][2]

  [1]: http://www.drmfly.net/2014/01/11/bae3-use-mongoose-connect-mongodb.html "断开后捕捉错误，然后自动重连的方式"
  [2]: http://git.oschina.net/xuanye-wan/sampleapp/tree/master/express_mongoose "git@osc"