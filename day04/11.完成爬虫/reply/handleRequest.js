const sha1 = require('sha1');

const {getUserDataAsync, parseXMLDataAsync, formatMessage} = require('../utils/tools');
const reply = require('./reply');
const template = require('./template');
const {token} = require('../config');

module.exports = () => {
  
  return async (req, res, next) => {
    console.log(req.query);
    //获取请求参数
    const {signature, echostr, timestamp, nonce} = req.query;
    // const {token} = config;
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
      //将用户发送过来的xml数据解析为js对象
      const jsData = await parseXMLDataAsync(xmlData);
      //格式化数据
      const message = formatMessage(jsData);
      const options = reply(message);
      const replyMessage = template(options);
      console.log(replyMessage);
      res.send(replyMessage);
    } else {
      res.end('error');
    }
  
  }
}