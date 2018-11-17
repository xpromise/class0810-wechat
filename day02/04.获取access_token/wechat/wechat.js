/*
  获取access_token。
  1. 是什么？
    微信公众号的全局唯一接口调用凭据
    
    接口/api  application interface:
      1. url地址： 全称包含：请求方式、请求地址、请求参数、响应内容等
      2. 公共函数/方法
  2. 作用：
    使用access_token才能成功调用微信的各个接口
  3. 特点：
    1. access_token的存储至少要保留512个字符空间
    2. 有效期目前为2个小时，提前5分钟刷新
    3. 重复获取将导致上次获取的access_token失效，注意不要用别人的appid appseceret
    4. access_token接口调用时有限的，大概为2000次
  4. 请求地址
    https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
  5. 请求方式：
    GET
  6. 请求成功的响应结果：
    JSON： {"access_token":"ACCESS_TOKEN","expires_in":7200}
  7. 发送请求：
    npm install --save request request-promise-native
  8. 设计：
    - 第一次发送请求，获取access_token，保存下来
    - 第二次读取之前保存的access_token，判断是否过期
      - 过期了, 重新发送请求，获取access_token，保存下来（覆盖之前的）
      - 没有过期, 直接使用
   整理：
     读取本地保存access_token（readAccessToken）
      - 有
        - 判断是否过期（isValidAccessToken）
          - 过期了, 重新发送请求，获取access_token（getAccessToken），保存下来（覆盖之前的）(saveAccessToken)
          - 没有过期, 直接使用
      - 没有
        - 发送请求，获取access_token，保存下来
 */
const rp = require('request-promise-native');
const {writeFile, readFile} = require('fs');
const {appID, appsecret} = require('../config');

class Wechat {
  /**
   * 获取access_token
   * @return {Promise<result>}
   */
  async getAccessToken () {
    //定义请求地址
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
    //发送请求
    const result = await rp({method: 'GET', url, json: true});
    //设置access_token的过期时间, 提前5分钟刷新
    result.expires_in = Date.now() + 7200000 - 300000;
    //返回result
    return result;
  }
  
  /**
   * 保存access_token
   * @param filePath  要保存的文件路径
   * @param accessToken  要保存的凭据
   * @return {Promise<any>}
   */
  saveAccessToken (filePath, accessToken) {
    return new Promise((resolve, reject) => {
      //js对象没办法存储，会默认调用toString() --->  [object Object]
      //将js对象转化为json字符串
      writeFile(filePath, JSON.stringify(accessToken), err => {
        if (!err) {
          resolve();
        } else {
          reject('saveAccessToken方法出了问题：' + err);
        }
      })
    })
  }
  
  /**
   * 读取access_token
   * @param filePath 文件路径
   * @return {Promise<any>}
   */
  readAccessToken (filePath) {
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        //读取的data数据  二进制数据，buffer
        if (!err) {
          //先调用toString转化为json字符串
          //在调用JSON.parse将json字符串解析为js对象
          resolve(JSON.parse(data.toString()));
        } else {
          reject('readAccessToken方法出了问题:' + err);
        }
      })
    })
  }
  
  /**
   * 判断access_token是否过期
   * @param accessToken
   * @return {boolean}
   */
  isValidAccessToken ({expires_in}) {
    /*if (Date.now() >= expires_in) {
      //说明过期了
      return false
    } else {
      //说明没有过期
      return true
    }*/
    return Date.now() < expires_in;
  }
  
}

(async () => {
  /*
  读取本地保存access_token（readAccessToken）
      - 有
        - 判断是否过期（isValidAccessToken）
          - 过期了, 重新发送请求，获取access_token（getAccessToken），保存下来（覆盖之前的）(saveAccessToken)
          - 没有过期, 直接使用
      - 没有
        - 发送请求，获取access_token，保存下来
   */
  const w = new Wechat();
  
  w.readAccessToken('./accessToken.txt')
    .then(async res => {
      if (w.isValidAccessToken(res)) {
        //没有过期，直接使用
        console.log(res);
        console.log('没有过期，直接使用');
      } else {
        //过期了
        const accessToken = await w.getAccessToken();
        await w.saveAccessToken('./accessToken.txt', accessToken);
      }
    })
    .catch(async err => {
      const accessToken = await w.getAccessToken();
      await w.saveAccessToken('./accessToken.txt', accessToken);
    })

})()