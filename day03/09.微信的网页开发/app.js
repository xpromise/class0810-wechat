const express = require('express');
const sha1 = require('sha1');
const handleRequest = require('./reply/handleRequest');
const Wechat = require('./wechat/wechat');
const {url, appID} = require('./config');

const wechat = new Wechat();

const app = express();
/*
  1. 搭建开发者服务器, 使用中间件接受请求
  2. 默认localhost:3000访问本地服务器， 需要一个互联网能够访问的域名地址
    借助ngrok工具，能将本地地址映射为互联网能访问的域名地址
  3. 测试号管理页面填写服务器配置：
    url：通过ngrok映射的地址   http://3389687c.ngrok.io
    token：参与微信签名加密的参数， 自己定义，尽量复杂
  4. 验证微信服务器有效性
    目的：验证消息来自于微信服务器， 同时返回一个特定参数给微信服务器（告诉微信服务器我这里准备ok）
    
    - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
    - 将排序后的参数拼接在一起，进行sha1加密
    - 加密后的到的就是微信签名，将其与微信发送过来的微信签名对比，
      - 如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
      - 如果不一样，说明消息不是微信服务器发送过来的，返回error
    
 */
app.set('views', 'views');
app.set('view engine', 'ejs');

app.get('/search', async (req, res) => {
  
  /*
    微信签名算法：
      1. 得到参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分）
      2. 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1
      3. 这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义。
   */
  //得到临时票据
  const {ticket} = await wechat.fetchTicket();
  //随机字符串
  const noncestr = Math.random().toString().split('.')[1];
  //时间戳
  const timestamp = parseInt(Date.now() / 1000);
  
  //将四个参数按照 key = value 方式组合一个数组
  const arr = [
    `noncestr=${noncestr}`,
    `jsapi_ticket=${ticket}`,
    `timestamp=${timestamp}`,
    `url=${url}/search`
  ]
  
  //排序，以&拼接成一个字符串, 再进行sha1加密，得到的就是加密签名
  const signature = sha1(arr.sort().join('&'));
  
  res.render('search', {
    signature,
    timestamp,
    noncestr,
    appID
  });
})

app.use(handleRequest());

app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})