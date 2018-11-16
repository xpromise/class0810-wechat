const express = require('express');
const sha1 = require('sha1');
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

app.use((req, res, next) => {
  console.log(req.query);
  /*
  { signature: 'ff299dfb0059ee0359f0851e30d9ae8ee439790a',  微信签名
  echostr: '3330701733801130972',  微信后台生成随机字符串
  timestamp: '1542349780',   时间戳
  nonce: '1704777037' }      微信后台生成随机数字
   */
  //获取请求参数
  const {signature, echostr, timestamp, nonce} = req.query;
  const {token} = config;
  // - 将参数签名加密的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序
  // const arr = [timestamp, nonce, token].sort();
  // console.log(arr); // [ '1542350582', '477910604', 'atguiguHTML0810' ]
  // - 将排序后的参数拼接在一起，进行sha1加密
  // const str = sha1(arr.join(''));
  // console.log(str); // e131be1e59914a6f5eb0f254a59e09079c871fa8
  const str = sha1([timestamp, nonce, token].sort().join(''));
  // - 加密后的到的就是微信签名，将其与微信发送过来的微信签名对比，
  if (signature === str) {
    //说明消息来自于微信服务器
    res.end(echostr);
  } else {
    //说明消息不来自于微信服务器
    res.end('error');
  }
  
  
})


app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})