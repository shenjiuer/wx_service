# 基于nodejs的微信公众号的接入与自动回复消息

## 1、安装与使用

```markdown
npm i // 安装依赖
npm run nodmon // 启动
```

## 2、接口测试号申请

[进入微信公众帐号测试号申请系统](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)

## 3、接口信息配置

    	由于本人并没有钱买服务器，所以只能用内网穿透工具啦，这里推荐一下[Sunny-Ngrok](https://www.ngrok.cc/)支持自定义域名，官网上也有使用教程，对于微信公众号开发来说还是蛮不错的。有了域名我们就可以填写下面的接口信息了。

![image](http://upload-images.jianshu.io/upload_images/1362757-61ab2a26ea6e6caa?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 3.1 验证消息来自于微信服务器

​	在开发具体的功能之前，我们需要先进行token验证，验证消息确实来自于微信服务器，验证方法是提交接口信息配置时，微信服务器会发送一个get请求到我们的服务器上，get请求携带signature, timestamp, nonce, echostr参数。通过检验signature对请求进行校验。若确认此次get请求来自微信服务器，就原样返回echostr参数内容。

##### 校验流程：

+ 将token、timestamp、nonce三个参数进行字典序排序
+ 将三个参数字符串拼接成一个字符串进行sha1加密 
+ 将加密后的字符串与signature对比，相等则表示请求来自于微信服务器

##### 项目结构：

```markdown
project
|——package.json
|——app.js
|——router.js
|——config.js
|——controller
|   └── authorize.js
|——node_modules
|——service
|   └── authorize.js
|——utils
|   └── http.js
|   └── answer.js
```

* `app.js` 启动文件

* `router.js` 配置URL路由规则

* `config.js` 存放`appid`, `appsecret`, `token` 等信息

* `controller/**` 用于解析用户的输入，返回处理的结果

* `service/**` 编写具体的业务逻辑

* `utils/**` 存放工具函数

  ###### 启动文件`app.js`

```javascript
const Koa = require('koa')
const app = new Koa()
const router = require('./router')
app.use(router.routes())
   .use(router.allowedMethods())
app.listen(8888)	
```

###### 	路由配置文件`router.js`

```javascript
const Router = require('koa-router')
const router = new Router()
const authorize = require('./controller/authorize')
router.get('/authorize', authorize.config) // 校验token路径
module.exports = router
```

###### 	接收请求和返回结果文件`controller/authorize.js`


```javascript
const authorize = require('../service/authorize') // 处理具体的验证逻辑
const config = async (ctx) => {
    let query = ctx.query
    let result = await authorize._config(query)
    ctx.body = result
}
module.exports = {
    config
}
```

###### 	处理业务逻辑文件`service/authorize.js`

```javascript
const config = require('../config')
const crypto = require('crypto')
const _config = async (query) => {
    let signature = query.signature
    let timestamp = query.timestamp
    let echostr = query.echostr
    let nonce = query.nonce
    // 字典排序
    let arr = [config.token, timestamp, nonce].sort()
    // sha1加密
    let str = arr.join('')
    let hashCode = crypto.createHash('sha1')
    let result = hashCode.update(str).digest('hex')
    // 对比后返回结果
    if (result === signature) {
        return echostr
    } else {
        return ''
    }
}
module.exports = {
    _config
}
```

### 3.2 自动回复文本消息

​	当用户发送消息给公众号时（或某些特定的用户操作引发的事件推送时），会产生一个POST请求，开发者可以特定XML结构，来对该消息进行响应（现支持回复文本、图片、图文、语音、视频、音乐）。在这里我们来实现以下最简单的回复文本消息，用户发什么，我们回复相同的内容。

###### 	路由配置文件`router.js`

```javascript
router.post('/authorize', authorize.handleMessage)
```

###### 	接收请求和返回结果文件`controller/authorize.js`

```javascript
const handleMessage = async (ctx) => {  
    let message = await authorize.handleMessage(ctx) // 处理具体的业务逻辑
    ctx.body = message
}
```

###### 	处理业务逻辑文件`service/authorize.js`

​	在这里，我们用到了两个工具函数，`utils/answer.js` 是消息回复模板，返回要回复的xml数据，`utils/xmlTool.js` 用来解析xml数据。

```javascript
const xmlTool = require('../utils/xmlTool') 
const answer = require('../utils/answer')
const getRawBody = require('raw-body')

const handleMessage = async (ctx) => {
    let xml = await getRawBody(ctx.req, {
        length: ctx.request.length,
        limit: '1mb',
        encoding: ctx.request.charset || 'utf-8'
    });
    // 将xml数据转化为json格式的数据
    let result = await xmlTool.parseXML(xml)
    // 格式化数据
    let formatted = await xmlTool.formatMessage(result.xml)
    // 判断消息的类型，如果是文本消息则返回相同的内容
    if (formatted.MsgType === 'text') {
        return answer.text(formatted)
    } else {
        return 'success'
    }
}
```

###### 	工具函数

```javascript
// xmlTool.js
const xml2js = require('xml2js');
const parseXML = async (xml) => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, {trim: true}, function (err, obj) {
            if (err) {
                return reject(err);
            }
            resolve(obj);
        });
    });
};
const formatMessage = (result) => {
    let message = {};
    if (typeof result === 'object') {
        for (let key in result) {
            if (!(result[key] instanceof Array) || result[key].length === 0) {
                continue;
            }
            if (result[key].length === 1) {
                let val = result[key][0];
                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message[key] = result[key].map(function (item) {
                    return formatMessage(item);
                });
            }
        }
    }
    return message;
};

module.exports = {
    parseXML,
    formatMessage
};
```

```javascript
// answer.js
const ejs = require('ejs')
const messageTpl = '<xml>\n' +
    '<ToUserName><![CDATA[<%-toUserName%>]]></ToUserName>' +
    '<FromUserName><![CDATA[<%-fromUserName%>]]></FromUserName>' +
    '<CreateTime><%=createTime%></CreateTime>' +
    '<MsgType><![CDATA[<%=msgType%>]]></MsgType>' +
    '<Content><![CDATA[<%-content%>]]></Content>' +
    '</xml>';

const answer = {
    text: function (message) {
        let reply = {
            toUserName: message.FromUserName,
            fromUserName: message.ToUserName,
            createTime: new Date().getTime(),
            msgType: 'text',
            content: message.Content
        };
        let output = ejs.render(messageTpl, reply);
        return output;
    }
}

module.exports = answer
```

