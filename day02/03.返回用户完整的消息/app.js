const express = require('express');
const sha1 = require('sha1');

const {getUserDataAsync, parseXMLDataAsync, formatMessage} = require('./utils/tools');
const reply = require('./reply/reply');
const template = require('./reply/template');

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
const config = {
  appID: 'wxc8e92f7ab70fbca0',
  appsecret: 'b4054e90b75787c78e0af50bf7fc3e87',
  token: 'atguiguHTML0810'
}

app.use(async (req, res, next) => {
  console.log(req.query);
  //获取请求参数
  const {signature, echostr, timestamp, nonce} = req.query;
  const {token} = config;
  const str = sha1([timestamp, nonce, token].sort().join(''));
  /*
    微信服务器会发送两种类型的消息给开发者
      1. GET 验证服务器有效性逻辑
      2. POST 转发用户消息
   */
  if (req.method === 'GET') {
    // 验证服务器有效性逻辑
    if (signature === str) {
      //说明消息来自于微信服务器
      res.end(echostr);
    } else {
      //说明消息不来自于微信服务器
      res.end('error');
    }
  } else if (req.method === 'POST') {
    // 转发用户消息
    //接受微信服务器转发用户消息
    //验证消息来自于微信服务器
    if (signature !== str) {
      res.end('error');
      return;
    }
    //用户发送的消息在请求体
    const xmlData = await getUserDataAsync(req);
    console.log(xmlData);
    /*
    <xml>
      <ToUserName><![CDATA[gh_4fe7faab4d6c]]></ToUserName>    开发者的微信号
      <FromUserName><![CDATA[oAsoR1iP-_D3LZIwNCnK8BFotmJc]]></FromUserName>  微信用户openid
      <CreateTime>1542355200</CreateTime>   发送消息的时间戳
      <MsgType><![CDATA[text]]></MsgType>   消息类型
      <Content><![CDATA[111]]></Content>    消息的具体内容
      <MsgId>6624365143243452763</MsgId>    消息id，微信服务器会默认保存3天微信用户发送的消息，在此期间内通过这id就能找到当前消息
    </xml>
     */
    //将用户发送过来的xml数据解析为js对象
    const jsData = await parseXMLDataAsync(xmlData);
    console.log(jsData);
    /*
    {
      xml:
       { ToUserName: [ 'gh_4fe7faab4d6c' ],
         FromUserName: [ 'oAsoR1iP-_D3LZIwNCnK8BFotmJc' ],
         CreateTime: [ '1542355988' ],
         MsgType: [ 'text' ],
         Content: [ '222' ],
         MsgId: [ '6624368527677682013' ]
      }
    }
     */
    //格式化数据
    const message = formatMessage(jsData);
    console.log(message);
    /*
    { ToUserName: 'gh_4fe7faab4d6c',
      FromUserName: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc',
      CreateTime: '1542356422',
      MsgType: 'text',
      Content: '333',
      MsgId: '6624370391693488478' }
     */
    const options = reply(message);
  
    const replyMessage = template(options);
    console.log(replyMessage);
    
    /*
     遇见问题：
       当你在微信客户端发送一条消息给微信公众号，这时收到一个错误：该公众号提供的服务出现故障，请稍后再试
     说明：
       1. 你没有返回响应给微信服务器
       2. 返回了，但是消息的内容格式错误
        - 你返回的不是xml数据
        - 返回的xml数据有多余的空格
        - xml数据多删了几个字符
     解决：检查replyMessage是否有以上问题
     */
    /*
      注意：微信服务器当没有接收到开发者服务器响应时，默认会请求3次开发者服务器，就会导致接口被调用多次
      解决：提前返回一个值给微信服务器  res.end('');
     */
    res.send(replyMessage);
    
  } else {
    res.end('error');
  }
  
})


app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})